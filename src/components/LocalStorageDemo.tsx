import React, { useState, useEffect } from 'react';

const LocalStorageDemo: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [savedValues, setSavedValues] = useState<string[]>([]);

  // Load saved values when component mounts
  useEffect(() => {
    const saved = localStorage.getItem('demo-values');
    if (saved) {
      setSavedValues(JSON.parse(saved));
    }
  }, []);

  // Save values whenever they change
  const saveValue = () => {
    if (inputValue.trim()) {
      const newValues = [...savedValues, inputValue];
      setSavedValues(newValues);
      localStorage.setItem('demo-values', JSON.stringify(newValues));
      setInputValue('');
    }
  };

  // Clear all saved values
  const clearValues = () => {
    setSavedValues([]);
    localStorage.removeItem('demo-values');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">LocalStorage Demo</h2>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Enter a value to store"
        />
        <button
          onClick={saveValue}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Save
        </button>
        <button
          onClick={clearValues}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Stored Values:</h3>
        {savedValues.length === 0 ? (
          <p className="text-gray-500">No values stored yet</p>
        ) : (
          <ul className="list-disc pl-5">
            {savedValues.map((value, index) => (
              <li key={index} className="text-gray-700">{value}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LocalStorageDemo;