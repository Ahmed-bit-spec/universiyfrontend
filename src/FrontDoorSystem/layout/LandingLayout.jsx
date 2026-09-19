import { Outlet } from "react-router-dom";
import LandingHeader from "../components/LandingHeader";
import LandingFooter from "../components/LandingFooter";

const LandingLayout = () => (
  <div className="relative min-h-screen text-gray-900 dark:text-white overflow-x-hidden bg-white dark:bg-black transition-colors duration-300">
    {/* Ambient trailing gradient behind the whole page — brand blue (#2C2DE0 = rgb(44,45,224)) */}
    <div
      className="absolute inset-x-0 top-0 h-[1400px] pointer-events-none dark:hidden"
      style={{
        background: `radial-gradient(ellipse 1400px 900px at 50% 0%, rgba(44, 45, 224, 0.10) 0%, rgba(44, 45, 224, 0.03) 45%, rgba(255,255,255,0) 80%)`,
      }}
    />
    <div
      className="absolute inset-x-0 top-0 h-[1400px] pointer-events-none hidden dark:block"
      style={{
        background: `radial-gradient(ellipse 1400px 900px at 50% 0%, rgba(44, 45, 224, 0.09) 0%, rgba(44, 45, 224, 0.03) 45%, rgba(0,0,0,0) 80%)`,
      }}
    />

    <div className="relative">
      <LandingHeader />
      <main>
        <Outlet />
      </main>
      <LandingFooter />
    </div>
  </div>
);

export default LandingLayout;