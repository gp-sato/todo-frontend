'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getCsrfToken } from '@/lib/csrf';
import { useUser } from '@/lib/auth';
import { logout } from '@/lib/auth';
import dayjs from 'dayjs';

type Task = {
  id: number;
  title: string;
  is_completed: boolean;
  due_date: string | null;
};

export default function TodosPage() {
  const router = useRouter();
  const { user, isLoading, isError } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');

  const [isPosting, setIsPosting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login'); // 未ログインならリダイレクト
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    const res = await api.get('/api/tasks');
    setTasks(res.data);
  };

  const addTask = async () => {
    if (isPosting || !newTask.trim()) return;
    setIsPosting(true);
    try {
      await getCsrfToken();
      await api.post('/api/tasks', { title: newTask });
      setNewTask('');
      fetchTasks();
    } catch (e) {
      console.error(e);
    } finally {
      setIsPosting(false);
    }
  };

  const toggleTask = async (task: Task) => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      await getCsrfToken();
      await api.put(`/api/tasks/${task.id}`, { is_completed: !task.is_completed });
      fetchTasks();
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
      fetchTasks();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  const startEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDueDate(task.due_date || '');
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditTitle('');
    setEditDueDate('');
  };

  const saveTask = async (id: number) => {
    if (isSaving) return; // 二重送信防止
    setIsSaving(true);

    try {
      await getCsrfToken();
      await api.put(`/api/tasks/${id}`, {
        title: editTitle,
        due_date: editDueDate,
      });
      cancelEdit();
      fetchTasks();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('ログアウト失敗:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  if (isLoading) return <div>読み込み中...</div>;
  if (isError) return <div>エラーが発生しました</div>;

  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">タスクリスト</h1>
        <button
          className="text-sm text-gray-500 hover:underline disabled:opacity-50"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? 'ログアウト中…' : 'ログアウト'}
        </button>
      </div>

      <div className="flex mb-4 space-x-2">
        <input
          className="flex-grow border px-3 py-2"
          placeholder="新しいタスクを追加"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-4 py-2" onClick={addTask} disabled={isPosting}>
          追加
        </button>
      </div>

      <ul className="space-y-2">
        {tasks.map((task) => (
          <li key={task.id} className="flex flex-col border p-3">
            {editingTaskId === task.id ? (
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
                <div onClick={() => startEdit(task)} className="cursor-pointer">
                  <span className={task.is_completed ? 'line-through text-gray-500' : ''}>
                    {task.title}
                  </span>
                  {task.due_date && (
                    <div className="text-sm text-gray-500">期限: {dayjs(task.due_date).format('YYYY-MM-DD HH:mm')}</div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => toggleTask(task)} disabled={isToggling}>完了</button>
                  <button onClick={() => deleteTask(task.id)} disabled={isDeleting}>削除</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
