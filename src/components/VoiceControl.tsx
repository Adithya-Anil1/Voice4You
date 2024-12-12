import React, { useState, useEffect } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import useStore from '../store/useStore';
import { useVoiceCommands } from '../hooks/useVoiceCommands';

export const VoiceControl: React.FC = () => {
  const { addMessage } = useStore();
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [deviceAvailable, setDeviceAvailable] = useState(true);
  const { 
    stopSpeaking, 
    recognitionRef,
    isRecognitionActiveRef,
    initializeRecognition,
    stopRecognition
  } = useVoiceCommands();

  const isSpeechRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  const checkAudioDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasAudioInput = devices.some(device => device.kind === 'audioinput');
      setDeviceAvailable(hasAudioInput);
      return hasAudioInput;
    } catch (error) {
      console.error('Error checking audio devices:', error);
      setDeviceAvailable(false);
      return false;
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const hasDevice = await checkAudioDevices();
      if (!hasDevice) {
        addMessage('No microphone detected. Please connect a microphone to use voice commands.', 'assistant');
      } else {
        requestMicrophonePermission();
      }
    };

    initialize();

    // Listen for device changes
    navigator.mediaDevices?.addEventListener('devicechange', checkAudioDevices);
    return () => {
      navigator.mediaDevices?.removeEventListener('devicechange', checkAudioDevices);
    };
  }, [addMessage]);

  const requestMicrophonePermission = async () => {
    if (!deviceAvailable) {
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      if (error instanceof Error) {
        const message = error.name === 'NotFoundError' 
          ? 'No microphone found. Please connect a microphone to use voice commands.'
          : 'Microphone access denied. Please allow microphone access in your browser settings.';
        addMessage(message, 'assistant');
      }
      setHasPermission(false);
      return false;
    }
  };

  const toggleRecording = async () => {
    if (!isSpeechRecognitionSupported) {
      addMessage('Speech recognition is not supported in your browser.', 'assistant');
      return;
    }

    if (!deviceAvailable) {
      addMessage('No microphone detected. Please connect a microphone to use voice commands.', 'assistant');
      return;
    }

    if (isRecording) {
      stopRecognition();
      stopSpeaking();
      setIsRecording(false);
      addMessage('Voice recognition stopped.', 'assistant');
    } else {
      if (!hasPermission) {
        const permissionGranted = await requestMicrophonePermission();
        if (!permissionGranted) return;
      }

      try {
        setIsRecording(true);
        await initializeRecognition();
        addMessage('Listening for your commands...', 'assistant');
      } catch (error) {
        console.error('Error starting recognition:', error);
        setIsRecording(false);
        addMessage('Failed to start voice recognition. Please try again.', 'assistant');
      }
    }
  };

  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecognition();
      }
    };
  }, [isRecording, stopRecognition]);

  if (!isSpeechRecognitionSupported) {
    return (
      <button
        disabled
        className="p-3 rounded-full bg-gray-400 cursor-not-allowed text-white"
        title="Speech recognition not supported in this browser"
      >
        <MicOff className="w-6 h-6" />
      </button>
    );
  }

  if (!deviceAvailable) {
    return (
      <button
        disabled
        className="p-3 rounded-full bg-yellow-500 cursor-not-allowed text-white"
        title="No microphone detected"
      >
        <AlertCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleRecording}
      className={`p-3 rounded-full transition-colors ${
        isRecording
          ? 'bg-red-500 hover:bg-red-600'
          : 'bg-blue-500 hover:bg-blue-600'
      } text-white`}
      title={isRecording ? 'Stop recording' : 'Start recording'}
    >
      {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
    </button>
  );
};