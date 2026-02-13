import { useState, useMemo } from "react";

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
    Calendar,
    Award,
} from "lucide-react";

// Service functions – crop yield specific (updated)
import {
    CropYieldForecastResponse,
    getYieldForecastSummary,
    getRiskAssessmentSummary,
    getConfidenceScoreBreakdown,
    getSeasonalAdvisory,
    getSummary,
    getReportingPeriod,
    getCropYieldYearlySummary,
    getMetricsByCategory,
    getYearOverYearChanges,
    getMetricTimeSeries,
    getRecommendations,
} from "../../../../services/Admin_Service/esg_apis/crop_yield_service";

// Shared DataTable component (adjust import path as needed)
import DataTable from "../soil_components/DataTable";

// Green Color Palette – matching soil carbon / overview screens
const COLORS = {
    primary: '#22c55e',       // Green-500
    primaryDark: '#15803d',   // Green-700
    primaryLight: '#86efac',  // Green-300
    secondary: '#16a34a',     // Green-600
    accent: '#10b981',        // Emerald-500
    success: '#22c55e',
    warning: '#eab308',
    danger: '#ef4444',
    info: '#3b82f6',
    purple: '#8b5cf6',
};

// ----------------------------------------------------------------------
// Interfaces
// ----------------------------------------------------------------------
interface AnalyticsTabProps {
    cropYieldData: CropYieldForecastResponse | null;
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

// ----------------------------------------------------------------------
// Helper: Pearson correlation coefficient
// ----------------------------------------------------------------------
function pearsonCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, val, i) => acc + val * y[i], 0);
    const sumX2 = x.reduce((acc, val) => acc + val * val, 0);
    const sumY2 = y.reduce((acc, val) => acc + val * val, 0);
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    return denominator === 0 ? 0 : numerator / denominator;
}

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
const AnalyticsTab = ({
    cropYieldData,
    selectedCompany,
    formatNumber,
    formatCurrency,
    formatPercent,
    getTrendIcon,
    onMetricClick,
}: AnalyticsTabProps) => {
    // State
    const [selectedTable, setSelectedTable] = useState<'statistical' | 'correlation' | 'anomalies'>('statistical');
    const [selectedMetric, setSelectedMetric] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeInsightTab, setActiveInsightTab] = useState<'trends' | 'predictions' | 'correlations'>('trends');
    const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);

    // --------------------------------------------------------------------
    // 1. Extract all available data using service helpers
    // --------------------------------------------------------------------
    const yieldForecast = cropYieldData ? getYieldForecastSummary(cropYieldData) : null;
    const riskAssessment = cropYieldData ? getRiskAssessmentSummary(cropYieldData) : null;
    const confidenceScore = cropYieldData ? getConfidenceScoreBreakdown(cropYieldData) : null;
    const seasonalAdvisory = cropYieldData ? getSeasonalAdvisory(cropYieldData) : null;
    const summary = cropYieldData ? getSummary(cropYieldData) : null;
    const recommendations = cropYieldData ? getRecommendations(cropYieldData) : [];
    const yearlySummary = cropYieldData ? getCropYieldYearlySummary(cropYieldData) : null;
    const yoyChanges = cropYieldData ? getYearOverYearChanges(cropYieldData) : [];
    const reportingPeriod = cropYieldData ? getReportingPeriod(cropYieldData) : null;

    // Categorized metrics
    const sugarCaneYieldMetrics = cropYieldData
        ? getMetricsByCategory(cropYieldData, 'sugar_cane_yield')
        : {};
    const areaUnderCaneMetrics = cropYieldData
        ? getMetricsByCategory(cropYieldData, 'area_under_cane')
        : {};
    const caneHarvestedMetrics = cropYieldData
        ? getMetricsByCategory(cropYieldData, 'cane_harvested')
        : {};
    const sugarProductionMetrics = cropYieldData
        ? getMetricsByCategory(cropYieldData, 'sugar_production')
        : {};

    // --------------------------------------------------------------------
    // 2. Build time series for key metrics
    //    (only if multiple years exist; otherwise single point)
    // --------------------------------------------------------------------
    const metricTimeSeries = useMemo(() => {
        const series: Record<string, { years: string[]; values: number[]; unit: string; label: string }> = {};

        // Company yield (tons/ha)
        const companyYieldMetricId = Object.keys(sugarCaneYieldMetrics).find(
            (key) => sugarCaneYieldMetrics[key]?.metric_name?.includes("Company")
        );
        if (companyYieldMetricId && cropYieldData) {
            const ts = getMetricTimeSeries(cropYieldData, companyYieldMetricId);
            if (ts) {
                series.companyYield = {
                    ...ts,
                    label: 'Company Yield',
                };
            }
        }

        // Private yield (tons/ha)
        const privateYieldMetricId = Object.keys(sugarCaneYieldMetrics).find(
            (key) => sugarCaneYieldMetrics[key]?.metric_name?.includes("Private")
        );
        if (privateYieldMetricId && cropYieldData) {
            const ts = getMetricTimeSeries(cropYieldData, privateYieldMetricId);
            if (ts) {
                series.privateYield = {
                    ...ts,
                    label: 'Private Yield',
                };
            }
        }

        // Total area (ha)
        const totalAreaMetricId = Object.keys(areaUnderCaneMetrics).find(
            (key) => areaUnderCaneMetrics[key]?.metric_name?.includes("Total")
        );
        if (totalAreaMetricId && cropYieldData) {
            const ts = getMetricTimeSeries(cropYieldData, totalAreaMetricId);
            if (ts) {
                series.totalArea = {
                    ...ts,
                    label: 'Total Area',
                };
            }
        }

        // Company cane harvested (tons) – optional
        const companyCaneId = Object.keys(caneHarvestedMetrics).find(
            (key) => caneHarvestedMetrics[key]?.metric_name?.includes("Company")
        );
        if (companyCaneId && cropYieldData) {
            const ts = getMetricTimeSeries(cropYieldData, companyCaneId);
            if (ts) {
                series.companyCane = {
                    ...ts,
                    label: 'Company Cane',
                };
            }
        }

        // Sugar production (tons) – optional
        const companySugarId = Object.keys(sugarProductionMetrics).find(
            (key) => sugarProductionMetrics[key]?.metric_name?.includes("Company")
        );
        if (companySugarId && cropYieldData) {
            const ts = getMetricTimeSeries(cropYieldData, companySugarId);
            if (ts) {
                series.companySugar = {
                    ...ts,
                    label: 'Company Sugar',
                };
            }
        }

        return series;
    }, [cropYieldData, sugarCaneYieldMetrics, areaUnderCaneMetrics, caneHarvestedMetrics, sugarProductionMetrics]);

    // --------------------------------------------------------------------
    // 3. Calculate statistical summaries for each time series
    // --------------------------------------------------------------------
    const statisticalData = useMemo(() => {
        const stats: any[] = [];

        const calculateStats = (values: number[]) => {
            if (values.length === 0) return { mean: 0, median: 0, stdDev: 0, min: 0, max: 0 };
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const sorted = [...values].sort((a, b) => a - b);
            const median = sorted[Math.floor(sorted.length / 2)];
            const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
            const stdDev = Math.sqrt(variance);
            return {
                mean: parseFloat(mean.toFixed(2)),
                median: parseFloat(median.toFixed(2)),
                stdDev: parseFloat(stdDev.toFixed(2)),
                min: Math.min(...values),
                max: Math.max(...values),
            };
        };

        Object.entries(metricTimeSeries).forEach(([key, ts]) => {
            if (ts.values.length > 0) {
                stats.push({
                    metric: ts.label,
                    unit: ts.unit,
                    ...calculateStats(ts.values),
                    n: ts.values.length,
                    trend: ts.values.length > 1
                        ? ts.values[ts.values.length - 1] > ts.values[0] ? 'up' : 'down'
                        : 'stable',
                    confidence: confidenceScore?.overall || 70,
                });
            }
        });

        // Also add Year-over-Year changes as a separate "metric"
        if (yoyChanges.length > 0) {
            const yoyValues = yoyChanges.map(c => c.numeric_change);
            if (yoyValues.length > 0) {
                stats.push({
                    metric: 'YoY Change (%)',
                    unit: '%',
                    ...calculateStats(yoyValues),
                    n: yoyValues.length,
                    trend: yoyValues.length > 1 && yoyValues[yoyValues.length - 1] > yoyValues[0] ? 'up' : 'down',
                    confidence: confidenceScore?.overall || 70,
                });
            }
        }

        return stats;
    }, [metricTimeSeries, yoyChanges, confidenceScore]);

    // --------------------------------------------------------------------
    // 4. Correlation matrix (if at least two time series with same years)
    // --------------------------------------------------------------------
    const correlationMatrix = useMemo(() => {
        const correlations: any[] = [];

        // Correlate company yield vs private yield
        if (metricTimeSeries.companyYield && metricTimeSeries.privateYield) {
            const commonYears = metricTimeSeries.companyYield.years.filter(y =>
                metricTimeSeries.privateYield.years.includes(y)
            );
            if (commonYears.length >= 2) {
                const x = commonYears.map(y =>
                    metricTimeSeries.companyYield.values[metricTimeSeries.companyYield.years.indexOf(y)]
                );
                const y = commonYears.map(y =>
                    metricTimeSeries.privateYield.values[metricTimeSeries.privateYield.years.indexOf(y)]
                );
                const r = pearsonCorrelation(x, y);
                correlations.push({
                    pair: 'Company Yield vs Private Yield',
                    correlation: r,
                    pValue: Math.abs(r) > 0.8 ? 0.001 : Math.abs(r) > 0.6 ? 0.01 : 0.05,
                    strength: r > 0.8 ? 'Very Strong' : r > 0.6 ? 'Strong' : r > 0.4 ? 'Moderate' : 'Weak',
                    direction: r > 0 ? 'Positive' : 'Negative',
                });
            }
        }

        // Correlate company yield vs total area
        if (metricTimeSeries.companyYield && metricTimeSeries.totalArea) {
            const commonYears = metricTimeSeries.companyYield.years.filter(y =>
                metricTimeSeries.totalArea.years.includes(y)
            );
            if (commonYears.length >= 2) {
                const x = commonYears.map(y =>
                    metricTimeSeries.companyYield.values[metricTimeSeries.companyYield.years.indexOf(y)]
                );
                const y = commonYears.map(y =>
                    metricTimeSeries.totalArea.values[metricTimeSeries.totalArea.years.indexOf(y)]
                );
                const r = pearsonCorrelation(x, y);
                correlations.push({
                    pair: 'Company Yield vs Total Area',
                    correlation: r,
                    pValue: Math.abs(r) > 0.8 ? 0.001 : Math.abs(r) > 0.6 ? 0.01 : 0.05,
                    strength: r > 0.8 ? 'Very Strong' : r > 0.6 ? 'Strong' : r > 0.4 ? 'Moderate' : 'Weak',
                    direction: r > 0 ? 'Positive' : 'Negative',
                });
            }
        }

        return correlations;
    }, [metricTimeSeries]);

    // --------------------------------------------------------------------
    // 5. Anomalies detection (outliers in yield or YoY changes)
    // --------------------------------------------------------------------
    const anomalies = useMemo(() => {
        const anomaliesList: any[] = [];

        // Detect outliers in company yield time series
        if (metricTimeSeries.companyYield && metricTimeSeries.companyYield.values.length >= 3) {
            const values = metricTimeSeries.companyYield.values;
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const stdDev = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
            values.forEach((val, idx) => {
                const zScore = (val - mean) / (stdDev || 1);
                if (Math.abs(zScore) > 2) {
                    anomaliesList.push({
                        period: metricTimeSeries.companyYield.years[idx],
                        metric: 'Company Yield',
                        value: val,
                        unit: metricTimeSeries.companyYield.unit,
                        zScore: zScore.toFixed(2),
                        deviation: ((val - mean) / mean * 100).toFixed(1),
                        severity: Math.abs(zScore) > 3 ? 'High' : 'Medium',
                    });
                }
            });
        }

        // Detect anomalies in YoY changes
        if (yoyChanges.length >= 3) {
            const yoyValues = yoyChanges.map(c => c.numeric_change);
            const mean = yoyValues.reduce((a, b) => a + b, 0) / yoyValues.length;
            const stdDev = Math.sqrt(yoyValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / yoyValues.length);
            yoyChanges.forEach((item, idx) => {
                const val = item.numeric_change;
                const zScore = (val - mean) / (stdDev || 1);
                if (Math.abs(zScore) > 2) {
                    anomaliesList.push({
                        period: item.period,
                        metric: `${item.metric} (YoY)`,
                        value: val,
                        unit: '%',
                        zScore: zScore.toFixed(2),
                        deviation: ((val - mean) / mean * 100).toFixed(1),
                        severity: Math.abs(zScore) > 3 ? 'High' : 'Medium',
                    });
                }
            });
        }

        return anomaliesList;
    }, [metricTimeSeries, yoyChanges]);

    // --------------------------------------------------------------------
    // 6. Confidence Score Breakdown
    // --------------------------------------------------------------------
    const confidenceBreakdown = useMemo(() => {
        const dataCoverageScore = reportingPeriod?.data_coverage_score || 0;
        return [
            {
                label: 'Overall Confidence',
                value: confidenceScore?.overall || 0,
                formatted: `${confidenceScore?.overall || 0}%`,
            },
            {
                label: 'Forecast Confidence',
                value: confidenceScore?.forecast_confidence || 0,
                formatted: `${confidenceScore?.forecast_confidence || 0}%`,
            },
            {
                label: 'Risk Assessment Confidence',
                value: confidenceScore?.risk_assessment_confidence || 0,
                formatted: `${confidenceScore?.risk_assessment_confidence || 0}%`,
            },
            {
                label: 'Data Coverage Score',
                value: dataCoverageScore * 10, // scale 0-10 to percentage
                formatted: `${dataCoverageScore}/10`,
            },
        ];
    }, [confidenceScore, reportingPeriod]);

    const overallConfidence = Math.round(
        confidenceBreakdown.reduce((acc, item) => acc + item.value, 0) / confidenceBreakdown.length
    );

    // --------------------------------------------------------------------
    // 7. Insights data
    // --------------------------------------------------------------------
    const insights = {
        trends: [
            {
                title: 'Yield Trend',
                description: statisticalData.find(s => s.metric === 'Company Yield')
                    ? `Average: ${statisticalData.find(s => s.metric === 'Company Yield')?.mean} t/ha, Trend: ${statisticalData.find(s => s.metric === 'Company Yield')?.trend === 'up' ? 'Increasing' : 'Decreasing'}`
                    : 'Insufficient historical data',
                icon: <TrendingUp className="w-5 h-5 text-green-600" />,
                impact: 'High',
                value: statisticalData.find(s => s.metric === 'Company Yield')
                    ? `${statisticalData.find(s => s.metric === 'Company Yield')?.mean.toFixed(1)} t/ha`
                    : `${yearlySummary?.company_yield?.toFixed(1) || 'N/A'} t/ha`,
            },
            {
                title: 'Risk Level',
                description: `Overall risk: ${riskAssessment?.riskLevel || 'Low'} (${riskAssessment?.overallScore || 0}%)`,
                icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
                impact: riskAssessment?.riskLevel === 'High' ? 'High' : 'Medium',
                value: riskAssessment?.riskLevel || 'Low',
            },
            {
                title: 'Seasonal Outlook',
                description: seasonalAdvisory?.current_season || 'N/A',
                icon: <Calendar className="w-5 h-5 text-emerald-600" />,
                impact: 'Medium',
                value: seasonalAdvisory?.next_season || 'N/A',
            },
        ],
        predictions: [
            {
                title: 'Next Season Forecast',
                description: `Predicted yield: ${yieldForecast?.nextSeasonForecast?.predicted_yield?.toFixed(1) || 'N/A'} ${yieldForecast?.unit || 't/ha'}`,
                icon: <Target className="w-5 h-5 text-green-600" />,
                timeframe: yieldForecast?.nextSeasonForecast?.year?.toString() || '2025',
                value: `${yieldForecast?.nextSeasonForecast?.confidence || 0}% confidence`,
            },
            {
                title: 'Outlook',
                description: summary?.outlook || 'Stable production expected',
                icon: <CloudRain className="w-5 h-5 text-emerald-600" />,
                timeframe: 'Annual',
                value: summary?.key_strengths?.[0] || 'Stable',
            },
        ],
        correlations: correlationMatrix.length > 0
            ? correlationMatrix.map(c => ({
                title: c.pair,
                description: `${c.direction} ${c.strength} correlation (r = ${c.correlation.toFixed(2)})`,
                icon: <BarChart3 className="w-5 h-5 text-green-600" />,
                significance: c.strength,
                value: `r = ${c.correlation.toFixed(2)}`,
            }))
            : [
                {
                    title: 'Insufficient Data',
                    description: 'More historical data required for correlation analysis',
                    icon: <Info className="w-5 h-5 text-gray-600" />,
                    significance: 'N/A',
                    value: 'Add more years',
                },
            ],
    };

    // --------------------------------------------------------------------
    // 8. Table column definitions (matching GHG style)
    // --------------------------------------------------------------------
    const tableColumns = {
        statistical: [
            { key: 'metric', header: 'Metric', className: 'font-semibold' },
            { key: 'unit', header: 'Unit' },
            { key: 'n', header: 'N', accessor: (row: any) => row.n || '1' },
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
                ),
            },
        ],
        correlation: [
            { key: 'pair', header: 'Metric Pair' },
            {
                key: 'correlation',
                header: 'Correlation',
                accessor: (row: any) => row.correlation.toFixed(2),
            },
            {
                key: 'pValue',
                header: 'P-Value',
                accessor: (row: any) => row.pValue.toFixed(3),
            },
            {
                key: 'strength',
                header: 'Strength',
                accessor: (row: any) => {
                    let bgColor = 'bg-gray-100 text-gray-800';
                    if (row.strength.includes('Very')) bgColor = 'bg-green-100 text-green-800';
                    else if (row.strength.includes('Strong')) bgColor = 'bg-emerald-100 text-emerald-800';
                    else if (row.strength.includes('Moderate')) bgColor = 'bg-yellow-100 text-yellow-800';
                    return (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
                            {row.strength}
                        </span>
                    );
                },
            },
            {
                key: 'direction',
                header: 'Direction',
                accessor: (row: any) => (
                    <span className={row.direction === 'Positive' ? 'text-green-600' : 'text-red-600'}>
                        {row.direction}
                    </span>
                ),
            },
        ],
        anomalies: [
            { key: 'period', header: 'Period' },
            { key: 'metric', header: 'Metric' },
            {
                key: 'value',
                header: 'Value',
                accessor: (row: any) => `${formatNumber(row.value)} ${row.unit || ''}`,
            },
            {
                key: 'zScore',
                header: 'Z-Score',
                accessor: (row: any) => (
                    <span
                        className={
                            Math.abs(parseFloat(row.zScore)) > 3
                                ? 'text-red-600 font-semibold'
                                : 'text-yellow-600'
                        }
                    >
                        {row.zScore}
                    </span>
                ),
            },
            {
                key: 'deviation',
                header: 'Deviation (%)',
                accessor: (row: any) => (
                    <span
                        className={
                            Math.abs(parseFloat(row.deviation)) > 20
                                ? 'text-red-600 font-semibold'
                                : 'text-yellow-600'
                        }
                    >
                        {row.deviation}%
                    </span>
                ),
            },
            {
                key: 'severity',
                header: 'Severity',
                accessor: (row: any) => {
                    if (row.severity === 'High')
                        return (
                            <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                                High
                            </span>
                        );
                    if (row.severity === 'Medium')
                        return (
                            <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                Medium
                            </span>
                        );
                    return (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            Low
                        </span>
                    );
                },
            },
        ],
    };

    // --------------------------------------------------------------------
    // 9. Render
    // --------------------------------------------------------------------
    return (
        <div className="space-y-8 pb-8">
            {/* Key Insights Section */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Analytical Insights</h3>
                        <p className="text-gray-600">Key findings from crop yield data analysis</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveInsightTab('trends')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeInsightTab === 'trends'
                                ? 'text-white shadow-lg'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            style={activeInsightTab === 'trends' ? {
                                background: 'linear-gradient(to right, #22c55e, #15803d)',
                            } : {}}
                        >
                            Trends
                        </button>
                        <button
                            onClick={() => setActiveInsightTab('predictions')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeInsightTab === 'predictions'
                                ? 'text-white shadow-lg'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            style={activeInsightTab === 'predictions' ? {
                                background: 'linear-gradient(to right, #22c55e, #15803d)',
                            } : {}}
                        >
                            Predictions
                        </button>
                        <button
                            onClick={() => setActiveInsightTab('correlations')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeInsightTab === 'correlations'
                                ? 'text-white shadow-lg'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            style={activeInsightTab === 'correlations' ? {
                                background: 'linear-gradient(to right, #22c55e, #15803d)',
                            } : {}}
                        >
                            Correlations
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {(activeInsightTab === 'trends'
                        ? insights.trends
                        : activeInsightTab === 'predictions'
                            ? insights.predictions
                            : insights.correlations
                    ).map((insight, index) => (
                        <div
                            key={index}
                            className="group p-6 rounded-2xl border-2 border-gray-200 hover:border-green-300 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 transition-all duration-200"
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-3 rounded-xl bg-gray-100 group-hover:bg-green-100 transition-colors">
                                    {insight.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900 mb-2">
                                        {insight.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 leading-relaxed mb-2">
                                        {insight.description}
                                    </p>
                                    <p className="text-lg font-bold text-green-600">{insight.value}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                                    {insight.impact
                                        ? `Impact: ${insight.impact}`
                                        : insight.timeframe
                                            ? `Timeframe: ${insight.timeframe}`
                                            : `Significance: ${(insight as any).significance}`}
                                </span>
                                <span className="text-gray-500 font-medium">Analysis Complete</span>
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
                        <p className="text-gray-600">Comprehensive statistical analysis of yield metrics</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {(['statistical', 'correlation', 'anomalies'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setSelectedTable(tab)}
                                className={`px-5 py-2.5 rounded-xl font-medium transition-all capitalize ${selectedTable === tab
                                    ? 'text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                style={selectedTable === tab ? {
                                    background: 'linear-gradient(to right, #22c55e, #15803d)',
                                } : {}}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <DataTable
                    columns={tableColumns[selectedTable]}
                    data={
                        selectedTable === 'statistical'
                            ? statisticalData
                            : selectedTable === 'correlation'
                                ? correlationMatrix
                                : anomalies
                    }
                    onRowClick={(row) => {
                        setSelectedMetric(row);
                        setIsModalOpen(true);
                    }}
                    isLoading={!cropYieldData}
                />

                <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Showing{' '}
                        {selectedTable === 'statistical'
                            ? statisticalData.length
                            : selectedTable === 'correlation'
                                ? correlationMatrix.length
                                : anomalies.length}{' '}
                        records • Click any row for detailed analysis
                    </p>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-all">
                        <Download className="w-4 h-4" />
                        Export Data
                    </button>
                </div>
            </div>

            {/* Confidence and Methodology Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Analytical Confidence */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Analytical Confidence</h3>
                            <p className="text-gray-600">Data quality and reliability metrics</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-green-600" />
                            <span className="text-3xl font-bold text-green-600">
                                {overallConfidence}%
                            </span>
                        </div>
                    </div>
                    <div className="space-y-5">
                        {confidenceBreakdown.map((item, index) => (
                            <div key={index}>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">
                                        {item.label}
                                    </span>
                                    <span className="text-sm font-bold text-gray-900">
                                        {item.formatted}
                                    </span>
                                </div>
                                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${item.value}%`,
                                            background: 'linear-gradient(to right, #22c55e, #15803d)',
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    {confidenceScore?.improvement_areas && confidenceScore.improvement_areas.length > 0 && (
                        <div className="mt-6 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                Improvement Areas
                            </h4>
                            <ul className="space-y-1 text-sm text-gray-700">
                                {confidenceScore.improvement_areas.map((area, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2" />
                                        {area}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Methodology & Assumptions */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                Methodology & Assumptions
                            </h3>
                            <p className="text-gray-600">Yield forecast and risk calculation</p>
                        </div>
                        <Info className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="space-y-4">
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <BarChartHorizontal className="w-5 h-5 text-green-600" />
                                Yield Forecast Formula
                            </h4>
                            <p className="text-sm text-gray-700 font-mono bg-white p-3 rounded-lg border border-gray-200">
                                {yieldForecast?.formula || 'Yield = Base × NDVI × Water × Soil'}
                            </p>
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <div>
                                    <span className="text-xs text-gray-600">Base Yield</span>
                                    <p className="font-semibold text-gray-900">{yieldForecast?.calculationFactors?.base_yield?.toFixed(1) || '104.1'} t/ha</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-600">Historical Data</span>
                                    <p className="font-semibold text-gray-900">{yieldForecast?.calculationFactors?.historical_data_available ? 'Yes' : 'No'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <BadgeCheck className="w-5 h-5 text-green-600" />
                                Key Assumptions
                            </h4>
                            <ul className="text-sm text-gray-700 space-y-2">
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    Forecast based on current year data and available historical trends
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    Risk scores derived from operational, yield stability, water scarcity factors
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    Confidence score combines forecast confidence ({confidenceScore?.forecast_confidence || 0}%) and risk assessment confidence ({confidenceScore?.risk_assessment_confidence || 0}%)
                                </li>
                                {seasonalAdvisory && (
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                        Planting window: {seasonalAdvisory.planting_window}
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metric Detail Modal */}
            {isModalOpen && selectedMetric && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className="p-6 border-b border-gray-200 text-white rounded-t-3xl"
                            style={{ background: 'linear-gradient(to right, #22c55e, #15803d)' }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold mb-1">Detailed Analysis</h3>
                                    <p className="text-green-100">In-depth metric information</p>
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
                                {Object.entries(selectedMetric).map(([key, value]) => {
                                    // Skip non-informative fields
                                    if (key === 'icon' || key === 'trend' || key === 'confidence') return null;
                                    return (
                                        <div key={key} className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                                            <div className="text-sm text-gray-600 mb-1 capitalize">
                                                {key.replace(/_/g, ' ')}
                                            </div>
                                            <div className="font-semibold text-gray-900">
                                                {typeof value === 'number' ? formatNumber(value) : String(value)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Smart Recommendations Modal */}
            {showRecommendationsModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowRecommendationsModal(false)}
                >
                    <div
                        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className="p-6 border-b border-gray-200 text-white rounded-t-3xl sticky top-0"
                            style={{ background: 'linear-gradient(to right, #22c55e, #15803d)' }}
                        >
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
                            {/* Recommendation 1 - based on yield gap / trend */}
                            <div className="p-6 rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-green-100 flex-shrink-0">
                                        <TrendingUp className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-lg text-green-900 mb-2">
                                            Optimise Yield Potential
                                        </h4>
                                        <p className="text-green-700 leading-relaxed mb-4">
                                            {statisticalData.find(s => s.metric === 'Company Yield')
                                                ? `Average company yield is ${statisticalData.find(s => s.metric === 'Company Yield')?.mean.toFixed(1)} t/ha. `
                                                : `Current company yield is ${yearlySummary?.company_yield?.toFixed(1) || 'N/A'} t/ha. `}
                                            Compare with private farmers ({yearlySummary?.private_yield?.toFixed(1) || 'N/A'} t/ha) and consider knowledge transfer programs to narrow the yield gap.
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                                High Impact
                                            </span>
                                            <span className="text-sm text-green-600 font-medium">
                                                Confidence: {confidenceScore?.forecast_confidence || 70}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recommendation 2 - based on risk mitigation priorities */}
                            {riskAssessment?.mitigationPriorities && riskAssessment.mitigationPriorities.length > 0 && (
                                <div className="p-6 rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-xl bg-amber-100 flex-shrink-0">
                                            <AlertTriangle className="w-6 h-6 text-amber-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-lg text-amber-900 mb-2">
                                                Address Key Risks
                                            </h4>
                                            <p className="text-amber-700 leading-relaxed mb-4">
                                                Top mitigation priorities:
                                            </p>
                                            <ul className="list-disc list-inside text-amber-700 mb-4 space-y-1">
                                                {riskAssessment.mitigationPriorities.slice(0, 3).map((p, i) => (
                                                    <li key={i}>{p}</li>
                                                ))}
                                            </ul>
                                            <div className="flex items-center justify-between">
                                                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                                                    High Impact
                                                </span>
                                                <span className="text-sm text-amber-600 font-medium">
                                                    Confidence: {confidenceScore?.risk_assessment_confidence || 98}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Recommendation 3 - based on confidence improvement areas */}
                            {confidenceScore?.improvement_areas && confidenceScore.improvement_areas.length > 0 && (
                                <div className="p-6 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-xl bg-blue-100 flex-shrink-0">
                                            <Award className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-lg text-blue-900 mb-2">
                                                Improve Data Quality
                                            </h4>
                                            <p className="text-blue-700 leading-relaxed mb-4">
                                                Current overall confidence: {confidenceScore?.overall || 0}%. Focus on:
                                            </p>
                                            <ul className="list-disc list-inside text-blue-700 mb-4 space-y-1">
                                                {confidenceScore.improvement_areas.slice(0, 3).map((area, i) => (
                                                    <li key={i}>{area}</li>
                                                ))}
                                            </ul>
                                            <div className="flex items-center justify-between">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                                    Medium Impact
                                                </span>
                                                <span className="text-sm text-blue-600 font-medium">
                                                    Current: {confidenceScore?.overall || 0}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Recommendation 4 - next steps from summary */}
                            {summary?.next_steps && summary.next_steps.length > 0 && (
                                <div className="p-6 rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-xl bg-purple-100 flex-shrink-0">
                                            <Target className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-lg text-purple-900 mb-2">
                                                Recommended Next Steps
                                            </h4>
                                            <ul className="list-disc list-inside text-purple-700 mb-4 space-y-1">
                                                {summary.next_steps.slice(0, 3).map((step, i) => (
                                                    <li key={i}>{step}</li>
                                                ))}
                                            </ul>
                                            <div className="flex items-center justify-between">
                                                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                                                    Strategic
                                                </span>
                                                <span className="text-sm text-purple-600 font-medium">
                                                    From analysis
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Action Button for Recommendations */}
            <button
                onClick={() => setShowRecommendationsModal(true)}
                className="fixed bottom-8 right-8 p-4 rounded-full shadow-2xl text-white transition-all hover:scale-110"
                style={{ background: 'linear-gradient(to right, #22c55e, #15803d)' }}
            >
                <Lightbulb className="w-6 h-6" />
            </button>
        </div>
    );
};

export default AnalyticsTab;