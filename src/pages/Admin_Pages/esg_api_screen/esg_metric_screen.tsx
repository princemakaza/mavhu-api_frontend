import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import {
    RefreshCw,
    ChevronLeft,
    Download,
    Building,
    Filter,
    Search,
    Calendar,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    BarChart3,
    PieChart,
    LineChart,
    Activity,
    Shield,
    Users,
    Leaf,
    Globe,
    Eye,
    EyeOff,
    ChevronDown,
    ChevronUp,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Info
} from "lucide-react";
import {
    getCompanies,
    type Company
} from "../../../services/Admin_Service/companies_service";
import {
    getEsgData,
    type EsgDataResponse,
    type EsgDataRecord,
    type MetricFilters,
    getMetricsByCategory,
    getCompanyEsgSummary,
    getMetricTrends,
    getAvailableYears,
    getEnvironmentalMetricsSummary,
    getSocialMetricsSummary,
    getGovernanceMetricsSummary,
    type MetricTrend,
    type CompanyEsgSummary,
    getMetricChartData,
    getMultiMetricChartData
} from "../../../services/Admin_Service/esg_apis/esg_metric";
import {
    BarChart,
    Bar,
    LineChart as RechartsLineChart,
    Line,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
    ComposedChart
} from "recharts";

// Color Palette
const LOGO_GREEN = '#008000';
const LOGO_YELLOW = '#B8860B';
const CHART_COLORS = {
    environmental: '#10B981', // Green
    social: '#3B82F6', // Blue
    governance: '#8B5CF6', // Purple
    neutral: '#6B7280' // Gray
};

// Loading Skeleton
const Shimmer = () => (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
);

const SkeletonCard = ({ className = "" }: { className?: string }) => (
    <div className={`relative overflow-hidden rounded-xl bg-gray-100 ${className}`}>
        <div className="h-full w-full bg-gray-200"></div>
        <Shimmer />
    </div>
);

// Chart Components - FIXED: Proper Recharts structure
const CategoryDistributionChart = ({ data }: { data: any[] }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center">
                <div className="text-gray-400">No category data available</div>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} metrics`, 'Count']} />
                <Legend />
            </RechartsPieChart>
        </ResponsiveContainer>
    );
};

const YearlyMetricsChart = ({ data }: { data: any[] }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center">
                <div className="text-gray-400">No yearly data available</div>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                    dataKey="year" 
                    stroke="#666"
                    tickFormatter={(value) => value.toString()}
                />
                <YAxis stroke="#666" />
                <Tooltip />
                <Legend />
                <Area
                    type="monotone"
                    dataKey="Environmental"
                    stackId="1"
                    stroke={CHART_COLORS.environmental}
                    fill={CHART_COLORS.environmental}
                    fillOpacity={0.6}
                />
                <Area
                    type="monotone"
                    dataKey="Social"
                    stackId="1"
                    stroke={CHART_COLORS.social}
                    fill={CHART_COLORS.social}
                    fillOpacity={0.6}
                />
                <Area
                    type="monotone"
                    dataKey="Governance"
                    stackId="1"
                    stroke={CHART_COLORS.governance}
                    fill={CHART_COLORS.governance}
                    fillOpacity={0.6}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

const TopMetricsChart = ({ data }: { data: any[] }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center">
                <div className="text-gray-400">No metric data available</div>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                    dataKey="name" 
                    stroke="#666"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
                />
                <YAxis stroke="#666" />
                <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Value']} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                            entry.category === 'environmental' ? CHART_COLORS.environmental :
                            entry.category === 'social' ? CHART_COLORS.social :
                            CHART_COLORS.governance
                        } />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

const MetricTrendsChart = ({ data }: { data: any[] }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center">
                <div className="text-gray-400">No trend data available</div>
            </div>
        );
    }

    // Prepare data for Recharts - create an array of year-based data points
    const allYears = Array.from(
        new Set(data.flatMap(trend => trend.data.map((d: any) => d.year)))
    ).sort();

    const chartData = allYears.map(year => {
        const point: any = { year };
        data.forEach(trend => {
            const trendPoint = trend.data.find((d: any) => d.year === year);
            point[trend.name] = trendPoint ? trendPoint.value : null;
        });
        return point;
    });

    const trendColors = [CHART_COLORS.environmental, CHART_COLORS.social, CHART_COLORS.governance, '#F59E0B', '#EF4444'];

    return (
        <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                    dataKey="year" 
                    stroke="#666"
                    tickFormatter={(value) => value.toString()}
                />
                <YAxis stroke="#666" />
                <Tooltip />
                <Legend />
                {data.map((trend, index) => (
                    <Line
                        key={index}
                        type="monotone"
                        dataKey={trend.name}
                        name={trend.name}
                        stroke={trendColors[index % trendColors.length]}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        connectNulls
                    />
                ))}
            </RechartsLineChart>
        </ResponsiveContainer>
    );
};

const EsgMetricsScreen = () => {
    const { companyId: paramCompanyId } = useParams<{ companyId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [esgData, setEsgData] = useState<EsgDataRecord[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>(paramCompanyId || "");
    const [showCompanySelector, setShowCompanySelector] = useState(!paramCompanyId);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Filters
    const [filters, setFilters] = useState<MetricFilters>({
        category: 'all',
        year: undefined,
        search: '',
        verified_only: false
    });
    const [showFilters, setShowFilters] = useState(false);

    // Summary data
    const [summary, setSummary] = useState<CompanyEsgSummary | null>(null);
    const [trends, setTrends] = useState<MetricTrend[]>([]);
    const [availableYears, setAvailableYears] = useState<number[]>([]);

    // Chart data
    const [categoryDistribution, setCategoryDistribution] = useState<any[]>([]);
    const [yearlyMetricsChart, setYearlyMetricsChart] = useState<any[]>([]);
    const [topMetricsChart, setTopMetricsChart] = useState<any[]>([]);
    const [trendsChart, setTrendsChart] = useState<any[]>([]);

    // UI states
    const [expandedMetrics, setExpandedMetrics] = useState<Set<string>>(new Set());
    const [visibleMetrics, setVisibleMetrics] = useState<number>(10);

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
            setError("Failed to load companies");
        }
    };

    // Fetch ESG data
    const fetchEsgData = async () => {
        if (!selectedCompanyId) return;

        try {
            setLoading(true);
            setError(null);
            
            const params = {
                companyId: selectedCompanyId,
                filters: filters.category === 'all' ? { ...filters, category: undefined } : filters
            };

            const data = await getEsgData(params);
            setEsgData(data.esgData);

            // Calculate derived data
            const years = getAvailableYears(data.esgData);
            setAvailableYears(years.sort((a, b) => b - a));
            
            const summaryData = getCompanyEsgSummary(data.esgData);
            setSummary(summaryData);
            
            const trendsData = getMetricTrends(data.esgData);
            setTrends(trendsData);

            // Prepare chart data
            prepareChartData(data.esgData, summaryData, trendsData, years);

        } catch (err: any) {
            setError(err.message || "Failed to fetch ESG data");
            console.error("Error fetching ESG data:", err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    // Prepare chart data
    const prepareChartData = (data: EsgDataRecord[], summary: CompanyEsgSummary, trends: MetricTrend[], years: number[]) => {
        // Category Distribution Pie Chart
        const categoryDist = [
            { name: 'Environmental', value: summary.categories_summary.find(c => c.category === 'environmental')?.total_metrics || 0, color: CHART_COLORS.environmental },
            { name: 'Social', value: summary.categories_summary.find(c => c.category === 'social')?.total_metrics || 0, color: CHART_COLORS.social },
            { name: 'Governance', value: summary.categories_summary.find(c => c.category === 'governance')?.total_metrics || 0, color: CHART_COLORS.governance }
        ];
        setCategoryDistribution(categoryDist);

        // Yearly Metrics Trend Chart
        const yearlyData = years.map(year => {
            const yearMetrics = data.flatMap(record => 
                record.metrics.filter(metric => 
                    metric.values.some(v => v.year === year)
                )
            );
            return {
                year,
                Environmental: yearMetrics.filter(m => m.category === 'environmental').length,
                Social: yearMetrics.filter(m => m.category === 'social').length,
                Governance: yearMetrics.filter(m => m.category === 'governance').length,
                total: yearMetrics.length
            };
        }).sort((a, b) => a.year - b.year);
        setYearlyMetricsChart(yearlyData);

        // Top Metrics by Value (numeric)
        const allMetrics = data.flatMap(record => record.metrics);
        const numericMetrics = allMetrics
            .filter(metric => {
                const hasNumeric = metric.values.some(v => v.numeric_value !== null);
                const latestValue = metric.values
                    .filter(v => v.numeric_value !== null)
                    .sort((a, b) => b.year - a.year)[0];
                return hasNumeric && latestValue;
            })
            .map(metric => {
                const latestValue = metric.values
                    .filter(v => v.numeric_value !== null)
                    .sort((a, b) => b.year - a.year)[0];
                return {
                    name: metric.metric_name.length > 20 ? metric.metric_name.substring(0, 20) + '...' : metric.metric_name,
                    value: latestValue?.numeric_value || 0,
                    category: metric.category,
                    unit: metric.unit,
                    fullName: metric.metric_name
                };
            })
            .sort((a, b) => b.value - a.value)
            .slice(0, 8);
        setTopMetricsChart(numericMetrics);

        // Trends Chart
        const trendingMetrics = trends
            .filter(trend => trend.values && trend.values.length >= 2)
            .slice(0, 5)
            .map(trend => {
                const validValues = trend.values.filter(v => v.value !== null && v.value !== undefined);
                return {
                    name: trend.metric_name.length > 15 ? trend.metric_name.substring(0, 15) + '...' : trend.metric_name,
                    fullName: trend.metric_name,
                    data: validValues.map(v => ({
                        year: v.year,
                        value: v.value || 0
                    })),
                    trend: trend.trend,
                    category: trend.category
                };
            })
            .filter(trend => trend.data.length > 0);
        setTrendsChart(trendingMetrics);
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchEsgData();
    };

    const handleCompanyChange = (companyId: string) => {
        setSelectedCompanyId(companyId);
        setShowCompanySelector(false);
        navigate(`/admin_esg_metrics/${companyId}`);
    };

    const handleFilterChange = (key: keyof MetricFilters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            category: 'all',
            year: undefined,
            search: '',
            verified_only: false
        });
    };

    const toggleMetricExpansion = (metricId: string) => {
        setExpandedMetrics(prev => {
            const newSet = new Set(prev);
            if (newSet.has(metricId)) {
                newSet.delete(metricId);
            } else {
                newSet.add(metricId);
            }
            return newSet;
        });
    };

    // Memoized filtered metrics
    const filteredMetrics = useMemo(() => {
        const allMetrics = esgData.flatMap(record => 
            record.metrics.map(metric => ({
                ...metric,
                recordId: record._id,
                verificationStatus: record.verification_status,
                dataQualityScore: record.data_quality_score
            }))
        );

        return allMetrics.filter(metric => {
            // Category filter
            if (filters.category !== 'all' && metric.category !== filters.category) {
                return false;
            }

            // Year filter
            if (filters.year && !metric.values.some(v => v.year === filters.year)) {
                return false;
            }

            // Search filter
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                if (!metric.metric_name.toLowerCase().includes(searchLower) &&
                    !metric.description?.toLowerCase().includes(searchLower)) {
                    return false;
                }
            }

            // Verified only filter
            if (filters.verified_only && metric.verificationStatus !== 'verified') {
                return false;
            }

            return true;
        });
    }, [esgData, filters]);

    useEffect(() => {
        if (location.state?.companyId) {
            setSelectedCompanyId(location.state.companyId);
            setShowCompanySelector(false);
        }
        fetchCompanies();
    }, [location.state]);

    useEffect(() => {
        if (selectedCompanyId) {
            fetchEsgData();
        }
    }, [selectedCompanyId, filters]);

    // Get selected company
    const selectedCompany = companies.find(c => c._id === selectedCompanyId);

    // Format helpers
    const formatNumber = (num: number) => {
        if (num === null || num === undefined) return 'N/A';
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return new Intl.NumberFormat('en-US').format(num);
    };

    const formatCurrency = (num: number) => 
        new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD', 
            notation: 'compact',
            maximumFractionDigits: 1 
        }).format(num);

    const formatPercent = (num: number) => `${num.toFixed(1)}%`;

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'environmental': return <Leaf className="w-4 h-4" />;
            case 'social': return <Users className="w-4 h-4" />;
            case 'governance': return <Shield className="w-4 h-4" />;
            default: return <Activity className="w-4 h-4" />;
        }
    };

    const getTrendIcon = (trend: string) => {
        if (trend === 'increasing') {
            return <TrendingUp className="w-4 h-4 text-green-600" />;
        } else if (trend === 'decreasing') {
            return <TrendingDown className="w-4 h-4 text-red-600" />;
        }
        return <Activity className="w-4 h-4 text-yellow-600" />;
    };

    const getVerificationBadge = (status?: string) => {
        switch (status) {
            case 'verified':
                return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Verified
                </span>;
            case 'pending':
                return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Pending
                </span>;
            default:
                return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Unverified
                </span>;
        }
    };

    // Loading State
    if (loading && !isRefreshing) {
        return (
            <div className="flex min-h-screen bg-gray-50 text-gray-900">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <main className="flex-1 p-6">
                    {/* Shimmer Header */}
                    <div className="mb-8 relative overflow-hidden">
                        <div className="h-12 rounded-xl bg-gray-100"></div>
                        <Shimmer />
                    </div>

                    {/* Shimmer Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[1, 2, 3, 4].map(i => (
                            <SkeletonCard key={i} className="h-32" />
                        ))}
                    </div>

                    {/* Shimmer Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {[1, 2, 3, 4].map(i => (
                            <SkeletonCard key={i} className="h-80" />
                        ))}
                    </div>

                    {/* Shimmer Table */}
                    <SkeletonCard className="h-96" />
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
                                    <p className="text-gray-600">Choose a company to view ESG metrics</p>
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
                                        <ChevronDown className="w-5 h-5 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200 px-6 py-4">
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
                                <h1 className="text-2xl font-bold" style={{ color: LOGO_GREEN }}>ESG Metrics Dashboard</h1>
                                <p className="text-sm text-gray-600">{selectedCompany?.name || "Company Data"}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                            >
                                <Filter className="w-4 h-4" />
                                Filters
                                {(filters.category !== 'all' || filters.search || filters.year || filters.verified_only) && (
                                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                )}
                            </button>

                            <select
                                value={filters.year || ""}
                                onChange={(e) => handleFilterChange('year', e.target.value ? Number(e.target.value) : undefined)}
                                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="">All Years</option>
                                {availableYears.map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>

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
                                onClick={() => {
                                    // Implement export functionality
                                    alert("Export functionality to be implemented");
                                }}
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={filters.category}
                                        onChange={(e) => handleFilterChange('category', e.target.value as any)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="all">All Categories</option>
                                        <option value="environmental">Environmental</option>
                                        <option value="social">Social</option>
                                        <option value="governance">Governance</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Search Metrics
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={filters.search}
                                            onChange={(e) => handleFilterChange('search', e.target.value)}
                                            placeholder="Search metrics..."
                                            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-end">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={filters.verified_only}
                                            onChange={(e) => handleFilterChange('verified_only', e.target.checked)}
                                            className="rounded text-green-600 focus:ring-green-500"
                                        />
                                        <span className="text-sm text-gray-700">Verified Only</span>
                                    </label>
                                </div>

                                <div className="flex items-end gap-2">
                                    <button
                                        onClick={clearFilters}
                                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        Clear All
                                    </button>
                                    <button
                                        onClick={() => setShowFilters(false)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
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
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-green-50">
                                    <BarChart3 className="w-6 h-6" style={{ color: LOGO_GREEN }} />
                                </div>
                                <span className="text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-800">
                                    Total
                                </span>
                            </div>
                            <h3 className="text-3xl font-bold mb-2" style={{ color: LOGO_GREEN }}>
                                {summary?.total_metrics || 0}
                            </h3>
                            <p className="text-gray-600">ESG Metrics</p>
                            <div className="mt-4 flex items-center text-sm text-gray-500">
                                <Calendar className="w-4 h-4 mr-1" />
                                {summary?.reporting_years?.length || 0} Years
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-blue-50">
                                    <Leaf className="w-6 h-6" style={{ color: CHART_COLORS.environmental }} />
                                </div>
                                <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                                    Environmental
                                </span>
                            </div>
                            <h3 className="text-3xl font-bold mb-2" style={{ color: CHART_COLORS.environmental }}>
                                {summary?.categories_summary?.find(c => c.category === 'environmental')?.total_metrics || 0}
                            </h3>
                            <p className="text-gray-600">Metrics</p>
                            <div className="mt-4 flex items-center text-sm text-gray-500">
                                <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                                {summary?.categories_summary?.find(c => c.category === 'environmental')?.verified_metrics || 0} Verified
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-purple-50">
                                    <Users className="w-6 h-6" style={{ color: CHART_COLORS.social }} />
                                </div>
                                <span className="text-sm font-medium px-3 py-1 rounded-full bg-purple-100 text-purple-800">
                                    Social
                                </span>
                            </div>
                            <h3 className="text-3xl font-bold mb-2" style={{ color: CHART_COLORS.social }}>
                                {summary?.categories_summary?.find(c => c.category === 'social')?.total_metrics || 0}
                            </h3>
                            <p className="text-gray-600">Metrics</p>
                            <div className="mt-4 flex items-center text-sm text-gray-500">
                                <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                                {summary?.categories_summary?.find(c => c.category === 'social')?.verified_metrics || 0} Verified
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-indigo-50">
                                    <Shield className="w-6 h-6" style={{ color: CHART_COLORS.governance }} />
                                </div>
                                <span className="text-sm font-medium px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
                                    Governance
                                </span>
                            </div>
                            <h3 className="text-3xl font-bold mb-2" style={{ color: CHART_COLORS.governance }}>
                                {summary?.categories_summary?.find(c => c.category === 'governance')?.total_metrics || 0}
                            </h3>
                            <p className="text-gray-600">Metrics</p>
                            <div className="mt-4 flex items-center text-sm text-gray-500">
                                <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                                {summary?.categories_summary?.find(c => c.category === 'governance')?.verified_metrics || 0} Verified
                            </div>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Chart 1: Category Distribution */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Category Distribution</h3>
                                    <p className="text-sm text-gray-600">Breakdown of metrics by category</p>
                                </div>
                                <PieChart className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="h-64">
                                <CategoryDistributionChart data={categoryDistribution} />
                            </div>
                        </div>

                        {/* Chart 2: Yearly Metrics Trend */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Yearly Metrics Trend</h3>
                                    <p className="text-sm text-gray-600">Metrics reported over the years</p>
                                </div>
                                <LineChart className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="h-64">
                                <YearlyMetricsChart data={yearlyMetricsChart} />
                            </div>
                        </div>

                        {/* Chart 3: Top Metrics by Value */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Top Metrics by Value</h3>
                                    <p className="text-sm text-gray-600">Highest valued metrics across categories</p>
                                </div>
                                <BarChart3 className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="h-64">
                                <TopMetricsChart data={topMetricsChart} />
                            </div>
                        </div>

                        {/* Chart 4: Metric Trends */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Key Metric Trends</h3>
                                    <p className="text-sm text-gray-600">Performance trends over time</p>
                                </div>
                                <TrendingUp className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="h-64">
                                <MetricTrendsChart data={trendsChart} />
                            </div>
                        </div>
                    </div>

                    {/* Metrics Table - FIXED: Removed nested tbody */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">ESG Metrics</h3>
                                    <p className="text-sm text-gray-600">
                                        {filteredMetrics.length} metrics found
                                        {filters.category !== 'all' && ` in ${filters.category}`}
                                        {filters.year && ` for ${filters.year}`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">
                                        Showing {Math.min(visibleMetrics, filteredMetrics.length)} of {filteredMetrics.length}
                                    </span>
                                    {visibleMetrics < filteredMetrics.length && (
                                        <button
                                            onClick={() => setVisibleMetrics(prev => prev + 10)}
                                            className="text-sm text-green-600 hover:text-green-800 font-medium"
                                        >
                                            Load More
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Metric
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Latest Value
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trend
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredMetrics.slice(0, visibleMetrics).map((metric) => {
                                        const latestValue = metric.values
                                            .sort((a, b) => b.year - a.year)[0];
                                        const metricTrend = trends.find(t => 
                                            t.metric_name === metric.metric_name && 
                                            t.category === metric.category
                                        );
                                        const isExpanded = expandedMetrics.has(metric._id);
                                        
                                        return (
                                            <>
                                                <tr key={metric._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="py-4 px-6">
                                                        <div>
                                                            <div className="font-medium text-gray-900">
                                                                {metric.metric_name}
                                                            </div>
                                                            {metric.description && (
                                                                <div className="text-sm text-gray-500 mt-1">
                                                                    {metric.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-2">
                                                            {getCategoryIcon(metric.category)}
                                                            <span className="capitalize">{metric.category}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-lg font-semibold" style={{ color: LOGO_GREEN }}>
                                                                {latestValue?.numeric_value !== null
                                                                    ? formatNumber(latestValue.numeric_value || 0)
                                                                    : latestValue?.value || 'N/A'}
                                                            </span>
                                                            {metric.unit && (
                                                                <span className="text-sm text-gray-500">{metric.unit}</span>
                                                            )}
                                                            <span className="text-sm text-gray-400 ml-2">
                                                                ({latestValue?.year || 'N/A'})
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {metricTrend ? (
                                                            <div className="flex items-center gap-2">
                                                                {getTrendIcon(metricTrend.trend)}
                                                                <span className="capitalize">{metricTrend.trend}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">No trend data</span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {getVerificationBadge(metric.verificationStatus)}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <button
                                                            onClick={() => toggleMetricExpansion(metric._id)}
                                                            className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 transition-colors"
                                                        >
                                                            {isExpanded ? (
                                                                <>
                                                                    <ChevronUp className="w-4 h-4" />
                                                                    Less Details
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ChevronDown className="w-4 h-4" />
                                                                    More Details
                                                                </>
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>
                                                
                                                {/* Expanded Details Row */}
                                                {isExpanded && (
                                                    <tr key={`${metric._id}-expanded`} className="bg-gray-50">
                                                        <td colSpan={6} className="px-6 py-4">
                                                            <div className="space-y-4">
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    <div>
                                                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Historical Values</h4>
                                                                        <div className="space-y-2">
                                                                            {metric.values
                                                                                .sort((a, b) => b.year - a.year)
                                                                                .map((value) => (
                                                                                    <div key={value._id} className="flex items-center justify-between text-sm">
                                                                                        <span className="text-gray-600">{value.year}</span>
                                                                                        <span className="font-medium">
                                                                                            {value.numeric_value !== null
                                                                                                ? formatNumber(value.numeric_value || 0)
                                                                                                : value.value}
                                                                                            {metric.unit && ` ${metric.unit}`}
                                                                                        </span>
                                                                                    </div>
                                                                                ))}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Source Information</h4>
                                                                        <div className="space-y-1 text-sm">
                                                                            <p className="text-gray-600">
                                                                                <span className="font-medium">Source Notes:</span> {latestValue?.source_notes || 'No notes'}
                                                                            </p>
                                                                            <p className="text-gray-600">
                                                                                <span className="font-medium">Added By:</span> {latestValue?.added_by || 'Unknown'}
                                                                            </p>
                                                                            <p className="text-gray-600">
                                                                                <span className="font-medium">Last Updated:</span> {latestValue?.last_updated_at ? new Date(latestValue.last_updated_at).toLocaleDateString() : 'N/A'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Quality Score</h4>
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                                                <div 
                                                                                    className="bg-green-600 h-2 rounded-full transition-all" 
                                                                                    style={{ width: `${(metric.dataQualityScore || 0)}%` }}
                                                                                ></div>
                                                                            </div>
                                                                            <span className="text-sm font-medium">{metric.dataQualityScore || 0}%</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {filteredMetrics.length === 0 && (
                            <div className="py-12 text-center">
                                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No metrics found</h3>
                                <p className="text-gray-600 max-w-sm mx-auto">
                                    Try adjusting your filters or search terms to find what you're looking for.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EsgMetricsScreen;