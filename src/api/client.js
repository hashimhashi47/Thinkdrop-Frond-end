import axios from "axios";

// Create an Axios instance
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api", // Fallback to localhost if env not set
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor: Attach Token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token"); // Assuming you store JWT in localStorage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle Global Errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized (e.g., redirect to login)
        if (error.response && error.response.status === 401) {
            console.error("Unauthorized! Redirecting to login...");
            // window.location.href = "/login"; // Uncomment when routing is set up
        }
        return Promise.reject(error);
    }
);

export default apiClient;
