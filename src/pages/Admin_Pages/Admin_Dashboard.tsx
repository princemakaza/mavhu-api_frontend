import React, { useState } from "react";
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
} from "lucide-react";

const Admin_Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeCompany, setActiveCompany] = useState<string | null>(null);

    // Light mode colors only
    const logoGreen = "#008000";
    const logoYellow = "#B8860B";
    const lightBg = "#F5F5F5";
    const lightCardBg = "#FFFFFF";

    // Hardcoded company data
    const companies = [
        {
            "name": "CBZ Holdings Limited",
            "registrationNumber": "CBZ-200001",
            "email": "info@cbz.co.zw",
            "phone": "+263242700000",
            "address": "CBZ House, 5th Street, Harare, Zimbabwe",
            "website": "https://www.cbz.co.zw",
            "country": "Zimbabwe",
            "industry": "Banking & Financial Services",
            "description": "A leading financial services group in Zimbabwe offering banking, insurance, and investment services.",
            "esgScores": {
                "overall": 0,
                "environmental": 0,
                "social": 0,
                "governance": 0
            },
            "apiUsage": {
                "totalCalls": 0,
                "activeApis": 0,
                "lastUpdated": "2024-01-15"
            }
        },
        {
            "name": "Tongaat Hulett Zimbabwe Limited",
            "registrationNumber": "THZ-190055",
            "email": "info@tongaat.co.zw",
            "phone": "+263242700111",
            "address": "Tongaat Hulett House, Cleveland Road, Harare, Zimbabwe",
            "website": "https://www.tongaat.co.zw",
            "country": "Zimbabwe",
            "industry": "Agriculture & Sugar Production",
            "description": "A leading sugar producer in Zimbabwe with extensive sugar cane plantations and milling operations.",
            "esgScores": {
                "overall": 0,
                "environmental": 0,
                "social": 0,
                "governance": 0
            },
            "apiUsage": {
                "totalCalls": 0,
                "activeApis": 0,
                "lastUpdated": "2024-01-14"
            }
        }
    ];

    // Overall dashboard stats
    const dashboardStats = [
        {
            title: "Total Companies",
            value: companies.length.toString(),
            change: "0+ this month",
            icon: Building,
            trending: true
        },
        {
            title: "Avg ESG Score",
            value: Math.round(companies.reduce((acc, company) => acc + company.esgScores.overall, 0) / companies.length).toString(),
            change: "0% from last month",
            icon: TrendingUp,
            trending: true
        },
        {
            title: "Total API Calls",
            value: companies.reduce((acc, company) => acc + company.apiUsage.totalCalls, 0).toLocaleString(),
            change: "0% this month",
            icon: Activity,
            trending: true
        },
        {
            title: "Active APIs",
            value: "0",
            change: "All systems operational",
            icon: CheckCircle,
            trending: false
        }
    ];

    // ESG metrics breakdown
    const esgMetrics = [
        {
            category: "Environmental",
            score: Math.round(companies.reduce((acc, company) => acc + company.esgScores.environmental, 0) / companies.length),
            icon: Leaf,
            description: "Carbon emissions, energy use, water management"
        },
        {
            category: "Social",
            score: Math.round(companies.reduce((acc, company) => acc + company.esgScores.social, 0) / companies.length),
            icon: Users,
            description: "Employee welfare, community impact, diversity"
        },
        {
            category: "Governance",
            score: Math.round(companies.reduce((acc, company) => acc + company.esgScores.governance, 0) / companies.length),
            icon: Shield,
            description: "Board diversity, ethics, transparency"
        }
    ];

    // API usage by category
    const apiCategories = [
        { name: "Soil Health", usage: 0, icon: Leaf },
        { name: "Water Risk", usage: 0, icon: Droplet },
        { name: "Energy", usage: 0, icon: Zap },
        { name: "Compliance", usage: 0, icon: Shield },
        { name: "Biodiversity", usage: 0, icon: Globe },
        { name: "Waste", usage: 0, icon: Recycle },
        { name: "Safety", usage: 0, icon: Heart }
    ];

    // All available APIs
    const allApis = [
        { name: "Soil Health API", icon: Leaf },
        { name: "Crop Yield API", icon: TrendingUp },
        { name: "GHG Emissions API", icon: Database },
        { name: "Biodiversity API", icon: Globe },
        { name: "Water Risk API", icon: Droplet },
        { name: "Compliance API", icon: Shield },
        { name: "Energy API", icon: Zap },
        { name: "Waste API", icon: Recycle },
        { name: "Workforce API", icon: Users },
        { name: "Health & Safety API", icon: Heart },
        { name: "Governance API", icon: Building },
        { name: "Community API", icon: Users },
        { name: "ESG Score API", icon: BarChart }
    ];

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

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300">
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

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
                                ESG Dashboard
                            </h1>
                            <p className="text-sm text-gray-700">
                                Monitoring Environmental, Social & Governance metrics across all companies
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
                            const color = index === 1 ? logoGreen : index === 3 ? logoYellow : logoGreen;

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
                                                border: `1px solid ${color}20`
                                            }}
                                        >
                                            <IconComponent className="w-6 h-6" style={{ color }} />
                                        </div>
                                        <span className={`text-sm font-medium ${stat.trending ? 'text-green-600' : 'text-gray-600'}`}>
                                            {stat.change}
                                        </span>
                                    </div>
                                    <h3 className="text-3xl font-bold mb-2" style={{ color }}>
                                        {stat.value}
                                    </h3>
                                    <p className="text-sm text-gray-700">
                                        {stat.title}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* ESG Scores Overview */}
                        <div className="lg:col-span-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-300/70 p-6 shadow-lg shadow-gray-200/50">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold" style={{ color: logoGreen }}>
                                    ESG Scores Overview
                                </h2>
                                <div className="flex items-center space-x-2">
                                    <Award className="w-5 h-5" style={{ color: logoYellow }} />
                                    <span className="text-sm text-gray-700">
                                        Industry Average: 78.5
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
                                                        border: `1px solid ${logoGreen}20`
                                                    }}
                                                >
                                                    <metric.icon className="w-5 h-5" style={{ color: logoGreen }} />
                                                </div>
                                                <div className={`px-3 py-1 rounded-full ${scoreColor.bg} ${scoreColor.text}`}>
                                                    <span className="text-sm font-semibold">{metric.score}/100</span>
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2">
                                                {metric.category}
                                            </h3>
                                            <p className="text-sm text-gray-700">
                                                {metric.description}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Companies List */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4" style={{ color: logoGreen }}>
                                    Registered Companies
                                </h3>
                                <div className="space-y-4">
                                    {companies.map((company, index) => {
                                        const scoreColor = getScoreColor(company.esgScores.overall);
                                        const isActive = activeCompany === company.registrationNumber;

                                        return (
                                            <div
                                                key={index}
                                                className={`flex items-center justify-between p-4 rounded-xl border transition-colors duration-300 cursor-pointer ${
                                                    isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300/70 hover:bg-gray-100'
                                                }`}
                                                onClick={() => setActiveCompany(company.registrationNumber)}
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div
                                                        className="p-3 rounded-lg"
                                                        style={{
                                                            background: `linear-gradient(to right, ${
                                                                index % 2 === 0 ? logoGreen : logoYellow
                                                            }10, ${index % 2 === 0 ? logoGreen : logoYellow}05)`,
                                                            border: `1px solid ${
                                                                index % 2 === 0 ? logoGreen : logoYellow
                                                            }20`
                                                        }}
                                                    >
                                                        <Building 
                                                            className="w-6 h-6" 
                                                            style={{ color: index % 2 === 0 ? logoGreen : logoYellow }} 
                                                        />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">
                                                            {company.name}
                                                        </h4>
                                                        <p className="text-sm text-gray-700">
                                                            {company.industry}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold" style={{ color: scoreColor.text }}>
                                                            {company.esgScores.overall}
                                                        </div>
                                                        <div className="text-sm text-gray-700">
                                                            ESG Score
                                                        </div>
                                                    </div>
                                                    {getScoreIcon(company.esgScores.overall)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* API Usage & Company Details */}
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
                                                        border: `1px solid ${logoGreen}20`
                                                    }}
                                                >
                                                    <api.icon className="w-4 h-4" style={{ color: logoGreen }} />
                                                </div>
                                                <span className="text-sm font-medium">
                                                    {api.name}
                                                </span>
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
                                            {apiCategories.reduce((acc, api) => acc + api.usage, 0).toLocaleString()} calls
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Available APIs */}
                            <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-300/70 p-6 shadow-lg shadow-gray-200/50">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-semibold" style={{ color: logoGreen }}>
                                        Available APIs
                                    </h2>
                                    <Database className="w-5 h-5" style={{ color: logoGreen }} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {allApis.map((api, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center space-x-2 p-3 rounded-lg border border-gray-300/70 transition-colors duration-300 hover:bg-gray-100"
                                        >
                                            <div
                                                className="p-1.5 rounded-md"
                                                style={{
                                                    background: `linear-gradient(to right, ${logoGreen}10, ${logoGreen}05)`,
                                                    border: `1px solid ${logoGreen}20`
                                                }}
                                            >
                                                <api.icon className="w-3.5 h-3.5" style={{ color: logoGreen }} />
                                            </div>
                                            <span className="text-xs font-medium truncate">{api.name}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6">
                                    <button
                                        className="w-full py-2.5 rounded-lg font-medium transition-all hover:opacity-90 flex items-center justify-center space-x-2"
                                        style={{
                                            background: `linear-gradient(to right, ${logoGreen}, #006400)`,
                                            color: '#FFFFFF',
                                        }}
                                    >
                                        <span>View All APIs</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Company Details */}
                            {activeCompany && (
                                <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-300/70 p-6 shadow-lg shadow-gray-200/50">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-lg font-semibold" style={{ color: logoGreen }}>
                                            Company Details
                                        </h2>
                                        <button
                                            onClick={() => setActiveCompany(null)}
                                            className="p-1 rounded hover:bg-gray-100"
                                        >
                                            <XCircle className="w-5 h-5" style={{ color: logoGreen }} />
                                        </button>
                                    </div>

                                    {(() => {
                                        const company = companies.find(c => c.registrationNumber === activeCompany);
                                        if (!company) return null;

                                        return (
                                            <>
                                                <div className="mb-6">
                                                    <h3 className="text-xl font-bold mb-2">
                                                        {company.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-700 mb-4">
                                                        {company.description}
                                                    </p>

                                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                                        <div>
                                                            <p className="text-xs text-gray-600 mb-1">Industry</p>
                                                            <p className="text-sm font-medium">
                                                                {company.industry}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-600 mb-1">Country</p>
                                                            <p className="text-sm font-medium">
                                                                {company.country}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* ESG Scores Breakdown */}
                                                <div className="mb-6">
                                                    <h4 className="text-sm font-semibold mb-3">
                                                        ESG Scores Breakdown
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {Object.entries(company.esgScores).map(([key, value]) => (
                                                            <div key={key} className="flex items-center justify-between">
                                                                <span className="text-sm text-gray-700 capitalize">
                                                                    {key}
                                                                </span>
                                                                <div className="flex items-center space-x-2">
                                                                    <div className="w-24 h-2 rounded-full overflow-hidden bg-gray-200">
                                                                        <div
                                                                            className="h-full"
                                                                            style={{
                                                                                background: `linear-gradient(to right, ${logoGreen}, #006400)`,
                                                                                width: `${value}%`
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-sm font-medium w-8">
                                                                        {value}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* API Usage Stats */}
                                                <div>
                                                    <h4 className="text-sm font-semibold mb-3">
                                                        API Usage
                                                    </h4>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="rounded-lg p-3 bg-gray-50">
                                                            <p className="text-xs text-gray-600 mb-1">
                                                                Total API Calls
                                                            </p>
                                                            <p className="text-lg font-bold" style={{ color: logoGreen }}>
                                                                {company.apiUsage.totalCalls.toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div className="rounded-lg p-3 bg-gray-50">
                                                            <p className="text-xs text-gray-600 mb-1">
                                                                Active APIs
                                                            </p>
                                                            <p className="text-lg font-bold" style={{ color: logoGreen }}>
                                                                {company.apiUsage.activeApis}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-300/70 p-6 shadow-lg shadow-gray-200/50">
                        <h2 className="text-lg font-semibold mb-6" style={{ color: logoGreen }}>
                            Recent Activity
                        </h2>
                        <div className="space-y-4">
                            {[
                                { company: "CBZ Holdings", action: "Updated ESG scores", time: "2 hours ago", type: "update" },
                                { company: "Tongaat Hulett", action: "Added new compliance data", time: "5 hours ago", type: "add" },
                                { company: "System", action: "Scheduled data sync completed", time: "1 day ago", type: "system" },
                                { company: "CBZ Holdings", action: "Generated quarterly report", time: "2 days ago", type: "report" },
                            ].map((activity, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-gray-100">
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="p-2 rounded-lg"
                                            style={{
                                                background: activity.type === 'update' ? `linear-gradient(to right, ${logoGreen}10, ${logoGreen}05)` :
                                                    activity.type === 'add' ? `linear-gradient(to right, ${logoYellow}10, ${logoYellow}05)` :
                                                        "bg-gray-100",
                                                border: `1px solid ${activity.type === 'update' ? `${logoGreen}20` :
                                                        activity.type === 'add' ? `${logoYellow}20` : "transparent"
                                                    }`
                                            }}
                                        >
                                            {activity.type === 'update' && <TrendingUp className="w-4 h-4" style={{ color: logoGreen }} />}
                                            {activity.type === 'add' && <CheckCircle className="w-4 h-4" style={{ color: logoYellow }} />}
                                            {activity.type === 'system' && <Activity className="w-4 h-4 text-gray-600" />}
                                            {activity.type === 'report' && <BarChart className="w-4 h-4" style={{ color: logoGreen }} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">
                                                {activity.company} - {activity.action}
                                            </p>
                                            <p className="text-xs text-gray-700">
                                                {activity.time}
                                            </p>
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

export default Admin_Dashboard;