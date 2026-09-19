import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Mail, Shield, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import PageTransition from "@/admin/components/PageTransition";
import PageHeader from "@/admin/components/PageHeader";
import StatusBadge from "@/admin/components/StatusBadge";
import AuditTimeline from "@/admin/components/AuditTimeline";
import { fetchAdminUser } from "@/api/admin";
import { useLanguage } from "@/hooks/useLanguage";

const InfoRow = ({ label, value }) => (
  <div className="rounded-xl border border-gray-200/70 bg-white/50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
    <p className="text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500">{label}</p>
    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
  </div>
);

const DetailsSkeleton = ({ detail }) => (
  <PageTransition>
    <PageHeader title={detail.loadingTitle} subtitle={detail.loadingSubtitle} />
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      {[0, 1].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-2xl border border-gray-200/70 bg-white/60 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03]"
        >
          <div className="h-4 w-32 rounded-full bg-gray-200 dark:bg-white/10" />
          <div className="mt-5 flex gap-5">
            <div className="size-24 rounded-2xl bg-gray-200 dark:bg-white/10" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-2/3 rounded-full bg-gray-200 dark:bg-white/10" />
              <div className="h-4 w-1/2 rounded-full bg-gray-200 dark:bg-white/10" />
              <div className="flex gap-2">
                <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-white/10" />
                <div className="h-6 w-24 rounded-full bg-gray-200 dark:bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="animate-pulse rounded-2xl border border-gray-200/70 bg-white/60 p-5 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="h-4 w-28 rounded-full bg-gray-200 dark:bg-white/10" />
          <div className="mt-3 h-8 w-16 rounded-full bg-gray-200 dark:bg-white/10" />
        </div>
      ))}
    </div>
  </PageTransition>
);

const UserDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const ap = t.adminPanel;
  const p = ap.pages.users;
  const detail = p.details;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-user", id],
    queryFn: async () => {
      const res = await fetchAdminUser(id);
      return res.data;
    },
  });

  const user = data?.user;
  const registry = data?.registry;
  const analytics = data?.analytics || {};
  const auditLogs = data?.auditLogs || [];
  const statusLabels = {
    active: p.statusActive,
    suspended: p.statusSuspended,
    banned: p.statusBanned,
    pending: p.statusPending,
  };
  const statusTones = { active: "green", suspended: "gray", banned: "red", pending: "yellow" };

  if (isLoading) {
    return <DetailsSkeleton detail={detail} />;
  }

  if (isError || !user) {
    return (
      <PageTransition>
        <PageHeader title={detail.errorTitle} subtitle={detail.errorSubtitle} />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="mb-5">
        <button
          type="button"
          onClick={() => navigate("/admin/users")}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200/80 bg-white/70 px-3 py-2 text-xs font-bold text-gray-700 transition-colors hover:border-[#2C2DE0]/30 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
        >
          <ArrowLeft size={15} />
          {detail.backToUsers}
        </button>
      </div>
      <PageHeader title={user.fullName} subtitle={user.email} />

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gray-200/70 bg-white/60 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/3"
        >
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">{detail.profile}</h2>
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex size-24 items-center justify-center overflow-hidden rounded-2xl bg-[#2C2DE0]/10 text-2xl font-black text-[#2C2DE0] ring-1 ring-[#2C2DE0]/20 dark:text-[#2C2DE0]">
              {user.avatar ? <img src={user.avatar} alt={user.fullName} className="size-full object-cover" /> : <UserRound size={34} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-black text-gray-950 dark:text-white">{user.fullName}</p>
              <p className="mt-1 inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Mail size={15} /> {user.email}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusBadge label={user.role === "admin" ? p.roleAdmin : p.roleStudent} tone={user.role === "admin" ? "green" : "gray"} />
                <StatusBadge label={statusLabels[user.accountStatus]} tone={statusTones[user.accountStatus]} />
                <StatusBadge label={user.emailVerified ? p.emailVerified : p.emailPending} tone={user.emailVerified ? "green" : "yellow"} />
              </div>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <InfoRow label={detail.createdAt} value={user.createdAt ? new Date(user.createdAt).toLocaleString() : p.notAvailable} />
            <InfoRow label={detail.lastLogin} value={user.lastLogin ? new Date(user.lastLogin).toLocaleString() : p.notAvailable} />
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className="rounded-2xl border border-gray-200/70 bg-white/60 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03]"
        >
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">{detail.universityInfo}</h2>
          {registry ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InfoRow label={p.studentId} value={registry.universityId || p.notAvailable} />
              <InfoRow label={detail.semester} value={registry.semester || p.notAvailable} />
              <InfoRow label={detail.gender} value={registry.gender || p.notAvailable} />
              <InfoRow label={detail.department} value={registry.department || p.notAvailable} />
            </div>
          ) : (
            <p className="mt-4 text-xs font-semibold text-gray-400">
              {detail.registryUnlinked ?? "Not linked to a university record"}
            </p>
          )}
          <div className="mt-3">
            <StatusBadge label={user.isUniversityVerified ? p.verified : p.notVerified} tone={user.isUniversityVerified ? "green" : "orange"} />
          </div>
        </motion.section>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <InfoRow label={detail.provider ?? "Provider"} value={user.provider} />
          <InfoRow label={detail.googleLinked ?? "Google Linked"} value={user.googleId ? "Yes" : "No"} />
          <InfoRow label={detail.emailVerifiedLabel ?? "Account Verified"} value={user.isVerified ? "Yes" : "No"} />
          <InfoRow label={detail.loginAttempts ?? "Failed Login Attempts"} value={user.loginAttempts ?? 0} />
        </section>

        <section className="mt-5">
          <h2 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">{detail.devices ?? "Devices"}</h2>
          {user.devices?.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {user.devices.map((d, i) => (
                <div key={d.deviceId || i} className="rounded-xl border border-gray-200/70 bg-white/50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate">{d.userAgent || p.notAvailable}</p>
                  <p className="mt-1 text-[11px] text-gray-400">
                    {d.lastActive ? new Date(d.lastActive).toLocaleString() : p.notAvailable}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-semibold text-gray-400">{detail.noDevices ?? "No devices recorded"}</p>
          )}
        </section>
      </div>

      <section className="mt-5">
        <h2 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">{detail.reservationAnalytics}</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [detail.totalReservations, analytics.totalReservations],
            [detail.activeReservations, analytics.activeReservations],
            [detail.cancelledReservations, analytics.cancelledReservations],
            [detail.noShows, analytics.noShows],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-gray-200/70 bg-white/60 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03]">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400">{label}</p>
              <p className="mt-2 text-2xl font-black text-gray-950 dark:text-white">{value ?? 0}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
          <Shield size={16} />
          {detail.auditTimeline}
        </h2>
        <AuditTimeline items={auditLogs} labels={detail.audit} />
      </section>
    </PageTransition>
  );
};

export default UserDetailsPage;
