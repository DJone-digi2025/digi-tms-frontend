import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const loginUser = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/login`, data);
    return response.data;
  } catch (err) {
    throw err; // let UI handle
  }
};


export const getTeamMembers = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/team-members`);
    return res.data;
  } catch (err) {
    console.error("Team members fetch error:", err);
    return [];
  }
};