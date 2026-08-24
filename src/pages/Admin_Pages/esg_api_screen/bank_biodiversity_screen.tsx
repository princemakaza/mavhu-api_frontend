import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import BankSidebar from "../../../components/bank_sidebar";
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
    Trees,
    Loader2,
} from "lucide-react";
import { getCompanies, type Company } from "../../../services/Admin_Service/companies_service";
import {
    getBiodiversityLandUseData,
    getAvailableYears,
    downloadBiodiversityLandUseDataAsPDF,
    type BiodiversityLandUseResponse,
    type BiodiversityLandUseParams,
} from "../../../services/Admin_Service/esg_apis/biodiversity_api_service";

import OverviewTab from "./biodiversity_tabs/OverviewTab";
import AnalyticsTab from "./biodiversity_tabs/AnalyticsTab";
import ReportsTab from "./biodiversity_tabs/ReportsTab";

const PRIMARY_NAVY = "#0A3B5C";
const SECONDARY_GOLD = "#D4AF37";
const DARK_NAVY = "#05283e";
const LIGHT_NAVY = "#1a5276";
const BACKGROUND_GRAY = '#f9fafb';

const Shimmer = () => (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-100/50 to-transparent" />
);

const parseDataRange = (dataRange: string | undefined): number[] => {
    if (!dataRange) return [];
    try {
        const cleaned = dataRange.replace(/–/g, '-').replace(/\s+/g, '').replace(/to/g, '-').trim();
        const [s, e] = cleaned.split('-');
        const start = parseInt(s, 10);
        const end = parseInt(e, 10);
        if (isNaN(start) || isNaN(end) || start > end) return [];
        const years = [];
        for (let y = start; y <= end; y++) years.push(y);
        return years;
    } catch { return []; }
};

const getEndYearFromDataRange = (dataRange: string | undefined): number | null => {
    const years = parseDataRange(dataRange);
    return years.length > 0 ? Math.max(...years) : null;
};

const BankBiodiversityScreen = () => {
    const { companyId: paramCompanyId } = useParams<{ companyId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [loadingCompanies, setLoadingCompanies] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [biodiversityData, setBiodiversityData] = useState<BiodiversityLandUseResponse | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>(paramCompanyId || "");
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [latestYear, setLatestYear] = useState<number | null>(null);
    const [showCompanySelector, setShowCompanySelector] = useState(!paramCompanyId);
    const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "reports">("overview");
    const [isRefreshing, setIsRefreshing] = useState(false);

    const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);
    const formatCurrency = (num: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
    const formatPercent = (num: number) => `${num.toFixed(1)}%`;

    const getTrendIcon = (trend: string) => {
        if (/improving|increase|up|positive/i.test(trend)) return <TrendingUp className="w-4 h-4" style={{ color: SECONDARY_GOLD }} />;
        if (/declining|decrease|down|negative/i.test(trend)) return <TrendingDown className="w-4 h-4 text-red-500" />;
        return <Activity className="w-4 h-4 text-gray-500" />;
    };

    const fetchCompanies = async () => {
        try {
            setLoadingCompanies(true);
            const response = await getCompanies(1, 100);
            setCompanies(response.items);
        } catch (err: any) {
            console.error("Failed to fetch companies:", err);
        } finally {
            setLoadingCompanies(false);
        }
    };

    const getAvailableYearsForCompany = (company: Company | undefined): number[] => {
        if (!company) return [];
        if (company.data_range) {
            const years = parseDataRange(company.data_range);
            if (years.length > 0) return years.sort((a, b) => b - a);
        }
        if (company.latest_esg_report_year) {
            const cur = company.latest_esg_report_year;
            return Array.from({ length: 4 }, (_, i) => cur - i).filter(y => y > 2020);
        }
        return [new Date().getFullYear()];
    };

    const fetchBiodiversityData = async () => {
        if (!selectedCompanyId) return;
        try {
            setLoading(true);
            setError(null);
            const selectedCompany = companies.find(c => c._id === selectedCompanyId);
            if (selectedCompany) {
                const years = getAvailableYearsForCompany(selectedCompany);
                setAvailableYears(years);
                if (years.length > 0) {
                    const latest = years[0];
                    setLatestYear(latest);
                    const yearToFetch = selectedYear !== null ? selectedYear : latest;
                    const data = await getBiodiversityLandUseData({ companyId: selectedCompanyId, year: yearToFetch });
                    setBiodiversityData(data);
                    const resYears = getAvailableYears(data);
                    if (resYears.length > 0) {
                        const sorted = [...resYears].sort((a, b) => b - a);
                        setAvailableYears(sorted);
                        setLatestYear(sorted[0]);
                    }
                    if (selectedYear === null) setSelectedYear(latest);
                } else {
                    const cur = new Date().getFullYear();
                    const data = await getBiodiversityLandUseData({ companyId: selectedCompanyId, year: cur });
                    setBiodiversityData(data);
                    const resYears = getAvailableYears(data);
                    const sorted = resYears.length > 0 ? [...resYears].sort((a, b) => b - a) : [cur];
                    setAvailableYears(sorted);
                    setLatestYear(sorted[0]);
                    setSelectedYear(sorted[0]);
                }
            } else {
                const cur = new Date().getFullYear();
                const data = await getBiodiversityLandUseData({ companyId: selectedCompanyId, year: cur });
                setBiodiversityData(data);
                const resYears = getAvailableYears(data);
                const sorted = resYears.length > 0 ? [...resYears].sort((a, b) => b - a) : [cur];
                setAvailableYears(sorted);
                setLatestYear(sorted[0]);
                setSelectedYear(sorted[0]);
            }
        } catch (err: any) {
            setError(err.message || "Failed to fetch biodiversity data");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => { setIsRefreshing(true); fetchBiodiversityData(); };

    const handleCompanyChange = (companyId: string) => {
        setSelectedCompanyId(companyId);
        setSelectedYear(null);
        setShowCompanySelector(false);
        navigate(`/bank_biodiversity_land_use/${companyId}`);
    };

    const handleYearChange = (year: string) => {
        setSelectedYear(year ? Number(year) : latestYear);
    };

    const handleMetricClick = (metric: any, modalType: string) => { };
    const handleCalculationClick = (calculationType: string, data?: any) => { };

    const summaryMetrics = useMemo(() => {
        if (!biodiversityData) return null;
        return { protectedArea: 12500, protectedAreaChange: 5.2, biodiversityIndex: 0.78, biodiversityIndexChange: 2.1, landUseEfficiency: 320, landUseEfficiencyChange: -1.8, speciesRichness: 42, speciesRichnessChange: 8.3 };
    }, [biodiversityData]);

    const mockCoordinates = [{ lat: 40.7128, lon: -74.0060 }, { lat: 40.7129, lon: -74.0061 }, { lat: 40.7127, lon: -74.0059 }, { lat: 40.7128, lon: -74.0060 }];
    const areaName = "Protected Wildlife Corridor";
    const areaCovered = "12,500 hectares";

    useEffect(() => { fetchCompanies(); }, []);
    useEffect(() => {
        if (location.state?.companyId) { setSelectedCompanyId(location.state.companyId); setShowCompanySelector(false); setSelectedYear(null); }
        else if (paramCompanyId) { setSelectedCompanyId(paramCompanyId); setShowCompanySelector(false); setSelectedYear(null); }
    }, [location.state, paramCompanyId]);

    useEffect(() => {
        if (selectedCompanyId && companies.length > 0) fetchBiodiversityData();
    }, [selectedCompanyId, selectedYear, companies]);

    const selectedCompany = companies.find(c => c._id === selectedCompanyId);

    const sharedData = {
        biodiversityData, selectedCompany, formatNumber, formatCurrency, formatPercent, getTrendIcon,
        selectedYear, availableYears, latestYear, loading, isRefreshing,
        onMetricClick: handleMetricClick, onCalculationClick: handleCalculationClick,
        coordinates: mockCoordinates, areaName, areaCovered,
        colors: { primary: PRIMARY_NAVY, secondary: SECONDARY_GOLD, lightGreen: LIGHT_NAVY, darkGreen: DARK_NAVY, emerald: PRIMARY_NAVY, lime: SECONDARY_GOLD, background: BACKGROUND_GRAY },
    };

    // Company selector
    if (showCompanySelector && !paramCompanyId) {
        return (
            <div className="flex min-h-screen bg-gray-50 text-gray-900">
                <BankSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <main className="flex-1 p-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg">
                            <div className="flex items-center gap-3 mb-8">
                                <Trees className="w-10 h-10" style={{ color: PRIMARY_NAVY }} />
                                <div>
                                    <h1 className="text-3xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${PRIMARY_NAVY}, ${SECONDARY_GOLD})` }}>
                                        Select Company
                                    </h1>
                                    <p className="text-gray-600">Choose a company to view Biodiversity & Land Use Data</p>
                                </div>
                            </div>
                            {loadingCompanies ? (
                                <div className="flex justify-center items-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: PRIMARY_NAVY }} />
                                    <span className="ml-2 text-gray-600">Loading companies...</span>
                                </div>
                            ) : companies.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">No companies found.</div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {companies.map((company) => {
                                        const dataRangeYears = parseDataRange(company.data_range);
                                        const endYear = getEndYearFromDataRange(company.data_range);
                                        return (
                                            <button
                                                key={company._id}
                                                onClick={() => handleCompanyChange(company._id)}
                                                className="flex items-center gap-4 p-6 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all text-left group"
                                                style={{ borderColor: 'rgb(229 231 235)' }}
                                                onMouseEnter={e => (e.currentTarget.style.borderColor = PRIMARY_NAVY)}
                                                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgb(229 231 235)')}
                                            >
                                                <div className="p-3 rounded-lg transition-colors" style={{ background: `${PRIMARY_NAVY}10`, border: `1px solid ${PRIMARY_NAVY}20` }}>
                                                    <Trees className="w-6 h-6" style={{ color: PRIMARY_NAVY }} />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-lg mb-1">{company.name}</h3>
                                                    <p className="text-sm text-gray-600">{company.industry} • {company.country}</p>
                                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                        <div className="text-xs px-2 py-1 rounded-full" style={{ background: company.esg_data_status === 'complete' ? `${PRIMARY_NAVY}15` : company.esg_data_status === 'partial' ? 'rgba(251,191,36,0.2)' : 'rgba(239,68,68,0.2)', color: company.esg_data_status === 'complete' ? PRIMARY_NAVY : company.esg_data_status === 'partial' ? '#B8860B' : '#EF4444' }}>
                                                            {company.esg_data_status?.replace('_', ' ') || 'Not Collected'}
                                                        </div>
                                                        {company.data_range && (
                                                            <div className="text-xs px-2 py-1 rounded-full" style={{ background: `${SECONDARY_GOLD}15`, color: SECONDARY_GOLD, border: `1px solid ${SECONDARY_GOLD}30` }}>
                                                                Data: {company.data_range}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {company.data_range && dataRangeYears.length > 0 && (
                                                        <p className="text-xs text-gray-500 mt-1">{dataRangeYears.length} year{dataRangeYears.length > 1 ? 's' : ''} available • Latest: {endYear}</p>
                                                    )}
                                                </div>
                                                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: PRIMARY_NAVY }} />
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Loading
    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50 text-gray-900">
                <BankSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <main className="flex-1 p-6">
                    <div className="mb-8 relative overflow-hidden"><div className="h-12 rounded-xl bg-gray-100" /><Shimmer /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[1, 2, 3, 4].map(i => <div key={i} className="relative overflow-hidden"><div className="h-32 rounded-xl bg-gray-100" /><Shimmer /></div>)}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {[1, 2].map(i => <div key={i} className="relative overflow-hidden"><div className="h-96 rounded-xl bg-gray-100" /><Shimmer /></div>)}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-900">
            <BankSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <main className="flex-1">
                <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200">
                    <div className="px-4 sm:px-6 py-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                                <button onClick={() => navigate("/bank_dashboard")} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0" style={{ color: PRIMARY_NAVY }}>
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div>
                                    <h1 className="text-lg sm:text-xl font-bold" style={{ color: PRIMARY_NAVY }}>Biodiversity & Land Use Dashboard</h1>
                                    {selectedCompany && (
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-xs text-gray-600">{selectedCompany.name} • {selectedCompany.industry}</p>
                                            {selectedCompany.data_range && (
                                                <div className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${SECONDARY_GOLD}15`, color: SECONDARY_GOLD, border: `1px solid ${SECONDARY_GOLD}30` }}>Data range: {selectedCompany.data_range}</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                {availableYears.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <select value={selectedYear || ""} onChange={e => handleYearChange(e.target.value)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 min-w-[120px]" style={{ '--tw-ring-color': `${PRIMARY_NAVY}40` } as any}>
                                            {availableYears.map(year => <option key={year} value={year}>{year}{year === latestYear ? ' (Latest)' : ''}</option>)}
                                        </select>
                                    </div>
                                )}
                                <button onClick={handleRefresh} disabled={isRefreshing} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: PRIMARY_NAVY }}>
                                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                </button>
                                <button
                                    onClick={() => { if (biodiversityData) downloadBiodiversityLandUseDataAsPDF(biodiversityData); }}
                                    disabled={!biodiversityData || loading}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white font-medium text-sm"
                                    style={{ background: `linear-gradient(to right, ${PRIMARY_NAVY}, ${SECONDARY_GOLD})` }}
                                >
                                    <Download className="w-3.5 h-3.5" /> Export
                                </button>
                            </div>
                        </div>
                        <div className="flex space-x-2 overflow-x-auto pb-1">
                            {[{ id: "overview", label: "Overview", icon: BarChart3 }, { id: "analytics", label: "Analytics", icon: PieChart }, { id: "reports", label: "Reports", icon: FileText }].map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all text-sm ${activeTab === tab.id ? 'text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                        style={activeTab === tab.id ? { background: `linear-gradient(to right, ${PRIMARY_NAVY}, ${SECONDARY_GOLD})` } : {}}
                                    >
                                        <Icon className="w-4 h-4" />{tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </header>

                {error && (
                    <div className="m-4 sm:m-6 p-3 sm:p-4 rounded-xl bg-red-50 border border-red-200">
                        <div className="flex items-center"><AlertCircle className="w-4 h-4 mr-2 text-red-600 flex-shrink-0" /><p className="text-sm text-red-700">{error}</p></div>
                    </div>
                )}

                <div className="p-4 sm:p-6">
                    {activeTab === "overview" && <OverviewTab {...sharedData} />}
                    {activeTab === "analytics" && <AnalyticsTab {...sharedData} />}
                    {activeTab === "reports" && <ReportsTab {...sharedData} />}
                </div>
            </main>
        </div>
    );
};

export default BankBiodiversityScreen;
