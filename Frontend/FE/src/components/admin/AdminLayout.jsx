import { NavLink, Outlet } from "react-router-dom";

const nav = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/vehicles", label: "Vehicle" },
  { to: "/admin/drivers", label: "Driver" },
  { to: "/admin/trips", label: "Trip" },
  { to: "/admin/accounts", label: "Account" },
];

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">Admin Panel</div>
        <nav className="admin-nav">
          {nav.map((i) => (
            <NavLink
              key={i.to}
              to={i.to}
              className={({ isActive }) =>
                `admin-nav__link ${isActive ? "is-active" : ""}`
              }
            >
              {i.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="admin-main">
        <div className="admin-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
