import api from './api';

export const calendarService = {
  getEvents: async (start = null, end = null) => {
    return api.get('/calendar/events', {
      params: { ...(start && { start }), ...(end && { end }) },
    });
  },

  getRestDays: async (start = null, end = null) => {
    return api.get('/calendar/rest-days', {
      params: { ...(start && { start }), ...(end && { end }) },
    });
  },

  setRestDay: async (data) => {
    return api.post('/calendar/rest-days', data);
  },

  deleteRestDay: async (date) => {
    return api.delete(`/calendar/rest-days/${date}`);
  },
};
