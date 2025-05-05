import apiClient from './apiClient';
// 1. Tạo người dùng mới
export const createUser = async (userData) => {
  try {
    const response = await apiClient.post('/api/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// 2. Cập nhật người dùng
export const updateUser = async (userId, updatedData) => {
  try {
    const response = await apiClient.put(
      `/api/users/${userId}`,
      updatedData
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating user with ID ${userId}:`, error);
    throw error;
  }
};

// 3. Đăng nhập
export const loginUser = async (loginData) => {
  try {
    const response = await apiClient.post('/api/users/login', loginData);
    return response.data; // Quan trọng: return đúng .data
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const getQuizByUserId = async (userId) => {
  try {
    const response = await apiClient.get(`/api/users/${userId}/quizzes`);
    return response.data;
  } catch (error) {
    console.error('Error getting all quizzes:', error);
    throw error;
  }
};
