import { useEffect, useCallback } from 'react';
import useStore from '../store/useStore';

// Use Vite's environment variables for configuration
const WS_URL = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:8000/ws`;

export const useWebSocket = () => {
  const { setSocket, setIsConnected, addMessage, setDetectedObjects } = useStore();

  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
      setSocket(ws);
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
      setSocket(null);
      // Attempt to reconnect after 3 seconds
      setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      ws.close();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'assistant_response':
            addMessage({ text: data.message, sender: 'assistant' });
            break;
          case 'object_detection':
            setDetectedObjects(data.objects);
            break;
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    return ws;
  }, [setSocket, setIsConnected, addMessage, setDetectedObjects]);

  useEffect(() => {
    const ws = connectWebSocket();
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [connectWebSocket]);
};