import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useReminders } from '../hooks/useReminders';
import { ReminderForm } from './ReminderForm';
import { ReminderList } from './ReminderList';

export const ReminderSystem: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const {
    reminders,
    addReminder,
    toggleReminder,
    deleteReminder,
    formatTimeToIST,
    checkReminders
  } = useReminders();

  useEffect(() => {
    const interval = setInterval(checkReminders, 60000); // Check every minute

    const handleVoiceCommand = () => {
      setIsVisible(true);
    };

    const handleAddReminder = (event: CustomEvent) => {
      const { title, time } = event.detail;
      addReminder(title, time);
    };

    window.addEventListener('voice-command-reminders', handleVoiceCommand);
    window.addEventListener('voice-add-reminder', handleAddReminder as EventListener);

    return () => {
      clearInterval(interval);
      window.removeEventListener('voice-command-reminders', handleVoiceCommand);
      window.removeEventListener('voice-add-reminder', handleAddReminder as EventListener);
    };
  }, [checkReminders, addReminder]);

  return (
    <div className={`space-y-6 bg-white rounded-lg shadow-sm p-6 transition-opacity duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-90'
    }`}>
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-semibold">Reminders</h2>
      </div>

      <div className="space-y-4">
        <ReminderForm onAdd={addReminder} />
        <ReminderList
          reminders={reminders}
          formatTimeToIST={formatTimeToIST}
          onToggle={toggleReminder}
          onDelete={deleteReminder}
        />
      </div>
    </div>
  );
};