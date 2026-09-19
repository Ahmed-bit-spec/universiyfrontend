import { useAuth } from "@/context/AuthContext";

export const useUniversityVerification = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isTeacher = user?.role === "teacher"; // NEW
  const isUniversityVerified =
    isAdmin || Boolean(user?.isUniversityVerified);
  const needsVerification = Boolean(user && !isUniversityVerified);

  const isFemaleStudent = user?.gender === "female";

  return {
    fullName:
      user?.name ||
      user?.fullName ||
      user?.username ||
      "Student",
    isAdmin,
    isTeacher, // NEW
    isUniversityVerified,
    needsVerification,
    universityId: user?.universityId ?? null,
    gender: user?.gender ?? null,
    isFemaleStudent,
    canBookGirlsZone: isAdmin || isFemaleStudent,
  };
};