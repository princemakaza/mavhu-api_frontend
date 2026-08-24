import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    TrendingUp,
    Users,
    Leaf,
    Droplet,
    Zap,
    Shield,
    Globe,
    Recycle,
    Heart,
    BarChart,
    Activity,
    Award,
    Target,
    CheckCircle,
    XCircle,
    AlertCircle,
    Database,
    ArrowRight,
    MapPin,
    Calendar,
    FileText,
    Mail,
    Phone,
    Globe as GlobeIcon,
    Layers,
    Loader2,
    Shield as ShieldIcon,
    Scale,
    Landmark,
    LogOut,
} from "lucide-react";
import BankSidebar from "@/components/bank_sidebar";
import { type Bank, type BankUser } from "../../services/Admin_Service/bank_service";

const primaryNavy = "#0A3B5C";
const secondaryGold = "#D4AF37";
const lightBg = "#F0F4F8";

const BankDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [bank, setBank] = useState<Bank | null>(null);
    const [bankUser, setBankUser] = useState<BankUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedBank = localStorage.getItem("bankInfo");
            const storedUser = localStorage.getItem("bankUser");
            const token = localStorage.getItem("bankToken");

            if (!token || !storedBank || !storedUser) {
                navigate("/bank_login");
                return;
            }

            setBank(JSON.parse(storedBank));
            setBankUser(JSON.parse(storedUser));
        } catch {
            navigate("/bank_login");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("bankToken");
        localStorage.removeItem("bankUser");
        localStorage.removeItem("bankInfo");
        localStorage.removeItem("authToken");
        navigate("/bank_login");
    };

    // Environmental APIs available to bank users
    const envApis: { name: string; icon: any; path: string; description: string }[] = [
        { name: "Soil Health & Carbon", icon: Leaf, path: "/bank_financed_emissions", description: "Soil quality and carbon sequestration metrics" },
        { name: "Crop Yield Forecast", icon: TrendingUp, path: "/bank_crop_yield", description: "Agricultural productivity and risk assessment" },
        { name: "GHG Emissions", icon: Globe, path: "/bank_ghg_emissions", description: "Greenhouse gas emissions tracking" },
        { name: "Biodiversity & Land Use", icon: Globe, path: "/bank_biodiversity_land_use", description: "Ecosystem and species diversity data" },
        { name: "Irrigation & Water Risk", icon: Droplet, path: "/admin_irrigation_water", description: "Water scarcity and irrigation efficiency" },
        { name: "Farm Compliance", icon: Shield, path: "/admin_farm_compliance", description: "Agricultural regulatory compliance" },
        { name: "Energy Consumption", icon: Zap, path: "/admin_energy_consumption", description: "Energy usage and renewables data" },
        { name: "Waste Management", icon: Recycle, path: "/admin_waste_management", description: "Waste tracking and recycling metrics" },
    ];

    const dashboardStats = [
        { title: "Available APIs", value: envApis.length.toString(), change: "Environmental data access", icon: Database, color: primaryNavy },
        { title: "Bank Status", value: bank?.status === "active" ? "Active" : "Inactive", change: "Account standing", icon: CheckCircle, color: "#16a34a" },
        { title: "User Role", value: bankUser?.role === "admin" ? "Admin" : "User", change: "Access level", icon: ShieldIcon, color: secondaryGold },
        { title: "ESG Focus", value: "8 APIs", change: "Environmental metrics", icon: Leaf, color: primaryNavy },
    ];

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50 items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: primaryNavy }} />
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!bank || !bankUser) return null;

    return (
        <div className="flex min-h-screen text-gray-900 transition-colors duration-300" style={{ backgroundColor: lightBg }}>
            <BankSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 lg:ml-0 transition-all duration-300" style={{ backgroundColor: lightBg }}>
                {/* Header */}
                <header
                    className="sticky top-0 z-30 border-b border-gray-300/70 px-6 py-4 backdrop-blur-sm"
                    style={{ background: `${lightBg}F5` }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                <div className="w-5 h-5 flex flex-col justify-center gap-1">
                                    <div className="h-0.5 bg-gray-600 w-full" />
                                    <div className="h-0.5 bg-gray-600 w-full" />
                                    <div className="h-0.5 bg-gray-600 w-full" />
                                </div>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold" style={{ color: primaryNavy }}>
                                    Banking Dashboard
                                </h1>
                                <p className="text-sm text-gray-600">
                                    Welcome, <span className="font-medium">{bankUser.first_name} {bankUser.last_name}</span> • {bank.name}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div
                                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium"
                                style={{ background: `${primaryNavy}10`, color: primaryNavy, border: `1px solid ${primaryNavy}20` }}
                            >
                                <Landmark className="w-3.5 h-3.5" />
                                {bank.reference_id}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors border border-red-200"
                            >
                                <LogOut className="w-3.5 h-3.5" /> Logout
                            </button>
                        </div>
                    </div>
                </header>

                <div className="p-6 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {dashboardStats.map((stat, i) => {
                            const Icon = stat.icon;
                            return (
                                <div key={i} className="bg-white/95 rounded-2xl border border-gray-300/70 p-5 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2.5 rounded-xl" style={{ background: `${stat.color}10`, border: `1px solid ${stat.color}20` }}>
                                            <Icon className="w-5 h-5" style={{ color: stat.color }} />
                                        </div>
                                        <span className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</span>
                                    </div>
                                    <p className="font-semibold text-gray-900 text-sm">{stat.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{stat.change}</p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Environmental APIs */}
                        <div className="lg:col-span-2 bg-white/95 rounded-2xl border border-gray-300/70 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-semibold" style={{ color: primaryNavy }}>Environmental APIs</h2>
                                <span
                                    className="text-xs font-medium px-2.5 py-1 rounded-full"
                                    style={{ background: `${secondaryGold}15`, color: secondaryGold, border: `1px solid ${secondaryGold}30` }}
                                >
                                    {envApis.length} Available
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {envApis.map((api, i) => {
                                    const Icon = api.icon;
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => navigate(api.path)}
                                            className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-left group"
                                        >
                                            <div className="p-2 rounded-lg flex-shrink-0 transition-colors" style={{ background: `${primaryNavy}08`, border: `1px solid ${primaryNavy}15` }}>
                                                <Icon className="w-4 h-4" style={{ color: primaryNavy }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">{api.name}</p>
                                                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{api.description}</p>
                                            </div>
                                            <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right column */}
                        <div className="space-y-5">
                            {/* Bank Info */}
                            <div className="bg-white/95 rounded-2xl border border-gray-300/70 p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <Landmark className="w-4 h-4" style={{ color: primaryNavy }} />
                                    <h2 className="text-base font-semibold" style={{ color: primaryNavy }}>Bank Details</h2>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-0.5">Bank Name</p>
                                        <p className="font-semibold text-gray-900">{bank.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-0.5">Reference ID</p>
                                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-700">{bank.reference_id}</span>
                                    </div>
                                    {bank.country && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                            <span>{bank.country}</span>
                                        </div>
                                    )}
                                    {bank.email && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                                            <span className="truncate">{bank.email}</span>
                                        </div>
                                    )}
                                    {bank.phone && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                                            <span>{bank.phone}</span>
                                        </div>
                                    )}
                                    {bank.description && (
                                        <p className="text-xs text-gray-500 leading-relaxed pt-1 border-t border-gray-100">{bank.description}</p>
                                    )}
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="bg-white/95 rounded-2xl border border-gray-300/70 p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <Users className="w-4 h-4" style={{ color: primaryNavy }} />
                                    <h2 className="text-base font-semibold" style={{ color: primaryNavy }}>Signed In As</h2>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                            style={{ background: `linear-gradient(135deg, ${primaryNavy}, ${secondaryGold})` }}
                                        >
                                            {bankUser.first_name[0]}{bankUser.last_name[0]}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{bankUser.first_name} {bankUser.last_name}</p>
                                            <p className="text-xs text-gray-500">{bankUser.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                        <span className="text-xs text-gray-500">Role</span>
                                        <span
                                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${bankUser.role === "admin" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}
                                        >
                                            {bankUser.role}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Status</span>
                                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                            {bankUser.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* API Docs */}
                            <button
                                onClick={() => window.open("http://13.62.58.227:8081/api-docs/", "_blank", "noopener,noreferrer")}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                            >
                                <Database className="w-4 h-4" />
                                View API Documentation
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BankDashboard;
