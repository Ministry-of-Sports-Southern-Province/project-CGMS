import React, { useEffect, useState } from "react";
import api from "../lib/api.js";
import { Card } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Select } from "../components/ui/select.jsx";
import { Modal } from "../components/ui/modal.jsx";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user", status: "active" });

  const load = async () => {
    const { data } = await api.get("/users", { params: { status: statusFilter || undefined } });
    const filtered = roleFilter ? data.filter((u) => u.role === roleFilter) : data;
    setUsers(filtered);
  };

  useEffect(() => {
    load();
  }, [statusFilter, roleFilter]);

  const createUser = async () => {
    await api.post("/users", form);
    setOpen(false);
    setForm({ name: "", email: "", password: "", role: "user", status: "active" });
    load();
  };

  const saveEdit = async () => {
    await api.put(`/users/${editing.id}`, {
      name: editing.name,
      email: editing.email,
      role: editing.role,
      status: editing.status
    });
    setEditing(null);
    load();
  };

  const remove = async (id) => {
    await api.delete(`/users/${id}`);
    load();
  };

  return (
    <div className="p-8">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">User Management</h2>
          <div className="flex items-center gap-2">
            <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
            <Button onClick={() => setOpen(true)}>Create User</Button>
          </div>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-base">
                <th className="py-2">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-base">
                  <td className="py-2">{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.status}</td>
                  <td className="flex gap-2 py-2">
                    <Button variant="outline" onClick={() => setEditing({ ...u })}>Edit</Button>
                    <Button variant="ghost" onClick={() => remove(u.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={open} title="Create User" onClose={() => setOpen(false)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </Select>
          <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
          <div className="md:col-span-2">
            <Button className="w-full" onClick={createUser}>Save</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!editing} title="Edit User" onClose={() => setEditing(null)}>
        {editing && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            <Input placeholder="Email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
            <Select value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </Select>
            <Select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
            <div className="md:col-span-2">
              <Button className="w-full" onClick={saveEdit}>Save</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
