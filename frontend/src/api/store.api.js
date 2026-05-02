import apiClient from './client';

export const getCategories = () => apiClient.get('/store/categories');
export const createCategory = (data) => apiClient.post('/store/categories', data);
export const updateCategory = (id, data) => apiClient.put(`/store/categories/${id}`, data);
export const deleteCategory = (id) => apiClient.delete(`/store/categories/${id}`);

export const getProducts = (params) => apiClient.get('/store/products', { params });
export const getProductById = (id) => apiClient.get(`/store/products/${id}`);
export const createProduct = (data) => apiClient.post('/store/products', data);
export const updateProduct = (id, data) => apiClient.put(`/store/products/${id}`, data);
export const deleteProduct = (id) => apiClient.delete(`/store/products/${id}`);
