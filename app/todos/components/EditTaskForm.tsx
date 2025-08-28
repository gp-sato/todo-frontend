'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { getCsrfToken } from '@/lib/csrf';
import { dayjs } from '@/lib/dayjs';
import axios from 'axios';

type Task = {
  id: number;
  title: string;
  is_completed: boolean;
  due_date: string | null;
};

type EditTaskFormProps = {
  task: Task;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setErrorMessages: React.Dispatch<React.SetStateAction<string[]>>;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function EditTaskForm({ task, setTasks, setErrorMessages, setIsEditing }: EditTaskFormProps) {
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDueDate, setEditDueDate] = useState(task.due_date || '');

  const [isSaving, setIsSaving] = useState(false);

  const saveTask = async (id: number) => {
    if (isSaving) return; // 二重送信防止
    setIsSaving(true);

    try {
      await getCsrfToken();
      await api.put(`/api/tasks/${id}`, {
        title: editTitle,
        due_date: editDueDate ? dayjs(editDueDate).format('YYYY-MM-DDTHH:mm:ssZ') : null,
      });

      setTasks(tasks => {
        return tasks.map(t => t.id === task.id ? {...t, title: editTitle, due_date: editDueDate} : t);
      });
      setIsEditing(false);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response && error.response.status === 422) {
        const errors = error.response.data.errors as Record<string, string[]>;
        const messages = Object.values(errors).flat();
        setErrorMessages(messages);
      } else {
        console.error('Unexpected error:', error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditTitle(task.title);
    setEditDueDate(task.due_date || '');
  };

  return (
    <div className="flex flex-col space-y-2">
      <input
        className="border p-2"
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
      />
      <input
        type="datetime-local"
        className="border p-2"
        value={editDueDate ? dayjs(editDueDate).format('YYYY-MM-DDTHH:mm') : ''}
        onChange={(e) => setEditDueDate(e.target.value)}
      />
      <div className="flex space-x-2">
        <button onClick={() => saveTask(task.id)} disabled={isSaving}>
          {isSaving ? '保存中...' : '保存'}
        </button>
        <button onClick={cancelEdit}>キャンセル</button>
      </div>
    </div>
  );
};
