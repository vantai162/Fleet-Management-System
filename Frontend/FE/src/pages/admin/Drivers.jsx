import { useState } from "react";
import DataTable from "../../components/admin/DataTable";
import { driversSeed } from "../../utils/mockAdminData";

export default function Drivers() {
  const [rows, setRows] = useState(driversSeed);

  const columns = [
    { key: "id", header: "ID" },
    { key: "name", header: "Name" },
    { key: "phone", header: "Phone" },
    { key: "status", header: "Status" },
  ];

  const onAdd = () => {
    const id = `D${String(rows.length + 1).padStart(3, "0")}`;
    setRows([
      { id, name: "New Driver", phone: "09xxxxxxxx", status: "ACTIVE" },
      ...rows,
    ]);
  };

  const onEdit = (r) => {
    setRows(
      rows.map((x) =>
        x.id === r.id
          ? { ...x, status: x.status === "ACTIVE" ? "OFF" : "ACTIVE" }
          : x
      )
    );
  };

  const onDelete = (r) => setRows(rows.filter((x) => x.id !== r.id));

  return (
    <DataTable
      title="Drivers"
      columns={columns}
      rows={rows}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}
