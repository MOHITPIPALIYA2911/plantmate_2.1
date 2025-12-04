import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:7777";

const fetchDashboardStats = async () => {
  const res = await axios.get(`${API_BASE}/api/dashboard/stats`, { withCredentials: true });
  return res.data;
};

export const useDashboardStats = () => {
  return useQuery("dashboardStats", fetchDashboardStats);
};
