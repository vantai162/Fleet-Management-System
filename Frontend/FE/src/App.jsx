import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/Login.jsx";
import DashboardPage from "./pages/Dashboard.jsx";
import Account from "./pages/Account.jsx";
import Home from "./pages/Home.jsx";
import Vehicles from "./pages/Vehicles.jsx";
import Drivers from "./pages/Drivers.jsx";
import TripManagement from "./pages/TripManagement.jsx";
import Maintenance from "./pages/Maintenance.jsx";
import Users from "./pages/Users.jsx";
import AdminGuard from "./routes/AdminGuard.jsx";
import AdminLayout from "./components/admin/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminVehicles from "./pages/admin/Vehicles.jsx";
import AdminDrivers from "./pages/admin/Drivers.jsx";
import AdminTrips from "./pages/admin/Trips.jsx";
import AdminAccountManagement from "./pages/admin/AccountManagement.jsx";
import userAPI from "./services/userAPI";
import "./App.css";

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem("fms.currentUser");
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem("fms.currentUser", JSON.stringify(currentUser));
      } else {
        localStorage.removeItem("fms.currentUser");
      }
    } catch (error) {
      // ignore storage errors (private mode, quota, etc.)
    }
  }, [currentUser]);

  const resolveUserId = (user) =>
    user?.userID ?? user?.UserID ?? user?.id ?? user?.userId ?? null;

  const buildProfilePayload = (updates) => ({
    fullName: updates.fullName,
    email: updates.email,
    phone: updates.phone,
    role: updates.role,
    department: updates.department,
    avatar: updates.avatar,
    birthPlace: updates.birthPlace,
    birthDate: updates.birthDate,
    BirthPlace: updates.birthPlace,
    BirthDate: updates.birthDate,
  });

  const handleUpdateUser = async (updates) => {
    const userId = resolveUserId(currentUser);
    if (!userId) {
      throw new Error("Missing user id.");
    }

    const payload = buildProfilePayload(updates);
    await userAPI.updateUser(userId, payload);
    const refreshedUser = await userAPI.getUserById(userId);
    setCurrentUser((prev) => ({ ...prev, ...refreshedUser }));
    return refreshedUser;
  };

  if (!currentUser) {
    return <LoginPage onLogin={(user) => setCurrentUser(user)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminGuard user={currentUser} />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="vehicles" element={<AdminVehicles />} />
            <Route path="drivers" element={<AdminDrivers />} />
            <Route path="trips" element={<AdminTrips />} />
            <Route path="accounts" element={<AdminAccountManagement />} />
          </Route>
        </Route>

        {/* Dashboard layout */}
        <Route
          path="/"
          element={
            <DashboardPage
              currentUser={currentUser}
              onLogout={() => {
                localStorage.removeItem("token");
                setCurrentUser(null);
              }}
              onUpdateUser={handleUpdateUser}
            />
          }
        >
          {/* Trang chủ (Home) */}
          <Route index element={<Home />} />

          {/* Vehicles page */}
          <Route path="vehicles" element={<Vehicles />} />

          {/* Drivers page */}
          <Route path="drivers" element={<Drivers />} />

          {/* Trip Management */}
          <Route path="trips" element={<TripManagement />} />

          {/* Maintenance */}
          <Route path="maintenance" element={<Maintenance />} />

          {/* Users Management */}
          <Route path="users" element={<Users />} />

          {/* GPS Tracking (removed) */}

          {/* Account page */}
          <Route
            path="account"
            element={
              <Account
                currentUser={currentUser}
                onUpdateUser={handleUpdateUser}
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;




