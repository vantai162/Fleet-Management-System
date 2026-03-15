import { useState } from "react";
import DataTable from "../../components/admin/DataTable";
import { vehiclesSeed } from "../../utils/mockAdminData";

export default function Vehicles() {
  const [rows, setRows] = useState(vehiclesSeed);

  const columns = [
    { key: "id", header: "ID" },
    { key: "plate", header: "Plate" },
    { key: "type", header: "Type" },
    { key: "status", header: "Status" },
  ];

  const onAdd = () => {
    const id = `V${String(rows.length + 1).padStart(3, "0")}`;
    setRows([
      { id, plate: "NEW-PLATE", type: "Sedan", status: "AVAILABLE" },
      ...rows,
    ]);
  };

  const onEdit = (r) => {
    setRows(
      rows.map((x) =>
        x.id === r.id
          ? {
              ...x,
              status: x.status === "AVAILABLE" ? "MAINTENANCE" : "AVAILABLE",
            }
          : x
      )
    );
  };

  const onDelete = (r) => {
    setRows(rows.filter((x) => x.id !== r.id));
  };

  return (
    <DataTable
      title="Vehicles"
      columns={columns}
      rows={rows}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}
