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
import { Bar, Line } from 'react-chartjs-2';
import {
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    LineChart,
    LineChart as RechartsLineChart,
    Line as RechartsLine,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend as RechartsLegend,
    AreaChart,
    Area,
    BarChart,
    Bar as RechartsBar,
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
    CloudRain,
    ThermometerSun,
    AlertTriangle,
    Target as TargetIcon,
    Package,
    Sprout,
} from "lucide-react";

// Service functions from crop_yield_service
import {
    getYieldForecastSummary,
    getRiskAssessmentSummary,
    getCompanyInfo,
  
    getNDVIIndicators,
    getCalculationFactors,
    getEnvironmentalMetricsSummary,
} from "../../../../services/Admin_Service/esg_apis/crop_yield_service";

// Components

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
    highYield: '#10b981',    // Green for high yield
    mediumYield: '#eab308',  // Yellow for medium yield
    lowYield: '#ef4444',     // Red for low yield
};

interface OverviewTabProps {
    cropYieldData: any;
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
    cropYieldData,
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
    const yieldForecast = cropYieldData ? getYieldForecastSummary(cropYieldData) : null;
    const riskAssessment = cropYieldData ? getRiskAssessmentSummary(cropYieldData) : null;
    const companyInfo = cropYieldData ? getCompanyInfo(cropYieldData) : null;
    const environmentalMetrics = cropYieldData ? getEnvironmentalMetricsSummary(cropYieldData) : null;
    const ndviIndicators = cropYieldData ? getNDVIIndicators(cropYieldData) : null;
    const calculationFactors = cropYieldData ? getCalculationFactors(cropYieldData) : null;

    // Get coordinates and area info
    const coordinates = cropYieldData?.data.company.area_of_interest?.coordinates || [];
    const areaName = cropYieldData?.data.company.area_of_interest?.name || "Project Area";
    const areaCovered = cropYieldData?.data.company.area_of_interest?.area_covered || "N/A";

    // Get confidence score
    const confidenceScore = cropYieldData?.data.confidence_score;

    // Get seasonal advisory
    const seasonalAdvisory = cropYieldData?.data.seasonal_advisory;

    // Prepare chart data
    const prepareChartData = () => {
        // Mock yearly yield data (in production, this would come from the API)
        const yearlyYieldData = [
            { year: 2020, yield: 3.2, potential: 4.5, color: COLORS.lowYield },
            { year: 2021, yield: 3.8, potential: 4.5, color: COLORS.mediumYield },
            { year: 2022, yield: 4.1, potential: 4.5, color: COLORS.highYield },
            { year: 2023, yield: 4.3, potential: 4.8, color: COLORS.highYield },
            { year: 2024, yield: yieldForecast?.forecastedYield || 4.5, potential: 5.2, color: COLORS.highYield },
        ];

        // Risk distribution data
        const riskDistributionData = riskAssessment?.detailedRisks?.map((risk: any) => ({
            name: risk.category,
            value: risk.score,
            color: risk.level === 'High' ? COLORS.danger : 
                   risk.level === 'Medium' ? COLORS.warning : COLORS.success,
        })) || [];

        // Yield components breakdown
        const yieldComponentsData = [
            { name: 'Base Yield', value: calculationFactors?.base_yield || 0, color: COLORS.primary },
            { name: 'NDVI Factor', value: parseFloat(calculationFactors?.ndvi_factor?.replace('%', '') || '0'), color: COLORS.secondary },
            { name: 'Water Efficiency', value: parseFloat(calculationFactors?.water_efficiency?.replace('%', '') || '0'), color: COLORS.info },
            { name: 'Soil Health', value: parseFloat(calculationFactors?.soil_health_factor?.replace('%', '') || '0'), color: COLORS.accent },
        ];

        // Climate risk impact
        const climateRiskData = [
            { factor: 'Drought', impact: 75, probability: 'High' },
            { factor: 'Flood', impact: 45, probability: 'Medium' },
            { factor: 'Temperature', impact: 60, probability: 'High' },
            { factor: 'Pests', impact: 30, probability: 'Low' },
            { factor: 'Diseases', impact: 40, probability: 'Medium' },
        ];

        // Monthly NDVI data
        const monthlyNdviData = ndviIndicators?.growing_season_months?.map((month: any) => ({
            month: month.month,
            ndvi: month.ndvi,
            biomass: month.biomass,
        })) || [];

        return {
            yearlyYieldData,
            riskDistributionData,
            yieldComponentsData,
            climateRiskData,
            monthlyNdviData,
        };
    };

    const chartData = prepareChartData();

    // Handle metric click
    const handleMetricClick = (metric: any, title: string) => {
        setSelectedMetric({ ...metric, title });
        setShowMetricModal(true);
    };

    // Calculate yield gap
    const currentYield = yieldForecast?.forecastedYield || 0;
    const potentialYield = chartData.yearlyYieldData[chartData.yearlyYieldData.length - 1]?.potential || 0;
    const yieldGap = potentialYield - currentYield;
    const yieldGapPercentage = potentialYield > 0 ? (yieldGap / potentialYield) * 100 : 0;

    // Yield Performance Metrics
    const yieldPerformance = {
        averageYield: currentYield,
        yieldChange: yieldForecast?.comparison?.percentage_difference || "0%",
        totalProduction: (currentYield * 1000).toFixed(0), // Assuming 1000 hectares
        unit: yieldForecast?.unit || "tons/ha",
    };

    // Chart configurations
    const overviewGraphs = [
        {
            id: 'yield-trend',
            title: 'Yield Trend Over Time',
            description: 'Historical and forecasted yield performance',
            type: 'bar',
            data: chartData.yearlyYieldData,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData.yearlyYieldData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="year" stroke="#6b7280" style={{ fontSize: '12px' }} />
                        <YAxis 
                            stroke="#6b7280" 
                            style={{ fontSize: '12px' }}
                            label={{ value: 'Yield (tons/ha)', angle: -90, position: 'insideLeft' }}
                        />
                        <RechartsTooltip
                            contentStyle={{ 
                                backgroundColor: '#ffffff', 
                                border: '1px solid #d1d5db', 
                                borderRadius: '0.5rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            formatter={(value: any, name: any) => {
                                if (name === 'yield') return [`${value} tons/ha`, 'Actual Yield'];
                                if (name === 'potential') return [`${value} tons/ha`, 'Potential Yield'];
                                return [value, name];
                            }}
                        />
                        <RechartsLegend />
                        <RechartsBar 
                            dataKey="yield" 
                            name="Actual Yield" 
                            radius={[4, 4, 0, 0]}
                            fill={(data: any) => data.color || COLORS.primary}
                        />
                        <RechartsLine 
                            type="monotone" 
                            dataKey="potential" 
                            name="Potential Yield" 
                            stroke={COLORS.primaryDark}
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ fill: COLORS.primaryDark, r: 4 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'yield-gap',
            title: 'Yield Gap Analysis',
            description: 'Potential vs Actual Yield Comparison',
            type: 'composed',
            data: [
                { name: 'Current', value: currentYield },
                { name: 'Potential', value: potentialYield },
                { name: 'Gap', value: yieldGap },
            ],
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                        { 
                            category: 'Yield Analysis', 
                            current: currentYield, 
                            potential: potentialYield,
                            gap: yieldGap 
                        }
                    ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="category" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <RechartsTooltip
                            contentStyle={{ 
                                backgroundColor: '#ffffff', 
                                border: '1px solid #d1d5db', 
                                borderRadius: '0.5rem' 
                            }}
                        />
                        <RechartsLegend />
                        <RechartsBar dataKey="current" name="Current Yield" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                        <RechartsBar dataKey="potential" name="Potential Yield" fill={COLORS.primaryLight} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'risk-distribution',
            title: 'Risk Distribution',
            description: 'Breakdown of crop production risks',
            type: 'pie',
            data: chartData.riskDistributionData,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                        <Pie
                            data={chartData.riskDistributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.riskDistributionData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <RechartsTooltip
                            contentStyle={{ 
                                backgroundColor: '#ffffff', 
                                border: '1px solid #d1d5db', 
                                borderRadius: '0.5rem' 
                            }}
                            formatter={(value: any) => `${value}%`}
                        />
                    </RechartsPieChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'yield-components',
            title: 'Yield Components',
            description: 'Factors contributing to yield forecast',
            type: 'bar',
            data: chartData.yieldComponentsData,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.yieldComponentsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                        <YAxis 
                            stroke="#6b7280" 
                            style={{ fontSize: '12px' }}
                            label={{ value: 'Value (%)', angle: -90, position: 'insideLeft' }}
                        />
                        <RechartsTooltip
                            contentStyle={{ 
                                backgroundColor: '#ffffff', 
                                border: '1px solid #d1d5db', 
                                borderRadius: '0.5rem' 
                            }}
                            formatter={(value: any) => [`${value}%`, 'Contribution']}
                        />
                        <RechartsBar 
                            dataKey="value" 
                            fill={(data: any) => data.color || COLORS.primary}
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'climate-risk-impact',
            title: 'Climate Risk Impact',
            description: 'Impact of climate factors on yield',
            type: 'bar',
            data: chartData.climateRiskData,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.climateRiskData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="factor" stroke="#6b7280" style={{ fontSize: '12px' }} />
                        <YAxis 
                            stroke="#6b7280" 
                            style={{ fontSize: '12px' }}
                            label={{ value: 'Impact Score', angle: -90, position: 'insideLeft' }}
                        />
                        <RechartsTooltip
                            contentStyle={{ 
                                backgroundColor: '#ffffff', 
                                border: '1px solid #d1d5db', 
                                borderRadius: '0.5rem' 
                            }}
                            formatter={(value: any, name: any, props: any) => [
                                `${value}%`, 
                                `Probability: ${props.payload.probability}`
                            ]}
                        />
                        <RechartsBar 
                            dataKey="impact" 
                            fill={(data: any) => 
                                data.probability === 'High' ? COLORS.danger : 
                                data.probability === 'Medium' ? COLORS.warning : COLORS.success
                            }
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'ndvi-trend',
            title: 'NDVI Trend',
            description: 'Vegetation health during growing season',
            type: 'line',
            data: chartData.monthlyNdviData,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.monthlyNdviData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                        <YAxis 
                            stroke="#6b7280" 
                            style={{ fontSize: '12px' }}
                            label={{ value: 'NDVI Value', angle: -90, position: 'insideLeft' }}
                        />
                        <RechartsTooltip
                            contentStyle={{ 
                                backgroundColor: '#ffffff', 
                                border: '1px solid #d1d5db', 
                                borderRadius: '0.5rem' 
                            }}
                            formatter={(value: any) => [value, 'NDVI']}
                        />
                        <RechartsLine 
                            type="monotone" 
                            dataKey="ndvi" 
                            stroke={COLORS.primary}
                            strokeWidth={3}
                            dot={{ fill: COLORS.primary, r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
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
                            <h2 className="text-3xl font-bold mb-2">Crop Yield Forecast Overview</h2>
                            <p className="text-green-100 text-lg">
                                {seasonalAdvisory?.current_season ? `Current Season: ${seasonalAdvisory.current_season}` : "Real-time crop yield forecasting and risk assessment"}
                            </p>
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
                        {/* Average Yield */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 cursor-pointer hover:bg-white/20 transition-all group"
                            onClick={() => handleMetricClick(yieldForecast, 'Yield Forecast')}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white/20">
                                    <Package className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-green-100 mb-1">Forecasted Yield</div>
                                    <div className="flex items-center gap-2">
                                        {yieldForecast?.comparison?.status === 'Above Average' ? (
                                            <TrendingUp className="w-4 h-4 text-green-300" />
                                        ) : (
                                            <TrendingDown className="w-4 h-4 text-red-300" />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-4xl font-bold mb-2">
                                {yieldPerformance.averageYield.toFixed(1)}
                                <span className="text-xl ml-1 text-green-100">{yieldPerformance.unit}</span>
                            </h3>
                            <p className="text-green-100 mb-3">Average Yield</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                yieldForecast?.comparison?.status === 'Above Average' ? 
                                'bg-green-400 text-green-900' : 
                                'bg-yellow-400 text-yellow-900'
                            }`}>
                                {yieldForecast?.comparison?.status || 'Calculating...'}
                            </span>
                        </div>

                        {/* Yield Change */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 cursor-pointer hover:bg-white/20 transition-all group"
                            onClick={() => handleMetricClick(yieldForecast?.comparison, 'Yield Comparison')}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white/20">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-green-100 mb-1">vs Industry</div>
                                    <div className="flex items-center gap-2">
                                        {yieldForecast?.comparison?.status === 'Above Average' ? (
                                            <TrendingUp className="w-4 h-4 text-green-300" />
                                        ) : (
                                            <TrendingDown className="w-4 h-4 text-red-300" />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-4xl font-bold mb-2">
                                {yieldPerformance.yieldChange}
                            </h3>
                            <p className="text-green-100">Change vs Baseline</p>
                        </div>

                        {/* Total Production */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 cursor-pointer hover:bg-white/20 transition-all group"
                            onClick={() => handleMetricClick({
                                value: yieldPerformance.totalProduction,
                                unit: 'tons',
                                description: 'Total estimated production across all fields'
                            }, 'Total Production')}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white/20">
                                    <Sprout className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-green-100 mb-1">Portfolio Total</div>
                                </div>
                            </div>
                            <h3 className="text-4xl font-bold mb-2">
                                {formatNumber(parseFloat(yieldPerformance.totalProduction))}
                                <span className="text-xl ml-1 text-green-100">tons</span>
                            </h3>
                            <p className="text-green-100">Total Production Portfolio</p>
                        </div>

                        {/* Risk Level */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 cursor-pointer hover:bg-white/20 transition-all group"
                            onClick={() => handleMetricClick(riskAssessment, 'Risk Assessment')}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white/20">
                                    <AlertTriangle className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-green-100 mb-1">Overall Risk</div>
                                    <div className="flex items-center gap-2">
                                        {riskAssessment?.riskLevel === 'Low' ? (
                                            <TrendingDown className="w-4 h-4 text-green-300" />
                                        ) : (
                                            <TrendingUp className="w-4 h-4 text-red-300" />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-4xl font-bold mb-2">
                                {riskAssessment?.overallScore || 0}%
                            </h3>
                            <p className="text-green-100 mb-3">Risk Level: {riskAssessment?.riskLevel || 'Low'}</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                riskAssessment?.riskLevel === 'Low' ? 'bg-green-400 text-green-900' :
                                riskAssessment?.riskLevel === 'Medium' ? 'bg-yellow-400 text-yellow-900' :
                                'bg-red-400 text-red-900'
                            }`}>
                                {riskAssessment?.probability || 'Calculating...'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Yield Trend Chart */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Yield Trend Over Time</h3>
                            <p className="text-gray-600">Year-by-year yield performance with color coding</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-sm font-medium text-green-800">High Yield</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100">
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <span className="text-sm font-medium text-yellow-800">Medium Yield</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-100">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span className="text-sm font-medium text-red-800">Low Yield</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-80">
                        {overviewGraphs[0].component}
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Current Yield</p>
                            <p className="font-bold text-lg text-gray-900">
                                {currentYield.toFixed(1)} {yieldPerformance.unit}
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Trend Direction</p>
                            <p className="font-bold text-lg text-green-600 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Increasing
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Best Year</p>
                            <p className="font-bold text-lg text-gray-900">
                                {Math.max(...chartData.yearlyYieldData.map(d => d.yield)).toFixed(1)} {yieldPerformance.unit}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Yield Gap Potential */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Yield Gap Potential</h3>
                        <TargetIcon className="w-6 h-6 text-green-600" />
                    </div>
                    
                    <div className="space-y-6">
                        {/* Current vs Potential */}
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-medium text-gray-700">Current Yield</span>
                                <span className="text-2xl font-bold text-green-700">
                                    {currentYield.toFixed(1)} {yieldPerformance.unit}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-700">Potential Yield</span>
                                <span className="text-2xl font-bold text-green-800">
                                    {potentialYield.toFixed(1)} {yieldPerformance.unit}
                                </span>
                            </div>
                        </div>

                        {/* Yield Gap Metric */}
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-2">Yield Gap</p>
                                <p className="text-3xl font-bold text-blue-700 mb-1">
                                    {yieldGap.toFixed(1)} {yieldPerformance.unit}
                                </p>
                                <p className="text-lg font-medium text-blue-600">
                                    {yieldGapPercentage.toFixed(1)}% of potential
                                </p>
                            </div>
                        </div>

                        {/* Improvement Areas */}
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200">
                            <p className="font-medium text-gray-700 mb-3">Improvement Areas</p>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span>Water efficiency: {calculationFactors?.water_efficiency || 'N/A'}</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span>Soil health: {calculationFactors?.soil_health_factor || 'N/A'}</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span>Climate adaptation: {calculationFactors?.climate_factor || 'N/A'}</span>
                                </li>
                            </ul>
                        </div>

                        {/* Action Recommendations */}
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
                            <p className="font-medium text-gray-700 mb-2">Quick Actions</p>
                            <div className="space-y-2">
                                {seasonalAdvisory?.recommended_actions?.slice(0, 2).map((action: string, index: number) => (
                                    <div key={index} className="flex items-start gap-2 text-sm">
                                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5"></div>
                                        <span className="text-gray-700">{action}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Climate Risk & Map Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Climate Risk Section */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Climate Risk & Stress Impact on Yield</h3>
                                <p className="text-gray-600">Analysis of climate factors affecting crop production</p>
                            </div>
                            <ThermometerSun className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    
                    <div className="p-6">
                        <div className="h-64 mb-6">
                            {overviewGraphs[4].component}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {chartData.climateRiskData.map((risk: any, index: number) => (
                                <div 
                                    key={index}
                                    className={`p-4 rounded-xl border ${
                                        risk.probability === 'High' ? 'bg-red-50 border-red-200' :
                                        risk.probability === 'Medium' ? 'bg-yellow-50 border-yellow-200' :
                                        'bg-green-50 border-green-200'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-gray-700">{risk.factor}</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            risk.probability === 'High' ? 'bg-red-100 text-red-800' :
                                            risk.probability === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {risk.probability}
                                        </span>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <span className="text-2xl font-bold text-gray-900">{risk.impact}%</span>
                                        <span className="text-sm text-gray-600">impact</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Field Location</h3>
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
                    <div className="h-64">
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
                    <div className="p-4 grid grid-cols-2 gap-4 bg-gray-50">
                        <div className="p-3 rounded-xl bg-white border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-green-600" />
                                Area Covered
                            </p>
                            <p className="font-bold text-gray-900">{areaCovered}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                                <Target className="w-4 h-4 text-green-600" />
                                Field Points
                            </p>
                            <p className="font-bold text-gray-900">{coordinates.length} points</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Risk Distribution */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Risk Distribution</h3>
                        <AlertTriangle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="h-64">
                        {overviewGraphs[2].component}
                    </div>
                </div>

                {/* Yield Components */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Yield Components</h3>
                        <PieChartIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="h-64">
                        {overviewGraphs[3].component}
                    </div>
                </div>

                {/* NDVI Trend */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">NDVI Trend</h3>
                        <Sun className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="h-64">
                        {overviewGraphs[5].component}
                    </div>
                </div>
            </div>

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
                                    {typeof selectedMetric.value === 'number' ? selectedMetric.value.toFixed(2) : selectedMetric.value}
                                </div>
                                <div className="text-xl text-gray-600">{selectedMetric.unit}</div>
                            </div>
                            <div className="space-y-4">
                                {selectedMetric.description && (
                                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                                        <p className="text-gray-700">{selectedMetric.description}</p>
                                    </div>
                                )}
                                {selectedMetric.status && (
                                    <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                                        <div className="flex items-center gap-2 text-green-800">
                                            <CheckCircle className="w-5 h-5" />
                                            <span className="font-semibold">Status: {selectedMetric.status}</span>
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
                                        <h3 className="text-2xl font-bold">AI-Powered Yield Insights</h3>
                                        <p className="text-purple-100">Smart analysis and recommendations for crop yield optimization</p>
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
                                        <h4 className="font-bold text-lg text-gray-900 mb-2">Yield Optimization Opportunity</h4>
                                        <p className="text-gray-700 leading-relaxed">
                                            Current yield forecast shows {currentYield.toFixed(1)} {yieldPerformance.unit} with a 
                                            potential gap of {yieldGap.toFixed(1)} {yieldPerformance.unit}. By addressing water efficiency 
                                            and soil health factors, you could close {Math.min(yieldGapPercentage * 0.7, 100).toFixed(1)}% 
                                            of this gap in the next growing season.
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
                                        <h4 className="font-bold text-lg text-gray-900 mb-2">Risk Mitigation Strategy</h4>
                                        <p className="text-gray-700 leading-relaxed">
                                            Your overall risk level is {riskAssessment?.riskLevel || 'Low'} with a {riskAssessment?.probability || 'N/A'} probability.
                                            Focus on mitigating drought and temperature risks which have the highest impact scores.
                                            Consider implementing irrigation optimization and heat-resistant crop varieties.
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
                                                <span>Implement precision irrigation to improve water efficiency from {calculationFactors?.water_efficiency || 'N/A'} to target 85%</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span>Schedule soil amendments before {seasonalAdvisory?.planting_schedule?.optimal_planting || 'next planting season'}</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span>Monitor NDVI closely during {seasonalAdvisory?.harvest_window?.peak_harvest || 'peak growing season'}</span>
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
                                        <h4 className="font-bold text-lg text-gray-900 mb-2">Financial Impact</h4>
                                        <p className="text-gray-700 leading-relaxed">
                                            Closing the yield gap could increase production by approximately {yieldGap.toFixed(1)} {yieldPerformance.unit},
                                            potentially generating additional revenue of ${(yieldGap * 250).toFixed(0)} per hectare 
                                            (assuming $250/ton market price).
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