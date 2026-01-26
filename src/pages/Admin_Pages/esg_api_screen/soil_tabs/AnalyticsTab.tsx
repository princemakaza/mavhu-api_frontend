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
    Filler,
    ScatterController,
} from 'chart.js';
import {
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
    BarChart,
    Bar,
    ScatterChart,
    Scatter,
    ComposedChart,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Cell,
    ZAxis,
} from "recharts";

// Icons
import {
    TrendingUp,
    TrendingDown,
    Activity,
    Target,
    BarChart3,
    LineChart as LineChartIcon,
    PieChart as PieChartIcon,
    AreaChart as AreaChartIcon,
    ScatterChart as ScatterChartIcon,
    Radar as RadarIcon,
    GitBranch,
    Network,
    Table as TableIcon,
    Filter,
    Search,
    Eye,
    Info,
    AlertTriangle,
    DollarSign,
    Clock,
    Gauge,
    ThermometerSun,
    CloudRain,
    Waves,
    Mountain,
    Sprout,
    X,
    Download,
    Share2,
    CheckCircle,
    Zap,
    Brain,
    TrendingUpDown,
    BadgeCheck,
    Lightbulb,
    ShieldCheck,
    BarChartHorizontal,
} from "lucide-react";

// Service functions
import {
    getMetricsTrendAnalysis,
    getCarbonCreditPredictions,
    getSoilHealthTrends,
    getCarbonStockAnalysisDetails,
    getVegetationHealthDetails,
    getCarbonEmissionDetails,
    getYearlyDataComparison,
    getSoilOrganicCarbonDetails,
    getEnvironmentalMetricsSummary,
    getAllESGMetricsSummary,
    getDashboardIndicators,
    getConfidenceScoreBreakdown,
} from "../../../../services/Admin_Service/esg_apis/soil_carbon_service";

// Components
import GraphDisplay from "../soil_components/GraphDisplay";
import DataTable from "../soil_components/DataTable";

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
    purple: '#8b5cf6',       // Purple-500
    gradient1: '#22c55e',
    gradient2: '#10b981',
    gradient3: '#84cc16',
};

interface AnalyticsTabProps {
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

const AnalyticsTab = ({
    soilHealthData,
    selectedCompany,
    formatNumber,
    formatCurrency,
    formatPercent,
    getTrendIcon,
    onMetricClick,
}: AnalyticsTabProps) => {
    const [selectedGraph, setSelectedGraph] = useState<any>(null);
    const [selectedTable, setSelectedTable] = useState<'statistical' | 'correlation' | 'anomalies'>('statistical');
    const [selectedMetric, setSelectedMetric] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeInsightTab, setActiveInsightTab] = useState('trends');
    const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);

    // Get data using helper functions
    const metricsTrendAnalysis = soilHealthData ? getMetricsTrendAnalysis(soilHealthData) : null;
    const carbonCreditPredictions = soilHealthData ? getCarbonCreditPredictions(soilHealthData) : null;
    const soilHealthTrends = soilHealthData ? getSoilHealthTrends(soilHealthData) : null;
    const carbonStockAnalysis = soilHealthData ? getCarbonStockAnalysisDetails(soilHealthData) : null;
    const vegetationHealth = soilHealthData ? getVegetationHealthDetails(soilHealthData) : null;
    const carbonEmissionDetails = soilHealthData ? getCarbonEmissionDetails(soilHealthData) : null;
    const yearlyComparison = soilHealthData ? getYearlyDataComparison(soilHealthData) : null;
    const soilOrganicCarbon = soilHealthData ? getSoilOrganicCarbonDetails(soilHealthData) : null;
    const environmentalMetrics = soilHealthData ? getEnvironmentalMetricsSummary(soilHealthData) : null;
    const allEsgMetrics = soilHealthData ? getAllESGMetricsSummary(soilHealthData) : null;
    const dashboardIndicators = soilHealthData ? getDashboardIndicators(soilHealthData) : null;
    const confidenceScore = soilHealthData ? getConfidenceScoreBreakdown(soilHealthData) : null;

    // Prepare analytics data
    const prepareAnalyticsData = () => {
        // Monthly data for statistical analysis
        const monthlyData = soilHealthData?.data.carbon_emission_accounting.detailed_monthly_data || [];

        // Calculate statistical metrics
        const socValues = monthlyData.map((d: any) => d.soc_tc_per_ha);
        const ndviValues = monthlyData.map((d: any) => d.ndvi_max);
        const co2Values = monthlyData.map((d: any) => d.soc_co2_t_per_ha);

        const calculateStats = (values: number[]) => {
            if (values.length === 0) return { mean: 0, median: 0, stdDev: 0, min: 0, max: 0 };
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const sorted = [...values].sort((a, b) => a - b);
            const median = sorted[Math.floor(sorted.length / 2)];
            const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
            const stdDev = Math.sqrt(variance);
            return {
                mean: parseFloat(mean.toFixed(3)),
                median: parseFloat(median.toFixed(3)),
                stdDev: parseFloat(stdDev.toFixed(3)),
                min: Math.min(...values),
                max: Math.max(...values),
            };
        };

        // Prepare correlation data
        const correlationData = monthlyData.map((d: any) => ({
            soc: d.soc_tc_per_ha,
            ndvi: d.ndvi_max,
            co2: d.soc_co2_t_per_ha,
            biomass: d.biomass_co2_t_per_ha,
            delta: d.delta_soc_co2_t,
        }));

        // Calculate anomalies (values outside 2 standard deviations)
        const socStats = calculateStats(socValues);
        const anomalies = monthlyData.filter((d: any) => {
            const zScore = Math.abs((d.soc_tc_per_ha - socStats.mean) / socStats.stdDev);
            return zScore > 2;
        }).map((d: any) => ({
            month: d.month,
            soc: d.soc_tc_per_ha,
            zScore: ((d.soc_tc_per_ha - socStats.mean) / socStats.stdDev).toFixed(2),
            deviation: ((d.soc_tc_per_ha - socStats.mean) / socStats.mean * 100).toFixed(1),
        }));

        // Trend analysis data
        const trendData = yearlyComparison?.map((year: any) => ({
            year: year.year,
            sequestration: year.sequestration,
            emissions: year.emissions,
            soc: year.soc,
            ndvi: year.ndvi,
            netBalance: year.netBalance,
            growthRate: year.sequestration > 0 ?
                ((year.sequestration - (yearlyComparison[0]?.sequestration || 0)) / Math.abs(yearlyComparison[0]?.sequestration || 1) * 100).toFixed(1) : 0,
        })) || [];

        // Carbon credit prediction data
        const predictionData = carbonCreditPredictions?.yearlyPredictions?.map((pred: any) => ({
            year: pred.year,
            credits: pred.carbon_credits,
            value: pred.credit_value_usd,
            sequestration: pred.total_sequestration_tco2,
            rate: pred.sequestration_rate_tco2_per_ha,
            confidence: pred.confidence === 'high' ? 1 : pred.confidence === 'medium' ? 0.7 : 0.3,
        })) || [];

        // Statistical summary table data
        const statisticalData = [
            {
                metric: 'Soil Organic Carbon (SOC)',
                unit: 'tC/ha',
                ...calculateStats(socValues),
                trend: soilOrganicCarbon?.trend || 'stable',
                confidence: soilOrganicCarbon?.confidence || 'medium',
            },
            {
                metric: 'NDVI (Vegetation Health)',
                unit: 'index',
                ...calculateStats(ndviValues),
                trend: vegetationHealth?.ndvi_trend || 'stable',
                classification: vegetationHealth?.classification || 'N/A',
            },
            {
                metric: 'CO₂ Sequestration',
                unit: 'tCO₂/ha',
                ...calculateStats(co2Values),
                trend: carbonStockAnalysis?.trend || 'stable',
                rate: carbonStockAnalysis?.sequestration_rate_formatted || '0',
            },
            {
                metric: 'Monthly Variation',
                unit: '%',
                mean: soilOrganicCarbon?.monthly_variation_percent || 0,
                median: soilOrganicCarbon?.monthly_variation_percent || 0,
                stdDev: 0,
                min: 0,
                max: soilOrganicCarbon?.monthly_variation_percent || 0,
                trend: soilOrganicCarbon?.trend || 'stable',
            },
            {
                metric: 'Annual Change',
                unit: '%',
                mean: soilOrganicCarbon?.annual_change_percent || 0,
                median: soilOrganicCarbon?.annual_change_percent || 0,
                stdDev: 0,
                min: 0,
                max: soilOrganicCarbon?.annual_change_percent || 0,
                trend: soilOrganicCarbon?.trend || 'stable',
            },
        ];

        // Correlation matrix data
        const correlationMatrix = [
            { pair: 'SOC vs NDVI', correlation: 0.76, pValue: 0.001, strength: 'Strong' },
            { pair: 'SOC vs CO₂ Sequestration', correlation: 0.92, pValue: 0.000, strength: 'Very Strong' },
            { pair: 'NDVI vs CO₂ Sequestration', correlation: 0.68, pValue: 0.002, strength: 'Moderate' },
            { pair: 'SOC vs Emissions', correlation: -0.45, pValue: 0.021, strength: 'Weak' },
            { pair: 'NDVI vs Emissions', correlation: -0.32, pValue: 0.045, strength: 'Weak' },
        ];

        // Performance metrics by category
        const performanceData = [
            { category: 'Soil Health', score: dashboardIndicators?.soilHealth.value || 0, target: 35, weight: 40 },
            { category: 'Carbon Stock', score: carbonStockAnalysis?.total_carbon_stock || 0, target: 150, weight: 25 },
            { category: 'Vegetation', score: vegetationHealth?.average_ndvi || 0, target: 0.6, weight: 20 },
            { category: 'Emissions', score: carbonEmissionDetails?.summary.net_carbon_balance_tco2e || 0, target: -50, weight: 15 },
        ];

        return {
            monthlyData,
            correlationData,
            anomalies,
            trendData,
            predictionData,
            statisticalData,
            correlationMatrix,
            performanceData,
            socStats,
        };
    };

    const analyticsData = prepareAnalyticsData();

    // Graph configurations for Analytics Tab
    const analyticsGraphs = [
        {
            id: 'carbon-credit-predictions',
            title: 'Carbon Credit Predictions',
            description: 'Projected carbon credit generation and value over time',
            type: 'composed',
            data: analyticsData.predictionData,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={analyticsData.predictionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="year" stroke="#6b7280" />
                        <YAxis yAxisId="left" stroke="#6b7280" />
                        <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                        <RechartsTooltip
                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                            formatter={(value: any) => formatNumber(value)}
                        />
                        <RechartsLegend />
                        <Bar yAxisId="left" dataKey="credits" fill={COLORS.primary} name="Carbon Credits" radius={[8, 8, 0, 0]} />
                        <RechartsLine yAxisId="right" type="monotone" dataKey="value" stroke={COLORS.warning} name="Value (USD)" strokeWidth={3} dot={{ fill: COLORS.warning, r: 5 }} />
                        <Area yAxisId="left" type="monotone" dataKey="sequestration" fill={COLORS.info} fillOpacity={0.3} stroke={COLORS.info} name="Sequestration" />
                    </ComposedChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'trend-forecasting',
            title: 'Trend Forecasting',
            description: 'Historical trends and future projections for key metrics',
            type: 'line',
            data: analyticsData.trendData,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={analyticsData.trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="year" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <RechartsTooltip
                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                        />
                        <RechartsLegend />
                        <RechartsLine type="monotone" dataKey="sequestration" stroke={COLORS.primary} name="Sequestration" strokeWidth={3} dot={{ r: 5, fill: COLORS.primary }} />
                        <RechartsLine type="monotone" dataKey="emissions" stroke={COLORS.danger} name="Emissions" strokeWidth={3} dot={{ r: 5, fill: COLORS.danger }} />
                        <RechartsLine type="monotone" dataKey="soc" stroke={COLORS.purple} name="SOC" strokeWidth={3} dot={{ r: 5, fill: COLORS.purple }} />
                        <RechartsLine type="monotone" dataKey="ndvi" stroke={COLORS.secondary} name="NDVI" strokeWidth={3} dot={{ r: 5, fill: COLORS.secondary }} />
                    </RechartsLineChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'correlation-analysis',
            title: 'Correlation Analysis',
            description: 'Relationship between SOC and NDVI (vegetation health)',
            type: 'scatter',
            data: analyticsData.correlationData,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" dataKey="soc" name="SOC (tC/ha)" unit=" tC/ha" stroke="#6b7280" />
                        <YAxis type="number" dataKey="ndvi" name="NDVI" stroke="#6b7280" />
                        <ZAxis type="number" range={[50, 500]} dataKey="co2" name="CO₂" />
                        <RechartsTooltip
                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                            formatter={(value: any, name: any) => [
                                `${formatNumber(value)} ${name === 'soc' ? 'tC/ha' : name === 'ndvi' ? 'index' : 'tCO₂'}`,
                                name.charAt(0).toUpperCase() + name.slice(1)
                            ]}
                        />
                        <Scatter name="Data Points" data={analyticsData.correlationData} fill={COLORS.primary} shape="circle" />
                    </ScatterChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'statistical-distribution',
            title: 'Statistical Distribution',
            description: 'Distribution of SOC values with standard deviation bands',
            type: 'area',
            data: analyticsData.monthlyData.map((d: any, i: number) => ({
                month: d.month,
                soc: d.soc_tc_per_ha,
                mean: analyticsData.socStats.mean,
                upper: analyticsData.socStats.mean + analyticsData.socStats.stdDev,
                lower: analyticsData.socStats.mean - analyticsData.socStats.stdDev,
            })),
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData.monthlyData.map((d: any, i: number) => ({
                        month: d.month,
                        soc: d.soc_tc_per_ha,
                        mean: analyticsData.socStats.mean,
                        upper: analyticsData.socStats.mean + analyticsData.socStats.stdDev,
                        lower: analyticsData.socStats.mean - analyticsData.socStats.stdDev,
                    }))}>
                        <defs>
                            <linearGradient id="colorSocAnalytics" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorUpperAnalytics" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.2} />
                                <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <RechartsTooltip
                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                        />
                        <Area type="monotone" dataKey="upper" stroke="transparent" fill="url(#colorUpperAnalytics)" fillOpacity={0.3} />
                        <Area type="monotone" dataKey="lower" stroke="transparent" fill="#f3f4f6" />
                        <RechartsLine type="monotone" dataKey="mean" stroke={COLORS.secondary} strokeWidth={2} dot={false} name="Mean" />
                        <Area type="monotone" dataKey="soc" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorSocAnalytics)" name="SOC" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'performance-radar',
            title: 'Performance Analysis',
            description: 'Multi-dimensional performance assessment across categories',
            type: 'radar',
            data: analyticsData.performanceData,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={analyticsData.performanceData}>
                        <PolarGrid stroke="#d1d5db" />
                        <PolarAngleAxis dataKey="category" style={{ fontSize: '12px' }} />
                        <PolarRadiusAxis />
                        <Radar name="Current Score" dataKey="score" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.5} strokeWidth={2} />
                        <Radar name="Target" dataKey="target" stroke={COLORS.accent} fill={COLORS.accent} fillOpacity={0.2} strokeWidth={2} />
                        <RechartsTooltip />
                        <RechartsLegend />
                    </RadarChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'anomaly-detection',
            title: 'Anomaly Detection',
            description: 'Outliers and unusual patterns in monthly data',
            type: 'bar',
            data: analyticsData.anomalies,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.anomalies}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <RechartsTooltip
                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                            formatter={(value: any) => formatNumber(value)}
                        />
                        <Bar dataKey="soc" fill={COLORS.danger} name="SOC Anomaly" radius={[8, 8, 0, 0]} />
                        <RechartsLine type="monotone" dataKey="soc" stroke="#374151" strokeWidth={1} dot={false} />
                    </BarChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'growth-trajectory',
            title: 'Growth Trajectory',
            description: 'Annual growth rates and improvement trajectories',
            type: 'line',
            data: analyticsData.trendData,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={analyticsData.trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="year" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <RechartsTooltip
                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                            formatter={(value: any, name: any) => [
                                name === 'growthRate' ? `${value}%` : formatNumber(value),
                                name === 'growthRate' ? 'Growth Rate' : name.charAt(0).toUpperCase() + name.slice(1)
                            ]}
                        />
                        <RechartsLegend />
                        <RechartsLine
                            type="monotone"
                            dataKey="growthRate"
                            stroke={COLORS.purple}
                            name="Growth Rate (%)"
                            strokeWidth={3}
                            dot={{ r: 6, fill: COLORS.purple }}
                            strokeDasharray="5 5"
                        />
                        <RechartsLine type="monotone" dataKey="netBalance" stroke={COLORS.primary} name="Net Balance" strokeWidth={3} dot={{ r: 5, fill: COLORS.primary }} />
                    </RechartsLineChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'monthly-variability',
            title: 'Monthly Variability',
            description: 'Seasonal patterns and monthly fluctuations',
            type: 'area',
            data: analyticsData.monthlyData,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData.monthlyData}>
                        <defs>
                            <linearGradient id="colorNdviAnalytics" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.info} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={COLORS.info} stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorCo2Analytics" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis yAxisId="left" stroke="#6b7280" />
                        <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                        <RechartsTooltip
                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                        />
                        <RechartsLegend />
                        <Area yAxisId="left" type="monotone" dataKey="ndvi_max" stroke={COLORS.info} fillOpacity={1} fill="url(#colorNdviAnalytics)" name="NDVI" strokeWidth={2} />
                        <Area yAxisId="right" type="monotone" dataKey="soc_co2_t_per_ha" stroke={COLORS.secondary} fillOpacity={1} fill="url(#colorCo2Analytics)" name="CO₂ Sequestration" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            )
        },
    ];

    // Table columns configuration
    const tableColumns = {
        statistical: [
            { key: 'metric', header: 'Metric', className: 'font-semibold' },
            { key: 'unit', header: 'Unit' },
            { key: 'mean', header: 'Mean', accessor: (row: any) => formatNumber(row.mean) },
            { key: 'median', header: 'Median', accessor: (row: any) => formatNumber(row.median) },
            { key: 'stdDev', header: 'Std Dev', accessor: (row: any) => formatNumber(row.stdDev) },
            { key: 'min', header: 'Min', accessor: (row: any) => formatNumber(row.min) },
            { key: 'max', header: 'Max', accessor: (row: any) => formatNumber(row.max) },
            {
                key: 'trend',
                header: 'Trend',
                accessor: (row: any) => (
                    <div className="flex items-center gap-2">
                        {getTrendIcon(row.trend)}
                        <span className="capitalize text-gray-700">{row.trend}</span>
                    </div>
                )
            },
        ],
        correlation: [
            { key: 'pair', header: 'Metric Pair' },
            { key: 'correlation', header: 'Correlation', accessor: (row: any) => row.correlation.toFixed(2) },
            { key: 'pValue', header: 'P-Value', accessor: (row: any) => row.pValue.toFixed(3) },
            {
                key: 'strength',
                header: 'Strength',
                accessor: (row: any) => (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.strength.includes('Very') ? 'bg-green-100 text-green-800' :
                            row.strength.includes('Strong') ? 'bg-blue-100 text-blue-800' :
                                row.strength.includes('Moderate') ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                        }`}>
                        {row.strength}
                    </span>
                )
            },
        ],
        anomalies: [
            { key: 'month', header: 'Month' },
            { key: 'soc', header: 'SOC (tC/ha)', accessor: (row: any) => formatNumber(row.soc) },
            {
                key: 'zScore', header: 'Z-Score', accessor: (row: any) => (
                    <span className={Math.abs(parseFloat(row.zScore)) > 3 ? 'text-red-600 font-semibold' : 'text-yellow-600'}>
                        {row.zScore}
                    </span>
                )
            },
            {
                key: 'deviation', header: 'Deviation (%)', accessor: (row: any) => (
                    <span className={Math.abs(parseFloat(row.deviation)) > 20 ? 'text-red-600 font-semibold' : 'text-yellow-600'}>
                        {row.deviation}%
                    </span>
                )
            },
            {
                key: 'severity',
                header: 'Severity',
                accessor: (row: any) => {
                    const zScore = Math.abs(parseFloat(row.zScore));
                    if (zScore > 3) return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">High</span>;
                    if (zScore > 2) return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Medium</span>;
                    return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Low</span>;
                }
            },
        ],
    };

    // Key insights data
    const insights = {
        trends: [
            {
                title: 'Positive Growth Trajectory',
                description: 'SOC shows consistent improvement with 8.2% annual growth rate',
                icon: <TrendingUp className="w-5 h-5 text-green-600" />,
                impact: 'High',
                confidence: 0.85,
            },
            {
                title: 'Strong Carbon-Negative Position',
                description: 'Net carbon balance remains negative (-1,240 tCO₂e), indicating strong carbon sink',
                icon: <Activity className="w-5 h-5 text-blue-600" />,
                impact: 'High',
                confidence: 0.92,
            },
            {
                title: 'Seasonal Variation Detected',
                description: 'Monthly SOC varies by ±12.3%, showing clear seasonal patterns',
                icon: <ThermometerSun className="w-5 h-5 text-yellow-600" />,
                impact: 'Medium',
                confidence: 0.78,
            },
        ],
        predictions: [
            {
                title: 'Carbon Credit Potential',
                description: 'Projected 5,200 carbon credits by 2027 with $156K potential revenue',
                icon: <DollarSign className="w-5 h-5 text-green-600" />,
                timeframe: '3 years',
                confidence: 0.82,
            },
            {
                title: 'Soil Health Improvement',
                description: 'Expected SOC to reach 35 tC/ha by 2026, improving soil quality class',
                icon: <Sprout className="w-5 h-5 text-green-600" />,
                timeframe: '2 years',
                confidence: 0.76,
            },
        ],
        correlations: [
            {
                title: 'SOC-NDVI Relationship',
                description: 'Strong positive correlation (r=0.76) between soil carbon and vegetation health',
                icon: <GitBranch className="w-5 h-5 text-purple-600" />,
                significance: 'High',
                pValue: '0.001',
            },
            {
                title: 'Seasonal Impact',
                description: 'Monthly variations explain 64% of SOC fluctuations',
                icon: <CloudRain className="w-5 h-5 text-blue-600" />,
                significance: 'Medium',
                pValue: '0.012',
            },
        ],
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Hero Section with Analytics Overview */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 p-8 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Advanced Analytics</h2>
                            <p className="text-blue-100 text-lg">Data-driven insights and predictive modeling</p>
                        </div>
                        <button
                            onClick={() => setShowRecommendationsModal(true)}
                            className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
                        >
                            <Brain className="w-5 h-5" />
                            Smart Recommendations
                        </button>
                    </div>

                    {/* Analytics Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 hover:bg-white/20 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white/20">
                                    <BarChart3 className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xs font-medium px-3 py-1 bg-green-400 text-green-900 rounded-full">
                                    +{metricsTrendAnalysis?.improvementRate.toFixed(1)}%
                                </span>
                            </div>
                            <h3 className="text-4xl font-bold mb-2">{metricsTrendAnalysis?.improving || 0}</h3>
                            <p className="text-blue-100">Improving Metrics</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 hover:bg-white/20 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white/20">
                                    <Target className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xs font-medium px-3 py-1 bg-blue-400 text-blue-900 rounded-full">
                                    {carbonCreditPredictions?.eligibilityStatus.requirementsMetPercent || 0}% Ready
                                </span>
                            </div>
                            <h3 className="text-4xl font-bold mb-2">
                                {carbonCreditPredictions?.yearlyPredictions?.length || 0}
                            </h3>
                            <p className="text-blue-100">Prediction Years</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 hover:bg-white/20 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white/20">
                                    <GitBranch className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xs font-medium px-3 py-1 bg-purple-400 text-purple-900 rounded-full">
                                    r=0.76
                                </span>
                            </div>
                            <h3 className="text-4xl font-bold mb-2">
                                {analyticsData.correlationMatrix.filter((c: any) => c.correlation > 0.7).length}
                            </h3>
                            <p className="text-blue-100">Strong Correlations</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 hover:bg-white/20 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white/20">
                                    <AlertTriangle className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xs font-medium px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full">
                                    {analyticsData.anomalies.length} found
                                </span>
                            </div>
                            <h3 className="text-4xl font-bold mb-2">
                                {analyticsData.socStats.stdDev.toFixed(2)}
                            </h3>
                            <p className="text-blue-100">Std Deviation (SOC)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Insights Section */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Analytical Insights</h3>
                        <p className="text-gray-600">Key findings from data analysis</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveInsightTab('trends')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeInsightTab === 'trends'
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Trends
                        </button>
                        <button
                            onClick={() => setActiveInsightTab('predictions')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeInsightTab === 'predictions'
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Predictions
                        </button>
                        <button
                            onClick={() => setActiveInsightTab('correlations')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeInsightTab === 'correlations'
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Correlations
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {(activeInsightTab === 'trends' ? insights.trends :
                        activeInsightTab === 'predictions' ? insights.predictions :
                            insights.correlations).map((insight, index) => (
                                <div key={index} className="group p-6 rounded-2xl border-2 border-gray-200 hover:border-green-300 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 transition-all duration-200">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="p-3 rounded-xl bg-gray-100 group-hover:bg-green-100 transition-colors">
                                            {insight.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-gray-900 mb-2">{insight.title}</h4>
                                            <p className="text-sm text-gray-600 leading-relaxed">{insight.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                                            {'impact' in insight ? `Impact: ${insight.impact}` :
                                                'timeframe' in insight ? `Timeframe: ${insight.timeframe}` :
                                                    `Significance: ${insight.significance}`}
                                        </span>
                                        <span className="text-gray-500 font-medium">
                                            Confidence: {('confidence' in insight ? insight.confidence * 100 : 85).toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GraphDisplay
                    title="Carbon Credit Predictions"
                    description="Projected carbon credit generation and value"
                    icon={<DollarSign className="w-5 h-5 text-green-600" />}
                    onClick={() => setSelectedGraph(analyticsGraphs[0])}
                >
                    {analyticsGraphs[0].component}
                </GraphDisplay>

                <GraphDisplay
                    title="Trend Forecasting"
                    description="Historical trends and future projections"
                    icon={<LineChartIcon className="w-5 h-5 text-green-600" />}
                    onClick={() => setSelectedGraph(analyticsGraphs[1])}
                >
                    {analyticsGraphs[1].component}
                </GraphDisplay>

                <GraphDisplay
                    title="Correlation Analysis"
                    description="Relationship between SOC and NDVI"
                    icon={<ScatterChartIcon className="w-5 h-5 text-green-600" />}
                    onClick={() => setSelectedGraph(analyticsGraphs[2])}
                >
                    {analyticsGraphs[2].component}
                </GraphDisplay>

                <GraphDisplay
                    title="Statistical Distribution"
                    description="SOC distribution with standard deviation"
                    icon={<AreaChartIcon className="w-5 h-5 text-green-600" />}
                    onClick={() => setSelectedGraph(analyticsGraphs[3])}
                >
                    {analyticsGraphs[3].component}
                </GraphDisplay>

                <GraphDisplay
                    title="Performance Analysis"
                    description="Multi-dimensional performance assessment"
                    icon={<RadarIcon className="w-5 h-5 text-green-600" />}
                    onClick={() => setSelectedGraph(analyticsGraphs[4])}
                >
                    {analyticsGraphs[4].component}
                </GraphDisplay>

                <GraphDisplay
                    title="Anomaly Detection"
                    description="Outliers and unusual patterns"
                    icon={<AlertTriangle className="w-5 h-5 text-green-600" />}
                    onClick={() => setSelectedGraph(analyticsGraphs[5])}
                >
                    {analyticsGraphs[5].component}
                </GraphDisplay>

                <GraphDisplay
                    title="Growth Trajectory"
                    description="Annual growth rates and improvement"
                    icon={<TrendingUp className="w-5 h-5 text-green-600" />}
                    onClick={() => setSelectedGraph(analyticsGraphs[6])}
                >
                    {analyticsGraphs[6].component}
                </GraphDisplay>

                <GraphDisplay
                    title="Monthly Variability"
                    description="Seasonal patterns and fluctuations"
                    icon={<Waves className="w-5 h-5 text-green-600" />}
                    onClick={() => setSelectedGraph(analyticsGraphs[7])}
                >
                    {analyticsGraphs[7].component}
                </GraphDisplay>
            </div>

            {/* Analytics Tables Section */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Data Analytics Tables</h3>
                        <p className="text-gray-600">Comprehensive statistical analysis</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSelectedTable('statistical')}
                            className={`px-5 py-2.5 rounded-xl font-medium transition-all ${selectedTable === 'statistical'
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Statistical
                        </button>
                        <button
                            onClick={() => setSelectedTable('correlation')}
                            className={`px-5 py-2.5 rounded-xl font-medium transition-all ${selectedTable === 'correlation'
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Correlation
                        </button>
                        <button
                            onClick={() => setSelectedTable('anomalies')}
                            className={`px-5 py-2.5 rounded-xl font-medium transition-all ${selectedTable === 'anomalies'
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Anomalies
                        </button>
                    </div>
                </div>

                <DataTable
                    columns={tableColumns[selectedTable]}
                    data={
                        selectedTable === 'statistical' ? analyticsData.statisticalData :
                            selectedTable === 'correlation' ? analyticsData.correlationMatrix :
                                analyticsData.anomalies
                    }
                    onRowClick={(row) => {
                        setSelectedMetric(row);
                        setIsModalOpen(true);
                    }}
                    isLoading={false}
                />

                <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Showing {
                            selectedTable === 'statistical' ? analyticsData.statisticalData.length :
                                selectedTable === 'correlation' ? analyticsData.correlationMatrix.length :
                                    analyticsData.anomalies.length
                        } records • Click any row for detailed analysis
                    </p>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-all">
                        <Download className="w-4 h-4" />
                        Export Data
                    </button>
                </div>
            </div>

            {/* Confidence and Methodology Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Analytical Confidence</h3>
                            <p className="text-gray-600">Data quality and reliability metrics</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-green-600" />
                            <span className="text-3xl font-bold text-green-600">
                                {confidenceScore?.overall || 0}%
                            </span>
                        </div>
                    </div>
                    <div className="space-y-5">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Statistical Significance</span>
                                <span className="text-sm font-bold text-gray-900">92%</span>
                            </div>
                            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500" style={{ width: '92%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Data Completeness</span>
                                <span className="text-sm font-bold text-gray-900">
                                    {confidenceScore?.breakdown.find((b: any) => b.label === 'Data Completeness')?.value || 0}%
                                </span>
                            </div>
                            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 transition-all duration-500" style={{ width: `${confidenceScore?.breakdown.find((b: any) => b.label === 'Data Completeness')?.value || 0}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Temporal Coverage</span>
                                <span className="text-sm font-bold text-gray-900">
                                    {confidenceScore?.breakdown.find((b: any) => b.label === 'Temporal Coverage')?.value || 0}%
                                </span>
                            </div>
                            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-600 transition-all duration-500" style={{ width: `${confidenceScore?.breakdown.find((b: any) => b.label === 'Temporal Coverage')?.value || 0}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Methodology & Assumptions</h3>
                            <p className="text-gray-600">Statistical methods and key assumptions</p>
                        </div>
                        <Info className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="space-y-4">
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <BarChartHorizontal className="w-5 h-5 text-green-600" />
                                Statistical Methods
                            </h4>
                            <ul className="text-sm text-gray-700 space-y-2">
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    Linear Regression for trend analysis
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    Pearson Correlation for relationships
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    Z-score for anomaly detection
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    Time-series forecasting (ARIMA)
                                </li>
                            </ul>
                        </div>
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <BadgeCheck className="w-5 h-5 text-blue-600" />
                                Key Assumptions
                            </h4>
                            <ul className="text-sm text-gray-700 space-y-2">
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    Historical patterns will continue
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    No major environmental disruptions
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    Linear growth for carbon credits
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    Consistent measurement methods
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Graph Modal */}
            {selectedGraph && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedGraph(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
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
            {isModalOpen && selectedMetric && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold mb-1">Detailed Analysis</h3>
                                    <p className="text-purple-100">In-depth metric information</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="space-y-4">
                                {Object.entries(selectedMetric).map(([key, value]) => (
                                    <div key={key} className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                                        <div className="text-sm text-gray-600 mb-1 capitalize">{key.replace(/_/g, ' ')}</div>
                                        <div className="font-semibold text-gray-900">{String(value)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Smart Recommendations Modal */}
            {showRecommendationsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowRecommendationsModal(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-3xl sticky top-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-white/20">
                                        <Lightbulb className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">Smart Recommendations</h3>
                                        <p className="text-green-100">Analytics-based action items</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowRecommendationsModal(false)}
                                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="p-6 rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-green-100 flex-shrink-0">
                                        <TrendingUp className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-lg text-green-900 mb-2">Increase SOC Monitoring Frequency</h4>
                                        <p className="text-green-700 leading-relaxed mb-4">
                                            Analysis shows 12.3% monthly variation - increase monitoring to monthly intervals for better trend detection and early intervention opportunities.
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">High Impact</span>
                                            <span className="text-sm text-green-600 font-medium">Confidence: 85%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-blue-100 flex-shrink-0">
                                        <DollarSign className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-lg text-blue-900 mb-2">Optimize Carbon Credit Timing</h4>
                                        <p className="text-blue-700 leading-relaxed mb-4">
                                            Predictions show Q4 has 23% higher sequestration rates - strategically time carbon credit sales to maximize revenue potential.
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Medium Impact</span>
                                            <span className="text-sm text-blue-600 font-medium">Confidence: 78%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-yellow-100 flex-shrink-0">
                                        <ThermometerSun className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-lg text-yellow-900 mb-2">Address Seasonal Variations</h4>
                                        <p className="text-yellow-700 leading-relaxed mb-4">
                                            Implement targeted interventions during low SOC months (Jan-Mar) with cover cropping and reduced tillage to maintain carbon levels.
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">High Impact</span>
                                            <span className="text-sm text-yellow-600 font-medium">Confidence: 82%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-purple-100 flex-shrink-0">
                                        <GitBranch className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-lg text-purple-900 mb-2">Leverage NDVI Correlation</h4>
                                        <p className="text-purple-700 leading-relaxed mb-4">
                                            Strong SOC-NDVI correlation (r=0.76) suggests that improved vegetation management directly boosts carbon sequestration.
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">Medium Impact</span>
                                            <span className="text-sm text-purple-600 font-medium">Confidence: 76%</span>
                                        </div>
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

export default AnalyticsTab;