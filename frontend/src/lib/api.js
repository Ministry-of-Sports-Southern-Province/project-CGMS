import axios from "axios";

const api = axios.create({
  baseURL: "https://SCGM.sportsdpsp.lk",
  withCredentials: true
});

export default api;