import useSWR from 'swr';
import { api } from './api';
import { getCsrfToken } from './csrf';
import { User } from './types';

export const useUser = () => {
  const { data, error, isLoading } = useSWR<User>(
    '/user',
    async () => {
      const res = await api.get('/user');
      return res.data;
    },
    {
      shouldRetryOnError: false, // 無限リトライ防止
      revalidateOnFocus: false,
    }
  );

  return {
    user: data,
    isLoading,
    isError: error,
  };
};

export const logout = async () => {
  await getCsrfToken();
  await api.post('/logout');
};
