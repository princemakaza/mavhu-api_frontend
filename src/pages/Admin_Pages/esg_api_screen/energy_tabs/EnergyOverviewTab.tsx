import React, { useState, useMemo, useEffect } from 'react';
import {
    Zap,
    Battery,
    Sunset,
    Factory,
    Wind,
    Droplet,
    AlertTriangle,
    Target,
    Shield,
    Globe,
    MapPin,
    Maximize2,
    Download,
    Share2,
    Info,
    PieChart as PieChartIcon,
    AreaChart as AreaChartIcon,
    LineChart as LineChartIcon,
    BarChart as BarChartIcon,
    Radar,
    Activity,
    CheckCircle,
    AlertCircle,
    X,
    ChevronRight,
    Calculator,
    Settings,
    ArrowRight,
    Building,
    Flame,
    Sun,
    Cloud,
    BarChart3,
    TrendingUp,
    TrendingDown,
    Leaf,
    Recycle,
    Thermometer,
    RefreshCw,
} from 'lucide-react';
import {
    EnergyConsumptionResponse,
    getEnergyConsumptionSummary,
    getDetailedEnergyMetrics,
    getEnergyMixData,
    getGridOperationsData,
    getEnergyTrends,
    getAllEnergyGraphs,
    getEnergyKPIs,
    getEnergyCompanyInfo,
    type Graph,
} from '../../../../services/Admin_Service/esg_apis/energy_consumption_service';

// Import chart components
import {
    ResponsiveContainer,
    AreaChart as RechartsAreaChart,
    Area,
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
    ComposedChart,
    ScatterChart,
    Scatter,
    ZAxis
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

// Color Palette (matched to Biodiversity OverviewTab)
const PRIMARY_GREEN = '#22c55e';
const SECONDARY_GREEN = '#16a34a';
const LIGHT_GREEN = '#86efac';
const DARK_GREEN = '#15803d';
const EMERALD = '#10b981';
const LIME = '#84cc16';
const BACKGROUND_GRAY = '#f9fafb';

// Create DESIGN_SYSTEM with the exact green colors
const DESIGN_SYSTEM = {
    // Primary brand colors
    primary: {
        main: PRIMARY_GREEN,
        light: LIGHT_GREEN,
        dark: DARK_GREEN,
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
    },
    // Secondary accent colors
    secondary: {
        main: SECONDARY_GREEN,
        light: LIME,
        dark: DARK_GREEN,
        50: '#f7fee7',
        100: '#ecfccb',
    },
    // Additional green variants
    variants: {
        emerald: EMERALD,
        lime: LIME,
        lightGreen: LIGHT_GREEN,
        background: BACKGROUND_GRAY,
    },
    // Status colors
    status: {
        success: PRIMARY_GREEN,
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
    },
    // Energy-specific contextual colors
    context: {
        renewable: PRIMARY_GREEN,
        solar: '#f59e0b',
        bagasse: '#84cc16',
        wind: '#06b6d4',
        fossil: '#ef4444',
        coal: '#6b7280',
        diesel: '#92400e',
        electricity: '#3b82f6',
    },
    // Chart colors - coordinated palette
    charts: {
        primary: [PRIMARY_GREEN, EMERALD, LIGHT_GREEN, '#4ade80', '#86efac'],
        secondary: [SECONDARY_GREEN, DARK_GREEN, LIME, '#a3e635', '#d9f99d'],
        energy: [PRIMARY_GREEN, '#f59e0b', '#3b82f6', '#ef4444', '#06b6d4', '#84cc16'],
        gradient: {
            renewable: `linear-gradient(135deg, ${PRIMARY_GREEN} 0%, ${LIME} 100%)`,
            fossil: 'linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)',
            electricity: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
        }
    },
    // Neutral colors
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
    energyData: EnergyConsumptionResponse | null;
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
    getEnergyGraphs?: () => Graph[];
}

const EnergyOverviewTab: React.FC<OverviewTabProps> = ({
    energyData,
    selectedCompany,
    formatNumber,
    formatPercent,
    getTrendIcon,
    onMetricClick,
    onCalculationClick,
    selectedYear,
    availableYears,
    loading,
    isRefreshing,
    coordinates = [],
    areaName = "Energy Consumption Area",
    areaCovered = "N/A",
    colors,
    summaryMetrics,
    getEnergyGraphs
}) => {
    const [selectedGraph, setSelectedGraph] = useState<Graph | null>(null);
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

    // Extract data using service functions
    const detailedMetrics = useMemo(() => {
        if (!energyData?.data) return { renewable: [], fossil: [], electricity: [] };
        try {
            return getDetailedEnergyMetrics(energyData.data);
        } catch (error) {
            console.error('Error getting detailed metrics:', error);
            return { renewable: [], fossil: [], electricity: [] };
        }
    }, [energyData]);

    const energyMix = useMemo(() => {
        if (!energyData?.data) return null;
        try {
            return getEnergyMixData(energyData.data);
        } catch (error) {
            console.error('Error getting energy mix:', error);
            return null;
        }
    }, [energyData]);

    const gridOps = useMemo(() => {
        if (!energyData?.data) return null;
        try {
            return getGridOperationsData(energyData.data);
        } catch (error) {
            console.error('Error getting grid operations:', error);
            return null;
        }
    }, [energyData]);

    const trends = useMemo(() => {
        if (!energyData?.data) return null;
        try {
            return getEnergyTrends(energyData.data);
        } catch (error) {
            console.error('Error getting trends:', error);
            return null;
        }
    }, [energyData]);

    const kpis = useMemo(() => {
        if (!energyData?.data) return null;
        try {
            return getEnergyKPIs(energyData.data);
        } catch (error) {
            console.error('Error getting KPIs:', error);
            return null;
        }
    }, [energyData]);

    const companyInfo = useMemo(() => {
        if (!energyData?.data) return null;
        try {
            return getEnergyCompanyInfo(energyData.data);
        } catch (error) {
            console.error('Error getting company info:', error);
            return null;
        }
    }, [energyData]);

    const summary = useMemo(() => {
        if (!energyData?.data) return null;
        try {
            return getEnergyConsumptionSummary(energyData.data);
        } catch (error) {
            console.error('Error getting summary:', error);
            return null;
        }
    }, [energyData]);

    // Get all graphs (API + generated)
    const graphs = useMemo(() => {
        if (!energyData?.data) return [];
        try {
            return getAllEnergyGraphs(energyData.data);
        } catch (error) {
            console.error('Error getting graphs:', error);
            return [];
        }
    }, [energyData]);

    // Get reporting year
    const reportingYear = energyData?.data?.reporting_period?.year || selectedYear || new Date().getFullYear();

    // Get area of interest from selected company
    const companyAreaOfInterest = selectedCompany?.area_of_interest_metadata || companyInfo?.area_of_interest_metadata;
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

    // Prepare detailed metric cards
    const detailedMetricCards = [
        {
            title: "Renewable Energy",
            value: parseFloat(energyMix?.renewable_sources?.percentage || "0"),
            unit: "%",
            icon: <Sunset className="w-5 h-5" />,
            color: currentColors.primary,
            metrics: detailedMetrics.renewable
        },
        {
            title: "Fossil Fuels",
            value: parseFloat(energyMix?.fossil_sources?.percentage || "0"),
            unit: "%",
            icon: <Factory className="w-5 h-5" />,
            color: DESIGN_SYSTEM.context.fossil,
            metrics: detailedMetrics.fossil
        },
        {
            title: "Electricity Generated",
            value: parseFloat(gridOps?.electricity_generated_mwh || "0"),
            unit: "MWH",
            icon: <Zap className="w-5 h-5" />,
            color: DESIGN_SYSTEM.context.electricity,
            metrics: detailedMetrics.electricity
        },
        {
            title: "Carbon Emissions",
            value: energyData?.data?.carbon_emissions?.emissions?.totals?.net_total_emission_tco2e || 0,
            unit: "tCO₂e",
            icon: <Cloud className="w-5 h-5" />,
            color: DESIGN_SYSTEM.neutral[600],
            metrics: []
        }
    ];

    if (!energyData || !energyData.data) {
        return (
            <div className="text-center py-12">
                <Zap className="w-16 h-16 mx-auto mb-4" style={{ color: DESIGN_SYSTEM.neutral[300] }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: DESIGN_SYSTEM.neutral[700] }}>No Energy Data Available</h3>
                <p style={{ color: DESIGN_SYSTEM.neutral[500] }}>Select a company to view energy consumption and renewables data</p>
            </div>
        );
    }

    const handleMetricClick = (metric: any, title: string) => {
        setSelectedMetric({ ...metric, title });
        setShowMetricModal(true);
    };

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
                                        {selectedCompany?.industry || companyInfo?.industry || "Energy"}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 font-medium">
                                        {selectedCompany?.country || companyInfo?.country || "Country"}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-medium">
                                        {reportingYear}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-600 mb-0.5">Renewable Share</p>
                            <p className="font-medium text-xs" style={{ color: currentColors.primary }}>
                                {parseFloat(energyMix?.renewable_sources?.percentage || "0").toFixed(1)}%
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
                            <p className="text-[10px] text-gray-600 mb-0.5">Total Energy</p>
                            <p className="font-bold text-sm text-gray-900">
                                {formatNumber(summary?.totalEnergyConsumption || 0)} GJ
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Metrics Analyzed</p>
                            <p className="font-bold text-sm text-gray-900">
                                {energyData.data.energy_consumption_data?.metrics?.length || 0}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Data Quality</p>
                            <p className="font-bold text-sm" style={{ color: currentColors.primary }}>
                                {energyData.data.data_quality?.completeness_score || 0}%
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
                            <h2 className="text-xl font-bold mb-1 text-white">Energy Consumption & Renewables Dashboard</h2>
                            <p className="text-emerald-50 text-sm">Comprehensive energy management and sustainability tracking</p>
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
                        {/* Total Energy Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClick(summary, 'Total Energy Consumption')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Zap className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Total Energy</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {formatNumber(summary?.totalEnergyConsumption || 0)}
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                GJ
                            </span>
                        </div>

                        {/* Renewable Energy Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClick(energyMix?.renewable_sources, 'Renewable Energy')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Sunset className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Renewable Energy</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {parseFloat(energyMix?.renewable_sources?.percentage || "0").toFixed(1)}%
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                {trends && getTrendIcon(trends.renewable_energy_adoption)}
                                Trend
                            </span>
                        </div>

                        {/* Grid Self-Sufficiency Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClick(gridOps, 'Grid Operations')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Battery className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Grid Self-Sufficiency</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {gridOps?.grid_self_sufficiency_percentage?.toFixed(1) || "0"}%
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                Grid
                            </span>
                        </div>

                        {/* Carbon Emissions Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClick(kpis, 'Carbon Emissions')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Cloud className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Carbon Emissions</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {formatNumber(energyData?.data?.carbon_emissions?.emissions?.totals?.net_total_emission_tco2e || 0)}
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                tCO₂e
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Section */}
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
                    {finalCoordinates.length > 0 ? (
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
                                                    <span className="font-semibold">Latitude:</span> {finalCoordinates[0].lat.toFixed(6)}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Longitude:</span> {finalCoordinates[0].lon.toFixed(6)}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Renewable Energy:</span> {parseFloat(energyMix?.renewable_sources?.percentage || "0").toFixed(1)}%
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Grid Self-Sufficiency:</span> {gridOps?.grid_self_sufficiency_percentage?.toFixed(1) || "0"}%
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
                                                    <span className="font-semibold">Renewable Energy:</span> {parseFloat(energyMix?.renewable_sources?.percentage || "0").toFixed(1)}%
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Grid Self-Sufficiency:</span> {gridOps?.grid_self_sufficiency_percentage?.toFixed(1) || "0"}%
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Total Energy Consumption:</span> {formatNumber(summary?.totalEnergyConsumption || 0)} GJ
                                                </p>
                                            </div>
                                        </div>
                                    </Popup>
                                </Polygon>
                            )}
                        </MapContainer>
                    ) : (
                        <div
                            className="h-full flex items-center justify-center"
                            style={{
                                background: `linear-gradient(135deg, ${DESIGN_SYSTEM.neutral[50]} 0%, ${DESIGN_SYSTEM.neutral[100]} 100%)`
                            }}
                        >
                            <div className="text-center">
                                <MapPin
                                    className="w-16 h-16 mx-auto mb-4 opacity-20"
                                    style={{ color: currentColors.primary }}
                                />
                                <p className="font-medium" style={{ color: DESIGN_SYSTEM.neutral[500] }}>
                                    No location data available
                                </p>
                                <p className="text-sm mt-2" style={{ color: DESIGN_SYSTEM.neutral[400] }}>
                                    {selectedCompany?.name
                                        ? `No area of interest configured for ${selectedCompany.name}`
                                        : 'Please select a company with location data'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-6 grid grid-cols-2 gap-4 bg-gray-50">
                    <div className="p-4 rounded-xl bg-white border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                            <Globe className="w-4 h-4" style={{ color: currentColors.primary }} />
                            Area Covered
                        </p>
                        <p className="font-bold text-lg text-gray-900">{companyAreaCovered}</p>
                        {selectedCompany?.name && (
                            <p className="text-xs text-gray-500 mt-1">{selectedCompany.name}</p>
                        )}
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                            <Target className="w-4 h-4" style={{ color: currentColors.primary }} />
                            Monitoring Points
                        </p>
                        <p className="font-bold text-lg text-gray-900">{finalCoordinates.length} {finalCoordinates.length === 1 ? 'point' : 'points'}</p>
                        {finalCoordinates.length > 1 && (
                            <p className="text-xs text-gray-500 mt-1">Polygon boundary</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Graphs Grid (2 columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {graphs.map((graph, index) => {
                    // Determine icon based on graph title or type
                    let icon = <BarChart3 className="w-5 h-5" style={{ color: currentColors.primary }} />;
                    if (graph.type === 'pie' || graph.title.toLowerCase().includes('mix')) {
                        icon = <PieChartIcon className="w-5 h-5" style={{ color: currentColors.primary }} />;
                    } else if (graph.type === 'line' || graph.title.toLowerCase().includes('trend') || graph.title.toLowerCase().includes('adoption')) {
                        icon = <LineChartIcon className="w-5 h-5" style={{ color: currentColors.primary }} />;
                    } else if (graph.type === 'bar' && graph.title.toLowerCase().includes('fossil')) {
                        icon = <Flame className="w-5 h-5" style={{ color: DESIGN_SYSTEM.context.fossil }} />;
                    } else if (graph.type === 'bar' && graph.title.toLowerCase().includes('electricity')) {
                        icon = <Zap className="w-5 h-5" style={{ color: DESIGN_SYSTEM.context.electricity }} />;
                    }

                    return (
                        <GraphDisplay
                            key={index}
                            title={graph.title}
                            description={graph.description}
                            icon={icon}
                            onClick={() => setSelectedGraph(graph)}
                            onInfoClick={() => onCalculationClick(graph.title, { description: graph.description })}
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                {graph.type === 'pie' ? (
                                    <RechartsPieChart>
                                        <Pie
                                            data={graph.labels.map((label, i) => ({
                                                name: label,
                                                value: graph.datasets[0]?.data?.[i] || 0,
                                            }))}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {graph.labels.map((_, idx) => (
                                                <Cell
                                                    key={`cell-${idx}`}
                                                    fill={graph.datasets[0]?.backgroundColor?.[idx] || currentColors.primary}
                                                />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                    </RechartsPieChart>
                                ) : graph.type === 'line' ? (
                                    <RechartsLineChart data={graph.labels.map((label, i) => ({
                                        label,
                                        ...graph.datasets.reduce((acc, ds) => ({ ...acc, [ds.label || 'value']: ds.data[i] }), {})
                                    }))}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={DESIGN_SYSTEM.neutral[200]} />
                                        <XAxis dataKey="label" stroke={DESIGN_SYSTEM.neutral[400]} style={{ fontSize: '12px' }} />
                                        <YAxis stroke={DESIGN_SYSTEM.neutral[400]} style={{ fontSize: '12px' }} />
                                        <RechartsTooltip />
                                        <RechartsLegend />
                                        {graph.datasets.map((ds, idx) => (
                                            <Line
                                                key={idx}
                                                type="monotone"
                                                dataKey={ds.label || 'value'}
                                                stroke={ds.borderColor as string || currentColors.primary}
                                                strokeWidth={2}
                                                dot={{ fill: ds.borderColor as string || currentColors.primary, r: 4 }}
                                            />
                                        ))}
                                    </RechartsLineChart>
                                ) : (
                                    <RechartsBarChart data={graph.labels.map((label, i) => ({
                                        label,
                                        ...graph.datasets.reduce((acc, ds) => ({ ...acc, [ds.label || 'value']: ds.data[i] }), {})
                                    }))}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={DESIGN_SYSTEM.neutral[200]} />
                                        <XAxis dataKey="label" stroke={DESIGN_SYSTEM.neutral[400]} style={{ fontSize: '12px' }} />
                                        <YAxis stroke={DESIGN_SYSTEM.neutral[400]} style={{ fontSize: '12px' }} />
                                        <RechartsTooltip />
                                        <RechartsLegend />
                                        {graph.datasets.map((ds, idx) => (
                                            <Bar
                                                key={idx}
                                                dataKey={ds.label || 'value'}
                                                fill={Array.isArray(ds.backgroundColor) ? ds.backgroundColor[idx % ds.backgroundColor.length] : ds.backgroundColor || currentColors.primary}
                                                radius={[8, 8, 0, 0]}
                                            />
                                        ))}
                                    </RechartsBarChart>
                                )}
                            </ResponsiveContainer>
                        </GraphDisplay>
                    );
                })}
            </div>

            {/* Key Statistics Summary */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold" style={{ color: currentColors.primary }}>
                        Energy Performance Indicators
                    </h3>
                    <Activity className="w-5 h-5" style={{ color: DESIGN_SYSTEM.neutral[500] }} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: currentColors.primary }}>
                            {formatNumber(parseFloat(energyMix?.total_energy_gj || "0"))}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Total Energy (GJ)
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.context.solar }}>
                            {formatNumber(parseFloat(energyMix?.renewable_sources?.generation_gj || "0"))}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Renewable Energy (GJ)
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.context.fossil }}>
                            {formatNumber(parseFloat(energyMix?.fossil_sources?.consumption_gj || "0"))}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Fossil Energy (GJ)
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.context.electricity }}>
                            {formatNumber(parseFloat(gridOps?.electricity_generated_mwh || "0"))}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Electricity Generated (MWH)
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: currentColors.secondary }}>
                            {formatNumber(parseFloat(gridOps?.net_grid_import_mwh || "0"))}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Net Grid Import (MWH)
                        </p>
                    </div>
                </div>
            </div>

            {/* Energy Trends Section */}
            {trends && (
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">Energy Trends & Insights</h3>
                            <p className="text-gray-600">Key trends and performance indicators for {reportingYear}</p>
                        </div>
                        <TrendingUp className="w-8 h-8" style={{ color: currentColors.primary }} />
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-green-100">
                                    <Sunset className="w-6 h-6" style={{ color: currentColors.primary }} />
                                </div>
                                <h4 className="font-bold text-lg text-gray-900">Renewable Adoption</h4>
                            </div>
                            <p className="text-gray-700 mb-4">
                                <span className="font-semibold" style={{ color: currentColors.primary }}>
                                    {trends.renewable_energy_adoption}
                                </span> trend in renewable energy adoption compared to previous year.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-blue-100">
                                    <Recycle className="w-6 h-6" style={{ color: DESIGN_SYSTEM.status.info }} />
                                </div>
                                <h4 className="font-bold text-lg text-gray-900">Clean Energy Transition</h4>
                            </div>
                            <p className="text-gray-700 mb-4">
                                <span className="font-semibold" style={{ color: DESIGN_SYSTEM.status.info }}>
                                    {trends.clean_energy_transition}
                                </span> progress in transitioning to cleaner energy sources.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-yellow-100">
                                    <Zap className="w-6 h-6" style={{ color: DESIGN_SYSTEM.status.warning }} />
                                </div>
                                <h4 className="font-bold text-lg text-gray-900">Energy Efficiency</h4>
                            </div>
                            <p className="text-gray-700 mb-4">
                                <span className="font-semibold" style={{ color: DESIGN_SYSTEM.status.warning }}>
                                    {trends.energy_efficiency}
                                </span> improvement in energy efficiency measures.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Methodology Section */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Calculation Methodology</h3>
                        <p className="text-gray-600">Understand how energy metrics are calculated</p>
                    </div>
                    <Settings className="w-8 h-8" style={{ color: currentColors.primary }} />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div
                        className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 cursor-pointer hover:border-green-300 transition-all group"
                        onClick={() =>
                            onCalculationClick("renewable-percentage", {
                                formula: "(Renewable Energy GJ / Total Energy GJ) × 100",
                                description: "Percentage of energy from renewable sources",
                            })
                        }
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-green-100">
                                <Sunset className="w-6 h-6" style={{ color: currentColors.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Renewable Percentage</h4>
                        </div>
                        <p className="text-gray-700 mb-4">Percentage of total energy from renewable sources</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: currentColors.primary, fontWeight: 500 }}>
                                Formula: Renewable/Total × 100
                            </span>
                            <Info className="w-5 h-5" style={{ color: currentColors.primary, opacity: 0, transition: 'opacity 0.2s' }} />
                        </div>
                    </div>

                    <div
                        className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 cursor-pointer hover:border-blue-300 transition-all group"
                        onClick={() =>
                            onCalculationClick("grid-self-sufficiency", {
                                formula: "(Electricity Generated / Total Electricity Used) × 100",
                                description: "Percentage of electricity needs met by self-generation",
                            })
                        }
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-blue-100">
                                <Battery className="w-6 h-6" style={{ color: DESIGN_SYSTEM.status.info }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Grid Self-Sufficiency</h4>
                        </div>
                        <p className="text-gray-700 mb-4">Ability to meet electricity needs through self-generation</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-600 font-medium">
                                Formula: Self-gen/Total Used × 100
                            </span>
                            <Info className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    <div
                        className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 cursor-pointer hover:border-purple-300 transition-all group"
                        onClick={() =>
                            onCalculationClick("carbon-intensity", {
                                formula: "Total Carbon Emissions / Total Energy Consumption",
                                description: "Carbon emitted per unit of energy consumed",
                            })
                        }
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-purple-100">
                                <Cloud className="w-6 h-6" style={{ color: '#8b5cf6' }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Carbon Intensity</h4>
                        </div>
                        <p className="text-gray-700 mb-4">Carbon emissions per unit of energy consumed</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-purple-600 font-medium">
                                Formula: CO₂ / Energy
                            </span>
                            <Info className="w-5 h-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                </div>
                <div className="mt-6">
                    <button
                        onClick={() => onCalculationClick('full-methodology')}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 hover:border-green-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <span className="font-semibold text-gray-700">View Complete Methodology</span>
                        <ArrowRight className="w-5 h-5" style={{ color: currentColors.primary }} />
                    </button>
                </div>
            </div>

            {/* API Version & Data Source Information */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">API & Data Information</h3>
                        <p className="text-gray-600">System versions and data sources</p>
                    </div>
                    <Shield className="w-8 h-8" style={{ color: currentColors.primary }} />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">API Version</p>
                        <p className="font-bold text-lg text-gray-900">{energyData.data.versions.api}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">Calculation Version</p>
                        <p className="font-bold text-lg text-gray-900">{energyData.data.versions.calculation}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">GEE Adapter Version</p>
                        <p className="font-bold text-lg text-gray-900">{energyData.data.versions.gee_adapter}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                        <p className="text-sm text-gray-600 mb-2">Data Sources</p>
                        <p className="font-bold text-lg text-green-700">{energyData.data.company.data_source.length}</p>
                    </div>
                </div>
                <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-3 font-medium">Data Sources Used</p>
                    <div className="flex flex-wrap gap-2">
                        {energyData.data.company.data_source.map((source: string, index: number) => (
                            <span key={index} className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 font-medium">
                                {source}
                            </span>
                        ))}
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
                            <div className="h-[500px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    {selectedGraph.type === 'pie' ? (
                                        <RechartsPieChart>
                                            <Pie
                                                data={selectedGraph.labels.map((label, i) => ({
                                                    name: label,
                                                    value: selectedGraph.datasets[0]?.data?.[i] || 0,
                                                }))}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                                outerRadius={150}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {selectedGraph.labels.map((_, idx) => (
                                                    <Cell
                                                        key={`cell-${idx}`}
                                                        fill={selectedGraph.datasets[0]?.backgroundColor?.[idx] || currentColors.primary}
                                                    />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip />
                                        </RechartsPieChart>
                                    ) : selectedGraph.type === 'line' ? (
                                        <RechartsLineChart data={selectedGraph.labels.map((label, i) => ({
                                            label,
                                            ...selectedGraph.datasets.reduce((acc, ds) => ({ ...acc, [ds.label || 'value']: ds.data[i] }), {})
                                        }))}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={DESIGN_SYSTEM.neutral[200]} />
                                            <XAxis dataKey="label" stroke={DESIGN_SYSTEM.neutral[400]} style={{ fontSize: '12px' }} />
                                            <YAxis stroke={DESIGN_SYSTEM.neutral[400]} style={{ fontSize: '12px' }} />
                                            <RechartsTooltip />
                                            <RechartsLegend />
                                            {selectedGraph.datasets.map((ds, idx) => (
                                                <Line
                                                    key={idx}
                                                    type="monotone"
                                                    dataKey={ds.label || 'value'}
                                                    stroke={ds.borderColor as string || currentColors.primary}
                                                    strokeWidth={2}
                                                    dot={{ fill: ds.borderColor as string || currentColors.primary, r: 4 }}
                                                />
                                            ))}
                                        </RechartsLineChart>
                                    ) : (
                                        <RechartsBarChart data={selectedGraph.labels.map((label, i) => ({
                                            label,
                                            ...selectedGraph.datasets.reduce((acc, ds) => ({ ...acc, [ds.label || 'value']: ds.data[i] }), {})
                                        }))}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={DESIGN_SYSTEM.neutral[200]} />
                                            <XAxis dataKey="label" stroke={DESIGN_SYSTEM.neutral[400]} style={{ fontSize: '12px' }} />
                                            <YAxis stroke={DESIGN_SYSTEM.neutral[400]} style={{ fontSize: '12px' }} />
                                            <RechartsTooltip />
                                            <RechartsLegend />
                                            {selectedGraph.datasets.map((ds, idx) => (
                                                <Bar
                                                    key={idx}
                                                    dataKey={ds.label || 'value'}
                                                    fill={Array.isArray(ds.backgroundColor) ? ds.backgroundColor[idx % ds.backgroundColor.length] : ds.backgroundColor || currentColors.primary}
                                                    radius={[8, 8, 0, 0]}
                                                />
                                            ))}
                                        </RechartsBarChart>
                                    )}
                                </ResponsiveContainer>
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
                                        {typeof selectedMetric.value === 'number' ? selectedMetric.value.toFixed(2) : selectedMetric.value}
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
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnergyOverviewTab;