import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Landing from "./pages/Landing";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import SelectInterests from "./pages/SelectInterests";
import UserProfile from "./pages/UserProfile";
import Rewards from "./pages/Rewards";
import WalletIntro from "./pages/WalletIntro";
import AddAccount from "./pages/AddAccount";
import Withdraw from "./pages/Withdraw";
import WithdrawalsHistory from "./pages/WithdrawalsHistory";

// Admin Imports
import AdminLayout from "./admin/layouts/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import UserManagement from "./admin/pages/Users";
import PostModeration from "./admin/pages/Posts";
import Accounts from "./admin/pages/Accounts";
import Reports from "./admin/pages/Reports";

function App() {

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/edit-profile" element={<EditProfile />} />
      <Route path="/select-interests" element={<SelectInterests />} />
      <Route path="/rewards" element={<Rewards />} />
      <Route path="/wallet-intro" element={<WalletIntro />} />
      <Route path="/rewards/add-account" element={<AddAccount />} />
      <Route path="/rewards/withdraw" element={<Withdraw />} />
      <Route path="/rewards/withdrawals-history" element={<WithdrawalsHistory />} />

      <Route path="/user/:userId" element={<UserProfile />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="posts" element={<PostModeration />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}

export default App;
