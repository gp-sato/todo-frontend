'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useUser } from '@/lib/auth';
import { getCsrfToken } from '@/lib/csrf';

export default function RegisterPage() {
  const router = useRouter();
  const { user } = useUser();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      router.replace('/todos'); // 既にログインしていればリダイレクト
    }
  }, [user]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirmation) {
      setError('パスワードが一致しません');
      return;
    }

    try {
      await getCsrfToken();
      await api.post('/register', { name, email, password, password_confirmation: passwordConfirmation });
      await api.post('/login', { email, password });
      await getCsrfToken();
      window.location.href = '/todos'; // 登録成功でリダイレクト（リロード付きで確実に）
    } catch (err: any) {
      console.error(err.response?.data);
      setError('登録に失敗しました');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-xl">
      <h1 className="text-2xl font-bold mb-4">ユーザー登録</h1>

      {error && <div className="mb-4 text-red-500">{error}</div>}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block mb-1">名前</label>
          <input
            className="w-full border px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1">メールアドレス</label>
          <input
            type="email"
            className="w-full border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1">パスワード</label>
          <input
            type="password"
            className="w-full border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1">パスワード（確認）</label>
          <input
            type="password"
            className="w-full border px-3 py-2"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
          />
        </div>

        <button className="w-full bg-blue-500 text-white py-2" type="submit">
          登録
        </button>
      </form>
    </div>
  );
}
