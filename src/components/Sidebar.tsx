import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Database,
  BarChart,
  Leaf,
  Cloud,
  Droplet,
  Shield,
  Zap,
  ShieldPlus,
  Landmark,
  HandHeart,
  Recycle,
  Heart,
  Building,
  Globe,
  ChevronRight,
  X,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../assets/logo.png";

const Sidebar = ({ isOpen = true, onClose = () => {} }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Light mode colors only
  const logoGreen = "#008000";
  const logoYellow = "#B8860B";

  // Get customer status and companyId from localStorage
  const [isCustomer, setIsCustomer] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const loggedInCustomer = localStorage.getItem("loggedInCustomer");
    const storedCompanyId = localStorage.getItem("companyId");
    setIsCustomer(loggedInCustomer === "true");
    setCompanyId(storedCompanyId);
  }, []);

  // Determine dashboard path based on role
  const dashboardPath = isCustomer ? "/member_dashboard" : "/admin_dashboard";

  // Helper to build path with companyId (except for customer dashboard)
  const buildPath = (basePath: string): string => {
    // For customer dashboard, never append companyId
    if (isCustomer && basePath === dashboardPath) {
      return basePath;
    }
    // For all other paths, append companyId if customer
    if (isCustomer && companyId) {
      const cleanBase = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
      return `${cleanBase}/${companyId}`;
    }
    return basePath;
  };

  // Base dashboard items with adminOnly flags
  const dashboardItemsBase = [
    {
      icon: LayoutDashboard,
      label: "ESG Dashboard",
      path: dashboardPath,
    },
    {
      icon: Users,
      label: "Companies",
      path: "/admin_companies",
      adminOnly: true,
    },
    {
      icon: BarChart,
      label: "Reports",
      path: "/admin_report",
      adminOnly: true,
    },
    {
      icon: Users,
      label: "Social Data",
      path: "/admin_social_data",
      adminOnly: true,   // <-- now hidden for customers
    },
    {
      icon: Leaf,
      label: "Environmental Data",
      path: "/admin_environmental_data",
      adminOnly: true,   // <-- hidden for customers
    },
    {
      icon: Building,
      label: "Governance Data",
      path: "/admin_governance_data",
      adminOnly: true,   // <-- hidden for customers
    },
  ];

  // Filter out admin-only items if customer
  const filteredDashboardItems = isCustomer
    ? dashboardItemsBase.filter((item) => !item.adminOnly)
    : dashboardItemsBase;

  // Build final dashboard items with full paths
  const dashboardItems = filteredDashboardItems.map((item) => ({
    ...item,
    fullPath: buildPath(item.path),
  }));

  // API items base paths (always shown, but with companyId for customers)
  const apiItemsBase = [
    { icon: Leaf, label: "Soil Health & Carbon Quality", path: "/admin_soil_health_carbon" },
    { icon: TrendingUp, label: "Crop Yield Forecast & Risk", path: "/admin_crop_yield_carbon" },
    { icon: Cloud, label: "GHG Emissions", path: "/admin_ghg_emission" },
    { icon: Globe, label: "Biodiversity & Land Use Integrity", path: "/admin_biodiversity_land_use" },
    { icon: Droplet, label: "Irrigation Efficiency & Water Risk", path: "/admin_irrigation_water" },
    { icon: Shield, label: "Farm Management Compliance", path: "/admin_farm_compliance" },
    { icon: Zap, label: "Energy Consumption & Renewables", path: "/admin_energy_consumption" },
    { icon: Recycle, label: "Waste Management", path: "/admin_waste_management" },
    { icon: Users, label: "Workforce & Diversity", path: "/admin_workforce_diversity" },
    { icon: ShieldPlus, label: "Health & Safety", path: "/admin_health_safety" },
    { icon: Landmark, label: "Governance & Board Metrics", path: "/admin_governance_board_metrics" },
    { icon: HandHeart, label: "Community Engagement", path: "/admin_community_engagement" },
  ];

  const apiItems = apiItemsBase.map((item) => ({
    ...item,
    fullPath: buildPath(item.path),
  }));

  const handleNavigation = (path: string) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:inset-0 overflow-hidden flex flex-col bg-white border-r border-gray-200`}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between h-14 px-4 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center space-x-3">
            <img src={Logo} alt="MAVHU ESG Dashboard" className="h-8 w-auto" />
            <div>
              <h1 className="text-base font-bold text-gray-900">
                ESG Dashboard
              </h1>
              <p
                className="text-xs font-medium tracking-wide"
                style={{ color: logoGreen }}
              >
                MAVHU Africa
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4 scrollbar-hide">
          {/* Dashboard Section */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider mb-2 text-gray-500">
              Dashboard
            </h2>
            {dashboardItems.map((item, index) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.fullPath;

              return (
                <div
                  key={index}
                  className={`group flex items-center px-3 py-2 rounded-xl transition-all duration-300 cursor-pointer mb-1 ${
                    isActive
                      ? "text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => handleNavigation(item.fullPath)}
                  style={
                    isActive
                      ? {
                          background: `linear-gradient(to right, ${logoGreen}, #006400)`,
                          boxShadow: "0 10px 20px rgba(0, 128, 0, 0.15)",
                        }
                      : {}
                  }
                >
                  <div
                    className={`p-1.5 rounded-lg mr-2.5 transition-all duration-300 ${
                      isActive ? "bg-white/20" : "bg-gray-100"
                    }`}
                  >
                    <IconComponent
                      className={`w-4 h-4 transition-all duration-300 ${
                        isActive
                          ? "text-white"
                          : "text-gray-600 group-hover:text-gray-800"
                      }`}
                    />
                  </div>
                  <div className="flex-1 font-medium text-sm">{item.label}</div>
                  <ChevronRight
                    className={`w-4 h-4 transition-all duration-300 ${
                      isActive
                        ? "text-white opacity-100 translate-x-0.5"
                        : "text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5"
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* APIs Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                ESG APIs
              </h2>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                13
              </span>
            </div>
            <div className="space-y-1">
              {apiItems.map((item, index) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.fullPath;

                return (
                  <div
                    key={index}
                    className={`group flex items-center px-3 py-2 rounded-xl transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => handleNavigation(item.fullPath)}
                    style={
                      isActive
                        ? {
                            background: `linear-gradient(to right, ${logoGreen}, #006400)`,
                            boxShadow: "0 10px 20px rgba(0, 128, 0, 0.15)",
                          }
                        : {}
                    }
                  >
                    <div
                      className={`p-1.5 rounded-lg mr-2.5 transition-all duration-300 ${
                        isActive ? "bg-white/20" : "bg-gray-100"
                      }`}
                    >
                      <IconComponent
                        className={`w-3.5 h-3.5 transition-all duration-300 ${
                          isActive
                            ? "text-white"
                            : "text-gray-600 group-hover:text-gray-800"
                        }`}
                      />
                    </div>
                    <div className="flex-1 font-medium text-sm">{item.label}</div>
                    <ChevronRight
                      className={`w-3 h-3 transition-all duration-300 ${
                        isActive
                          ? "text-white opacity-100 translate-x-0.5"
                          : "text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* API Documentation Link */}
          <div className="mt-4">
            <div
              className="group flex items-center justify-center px-3 py-2 rounded-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:bg-gray-50 text-gray-700"
              onClick={() => handleNavigation(buildPath("/api-documentation"))}
            >
              <Database className="w-4 h-4 mr-2 text-gray-600" />
              <span className="font-medium text-sm">View API Docs</span>
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="px-4 pb-4 pt-3 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="px-2.5 py-1 rounded-lg text-xs font-medium"
                style={{
                  background: `linear-gradient(to right, ${logoGreen}10, ${logoYellow}10)`,
                  border: `1px solid ${logoGreen}20`,
                  color: logoGreen,
                }}
              >
                MAVHU Platform
              </div>
              <span className="text-xs text-gray-400">v1.0.0</span>
            </div>
            <button
              onClick={() => handleNavigation("/admin-logout")}
              className="text-xs font-medium px-2.5 py-1 rounded-full transition-colors text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Custom scrollbar styles */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

export default Sidebar;