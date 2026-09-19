import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import DashboardHeader from "@/student/components/DashboardComponents/DashboardHeader";
import { fetchAdminUsers, updateAdminUserRole, deleteAdminUser } from "@/api/admin";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetchAdminUsers();
        setUsers(response.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateAdminUserRole(userId, newRole);
      const response = await fetchAdminUsers();
      setUsers(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm(t("Are you sure you want to delete this user?"))) {
      try {
        await deleteAdminUser(userId);
        const response = await fetchAdminUsers();
        setUsers(response.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      }
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-black dark:text-white transition-colors">
      <DashboardHeader />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#2C2DE0]">
              {t.admin.panel}
            </p>
            <h1 className="mt-2 text-2xl font-black text-gray-900 dark:text-white">
              {t.admin.userManagement}
            </h1>
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-bold text-gray-700 transition-all hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Name</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Email</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Role</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-t border-gray-100 hover:bg-gray-50/70 dark:border-gray-800 dark:hover:bg-gray-900/60"
                  >
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">{user.name}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{user.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#2C2DE0] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                      >
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-600 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserManagement;