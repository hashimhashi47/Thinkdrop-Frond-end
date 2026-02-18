import React, { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import {
  Coins,
  ThumbsUp,
  TrendingUp,
  CreditCard,
  Plus,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
  X,
  Landmark,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { userService } from "../services/userService";
// import { postService } from "../services/postService";

// Exchange Rates Configuration
const EXCHANGE_RATES = {
  INR: { rate: 0.01, symbol: "₹" }, // base
  USD: { rate: 0.00012, symbol: "$" },
  EUR: { rate: 0.00011, symbol: "€" },
  GBP: { rate: 0.000095, symbol: "£" },
};

export default function Rewards() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [currency, setCurrency] = useState("USD");
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Check Wallet Status and Fetch Rewards on Mount
  useEffect(() => {
    const initRewards = async () => {
      try {
        // 1. Check if wallet exists
        const hasWallet = await userService.checkWalletStatus();
        if (!hasWallet) {
          navigate("/wallet-intro");
          return;
        }

        // 2. Fetch Rewards Data
        const data = await userService.getRewards();
        setRewardsData(data);
      } catch (error) {
        console.error("Failed to initialize rewards", error);
      } finally {
        setIsLoading(false);
      }
    };
    initRewards();
  }, [navigate]);

  // Inside your Form Component
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Call the service we just updated
      const result = await userService.addBankAccount(formData);

      if (result.success) {
        // 2. Logic after success (e.g., close modal, show success message)
        alert("Bank account added successfully!");
        // 3. Refresh the rewards data to show the new account
        fetchRewardsData();
      }
    } catch (err) {
      // 4. Handle errors (e.g., invalid IFSC or Account Number)
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (window.confirm("Are you sure you want to remove this bank account?")) {
      try {
        await userService.deleteBankAccount(accountId);
        // Refresh rewards data to reflect changes (or manually update state)
        const data = await userService.getRewards();
        // For mock purposes, if we delete, we simulate empty
        setRewardsData((prev) => ({ ...prev, bankAccounts: [] }));
      } catch (error) {
        console.error("Failed to delete account", error);
      }
    }
  };

  // Mock Data (Initial State)
  const [rewardsData, setRewardsData] = useState({
    totalPoints: 0,
    totalLikes: 0,
    level: "Member",
    levelProgress: 0,
    nextLevel: "Bronze",
    bankAccounts: [],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1E1E2E] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E1E2E] pb-20">
      <Navbar />

      <main className="max-w-4xl mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Rewards</h1>
          <p className="text-gray-400">
            Track your earnings and manage payouts.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Points Card */}
          <div className="bg-[#2D2D44] p-6 rounded-3xl border border-yellow-500/20 shadow-lg shadow-yellow-500/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transition-transform group-hover:scale-110 duration-500">
              <Coins size={120} className="text-yellow-500" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-500/20 rounded-xl text-yellow-500">
                  <Coins size={24} />
                </div>
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                  Total Points
                </span>
              </div>
              <div className="text-4xl font-extrabold text-white mb-1">
                {rewardsData.totalPoints.toLocaleString()}
              </div>
              <p className="text-xs text-yellow-500 font-medium">
                +150 this week
              </p>
            </div>
          </div>

          {/* Stats Card: Likes */}
          <div className="bg-[#2D2D44] p-6 rounded-3xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <ThumbsUp size={120} />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-xl text-blue-500">
                <ThumbsUp size={24} />
              </div>
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Total Likes
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {rewardsData.totalLikes.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              Your content is resonating!
            </div>
          </div>

          {/* Wallet Value */}
          <div className="bg-[#2D2D44] p-6 rounded-3xl border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-xl text-purple-500">
                  <TrendingUp size={24} />
                </div>
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                  Wallet Value
                </span>
              </div>

              {/* Currency Selector */}
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-[#1E1E2E] text-white text-xs font-bold py-1 px-3 rounded-lg border border-white/10 outline-none focus:border-brand-primary"
              >
                {Object.keys(EXCHANGE_RATES).map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-3xl font-bold text-white mb-2">
                {EXCHANGE_RATES[currency].symbol}
                {(
                  rewardsData.totalPoints * EXCHANGE_RATES[currency].rate
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <p className="text-xs text-green-400 font-medium">
                Approx. value in {currency}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 text-xs text-gray-500">
              1000 Points ≈ {EXCHANGE_RATES[currency].symbol}
              {(1000 * EXCHANGE_RATES[currency].rate).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Bank Accounts Section */}
        <div className="bg-[#2D2D44] rounded-3xl border border-white/5 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CreditCard size={24} className="text-brand-primary" />
              Linked Accounts
            </h2>
            {rewardsData.bankAccounts.length === 0 && (
              <Link
                to="/rewards/add-account"
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-colors border border-white/10"
              >
                <Plus size={16} />
                Add Account
              </Link>
            )}
          </div>

          <div className="space-y-4">
            {rewardsData.bankAccounts.length > 0 ? (
              rewardsData.bankAccounts.map((account) => (
                <div
                  key={account.id}
                  onClick={() => setSelectedAccount(account)}
                  className="p-5 bg-[#1E1E2E] rounded-2xl border border-white/5 flex items-center justify-between group hover:border-brand-primary/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#2D2D44] rounded-xl flex items-center justify-center text-gray-400">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">
                        {account.BankName}
                      </h4>
                      <p className="text-sm text-gray-500 font-mono tracking-wide">
                        •••• •••• •••• {account.AccountNumber.slice(-4)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${account.IsVerified ? "text-green-500 bg-green-500/10" : "text-yellow-500 bg-yellow-500/10"}`}
                  >
                    {account.IsVerified ? "Verified" : "Pending"}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl">
                <p className="text-gray-400 text-sm">
                  No bank account linked yet.
                </p>
              </div>
            )}

            {/* Withdraw Action (Mock) */}
            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-400">
                Minimum withdrawal amount is{" "}
                <span className="text-white font-bold">1,000 Points</span>.
              </p>
              {rewardsData.totalPoints >= 1000 ? (
                <Link
                  to="/rewards/withdraw"
                  className="px-6 py-3 rounded-xl font-bold transition-all w-full md:w-auto bg-brand-primary text-white hover:bg-brand-hover shadow-lg shadow-brand-primary/20"
                >
                  Withdraw Funds
                </Link>
              ) : (
                <button
                  disabled
                  className="px-6 py-3 rounded-xl font-bold transition-all w-full md:w-auto bg-white/5 text-gray-500 cursor-not-allowed"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Lock size={14} /> Withdraw Locked
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Account Details Modal */}
      {selectedAccount && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedAccount(null)}
        >
          <div
            className="bg-[#1E1E2E] rounded-3xl w-full max-w-lg shadow-2xl border border-white/10 relative overflow-hidden transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()} // Prevent close on modal click
          >
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={() => setSelectedAccount(null)}
                className="p-2 text-gray-400 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors backdrop-blur-md"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-0">
              <AccountCard
                account={selectedAccount}
                onDelete={() => {
                  handleDeleteAccount(selectedAccount.id);
                  setSelectedAccount(null);
                }}
                isModal={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const AccountCard = ({ account, onDelete, isModal = false }) => {
  const [showSensitive, setShowSensitive] = useState(false);

  return (
    <div
      className={`bg-[#1E1E2E] ${!isModal && "rounded-2xl border border-white/5"} p-8 relative overflow-hidden`}
    >
      <div className={`absolute top-0 right-0 p-6 ${isModal ? "pr-16" : ""}`}>
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${account.IsVerified ? "text-green-500 bg-green-500/10" : "text-yellow-500 bg-yellow-500/10"}`}
        >
          {account.IsVerified ? (
            <CheckCircle2 size={12} />
          ) : (
            <AlertCircle size={12} />
          )}
          {account.IsVerified ? "Verified" : "Pending"}
        </span>
      </div>

      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 bg-[#2D2D44] rounded-xl flex items-center justify-center text-brand-primary">
          <CreditCard size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">{account.BankName}</h3>
          <p className="text-sm text-gray-400">
            Added on {new Date(account.CreatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
            Account Holder
          </p>
          <p className="text-white font-medium">{account.AccountHolderName}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
            Account Number
          </p>
          <p className="text-white font-medium tracking-wide">
            {account.AccountNumber}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
            IFSC Code
          </p>
          <p className="text-white font-medium">{account.IFSCCode}</p>
        </div>

        <div className="col-span-1 md:col-span-2 pt-4 border-t border-white/5 mt-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">
              Razorpay Details
            </p>
            <button
              onClick={() => setShowSensitive(!showSensitive)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {showSensitive ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Contact ID</p>
              <p className="text-sm text-white font-mono bg-[#0f0f1a] p-2 rounded-lg border border-white/5">
                {showSensitive ? account.RazorpayContactID : "****************"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Fund Account ID</p>
              <p className="text-sm text-white font-mono bg-[#0f0f1a] p-2 rounded-lg border border-white/5">
                {showSensitive
                  ? account.RazorpayFundAccountID
                  : "***************"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
        <button
          onClick={onDelete}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-bold transition-colors px-4 py-2 hover:bg-red-400/10 rounded-lg"
        >
          <Trash2 size={16} />
          Remove Account
        </button>
      </div>
    </div>
  );
};
