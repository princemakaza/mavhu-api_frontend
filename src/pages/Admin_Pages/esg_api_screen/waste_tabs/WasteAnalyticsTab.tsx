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
    Trash2,
    DollarSign,
    Package,
    Flame,
    AlertCircle,
    Clock,
    Cpu,
    Archive,
} from "lucide-react";

// Enhanced Color Palette with Green Theme (same as EnergyAnalyticsTab)
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

interface WasteAnalyticsTabProps {
    wasteData: any;
    selectedCompany: any;
    formatNumber: (num: number | null) => string;
    formatCurrency: (num: number | null) => string;
    formatPercent: (num: number | null) => string;
    getTrendIcon: (trend: string) => React.ReactNode;
    selectedYear: number | null;
    availableYears: number[];
    onMetricClick: (metric: any, modalType: string) => void;
    onCalculationClick: (calculationType: string, data?: any) => void;
    summaryMetrics?: any;
}

const WasteAnalyticsTab: React.FC<WasteAnalyticsTabProps> = ({
    wasteData,
    selectedCompany,
    formatNumber,
    formatCurrency,
    formatPercent,
    getTrendIcon,
    onMetricClick,
    onCalculationClick,
    summaryMetrics,
}) => {
    const [activeInsightTab, setActiveInsightTab] = useState('trends');
    const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!wasteData) {
        return (
            <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl">
                <div className="text-center max-w-md p-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                        <Trash2 className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">No Waste Analytics Data Available</h3>
                    <p className="text-gray-600 leading-relaxed">Select a company to view detailed waste management analytics and insights.</p>
                </div>
            </div>
        );
    }

    const apiData = wasteData?.data;
    if (!apiData) {
        return (
            <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl">
                <div className="text-center max-w-md p-8">
                    <AlertCircle className="w-12 h-12 mx-auto mb-6 text-amber-500" />
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">Invalid Data Format</h3>
                    <p className="text-gray-600 leading-relaxed">The waste data format is invalid or corrupted.</p>
                </div>
            </div>
        );
    }

    // Extract data from API response
    const companyInfo = apiData.company;
    const yearData = apiData.year_data;
    const wasteSummary = apiData.waste_summary;
    const performanceIndicators = wasteSummary?.performance_indicators;
    const wasteStreams = apiData.waste_streams;
    const incidentsAndTargets = apiData.incidents_and_targets;
    const circularEconomy = apiData.circular_economy;
    const environmentalMetrics = apiData.environmental_metrics;
    const graphsData = apiData.graphs;
    const recommendations = apiData.recommendations;
    const dataQuality = apiData.data_quality;

    // Get reporting year
    const reportingYear = yearData?.requested_year || new Date().getFullYear();

    // Calculate key waste metrics from environmental metrics
    const wasteMetrics = useMemo(() => {
        if (!environmentalMetrics?.metrics) return null;

        const metrics = environmentalMetrics.metrics;

        // Get waste-related metrics from the environmental metrics
        const recycledWaste = metrics["Waste Management - Recycled waste (excl. Boiler Ash)"]?.values?.[0]?.numeric_value || 0;
        const disposedWaste = metrics["Waste Management - Disposed waste (excl. Boiler Ash)"]?.values?.[0]?.numeric_value || 0;
        const environmentIncidents = metrics["Environment Incidents"]?.values?.[0]?.numeric_value || 0;
        const generalWaste = metrics["Environment Incidents - Waste streams produced - General Waste"]?.values?.[0]?.numeric_value || 0;
        const hazardousWaste = metrics["Environment Incidents - Waste streams produced - Hazardous waste"]?.values?.[0]?.numeric_value || 0;
        const boilerAsh = metrics["Environment Incidents - Waste streams produced - Boiler ash"]?.values?.[0]?.numeric_value || 0;
        const recyclableWaste = metrics["Environment Incidents - Waste streams produced - Recyclable waste"]?.values?.[0]?.numeric_value || 0;

        // Calculate totals and percentages
        const totalWasteGenerated = recycledWaste + disposedWaste + generalWaste + hazardousWaste + boilerAsh + recyclableWaste;
        const wasteDiversionRate = totalWasteGenerated > 0 ? ((recycledWaste + recyclableWaste) / totalWasteGenerated) * 100 : 0;
        const hazardousWastePercentage = totalWasteGenerated > 0 ? (hazardousWaste / totalWasteGenerated) * 100 : 0;
        const landfillPercentage = totalWasteGenerated > 0 ? (disposedWaste / totalWasteGenerated) * 100 : 0;
        const recyclingRate = parseFloat(performanceIndicators?.recycling_rate?.value?.toString() || "0");
        const costSavings = parseFloat(performanceIndicators?.cost_savings?.value?.toString().replace(',', '') || "0");

        return {
            recycledWaste,
            disposedWaste,
            environmentIncidents,
            generalWaste,
            hazardousWaste,
            boilerAsh,
            recyclableWaste,
            totalWasteGenerated,
            wasteDiversionRate,
            hazardousWastePercentage,
            landfillPercentage,
            recyclingRate,
            costSavings,
        };
    }, [environmentalMetrics, performanceIndicators]);

    // Calculate circular economy metrics
    const circularMetrics = useMemo(() => {
        if (!circularEconomy?.metrics) return null;

        return {
            materialsRecovered: parseFloat(circularEconomy.metrics.materials_recovered?.value?.toString() || "0"),
            wasteToEnergy: parseFloat(circularEconomy.metrics.waste_to_energy?.value?.toString() || "0"),
            closedLoopProjects: circularEconomy.metrics.closed_loop_projects?.value || 0,
            circularSupplyChain: circularEconomy.metrics.circular_supply_chain?.value || "0%",
        };
    }, [circularEconomy]);

    // Get trend data
    const trends = useMemo(() => {
        if (!graphsData?.waste_trend_over_time) return null;

        const trendData = graphsData.waste_trend_over_time;
        const labels = trendData.labels || [];
        const totalWasteData = trendData.datasets?.[0]?.data || [];
        const recycledWasteData = trendData.datasets?.[1]?.data || [];

        // Calculate trends
        const getTrend = (data: number[]) => {
            if (data.length < 2) return 'Stable';
            const first = data[0];
            const last = data[data.length - 1];
            const percentageChange = ((last - first) / first) * 100;

            if (percentageChange > 10) return 'Increasing';
            if (percentageChange < -10) return 'Decreasing';
            return 'Stable';
        };

        return {
            totalWasteTrend: getTrend(totalWasteData),
            recycledWasteTrend: getTrend(recycledWasteData),
            wasteEfficiencyTrend: recycledWasteData.length > 0 ?
                ((recycledWasteData[recycledWasteData.length - 1] / totalWasteData[totalWasteData.length - 1]) > 0.4 ? 'Improving' : 'Stable') : 'Stable',
        };
    }, [graphsData]);

    // Key insights data
    const insights = {
        trends: [
            {
                title: 'Waste Diversion Progress',
                description: `Company achieves ${wasteMetrics?.wasteDiversionRate?.toFixed(1) || '0'}% waste diversion from landfill`,
                icon: <TrendingUp className="w-5 h-5 text-green-600" />,
                impact: wasteMetrics?.wasteDiversionRate > 50 ? 'High' : wasteMetrics?.wasteDiversionRate > 30 ? 'Medium' : 'Low',
                confidence: 0.92,
            },
            {
                title: 'Recycling Rate Trend',
                description: `Recycling rate shows ${performanceIndicators?.recycling_rate?.trend?.toLowerCase() || 'stable'} trend at ${wasteMetrics?.recyclingRate?.toFixed(1) || '0'}%`,
                icon: <Recycle className="w-5 h-5 text-green-600" />,
                impact: wasteMetrics?.recyclingRate > 40 ? 'High' : wasteMetrics?.recyclingRate > 20 ? 'Medium' : 'Low',
                confidence: 0.88,
            },
            {
                title: 'Circular Economy Adoption',
                description: `${circularMetrics?.materialsRecovered?.toFixed(1) || '0'}% materials recovered and ${circularMetrics?.closedLoopProjects} closed-loop projects`,
                icon: <Cpu className="w-5 h-5 text-blue-600" />,
                impact: circularMetrics?.materialsRecovered > 40 ? 'High' : circularMetrics?.materialsRecovered > 20 ? 'Medium' : 'Low',
                confidence: 0.75,
            },
        ],
        risks: [
            {
                title: 'Hazardous Waste Risk',
                description: `Hazardous waste makes up ${wasteMetrics?.hazardousWastePercentage?.toFixed(1) || '0'}% of total waste`,
                icon: <Shield className="w-5 h-5 text-red-600" />,
                priority: wasteMetrics?.hazardousWastePercentage > 10 ? 'High' : wasteMetrics?.hazardousWastePercentage > 5 ? 'Medium' : 'Low',
                timeframe: 'Immediate',
            },
            {
                title: 'Environment Incidents',
                description: `${wasteMetrics?.environmentIncidents || 0} environment incidents reported`,
                icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
                priority: wasteMetrics?.environmentIncidents > 10 ? 'High' : wasteMetrics?.environmentIncidents > 5 ? 'Medium' : 'Low',
                timeframe: 'Monitor',
            },
            {
                title: 'Landfill Dependency',
                description: `${wasteMetrics?.landfillPercentage?.toFixed(1) || '0'}% of waste sent to landfill`,
                icon: <Trash2 className="w-5 h-5 text-gray-600" />,
                priority: wasteMetrics?.landfillPercentage > 60 ? 'High' : wasteMetrics?.landfillPercentage > 40 ? 'Medium' : 'Low',
                timeframe: 'Strategic',
            },
        ],
        opportunities: [
            {
                title: 'Increase Recycling',
                description: `Potential to increase recycling rate from ${wasteMetrics?.recyclingRate?.toFixed(1) || '0'}% to industry average of 45%`,
                icon: <Recycle className="w-5 h-5 text-green-600" />,
                value: wasteMetrics?.recyclingRate < 40 ? 'High' : 'Medium',
                timeframe: '6-12 months',
            },
            {
                title: 'Hazardous Waste Reduction',
                description: `Opportunity to reduce hazardous waste from ${wasteMetrics?.hazardousWaste} tons`,
                icon: <Shield className="w-5 h-5 text-yellow-600" />,
                value: wasteMetrics?.hazardousWaste > 50 ? 'High' : 'Medium',
                timeframe: '1-2 years',
            },
            {
                title: 'Circular Economy Expansion',
                description: `Expand closed-loop projects from ${circularMetrics?.closedLoopProjects} to 5+ projects`,
                icon: <Cpu className="w-5 h-5 text-blue-600" />,
                value: 'High',
                timeframe: '3-6 months',
            },
        ],
    };

    // Waste metrics analysis
    const wasteMetricsData = [
        {
            title: 'Total Waste Generated',
            value: wasteMetrics?.totalWasteGenerated || 0,
            unit: 'tons',
            trend: trends?.totalWasteTrend || 'Stable',
            icon: <Trash2 className="w-6 h-6 text-gray-600" />,
        },
        {
            title: 'Recycled Waste',
            value: wasteMetrics?.recycledWaste || 0,
            unit: 'tons',
            trend: trends?.recycledWasteTrend || 'Stable',
            percentage: wasteMetrics?.recyclingRate || 0,
            icon: <Recycle className="w-6 h-6 text-green-600" />,
        },
        {
            title: 'Hazardous Waste',
            value: wasteMetrics?.hazardousWaste || 0,
            unit: 'tons',
            trend: wasteMetrics?.hazardousWastePercentage > 10 ? 'Monitor' : 'Stable',
            percentage: wasteMetrics?.hazardousWastePercentage || 0,
            icon: <Shield className="w-6 h-6 text-red-600" />,
        },
        {
            title: 'Cost Savings',
            value: wasteMetrics?.costSavings || 0,
            unit: '$',
            trend: performanceIndicators?.cost_savings?.trend || 'Stable',
            savings: wasteMetrics?.costSavings > 100000 ? 'Significant' : 'Moderate',
            icon: <DollarSign className="w-6 h-6 text-emerald-600" />,
        },
    ];

    // Waste stream breakdown
    const wasteStreamBreakdown = wasteStreams?.categories?.map((category: any) => ({
        source: category.name,
        percentage: category.amount > 0 ? (category.amount / wasteStreams.total) * 100 : 0,
        value: category.amount,
        icon: category.name === 'Recyclable' ? <Recycle className="w-4 h-4 text-green-600" /> :
            category.name === 'Hazardous' ? <Shield className="w-4 h-4 text-red-600" /> :
                category.name === 'Ash' ? <Flame className="w-4 h-4 text-orange-600" /> :
                    <Package className="w-4 h-4 text-gray-600" />,
    })) || [];

    // Incidents analysis
    const incidentsAnalysis = [
        {
            title: 'Total Incidents',
            value: incidentsAndTargets?.total_incidents || 0,
            unit: 'incidents',
            icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
        },
        {
            title: 'Current Year Incidents',
            value: incidentsAndTargets?.current_year_incidents || 0,
            unit: 'incidents',
            icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
        },
        {
            title: 'Average Cost Impact',
            value: incidentsAndTargets?.incidents?.reduce((acc: number, incident: any) => acc + (incident.cost_impact || 0), 0) / (incidentsAndTargets?.incidents?.length || 1) || 0,
            unit: '$',
            icon: <DollarSign className="w-5 h-5 text-emerald-600" />,
        },
        {
            title: 'Compliance Status',
            value: incidentsAndTargets?.compliance_status || 'Compliant',
            unit: '',
            icon: <ShieldCheck className="w-5 h-5 text-green-600" />,
        },
    ];

    // Circular economy performance
    const circularEconomyData = [
        {
            title: 'Materials Recovery Rate',
            value: circularMetrics?.materialsRecovered || 0,
            unit: '%',
            trend: 'Improving',
            icon: <Recycle className="w-5 h-5 text-green-600" />,
        },
        {
            title: 'Waste to Energy',
            value: circularMetrics?.wasteToEnergy || 0,
            unit: '%',
            trend: 'Stable',
            icon: <Zap className="w-5 h-5 text-yellow-600" />,
        },
        {
            title: 'Closed Loop Projects',
            value: circularMetrics?.closedLoopProjects || 0,
            unit: 'projects',
            trend: 'Increasing',
            icon: <Cpu className="w-5 h-5 text-blue-600" />,
        },
        {
            title: 'Circular Supply Chain',
            value: circularMetrics?.circularSupplyChain || "0%",
            unit: '',
            trend: 'Developing',
            icon: <Archive className="w-5 h-5 text-purple-600" />,
        },
    ];

    // Performance indicators
    const performanceIndicatorsData = [
        {
            title: 'Waste Diversion Rate',
            value: wasteMetrics?.wasteDiversionRate || 0,
            unit: '%',
            trend: wasteMetrics?.wasteDiversionRate > 50 ? 'Improving' : 'Stable',
            icon: <TrendingUp className="w-5 h-5 text-green-600" />,
        },
        {
            title: 'Hazardous Waste %',
            value: wasteMetrics?.hazardousWastePercentage || 0,
            unit: '%',
            trend: wasteMetrics?.hazardousWastePercentage > 10 ? 'Monitor' : 'Improving',
            icon: <Shield className="w-5 h-5 text-red-600" />,
        },
        {
            title: 'Recycling Efficiency',
            value: wasteMetrics?.recyclingRate || 0,
            unit: '%',
            trend: wasteMetrics?.recyclingRate > 40 ? 'High' : 'Medium',
            icon: <Recycle className="w-5 h-5 text-emerald-600" />,
        },
        {
            title: 'Landfill Reduction',
            value: wasteMetrics?.landfillPercentage || 0,
            unit: '%',
            trend: wasteMetrics?.landfillPercentage < 30 ? 'Excellent' : 'Needs Improvement',
            icon: <Trash2 className="w-5 h-5 text-gray-600" />,
        },
    ];

    // Simplified explanations for waste terms
    const simpleExplanations = {
        'Waste Diversion Rate': 'Percentage of waste that is diverted from landfill through recycling, composting, or recovery',
        'Circular Economy': 'System where waste is minimized by keeping materials in use through recycling and reuse',
        'Hazardous Waste': 'Waste that poses substantial or potential threats to public health or the environment',
        'Recycling Rate': 'Percentage of total waste that is recycled rather than sent to landfill or incineration',
        'Closed Loop Systems': 'Production systems where waste is reused, recycled, or composted back into the system',
        'Zero Waste Targets': 'Goals to eliminate waste sent to landfill and incinerators',
    };

    return (
        <div className="space-y-8 pb-8">

            {/* Key Insights Section */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10 hover:shadow-2xl transition-shadow duration-300">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                            Waste Management Insights & Analytics
                        </h3>
                        <p className="text-gray-600 text-lg">Deep analysis of your waste management and circular economy performance</p>
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

            {/* Waste Metrics Analysis */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                    Waste Consumption Analysis
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                    {wasteMetricsData.map((metric, index) => (
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
                                    {'savings' in metric && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            Savings: {metric.savings}
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

            {/* Waste Stream Breakdown */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Waste Stream Breakdown */}
                    <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-green-600" />
                            Waste Stream Breakdown
                        </h4>
                        <div className="space-y-4">
                            {wasteStreamBreakdown.map((source, index) => (
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
                                        {formatNumber(source.value)} tons
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Incidents Analysis */}
                    <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            Incidents Analysis
                        </h4>
                        <div className="space-y-4">
                            {incidentsAnalysis.map((incident, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-red-50 to-orange-50"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {incident.icon}
                                            <span className="font-semibold text-gray-900">{incident.title}</span>
                                        </div>
                                        <span className="font-bold text-gray-900">
                                            {typeof incident.value === 'number' ?
                                                (incident.title.includes('Cost') ? formatCurrency(incident.value) : formatNumber(incident.value))
                                                : incident.value}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {incident.unit}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Circular Economy Analysis */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                    Circular Economy Analysis
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {circularEconomyData.map((metric, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-3xl border-2 border-gray-200 hover:border-blue-400 bg-gradient-to-br from-white to-gray-50 hover:from-blue-50 hover:to-cyan-50 transition-all duration-300 hover:shadow-xl"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                                    {metric.icon}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">{metric.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {typeof metric.value === 'number' ? formatNumber(metric.value) : metric.value}
                                        <span className="text-lg">{metric.unit}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                                {getTrendIcon(metric.trend)}
                                <span className="text-sm font-semibold text-gray-700">{metric.trend}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-2 font-medium">Waste Diversion Rate</p>
                            <p className="text-4xl font-bold text-blue-700">
                                {wasteMetrics?.wasteDiversionRate?.toFixed(1) || "0"}<span className="text-lg">%</span>
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-2 font-medium">Recycling Rate</p>
                            <p className="text-4xl font-bold text-blue-600">
                                {wasteMetrics?.recyclingRate?.toFixed(1) || "0"}<span className="text-lg">%</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Indicators */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                    Waste Performance Indicators
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {performanceIndicatorsData.map((indicator, index) => (
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
                        <p className="text-gray-600 text-lg">Understanding waste management metrics made easy</p>
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
                                    <Trash2 className="w-6 h-6 text-green-600" />
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
                            <p className="text-xl font-bold text-gray-900">{reportingYear}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-gray-50">
                            <p className="text-sm text-gray-600 mb-2">Metrics Tracked</p>
                            <p className="text-xl font-bold text-gray-900">{environmentalMetrics?.total_metrics || 0} metrics</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-gray-50">
                            <p className="text-sm text-gray-600 mb-2">Data Completeness</p>
                            <p className="text-xl font-bold text-gray-900">
                                {dataQuality?.verification_status?.unverified === 0 ? 'High' : 'Medium'}
                            </p>
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
                            <p className="text-sm font-semibold text-gray-900 mb-2">Waste Diversion Rate</p>
                            <p className="text-sm text-gray-700">(Recycled + Recyclable Waste / Total Waste) × 100</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Recycling Rate</p>
                            <p className="text-sm text-gray-700">(Recycled Waste / Total Waste) × 100</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Hazardous Waste %</p>
                            <p className="text-sm text-gray-700">(Hazardous Waste / Total Waste) × 100</p>
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
                        <p className="text-gray-700 text-lg mb-4">
                            Your waste management performance shows {wasteMetrics?.recyclingRate > 40 ? 'strong' : 'moderate'} recycling rates with opportunities for improvement in waste diversion and circular economy initiatives.
                        </p>
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
                                                {typeof value === 'number' ?
                                                    (key.includes('value') ? formatNumber(value) : value.toFixed(2))
                                                    : String(value)}
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
                                        <p className="text-green-100 text-lg mt-1">Based on your waste analytics</p>
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
                                    title: 'Increase Recycling Infrastructure',
                                    description: `Current recycling rate is ${wasteMetrics?.recyclingRate?.toFixed(1) || '0'}%. Invest in additional recycling facilities and employee training.`,
                                    impact: 'High',
                                    effort: 'Medium',
                                    timeframe: '6-12 months',
                                    icon: <Recycle className="w-6 h-6 text-green-600" />,
                                },
                                {
                                    title: 'Reduce Hazardous Waste',
                                    description: `Hazardous waste accounts for ${wasteMetrics?.hazardousWastePercentage?.toFixed(1) || '0'}% of total waste. Implement hazardous waste reduction programs.`,
                                    impact: 'High',
                                    effort: 'High',
                                    timeframe: '1-2 years',
                                    icon: <Shield className="w-6 h-6 text-red-600" />,
                                },
                                wasteMetrics?.landfillPercentage > 40 && {
                                    title: 'Reduce Landfill Dependency',
                                    description: `${wasteMetrics?.landfillPercentage?.toFixed(1) || '0'}% of waste goes to landfill. Develop alternative waste treatment solutions.`,
                                    impact: 'High',
                                    effort: 'Medium',
                                    timeframe: '1 year',
                                    icon: <Trash2 className="w-6 h-6 text-gray-600" />,
                                },
                                wasteMetrics?.wasteDiversionRate < 60 && {
                                    title: 'Improve Waste Diversion',
                                    description: `Waste diversion rate is ${wasteMetrics?.wasteDiversionRate?.toFixed(1) || '0'}%. Implement composting and material recovery programs.`,
                                    impact: 'Medium',
                                    effort: 'Medium',
                                    timeframe: '1 year',
                                    icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
                                },
                                {
                                    title: 'Expand Circular Economy',
                                    description: `Currently have ${circularMetrics?.closedLoopProjects || 0} closed-loop projects. Explore partnerships for circular supply chains.`,
                                    impact: 'Medium',
                                    effort: 'Low',
                                    timeframe: '3 months',
                                    icon: <Cpu className="w-6 h-6 text-amber-600" />,
                                },
                                incidentsAndTargets?.current_year_incidents > 2 && {
                                    title: 'Incident Prevention Program',
                                    description: `${incidentsAndTargets?.current_year_incidents || 0} incidents this year. Implement comprehensive waste incident prevention training.`,
                                    impact: 'High',
                                    effort: 'High',
                                    timeframe: '2 years',
                                    icon: <AlertTriangle className="w-6 h-6 text-emerald-600" />,
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

export default WasteAnalyticsTab;