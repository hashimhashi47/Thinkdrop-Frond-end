import React, { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import { ArrowLeft, Save, Check, RefreshCw, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { userService } from "../services/userService";

export default function EditProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [avatars, setAvatars] = useState([])


  // Using keys that match your Backend Go Struct
  const [formData, setFormData] = useState({
    anonymous_name: "",
    image_url: "",
    bio: "",
  });

  // 1. Fetch Current Profile and Avatar Presets
  useEffect(() => {
    const initializeData = async () => {
      try {
        setFetching(true);
        // Get current profile data to fill the form
        const profile = await userService.getProfile();
        if (profile) {
          setFormData({
            anonymous_name: profile.name || "",
            image_url: profile.avatar || "",
            bio: profile.bio || "",
          });
        }

        // Get preset options
        const presets = await userService.getAvatarPresets();
        setAvatars(presets);
      } catch (error) {
        console.error("Initialization failed", error);
      } finally {
        setFetching(false);
      }
    };

    initializeData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarSelect = (url) => {
    setFormData({ ...formData, image_url: url });
  };

  const generateRandomAvatar = async (type) => {
    setGenerating(true);
    try {
      const response = await fetch(`https://nekos.best/api/v2/${type}`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        // nekos.best returns an array of results with a 'url' property
        setFormData((prev) => ({ ...prev, image_url: data.results[0].url }));
      }
    } catch (error) {
      console.error("Failed to generate avatar:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send mapping: { anonymous_name, image_url, bio }
      await userService.updateUserProfile({
        name: formData.anonymous_name,
        avatar: formData.image_url,
        bio: formData.bio,
      });
      navigate("/profile");
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Update failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="min-h-screen bg-[#1E1E2E] flex items-center justify-center">
        <RefreshCw className="animate-spin text-brand-primary" size={32} />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#1E1E2E]">
      <Navbar />

      <main className="max-w-3xl mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/profile"
            className="p-2 bg-[#2D2D44] rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
        </div>

        <div className="bg-[#2D2D44] rounded-3xl p-8 border border-white/5 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Avatar Section */}
            <div className="space-y-4">
              <h3 className="font-bold text-white text-lg border-b border-white/5 pb-2">
                Choose an Avatar
              </h3>
              <div className="flex flex-col sm:row gap-6 items-center sm:items-center">
                <div className="h-24 w-24 rounded-full bg-[#1E1E2E] border-4 border-brand-primary overflow-hidden shadow-lg shrink-0">
                  <img
                    src={
                      formData.image_url ||
                      "https://api.dicebear.com/7.x/lorelei/svg?seed=Default"
                    }
                    alt="Selected Avatar"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => generateRandomAvatar("husbando")}
                    className="px-4 py-2 bg-[#1E1E2E] hover:bg-white/5 border border-white/10 rounded-xl text-xs text-gray-300 flex items-center gap-2"
                  >
                    <RefreshCw
                      size={14}
                      className={generating ? "animate-spin" : ""}
                    />{" "}
                    Generate Male
                  </button>
                  <button
                    type="button"
                    onClick={() => generateRandomAvatar("neko")}
                    className="px-4 py-2 bg-[#1E1E2E] hover:bg-white/5 border border-white/10 rounded-xl text-xs text-gray-300 flex items-center gap-2"
                  >
                    <RefreshCw
                      size={14}
                      className={generating ? "animate-spin" : ""}
                    />{" "}
                    Generate Female
                  </button>
                </div>
              </div>

              {/* Preset Selection Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {Array.isArray(avatars) && avatars.map((url, index) => (
                  <div
                    key={index}
                    onClick={() => handleAvatarSelect(url)}
                    className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${formData.image_url === url
                      ? "border-brand-primary"
                      : "border-transparent opacity-60"
                      }`}
                  >
                    <img
                      src={url}
                      className="h-full w-full object-cover"
                      alt="preset"
                    />
                    {formData.image_url === url && (
                      <div className="absolute inset-0 bg-brand-primary/20 flex items-center justify-center">
                        <Check size={16} className="text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Text Fields */}
            <div className="grid grid-cols-1 gap-6 pt-6 border-t border-white/5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Anonymous Name
                </label>
                <input
                  name="anonymous_name"
                  value={formData.anonymous_name}
                  onChange={handleChange}
                  placeholder="Enter unique name..."
                  className="w-full bg-[#1E1E2E] border border-white/5 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-primary/50 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Bio
                </label>
                <textarea
                  name="bio"
                  rows="3"
                  value={formData.bio}
                  onChange={handleChange}
                  maxLength={160}
                  placeholder="Tell us about yourself..."
                  className="w-full bg-[#1E1E2E] border border-white/5 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-brand-primary/50 outline-none resize-none"
                />
                <p
                  className={`text-[10px] text-right ${formData.bio.length >= 160 ? "text-rose-500" : "text-gray-600"}`}
                >
                  {formData.bio.length}/160
                </p>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex gap-4 pt-4 border-t border-white/5">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-brand-primary hover:bg-brand-hover text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="px-8 bg-[#1E1E2E] text-gray-400 py-3 rounded-xl font-bold hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
