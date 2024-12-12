import React from 'react';
import { Clock, Check } from 'lucide-react';
import type { Reminder } from '../hooks/useReminders';

interface ReminderListProps {
  reminders: Reminder[];
  formatTimeToIST: (time: string) => string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ReminderList: React.FC<ReminderListProps> = ({
  reminders,
  formatTimeToIST,
  onToggle,
  onDelete
}) => {
  if (reminders.length === 0) {
    return <p className="text-gray-500 text-center py-4">No reminders yet</p>;
  }

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto">
      {reminders.map(reminder => (
        <div
          key={reminder.id}
          className={`flex items-center justify-between p-4 rounded-lg border ${
            reminder.completed ? 'bg-gray-50' : 'bg-white'
          }`}
        >
          <div className="flex items-center gap-4">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <p className={`font-medium ${
                reminder.completed ? 'line-through text-gray-400' : ''
              }`}>
                {reminder.title}
              </p>
              <p className="text-sm text-gray-500">
                {formatTimeToIST(reminder.time)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onToggle(reminder.id)}
              className={`p-2 rounded-full ${
                reminder.completed
                  ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(reminder.id)}
              className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
            >
              <span className="sr-only">Delete</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};