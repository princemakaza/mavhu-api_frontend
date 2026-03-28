import React, { useState, useMemo } from 'react';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Activity,
    Database,
    Calendar,
    FileText,
    Download,
    Filter,
    ChevronDown,
    ChevronUp,
    Search,
    Grid3x3,
    Table,
    BarChart2,
    PieChart,
    LineChart,
    MapPin,
    Globe,
    AlertCircle,
    Info,
    Maximize2,
    Minimize2,
    RefreshCw,
    Eye,
    EyeOff,
    Plus,
    Minus,
    ChevronLeft,
    ChevronRight,
    Grid,
    List,
    Settings,
    MoreVertical,
    Target,
    Share2,
    Building,
} from "lucide-react";

// Import types and helper functions from ESG service
import {
    type EsgDataRecord,
    type EsgMetric,
    type EsgMetricValue,
    getEnvironmentalMetricsSummary,
    getCompanyEsgSummary,
    getAvailableYears,
    getMetricsByCategory,
    compareMetricYears,
    getMetricChartData,
} from '../../../../services/Admin_Service/esg_apis/esg_environment_service';

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

// Color Palette (environmental theme - greens)
const COLORS = {
    primary: '#22c55e',       // Green-500
    primaryDark: '#16a34a',   // Green-600
    primaryLight: '#86efac',  // Green-300
    darkGreen: '#15803d',     // Green-700
    emerald: '#10b981',       // Emerald-500
    lime: '#84cc16',          // Lime-500
    background: '#f9fafb',    // Gray-50
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    purple: '#8B5CF6',
    teal: '#14B8A6',
    orange: '#F97316',
};

interface MainTabProps {
    esgData: EsgDataRecord[];
    summaryMetrics: any;
    selectedCompany: any;
    formatNumber: (num: number | null) => string;
    formatCurrency: (num: number | null) => string;
    formatPercent: (num: number | null) => string;
    getTrendIcon: (trend: string) => React.ReactNode;
    selectedYear: number | null;
    availableYears: number[];
    latestYear: number | null;
    loading: boolean;
    isRefreshing: boolean;
    onMetricClick: (metric: any, modalType: string) => void;
    onCalculationClick: (calculationType: string, data?: any) => void;
    coordinates: any[];
    areaName: string;
    areaCovered: string;
    colors: any;
    metricsByCategory: any;
    getChartData: (metricName: string) => any;
    compareYears: (year1: number, year2: number) => any[];
}

const MainTab: React.FC<MainTabProps> = ({
    esgData,
    summaryMetrics,
    selectedCompany,
    formatNumber,
    formatCurrency,
    formatPercent,
    getTrendIcon,
    selectedYear,
    availableYears,
    latestYear,
    loading,
    isRefreshing,
    onMetricClick,
    onCalculationClick,
    coordinates,
    areaName,
    areaCovered,
    colors,
    metricsByCategory,
    getChartData,
    compareYears,
}) => {
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [selectedMetricType, setSelectedMetricType] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [expandedMetric, setExpandedMetric] = useState<string | null>(null);
    const [selectedChartYear, setSelectedChartYear] = useState<number>(latestYear || new Date().getFullYear());
    const [showAllMetrics, setShowAllMetrics] = useState<boolean>(false);
    const [sortBy, setSortBy] = useState<'name' | 'value' | 'unit' | 'year'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Get environmental metrics summary
    const envSummary = useMemo(() => {
        if (!esgData.length) return null;
        return getEnvironmentalMetricsSummary(esgData);
    }, [esgData]);

    // Get available years
    const esgYears = useMemo(() => {
        if (!esgData.length) return [];
        return getAvailableYears(esgData);
    }, [esgData]);

    // Get metrics by category
    const categoryMetrics = useMemo(() => {
        if (!esgData.length) return { environmental: { metrics: [] } };
        return getMetricsByCategory(esgData);
    }, [esgData]);

    // Get all environmental metrics
    const allEnvironmentalMetrics = useMemo(() => {
        const envMetrics = categoryMetrics.environmental?.metrics || [];
        if (!searchQuery) return envMetrics;

        const query = searchQuery.toLowerCase();
        return envMetrics.filter(metric =>
            metric.metric_name.toLowerCase().includes(query) ||
            metric.description?.toLowerCase().includes(query) ||
            metric.unit?.toLowerCase().includes(query) ||
            metric.category.toLowerCase().includes(query)
        );
    }, [categoryMetrics, searchQuery]);

    // Filter metrics by type
    const filteredMetrics = useMemo(() => {
        let metrics = allEnvironmentalMetrics;

        if (selectedMetricType !== 'all') {
            metrics = metrics.filter(metric => {
                const name = metric.metric_name.toLowerCase();
                if (selectedMetricType === 'emissions') {
                    return name.includes('emission') || name.includes('ghg') || name.includes('carbon');
                } else if (selectedMetricType === 'energy') {
                    return name.includes('energy') || name.includes('consumption') || name.includes('usage');
                } else if (selectedMetricType === 'water') {
                    return name.includes('water') || name.includes('irrigation') || name.includes('treatment');
                } else if (selectedMetricType === 'waste') {
                    return name.includes('waste') || name.includes('recycl') || name.includes('dispose');
                }
                return true;
            });
        }

        // Sort metrics
        metrics.sort((a, b) => {
            let aValue = 0;
            let bValue = 0;

            switch (sortBy) {
                case 'name':
                    aValue = a.metric_name.toLowerCase();
                    bValue = b.metric_name.toLowerCase();
                    break;
                case 'value':
                    const aLatest = a.values.reduce((prev, curr) =>
                        prev.year > curr.year ? prev : curr
                    );
                    const bLatest = b.values.reduce((prev, curr) =>
                        prev.year > curr.year ? prev : curr
                    );
                    aValue = aLatest.numeric_value || 0;
                    bValue = bLatest.numeric_value || 0;
                    break;
                case 'unit':
                    aValue = a.unit?.toLowerCase() || '';
                    bValue = b.unit?.toLowerCase() || '';
                    break;
                case 'year':
                    aValue = a.values.length > 0 ? Math.max(...a.values.map(v => v.year)) : 0;
                    bValue = b.values.length > 0 ? Math.max(...b.values.map(v => v.year)) : 0;
                    break;
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return showAllMetrics ? metrics : metrics.slice(0, 10);
    }, [allEnvironmentalMetrics, selectedMetricType, sortBy, sortOrder, showAllMetrics]);

    // Get key metrics for bar chart
    const barChartMetrics = useMemo(() => {
        const keyMetrics = [
            'Carbon Emissions (Total GHG, tCO2e)',
            'GHG Scope 1 (tCO2e)',
            'GHG Scope 2 (tCO2e)',
            'GHG Scope 3 (tCO2e)',
            'Water Usage - Irrigation Water Usage',
            'Energy Consumption (Renewable) - Bagasse Usage',
            'Energy Consumption - Coal Consumption',
            'Waste Management - Recycled waste (excl. Boiler Ash)',
            'Environment Incidents',
        ];

        return keyMetrics.map(metricName => {
            const metric = allEnvironmentalMetrics.find(m => m.metric_name === metricName);
            if (!metric) return null;

            const latestValue = metric.values.reduce((prev, curr) =>
                prev.year > curr.year ? prev : curr
            );

            return {
                name: metric.metric_name,
                value: latestValue.numeric_value || 0,
                unit: metric.unit,
                trend: metric.values.length > 1 ? 'stable' : 'unknown',
            };
        }).filter(Boolean);
    }, [allEnvironmentalMetrics]);

    // Get max value for bar chart scaling
    const maxBarValue = useMemo(() => {
        if (barChartMetrics.length === 0) return 100;
        return Math.max(...barChartMetrics.map(m => m.value)) * 1.1;
    }, [barChartMetrics]);

    // Get metric type options
    const metricTypes = [
        { id: 'all', label: 'All Metrics', color: COLORS.primary },
        { id: 'emissions', label: 'Emissions', color: COLORS.teal },
        { id: 'energy', label: 'Energy', color: COLORS.orange },
        { id: 'water', label: 'Water', color: COLORS.info },
        { id: 'waste', label: 'Waste', color: COLORS.purple },
    ];

    // Handle metric click
    const handleMetricClick = (metric: EsgMetric) => {
        if (expandedMetric === metric._id) {
            setExpandedMetric(null);
        } else {
            setExpandedMetric(metric._id);
            onMetricClick(metric, 'details');
        }
    };

    // Handle year comparison
    const handleCompareYears = (year1: number, year2: number) => {
        const comparison = compareYears(year1, year2);
        onCalculationClick('year-comparison', comparison);
    };

    // Get metric value for specific year
    const getMetricValueForYear = (metric: EsgMetric, year: number): EsgMetricValue | null => {
        return metric.values.find(v => v.year === year) || null;
    };

    // Sort handler
    const handleSort = (column: typeof sortBy) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    // Get sort icon
    const getSortIcon = (column: typeof sortBy) => {
        if (sortBy !== column) return null;
        return sortOrder === 'asc' ?
            <ChevronUp className="w-4 h-4 ml-1" /> :
            <ChevronDown className="w-4 h-4 ml-1" />;
    };

    // Extract area of interest from selectedCompany
    const companyAreaOfInterest = selectedCompany?.area_of_interest_metadata;
    const companyCoordinates = companyAreaOfInterest?.coordinates || [];
    const companyAreaName = companyAreaOfInterest?.name || areaName;
    const companyAreaCovered = companyAreaOfInterest?.area_covered || areaCovered;

    // Use company coordinates first, then provided coordinates
    const finalCoordinates = companyCoordinates.length > 0 
        ? companyCoordinates 
        : coordinates;

    // Calculate map center from final coordinates
    const mapCenter: [number, number] = finalCoordinates.length > 0 
        ? [finalCoordinates[0].lat, finalCoordinates[0].lon] 
        : [0, 0];

    // Calculate total metrics
    const totalMetrics = allEnvironmentalMetrics.length;
    const metricsWithTimeSeries = allEnvironmentalMetrics.filter(m => m.values.length > 1).length;
    const uniqueUnits = new Set(allEnvironmentalMetrics.map(m => m.unit)).size;

    if (loading || isRefreshing) {
        return (
            <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 text-green-600 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600">Loading environmental data...</p>
                </div>
            </div>
        );
    }

    if (!esgData.length) {
        return (
            <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl">
                <div className="text-center max-w-md p-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                        <Database className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">No Environmental Data Available</h3>
                    <p className="text-gray-600">No ESG data found for the selected company and year.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">
            {/* Company Details Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200" style={{ background: COLORS.background }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm">
                                <Building className="w-5 h-5" style={{ color: COLORS.primary }} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-0.5">
                                    {selectedCompany?.name || "Company"}
                                </h2>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-100 text-green-800 font-medium">
                                        {selectedCompany?.industry || "Environmental"}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 font-medium">
                                        {selectedCompany?.country || "Country"}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-medium">
                                        {selectedYear || latestYear || new Date().getFullYear()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-600 mb-0.5">Data Quality</p>
                            <p className="font-medium text-xs" style={{ color: COLORS.primary }}>
                                {esgData[0]?.data_quality_score || 0}%
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Total Area</p>
                            <p className="font-bold text-sm text-gray-900">{companyAreaCovered}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Location Points</p>
                            <p className="font-bold text-sm text-gray-900">{finalCoordinates.length} {finalCoordinates.length === 1 ? 'point' : 'points'}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Reporting Years</p>
                            <p className="font-bold text-sm text-gray-900">{esgYears.length}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Metrics Available</p>
                            <p className="font-bold text-sm" style={{ color: COLORS.primary }}>
                                {totalMetrics}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Section - Green Top Section */}
            <div
                className="relative overflow-hidden rounded-2xl p-5 shadow-2xl"
                style={{
                    background: `linear-gradient(to right, ${COLORS.darkGreen}, ${COLORS.primary})`
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
                            <h2 className="text-xl font-bold mb-1 text-white">Environmental Performance Dashboard</h2>
                            <p className="text-emerald-50 text-sm">Comprehensive ESG metrics and analysis</p>
                        </div>
                        <button
                            onClick={() => onCalculationClick("overview")}
                            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 text-white text-xs"
                        >
                            <Activity className="w-3.5 h-3.5" />
                            How Calculated?
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Total Emissions Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => onMetricClick(envSummary?.total_ghg_emissions, 'Total Emissions')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Activity className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Total Emissions</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {envSummary?.total_ghg_emissions?.value ? 
                                    formatNumber(envSummary.total_ghg_emissions.value) : '---'}
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                {envSummary?.total_ghg_emissions?.unit || 'tCO2e'}
                            </span>
                        </div>

                        {/* Water Usage Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => onMetricClick(envSummary?.water_usage, 'Water Usage')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <BarChart3 className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Water Usage</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {envSummary?.water_usage?.value ? 
                                    formatNumber(envSummary.water_usage.value) : '---'}
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                {envSummary?.water_usage?.unit || 'ML'}
                            </span>
                        </div>

                        {/* Bagasse Usage Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => onMetricClick(envSummary?.bagasse_usage, 'Bagasse Usage')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <TrendingUp className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Bagasse Usage</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {envSummary?.bagasse_usage?.value ? 
                                    formatNumber(envSummary.bagasse_usage.value) : '---'}
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                {envSummary?.bagasse_usage?.unit || 'tons'}
                            </span>
                        </div>

                        {/* Waste Generated Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => onMetricClick(envSummary?.waste_generated, 'Waste Generated')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <BarChart2 className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Waste Generated</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {envSummary?.waste_generated?.value ? 
                                    formatNumber(envSummary.waste_generated.value) : '---'}
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                {envSummary?.waste_generated?.unit || 'tons'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200" style={{ background: COLORS.background }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Area of Interest</h3>
                            <p className="text-gray-600 flex items-center gap-2">
                                <MapPin className="w-4 h-4" style={{ color: COLORS.primary }} />
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
                                            <h3 className="font-bold mb-2" style={{ color: COLORS.primary }}>{companyAreaName}</h3>
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
                                                    <span className="font-semibold">Company:</span> {selectedCompany?.name}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Industry:</span> {selectedCompany?.industry}
                                                </p>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ) : (
                                <Polygon
                                    pathOptions={{
                                        fillColor: COLORS.primary,
                                        color: COLORS.primary,
                                        fillOpacity: 0.3,
                                        weight: 2
                                    }}
                                    positions={finalCoordinates.map((coord: any) => [coord.lat, coord.lon])}
                                >
                                    <Popup>
                                        <div className="p-2">
                                            <h3 className="font-bold mb-2" style={{ color: COLORS.primary }}>{companyAreaName}</h3>
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Area:</span> {companyAreaCovered}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Coordinates:</span> {finalCoordinates.length} points
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Company:</span> {selectedCompany?.name}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Industry:</span> {selectedCompany?.industry}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Country:</span> {selectedCompany?.country}
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
                                background: `linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)`
                            }}
                        >
                            <div className="text-center">
                                <MapPin
                                    className="w-16 h-16 mx-auto mb-4 opacity-20"
                                    style={{ color: COLORS.primary }}
                                />
                                <p className="font-medium text-gray-500">
                                    No location data available
                                </p>
                                <p className="text-sm mt-2 text-gray-400">
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
                            <Globe className="w-4 h-4" style={{ color: COLORS.primary }} />
                            Area Covered
                        </p>
                        <p className="font-bold text-lg text-gray-900">{companyAreaCovered}</p>
                        {selectedCompany?.name && (
                            <p className="text-xs text-gray-500 mt-1">{selectedCompany.name}</p>
                        )}
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                            <Target className="w-4 h-4" style={{ color: COLORS.primary }} />
                            Monitoring Points
                        </p>
                        <p className="font-bold text-lg text-gray-900">{finalCoordinates.length} {finalCoordinates.length === 1 ? 'point' : 'points'}</p>
                        {finalCoordinates.length > 1 && (
                            <p className="text-xs text-gray-500 mt-1">Polygon boundary</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Bar Chart Section */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Key Environmental Metrics</h3>
                        <p className="text-gray-600">Overview of major environmental performance indicators</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <select
                                value={selectedChartYear}
                                onChange={(e) => setSelectedChartYear(Number(e.target.value))}
                                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                {esgYears.map(year => (
                                    <option key={year} value={year}>
                                        {year}
                                        {year === latestYear ? ' (Latest)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={() => onCalculationClick('export-chart', { year: selectedChartYear })}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="h-80 mt-8">
                    {barChartMetrics.length > 0 ? (
                        <div className="h-full flex items-end gap-4 overflow-x-auto p-4 bg-gradient-to-b from-green-50 to-emerald-50 rounded-2xl">
                            {barChartMetrics.map((metric, index) => (
                                <div key={index} className="flex flex-col items-center flex-1 min-w-[100px]">
                                    {/* Bar */}
                                    <div className="relative w-12 mb-2">
                                        <div
                                            className="w-full rounded-t-lg transition-all duration-300 hover:opacity-90"
                                            style={{
                                                height: `${(metric.value / maxBarValue) * 100}%`,
                                                background: `linear-gradient(to top, ${COLORS.primary}, ${COLORS.emerald})`,
                                                minHeight: '20px',
                                            }}
                                            onClick={() => onMetricClick(metric, 'chart-details')}
                                        >
                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded whitespace-nowrap">
                                                {formatNumber(metric.value)}
                                                <div className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metric Name */}
                                    <div className="text-center">
                                        <p className="text-xs text-gray-600 font-medium mb-1 truncate max-w-[120px]">
                                            {metric.name.split('(')[0].trim()}
                                        </p>
                                        <p className="text-xs text-gray-500">{metric.unit}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
                            <div className="text-center">
                                <BarChart3 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                                <p className="text-gray-600">No bar chart data available</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap gap-4 justify-center">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ background: COLORS.primary }}></div>
                        <span className="text-sm text-gray-600">Emissions (tCO2e)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ background: COLORS.teal }}></div>
                        <span className="text-sm text-gray-600">Water (ML)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ background: COLORS.orange }}></div>
                        <span className="text-sm text-gray-600">Energy (tons/KWh)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ background: COLORS.purple }}></div>
                        <span className="text-sm text-gray-600">Waste (tons)</span>
                    </div>
                </div>
            </div>

            {/* Metrics Table Section */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Environmental Metrics</h3>
                        <p className="text-gray-600">Detailed breakdown of all environmental metrics</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search metrics..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        {/* View Mode */}
                        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`px-3 py-2 ${viewMode === 'table' ? 'bg-green-500 text-white' : 'bg-gray-100'}`}
                            >
                                <Table className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-green-500 text-white' : 'bg-gray-100'}`}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Metric Type Filter */}
                        <select
                            value={selectedMetricType}
                            onChange={(e) => setSelectedMetricType(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            {metricTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Metric Type Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {metricTypes.map(type => (
                        <button
                            key={type.id}
                            onClick={() => setSelectedMetricType(type.id)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedMetricType === type.id
                                ? 'text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            style={selectedMetricType === type.id ? {
                                background: type.color,
                            } : {}}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>

                {/* Table View */}
                {viewMode === 'table' ? (
                    <div className="overflow-x-auto rounded-2xl border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
                                <tr>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-green-100"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center">
                                            Metric Name
                                            {getSortIcon('name')}
                                        </div>
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-green-100"
                                        onClick={() => handleSort('unit')}
                                    >
                                        <div className="flex items-center">
                                            Unit
                                            {getSortIcon('unit')}
                                        </div>
                                    </th>
                                    {esgYears.map(year => (
                                        <th key={year} className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                                            {year}
                                            {year === latestYear && (
                                                <span className="ml-1 text-green-600">●</span>
                                            )}
                                        </th>
                                    ))}
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                                        Trend
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredMetrics.map((metric) => {
                                    const latestValue = metric.values.reduce((prev, curr) =>
                                        prev.year > curr.year ? prev : curr
                                    );
                                    const hasTrend = metric.values.length > 1;

                                    return (
                                        <tr
                                            key={metric._id}
                                            className="hover:bg-green-50 transition-colors"
                                            onClick={() => handleMetricClick(metric)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className="w-3 h-3 rounded-full mt-1.5"
                                                        style={{
                                                            background: metricTypes.find(t =>
                                                                metric.metric_name.toLowerCase().includes(t.id) ||
                                                                (t.id === 'all' ? false : metric.description?.toLowerCase().includes(t.id))
                                                            )?.color || COLORS.primary
                                                        }}
                                                    ></div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{metric.metric_name}</p>
                                                        {metric.description && (
                                                            <p className="text-sm text-gray-500 mt-1">{metric.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {metric.unit || 'N/A'}
                                                </span>
                                            </td>
                                            {esgYears.map(year => {
                                                const value = getMetricValueForYear(metric, year);
                                                return (
                                                    <td key={year} className="px-6 py-4">
                                                        {value ? (
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-gray-900">
                                                                    {value.numeric_value !== null ?
                                                                        formatNumber(value.numeric_value) :
                                                                        value.value}
                                                                </span>
                                                                {value.source_notes && (
                                                                    <span className="text-xs text-gray-500 mt-1" title={value.source_notes}>
                                                                        {value.source_notes.length > 30 ?
                                                                            `${value.source_notes.substring(0, 30)}...` :
                                                                            value.source_notes}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td className="px-6 py-4">
                                                {hasTrend ? (
                                                    <div className="flex items-center gap-2">
                                                        {getTrendIcon('stable')}
                                                        <span className="text-sm text-gray-600">
                                                            {metric.values.length} year{metric.values.length > 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">No trend</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onMetricClick(metric, 'chart');
                                                        }}
                                                        className="p-1.5 rounded-lg hover:bg-green-100 text-green-600"
                                                        title="View Chart"
                                                    >
                                                        <BarChart3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onMetricClick(metric, 'details');
                                                        }}
                                                        className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onMetricClick(metric, 'download');
                                                        }}
                                                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
                                                        title="Download Data"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {filteredMetrics.length === 0 && (
                            <div className="text-center py-12">
                                <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h4 className="text-lg font-medium text-gray-900 mb-2">No metrics found</h4>
                                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Grid View */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMetrics.map((metric) => {
                            const latestValue = metric.values.reduce((prev, curr) =>
                                prev.year > curr.year ? prev : curr
                            );
                            const metricType = metricTypes.find(t =>
                                metric.metric_name.toLowerCase().includes(t.id) ||
                                (t.id === 'all' ? false : metric.description?.toLowerCase().includes(t.id))
                            ) || metricTypes[0];

                            return (
                                <div
                                    key={metric._id}
                                    className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-6 hover:border-green-300 transition-all hover:shadow-lg cursor-pointer"
                                    onClick={() => handleMetricClick(metric)}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                                            style={{ background: `${metricType.color}20` }}
                                        >
                                            <BarChart3 className="w-5 h-5" style={{ color: metricType.color }} />
                                        </div>
                                        <span
                                            className="px-2 py-1 rounded-full text-xs font-medium"
                                            style={{
                                                background: `${metricType.color}20`,
                                                color: metricType.color
                                            }}
                                        >
                                            {metric.unit || 'N/A'}
                                        </span>
                                    </div>

                                    <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">
                                        {metric.metric_name}
                                    </h4>

                                    {metric.description && (
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {metric.description}
                                        </p>
                                    )}

                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Latest Value</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {latestValue.numeric_value !== null ?
                                                    formatNumber(latestValue.numeric_value) :
                                                    latestValue.value}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">
                                                    {metric.values.length} year{metric.values.length > 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onMetricClick(metric, 'chart');
                                                }}
                                                className="p-2 rounded-lg hover:bg-green-100 text-green-600"
                                            >
                                                <BarChart3 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Load More / Show Less */}
                {allEnvironmentalMetrics.length > 10 && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setShowAllMetrics(!showAllMetrics)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-white"
                            style={{
                                background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.darkGreen})`,
                            }}
                        >
                            {showAllMetrics ? (
                                <>
                                    <Minus className="w-4 h-4" />
                                    Show Less
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Show All {allEnvironmentalMetrics.length} Metrics
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Summary Stats */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 rounded-xl bg-green-50 border border-green-200">
                            <p className="text-2xl font-bold text-gray-900">{allEnvironmentalMetrics.length}</p>
                            <p className="text-sm text-gray-600">Total Metrics</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-blue-50 border border-blue-200">
                            <p className="text-2xl font-bold text-gray-900">{esgYears.length}</p>
                            <p className="text-sm text-gray-600">Years Available</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-purple-50 border border-purple-200">
                            <p className="text-2xl font-bold text-gray-900">
                                {new Set(allEnvironmentalMetrics.map(m => m.unit)).size}
                            </p>
                            <p className="text-sm text-gray-600">Unique Units</p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-amber-50 border border-amber-200">
                            <p className="text-2xl font-bold text-gray-900">
                                {allEnvironmentalMetrics.filter(m => m.values.length > 1).length}
                            </p>
                            <p className="text-sm text-gray-600">Time Series</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default MainTab;