// File: GhgEmissionScreen.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler, ScatterController } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression } from 'leaflet';
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
    Database,
    Factory,
    Target as TargetIcon,

    PieChart,
    LineChart as LineChartIcon,

} from "lucide-react";
import {
    getGhgEmissionData,
    type GHGEmissionsResponse,
    type GHGEmissionsParams
} from "../../../services/Admin_Service/esg_apis/ghg_emmision";
import { getCompanies, type Company } from "../../../services/Admin_Service/companies_service";

// Import tab components
import OverviewTab from "./ghg_tabs/OverviewTab";
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

// Helper function to parse data_range string
const parseDataRange = (dataRange: string | undefined): number[] => {
    if (!dataRange) return [];
    
    try {
        // Handle different formats: "2022 - 2025", "2022-2025", "2022 – 2025", etc.
        const cleanedRange = dataRange
            .replace(/–/g, '-') // Replace en dash with hyphen
            .replace(/\s+/g, '') // Remove all spaces
            .replace(/to/g, '-') // Replace "to" with hyphen
            .trim();
        
        const [startStr, endStr] = cleanedRange.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        
        if (isNaN(start) || isNaN(end) || start > end) {
            console.warn('Invalid data_range format:', dataRange);
            return [];
        }
        
        // Generate array of years from start to end inclusive
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

const GhgEmissionScreen = () => {
    const { companyId: paramCompanyId } = useParams<{ companyId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [ghgData, setGhgData] = useState<GHGEmissionsResponse | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>(paramCompanyId || "");
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [latestYear, setLatestYear] = useState<number | null>(null);
    const [showCompanySelector, setShowCompanySelector] = useState(!paramCompanyId);
    const [activeTab, setActiveTab] = useState<"overview" | "details" | "location">("overview");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showCalculationModal, setShowCalculationModal] = useState(false);
    const [selectedCalculation, setSelectedCalculation] = useState<any>(null);

    // Modal states
    const [selectedModal, setSelectedModal] = useState<string | null>(null);
    const [selectedMetricData, setSelectedMetricData] = useState<any>(null);

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
        
        // Try to get years from data_range first
        if (company.data_range) {
            const years = parseDataRange(company.data_range);
            if (years.length > 0) {
                return years.sort((a, b) => b - a); // Sort descending (latest first)
            }
        }
        
        // Fallback to other sources
        if (company.latest_esg_report_year) {
            const currentYear = company.latest_esg_report_year;
            // Generate years from current year to 3 years back
            const years = [];
            for (let year = currentYear; year >= currentYear - 3; year--) {
                if (year > 2020) years.push(year);
            }
            return years;
        }
        
        // Default to current year if nothing else
        const currentYear = new Date().getFullYear();
        return [currentYear];
    };

    // Fetch GHG emissions data
    const fetchGhgData = async () => {
        if (!selectedCompanyId) return;

        try {
            setLoading(true);
            setError(null);
            
            // Get selected company
            const selectedCompany = companies.find(c => c._id === selectedCompanyId);
            
            if (selectedCompany) {
                // Get available years from company data_range
                const years = getAvailableYearsForCompany(selectedCompany);
                setAvailableYears(years);
                
                if (years.length > 0) {
                    // Get the latest year (first in descending sorted array)
                    const latest = years[0];
                    setLatestYear(latest);
                    
                    // If no year is selected yet, default to latest year
                    const yearToFetch = selectedYear !== null ? selectedYear : latest;
                    
                    // Fetch data for the selected or latest year
                    const params: GHGEmissionsParams = {
                        companyId: selectedCompanyId,
                        year: yearToFetch,
                    };
                    console.log("Fetching GHG data with params:", params);

                    const data = await getGhgEmissionData(params);
                    setGhgData(data);
                    
                    // Set selected year if it wasn't set
                    if (selectedYear === null) {
                        setSelectedYear(latest);
                    }
                } else {
                    // Fallback: fetch data without specifying year
                    console.log("Fetching GHG data without specifying year "+ selectedCompanyId);

                    const data = await getGhgEmissionData({
                        companyId: selectedCompanyId,
                        year: new Date().getFullYear()
                    });
                    setGhgData(data);
                    
                    // Set default year
                    const currentYear = new Date().getFullYear();
                    setAvailableYears([currentYear]);
                    setLatestYear(currentYear);
                    setSelectedYear(currentYear);
                }
            } else {
                // Company not found in local cache, fetch data with default
                const currentYear = new Date().getFullYear();
                const data = await getGhgEmissionData({
                    companyId: selectedCompanyId,
                    year: currentYear
                });
                setGhgData(data);
                setAvailableYears([currentYear]);
                setLatestYear(currentYear);
                setSelectedYear(currentYear);
            }

        } catch (err: any) {
            setError(err.message || "Failed to fetch GHG emissions data");
            console.error("Error fetching GHG emissions data:", err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchGhgData();
    };

    const handleCompanyChange = (companyId: string) => {
        setSelectedCompanyId(companyId);
        setSelectedYear(null); // Reset year when changing company
        setShowCompanySelector(false);
        navigate(`/admin_ghg_emission/${companyId}`);
    };

    const handleYearChange = (year: string) => {
        const newYear = year ? Number(year) : latestYear;
        setSelectedYear(newYear);
    };

    // Handle calculation explanation click
    const handleCalculationClick = (calculationType: string, data?: any) => {
        setSelectedCalculation({
            type: calculationType,
            data: data || ghgData
        });
        setShowCalculationModal(true);
    };

    // Handle metric click for modal
    const handleMetricClick = (metric: any, modalType: string) => {
        setSelectedMetricData(metric);
        setSelectedModal(modalType);
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
            fetchGhgData();
        }
    }, [selectedCompanyId, selectedYear]);

    // Get selected company
    const selectedCompany = companies.find(c => c._id === selectedCompanyId);

    // Prepare shared data for tabs
    const sharedData = {
        ghgData: ghgData?.data,
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
        onMetricClick: handleMetricClick,
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

    // Get coordinates for map
    const coordinates = ghgData?.data?.company?.area_of_interest_metadata?.coordinates || [];
    const areaName = ghgData?.data?.company?.area_of_interest_metadata?.name || "Production Area";
    const areaCovered = ghgData?.data?.company?.area_of_interest_metadata?.area_covered || "N/A";

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
                                    <p className="text-gray-600">Choose a company to view GHG emissions data</p>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                {companies.map((company) => {
                                    // Parse data_range for display
                                    const dataRangeYears = parseDataRange(company.data_range);
                                    const endYear = getEndYearFromDataRange(company.data_range);
                                    
                                    return (
                                        <button
                                            key={company._id}
                                            onClick={() => handleCompanyChange(company._id)}
                                            className="flex items-center gap-4 p-6 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-gray-50 transition-all duration-300 text-left group"
                                        >
                                            <div className="p-3 rounded-lg bg-green-50 border border-green-200 group-hover:bg-green-100 transition-colors">
                                                <Factory className="w-6 h-6" style={{ color: PRIMARY_GREEN }} />
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
                                        GHG Emissions Dashboard
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
                                <button
                                    onClick={() => setShowCalculationModal(true)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-green-500 text-green-600 hover:bg-green-50 transition-colors text-sm font-medium"
                                >
                                    <Calculator className="w-3.5 h-3.5" />
                                    Calculations
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
                        />
                    )}
                    {activeTab === "details" && (
                        <DetailsTab
                            {...sharedData}
                        />
                    )}
                    {activeTab === "location" && (
                        <LocationTab
                            {...sharedData}
                            coordinates={coordinates}
                            areaName={areaName}
                            areaCovered={areaCovered}
                        />
                    )}

                    {/* Metadata Footer */}
                    {ghgData?.data?.metadata && (
                        <div className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 p-6 mt-8 shadow-lg shadow-gray-200/50">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-semibold" style={{ color: PRIMARY_GREEN }}>
                                    Data Source Information
                                </h4>
                                <Database className="w-4 h-4" style={{ color: PRIMARY_GREEN }} />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-xs text-gray-600">API Version</p>
                                    <p className="text-sm font-medium text-gray-900">{ghgData.data.metadata.api_version}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Generated</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {new Date(ghgData.data.metadata.generated_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Data Sources</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {ghgData.data.metadata.data_sources.length}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Year</p>
                                    <p className="text-sm font-medium text-gray-900">{ghgData.data.metadata.year}</p>
                                </div>
                            </div>
                            {ghgData.data.company && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-xs text-gray-600">Company</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {ghgData.data.company.name} • {ghgData.data.company.industry} • {ghgData.data.company.country}
                                    </p>
                                </div>
                            )}
                        </div>
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
                                        <h3 className="text-xl font-bold">GHG Emissions Calculation Methodology</h3>
                                        <p className="text-sm text-green-100">How we calculate greenhouse gas emissions</p>
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
                                <h4 className="text-base font-bold text-gray-900 mb-2">Scope 1: Direct Emissions</h4>
                                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                                    <p className="font-medium text-sm text-gray-700 mb-2">Formula:</p>
                                    <div className="bg-white p-3 rounded-lg border border-gray-200 mb-2">
                                        <code className="text-green-600 font-mono text-sm">
                                            Scope 1 Emissions = Σ(Activity Data × Emission Factor × GWP)
                                        </code>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        Direct emissions from owned or controlled sources including fuel combustion, 
                                        process emissions, and fugitive emissions.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-base font-bold text-gray-900 mb-2">Scope 2: Indirect Energy Emissions</h4>
                                <div className="p-3 rounded-xl bg-green-50 border border-green-200">
                                    <p className="font-medium text-sm text-gray-700 mb-2">Formula:</p>
                                    <div className="bg-white p-3 rounded-lg border border-green-200 mb-2">
                                        <code className="text-green-600 font-mono text-sm">
                                            Scope 2 Emissions = Electricity Consumption × Grid Emission Factor
                                        </code>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        Indirect emissions from purchased electricity, heat, or steam.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-base font-bold text-gray-900 mb-2">Scope 3: Value Chain Emissions</h4>
                                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                                    <p className="font-medium text-sm text-gray-700 mb-2">Formula:</p>
                                    <div className="bg-white p-3 rounded-lg border border-blue-200 mb-2">
                                        <code className="text-blue-600 font-mono text-sm">
                                            Scope 3 Emissions = Σ(Category Activity × Emission Factor)
                                        </code>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        All other indirect emissions that occur in the value chain including 
                                        purchased goods, transportation, waste, and employee commuting.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-base font-bold text-gray-900 mb-2">Carbon Sequestration</h4>
                                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                                    <p className="font-medium text-sm text-gray-700 mb-2">Formula:</p>
                                    <div className="bg-white p-3 rounded-lg border border-purple-200 mb-2">
                                        <code className="text-purple-600 font-mono text-sm">
                                            Sequestration = (Biomass Carbon + SOC) × 3.6667
                                        </code>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        Carbon removed from the atmosphere through biomass growth and 
                                        soil organic carbon accumulation.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-base font-bold text-gray-900 mb-2">Net Carbon Balance</h4>
                                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                                    <p className="font-medium text-sm text-gray-700 mb-2">Formula:</p>
                                    <div className="bg-white p-3 rounded-lg border border-amber-200 mb-2">
                                        <code className="text-amber-600 font-mono text-sm">
                                            Net Balance = (Scope 1 + Scope 2 + Scope 3) - Sequestration
                                        </code>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        Positive values indicate net emissions, negative values indicate net removal.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-base font-bold text-gray-900 mb-2">Data Sources & Methodology</h4>
                                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        <li className="flex items-start gap-2">
                                            <Info className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                                            <span>Methodology: Greenhouse Gas Protocol Corporate Standard</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Info className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                                            <span>Emission Factors: IPCC AR5, DEFRA, IEA databases</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Info className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                                            <span>Sequestration: IPCC 2006 AFOLU Guidelines</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Info className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                                            <span>GWP Values: IPCC AR5 (100-year time horizon)</span>
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

export default GhgEmissionScreen;