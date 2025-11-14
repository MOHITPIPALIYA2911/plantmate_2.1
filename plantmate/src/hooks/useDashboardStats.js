import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchDashboardStats = async () => {
  const res = await axios.get("http://localhost:7777/api/dashboard/stats", { withCredentials: true });
  return res.data;
};

export const useDashboardStats = () => {
  return useQuery("dashboardStats", fetchDashboardStats);
};
