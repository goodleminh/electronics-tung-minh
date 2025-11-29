const BASE_URL = import.meta.env.VITE_API_URL;

export const fetchOverview = async () => {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`${BASE_URL}/dashboard/overview`, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};
