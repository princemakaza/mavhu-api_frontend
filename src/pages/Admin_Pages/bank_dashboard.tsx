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
    Building,
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
    Briefcase,
    Mail,
    Phone,
    Globe as GlobeIcon,
    Tag,
    Layers,
    Loader2,
    Shield as ShieldIcon,
    DollarSign,
    Scale,
} from "lucide-react";
import { getCompanyByIdMe, Company } from "../../services/Admin_Service/companies_service";
import { getCompanyPermission, type Permission } from "../../services/Admin_Service/api_permissions_service";
import { MapContainer, TileLayer, Polygon, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import BankSidebar from "@/components/bank_sidebar";

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const BankDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Permissions state
    const [permissions, setPermissions] = useState<Permission | null>(null);
    const [permissionsLoading, setPermissionsLoading] = useState(false);
    const [permissionsError, setPermissionsError] = useState<string | null>(null);

    // Bank color palette (matching BankLogin)
    const primaryNavy = "#0A3B5C";
    const secondaryGold = "#D4AF37";
    const lightBg = "#F0F4F8";

    // Get companyId from localStorage
    const companyId = localStorage.getItem("companyId");

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const response = await getCompanyByIdMe(companyId || "");
                setCompany(response.company);
            } catch (err: any) {
                setError(err.message || "Failed to load company data");
            } finally {
                setLoading(false);
            }
        };

        if (companyId) fetchCompany();
        else {
            setError("No company ID found");
            setLoading(false);
        }
    }, [companyId]);

    // Fetch permissions after company is loaded
    useEffect(() => {
        if (companyId) {
            const fetchPermissions = async () => {
                try {
                    setPermissionsLoading(true);
                    setPermissionsError(null);
                    const response = await getCompanyPermission(companyId);
                    setPermissions(response.permissions);
                } catch (err: any) {
                    if (err.message?.includes('404') || err.response?.status === 404) {
                        setPermissions(null);
                    } else {
                        setPermissionsError(err.message || "Failed to fetch permissions");
                    }
                } finally {
                    setPermissionsLoading(false);
                }
            };
            fetchPermissions();
        }
    }, [companyId]);

    // If no companyId, redirect to login after a short delay
    useEffect(() => {
        if (error && error.includes("No company ID found")) {
            const timer = setTimeout(() => navigate("/bank-login"), 3000);
            return () => clearTimeout(timer);
        }
    }, [error, navigate]);

    // All available APIs with their corresponding permission fields and routes
    const allApis: {
        name: string;
        icon: any;
        path: string;
        permissionField: keyof Permission;
    }[] = [
            { name: "Soil Health API", icon: Leaf, path: "/admin_soil_health_carbon", permissionField: "soilHealthCarbon" },
            { name: "Crop Yield API", icon: TrendingUp, path: "/admin_crop_yield_carbon", permissionField: "cropYieldForecastRisk" },
            { name: "GHG Emissions API", icon: Database, path: "/admin_ghg_emission", permissionField: "ghgEmissions" },
            { name: "Biodiversity API", icon: Globe, path: "/admin_biodiversity_land_use", permissionField: "biodiversityLandUse" },
            { name: "Water Risk API", icon: Droplet, path: "/admin_irrigation_water", permissionField: "irrigationWater" },
        ];

    // Filter APIs based on permissions
    const permittedApis = permissions
        ? allApis.filter(api => permissions[api.permissionField] === true)
        : [];

    // Helper to build API path with companyId
    const getApiPath = (basePath: string) => {
        if (companyId) {
            const cleanBase = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
            return `${cleanBase}/${companyId}`;
        }
        return basePath;
    };

    // Hardcoded API categories (can be replaced with real data later)
    const apiCategories = [
        { name: "Soil Health", usage: 0, icon: Leaf },
        { name: "Water Risk", usage: 0, icon: Droplet },
        { name: "Energy", usage: 0, icon: Zap },
        { name: "Compliance", usage: 0, icon: Shield },

    ];

    // Helper functions for score styling
    const getScoreColor = (score: number) => {
        if (score >= 80) return { text: "text-green-600", bg: "bg-green-100" };
        if (score >= 60) return { text: "text-amber-600", bg: "bg-amber-100" };
        return { text: "text-red-600", bg: "bg-red-100" };
    };

    const getScoreIcon = (score: number) => {
        if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-500" />;
        if (score >= 60) return <AlertCircle className="w-5 h-5 text-amber-500" />;
        return <XCircle className="w-5 h-5 text-red-500" />;
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // Render map if coordinates exist
    const renderMap = () => {
        if (!company?.area_of_interest_metadata?.coordinates) return null;

        const coords = company.area_of_interest_metadata.coordinates.map(c => [c.lat, c.lon] as [number, number]);

        return (
            <div className="mt-4 rounded-xl overflow-hidden border border-gray-300/70 h-64">
                <MapContainer
                    center={coords[0] || [0, 0]}
                    zoom={10}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {coords.length === 1 ? (
                        <Marker position={coords[0]}>
                            <Popup>{company.area_of_interest_metadata?.name || "Area of Interest"}</Popup>
                        </Marker>
                    ) : (
                        <Polygon positions={coords} color={primaryNavy} />
                    )}
                </MapContainer>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50 items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your banking dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen bg-gray-50 items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    {error.includes("No company ID found") && (
                        <p className="text-sm text-gray-500">Redirecting to bank login...</p>
                    )}
                </div>
            </div>
        );
    }

    if (!company) return null;

    // Extract ESG scores – assume they exist on the company object (if not, use defaults)
    const esgScores = {
        overall: 0,
        environmental: 0,
        social: 0,
        governance: 0,
    };
    const apiUsage = { totalCalls: 0, lastUpdated: "" };

    // Dashboard stats for a bank
    const dashboardStats = [
        // Inside dashboardStats array:
        {
            title: "Financed Emissions",
            value: "245K tCO₂e",
            change: "-5.2% vs last year",
            icon: Leaf,
            trending: true, // decreasing emissions is positive
        },
        {
            title: "Risk Rating",
            value: "A-",
            change: "Stable outlook",
            icon: Scale,
            trending: false,
        },
        {
            title: "Active APIs",
            value: permissionsLoading ? "..." : permittedApis.length.toString(),
            change: permissionsLoading ? "Loading..." : "Currently enabled",
            icon: CheckCircle,
            trending: false,
        },
        {
            title: "ESG Score",
            value: esgScores.overall.toString(),
            change: `${esgScores.overall >= 60 ? "Above threshold" : "Needs attention"}`,
            icon: Award,
            trending: true,
        },
    ];

    // ESG metrics breakdown
    const esgMetrics = [
        {
            category: "Environmental",
            score: esgScores.environmental,
            icon: Leaf,
            description: "Carbon footprint, energy use, water management",
        },
        {
            category: "Social",
            score: esgScores.social,
            icon: Users,
            description: "Community investment, labor practices",
        },
        {
            category: "Governance",
            score: esgScores.governance,
            icon: ShieldIcon,
            description: "Board oversight, ethics, transparency",
        },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300">
            <BankSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content */}
            <main className="flex-1 lg:ml-0 transition-all duration-300 bg-gray-50">
                {/* Header */}
                <header
                    className="sticky top-0 z-30 border-b border-gray-300/70 px-6 py-4 backdrop-blur-sm"
                    style={{ background: `${lightBg}/95` }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold" style={{ color: primaryNavy }}>
                                Banking Dashboard
                            </h1>
                            <p className="text-sm text-gray-700">
                                {company.industry} • {company.country}
                            </p>
                        </div>
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden p-2 rounded-lg transition-colors bg-gray-100 hover:bg-gray-200"
                        >
                            <div className="w-6 h-6 flex items-center justify-center">
                                <div className="w-4 h-0.5 bg-gray-600 mb-1"></div>
                                <div className="w-4 h-0.5 bg-gray-600 mb-1"></div>
                                <div className="w-4 h-0.5 bg-gray-600"></div>
                            </div>
                        </button>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="p-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {dashboardStats.map((stat, index) => {
                            const IconComponent = stat.icon;
                            const color = index === 0 ? primaryNavy : index === 2 ? secondaryGold : primaryNavy;

                            return (
                                <div
                                    key={index}
                                    className="bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-300/70 p-6 transition-all duration-300 hover:border-gray-400 shadow-lg shadow-gray-200/50"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div
                                            className="p-3 rounded-xl"
                                            style={{
                                                background: `linear-gradient(to right, ${color}10, ${color}05)`,
                                                border: `1px solid ${color}20`,
                                            }}
                                        >
                                            <IconComponent className="w-6 h-6" style={{ color }} />
                                        </div>
                                        <span
                                            className={`text-sm font-medium ${stat.trending ? "text-green-600" : "text-gray-600"
                                                }`}
                                        >
                                            {stat.change}
                                        </span>
                                    </div>
                                    <h3 className="text-3xl font-bold mb-2" style={{ color }}>
                                        {stat.value}
                                    </h3>
                                    <p className="text-sm text-gray-700">{stat.title}</p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Left Column (2/3 width) */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* ESG Performance Card */}
                            <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-300/70 p-6 shadow-lg shadow-gray-200/50">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-semibold" style={{ color: primaryNavy }}>
                                        ESG Performance
                                    </h2>
                                    <div className="flex items-center space-x-2">
                                        <Award className="w-5 h-5" style={{ color: secondaryGold }} />
                                        <span className="text-sm text-gray-700">
                                            {esgScores.overall >= 60 ? "On Track" : "Attention Needed"}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {esgMetrics.map((metric, index) => {
                                        const scoreColor = getScoreColor(metric.score);
                                        return (
                                            <div
                                                key={index}
                                                className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-300/70 p-5 transition-all duration-300 hover:border-gray-400"
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <div
                                                        className="p-2 rounded-lg"
                                                        style={{
                                                            background: `linear-gradient(to right, ${primaryNavy}10, ${primaryNavy}05)`,
                                                            border: `1px solid ${primaryNavy}20`,
                                                        }}
                                                    >
                                                        <metric.icon className="w-5 h-5" style={{ color: primaryNavy }} />
                                                    </div>
                                                    <div
                                                        className={`px-3 py-1 rounded-full ${scoreColor.bg} ${scoreColor.text}`}
                                                    >
                                                        <span className="text-sm font-semibold">{metric.score}/100</span>
                                                    </div>
                                                </div>
                                                <h3 className="text-lg font-semibold mb-2">{metric.category}</h3>
                                                <p className="text-sm text-gray-700">{metric.description}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Minimal Company Overview Card */}
                            <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-300/70 p-6 shadow-lg shadow-gray-200/50">
                                <h3 className="text-lg font-semibold mb-4" style={{ color: primaryNavy }}>
                                    Company Overview
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600 flex items-center gap-1">
                                            <Tag className="w-4 h-4" /> Registration
                                        </p>
                                        <p className="font-medium">{company.registrationNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 flex items-center gap-1">
                                            <Mail className="w-4 h-4" /> Email
                                        </p>
                                        <p className="font-medium">{company.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 flex items-center gap-1">
                                            <Phone className="w-4 h-4" /> Phone
                                        </p>
                                        <p className="font-medium">{company.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 flex items-center gap-1">
                                            <GlobeIcon className="w-4 h-4" /> Website
                                        </p>
                                        <p className="font-medium">
                                            {company.website ? (
                                                <a
                                                    href={company.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {company.website}
                                                </a>
                                            ) : (
                                                "N/A"
                                            )}
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-600 flex items-center gap-1">
                                            <MapPin className="w-4 h-4" /> Address
                                        </p>
                                        <p className="font-medium">{company.address}</p>
                                    </div>
                                    {company.description && (
                                        <div className="col-span-2">
                                            <p className="text-gray-600 flex items-center gap-1">
                                                <FileText className="w-4 h-4" /> Description
                                            </p>
                                            <p className="font-medium">{company.description}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Area of Interest Card - Prominent */}
                            {company.area_of_interest_metadata && (
                                <div className="bg-white/95 backdrop-blur-xl rounded-2xl border-2 border-gray-300/80 p-6 shadow-lg shadow-gray-200/50">
                                    <h3 className="text-lg font-semibold mb-4" style={{ color: primaryNavy }}>
                                        Area of Interest
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-5 h-5" style={{ color: secondaryGold }} />
                                            <span className="font-medium">{company.area_of_interest_metadata.name}</span>
                                        </div>
                                        <p className="text-sm text-gray-700">
                                            <span className="font-medium">Area covered:</span> {company.area_of_interest_metadata.area_covered}
                                        </p>
                                        {renderMap()}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column (1/3 width) - API Usage & Available APIs */}
                        <div className="space-y-6">
                            {/* API Usage */}
                            <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-300/70 p-6 shadow-lg shadow-gray-200/50">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-semibold" style={{ color: primaryNavy }}>
                                        API Usage
                                    </h2>
                                    <Target className="w-5 h-5" style={{ color: primaryNavy }} />
                                </div>
                                <div className="space-y-4">
                                    {apiCategories.map((api, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div
                                                    className="p-2 rounded-lg"
                                                    style={{
                                                        background: `linear-gradient(to right, ${primaryNavy}10, ${primaryNavy}05)`,
                                                        border: `1px solid ${primaryNavy}20`,
                                                    }}
                                                >
                                                    <api.icon className="w-4 h-4" style={{ color: primaryNavy }} />
                                                </div>
                                                <span className="text-sm font-medium">{api.name}</span>
                                            </div>
                                            <span className="text-sm text-gray-700">
                                                {api.usage.toLocaleString()} calls
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 pt-6 border-t border-gray-300/70">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-700">Total This Month</span>
                                        <span className="font-semibold">
                                            {apiCategories.reduce((acc, api) => acc + api.usage, 0).toLocaleString()}{" "}
                                            calls
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Available APIs - Filtered by Permissions */}
                            <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-300/70 p-6 shadow-lg shadow-gray-200/50">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-semibold" style={{ color: primaryNavy }}>
                                        Available APIs
                                    </h2>
                                    <Database className="w-5 h-5" style={{ color: primaryNavy }} />
                                </div>

                                {permissionsLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin" style={{ color: primaryNavy }} />
                                        <span className="ml-2 text-sm text-gray-600">Loading permissions...</span>
                                    </div>
                                ) : permissionsError ? (
                                    <div className="text-center py-6">
                                        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                        <p className="text-sm text-red-600">{permissionsError}</p>
                                        <button
                                            onClick={() => window.location.reload()}
                                            className="mt-2 text-sm underline"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                ) : permittedApis.length === 0 ? (
                                    <div className="text-center py-8">
                                        <ShieldIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p className="text-gray-600">No APIs are currently accessible.</p>
                                        <p className="text-sm text-gray-500 mt-1">Contact your administrator for access.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        {permittedApis.map((api, index) => (
                                            <button
                                                key={index}
                                                onClick={() => navigate(getApiPath(api.path))}
                                                className="flex items-center space-x-2 p-3 rounded-lg border border-gray-300/70 transition-colors duration-300 hover:bg-gray-100 text-left w-full"
                                            >
                                                <div
                                                    className="p-1.5 rounded-md"
                                                    style={{
                                                        background: `linear-gradient(to right, ${primaryNavy}10, ${primaryNavy}05)`,
                                                        border: `1px solid ${primaryNavy}20`,
                                                    }}
                                                >
                                                    <api.icon className="w-3.5 h-3.5" style={{ color: primaryNavy }} />
                                                </div>
                                                <span className="text-xs font-medium truncate">{api.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {permittedApis.length > 0 && (
                                    <div className="mt-6">
                                        <button
                                            className="w-full py-2.5 rounded-lg font-medium transition-all hover:opacity-90 flex items-center justify-center space-x-2"
                                            style={{
                                                background: `linear-gradient(to right, ${primaryNavy}, ${secondaryGold})`,
                                                color: "#FFFFFF",
                                            }}
                                        >
                                            <span>View All APIs</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-300/70 p-6 shadow-lg shadow-gray-200/50">
                        <h2 className="text-lg font-semibold mb-6" style={{ color: primaryNavy }}>
                            Recent Activity
                        </h2>
                        <div className="space-y-4">
                            {[
                                {
                                    company: "CBZ", // or keep company.name if desired
                                    action: "Quarterly financial report generated",
                                    time: "2 hours ago",
                                    type: "report",
                                },
                                {
                                    company: "CBZ",
                                    action: "New ESG compliance data uploaded",
                                    time: "1 day ago",
                                    type: "add",
                                },
                                {
                                    company: "CBZ",
                                    action: "Risk assessment updated",
                                    time: "3 days ago",
                                    type: "update",
                                },
                            ].map((activity, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-gray-100"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="p-2 rounded-lg"
                                            style={{
                                                background:
                                                    activity.type === "update"
                                                        ? `linear-gradient(to right, ${primaryNavy}10, ${primaryNavy}05)`
                                                        : activity.type === "add"
                                                            ? `linear-gradient(to right, ${secondaryGold}10, ${secondaryGold}05)`
                                                            : "bg-gray-100",
                                                border:
                                                    activity.type === "update"
                                                        ? `1px solid ${primaryNavy}20`
                                                        : activity.type === "add"
                                                            ? `1px solid ${secondaryGold}20`
                                                            : "1px solid transparent",
                                            }}
                                        >
                                            {activity.type === "update" && (
                                                <TrendingUp className="w-4 h-4" style={{ color: primaryNavy }} />
                                            )}
                                            {activity.type === "add" && (
                                                <CheckCircle className="w-4 h-4" style={{ color: secondaryGold }} />
                                            )}
                                            {activity.type === "report" && (
                                                <BarChart className="w-4 h-4" style={{ color: primaryNavy }} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">
                                                {activity.company} – {activity.action}
                                            </p>
                                            <p className="text-xs text-gray-700">{activity.time}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BankDashboard;