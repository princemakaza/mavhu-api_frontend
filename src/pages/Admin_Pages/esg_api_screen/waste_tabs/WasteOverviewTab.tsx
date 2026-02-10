import React, { useState, useMemo, useEffect } from 'react';
import {
    Trash2,
    Recycle,
    AlertTriangle,
    ShieldAlert,
    DollarSign,
    Target,
    Globe,
    MapPin,
    Download,
    Share2,
    Info,
    PieChart as PieChartIcon,
    LineChart as LineChartIcon,
    BarChart as BarChartIcon,
    Radar,
    Activity,
    CheckCircle,
    X,
    ChevronRight,
    Calculator,
    Settings,
    ArrowRight,
    Building,
    Flame,
    BarChart3,
    TrendingUp,
    TrendingDown,
    Zap,
    Cloud,
    Package,
    Cpu,
    Archive,
} from 'lucide-react';

// Import chart components
import {
    ResponsiveContainer,
    LineChart as RechartsLineChart,
    Line,
    BarChart as RechartsBarChart,
    Bar,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    RadarChart,
    Radar as RechartsRadar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    Legend as RechartsLegend,
} from 'recharts';

// Import map components
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Color Palette (matched to Energy OverviewTab)
const PRIMARY_GREEN = '#22c55e';
const SECONDARY_GREEN = '#16a34a';
const LIGHT_GREEN = '#86efac';
const DARK_GREEN = '#15803d';
const EMERALD = '#10b981';
const LIME = '#84cc16';
const BACKGROUND_GRAY = '#f9fafb';

// Create DESIGN_SYSTEM with the exact green colors
const DESIGN_SYSTEM = {
    primary: {
        main: PRIMARY_GREEN,
        light: LIGHT_GREEN,
        dark: DARK_GREEN,
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
    },
    secondary: {
        main: SECONDARY_GREEN,
        light: LIME,
        dark: DARK_GREEN,
        50: '#f7fee7',
        100: '#ecfccb',
    },
    variants: {
        emerald: EMERALD,
        lime: LIME,
        lightGreen: LIGHT_GREEN,
        background: BACKGROUND_GRAY,
    },
    status: {
        success: PRIMARY_GREEN,
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
    },
    context: {
        recycled: PRIMARY_GREEN,
        hazardous: '#ef4444',
        general: '#6b7280',
        boilerAsh: '#92400e',
        landfill: '#374151',
        incidents: '#dc2626',
        costSavings: '#10b981',
    },
    charts: {
        primary: [PRIMARY_GREEN, EMERALD, LIGHT_GREEN, '#4ade80', '#86efac'],
        secondary: [SECONDARY_GREEN, DARK_GREEN, LIME, '#a3e635', '#d9f99d'],
        waste: [PRIMARY_GREEN, '#f59e0b', '#3b82f6', '#ef4444', '#06b6d4', '#84cc16', '#8b5cf6', '#ec4899'],
    },
    neutral: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
    }
};

interface GraphDisplayProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    onClick?: () => void;
    onInfoClick?: () => void;
}

const GraphDisplay: React.FC<GraphDisplayProps> = ({ title, description, icon, children, onClick, onInfoClick }) => {
    return (
        <div
            className="bg-white rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
            style={{ borderColor: DESIGN_SYSTEM.neutral[200] }}
            onClick={onClick}
        >
            <div className="p-4 border-b" style={{
                borderColor: DESIGN_SYSTEM.neutral[200],
                background: DESIGN_SYSTEM.variants.background
            }}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
                        <p className="text-sm text-gray-600">{description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {onInfoClick && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onInfoClick();
                                }}
                                className="p-2 rounded-lg hover:bg-green-100 transition-all"
                                style={{ color: DESIGN_SYSTEM.primary.main }}
                            >
                                <Info className="w-5 h-5" />
                            </button>
                        )}
                        {icon}
                    </div>
                </div>
            </div>
            <div className="p-4 h-80">{children}</div>
        </div>
    );
};

interface OverviewTabProps {
    wasteData: any;
    selectedCompany: any;
    formatNumber: (num: number | null) => string;
    formatCurrency: (num: number | null) => string;
    formatPercent: (num: number | null) => string;
    getTrendIcon: (trend: string) => React.ReactNode;
    selectedYear: number | null;
    availableYears: number[];
    loading: boolean;
    isRefreshing: boolean;
    onMetricClick: (metric: any, modalType: string) => void;
    onCalculationClick: (calculationType: string, data?: any) => void;
    coordinates?: any[];
    areaName?: string;
    areaCovered?: string;
    colors?: {
        primary: string;
        secondary: string;
        lightGreen: string;
        darkGreen: string;
        emerald: string;
        lime: string;
        background: string;
    };
    summaryMetrics?: any;
}

const WasteOverviewTab: React.FC<OverviewTabProps> = ({
    wasteData,
    selectedCompany,
    formatNumber,
    formatCurrency,
    formatPercent,
    getTrendIcon,
    onMetricClick,
    onCalculationClick,
    coordinates = [],
    areaName = "Waste Management Area",
    areaCovered = "N/A",
    colors,
}) => {
    const [selectedGraph, setSelectedGraph] = useState<any>(null);
    const [selectedMetric, setSelectedMetric] = useState<any>(null);
    const [showMetricModal, setShowMetricModal] = useState(false);

    // Use provided colors or default to DESIGN_SYSTEM
    const currentColors = colors || {
        primary: PRIMARY_GREEN,
        secondary: SECONDARY_GREEN,
        lightGreen: LIGHT_GREEN,
        darkGreen: DARK_GREEN,
        emerald: EMERALD,
        lime: LIME,
        background: BACKGROUND_GRAY,
    };

    // Get API data from wasteData
    const apiData = wasteData?.data;

    // Extract performance indicators
    const performanceIndicators = useMemo(() => {
        if (!apiData?.waste_summary?.performance_indicators) return null;
        return apiData.waste_summary.performance_indicators;
    }, [apiData]);

    // Extract waste streams
    const wasteStreams = useMemo(() => {
        if (!apiData?.waste_streams) return null;
        return apiData.waste_streams;
    }, [apiData]);

    // Extract circular economy data
    const circularEconomy = useMemo(() => {
        if (!apiData?.circular_economy) return null;
        return apiData.circular_economy;
    }, [apiData]);

    // Extract company info
    const companyInfo = useMemo(() => {
        if (!apiData?.company) return null;
        return apiData.company;
    }, [apiData]);

    // Extract incidents and targets
    const incidentsAndTargets = useMemo(() => {
        if (!apiData?.incidents_and_targets) return null;
        return apiData.incidents_and_targets;
    }, [apiData]);

    // Extract environmental metrics
    const environmentalMetrics = useMemo(() => {
        if (!apiData?.environmental_metrics) return null;
        return apiData.environmental_metrics;
    }, [apiData]);

    // Extract graphs data
    const graphsData = useMemo(() => {
        if (!apiData?.graphs) return null;
        return apiData.graphs;
    }, [apiData]);

    // Get reporting year
    const reportingYear = apiData?.year_data?.requested_year || new Date().getFullYear();

    // Calculate waste metrics from environmental metrics
    const wasteMetrics = useMemo(() => {
        if (!environmentalMetrics?.metrics) return null;

        const metrics = environmentalMetrics.metrics;

        // Get waste-related metrics
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
        };
    }, [environmentalMetrics]);

    // Get area of interest from selected company
    const companyAreaOfInterest = selectedCompany?.area_of_interest_metadata || apiData?.company?.area_of_interest_metadata;
    const finalCoordinates = companyAreaOfInterest?.coordinates || coordinates;
    const companyAreaName = companyAreaOfInterest?.name || areaName;
    const companyAreaCovered = companyAreaOfInterest?.area_covered || areaCovered;

    // Calculate map center based on coordinates
    const mapCenter = useMemo(() => {
        if (finalCoordinates.length === 0) return [0, 0];
        if (finalCoordinates.length === 1) return [finalCoordinates[0].lat, finalCoordinates[0].lon];

        // Calculate center for polygon
        const sum = finalCoordinates.reduce(
            (acc: any, coord: any) => {
                acc.lat += coord.lat;
                acc.lon += coord.lon;
                return acc;
            },
            { lat: 0, lon: 0 }
        );

        return [sum.lat / finalCoordinates.length, sum.lon / finalCoordinates.length];
    }, [finalCoordinates]);

    // Prepare chart data from API graphs
    const chartData = useMemo(() => {
        if (!graphsData) return null;

        // Waste Trend Over Time (Line Chart)
        const wasteTrendData = graphsData.waste_trend_over_time?.labels?.map((label: string, index: number) => ({
            year: label,
            total: graphsData.waste_trend_over_time.datasets[0]?.data[index] || 0,
            recycled: graphsData.waste_trend_over_time.datasets[1]?.data[index] || 0,
        })) || [];

        // Waste Breakdown (Pie Chart)
        const wasteBreakdownData = graphsData.waste_breakdown?.labels?.map((label: string, index: number) => ({
            name: label,
            value: graphsData.waste_breakdown.datasets[0]?.data[index] || 0,
            color: graphsData.waste_breakdown.datasets[0]?.backgroundColor[index] || DESIGN_SYSTEM.charts.waste[index],
        })) || [];

        // Waste Handling Methods (Bar Chart)
        const wasteHandlingData = graphsData.waste_handling_methods?.labels?.map((label: string, index: number) => ({
            method: label,
            tons: graphsData.waste_handling_methods.datasets[0]?.data[index] || 0,
            color: graphsData.waste_handling_methods.datasets[0]?.backgroundColor[index] || DESIGN_SYSTEM.charts.waste[index],
        })) || [];

        // Monthly Waste Pattern (Bar Chart)
        const monthlyWasteData = graphsData.monthly_waste_pattern?.labels?.map((label: string, index: number) => ({
            month: label,
            waste: graphsData.monthly_waste_pattern.datasets[0]?.data[index] || 0,
            recycled: graphsData.monthly_waste_pattern.datasets[1]?.data[index] || 0,
        })) || [];

        return {
            wasteTrendData,
            wasteBreakdownData,
            wasteHandlingData,
            monthlyWasteData,
        };
    }, [graphsData]);

    // Prepare detailed metric cards
    const detailedMetricCards = [
        {
            title: "Recycled Waste",
            value: wasteMetrics?.recycledWaste || 0,
            unit: "tons",
            icon: <Recycle className="w-5 h-5" />,
            color: DESIGN_SYSTEM.context.recycled,
            description: "Waste recycled excluding boiler ash",
            metricName: "Waste Management - Recycled waste (excl. Boiler Ash)"
        },
        {
            title: "Disposed Waste",
            value: wasteMetrics?.disposedWaste || 0,
            unit: "tons",
            icon: <Trash2 className="w-5 h-5" />,
            color: DESIGN_SYSTEM.context.landfill,
            description: "Waste disposed excluding boiler ash",
            metricName: "Waste Management - Disposed waste (excl. Boiler Ash)"
        },
        {
            title: "Environment Incidents",
            value: wasteMetrics?.environmentIncidents || 0,
            unit: "",
            icon: <AlertTriangle className="w-5 h-5" />,
            color: DESIGN_SYSTEM.context.incidents,
            description: "Sewage blockage, Stillage overflow, Illegal waste disposal, Out of spec emissions, Effluent spillage, Water loss",
            metricName: "Environment Incidents"
        },
        {
            title: "General Waste",
            value: wasteMetrics?.generalWaste || 0,
            unit: "tons",
            icon: <Package className="w-5 h-5" />,
            color: DESIGN_SYSTEM.context.general,
            description: "General waste produced from incidents",
            metricName: "Environment Incidents - Waste streams produced - General Waste"
        },
        {
            title: "Hazardous Waste",
            value: wasteMetrics?.hazardousWaste || 0,
            unit: "tons",
            icon: <ShieldAlert className="w-5 h-5" />,
            color: DESIGN_SYSTEM.context.hazardous,
            description: "Hazardous waste produced from incidents",
            metricName: "Environment Incidents - Waste streams produced - Hazardous waste"
        },
        {
            title: "Boiler Ash",
            value: wasteMetrics?.boilerAsh || 0,
            unit: "tons",
            icon: <Flame className="w-5 h-5" />,
            color: DESIGN_SYSTEM.context.boilerAsh,
            description: "Boiler ash produced from incidents",
            metricName: "Environment Incidents - Waste streams produced - Boiler ash"
        },
        {
            title: "Recyclable Waste",
            value: wasteMetrics?.recyclableWaste || 0,
            unit: "tons",
            icon: <Recycle className="w-5 h-5" />,
            color: DESIGN_SYSTEM.primary.light,
            description: "Recyclable waste produced from incidents",
            metricName: "Environment Incidents - Waste streams produced - Recyclable waste"
        },
        {
            title: "Waste Diversion Rate",
            value: wasteMetrics?.wasteDiversionRate || 0,
            unit: "%",
            icon: <TrendingUp className="w-5 h-5" />,
            color: currentColors.primary,
            description: "Percentage of waste diverted from landfill",
            metricName: "Calculated: (Recycled + Recyclable) / Total Waste"
        }
    ];

    // Custom Tooltip Component
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-xl shadow-lg border" style={{ borderColor: DESIGN_SYSTEM.neutral[200] }}>
                    <p className="font-semibold mb-2" style={{ color: DESIGN_SYSTEM.neutral[800] }}>{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {typeof entry.value === 'number' ? formatNumber(entry.value) : entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Define graphs using API data
    const graphs = [
        {
            id: 'waste-trend',
            title: graphsData?.waste_trend_over_time?.title || 'Waste Trend Over Time',
            description: graphsData?.waste_trend_over_time?.description || 'Tracking our waste over the years',
            icon: <LineChartIcon className="w-5 h-5" style={{ color: currentColors.primary }} />,
            component: chartData?.wasteTrendData ? (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={chartData.wasteTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DESIGN_SYSTEM.neutral[200]} />
                        <XAxis dataKey="year" stroke={DESIGN_SYSTEM.neutral[400]} />
                        <YAxis stroke={DESIGN_SYSTEM.neutral[400]} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <RechartsLegend />
                        <Line
                            type="monotone"
                            dataKey="total"
                            stroke={DESIGN_SYSTEM.context.landfill}
                            name="Total Waste"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="recycled"
                            stroke={DESIGN_SYSTEM.context.recycled}
                            name="Recycled Waste"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                    </RechartsLineChart>
                </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full">No data available</div>,
            info: 'Shows the trend of total waste and recycled waste over the years'
        },
        {
            id: 'waste-breakdown',
            title: graphsData?.waste_breakdown?.title || 'Waste Breakdown',
            description: graphsData?.waste_breakdown?.description || 'Types of waste we produce',
            icon: <PieChartIcon className="w-5 h-5" style={{ color: currentColors.primary }} />,
            component: chartData?.wasteBreakdownData ? (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                        <Pie
                            data={chartData.wasteBreakdownData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            stroke="#fff"
                            strokeWidth={2}
                        >
                            {chartData.wasteBreakdownData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                        <RechartsLegend />
                    </RechartsPieChart>
                </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full">No data available</div>,
            info: 'Shows the breakdown of waste by type'
        },
        {
            id: 'waste-handling',
            title: graphsData?.waste_handling_methods?.title || 'Waste Handling Methods',
            description: graphsData?.waste_handling_methods?.description || 'Our approaches to waste management',
            icon: <BarChartIcon className="w-5 h-5" style={{ color: currentColors.primary }} />,
            component: chartData?.wasteHandlingData ? (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={chartData.wasteHandlingData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DESIGN_SYSTEM.neutral[200]} />
                        <XAxis dataKey="method" stroke={DESIGN_SYSTEM.neutral[400]} />
                        <YAxis stroke={DESIGN_SYSTEM.neutral[400]} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Bar dataKey="tons" radius={[8, 8, 0, 0]}>
                            {chartData.wasteHandlingData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </RechartsBarChart>
                </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full">No data available</div>,
            info: 'Shows how we handle different waste types'
        },
        {
            id: 'monthly-waste',
            title: graphsData?.monthly_waste_pattern?.title || 'Monthly Waste Pattern',
            description: graphsData?.monthly_waste_pattern?.description || 'Understanding seasonal waste generation',
            icon: <BarChart3 className="w-5 h-5" style={{ color: currentColors.primary }} />,
            component: chartData?.monthlyWasteData ? (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={chartData.monthlyWasteData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DESIGN_SYSTEM.neutral[200]} />
                        <XAxis dataKey="month" stroke={DESIGN_SYSTEM.neutral[400]} />
                        <YAxis stroke={DESIGN_SYSTEM.neutral[400]} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <RechartsLegend />
                        <Bar
                            dataKey="waste"
                            name="Waste Generated"
                            radius={[8, 8, 0, 0]}
                            fill={DESIGN_SYSTEM.context.landfill}
                        />
                        <Bar
                            dataKey="recycled"
                            name="Recycled"
                            radius={[8, 8, 0, 0]}
                            fill={DESIGN_SYSTEM.context.recycled}
                        />
                    </RechartsBarChart>
                </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full">No data available</div>,
            info: 'Shows monthly waste generation and recycling patterns'
        }
    ];

    const handleMetricClick = (metric: any, title: string) => {
        setSelectedMetric({ ...metric, title });
        setShowMetricModal(true);
        onMetricClick(metric, 'waste-metric');
    };

    if (!apiData) {
        return (
            <div className="text-center py-12">
                <Trash2 className="w-16 h-16 mx-auto mb-4" style={{ color: DESIGN_SYSTEM.neutral[300] }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: DESIGN_SYSTEM.neutral[700] }}>No Waste Management Data Available</h3>
                <p style={{ color: DESIGN_SYSTEM.neutral[500] }}>Select a company to view waste management and circular economy data</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">
            {/* Company Details Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200" style={{ background: currentColors.background }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm">
                                <Building className="w-5 h-5" style={{ color: currentColors.primary }} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-0.5">
                                    {selectedCompany?.name || companyInfo?.name || "Company"}
                                </h2>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-100 text-green-800 font-medium">
                                        {selectedCompany?.industry || companyInfo?.industry || "Waste Management"}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 font-medium">
                                        {selectedCompany?.country || companyInfo?.country || "Country"}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-medium">
                                        {reportingYear}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-orange-100 text-orange-800 font-medium">
                                        Compliance: {incidentsAndTargets?.compliance_status || "Compliant"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-600 mb-0.5">Recycling Rate</p>
                            <p className="font-medium text-xs" style={{ color: currentColors.primary }}>
                                {performanceIndicators?.recycling_rate?.value || "0"}%
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Reporting Period</p>
                            <p className="font-bold text-sm text-gray-900">{reportingYear}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Total Waste</p>
                            <p className="font-bold text-sm text-gray-900">
                                {formatNumber(wasteMetrics?.totalWasteGenerated)} tons
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Metrics Analyzed</p>
                            <p className="font-bold text-sm text-gray-900">
                                {environmentalMetrics?.total_metrics || 0}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Data Quality</p>
                            <p className="font-bold text-sm" style={{ color: currentColors.primary }}>
                                {apiData.data_quality?.total_metrics || "N/A"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div
                className="relative overflow-hidden rounded-2xl p-5 shadow-2xl"
                style={{
                    background: `linear-gradient(to right, ${currentColors.darkGreen}, ${currentColors.primary})`
                }}
            >
                <div
                    className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                ></div>
                <div
                    className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                ></div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="text-xl font-bold mb-1 text-white">Waste Management & Circular Economy Dashboard</h2>
                            <p className="text-emerald-50 text-sm">Comprehensive waste management, recycling, and sustainability tracking</p>
                        </div>
                        <button
                            onClick={() => onCalculationClick("overview")}
                            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 text-white text-xs"
                        >
                            <Calculator className="w-3.5 h-3.5" />
                            How Calculated?
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Recycling Rate Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClick(performanceIndicators?.recycling_rate, 'Recycling Rate')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Recycle className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Recycling Rate</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {performanceIndicators?.recycling_rate?.value || "0"}%
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                {getTrendIcon(performanceIndicators?.recycling_rate?.trend || 'stable')}
                                {performanceIndicators?.recycling_rate?.trend || 'Trend'}
                            </span>
                        </div>

                        {/* Total Waste Generated Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClick(performanceIndicators?.total_waste, 'Total Waste')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Trash2 className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Total Waste</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {formatNumber(parseFloat(performanceIndicators?.total_waste?.value || "0"))}
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                tons
                            </span>
                        </div>

                        {/* Waste Diversion Rate Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClick(wasteMetrics, 'Waste Diversion Rate')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <TrendingUp className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Waste Diversion</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {wasteMetrics?.wasteDiversionRate?.toFixed(1) || "0"}%
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                Diversion
                            </span>
                        </div>

                        {/* Cost Savings Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClick(performanceIndicators?.cost_savings, 'Cost Savings')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <DollarSign className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Cost Savings</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {formatCurrency(parseFloat(performanceIndicators?.cost_savings?.value?.replace(',', '') || "0"))}
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                {getTrendIcon(performanceIndicators?.cost_savings?.trend || 'stable')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            {finalCoordinates.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200" style={{ background: currentColors.background }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Area of Interest</h3>
                                <p className="text-gray-600 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" style={{ color: currentColors.primary }} />
                                    {companyAreaName}
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
                        <MapContainer
                            center={mapCenter}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                            className="leaflet-container z-0"
                        >
                            <TileLayer
                                attribution='&copy; OpenStreetMap contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {finalCoordinates.length === 1 ? (
                                <Marker position={[finalCoordinates[0].lat, finalCoordinates[0].lon]}>
                                    <Popup>
                                        <div className="p-2">
                                            <h3 className="font-bold mb-2" style={{ color: currentColors.primary }}>{companyAreaName}</h3>
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Area:</span> {companyAreaCovered}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Recycling Rate:</span> {performanceIndicators?.recycling_rate?.value || "0"}%
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Total Waste:</span> {formatNumber(wasteMetrics?.totalWasteGenerated)} tons
                                                </p>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ) : (
                                <Polygon
                                    pathOptions={{
                                        fillColor: currentColors.primary,
                                        color: currentColors.primary,
                                        fillOpacity: 0.3,
                                        weight: 2
                                    }}
                                    positions={finalCoordinates.map((coord: any) => [coord.lat, coord.lon])}
                                >
                                    <Popup>
                                        <div className="p-2">
                                            <h3 className="font-bold mb-2" style={{ color: currentColors.primary }}>{companyAreaName}</h3>
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Area:</span> {companyAreaCovered}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Coordinates:</span> {finalCoordinates.length} points
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Recycling Rate:</span> {performanceIndicators?.recycling_rate?.value || "0"}%
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Total Waste:</span> {formatNumber(wasteMetrics?.totalWasteGenerated)} tons
                                                </p>
                                            </div>
                                        </div>
                                    </Popup>
                                </Polygon>
                            )}
                        </MapContainer>
                    </div>
                    <div className="p-6 grid grid-cols-2 gap-4 bg-gray-50">
                        <div className="p-4 rounded-xl bg-white border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                                <Globe className="w-4 h-4" style={{ color: currentColors.primary }} />
                                Area Covered
                            </p>
                            <p className="font-bold text-lg text-gray-900">{companyAreaCovered}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                                <Target className="w-4 h-4" style={{ color: currentColors.primary }} />
                                Monitoring Points
                            </p>
                            <p className="font-bold text-lg text-gray-900">{finalCoordinates.length} {finalCoordinates.length === 1 ? 'point' : 'points'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Key Waste Metrics Cards */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold" style={{ color: currentColors.primary }}>
                        Key Waste Management Metrics
                    </h3>
                    <BarChart3 className="w-5 h-5" style={{ color: DESIGN_SYSTEM.neutral[500] }} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {detailedMetricCards.slice(0, 8).map((card, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-xl border border-gray-200 hover:border-green-300 transition-all cursor-pointer"
                            style={{
                                background: `linear-gradient(135deg, ${DESIGN_SYSTEM.neutral[50]} 0%, ${DESIGN_SYSTEM.neutral[100]} 100%)`
                            }}
                            onClick={() => handleMetricClick(card, card.title)}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: `${card.color}20` }}>
                                    {React.cloneElement(card.icon, { style: { color: card.color } })}
                                </div>
                                <h4 className="font-bold text-lg text-gray-900">{card.title}</h4>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold mb-2" style={{ color: card.color }}>
                                    {typeof card.value === 'number' ? formatNumber(card.value) : card.value}
                                    <span className="text-lg">{card.unit}</span>
                                </div>
                                <p className="text-sm text-gray-600 truncate" title={card.description}>
                                    {card.description.length > 30 ? card.description.substring(0, 30) + '...' : card.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {graphs.map((graph) => (
                    <GraphDisplay
                        key={graph.id}
                        title={graph.title}
                        description={graph.description}
                        icon={graph.icon}
                        onClick={() => setSelectedGraph(graph)}
                        onInfoClick={() => onCalculationClick(graph.id, { description: graph.info })}
                    >
                        {graph.component}
                    </GraphDisplay>
                ))}
            </div>

            {/* Key Statistics Summary */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold" style={{ color: currentColors.primary }}>
                        Waste Performance Indicators
                    </h3>
                    <Activity className="w-5 h-5" style={{ color: DESIGN_SYSTEM.neutral[500] }} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.context.recycled }}>
                            {formatNumber(wasteMetrics?.recycledWaste || 0)}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Recycled Waste (tons)
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.context.landfill }}>
                            {formatNumber(wasteMetrics?.disposedWaste || 0)}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Disposed Waste (tons)
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.context.hazardous }}>
                            {formatNumber(wasteMetrics?.hazardousWaste || 0)}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Hazardous Waste (tons)
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.context.boilerAsh }}>
                            {formatNumber(wasteMetrics?.boilerAsh || 0)}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Boiler Ash (tons)
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: currentColors.secondary }}>
                            {formatNumber(wasteMetrics?.environmentIncidents || 0)}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Environment Incidents
                        </p>
                    </div>
                </div>
            </div>

            {/* Incidents & Zero Waste Targets Section */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Waste Incidents & Zero Waste Targets</h3>
                        <p className="text-gray-600">Incident tracking and zero waste progress for {reportingYear}</p>
                    </div>
                    <Target className="w-8 h-8" style={{ color: currentColors.primary }} />
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Recent Incidents */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" style={{ color: DESIGN_SYSTEM.context.incidents }} />
                            Recent Environment Incidents
                        </h4>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {incidentsAndTargets?.incidents?.slice(0, 5).map((incident: any) => (
                                <div key={incident.id} className="p-4 rounded-xl border border-gray-200 hover:border-red-200 transition-all">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="font-semibold text-gray-900">{incident.type}</p>
                                            <p className="text-sm text-gray-600">{incident.date} • {incident.location}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${incident.severity === 'High'
                                                ? 'bg-red-50 text-red-600'
                                                : incident.severity === 'Medium'
                                                    ? 'bg-yellow-50 text-yellow-600'
                                                    : 'bg-green-50 text-green-600'
                                            }`}>
                                            {incident.severity}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-700 mb-2">
                                        <span className="font-medium">Waste Type:</span> {incident.waste_type}
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Quantity: {incident.quantity}</span>
                                        <span className="font-medium" style={{ color: DESIGN_SYSTEM.context.incidents }}>
                                            Cost Impact: {formatCurrency(incident.cost_impact)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Zero Waste Targets */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5" style={{ color: currentColors.primary }} />
                            Zero Waste Targets Progress
                        </h4>
                        <div className="space-y-6">
                            {incidentsAndTargets?.zero_waste_targets?.targets?.slice(0, 4).map((target: any, index: number) => (
                                <div key={index} className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-900">{target.name}</span>
                                        <span className={`text-sm px-2 py-1 rounded-full ${target.status === 'On Track'
                                                ? 'bg-green-50 text-green-600'
                                                : target.status === 'At Risk'
                                                    ? 'bg-yellow-50 text-yellow-600'
                                                    : 'bg-red-50 text-red-600'
                                            }`}>
                                            {target.status}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="h-3 rounded-full transition-all duration-500"
                                            style={{
                                                width: target.current_progress || '0%',
                                                backgroundColor: target.status === 'On Track'
                                                    ? currentColors.primary
                                                    : target.status === 'At Risk'
                                                        ? DESIGN_SYSTEM.status.warning
                                                        : DESIGN_SYSTEM.status.danger
                                            }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Current: {target.current_value || '0'}</span>
                                        <span className="text-gray-600">Target: {target.target}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Circular Economy Initiatives */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Circular Economy Initiatives</h3>
                        <p className="text-gray-600">Closed-loop systems and material recovery programs</p>
                    </div>
                    <Recycle className="w-8 h-8" style={{ color: currentColors.primary }} />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-green-100">
                                <Recycle className="w-6 h-6" style={{ color: currentColors.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Materials Recovery</h4>
                        </div>
                        <p className="text-gray-700 mb-4">
                            <span className="font-semibold" style={{ color: currentColors.primary }}>
                                {formatNumber(parseFloat(circularEconomy?.metrics?.materials_recovered?.value?.toString() || "0"))}
                            </span> {circularEconomy?.metrics?.materials_recovered?.unit || 'tons'} of materials recovered
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-yellow-100">
                                <Zap className="w-6 h-6" style={{ color: DESIGN_SYSTEM.status.warning }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Waste to Energy</h4>
                        </div>
                        <p className="text-gray-700 mb-4">
                            <span className="font-semibold" style={{ color: DESIGN_SYSTEM.status.warning }}>
                                {formatNumber(parseFloat(circularEconomy?.metrics?.waste_to_energy?.value?.toString() || "0"))}
                            </span> {circularEconomy?.metrics?.waste_to_energy?.unit || '%'} converted to energy
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-blue-100">
                                <Cpu className="w-6 h-6" style={{ color: DESIGN_SYSTEM.status.info }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Closed Loop Projects</h4>
                        </div>
                        <p className="text-gray-700 mb-4">
                            <span className="font-semibold" style={{ color: DESIGN_SYSTEM.status.info }}>
                                {circularEconomy?.metrics?.closed_loop_projects?.value || 0}
                            </span> active closed-loop circular economy projects
                        </p>
                    </div>
                </div>
            </div>

            {/* Notes Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border p-6" style={{ borderColor: currentColors.lightGreen }}>
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-100">
                        <Info className="w-5 h-5" style={{ color: currentColors.primary }} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold mb-2" style={{ color: currentColors.darkGreen }}>
                            Waste Management & Circular Economy Notes
                        </h4>
                        <div className="space-y-2">
                            <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                <span className="font-semibold">Data Source:</span> HVE Integrated Report 2025
                            </p>
                            <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                <span className="font-semibold">Reporting Framework:</span> {companyInfo?.esg_reporting_framework?.join(', ') || 'Not specified'}
                            </p>
                            <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                <span className="font-semibold">Contact:</span> {companyInfo?.esg_contact_person?.name || 'N/A'} ({companyInfo?.esg_contact_person?.email || 'N/A'})
                            </p>
                        </div>
                    </div>
                </div>
            </div>

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
                        <div className="p-6 border-b border-gray-200" style={{ background: currentColors.background }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                                        {selectedGraph.title}
                                    </h3>
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
                            <div className="h-[500px]">{selectedGraph.component}</div>
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
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                        <div
                            className="p-6 border-b border-gray-200 text-white rounded-t-3xl"
                            style={{
                                background: `linear-gradient(to right, ${currentColors.primary}, ${currentColors.emerald})`
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold mb-1">{selectedMetric.title}</h3>
                                    <p className="text-emerald-50">Detailed metric information</p>
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
                            <div className="mb-8">
                                <div className="text-center">
                                    <div className="text-6xl font-bold" style={{ color: currentColors.primary }}>
                                        {typeof selectedMetric.value === 'number'
                                            ? formatNumber(selectedMetric.value)
                                            : selectedMetric.value}
                                    </div>
                                    {selectedMetric.unit && (
                                        <div className="text-xl" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                                            {selectedMetric.unit}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div
                                    className="p-4 rounded-xl border"
                                    style={{
                                        backgroundColor: `${currentColors.primary}10`,
                                        borderColor: `${currentColors.primary}30`
                                    }}
                                >
                                    <div className="flex items-center gap-2" style={{ color: currentColors.darkGreen }}>
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-semibold">Current Status</span>
                                    </div>
                                    <p className="mt-2" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                        This metric indicates the current state of {selectedMetric.title.toLowerCase()} within the monitored period.
                                    </p>
                                </div>
                                {selectedMetric.description && (
                                    <div
                                        className="p-4 rounded-xl border"
                                        style={{
                                            backgroundColor: `${DESIGN_SYSTEM.status.info}10`,
                                            borderColor: `${DESIGN_SYSTEM.status.info}30`
                                        }}
                                    >
                                        <div className="flex items-center gap-2" style={{ color: DESIGN_SYSTEM.status.info }}>
                                            <Info className="w-5 h-5" />
                                            <span className="font-semibold">Description</span>
                                        </div>
                                        <p className="mt-2" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                            {selectedMetric.description}
                                        </p>
                                    </div>
                                )}
                                {selectedMetric.metricName && (
                                    <div
                                        className="p-4 rounded-xl border"
                                        style={{
                                            backgroundColor: `${DESIGN_SYSTEM.neutral[100]}`,
                                            borderColor: `${DESIGN_SYSTEM.neutral[200]}`
                                        }}
                                    >
                                        <div className="flex items-center gap-2" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                            <Archive className="w-5 h-5" />
                                            <span className="font-semibold">Metric Source</span>
                                        </div>
                                        <p className="mt-2 text-sm" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                                            {selectedMetric.metricName}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WasteOverviewTab;