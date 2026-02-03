import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import {
    TrendingUp,
    TrendingDown,
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
    Download,
    FileText,
    Calendar,
    Filter,
    PieChart,
    LineChart,
    ArrowUpRight,
    ArrowDownRight,
    ChevronDown,
    ChevronUp,
    Clock,
    MapPin,
    Mail,
    Phone,
    ExternalLink,
    Menu,
    X,
    Search,
    Eye,
    Printer,
    Share2,
    Maximize2,
    Minimize2,
} from "lucide-react";

const Report_Page = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState("monthly");
    const [selectedCompany, setSelectedCompany] = useState("all");
    const [expandedSection, setExpandedSection] = useState<string | null>("overview");
    const [isPrintMode, setIsPrintMode] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const mainContentRef = useRef<HTMLDivElement>(null);

    // Colors
    const primaryColor = "#008000";
    const secondaryColor = "#B8860B";
    const accentColor = "#4CAF50";
    const warningColor = "#FF9800";
    const dangerColor = "#F44336";
    const backgroundColor = "#F8FAFC";
    const cardBackground = "#FFFFFF";

    // Responsive breakpoints
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Report metadata
    const reportMetadata = {
        generatedDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        reportingPeriod: "January 2024",
        totalCompanies: 2,
        dataPoints: 847,
        lastUpdated: "2 hours ago"
    };

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
            },
            "performance": {
                "carbonReduction": 0,
                "waterSaved": 0,
                "employeeSatisfaction": 0,
                "complianceRate": 0
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
            },
            "performance": {
                "carbonReduction": 0,
                "waterSaved": 0,
                "employeeSatisfaction": 0,
                "complianceRate": 0
            }
        }
    ];

    // Executive Summary Stats
    const executiveSummary = [
        {
            title: "Average ESG Score",
            value: Math.round(companies.reduce((acc, c) => acc + c.esgScores.overall, 0) / companies.length),
            change: 0,
            trend: "up",
            icon: Award,
            description: "Overall performance across all companies"
        },
        {
            title: "Carbon Reduction",
            value: `${companies.reduce((acc, c) => acc + c.performance.carbonReduction, 0)}%`,
            change: 0,
            trend: "up",
            icon: Leaf,
            description: "Year-over-year emissions reduction"
        },
        {
            title: "Compliance Rate",
            value: `${Math.round(companies.reduce((acc, c) => acc + c.performance.complianceRate, 0) / companies.length)}%`,
            change: 0,
            trend: "up",
            icon: Shield,
            description: "Regulatory compliance adherence"
        },
        {
            title: "Employee Satisfaction",
            value: `${Math.round(companies.reduce((acc, c) => acc + c.performance.employeeSatisfaction, 0) / companies.length)}%`,
            change: 0,
            trend: "neutral",
            icon: Users,
            description: "Workforce engagement score"
        }
    ];

    // Environmental Metrics
    const environmentalMetrics = [
        {
            category: "Carbon Emissions",
            value: "0 tCO2e",
            target: "0 tCO2e",
            progress: 0,
            status: "on-track",
            icon: Leaf,
            trend: 0,
            details: "Total greenhouse gas emissions across operations"
        },
        {
            category: "Water Consumption",
            value: "0 ML",
            target: "0 ML",
            progress: 0,
            status: "needs-attention",
            icon: Droplet,
            trend: 0,
            details: "Total water usage and conservation efforts"
        },
        {
            category: "Energy Usage",
            value: "0 MWh",
            target: "0 MWh",
            progress: 0,
            status: "on-track",
            icon: Zap,
            trend: 0,
            details: "Renewable and non-renewable energy consumption"
        },
        {
            category: "Waste Management",
            value: "0 tonnes",
            target: "0 tonnes",
            progress: 0,
            status: "exceeded",
            icon: Recycle,
            trend: 0,
            details: "Waste diverted from landfills through recycling"
        }
    ];

    // Social Metrics
    const socialMetrics = [
        {
            category: "Employee Welfare",
            score: 0,
            icon: Heart,
            details: [
                { label: "Health & Safety Incidents", value: "0", status: "good" },
                { label: "Training Hours per Employee", value: "0", status: "good" },
                { label: "Employee Turnover Rate", value: "0%", status: "attention" }
            ]
        },
        {
            category: "Diversity & Inclusion",
            score: 0,
            icon: Users,
            details: [
                { label: "Gender Diversity (Board)", value: "0%", status: "good" },
                { label: "Gender Diversity (Workforce)", value: "0%", status: "good" },
                { label: "Pay Equity Score", value: "0/100", status: "good" }
            ]
        },
        {
            category: "Community Impact",
            score: 0,
            icon: Globe,
            details: [
                { label: "Community Investment", value: "$0", status: "good" },
                { label: "Local Hiring Rate", value: "0%", status: "excellent" },
                { label: "Beneficiaries Reached", value: "0", status: "good" }
            ]
        }
    ];

    // Governance Metrics
    const governanceMetrics = [
        {
            category: "Board Composition",
            score: 0,
            items: [
                { label: "Independent Directors", value: "0%", icon: Users },
                { label: "Board Diversity", value: "0%", icon: Target },
                { label: "Average Tenure", value: "0 years", icon: Clock }
            ]
        },
        {
            category: "Ethics & Compliance",
            score: 0,
            items: [
                { label: "Code of Conduct Training", value: "0%", icon: Shield },
                { label: "Whistleblower Reports", value: "0", icon: AlertCircle },
                { label: "Compliance Violations", value: "0", icon: CheckCircle }
            ]
        },
        {
            category: "Transparency",
            score: 0,
            items: [
                { label: "ESG Reporting Coverage", value: "0%", icon: FileText },
                { label: "Stakeholder Engagement", value: "0 sessions", icon: Users },
                { label: "Data Quality Score", value: "0/100", icon: Database }
            ]
        }
    ];

    // API Usage Analytics
    const apiAnalytics = [
        { api: "Soil Health API", calls: 0, avgResponse: "0ms", uptime: "0%", icon: Leaf },
        { api: "GHG Emissions API", calls: 0, avgResponse: "0ms", uptime: "0%", icon: Database },
        { api: "Water Risk API", calls: 0, avgResponse: "0ms", uptime: "0%", icon: Droplet },
        { api: "Compliance API", calls: 0, avgResponse: "0ms", uptime: "0%", icon: Shield },
        { api: "Workforce API", calls: 0, avgResponse: "0ms", uptime: "0%", icon: Users },
        { api: "Energy API", calls: 0, avgResponse: "0ms", uptime: "0%", icon: Zap }
    ];

    // Key Achievements
    const achievements = [
        {
            title: "Carbon Neutral Operations",
            company: "CBZ Holdings",
            description: "Achieved carbon neutrality across all operations through renewable energy adoption",
            date: "January 2024",
            impact: "High",
            icon: Leaf
        },
        {
            title: "Zero Waste Initiative",
            company: "Tongaat Hulett",
            description: "Diverted 95% of operational waste from landfills through comprehensive recycling program",
            date: "January 2024",
            impact: "High",
            icon: Recycle
        },
        {
            title: "Enhanced Board Diversity",
            company: "CBZ Holdings",
            description: "Increased board diversity to 40% women representation",
            date: "December 2023",
            impact: "Medium",
            icon: Users
        }
    ];

    // Risk Assessment
    const riskAssessment = [
        {
            risk: "Water Scarcity",
            level: "Medium",
            probability: "High",
            impact: "Medium",
            mitigation: "Water conservation programs and alternative sourcing",
            owner: "Operations Team",
            icon: Droplet
        },
        {
            risk: "Regulatory Changes",
            level: "Low",
            probability: "Medium",
            impact: "Low",
            mitigation: "Active monitoring and compliance team",
            owner: "Legal & Compliance",
            icon: Shield
        },
        {
            risk: "Climate Change Impact",
            level: "High",
            probability: "High",
            impact: "High",
            mitigation: "Climate adaptation strategy and scenario planning",
            owner: "Sustainability Team",
            icon: Globe
        }
    ];

    const getScoreColor = (score: number) => {
        if (score >= 80) return { text: "text-green-600", bg: "bg-green-50", border: "border-green-200" };
        if (score >= 60) return { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
        return { text: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "on-track":
            case "exceeded":
            case "good":
            case "excellent":
                return { text: "text-green-600", bg: "bg-green-50" };
            case "needs-attention":
            case "attention":
                return { text: "text-amber-600", bg: "bg-amber-50" };
            case "critical":
            case "poor":
                return { text: "text-red-600", bg: "bg-red-50" };
            default:
                return { text: "text-gray-600", bg: "bg-gray-50" };
        }
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case "High":
                return { text: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
            case "Medium":
                return { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
            case "Low":
                return { text: "text-green-600", bg: "bg-green-50", border: "border-green-200" };
            default:
                return { text: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200" };
        }
    };

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            mainContentRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handlePrint = () => {
        setIsPrintMode(true);
        setTimeout(() => {
            window.print();
            setIsPrintMode(false);
        }, 100);
    };

    // Filtered data based on search
    const filteredCompanies = companies.filter(company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={`flex min-h-screen ${isPrintMode ? 'bg-white' : 'bg-gray-50'} text-gray-900`}>
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content */}
            <main
                ref={mainContentRef}
                className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-0' : 'lg:ml-0'} ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}
            >
                {/* Header */}
                <header
                    className={`sticky top-0 z-30 border-b border-gray-200 bg-white backdrop-blur-sm ${isFullscreen ? 'hidden' : ''}`}
                    style={{ backgroundColor: `${cardBackground}E6` }}
                >
                    <div className="px-4 sm:px-6 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={toggleSidebar}
                                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                                    </button>
                                    <div>
                                        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: primaryColor }}>
                                            ESG Performance Report
                                        </h1>
                                        <p className="text-sm text-gray-600">
                                            Comprehensive analysis of Environmental, Social & Governance metrics
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {/* Search Bar */}
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search companies..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center space-x-2">
                                    <button
                                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                        title="Filter"
                                    >
                                        <Filter className="w-4 h-4" />
                                    </button>
                                    <button
                                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                        title="Fullscreen"
                                        onClick={toggleFullscreen}
                                    >
                                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                    </button>
                                    <button
                                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                        title="Print"
                                        onClick={handlePrint}
                                    >
                                        <Printer className="w-4 h-4" />
                                    </button>
                                    <button
                                        className="px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white"
                                        onClick={() => {/* Handle export */}}
                                    >
                                        <Download className="w-4 h-4" />
                                        <span className="hidden sm:inline">Export</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Report Content */}
                <div className="p-4 sm:p-6">
                    {/* Report Metadata */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full sm:w-auto">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 rounded-lg bg-green-50">
                                        <Calendar className="w-5 h-5" style={{ color: primaryColor }} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Reporting Period</p>
                                        <p className="text-sm font-semibold">{reportMetadata.reportingPeriod}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 rounded-lg bg-green-50">
                                        <FileText className="w-5 h-5" style={{ color: primaryColor }} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Generated</p>
                                        <p className="text-sm font-semibold">{reportMetadata.generatedDate}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 rounded-lg bg-green-50">
                                        <Building className="w-5 h-5" style={{ color: primaryColor }} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Companies</p>
                                        <p className="text-sm font-semibold">{reportMetadata.totalCompanies}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 rounded-lg bg-green-50">
                                        <Database className="w-5 h-5" style={{ color: primaryColor }} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Data Points</p>
                                        <p className="text-sm font-semibold">{reportMetadata.dataPoints}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                                <Clock className="w-4 h-4" />
                                <span>Updated {reportMetadata.lastUpdated}</span>
                            </div>
                        </div>
                    </div>

                    {/* Executive Summary */}
                    <div className="mb-6">
                        <SectionHeader
                            title="Executive Summary"
                            icon={Award}
                            color={primaryColor}
                            isExpanded={expandedSection === 'overview'}
                            onToggle={() => toggleSection('overview')}
                        />

                        {expandedSection === 'overview' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {executiveSummary.map((stat, index) => (
                                    <StatCard key={index} stat={stat} color={primaryColor} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Environmental Performance */}
                    <div className="mb-6">
                        <SectionHeader
                            title="Environmental Performance"
                            icon={Leaf}
                            color={primaryColor}
                            isExpanded={expandedSection === 'environmental'}
                            onToggle={() => toggleSection('environmental')}
                        />

                        {expandedSection === 'environmental' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {environmentalMetrics.map((metric, index) => (
                                    <MetricCard key={index} metric={metric} color={primaryColor} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Social Performance */}
                    <div className="mb-6">
                        <SectionHeader
                            title="Social Performance"
                            icon={Users}
                            color={primaryColor}
                            isExpanded={expandedSection === 'social'}
                            onToggle={() => toggleSection('social')}
                        />

                        {expandedSection === 'social' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {socialMetrics.map((metric, index) => (
                                    <SocialMetricCard key={index} metric={metric} color={primaryColor} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Governance Performance */}
                    <div className="mb-6">
                        <SectionHeader
                            title="Governance Performance"
                            icon={Shield}
                            color={primaryColor}
                            isExpanded={expandedSection === 'governance'}
                            onToggle={() => toggleSection('governance')}
                        />

                        {expandedSection === 'governance' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {governanceMetrics.map((metric, index) => (
                                    <GovernanceMetricCard key={index} metric={metric} color={primaryColor} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Company Profiles */}
                    <div className="mb-6">
                        <SectionHeader
                            title="Company Profiles"
                            icon={Building}
                            color={primaryColor}
                            isExpanded={expandedSection === 'companies'}
                            onToggle={() => toggleSection('companies')}
                        />

                        {expandedSection === 'companies' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {filteredCompanies.map((company, index) => (
                                    <CompanyCard key={index} company={company} index={index} color={primaryColor} secondaryColor={secondaryColor} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* API Analytics */}
                    <div className="mb-6">
                        <SectionHeader
                            title="API Usage Analytics"
                            icon={Database}
                            color={primaryColor}
                            isExpanded={expandedSection === 'api'}
                            onToggle={() => toggleSection('api')}
                        />

                        {expandedSection === 'api' && (
                            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">API</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Calls</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Avg Response</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Uptime</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {apiAnalytics.map((api, index) => (
                                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center space-x-3">
                                                            <api.icon className="w-4 h-4" style={{ color: primaryColor }} />
                                                            <span className="text-sm">{api.api}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm">{api.calls.toLocaleString()}</td>
                                                    <td className="py-3 px-4 text-sm">{api.avgResponse}</td>
                                                    <td className="py-3 px-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${parseInt(api.uptime) >= 99 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                                            {api.uptime}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Key Achievements */}
                    <div className="mb-6">
                        <SectionHeader
                            title="Key Achievements"
                            icon={Award}
                            color={secondaryColor}
                            isExpanded={expandedSection === 'achievements'}
                            onToggle={() => toggleSection('achievements')}
                        />

                        {expandedSection === 'achievements' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {achievements.map((achievement, index) => (
                                    <AchievementCard key={index} achievement={achievement} color={primaryColor} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Risk Assessment */}
                    <div className="mb-6">
                        <SectionHeader
                            title="Risk Assessment"
                            icon={AlertCircle}
                            color={primaryColor}
                            isExpanded={expandedSection === 'risks'}
                            onToggle={() => toggleSection('risks')}
                        />

                        {expandedSection === 'risks' && (
                            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
                                <div className="space-y-4">
                                    {riskAssessment.map((risk, index) => (
                                        <RiskCard key={index} risk={risk} color={primaryColor} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Report Footer */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-6 max-w-2xl mx-auto">
                                This report was automatically generated by the ESG Dashboard system. For more information or to request a detailed analysis, please contact the sustainability team.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button
                                    className="px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-all flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white w-full sm:w-auto"
                                    onClick={() => {/* Handle download */}}
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Download Full Report (PDF)</span>
                                </button>
                                <button
                                    className="px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all flex items-center justify-center space-x-2 border border-gray-300 w-full sm:w-auto"
                                    onClick={() => {/* Handle view previous */}}
                                >
                                    <FileText className="w-4 h-4" style={{ color: primaryColor }} />
                                    <span style={{ color: primaryColor }}>View Previous Reports</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

// Reusable Components
const SectionHeader = ({ title, icon: Icon, color, isExpanded, onToggle }: any) => (
    <div
        className="flex items-center justify-between mb-4 p-4 bg-white rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
    >
        <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}10` }}>
                <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold" style={{ color }}>
                {title}
            </h2>
        </div>
        {isExpanded ? (
            <ChevronUp className="w-5 h-5" style={{ color }} />
        ) : (
            <ChevronDown className="w-5 h-5" style={{ color }} />
        )}
    </div>
);

const StatCard = ({ stat, color }: any) => {
    const IconComponent = stat.icon;
    const trendColor = stat.trend === 'up' ? 'text-green-600' :
        stat.trend === 'down' ? 'text-red-600' : 'text-gray-600';

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}10` }}>
                    <IconComponent className="w-6 h-6" style={{ color }} />
                </div>
                <div className={`flex items-center space-x-1 ${trendColor}`}>
                    {stat.trend === 'up' && <ArrowUpRight className="w-4 h-4" />}
                    {stat.trend === 'down' && <ArrowDownRight className="w-4 h-4" />}
                    <span className="text-sm font-medium">{stat.change}%</span>
                </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color }}>
                {stat.value}
            </h3>
            <p className="text-sm font-medium text-gray-900 mb-1">
                {stat.title}
            </p>
            <p className="text-xs text-gray-600 line-clamp-2">
                {stat.description}
            </p>
        </div>
    );
};

const MetricCard = ({ metric, color }: any) => {
    const statusColor = metric.status === 'on-track' ? 'text-green-600 bg-green-50' :
        metric.status === 'needs-attention' ? 'text-amber-600 bg-amber-50' :
            'text-green-600 bg-green-50';
    const IconComponent = metric.icon;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}10` }}>
                        <IconComponent className="w-5 h-5" style={{ color }} />
                    </div>
                    <h3 className="text-lg font-semibold">{metric.category}</h3>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                    {metric.status.replace('-', ' ').toUpperCase()}
                </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{metric.details}</p>

            <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Current</span>
                    <span className="font-semibold">{metric.value}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Target</span>
                    <span className="font-semibold">{metric.target}</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden bg-gray-200">
                    <div
                        className="h-full transition-all duration-500"
                        style={{
                            background: `linear-gradient(to right, ${color}, ${color}AA)`,
                            width: `${metric.progress}%`
                        }}
                    />
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Progress: {metric.progress}%</span>
                    <div className={`flex items-center space-x-1 ${metric.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{Math.abs(metric.trend)}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SocialMetricCard = ({ metric, color }: any) => {
    const IconComponent = metric.icon;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}10` }}>
                        <IconComponent className="w-5 h-5" style={{ color }} />
                    </div>
                    <h3 className="text-lg font-semibold">{metric.category}</h3>
                </div>
                <div className="px-3 py-1 rounded-full bg-gray-50 text-sm font-semibold">
                    {metric.score}
                </div>
            </div>

            <div className="space-y-3">
                {metric.details.map((detail: any, idx: number) => {
                    const statusColor = detail.status === 'good' ? 'bg-green-100' :
                        detail.status === 'attention' ? 'bg-amber-100' :
                            'bg-green-100';
                    return (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-700">{detail.label}</span>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-semibold">{detail.value}</span>
                                <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const GovernanceMetricCard = ({ metric, color }: any) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{metric.category}</h3>
                <div className="px-3 py-1 rounded-full bg-gray-50 text-sm font-semibold">
                    {metric.score}
                </div>
            </div>

            <div className="space-y-3">
                {metric.items.map((item: any, idx: number) => {
                    const ItemIcon = item.icon;
                    return (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <ItemIcon className="w-4 h-4 text-gray-600" />
                                <span className="text-sm text-gray-700">{item.label}</span>
                            </div>
                            <span className="text-sm font-semibold">{item.value}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const CompanyCard = ({ company, index, color, secondaryColor }: any) => {
    const scoreColor = company.esgScores.overall >= 80 ? 'bg-green-50 text-green-600' :
        company.esgScores.overall >= 60 ? 'bg-amber-50 text-amber-600' :
            'bg-red-50 text-red-600';

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            {/* Company Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                    <div
                        className="p-3 rounded-lg"
                        style={{
                            backgroundColor: `${index % 2 === 0 ? color : secondaryColor}10`,
                            border: `1px solid ${index % 2 === 0 ? color : secondaryColor}30`
                        }}
                    >
                        <Building
                            className="w-6 h-6"
                            style={{ color: index % 2 === 0 ? color : secondaryColor }}
                        />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-1">{company.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{company.industry}</p>
                        <p className="text-xs text-gray-500">{company.registrationNumber}</p>
                    </div>
                </div>
                <div className={`px-4 py-2 rounded-lg ${scoreColor}`}>
                    <div className="text-2xl font-bold">{company.esgScores.overall}</div>
                    <div className="text-xs">ESG Score</div>
                </div>
            </div>

            {/* Company Description */}
            <p className="text-sm text-gray-700 mb-4 line-clamp-2">{company.description}</p>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                    { icon: MapPin, text: company.country },
                    { icon: Phone, text: company.phone },
                    { icon: Mail, text: company.email },
                    { icon: ExternalLink, text: "Website", isLink: true, href: company.website }
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                        <item.icon className="w-4 h-4 text-gray-500" />
                        {item.isLink ? (
                            <a
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline truncate"
                            >
                                {item.text}
                            </a>
                        ) : (
                            <span className="text-sm text-gray-700 truncate">{item.text}</span>
                        )}
                    </div>
                ))}
            </div>

            {/* ESG Breakdown */}
            <div className="space-y-2 mb-4">
                <h4 className="text-sm font-semibold mb-2">ESG Breakdown</h4>
                {Object.entries(company.esgScores).map(([key, value]) => {
                    if (key === 'overall') return null;
                    return (
                        <div key={key} className="flex items-center justify-between">
                            <span className="text-xs text-gray-600 capitalize">{key}</span>
                            <div className="flex items-center space-x-2">
                                <div className="w-24 h-1.5 rounded-full overflow-hidden bg-gray-200">
                                    <div
                                        className="h-full"
                                        style={{
                                            background: `linear-gradient(to right, ${color}, ${color}AA)`,
                                            width: `${value}%`
                                        }}
                                    />
                                </div>
                                <span className="text-xs font-medium w-6">{value}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">API Calls</p>
                    <p className="text-lg font-bold" style={{ color }}>
                        {company.apiUsage.totalCalls.toLocaleString()}
                    </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Active APIs</p>
                    <p className="text-lg font-bold" style={{ color }}>
                        {company.apiUsage.activeApis}
                    </p>
                </div>
            </div>
        </div>
    );
};

const AchievementCard = ({ achievement, color }: any) => {
    const AchievementIcon = achievement.icon;
    const impactColor = achievement.impact === 'High' ? 'bg-green-100 text-green-800' :
        achievement.impact === 'Medium' ? 'bg-amber-100 text-amber-800' :
            'bg-blue-100 text-blue-800';

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}10` }}>
                    <AchievementIcon className="w-6 h-6" style={{ color }} />
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${impactColor}`}>
                    {achievement.impact} Impact
                </div>
            </div>
            <h3 className="text-lg font-bold mb-2">{achievement.title}</h3>
            <p className="text-sm text-gray-700 mb-3 line-clamp-3">{achievement.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-600">
                <span className="font-medium">{achievement.company}</span>
                <span>{achievement.date}</span>
            </div>
        </div>
    );
};

const RiskCard = ({ risk, color }: any) => {
    const riskColor = risk.level === 'High' ? 'bg-red-50 border-red-200' :
        risk.level === 'Medium' ? 'bg-amber-50 border-amber-200' :
            'bg-green-50 border-green-200';
    const levelColor = risk.level === 'High' ? 'text-red-600' :
        risk.level === 'Medium' ? 'text-amber-600' :
            'text-green-600';
    const RiskIcon = risk.icon;

    return (
        <div className={`p-4 rounded-xl border-2 ${riskColor}`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}10` }}>
                        <RiskIcon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold mb-1">{risk.risk}</h3>
                        <p className="text-sm text-gray-600">{risk.mitigation}</p>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full bg-white ${levelColor} text-xs font-semibold`}>
                    {risk.level} Risk
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Probability</p>
                    <p className="text-sm font-semibold">{risk.probability}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Impact</p>
                    <p className="text-sm font-semibold">{risk.impact}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Owner</p>
                    <p className="text-sm font-semibold truncate">{risk.owner}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Status</p>
                    <p className="text-sm font-semibold">Active</p>
                </div>
            </div>
        </div>
    );
};

export default Report_Page;