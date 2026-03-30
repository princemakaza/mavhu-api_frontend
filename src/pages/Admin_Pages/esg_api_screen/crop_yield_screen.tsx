import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import {
    RefreshCw,
    ChevronLeft,
    Download,
    ArrowRight,
    AlertCircle,
    X,
    Info,
    Calculator,
    TrendingUp,
    TrendingDown,
    Activity,
    Leaf,
} from "lucide-react";
import { getCompanies, type Company } from "../../../services/Admin_Service/companies_service";
import {
    getCropYieldForecastData,
    downloadCropYieldForecastDataAsPDF, // ✅ Import the PDF download function
    type CropYieldForecastParams,
    type CropYieldForecastResponse,
} from "../../../services/Admin_Service/esg_apis/crop_yield_service";

// Import tab components
import OverviewTab from "./yield_tabs/OverviewTab";
import AnalyticsTab from "./yield_tabs/AnalyticsTab";
import ReportsTab from "./yield_tabs/ReportsTab";

// Color Palette
const PRIMARY_GREEN = '#22c55e';
const SECONDARY_GREEN = '#16a34a';
const LIGHT_GREEN = '#86efac';
const DARK_GREEN = '#15803d';
const EMERALD = '#10b981';
const LIME = '#84cc16';
const BACKGROUND_GRAY = '#f9fafb';

// Shimmer loader
const Shimmer = () => (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent" />
);

// Helper: parse "2020-2024" -> [2020,2021,2022,2023,2024]
const parseDataRange = (dataRange: string | undefined): number[] => {
    if (!dataRange) return [];
    try {
        const cleaned = dataRange
            .replace(/–/g, '-')
            .replace(/\s+/g, '')
            .replace(/to/gi, '-')
            .trim();
        const [startStr, endStr] = cleaned.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (isNaN(start) || isNaN(end) || start > end) return [];
        const years: number[] = [];
        for (let y = start; y <= end; y++) years.push(y);
        return years;
    } catch {
        return [];
    }
};

// Helper: extract 4-digit years from string array
const extractNumericYears = (yearStrings: string[]): number[] => {
    const years = new Set<number>();
    yearStrings.forEach(str => {
        const matches = str.match(/\b\d{4}\b/g);
        if (matches) matches.forEach(y => years.add(parseInt(y, 10)));
    });
    return Array.from(years).sort((a, b) => b - a); // descending
};

// Minimum loading delay — ensures at least `ms` ms pass alongside the API call
const minDelay = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

const CropYieldCarbonEmissionScreen = () => {
    const { companyId: paramCompanyId } = useParams<{ companyId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cropYieldData, setCropYieldData] = useState<CropYieldForecastResponse | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>(paramCompanyId || "");
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [latestYear, setLatestYear] = useState<number | null>(null);
    const [showCompanySelector, setShowCompanySelector] = useState(!paramCompanyId);
    const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "reports">("overview");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showCalculationModal, setShowCalculationModal] = useState(false);
    const [selectedCalculation, setSelectedCalculation] = useState<any>(null);
    const [selectedModal, setSelectedModal] = useState<string | null>(null);
    const [selectedMetricData, setSelectedMetricData] = useState<any>(null);

    // Tracks whether this is the very first fetch so we auto-set year only once
    const isFirstFetch = useRef(true);

    // ── Format helpers ────────────────────────────────────────────────────────
    const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);
    const formatCurrency = (num: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(num);
    const formatPercent = (num: number) => `${num.toFixed(1)}%`;

    const getTrendIcon = (trend: string | number) => {
        if (typeof trend === 'number') {
            if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
            if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
            return <Activity className="w-4 h-4 text-yellow-600" />;
        }
        const t = trend.toLowerCase();
        if (t.includes('improving') || t.includes('increase') || t.includes('up'))
            return <TrendingUp className="w-4 h-4 text-green-600" />;
        if (t.includes('declining') || t.includes('decrease') || t.includes('down'))
            return <TrendingDown className="w-4 h-4 text-red-600" />;
        return <Activity className="w-4 h-4 text-yellow-600" />;
    };

    // ── Core data fetcher — takes explicit args to avoid stale closures ────────
    const fetchCropYieldDataWith = async (
        companyId: string,
        year: number | null,
        companiesList: Company[]
    ) => {
        if (!companyId) return;

        try {
            setLoading(true);
            setError(null);

            // Determine which year to request
            let yearToFetch: number;
            if (year !== null) {
                yearToFetch = year;
            } else {
                const company = companiesList.find(c => c._id === companyId);
                const rangeYears = parseDataRange(company?.data_range);
                yearToFetch = rangeYears.length > 0
                    ? Math.max(...rangeYears)
                    : new Date().getFullYear();
            }

            // Run API call and 3-second minimum delay in parallel
            const [data] = await Promise.all([
                getCropYieldForecastData({
                    companyId,
                    year: yearToFetch,
                } as CropYieldForecastParams),
                minDelay(3000),
            ]);

            setCropYieldData(data);

            // Resolve available years: response -> company range -> fallback
            let years: number[] = [];

            if (data?.data?.reporting_period?.data_available_years?.length) {
                years = extractNumericYears(data.data.reporting_period.data_available_years);
            }
            if (years.length === 0) {
                const company = companiesList.find(c => c._id === companyId);
                if (company?.data_range) years = parseDataRange(company.data_range);
            }
            if (years.length === 0) years = [yearToFetch];

            const sorted = [...years].sort((a, b) => b - a);
            setAvailableYears(sorted);

            const latest = sorted[0];
            setLatestYear(latest);

            // Only auto-set the year on first load — leave it alone on year-change refetches
            if (isFirstFetch.current) {
                setSelectedYear(latest);
                isFirstFetch.current = false;
            }
        } catch (err: any) {
            setError(err.message || "Failed to fetch crop yield forecast data");
            console.error("Error fetching crop yield data:", err);

            // Fallback: build year list from company data_range
            const company = companiesList.find(c => c._id === companyId);
            if (company?.data_range) {
                const fallback = parseDataRange(company.data_range).sort((a, b) => b - a);
                if (fallback.length) {
                    setAvailableYears(fallback);
                    setLatestYear(fallback[0]);
                    if (isFirstFetch.current) {
                        setSelectedYear(fallback[0]);
                        isFirstFetch.current = false;
                    }
                }
            }
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    // ── Initial load: fetch companies first, then data ────────────────────────
    const initLoad = async () => {
        try {
            const response = await getCompanies(1, 100);
            setCompanies(response.items);

            let companyId = selectedCompanyId;
            if (!companyId && response.items.length > 0) {
                companyId = response.items[0]._id;
                setSelectedCompanyId(companyId);
            }

            if (companyId) {
                await fetchCropYieldDataWith(companyId, null, response.items);
            } else {
                setLoading(false);
            }
        } catch (err: any) {
            console.error("Failed to fetch companies:", err);
            setLoading(false);
        }
    };

    // ── Refresh ───────────────────────────────────────────────────────────────
    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchCropYieldDataWith(selectedCompanyId, selectedYear, companies);
    };

    // ── Company change ────────────────────────────────────────────────────────
    const handleCompanyChange = (companyId: string) => {
        setSelectedCompanyId(companyId);
        setSelectedYear(null);
        setCropYieldData(null);
        setAvailableYears([]);
        setLatestYear(null);
        setShowCompanySelector(false);
        isFirstFetch.current = true;
        navigate(`/admin_crop_yield_carbon/${companyId}`);
        fetchCropYieldDataWith(companyId, null, companies);
    };

    // ── Year change ───────────────────────────────────────────────────────────
    const handleYearChange = (yearStr: string) => {
        const newYear = yearStr ? Number(yearStr) : latestYear;
        if (!newYear || isNaN(newYear)) return;
        setSelectedYear(newYear);
        fetchCropYieldDataWith(selectedCompanyId, newYear, companies);
    };

    // ── Calculation modal ─────────────────────────────────────────────────────
    const handleCalculationClick = (calculationType: string, data?: any) => {
        setSelectedCalculation({ type: calculationType, data: data || cropYieldData });
        setShowCalculationModal(true);
    };

    // ── Shared props for tab components ───────────────────────────────────────
    const selectedCompany = companies.find(c => c._id === selectedCompanyId);

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
        onCalculationClick: handleCalculationClick,
        colors: {
            primary: PRIMARY_GREEN,
            secondary: SECONDARY_GREEN,
            lightGreen: LIGHT_GREEN,
            darkGreen: DARK_GREEN,
            emerald: EMERALD,
            lime: LIME,
            background: BACKGROUND_GRAY,
        },
    };

    // ── Mount effect — single entry point ─────────────────────────────────────
    useEffect(() => {
        if (location.state?.companyId) {
            setSelectedCompanyId(location.state.companyId);
            setShowCompanySelector(false);
        }
        initLoad();
    }, []); // intentionally empty — run once on mount only

    // ── Loading skeleton ──────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50 text-gray-900">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <main className="flex-1 p-6">
                    <div className="mb-8 relative overflow-hidden">
                        <div className="h-12 rounded-xl bg-gray-100" />
                        <Shimmer />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="relative overflow-hidden">
                                <div className="h-32 rounded-xl bg-gray-100" />
                                <Shimmer />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {[1, 2].map(i => (
                            <div key={i} className="relative overflow-hidden">
                                <div className="h-96 rounded-xl bg-gray-100" />
                                <Shimmer />
                            </div>
                        ))}
                    </div>
                    <div className="relative overflow-hidden">
                        <div className="h-96 rounded-xl bg-gray-100" />
                        <Shimmer />
                    </div>
                </main>
            </div>
        );
    }

    // ── Company selector ──────────────────────────────────────────────────────
    if (showCompanySelector && !paramCompanyId) {
        return (
            <div className="flex min-h-screen bg-gray-50 text-gray-900">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <main className="flex-1 p-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg">
                            <div className="flex items-center gap-3 mb-8">
                                <Leaf className="w-10 h-10" style={{ color: PRIMARY_GREEN }} />
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">
                                        Select Company
                                    </h1>
                                    <p className="text-gray-600">Choose a company to view Crop Yield & Carbon Data</p>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                {companies.map((company) => (
                                    <button
                                        key={company._id}
                                        onClick={() => handleCompanyChange(company._id)}
                                        className="flex items-center gap-4 p-6 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-gray-50 transition-all duration-300 text-left group"
                                    >
                                        <div className="p-3 rounded-lg bg-green-50 border border-green-200 group-hover:bg-green-100 transition-colors">
                                            <Leaf className="w-6 h-6" style={{ color: PRIMARY_GREEN }} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg mb-1 text-gray-900">{company.name}</h3>
                                            <p className="text-sm text-gray-600">{company.industry} • {company.country}</p>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // ── Main view ─────────────────────────────────────────────────────────────
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
                                <h1 className="text-lg sm:text-xl font-bold" style={{ color: DARK_GREEN }}>
                                    Crop Yield & Carbon Dashboard
                                </h1>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                {/* Year selector — always visible once years are known */}
                                {availableYears.length > 0 && (
                                    <select
                                        value={selectedYear ?? ""}
                                        onChange={(e) => handleYearChange(e.target.value)}
                                        className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        {availableYears.map((year) => (
                                            <option key={year} value={year}>
                                                {year}{year === latestYear ? ' (Latest)' : ''}
                                            </option>
                                        ))}
                                    </select>
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
                                    onClick={() => {
                                        if (cropYieldData) {
                                            downloadCropYieldForecastDataAsPDF(cropYieldData);
                                        }
                                    }}
                                    disabled={!cropYieldData || loading}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-white font-medium text-sm"
                                    style={{ background: `linear-gradient(to right, ${PRIMARY_GREEN}, ${DARK_GREEN})` }}
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
                                { id: "analytics", label: "Analytics" },
                                { id: "reports", label: "Reports" },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-4 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all text-sm ${activeTab === tab.id
                                        ? 'text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                                        }`}
                                    style={
                                        activeTab === tab.id
                                            ? { background: `linear-gradient(to right, ${PRIMARY_GREEN}, ${DARK_GREEN})` }
                                            : {}
                                    }
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                {/* Error */}
                {error && (
                    <div className="m-4 sm:m-6 p-3 sm:p-4 rounded-xl bg-red-50 border border-red-200">
                        <div className="flex items-center">
                            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-red-600 flex-shrink-0" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {/* Tab Content */}
                <div className="p-4 sm:p-6">
                    {activeTab === "overview" && (
                        <OverviewTab
                            {...sharedData}
                            onMetricClick={(metric: any, modalType: string) => {
                                setSelectedMetricData(metric);
                                setSelectedModal(modalType);
                            }}
                        />
                    )}
                    {activeTab === "analytics" && (
                        <AnalyticsTab
                            {...sharedData}
                            onMetricClick={(metric: any, modalType: string) => {
                                setSelectedMetricData(metric);
                                setSelectedModal(modalType);
                            }}
                        />
                    )}
                    {activeTab === "reports" && (
                        <ReportsTab
                            {...sharedData}
                            onMetricClick={(metric: any, modalType: string) => {
                                setSelectedMetricData(metric);
                                setSelectedModal(modalType);
                            }}
                        />
                    )}
                </div>
            </main>

            {/* Calculation Modal */}
            {showCalculationModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowCalculationModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 z-10 p-5 border-b border-gray-200 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-white/20">
                                        <Calculator className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Calculation Methodology</h3>
                                        <p className="text-sm text-green-100">How we calculate these metrics</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowCalculationModal(false)}
                                    className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="space-y-3">
                                <h4 className="text-base font-bold text-gray-900 mb-2">Crop Yield Calculation</h4>
                                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                                    <p className="font-medium text-sm text-gray-700 mb-2">Formula:</p>
                                    <div className="bg-white p-3 rounded-lg border border-gray-200 mb-2">
                                        <code className="text-green-600 font-mono text-sm">
                                            Yield (t/ha) = Total Cane Milled / Total Area Harvested
                                        </code>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        Calculated using satellite-derived indices combined with ground-truth
                                        measurements, following FAO crop monitoring guidelines.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-base font-bold text-gray-900 mb-2">Cane to Sugar Ratio</h4>
                                <div className="p-3 rounded-xl bg-green-50 border border-green-200">
                                    <p className="font-medium text-sm text-gray-700 mb-2">Formula:</p>
                                    <div className="bg-white p-3 rounded-lg border border-green-200 mb-2">
                                        <code className="text-green-600 font-mono text-sm">
                                            Ratio (%) = Total Sugar Produced / Total Cane Milled x 100
                                        </code>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        This extraction efficiency metric reflects mill performance and cane quality.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-base font-bold text-gray-900 mb-2">Carbon Emissions from Agriculture</h4>
                                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                                    <p className="font-medium text-sm text-gray-700 mb-2">Formula:</p>
                                    <div className="bg-white p-3 rounded-lg border border-blue-200 mb-2">
                                        <code className="text-blue-600 font-mono text-sm">
                                            Emissions (tCO2e) = Activity Data x Emission Factor
                                        </code>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        Net emissions account for sequestration from crop biomass minus field emissions.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-base font-bold text-gray-900 mb-2">Data Sources & Methodology</h4>
                                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        <li className="flex items-start gap-2">
                                            <Info className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                            <span>Satellite Data: Sentinel-2 imagery at 10m resolution</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Info className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                            <span>Methodology: IPCC 2006 Guidelines & FAO crop monitoring</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Info className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                            <span>Verification: Ground truthing with field measurements</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CropYieldCarbonEmissionScreen;