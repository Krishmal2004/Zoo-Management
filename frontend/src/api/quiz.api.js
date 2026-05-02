import apiClient from './client';
export const getQuizzesByAnimal = (animalId) => apiClient.get(`/quiz/animal/${animalId}`).then(r => r.data);
export const createQuiz = (data) => apiClient.post('/quiz', data).then(r => r.data);
export const updateQuiz = (id, data) => apiClient.put(`/quiz/${id}`, data).then(r => r.data);
export const deleteQuiz = (id) => apiClient.delete(`/quiz/${id}`).then(r => r.data);
