import { useMemo, useState } from "react";

export default function DataTable({
  title,
  columns,
  rows,
  onAdd,
  onEdit,
  onDelete,
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const s = q.toLowerCase();
    return rows.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(s))
    );
  }, [q, rows]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="admin-toolbar">
        <div>
          <h1 className="admin-page__title">{title}</h1>
          <p className="admin-page__subtitle">
            Quản lý {title.toLowerCase()}
          </p>
        </div>

        <div className="admin-toolbar__right">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search..."
            className="admin-input"
          />
          <button type="button" onClick={onAdd} className="admin-button">
            Add
          </button>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key}>{c.header}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                {columns.map((c) => (
                  <td key={c.key}>{r[c.key]}</td>
                ))}
                <td>
                  <div className="admin-actions">
                    <button
                      type="button"
                      onClick={() => onEdit(r)}
                      className="admin-button admin-button--outline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(r)}
                      className="admin-button admin-button--destructive"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  style={{
                    padding: 24,
                    textAlign: "center",
                    color: "var(--muted-foreground, #64748b)",
                  }}
                >
                  No data
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
