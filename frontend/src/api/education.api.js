import apiClient from './client';

export const fetchEducationByAnimal = async (animalId) => {
  const response = await apiClient.get(`/education/animal/${animalId}`);
  return response.data;
};

export const createEducation = async (educationData) => {
  const response = await apiClient.post('/education', educationData);
  return response.data;
};

export const updateEducation = async (id, educationData) => {
  const response = await apiClient.put(`/education/${id}`, educationData);
  return response.data;
};

export const deleteEducation = async (id) => {
  const response = await apiClient.delete(`/education/${id}`);
  return response.data;
};
