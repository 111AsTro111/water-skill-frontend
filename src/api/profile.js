import apiClient from './client';

export const profileApi = {
  uploadAvatar: (file) => {
    // File uploads need multipart/form-data, not the JSON content-type
    // every other request in this app uses — FormData handles that
    // encoding automatically once we append the file to it.
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient
      .post('/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  },

  removeAvatar: () => apiClient.delete('/user/avatar').then((res) => res.data),
};
