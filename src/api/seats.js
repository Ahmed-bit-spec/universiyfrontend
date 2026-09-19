import api from "@/api/client";

export const getSeats = async () => {
  const res = await api.get("/seats");
  return res.data.seats;
};