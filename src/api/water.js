import apiClient from './client';

export const waterOrdersApi = {
  place: (orderData) => apiClient.post('/water-orders', orderData).then((res) => res.data),

  myOrders: () => apiClient.get('/water-orders/my').then((res) => res.data.orders),

  show: (id) => apiClient.get(`/water-orders/${id}`).then((res) => res.data.order),

  cancel: (id) => apiClient.delete(`/water-orders/${id}`).then((res) => res.data),
};

export const paymentsApi = {
  createOrder: (waterOrderId) =>
    apiClient.post(`/water-orders/${waterOrderId}/pay`).then((res) => res.data),

  status: (waterOrderId) =>
    apiClient.get(`/water-orders/${waterOrderId}/payment-status`).then((res) => res.data.payment),
};
