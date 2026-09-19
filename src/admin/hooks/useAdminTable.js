import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

/**
 * Shared server-side table state for admin pages.
 */
export const useAdminTable = (queryKey, fetchFn, initialLimit = 10) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const query = useQuery({
    queryKey: [...queryKey, page, limit, search, filter],
    queryFn: () =>
      fetchFn({
        page,
        limit,
        search,
        ...(filter !== "all" ? { role: filter, status: filter } : {}),
      }),
    keepPreviousData: true,
  });

  const res = query.data?.data;
  const rows = res?.data ?? [];
  const pagination = res?.pagination ?? {
    page: 1,
    limit,
    total: 0,
    totalPages: 1,
  };

  return {
    ...query,
    rows,
    pagination,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    filter,
    setFilter,
    serverPagination: {
      page: pagination.page,
      totalPages: pagination.totalPages,
      totalItems: pagination.total,
      rowsPerPage: limit,
      onPageChange: setPage,
      onRowsPerPageChange: (n) => {
        setLimit(n);
        setPage(1);
      },
    },
  };
};
