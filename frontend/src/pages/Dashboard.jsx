import React, { useEffect, useState } from "react";
import api from "../lib/api.js";
import { Card } from "../components/ui/card.jsx";
import { Select } from "../components/ui/select.jsx";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const gradeColors = {
  A: "#22c55e",
  B: "#3b82f6",
  C: "#eab308",
  D: "#f97316",
  E: "#ef4444"
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [pieType, setPieType] = useState("grade");
  const [barType, setBarType] = useState("year");

  useEffect(() => {
    api.get("/dashboard/stats").then(({ data }) => setStats(data));
  }, []);

  if (!stats) return <div className="p-8">Loading...</div>;

  const gradeCounts = stats.cards.grade_counts || [];
  const pieData = pieType === "grade" ? stats.charts.grade_distribution : stats.charts.district_distribution;
  const pieKey = pieType === "grade" ? "grade" : "district";
  const barData = barType === "year" ? stats.charts.entries_per_year : stats.charts.entries_per_user;
  const barKey = barType === "year" ? "year" : "user";

  return (
    <div className="p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-sm text-muted">Total clubs</div>
          <div className="text-2xl font-display">{stats.cards.total_clubs}</div>
        </Card>
        <Card>
          <div className="text-sm text-muted">Entries this year</div>
          <div className="text-2xl font-display">{stats.cards.total_entries_this_year}</div>
        </Card>
        {"ABCDE".split("").map((g) => (
          <Card key={g}>
            <div className="text-sm" style={{ color: gradeColors[g] }}>Grade {g}</div>
            <div className="text-2xl font-display">
              {gradeCounts.find((x) => x.grade === g)?.value || 0}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display">Pie Chart</h3>
            <Select value={pieType} onChange={(e) => setPieType(e.target.value)}>
              <option value="grade">Grade Distribution</option>
              <option value="district">District Distribution</option>
            </Select>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey={pieKey} outerRadius={110}>
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.grade ? gradeColors[entry.grade] : ["#38bdf8", "#22c55e", "#f97316"][idx % 3]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display">Bar Chart</h3>
            <Select value={barType} onChange={(e) => setBarType(e.target.value)}>
              <option value="year">Entries per Year</option>
              <option value="user">Entries per User</option>
            </Select>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={barData}>
                <XAxis dataKey={barKey} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
