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
    TrendingUp,
    TrendingDown,
    Activity,
} from "lucide-react";
import { getCompanies, type Company } from "../../../services/Admin_Service/companies_service";
import {
    getBiodiversityLandUseData,
    type BiodiversityLandUseResponse,
    type BiodiversityLandUseParams,
    getAvailableBiodiversityYears,
} from "../../../services/Admin_Service/esg_apis/biodiversity_api_service";

// Import tab components
import OverviewTab from "./biodiversity_tabs/OverviewTab";
import AnalyticsTab from "./biodiversity_tabs/AnalyticsTab";
import ReportsTab from "./biodiversity_tabs/ReportsTab";

// Unified Design System - matches OverviewTab
const DESIGN_SYSTEM = {
    primary: {
        main: '#059669',
        light: '#10b981',
        dark: '#047857',
        50: '#ecfdf5',
        100: '#d1fae5',
        200: '#a7f3d0',
    },
    secondary: {
        main: '#f59e0b',
        light: '#fbbf24',
        dark: '#d97706',
        50: '#fffbeb',
        100: '#fef3c7',
    },
    status: {
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
    },
    neutral: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
    }
};

// Loading Skeleton
const Shimmer = () => (
    <div 
        className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite]"
        style={{
            background: `linear-gradient(to right, transparent, ${DESIGN_SYSTEM.neutral[100]}50, transparent)`
        }}
    ></div>
);

const BiodiversityLandUseScreen = () => {
    const { companyId: paramCompanyId } = useParams<{ companyId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [biodiversityData, setBiodiversityData] = useState<BiodiversityLandUseResponse | null>(null);
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

    // Fetch biodiversity data
    const fetchBiodiversityData = async () => {
        if (!selectedCompanyId) return;

        try {
            setLoading(true);
            setError(null);
            const params: BiodiversityLandUseParams = {
                companyId: selectedCompanyId,
            };

            if (selectedYear !== null) {
                params.year = selectedYear;
            }

            const data = await getBiodiversityLandUseData(params);
            setBiodiversityData(data);

            const years = getAvailableBiodiversityYears(data);
            const sortedYears = [...years].sort((a, b) => b - a);
            setAvailableYears(sortedYears);
        } catch (err: any) {
            setError(err.message || "Failed to fetch biodiversity data");
            console.error("Error fetching biodiversity data:", err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchBiodiversityData();
    };

    const handleCompanyChange = (companyId: string) => {
        setSelectedCompanyId(companyId);
        setShowCompanySelector(false);
        navigate(`/admin_biodiversity_land_use/${companyId}`);
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
            fetchBiodiversityData();
        }
    }, [selectedCompanyId, selectedYear]);

    // Get selected company
    const selectedCompany = companies.find(c => c._id === selectedCompanyId);

    // Format helpers
    const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);
    const formatCurrency = (num: number) => new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD', 
        minimumFractionDigits: 0 
    }).format(num);
    const formatPercent = (num: number) => `${num.toFixed(1)}%`;

    // Get trend icon
    const getTrendIcon = (trend: string) => {
        if (trend.toLowerCase().includes('improving') || 
            trend.toLowerCase().includes('increase') || 
            trend.toLowerCase().includes('positive')) {
            return <TrendingUp className="w-4 h-4" style={{ color: DESIGN_SYSTEM.status.success }} />;
        } else if (trend.toLowerCase().includes('declining') || 
                   trend.toLowerCase().includes('decrease') || 
                   trend.toLowerCase().includes('negative')) {
            return <TrendingDown className="w-4 h-4" style={{ color: DESIGN_SYSTEM.status.danger }} />;
        }
        return <Activity className="w-4 h-4" style={{ color: DESIGN_SYSTEM.secondary.main }} />;
    };

    // Prepare shared data for tabs
    const sharedData = {
        biodiversityData,
        selectedCompany,
        formatNumber,
        formatCurrency,
        formatPercent,
        getTrendIcon,
        selectedYear,
        availableYears,
        loading,
        isRefreshing,
        onMetricClick: (metric: any, modalType: string) => {
            setSelectedMetricData(metric);
            setSelectedModal(modalType);
        }
    };

    // Loading State
    if (loading) {
        return (
            <div className="flex min-h-screen" style={{ backgroundColor: DESIGN_SYSTEM.neutral[50] }}>
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <main className="flex-1 p-6">
                    {/* Shimmer Header */}
                    <div className="mb-8 relative overflow-hidden">
                        <div className="h-12 rounded-xl" style={{ backgroundColor: DESIGN_SYSTEM.neutral[100] }}></div>
                        <Shimmer />
                    </div>

                    {/* Shimmer Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="relative overflow-hidden">
                                <div className="h-32 rounded-xl" style={{ backgroundColor: DESIGN_SYSTEM.neutral[100] }}></div>
                                <Shimmer />
                            </div>
                        ))}
                    </div>

                    {/* Shimmer Graphs */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {[1, 2].map(i => (
                            <div key={i} className="relative overflow-hidden">
                                <div className="h-96 rounded-xl" style={{ backgroundColor: DESIGN_SYSTEM.neutral[100] }}></div>
                                <Shimmer />
                            </div>
                        ))}
                    </div>

                    {/* Shimmer Table */}
                    <div className="relative overflow-hidden">
                        <div className="h-96 rounded-xl" style={{ backgroundColor: DESIGN_SYSTEM.neutral[100] }}></div>
                        <Shimmer />
                    </div>
                </main>
            </div>
        );
    }

    // Company Selector
    if (showCompanySelector && !paramCompanyId) {
        return (
            <div className="flex min-h-screen" style={{ backgroundColor: DESIGN_SYSTEM.neutral[50] }}>
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <main className="flex-1 p-6">
                    <div className="max-w-6xl mx-auto">
                        <div 
                            className="bg-white rounded-2xl border p-8 shadow-lg"
                            style={{ borderColor: DESIGN_SYSTEM.neutral[200] }}
                        >
                            <div className="flex items-center gap-3 mb-8">
                                <Building className="w-10 h-10" style={{ color: DESIGN_SYSTEM.primary.main }} />
                                <div>
                                    <h1 className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.primary.main }}>
                                        Select Company
                                    </h1>
                                    <p style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                                        Choose a company to view Biodiversity & Land Use data
                                    </p>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                {companies.map((company) => (
                                    <button
                                        key={company._id}
                                        onClick={() => handleCompanyChange(company._id)}
                                        className="flex items-center gap-4 p-6 rounded-xl border transition-all duration-300 text-left group"
                                        style={{ 
                                            borderColor: DESIGN_SYSTEM.neutral[200],
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = DESIGN_SYSTEM.primary.main;
                                            e.currentTarget.style.backgroundColor = DESIGN_SYSTEM.neutral[50];
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = DESIGN_SYSTEM.neutral[200];
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        <div 
                                            className="p-3 rounded-lg border transition-colors"
                                            style={{
                                                backgroundColor: DESIGN_SYSTEM.primary[50],
                                                borderColor: DESIGN_SYSTEM.primary[200]
                                            }}
                                        >
                                            <Building className="w-6 h-6" style={{ color: DESIGN_SYSTEM.primary.main }} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 
                                                className="font-semibold text-lg mb-1"
                                                style={{ color: DESIGN_SYSTEM.neutral[900] }}
                                            >
                                                {company.name}
                                            </h3>
                                            <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                                                {company.industry} • {company.country}
                                            </p>
                                        </div>
                                        <ArrowRight 
                                            className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" 
                                            style={{ color: DESIGN_SYSTEM.primary.main }}
                                        />
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
        <div className="flex min-h-screen" style={{ backgroundColor: DESIGN_SYSTEM.neutral[50] }}>
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1">
                {/* Header */}
                <header
                    className="sticky top-0 z-40 backdrop-blur-xl border-b px-6 py-4"
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderColor: DESIGN_SYSTEM.neutral[200]
                    }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate("/company-management")}
                                className="p-2 rounded-lg transition-colors"
                                style={{ color: DESIGN_SYSTEM.primary.main }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = DESIGN_SYSTEM.neutral[100]}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold" style={{ color: DESIGN_SYSTEM.primary.main }}>
                                    Biodiversity & Land Use Dashboard
                                </h1>
                                <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                                    {selectedCompany?.name || "Company Data"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {availableYears.length > 0 && (
                                <select
                                    value={selectedYear === null ? "" : selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
                                    className="px-4 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2"
                                    style={{
                                        borderColor: DESIGN_SYSTEM.neutral[300],
                                        color: DESIGN_SYSTEM.neutral[900],
                                        '--tw-ring-color': DESIGN_SYSTEM.primary.main
                                    } as React.CSSProperties}
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
                                className="p-2 rounded-lg transition-colors"
                                style={{ color: DESIGN_SYSTEM.primary.main }}
                                onMouseEnter={(e) => !isRefreshing && (e.currentTarget.style.backgroundColor = DESIGN_SYSTEM.neutral[100])}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-white font-medium shadow-sm hover:shadow-md"
                                style={{
                                    background: `linear-gradient(135deg, ${DESIGN_SYSTEM.primary.main} 0%, ${DESIGN_SYSTEM.primary.dark} 100%)`,
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
                                className={`px-6 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                                    activeTab === tab.id ? 'text-white shadow-md' : 'hover:text-gray-900'
                                }`}
                                style={activeTab === tab.id ? {
                                    background: `linear-gradient(135deg, ${DESIGN_SYSTEM.primary.main} 0%, ${DESIGN_SYSTEM.primary.dark} 100%)`,
                                } : {
                                    backgroundColor: DESIGN_SYSTEM.neutral[100],
                                    color: DESIGN_SYSTEM.neutral[600]
                                }}
                                onMouseEnter={(e) => {
                                    if (activeTab !== tab.id) {
                                        e.currentTarget.style.backgroundColor = DESIGN_SYSTEM.neutral[200];
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (activeTab !== tab.id) {
                                        e.currentTarget.style.backgroundColor = DESIGN_SYSTEM.neutral[100];
                                    }
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </header>

                {/* Error Message */}
                {error && (
                    <div 
                        className="m-6 p-4 rounded-xl border"
                        style={{
                            backgroundColor: `${DESIGN_SYSTEM.status.danger}10`,
                            borderColor: `${DESIGN_SYSTEM.status.danger}30`
                        }}
                    >
                        <div className="flex items-center">
                            <AlertCircle 
                                className="w-5 h-5 mr-2" 
                                style={{ color: DESIGN_SYSTEM.status.danger }} 
                            />
                            <p style={{ color: DESIGN_SYSTEM.status.danger }}>{error}</p>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="p-6">
                    {activeTab === "overview" && (
                        <OverviewTab {...sharedData} />
                    )}
                    {activeTab === "analytics" && (
                        <AnalyticsTab {...sharedData} />
                    )}
                    {activeTab === "reports" && (
                        <ReportsTab {...sharedData} />
                    )}
                </div>
            </main>

            {/* Enhanced Modal */}
            {selectedModal && (
                <div 
                    className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                    onClick={() => setSelectedModal(null)}
                >
                    <div 
                        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div 
                            className="p-6 border-b text-white"
                            style={{
                                background: `linear-gradient(135deg, ${DESIGN_SYSTEM.primary.main} 0%, ${DESIGN_SYSTEM.primary.light} 100%)`,
                                borderColor: DESIGN_SYSTEM.neutral[200]
                            }}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-bold mb-1">
                                        {selectedModal} Details
                                    </h3>
                                    <p className="text-emerald-50">Comprehensive metric analysis</p>
                                </div>
                                <button
                                    onClick={() => setSelectedModal(null)}
                                    className="p-2 rounded-xl transition-all"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
                            {/* Modal content based on selectedMetricData */}
                            <div 
                                className="p-4 rounded-xl border font-mono text-sm overflow-auto"
                                style={{
                                    backgroundColor: DESIGN_SYSTEM.neutral[50],
                                    borderColor: DESIGN_SYSTEM.neutral[200],
                                    color: DESIGN_SYSTEM.neutral[700]
                                }}
                            >
                                <pre className="whitespace-pre-wrap">
                                    {JSON.stringify(selectedMetricData, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BiodiversityLandUseScreen;