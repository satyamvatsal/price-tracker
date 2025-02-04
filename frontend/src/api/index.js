import axios from "axios";

const API = axios.create({
  baseURL: "https://trackapi.satyamvatsal.me",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export const login = (data) => API.post("/auth/login", data);
export const signup = (data) => API.post("/auth/register", data);
export const logout = () => localStorage.removeItem("auth-token");
export const getProfile = () => API.get("/users/profile");
export const verifyOtp = (data) => API.post("/auth/verify-otp", data);
export const resendOtp = (data) => API.post("/auth/resend-otp", data);

export const addProduct = (data) => API.post("/product/add", data);
export const deleteProduct = (id) => API.delete(`/product/${id}`);
export const editProduct = (id, data) => API.patch(`/product/${id}`, data);
