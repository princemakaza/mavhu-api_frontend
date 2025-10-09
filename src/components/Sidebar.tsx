import logo from "@/assets/logo2.png";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  // Get admin data from localStorage (stored after login)
  const adminData = JSON.parse(localStorage.getItem("adminData"));
  const role = adminData?.role;

  // Define nav items
  let navItems = [
    { label: "DASHBOARD", path: "/admin_dashboard" },
    { label: "SUBJECTS", path: "/courses" },
    { label: "STUDENTS", path: "/students_dashboard" },
    { label: "CHAT", path: "/chat" },
    { label: "LIBRARY", path: "/library" },
    { label: "WALLET", path: "/reserourcewalle" },
    { label: "EXAMS", path: "/exams" },
    { label: "HELP DESK", path: "/help_desk" },
    { label: "ADMINSTRATION", path: "/all_admins_page" },
    { label: "TRASH", path: "/content_trash" },
    { label: "PROFILE", path: "/admin_profile" },
  ];

  // Filter items if role is teacher
  if (role === "teacher") {
    navItems = navItems.filter(
      (item) =>
        item.label !== "ADMINSTRATION" &&
        item.label !== "TRASH"
    );
  }

  return (
    <aside className="w-48 min-h-screen flex flex-col shadow-md">
      {/* Logo Section */}
      <div className="flex justify-center py-6">
        <div className="relative">
          <div className="w-24 h-24 flex items-center justify-center overflow-hidden">
            <img src={logo} className="w-full" alt="TOTO" />
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-2 mb-2 rounded-[5px] font-medium text-sm transition-all duration-200 ${isActive
                ? "bg-blue-800 text-white shadow-sm"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`
            }
          >
            {item.label}
          </NavLink>


        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
