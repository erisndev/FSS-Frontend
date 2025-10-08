import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const DashboardLayout = ({ children, title, subtitle }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 1024);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Sidebar />

      {/* Main content - Responsive padding and margins */}
      <div
        className={`${
          isMobile ? "ml-0" : "ml-64"
        } transition-all duration-300 min-h-screen`}
      >
        <Header title={title} subtitle={subtitle} />
        <main className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-full overflow-x-hidden">
          <div className="w-full max-w-[1920px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;