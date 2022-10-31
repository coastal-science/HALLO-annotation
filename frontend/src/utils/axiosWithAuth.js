import axios from "axios";

const baseURL = import.meta.env.REACT_APP_BASE_URL ?? "http://localhost:3000";
const backendURL = import.meta.env.REACT_APP_BACKEND ?? "http://localhost:8000";

const axiosWithAuth = axios.create({
  baseURL: backendURL + "/api",
  timeout: 60000,
  headers: {
    Authorization: localStorage.getItem("access_token")
      ? "Bearer " + localStorage.getItem("access_token")
      : null,
    "Content-Type": "application/json",
    accept: "application/json",
  },
});

axiosWithAuth.interceptors.response.use(
  (response) => {
    return response;
  },
  async function (error) {

    if (typeof error.response === "undefined") {
      alert(
        "A server/network error occurred. The server is not responding to the request, and may be restarted automatically"
      );
      return Promise.reject(error);
    }

    switch (error.response.status) {
    case 401:
    case 403:
      window.location.href = baseURL + "/sign-in/";
      break;
    case 400:
      window.location.href = baseURL + "/";
      break;
    }
  }
);

export default axiosWithAuth;
