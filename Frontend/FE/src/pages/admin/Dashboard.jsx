import StatCard from "../../components/admin/StatCard";
import { recentTrips, stats } from "../../utils/mockAdminData";

export default function Dashboard() {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <h1 className="admin-page__title">Dashboard</h1>
        <p className="admin-page__subtitle">Tổng quan hệ thống</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Vehicles" value={stats.totalVehicles} />
        <StatCard title="Total Drivers" value={stats.totalDrivers} />
        <StatCard title="Trips Today" value={stats.tripsToday} />
        <StatCard title="Pending Requests" value={stats.pendingTrips} />
      </div>

      <div className="admin-card">
        <div className="admin-card__header">Recent Trips</div>
        <div className="admin-card__content">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Trip</th>
                  <th>Driver</th>
                  <th>Vehicle</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTrips.map((t) => (
                  <tr key={t.id}>
                    <td>{t.route}</td>
                    <td>{t.driverName}</td>
                    <td>{t.vehiclePlate}</td>
                    <td>{t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
