import React, { useState, useMemo } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Target,
    AlertTriangle,
    Info,
    Lightbulb,
    ShieldCheck,
    Leaf,
    Zap,
    Shield,
    X,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    Factory,
    Sun,
    Battery,
    Thermometer,
    Cloud,
    Recycle,
    Wind,
    BarChart3,
    Settings,
} from "lucide-react";
import type { EnergyConsumptionResponse } from '../../../../services/Admin_Service/esg_apis/energy_consumption_service';
import {
    getEnergyConsumptionSummary,
    getDetailedEnergyMetrics,
    getEnergyMixData,
    getGridOperationsData,
    getEnergyTrends,
    getEnergyKPIs,
    getEnergyCompanyInfo,
} from '../../../../services/Admin_Service/esg_apis/energy_consumption_service';

// Enhanced Color Palette with Green Theme
const COLORS = {
    primary: '#008000',
    primaryDark: '#006400',
    primaryLight: '#10B981',
    primaryPale: '#D1FAE5',
    accent: '#22C55E',
    accentGold: '#F59E0B',
    success: '#10B981',
    warning: '#FBBF24',
    danger: '#EF4444',
    info: '#3B82F6',
};

interface EnergyAnalyticsTabProps {
    energyData: EnergyConsumptionResponse | null;
    formatNumber: (num: number) => string;
    formatPercent: (num: number) => string;
    selectedYear: number | null;
    availableYears: number[];
    onMetricClick: (metric: any, modalType: string) => void;
}

const EnergyAnalyticsTab: React.FC<EnergyAnalyticsTabProps> = ({
    energyData,
    formatNumber,
    formatPercent,
}) => {
    const [activeInsightTab, setActiveInsightTab] = useState('trends');
    const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Extract data using service helpers
    const data = energyData?.data;
    const summary = useMemo(() => data ? getEnergyConsumptionSummary(data) : null, [data]);
    const detailedMetrics = useMemo(() => data ? getDetailedEnergyMetrics(data) : null, [data]);
    const energyMix = useMemo(() => data ? getEnergyMixData(data) : null, [data]);
    const gridOps = useMemo(() => data ? getGridOperationsData(data) : null, [data]);
    const trends = useMemo(() => data ? getEnergyTrends(data) : null, [data]);
    const kpis = useMemo(() => data ? getEnergyKPIs(data) : null, [data]);
    const companyInfo = useMemo(() => data ? getEnergyCompanyInfo(data) : null, [data]);

    if (!data || !summary || !energyMix || !gridOps || !trends || !kpis) {
        return (
            <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl">
                <div className="text-center max-w-md p-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                        <Zap className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">No Energy Analytics Data Available</h3>
                    <p className="text-gray-600 leading-relaxed">Select a company to view detailed energy consumption analytics and insights.</p>
                </div>
            </div>
        );
    }

    // Helper function to get trend icon
    const getTrendIcon = (trend: string) => {
        const lowerTrend = trend?.toLowerCase() || '';
        if (lowerTrend.includes('increas') || lowerTrend.includes('improv') || lowerTrend.includes('grow')) {
            return <TrendingUp className="w-4 h-4 text-green-600" />;
        } else if (lowerTrend.includes('decreas') || lowerTrend.includes('declin') || lowerTrend.includes('reduc')) {
            return <TrendingDown className="w-4 h-4 text-red-600" />;
        }
        return <ChevronRight className="w-4 h-4 text-gray-600" />;
    };

    // Calculate derived metrics
    const renewablePercentage = parseFloat(energyMix.renewable_sources.percentage) || 0;
    const fossilPercentage = parseFloat(energyMix.fossil_sources.percentage) || 0;
    const totalEnergyGJ = parseFloat(energyMix.total_energy_gj) || 0;
    const renewableEnergyGJ = parseFloat(energyMix.renewable_sources.generation_gj) || 0;
    const fossilEnergyGJ = parseFloat(energyMix.fossil_sources.consumption_gj) || 0;
    const gridSelfSufficiency = gridOps.grid_self_sufficiency_percentage || 0;
    const electricityGenerated = parseFloat(gridOps.electricity_generated_mwh) || 0;
    const electricityPurchased = parseFloat(gridOps.electricity_purchased_mwh) || 0;

    // Carbon data from API (if available)
    const netCarbonEmissions = data.carbon_emissions?.emissions?.totals?.net_total_emission_tco2e || 0;
    const carbonIntensity = parseFloat(kpis.carbon_intensity_tco2e_per_gj as any) || 0; // string to number

    // Key insights data
    const insights = {
        trends: [
            {
                title: 'Renewable Energy Adoption',
                description: `Renewable energy accounts for ${renewablePercentage.toFixed(1)}% of total energy consumption`,
                icon: <Sun className="w-5 h-5 text-green-600" />,
                impact: renewablePercentage > 30 ? 'High' : renewablePercentage > 15 ? 'Medium' : 'Low',
                confidence: 0.92,
            },
            {
                title: 'Grid Self-Sufficiency',
                description: `Company achieves ${gridSelfSufficiency.toFixed(1)}% self-sufficiency in electricity`,
                icon: <Battery className="w-5 h-5 text-blue-600" />,
                impact: gridSelfSufficiency > 50 ? 'High' : gridSelfSufficiency > 20 ? 'Medium' : 'Low',
                confidence: 0.88,
            },
            {
                title: 'Energy Efficiency Trend',
                description: `Energy efficiency shows ${trends.energy_efficiency.toLowerCase()} trend`,
                icon: <Zap className="w-5 h-5 text-amber-600" />,
                impact: 'Medium',
                confidence: 0.75,
            },
        ],
        risks: [
            {
                title: 'Fossil Fuel Dependency',
                description: `Fossil fuels still make up ${fossilPercentage.toFixed(1)}% of energy mix`,
                icon: <Factory className="w-5 h-5 text-red-600" />,
                priority: fossilPercentage > 70 ? 'High' : fossilPercentage > 40 ? 'Medium' : 'Low',
                timeframe: 'Immediate',
            },
            {
                title: 'Grid Dependency Risk',
                description: `Company purchases ${electricityPurchased.toLocaleString()} MWh from grid`,
                icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
                priority: parseFloat(gridOps.grid_dependency) > 50 ? 'High' : parseFloat(gridOps.grid_dependency) > 20 ? 'Medium' : 'Low',
                timeframe: 'Monitor',
            },
            {
                title: 'Carbon Intensity',
                description: `Carbon intensity: ${carbonIntensity.toFixed(2)} tCO₂e per GJ`,
                icon: <Cloud className="w-5 h-5 text-gray-600" />,
                priority: carbonIntensity > 0.07 ? 'High' : carbonIntensity > 0.03 ? 'Medium' : 'Low', // example thresholds
                timeframe: 'Strategic',
            },
        ],
        opportunities: [
            {
                title: 'Solar Expansion',
                description: `Solar contributes ${energyMix.renewable_sources.breakdown.solar}% of renewable energy - potential for expansion`,
                icon: <Sun className="w-5 h-5 text-yellow-600" />,
                value: parseFloat(energyMix.renewable_sources.breakdown.solar) < 50 ? 'High' : 'Medium',
                timeframe: '6-12 months',
            },
            {
                title: 'Bagasse Optimization',
                description: `Bagasse accounts for ${energyMix.renewable_sources.breakdown.bagasse}% of renewable energy`,
                icon: <Leaf className="w-5 h-5 text-green-600" />,
                value: 'Medium',
                timeframe: '1-2 years',
            },
            {
                title: 'Energy Efficiency Programs',
                description: `Potential savings through equipment upgrades and process optimization`,
                icon: <Zap className="w-5 h-5 text-blue-600" />,
                value: 'High',
                timeframe: '3-6 months',
            },
        ],
    };

    // Energy metrics analysis
    const energyMetricsData = [
        {
            title: 'Total Energy Consumption',
            value: totalEnergyGJ,
            unit: 'GJ',
            trend: trends.energy_efficiency,
            icon: <Zap className="w-6 h-6 text-green-600" />,
        },
        {
            title: 'Renewable Energy',
            value: renewableEnergyGJ,
            unit: 'GJ',
            trend: trends.renewable_energy_adoption,
            percentage: renewablePercentage,
            icon: <Sun className="w-6 h-6 text-yellow-600" />,
        },
        {
            title: 'Fossil Energy',
            value: fossilEnergyGJ,
            unit: 'GJ',
            trend: 'Monitor',
            percentage: fossilPercentage,
            icon: <Factory className="w-6 h-6 text-red-600" />,
        },
        {
            title: 'Electricity Generated',
            value: electricityGenerated,
            unit: 'MWh',
            trend: 'Stable',
            selfSufficiency: gridSelfSufficiency,
            icon: <Battery className="w-6 h-6 text-blue-600" />,
        },
    ];

    // Energy source breakdown
    const renewableBreakdown = [
        {
            source: 'Bagasse',
            percentage: parseFloat(energyMix.renewable_sources.breakdown.bagasse),
            value: renewableEnergyGJ * (parseFloat(energyMix.renewable_sources.breakdown.bagasse) / 100),
            icon: <Leaf className="w-4 h-4 text-green-600" />,
        },
        {
            source: 'Solar',
            percentage: parseFloat(energyMix.renewable_sources.breakdown.solar),
            value: renewableEnergyGJ * (parseFloat(energyMix.renewable_sources.breakdown.solar) / 100),
            icon: <Sun className="w-4 h-4 text-yellow-600" />,
        },
        {
            source: 'Other Renewables',
            percentage: parseFloat(energyMix.renewable_sources.breakdown.other_renewables),
            value: renewableEnergyGJ * (parseFloat(energyMix.renewable_sources.breakdown.other_renewables) / 100),
            icon: <Wind className="w-4 h-4 text-cyan-600" />,
        },
    ];

    const fossilBreakdown = [
        {
            source: 'Coal',
            percentage: parseFloat(energyMix.fossil_sources.breakdown.coal),
            value: fossilEnergyGJ * (parseFloat(energyMix.fossil_sources.breakdown.coal) / 100),
            icon: <Thermometer className="w-4 h-4 text-gray-600" />,
        },
        {
            source: 'Diesel',
            percentage: parseFloat(energyMix.fossil_sources.breakdown.diesel),
            value: fossilEnergyGJ * (parseFloat(energyMix.fossil_sources.breakdown.diesel) / 100),
            icon: <Factory className="w-4 h-4 text-orange-600" />,
        },
        {
            source: 'Other Fossil',
            percentage: parseFloat(energyMix.fossil_sources.breakdown.other_fossil),
            value: fossilEnergyGJ * (parseFloat(energyMix.fossil_sources.breakdown.other_fossil) / 100),
            icon: <Cloud className="w-4 h-4 text-red-600" />,
        },
    ];

    // Grid operations metrics
    const gridOperationsData = [
        {
            title: 'Electricity Generated',
            value: electricityGenerated,
            unit: 'MWh',
            icon: <Battery className="w-5 h-5 text-green-600" />,
        },
        {
            title: 'Electricity Purchased',
            value: electricityPurchased,
            unit: 'MWh',
            icon: <Zap className="w-5 h-5 text-blue-600" />,
        },
        {
            title: 'Electricity Exported',
            value: parseFloat(gridOps.electricity_exported_mwh) || 0,
            unit: 'MWh',
            icon: <ArrowUpRight className="w-5 h-5 text-emerald-600" />,
        },
        {
            title: 'Net Grid Import',
            value: parseFloat(gridOps.net_grid_import_mwh) || 0,
            unit: 'MWh',
            icon: <ArrowDownRight className="w-5 h-5 text-purple-600" />,
        },
    ];

    // Performance indicators
    const performanceIndicators = [
        {
            title: 'Energy Intensity',
            value: kpis.energy_intensity,
            unit: 'GJ', // unit might be per something, but we'll keep as is
            trend: trends.energy_efficiency,
            icon: <BarChart3 className="w-5 h-5 text-amber-600" />,
        },
        {
            title: 'Renewable Share',
            value: renewablePercentage,
            unit: '%',
            trend: trends.renewable_energy_adoption,
            icon: <Leaf className="w-5 h-5 text-green-600" />,
        },
        {
            title: 'Grid Independence',
            value: gridSelfSufficiency,
            unit: '%',
            trend: gridSelfSufficiency > 50 ? 'Increasing' : 'Stable',
            icon: <Shield className="w-5 h-5 text-blue-600" />,
        },
        {
            title: 'Carbon Emissions',
            value: netCarbonEmissions,
            unit: 'tCO₂e',
            trend: 'Stable', // could derive from trends if available
            icon: <Recycle className="w-5 h-5 text-emerald-600" />,
        },
    ];

    // Simplified explanations for energy terms
    const simpleExplanations = {
        'Renewable Energy': 'Energy from sources that naturally replenish, like solar, wind, and biomass',
        'Fossil Fuels': 'Energy from finite resources like coal, oil, and natural gas',
        'Grid Self-Sufficiency': 'Percentage of electricity needs met by self-generation vs grid purchase',
        'Carbon Intensity': 'Amount of carbon emissions per unit of energy produced',
        'Energy Efficiency': 'Using less energy to perform the same task or produce the same output',
        'Net Grid Import': 'Difference between electricity purchased from and exported to the grid',
    };

    return (
        <div className="space-y-8 pb-8">

            {/* Key Insights Section */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10 hover:shadow-2xl transition-shadow duration-300">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                            Energy Insights & Analytics
                        </h3>
                        <p className="text-gray-600 text-lg">Deep analysis of your energy consumption patterns</p>
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
                                                : 'bg-amber-100 text-amber-700'
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

            {/* Energy Metrics Analysis */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                    Energy Consumption Analysis
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                    {energyMetricsData.map((metric, index) => (
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
                                        {formatNumber(metric.value)} <span className="text-lg text-gray-600">{metric.unit}</span>
                                    </p>
                                    {'percentage' in metric && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            Percentage: {metric.percentage.toFixed(1)}%
                                        </p>
                                    )}
                                    {'selfSufficiency' in metric && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            Self-sufficiency: {metric.selfSufficiency.toFixed(1)}%
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                                {getTrendIcon(metric.trend)}
                                <span className="text-sm font-semibold text-gray-700">{metric.trend}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Energy Source Breakdown */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Renewable Breakdown */}
                    <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Leaf className="w-5 h-5 text-green-600" />
                            Renewable Energy Breakdown
                        </h4>
                        <div className="space-y-4">
                            {renewableBreakdown.map((source, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {source.icon}
                                            <span className="font-semibold text-gray-900">{source.source}</span>
                                        </div>
                                        <span className="font-bold text-gray-900">{source.percentage.toFixed(1)}%</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {formatNumber(source.value)} GJ
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Fossil Breakdown */}
                    <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Factory className="w-5 h-5 text-red-600" />
                            Fossil Fuel Breakdown
                        </h4>
                        <div className="space-y-4">
                            {fossilBreakdown.map((source, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-red-50 to-orange-50"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {source.icon}
                                            <span className="font-semibold text-gray-900">{source.source}</span>
                                        </div>
                                        <span className="font-bold text-gray-900">{source.percentage.toFixed(1)}%</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {formatNumber(source.value)} GJ
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid Operations Analysis */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                    Grid Operations Analysis
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {gridOperationsData.map((operation, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-3xl border-2 border-gray-200 hover:border-blue-400 bg-gradient-to-br from-white to-gray-50 hover:from-blue-50 hover:to-cyan-50 transition-all duration-300 hover:shadow-xl"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                                    {operation.icon}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">{operation.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatNumber(operation.value)} <span className="text-lg">{operation.unit}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-2 font-medium">Grid Self-Sufficiency</p>
                            <p className="text-4xl font-bold text-blue-700">
                                {gridSelfSufficiency.toFixed(1)}<span className="text-lg">%</span>
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-2 font-medium">Grid Dependency</p>
                            <p className="text-4xl font-bold text-blue-600">
                                {gridOps.grid_dependency}<span className="text-lg">%</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Indicators */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                    Energy Performance Indicators
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {performanceIndicators.map((indicator, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-3xl border-2 border-gray-200 hover:border-green-400 bg-gradient-to-br from-white to-gray-50 hover:from-green-50 hover:to-emerald-50 transition-all duration-300 hover:shadow-xl"
                        >
                            <div className="flex items-start gap-3 mb-4">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                                    {indicator.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900 mb-2">{indicator.title}</h4>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {typeof indicator.value === 'number' ? indicator.value.toFixed(2) : indicator.value}
                                        <span className="text-lg text-gray-600"> {indicator.unit}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                                {getTrendIcon(indicator.trend)}
                                <span className="text-sm font-semibold text-gray-700">{indicator.trend}</span>
                            </div>
                        </div>
                    ))}
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
                        <p className="text-gray-600 text-lg">Understanding energy metrics made easy</p>
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
                                    <Zap className="w-6 h-6 text-green-600" />
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
                            <p className="text-sm text-gray-600 mb-2">Reporting Year</p>
                            <p className="text-xl font-bold text-gray-900">{data.reporting_period.year}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-gray-50">
                            <p className="text-sm text-gray-600 mb-2">Metrics Tracked</p>
                            <p className="text-xl font-bold text-gray-900">{summary.metricsCount} metrics</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-gray-50">
                            <p className="text-sm text-gray-600 mb-2">Data Completeness</p>
                            <p className="text-xl font-bold text-gray-900">{data.data_quality.completeness_score}%</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <Settings className="w-7 h-7 text-blue-600" />
                        Calculation Methodology
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-green-50 border border-green-200">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Renewable Percentage</p>
                            <p className="text-sm text-gray-700">(Renewable Energy GJ / Total Energy GJ) × 100</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Grid Self-Sufficiency</p>
                            <p className="text-sm text-gray-700">(Electricity Generated / Total Electricity Used) × 100</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Carbon Intensity</p>
                            <p className="text-sm text-gray-700">From API calculation (based on fuel consumption)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary & Recommendations */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border-2 border-green-200 shadow-xl p-10">
                <div className="flex items-start gap-6">
                    <div className="p-5 rounded-3xl bg-white shadow-lg">
                        <Lightbulb className="w-12 h-12 text-green-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Key Summary & Insight</h3>
                        <p className="text-gray-700 text-lg mb-4">{data.summary.message}</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowRecommendationsModal(true)}
                                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all font-bold hover:scale-105 shadow-lg"
                            >
                                View Recommendations
                            </button>
                            <button className="px-6 py-3 bg-white border-2 border-green-500 text-green-600 rounded-2xl hover:bg-green-50 transition-all font-bold hover:scale-105 shadow-md">
                                Download Report
                            </button>
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
                                    return (
                                        <div key={key} className="p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                            <div className="text-sm text-gray-600 mb-2 capitalize font-semibold">{key.replace(/_/g, ' ')}</div>
                                            <div className="font-bold text-gray-900 text-lg">
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
                                        <p className="text-green-100 text-lg mt-1">Based on your energy analytics</p>
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
                                    title: 'Increase Solar Capacity',
                                    description: `Solar currently contributes ${energyMix.renewable_sources.breakdown.solar}% of renewable energy. Consider adding rooftop solar panels or solar farms.`,
                                    impact: 'High',
                                    effort: 'Medium',
                                    timeframe: '6-12 months',
                                    icon: <Sun className="w-6 h-6 text-yellow-600" />,
                                },
                                {
                                    title: 'Optimize Bagasse Usage',
                                    description: `Bagasse contributes ${energyMix.renewable_sources.breakdown.bagasse}% of renewable energy. Explore optimization of biomass boiler efficiency.`,
                                    impact: 'Medium',
                                    effort: 'Low',
                                    timeframe: '3-6 months',
                                    icon: <Leaf className="w-6 h-6 text-green-600" />,
                                },
                                fossilPercentage > 30 && {
                                    title: 'Reduce Fossil Fuel Dependency',
                                    description: `Fossil fuels account for ${fossilPercentage.toFixed(1)}% of energy mix. Develop a phase-out strategy and explore alternative energy sources.`,
                                    impact: 'High',
                                    effort: 'High',
                                    timeframe: '1-2 years',
                                    icon: <Factory className="w-6 h-6 text-red-600" />,
                                },
                                gridSelfSufficiency < 50 && {
                                    title: 'Improve Grid Independence',
                                    description: `Grid self-sufficiency is ${gridSelfSufficiency.toFixed(1)}%. Invest in on-site generation capacity and energy storage solutions.`,
                                    impact: 'Medium',
                                    effort: 'Medium',
                                    timeframe: '1 year',
                                    icon: <Battery className="w-6 h-6 text-blue-600" />,
                                },
                                {
                                    title: 'Implement Energy Monitoring',
                                    description: 'Install real-time energy monitoring systems to identify waste and optimize consumption patterns.',
                                    impact: 'Medium',
                                    effort: 'Low',
                                    timeframe: '3 months',
                                    icon: <Zap className="w-6 h-6 text-amber-600" />,
                                },
                                netCarbonEmissions > 1000 && {
                                    title: 'Carbon Reduction Program',
                                    description: `Total carbon emissions: ${netCarbonEmissions.toFixed(0)} tCO₂e. Develop and implement carbon reduction initiatives.`,
                                    impact: 'High',
                                    effort: 'High',
                                    timeframe: '2 years',
                                    icon: <Recycle className="w-6 h-6 text-emerald-600" />,
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

export default EnergyAnalyticsTab;