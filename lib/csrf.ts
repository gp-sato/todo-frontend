import { api } from "./api";

export const getCsrfToken = async () => {
  await api.get('sanctum/csrf-cookie');
};
