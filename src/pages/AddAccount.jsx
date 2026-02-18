import React, { useState } from "react";
import Navbar from "../components/layout/Navbar";
import {
  CreditCard,
  Landmark,
  ChevronLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { userService } from "../services/userService";

export default function AddAccount() {
  const navigate = useNavigate();

  // 1. Keep these keys consistent with your handleChange logic
  const [formData, setFormData] = useState({
    accountName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.accountName.trim())
      newErrors.accountName = "Account holder Name is required";
    if (!formData.accountNumber.trim())
      newErrors.accountNumber = "Account Number is required";
    if (formData.accountNumber !== formData.confirmAccountNumber)
      newErrors.confirmAccountNumber = "Account Numbers do not match";
    if (!formData.ifscCode.trim()) {
      newErrors.ifscCode = "IFSC Code is required";
    } else if (
      !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.toUpperCase())
    ) {
      newErrors.ifscCode = "Invalid IFSC Code format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Inside AddAccount.jsx

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // 1. Local Validation (Matching your Go Struct requirements)
    if (!validate()) return;

    setLoading(true);
    setErrors({}); // Clear previous errors

    try {
      // 2. Prepare Payload (Strictly matching your Go json tags)
      const servicePayload = {
        accountHolderName: formData.accountName.replace(/\s/g, ""), // Removing spaces to satisfy alphaunicode
        ifscCode: formData.ifscCode.trim().toUpperCase(),
        accountNumber: formData.accountNumber.trim(),
        reAccountNumber: formData.confirmAccountNumber.trim(),
      };

      // 3. Call the Service
      const result = await userService.addBankAccount(servicePayload);

      // 4. Handle Success
      if (result.success) {
        // Navigate back to the rewards page on success
        navigate("/rewards");
      } else {
        setErrors({ form: "Failed to link account. Please try again." });
      }
    } catch (err) {
      // 5. Catch Backend 400 Errors (Validation failures)
      console.error("Submission failed:", err);

      // Extract the error message sent by your Go backend
      const errorMessage =
        err.response?.data?.Error?.error ||
        err.message ||
        "Failed to add account";
      setErrors({ form: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1E1E2E] pb-20">
      <Navbar />

      <main className="max-w-2xl mx-auto py-8 px-4">
        <Link
          to="/rewards"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft size={20} className="mr-1" />
          Back to Rewards
        </Link>

        <div className="bg-[#2D2D44] rounded-3xl p-8 border border-white/5 shadow-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary">
              <Landmark size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Add Bank Account
              </h1>
              <p className="text-gray-400 text-sm">
                Link your bank account to receive withdrawals.
              </p>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-8 flex items-start gap-3">
            <ShieldCheck
              className="text-blue-400 flex-shrink-0 mt-0.5"
              size={20}
            />
            <div>
              <p className="text-blue-200 text-sm font-medium mb-1">
                Secure Connection
              </p>
              <p className="text-blue-300/80 text-xs">
                Your banking details are encrypted and stored securely. We only
                use this for payouts via Razorpay.
              </p>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Account Holder Name
              </label>
              <input
                type="text"
                name="accountName"
                value={formData.accountName}
                onChange={handleChange}
                placeholder="Enter name as per bank records"
                className={`w-full bg-[#1E1E2E] border ${errors.accountName ? "border-red-500" : "border-white/10"} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-all`}
              />
              {errors.accountName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.accountName}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="Enter account number"
                  className={`w-full bg-[#1E1E2E] border ${errors.accountNumber ? "border-red-500" : "border-white/10"} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-all`}
                />
                {errors.accountNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.accountNumber}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  IFSC Code
                </label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={(e) =>
                    handleChange({
                      target: {
                        name: "ifscCode",
                        value: e.target.value.toUpperCase(),
                      },
                    })
                  }
                  placeholder="ABCD0123456"
                  maxLength={11}
                  className={`w-full bg-[#1E1E2E] border ${errors.ifscCode ? "border-red-500" : "border-white/10"} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-all uppercase`}
                />
                {errors.ifscCode && (
                  <p className="text-red-500 text-xs mt-1">{errors.ifscCode}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Confirm Account Number
              </label>
              <input
                type="password"
                name="confirmAccountNumber"
                value={formData.confirmAccountNumber}
                onChange={handleChange}
                placeholder="Re-enter account number"
                className={`w-full bg-[#1E1E2E] border ${errors.confirmAccountNumber ? "border-red-500" : "border-white/10"} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-all`}
              />
              {errors.confirmAccountNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmAccountNumber}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary hover:bg-brand-hover text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  <CheckCircle2 size={20} /> Verify & Save Account
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
