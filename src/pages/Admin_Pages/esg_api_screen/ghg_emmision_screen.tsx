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

    // Fetch GHG emissions data
    const fetchGhgData = async () => {
        if (!selectedCompanyId) return;

        try {
            setLoading(true);
            setError(null);
            const params: GhgEmissionParams = {
                companyId: selectedCompanyId,
            };

            // Only add year if selected (not null)
            if (selectedYear !== null) {
                params.year = selectedYear;
            }

            const data = await getGhgEmissionData(params);
            setGhgData(data);

            // Extract available years from response
            const years = getAvailableGhgYears(data);
            const sortedYears = [...years].sort((a, b) => b - a);
            setAvailableYears(sortedYears);

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
        setShowCompanySelector(false);
        navigate(`/admin_ghg_emission/${companyId}`);
    };

    // Handle year change
    const handleYearChange = (year: number | null) => {
        setSelectedYear(year);
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
                    {/* Header Skeleton */}
                    <header className={`sticky top-0 z-30 border-b ${themeClasses.border} px-6 py-4 backdrop-blur-sm ${themeClasses.navBg}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-gray-600/30 dark:bg-gray-700/30 animate-pulse"></div>
                                <div className="space-y-2">
                                    <SkeletonText width="w-48" height="h-6" />
                                    <SkeletonText width="w-64" height="h-4" />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-32 h-10 rounded-lg bg-gray-600/30 dark:bg-gray-700/30 animate-pulse"></div>
                                <div className="w-10 h-10 rounded-lg bg-gray-600/30 dark:bg-gray-700/30 animate-pulse"></div>
                                <div className="w-24 h-10 rounded-lg bg-gray-600/30 dark:bg-gray-700/30 animate-pulse"></div>
                                <div className="w-10 h-10 rounded-lg bg-gray-600/30 dark:bg-gray-700/30 animate-pulse"></div>
                            </div>
                        </div>
                        {/* Tabs Skeleton */}
                        <div className="flex space-x-1 mt-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-20 h-8 rounded-lg bg-gray-600/30 dark:bg-gray-700/30 animate-pulse"></div>
                            ))}
                        </div>
                    </header>

                    {/* Content Skeleton */}
                    <div className="p-6">
                        {/* Key Metrics Skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {[1, 2, 3, 4].map((i) => (
                                <SkeletonCard key={i} className="h-40" />
                            ))}
                        </div>

                        {/* Map and Scope Composition Skeleton */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            <SkeletonCard className="h-80" />
                            <div className="lg:col-span-2">
                                <SkeletonCard className="h-80" />
                            </div>
                        </div>

                        {/* Intensity & Confidence Skeleton */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <SkeletonCard className="h-96" />
                            <SkeletonCard className="h-96" />
                        </div>

                        {/* Targets Skeleton */}
                        <SkeletonCard className="h-48 mb-8" />

                        {/* Recommendations Skeleton */}
                        <SkeletonCard className="h-64" />
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
                    <header className={`sticky top-0 z-30 border-b ${themeClasses.border} px-6 py-4 backdrop-blur-sm ${themeClasses.navBg}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={navigateBack}
                                    className={`p-2 rounded-lg ${themeClasses.hoverBg} transition-colors`}
                                    style={{ color: logoGreen }}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div>
                                    <h1 className="text-2xl font-bold" style={{ color: logoGreen }}>
                                        Select Company
                                    </h1>
                                    <p className={`text-sm ${themeClasses.textSecondary}`}>
                                        Choose a company to view GHG emissions data
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={toggleSidebar}
                                className={`lg:hidden p-2 rounded-lg transition-colors ${isDarkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"}`}
                            >
                                <div className="w-6 h-6 flex items-center justify-center">
                                    <div className={`w-4 h-0.5 ${isDarkMode ? "bg-gray-300" : "bg-gray-600"} mb-1`}></div>
                                    <div className={`w-4 h-0.5 ${isDarkMode ? "bg-gray-300" : "bg-gray-600"} mb-1`}></div>
                                    <div className={`w-4 h-0.5 ${isDarkMode ? "bg-gray-300" : "bg-gray-600"}`}></div>
                                </div>
                            </button>
                        </div>
                    </header>

                    {/* Company Selection */}
                    <div className="p-6">
                        <div className="max-w-4xl mx-auto">
                            <div className={`${themeClasses.cardBg} backdrop-blur-xl rounded-2xl border ${themeClasses.border} p-8 shadow-lg ${isDarkMode ? "shadow-black/20" : "shadow-gray-200/50"}`}>
                                <div className="flex items-center gap-3 mb-6">
                                    <Building className="w-8 h-8" style={{ color: logoGreen }} />
                                    <h2 className="text-xl font-bold">Available Companies</h2>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    {companies.map((company: Company) => (
                                        <button
                                            key={company._id}
                                            onClick={() => handleCompanyChange(company._id)}
                                            className={`flex items-center gap-4 p-4 rounded-xl border ${themeClasses.border} transition-all duration-300 hover:border-[${logoGreen}] ${themeClasses.hoverBg} text-left group`}
                                        >
                                            <div
                                                className="p-3 rounded-lg"
                                                style={{
                                                    background: `linear-gradient(to right, ${logoGreen}30, ${logoGreen}20)`,
                                                    border: `1px solid ${logoGreen}40`
                                                }}
                                            >
                                                <Factory className="w-6 h-6" style={{ color: logoGreen }} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold mb-1">{company.name}</h3>
                                                <p className={`text-sm ${themeClasses.textMuted}`}>
                                                    {company.industry} • {company.country}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className={`text-xs px-2 py-1 rounded-full ${company.esg_data_status === 'complete' ? `bg-[${logoGreen}]/20 text-[${logoGreen}]` : company.esg_data_status === 'partial' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'}`}>
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
                <header className={`sticky top-0 z-30 border-b ${themeClasses.border} px-6 py-4 backdrop-blur-sm ${themeClasses.navBg}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={navigateBack}
                                className={`p-2 rounded-lg ${themeClasses.hoverBg} transition-colors`}
                                style={{ color: logoGreen }}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold" style={{ color: logoGreen }}>
                                    GHG Emissions Dashboard
                                </h1>
                                <p className={`text-sm ${themeClasses.textSecondary}`}>
                                    {selectedCompany?.name || "Company Data"} • {selectedYear === null ? "All Years" : selectedYear}
                                    {metadata?.company_id && (
                                        <span className="ml-2 px-2 py-1 text-xs rounded bg-gray-500/20">
                                            ID: {metadata.company_id}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Year Selector */}
                            {availableYears.length > 0 && (
                                <div className="relative">
                                    <select
                                        value={selectedYear === null ? "" : selectedYear}
                                        onChange={(e) => handleYearChange(e.target.value ? Number(e.target.value) : null)}
                                        className={`pl-4 pr-10 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.cardBg} focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDarkMode ? `focus:ring-[${logoGreen}]` : `focus:ring-[${logoGreen}]`} appearance-none`}
                                        style={{
                                            background: isDarkMode ? `linear-gradient(to right, ${logoGreen}10, ${logoGreen}05)` : undefined
                                        }}
                                    >
                                        <option value="">All Years</option>
                                        {availableYears.map((year: number) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: logoGreen }} />
                                </div>
                            )}

                            {/* Refresh Button */}
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className={`p-2 rounded-lg ${themeClasses.hoverBg} transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
                                style={{ color: logoGreen }}
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>

                            {/* Export Button */}
                            <button
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.hoverBg} transition-colors`}
                                style={{ color: logoGreen }}
                            >
                                <Download className="w-4 h-4" />
                                <span className="text-sm font-medium">Export</span>
                            </button>

                            {/* Dark Mode Toggle */}
                            <button
                                onClick={toggleDarkMode}
                                className={`p-2 rounded-lg ${themeClasses.hoverBg} transition-colors`}
                                style={{ color: logoGreen }}
                            >
                                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>

                            {/* Sidebar Toggle */}
                            <button
                                onClick={toggleSidebar}
                                className={`lg:hidden p-2 rounded-lg transition-colors ${isDarkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"}`}
                                style={{ color: logoGreen }}
                            >
                                <div className="w-6 h-6 flex items-center justify-center">
                                    <div className={`w-4 h-0.5 ${isDarkMode ? "bg-gray-300" : "bg-gray-600"} mb-1`}></div>
                                    <div className={`w-4 h-0.5 ${isDarkMode ? "bg-gray-300" : "bg-gray-600"} mb-1`}></div>
                                    <div className={`w-4 h-0.5 ${isDarkMode ? "bg-gray-300" : "bg-gray-600"}`}></div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-1 mt-4">
                        {["overview", "details", "location"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab
                                    ? `text-white`
                                    : `${themeClasses.hoverBg} opacity-70 hover:opacity-100`
                                    }`}
                                style={{
                                    background: activeTab === tab
                                        ? `linear-gradient(to right, ${logoGreen}, ${isDarkMode ? "#00CC00" : "#006400"})`
                                        : undefined,
                                }}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </header>

                {/* Error Message */}
                {error && (
                    <div className={`m-6 p-4 rounded-xl border ${isDarkMode ? "bg-red-900/20 border-red-700" : "bg-red-50 border-red-200"}`}>
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                            <p className="text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="p-6">
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
                        <div className={`${themeClasses.cardBg} backdrop-blur-xl rounded-2xl border ${themeClasses.border} p-6 mt-8 shadow-lg ${isDarkMode ? "shadow-black/20" : "shadow-gray-200/50"}`}>
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
                                <div className="mt-4 pt-4 border-t border-gray-700">
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