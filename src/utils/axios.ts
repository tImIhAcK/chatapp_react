import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8123/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default api;
