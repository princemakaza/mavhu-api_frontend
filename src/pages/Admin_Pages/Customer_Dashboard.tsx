import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
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
} from "lucide-react";
import { getCompanyByIdMe, Company } from "../../services/Admin_Service/companies_service";
import { MapContainer, TileLayer, Polygon, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Customer_Dashboard = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Light mode colors only
    const logoGreen = "#008000";
    const logoYellow = "#B8860B";
    const lightBg = "#F5F5F5";

    // Get companyId from localStorage (needed for API navigation)
    const companyId = localStorage.getItem("companyId");

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                // The getCompanyById function now uses the /companies/me endpoint
                // It does not require a parameter, but we'll keep it for clarity
                const response = await getCompanyByIdMe(companyId || "");
                setCompany(response.company);
            } catch (err: any) {
                setError(err.message || "Failed to load company data");
            } finally {
                setLoading(false);
            }
        };

        fetchCompany();
    }, [companyId]);

    // If no companyId, redirect to login after a short delay
    useEffect(() => {
        if (error && error.includes("No company ID found")) {
            const timer = setTimeout(() => navigate("/login"), 3000);
            return () => clearTimeout(timer);
        }
    }, [error, navigate]);

    // Hardcoded API categories (can be replaced with real data later)
    const apiCategories = [
        { name: "Soil Health", usage: 0, icon: Leaf },
        { name: "Water Risk", usage: 0, icon: Droplet },
        { name: "Energy", usage: 0, icon: Zap },
        { name: "Compliance", usage: 0, icon: Shield },
        { name: "Biodiversity", usage: 0, icon: Globe },
        { name: "Waste", usage: 0, icon: Recycle },
        { name: "Safety", usage: 0, icon: Heart },
    ];

    // All available APIs with their corresponding routes (same as sidebar)
    const allApis = [
        { name: "Soil Health API", icon: Leaf, path: "/admin_soil_health_carbon" },
        { name: "Crop Yield API", icon: TrendingUp, path: "/admin_crop_yield_carbon" },
        { name: "GHG Emissions API", icon: Database, path: "/admin_ghg_emission" },
        { name: "Biodiversity API", icon: Globe, path: "/admin_biodiversity_land_use" },
        { name: "Water Risk API", icon: Droplet, path: "/admin_irrigation_water" },
        { name: "Compliance API", icon: Shield, path: "/admin_farm_compliance" },
        { name: "Energy API", icon: Zap, path: "/admin_energy_consumption" },
        { name: "Waste API", icon: Recycle, path: "/admin_waste_management" },
        { name: "Workforce API", icon: Users, path: "/admin_workforce_diversity" },
        { name: "Health & Safety API", icon: Heart, path: "/admin_health_safety" },
        { name: "Governance API", icon: Building, path: "/admin_governance_board_metrics" },
        { name: "Community API", icon: Users, path: "/admin_community_engagement" },
        { name: "ESG Score API", icon: BarChart, path: "/admin_overall_esg_score" },
    ];

    // Helper to build API path with companyId
    const getApiPath = (basePath: string) => {
        if (companyId) {
            const cleanBase = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
            return `${cleanBase}/${companyId}`;
        }
        return basePath;
    };

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
                        <Polygon positions={coords} color={logoGreen} />
                    )}
                </MapContainer>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50 items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your dashboard...</p>
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
                        <p className="text-sm text-gray-500">Redirecting to login...</p>
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
    const apiUsage = { totalCalls: 0, activeApis: 0, lastUpdated: "" };

    // Dashboard stats for this single company
    const dashboardStats = [
        {
            title: "ESG Score",
            value: esgScores.overall.toString(),
            change: `${esgScores.overall >= 60 ? "Good" : "Needs improvement"}`,
            icon: TrendingUp,
            trending: true,
        },
        {
            title: "Total API Calls",
            value: 13,
            change: "Last 30 days",
            icon: Activity,
            trending: true,
        },
        {
            title: "Active APIs",
            value: apiUsage.activeApis.toString(),
            change: "Currently enabled",
            icon: CheckCircle,
            trending: false,
        },
        {
            title: "Last Updated",
            value: new Date(apiUsage.lastUpdated || Date.now()).toLocaleDateString(),
            change: "ESG data",
            icon: Database,
            trending: false,
        },
    ];

    // ESG metrics breakdown
    const esgMetrics = [
        {
            category: "Environmental",
            score: esgScores.environmental,
            icon: Leaf,
            description: "Carbon emissions, energy use, water management",
        },
        {
            category: "Social",
            score: esgScores.social,
            icon: Users,
            description: "Employee welfare, community impact, diversity",
        },
        {
            category: "Governance",
            score: esgScores.governance,
            icon: Shield,
            description: "Board diversity, ethics, transparency",
        },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content */}
            <main className="flex-1 lg:ml-0 transition-all duration-300 bg-gray-50">
                {/* Header */}
                <header
                    className="sticky top-0 z-30 border-b border-gray-300/70 px-6 py-4 backdrop-blur-sm"
                    style={{ background: `${lightBg}/95` }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold" style={{ color: logoGreen }}>
                                {company.name} – ESG Dashboard
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
                            const color = index === 0 ? logoGreen : index === 2 ? logoYellow : logoGreen;

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
                        {/* ESG Scores Overview */}
                        <div className="lg:col-span-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-300/70 p-6 shadow-lg shadow-gray-200/50">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold" style={{ color: logoGreen }}>
                                    ESG Performance
                                </h2>
                                <div className="flex items-center space-x-2">
                                    <Award className="w-5 h-5" style={{ color: logoYellow }} />
                                    <span className="text-sm text-gray-700">
                                        {esgScores.overall >= 60 ? "On Track" : "Attention Needed"}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                                                        background: `linear-gradient(to right, ${logoGreen}10, ${logoGreen}05)`,
                                                        border: `1px solid ${logoGreen}20`,
                                                    }}
                                                >
                                                    <metric.icon className="w-5 h-5" style={{ color: logoGreen }} />
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

                            {/* Company Details Card - Enhanced */}
                            <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-300/70 p-5">
                                <h3 className="text-lg font-semibold mb-4" style={{ color: logoGreen }}>
                                    Company Information
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
                                    {company.purpose && (
                                        <div className="col-span-2">
                                            <p className="text-gray-600 flex items-center gap-1">
                                                <Target className="w-4 h-4" /> Purpose
                                            </p>
                                            <p className="font-medium">{company.purpose}</p>
                                        </div>
                                    )}
                                    {company.scope && (
                                        <div>
                                            <p className="text-gray-600 flex items-center gap-1">
                                                <Layers className="w-4 h-4" /> Scope
                                            </p>
                                            <p className="font-medium">{company.scope}</p>
                                        </div>
                                    )}
                                    {company.data_source && company.data_source.length > 0 && (
                                        <div>
                                            <p className="text-gray-600 flex items-center gap-1">
                                                <Database className="w-4 h-4" /> Data Sources
                                            </p>
                                            <p className="font-medium">{company.data_source.join(', ')}</p>
                                        </div>
                                    )}
                                    {company.esg_reporting_framework && company.esg_reporting_framework.length > 0 && (
                                        <div>
                                            <p className="text-gray-600 flex items-center gap-1">
                                                <Award className="w-4 h-4" /> ESG Frameworks
                                            </p>
                                            <p className="font-medium">{company.esg_reporting_framework.join(', ')}</p>
                                        </div>
                                    )}
                                    {company.latest_esg_report_year && (
                                        <div>
                                            <p className="text-gray-600 flex items-center gap-1">
                                                <Calendar className="w-4 h-4" /> Latest ESG Report Year
                                            </p>
                                            <p className="font-medium">{company.latest_esg_report_year}</p>
                                        </div>
                                    )}
                                    {company.esg_data_status && (
                                        <div>
                                            <p className="text-gray-600 flex items-center gap-1">
                                                <Activity className="w-4 h-4" /> ESG Data Status
                                            </p>
                                            <p className="font-medium capitalize">{company.esg_data_status.replace('_', ' ')}</p>
                                        </div>
                                    )}
                                    {company.has_esg_linked_pay !== undefined && (
                                        <div>
                                            <p className="text-gray-600 flex items-center gap-1">
                                                <Briefcase className="w-4 h-4" /> ESG Linked Pay
                                            </p>
                                            <p className="font-medium">{company.has_esg_linked_pay ? 'Yes' : 'No'}</p>
                                        </div>
                                    )}
                                    {company.esg_contact_person && (
                                        <div className="col-span-2">
                                            <p className="text-gray-600 flex items-center gap-1">
                                                <Users className="w-4 h-4" /> ESG Contact
                                            </p>
                                            <p className="font-medium">
                                                {company.esg_contact_person.name} – {company.esg_contact_person.email} – {company.esg_contact_person.phone}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Area of Interest Map */}
                                {company.area_of_interest_metadata && (
                                    <div className="mt-6">
                                        <h4 className="text-md font-semibold mb-2" style={{ color: logoGreen }}>
                                            Area of Interest: {company.area_of_interest_metadata.name}
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-2">
                                            Area covered: {company.area_of_interest_metadata.area_covered}
                                        </p>
                                        {renderMap()}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* API Usage & Available APIs */}
                        <div className="space-y-6">
                            {/* API Usage */}
                            <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-300/70 p-6 shadow-lg shadow-gray-200/50">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-semibold" style={{ color: logoGreen }}>
                                        API Usage
                                    </h2>
                                    <Target className="w-5 h-5" style={{ color: logoGreen }} />
                                </div>
                                <div className="space-y-4">
                                    {apiCategories.map((api, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div
                                                    className="p-2 rounded-lg"
                                                    style={{
                                                        background: `linear-gradient(to right, ${logoGreen}10, ${logoGreen}05)`,
                                                        border: `1px solid ${logoGreen}20`,
                                                    }}
                                                >
                                                    <api.icon className="w-4 h-4" style={{ color: logoGreen }} />
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

                            {/* Available APIs - Now Clickable */}
                            <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-300/70 p-6 shadow-lg shadow-gray-200/50">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-semibold" style={{ color: logoGreen }}>
                                        Available APIs
                                    </h2>
                                    <Database className="w-5 h-5" style={{ color: logoGreen }} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {allApis.map((api, index) => (
                                        <button
                                            key={index}
                                            onClick={() => navigate(getApiPath(api.path))}
                                            className="flex items-center space-x-2 p-3 rounded-lg border border-gray-300/70 transition-colors duration-300 hover:bg-gray-100 text-left w-full"
                                        >
                                            <div
                                                className="p-1.5 rounded-md"
                                                style={{
                                                    background: `linear-gradient(to right, ${logoGreen}10, ${logoGreen}05)`,
                                                    border: `1px solid ${logoGreen}20`,
                                                }}
                                            >
                                                <api.icon className="w-3.5 h-3.5" style={{ color: logoGreen }} />
                                            </div>
                                            <span className="text-xs font-medium truncate">{api.name}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-6">
                                    <button
                                        className="w-full py-2.5 rounded-lg font-medium transition-all hover:opacity-90 flex items-center justify-center space-x-2"
                                        style={{
                                            background: `linear-gradient(to right, ${logoGreen}, #006400)`,
                                            color: "#FFFFFF",
                                        }}
                                    >
                                        <span>View All APIs</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity (filtered to this company) */}
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-300/70 p-6 shadow-lg shadow-gray-200/50">
                        <h2 className="text-lg font-semibold mb-6" style={{ color: logoGreen }}>
                            Recent Activity
                        </h2>
                        <div className="space-y-4">
                            {[
                                {
                                    company: company.name,
                                    action: "ESG data updated",
                                    time: "2 hours ago",
                                    type: "update",
                                },
                                {
                                    company: company.name,
                                    action: "New compliance data added",
                                    time: "1 day ago",
                                    type: "add",
                                },
                                {
                                    company: company.name,
                                    action: "Quarterly report generated",
                                    time: "3 days ago",
                                    type: "report",
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
                                                        ? `linear-gradient(to right, ${logoGreen}10, ${logoGreen}05)`
                                                        : activity.type === "add"
                                                            ? `linear-gradient(to right, ${logoYellow}10, ${logoYellow}05)`
                                                            : "bg-gray-100",
                                                border:
                                                    activity.type === "update"
                                                        ? `1px solid ${logoGreen}20`
                                                        : activity.type === "add"
                                                            ? `1px solid ${logoYellow}20`
                                                            : "1px solid transparent",
                                            }}
                                        >
                                            {activity.type === "update" && (
                                                <TrendingUp className="w-4 h-4" style={{ color: logoGreen }} />
                                            )}
                                            {activity.type === "add" && (
                                                <CheckCircle className="w-4 h-4" style={{ color: logoYellow }} />
                                            )}
                                            {activity.type === "report" && (
                                                <BarChart className="w-4 h-4" style={{ color: logoGreen }} />
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

export default Customer_Dashboard;