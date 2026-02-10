import axios from "axios";

const apiURLs = {
  development: "http://localhost:4000",
  production: "https://expressfinanceplanner-production.up.railway.app",
};

const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? apiURLs.development : apiURLs.production);

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const loggedInUserJSON = localStorage.getItem("loggedInUser");

  const parseLoggedInUser = JSON.parse(loggedInUserJSON || '""');

  if (parseLoggedInUser.token) {
    config.headers = { Authorization: `Bearer ${parseLoggedInUser.token}` };
  }

  return config;
});

export { api };
