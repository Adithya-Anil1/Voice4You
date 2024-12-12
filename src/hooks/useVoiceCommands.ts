import { useCallback, useRef } from 'react';
import useStore from '../store/useStore';
import { generateAIResponse } from '../config/ai';
import { format } from 'date-fns';

export const useVoiceCommands = () => {
  const { addMessage, setIsSpeaking } = useStore();
  const lastCommandTime = useRef<number>(Date.now());
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);
  const isRecognitionActiveRef = useRef<boolean>(false);
  const processingCommandRef = useRef<boolean>(false);
  const lastProcessedCommandRef = useRef<string>('');
  const lastPromptRef = useRef<string>('');

  const getCurrentTime = () => {
    const now = new Date();
    return format(now, 'h:mm a');
  };

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    speechSynthesisRef.current = null;
    setIsSpeaking(false);
  }, [setIsSpeaking]);

  const speakResponse = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;

    stopSpeaking();
    setIsSpeaking(true);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      setIsSpeaking(false);
      speechSynthesisRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      speechSynthesisRef.current = null;
    };

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [setIsSpeaking, stopSpeaking]);

  const dispatchVoiceCommand = (type: string, action: string) => {
    const event = new CustomEvent(type, {
      detail: { action },
      bubbles: true,
      cancelable: true,
      composed: true,
    });
    window.dispatchEvent(event);
    return new Promise<void>((resolve) => {
      // Give time for the event to be processed
      setTimeout(resolve, 100);
    });
  };

  const processCommand = useCallback(async (transcript: string) => {
    if (transcript === lastProcessedCommandRef.current) {
      return;
    }

    const command = transcript.toLowerCase().trim();
    const now = Date.now();
    
    if (now - lastCommandTime.current < 1000) {
      return;
    }

    try {
      processingCommandRef.current = true;
      lastCommandTime.current = now;
      lastProcessedCommandRef.current = transcript;
      addMessage(command, 'user');

      // Handle time queries
      if (command.includes('what time') || command.includes('current time') || command.includes('time is it')) {
        const currentTime = getCurrentTime();
        const response = `The current time is ${currentTime}`;
        addMessage(response, 'assistant');
        speakResponse(response);
        return;
      }

      // Handle camera commands with improved reliability
      if (command.includes('open camera') || command.includes('start camera') || command.includes('show camera')) {
        await dispatchVoiceCommand('voice-command-camera', 'open');
        const response = "Opening camera...";
        addMessage(response, 'assistant');
        speakResponse(response);
        return;
      }

      if (command.includes('close camera') || command.includes('stop camera') || command.includes('hide camera')) {
        await dispatchVoiceCommand('voice-command-camera', 'close');
        const response = "Closing camera...";
        addMessage(response, 'assistant');
        speakResponse(response);
        return;
      }

      // Handle reminders
      if (command.includes('remind me to') || command.includes('add reminder')) {
        const { time, text } = extractTimeAndText(command);
        
        if (time) {
          window.dispatchEvent(new CustomEvent('voice-add-reminder', {
            detail: { title: text, time }
          }));

          const formattedTime = format(new Date(`2000-01-01T${time}`), 'h:mm a');
          const response = `Adding reminder: ${text} at ${formattedTime}`;
          addMessage(response, 'assistant');
          speakResponse(response);
          return;
        } else {
          const response = "I couldn't understand the time for your reminder. Please try again with a specific time, like 'Remind me to take medicine at 3 PM'";
          addMessage(response, 'assistant');
          speakResponse(response);
          return;
        }
      }

      // Handle reminder list
      if (command.includes('show reminders') || command.includes('my reminders')) {
        window.dispatchEvent(new CustomEvent('voice-command-reminders'));
        const response = "Here are your reminders...";
        addMessage(response, 'assistant');
        speakResponse(response);
        return;
      }

      // Handle help command
      if (command.includes('help') || command.includes('what can you do')) {
        const response = "You can ask me: 'what time is it', 'remind me to [task] at [time]', 'open camera', 'close camera', 'show reminders', or ask me questions. Say 'stop' to stop me from speaking and listening.";
        addMessage(response, 'assistant');
        speakResponse(response);
        return;
      }

      // Handle stop command
      if (command === 'stop' || command === 'stop listening') {
        stopSpeaking();
        return;
      }

      // Handle general queries with AI
      if (command.length > 3 && command !== lastPromptRef.current) {
        lastPromptRef.current = command;
        try {
          const response = await generateAIResponse(command);
          addMessage(response, 'assistant');
          speakResponse(response);
        } catch (error) {
          console.error('Error generating AI response:', error);
          const errorMessage = 'Sorry, I had trouble processing your request. Please try again.';
          addMessage(errorMessage, 'assistant');
          speakResponse(errorMessage);
        }
      }
    } finally {
      processingCommandRef.current = false;
    }
  }, [addMessage, speakResponse, stopSpeaking]);

  const extractTimeAndText = (command: string): { time: string | null; text: string } => {
    command = command.toLowerCase()
      .replace(/\./g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const meridiemRegex = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i;
    const meridiemMatch = command.match(meridiemRegex);

    if (meridiemMatch) {
      const [fullMatch, hours, minutes = '00', meridiem] = meridiemMatch;
      let hour = parseInt(hours, 10);

      if (meridiem.toLowerCase() === 'pm' && hour !== 12) {
        hour += 12;
      } else if (meridiem.toLowerCase() === 'am' && hour === 12) {
        hour = 0;
      }

      const timeString = `${hour.toString().padStart(2, '0')}:${minutes}`;
      const text = command
        .replace(fullMatch, '')
        .replace(/\bat\b/i, '')
        .replace(/^(remind me to|add reminder|to)\s*/i, '')
        .trim();

      return { time: timeString, text };
    }

    const militaryRegex = /\b([01]?[0-9]|2[0-3]):([0-5][0-9])\b/;
    const militaryMatch = command.match(militaryRegex);

    if (militaryMatch) {
      const [fullMatch, hours, minutes] = militaryMatch;
      const timeString = `${hours.padStart(2, '0')}:${minutes}`;
      const text = command
        .replace(fullMatch, '')
        .replace(/\bat\b/i, '')
        .replace(/^(remind me to|add reminder|to)\s*/i, '')
        .trim();

      return { time: timeString, text };
    }

    return { time: null, text: command };
  };

  const initializeRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      throw new Error('Speech recognition not supported');
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      isRecognitionActiveRef.current = true;
      console.log('Speech recognition started');
    };

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      if (result.isFinal) {
        const transcript = result[0].transcript.trim();
        if (transcript) {
          console.log('Recognized:', transcript);
          processCommand(transcript);
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        addMessage('Microphone access was denied. Please check your browser settings.', 'assistant');
        isRecognitionActiveRef.current = false;
      } else if (event.error === 'no-speech') {
        addMessage('No speech was detected. Please try speaking again.', 'assistant');
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      if (isRecognitionActiveRef.current) {
        try {
          recognition.start();
        } catch (error) {
          console.error('Error restarting recognition:', error);
          addMessage('Voice recognition stopped unexpectedly. Please try again.', 'assistant');
        }
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      throw error;
    }
  }, [addMessage, processCommand]);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      isRecognitionActiveRef.current = false;
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
      recognitionRef.current = null;
    }
  }, []);

  return { 
    stopSpeaking, 
    recognitionRef,
    isRecognitionActiveRef,
    initializeRecognition,
    stopRecognition
  };
};