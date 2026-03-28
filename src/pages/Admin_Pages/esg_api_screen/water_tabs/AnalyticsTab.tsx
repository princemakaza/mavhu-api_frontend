import React, { useState } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Activity,
    Target,
    AlertTriangle,
    DollarSign,
    Info,
    Lightbulb,
    ShieldCheck,
    Droplet,
    Waves,
    CloudRain,
    Gauge,
    Factory,
    Shield,
    AlertCircle,
    X,
    Zap,
    Calculator,
    Sprout,
    TrendingUpDown,
} from "lucide-react";
import type {
    IrrigationWaterResponse,
} from '../../../../services/Admin_Service/esg_apis/water_risk_service';

// Enhanced Color Palette with Water Theme (same as before)
const COLORS = {
    primary: '#008000',
    primaryDark: '#006400',
    primaryLight: '#10B981',
    primaryPale: '#D1FAE5',
    accent: '#22C55E',
    accentBlue: '#0D9488',
    accentTeal: '#14B8A6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#0D9488',
    waterBlue: '#0EA5E9',
    waterDark: '#0369A1',
};

interface AnalyticsTabProps {
    waterData: IrrigationWaterResponse | null;
    formatNumber: (num: number) => string;
    formatCurrency: (num: number) => string;
    formatPercent: (num: number) => string;
    selectedYear: number | null;
    availableYears: number[];
    onMetricClick: (metric: any, modalType: string) => void;
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
    waterData,
    formatNumber,
    formatCurrency,
    formatPercent,
    selectedYear,
    onMetricClick,
}) => {
    const [activeInsightTab, setActiveInsightTab] = useState('trends');
    const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!waterData) {
        return (
            <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl">
                <div className="text-center max-w-md p-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                        <Droplet className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">No Water Analytics Data Available</h3>
                    <p className="text-gray-600 leading-relaxed">Select a company to view detailed water analytics and insights.</p>
                </div>
            </div>
        );
    }

    // --- Extract data from API response ---
    const company = waterData.data.company;
    const metadata = waterData.data.metadata;
    const waterRiskAnalysis = waterData.data.water_risk_analysis;
    const dataQuality = waterData.data.data_quality;
    const summary = waterData.data.summary;
    const environmentalMetrics = waterData.data.environmental_metrics;
    const irrigationEfficiencyData = waterData.data.existing_irrigation_efficiency_data;

    // Find the best irrigation record (with actual metrics)
    const activeIrrigationData =
        irrigationEfficiencyData.find(item => item?.is_active === true && item?.metrics?.length > 0) ||
        irrigationEfficiencyData.find(item => item?.metrics?.length > 0) ||
        irrigationEfficiencyData[0];

    const irrigationMetrics = activeIrrigationData?.metrics || [];

    // Helper to get metric value for a given year
    const findMetricValue = (metricName: string, year?: number | null): number | null => {
        if (!irrigationMetrics.length) return null;
        const metric = irrigationMetrics.find(m => m?.metric_name === metricName);
        if (!metric || !Array.isArray(metric.yearly_data) || metric.yearly_data.length === 0) return null;

        if (year) {
            const yearStr = year.toString();
            const yearData = metric.yearly_data.find(d => d.year === yearStr);
            return yearData?.value ?? null;
        }
        // fallback to latest
        const sorted = [...metric.yearly_data].sort((a, b) => parseInt(b.year) - parseInt(a.year));
        return sorted[0]?.value ?? null;
    };

    // Get values for selected year (or latest if not selected)
    const irrigationValue = findMetricValue("Total Irrigation Water (million ML)", selectedYear);
    const treatmentValue = findMetricValue("Water Treatment for Chiredzi (million ML)", selectedYear);
    const perHectare = findMetricValue("Water per Hectare (ML/ha)", selectedYear);
    const effluentValue = findMetricValue("Effluent Discharged (thousand ML)", selectedYear);

    // Values from water risk analysis
    const totalValue = waterRiskAnalysis?.total_water_usage ?? null;
    const savingsPotential = waterRiskAnalysis?.savings_potential ?? null;
    const shortageRisk = waterRiskAnalysis?.shortage_risk || { level: 'unknown', probability: 0, factors: [], mitigation: [] };
    const shortageLevel = shortageRisk.level;
    const shortageProbability = shortageRisk.probability;
    const mitigationStrategies = shortageRisk.mitigation || [];

    // Efficiency score (not directly available, we can compute a placeholder or use a metric)
    // For now, we'll use a dummy or we could compute as (target / actual) but no target.
    // We'll show '---' if not available.
    const efficiencyScore = null; // not provided

    // Cost savings (not available in API)
    const costSavings = null;



    // Helper function to get trend icon
    const getTrendIcon = (trend: string) => {
        const lowerTrend = trend?.toLowerCase() || '';
        if (lowerTrend.includes('increas') || lowerTrend.includes('improv')) {
            return <TrendingUp className="w-4 h-4 text-green-600" />;
        } else if (lowerTrend.includes('decreas') || lowerTrend.includes('declin')) {
            return <TrendingDown className="w-4 h-4 text-red-600" />;
        }
        return <TrendingUpDown className="w-4 h-4 text-gray-600" />;
    };

    // Key insights data (use real values)
    const insights = {
        trends: [
            {
                title: 'Water Usage Trend',
                description: `Total water usage is ${totalValue ? formatNumber(totalValue) : '---'} m³ with ${waterRiskAnalysis?.total_water_usage ? 'unknown' : '---'} trend`,
                icon: <Droplet className="w-5 h-5 text-green-600" />,
                impact: irrigationValue ? (irrigationValue > 180 ? 'High' : 'Medium') : 'Medium',
                confidence: dataQuality?.score ? dataQuality.score / 100 : 0.85,
            },
            {
                title: 'Irrigation Efficiency',
                description: efficiencyScore
                    ? `Water efficiency score is ${formatPercent(efficiencyScore)} indicating ${efficiencyScore > 80 ? 'excellent' : efficiencyScore > 60 ? 'good' : 'needs improvement'} performance`
                    : 'Efficiency score not available',
                icon: <Gauge className="w-5 h-5 text-green-600" />,
                impact: efficiencyScore && efficiencyScore < 60 ? 'High' : 'Medium',
                confidence: 0.78,
            },
            {
                title: 'Treatment Water Usage',
                description: `Treatment water usage is ${treatmentValue ? formatNumber(treatmentValue) : '---'} m³ with ${waterRiskAnalysis?.treatment_water?.trend || '---'} trend`,
                icon: <Waves className="w-5 h-5 text-green-600" />,
                impact: 'Medium',
                confidence: 0.82,
            },
        ],
        risks: [
            {
                title: 'Water Shortage Risk',
                description: shortageLevel !== 'unknown'
                    ? `Water shortage risk level is ${shortageLevel} with ${shortageProbability ? formatPercent(shortageProbability * 100) : '---'} probability`
                    : 'Water shortage risk assessment not available',
                icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
                priority: shortageLevel === 'high' || shortageLevel === 'critical' ? 'High' :
                    shortageLevel === 'medium' ? 'Medium' : 'Low',
                timeframe: 'Ongoing',
            },
            {
                title: 'Treatment Capacity',
                description: treatmentValue && irrigationValue
                    ? `Treatment water is ${((treatmentValue) / (irrigationValue + treatmentValue) * 100).toFixed(1)}% of total water usage`
                    : 'Treatment capacity data not available',
                icon: <Factory className="w-5 h-5 text-amber-600" />,
                priority: (treatmentValue && irrigationValue && (treatmentValue / (irrigationValue + treatmentValue)) > 0.3) ? 'Medium' : 'Low',
                timeframe: 'Monitor',
            },
        ],
        opportunities: [
            {
                title: 'Water Savings Potential',
                description: savingsPotential
                    ? `Potential to save ${formatNumber(savingsPotential)} m³ annually`
                    : 'Water savings potential not calculated',
                icon: <DollarSign className="w-5 h-5 text-green-600" />,
                value: savingsPotential && totalValue && savingsPotential > (totalValue * 0.1) ? 'High' : 'Medium',
                timeframe: '1-2 years',
            },
            {
                title: 'Efficiency Improvements',
                description: efficiencyScore && efficiencyScore < 80
                    ? `Improve efficiency from ${formatPercent(efficiencyScore)} to 85%+ target`
                    : (efficiencyScore ? 'Efficiency already at target levels' : 'Efficiency data not available'),
                icon: <Zap className="w-5 h-5 text-blue-600" />,
                value: efficiencyScore && efficiencyScore < 70 ? 'High' : 'Medium',
                timeframe: '6-12 months',
            },
        ],
    };

    // Water metrics analysis
    const waterMetricsData = [
        {
            title: 'Irrigation Water',
            value: irrigationValue,
            unit: 'million ML',
            trend: waterRiskAnalysis?.irrigation_water?.trend || '---',
            efficiency: efficiencyScore,
            icon: <Droplet className="w-6 h-6 text-green-600" />,
        },
        {
            title: 'Treatment Water',
            value: treatmentValue,
            unit: 'million ML',
            trend: waterRiskAnalysis?.treatment_water?.trend || '---',
            icon: <Waves className="w-6 h-6 text-blue-600" />,
        },
        {
            title: 'Total Water Usage',
            value: totalValue,
            unit: 'million ML',
            trend: waterRiskAnalysis?.total_water_usage ? 'unknown' : '---',
            per_hectare: perHectare,
            icon: <CloudRain className="w-6 h-6 text-teal-600" />,
        },
        {
            title: 'Water per Hectare',
            value: perHectare,
            unit: 'ML/ha',
            trend: '---',
            benchmark: null,
            icon: <Gauge className="w-6 h-6 text-emerald-600" />,
        },
    ];

    // Stakeholder metrics (not available, use zeros)
    const stakeholderData = [
        {
            title: 'Farmer Water Savings',
            value: 0,
            label: 'Potential Savings',
            icon: <Sprout className="w-6 h-6 text-green-600" />,
        },
        {
            title: 'Financial Impact',
            value: 0,
            label: 'Cost Savings',
            icon: <DollarSign className="w-6 h-6 text-blue-600" />,
        },
        {
            title: 'Revenue Opportunity',
            value: 0,
            label: 'Potential Revenue',
            icon: <Calculator className="w-6 h-6 text-purple-600" />,
        },
    ];

    // Water usage breakdown
    const waterBreakdown = [
        {
            type: 'Irrigation',
            value: irrigationValue || 0,
            percentage: totalValue && totalValue > 0 ? ((irrigationValue || 0) / totalValue) * 100 : 0,
        },
        {
            type: 'Treatment',
            value: treatmentValue || 0,
            percentage: totalValue && totalValue > 0 ? ((treatmentValue || 0) / totalValue) * 100 : 0,
        },
        {
            type: 'Other',
            value: totalValue && totalValue > 0 ? Math.max(0, totalValue - (irrigationValue || 0) - (treatmentValue || 0)) : 0,
            percentage: totalValue && totalValue > 0 ? (Math.max(0, totalValue - (irrigationValue || 0) - (treatmentValue || 0)) / totalValue) * 100 : 0,
        },
    ];

    // Simplified explanations (unchanged)
    const simpleExplanations = {
        'Irrigation Water': 'Water used for agricultural irrigation of crops',
        'Treatment Water': 'Water used in treatment processes including purification',
        'Water Efficiency': 'How effectively water is used in irrigation processes',
        'Shortage Risk': 'Probability and level of water scarcity risks',
        'Savings Potential': 'Potential water and cost savings from efficiency improvements',
        'Water Benchmark': 'Industry standard or target for water usage comparison',
    };

    return (
        <div className="space-y-8 pb-8">

            {/* Key Insights Section */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10 hover:shadow-2xl transition-shadow duration-300">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                            Water Insights
                        </h3>
                        <p className="text-gray-600 text-lg">What your water data is telling you</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <button
                            onClick={() => setActiveInsightTab('trends')}
                            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${activeInsightTab === 'trends'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200 scale-105'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Trends
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveInsightTab('risks')}
                            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${activeInsightTab === 'risks'
                                ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg shadow-red-200 scale-105'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Risks & Alerts
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveInsightTab('opportunities')}
                            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${activeInsightTab === 'opportunities'
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-200 scale-105'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                Opportunities
                            </div>
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(activeInsightTab === 'trends' ? insights.trends :
                        activeInsightTab === 'risks' ? insights.risks :
                            insights.opportunities).map((insight, index) => (
                                <div
                                    key={index}
                                    className="group p-7 rounded-3xl border-2 border-gray-200 hover:border-green-400 bg-gradient-to-br from-white to-gray-50 hover:from-green-50 hover:to-emerald-50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                                >
                                    <div className="flex items-start gap-4 mb-5">
                                        <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-green-100 group-hover:to-emerald-100 transition-all duration-300 group-hover:scale-110">
                                            {insight.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-green-700 transition-colors">
                                                {insight.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {insight.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                        <span className={`px-4 py-2 rounded-xl text-xs font-bold ${(insight.impact || insight.priority || insight.value) === 'High'
                                            ? 'bg-green-100 text-green-700'
                                            : (insight.impact || insight.priority || insight.value) === 'Medium'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {insight.impact || insight.priority || insight.value}
                                        </span>
                                        <span className="text-xs text-gray-500 font-semibold">
                                            {insight.timeframe || `${('confidence' in insight ? insight.confidence * 100 : 85).toFixed(0)}% confidence`}
                                        </span>
                                    </div>
                                </div>
                            ))}
                </div>
            </div>

            {/* Water Metrics Analysis */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                    Water Usage Analysis
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                    {waterMetricsData.map((metric, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-3xl border-2 border-gray-200 hover:border-green-400 bg-gradient-to-br from-white to-gray-50 hover:from-green-50 hover:to-emerald-50 transition-all duration-300 hover:shadow-xl cursor-pointer"
                            onClick={() => {
                                setSelectedMetric(metric);
                                setIsModalOpen(true);
                            }}
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                                    {metric.icon}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-lg text-gray-900 mb-2">{metric.title}</h4>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {metric.value ? formatNumber(metric.value) : '---'}
                                        <span className="text-lg text-gray-600"> {metric.unit}</span>
                                    </p>
                                    {'per_hectare' in metric && metric.per_hectare ? (
                                        <p className="text-sm text-gray-600 mt-2">
                                            Per hectare: {formatNumber(metric.per_hectare)} ML/ha
                                        </p>
                                    ) : null}
                                    {'benchmark' in metric && metric.benchmark ? (
                                        <p className="text-sm text-gray-600 mt-1">
                                            Benchmark: {formatNumber(metric.benchmark)} m³
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                                {getTrendIcon(metric.trend)}
                                <span className="text-sm font-semibold text-gray-700">{metric.trend || '---'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Water Usage Breakdown */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                    Water Usage Breakdown
                </h3>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {waterBreakdown.map((item, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-3xl border-2 border-gray-200 hover:border-green-400 bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:shadow-xl"
                        >
                            <p className="text-sm text-gray-600 mb-2 font-medium">{item.type} Water</p>
                            <p className="text-3xl font-bold text-gray-900 mb-2">
                                {item.value > 0 ? formatNumber(item.value) : '---'}
                            </p>
                            <p className="text-sm text-gray-600">{waterMetricsData[0]?.unit || 'million ML'}</p>
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm font-semibold text-gray-700">{item.percentage.toFixed(1)}% of total</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-6 rounded-3xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-2 font-medium">Water Savings Potential</p>
                            <p className="text-4xl font-bold text-green-700">
                                {savingsPotential ? formatNumber(savingsPotential) : '---'}
                                <span className="text-lg"> {waterMetricsData[0]?.unit || 'million ML'}</span>
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-2 font-medium">Cost Savings</p>
                            <p className="text-4xl font-bold text-green-600">
                                {costSavings ? formatCurrency(costSavings) : '---'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stakeholder Impact Metrics */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                    Stakeholder Impact
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                    {stakeholderData.map((metric, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-3xl border-2 border-gray-200 hover:border-green-400 bg-gradient-to-br from-white to-gray-50 hover:from-green-50 hover:to-emerald-50 transition-all duration-300 hover:shadow-xl"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                                    {metric.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900 mb-2">{metric.title}</h4>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {metric.value ? formatNumber(metric.value) : '---'}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">{metric.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 p-6 rounded-3xl bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        Water Risk Factors
                    </h4>
                    <div className="space-y-3">
                        {shortageRisk?.factors && shortageRisk.factors.length > 0 ? (
                            shortageRisk.factors.map((factor, index) => (
                                <div key={index} className="flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-700">{factor}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-700">No specific risk factors identified</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Simplified Explanations */}
            <div className="bg-gradient-to-br from-white to-green-50 rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 shadow-lg">
                        <Info className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900">In Simple Terms</h3>
                        <p className="text-gray-600 text-lg">Understanding water metrics made easy</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(simpleExplanations).map(([term, explanation], index) => (
                        <div
                            key={index}
                            className="group p-7 rounded-3xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 hover:border-green-400 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-4 rounded-2xl bg-white shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                                    <Droplet className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-green-700 transition-colors">
                                        {term}
                                    </h4>
                                    <p className="text-gray-700 leading-relaxed font-medium">{explanation}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Data Quality & Methodology */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <ShieldCheck className="w-7 h-7 text-green-600" />
                        Data Quality
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-gray-50">
                            <p className="text-sm text-gray-600 mb-2">Data Confidence</p>
                            <p className="text-xl font-bold text-gray-900">
                                {dataQuality?.score ? `${dataQuality.score}%` : '---'}
                            </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-gray-50">
                            <p className="text-sm text-gray-600 mb-2">Years Covered</p>
                            <p className="text-xl font-bold text-gray-900">
                                {activeIrrigationData?.data_period_start && activeIrrigationData?.data_period_end
                                    ? `${activeIrrigationData.data_period_start}–${activeIrrigationData.data_period_end}`
                                    : '---'}
                            </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-gray-50">
                            <p className="text-sm text-gray-600 mb-2">Current Year</p>
                            <p className="text-xl font-bold text-gray-900">
                                {metadata?.year || selectedYear || '---'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <Info className="w-7 h-7 text-blue-600" />
                        Methodology
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Water Usage Calculation</p>
                            <p className="text-sm text-gray-700">Sum of irrigation, treatment, and other water sources</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-green-50 border border-green-200">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Efficiency Calculation</p>
                            <p className="text-sm text-gray-700">Based on output vs water input ratio (if available)</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Risk Assessment</p>
                            <p className="text-sm text-gray-700">Based on water availability, quality, and regulatory factors</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metric Detail Modal */}
            {isModalOpen && selectedMetric && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-fadeIn" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full animate-slideUp" onClick={(e) => e.stopPropagation()}>
                        <div className="p-8 border-b-2 border-green-100 bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 text-white rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-3xl font-bold mb-2">Metric Details</h3>
                                    <p className="text-green-100 text-lg">{selectedMetric.title}</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-3 rounded-2xl bg-white/20 hover:bg-white/30 transition-all hover:scale-110"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-10">
                            <div className="space-y-5">
                                {Object.entries(selectedMetric).map(([key, value]) => {
                                    if (key === 'icon') return null;
                                    if (typeof value === 'object') return null;

                                    let displayValue = value;
                                    if (typeof value === 'number' && value > 0) {
                                        if (key.includes('value')) {
                                            displayValue = formatNumber(value);
                                        } else if (key === 'efficiency') {
                                            displayValue = `${value}%`;
                                        }
                                    } else if (value === 0 || value === '---' || value === null) {
                                        displayValue = '---';
                                    }

                                    return (
                                        <div key={key} className="p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                            <div className="text-sm text-gray-600 mb-2 capitalize font-semibold">
                                                {key.replace(/_/g, ' ')}
                                            </div>
                                            <div className="font-bold text-gray-900 text-lg">
                                                {displayValue}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recommendations Modal */}
            {showRecommendationsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-fadeIn" onClick={() => setShowRecommendationsModal(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-slideUp" onClick={(e) => e.stopPropagation()}>
                        <div className="p-8 border-b-2 border-green-100 bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 text-white rounded-t-3xl sticky top-0 z-10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-md">
                                        <Lightbulb className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-bold">Action Recommendations</h3>
                                        <p className="text-green-100 text-lg mt-1">Based on your water analytics</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowRecommendationsModal(false)}
                                    className="p-3 rounded-2xl bg-white/20 hover:bg-white/30 transition-all hover:scale-110"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-10 space-y-6">
                            {[
                                {
                                    title: 'Improve Irrigation Efficiency',
                                    description: efficiencyScore && efficiencyScore < 80
                                        ? `Increase efficiency from ${formatPercent(efficiencyScore)} to 85%+ target`
                                        : (efficiencyScore ? 'Maintain current efficiency levels' : 'Efficiency data not available'),
                                    impact: efficiencyScore && efficiencyScore < 70 ? 'High' : 'Medium',
                                    effort: 'Medium',
                                    timeframe: '6 months',
                                    icon: <Gauge className="w-6 h-6 text-green-600" />,
                                },
                                {
                                    title: 'Implement Water Savings Measures',
                                    description: savingsPotential
                                        ? `Implement measures to achieve ${formatNumber(savingsPotential)} m³ annual savings`
                                        : 'Conduct water audit to identify savings potential',
                                    impact: savingsPotential && totalValue && savingsPotential > (totalValue * 0.1) ? 'High' : 'Medium',
                                    effort: 'Medium',
                                    timeframe: '1 year',
                                    icon: <Droplet className="w-6 h-6 text-blue-600" />,
                                },
                                shortageLevel === 'high' || shortageLevel === 'critical' ? {
                                    title: 'Address Water Shortage Risk',
                                    description: `Implement mitigation strategies for ${shortageLevel} shortage risk`,
                                    impact: 'High',
                                    effort: 'High',
                                    timeframe: 'Immediate',
                                    icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
                                } : null,
                                {
                                    title: 'Optimize Treatment Processes',
                                    description: treatmentValue
                                        ? `Review and optimize treatment water usage of ${formatNumber(treatmentValue)} m³`
                                        : 'Evaluate treatment water requirements',
                                    impact: 'Medium',
                                    effort: 'Low',
                                    timeframe: '3 months',
                                    icon: <Waves className="w-6 h-6 text-teal-600" />,
                                },
                            ].filter(Boolean).map((recommendation, index) => (
                                recommendation && (
                                    <div key={index} className="group p-8 rounded-3xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-green-400 hover:shadow-2xl transition-all duration-300">
                                        <div className="flex items-start gap-6">
                                            <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 group-hover:scale-110 transition-transform">
                                                {recommendation.icon}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-xl text-gray-900 mb-3">{recommendation.title}</h4>
                                                <p className="text-gray-700 leading-relaxed mb-5 font-medium">{recommendation.description}</p>
                                                <div className="flex items-center gap-4 flex-wrap">
                                                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-xl text-sm font-bold">
                                                        Impact: {recommendation.impact}
                                                    </span>
                                                    <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-xl text-sm font-bold">
                                                        Effort: {recommendation.effort}
                                                    </span>
                                                    <span className="px-4 py-2 bg-amber-100 text-amber-800 rounded-xl text-sm font-bold">
                                                        Time: {recommendation.timeframe}
                                                    </span>
                                                </div>
                                            </div>
                                            <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all font-bold hover:scale-105 shadow-lg">
                                                Start
                                            </button>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default AnalyticsTab;