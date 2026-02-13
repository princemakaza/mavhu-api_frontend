import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import {
    RefreshCw,
    ChevronLeft,
    Download,
    Building,
    ArrowRight,
    AlertCircle,
    X,
    Calendar,
    MapPin,
    Info,
    Calculator,
    TrendingUp,
    TrendingDown,
    Activity,
} from "lucide-react";
import { getCompanies, type Company } from "../../../services/Admin_Service/companies_service";
import {
    getSoilHealthCarbonData,
    type SoilHealthCarbonResponse,
    type SoilHealthCarbonParams,
    getAvailableSoilHealthYears,
} from "../../../services/Admin_Service/esg_apis/soil_carbon_service";

// Import tab components
import OverviewTab from "./soil_tabs/OverviewTab";
import AnalyticsTab from "./soil_tabs/AnalyticsTab";
import ReportsTab from "./soil_tabs/ReportsTab";


// Color Palette
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

const SoilHealthCarbonEmissionScreen = () => {
    const { companyId: paramCompanyId } = useParams<{ companyId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [soilHealthData, setSoilHealthData] = useState<SoilHealthCarbonResponse | null>(null);
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

    // Modal states
    const [selectedModal, setSelectedModal] = useState<string | null>(null);
    const [selectedMetricData, setSelectedMetricData] = useState<any>(null);

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

    // Fetch soil health data - defaults to latest year
    const fetchSoilHealthData = async () => {
        if (!selectedCompanyId) return;

        try {
            setLoading(true);
            setError(null);
            
            // First fetch all data to get available years
            const allData = await getSoilHealthCarbonData({
                companyId: selectedCompanyId,
            });
            
            // Get available years and determine latest
            const years = getAvailableSoilHealthYears(allData);
            const sortedYears = [...years].sort((a, b) => b - a);
            setAvailableYears(sortedYears);
            
            if (sortedYears.length > 0) {
                const latest = sortedYears[0]; // First item after descending sort is latest
                setLatestYear(latest);
                
                // If no year is selected yet, default to latest year
                const yearToFetch = selectedYear !== null ? selectedYear : latest;
                
                // Fetch data for the selected or latest year
                const params: SoilHealthCarbonParams = {
                    companyId: selectedCompanyId,
                    year: yearToFetch,
                };

                const data = await getSoilHealthCarbonData(params);
                setSoilHealthData(data);
                
                // Set selected year if it wasn't set
                if (selectedYear === null) {
                    setSelectedYear(latest);
                }
            } else {
                setSoilHealthData(allData);
            }
        } catch (err: any) {
            setError(err.message || "Failed to fetch soil health data");
            console.error("Error fetching soil health data:", err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchSoilHealthData();
    };

    const handleCompanyChange = (companyId: string) => {
        setSelectedCompanyId(companyId);
        setSelectedYear(null); // Reset year when changing company
        setShowCompanySelector(false);
        navigate(`/admin_soil_health_carbon/${companyId}`);
    };

    const handleYearChange = (year: string) => {
        const newYear = year ? Number(year) : latestYear;
        setSelectedYear(newYear);
    };

    // Handle calculation explanation click
    const handleCalculationClick = (calculationType: string, data?: any) => {
        setSelectedCalculation({
            type: calculationType,
            data: data || soilHealthData
        });
        setShowCalculationModal(true);
    };

    useEffect(() => {
        if (location.state?.companyId) {
            setSelectedCompanyId(location.state.companyId);
            setShowCompanySelector(false);
        }
        fetchCompanies();
    }, [location.state]);

    useEffect(() => {
        if (selectedCompanyId) {
            fetchSoilHealthData();
        }
    }, [selectedCompanyId, selectedYear]);

    // Get selected company
    const selectedCompany = companies.find(c => c._id === selectedCompanyId);

    // Format helpers
    const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);
    const formatCurrency = (num: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(num);
    const formatPercent = (num: number) => `${num.toFixed(1)}%`;

    // Get trend icon
    const getTrendIcon = (trend: string) => {
        if (trend.toLowerCase().includes('improving') || trend.toLowerCase().includes('increase')) {
            return <TrendingUp className="w-4 h-4 text-green-600" />;
        } else if (trend.toLowerCase().includes('declining') || trend.toLowerCase().includes('decrease')) {
            return <TrendingDown className="w-4 h-4 text-red-600" />;
        }
        return <Activity className="w-4 h-4 text-yellow-600" />;
    };

    // Prepare shared data for tabs
    const sharedData = {
        soilHealthData,
        selectedCompany,
        formatNumber,
        formatCurrency,
        formatPercent,
        getTrendIcon,
        selectedYear,
        availableYears,
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
            background: BACKGROUND_GRAY
        }
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
                                <Building className="w-10 h-10" style={{ color: PRIMARY_GREEN }} />
                                <div>
                                    <h1 
                                        className="text-3xl font-bold bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent"
                                    >
                                        Select Company
                                    </h1>
                                    <p className="text-gray-600">Choose a company to view ESG data</p>
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
                                            <Building className="w-6 h-6" style={{ color: PRIMARY_GREEN }} />
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
                                    Soil Health & Carbon Quality
                                </h1>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                {availableYears.length > 0 && (
                                    <select
                                        value={selectedYear || ""}
                                        onChange={(e) => handleYearChange(e.target.value)}
                                        className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        {availableYears.map((year) => (
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

                        {/* Tabs */}
                        <div className="flex space-x-2 overflow-x-auto pb-1">
                            {[
                                { id: "overview", label: "Overview" },
                                { id: "analytics", label: "Analytics" },
                                { id: "reports", label: "Reports" }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-4 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all text-sm ${activeTab === tab.id
                                        ? 'text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                                        }`}
                                    style={activeTab === tab.id ? {
                                        background: `linear-gradient(to right, ${PRIMARY_GREEN}, ${DARK_GREEN})`,
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
                            onMetricClick={(metric, modalType) => {
                                setSelectedMetricData(metric);
                                setSelectedModal(modalType);
                            }}
                        />
                    )}
                    {activeTab === "analytics" && (
                        <AnalyticsTab
                            {...sharedData}
                            onMetricClick={(metric, modalType) => {
                                setSelectedMetricData(metric);
                                setSelectedModal(modalType);
                            }}
                        />
                    )}
                    {activeTab === "reports" && (
                        <ReportsTab
                            {...sharedData}
                            onMetricClick={(metric, modalType) => {
                                setSelectedMetricData(metric);
                                setSelectedModal(modalType);
                            }}
                        />
                    )}
                </div>
            </main>

            {/* Calculation Explanation Modal */}
            {showCalculationModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowCalculationModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
                                <h4 className="text-base font-bold text-gray-900 mb-2">Soil Organic Carbon (SOC)</h4>
                                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                                    <p className="font-medium text-sm text-gray-700 mb-2">Formula:</p>
                                    <div className="bg-white p-3 rounded-lg border border-gray-200 mb-2">
                                        <code className="text-green-600 font-mono text-sm">
                                            SOC (tC/ha) = Satellite-derived indices × Conversion factor
                                        </code>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        Calculated using Sentinel-2 satellite imagery with NDVI/NDWI indices, 
                                        following IPCC 2006 Guidelines for AFOLU sector.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-base font-bold text-gray-900 mb-2">Carbon Stock Calculation</h4>
                                <div className="p-3 rounded-xl bg-green-50 border border-green-200">
                                    <p className="font-medium text-sm text-gray-700 mb-2">Formula:</p>
                                    <div className="bg-white p-3 rounded-lg border border-green-200 mb-2">
                                        <code className="text-green-600 font-mono text-sm">
                                            Carbon Stock (tCO₂/ha) = SOC (tC/ha) × 3.6667
                                        </code>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        The factor 3.6667 converts carbon mass to CO₂ equivalent (44/12).
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-base font-bold text-gray-900 mb-2">Net Carbon Balance</h4>
                                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                                    <p className="font-medium text-sm text-gray-700 mb-2">Formula:</p>
                                    <div className="bg-white p-3 rounded-lg border border-blue-200 mb-2">
                                        <code className="text-blue-600 font-mono text-sm">
                                            Net Balance = Total Sequestration - Total Emissions
                                        </code>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        Positive values indicate carbon sink, negative values indicate carbon source.
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
                                            <span>Methodology: IPCC 2006 Guidelines & 2019 Refinement</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Info className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                            <span>Verification: Ground truthing with soil samples</span>
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

export default SoilHealthCarbonEmissionScreen;