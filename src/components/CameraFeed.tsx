import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import useStore from '../store/useStore';

export const CameraFeed: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [windowRef, setWindowRef] = useState<Window | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { addMessage } = useStore();

  const openCamera = async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      if (windowRef && !windowRef.closed) {
        windowRef.close();
      }

      const newWindow = window.open("http://127.0.0.1:3000/static/index.html", "_blank", 
        "width=800,height=600,menubar=no,toolbar=no,location=no,status=no"
      );

      if (newWindow) {
        setWindowRef(newWindow);
        setIsOpen(true);
        addMessage("Camera opened in new tab", "assistant");

        const checkWindow = setInterval(() => {
          if (newWindow.closed) {
            clearInterval(checkWindow);
            setIsOpen(false);
            setWindowRef(null);
            addMessage("Camera tab closed", "assistant");
          }
        }, 1000);
      } else {
        addMessage("Failed to open camera tab. Please check your popup blocker settings.", "assistant");
      }
    } catch (error) {
      console.error('Error opening camera:', error);
      addMessage("Failed to open camera. Please try again.", "assistant");
    } finally {
      setIsProcessing(false);
    }
  };

  const closeCamera = () => {
    if (windowRef && !windowRef.closed) {
      windowRef.close();
      setIsOpen(false);
      setWindowRef(null);
      addMessage("Camera tab closed", "assistant");
    }
  };

  useEffect(() => {
    const handleVoiceCommand = async (event: CustomEvent<{ action: string }>) => {
      if (event.detail.action === 'open' && !isOpen) {
        await openCamera();
      } else if (event.detail.action === 'close' && isOpen) {
        closeCamera();
      }
    };

    window.addEventListener('voice-command-camera', handleVoiceCommand as EventListener);
    
    return () => {
      window.removeEventListener('voice-command-camera', handleVoiceCommand as EventListener);
      closeCamera();
    };
  }, [windowRef, isOpen, isProcessing]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex justify-center">
      <button
        onClick={isOpen ? closeCamera : openCamera}
        disabled={isProcessing}
        className={`p-4 rounded-full transition-all transform hover:scale-105 ${
          isProcessing ? 'bg-gray-100 cursor-not-allowed' :
          isOpen ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-blue-50 text-blue-500 hover:bg-blue-100'
        }`}
        title={isOpen ? "Close Camera" : "Open Camera"}
      >
        <Camera className="w-8 h-8" />
      </button>
    </div>
  );
};