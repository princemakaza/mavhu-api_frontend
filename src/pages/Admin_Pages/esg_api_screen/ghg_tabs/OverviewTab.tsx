import React, { useState } from "react";
import {
    PieChart as RechartsPieChart,
    Pie,
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
    BarChart as RechartsBarChart,
    Bar as RechartsBar,
    ComposedChart,
} from "recharts";
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
    Thermometer,
    Factory,
    Zap,
    Wind,
    Scale,
    Target as TargetIcon,
    Award,
    AlertOctagon,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    TrendingDown,
    Building,
    Globe,
    MapPin,
    Shield,
    Info,
    X,
    Download,
    Share2,
    Leaf,
    Sun,
    Droplet,
    Activity,
    BarChart3,
    LineChart as LineChartIcon,
    PieChart as PieChartIcon,
    AreaChart as AreaChartIcon,
    Radar as RadarIcon,
} from "lucide-react";
import {
    getGhgSummary,
    getScopeBreakdown,
    getConfidenceAssessment,
    getSummary,
    getIntensityAnalysis,
    getReductionTargets,
    getCurrentPerformance,
    getFutureTargets,
    getAllGhgGraphData,
    getGhgCompany,
    getCurrentYear,
} from "../../../../services/Admin_Service/esg_apis/ghg_emmision";
import type { GhgEmissionResponse } from "../../../../services/Admin_Service/esg_apis/ghg_emmision";

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

interface OverviewTabProps {
    ghgData: GhgEmissionResponse;
    themeClasses: ThemeClasses;
    chartColors: ChartColors;
    logoGreen: string;
    logoYellow: string;
    isDarkMode: boolean;
    coordinates: any[];
    areaName: string;
    areaCovered: string;
}

// Modern Color Palette
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
    scope1: '#3b82f6',       // Blue for Direct Emissions
    scope2: '#eab308',       // Yellow for Energy
    scope3: '#a855f7',       // Purple for Value Chain
};

// Simplified Graph Display Component
const GraphCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    children: React.ReactNode;
}> = ({ title, description, icon, onClick, children }) => (
    <div
        className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group"
        onClick={onClick}
    >
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 group-hover:from-green-100 group-hover:to-emerald-100 transition-all">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
                    <p className="text-sm text-gray-600">{description}</p>
                </div>
                {icon}
            </div>
        </div>
        <div className="p-6 h-80">
            {children}
        </div>
    </div>
);

const OverviewTab: React.FC<OverviewTabProps> = ({
    ghgData,
    themeClasses,
    chartColors,
    logoGreen,
    logoYellow,
    isDarkMode,
    coordinates,
    areaName,
    areaCovered,
}) => {
    const [selectedGraph, setSelectedGraph] = useState<any>(null);
    const [selectedMetric, setSelectedMetric] = useState<any>(null);
    const [showMetricModal, setShowMetricModal] = useState(false);
    const [showInsightsModal, setShowInsightsModal] = useState(false);

    // Get data using service functions
    const ghgSummary = ghgData ? getGhgSummary(ghgData) : null;
    const scopeBreakdown = ghgData ? getScopeBreakdown(ghgData) : null;
    const confidenceAssessment = ghgData ? getConfidenceAssessment(ghgData) : null;
    const summary = ghgData ? getSummary(ghgData) : null;
    const intensityAnalysis = ghgData ? getIntensityAnalysis(ghgData) : null;
    const reductionTargets = ghgData ? getReductionTargets(ghgData) : null;
    const currentPerformance = ghgData ? getCurrentPerformance(ghgData) : null;
    const futureTargets = ghgData ? getFutureTargets(ghgData) : [];
    const graphs = ghgData ? getAllGhgGraphData(ghgData) : null;
    const companyInfo = ghgData ? getGhgCompany(ghgData) : null;
    const currentYear = ghgData ? getCurrentYear(ghgData) : null;

    // Format utilities
    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US').format(num);
    };

    const formatPercentage = (num: number) => {
        return `${num.toFixed(1)}%`;
    };

    // Get trend icon
    const getTrendIcon = (trend: string) => {
        const isGood = trend.toLowerCase().includes('declining') || 
                       trend.toLowerCase().includes('decrease') || 
                       trend.toLowerCase().includes('down') ||
                       trend.toLowerCase().includes('improving');
        
        if (isGood) {
            return <TrendingDown className="w-5 h-5 text-green-600" />;
        }
        return <TrendingUp className="w-5 h-5 text-red-500" />;
    };

    // Get confidence color
    const getConfidenceColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    // Handle metric click
    const handleMetricClick = (metric: any, title: string, description: string) => {
        setSelectedMetric({ ...metric, title, description });
        setShowMetricModal(true);
    };

    // Prepare chart data
    const prepareChartData = () => {
        // Monthly emissions trend
        const monthlyData = graphs?.total_emissions_trend?.labels?.map((label: string, index: number) => ({
            month: label,
            scope1: graphs.total_emissions_trend.datasets[0]?.data[index] || 0,
            scope2: graphs.total_emissions_trend.datasets[1]?.data[index] || 0,
            scope3: graphs.total_emissions_trend.datasets[2]?.data[index] || 0,
            total: (graphs.total_emissions_trend.datasets[0]?.data[index] || 0) +
                   (graphs.total_emissions_trend.datasets[1]?.data[index] || 0) +
                   (graphs.total_emissions_trend.datasets[2]?.data[index] || 0),
        })) || [];

        // Scope breakdown for pie chart
        const scopeData = [
            { name: 'Direct Emissions', value: ghgSummary?.scope1 || 0, color: COLORS.scope1 },
            { name: 'Energy Emissions', value: ghgSummary?.scope2 || 0, color: COLORS.scope2 },
            { name: 'Supply Chain', value: ghgSummary?.scope3 || 0, color: COLORS.scope3 },
        ];

        // Intensity comparison
        const intensityData = [
            { 
                indicator: 'Your Intensity', 
                value: intensityAnalysis?.carbon_intensity || 0, 
                benchmark: intensityAnalysis?.benchmark || 0 
            },
        ];

        // Reduction progress over time
        const reductionData = futureTargets.slice(0, 5).map((target: any) => ({
            year: target.target_year,
            target: target.target_value,
            current: ghgSummary?.totalEmissions || 0,
            progress: Math.max(0, target.current_progress),
        }));

        // Performance radar
        const performanceData = [
            { 
                metric: 'Emissions', 
                score: Math.max(0, 100 - (ghgSummary?.reductionFromBaseline || 0)) 
            },
            { 
                metric: 'Intensity', 
                score: intensityAnalysis?.carbon_intensity ? 
                    Math.min(100, (intensityAnalysis.benchmark / intensityAnalysis.carbon_intensity) * 100) : 50 
            },
            { 
                metric: 'Data Quality', 
                score: confidenceAssessment?.overall_score || 0 
            },
            { 
                metric: 'Target Progress', 
                score: currentPerformance ? Math.abs(currentPerformance.reduction_achieved) : 0 
            },
        ];

        // Yearly comparison
        const yearlyData = [
            { year: (currentYear || 2024) - 2, emissions: (ghgSummary?.totalEmissions || 0) * 1.15, target: (ghgSummary?.totalEmissions || 0) * 1.1 },
            { year: (currentYear || 2024) - 1, emissions: (ghgSummary?.totalEmissions || 0) * 1.08, target: (ghgSummary?.totalEmissions || 0) * 1.05 },
            { year: currentYear || 2024, emissions: ghgSummary?.totalEmissions || 0, target: ghgSummary?.totalEmissions || 0 },
        ];

        return {
            monthlyData,
            scopeData,
            intensityData,
            reductionData,
            performanceData,
            yearlyData,
        };
    };

    const chartData = prepareChartData();

    // Graph configurations
    const overviewGraphs = [
        {
            id: 'emissions-breakdown',
            title: 'Where Your Emissions Come From',
            description: 'Simple breakdown of your carbon footprint',
            icon: <PieChartIcon className="w-6 h-6 text-green-600" />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                        <Pie
                            data={chartData.scopeData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={120}
                            dataKey="value"
                        >
                            {chartData.scopeData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <RechartsTooltip
                            contentStyle={{ 
                                backgroundColor: '#ffffff', 
                                border: '1px solid #d1d5db', 
                                borderRadius: '0.75rem',
                                padding: '12px'
                            }}
                            formatter={(value: any) => [`${formatNumber(value)} tons`, '']}
                        />
                    </RechartsPieChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'monthly-trend',
            title: 'Your Emissions Over Time',
            description: 'Track your monthly carbon footprint',
            icon: <AreaChartIcon className="w-6 h-6 text-green-600" />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.monthlyData}>
                        <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                            dataKey="month" 
                            stroke="#6b7280" 
                            style={{ fontSize: '12px' }}
                            tick={{ fill: '#6b7280' }}
                        />
                        <YAxis 
                            stroke="#6b7280" 
                            style={{ fontSize: '12px' }}
                            tick={{ fill: '#6b7280' }}
                        />
                        <RechartsTooltip
                            contentStyle={{ 
                                backgroundColor: '#ffffff', 
                                border: '1px solid #d1d5db', 
                                borderRadius: '0.75rem',
                                padding: '12px'
                            }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="total" 
                            stroke={COLORS.primary} 
                            fillOpacity={1} 
                            fill="url(#colorTotal)" 
                            strokeWidth={3} 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'scope-comparison',
            title: 'Emissions by Category',
            description: 'Compare different emission sources',
            icon: <BarChart3 className="w-6 h-6 text-green-600" />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={chartData.scopeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                            dataKey="name" 
                            stroke="#6b7280" 
                            style={{ fontSize: '11px' }}
                            tick={{ fill: '#6b7280' }}
                        />
                        <YAxis 
                            stroke="#6b7280" 
                            style={{ fontSize: '12px' }}
                            tick={{ fill: '#6b7280' }}
                        />
                        <RechartsTooltip
                            contentStyle={{ 
                                backgroundColor: '#ffffff', 
                                border: '1px solid #d1d5db', 
                                borderRadius: '0.75rem',
                                padding: '12px'
                            }}
                            formatter={(value: any) => [`${formatNumber(value)} tons`, 'Emissions']}
                        />
                        <RechartsBar dataKey="value" radius={[8, 8, 0, 0]}>
                            {chartData.scopeData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </RechartsBar>
                    </RechartsBarChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'performance-radar',
            title: 'Your Sustainability Score',
            description: 'Overall environmental performance',
            icon: <RadarIcon className="w-6 h-6 text-green-600" />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={chartData.performanceData}>
                        <PolarGrid stroke="#d1d5db" />
                        <PolarAngleAxis 
                            dataKey="metric" 
                            style={{ fontSize: '12px', fill: '#6b7280' }}
                        />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar 
                            name="Performance" 
                            dataKey="score" 
                            stroke={COLORS.primary} 
                            fill={COLORS.primary} 
                            fillOpacity={0.6} 
                            strokeWidth={2} 
                        />
                        <RechartsTooltip
                            contentStyle={{ 
                                backgroundColor: '#ffffff', 
                                border: '1px solid #d1d5db', 
                                borderRadius: '0.75rem',
                                padding: '12px'
                            }}
                            formatter={(value: any) => [`${value.toFixed(0)}%`, 'Score']}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'reduction-progress',
            title: 'Your Reduction Journey',
            description: 'Progress towards emission goals',
            icon: <LineChartIcon className="w-6 h-6 text-green-600" />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={chartData.reductionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                            dataKey="year" 
                            stroke="#6b7280" 
                            style={{ fontSize: '12px' }}
                            tick={{ fill: '#6b7280' }}
                        />
                        <YAxis 
                            stroke="#6b7280" 
                            style={{ fontSize: '12px' }}
                            tick={{ fill: '#6b7280' }}
                        />
                        <RechartsTooltip
                            contentStyle={{ 
                                backgroundColor: '#ffffff', 
                                border: '1px solid #d1d5db', 
                                borderRadius: '0.75rem',
                                padding: '12px'
                            }}
                        />
                        <RechartsLegend />
                        <RechartsLine 
                            type="monotone" 
                            dataKey="target" 
                            stroke={COLORS.primary} 
                            name="Target" 
                            strokeWidth={3} 
                            dot={{ fill: COLORS.primary, r: 5 }} 
                        />
                        <RechartsLine 
                            type="monotone" 
                            dataKey="current" 
                            stroke={COLORS.info} 
                            name="Current" 
                            strokeWidth={3} 
                            dot={{ fill: COLORS.info, r: 5 }}
                            strokeDasharray="5 5"
                        />
                    </RechartsLineChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'yearly-comparison',
            title: 'Year-Over-Year Progress',
            description: 'Compare your emissions across years',
            icon: <BarChart3 className="w-6 h-6 text-green-600" />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData.yearlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                            dataKey="year" 
                            stroke="#6b7280" 
                            style={{ fontSize: '12px' }}
                            tick={{ fill: '#6b7280' }}
                        />
                        <YAxis 
                            stroke="#6b7280" 
                            style={{ fontSize: '12px' }}
                            tick={{ fill: '#6b7280' }}
                        />
                        <RechartsTooltip
                            contentStyle={{ 
                                backgroundColor: '#ffffff', 
                                border: '1px solid #d1d5db', 
                                borderRadius: '0.75rem',
                                padding: '12px'
                            }}
                        />
                        <RechartsLegend />
                        <RechartsBar 
                            dataKey="emissions" 
                            fill={COLORS.info} 
                            name="Actual Emissions" 
                            radius={[8, 8, 0, 0]} 
                        />
                        <RechartsLine 
                            type="monotone" 
                            dataKey="target" 
                            stroke={COLORS.primary} 
                            name="Target" 
                            strokeWidth={3} 
                            dot={{ fill: COLORS.primary, r: 6 }} 
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            )
        },
    ];

    if (!ghgSummary || !scopeBreakdown) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Thermometer className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 text-lg">Loading your environmental data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 p-8 md:p-12 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-2">Your Carbon Footprint</h2>
                            <p className="text-green-100 text-lg">Understanding your environmental impact made simple</p>
                        </div>
                        <button
                            onClick={() => setShowInsightsModal(true)}
                            className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
                        >
                            <Zap className="w-5 h-5" />
                            Get Insights
                        </button>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Total Emissions */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 cursor-pointer hover:bg-white/20 transition-all group"
                            onClick={() => handleMetricClick(
                                { value: ghgSummary.totalEmissions, trend: ghgSummary.reductionFromBaseline > 0 ? 'decreasing' : 'increasing' },
                                'Total Carbon Footprint',
                                'This is the total amount of greenhouse gases you emit'
                            )}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white/20">
                                    <Thermometer className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex items-center gap-2">
                                    {getTrendIcon(ghgSummary.reductionFromBaseline > 0 ? 'decreasing' : 'increasing')}
                                </div>
                            </div>
                            <h3 className="text-4xl font-bold mb-2">
                                {formatNumber(ghgSummary.totalEmissions)}
                                <span className="text-xl ml-1 text-green-100">tons</span>
                            </h3>
                            <p className="text-green-100 mb-3">Total Carbon Emitted</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${ghgSummary.reductionFromBaseline > 0 ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'}`}>
                                {ghgSummary.reductionFromBaseline > 0 ? '↓' : '↑'} {Math.abs(ghgSummary.reductionFromBaseline).toFixed(1)}% vs baseline
                            </span>
                        </div>

                        {/* Scope 1 - Direct Emissions */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 cursor-pointer hover:bg-white/20 transition-all group"
                            onClick={() => handleMetricClick(
                                { value: ghgSummary.scope1, trend: scopeBreakdown.scope1.trend },
                                'Direct Emissions',
                                'Emissions from sources you own or control, like company vehicles'
                            )}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white/20">
                                    <Factory className="w-6 h-6 text-white" />
                                </div>
                                {getTrendIcon(scopeBreakdown.scope1.trend)}
                            </div>
                            <h3 className="text-4xl font-bold mb-2">
                                {formatNumber(ghgSummary.scope1)}
                                <span className="text-xl ml-1 text-green-100">tons</span>
                            </h3>
                            <p className="text-green-100 mb-3">From Your Operations</p>
                            <span className="inline-block px-3 py-1 rounded-full text-xs bg-white/20 text-white font-medium">
                                {scopeBreakdown.scope1.percentage_of_total.toFixed(0)}% of total
                            </span>
                        </div>

                        {/* Scope 2 - Energy */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 cursor-pointer hover:bg-white/20 transition-all group"
                            onClick={() => handleMetricClick(
                                { value: ghgSummary.scope2, trend: scopeBreakdown.scope2.trend },
                                'Energy Emissions',
                                'Emissions from electricity and heating you purchase'
                            )}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white/20">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                                {getTrendIcon(scopeBreakdown.scope2.trend)}
                            </div>
                            <h3 className="text-4xl font-bold mb-2">
                                {formatNumber(ghgSummary.scope2)}
                                <span className="text-xl ml-1 text-green-100">tons</span>
                            </h3>
                            <p className="text-green-100 mb-3">From Energy Use</p>
                            <span className="inline-block px-3 py-1 rounded-full text-xs bg-white/20 text-white font-medium">
                                {scopeBreakdown.scope2.percentage_of_total.toFixed(0)}% of total
                            </span>
                        </div>

                        {/* Scope 3 - Supply Chain */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 cursor-pointer hover:bg-white/20 transition-all group"
                            onClick={() => handleMetricClick(
                                { value: ghgSummary.scope3, trend: scopeBreakdown.scope3.trend },
                                'Supply Chain Emissions',
                                'Emissions from your suppliers, products, and services'
                            )}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white/20">
                                    <Wind className="w-6 h-6 text-white" />
                                </div>
                                {getTrendIcon(scopeBreakdown.scope3.trend)}
                            </div>
                            <h3 className="text-4xl font-bold mb-2">
                                {formatNumber(ghgSummary.scope3)}
                                <span className="text-xl ml-1 text-green-100">tons</span>
                            </h3>
                            <p className="text-green-100 mb-3">From Supply Chain</p>
                            <span className="inline-block px-3 py-1 rounded-full text-xs bg-white/20 text-white font-medium">
                                {scopeBreakdown.scope3.percentage_of_total.toFixed(0)}% of total
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map & Confidence Score Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Your Location</h3>
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
                        {coordinates && coordinates.length > 0 ? (
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
                                    <Globe className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p className="text-gray-500 font-medium">Location data not available</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-6 grid grid-cols-2 gap-4 bg-gray-50">
                        <div className="p-4 rounded-xl bg-white border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-green-600" />
                                Coverage Area
                            </p>
                            <p className="font-bold text-lg text-gray-900">{areaCovered}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                                <TargetIcon className="w-4 h-4 text-green-600" />
                                Data Points
                            </p>
                            <p className="font-bold text-lg text-gray-900">{coordinates?.length || 0} locations</p>
                        </div>
                    </div>
                </div>

                {/* Confidence & Goals Sidebar */}
                <div className="space-y-6">
                    {/* Data Confidence */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Data Quality</h3>
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-green-600" />
                                <span className={`text-3xl font-bold ${getConfidenceColor(confidenceAssessment?.overall_score || 0)}`}>
                                    {confidenceAssessment?.overall_score?.toFixed(0) || 'N/A'}%
                                </span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {confidenceAssessment && [
                                { key: 'data_completeness', label: 'Data Complete' },
                                { key: 'methodological_rigor', label: 'Accuracy' },
                                { key: 'verification_status', label: 'Verified' },
                                { key: 'temporal_coverage', label: 'Time Coverage' }
                            ].map(({ key, label }) => {
                                const value = confidenceAssessment[key as keyof typeof confidenceAssessment] as number || 0;
                                return (
                                    <div key={key}>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">{label}</span>
                                            <span className="text-sm font-bold text-gray-900">{value.toFixed(0)}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${value}%`,
                                                    backgroundColor: COLORS.primary
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                            <p className="text-sm text-gray-700 flex items-start gap-2">
                                <Info className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>{confidenceAssessment?.interpretation || 'Your data quality is being assessed'}</span>
                            </p>
                        </div>
                    </div>

                    {/* Quick Goals */}
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">Your Goals</h3>
                            <TargetIcon className="w-6 h-6" />
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm">
                                <p className="text-xs mb-1 text-green-100">Reduction Target</p>
                                <p className="text-2xl font-bold">
                                    {currentPerformance?.reduction_achieved ? Math.abs(currentPerformance.reduction_achieved).toFixed(1) : '0'}%
                                </p>
                                <p className="text-xs text-green-100 mt-1">from baseline year</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm">
                                <p className="text-xs mb-1 text-green-100">Annual Rate</p>
                                <p className="text-2xl font-bold">
                                    {currentPerformance?.annual_reduction_rate?.toFixed(1) || '0'}%
                                </p>
                                <p className="text-xs text-green-100 mt-1">per year</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">Paris Agreement</p>
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                <p className="font-bold mt-1">
                                    {reductionTargets?.alignment?.paris_agreement || 'Not assessed'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Grid - All 6 Graphs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {overviewGraphs.map((graph) => (
                    <GraphCard
                        key={graph.id}
                        title={graph.title}
                        description={graph.description}
                        icon={graph.icon}
                        onClick={() => setSelectedGraph(graph)}
                    >
                        {graph.component}
                    </GraphCard>
                ))}
            </div>

            {/* Company Info */}
            {companyInfo && (
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">Company Details</h3>
                            <p className="text-gray-600">About your organization</p>
                        </div>
                        <Building className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-sm text-gray-600 mb-2">Company</p>
                            <p className="font-bold text-lg text-gray-900">{companyInfo.name || 'N/A'}</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-sm text-gray-600 mb-2">Industry</p>
                            <p className="font-bold text-lg text-gray-900">{companyInfo.industry || 'N/A'}</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-sm text-gray-600 mb-2">Location</p>
                            <p className="font-bold text-lg text-gray-900">{companyInfo.country || 'N/A'}</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                            <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                                <Award className="w-4 h-4 text-green-600" />
                                Sustainability Rating
                            </p>
                            <p className="font-bold text-lg text-green-700">{companyInfo.esg_rating || 'Not Rated'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Executive Summary */}
            {summary && (
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">What This Means</h3>
                            <p className="text-gray-600">Simple summary of your impact</p>
                        </div>
                        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                            summary.outlook.toLowerCase().includes('positive') 
                                ? 'bg-green-100 text-green-800' 
                                : summary.outlook.toLowerCase().includes('neutral') 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-red-100 text-red-800'
                        }`}>
                            {summary.outlook}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100">
                            <p className="text-gray-700 leading-relaxed text-lg">
                                {summary.overall_assessment}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2 text-lg">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    What's Going Well
                                </h4>
                                <ul className="space-y-2">
                                    {summary.key_achievements.slice(0, 3).map((achievement: string, index: number) => (
                                        <li key={index} className="flex items-start gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
                                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <span className="text-green-700 font-bold text-sm">{index + 1}</span>
                                            </div>
                                            <span className="text-gray-700">{achievement}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2 text-lg">
                                    <AlertCircle className="w-5 h-5 text-orange-600" />
                                    Areas to Improve
                                </h4>
                                <ul className="space-y-2">
                                    {summary.critical_areas.slice(0, 3).map((area: string, index: number) => (
                                        <li key={index} className="flex items-start gap-3 p-3 rounded-xl bg-orange-50 border border-orange-200">
                                            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <span className="text-orange-700 font-bold text-sm">{index + 1}</span>
                                            </div>
                                            <span className="text-gray-700">{area}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {summary.next_steps && summary.next_steps.length > 0 && (
                            <div className="p-6 rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                                <h4 className="font-semibold mb-4 text-lg">Your Next Steps</h4>
                                <ul className="space-y-3">
                                    {summary.next_steps.map((step: string, index: number) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                                                {index + 1}
                                            </div>
                                            <span className="text-gray-700 pt-1">{step}</span>
                                        </li>
                                    ))}
                                </ul>
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
                    <div 
                        className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden" 
                        onClick={(e) => e.stopPropagation()}
                    >
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
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" 
                    onClick={() => setShowMetricModal(false)}
                >
                    <div 
                        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold mb-1">{selectedMetric.title}</h3>
                                    <p className="text-green-100">{selectedMetric.description}</p>
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
                                    {formatNumber(selectedMetric.value)}
                                </div>
                                <div className="text-xl text-gray-600">tons of CO₂</div>
                            </div>
                            <div className="space-y-4">
                                {selectedMetric.trend && (
                                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                                        <div className="flex items-center gap-2 text-gray-800">
                                            {getTrendIcon(selectedMetric.trend)}
                                            <span className="font-semibold">
                                                Trend: {selectedMetric.trend.includes('decreas') || selectedMetric.trend.includes('improv') ? 'Improving ✓' : 'Needs attention'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <h4 className="font-bold text-gray-900 mb-2">What You Can Do</h4>
                                    <ul className="space-y-2 text-gray-700">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span>Monitor this metric regularly to track progress</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span>Set reduction targets and action plans</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span>Explore renewable energy and efficiency improvements</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Insights Modal */}
            {showInsightsModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" 
                    onClick={() => setShowInsightsModal(false)}
                >
                    <div 
                        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-3xl sticky top-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-white/20">
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">Your Personalized Insights</h3>
                                        <p className="text-purple-100">AI-powered recommendations just for you</p>
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
                                        <TrendingDown className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900 mb-2">Great Progress!</h4>
                                        <p className="text-gray-700 leading-relaxed">
                                            Your emissions are {ghgSummary.reductionFromBaseline > 0 ? 'down' : 'up'} {Math.abs(ghgSummary.reductionFromBaseline).toFixed(1)}% 
                                            compared to your baseline. {ghgSummary.reductionFromBaseline > 0 
                                                ? "Keep up the excellent work! You're on the right track to meeting your sustainability goals." 
                                                : "There's room for improvement. Let's work together to reduce your carbon footprint."}
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
                                        <h4 className="font-bold text-lg text-gray-900 mb-2">Data Confidence</h4>
                                        <p className="text-gray-700 leading-relaxed">
                                            Your data quality score is {confidenceAssessment?.overall_score?.toFixed(0) || 'N/A'}%. 
                                            {(confidenceAssessment?.overall_score || 0) >= 80 
                                                ? " Excellent! Your data is reliable and can be trusted for important decisions." 
                                                : " There's room to improve your data collection for more accurate insights."}
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
                                        <h4 className="font-bold text-lg text-gray-900 mb-2">Quick Wins</h4>
                                        <ul className="space-y-2 text-gray-700">
                                            <li className="flex items-start gap-2">
                                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span>Switch to renewable energy sources to cut Scope 2 emissions by up to 40%</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span>Optimize your supply chain - your Scope 3 accounts for {scopeBreakdown.scope3.percentage_of_total.toFixed(0)}% of total emissions</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span>Implement energy efficiency measures in your operations</span>
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
                                        <h4 className="font-bold text-lg text-gray-900 mb-2">Industry Comparison</h4>
                                        <p className="text-gray-700 leading-relaxed">
                                            {intensityAnalysis?.performance 
                                                ? `You're performing ${intensityAnalysis.performance.toLowerCase()} compared to industry standards. `
                                                : 'Industry comparison data is being calculated. '}
                                            {intensityAnalysis?.carbon_intensity && intensityAnalysis?.benchmark 
                                                ? `Your carbon intensity is ${intensityAnalysis.carbon_intensity.toFixed(2)} vs industry average of ${intensityAnalysis.benchmark}.`
                                                : ''}
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