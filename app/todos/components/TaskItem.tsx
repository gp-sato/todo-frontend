'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { getCsrfToken } from '@/lib/csrf';
import axios from 'axios';
import dayjs from 'dayjs';

type Task = {
  id: number;
  title: string;
  is_completed: boolean;
  due_date: string | null;
};

type TaskItemProps = {
  task: Task;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setErrorMessages: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function TaskItem({ task, setTasks, setErrorMessages }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDueDate, setEditDueDate] = useState(task.due_date || '');

  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const toggleTask = async (task: Task) => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      await getCsrfToken();
      await api.put(`/api/tasks/${task.id}`, { is_completed: !task.is_completed });

      setTasks(tasks => {
        return tasks.map(t => t.id === task.id ? {...t, is_completed: !t.is_completed} : t);
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsToggling(false);
    }
  };

  const deleteTask = async (id: number) => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await getCsrfToken();
      await api.delete(`/api/tasks/${id}`);

      setTasks(tasks => {
        return tasks.filter(t => t.id !== task.id);
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  const saveTask = async (id: number) => {
    if (isSaving) return; // 二重送信防止
    setIsSaving(true);

    try {
      await getCsrfToken();
      await api.put(`/api/tasks/${id}`, {
        title: editTitle,
        due_date: editDueDate ? dayjs(editDueDate).tz('Asia/Tokyo').format('YYYY-MM-DDTHH:mm:ssZ') : null,
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
    <li key={task.id} className="flex flex-col border p-3">
      {isEditing ? (
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
      ) : (
        <div className="flex justify-between items-center">
          <div onClick={() => setIsEditing(true)} className="cursor-pointer">
            <span className={task.is_completed ? 'line-through text-gray-500' : ''}>
              {task.title}
            </span>
            {task.due_date && (
              <div className="text-sm text-gray-500">
                期限: {dayjs(task.due_date).format('YYYY-MM-DD HH:mm')}
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <button onClick={() => toggleTask(task)} disabled={isToggling}>完了</button>
            <button onClick={() => deleteTask(task.id)} disabled={isDeleting}>削除</button>
          </div>
        </div>
      )}
    </li>
  );
};
