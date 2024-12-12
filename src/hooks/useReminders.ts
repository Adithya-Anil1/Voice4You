import { useState, useEffect } from 'react';
import { utcToZonedTime, format as formatTz } from 'date-fns-tz';
import { parse, isToday, format } from 'date-fns';
import useStore from '../store/useStore';

export interface Reminder {
  id: string;
  title: string;
  time: string;
  completed: boolean;
}

const STORAGE_KEY = 'voice-assistant-reminders';
const TIMEZONE = 'Asia/Kolkata';

export const useReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const { addMessage, setIsSpeaking } = useStore();

  // Load reminders from localStorage
  useEffect(() => {
    try {
      const savedReminders = localStorage.getItem(STORAGE_KEY);
      if (savedReminders) {
        const parsed = JSON.parse(savedReminders);
        if (Array.isArray(parsed)) {
          setReminders(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  }, []);

  // Save reminders to localStorage
  const saveReminders = (updatedReminders: Reminder[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReminders));
      setReminders(updatedReminders);
    } catch (error) {
      console.error('Error saving reminders:', error);
    }
  };

  const addReminder = (title: string, time: string) => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      title,
      time,
      completed: false
    };
    
    const updatedReminders = [...reminders, newReminder];
    saveReminders(updatedReminders);

    const message = `Added reminder: ${newReminder.title} at ${formatTimeToIST(newReminder.time)}`;
    addMessage(message, 'assistant');
    speakMessage(message);
  };

  const toggleReminder = (id: string) => {
    const updatedReminders = reminders.map(reminder =>
      reminder.id === id
        ? { ...reminder, completed: !reminder.completed }
        : reminder
    );
    saveReminders(updatedReminders);
  };

  const deleteReminder = (id: string) => {
    const updatedReminders = reminders.filter(reminder => reminder.id !== id);
    saveReminders(updatedReminders);
    
    const message = 'Reminder deleted';
    addMessage(message, 'assistant');
    speakMessage(message);
  };

  const formatTimeToIST = (time: string) => {
    const date = parse(time, 'HH:mm', new Date());
    const istDate = utcToZonedTime(date, TIMEZONE);
    return format(istDate, 'h:mm a');
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  const checkReminders = () => {
    const now = utcToZonedTime(new Date(), TIMEZONE);
    reminders.forEach(reminder => {
      if (!reminder.completed) {
        const reminderTime = parse(reminder.time, 'HH:mm', now);
        if (
          isToday(reminderTime) &&
          reminderTime.getHours() === now.getHours() &&
          reminderTime.getMinutes() === now.getMinutes()
        ) {
          const message = `Reminder: Time to ${reminder.title}`;
          addMessage(message, 'assistant');
          speakMessage(message);
          
          if (Notification.permission === 'granted') {
            new Notification('Reminder', {
              body: `Time to ${reminder.title}`,
              icon: '/bell.png'
            });
          }
        }
      }
    });
  };

  return {
    reminders,
    addReminder,
    toggleReminder,
    deleteReminder,
    formatTimeToIST,
    checkReminders
  };
};