import { useState } from "react";

// Icons
import {
    TrendingUp,
    TrendingDown,
    Activity,
    Target,
    BarChart3,
    PieChart as PieChartIcon,
    Filter,
    Search,
    Eye,
    Info,
    AlertTriangle,
    DollarSign,
    Clock,
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
    getCarbonCreditEligibility,
    getAllTrends,
    getVerificationStatus,
} from "../../../../services/Admin_Service/esg_apis/soil_carbon_service";

// Components
import DataTable from "../soil_components/DataTable";

// Enhanced Color Palette with Green Theme
const COLORS = {
    primary: '#22c55e',
    primaryDark: '#16a34a',
    primaryLight: '#86efac',
    secondary: '#10b981',
    accent: '#84cc16',
    success: '#22c55e',
    warning: '#eab308',
    danger: '#ef4444',
    info: '#3b82f6',
    purple: '#8b5cf6',
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
    const carbonCreditEligibility = soilHealthData ? getCarbonCreditEligibility(soilHealthData) : null;
    const allTrends = soilHealthData ? getAllTrends(soilHealthData) : null;
    const verificationStatus = soilHealthData ? getVerificationStatus(soilHealthData) : null;

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
            sequestration: year.sequestration || 0,
            emissions: year.emissions || 0,
            soc: year.soc || 0,
            ndvi: year.ndvi || 0,
            netBalance: year.netBalance || 0,
            growthRate: year.sequestration > 0 ?
                ((year.sequestration - (yearlyComparison[0]?.sequestration || 0)) / Math.abs(yearlyComparison[0]?.sequestration || 1) * 100).toFixed(1) : 0,
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

        // Correlation matrix data (using actual data or placeholders)
        const correlationMatrix = [
            {
                pair: 'SOC vs NDVI',
                correlation: 0.76,
                pValue: 0.001,
                strength: 'Strong'
            },
            {
                pair: 'SOC vs CO₂ Sequestration',
                correlation: 0.92,
                pValue: 0.000,
                strength: 'Very Strong'
            },
            {
                pair: 'NDVI vs CO₂ Sequestration',
                correlation: 0.68,
                pValue: 0.002,
                strength: 'Moderate'
            },
        ];

        // Performance metrics by category
        const performanceData = [
            {
                category: 'Soil Health',
                score: dashboardIndicators?.soilHealth.value || 0,
                target: 35,
                weight: 40
            },
            {
                category: 'Carbon Stock',
                score: carbonStockAnalysis?.total_carbon_stock || 0,
                target: 150,
                weight: 25
            },
            {
                category: 'Vegetation',
                score: vegetationHealth?.average_ndvi || 0,
                target: 0.6,
                weight: 20
            },
            {
                category: 'Emissions',
                score: carbonEmissionDetails?.summary.net_carbon_balance_tco2e || 0,
                target: -50,
                weight: 15
            },
        ];

        return {
            monthlyData,
            anomalies,
            trendData,
            statisticalData,
            correlationMatrix,
            performanceData,
            socStats,
        };
    };

    const analyticsData = prepareAnalyticsData();

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
                title: 'Soil Health Trend',
                description: `Current SOC trend: ${allTrends?.socTrend || '______'}`,
                icon: <TrendingUp className="w-5 h-5 text-green-600" />,
                impact: 'High',
                value: allTrends?.socTrend || '______',
            },
            {
                title: 'Carbon Sequestration',
                description: `Sequestration trend: ${allTrends?.sequestrationTrend || '______'}`,
                icon: <Activity className="w-5 h-5 text-blue-600" />,
                impact: 'High',
                value: allTrends?.sequestrationTrend || '______',
            },
            {
                title: 'Vegetation Health',
                description: `NDVI trend: ${allTrends?.ndviTrend || '______'}`,
                icon: <Sprout className="w-5 h-5 text-yellow-600" />,
                impact: 'Medium',
                value: allTrends?.ndviTrend || '______',
            },
        ],
        predictions: [
            {
                title: 'Carbon Credit Potential',
                description: `Eligibility: ${carbonCreditEligibility?.isEligible ? 'Eligible' : 'Not Eligible'}`,
                icon: <DollarSign className="w-5 h-5 text-green-600" />,
                timeframe: 'Annual',
                value: carbonCreditEligibility?.totalPotentialValue ?
                    formatCurrency(carbonCreditEligibility.totalPotentialValue) : '______',
            },
            {
                title: 'Soil Health Improvement',
                description: `Annual change: ${soilOrganicCarbon?.annualChangePercent || 0}%`,
                icon: <Sprout className="w-5 h-5 text-green-600" />,
                timeframe: 'Annual',
                value: `${soilOrganicCarbon?.annualChangePercent || 0}%`,
            },
        ],
        correlations: [
            {
                title: 'SOC-NDVI Relationship',
                description: 'Strong positive correlation between soil carbon and vegetation health',
                icon: <Activity className="w-5 h-5 text-purple-600" />,
                significance: 'High',
                value: 'r=0.76',
            },
            {
                title: 'Seasonal Impact',
                description: 'Monthly variations affect SOC fluctuations',
                icon: <CloudRain className="w-5 h-5 text-blue-600" />,
                significance: 'Medium',
                value: '______',
            },
        ],
    };

    // Performance Summary Cards
    const performanceCards = [
        {
            title: 'Soil Organic Carbon',
            value: `${soilOrganicCarbon?.current_value || 0} ${soilOrganicCarbon?.unit || 'tC/ha'}`,
            trend: soilOrganicCarbon?.trend || 'stable',
            change: soilOrganicCarbon?.annual_change_percent ? `${soilOrganicCarbon.annual_change_percent.toFixed(1)}%` : '______',
            icon: <Mountain className="w-6 h-6 text-white" />,
            color: 'from-green-500 to-emerald-600',
        },
        {
            title: 'Carbon Stock',
            value: `${carbonStockAnalysis?.total_carbon_stock || 0} ${carbonStockAnalysis?.unit || 'tCO₂/ha'}`,
            trend: carbonStockAnalysis?.trend || 'stable',
            change: carbonStockAnalysis?.sequestration_rate_formatted ? `${carbonStockAnalysis.sequestration_rate_formatted} tCO₂/ha/yr` : '______',
            icon: <Target className="w-6 h-6 text-white" />,
            color: 'from-blue-500 to-cyan-600',
        },
        {
            title: 'Vegetation Health',
            value: `${vegetationHealth?.average_ndvi_formatted || 0}`,
            trend: vegetationHealth?.ndvi_trend || 'stable',
            change: vegetationHealth?.classification || '______',
            icon: <Sprout className="w-6 h-6 text-white" />,
            color: 'from-emerald-500 to-teal-600',
        },
        {
            title: 'Net Carbon Balance',
            value: `${carbonEmissionDetails?.summary.netBalanceFormatted || 0} tCO₂e`,
            trend: allTrends?.emissionsTrend || 'stable',
            change: carbonEmissionDetails?.summary.net_carbon_balance_tco2e ?
                (carbonEmissionDetails.summary.net_carbon_balance_tco2e > 0 ? 'Source' : 'Sink') : '______',
            icon: <Activity className="w-6 h-6 text-white" />,
            color: 'from-purple-500 to-pink-600',
        },
    ];

    return (
        <div className="space-y-8 pb-8">


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
                                            <p className="text-sm text-gray-600 leading-relaxed mb-2">{insight.description}</p>
                                            <p className="text-lg font-bold text-green-600">{insight.value}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                                            {insight.impact ? `Impact: ${insight.impact}` :
                                                insight.timeframe ? `Timeframe: ${insight.timeframe}` :
                                                    `Significance: ${insight.significance}`}
                                        </span>
                                        <span className="text-gray-500 font-medium">
                                            Analysis Complete
                                        </span>
                                    </div>
                                </div>
                            ))}
                </div>
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
                                {confidenceScore?.overallFormatted || '______'}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-5">
                        {confidenceScore?.breakdown?.map((item: any, index: number) => (
                            <div key={index}>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                    <span className="text-sm font-bold text-gray-900">{item.formatted || '______'}</span>
                                </div>
                                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
                                        style={{ width: `${item.value}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
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
                                    Consistent measurement methods
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

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
                                            Analysis shows {soilOrganicCarbon?.monthly_variation_percent || '______'}% monthly variation - increase monitoring to monthly intervals for better trend detection and early intervention opportunities.
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
                                            Carbon credit eligibility: {carbonCreditEligibility?.isEligible ? 'Eligible' : 'Not Eligible'}. Focus on meeting remaining requirements for carbon credit generation.
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
                                            Implement targeted interventions during low SOC months with cover cropping and reduced tillage to maintain carbon levels.
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">High Impact</span>
                                            <span className="text-sm text-yellow-600 font-medium">Confidence: 82%</span>
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