import api from './api';

const authService = {
  async register(name, email, password) {
    const [firstName, ...lastNameParts] = name.trim().split(/\s+/);

    const response = await api.post('/auth/register', {
      first_name: firstName,
      last_name: lastNameParts.join(' ') || firstName,
      email,
      password,
      password_confirmation: password,
    });
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  async loginAdmin(username, password) {
    const response = await api.post('/auth/login', {
      username,
      password,
    });
    return response.data;
  },

  async getUser() {
    const response = await api.get('/auth/user');
    return response.data.data ?? response.data;
  },

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  storeAuth(token, user) {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  getToken() {
    return localStorage.getItem('auth_token');
  },

  getUserFromStorage() {
    const user = localStorage.getItem('user');
    if (!user) return null;

    try {
      return JSON.parse(user);
    } catch {
      this.clearAuth();
      return null;
    }
  },

  clearAuth() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  getUserRole() {
    const user = this.getUserFromStorage();
    return user?.role || 'guest';
  },

  isAdmin() {
    return this.getUserRole() === 'admin';
  },

  isCustomer() {
    return this.getUserRole() === 'customer';
  },
};

export default authService;
