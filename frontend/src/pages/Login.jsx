import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Moon, Sun } from "lucide-react";
import { Card } from "../components/ui/card.jsx";
import { Input } from "../components/ui/input.jsx";
import { Label } from "../components/ui/label.jsx";
import { Button } from "../components/ui/button.jsx";
import { Select } from "../components/ui/select.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { applyTheme, themes } from "../lib/theme.js";

export default function Login() {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [themeMode, setThemeMode] = useState("light");
  const [themeColor] = useState(themes[0]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await login(email, password);
      applyTheme({ mode: user.theme_mode || "light", color: user.theme_color || "theme-1" });
      navigate(user.role === "admin" ? "/dashboard" : "/entries/new");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  const setLanguage = (value) => {
    i18n.changeLanguage(value);
  };

  const toggleThemeMode = () => {
    const next = themeMode === "light" ? "dark" : "light";
    setThemeMode(next);
    applyTheme({ mode: next, color: themeColor });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 ">
      <div className="flex items-center justify-center p-8 bg-white ">
        <Card className="w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-display text-2xl">{t("login_title")}</h1>
            <div className="flex gap-2">
              <Select value={i18n.language} onChange={(e) => setLanguage(e.target.value)} className="rounded-full">
                <option value="si">සිං</option>
                <option value="en">Eng</option>
              </Select>
              <button className="icon-btn" onClick={toggleThemeMode} title="Toggle theme">
                {themeMode === "light" ? <Moon size={18} /> : <Sun size={18} />}
              </button>
            </div>
          </div>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <Label>{t("email")}</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder={t("admin@mail.com")} />
            </div>
            <div>
              <Label>{t("password")}</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder={t("********")} />
            </div>
            {error && <div className="text-sm text-red-500">{error}</div>}
            <Button className="w-full" type="submit">{t("login")}</Button>
          </form>
        </Card>
      </div>
      <div className="hidden lg:block relative">
        <img
          src="/sos.jpg"
          alt="sports login"
          className="absolute inset-0 h-full w-full object-cover"/>
        
        <div className="absolute inset-0 bg-slate-900/30" />
      </div>
    </div>
  );
}
