import axios from "axios";
import { notification } from "antd";
let request = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 5000,
});
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = token;
    }
    if (
      config.method.toLowerCase() !== "get" &&
      !config.headers["Content-Type"]
    ) {
      switch (config.contentType) {
        case "form":
          config.headers["Content-Type"] = "application/x-www-form-urlencoded";
          break;
        case "file":
          config.headers["Content-Type"] = "multipart/form-data";
          break;
        case "text":
          config.headers["Content-Type"] = "text/plain";
          break;
        case "html":
          config.headers["Content-Type"] = "text/html";
          break;
        default:
          config.headers["Content-Type"] = "application/json";
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
request.interceptors.response.use(
  (response) => {
    const { status, data, request: req } = response;
    const base = import.meta.env.VITE_APP_BASE_API;
    const url = req.responseURL;

    if (status === 200 || status === 201) {
      return data || response;
    }
  },
  async (error) => {
    let status = error.response?.status;
    let errorMessage = error.response?.data?.message || "Request Failed";
    switch (status) {
      case 401:
        notification.error({ message: errorMessage });
        localStorage.removeItem("token");
        window.location.href = "/login";
        break;
      case 400:
        errorMessage = `Bad Request: ${errorMessage}`;
        break;
      case 404:
        errorMessage = `Not Found: ${errorMessage}`;
        break;
      case 500:
        errorMessage = `Internal Server Error: ${errorMessage}`;
        break;
    }
    notification.error({ message: errorMessage });
    return Promise.reject(new Error(String(errorMessage)));
  }
);
export const req = (url, method, data = {}, config = {}) => {
  method = method.toLowerCase();
  switch (method) {
    case "get":
      return request.get(url, config);
    case "post":
      return request.post(url, data, config);
    case "put":
      return request.put(url, data, config);
    case "delete":
      return request.delete(url, config);
    default:
      console.error(method);
      return Promise.reject(new Error("Unsupported method"));
  }
};
