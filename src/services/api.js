// API Service for Farm2Home (Mira Bhayandar Agricultural Direct Network)
let rawBase = process.env.REACT_APP_API_URL;
if (!rawBase) {
  // On Vercel and production deployments, use relative /api on the same origin
  rawBase = '/api';
} else {
  rawBase = rawBase.trim().replace(/\/+$/, '');
  if (!rawBase.endsWith('/api')) {
    rawBase = `${rawBase}/api`;
  }
}
const API_BASE_URL = rawBase;

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  async request(endpoint, options = {}) {
    // Prevent double /api/ if endpoint already includes /api
    const cleanEndpoint = endpoint.startsWith('/api/')
      ? endpoint.substring(4)
      : (endpoint.startsWith('/') ? endpoint : `/${endpoint}`);

    const url = `${this.baseURL}${cleanEndpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorMessage = 'Something went wrong';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || (errorData.errors && errorData.errors[0]?.msg) || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
        const error = new Error(errorMessage);
        error.response = { message: errorMessage, status: response.status };
        throw error;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (!error.response) {
        error.message = 'Unable to connect to Farm2Home API. Please ensure the backend is reachable.';
        error.response = { message: error.message };
      }
      throw error;
    }
  }

  // Generic HTTP convenience methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  async post(endpoint, body = {}, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    });
  }

  async put(endpoint, body = {}, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options,
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }

  // Authentication endpoints
  async login(email, password) {
    const data = await this.post('/auth/login', { email, password });
    if (data && data.token) {
      this.setToken(data.token);
      return {
        success: true,
        user: data.user || { email },
        token: data.token,
      };
    }
    throw new Error('Invalid response from server');
  }

  async register(userData) {
    const data = await this.post('/auth/register', userData);
    if (data && data.token) {
      this.setToken(data.token);
      return {
        success: true,
        user: data.user || { email: userData.email, role: userData.role },
        token: data.token,
      };
    }
    throw new Error('Invalid response from server');
  }

  async logout() {
    this.setToken(null);
  }

  async getCurrentUser() {
    if (!this.token) return null;
    try {
      return await this.get('/auth/me');
    } catch (error) {
      this.setToken(null);
      return null;
    }
  }

  // Farmers & Categories
  async getFarmers() {
    return this.get('/auth/farmers');
  }

  async getAdminFarmers() {
    return this.get('/admin/farmers');
  }

  async approveFarmer(farmerId, isApproved) {
    return this.put(`/admin/farmers/${farmerId}/approve`, { isApproved });
  }

  async getCategories() {
    return this.get('/products/categories');
  }

  // Addresses
  async getAddresses() {
    return this.get('/auth/addresses');
  }

  async createAddress(addressData) {
    return this.post('/auth/addresses', addressData);
  }

  // Delivery Slots & Tracking
  async getDeliverySlots(date) {
    const endpoint = date ? `/delivery/slots?date=${encodeURIComponent(date)}` : '/delivery/slots';
    return this.get(endpoint);
  }

  async createDeliverySlot(slotData) {
    return this.post('/delivery/slots', slotData);
  }

  async updateDeliverySlot(slotId, slotData) {
    return this.put(`/delivery/slots/${slotId}`, slotData);
  }

  async getDeliveryTracking(orderId) {
    return this.get(`/delivery/track/${orderId}`);
  }

  async updateDeliveryStatus(orderId, statusData) {
    return this.put(`/delivery/status/${orderId}`, statusData);
  }

  // Product endpoints
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.farmerId) query.append('farmerId', params.farmerId);
    if (params.all) query.append('all', 'true');
    const qs = query.toString();
    return this.get(qs ? `/products?${qs}` : '/products');
  }

  async getProduct(id) {
    return this.get(`/products/${id}`);
  }

  async createProduct(productData) {
    return this.post('/products', productData);
  }

  async updateProduct(id, productData) {
    return this.put(`/products/${id}`, productData);
  }

  async deleteProduct(id) {
    return this.delete(`/products/${id}`);
  }

  // Reviews
  async getProductReviews(productId) {
    return this.get(`/reviews/product/${productId}`);
  }

  async addReview(reviewData) {
    return this.post('/reviews', reviewData);
  }

  // Cart endpoints
  async getCart() {
    return this.get('/cart');
  }

  async addToCart(productId, quantity = 1) {
    return this.post('/cart', { productId, quantity });
  }

  async updateCartItem(itemId, quantity) {
    return this.put(`/cart/${itemId}`, { quantity });
  }

  async removeFromCart(itemId) {
    return this.delete(`/cart/${itemId}`);
  }

  // Order endpoints
  async getOrders() {
    return this.get('/orders');
  }

  async getOrder(id) {
    return this.get(`/orders/${id}`);
  }

  async createOrder(orderData) {
    return this.post('/orders', orderData);
  }

  async cancelOrder(orderId) {
    return this.delete(`/orders/${orderId}`);
  }

  async updateOrderStatus(orderId, status) {
    return this.put(`/orders/${orderId}/status`, { status });
  }

  // Admin endpoints
  async getAdminStats() {
    return this.get('/admin/stats');
  }

  async getAdminUsers() {
    return this.get('/admin/users');
  }

  async updateUserRole(userId, role) {
    return this.put(`/admin/users/${userId}/role`, { role });
  }

  async deleteUser(userId) {
    return this.delete(`/admin/users/${userId}`);
  }

  async getAdminProducts() {
    return this.get('/admin/products');
  }

  async createAdminProduct(productData) {
    return this.post('/admin/products', productData);
  }

  async updateAdminProduct(id, productData) {
    return this.put(`/admin/products/${id}`, productData);
  }

  async deleteAdminProduct(id) {
    return this.delete(`/admin/products/${id}`);
  }

  async getAdminOrders() {
    return this.get('/admin/orders');
  }

  async updateAdminOrderStatus(orderId, status) {
    return this.put(`/admin/orders/${orderId}/status`, { status });
  }

  async getAdminSupport() {
    return this.get('/admin/support');
  }

  async respondToSupport(ticketId, response) {
    return this.put(`/admin/support/${ticketId}/respond`, { response });
  }

  // Support endpoints
  async getSupportTickets() {
    return this.get('/support');
  }

  async getSupportTicket(id) {
    return this.get(`/support/${id}`);
  }

  async createSupportTicket(ticketData) {
    return this.post('/support', ticketData);
  }
}

const apiService = new ApiService();
export default apiService;
