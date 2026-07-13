import apiClient from './client';

export const matchesApi = {
  suggestions: () => apiClient.get('/matches').then((res) => res.data.matches),
};
