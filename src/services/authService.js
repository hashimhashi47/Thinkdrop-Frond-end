import apiClient from "../api/client";

export const authService = {
    login: async (email, password) => {
        const response = await apiClient.post("/auth/login", { email, password });
        if (response.data.token) {
            localStorage.setItem("token", response.data.token);
        }
        return response.data;
    },

    register: async (userData) => {
        const response = await apiClient.post("/auth/register", userData);
        if (response.data.token) {
            localStorage.setItem("token", response.data.token);
        }
        return response.data;
    },

    sendOtp: async (email) => {
        console.log("Sending OTP to:", email);
        const response = await apiClient.post("/auth/send-otp", { email });
        return response.data;
    },

    verifyOtp: async (email, otp) => {
        console.log("Verifying OTP for:", email);
        const response = await apiClient.post("/auth/verify-otp", { email, otp });
        return response.data;
    },

    updateInterests: async (interests) => {
        // Mock API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, message: "Interests updated" });
            }, 800);
        });
    },

    logout: () => {
        localStorage.removeItem("token");
        window.location.reload();
    },
};
