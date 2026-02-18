// import axios from "axios";

// // Create an Axios instance
// const apiClient = axios.create({
//     baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000", // Fallback to localhost if env not set
//     timeout: 10000,
//     withCredentials: true, // Send cookies with requests
//     headers: {
//         "Content-Type": "application/json",
//     },
// });


// // Response Interceptor: Handle Global Errors
// apiClient.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         // Handle 401 Unauthorized (e.g., redirect to login)
//         if (error.response && error.response.status === 401) {
//             console.error("Unauthorized! Redirecting to login...");
//             window.location.href = "/login";
//         }
//         return Promise.reject(error);
//     }
// );

// export default apiClient;


import axios from "axios";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
    timeout: 10000,
    withCredentials: true, // Send cookies (Refresh Token) automatically
    headers: { "Content-Type": "application/json" },
});

// Flag to prevent multiple refresh calls if multiple 401s happen at once
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't already tried to retry this request
        if (error.response?.status === 401 && !originalRequest._retry) {

            // If already refreshing, wait in line
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => apiClient(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // 1. Call the refresh API
                // We use basic 'axios' here to avoid triggering this interceptor again
                await axios.post(
                    `${apiClient.defaults.baseURL}/auth/refersh`,
                    {},
                    { withCredentials: true }
                );

                // 2. Refresh was successful (cookies updated by backend)
                isRefreshing = false;
                processQueue(null);

                // 3. Retry the original request that failed
                return apiClient(originalRequest);

            } catch (refreshError) {
                // 4. Refresh token also expired or invalid
                isRefreshing = false;
                processQueue(refreshError, null);

                console.error("Session expired. Redirecting to login...");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;