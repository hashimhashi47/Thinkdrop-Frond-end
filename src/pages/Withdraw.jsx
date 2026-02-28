import React, { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import {
  Coins,
  ChevronLeft,
  ArrowRight,
  CreditCard,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { userService } from "../services/userService";

export default function Withdraw() {
  const navigate = useNavigate();

  // Real Data States
  const [availableBalance, setAvailableBalance] = useState(0);
  const [minWithdrawal] = useState(1000); // Usually static or from settings
  const [amount, setAmount] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRewardsData = async () => {
      try {
        const data = await userService.getRewards();

        // FIX: Use 'totalPoints' instead of 'points' 
        // because that is what your return statement above defines.
        setAvailableBalance(data.totalPoints || 0);

        // FIX: Use 'bankAccounts' (lowercase 'b')
        setLinkedAccounts(data.bankAccounts || []);

        if (data.bankAccounts && data.bankAccounts.length > 0) {
          // Use 'id' (lowercase) as mapped in your service return
          setSelectedAccount(data.bankAccounts[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch rewards data", error);
        setError("Could not load your balance details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRewardsData();
  }, []);
  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError("");

    // 1. Validation Logic
    const pointsToWithdraw = parseInt(amount);
    if (!pointsToWithdraw || pointsToWithdraw < minWithdrawal) {
      setError(`Minimum withdrawal amount is ${minWithdrawal} points.`);
      return;
    }

    // 2. Loading State
    setLoading(true);
    try {
      // Match the payload to what your Go backend expects
      await userService.withdrawFunds({
        points: pointsToWithdraw,
        bank_account_id: selectedAccount, // Passing the specific ID helps the backend avoid "Record Not Found"
      });

      toast.success("Withdrawal initiated successfully!");
      navigate("/rewards");
    } catch (error) {
      // Check if the backend sent a specific error message
      const message =
        error.response?.data?.error || "Failed to process withdrawal.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1E1E2E] pb-20">
      <Navbar />

      <main className="max-w-2xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <Link
            to="/rewards"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} className="mr-1" />
            Back to Rewards
          </Link>
          <Link
            to="/rewards/withdrawals-history"
            className="text-sm text-brand-primary hover:text-brand-primary/80 font-medium"
          >
            View History
          </Link>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-3xl p-8 border border-yellow-500/20 mb-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Coins size={120} className="text-yellow-500" />
          </div>
          <p className="text-yellow-500 font-bold uppercase tracking-wider text-sm mb-2">
            Available Balance
          </p>
          <h1 className="text-5xl font-extrabold text-white mb-2">
            {availableBalance.toLocaleString()}{" "}
            <span className="text-2xl text-yellow-500">Pts</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium">
            ≈ ₹{(availableBalance * 0.01).toLocaleString()} (1 Pt = ₹0.01)
          </p>
        </div>

        <div className="bg-[#2D2D44] rounded-3xl p-8 border border-white/5 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">Withdraw Funds</h2>

          <form onSubmit={handleWithdraw} className="space-y-8">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3">
                Amount to withdraw
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-[#1E1E2E] border border-white/10 rounded-2xl px-4 py-4 text-3xl font-bold text-white placeholder-gray-600 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all text-center"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold px-3 py-1 bg-white/5 rounded-lg">
                  PTS
                </div>
              </div>
              {error && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                  <AlertTriangle size={14} /> {error}
                </p>
              )}
            </div>

            {/* Account Selection */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-bold text-gray-300">
                  Select Bank Account
                </label>
              </div>

              <div className="space-y-3">
                {linkedAccounts.map((account) => (
                  <div
                    key={account.id}
                    onClick={() => setSelectedAccount(account.id)}
                    className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${selectedAccount === account.id
                      ? "bg-brand-primary/10 border-brand-primary"
                      : "bg-[#1E1E2E] border-white/10 hover:border-white/20"
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-[#2D2D44] rounded-lg text-white">
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          {/* FIX: Use 'BankName' (Capital B) as mapped in service */}
                          {account.BankName}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {/* FIX: Use AccountNumber.slice(-4) since 'last4' isn't in your object */}
                          •••• {account.AccountNumber?.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedAccount === account.id
                        ? "border-brand-primary"
                        : "border-gray-500"
                        }`}
                    >
                      {selectedAccount === account.id && (
                        <div className="w-2.5 h-2.5 bg-brand-primary rounded-full" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Withdraw Button */}
            <button
              type="submit"
              disabled={loading || availableBalance < minWithdrawal}
              className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${loading || availableBalance < minWithdrawal
                ? "bg-white/5 text-gray-500 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 text-white shadow-green-500/25"
                }`}
            >
              {loading ? (
                "Processing Payout..."
              ) : availableBalance < minWithdrawal ? (
                <>
                  <Lock size={18} /> Minimum {minWithdrawal} Pts Required
                </>
              ) : (
                <>
                  Process Withdrawal <ArrowRight size={20} />
                </>
              )}
            </button>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Protected by{" "}
                <span className="text-blue-400 font-bold">Razorpay</span>{" "}
                Payouts securely.
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
