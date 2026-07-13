import apiClient from './client';

export const swapRequestsApi = {
  send: (recipientId, offeredSkillId, requestedSkillId) =>
    apiClient
      .post('/swap-requests', {
        recipient_id: recipientId,
        offered_skill_id: offeredSkillId,
        requested_skill_id: requestedSkillId,
      })
      .then((res) => res.data),

  sent: () => apiClient.get('/swap-requests/sent').then((res) => res.data.swap_requests),

  received: () => apiClient.get('/swap-requests/received').then((res) => res.data.swap_requests),

  accept: (id) => apiClient.post(`/swap-requests/${id}/accept`).then((res) => res.data),

  decline: (id) => apiClient.post(`/swap-requests/${id}/decline`).then((res) => res.data),

  complete: (id) => apiClient.post(`/swap-requests/${id}/complete`).then((res) => res.data),

  cancel: (id) => apiClient.delete(`/swap-requests/${id}`).then((res) => res.data),
};

export const ratingsApi = {
  submit: (swapRequestId, score, comment) =>
    apiClient
      .post(`/swap-requests/${swapRequestId}/rating`, { score, comment })
      .then((res) => res.data),

  forUser: (userId) => apiClient.get(`/users/${userId}/ratings`).then((res) => res.data),
};
