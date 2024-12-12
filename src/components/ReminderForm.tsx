import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface ReminderFormProps {
  onAdd: (title: string, time: string) => void;
}

export const ReminderForm: React.FC<ReminderFormProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = () => {
    if (title && time) {
      onAdd(title, time);
      setTitle('');
      setTime('');
    }
  };

  return (
    <div className="flex gap-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What do you need to remember?"
        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
      />
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
      />
      <button
        onClick={handleSubmit}
        disabled={!title || !time}
        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};