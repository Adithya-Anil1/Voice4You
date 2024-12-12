import React from 'react';
import { WebSocketProvider } from './components/WebSocketProvider';
import { VoiceControl } from './components/VoiceControl';
import Chat from './components/Chat';
import { ReminderSystem } from './components/ReminderSystem';
import { CameraFeed } from './components/CameraFeed';
import useStore from './store/useStore';

function App() {
  const { detectedObjects, isConnected } = useStore();

  const requestPermissions = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  React.useEffect(() => {
    requestPermissions();
  }, []);

  return (
    <WebSocketProvider>
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Voice Assistant</h1>
            <div className="flex items-center gap-4">
              <span 
                className={`inline-block w-3 h-3 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`} 
                title={isConnected ? 'Connected' : 'Disconnected'}
              />
              <VoiceControl />
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Camera Feed</h2>
                <CameraFeed />
                {detectedObjects.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2">Detected Objects</h3>
                    <div className="flex flex-wrap gap-2">
                      {detectedObjects.map((object, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {object}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <ReminderSystem />
              <Chat />
            </div>
          </div>
        </div>
      </div>
    </WebSocketProvider>
  );
}

export default App;