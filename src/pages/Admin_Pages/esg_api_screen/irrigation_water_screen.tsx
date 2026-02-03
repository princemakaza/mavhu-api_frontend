import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import {
    RefreshCw,
    ChevronLeft,
    Download,
    ArrowRight,
    AlertCircle,
    Calendar,
    TrendingUp,
    TrendingDown,
    Activity,
    BarChart3,
    PieChart,
    FileText,
    Droplets,
} from "lucide-react";
import { getCompanies, type Company } from "../../../services/Admin_Service/companies_service";
import {
    getIrrigationWaterData,
    type IrrigationWaterResponse,
    type IrrigationWaterParams,
    getAvailableIrrigationWaterYears,
} from "../../../services/Admin_Service/esg_apis/water_risk_service";

// Import tab components
import OverviewTab from "./water_tabs/OverviewTab";
import AnalyticsTab from "./water_tabs/AnalyticsTab";
import ReportsTab from "./water_tabs/ReportsTab";

// Color Palette (matching SoilHealthCarbonEmissionScreen)
const PRIMARY_GREEN = '#22c55e';       // Green-500
const SECONDARY_GREEN = '#16a34a';     // Green-600
const LIGHT_GREEN = '#86efac';         // Green-300
const DARK_GREEN = '#15803d';          // Green-700
const EMERALD = '#10b981';             // Emerald-500
const LIME = '#84cc16';                // Lime-500
const BACKGROUND_GRAY = '#f9fafb';     // Gray-50

// Loading Skeleton
const SkeletonCard = () => (
    <div className="animate-pulse h-full rounded-xl bg-gray-100"></div>
);

const Shimmer = () => (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent"></div>
);

// Helper function to parse data_range string
const parseDataRange = (dataRange: string | undefined): number[] => {
    if (!dataRange) return [];

    try {
        const cleanedRange = dataRange
            .replace(/–/g, '-')
            .replace(/\s+/g, '')
            .replace(/to/g, '-')
            .trim();

        const [startStr, endStr] = cleanedRange.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);

        if (isNaN(start) || isNaN(end) || start > end) {
            console.warn('Invalid data_range format:', dataRange);
            return [];
        }

        const years = [];
        for (let year = start; year <= end; year++) {
            years.push(year);
        }

        return years;
    } catch (error) {
        console.error('Error parsing data_range:', error, dataRange);
        return [];
    }
};

// Helper function to get end year from data_range
const getEndYearFromDataRange = (dataRange: string | undefined): number | null => {
    if (!dataRange) return null;
    const years = parseDataRange(dataRange);
    return years.length > 0 ? Math.max(...years) : null;
};

const IrrigationWaterScreen = () => {
    const { companyId: paramCompanyId } = useParams<{ companyId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [waterData, setWaterData] = useState<IrrigationWaterResponse | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>(paramCompanyId || "");
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [latestYear, setLatestYear] = useState<number | null>(null);
    const [showCompanySelector, setShowCompanySelector] = useState(!paramCompanyId);
    const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "reports">("overview");
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Format helpers
    const formatNumber = (num: number | null) => {
        if (num === null || num === undefined) return "N/A";
        return new Intl.NumberFormat('en-US').format(num);
    };

    const formatCurrency = (num: number | null) => {
        if (num === null || num === undefined) return "N/A";
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    };

    const formatPercent = (num: number | null) => {
        if (num === null || num === undefined) return "N/A";
        return `${num.toFixed(1)}%`;
    };

    // Get trend icon
    const getTrendIcon = (trend: string) => {
        if (trend.toLowerCase().includes('improving') ||
            trend.toLowerCase().includes('increase') ||
            trend.toLowerCase().includes('up') ||
            trend.toLowerCase().includes('positive') ||
            trend.toLowerCase().includes('stable')) {
            return <TrendingUp className="w-4 h-4 text-green-600" />;
        } else if (trend.toLowerCase().includes('declining') ||
            trend.toLowerCase().includes('decrease') ||
            trend.toLowerCase().includes('down') ||
            trend.toLowerCase().includes('negative')) {
            return <TrendingDown className="w-4 h-4 text-red-600" />;
        }
        return <Activity className="w-4 h-4 text-yellow-600" />;
    };

    // Fetch companies
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

    // Get available years from company's data_range
    const getAvailableYearsForCompany = (company: Company | undefined): number[] => {
        if (!company) return [];

        if (company.data_range) {
            const years = parseDataRange(company.data_range);
            if (years.length > 0) {
                return years.sort((a, b) => b - a); // Sort descending (latest first)
            }
        }

        if (company.latest_esg_report_year) {
            const currentYear = company.latest_esg_report_year;
            const years = [];
            for (let year = currentYear; year >= currentYear - 3; year--) {
                if (year > 2020) years.push(year);
            }
            return years;
        }

        const currentYear = new Date().getFullYear();
        return [currentYear];
    };

    // Fetch irrigation water data
    const fetchIrrigationWaterData = async () => {
        if (!selectedCompanyId) return;

        try {
            setLoading(true);
            setError(null);

            const selectedCompany = companies.find(c => c._id === selectedCompanyId);

            if (selectedCompany) {
                const years = getAvailableYearsForCompany(selectedCompany);
                setAvailableYears(years);

                if (years.length > 0) {
                    const latest = years[0]; // First in descending sorted array
                    setLatestYear(latest);

                    const yearToFetch = selectedYear !== null ? selectedYear : latest;

                    const params: IrrigationWaterParams = {
                        companyId: selectedCompanyId,
                        year: yearToFetch,
                    };

                    const data = await getIrrigationWaterData(params);
                    setWaterData(data);

                    if (selectedYear === null) {
                        setSelectedYear(latest);
                    }
                } else {
                    const currentYear = new Date().getFullYear();
                    const data = await getIrrigationWaterData({
                        companyId: selectedCompanyId,
                        year: currentYear,
                    });
                    setWaterData(data);

                    setAvailableYears([currentYear]);
                    setLatestYear(currentYear);
                    setSelectedYear(currentYear);
                }
            } else {
                const currentYear = new Date().getFullYear();
                const data = await getIrrigationWaterData({
                    companyId: selectedCompanyId,
                    year: currentYear,
                });
                setWaterData(data);
                setAvailableYears([currentYear]);
                setLatestYear(currentYear);
                setSelectedYear(currentYear);
            }
        } catch (err: any) {
            setError(err.message || "Failed to fetch irrigation water data");
            console.error("Error fetching irrigation water data:", err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchIrrigationWaterData();
    };

    const handleCompanyChange = (companyId: string) => {
        setSelectedCompanyId(companyId);
        setSelectedYear(null); // Reset year when changing company
        setShowCompanySelector(false);
        navigate(`/admin_irrigation_water/${companyId}`);
    };

    const handleYearChange = (year: string) => {
        const newYear = year ? Number(year) : latestYear;
        setSelectedYear(newYear);
    };

    // Handle metric click
    const handleMetricClick = (metric: any, modalType: string) => {
        console.log("Metric clicked:", metric, modalType);
    };

    // Handle calculation click
    const handleCalculationClick = (calculationType: string, data?: any) => {
        console.log("Calculation clicked:", calculationType, data);
    };

    // Calculate summary metrics for water data
    const summaryMetrics = useMemo(() => {
        if (!waterData) return null;

        const waterAnalysis = waterData.data.water_usage_analysis;
        const envMetrics = waterData.data.environmental_metrics.summary;

        return {
            irrigationWater: waterAnalysis.irrigation_water.current_value,
            treatmentWater: waterAnalysis.treatment_water.current_value,
            totalWater: waterAnalysis.total_water_usage.current_value,
            waterEfficiency: waterAnalysis.irrigation_water.efficiency_score,
            waterSavings: waterAnalysis.water_savings_analysis.potential_savings,
            shortageRisk: waterAnalysis.shortage_risk.level,
            ghgEmissions: envMetrics.total_ghg_emissions,
            scope1Emissions: envMetrics.scope1_emissions,
        };
    }, [waterData]);

    // Get coordinates from water data
    const getCoordinates = () => {
        if (!waterData) return [];
        return waterData.data.company.area_of_interest_metadata?.coordinates || [];
    };

    // Get area name and coverage from water data
    const getAreaInfo = () => {
        if (!waterData) return { name: "", covered: "" };
        const metadata = waterData.data.company.area_of_interest_metadata;
        return {
            name: metadata?.name || "Irrigation Area",
            covered: metadata?.area_covered || "N/A"
        };
    };

    useEffect(() => {
        if (location.state?.companyId) {
            setSelectedCompanyId(location.state.companyId);
            setShowCompanySelector(false);
        }
        fetchCompanies();
    }, [location.state]);

    useEffect(() => {
        if (selectedCompanyId && companies.length > 0) {
            fetchIrrigationWaterData();
        }
    }, [selectedCompanyId, selectedYear]);

    // Get selected company
    const selectedCompany = companies.find(c => c._id === selectedCompanyId);

    // Get area info
    const areaInfo = getAreaInfo();
    const coordinates = getCoordinates();

    // Prepare colors for OverviewTab - matching what it expects
    const overviewTabColors = {
        primary: PRIMARY_GREEN,
        secondary: SECONDARY_GREEN,
        lightGreen: LIGHT_GREEN,
        darkGreen: DARK_GREEN,
        emerald: EMERALD,
        lime: LIME,
        background: BACKGROUND_GRAY,
    };

    // Prepare shared data for tabs
    const sharedData = {
        waterData,
        selectedCompany,
        formatNumber,
        formatCurrency,
        formatPercent,
        getTrendIcon,
        selectedYear,
        availableYears,
        latestYear,
        loading,
        isRefreshing,
        onMetricClick: handleMetricClick,
        onCalculationClick: handleCalculationClick,
        coordinates: coordinates,
        areaName: areaInfo.name,
        areaCovered: areaInfo.covered,
        colors: overviewTabColors,
    };

    // Loading State
    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50 text-gray-900">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <main className="flex-1 p-6">
                    {/* Shimmer Header */}
                    <div className="mb-8 relative overflow-hidden">
                        <div className="h-12 rounded-xl bg-gray-100"></div>
                        <Shimmer />
                    </div>

                    {/* Shimmer Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="relative overflow-hidden">
                                <div className="h-32 rounded-xl bg-gray-100"></div>
                                <Shimmer />
                            </div>
                        ))}
                    </div>
                    {/* Shimmer Graphs */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {[1, 2].map(i => (
                            <div key={i} className="relative overflow-hidden">
                                <div className="h-96 rounded-xl bg-gray-100"></div>
                                <Shimmer />
                            </div>
                        ))}
                    </div>

                    {/* Shimmer Table */}
                    <div className="relative overflow-hidden">
                        <div className="h-96 rounded-xl bg-gray-100"></div>
                        <Shimmer />
                    </div>
                </main>
            </div>
        );
    }

    // Company Selector
    if (showCompanySelector && !paramCompanyId) {
        return (
            <div className="flex min-h-screen bg-gray-50 text-gray-900">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <main className="flex-1 p-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg">
                            <div className="flex items-center gap-3 mb-8">
                                <Droplets className="w-10 h-10" style={{ color: PRIMARY_GREEN }} />
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">
                                        Select Company
                                    </h1>
                                    <p className="text-gray-600">Choose a company to view Irrigation Water & Water Risk Data</p>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                {companies.map((company) => {
                                    const dataRangeYears = parseDataRange(company.data_range);
                                    const endYear = getEndYearFromDataRange(company.data_range);

                                    return (
                                        <button
                                            key={company._id}
                                            onClick={() => handleCompanyChange(company._id)}
                                            className="flex items-center gap-4 p-6 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-gray-50 transition-all duration-300 text-left group"
                                        >
                                            <div className="p-3 rounded-lg bg-green-50 border border-green-200 group-hover:bg-green-100 transition-colors">
                                                <Droplets className="w-6 h-6" style={{ color: PRIMARY_GREEN }} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg mb-1 text-gray-900">{company.name}</h3>
                                                <p className="text-sm text-gray-600">{company.industry} • {company.country}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div
                                                        className="text-xs px-2 py-1 rounded-full"
                                                        style={{
                                                            background: company.esg_data_status === 'complete'
                                                                ? 'rgba(34, 197, 94, 0.2)'
                                                                : company.esg_data_status === 'partial'
                                                                    ? 'rgba(251, 191, 36, 0.2)'
                                                                    : 'rgba(239, 68, 68, 0.2)',
                                                            color: company.esg_data_status === 'complete'
                                                                ? PRIMARY_GREEN
                                                                : company.esg_data_status === 'partial'
                                                                    ? '#FBBF24'
                                                                    : '#EF4444'
                                                        }}
                                                    >
                                                        {company.esg_data_status?.replace('_', ' ') || 'Not Collected'}
                                                    </div>
                                                    {company.data_range && (
                                                        <div className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-600 border border-green-200">
                                                            Data: {company.data_range}
                                                        </div>
                                                    )}
                                                </div>
                                                {company.data_range && dataRangeYears.length > 0 && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {dataRangeYears.length} year{dataRangeYears.length > 1 ? 's' : ''} available • Latest: {endYear}
                                                    </p>
                                                )}
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-900">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1">
                {/* Header */}
                <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200">
                    <div className="px-4 sm:px-6 py-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => navigate("/company-management")}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                                    style={{ color: PRIMARY_GREEN }}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div>
                                    <h1 className="text-lg sm:text-xl font-bold" style={{ color: DARK_GREEN }}>
                                        Irrigation Water & Water Risk Dashboard
                                    </h1>
                                    {selectedCompany && (
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-xs text-gray-600">{selectedCompany.name} • {selectedCompany.industry}</p>
                                            {selectedCompany.data_range && (
                                                <div className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">
                                                    Data range: {selectedCompany.data_range}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                {/* Year Selector */}
                                {availableYears.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <select
                                            value={selectedYear || ""}
                                            onChange={(e) => handleYearChange(e.target.value)}
                                            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 min-w-[120px]"
                                        >
                                            {availableYears.map((year) => (
                                                <option key={year} value={year}>
                                                    {year}
                                                    {year === latestYear ? ' (Latest)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <button
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                                    style={{ color: PRIMARY_GREEN }}
                                >
                                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                </button>
                                <button
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-white font-medium text-sm"
                                    style={{
                                        background: `linear-gradient(to right, ${PRIMARY_GREEN}, ${DARK_GREEN})`,
                                    }}
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Export
                                </button>
                            </div>
                        </div>
                        <div className="flex space-x-2 overflow-x-auto pb-1">
                            {[
                                { id: "overview", label: "Overview", icon: BarChart3 },
                                { id: "analytics", label: "Analytics", icon: PieChart },
                                { id: "reports", label: "Reports", icon: FileText }
                            ].map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all text-sm ${activeTab === tab.id
                                            ? 'text-white shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                                            }`}
                                        style={activeTab === tab.id ? {
                                            background: `linear-gradient(to right, ${PRIMARY_GREEN}, ${DARK_GREEN})`,
                                        } : {}}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </header>

                {/* Error Message */}
                {error && (
                    <div className="m-4 sm:m-6 p-3 sm:p-4 rounded-xl bg-red-50 border border-red-200">
                        <div className="flex items-center">
                            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-red-600 flex-shrink-0" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="p-4 sm:p-6">
                    {activeTab === "overview" && (
                        <OverviewTab
                            {...sharedData}
                        />
                    )}
                    {activeTab === "analytics" && (
                        <AnalyticsTab
                            {...sharedData}
                        />
                    )}
                    {activeTab === "reports" && (
                        <ReportsTab
                            {...sharedData}
                        />
                    )}
                </div>
            </main>
        </div>
    );
};

export default IrrigationWaterScreen;