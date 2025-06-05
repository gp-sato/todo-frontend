import useSWR from 'swr';
import { api } from './api';
import { getCsrfToken } from './csrf';

const fetcher = (url: string) => api.get(url).then(res => res.data);

export const useUser = () => {
  const { data, error, isLoading } = useSWR('/user', fetcher);
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
