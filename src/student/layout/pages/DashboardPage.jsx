import HeroWelcome from "@/student/components/DashboardComponents/BrandSection";
import ProgressStrip from "@/student/components/DashboardComponents/Progressstrip";
import QuickActions from "@/student/components/DashboardComponents/QuickActions";
import { DashboardFooter, TutorialSection } from "../components/VideoSection_and_Footer";
// import MainContentArea from "@/student/components/DashboardComponents/MainContentArea";

function useDashboardData() {
  return {
    loading: false,
    streak: 5,
    dailyGoal: 3,
    completedToday: 2,
    stats: { borrowed: 2, reservations: 1, dueSoon: 1, unread: 0 },
  };
}

const SkeletonBlock = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-100 dark:bg-gray-900 rounded-2xl ${className}`} />
);

const DashboardPage = () => {
  const data = useDashboardData();

  // NOTE: intentionally no `max-w-* mx-auto` here. This region already sits
  // to the right of the sidebar, so centering it again inside itself pushed
  // the whole dashboard visually off to one side with dead space around it.
  // Full-width with consistent side padding keeps it flush with the sidebar
  // and header instead.
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">
      {data.loading ? (
        <>
          <SkeletonBlock className="h-48" />
          <SkeletonBlock className="h-20" />
          <SkeletonBlock className="h-32" />
        </>
      ) : (
        <>
          <HeroWelcome
            streak={data.streak}
            dailyGoal={data.dailyGoal}
            completedToday={data.completedToday}
          />
          <ProgressStrip stats={data.stats} />
          <QuickActions />
        </>
      )}
      {/* <MainContentArea /> */}
      <TutorialSection />
      <DashboardFooter />
    </div>
  );
};

export default DashboardPage;