/** Static UI preview data only — no API */

export const MOCK_LINE_DATA = [
  { name: "Mon", value: 42 },
  { name: "Tue", value: 58 },
  { name: "Wed", value: 45 },
  { name: "Thu", value: 72 },
  { name: "Fri", value: 65 },
  { name: "Sat", value: 28 },
  { name: "Sun", value: 18 },
];

export const MOCK_BAR_DATA = [
  { name: "7am", value: 12 },
  { name: "9am", value: 34 },
  { name: "11am", value: 48 },
  { name: "1pm", value: 38 },
  { name: "3pm", value: 52 },
  { name: "5pm", value: 22 },
];

export const MOCK_DONUT_DATA = [
  { name: "Seats", value: 45 },
  { name: "Books", value: 30 },
  { name: "QR", value: 15 },
  { name: "Other", value: 10 },
];

export const MOCK_USERS = [
  { id: "1", name: "Amina Hassan", email: "amina@uniso.edu", role: "student", verified: true, joined: "2025-09-12" },
  { id: "2", name: "Omar Ali", email: "omar@uniso.edu", role: "student", verified: true, joined: "2025-10-01" },
  { id: "3", name: "Fatima Nur", email: "fatima@uniso.edu", role: "student", verified: false, joined: "2026-01-15" },
  { id: "4", name: "Admin User", email: "admin@uniso.edu", role: "admin", verified: true, joined: "2025-08-01" },
];

export const MOCK_UNIVERSITY_STUDENTS = [
  { id: "1", studentId: "CS2026001", fullName: "Amina Hassan", gender: "Female", department: "Computer Science", semester: 4, claimed: true },
  { id: "2", studentId: "CS2026002", fullName: "Omar Ali", gender: "Male", department: "Computer Science", semester: 3, claimed: true },
  { id: "3", studentId: "IT2026010", fullName: "Khadija Farah", gender: "Female", department: "IT", semester: 2, claimed: false },
];

export const MOCK_BOOKS = [
  { id: "1", title: "Introduction to Algorithms", author: "Cormen", category: "CS", copies: 12, available: 8 },
  { id: "2", title: "Database Systems", author: "Silberschatz", category: "CS", copies: 8, available: 5 },
  { id: "3", title: "Medical Physiology", author: "Guyton", category: "Medicine", copies: 6, available: 2 },
];

export const MOCK_RESERVATIONS = [
  { id: "1", student: "Amina Hassan", seat: "12", timeSlot: "9:00 AM – 11:00 AM", date: "2026-05-22", status: "active" },
  { id: "2", student: "Omar Ali", seat: "3", timeSlot: "1:00 PM – 3:00 PM", date: "2026-05-22", status: "pending" },
  { id: "3", student: "Fatima Nur", seat: "28", timeSlot: "10:30 AM – 12:30 PM", date: "2026-05-22", status: "completed" },
];

export const MOCK_ACTIVITY = [
  { id: "1", action: "reservation", user: "Amina Hassan", detail: "Seat 12", time: "2m ago" },
  { id: "2", action: "checkin", user: "Omar Ali", detail: "QR scan", time: "15m ago" },
  { id: "3", action: "verify", user: "Khadija Farah", detail: "University ID", time: "1h ago" },
];
