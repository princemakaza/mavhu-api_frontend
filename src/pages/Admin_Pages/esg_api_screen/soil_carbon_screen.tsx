import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler, ScatterController } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression } from 'leaflet';
import Sidebar from "../../../components/Sidebar";
import {
    TrendingUp,
    TrendingDown,
    Thermometer,
    CheckCircle,
    AlertCircle,
    Calendar,
    Download,
    RefreshCw,
    ChevronLeft,
    Database,
    Moon,
    Sun,
    Building,
    ArrowRight,
    Map,
    Wind,
    Zap,
    Factory,
    Scale,
    Target as TargetIcon,
    Award,
    AlertOctagon,
    PieChart,
    LineChart as LineChartIcon,
    MapPin,
    Maximize2,
    Minimize2,
} from "lucide-react";
import {
    getGhgEmissionData,
    getGhgSummary,
    getScopeBreakdown,
    getScope1Sources,
    getScope2Sources,
    getScope3Categories,
    getCarbonEmissionAccounting,
    getEmissionMetrics,
    getReductionTargets,
    getCurrentPerformance,
    getFutureTargets,
    getIntensityAnalysis,
    getComplianceRecommendations,
    getReportingRequirements,
    getAllGhgGraphData,
    getConfidenceAssessment,
    getSummary,
    getGhgMetadata,
    getEmissionFactors,
    getAllYearlyData,
    getKeyMetricsSummary,
    getComplianceFrameworks,
    getDataCoverage,
    isCarbonDataAvailable,
    getGhgCompany,
    getCurrentYear,
    getBaselineYear,
    getPreviousYear,
    getAvailableGhgYears,
    type GhgEmissionResponse,
    type GhgEmissionParams,
    type DetailedSource,
} from "../../../services/Admin_Service/esg_apis/ghg_emmision";
import { getCompanies, type Company } from "../../../services/Admin_Service/companies_service";;

// Import tab components
import OverviewTab from "./ghg_tabs/OverviewTab"
import DetailsTab from "./ghg_tabs/DetailsTab";
import LocationTab from "./ghg_tabs/LocationTab";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler,
    ScatterController
);

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Type definitions for Chart.js data
interface ChartDataset {
    label: string;
    data: (number | null)[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
}

interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
}

// Skeleton Loading Components
const SkeletonCard = ({ className = "" }: { className?: string }) => (
    <div className={`animate-pulse ${className}`}>
        <div className="h-full rounded-2xl bg-gray-700/30 dark:bg-gray-800/30"></div>
    </div>
);

const SkeletonText = ({ width = "full", height = "h-4" }: { width?: string, height?: string }) => (
    <div className={`${height} ${width} rounded bg-gray-600/30 dark:bg-gray-700/30 animate-pulse`}></div>
);

const SkeletonChart = () => (
    <div className="animate-pulse h-64 w-full rounded-lg bg-gray-700/30 dark:bg-gray-800/30"></div>
);

const Shimmer = () => (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent"></div>
);

const GhgEmissionScreen = () => {
    const { companyId: paramCompanyId } = useParams<{ companyId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [ghgData, setGhgData] = useState<GhgEmissionResponse | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>(paramCompanyId || "");
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [latestYear, setLatestYear] = useState<number | null>(null);
    const [showCompanySelector, setShowCompanySelector] = useState(!paramCompanyId);
    const [activeTab, setActiveTab] = useState("overview");
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Color scheme matching Sidebar - Same as CropYieldScreen
    const logoGreen = isDarkMode ? "#00FF00" : "#008000";
    const logoYellow = isDarkMode ? "#FFD700" : "#B8860B";
    const accentBlue = isDarkMode ? "#3B82F6" : "#1D4ED8";
    const accentPurple = isDarkMode ? "#8B5CF6" : "#7C3AED";

    // Theme colors matching Sidebar
    const darkBg = "#111827";
    const lightBg = "#FFFFFF";
    const lightCardBg = "#F9FAFB";

    // Enhanced theme classes with better visibility
    const themeClasses = {
        bg: isDarkMode ? "bg-gray-900" : "bg-white",
        text: isDarkMode ? "text-gray-100" : "text-gray-900",
        textSecondary: isDarkMode ? "text-gray-300" : "text-gray-700",
        textMuted: isDarkMode ? "text-gray-400" : "text-gray-600",
        navBg: isDarkMode ? "bg-gray-900/98" : "bg-white/98",
        cardBg: isDarkMode ? "bg-gray-800/70" : "bg-white/95",
        cardBgAlt: isDarkMode ? "bg-gray-800/90" : "bg-white/98",
        border: isDarkMode ? "border-gray-700" : "border-gray-200",
        borderHover: isDarkMode ? "border-gray-600" : "border-gray-300",
        hoverBg: isDarkMode ? "hover:bg-gray-800/50" : "hover:bg-gray-100",
        modalBg: isDarkMode ? "bg-gray-900" : "bg-white",
        chartGrid: isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)",
        chartText: isDarkMode ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.8)",
    };

    // Enhanced chart colors for better visibility - Same as CropYieldScreen
    const chartColors = {
        primary: logoGreen,
        secondary: logoYellow,
        tertiary: accentBlue,
        quaternary: accentPurple,
        success: isDarkMode ? "#00FF00" : "#008000",
        warning: isDarkMode ? "#FFD700" : "#B8860B",
        danger: isDarkMode ? "#FF6B6B" : "#DC2626",
        background: isDarkMode ? [
            'rgba(0, 255, 0, 0.3)',
            'rgba(255, 215, 0, 0.3)',
            'rgba(59, 130, 246, 0.3)',
            'rgba(139, 92, 246, 0.3)',
            'rgba(236, 72, 153, 0.3)',
            'rgba(14, 165, 233, 0.3)',
        ] : [
            'rgba(0, 128, 0, 0.2)',
            'rgba(184, 134, 11, 0.2)',
            'rgba(59, 130, 246, 0.2)',
            'rgba(139, 92, 246, 0.2)',
            'rgba(236, 72, 153, 0.2)',
            'rgba(14, 165, 233, 0.2)',
        ],
        border: isDarkMode ? [
            logoGreen,
            logoYellow,
            accentBlue,
            accentPurple,
            '#EC4899',
            '#0EA5E9',
        ] : [
            '#008000',
            '#B8860B',
            '#1D4ED8',
            '#7C3AED',
            '#DB2777',
            '#0284C7',
        ],
    };

    // Apply dark mode class to document
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    // Toggle dark mode
    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    // Fetch companies for dropdown
    const fetchCompanies = async () => {
        try {
            const response = await getCompanies(1, 100);
            setCompanies(response.items);
            if (!selectedCompanyId && response.items.length > 0) {
                setSelectedCompanyId(response.items[0]._id);
            }
        } catch (err: any) {
            console.error("Failed to fetch companies:", err);
        }
    };

    // Fetch GHG emissions data - defaults to latest year
    const fetchGhgData = async () => {
        if (!selectedCompanyId) return;

        try {
            setLoading(true);
            setError(null);
            
            // First fetch all data to get available years
            const allData = await getGhgEmissionData({
                companyId: selectedCompanyId,
            });
            
            // Get available years and determine latest
            const years = getAvailableGhgYears(allData);
            const sortedYears = [...years].sort((a, b) => b - a);
            setAvailableYears(sortedYears);
            
            if (sortedYears.length > 0) {
                const latest = sortedYears[0]; // First item after descending sort is latest
                setLatestYear(latest);
                
                // If no year is selected yet, default to latest year
                const yearToFetch = selectedYear !== null ? selectedYear : latest;
                
                // Fetch data for the selected or latest year
                const params: GhgEmissionParams = {
                    companyId: selectedCompanyId,
                    year: yearToFetch,
                };

                const data = await getGhgEmissionData(params);
                setGhgData(data);
                
                // Set selected year if it wasn't set
                if (selectedYear === null) {
                    setSelectedYear(latest);
                }
            } else {
                setGhgData(allData);
            }

        } catch (err: any) {
            setError(err.message || "Failed to fetch GHG emissions data");
            console.error("Error fetching GHG emissions data:", err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    // Handle refresh
    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchGhgData();
    };

    // Handle company change
    const handleCompanyChange = (companyId: string) => {
        setSelectedCompanyId(companyId);
        setSelectedYear(null); // Reset year when changing company
        setShowCompanySelector(false);
        navigate(`/admin_ghg_emission/${companyId}`);
    };

    // Handle year change
    const handleYearChange = (year: string) => {
        const newYear = year ? Number(year) : latestYear;
        setSelectedYear(newYear);
    };

    // Initialize
    useEffect(() => {
        if (location.state?.companyId) {
            setSelectedCompanyId(location.state.companyId);
            setShowCompanySelector(false);
        }
        fetchCompanies();
    }, [location.state]);

    useEffect(() => {
        if (selectedCompanyId) {
            fetchGhgData();
        }
    }, [selectedCompanyId, selectedYear]);

    // Toggle sidebar
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Navigate back
    const navigateBack = () => {
        navigate("/company-management");
    };

    // Get selected company name
    const selectedCompany = companies.find(c => c._id === selectedCompanyId);

    // Get summary data
    const ghgSummary = ghgData ? getGhgSummary(ghgData) : null;
    const scopeBreakdown = ghgData ? getScopeBreakdown(ghgData) : null;
    const scope1Sources = ghgData ? getScope1Sources(ghgData) : [];
    const scope2Sources = ghgData ? getScope2Sources(ghgData) : [];
    const scope3Categories = ghgData ? getScope3Categories(ghgData) : [];
    const carbonAccounting = ghgData ? getCarbonEmissionAccounting(ghgData) : null;
    const emissionMetrics = ghgData ? getEmissionMetrics(ghgData) : null;
    const reductionTargets = ghgData ? getReductionTargets(ghgData) : null;
    const currentPerformance = ghgData ? getCurrentPerformance(ghgData) : null;
    const futureTargets = ghgData ? getFutureTargets(ghgData) : [];
    const intensityAnalysis = ghgData ? getIntensityAnalysis(ghgData) : null;
    const complianceRecommendations = ghgData ? getComplianceRecommendations(ghgData) : [];
    const reportingRequirements = ghgData ? getReportingRequirements(ghgData) : null;
    const confidenceAssessment = ghgData ? getConfidenceAssessment(ghgData) : null;
    const summary = ghgData ? getSummary(ghgData) : null;
    const metadata = ghgData ? getGhgMetadata(ghgData) : null;
    const emissionFactors = ghgData ? getEmissionFactors(ghgData) : [];
    const yearlyData = ghgData ? getAllYearlyData(ghgData) : [];
    const keyMetricsSummary = ghgData ? getKeyMetricsSummary(ghgData) : [];
    const complianceFrameworks = ghgData ? getComplianceFrameworks(ghgData) : [];
    const dataCoverage = ghgData ? getDataCoverage(ghgData) : null;
    const isCarbonDataAvail = ghgData ? isCarbonDataAvailable(ghgData) : false;
    const companyInfo = ghgData ? getGhgCompany(ghgData) : null;
    const currentYear = ghgData ? getCurrentYear(ghgData) : null;
    const baselineYear = ghgData ? getBaselineYear(ghgData) : null;
    const previousYear = ghgData ? getPreviousYear(ghgData) : null;

    // Get graphs
    const graphs = ghgData ? getAllGhgGraphData(ghgData) : null;

    // Get coordinates for map
    const coordinates = ghgData?.data.company.area_of_interest_metadata?.coordinates || [];
    const areaName = ghgData?.data.company.area_of_interest_metadata?.name || "Production Area";
    const areaCovered = ghgData?.data.company.area_of_interest_metadata?.area_covered || "N/A";

    // Skeleton Loading Screen
    if (loading) {
        return (
            <div className={`flex min-h-screen ${themeClasses.bg} ${themeClasses.text}`}>
                <Sidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />
                <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-0' : 'lg:ml-0'} ${themeClasses.bg}`}>
                    {/* Shimmer Header */}
                    <div className="mb-8 relative overflow-hidden p-6">
                        <div className="h-12 rounded-xl bg-gray-700/30"></div>
                        <Shimmer />
                    </div>

                    {/* Shimmer Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 px-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="relative overflow-hidden">
                                <div className="h-32 rounded-xl bg-gray-700/30"></div>
                                <Shimmer />
                            </div>
                        ))}
                    </div>

                    {/* Shimmer Graphs */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 px-6">
                        {[1, 2].map(i => (
                            <div key={i} className="relative overflow-hidden">
                                <div className="h-96 rounded-xl bg-gray-700/30"></div>
                                <Shimmer />
                            </div>
                        ))}
                    </div>

                    {/* Shimmer Table */}
                    <div className="relative overflow-hidden px-6">
                        <div className="h-96 rounded-xl bg-gray-700/30"></div>
                        <Shimmer />
                    </div>
                </main>
            </div>
        );
    }

    // Render company selector if needed
    if (showCompanySelector && !paramCompanyId) {
        return (
            <div className={`flex min-h-screen ${themeClasses.bg} ${themeClasses.text}`}>
                <Sidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />
                <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-0' : 'lg:ml-0'} ${themeClasses.bg}`}>
                    {/* Header */}
                    <header className={`sticky top-0 z-40 backdrop-blur-xl border-b ${themeClasses.border} ${isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'}`}>
                        <div className="px-4 sm:px-6 py-3">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={navigateBack}
                                    className={`p-1.5 rounded-lg ${themeClasses.hoverBg} transition-colors flex-shrink-0`}
                                    style={{ color: logoGreen }}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div>
                                    <h1 className="text-lg sm:text-xl font-bold" style={{ color: logoGreen }}>
                                        Select Company
                                    </h1>
                                    <p className={`text-sm ${themeClasses.textSecondary}`}>
                                        Choose a company to view GHG emissions data
                                    </p>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Company Selection */}
                    <div className="p-4 sm:p-6">
                        <div className="max-w-6xl mx-auto">
                            <div className={`${isDarkMode ? 'bg-gray-800/70' : 'bg-white'} rounded-2xl border ${themeClasses.border} p-6 sm:p-8 shadow-lg`}>
                                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                                    <Building className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: logoGreen }} />
                                    <div>
                                        <h2 
                                            className="text-2xl sm:text-3xl font-bold"
                                            style={{
                                                background: `linear-gradient(to right, ${logoGreen}, ${isDarkMode ? "#00CC00" : "#006400"})`,
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                backgroundClip: 'text'
                                            }}
                                        >
                                            Available Companies
                                        </h2>
                                        <p className={`text-sm ${themeClasses.textSecondary}`}>Select a company to view ESG data</p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    {companies.map((company: Company) => (
                                        <button
                                            key={company._id}
                                            onClick={() => handleCompanyChange(company._id)}
                                            className={`flex items-center gap-4 p-4 sm:p-6 rounded-xl border ${themeClasses.border} transition-all duration-300 hover:border-green-500 ${themeClasses.hoverBg} text-left group`}
                                        >
                                            <div
                                                className="p-3 rounded-lg transition-colors"
                                                style={{
                                                    background: `${logoGreen}20`,
                                                    border: `1px solid ${logoGreen}40`
                                                }}
                                            >
                                                <Factory className="w-6 h-6" style={{ color: logoGreen }} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg mb-1">{company.name}</h3>
                                                <p className={`text-sm ${themeClasses.textMuted}`}>
                                                    {company.industry} • {company.country}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div 
                                                        className="text-xs px-2 py-1 rounded-full"
                                                        style={{
                                                            background: company.esg_data_status === 'complete' 
                                                                ? `${logoGreen}20` 
                                                                : company.esg_data_status === 'partial' 
                                                                ? 'rgba(251, 191, 36, 0.2)' 
                                                                : 'rgba(239, 68, 68, 0.2)',
                                                            color: company.esg_data_status === 'complete' 
                                                                ? logoGreen 
                                                                : company.esg_data_status === 'partial' 
                                                                ? '#FBBF24' 
                                                                : '#EF4444'
                                                        }}
                                                    >
                                                        {company.esg_data_status?.replace('_', ' ') || 'Not Collected'}
                                                    </div>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: logoGreen }} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className={`flex min-h-screen transition-colors duration-300 ${themeClasses.bg} ${themeClasses.text}`}>
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-0' : 'lg:ml-0'}`}>
                {/* Header */}
                <header className={`sticky top-0 z-40 backdrop-blur-xl border-b ${themeClasses.border} ${isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'}`}>
                    <div className="px-4 sm:px-6 py-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={navigateBack}
                                    className={`p-1.5 rounded-lg ${themeClasses.hoverBg} transition-colors flex-shrink-0`}
                                    style={{ color: logoGreen }}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <h1 className="text-lg sm:text-xl font-bold" style={{ color: logoGreen }}>
                                    GHG Emissions Dashboard
                                </h1>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                {/* Year Selector */}
                                {availableYears.length > 0 && (
                                    <select
                                        value={selectedYear === null ? "" : selectedYear}
                                        onChange={(e) => handleYearChange(e.target.value)}
                                        className={`px-3 py-1.5 text-sm rounded-lg border ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.text} focus:outline-none focus:ring-2 focus:ring-green-500`}
                                    >
                                        {availableYears.map((year: number) => (
                                            <option key={year} value={year}>
                                                {year}
                                                {year === latestYear ? ' (Latest)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                <button
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                    className={`p-1.5 rounded-lg ${themeClasses.hoverBg} transition-colors flex-shrink-0`}
                                    style={{ color: logoGreen }}
                                >
                                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                </button>
                                <button
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-white font-medium text-sm"
                                    style={{
                                        background: `linear-gradient(to right, ${logoGreen}, ${isDarkMode ? "#00CC00" : "#006400"})`,
                                    }}
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Export
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex space-x-2 overflow-x-auto pb-1">
                            {[
                                { id: "overview", label: "Overview" },
                                { id: "details", label: "Details" },
                                { id: "location", label: "Location" }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all text-sm ${activeTab === tab.id
                                        ? 'text-white shadow-md'
                                        : `${isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`
                                        }`}
                                    style={activeTab === tab.id ? {
                                        background: `linear-gradient(to right, ${logoGreen}, ${isDarkMode ? "#00CC00" : "#006400"})`,
                                    } : {}}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                {/* Error Message */}
                {error && (
                    <div className={`m-4 sm:m-6 p-3 sm:p-4 rounded-xl ${isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'} border`}>
                        <div className="flex items-center">
                            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-red-500 flex-shrink-0" />
                            <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="p-4 sm:p-6">
                    {/* Overview Tab */}
                    {activeTab === "overview" && ghgData && (
                        <OverviewTab
                            ghgData={ghgData}
                            themeClasses={themeClasses}
                            chartColors={chartColors}
                            logoGreen={logoGreen}
                            logoYellow={logoYellow}
                            isDarkMode={isDarkMode}
                            coordinates={coordinates}
                            areaName={areaName}
                            areaCovered={areaCovered}
                        />
                    )}

                    {/* Details Tab */}
                    {activeTab === "details" && ghgData && (
                        <DetailsTab
                            ghgData={ghgData}
                            themeClasses={themeClasses}
                            chartColors={chartColors}
                            logoGreen={logoGreen}
                            isDarkMode={isDarkMode}
                        />
                    )}

                    {/* Location Tab */}
                    {activeTab === "location" && ghgData && (
                        <LocationTab
                            themeClasses={themeClasses}
                            logoGreen={logoGreen}
                            isDarkMode={isDarkMode}
                            coordinates={coordinates}
                            areaName={areaName}
                            areaCovered={areaCovered}
                        />
                    )}

                    {/* Metadata Footer */}
                    {metadata && (
                        <div className={`${themeClasses.cardBg} backdrop-blur-xl rounded-2xl border ${themeClasses.border} p-4 sm:p-6 mt-8 shadow-lg ${isDarkMode ? "shadow-black/20" : "shadow-gray-200/50"}`}>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-semibold" style={{ color: logoGreen }}>
                                    Data Source Information
                                </h4>
                                <Database className="w-4 h-4" style={{ color: logoGreen }} />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className={`text-xs ${themeClasses.textMuted}`}>API Version</p>
                                    <p className="text-sm font-medium">{metadata.api_version}</p>
                                </div>
                                <div>
                                    <p className={`text-xs ${themeClasses.textMuted}`}>Generated</p>
                                    <p className="text-sm font-medium">{new Date(metadata.generated_at).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className={`text-xs ${themeClasses.textMuted}`}>Data Sources</p>
                                    <p className="text-sm font-medium">{metadata.data_sources.length}</p>
                                </div>
                                <div>
                                    <p className={`text-xs ${themeClasses.textMuted}`}>Calculation Methods</p>
                                    <p className="text-sm font-medium">{metadata.calculation_methods.length}</p>
                                </div>
                            </div>
                            {companyInfo && (
                                <div className={`mt-4 pt-4 border-t ${themeClasses.border}`}>
                                    <p className={`text-xs ${themeClasses.textMuted}`}>Company</p>
                                    <p className="text-sm font-medium">{companyInfo.name} • {companyInfo.industry} • {companyInfo.country}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default GhgEmissionScreen;