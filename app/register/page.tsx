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
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

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
      if (err.response?.status === 422) {
        setValidationErrors(err.response.data.errors);
      } else {
        setError('登録に失敗しました');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-xl">
      <h1 className="text-2xl font-bold mb-4">ユーザー登録</h1>

      {error && <div className="mb-4 text-red-500">{error}</div>}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label htmlFor='name' className="block mb-1">名前</label>
          <input
            id='name'
            className="w-full border px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {validationErrors.name && (
            <ul className="text-red-500 text-sm mt-1 space-y-1">
              {validationErrors.name.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label htmlFor='email' className="block mb-1">メールアドレス</label>
          <input
            type="email"
            id='email'
            className="w-full border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {validationErrors.email && (
            <ul className="text-red-500 text-sm mt-1 space-y-1">
              {validationErrors.email.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label htmlFor='password' className="block mb-1">パスワード</label>
          <input
            type="password"
            id='password'
            className="w-full border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {validationErrors.password && (
            <ul className="text-red-500 text-sm mt-1 space-y-1">
              {validationErrors.password.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label htmlFor='passwordConfirmation' className="block mb-1">パスワード（確認）</label>
          <input
            type="password"
            id='passwordConfirmation'
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
