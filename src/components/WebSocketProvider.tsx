import React, { useEffect } from 'react';
import useStore from '../store/useStore';

const RETRY_INTERVAL = 3000;
const MAX_RETRIES = 3;

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setSocket, setIsConnected, addMessage, setIsSpeaking } = useStore();

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    let ws: WebSocket | null = null;
    let retryCount = 0;
    let retryTimeout: NodeJS.Timeout;

    const connect = () => {
      if (ws?.readyState === WebSocket.OPEN) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/ws`;

      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
          setSocket(ws);
          retryCount = 0;
          const welcomeMessage = 'Connected to voice assistant. Try saying "open camera" or "show reminders".';
          addMessage(welcomeMessage, 'assistant');
          speakMessage(welcomeMessage);
        };

        ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          setIsConnected(false);
          setSocket(null);
          
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`Retrying connection (${retryCount}/${MAX_RETRIES})...`);
            retryTimeout = setTimeout(connect, RETRY_INTERVAL);
          } else {
            const errorMessage = 'Unable to connect to voice assistant server. Please ensure the backend is running.';
            addMessage(errorMessage, 'assistant');
            speakMessage(errorMessage);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            switch (data.type) {
              case 'assistant_response':
                addMessage(data.message, 'assistant');
                speakMessage(data.message);
                break;
              case 'voice_command':
                addMessage(`Command recognized: ${data.text}`, 'user');
                break;
              default:
                console.warn('Unknown message type:', data.type);
            }
          } catch (error) {
            console.error('Error processing message:', error);
          }
        };
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Retrying connection (${retryCount}/${MAX_RETRIES})...`);
          retryTimeout = setTimeout(connect, RETRY_INTERVAL);
        }
      }
    };

    connect();

    return () => {
      clearTimeout(retryTimeout);
      if (ws) {
        ws.close();
      }
    };
  }, [setSocket, setIsConnected, addMessage, setIsSpeaking]);

  return <>{children}</>;
};