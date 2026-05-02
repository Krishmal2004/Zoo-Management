import apiClient from './client';

const multipartConfig = {
  transformRequest: (data, headers) => {
    const isFormDataLike = !!data && typeof data.append === 'function';
    if (isFormDataLike) {
      if (headers && typeof headers.delete === 'function') {
        headers.delete('Content-Type');
      } else if (headers) {
        delete headers['Content-Type'];
      }
    }
    return data;
  },
};

export const getAllEvents = (params = {}) => apiClient.get('/events', { params });

/** Returns API response body `{ success, count, data }` (legacy admin list screens). */
export const getEvents = () => apiClient.get('/events').then((r) => r.data);

export const getEventById = (id) => apiClient.get(`/events/${id}`);

export const createEvent = (formData) =>
  apiClient.post('/events', formData, multipartConfig);

export const updateEvent = (id, formData) =>
  apiClient.put(`/events/${id}`, formData, multipartConfig);

export const deleteEvent = (id) => apiClient.delete(`/events/${id}`);

export const bookEvent = (eventId, data) =>
  apiClient.post(`/events/${eventId}/book`, data);

export const getMyBookings = () => apiClient.get('/events/bookings/my');

export const cancelBooking = (bookingId) =>
  apiClient.patch(`/events/bookings/${bookingId}/cancel`);

export const getAllBookings = (params = {}) =>
  apiClient.get('/events/bookings/all', { params });

export const updateBookingStatus = (bookingId, status) =>
  apiClient.patch(`/events/bookings/${bookingId}/status`, { status });
