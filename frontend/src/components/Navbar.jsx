import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X, Sun, Moon, LogOut, User, LayoutDashboard, List, Plus, Users, Palette } from "lucide-react";
import { Button } from "./ui/button.jsx";
import { Select } from "./ui/select.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../lib/api.js";
import { applyTheme, themes, themeColors } from "../lib/theme.js";
import { resolveAvatarUrl } from "../lib/avatar.js";

export default function Navbar() {
  const { user, logout, refresh } = useAuth();
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const [themeMode, setThemeMode] = useState(user?.theme_mode || "light");
  const [themeColor, setThemeColor] = useState(user?.theme_color || "theme-12");
  const [open, setOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  const updatePrefs = async (prefs) => {
    await api.put("/users/me", {
      name: user.name,
      email: user.email,
      language_preference: prefs.language_preference || user.language_preference,
      theme_mode: prefs.theme_mode || themeMode,
      theme_color: prefs.theme_color || themeColor,
      avatar: user.avatar || null
    });
    await refresh();
  };

  const setLanguage = async (value) => {
    i18n.changeLanguage(value);
    await updatePrefs({ language_preference: value });
  };

  const toggleThemeMode = async () => {
    const next = themeMode === "light" ? "dark" : "light";
    setThemeMode(next);
    applyTheme({ mode: next, color: themeColor });
    await updatePrefs({ theme_mode: next });
  };

  const changeThemeColor = async (value) => {
    setThemeColor(value);
    applyTheme({ mode: themeMode, color: value });
    await updatePrefs({ theme_color: value });
    setThemeOpen(false);
  };

  const onLogout = async () => {
    await logout();
    navigate("/login");
  };

  const NavLinks = () => (
    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
      <Link className="flex items-center gap-2 text-sm text-accent" to={user?.role === "admin" ? "/dashboard" : "/entries/new"}>
        <LayoutDashboard size={16} /> {t("dashboard")}
      </Link>
      <Link className="flex items-center gap-2 text-sm text-accent" to="/entries">
        <List size={16} /> {t("entries")}
      </Link>
      <Link className="flex items-center gap-2 text-sm text-accent" to="/entries/new">
        <Plus size={16} /> {t("new_entry")}
      </Link>
      {user?.role === "admin" && (
        <Link className="flex items-center gap-2 text-sm text-accent" to="/users">
          <Users size={16} /> Users
        </Link>
      )}
    </div>
  );

  const avatarUrl = resolveAvatarUrl(user?.avatar || "");

  return (
    <div className="px-4 lg:px-6 py-4 border-b border-base bg-white/70 dark:bg-slate-900/70 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="lg:hidden icon-btn text-accent" onClick={() => setOpen(!open)}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="font-display text-lg text-accent whitespace-nowrap">{t("app_name")}</div>
          <div className="hidden lg:block">
            <NavLinks />
          </div>
        </div>
        <div className="flex items-center gap-3 min-w-[280px] justify-end">
          <Select value={i18n.language} onChange={(e) => setLanguage(e.target.value)} className="rounded-full border text-accent">
            <option value="si">සිං</option>
            <option value="en">Eng</option>
          </Select>
          <div className="theme-dropdown">
            <button className="icon-btn text-accent" onClick={() => setThemeOpen(!themeOpen)} title="Theme Colors">
              <Palette size={18} />
            </button>
            {themeOpen && (
              <div className="theme-dropdown-menu">
                <div className="flex flex-col gap-2">
                  {themes.map((tval) => (
                    <button
                      key={tval}
                      className={`rounded-full border-2 transition-transform hover:scale-110 ${themeColor === tval ? "border-slate-900 dark:border-white" : "border-base"}`}
                      style={{ background: themeColors[tval], width: "40px", height: "40px" }}
                      onClick={() => changeThemeColor(tval)}
                      title={tval}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <button className="icon-btn text-accent hover:bg-accent/10" onClick={toggleThemeMode} title="Toggle Dark Mode">
            {themeMode === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <Link to="/profile" className="flex items-center flex-shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="h-11 w-11 rounded-full border border-base object-cover flex-shrink-0" />
            ) : (
              <div className="icon-btn text-accent"><User size={18} /></div>
            )}
          </Link>
          <Button onClick={onLogout} className="rounded-full px-4">
            <LogOut size={16} />
          </Button>
        </div>
      </div>
      {open && (
        <div className="mt-4 lg:hidden">
          <NavLinks />
        </div>
      )}
    </div>
  );
}
