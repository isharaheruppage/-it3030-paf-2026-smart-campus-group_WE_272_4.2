import axios from "axios";

const BASE = process.env.REACT_APP_SERVER_URL || "http://localhost:8082";

export const moduleApi = axios.create({
  baseURL: `${BASE}/api`,
});

moduleApi.interceptors.request.use((config) => {
  if (!config.headers["X-User-Email"]) {
    config.headers["X-User-Email"] = "admin@campushub.edu";
  }
  return config;
});
