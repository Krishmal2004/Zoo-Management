import apiClient from './client';
export const getLifeCyclesByAnimal = (animalId) => apiClient.get(`/lifecycle/animal/${animalId}`).then(r => r.data);
export const createLifeCycle = (data) => apiClient.post('/lifecycle', data).then(r => r.data);
export const updateLifeCycle = (id, data) => apiClient.put(`/lifecycle/${id}`, data).then(r => r.data);
export const deleteLifeCycle = (id) => apiClient.delete(`/lifecycle/${id}`).then(r => r.data);
