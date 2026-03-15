import React, { useEffect, useMemo, useState } from "react";
import {
  FaCalendarAlt,
  FaExclamationTriangle,
  FaGasPump,
  FaRoute,
  FaSignOutAlt,
  FaThLarge,
  FaTools,
  FaTruck,
  FaTruckMoving,
  FaUserAlt,
  FaUserCircle,
  FaUserFriends,
} from "react-icons/fa";
import "./Dashboard.css";
import Account from "./Account";
import Home from "./Home";
import Vehicles from "./Vehicles";
import Drivers from "./Drivers";
import TripManagement from "./TripManagement";
import DriverAssignment from "./DriverAssignment";
import Bookings from "./Bookings";
import Emergency from "./Emergency";
import Maintenance from "./Maintenance";
import Users from "./Users";
import FuelManagement from "./FuelManagement";

const ROLE_LABELS = {
  admin: "Quản trị",
  staff: "Quản lý",
  driver: "Tài xế",
};

const ROLE_BADGE_CLASSES = {
  admin: "role-admin",
  staff: "role-staff",
  driver: "role-driver",
};

const MENU_ITEMS = [
  {
    key: "home",
    label: "Tổng quan",
    icon: <FaThLarge />,
    roles: ["admin", "staff", "driver"],
  },
  {
    key: "vehicles",
    label: "Quản lý phương tiện",
    icon: <FaTruckMoving />,
    roles: ["admin", "staff"],
  },
  {
    key: "drivers",
    label: "Quản lý tài xế",
    icon: <FaUserAlt />,
    roles: ["admin", "staff"],
  },
  {
    key: "trips",
    label: "Quản lý chuyến đi",
    icon: <FaRoute />,
    roles: ["admin", "staff", "driver"],
  },
  {
    key: "bookings",
    label: "Lịch đặt trước",
    icon: <FaCalendarAlt />,
    roles: ["admin", "staff"],
  },
  {
    key: "assignments",
    label: "Phân công tài xế",
    icon: <FaUserFriends />,
    roles: ["admin", "staff"],
  },
  {
    key: "emergency",
    label: "Báo cáo khẩn cấp",
    icon: <FaExclamationTriangle />,
    roles: ["admin", "staff", "driver"],
  },
  {
    key: "maintenance",
    label: "Bảo trì & Sửa chữa",
    icon: <FaTools />,
    roles: ["admin", "staff"],
  },
  {
    key: "fuel-management",
    label: "Nhiên liệu",
    icon: <FaGasPump />,
    roles: ["admin", "staff", "driver"],
  },
  {
    key: "account-management",
    label: "Quản lý tài khoản",
    icon: <FaUserCircle />,
    roles: ["admin"],
  },
];

export default function Dashboard({ currentUser, onLogout, onUpdateUser }) {
  const role = currentUser?.role || "admin";
  const [activeMenu, setActiveMenu] = useState("home");

  const menuItems = useMemo(
    () => MENU_ITEMS.filter((item) => item.roles.includes(role)),
    [role]
  );

  useEffect(() => {
    if (!menuItems.length) {
      return;
    }
    // Allow "account" page even if not in menu
    if (activeMenu === "account") {
      return;
    }
    const isAllowed = menuItems.some((item) => item.key === activeMenu);
    if (!isAllowed) {
      setActiveMenu(menuItems[0].key);
    }
  }, [activeMenu, menuItems]);

  const getNavItemClass = (key) =>
    "dashboard-nav-item" + (activeMenu === key ? " is-active" : "");

  const initials = useMemo(() => {
    if (!currentUser?.fullName) return "U";
    const parts = currentUser.fullName.trim().split(/\s+/);
    return parts[0].slice(0, 1).toUpperCase();
  }, [currentUser]);

  const contentMap = {
    home: <Home currentUser={currentUser} />,
    vehicles: <Vehicles />,
    drivers: <Drivers />,
    trips: <TripManagement />,
    assignments: <DriverAssignment />,
    bookings: <Bookings />,
    emergency: <Emergency />,
    maintenance: <Maintenance />,
    "fuel-management": <FuelManagement />,
    account: <Account currentUser={currentUser} onUpdateUser={onUpdateUser} />,
    "account-management": <Users />,
  };

  return (
    <div className="dashboard-root">
      <aside className="dashboard-sidebar">
        <div className="dashboard-logo">
          <div className="dashboard-logo-icon">
            <FaTruck />
          </div>
          <div className="dashboard-logo-text">
            <span className="dashboard-logo-title">FMS</span>
            <span className="dashboard-logo-subtitle">
              Hệ thống quản lý đội xe
            </span>
          </div>
        </div>

        <nav className="dashboard-nav">
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={getNavItemClass(item.key)}
              onClick={() => setActiveMenu(item.key)}
            >
              <span className="dashboard-nav-icon">{item.icon}</span>
              <span className="dashboard-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="dashboard-sidebar-footer">
          <div className="dashboard-user">
            <div className="dashboard-user-avatar">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt="Avatar"
                  className="dashboard-user-avatar-img"
                />
              ) : (
                <img
                  src="/default_avt.jpg"
                  alt="Default Avatar"
                  className="dashboard-user-avatar-img"
                />
              )}
            </div>
            <div className="dashboard-user-info">
              <span className="dashboard-user-name">
                {currentUser?.fullName || "Người dùng"}
              </span>
              <span
                className={`role-badge ${
                  ROLE_BADGE_CLASSES[role] || "role-staff"
                }`}
              >
                {ROLE_LABELS[role] || "Người dùng"}
              </span>
              <button
                className="dashboard-profile-link"
                onClick={() => setActiveMenu("account")}
              >
                Thông tin hồ sơ
              </button>
            </div>
            <button className="dashboard-logout" onClick={onLogout}>
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </aside>

      <main className="dashboard-main">
        {contentMap[activeMenu] || (
          <div className="dashboard-empty-state">
            <h2>Chọn menu để bắt đầu</h2>
          </div>
        )}
      </main>
    </div>
  );
}
