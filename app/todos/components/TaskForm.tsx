import React, { useState } from 'react';
import dayjs from 'dayjs';
import { api } from '@/lib/api';
import { getCsrfToken } from '@/lib/csrf';
import axios from 'axios';

type TaskFormProps = {
  onAdd: () => void;  // タスク追加後に親へ通知
  setErrorMessages: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function TaskForm({ onAdd, setErrorMessages }: TaskFormProps) {
  const [newTask, setNewTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPosting || !newTask.trim()) return;
    if (dueDate && dayjs(dueDate).isBefore(dayjs())) {
      alert('期限は現在より未来の日時を指定してください。');
      return;
    }
    setIsPosting(true);
    try {
      await getCsrfToken();
      await api.post('/api/tasks', {
        title: newTask,
        due_date: dueDate ? dayjs(dueDate).tz('Asia/Tokyo').format('YYYY-MM-DDTHH:mm:ssZ') : null,
      });
      setNewTask('');
      setDueDate('');
      setErrorMessages([]);
      onAdd();  // 親に通知
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response && error.response.status === 422) {
        const errors = error.response.data.errors as Record<string, string[]>;
        const messages = Object.values(errors).flat();
        setErrorMessages(messages);
      } else {
        console.error('Unexpected error:', error);
      }
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <form onSubmit={addTask} className="flex mb-4 space-x-2">
      <input
        className="flex-grow border px-3 py-2"
        placeholder="新しいタスクを追加"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
      />
      <input
        type="datetime-local"
        className="flex-grow px-3 py-2"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        min={dayjs().format('YYYY-MM-DDTHH:mm')}  // 過去禁止
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2" disabled={isPosting}>
        追加
      </button>
    </form>
  );
};
