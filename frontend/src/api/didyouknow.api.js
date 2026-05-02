import apiClient from './client';
export const getDidYouKnowByAnimal = (animalId) => apiClient.get(`/didyouknow/animal/${animalId}`).then(r => r.data);
export const getAllDidYouKnow = () => apiClient.get('/didyouknow').then(r => r.data);
export const createDidYouKnow = (data) => apiClient.post('/didyouknow', data).then(r => r.data);
export const updateDidYouKnow = (id, data) => apiClient.put(`/didyouknow/${id}`, data).then(r => r.data);
export const deleteDidYouKnow = (id) => apiClient.delete(`/didyouknow/${id}`).then(r => r.data);
