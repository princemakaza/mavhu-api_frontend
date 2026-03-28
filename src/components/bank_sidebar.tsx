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

const BankSidebar = ({ isOpen = true, onClose = () => { } }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Bank color palette
  const primaryNavy = "#0A3B5C";
  const secondaryGold = "#D4AF37";

  // Get companyId from localStorage
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const storedCompanyId = localStorage.getItem("companyId");
    setCompanyId(storedCompanyId);
  }, []);

  // Helper to build path with companyId
  const buildPath = (basePath: string): string => {
    if (companyId) {
      const cleanBase = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
      return `${cleanBase}/${companyId}`;
    }
    return basePath;
  };

  // Dashboard items – no companyId appended
  const dashboardItems = [
    {
      icon: LayoutDashboard,
      label: "Banking Dashboard",
      fullPath: "/bank_dashboard", // ✅ Clean route
    },
  ];

  // API items – keep companyId for these
  const apiItemsBase = [
    { icon: Leaf, label: "Soil Health & Carbon Quality", path: "/bank_financed_emissions" },
    { icon: TrendingUp, label: "Crop Yield Forecast & Risk", path: "/bank_crop_yield" },
    { icon: Cloud, label: "GHG Emissions", path: "/bank_ghg_emissions" },
    { icon: Globe, label: "Biodiversity & Land Use Integrity", path: "/admin_biodiversity_land_use" },
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

  // External API docs URL
  const apiDocsUrl = "http://44.223.50.135:8080/api-docs/";

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
        className={`fixed inset-y-0 left-0 z-50 w-72 transform ${isOpen ? "translate-x-0" : "-translate-x-full"
          } transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:inset-0 overflow-hidden flex flex-col bg-white border-r border-gray-200`}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between h-14 px-4 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center space-x-3">
            <img src={Logo} alt="MAVHU ESG Dashboard" className="h-8 w-auto" />
            <div>
              <h1 className="text-base font-bold text-gray-900">
                Bank Dashboard
              </h1>
              <p
                className="text-xs font-medium tracking-wide"
                style={{ color: primaryNavy }}
              >
                MAVHU Finance
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
                  className={`group flex items-center px-3 py-2 rounded-xl transition-all duration-300 cursor-pointer mb-1 ${isActive
                    ? "text-white"
                    : "text-gray-700 hover:bg-gray-50"
                    }`}
                  onClick={() => handleNavigation(item.fullPath)}
                  style={
                    isActive
                      ? {
                        background: `linear-gradient(to right, ${primaryNavy}, #05283e)`,
                        boxShadow: "0 10px 20px rgba(10, 59, 92, 0.15)",
                      }
                      : {}
                  }
                >
                  <div
                    className={`p-1.5 rounded-lg mr-2.5 transition-all duration-300 ${isActive ? "bg-white/20" : "bg-gray-100"
                      }`}
                  >
                    <IconComponent
                      className={`w-4 h-4 transition-all duration-300 ${isActive
                        ? "text-white"
                        : "text-gray-600 group-hover:text-gray-800"
                        }`}
                    />
                  </div>
                  <div className="flex-1 font-medium text-sm">{item.label}</div>
                  <ChevronRight
                    className={`w-4 h-4 transition-all duration-300 ${isActive
                      ? "text-white opacity-100 translate-x-0.5"
                      : "text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5"
                      }`}
                  />
                </div>
              );
            })}
          </div>

          {/* ESG APIs Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                ESG APIs
              </h2>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {apiItems.length}
              </span>
            </div>

            <div className="space-y-1">
              {apiItems.map((item, index) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.fullPath;

                return (
                  <div
                    key={index}
                    className={`group flex items-center px-3 py-2 rounded-xl transition-all duration-300 cursor-pointer ${isActive
                      ? "text-white"
                      : "text-gray-700 hover:bg-gray-50"
                      }`}
                    onClick={() => handleNavigation(item.fullPath)}
                    style={
                      isActive
                        ? {
                          background: `linear-gradient(to right, ${primaryNavy}, #05283e)`,
                          boxShadow: "0 10px 20px rgba(10, 59, 92, 0.15)",
                        }
                        : {}
                    }
                  >
                    <div
                      className={`p-1.5 rounded-lg mr-2.5 transition-all duration-300 ${isActive ? "bg-white/20" : "bg-gray-100"
                        }`}
                    >
                      <IconComponent
                        className={`w-3.5 h-3.5 transition-all duration-300 ${isActive
                          ? "text-white"
                          : "text-gray-600 group-hover:text-gray-800"
                          }`}
                      />
                    </div>
                    <div className="flex-1 font-medium text-sm">{item.label}</div>
                    <ChevronRight
                      className={`w-3 h-3 transition-all duration-300 ${isActive
                        ? "text-white opacity-100 translate-x-0.5"
                        : "text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5"
                        }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* API Documentation Link – external URL */}
          <div className="mt-4">
            <div
              className="group flex items-center justify-center px-3 py-2 rounded-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:bg-gray-50 text-gray-700"
              onClick={() => window.open(apiDocsUrl, '_blank', 'noopener,noreferrer')}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  window.open(apiDocsUrl, '_blank', 'noopener,noreferrer');
                }
              }}
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
                  background: `linear-gradient(to right, ${primaryNavy}10, ${secondaryGold}10)`,
                  border: `1px solid ${primaryNavy}20`,
                  color: primaryNavy,
                }}
              >
                MAVHU Bank
              </div>
              <span className="text-xs text-gray-400">v1.0.0</span>
            </div>
            <button
              onClick={() => handleNavigation("/bank-login")}
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

export default BankSidebar;