import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  FileText,
  Users,
  Bell,
  Plus,
  Search,
  BarChart3,
  LogOut,
  Shield,
  Briefcase,
  User,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import NotificationBadge from "../UI/NotificationBadge";

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { user, logout, isTeamLeader } = useAuth();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 1024);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => setIsMobileMenuOpen(false), [location.pathname]);

  useEffect(() => {
    document.body.style.overflow =
      isMobileMenuOpen && isMobile ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [isMobileMenuOpen, isMobile]);

  const getMenuItems = () => {
    switch (user?.role) {
      case "bidder":
        return [
          { name: "Dashboard", path: "/bidder", icon: Home },
          { name: "Browse Tenders", path: "/bidder/tenders", icon: Search },
          {
            name: "My Applications",
            path: "/bidder/applications",
            icon: FileText,
          },
          {
            name: "Verification Requests",
            path: "/bidder/verification-requests",
            icon: ShieldCheck,
          },
          { name: "Notifications", path: "/bidder/notifications", icon: Bell },
          { name: "Profile", path: "/bidder/profile", icon: User },
        ];
      case "issuer":
        const issuerMenu = [
          { name: "Dashboard", path: "/issuer", icon: Home },
          { name: "My Tenders", path: "/issuer/tenders", icon: FileText },
          {
            name: "Applications",
            path: "/issuer/applications",
            icon: Briefcase,
          },
          {
            name: "Application Requests",
            path: "/issuer/verification-requests",
            icon: ShieldCheck,
          },
          { name: "Analytics", path: "/issuer/analytics", icon: BarChart3 },
        ];

        // Add Team Management for team leaders
        if (isTeamLeader()) {
          issuerMenu.push({
            name: "Team Management",
            path: "/issuer/team",
            icon: Users,
          });
        }

        issuerMenu.push(
          { name: "Notifications", path: "/issuer/notifications", icon: Bell },
          { name: "Profile", path: "/issuer/profile", icon: User }
        );

        return issuerMenu;
      case "admin":
        return [
          { name: "Dashboard", path: "/admin", icon: Home },
          { name: "Users Management", path: "/admin/users", icon: Users },
          {
            name: "Tenders Management",
            path: "/admin/tenders",
            icon: FileText,
          },
          {
            name: "Applications",
            path: "/admin/applications",
            icon: Briefcase,
          },
          {
            name: "Verification Requests",
            path: "/admin/verification-requests",
            icon: ShieldCheck,
          },
          { name: "Notifications", path: "/admin/notifications", icon: Bell },
          { name: "Profile", path: "/admin/profile", icon: User },
        ];
      default:
        return [];
    }
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case "bidder":
        return "from-blue-500 to-cyan-500";
      case "issuer":
        return "from-purple-500 to-pink-500";
      case "admin":
        return "from-emerald-500 to-teal-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const menuItems = getMenuItems();

  const MobileMenuButton = () => (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-gradient-to-r from-slate-900/95 via-purple-900/90 to-slate-900/95 backdrop-blur-xl border border-cyan-400/20 rounded-lg shadow-2xl"
      whileTap={{ scale: 0.95 }}
    >
      {isMobileMenuOpen ? (
        <X className="w-6 h-6 text-cyan-400" />
      ) : (
        <Menu className="w-6 h-6 text-cyan-400" />
      )}
    </motion.button>
  );

  const SidebarContent = ({ isMobileVersion = false }) => (
    <div
      className={`${
        isMobileVersion ? "p-4 pt-16" : "p-6"
      } h-full flex flex-col`}
    >
      <div className="flex-1 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-6 lg:mb-8">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-white">
              TenderFlow
            </h1>
            <p className="text-xs text-cyan-400/70">Management System</p>
          </div>
        </div>

        {/* User Info
      <div
        className={`p-3 lg:p-4 rounded-xl bg-gradient-to-r ${getRoleColor()} mb-4 lg:mb-6 relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <p className="text-white font-medium text-sm lg:text-base truncate">
            {user?.name}
          </p>
          <p className="text-white/80 text-xs lg:text-sm truncate">
            {user?.email}
          </p>
          <span className="inline-block px-2 py-1 bg-white/20 rounded-full text-xs text-white mt-2">
            {user?.role}
          </span>
        </div>
      </div> */}

        {/* Navigation */}
        <nav className="space-y-2 md:space-y-2 lg:space-y-2">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={`flex items-center justify-between p-3.5 md:p-3 lg:p-3 rounded-lg transition-all duration-300 group touch-manipulation min-h-[48px] ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 text-cyan-400"
                    : "text-gray-300 hover:text-white hover:bg-white/5 active:bg-white/10"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon
                    className={`w-5 h-5 md:w-5 md:h-5 lg:w-5 lg:h-5 flex-shrink-0 ${
                      isActive
                        ? "text-cyan-400"
                        : "text-gray-400 group-hover:text-white"
                    }`}
                  />
                  <span className="font-medium text-base md:text-base lg:text-base truncate">
                    {item.name}
                  </span>
                </div>
                {item.name === "Notifications" && <NotificationBadge />}
              </NavLink>
            );
          })}
        </nav>
      </div>
      {/* Logout Button */}
      <button
        onClick={() => setShowLogoutModal(true)}
        className="flex items-center space-x-3 p-3.5 md:p-3 lg:p-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 active:bg-red-500/20 transition-all duration-300 w-full touch-manipulation min-h-[48px]"
      >
        <LogOut className="w-5 h-5 md:w-5 md:h-5 lg:w-5 lg:h-5 flex-shrink-0" />
        <span className="font-medium text-base md:text-base lg:text-base">
          Logout
        </span>
      </button>
    </div>
  );

  return (
    <>
      {isMobile && <MobileMenuButton />}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-slate-900/95 via-purple-900/90 to-slate-900/95 backdrop-blur-xl border-r border-cyan-400/20 shadow-2xl z-50">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && isMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-full sm:w-80 sm:max-w-[85vw] bg-gradient-to-b from-slate-900/95 via-purple-900/90 to-slate-900/95 backdrop-blur-xl border-r border-cyan-400/20 shadow-2xl z-50 lg:hidden"
            >
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close sidebar"
                className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-cyan-400/20 text-cyan-400 z-10"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent isMobileVersion={true} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Logout Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-slate-900 p-6 rounded-xl w-80 text-center border border-cyan-400/20"
            >
              <h2 className="text-xl font-semibold text-white mb-4">
                Confirm Logout
              </h2>
              <p className="text-gray-300 mb-6">
                Are you sure you want to logout?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    logout();
                    setShowLogoutModal(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
