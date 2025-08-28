'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useUser, logout } from '@/lib/auth';
import LogoutButton from './components/LogoutButton';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';

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

  const [loggingOut, setLoggingOut] = useState(false);

  const [errorMessages, setErrorMessages] = useState<string[]>([]);

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
        <LogoutButton onLogout={handleLogout} loggingOut={loggingOut} />
      </div>

      <TaskForm onAdd={fetchTasks} setErrorMessages={setErrorMessages} />
      {errorMessages.length > 0 && (
        <div className="text-red-500 mb-4">
          {errorMessages.map((msg, index) => (
            <p key={index}>{msg}</p>
          ))}
        </div>
      )}

      <TaskList
        tasks={tasks}
        setTasks={setTasks}
        setErrorMessages={setErrorMessages}
      />
    </div>
  );
}
