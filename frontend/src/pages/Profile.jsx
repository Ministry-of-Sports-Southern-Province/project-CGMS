import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../lib/api.js";
import { Card } from "../components/ui/card.jsx";
import { Input } from "../components/ui/input.jsx";
import { Label } from "../components/ui/label.jsx";
import { Button } from "../components/ui/button.jsx";
import { Select } from "../components/ui/select.jsx";
import { themes, themeColors, applyTheme } from "../lib/theme.js";
import { resolveAvatarUrl } from "../lib/avatar.js";

export default function Profile() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    language_preference: user?.language_preference || "si",
    theme_mode: user?.theme_mode || "light",
    theme_color: user?.theme_color || "theme-12",
    avatar: user?.avatar || ""
  });
  const [passwords, setPasswords] = useState({ current_password: "", new_password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const saveProfile = async () => {
    setError("");
    try {
      await api.put("/users/me", {
        name: form.name,
        email: form.email,
        language_preference: form.language_preference,
        theme_mode: form.theme_mode,
        theme_color: form.theme_color
      });
      applyTheme({ mode: form.theme_mode, color: form.theme_color });
      await refresh();
      setMessage("Profile updated");
    } catch (err) {
      setError("Profile update failed");
    }
  };

  const changePassword = async () => {
    setError("");
    try {
      await api.put("/users/me/password", passwords);
      setPasswords({ current_password: "", new_password: "" });
      setMessage("Password updated");
    } catch (err) {
      setError("Password update failed");
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    const { data } = await api.post("/users/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    setForm({ ...form, avatar: data.avatar });
    await refresh();
  };

  const avatarUrl = resolveAvatarUrl(form.avatar || "");

  return (
    <div className="p-8">
      <Card className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className="h-20 w-20 rounded-full border border-base" />
          ) : (
            <div className="h-20 w-20 rounded-full border border-base" />
          )}
          <div>
            <Label>Avatar Upload</Label>
            <input type="file" className="mt-2 text-sm" onChange={handleAvatarUpload} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label>Language</Label>
            <Select value={form.language_preference} onChange={(e) => setForm({ ...form, language_preference: e.target.value })}>
              <option value="si">සිං</option>
              <option value="en">Eng</option>
            </Select>
          </div>
          <div>
            <Label>Theme Mode</Label>
            <Select value={form.theme_mode} onChange={(e) => setForm({ ...form, theme_mode: e.target.value })}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </Select>
          </div>
          <div>
            <Label>Theme Color</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {themes.map((tval) => (
                <button
                  key={tval}
                  className={`h-7 w-7 rounded-full border ${form.theme_color === tval ? "border-slate-900" : "border-base"}`}
                  style={{ background: themeColors[tval] }}
                  onClick={() => setForm({ ...form, theme_color: tval })}
                />
              ))}
            </div>
          </div>
        </div>
        <Button onClick={saveProfile}>Save</Button>

        <div className="border-t border-base pt-4">
          <h3 className="font-display">Change Password</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Current Password</Label>
              <Input type="password" value={passwords.current_password} onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })} />
            </div>
            <div>
              <Label>New Password</Label>
              <Input type="password" value={passwords.new_password} onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })} />
            </div>
          </div>
          <Button className="mt-3" onClick={changePassword}>Update Password</Button>
        </div>

        {message && <div className="text-sm text-emerald-500">{message}</div>}
        {error && <div className="text-sm text-red-500">{error}</div>}
      </Card>
    </div>
  );
}
