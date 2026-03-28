import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import BankSidebar from "../../../components/bank_sidebar";
import {
    RefreshCw,
    ChevronLeft,
    Download,
    Building,
    ArrowRight,
    AlertCircle,
    Calendar,
    TrendingUp,
    TrendingDown,
    Activity,
    BarChart3,
    PieChart,
    FileText,
    Globe,
    Target,
    Shield,
    Leaf,
    Info,
    Minus,
    AlertTriangle,
    Users,
    Settings,
    Award,
    MapPin,
} from "lucide-react";
import { getCompanies, type Company } from "../../../services/Admin_Service/companies_service";
import {
    getCropYieldForecastData,
    type CropYieldForecastParams,
    type CropYieldForecastResponse,
    type YearOverYearChange,
} from "../../../services/Admin_Service/esg_apis/crop_yield_service";

// Import tab components (reused from admin)
import OverviewTab from "./bank_crop/overview";
import AnalyticsTab from "./yield_tabs/AnalyticsTab";
import ReportsTab from "./yield_tabs/ReportsTab";

// Bank colour palette
const PRIMARY_NAVY = "#0A3B5C";
const SECONDARY_GOLD = "#D4AF37";
const LIGHT_BG = "#F0F4F8";
const CARD_BG = "#FFFFFF";

// Loading Skeleton
const SkeletonCard = () => (
    <div className="animate-pulse h-full rounded-xl bg-gray-100"></div>
);

const Shimmer = () => (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent"></div>
);

// Helper: parse data_range string into numeric years
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

// Helper: extract numeric years from reporting_period.data_available_years (strings)
const extractNumericYears = (yearStrings: string[]): number[] => {
    const years = new Set<number>();
    yearStrings.forEach(str => {
        const match = str.match(/\b\d{4}\b/g);
        if (match) {
            match.forEach(y => years.add(parseInt(y, 10)));
        }
    });
    return Array.from(years).sort((a, b) => b - a); // descending, latest first
};

// Helper to get trend analysis (used in the analytical cards)
const getTrendAnalysis = (current: number, previous: number) => {
    if (!previous) return { direction: 'stable', percentChange: 0, icon: Minus, color: 'text-gray-500' };
    const change = ((current - previous) / previous) * 100;
    if (change > 5) return { direction: 'improving', percentChange: change, icon: TrendingUp, color: 'text-green-600' };
    if (change < -5) return { direction: 'declining', percentChange: change, icon: TrendingDown, color: 'text-red-600' };
    return { direction: 'stable', percentChange: change, icon: Minus, color: 'text-gray-500' };
};

const BankCropYieldScreen = () => {
    const { companyId: paramCompanyId } = useParams<{ companyId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cropYieldData, setCropYieldData] = useState<CropYieldForecastResponse | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [companiesLoaded, setCompaniesLoaded] = useState(false);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>(paramCompanyId || "");
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [latestYear, setLatestYear] = useState<number | null>(null);
    const [showCompanySelector, setShowCompanySelector] = useState(!paramCompanyId);
    const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "reports">("overview");
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Format helpers
    const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);
    const formatCurrency = (num: number) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(num);
    const formatPercent = (num: number) => `${num.toFixed(1)}%`;

    // Get trend icon
    const getTrendIcon = (trend: string | number) => {
        if (typeof trend === 'number') {
            return trend > 0
                ? <TrendingUp className="w-4 h-4 text-green-600" />
                : trend < 0
                    ? <TrendingDown className="w-4 h-4 text-red-600" />
                    : <Activity className="w-4 h-4 text-yellow-600" />;
        }
        if (trend.toLowerCase().includes('improving') || trend.toLowerCase().includes('increase') || trend.toLowerCase().includes('up')) {
            return <TrendingUp className="w-4 h-4 text-green-600" />;
        } else if (trend.toLowerCase().includes('declining') || trend.toLowerCase().includes('decrease') || trend.toLowerCase().includes('down')) {
            return <TrendingDown className="w-4 h-4 text-red-600" />;
        }
        return <Activity className="w-4 h-4 text-yellow-600" />;
    };

    // Fetch companies (same service as admin)
    const fetchCompanies = async () => {
        try {
            const response = await getCompanies(1, 100);
            setCompanies(response.items);
            setCompaniesLoaded(true);
            if (!selectedCompanyId && response.items.length > 0) {
                setSelectedCompanyId(response.items[0]._id);
            }
        } catch (err: any) {
            console.error("Failed to fetch companies:", err);
            setCompaniesLoaded(true); // still mark as loaded to avoid infinite waiting
        }
    };

    // Get available years from company's data_range (used before data is loaded)
    const getAvailableYearsFromCompany = (company: Company | undefined): number[] => {
        if (!company) return [];

        if (company.data_range) {
            const years = parseDataRange(company.data_range);
            if (years.length > 0) {
                return years.sort((a, b) => b - a);
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

    // Fetch crop yield data (same API)
    const fetchCropYieldData = async () => {
        if (!selectedCompanyId) return;

        try {
            setLoading(true);
            setError(null);

            const selectedCompany = companies.find(c => c._id === selectedCompanyId);

            // Determine year to fetch
            let yearToFetch: number;
            if (selectedYear !== null) {
                yearToFetch = selectedYear;
            } else {
                // Use latest from company data_range or current year
                const yearsFromCompany = getAvailableYearsFromCompany(selectedCompany);
                yearToFetch = yearsFromCompany.length > 0 ? yearsFromCompany[0] : new Date().getFullYear();
            }

            const params: CropYieldForecastParams = {
                companyId: selectedCompanyId,
                year: yearToFetch,
            };

            const data = await getCropYieldForecastData(params);
            setCropYieldData(data);

            // Update available years from the API response
            if (data.data.reporting_period.data_available_years) {
                const numericYears = extractNumericYears(data.data.reporting_period.data_available_years);
                setAvailableYears(numericYears);
                const latest = numericYears.length > 0 ? numericYears[0] : yearToFetch;
                setLatestYear(latest);
                if (selectedYear === null) {
                    setSelectedYear(latest);
                }
            } else {
                // Fallback to company-based years
                const yearsFromCompany = getAvailableYearsFromCompany(selectedCompany);
                setAvailableYears(yearsFromCompany);
                const latest = yearsFromCompany.length > 0 ? yearsFromCompany[0] : yearToFetch;
                setLatestYear(latest);
                if (selectedYear === null) {
                    setSelectedYear(latest);
                }
            }
        } catch (err: any) {
            setError(err.message || "Failed to fetch crop yield forecast data");
            console.error("Error fetching crop yield data:", err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchCropYieldData();
    };

    const handleCompanyChange = (companyId: string) => {
        setSelectedCompanyId(companyId);
        setSelectedYear(null);
        setCropYieldData(null);
        setShowCompanySelector(false);
        navigate(`/bank_crop_yield/${companyId}`); // bank route
    };

    const handleYearChange = (year: string) => {
        const newYear = year ? Number(year) : latestYear;
        setSelectedYear(newYear);
    };

    // Placeholder metric handlers (can be extended later)
    const handleMetricClick = (metric: any, modalType: string) => {
        console.log("Metric clicked:", metric, modalType);
    };

    const handleCalculationClick = (calculationType: string, data?: any) => {
        console.log("Calculation clicked:", calculationType, data);
    };

    // Derive summary metrics from the real API response
    const summaryMetrics = useMemo(() => {
        if (!cropYieldData) return null;

        const yearly = cropYieldData.data.crop_yield_metrics.yearly_summary;
        const changes = cropYieldData.data.crop_yield_metrics.year_over_year_changes;

        // Helper to find YoY change for a specific metric and period that includes the selected year
        const getChangeForMetric = (metricName: string, targetYear: number): number | null => {
            const targetPeriod = `${targetYear - 1}→${targetYear}`;
            const entry = changes.find(c => c.metric === metricName && c.period === targetPeriod);
            return entry ? entry.numeric_change : null;
        };

        const currentYear = selectedYear || latestYear || new Date().getFullYear();

        return {
            // Total Cane Milled (tons)
            totalYield: yearly.total_cane_milled,
            yieldChange: getChangeForMetric("Total Cane Milled", currentYear) ?? 0,

            // Company yield (tons/ha)
            companyYield: yearly.company_yield,
            companyYieldChange: getChangeForMetric("Company Yield (tons/ha)", currentYear) ?? 0,

            // Private yield
            privateYield: yearly.private_yield,

            // Total area (ha)
            totalArea: yearly.total_area,

            // Cane to sugar ratio (%)
            caneToSugarRatio: yearly.cane_to_sugar_ratio,

            // Total sugar produced (company)
            totalSugar: yearly.total_sugar_produced_company,

            // Total molasses
            totalMolasses: yearly.total_molasses_produced,
        };
    }, [cropYieldData, selectedYear, latestYear]);

    // Get selected company
    const selectedCompany = companies.find(c => c._id === selectedCompanyId);

    // Mock coordinates – can be replaced with real data from company.area_of_interest_metadata
    const mockCoordinates = selectedCompany?.area_of_interest_metadata?.coordinates.map((c: any) => ({ lat: c.lat, lon: c.lon })) || [
        { lat: 40.7128, lon: -74.0060 },
        { lat: 40.7129, lon: -74.0061 },
        { lat: 40.7127, lon: -74.0059 },
        { lat: 40.7128, lon: -74.0060 },
    ];
    const areaName = selectedCompany?.area_of_interest_metadata?.name || "Primary Farm Fields";
    const areaCovered = selectedCompany?.area_of_interest_metadata?.area_covered || "1,200 acres";

    // --- Analysis Helpers (bank-specific cards) ---
    const yieldTrendAnalysis = summaryMetrics ? getTrendAnalysis(
        summaryMetrics.companyYield,
        summaryMetrics.companyYield * (1 - summaryMetrics.companyYieldChange / 100) // rough previous
    ) : null;

    const getSectorComparison = () => {
        // Placeholder sector average (could be from API or config)
        const sectorAvgYield = 65; // t/ha
        const companyYield = summaryMetrics?.companyYield || 0;
        const diff = companyYield - sectorAvgYield;
        const percentDiff = sectorAvgYield ? (diff / sectorAvgYield) * 100 : 0;
        return {
            company: companyYield,
            sectorAvg: sectorAvgYield,
            diff,
            percentDiff,
            aboveAverage: diff > 0,
        };
    };

    const sectorComparison = getSectorComparison();

    const getESGImplications = () => {
        const yieldVal = summaryMetrics?.companyYield || 0;
        const change = summaryMetrics?.companyYieldChange || 0;

        let environmentalImpact = yieldVal > 70 ? "Positive (high efficiency)" : yieldVal > 50 ? "Neutral" : "Negative (low yield)";
        let climateRisk = change > 5 ? "Increasing – monitor emissions" : change < -5 ? "Declining – risk to supply" : "Stable";
        let socialImplication = yieldVal > 60 ? "Supports food security & livelihoods" : "May threaten local food supply";
        let governanceImplication = "Data confidence moderate, verify before lending decisions";

        return { environmentalImpact, climateRisk, socialImplication, governanceImplication };
    };

    const esgImplications = getESGImplications();

    // Shared data for tabs (same shape as admin version)
    const sharedData = {
        cropYieldData,
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
        coordinates: mockCoordinates,
        areaName,
        areaCovered,
        colors: {
            primary: PRIMARY_NAVY,
            secondary: SECONDARY_GOLD,
            lightBg: LIGHT_BG,
            cardBg: CARD_BG,
        },
        summaryMetrics,
    };

    useEffect(() => {
        if (location.state?.companyId) {
            setSelectedCompanyId(location.state.companyId);
            setShowCompanySelector(false);
        }
        fetchCompanies();
    }, [location.state]);

    // Wait for companies to load before fetching data
    useEffect(() => {
        if (companiesLoaded && selectedCompanyId) {
            fetchCropYieldData();
        }
    }, [companiesLoaded, selectedCompanyId, selectedYear]);

    // Loading State
    if (loading && !cropYieldData) {
        return (
            <div className="flex min-h-screen bg-gray-50 text-gray-900">
                <BankSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <main className="flex-1 p-6">
                    <div className="mb-8 relative overflow-hidden">
                        <div className="h-12 rounded-xl bg-gray-100"></div>
                        <Shimmer />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="relative overflow-hidden">
                                <div className="h-32 rounded-xl bg-gray-100"></div>
                                <Shimmer />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {[1, 2].map(i => (
                            <div key={i} className="relative overflow-hidden">
                                <div className="h-96 rounded-xl bg-gray-100"></div>
                                <Shimmer />
                            </div>
                        ))}
                    </div>
                    <div className="relative overflow-hidden">
                        <div className="h-96 rounded-xl bg-gray-100"></div>
                        <Shimmer />
                    </div>
                </main>
            </div>
        );
    }

    // Company Selector (if no company is pre-selected)
    if (showCompanySelector && !paramCompanyId) {
        return (
            <div className="flex min-h-screen bg-gray-50 text-gray-900">
                <BankSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <main className="flex-1 p-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg">
                            <div className="flex items-center gap-3 mb-8">
                                <Leaf className="w-10 h-10" style={{ color: PRIMARY_NAVY }} />
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-yellow-700 bg-clip-text text-transparent">
                                        Select Client
                                    </h1>
                                    <p className="text-gray-600">Choose a client to view Crop Yield & Carbon Data</p>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                {companies.map((company) => {
                                    const dataRangeYears = parseDataRange(company.data_range);
                                    const endYear = dataRangeYears.length > 0 ? Math.max(...dataRangeYears) : null;

                                    return (
                                        <button
                                            key={company._id}
                                            onClick={() => handleCompanyChange(company._id)}
                                            className="flex items-center gap-4 p-6 rounded-xl border border-gray-200 hover:border-blue-900 hover:bg-gray-50 transition-all duration-300 text-left group"
                                        >
                                            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 group-hover:bg-blue-100 transition-colors">
                                                <Leaf className="w-6 h-6" style={{ color: PRIMARY_NAVY }} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg mb-1 text-gray-900">{company.name}</h3>
                                                <p className="text-sm text-gray-600">{company.industry} • {company.country}</p>
                                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                    <div
                                                        className="text-xs px-2 py-1 rounded-full capitalize"
                                                        style={{
                                                            background: company.esg_data_status === 'complete'
                                                                ? 'rgba(10, 59, 92, 0.2)'
                                                                : company.esg_data_status === 'partial'
                                                                    ? 'rgba(212, 175, 55, 0.2)'
                                                                    : 'rgba(239, 68, 68, 0.2)',
                                                            color: company.esg_data_status === 'complete'
                                                                ? PRIMARY_NAVY
                                                                : company.esg_data_status === 'partial'
                                                                    ? SECONDARY_GOLD
                                                                    : '#EF4444'
                                                        }}
                                                    >
                                                        {company.esg_data_status?.replace('_', ' ') || 'Not Collected'}
                                                    </div>
                                                    {company.data_range && (
                                                        <div className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
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
                                            <ArrowRight className="w-5 h-5 text-blue-900 opacity-0 group-hover:opacity-100 transition-opacity" />
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
            <BankSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1">
                {/* Header */}
                <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200">
                    <div className="px-4 sm:px-6 py-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => navigate("/bank-dashboard")}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                                    style={{ color: PRIMARY_NAVY }}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div>
                                    <h1 className="text-lg sm:text-xl font-bold" style={{ color: PRIMARY_NAVY }}>
                                        Crop Yield & Carbon Dashboard
                                    </h1>
                                    {selectedCompany && (
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-xs text-gray-600">{selectedCompany.name} • {selectedCompany.industry}</p>
                                            {selectedCompany.data_range && (
                                                <div className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
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
                                            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-900 min-w-[120px]"
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
                                    style={{ color: PRIMARY_NAVY }}
                                >
                                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                </button>
                                <button
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-white font-medium text-sm"
                                    style={{
                                        background: `linear-gradient(to right, ${PRIMARY_NAVY}, ${SECONDARY_GOLD})`,
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
                                            background: `linear-gradient(to right, ${PRIMARY_NAVY}, #05283e)`,
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

                {/* Quick Stats Bar */}
                {summaryMetrics && !error && (
                    <div className="mx-4 sm:mx-6 mt-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Total Cane Milled */}
                            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-600">Total Cane Milled</span>
                                    <Target className="w-4 h-4" style={{ color: PRIMARY_NAVY }} />
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-gray-900">{formatNumber(summaryMetrics.totalYield)}</span>
                                    <span className="text-sm font-medium text-blue-600">tons</span>
                                </div>
                                <div className="flex items-center gap-1 mt-2 text-sm">
                                    {getTrendIcon(summaryMetrics.yieldChange)}
                                    <span className={summaryMetrics.yieldChange > 0 ? 'text-green-600' : summaryMetrics.yieldChange < 0 ? 'text-red-600' : 'text-gray-600'}>
                                        {summaryMetrics.yieldChange !== 0 ? `${summaryMetrics.yieldChange > 0 ? '+' : ''}${summaryMetrics.yieldChange}%` : '0%'}
                                    </span>
                                    <span className="text-gray-600">vs last year</span>
                                </div>
                            </div>

                            {/* Company Yield (tons/ha) */}
                            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-100">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-600">Company Yield</span>
                                    <Leaf className="w-4 h-4" style={{ color: SECONDARY_GOLD }} />
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-gray-900">{summaryMetrics.companyYield.toFixed(2)}</span>
                                    <span className="text-sm font-medium text-yellow-600">t/ha</span>
                                </div>
                                <div className="flex items-center gap-1 mt-2 text-sm">
                                    {getTrendIcon(summaryMetrics.companyYieldChange)}
                                    <span className={summaryMetrics.companyYieldChange > 0 ? 'text-green-600' : summaryMetrics.companyYieldChange < 0 ? 'text-red-600' : 'text-gray-600'}>
                                        {summaryMetrics.companyYieldChange !== 0 ? `${summaryMetrics.companyYieldChange > 0 ? '+' : ''}${summaryMetrics.companyYieldChange}%` : '0%'}
                                    </span>
                                    <span className="text-gray-600">vs last year</span>
                                </div>
                            </div>

                            {/* Total Area Under Cane */}
                            <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-600">Total Area</span>
                                    <Activity className="w-4 h-4 text-purple-600" />
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-gray-900">{formatNumber(summaryMetrics.totalArea)}</span>
                                    <span className="text-sm font-medium text-purple-600">ha</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-2">
                                    Private yield: {summaryMetrics.privateYield.toFixed(2)} t/ha
                                </div>
                            </div>

                            {/* Cane to Sugar Ratio */}
                            <div className="p-4 rounded-lg bg-orange-50 border border-orange-100">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-600">Cane to Sugar</span>
                                    <Shield className="w-4 h-4 text-orange-600" />
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-gray-900">{summaryMetrics.caneToSugarRatio.toFixed(2)}</span>
                                    <span className="text-sm font-medium text-orange-600">%</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-2">
                                    Sugar: {formatNumber(summaryMetrics.totalSugar)} tons
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ESG Analysis Cards (bank-specific) */}
                {summaryMetrics && !error && (
                    <div className="mx-4 sm:mx-6 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Trend Analysis Card */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden lg:col-span-1">
                            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-yellow-50">
                                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" style={{ color: PRIMARY_NAVY }} />
                                    Trend Analysis
                                </h3>
                            </div>
                            <div className="p-4 space-y-3">
                                {yieldTrendAnalysis && (
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-2 rounded-full ${yieldTrendAnalysis.color} bg-opacity-10`}>
                                                <yieldTrendAnalysis.icon className={`w-4 h-4 ${yieldTrendAnalysis.color}`} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Yield Trend</p>
                                                <p className="font-semibold text-sm text-gray-900 capitalize">{yieldTrendAnalysis.direction}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-600">Change</p>
                                            <p className={`font-bold text-sm ${yieldTrendAnalysis.color}`}>
                                                {yieldTrendAnalysis.percentChange > 0 ? '+' : ''}{yieldTrendAnalysis.percentChange.toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-3 rounded-xl bg-gray-50">
                                        <p className="text-xs text-gray-600 mb-1">Projected 5‑Year Yield</p>
                                        <p className="text-base font-bold text-gray-900">
                                            {summaryMetrics ? (summaryMetrics.companyYield * 1.08).toFixed(2) : 'N/A'} t/ha
                                        </p>
                                        <p className="text-xs text-green-600">+8% estimated growth</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-gray-50">
                                        <p className="text-xs text-gray-600 mb-1">Confidence</p>
                                        <p className="text-base font-bold text-gray-900">85%</p>
                                        <p className="text-xs text-blue-600">High</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sector Comparison Card */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden lg:col-span-1">
                            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-yellow-50">
                                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    <Globe className="w-4 h-4" style={{ color: PRIMARY_NAVY }} />
                                    Sector Benchmark
                                </h3>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-600">Company Yield</p>
                                        <p className="text-xl font-bold text-gray-900">{sectorComparison.company.toFixed(2)} t/ha</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Sector Avg</p>
                                        <p className="text-xl font-bold text-gray-900">{sectorComparison.sectorAvg} t/ha</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Diff</p>
                                        <p className={`text-xl font-bold ${sectorComparison.aboveAverage ? 'text-green-600' : 'text-red-600'}`}>
                                            {sectorComparison.aboveAverage ? '+' : ''}{sectorComparison.percentDiff.toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${Math.min(100, (sectorComparison.company / sectorComparison.sectorAvg) * 100)}%`,
                                            backgroundColor: PRIMARY_NAVY,
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-gray-600">
                                    {sectorComparison.aboveAverage
                                        ? 'Above sector average – strong performance'
                                        : 'Below sector average – improvement opportunity'}
                                </p>
                            </div>
                        </div>

                        {/* ESG Implications Card */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden lg:col-span-1">
                            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-yellow-50">
                                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    <Shield className="w-4 h-4" style={{ color: PRIMARY_NAVY }} />
                                    ESG Implications
                                </h3>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-2 rounded-lg bg-blue-50">
                                        <p className="text-[10px] text-gray-600">Environmental</p>
                                        <p className="text-xs font-semibold text-gray-900">{esgImplications.environmentalImpact}</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-yellow-50">
                                        <p className="text-[10px] text-gray-600">Climate Risk</p>
                                        <p className="text-xs font-semibold text-gray-900">{esgImplications.climateRisk}</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-purple-50">
                                        <p className="text-[10px] text-gray-600">Social</p>
                                        <p className="text-xs font-semibold text-gray-900">{esgImplications.socialImplication}</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-gray-50">
                                        <p className="text-[10px] text-gray-600">Governance</p>
                                        <p className="text-xs font-semibold text-gray-900">{esgImplications.governanceImplication}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content */}
                <div className="p-4 sm:p-6">
                    {activeTab === "overview" && <OverviewTab {...sharedData} />}
                    {activeTab === "analytics" && <AnalyticsTab {...sharedData} />}
                    {activeTab === "reports" && <ReportsTab {...sharedData} />}
                </div>
            </main>
        </div>
    );
};

export default BankCropYieldScreen;