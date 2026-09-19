import { useQuery } from "@tanstack/react-query";
import {
  fetchAnalyticsOverview,
  fetchAnalyticsReservations,
  fetchAnalyticsStudents,
  fetchAnalyticsBooks,
  fetchAnalyticsBorrowing,
  fetchAnalyticsLibraryUsage,
} from "../api/Analyticsapi";

export const useAnalyticsOverview = () =>
  useQuery({
    queryKey: ["analytics-overview"],
    queryFn: async () => (await fetchAnalyticsOverview()).data,
    refetchInterval: 60_000,
  });

export const useAnalyticsReservations = (period) =>
  useQuery({
    queryKey: ["analytics-reservations", period],
    queryFn: async () => (await fetchAnalyticsReservations(period)).data,
    keepPreviousData: true,
  });

export const useAnalyticsStudents = () =>
  useQuery({
    queryKey: ["analytics-students"],
    queryFn: async () => (await fetchAnalyticsStudents()).data,
  });

export const useAnalyticsBooks = () =>
  useQuery({
    queryKey: ["analytics-books"],
    queryFn: async () => (await fetchAnalyticsBooks()).data,
  });

export const useAnalyticsBorrowing = () =>
  useQuery({
    queryKey: ["analytics-borrowing"],
    queryFn: async () => (await fetchAnalyticsBorrowing()).data,
    refetchInterval: 60_000,
  });

export const useAnalyticsLibraryUsage = () =>
  useQuery({
    queryKey: ["analytics-library-usage"],
    queryFn: async () => (await fetchAnalyticsLibraryUsage()).data,
  });