// api/myreservation.js
import api from "@/api/client";

/**
 * Fetch the current user's reservations.
 * GET /api/reservation/myReservations
 * Returns: Reservation[]
 */
export const getMyReservations = async () => {
  const res = await api.get("/reservations/myReservations");
  return res.data; // plain array
};