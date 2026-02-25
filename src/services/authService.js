import apiClient from "../api/client";

export const authService = {
    login: async (email, password) => {
        const response = await apiClient.post("/auth/login", { email, password });
        // Token handling removed for cookie-based auth
        // console.log(response.data)
        return response.data;

    },


    register: async (userData) => {
        // userData should match: { fullname, anonymousname, email, otp, password }
        const response = await apiClient.post("/auth/signup", userData);
        // Token handling removed for cookie-based auth
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

    // services/userService.js
    updateUserInterests: async (interestIds) => {
        try {
            // Based on your backend requirement: { sub_interest_ids: [1, 2, 3] }
            const response = await apiClient.post("/user/addinterest", {
                sub_interest_ids: interestIds
            });

            // Handle your backend's custom Error structure
            if (response.data?.Error) {
                throw new Error(response.data.Error.error);
            }

            return response.data; // Returns the "Sucess" object
        } catch (error) {
            console.error("Error updating interests:", error);
            throw error;
        }
    },

    logout: async () => {
        try {
            await apiClient.post("/auth/logout");
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            localStorage.removeItem("userRole");
            window.location.reload();
        }
    },
};
