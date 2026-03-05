import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000";

const client = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Normalise error messages so every caller gets a plain string
const extractMessage = (err) =>
  err.response?.data?.error || err.message || "An unexpected error occurred.";

export const taskApi = {
  getAll: async () => {
    try {
      const { data } = await client.get("/tasks");
      return data;
    } catch (err) {
      throw new Error(extractMessage(err));
    }
  },

  getById: async (id) => {
    try {
      const { data } = await client.get(`/tasks/${id}`);
      return data;
    } catch (err) {
      throw new Error(extractMessage(err));
    }
  },

  create: async ({ title, description }) => {
    try {
      const { data } = await client.post("/tasks", { title, description });
      return data;
    } catch (err) {
      throw new Error(extractMessage(err));
    }
  },

  update: async (id, payload) => {
    try {
      const { data } = await client.put(`/tasks/${id}`, payload);
      return data;
    } catch (err) {
      throw new Error(extractMessage(err));
    }
  },

  complete: async (id) => {
    try {
      const { data } = await client.patch(`/tasks/${id}/complete`);
      return data;
    } catch (err) {
      throw new Error(extractMessage(err));
    }
  },

  delete: async (id) => {
    try {
      await client.delete(`/tasks/${id}`);
    } catch (err) {
      throw new Error(extractMessage(err));
    }
  },
};
