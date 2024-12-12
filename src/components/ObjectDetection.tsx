import React, { useState } from 'react';
import { Camera, Eye } from 'lucide-react';

const ObjectDetection: React.FC = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState<string[]>([]);

  const toggleDetection = () => {
    setIsDetecting(!isDetecting);
    // Here we'll integrate with the Python backend for object detection
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={toggleDetection}
          className={`px-6 py-3 rounded-lg flex items-center space-x-2 ${
            isDetecting ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          <Camera className="w-5 h-5" />
          <span>{isDetecting ? 'Stop Detection' : 'Start Detection'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
            {isDetecting ? (
              <video className="w-full h-full rounded-lg" autoPlay />
            ) : (
              <Camera className="w-16 h-16 text-gray-600" />
            )}
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Eye className="w-6 h-6 text-blue-400" />
            <h4 className="text-lg font-medium">Detected Objects</h4>
          </div>
          {detectedObjects.length > 0 ? (
            <ul className="space-y-2">
              {detectedObjects.map((object, index) => (
                <li key={index} className="text-gray-300">
                  {object}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No objects detected yet...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ObjectDetection;