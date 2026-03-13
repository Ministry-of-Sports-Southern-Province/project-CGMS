import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card } from "../components/ui/card.jsx";
import { Input } from "../components/ui/input.jsx";
import { Label } from "../components/ui/label.jsx";
import { Select } from "../components/ui/select.jsx";
import { Button } from "../components/ui/button.jsx";
import { Modal } from "../components/ui/modal.jsx";
import api from "../lib/api.js";

const years = Array.from({ length: 16 }, (_, i) => 2020 + i);

function gradeFromScore(score) {
  const s = Number(score);
  if (s > 75) return { text: "A (Excellent)", color: "bg-emerald-100 text-emerald-700" };
  if (s > 55 && s <= 75) return { text: "B (Very Good)", color: "bg-blue-100 text-blue-700" };
  if (s >= 40 && s <= 55) return { text: "C (Good)", color: "bg-yellow-100 text-yellow-700" };
  if (s > 19 && s <= 40) return { text: "D (Normal)", color: "bg-orange-100 text-orange-700" };
  return { text: "E (Weak)", color: "bg-red-100 text-red-700" };
}

export default function EntryForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [locations, setLocations] = useState({ districts: [], ds_offices: [] });
  const [districtId, setDistrictId] = useState("");
  const [dsId, setDsId] = useState("");
  const [form, setForm] = useState({
    club_name: "",
    address: "",
    gn_division: "",
    year: years[0],
    score: 0
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    api.get("/meta/locations").then(({ data }) => setLocations(data));
  }, []);

  const dsOptions = locations.ds_offices.filter((d) => String(d.district_id) === String(districtId));
  const grade = gradeFromScore(form.score);

  const resetForm = () => {
    setForm({ club_name: "", address: "", gn_division: "", year: years[0], score: 0 });
    setDistrictId("");
    setDsId("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clubRes = await api.post("/clubs", {
      club_name: form.club_name,
      address: form.address,
      district_id: Number(districtId),
      ds_id: Number(dsId),
      gn_division: form.gn_division
    });
    await api.post("/grades", {
      club_id: clubRes.data.id,
      year: Number(form.year),
      score: Number(form.score)
    });
    setShowSuccess(true);
  };

  return (
    <div className="p-8">
      <Card className="max-w-3xl mx-auto">
        <h2 className="font-display text-xl mb-6">{t("new_entry")}</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
          <div>
            <Label>{t("club_name")}</Label>
            <Input value={form.club_name} onChange={(e) => setForm({ ...form, club_name: e.target.value })} required />
          </div>
          <div>
            <Label>{t("year")}</Label>
            <Select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>{t("address")}</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          </div>
          <div>
            <Label>{t("district")}</Label>
            <Select value={districtId} onChange={(e) => { setDistrictId(e.target.value); setDsId(""); }} required>
              <option value="">Select</option>
              {locations.districts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>{t("ds_office")}</Label>
            <Select value={dsId} onChange={(e) => setDsId(e.target.value)} required>
              <option value="">Select</option>
              {dsOptions.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>{t("gn_division")}</Label>
            <Input value={form.gn_division} onChange={(e) => setForm({ ...form, gn_division: e.target.value })} required />
          </div>
          <div>
            <Label>{t("score")}</Label>
            <Input type="number" min="0" max="100" step="0.01" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} required />
          </div>
          <div>
            <Label>{t("grade")}</Label>
            <Input value={grade.text} readOnly className={grade.color} />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" className="w-full">{t("save")}</Button>
          </div>
        </form>
      </Card>

      <Modal open={showSuccess} title="Saved Successfully" onClose={() => setShowSuccess(false)}>
        <div className="space-y-4">
          <p>Your entry has been saved.</p>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/entries")} className="w-full">View Entries</Button>
            <Button variant="outline" onClick={() => { resetForm(); setShowSuccess(false); }} className="w-full">
              Add New
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
