import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ExcelJS from "exceljs";
import { Buffer } from "buffer";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Pencil, Trash2, FileSpreadsheet, FileText, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import api from "../lib/api.js";
import { Card } from "../components/ui/card.jsx";
import { Input } from "../components/ui/input.jsx";
import { Select } from "../components/ui/select.jsx";
import { Button } from "../components/ui/button.jsx";
import { Modal } from "../components/ui/modal.jsx";
import { Toast } from "../components/ui/toast.jsx";
import { useAuth } from "../context/AuthContext.jsx";

window.Buffer = window.Buffer || Buffer;

const years = Array.from({ length: 16 }, (_, i) => 2020 + i);

export default function EntryList() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [locations, setLocations] = useState({ districts: [], ds_offices: [] });
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    district: "",
    ds_office: "",
    year: "",
    grade: "",
    user: ""
  });
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [editing, setEditing] = useState(null);
  const [exportError, setExportError] = useState("");
  const [toast, setToast] = useState(null);
  useEffect(() => {
    api.get("/meta/locations").then(({ data }) => setLocations(data));
    if (user?.role === "admin") {
      api.get("/users").then(({ data }) => setUsers(data));
    }
  }, [user]);

  const dsOptions = useMemo(
    () => locations.ds_offices.filter((d) => String(d.district_id) === String(filters.district)),
    [locations, filters.district]
  );

  const editDsOptions = useMemo(
    () => locations.ds_offices.filter((d) => String(d.district_id) === String(editing?.district_id)),
    [locations, editing]
  );

  const load = async () => {
    // Build clean params with only non-empty filter values
    const cleanParams = {
      sort_by: sortBy,
      sort_dir: sortDir,
      page,
      limit
    };

    // Only add filter values if they're not empty strings
    if (filters.search) cleanParams.search = filters.search;
    if (filters.district) cleanParams.district = filters.district;
    if (filters.ds_office) cleanParams.ds_office = filters.ds_office;
    if (filters.year) cleanParams.year = filters.year;
    if (filters.grade) cleanParams.grade = filters.grade;
    if (filters.user) cleanParams.user = filters.user;

    const { data } = await api.get("/grades", {
      params: cleanParams
    });
    setData(data.data);
    setTotal(data.total);
  };

  useEffect(() => {
    load();
  }, [filters, sortBy, sortDir, page]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const openEdit = (row) => setEditing({ ...row });

  const resetAllFilters = () => {
    setFilters({
      search: "",
      district: "",
      ds_office: "",
      year: "",
      grade: "",
      user: ""
    });
    setSortBy("created_at");
    setSortDir("desc");
    setPage(1);
  };

  const saveEdit = async () => {
    try {
      await api.put(`/grades/${editing.id}`, {
        year: editing.year,
        score: editing.score,
        club_name: editing.club_name,
        address: editing.address,
        district_id: editing.district_id,
        ds_id: editing.ds_id,
        gn_division: editing.gn_division
      });
      setEditing(null);
      await load();
      setToast({ message: "Entry updated successfully", type: "success" });
    } catch (err) {
      setToast({ message: "Error updating entry: " + (err.response?.data?.message || err.message), type: "error" });
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/grades/${id}`);
      await load();
      setToast({ message: "Entry deleted successfully", type: "success" });
    } catch (err) {
      setToast({ message: "Error deleting entry: " + (err.response?.data?.message || err.message), type: "error" });
    }
  };

  const fetchAll = async () => {
    // Build clean params object with only non-empty values
    const cleanParams = {
      sort_by: sortBy,
      sort_dir: sortDir,
      page: 1,
      limit: 10000
    };

    // Only add filter values if they're not empty strings
    if (filters.search) cleanParams.search = filters.search;
    if (filters.district) cleanParams.district = filters.district;
    if (filters.ds_office) cleanParams.ds_office = filters.ds_office;
    if (filters.year) cleanParams.year = filters.year;
    if (filters.grade) cleanParams.grade = filters.grade;
    if (filters.user) cleanParams.user = filters.user;

    const { data } = await api.get("/grades", {
      params: cleanParams
    });
    return data.data;
  };

  const exportExcel = async () => {
    setExportError("");
    try {
      const rows = await fetchAll();
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Entries");
      sheet.columns = [
        { header: "Club", key: "club_name" },
        { header: "District", key: "district_name" },
        { header: "DS Office", key: "ds_name" },
        { header: "Year", key: "year" },
        { header: "Score", key: "score" },
        { header: "Grade", key: "grade" },
        { header: "User", key: "created_by_name" }
      ];
      rows.forEach((r) => sheet.addRow(r));
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "club-entries.xlsx");
      setToast({ message: "Excel exported successfully", type: "success" });
    } catch (err) {
      const errorMsg = "Export failed: " + (err.response?.data?.message || err.message);
      setExportError(errorMsg);
      setToast({ message: errorMsg, type: "error" });
    }
  };

  const exportPdf = async () => {
    setExportError("");
    try {
      const rows = await fetchAll();
      const doc = new jsPDF();
      doc.text("Club Entries", 14, 16);
      const tableBody = rows.map((r) => [r.club_name, r.district_name, r.ds_name, r.year, r.score, r.grade, r.created_by_name]);
      doc.autoTable({
        head: [["Club", "District", "DS", "Year", "Score", "Grade", "User"]],
        body: tableBody,
        startY: 22
      });
      doc.save("club-entries.pdf");
      setToast({ message: "PDF exported successfully", type: "success" });
    } catch (err) {
      const errorMsg = "Export failed: " + (err.response?.data?.message || err.message);
      setExportError(errorMsg);
      setToast({ message: errorMsg, type: "error" });
    }
  };

  return (
    <div className="p-8">
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-end gap-3 mb-4">
          <Input placeholder={t("search")} value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          <Select value={filters.district} onChange={(e) => setFilters({ ...filters, district: e.target.value, ds_office: "" })}>
            <option value="">{t("district")}</option>
            {locations.districts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </Select>
          <Select value={filters.ds_office} onChange={(e) => setFilters({ ...filters, ds_office: e.target.value })}>
            <option value="">{t("ds_office")}</option>
            {dsOptions.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </Select>
          <Select value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })}>
            <option value="">{t("year")}</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </Select>
          <Select value={filters.grade} onChange={(e) => setFilters({ ...filters, grade: e.target.value })}>
            <option value="">{t("grade")}</option>
            {"ABCDE".split("").map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </Select>
          {user?.role === "admin" && (
            <Select value={filters.user} onChange={(e) => setFilters({ ...filters, user: e.target.value })}>
              <option value="">User</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </Select>
          )}
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="created_at">Created</option>
            <option value="year">Year</option>
            <option value="score">Score</option>
            <option value="club_name">Club</option>
          </Select>
          <Select value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </Select>
          <button className="icon-btn" onClick={resetAllFilters} title="Refresh">
            <RefreshCw size={16} />
          </button>
          <Button onClick={exportExcel} className="gap-2">
            <FileSpreadsheet size={16} /> Excel
          </Button>
          <Button onClick={exportPdf} className="gap-2">
            <FileText size={16} /> PDF
          </Button>
        </div>
        {exportError && <div className="text-sm text-red-500 mb-2">{exportError}</div>}
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-base">
                <th className="py-2">Club</th>
                <th>District</th>
                <th>DS</th>
                <th>Year</th>
                <th>Score</th>
                <th>Grade</th>
                <th>User</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-b border-base">
                  <td className="py-2">{row.club_name}</td>
                  <td>{row.district_name}</td>
                  <td>{row.ds_name}</td>
                  <td>{row.year}</td>
                  <td>{row.score}</td>
                  <td>{row.grade}</td>
                  <td>{row.created_by_name}</td>
                  <td className="flex gap-2 py-2">
                    {(user?.role === "admin" || user?.id === row.created_by) && (
                      <>
                        <button className="icon-btn" onClick={() => openEdit(row)} title="Edit">
                          <Pencil size={16} className="text-emerald-600" />
                        </button>
                        <button className="icon-btn" onClick={() => remove(row.id)} title="Delete">
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div>Page {page} / {totalPages}</div>
          <div className="flex gap-2">
            <Button onClick={() => setPage(Math.max(1, page - 1))} className="gap-1">
              <ChevronLeft size={16} /> Prev
            </Button>
            <Button onClick={() => setPage(Math.min(totalPages, page + 1))} className="gap-1">
              Next <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </Card>

      <Modal open={!!editing} title="Edit Entry" onClose={() => setEditing(null)}>
        {editing && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input value={editing.club_name} onChange={(e) => setEditing({ ...editing, club_name: e.target.value })} placeholder="Club Name" />
            <Input value={editing.address} onChange={(e) => setEditing({ ...editing, address: e.target.value })} placeholder="Address" />
            <Select value={editing.district_id} onChange={(e) => setEditing({ ...editing, district_id: e.target.value, ds_id: "" })}>
              <option value="">District</option>
              {locations.districts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
            <Select value={editing.ds_id} onChange={(e) => setEditing({ ...editing, ds_id: e.target.value })}>
              <option value="">DS Office</option>
              {editDsOptions.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
            <Input value={editing.gn_division} onChange={(e) => setEditing({ ...editing, gn_division: e.target.value })} placeholder="GN Division" />
            <Select value={editing.year} onChange={(e) => setEditing({ ...editing, year: e.target.value })}>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </Select>
            <Input type="number" min="0" max="100" step="0.01" value={editing.score} onChange={(e) => setEditing({ ...editing, score: e.target.value })} placeholder="Score" />
            <div className="md:col-span-2">
              <Button onClick={saveEdit} className="w-full">Save</Button>
            </div>
          </div>
        )}
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
