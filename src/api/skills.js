import apiClient from './client';

// Centralizing every API call in one file per resource (skills, swap
// requests, etc.) means pages just call `skillsApi.list()` instead of
// repeating the URL and axios syntax everywhere. If an endpoint URL ever
// changes, you fix it in exactly one place.

export const skillsApi = {
  list: () => apiClient.get('/skills').then((res) => res.data.skills),

  search: (query) =>
    apiClient.get('/skills/search', { params: { q: query } }).then((res) => res.data.skills),

  myList: () => apiClient.get('/my-skills').then((res) => res.data.skills),

  add: (skillId, type, proficiencyLevel) =>
    apiClient
      .post('/my-skills', { skill_id: skillId, type, proficiency_level: proficiencyLevel })
      .then((res) => res.data),

  remove: (skillId) => apiClient.delete(`/my-skills/${skillId}`).then((res) => res.data),

  usersOffering: (skillId) =>
    apiClient.get(`/skills/${skillId}/offering`).then((res) => res.data),

  usersSeeking: (skillId) =>
    apiClient.get(`/skills/${skillId}/seeking`).then((res) => res.data),
};
