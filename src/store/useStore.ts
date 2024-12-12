import { create } from 'zustand';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
}

interface State {
  socket: WebSocket | null;
  isConnected: boolean;
  messages: Message[];
  detectedObjects: string[];
  isSpeaking: boolean;
  setSocket: (socket: WebSocket | null) => void;
  setIsConnected: (isConnected: boolean) => void;
  addMessage: (text: string, sender: 'user' | 'assistant') => void;
  setDetectedObjects: (objects: string[]) => void;
  setIsSpeaking: (isSpeaking: boolean) => void;
}

const useStore = create<State>((set) => ({
  socket: null,
  isConnected: false,
  messages: [],
  detectedObjects: [],
  isSpeaking: false,
  setSocket: (socket) => set({ socket }),
  setIsConnected: (isConnected) => set({ isConnected }),
  addMessage: (text, sender) => set((state) => ({ 
    messages: [...state.messages, { 
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${sender}`,
      text, 
      sender 
    }] 
  })),
  setDetectedObjects: (objects) => set({ detectedObjects: objects }),
  setIsSpeaking: (isSpeaking) => set({ isSpeaking }),
}));

export default useStore;