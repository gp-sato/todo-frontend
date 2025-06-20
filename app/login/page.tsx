'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { getCsrfToken } from '@/lib/csrf';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await getCsrfToken();
      await api.post('/login', { email, password });
      window.location.href = '/todos';
    } catch (err: any) {
      setError('ログインに失敗しました');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">ログイン</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={login} className="space-y-4">
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2" required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-3 py-2" required />
        <button type="submit" className="w-full bg-blue-500 text-white py-2">ログイン</button>
      </form>

      <div className="mt-4 text-center">
        <span>アカウントをお持ちでない方は </span>
        <Link href="/register" className="text-blue-500 hover:underline">
          ユーザー登録はこちら
        </Link>
      </div>
    </div>
  );
}
