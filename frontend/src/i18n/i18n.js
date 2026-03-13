import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  si: {
    translation: {
      app_name: "ක්‍රීඩා සමාජ ශ්‍රේණිගත කිරීමේ කළමනාකරණය",
      login_title: "පිවිසීම",
      email: "ඊමේල්",
      password: "මුරපදය",
      login: "පිවිසෙන්න",
      logout: "පිටවෙන්න",
      dashboard: "පාලක පුවරුව",
      entries: "ඇතුළත් කිරීම්",
      new_entry: "නව ඇතුළත් කිරීම",
      profile: "පැතිකඩ",
      users: "පරිශීලකයින්",
      district: "දිස්ත්‍රික්කය",
      ds_office: "ප්‍රාදේශීය ලේකම් කාර්යාලය",
      year: "වසර",
      grade: "ශ්‍රේණිය",
      score: "ලකුණු",
      club_name: "සමාජ නාමය",
      address: "ලිපිනය",
      gn_division: "ග්‍රාම නිලධාරී කොට්ඨාසය",
      save: "සුරකින්න",
      cancel: "අවලංගු කරන්න",
      search: "සොයන්න",
      export_excel: "Excel ලෙස අපනයනය කරන්න",
      export_pdf: "PDF ලෙස අපනයනය කරන්න",
      language: "භාෂාව",
      theme: "තේමාව",
      light: "ආලෝක",
      dark: "අඳුරු"
    }
  },
  en: {
    translation: {
      app_name: "Sports Club Grading Management",
      login_title: "Login",
      email: "Email",
      password: "Password",
      login: "Login",
      logout: "Logout",
      dashboard: "Dashboard",
      entries: "Entries",
      new_entry: "New Entry",
      profile: "Profile",
      users: "Users",
      district: "District",
      ds_office: "DS Office",
      year: "Year",
      grade: "Grade",
      score: "Score",
      club_name: "Club Name",
      address: "Address",
      gn_division: "GN Division",
      save: "Save",
      cancel: "Cancel",
      search: "Search",
      export_excel: "Export Excel",
      export_pdf: "Export PDF",
      language: "Language",
      theme: "Theme",
      light: "Light",
      dark: "Dark"
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "si",
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;