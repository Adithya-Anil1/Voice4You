import React, { useState } from 'react';
import { PlusCircle, Clock, Check } from 'lucide-react';

interface Reminder {
  id: string;
  medication: string;
  time: string;
  confirmed: boolean;
}

const Reminders: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newMedication, setNewMedication] = useState('');
  const [newTime, setNewTime] = useState('');

  const addReminder = () => {
    if (newMedication && newTime) {
      setReminders([
        ...reminders,
        {
          id: Date.now().toString(),
          medication: newMedication,
          time: newTime,
          confirmed: false,
        },
      ]);
      setNewMedication('');
      setNewTime('');
    }
  };

  const confirmReminder = (id: string) => {
    setReminders(reminders.map(reminder =>
      reminder.id === id ? { ...reminder, confirmed: true } : reminder
    ));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-lg p-6">
        <h4 className="text-lg font-medium mb-4">Add New Reminder</h4>
        <div className="space-y-4">
          <input
            type="text"
            value={newMedication}
            onChange={(e) => setNewMedication(e.target.value)}
            placeholder="Medication name"
            className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={addReminder}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center justify-center space-x-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Add Reminder</span>
          </button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-6">
        <h4 className="text-lg font-medium mb-4">Today's Reminders</h4>
        {reminders.length > 0 ? (
          <div className="space-y-4">
            {reminders.map(reminder => (
              <div
                key={reminder.id}
                className={`p-4 rounded-lg flex items-center justify-between ${
                  reminder.confirmed ? 'bg-gray-800/50' : 'bg-gray-800'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="font-medium">{reminder.medication}</p>
                    <p className="text-sm text-gray-400">{reminder.time}</p>
                  </div>
                </div>
                {!reminder.confirmed && (
                  <button
                    onClick={() => confirmReminder(reminder.id)}
                    className="p-2 bg-green-500 hover:bg-green-600 rounded-full"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No reminders set for today</p>
        )}
      </div>
    </div>
  );
};

export default Reminders;