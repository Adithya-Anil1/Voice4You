import React, { useEffect, useRef } from 'react';
import { Bot, Volume2 } from 'lucide-react';
import useStore from '../store/useStore';

const Chat: React.FC = () => {
  const { messages, isSpeaking, setIsSpeaking } = useStore();
  const messagesStartRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    messagesStartRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToTop();
  }, [messages]);

  const speakMessage = async (text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Create a stable array of unique messages with guaranteed unique keys
  const uniqueMessages = React.useMemo(() => {
    const seen = new Set();
    return messages.filter(message => {
      const messageKey = `${message.id}`;
      if (seen.has(messageKey)) {
        return false;
      }
      seen.add(messageKey);
      return true;
    });
  }, [messages]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Conversation</h2>
      <div className="h-[400px] overflow-y-auto space-y-4 flex flex-col-reverse">
        <div ref={messagesStartRef} />
        {[...uniqueMessages].reverse().map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-lg flex items-start gap-2 ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100'
              }`}
            >
              {message.sender === 'assistant' && (
                <Bot className="w-5 h-5 mt-1" />
              )}
              <div className="flex-1">
                <p className="break-words">{message.text}</p>
              </div>
              {message.sender === 'assistant' && (
                <button
                  onClick={() => speakMessage(message.text)}
                  disabled={isSpeaking}
                  className={`p-1 rounded-full transition-colors ${
                    isSpeaking ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chat;