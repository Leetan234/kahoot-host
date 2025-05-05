import apiClient from './apiClient';

// Tạo instance Axios với cấu hình mặc định

export const getQuizById = async (quizId) => {
  try {
    const response = await apiClient.get(`/api/quizzes/GetQuizById/${quizId}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting quiz with ID ${quizId}:`, error);
    throw error;
  }
};

export const createQuiz = async (quizData) => {
  try {
    const response = await apiClient.post('/api/quizzes', quizData);
    return response.data;
  } catch (error) {
    console.error('Error creating quiz:', error);
    throw error;
  }
};

export const updateQuiz = async (quizId, updatedData) => {
  try {
    const response = await apiClient.put(`/api/quizzes/${quizId}`, updatedData);
    return response.data;
  } catch (error) {
    console.error(`Error updating quiz with ID ${quizId}:`, error);
    throw error;
  }
};

export const deleteQuiz = async (quizId) => {
  try {
    const response = await apiClient.delete(`/api/quizzes/${quizId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting quiz with ID ${quizId}:`, error);
    throw error;
  }
};

export const getAllQuiz = async () => {
  try {
    const response = await apiClient.get('/api/quizzes');
    return response.data;
  } catch (error) {
    console.error('Error getting all quizzes:', error);
    throw error;
  }
};

export const getQuizQuestions = async (quizId) => {
  try {
    const response = await apiClient.get(`/quizzes/${quizId}/questions`);
    return response.data;
  } catch (error) {
    console.error(`Error getting quiz question with ID ${quizId}:`, error);
    throw error;
  }
};

export const updateQuizQuestion = async (questionId, updatedData) => {
  try {
    const response = await apiClient.put(
      `/api/questions/${questionId}`,
      updatedData
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating quiz question with ID ${questionId}:`, error);
    throw error;
  }
};

export const createQuizQuestion = async (quizId, questionData) => {
  try {
    const response = await apiClient.post(`/api/questions`, questionData);
    return response.data;
  } catch (error) {
    console.error(`Error creating quiz question with ID ${quizId}:`, error);
    throw error;
  }
};

export const deleteQuizQuestion = async (questionId) => {
  try {
    const response = await apiClient.delete(`/api/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting quiz question with ID ${questionId}:`, error);
    throw error;
  }
};
