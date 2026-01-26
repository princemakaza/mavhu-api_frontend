import { useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import {
    PieChart as RechartsPieChart,
    Cell,
    ResponsiveContainer,
    LineChart as RechartsLineChart,
    Line as RechartsLine,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend as RechartsLegend,
    AreaChart,
    Area,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    BarChart,
    Bar,
    ComposedChart,
} from "recharts";
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Icons
import {
    Leaf,
    Thermometer,
    Activity as ActivityIcon,
    Wind,
    Trees,
    MapPin,
    Eye,
    TrendingUp,
    TrendingDown,
    Building,
    Target,
    Globe,
    PieChart as PieChartIcon,
    AreaChart as AreaChartIcon,
    BarChart3,
    Radar as RadarIcon,
    LineChart as LineChartIcon,
    Map,
    Info,
    Shield,
    CheckCircle,
    AlertCircle,
    X,
    Maximize2,
    Download,
    Share2,
    Calendar,
    Award,
    Zap,
    Droplet,
    Sun,
} from "lucide-react";

// Service functions
import {
    getDashboardIndicators,
    getEnvironmentalMetricsSummary,
    getAllESGMetricsSummary,
    getRegenerativeAgricultureOutcomes,
    getConfidenceScoreBreakdown,
    getYearlyDataComparison,
    getSoilHealthTrends,
} from "../../../../services/Admin_Service/esg_apis/soil_carbon_service";

// Components
import GraphDisplay from "../soil_components/GraphDisplay";

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
    Filler
);

// Enhanced Color Palette with Green Theme
const COLORS = {
    primary: '#22c55e',      // Green-500
    primaryDark: '#16a34a',  // Green-600
    primaryLight: '#86efac', // Green-300
    secondary: '#10b981',    // Emerald-500
    accent: '#84cc16',       // Lime-500
    success: '#22c55e',
    warning: '#eab308',      // Yellow-500
    danger: '#ef4444',       // Red-500
    info: '#3b82f6',         // Blue-500
    gradient1: '#22c55e',
    gradient2: '#10b981',
    gradient3: '#84cc16',
};

interface OverviewTabProps {
    soilHealthData: any;
    selectedCompany: any;
    formatNumber: (num: number) => string;
    formatCurrency: (num: number) => string;
    formatPercent: (num: number) => string;
    getTrendIcon: (trend: string) => JSX.Element;
    selectedYear: number | null;
    availableYears: number[];
    loading: boolean;
    isRefreshing: boolean;
    onMetricClick: (metric: any, modalType: string) => void;
}

const OverviewTab = ({
    soilHealthData,
    selectedCompany,
    formatNumber,
    formatCurrency,
    formatPercent,
    getTrendIcon,
    onMetricClick,
}: OverviewTabProps) => {
    const [selectedGraph, setSelectedGraph] = useState<any>(null);
    const [selectedMetric, setSelectedMetric] = useState<any>(null);
    const [showMetricModal, setShowMetricModal] = useState(false);
    const [showInsightsModal, setShowInsightsModal] = useState(false);

    // Get data using helper functions
    const dashboardIndicators = soilHealthData ? getDashboardIndicators(soilHealthData) : null;
    const environmentalMetrics = soilHealthData ? getEnvironmentalMetricsSummary(soilHealthData) : null;
    const allEsgMetrics = soilHealthData ? getAllESGMetricsSummary(soilHealthData) : null;
    const regenerativeOutcomes = soilHealthData ? getRegenerativeAgricultureOutcomes(soilHealthData) : null;
    const confidenceScore = soilHealthData ? getConfidenceScoreBreakdown(soilHealthData) : null;
    const yearlyComparison = soilHealthData ? getYearlyDataComparison(soilHealthData) : null;
    const soilHealthTrends = soilHealthData ? getSoilHealthTrends(soilHealthData) : null;

    // Get coordinates and area info
    const coordinates = soilHealthData?.data.company.area_of_interest_metadata?.coordinates || [];
    const areaName = soilHealthData?.data.company.area_of_interest_metadata?.name || "Project Area";
    const areaCovered = soilHealthData?.data.company.area_of_interest_metadata?.area_covered || "N/A";

    // Prepare chart data
    const prepareChartData = () => {
        return {
            // Emissions breakdown with green shades
            emissionsBreakdownData: environmentalMetrics ? [
                { name: 'Scope 1', value: environmentalMetrics.summary?.scope1 || 0, color: COLORS.primary },
                { name: 'Scope 2', value: environmentalMetrics.summary?.scope2 || 0, color: COLORS.secondary },
                { name: 'Scope 3', value: environmentalMetrics.summary?.scope3 || 0, color: COLORS.accent },
            ] : [],

            // Monthly SOC data
            monthlySocData: soilHealthData?.data.carbon_emission_accounting.detailed_monthly_data?.map((d: any) => ({
                month: d.month,
                soc: d.soc_tc_per_ha,
                ndvi: d.ndvi_max,
                co2: d.soc_co2_t_per_ha,
                biomass: d.biomass_co2_t_per_ha,
                delta: d.delta_soc_co2_t,
            })) || [],

            // ESG metrics breakdown
            esgMetricsData: allEsgMetrics ? [
                { name: 'Environmental', value: allEsgMetrics.environmental.count, color: COLORS.primary },
                { name: 'Social', value: allEsgMetrics.social.count, color: COLORS.secondary },
                { name: 'Governance', value: allEsgMetrics.governance.count, color: COLORS.accent },
            ] : [],

            // Carbon stock trend
            carbonStockData: yearlyComparison?.map((year: any) => ({
                year: year.year,
                stock: year.soc * 3.67,
                sequestration: year.sequestration,
                emissions: year.emissions,
            })) || [],

            // Soil health indicators
            soilHealthData: [
                { indicator: 'SOC', value: dashboardIndicators?.soilHealth.value || 0, target: 35, unit: 'tC/ha' },
                { indicator: 'pH', value: 6.8, target: 7, unit: 'pH' },
                { indicator: 'Organic Matter', value: 4.2, target: 5, unit: '%' },
                { indicator: 'Bulk Density', value: 1.2, target: 1.1, unit: 'g/cm³' },
            ],

            // Yearly comparison
            yearlyComparisonData: yearlyComparison || [],
        };
    };

    const chartData = prepareChartData();

    // Handle metric click
    const handleMetricClick = (metric: any, title: string) => {
        setSelectedMetric({ ...metric, title });
        setShowMetricModal(true);
    };

    // Graph configurations
    const overviewGraphs = [
        {
            id: 'monthly-soc-trend',
            title: 'Monthly SOC Variation',
            description: 'Soil organic carbon over time',
            type: 'area',
            data: chartData.monthlySocData,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.monthlySocData}>
                        <defs>
                            <linearGradient id="colorSoc" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                        <RechartsTooltip
                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                        />
                        <Area type="monotone" dataKey="soc" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorSoc)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'carbon-stock-trend',
            title: 'Carbon Stock Trend',
            description: 'Yearly carbon stock changes',
            type: 'line',
            data: chartData.carbonStockData,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={chartData.carbonStockData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="year" stroke="#6b7280" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                        <RechartsTooltip
                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                        />
                        <RechartsLegend />
                        <RechartsLine type="monotone" dataKey="stock" stroke={COLORS.primary} name="Carbon Stock" strokeWidth={3} dot={{ fill: COLORS.primary, r: 4 }} />
                        <RechartsLine type="monotone" dataKey="sequestration" stroke={COLORS.secondary} name="Sequestration" strokeWidth={3} dot={{ fill: COLORS.secondary, r: 4 }} />
                    </RechartsLineChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'soil-health-radar',
            title: 'Soil Health Indicators',
            description: 'Comprehensive soil health assessment',
            type: 'radar',
            data: chartData.soilHealthData,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={chartData.soilHealthData}>
                        <PolarGrid stroke="#d1d5db" />
                        <PolarAngleAxis dataKey="indicator" style={{ fontSize: '12px' }} />
                        <PolarRadiusAxis />
                        <Radar name="Current" dataKey="value" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.5} strokeWidth={2} />
                        <Radar name="Target" dataKey="target" stroke={COLORS.accent} fill={COLORS.accent} fillOpacity={0.2} strokeWidth={2} />
                        <RechartsTooltip />
                        <RechartsLegend />
                    </RadarChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'yearly-performance',
            title: 'Yearly Performance',
            description: 'Sequestration vs Emissions over time',
            type: 'composed',
            data: chartData.yearlyComparisonData,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData.yearlyComparisonData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="year" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <RechartsTooltip
                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                        />
                        <RechartsLegend />
                        <Bar dataKey="emissions" fill={COLORS.danger} name="Emissions" radius={[8, 8, 0, 0]} />
                        <RechartsLine type="monotone" dataKey="sequestration" stroke={COLORS.primary} name="Sequestration" strokeWidth={3} dot={{ fill: COLORS.primary, r: 5 }} />
                        <RechartsLine type="monotone" dataKey="netBalance" stroke={COLORS.info} name="Net Balance" strokeWidth={3} dot={{ fill: COLORS.info, r: 5 }} />
                    </ComposedChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'esg-metrics-distribution',
            title: 'ESG Metrics Distribution',
            description: 'Environmental, Social, and Governance metrics',
            type: 'pie',
            data: chartData.esgMetricsData,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                        <Pie
                            data={chartData.esgMetricsData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.esgMetricsData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <RechartsTooltip
                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                            formatter={(value: any) => formatNumber(value)}
                        />
                    </RechartsPieChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'emissions-breakdown',
            title: 'GHG Emissions Breakdown',
            description: 'Scope 1, 2, and 3 emissions distribution',
            type: 'pie',
            data: chartData.emissionsBreakdownData,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                        <Pie
                            data={chartData.emissionsBreakdownData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.emissionsBreakdownData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <RechartsTooltip
                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                            formatter={(value: any) => formatNumber(value)}
                        />
                    </RechartsPieChart>
                </ResponsiveContainer>
            )
        },
    ];

    return (
        <div className="space-y-8 pb-8">
            {/* Hero Section with Key Metrics */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 p-8 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Environmental Overview</h2>
                            <p className="text-green-100 text-lg">Real-time soil health and carbon metrics</p>
                        </div>
                        <button
                            onClick={() => setShowInsightsModal(true)}
                            className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
                        >
                            <Zap className="w-5 h-5" />
                            AI Insights
                        </button>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 cursor-pointer hover:bg-white/20 transition-all group"
                            onClick={() => handleMetricClick(dashboardIndicators?.soilHealth, 'Soil Organic Carbon')}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white/20">
                                    <Leaf className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-green-100 mb-1">SOC Level</div>
                                    <div className="flex items-center gap-2">
                                        {getTrendIcon(dashboardIndicators?.soilHealth?.trend || '')}
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-4xl font-bold mb-2">
                                {dashboardIndicators?.soilHealth?.value.toFixed(2)}
                                <span className="text-xl ml-1 text-green-100">{dashboardIndicators?.soilHealth?.unit}</span>
                            </h3>
                            <p className="text-green-100 mb-3">Soil Organic Carbon</p>
                            <span className="inline-block px-3 py-1 rounded-full text-xs bg-white/20 text-white font-medium">
                                {dashboardIndicators?.soilHealth?.status}
                            </span>
                        </div>

                        <div
                            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 cursor-pointer hover:bg-white/20 transition-all group"
                            onClick={() => handleMetricClick(dashboardIndicators?.carbonStock, 'Carbon Stock')}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white/20">
                                    <Thermometer className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-green-100 mb-1">Total Stock</div>
                                    <div className="flex items-center gap-2">
                                        {getTrendIcon(dashboardIndicators?.carbonStock?.trend || '')}
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-4xl font-bold mb-2">
                                {formatNumber(dashboardIndicators?.carbonStock?.value || 0)}
                                <span className="text-xl ml-1 text-green-100">{dashboardIndicators?.carbonStock?.unit}</span>
                            </h3>
                            <p className="text-green-100">Carbon Stock</p>
                        </div>

                        <div
                            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 cursor-pointer hover:bg-white/20 transition-all group"
                            onClick={() => handleMetricClick(dashboardIndicators?.carbonBalance, 'Net Carbon Balance')}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white/20">
                                    <ActivityIcon className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${dashboardIndicators?.carbonBalance?.value && dashboardIndicators.carbonBalance.value < 0 ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'}`}>
                                        {dashboardIndicators?.carbonBalance?.status}
                                    </span>
                                </div>
                            </div>
                            <h3 className="text-4xl font-bold mb-2">
                                {formatNumber(Math.abs(dashboardIndicators?.carbonBalance?.value || 0))}
                                <span className="text-xl ml-1 text-green-100">{dashboardIndicators?.carbonBalance?.unit}</span>
                            </h3>
                            <p className="text-green-100">Net Carbon Balance</p>
                        </div>

                        <div
                            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 cursor-pointer hover:bg-white/20 transition-all group"
                            onClick={() => handleMetricClick(dashboardIndicators?.vegetationHealth, 'Vegetation Health')}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white/20">
                                    <Sun className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-green-100 mb-1">NDVI</div>
                                    <div className="flex items-center gap-2">
                                        {getTrendIcon(dashboardIndicators?.vegetationHealth?.trend || '')}
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-4xl font-bold mb-2">
                                {dashboardIndicators?.vegetationHealth?.value.toFixed(3)}
                            </h3>
                            <p className="text-green-100 mb-3">NDVI Score</p>
                            <span className="inline-block px-3 py-1 rounded-full text-xs bg-white/20 text-white font-medium">
                                {dashboardIndicators?.vegetationHealth?.classification}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Interactive Map & Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map - Spanning 2 columns */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Project Location</h3>
                                <p className="text-gray-600 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-green-600" />
                                    {areaName}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 transition-all">
                                    <Share2 className="w-5 h-5 text-gray-600" />
                                </button>
                                <button className="p-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 transition-all">
                                    <Download className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="h-96">
                        {coordinates.length > 0 ? (
                            <MapContainer
                                center={[coordinates[0]?.lat || 0, coordinates[0]?.lon || 0]}
                                zoom={10}
                                style={{ height: '100%', width: '100%' }}
                                className="leaflet-container z-0"
                            >
                                <TileLayer
                                    attribution='&copy; OpenStreetMap contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {coordinates.length === 1 ? (
                                    <Marker position={[coordinates[0].lat, coordinates[0].lon]}>
                                        <Popup>
                                            <div className="p-2">
                                                <h3 className="font-bold text-green-700">{areaName}</h3>
                                                <p className="text-sm text-gray-700">Lat: {coordinates[0].lat.toFixed(4)}</p>
                                                <p className="text-sm text-gray-700">Lon: {coordinates[0].lon.toFixed(4)}</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ) : (
                                    <Polygon
                                        pathOptions={{ fillColor: COLORS.primary, color: COLORS.primary, fillOpacity: 0.3, weight: 2 }}
                                        positions={coordinates.map((coord: any) => [coord.lat, coord.lon])}
                                    >
                                        <Popup>
                                            <div className="p-2">
                                                <h3 className="font-bold text-green-700">{areaName}</h3>
                                                <p className="text-sm text-gray-700">Area: {areaCovered}</p>
                                            </div>
                                        </Popup>
                                    </Polygon>
                                )}
                            </MapContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                                <div className="text-center">
                                    <Map className="w-16 h-16 mx-auto mb-4 opacity-20 text-green-600" />
                                    <p className="text-gray-500 font-medium">No location data available</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-6 grid grid-cols-2 gap-4 bg-gray-50">
                        <div className="p-4 rounded-xl bg-white border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-green-600" />
                                Area Covered
                            </p>
                            <p className="font-bold text-lg text-gray-900">{areaCovered}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                                <Target className="w-4 h-4 text-green-600" />
                                Coordinates
                            </p>
                            <p className="font-bold text-lg text-gray-900">{coordinates.length} points</p>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Sidebar */}
                <div className="space-y-6">
                    {/* Confidence Score */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Data Confidence</h3>
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-green-600" />
                                <span className="text-3xl font-bold text-green-600">{confidenceScore?.overall}%</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {confidenceScore?.breakdown.map((item: any, index: number) => (
                                <div key={index}>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                        <span className="text-sm font-bold text-gray-900">{item.value}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${item.value}%`,
                                                backgroundColor: COLORS.primary
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                            <p className="text-sm text-gray-700 flex items-start gap-2">
                                <Info className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>{confidenceScore?.interpretation}</span>
                            </p>
                        </div>
                    </div>

                    {/* Regenerative Agriculture Score */}
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">Regenerative Score</h3>
                            <Trees className="w-6 h-6" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm">
                                <Leaf className="w-5 h-5 mb-2" />
                                <p className="text-xs mb-1 text-green-100">Soil Health</p>
                                <p className="text-2xl font-bold">{regenerativeOutcomes?.soilHealthScoreFormatted}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm">
                                <Shield className="w-5 h-5 mb-2" />
                                <p className="text-xs mb-1 text-green-100">Permanence</p>
                                <p className="text-2xl font-bold">{regenerativeOutcomes?.permanenceScoreFormatted}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm">
                                <Sun className="w-5 h-5 mb-2" />
                                <p className="text-xs mb-1 text-green-100">Vegetation</p>
                                <p className="text-2xl font-bold">{regenerativeOutcomes?.vegetationHealthScoreFormatted}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm">
                                <Droplet className="w-5 h-5 mb-2" />
                                <p className="text-xs mb-1 text-green-100">Sequestration</p>
                                <p className="text-xl font-bold">{regenerativeOutcomes?.sequestrationPotentialFormatted}</p>
                            </div>
                        </div>
                        <div className="mt-4 p-4 rounded-xl bg-white/20 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">Verification</p>
                                <CheckCircle className="w-5 h-5" />
                            </div>
                            <p className="font-bold mt-1">{regenerativeOutcomes?.verification_status}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GraphDisplay
                    title="Monthly SOC Variation"
                    description="Track soil organic carbon changes over time"
                    icon={<AreaChartIcon className="w-5 h-5 text-green-600" />}
                    onClick={() => setSelectedGraph(overviewGraphs[0])}
                >
                    {overviewGraphs[0].component}
                </GraphDisplay>

                <GraphDisplay
                    title="Carbon Stock Trend"
                    description="Annual carbon stock and sequestration"
                    icon={<LineChartIcon className="w-5 h-5 text-green-600" />}
                    onClick={() => setSelectedGraph(overviewGraphs[1])}
                >
                    {overviewGraphs[1].component}
                </GraphDisplay>

                <GraphDisplay
                    title="Soil Health Indicators"
                    description="Multi-dimensional soil health assessment"
                    icon={<RadarIcon className="w-5 h-5 text-green-600" />}
                    onClick={() => setSelectedGraph(overviewGraphs[2])}
                >
                    {overviewGraphs[2].component}
                </GraphDisplay>

                <GraphDisplay
                    title="Yearly Performance"
                    description="Emissions vs sequestration analysis"
                    icon={<BarChart3 className="w-5 h-5 text-green-600" />}
                    onClick={() => setSelectedGraph(overviewGraphs[3])}
                >
                    {overviewGraphs[3].component}
                </GraphDisplay>

                <GraphDisplay
                    title="ESG Metrics Distribution"
                    description="Environmental, Social, Governance breakdown"
                    icon={<PieChartIcon className="w-5 h-5 text-green-600" />}
                    onClick={() => setSelectedGraph(overviewGraphs[4])}
                >
                    {overviewGraphs[4].component}
                </GraphDisplay>

                <GraphDisplay
                    title="GHG Emissions Breakdown"
                    description="Scope 1, 2, and 3 emissions analysis"
                    icon={<PieChartIcon className="w-5 h-5 text-green-600" />}
                    onClick={() => setSelectedGraph(overviewGraphs[5])}
                >
                    {overviewGraphs[5].component}
                </GraphDisplay>
            </div>

            {/* Company Metadata */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Company Information</h3>
                        <p className="text-gray-600">Organization details and ESG rating</p>
                    </div>
                    <Building className="w-8 h-8 text-green-600" />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">Company Name</p>
                        <p className="font-bold text-lg text-gray-900">{selectedCompany?.name}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">Industry</p>
                        <p className="font-bold text-lg text-gray-900">{selectedCompany?.industry}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">Country</p>
                        <p className="font-bold text-lg text-gray-900">{selectedCompany?.country}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                        <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                            <Award className="w-4 h-4 text-green-600" />
                            ESG Rating
                        </p>
                        <p className="font-bold text-lg text-green-700">{selectedCompany?.esg_rating || 'Not Rated'}</p>
                    </div>
                </div>
                {selectedCompany?.description && (
                    <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-3 font-medium">Description</p>
                        <p className="text-gray-700 leading-relaxed">{selectedCompany.description}</p>
                    </div>
                )}
            </div>

            {/* Soil Health Trends */}
            {soilHealthTrends && (
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">Soil Health Trends</h3>
                            <p className="text-gray-600">Monitor key performance indicators</p>
                        </div>
                        <Target className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {soilHealthTrends.trends.map((trend: any, index: number) => (
                            <div
                                key={index}
                                className="group flex items-center justify-between p-6 rounded-2xl hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 border-2 border-gray-200 hover:border-green-300 cursor-pointer transition-all duration-200"
                                onClick={() => handleMetricClick(trend, trend.label)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-gray-100 group-hover:bg-green-100 transition-colors">
                                        {getTrendIcon(trend.value)}
                                    </div>
                                    <span className="text-gray-900 font-semibold text-lg">{trend.label}</span>
                                </div>
                                <span className={`px-4 py-2 rounded-xl text-sm font-bold ${trend.value.includes('improving') ? 'bg-green-100 text-green-800' :
                                    trend.value.includes('declining') ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {trend.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Graph Modal */}
            {selectedGraph && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedGraph(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedGraph.title}</h3>
                                    <p className="text-gray-600">{selectedGraph.description}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 transition-all">
                                        <Download className="w-5 h-5 text-gray-600" />
                                    </button>
                                    <button
                                        onClick={() => setSelectedGraph(null)}
                                        className="p-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 transition-all"
                                    >
                                        <X className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="h-[500px]">
                                {selectedGraph.component}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Metric Detail Modal */}
            {showMetricModal && selectedMetric && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowMetricModal(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold mb-1">{selectedMetric.title}</h3>
                                    <p className="text-green-100">Detailed metric information</p>
                                </div>
                                <button
                                    onClick={() => setShowMetricModal(false)}
                                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="text-center mb-8">
                                <div className="text-6xl font-bold text-green-600 mb-2">
                                    {selectedMetric.value?.toFixed ? selectedMetric.value.toFixed(2) : selectedMetric.value}
                                </div>
                                <div className="text-xl text-gray-600">{selectedMetric.unit}</div>
                            </div>
                            <div className="space-y-4">
                                {selectedMetric.status && (
                                    <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                                        <div className="flex items-center gap-2 text-green-800">
                                            <CheckCircle className="w-5 h-5" />
                                            <span className="font-semibold">Status: {selectedMetric.status}</span>
                                        </div>
                                    </div>
                                )}
                                {selectedMetric.trend && (
                                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                                        <div className="flex items-center gap-2 text-gray-800">
                                            {getTrendIcon(selectedMetric.trend)}
                                            <span className="font-semibold">Trend: {selectedMetric.trend}</span>
                                        </div>
                                    </div>
                                )}
                                {selectedMetric.classification && (
                                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                                        <div className="flex items-center gap-2 text-blue-800">
                                            <Info className="w-5 h-5" />
                                            <span className="font-semibold">Classification: {selectedMetric.classification}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Insights Modal */}
            {showInsightsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowInsightsModal(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-3xl sticky top-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-white/20">
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">AI-Powered Insights</h3>
                                        <p className="text-purple-100">Smart analysis and recommendations</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowInsightsModal(false)}
                                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-green-100 flex-shrink-0">
                                        <TrendingUp className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900 mb-2">Carbon Sequestration Opportunity</h4>
                                        <p className="text-gray-700 leading-relaxed">
                                            Your soil organic carbon levels show a positive trend with {dashboardIndicators?.soilHealth?.value.toFixed(2)} tC/ha.
                                            Based on current practices, there's potential to increase sequestration by 15-20% over the next year through enhanced
                                            regenerative practices.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-blue-100 flex-shrink-0">
                                        <Shield className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900 mb-2">Data Quality Assessment</h4>
                                        <p className="text-gray-700 leading-relaxed">
                                            Your data confidence score of {confidenceScore?.overall}% indicates high-quality measurements.
                                            This provides a solid foundation for carbon credit verification and ESG reporting.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-yellow-100 flex-shrink-0">
                                        <AlertCircle className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900 mb-2">Recommended Actions</h4>
                                        <ul className="space-y-2 text-gray-700">
                                            <li className="flex items-start gap-2">
                                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span>Continue current regenerative agriculture practices to maintain positive carbon balance</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span>Monitor NDVI trends closely to optimize vegetation health</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span>Consider expanding monitored area to maximize carbon credit potential</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-purple-100 flex-shrink-0">
                                        <Award className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900 mb-2">Certification Readiness</h4>
                                        <p className="text-gray-700 leading-relaxed">
                                            Your regenerative agriculture score of {regenerativeOutcomes?.soilHealthScoreFormatted} positions you well for
                                            carbon credit certification. The verification status is currently {regenerativeOutcomes?.verification_status}.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OverviewTab;