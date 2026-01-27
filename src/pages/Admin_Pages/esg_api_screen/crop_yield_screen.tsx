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
    Calendar,
    MapPin,
    TrendingUp,
    TrendingDown,
    Activity,
} from "lucide-react";
import { getCompanies, type Company } from "../../../services/Admin_Service/companies_service";
import {
    getCropYieldForecastData,
    type CropYieldForecastParams,
    getAvailableCropYieldYears,

} from "../../../services/Admin_Service/esg_apis/crop_yield_service";

// Import tab components
import OverviewTab from "./yield_tabs/OverviewTab";
import AnalyticsTab from "./yield_tabs/AnalyticsTab";
import ReportsTab from "./yield_tabs/ReportsTab";

// Color Palette
const LOGO_GREEN = '#008000';
const LOGO_YELLOW = '#B8860B';

// Loading Skeleton
const SkeletonCard = () => (
    <div className="animate-pulse h-full rounded-xl bg-gray-100"></div>
);

const Shimmer = () => (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent"></div>
);

const CropYieldCarbonEmissionScreen = () => {
    const { companyId: paramCompanyId } = useParams<{ companyId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cropYieldData, setCropYieldData] = useState<any>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>(paramCompanyId || "");
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [showCompanySelector, setShowCompanySelector] = useState(!paramCompanyId);
    const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "reports">("overview");
    const [isRefreshing, setIsRefreshing] = useState(false);

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

    // Fetch crop yield data
    const fetchCropYieldData = async () => {
        if (!selectedCompanyId) return;

        try {
            setLoading(true);
            setError(null);
            const params: CropYieldForecastParams = {
                companyId: selectedCompanyId,
            };

            if (selectedYear !== null) {
                params.year = selectedYear;
            }

            const data = await getCropYieldForecastData(params);
            setCropYieldData(data);

            const years = getAvailableCropYieldYears(data);
            const sortedYears = [...years].sort((a, b) => b - a);
            setAvailableYears(sortedYears);
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
        setShowCompanySelector(false);
        navigate(`/admin_crop_yield_carbon/${companyId}`);
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
            fetchCropYieldData();
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
        cropYieldData,
        selectedCompany,
        formatNumber,
        formatCurrency,
        formatPercent,
        getTrendIcon,
        selectedYear,
        availableYears,
        loading,
        isRefreshing,
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
                                <Building className="w-10 h-10" style={{ color: LOGO_GREEN }} />
                                <div>
                                    <h1 className="text-3xl font-bold" style={{ color: LOGO_GREEN }}>Select Company</h1>
                                    <p className="text-gray-600">Choose a company to view Crop Yield Forecast data</p>
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
                                            <Building className="w-6 h-6" style={{ color: LOGO_GREEN }} />
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
                <header
                    className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200 px-6 py-4"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate("/company-management")}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                style={{ color: LOGO_GREEN }}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold" style={{ color: LOGO_GREEN }}>Crop Yield Forecast Dashboard</h1>
                                <p className="text-sm text-gray-600">{selectedCompany?.name || "Company Data"}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {availableYears.length > 0 && (
                                <select
                                    value={selectedYear === null ? "" : selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">All Years</option>
                                    {availableYears.map((year) => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            )}
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                style={{ color: LOGO_GREEN }}
                            >
                                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-white font-medium"
                                style={{
                                    background: `linear-gradient(to right, ${LOGO_GREEN}, #006400)`,
                                }}
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-2 overflow-x-auto">
                        {[
                            { id: "overview", label: "Overview" },
                            { id: "analytics", label: "Analytics" },
                            { id: "reports", label: "Reports" }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-6 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                    ? 'text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                                    }`}
                                style={activeTab === tab.id ? {
                                    background: `linear-gradient(to right, ${LOGO_GREEN}, #006400)`,
                                } : {}}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </header>

                {/* Error Message */}
                {error && (
                    <div className="m-6 p-4 rounded-xl bg-red-50 border border-red-200">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="p-6">
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

            {/* Modals */}
            {/* Add your modals here */}
        </div>
    );
};

export default CropYieldCarbonEmissionScreen;