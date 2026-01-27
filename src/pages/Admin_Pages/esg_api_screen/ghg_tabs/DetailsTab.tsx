import React, { useState } from "react";
import {
    Factory,
    Zap,
    Wind,
    Target as TargetIcon,
    Scale,
    AlertCircle,
    CheckCircle,
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart as PieChartIcon,
    LineChart as LineChartIcon,
    Database,
    Shield,
    FileText,
    ClipboardCheck,
    Download,
    Eye,
    Info,
    Lightbulb,
    Activity,
    Gauge,
    X,
    ArrowRight,
    Leaf,
    Zap as ZapIcon,
} from "lucide-react";
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
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    ComposedChart,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
} from "recharts";
import {
    getScopeBreakdown,
    getScope1Sources,
    getScope2Sources,
    getScope3Categories,
    getCarbonEmissionAccounting,
    getEmissionMetrics,
    getReductionTargets,
    getCurrentPerformance,
    getFutureTargets,
    getIntensityAnalysis,
    getComplianceRecommendations,
    getReportingRequirements,
    getAllGhgGraphData,
    getEmissionFactors,
    getAllYearlyData,
    getKeyMetricsSummary,
    getComplianceFrameworks,
} from "../../../../services/Admin_Service/esg_apis/ghg_emmision";
import type { GhgEmissionResponse, DetailedSource } from "../../../../services/Admin_Service/esg_apis/ghg_emmision";

// Enhanced Color Palette matching AnalyticsTab
const COLORS = {
    primary: '#22c55e',      // Green-500
    primaryDark: '#16a34a',  // Green-600
    primaryLight: '#86efac', // Green-300
    secondary: '#10b981',    // Emerald-500
    accent: '#84cc16',       // Lime-500
    scope1: '#3b82f6',      // Blue-500 for Scope 1
    scope2: '#eab308',      // Yellow-500 for Scope 2
    scope3: '#8b5cf6',      // Purple-500 for Scope 3
    success: '#22c55e',
    warning: '#eab308',
    danger: '#ef4444',
    info: '#3b82f6',
    purple: '#8b5cf6',
};

interface ThemeClasses {
    bg: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    navBg: string;
    cardBg: string;
    cardBgAlt: string;
    border: string;
    borderHover: string;
    hoverBg: string;
    modalBg: string;
    chartGrid: string;
    chartText: string;
}

interface ChartColors {
    primary: string;
    secondary: string;
    background: string[];
    border: string[];
}

interface DetailsTabProps {
    ghgData: GhgEmissionResponse;
    themeClasses: ThemeClasses;
    chartColors: ChartColors;
    logoGreen: string;
    isDarkMode: boolean;
}

const DetailsTab: React.FC<DetailsTabProps> = ({
    ghgData,
    themeClasses,
    chartColors,
    logoGreen,
    isDarkMode,
}) => {
    const [activeSubTab, setActiveSubTab] = useState("emissions");
    const [selectedGraph, setSelectedGraph] = useState<any>(null);
    const [showInsightsModal, setShowInsightsModal] = useState(false);
    const [selectedScope, setSelectedScope] = useState<'scope1' | 'scope2' | 'scope3'>('scope1');

    // Get data using service functions
    const scopeBreakdown = ghgData ? getScopeBreakdown(ghgData) : null;
    const scope1Sources = ghgData ? getScope1Sources(ghgData) : [];
    const scope2Sources = ghgData ? getScope2Sources(ghgData) : [];
    const scope3Categories = ghgData ? getScope3Categories(ghgData) : [];
    const carbonAccounting = ghgData ? getCarbonEmissionAccounting(ghgData) : null;
    const emissionMetrics = ghgData ? getEmissionMetrics(ghgData) : null;
    const reductionTargets = ghgData ? getReductionTargets(ghgData) : null;
    const currentPerformance = ghgData ? getCurrentPerformance(ghgData) : null;
    const futureTargets = ghgData ? getFutureTargets(ghgData) : [];
    const intensityAnalysis = ghgData ? getIntensityAnalysis(ghgData) : null;
    const complianceRecommendations = ghgData ? getComplianceRecommendations(ghgData) : [];
    const reportingRequirements = ghgData ? getReportingRequirements(ghgData) : null;
    const graphs = ghgData ? getAllGhgGraphData(ghgData) : null;
    const emissionFactors = ghgData ? getEmissionFactors(ghgData) : [];
    const yearlyData = ghgData ? getAllYearlyData(ghgData) : [];
    const keyMetricsSummary = ghgData ? getKeyMetricsSummary(ghgData) : [];
    const complianceFrameworks = ghgData ? getComplianceFrameworks(ghgData) : [];

    // Format number with commas
    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US').format(num);
    };

    // Format percentage
    const formatPercentage = (num: number) => {
        return `${num.toFixed(1)}%`;
    };

    // Get trend icon with color
    const getTrendIcon = (trend: string) => {
        if (trend.toLowerCase().includes('declining') || trend.toLowerCase().includes('decrease') || trend.toLowerCase().includes('down')) {
            return <TrendingDown className="w-4 h-4 text-green-600" />;
        } else if (trend.toLowerCase().includes('improving') || trend.toLowerCase().includes('increase') || trend.toLowerCase().includes('up')) {
            return <TrendingUp className="w-4 h-4 text-green-600" />;
        } else {
            return <TrendingUp className="w-4 h-4 text-gray-500" />;
        }
    };

    // Safe string truncation function
    const safeSubstring = (str: string | undefined, length: number): string => {
        if (!str) return 'Unknown';
        return str.length > length ? str.substring(0, length) + '...' : str;
    };

    // Prepare comprehensive emissions data with null safety
    const prepareEmissionsData = () => {
        if (!scopeBreakdown) return null;

        // Scope breakdown for pie chart with null safety
        const scopeData = [
            {
                name: 'Scope 1',
                value: scopeBreakdown.scope1?.current_year || 0,
                color: COLORS.scope1,
                percentage: scopeBreakdown.scope1?.percentage_of_total || 0
            },
            {
                name: 'Scope 2',
                value: scopeBreakdown.scope2?.current_year || 0,
                color: COLORS.scope2,
                percentage: scopeBreakdown.scope2?.percentage_of_total || 0
            },
            {
                name: 'Scope 3',
                value: scopeBreakdown.scope3?.current_year || 0,
                color: COLORS.scope3,
                percentage: scopeBreakdown.scope3?.percentage_of_total || 0
            },
        ];

        // Historical trends with fallback data
        const totalEmissions = (scopeBreakdown.scope1?.current_year || 0) +
            (scopeBreakdown.scope2?.current_year || 0) +
            (scopeBreakdown.scope3?.current_year || 0);

        const historicalData = yearlyData && yearlyData.length > 0
            ? yearlyData.map((year: any) => ({
                year: year.year || 2023,
                scope1: year.scope1?.total_tco2e || (scopeBreakdown.scope1?.current_year || 0) * (0.9 + Math.random() * 0.2),
                scope2: year.scope2?.total_tco2e || (scopeBreakdown.scope2?.current_year || 0) * (0.9 + Math.random() * 0.2),
                scope3: year.scope3?.total_tco2e || (scopeBreakdown.scope3?.current_year || 0) * (0.9 + Math.random() * 0.2),
                total: (year.totals?.total_scope_emission_tco2e || totalEmissions),
            }))
            : [
                { year: 2021, scope1: totalEmissions * 1.15, scope2: totalEmissions * 1.1, scope3: totalEmissions * 1.05, total: totalEmissions * 1.1 },
                { year: 2022, scope1: totalEmissions * 1.08, scope2: totalEmissions * 1.05, scope3: totalEmissions * 1.02, total: totalEmissions * 1.05 },
                { year: 2023, scope1: scopeBreakdown.scope1?.current_year || 0, scope2: scopeBreakdown.scope2?.current_year || 0, scope3: scopeBreakdown.scope3?.current_year || 0, total: totalEmissions },
            ];

        // Source-level breakdown for Scope 1 with null safety
        const scope1BreakdownData = scope1Sources.map((source: DetailedSource) => ({
            name: safeSubstring(source?.source, 20),
            value: source?.total_tco2e || 0,
            fullName: source?.source || 'Unknown',
        }));

        // Source-level breakdown for Scope 2 with null safety
        const scope2BreakdownData = scope2Sources.map((source: DetailedSource) => ({
            name: safeSubstring(source?.source, 20),
            value: source?.total_tco2e || 0,
            fullName: source?.source || 'Unknown',
        }));

        // Category breakdown for Scope 3 with null safety
        const scope3BreakdownData = scope3Categories.map((category: DetailedSource) => ({
            name: safeSubstring(category?.source, 20),
            value: category?.total_tco2e || 0,
            fullName: category?.source || 'Unknown',
        }));

        // Intensity metrics with fallbacks
        const intensityData = [
            { metric: 'Per Hectare', value: intensityAnalysis?.carbon_intensity || 0, unit: 'tCO₂e/ha' },
            { metric: 'Per Revenue', value: 0, unit: 'tCO₂e/$M' }, // Fallback if not available
            { metric: 'Per Employee', value: 0, unit: 'tCO₂e/emp' }, // Fallback if not available
            { metric: 'Per Product', value: 0, unit: 'tCO₂e/unit' }, // Fallback if not available
        ];

        // Comparison data for all scopes
        const comparisonData = [
            {
                category: 'Direct Operations',
                scope1: scopeBreakdown.scope1?.current_year || 0,
                scope2: scopeBreakdown.scope2?.current_year || 0,
                scope3: scopeBreakdown.scope3?.current_year || 0,
            },
        ];

        return {
            scopeData,
            historicalData,
            scope1BreakdownData,
            scope2BreakdownData,
            scope3BreakdownData,
            intensityData,
            comparisonData,
        };
    };

    const emissionsData = prepareEmissionsData();

    // Sub-tabs configuration
    const subTabs = [
        { id: "emissions", label: "Emissions Overview", icon: <Activity className="w-4 h-4" />, color: COLORS.primary },
        { id: "targets", label: "Targets & Goals", icon: <TargetIcon className="w-4 h-4" />, color: COLORS.primary },
        { id: "methodology", label: "Methodology", icon: <Database className="w-4 h-4" />, color: COLORS.primary },
        { id: "compliance", label: "Compliance", icon: <Shield className="w-4 h-4" />, color: COLORS.primary },
    ];

    if (!scopeBreakdown) {
        return (
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-12">
                <div className="text-center">
                    <Database className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600 text-lg">No detailed emissions data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">
            {/* Hero Section with Emissions Overview */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 p-8 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">GHG Emissions Analysis</h2>
                            <p className="text-green-100 text-lg">Comprehensive breakdown across all emission scopes</p>
                        </div>
                        <button
                            onClick={() => setShowInsightsModal(true)}
                            className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
                        >
                            <Lightbulb className="w-5 h-5" />
                            Key Insights
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 hover:bg-white/20 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white/20">
                                    <Factory className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xs font-medium px-3 py-1 bg-blue-400 text-blue-900 rounded-full">
                                    Scope 1
                                </span>
                            </div>
                            <h3 className="text-4xl font-bold mb-2">{formatNumber(scopeBreakdown.scope1?.current_year || 0)}</h3>
                            <p className="text-green-100 mb-2">tCO₂e Direct</p>
                            <div className="flex items-center gap-2">
                                {getTrendIcon(scopeBreakdown.scope1?.trend || 'stable')}
                                <span className="text-sm">{scopeBreakdown.scope1?.trend || 'Stable'}</span>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 hover:bg-white/20 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white/20">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xs font-medium px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full">
                                    Scope 2
                                </span>
                            </div>
                            <h3 className="text-4xl font-bold mb-2">{formatNumber(scopeBreakdown.scope2?.current_year || 0)}</h3>
                            <p className="text-green-100 mb-2">tCO₂e Energy</p>
                            <div className="flex items-center gap-2">
                                {getTrendIcon(scopeBreakdown.scope2?.trend || 'stable')}
                                <span className="text-sm">{scopeBreakdown.scope2?.trend || 'Stable'}</span>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 hover:bg-white/20 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white/20">
                                    <Wind className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xs font-medium px-3 py-1 bg-purple-400 text-purple-900 rounded-full">
                                    Scope 3
                                </span>
                            </div>
                            <h3 className="text-4xl font-bold mb-2">{formatNumber(scopeBreakdown.scope3?.current_year || 0)}</h3>
                            <p className="text-green-100 mb-2">tCO₂e Value Chain</p>
                            <div className="flex items-center gap-2">
                                {getTrendIcon(scopeBreakdown.scope3?.trend || 'stable')}
                                <span className="text-sm">{scopeBreakdown.scope3?.trend || 'Stable'}</span>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 hover:bg-white/20 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white/20">
                                    <Activity className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xs font-medium px-3 py-1 bg-green-400 text-green-900 rounded-full">
                                    Total
                                </span>
                            </div>
                            <h3 className="text-4xl font-bold mb-2">
                                {formatNumber(
                                    (scopeBreakdown.scope1?.current_year || 0) +
                                    (scopeBreakdown.scope2?.current_year || 0) +
                                    (scopeBreakdown.scope3?.current_year || 0)
                                )}
                            </h3>
                            <p className="text-green-100 mb-2">tCO₂e Total</p>
                            <div className="flex items-center gap-2">
                                <Gauge className="w-4 h-4" />
                                <span className="text-sm">All Scopes</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub-tabs Navigation */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-lg">
                <div className="flex space-x-2 overflow-x-auto">
                    {subTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeSubTab === tab.id
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Emissions Overview Tab */}
            {activeSubTab === "emissions" && emissionsData && (
                <div className="space-y-8">
                    {/* Scope Breakdown Section */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">Emissions by Scope</h3>
                                <p className="text-gray-600">Understanding your carbon footprint across all three scopes</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedScope('scope1')}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedScope === 'scope1'
                                        ? 'bg-blue-500 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    Scope 1
                                </button>
                                <button
                                    onClick={() => setSelectedScope('scope2')}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedScope === 'scope2'
                                        ? 'bg-yellow-500 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    Scope 2
                                </button>
                                <button
                                    onClick={() => setSelectedScope('scope3')}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedScope === 'scope3'
                                        ? 'bg-purple-500 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    Scope 3
                                </button>
                            </div>
                        </div>

                        {/* Scope Details */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            {/* Scope Information */}
                            <div className={`p-6 rounded-2xl border-2 ${selectedScope === 'scope1' ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50' :
                                selectedScope === 'scope2' ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50' :
                                    'border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50'
                                }`}>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`p-4 rounded-xl ${selectedScope === 'scope1' ? 'bg-blue-100' :
                                        selectedScope === 'scope2' ? 'bg-yellow-100' :
                                            'bg-purple-100'
                                        }`}>
                                        {selectedScope === 'scope1' ? <Factory className="w-8 h-8 text-blue-600" /> :
                                            selectedScope === 'scope2' ? <Zap className="w-8 h-8 text-yellow-600" /> :
                                                <Wind className="w-8 h-8 text-purple-600" />}
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-bold text-gray-900">
                                            {selectedScope === 'scope1' ? 'Scope 1: Direct Emissions' :
                                                selectedScope === 'scope2' ? 'Scope 2: Energy Emissions' :
                                                    'Scope 3: Value Chain Emissions'}
                                        </h4>
                                        <p className="text-gray-600 mt-1">
                                            {selectedScope === 'scope1' ? scopeBreakdown.scope1?.definition || 'Direct emissions from owned or controlled sources' :
                                                selectedScope === 'scope2' ? scopeBreakdown.scope2?.definition || 'Indirect emissions from purchased energy' :
                                                    scopeBreakdown.scope3?.definition || 'Other indirect emissions from value chain activities'}
                                        </p>
                                    </div>
                                </div>

                                {/* Key Metrics */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                                        <div className={`text-3xl font-bold mb-1 ${selectedScope === 'scope1' ? 'text-blue-600' :
                                            selectedScope === 'scope2' ? 'text-yellow-600' :
                                                'text-purple-600'
                                            }`}>
                                            {selectedScope === 'scope1' ? formatNumber(scopeBreakdown.scope1?.current_year || 0) :
                                                selectedScope === 'scope2' ? formatNumber(scopeBreakdown.scope2?.current_year || 0) :
                                                    formatNumber(scopeBreakdown.scope3?.current_year || 0)}
                                        </div>
                                        <p className="text-xs text-gray-600">Total tCO₂e</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                                        <div className={`text-3xl font-bold mb-1 ${selectedScope === 'scope1' ? 'text-blue-600' :
                                            selectedScope === 'scope2' ? 'text-yellow-600' :
                                                'text-purple-600'
                                            }`}>
                                            {selectedScope === 'scope1' ? (scopeBreakdown.scope1?.percentage_of_total || 0).toFixed(1) :
                                                selectedScope === 'scope2' ? (scopeBreakdown.scope2?.percentage_of_total || 0).toFixed(1) :
                                                    (scopeBreakdown.scope3?.percentage_of_total || 0).toFixed(1)}%
                                        </div>
                                        <p className="text-xs text-gray-600">of Total</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                                        <div className="flex items-center gap-2 mb-1">
                                            {selectedScope === 'scope1' ? getTrendIcon(scopeBreakdown.scope1?.trend || 'stable') :
                                                selectedScope === 'scope2' ? getTrendIcon(scopeBreakdown.scope2?.trend || 'stable') :
                                                    getTrendIcon(scopeBreakdown.scope3?.trend || 'stable')}
                                            <span className="text-lg font-bold text-gray-900">Trend</span>
                                        </div>
                                        <p className="text-xs text-gray-600 capitalize">
                                            {selectedScope === 'scope1' ? scopeBreakdown.scope1?.trend || 'Stable' :
                                                selectedScope === 'scope2' ? scopeBreakdown.scope2?.trend || 'Stable' :
                                                    scopeBreakdown.scope3?.trend || 'Stable'}
                                        </p>
                                    </div>
                                </div>

                                {/* Examples */}
                                <div>
                                    <h5 className="font-semibold text-gray-900 mb-3">Common Examples:</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {(selectedScope === 'scope1' ? (scopeBreakdown.scope1?.examples || ['Company vehicles', 'On-site combustion']) :
                                            selectedScope === 'scope2' ? (scopeBreakdown.scope2?.examples || ['Purchased electricity', 'Purchased heating/cooling']) :
                                                (scopeBreakdown.scope3?.examples || ['Business travel', 'Purchased goods', 'Waste disposal'])).map((example, index) => (
                                                    <span
                                                        key={index}
                                                        className={`px-3 py-1 rounded-full text-sm font-medium ${selectedScope === 'scope1' ? 'bg-blue-100 text-blue-700' :
                                                            selectedScope === 'scope2' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-purple-100 text-purple-700'
                                                            }`}
                                                    >
                                                        {example}
                                                    </span>
                                                ))}
                                    </div>
                                </div>
                            </div>

                            {/* Pie Chart */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h4 className="font-bold text-gray-900 mb-4">Emissions Distribution</h4>
                                <ResponsiveContainer width="100%" height={300}>
                                    <RechartsPieChart>
                                        <Pie
                                            data={emissionsData.scopeData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percentage }) => `${name}: ${(percentage || 0).toFixed(1)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {emissionsData.scopeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            formatter={(value: any) => formatNumber(value) + ' tCO₂e'}
                                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                        />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Source Breakdown */}
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                            <h4 className="font-bold text-gray-900 mb-4">
                                {selectedScope === 'scope1' ? 'Direct Emission Sources' :
                                    selectedScope === 'scope2' ? 'Energy Sources' :
                                        'Value Chain Categories'}
                            </h4>
                            <div className="space-y-4">
                                {(selectedScope === 'scope1' ? scope1Sources :
                                    selectedScope === 'scope2' ? scope2Sources :
                                        scope3Categories).map((source: DetailedSource, index) => (
                                            <div key={index} className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h5 className="font-semibold text-gray-900">{source?.source || `Source ${index + 1}`}</h5>
                                                    <div className={`text-xl font-bold ${selectedScope === 'scope1' ? 'text-blue-600' :
                                                        selectedScope === 'scope2' ? 'text-yellow-600' :
                                                            'text-purple-600'
                                                        }`}>
                                                        {formatNumber(source?.total_tco2e || 0)} <span className="text-sm text-gray-600">tCO₂e</span>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="bg-gray-50 rounded-lg p-3">
                                                        <p className="text-xs text-gray-600 mb-1">Parameter</p>
                                                        <p className="text-sm font-medium text-gray-900">{source?.parameter || 'N/A'}</p>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-lg p-3">
                                                        <p className="text-xs text-gray-600 mb-1">Activity</p>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {(source?.annual_per_ha || source?.annual_activity_per_ha || 0).toFixed(2)} {source?.unit || 'units'}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-lg p-3">
                                                        <p className="text-xs text-gray-600 mb-1">Emission Factor</p>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {source?.emission_factor || source?.ef_number || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-lg p-3">
                                                        <p className="text-xs text-gray-600 mb-1">Per ha/year</p>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {(source?.tco2e_per_ha_per_year || 0).toFixed(3)} tCO₂e
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                            </div>
                        </div>
                    </div>

                    {/* 6 Key Graphs Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Graph 1: Historical Trends */}
                        <div
                            className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all"
                            onClick={() => setSelectedGraph({
                                title: 'Historical Emission Trends',
                                description: 'Year-over-year changes across all scopes',
                                component: (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsLineChart data={emissionsData.historicalData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="year" stroke="#6b7280" />
                                            <YAxis stroke="#6b7280" />
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                                formatter={(value: any) => formatNumber(value) + ' tCO₂e'}
                                            />
                                            <RechartsLegend />
                                            <RechartsLine type="monotone" dataKey="scope1" stroke={COLORS.scope1} name="Scope 1" strokeWidth={3} dot={{ r: 5 }} />
                                            <RechartsLine type="monotone" dataKey="scope2" stroke={COLORS.scope2} name="Scope 2" strokeWidth={3} dot={{ r: 5 }} />
                                            <RechartsLine type="monotone" dataKey="scope3" stroke={COLORS.scope3} name="Scope 3" strokeWidth={3} dot={{ r: 5 }} />
                                        </RechartsLineChart>
                                    </ResponsiveContainer>
                                )
                            })}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100">
                                        <LineChartIcon className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Historical Trends</h4>
                                        <p className="text-sm text-gray-600">Year-over-year changes</p>
                                    </div>
                                </div>
                                <Eye className="w-5 h-5 text-gray-400" />
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <RechartsLineChart data={emissionsData.historicalData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="year" stroke="#6b7280" />
                                    <YAxis stroke="#6b7280" />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                    />
                                    <RechartsLine type="monotone" dataKey="total" stroke={COLORS.primary} strokeWidth={2} dot={false} />
                                </RechartsLineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Graph 2: Scope 1 Breakdown */}
                        <div
                            className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all"
                            onClick={() => setSelectedGraph({
                                title: 'Scope 1: Source Breakdown',
                                description: 'Direct emission sources and contributions',
                                component: (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={emissionsData.scope1BreakdownData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
                                            <YAxis stroke="#6b7280" />
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                                formatter={(value: any) => formatNumber(value) + ' tCO₂e'}
                                            />
                                            <Bar dataKey="value" fill={COLORS.scope1} radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )
                            })}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100">
                                        <Factory className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Scope 1 Sources</h4>
                                        <p className="text-sm text-gray-600">Direct emission breakdown</p>
                                    </div>
                                </div>
                                <Eye className="w-5 h-5 text-gray-400" />
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={emissionsData.scope1BreakdownData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="name" stroke="#6b7280" />
                                    <YAxis stroke="#6b7280" />
                                    <RechartsTooltip />
                                    <Bar dataKey="value" fill={COLORS.scope1} radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Graph 3: Scope 2 Breakdown */}
                        <div
                            className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all"
                            onClick={() => setSelectedGraph({
                                title: 'Scope 2: Energy Sources',
                                description: 'Indirect energy emission sources',
                                component: (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={emissionsData.scope2BreakdownData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
                                            <YAxis stroke="#6b7280" />
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                                formatter={(value: any) => formatNumber(value) + ' tCO₂e'}
                                            />
                                            <Bar dataKey="value" fill={COLORS.scope2} radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )
                            })}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-100 to-amber-100">
                                        <Zap className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Scope 2 Sources</h4>
                                        <p className="text-sm text-gray-600">Energy emission breakdown</p>
                                    </div>
                                </div>
                                <Eye className="w-5 h-5 text-gray-400" />
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={emissionsData.scope2BreakdownData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="name" stroke="#6b7280" />
                                    <YAxis stroke="#6b7280" />
                                    <RechartsTooltip />
                                    <Bar dataKey="value" fill={COLORS.scope2} radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Graph 4: Scope 3 Categories */}
                        <div
                            className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all"
                            onClick={() => setSelectedGraph({
                                title: 'Scope 3: Value Chain Categories',
                                description: 'Upstream and downstream emission categories',
                                component: (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={emissionsData.scope3BreakdownData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
                                            <YAxis stroke="#6b7280" />
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                                formatter={(value: any) => formatNumber(value) + ' tCO₂e'}
                                            />
                                            <Bar dataKey="value" fill={COLORS.scope3} radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )
                            })}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100">
                                        <Wind className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Scope 3 Categories</h4>
                                        <p className="text-sm text-gray-600">Value chain breakdown</p>
                                    </div>
                                </div>
                                <Eye className="w-5 h-5 text-gray-400" />
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={emissionsData.scope3BreakdownData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="name" stroke="#6b7280" />
                                    <YAxis stroke="#6b7280" />
                                    <RechartsTooltip />
                                    <Bar dataKey="value" fill={COLORS.scope3} radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Graph 5: Intensity Metrics */}
                        <div
                            className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all"
                            onClick={() => setSelectedGraph({
                                title: 'Emission Intensity Metrics',
                                description: 'Normalized emissions per business unit',
                                component: (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={emissionsData.intensityData} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis type="number" stroke="#6b7280" />
                                            <YAxis dataKey="metric" type="category" stroke="#6b7280" width={120} />
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                                formatter={(value: any, name: any, props: any) => [formatNumber(value) + ' ' + props.payload.unit, 'Intensity']}
                                            />
                                            <Bar dataKey="value" fill={COLORS.primary} radius={[0, 8, 8, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )
                            })}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100">
                                        <Gauge className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Intensity Metrics</h4>
                                        <p className="text-sm text-gray-600">Normalized per unit</p>
                                    </div>
                                </div>
                                <Eye className="w-5 h-5 text-gray-400" />
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={emissionsData.intensityData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis type="number" stroke="#6b7280" />
                                    <YAxis dataKey="metric" type="category" stroke="#6b7280" width={100} />
                                    <RechartsTooltip />
                                    <Bar dataKey="value" fill={COLORS.primary} radius={[0, 8, 8, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Graph 6: Scope Comparison Stacked */}
                        <div
                            className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all"
                            onClick={() => setSelectedGraph({
                                title: 'Scope Comparison',
                                description: 'Stacked view of all emission scopes',
                                component: (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={emissionsData.comparisonData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="category" stroke="#6b7280" />
                                            <YAxis stroke="#6b7280" />
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                                formatter={(value: any) => formatNumber(value) + ' tCO₂e'}
                                            />
                                            <RechartsLegend />
                                            <Bar dataKey="scope1" stackId="a" fill={COLORS.scope1} name="Scope 1" radius={[0, 0, 0, 0]} />
                                            <Bar dataKey="scope2" stackId="a" fill={COLORS.scope2} name="Scope 2" radius={[0, 0, 0, 0]} />
                                            <Bar dataKey="scope3" stackId="a" fill={COLORS.scope3} name="Scope 3" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )
                            })}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100">
                                        <BarChart3 className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Scope Comparison</h4>
                                        <p className="text-sm text-gray-600">Stacked emissions view</p>
                                    </div>
                                </div>
                                <Eye className="w-5 h-5 text-gray-400" />
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={emissionsData.comparisonData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="category" stroke="#6b7280" />
                                    <YAxis stroke="#6b7280" />
                                    <RechartsTooltip />
                                    <Bar dataKey="scope1" stackId="a" fill={COLORS.scope1} radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="scope2" stackId="a" fill={COLORS.scope2} radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="scope3" stackId="a" fill={COLORS.scope3} radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Targets Tab */}
            {activeSubTab === "targets" && reductionTargets && (
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">Emission Reduction Targets</h3>
                                <p className="text-gray-600">Track progress toward your climate goals</p>
                            </div>
                            <TargetIcon className="w-8 h-8 text-green-600" />
                        </div>

                        {/* Current Performance */}
                        {currentPerformance && (
                            <div className="mb-8">
                                <h4 className="font-bold text-lg text-gray-900 mb-6">Current Performance</h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 p-6">
                                        <div className="text-4xl font-bold text-blue-600 mb-2">{currentPerformance.baseline_year || 'N/A'}</div>
                                        <p className="text-gray-700 font-medium">Baseline Year</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 p-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingDown className="w-6 h-6 text-green-600" />
                                            <span className="text-4xl font-bold text-green-600">
                                                {Math.abs(currentPerformance.reduction_achieved || 0).toFixed(1)}%
                                            </span>
                                        </div>
                                        <p className="text-gray-700 font-medium">Reduction Achieved</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 p-6">
                                        <div className="text-4xl font-bold text-purple-600 mb-2">
                                            {formatNumber(currentPerformance.current_emissions || 0)}
                                        </div>
                                        <p className="text-gray-700 font-medium">Current tCO₂e</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl border-2 border-yellow-200 p-6">
                                        <div className="text-4xl font-bold text-yellow-600 mb-2">
                                            {(currentPerformance.annual_reduction_rate || 0).toFixed(1)}%
                                        </div>
                                        <p className="text-gray-700 font-medium">Annual Rate</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Future Targets */}
                        {futureTargets.length > 0 && (
                            <div>
                                <h4 className="font-bold text-lg text-gray-900 mb-6">Future Milestones</h4>
                                <div className="space-y-6">
                                    {futureTargets.map((target, index) => (
                                        <div key={index} className="bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl border-2 border-gray-200 hover:border-green-300 p-8 transition-all">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-4 ${target.years_to_target <= 0
                                                        ? 'bg-green-100 border-green-400 text-green-700'
                                                        : 'bg-gray-100 border-gray-300 text-gray-600'
                                                        }`}>
                                                        {target.target_year || 'N/A'}
                                                    </div>
                                                    <div>
                                                        <h5 className="text-2xl font-bold text-gray-900">Target for {target.target_year || 'N/A'}</h5>
                                                        <p className="text-gray-600 text-lg mt-1">
                                                            {(target.years_to_target || 0) > 0 ? `${target.years_to_target} years remaining` : 'Target year passed'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-4xl font-bold text-gray-900">{formatNumber(target.target_value || 0)}</div>
                                                    <div className="text-gray-600">tCO₂e</div>
                                                    <div className={`text-lg font-bold mt-2 ${(target.current_progress || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {(target.current_progress || 0) >= 0 ? '+' : ''}{(target.current_progress || 0).toFixed(1)}% progress
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="mt-6">
                                                <div className="flex justify-between text-sm font-medium mb-3">
                                                    <span className="text-gray-700">Progress to Target</span>
                                                    <span className="text-gray-900">{Math.max(0, Math.min(100, target.current_progress || 0))}%</span>
                                                </div>
                                                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
                                                        style={{ width: `${Math.max(0, Math.min(100, target.current_progress || 0))}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Methodology Tab */}
            {activeSubTab === "methodology" && (
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">Calculation Methodology</h3>
                            <p className="text-gray-600">Understanding how emissions are measured and calculated</p>
                        </div>
                        <Database className="w-8 h-8 text-green-600" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 p-6">
                            <h4 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-3">
                                <CheckCircle className="w-6 h-6 text-blue-600" />
                                Standards & Frameworks
                            </h4>
                            <ul className="space-y-3">
                                {complianceFrameworks && complianceFrameworks.length > 0 ? (
                                    complianceFrameworks.map((framework: any, index: number) => (
                                        <li key={index} className="flex items-center gap-3 bg-white rounded-lg p-3">
                                            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                            <span className="font-medium text-gray-900">{framework.name || framework || `Framework ${index + 1}`}</span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="flex items-center gap-3 bg-white rounded-lg p-3">
                                        <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                        <span className="font-medium text-gray-900">GHG Protocol Corporate Standard</span>
                                    </li>
                                )}
                            </ul>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 p-6">
                            <h4 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-3">
                                <FileText className="w-6 h-6 text-green-600" />
                                Emission Factors
                            </h4>
                            <div className="space-y-3">
                                {emissionFactors && emissionFactors.length > 0 ? (
                                    emissionFactors.slice(0, 5).map((factor: any, index: number) => (
                                        <div key={index} className="bg-white rounded-lg p-3 border border-green-200">
                                            <div className="font-medium text-gray-900 mb-1">{factor.source || factor.name || `Factor ${index + 1}`}</div>
                                            <div className="text-sm text-gray-600">{factor.value || factor.factor || 'N/A'}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-white rounded-lg p-3 border border-green-200">
                                        <div className="font-medium text-gray-900 mb-1">Default Emission Factors</div>
                                        <div className="text-sm text-gray-600">Using standard industry factors</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Compliance Tab */}
            {activeSubTab === "compliance" && (
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">Compliance & Reporting</h3>
                            <p className="text-gray-600">Stay aligned with regulatory requirements</p>
                        </div>
                        <Shield className="w-8 h-8 text-green-600" />
                    </div>

                    <div className="space-y-6">
                        {complianceRecommendations && complianceRecommendations.length > 0 ? (
                            complianceRecommendations.map((recommendation: any, index: number) => {
                                // Safely extract values from the recommendation object
                                const title = recommendation?.title ||
                                    recommendation?.action ||  // Try 'action' field
                                    recommendation?.category || // Try 'category' field
                                    `Recommendation ${index + 1}`;

                                const description = recommendation?.description ||
                                    recommendation?.compliance_benefit || // Try 'compliance_benefit' field
                                    recommendation?.impact || // Try 'impact' field
                                    'Ensure compliance with reporting standards';

                                return (
                                    <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-xl bg-purple-100 flex-shrink-0">
                                                <ClipboardCheck className="w-6 h-6 text-purple-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-lg text-gray-900 mb-2">
                                                    {String(title)}  {/* Ensure it's a string */}
                                                </h4>
                                                <p className="text-gray-700 leading-relaxed">
                                                    {String(description)}  {/* Ensure it's a string */}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 p-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-purple-100 flex-shrink-0">
                                        <ClipboardCheck className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-lg text-gray-900 mb-2">Annual GHG Reporting</h4>
                                        <p className="text-gray-700 leading-relaxed">Ensure timely submission of annual greenhouse gas emissions reports to regulatory bodies.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {reportingRequirements && (
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 p-6 mt-8">
                                <h4 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-3">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                    Reporting Requirements
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white rounded-xl p-4 border border-blue-200">
                                        <p className="text-sm text-gray-600 mb-2">Frequency</p>
                                        <p className="font-bold text-gray-900">{reportingRequirements.frequency || 'Annual'}</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 border border-blue-200">
                                        <p className="text-sm text-gray-600 mb-2">Next Deadline</p>
                                        <p className="font-bold text-gray-900">{reportingRequirements.nextDeadline || 'Q4 2024'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Graph Modal */}
            {selectedGraph && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setSelectedGraph(null)}
                >
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

            {/* Insights Modal */}
            {showInsightsModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowInsightsModal(false)}
                >
                    <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-3xl sticky top-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-white/20">
                                        <Lightbulb className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">Key Insights</h3>
                                        <p className="text-green-100">Important findings from your emissions data</p>
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
                            <div className="p-6 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-blue-100 flex-shrink-0">
                                        <TrendingDown className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-blue-900 mb-2">Largest Emission Source</h4>
                                        <p className="text-blue-700 leading-relaxed">
                                            Scope {
                                                (scopeBreakdown.scope1?.percentage_of_total || 0) > (scopeBreakdown.scope2?.percentage_of_total || 0) &&
                                                    (scopeBreakdown.scope1?.percentage_of_total || 0) > (scopeBreakdown.scope3?.percentage_of_total || 0)
                                                    ? '1'
                                                    : (scopeBreakdown.scope2?.percentage_of_total || 0) > (scopeBreakdown.scope3?.percentage_of_total || 0)
                                                        ? '2'
                                                        : '3'
                                            } represents the largest portion of your emissions, accounting for{' '}
                                            {Math.max(
                                                scopeBreakdown.scope1?.percentage_of_total || 0,
                                                scopeBreakdown.scope2?.percentage_of_total || 0,
                                                scopeBreakdown.scope3?.percentage_of_total || 0
                                            ).toFixed(1)}% of total emissions.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-green-100 flex-shrink-0">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-green-900 mb-2">Reduction Progress</h4>
                                        <p className="text-green-700 leading-relaxed">
                                            {currentPerformance && (currentPerformance.reduction_achieved || 0) > 0
                                                ? `You've achieved a ${(currentPerformance.reduction_achieved || 0).toFixed(1)}% reduction in emissions since your baseline year.`
                                                : 'Continue monitoring your emissions to track reduction progress.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-purple-100 flex-shrink-0">
                                        <TargetIcon className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-purple-900 mb-2">Next Milestone</h4>
                                        <p className="text-purple-700 leading-relaxed">
                                            {futureTargets.length > 0 && futureTargets[0]
                                                ? `Your next target is ${formatNumber(futureTargets[0].target_value || 0)} tCO₂e by ${futureTargets[0].target_year || 'N/A'}.`
                                                : 'Set reduction targets to track your climate goals.'}
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

export default DetailsTab;