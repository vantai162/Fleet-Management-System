import { useState } from "react";
import DataTable from "../../components/admin/DataTable";
import { tripsSeed } from "../../utils/mockAdminData";

export default function Trips() {
  const [rows, setRows] = useState(tripsSeed);

  const columns = [
    { key: "id", header: "ID" },
    { key: "from", header: "From" },
    { key: "to", header: "To" },
    { key: "driver", header: "Driver" },
    { key: "vehicle", header: "Vehicle" },
    { key: "status", header: "Status" },
  ];

  const onAdd = () => {
    const id = `T${String(rows.length + 100).padStart(3, "0")}`;
    setRows([
      {
        id,
        from: "UIT",
        to: "Q1",
        driver: "New",
        vehicle: "NEW",
        status: "PENDING",
      },
      ...rows,
    ]);
  };

  const onEdit = (r) => {
    setRows(
      rows.map((x) =>
        x.id === r.id
          ? { ...x, status: x.status === "PENDING" ? "DONE" : "PENDING" }
          : x
      )
    );
  };

  const onDelete = (r) => setRows(rows.filter((x) => x.id !== r.id));

  return (
    <DataTable
      title="Trips"
      columns={columns}
      rows={rows}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}
