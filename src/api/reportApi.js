// reportsApi.js
import api from "./client"; // same axios instance used by adminApi.js

const REPORT_BASE = "/admin/reports";

export const fetchReport = (period, date) =>
  api.get(REPORT_BASE, { params: { period, date } }).then((r) => r.data.data);

// Downloads trigger a real file save via Blob + a temporary <a>.
// No canned "Download" button — this hits the real export endpoint.
const downloadBlob = async (url, params, filenameFallback) => {
  const response = await api.get(url, { params, responseType: "blob" });

  // Prefer the server's real filename (from Content-Disposition) over a guess.
  const disposition = response.headers["content-disposition"] || "";
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] || filenameFallback;

  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};

export const downloadReportPdf = (period, date) =>
  downloadBlob(`${REPORT_BASE}/export/pdf`, { period, date }, `library-${period}-report.pdf`);

export const downloadReportExcel = (period, date) =>
  downloadBlob(`${REPORT_BASE}/export/excel`, { period, date }, `library-${period}-report.xlsx`);