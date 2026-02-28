import apiClient from "../api/client";

export const userService = {
    // Check if user has a wallet
    checkWalletStatus: async () => {
        try {
            // Updated to your live endpoint
            const response = await apiClient.get("/rewardgetstatus");

            // Check for the specific 'Sucess' wrapper (single 'c')
            if (response.data?.Sucess) {
                // The boolean value 'true' is stored in the 'data' key
                const walletExists = response.data.Sucess.data;

                console.log("Wallet status check:", walletExists);
                return walletExists;
            }

            // Handle potential backend errors
            if (response.data?.Error) {
                throw new Error(response.data.Error.error);
            }

            return false;
        } catch (error) {
            console.error("Error checking wallet status:", error);
            // Defaulting to false on error to prevent UI crashes
            return false;
        }
    },


    // Create a new wallet
    createWallet: async () => {
        try {
            // Pointing to your real backend endpoint
            const response = await apiClient.post("/createwallet");
            // Handle the specific backend success wrapper
            if (response.data?.Sucess) {
                console.log("Wallet created successfully:", response.data.Sucess.message);

                // Return the standardized success object for your UI
                return {
                    success: true,
                    walletData: response.data.Sucess.data // Includes WalletID, PointsAvailable, etc.
                };
            }
            // Handle backend-specific error messages
            if (response.data?.Error) {
                throw new Error(response.data.Error.error);
            }

            return { success: false };
        } catch (error) {
            console.error("Error in createWallet service:", error);
            throw error;
        }
    },

    // Get user rewards and wallet data
    getRewards: async () => {
        try {
            // Updated to your live endpoint
            const response = await apiClient.get("/reward/getwalletdetails");

            // Handle the specific 'Sucess' wrapper (single 'c')
            if (response.data?.Sucess) {
                const wallet = response.data.Sucess.data;

                // Map backend data to UI-friendly structure
                return {
                    totalPoints: wallet.PointsAvailable || 0,
                    totalLikes: wallet.TotalLikes || 0,
                    walletId: wallet.WalletID,
                    status: wallet.IsWalletActive,
                    isBlocked: wallet.IsWalletBlocked || false,
                    // These are still managed on frontend or calculated
                    level: wallet.TotalLikes > 5000 ? "Gold Member" : "Silver Member",
                    levelProgress: Math.min(Math.floor((wallet.TotalLikes / 10000) * 100), 100),
                    nextLevel: "Platinum",
                    // Map the nested BankAccount object into an array for the UI
                    bankAccounts: wallet.BankAccount ? [
                        {
                            id: wallet.BankAccount.ID,
                            AccountHolderName: wallet.BankAccount.AccountHolderName,
                            AccountNumber: wallet.BankAccount.AccountNumber,
                            IFSCCode: wallet.BankAccount.IFSCCode,
                            BankName: wallet.BankAccount.BankName,
                            RazorpayContactID: wallet.BankAccount.RazorpayContactID,
                            RazorpayFundAccountID: wallet.BankAccount.RazorpayFundAccountID,
                            IsVerified: wallet.BankAccount.IsVerified,
                            CreatedAt: wallet.BankAccount.CreatedAt
                        }
                    ] : []
                };
            }

            // Handle error responses
            if (response.data?.Error) {
                throw new Error(response.data.Error.error);
            }

            return null;
        } catch (error) {
            console.error("Error fetching rewards details:", error);
            throw error;
        }
    },

    // services/userService.js
    getProfile: async () => {
        try {
            const response = await apiClient.get("/users/profile");

            // Handle your specific "Sucess" wrapper
            if (response.data?.Sucess) {
                const rawData = response.data.Sucess.data;

                // Map backend keys to the format your UI expects
                return {
                    id: rawData.ID || rawData.id,
                    name: rawData.AnonymousName,
                    bio: rawData.Bio,
                    avatar: rawData.Avatar,
                    stats: {
                        writings: rawData.WritingsCount,
                        followers: rawData.FollowersCount,
                        following: rawData.FollowingCount
                    }
                };
            }

            if (response.data?.Error) {
                throw new Error(response.data.Error.error);
            }
        } catch (error) {
            console.error("Profile fetch error:", error);
            throw error;
        }
    },

    // Get user friends/following
    getFriends: async () => {
        try {
            const response = await apiClient.get("/users/friends");
            return response.data;
        } catch (error) {
            console.error("Error fetching friends:", error);
            return [];
        }
    },

    // Get all available interests
    getAllInterests: async () => {
        try {
            const response = await apiClient.get("/getallinterest");
            // Transform API data to match frontend structure: { category: string, items: { id: number, name: string }[] }[]
            if (response.data && response.data.interests && response.data.interests.data) {
                return response.data.interests.data.map(interest => ({
                    category: interest.Name,
                    items: interest.SubInterests ? interest.SubInterests.map(sub => ({
                        id: sub.ID,
                        name: sub.Name
                    })) : []
                }));
            }
            return [];
        } catch (error) {
            console.error("Error fetching interests:", error);
            return [];
        }
    },

    // Update user interests
    updateUserInterests: async (interestIds) => {
        try {
            const response = await apiClient.post("/addinterest", { sub_interest_ids: interestIds });
            return response.data;
        } catch (error) {
            console.error("Error updating interests:", error);
            throw error;
        }
    },

    // services/userService.js
    getUserProfile: async (userId) => {
        try {
            const response = await apiClient.get(`/users/${userId}`);

            if (response.data?.Sucess) {
                const d = response.data.Sucess.data;

                return {
                    id: userId,
                    name: d.anonymous_name,
                    anonymousName: `@${d.anonymous_name}`,
                    avatar: d.avatarurl,
                    bio: d.bio,
                    // NEW: Capture following status from backend
                    isFollowing: d.IsFollowing || false,
                    stats: {
                        writings: d.writings_count,
                        followers: "Hidden",
                        following: "Hidden"
                    },
                    rawWritings: d.writings || []
                };
            }
            return null;
        } catch (error) {
            console.error("Error fetching public profile:", error);
            throw error;
        }
    },
    // Get current user's specific interests
    getUserInterests: async () => {
        try {
            const response = await apiClient.get("/users/intrst");
            // Transform or check response structure if needed
            if (response.data?.Sucess) {
                return response.data.Sucess.data || [];
            }
            return [];
        } catch (error) {
            console.error("Error fetching user interests:", error);
            return [];
        }
    },

    // services/userService.js

    getFollowers: async (userId, limit = 20, offset = 0) => {
        try {
            // Updated to your real endpoint
            const response = await apiClient.get("/users/followers", {
                params: { limit, offset }
            });

            if (response.data?.Sucess) {
                const rawFollowers = response.data.Sucess.data || [];

                // Map backend keys to UI expected keys
                return rawFollowers.map(follower => ({
                    id: follower.user_id,
                    name: follower.anonymous_name,
                    // Generate a consistent avatar since the API doesn't provide one yet
                    avatar: follower.avatarurl,
                    isFollowing: follower.is_following,
                    isFollower: follower.is_follower
                }));
            }

            if (response.data?.Error) {
                throw new Error(response.data.Error.error);
            }

            return [];
        } catch (error) {
            console.error("Error fetching followers:", error);
            throw error;
        }
    },

    // services/userService.js
    getFollowing: async (userId, limit = 20, offset = 0) => {
        try {
            // Updated to your real endpoint
            const response = await apiClient.get("/users/followings", {
                params: { limit, offset }
            });

            // Use the specific 'Sucess' key from your backend response
            if (response.data?.Sucess) {
                const rawFollowing = response.data.Sucess.data || [];

                // Map backend keys to UI expected keys
                return rawFollowing.map(follow => ({
                    id: follow.user_id,
                    name: follow.anonymous_name,
                    // Use backend avatarurl or fallback to a generated one if empty
                    avatar: follow.avatarurl,
                    isFollowing: follow.is_following,
                    isFollower: follow.is_follower
                }));
            }

            // Handle error scenarios if the 'Error' key is present
            if (response.data?.Error) {
                throw new Error(response.data.Error.error);
            }

            return [];
        } catch (error) {
            console.error("Error fetching following list:", error);
            throw error;
        }
    },
    // services/userService.js

    // Follow a user
    followUser: async (userId) => {
        try {
            // Updated to your real endpoint /users/follow/:id
            const response = await apiClient.post(`/users/follow/${userId}`);

            // Check for the 'Sucess' wrapper (single 'c')
            if (response.data?.Sucess) {
                console.log("Follow successful:", response.data.Sucess.data);
                return {
                    success: true,
                    data: response.data.Sucess.data
                };
            }

            // Handle potential backend errors
            if (response.data?.Error) {
                throw new Error(response.data.Error.error);
            }

            return { success: false };
        } catch (error) {
            console.error("Error in followUser service:", error);
            throw error;
        }
    },

    // services/userService.js

    // Unfollow a user
    unfollowUser: async (userId) => {
        try {
            // Updated to your real endpoint: /users/unfollow/:id
            const response = await apiClient.post(`/users/unfollow/${userId}`);

            // Handle the specific backend success wrapper
            if (response.data?.Sucess) {
                console.log("Unfollow successful. Updated data:", response.data.Sucess.data);
                return {
                    success: true,
                    data: response.data.Sucess.data
                };
            }

            // Handle backend-specific error messages
            if (response.data?.Error) {
                throw new Error(response.data.Error.error);
            }

            return { success: false };
        } catch (error) {
            console.error("Error in unfollowUser service:", error);
            throw error;
        }
    },
    // Remove a follower
    removeFollower: async (followerId) => {
        try {
            const response = await apiClient.delete(`/users/me/followers/${followerId}`);
            return response.data;
        } catch (error) {
            console.error("Error removing follower:", error);
            throw error;
        }
    },

    // Get avatar presets
    getAvatarPresets: async () => {
        try {
            // Assuming endpoint exists or will exist. If not, this will 404.
            const response = await apiClient.get("/users/avatars");
            return response.data;
        } catch (error) {
            console.error("Error fetching avatars:", error);
            // Fallback list if API fails, to prevent UI breakage during dev
            return [
                "https://api.dicebear.com/7.x/lorelei/svg?seed=Felix",
                "https://api.dicebear.com/7.x/lorelei/svg?seed=Sasha",
                "https://api.dicebear.com/7.x/lorelei/svg?seed=Midnight",
                "https://api.dicebear.com/7.x/lorelei/svg?seed=Luna",
                "https://api.dicebear.com/7.x/lorelei/svg?seed=Kitty",
                "https://api.dicebear.com/7.x/lorelei/svg?seed=Max",
                "https://api.dicebear.com/7.x/lorelei/svg?seed=Daisy",
                "https://api.dicebear.com/7.x/lorelei/svg?seed=Leo"
            ];
        }
    },

    // services/userService.js
    updateUserProfile: async (data) => {
        try {
            // Map frontend data to the Golang EditProfile struct keys
            const payload = {
                anonymous_name: data.name,
                image_url: data.avatar,
                bio: data.bio
            };

            console.log("Sending profile update to backend:", payload);

            const response = await apiClient.put("/users/updateprofile", payload);

            // Check for your custom "Error" key from the backend
            if (response.data?.Error) {
                throw new Error(response.data.Error.error);
            }

            return response.data; // Usually returns the "Sucess" object
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    },

    // services/userService.js
    // Add a bank account
    addBankAccount: async (accountDetails) => {
        try {
            // Map frontend camelCase to backend expected lowercase keys
            const payload = {
                accountholdername: accountDetails.accountHolderName,
                ifsccode: accountDetails.ifscCode,
                accountnumber: accountDetails.accountNumber,
                reaccountnumber: accountDetails.reAccountNumber
            };

            // Pointing to your real backend endpoint
            const response = await apiClient.post("/reward/add-bank-account", payload);

            // Check for the specific 'Sucess' wrapper (single 'c')
            if (response.data?.Sucess) {
                console.log("Bank account linked successfully:", response.data.Sucess.data);

                return {
                    success: true,
                    data: response.data.Sucess.data // Includes ID, Razorpay IDs, and Verification status
                };
            }

            // Handle backend-specific error messages
            if (response.data?.Error) {
                throw new Error(response.data.Error.error);
            }

            return { success: false };
        } catch (error) {
            console.error("Error linking bank account:", error);
            throw error;
        }
    },

    withdrawFunds: async (withdrawalDetails) => {
        try {
            const response = await apiClient.post("/reward/Withdraw-points", withdrawalDetails);

            // Handle the specific "Sucess" wrapper and status
            const payoutData = response.data.Sucess.data;

            return {
                success: response.data.Sucess.status,
                transactionId: payoutData.id,
                status: payoutData.status, // "processing"
                amount: payoutData.amount
            };
        } catch (error) {
            console.error("Withdrawal failed:", error);
            throw error;
        }
    },
    // Delete a bank account
    deleteBankAccount: async (accountId) => {
        try {
            const response = await apiClient.delete(`/users/bank-accounts/${accountId}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting bank account:", error);
            throw error;
        }
    },

    // Get withdrawal history (Database View)
    getWithdrawalHistory: async (limit = 5, offset = 0) => {
        try {
            const response = await apiClient.get("/reward/get-withdraws", {
                params: { limit, offset }
            });
            // Access the nested data: response.data.Sucess.data
            if (response.data && response.data.Sucess) {
                return response.data.Sucess.data || [];
            }
            return [];
        } catch (error) {
            console.error("Error fetching withdrawal history:", error);
            return [];
        }
    },

    // Refresh withdrawal status (Trigger Update from Gateway)
    refreshWithdrawalHistory: async (limit = 10, offset = 0) => {
        try {
            // Assuming this endpoint triggers the Razorpay status check
            const response = await apiClient.get("/reward/refresh-withdraws", {
                params: { limit, offset }
            });
            if (response.data && response.data.Sucess) {
                return response.data.Sucess.data || [];
            }
            return [];
        } catch (error) {
            console.error("Error refreshing withdrawal history:", error);
            throw error;
        }
    },

    // Report a problem (Bug, Technical Issue, etc.)
    reportProblem: async (reportData) => {
        try {
            // Replace with actual endpoint once available on backend, typical form: /users/report
            const response = await apiClient.post("/users/report-complaint", reportData);

            if (response.data?.Sucess) {
                return { success: true, data: response.data.Sucess.data };
            }

            if (response.data?.Error) {
                throw new Error(response.data.Error.error);
            }

            return { success: true, data: response.data };
        } catch (error) {
            console.error("Error submitting report:", error);
            // Re-throw so the frontend can display an error message
            throw error;
        }
    }
};
