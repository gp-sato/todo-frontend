'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { getCsrfToken } from '@/lib/csrf';
import EditTaskForm from './EditTaskForm';
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

  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  return (
    <li key={task.id} className="flex flex-col border p-3">
      {isEditing ? (
        <EditTaskForm
          task={task}
          setTasks={setTasks}
          setErrorMessages={setErrorMessages}
          setIsEditing={setIsEditing}
        />
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
