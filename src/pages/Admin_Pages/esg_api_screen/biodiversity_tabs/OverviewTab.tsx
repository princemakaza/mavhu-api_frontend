import { useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
} from 'chart.js';
import {
    PieChart as RechartsPieChart,
    Cell,
    ResponsiveContainer,
    LineChart as RechartsLineChart,
    Line as RechartsLine,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend as RechartsLegend,

    BarChart,
    Bar,
    Pie,
    ComposedChart,
} from "recharts";
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Icons
import {

    Activity as ActivityIcon,
    ArrowRight,
    Trees,
    MapPin,
    Eye,
    TrendingUp,
    TrendingDown,
    Building,
    Target,
    Globe,
    PieChart as PieChartIcon,
    AreaChart as AreaChartIcon,
    BarChart3,
    LineChart as LineChartIcon,
    Map,
    Info,
    Shield,
    CheckCircle,
    AlertCircle,
    X,
    Maximize2,
    Download,
    Share2,

    Calculator,
    Cloud,
    Users,
    Settings,
    AlertTriangle,
    Flame,
    LandPlot,
    Sprout,
} from "lucide-react";

// Service functions and types (updated)
import {
    BiodiversityLandUseResponse,
    getReportingPeriod,
    getCurrentYear,
    getBaselineYear,
    getMetricSnapshot,
    getAreaOfInterestMetadata,
    getCoordinatesForMapping,
    getSummaryStatistics,
    getKeyPerformanceIndicators,
    getDataQuality,
    getSourceInformation,
    getAudit,
    getGriReferences,

    type Company,
    type YearlyMetricSnapshot,
} from "../../../../services/Admin_Service/esg_apis/biodiversity_api_service";

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
);

// Local GraphDisplay component (styled like soil carbon version)
const GraphDisplay = ({ title, description, icon, children, onClick, onInfoClick }: any) => {
    return (
        <div
            className="bg-white rounded-3xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
            onClick={onClick}
        >
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-green-100">
                            {icon}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                            <p className="text-gray-600 text-sm">{description}</p>
                        </div>
                    </div>
                    {onInfoClick && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onInfoClick();
                            }}
                            className="p-2 rounded-lg hover:bg-green-200 transition-all"
                        >
                            <Info className="w-5 h-5" style={{ color: '#22c55e' }} />
                        </button>
                    )}
                </div>
            </div>
            <div className="p-8 h-80">
                {children}
            </div>
        </div>
    );
};

interface OverviewTabProps {
    biodiversityData: BiodiversityLandUseResponse | null;
    selectedCompany: Company | null;
    formatNumber: (num: number) => string;
    formatCurrency: (num: number) => string;
    formatPercent: (num: number) => string;
    getTrendIcon: (trend: string) => JSX.Element;
    selectedYear: number | null;
    availableYears: number[];
    loading: boolean;
    isRefreshing: boolean;
    onMetricClick: (metric: any, modalType: string) => void;
    onCalculationClick: (calculationType: string, data?: any) => void;
    colors: {
        primary: string;
        secondary: string;
        lightGreen: string;
        darkGreen: string;
        emerald: string;
        lime: string;
        background: string;
    };
}

const OverviewTab = ({
    biodiversityData,
    selectedCompany,
    formatNumber,
    formatCurrency,
    formatPercent,
    getTrendIcon,
    onMetricClick,
    onCalculationClick,
    colors,
}: OverviewTabProps) => {
    // Extract data using accessors
    const reportingPeriod = biodiversityData ? getReportingPeriod(biodiversityData) : null;
    const currentYear = biodiversityData ? getCurrentYear(biodiversityData) : new Date().getFullYear();
    const baselineYear = biodiversityData ? getBaselineYear(biodiversityData) : currentYear - 3;
    const summaryStats = biodiversityData ? getSummaryStatistics(biodiversityData) : null;
    const kpi = biodiversityData ? getKeyPerformanceIndicators(biodiversityData) : null;
    const dataQuality = biodiversityData ? getDataQuality(biodiversityData) : null;
    const sourceInfo = biodiversityData ? getSourceInformation(biodiversityData) : null;
    const audit = biodiversityData ? getAudit(biodiversityData) : null;
    const griRefs = biodiversityData ? getGriReferences(biodiversityData) : [];

    // Coordinates and area info (priority: selectedCompany, then API data)
    const areaOfInterest = selectedCompany?.area_of_interest_metadata ||
        (biodiversityData ? getAreaOfInterestMetadata(biodiversityData) : null);
    const coordinates = areaOfInterest?.coordinates || [];
    const areaName = areaOfInterest?.name || "Project Area";
    const areaCovered = areaOfInterest?.area_covered || "N/A";

    // Get all analysis years
    const years = reportingPeriod?.analysis_years || [];

    // Helper to extract numeric value for a metric in a given year
    const getYearlyValue = (year: number, category: string, metricName: string): number | null => {
        if (!biodiversityData) return null;
        const snapshot = getMetricSnapshot(biodiversityData, year, category as any, metricName);
        return snapshot?.numeric_value ?? null;
    };

    // Build chart data arrays
    const chartData = {
        // Agricultural Land Trend (Area Under Cane)
        caneAreaData: years.map(year => ({
            year,
            value: getYearlyValue(year, 'agricultural_land', 'Area Under Cane') ?? 0,
        })).filter(d => d.value > 0),

        // Total Agricultural Land (Cane + Orchards)
        totalAgriData: years.map(year => ({
            year,
            value: getYearlyValue(year, 'agricultural_land', 'Total Agricultural Land (Cane + Orchards)') ?? 0,
        })).filter(d => d.value > 0),

        // LPG Distributed
        lpgData: years.map(year => ({
            year,
            value: getYearlyValue(year, 'fuelwood_substitution', 'LPG Distributed (kg)') ?? 0,
        })).filter(d => d.value > 0),

        // Surveyed Land Area (only 2024,2025 likely)
        surveyedData: years.map(year => ({
            year,
            value: getYearlyValue(year, 'land_tenure', 'Total Surveyed Land Area') ?? 0,
        })).filter(d => d.value > 0),

        // Cane vs Orchards for latest year
        landUseComposition: (() => {
            const latestYear = years.length ? Math.max(...years) : currentYear;
            const totalAgri = getYearlyValue(latestYear, 'agricultural_land', 'Total Agricultural Land (Cane + Orchards)') ?? 0;
            const cane = getYearlyValue(latestYear, 'agricultural_land', 'Area Under Cane') ?? 0;
            const orchards = getYearlyValue(latestYear, 'agricultural_land', 'Area Under Fruit Orchards') ?? 0;
            const surveyed = getYearlyValue(latestYear, 'land_tenure', 'Total Surveyed Land Area') ?? 0;
            const nonAgri = surveyed > totalAgri ? surveyed - totalAgri : 0;

            return [
                { name: 'Cane', value: cane, color: colors.primary },
                { name: 'Orchards', value: orchards, color: colors.emerald },
                { name: 'Non-Agricultural', value: nonAgri, color: colors.lime },
            ].filter(item => item.value > 0);
        })(),

        // Agricultural Land Comparison (stacked bar: cane + orchards)
        agriComparisonData: years.map(year => ({
            year,
            cane: getYearlyValue(year, 'agricultural_land', 'Area Under Cane') ?? 0,
            orchards: getYearlyValue(year, 'agricultural_land', 'Area Under Fruit Orchards') ?? 0,
        })).filter(d => d.cane > 0 || d.orchards > 0),
    };

    // Latest values for hero cards
    const latestYear = years.length ? Math.max(...years) : currentYear;
    const latestTotalAgri = getYearlyValue(latestYear, 'agricultural_land', 'Total Agricultural Land (Cane + Orchards)') ?? 0;
    const latestLpg = getYearlyValue(latestYear, 'fuelwood_substitution', 'LPG Distributed (kg)') ?? 0;
    const latestSurveyed = getYearlyValue(latestYear, 'land_tenure', 'Total Surveyed Land Area') ?? 0;
    const baselineTotalAgri = getYearlyValue(baselineYear, 'agricultural_land', 'Total Agricultural Land (Cane + Orchards)') ?? latestTotalAgri;
    const agriChangePercent = baselineTotalAgri ? ((latestTotalAgri - baselineTotalAgri) / baselineTotalAgri) * 100 : 0;

    // Graph colors
    const graphColors = {
        cane: colors.primary,
        orchards: colors.emerald,
        lpg: colors.lime,
        surveyed: colors.secondary,
        nonAgri: colors.lightGreen,
    };

    // Custom tooltip
    const customTooltipFormatter = (value: any, name: string) => {
        if (name === 'cane' || name === 'orchards' || name === 'value') {
            return [`${formatNumber(value)} ha`, name];
        }
        if (name === 'lpg' || name === 'LPG') {
            return [`${formatNumber(value)} kg`, name];
        }
        return [`${value}`, name];
    };

    // Handle clicks
    const handleMetricClick = (metric: any, title: string, calcType?: string) => {
        if (calcType) {
            onCalculationClick(calcType, metric);
        }
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Company Details Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200" style={{ background: `linear-gradient(to right, ${colors.primary}15, ${colors.emerald}15)` }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm">
                                <Building className="w-5 h-5" style={{ color: colors.primary }} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-0.5">{selectedCompany?.name || "Company"}</h2>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-100 text-green-800 font-medium">
                                        {selectedCompany?.industry || "Industry"}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 font-medium">
                                        {selectedCompany?.country || "Country"}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-medium">
                                        {selectedCompany?.esg_data_status || "ESG Status"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-600 mb-0.5">Data Quality</p>
                            <p className="font-medium text-xs text-gray-900">
                                {dataQuality?.quality_score ?? 'N/A'}%
                            </p>
                        </div>
                    </div>
                </div>
                <div className="p-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Registration Number</p>
                            <p className="font-bold text-sm text-gray-900">{selectedCompany?.registrationNumber || "N/A"}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Contact Email</p>
                            <p className="font-bold text-sm text-gray-900">{selectedCompany?.email || "N/A"}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Latest ESG Report</p>
                            <p className="font-bold text-sm text-gray-900">{selectedCompany?.latest_esg_report_year || "N/A"}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Years Covered</p>
                            <p className="font-bold text-sm text-green-700">{years.length}</p>
                        </div>
                    </div>
                    {selectedCompany?.description && (
                        <div className="mt-3 p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-[10px] text-gray-600 mb-1 font-medium">Company Description</p>
                            <p className="text-xs text-gray-700 leading-relaxed">{selectedCompany.description}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Map Section */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Project Location</h3>
                            <p className="text-gray-600 flex items-center gap-2">
                                <MapPin className="w-4 h-4" style={{ color: colors.primary }} />
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
                    {coordinates.length > 0 ? (
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
                                            <h3 className="font-bold" style={{ color: colors.primary }}>{areaName}</h3>
                                            <p className="text-sm text-gray-700">Lat: {coordinates[0].lat.toFixed(4)}</p>
                                            <p className="text-sm text-gray-700">Lon: {coordinates[0].lon.toFixed(4)}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            ) : (
                                <Polygon
                                    pathOptions={{ fillColor: colors.primary, color: colors.primary, fillOpacity: 0.3, weight: 2 }}
                                    positions={coordinates.map((coord: any) => [coord.lat, coord.lon])}
                                >
                                    <Popup>
                                        <div className="p-2">
                                            <h3 className="font-bold" style={{ color: colors.primary }}>{areaName}</h3>
                                            <p className="text-sm text-gray-700">Area: {areaCovered}</p>
                                            <p className="text-sm text-gray-700">Points: {coordinates.length}</p>
                                        </div>
                                    </Popup>
                                </Polygon>
                            )}
                        </MapContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                            <div className="text-center">
                                <Map className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: colors.primary }} />
                                <p className="text-gray-500 font-medium">No location data available</p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-6 grid grid-cols-2 gap-4 bg-gray-50">
                    <div className="p-4 rounded-xl bg-white border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                            <Globe className="w-4 h-4" style={{ color: colors.primary }} />
                            Area Covered
                        </p>
                        <p className="font-bold text-lg text-gray-900">{areaCovered}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                            <Target className="w-4 h-4" style={{ color: colors.primary }} />
                            Monitoring Points
                        </p>
                        <p className="font-bold text-lg text-gray-900">{coordinates.length} coordinates</p>
                    </div>
                </div>
            </div>

            {/* Environmental Overview (Hero) */}
            <div className="relative overflow-hidden rounded-2xl p-5 shadow-2xl" style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.darkGreen})` }}>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="text-xl font-bold mb-1 text-white">Biodiversity & Land Use Overview</h2>
                            <p className="text-green-100 text-sm">Key metrics from the latest reporting year ({latestYear})</p>
                        </div>
                        <button
                            onClick={() => onCalculationClick('overview')}
                            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 text-white text-xs"
                        >
                            <Calculator className="w-3.5 h-3.5" />
                            Methodology
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Total Agricultural Land */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all group"
                            onClick={() => handleMetricClick({ value: latestTotalAgri, unit: 'ha' }, 'Total Agricultural Land', 'agricultural-land')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <LandPlot className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Agricultural Land</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {formatNumber(latestTotalAgri)} <span className="text-sm ml-1 text-green-100">ha</span>
                            </h3>
                            <div className="flex items-center justify-between">
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                    {baselineYear} baseline
                                </span>
                                <span className="text-green-100 text-[10px] flex items-center gap-1">
                                    {agriChangePercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    {Math.abs(agriChangePercent).toFixed(1)}%
                                </span>
                            </div>
                        </div>

                        {/* LPG Distributed (fuelwood substitution) */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all group"
                            onClick={() => handleMetricClick({ value: latestLpg, unit: 'kg' }, 'LPG Distributed', 'lpg')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Flame className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">LPG Distributed</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {formatNumber(latestLpg)} <span className="text-sm ml-1 text-green-100">kg</span>
                            </h3>
                            <div className="flex items-center justify-between">
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                    Fuelwood substitution
                                </span>
                                {getTrendIcon(latestLpg > (getYearlyValue(baselineYear, 'fuelwood_substitution', 'LPG Distributed (kg)') ?? 0) ? 'up' : 'down')}
                            </div>
                        </div>

                        {/* Surveyed Land Area */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all group"
                            onClick={() => handleMetricClick({ value: latestSurveyed, unit: 'ha' }, 'Surveyed Land Area', 'surveyed')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <MapPin className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Surveyed Land</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {formatNumber(latestSurveyed)} <span className="text-sm ml-1 text-green-100">ha</span>
                            </h3>
                            <div className="flex items-center justify-between">
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                    Total area
                                </span>
                                {getTrendIcon(latestSurveyed > (getYearlyValue(baselineYear, 'land_tenure', 'Total Surveyed Land Area') ?? 0) ? 'up' : 'down')}
                            </div>
                        </div>

                        {/* Trees Planted (from summary) */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all group"
                            onClick={() => handleMetricClick({ value: summaryStats?.total_trees_planted || 0, unit: 'trees' }, 'Trees Planted', 'trees')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Trees className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Trees Planted</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {formatNumber(summaryStats?.total_trees_planted || 0)} <span className="text-sm ml-1 text-green-100">trees</span>
                            </h3>
                            <div className="flex items-center justify-between">
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                    Cumulative
                                </span>
                                <span className="text-green-100 text-[10px]">since {baselineYear}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Graphs Grid (2 columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Graph 1: Agricultural Land Trend (Area Under Cane) */}
                {chartData.caneAreaData.length > 0 && (
                    <GraphDisplay
                        title="Agricultural Land Trend"
                        description="Area Under Cane (hectares) over years"
                        icon={<LineChartIcon className="w-6 h-6" style={{ color: colors.primary }} />}
                        onClick={() => { }}
                        onInfoClick={() => onCalculationClick('cane-trend', { description: 'Yearly sugarcane cultivation area' })}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsLineChart data={chartData.caneAreaData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="year" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                    formatter={(value: any) => [`${formatNumber(value)} ha`, 'Area']}
                                />
                                <RechartsLine
                                    type="monotone"
                                    dataKey="value"
                                    stroke={graphColors.cane}
                                    strokeWidth={3}
                                    dot={{ fill: graphColors.cane, r: 6 }}
                                    name="Cane Area"
                                />
                            </RechartsLineChart>
                        </ResponsiveContainer>
                    </GraphDisplay>
                )}

                {/* Graph 2: LPG Distribution Trend */}
                {chartData.lpgData.length > 0 && (
                    <GraphDisplay
                        title="LPG Distribution"
                        description="Fuelwood substitution (kg) over years"
                        icon={<BarChart3 className="w-6 h-6" style={{ color: colors.primary }} />}
                        onClick={() => { }}
                        onInfoClick={() => onCalculationClick('lpg-trend', { description: 'LPG distributed to reduce deforestation' })}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData.lpgData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="year" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                    formatter={(value: any) => [`${formatNumber(value)} kg`, 'LPG']}
                                />
                                <Bar dataKey="value" fill={graphColors.lpg} radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </GraphDisplay>
                )}

                {/* Graph 3: Land Use Composition (Pie) */}
                {chartData.landUseComposition.length > 0 && (
                    <GraphDisplay
                        title="Land Use Composition"
                        description="Breakdown of surveyed land (latest year)"
                        icon={<PieChartIcon className="w-6 h-6" style={{ color: colors.primary }} />}
                        onClick={() => { }}
                        onInfoClick={() => onCalculationClick('land-use', { description: 'Agricultural vs non-agricultural land' })}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                                <Pie
                                    data={chartData.landUseComposition}
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
                                    {chartData.landUseComposition.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                    formatter={(value: any) => [`${formatNumber(value)} ha`, '']}
                                />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </GraphDisplay>
                )}

                {/* Graph 4: Surveyed Land Area Trend */}
                {chartData.surveyedData.length > 0 && (
                    <GraphDisplay
                        title="Surveyed Land Area"
                        description="Total surveyed area (hectares)"
                        icon={<AreaChartIcon className="w-6 h-6" style={{ color: colors.primary }} />}
                        onClick={() => { }}
                        onInfoClick={() => onCalculationClick('surveyed-trend', { description: 'Formally surveyed land area' })}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData.surveyedData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="year" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                    formatter={(value: any) => [`${formatNumber(value)} ha`, 'Surveyed']}
                                />
                                <Bar dataKey="value" fill={graphColors.surveyed} radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </GraphDisplay>
                )}

                {/* Graph 5: Agricultural Land Comparison (Cane vs Orchards) */}
                {chartData.agriComparisonData.length > 0 && (
                    <GraphDisplay
                        title="Agricultural Land Comparison"
                        description="Cane vs Orchards area over years"
                        icon={<BarChart3 className="w-6 h-6" style={{ color: colors.primary }} />}
                        onClick={() => { }}
                        onInfoClick={() => onCalculationClick('agri-comparison', { description: 'Breakdown of agricultural land types' })}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData.agriComparisonData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="year" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                    formatter={customTooltipFormatter}
                                />
                                <RechartsLegend />
                                <Bar dataKey="cane" fill={graphColors.cane} name="Cane" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="orchards" fill={graphColors.orchards} name="Orchards" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </GraphDisplay>
                )}
            </div>


            {/* Methodology Section */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Calculation Methodology</h3>
                        <p className="text-gray-600">How biodiversity and land use metrics are derived</p>
                    </div>
                    <Settings className="w-8 h-8" style={{ color: colors.primary }} />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div
                        className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 cursor-pointer hover:border-green-300 transition-all group"
                        onClick={() => onCalculationClick('agricultural-land', {
                            formula: 'Sum of cane and orchards area',
                            description: 'Total agricultural land under cultivation'
                        })}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-green-100">
                                <LandPlot className="w-6 h-6" style={{ color: colors.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Agricultural Land</h4>
                        </div>
                        <p className="text-gray-700 mb-4">Area under cane + fruit orchards</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-green-600 font-medium">Annual reported figures</span>
                            <Info className="w-5 h-5 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    <div
                        className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 cursor-pointer hover:border-blue-300 transition-all group"
                        onClick={() => onCalculationClick('lpg', {
                            formula: 'Cumulative distribution',
                            description: 'LPG provided to reduce firewood consumption'
                        })}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-blue-100">
                                <Flame className="w-6 h-6" style={{ color: colors.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Fuelwood Substitution</h4>
                        </div>
                        <p className="text-gray-700 mb-4">LPG distributed (kg) to households</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-600 font-medium">Annual reported totals</span>
                            <Info className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    <div
                        className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 cursor-pointer hover:border-purple-300 transition-all group"
                        onClick={() => onCalculationClick('surveyed', {
                            formula: 'Formal land surveys',
                            description: 'Total surveyed area within the estate'
                        })}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-purple-100">
                                <MapPin className="w-6 h-6" style={{ color: colors.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Surveyed Land</h4>
                        </div>
                        <p className="text-gray-700 mb-4">Area formally surveyed (ha)</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-purple-600 font-medium">Annual figures</span>
                            <Info className="w-5 h-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                </div>
                <div className="mt-6">
                    <button
                        onClick={() => onCalculationClick('full-methodology', {
                            note: 'All data extracted from annual reports and integrated reports.'
                        })}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 hover:border-green-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <span className="font-semibold text-gray-700">View Complete Methodology</span>
                        <ArrowRight className="w-5 h-5 text-green-600" />
                    </button>
                </div>
            </div>

            {/* API & Data Information */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">API & Data Information</h3>
                        <p className="text-gray-600">System versions and data sources</p>
                    </div>
                    <Shield className="w-8 h-8" style={{ color: colors.primary }} />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">API Version</p>
                        <p className="font-bold text-lg text-gray-900">{biodiversityData?.data.metadata.api_version || "N/A"}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">Calculation Version</p>
                        <p className="font-bold text-lg text-gray-900">{biodiversityData?.data.metadata.calculation_version || "N/A"}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">GEE Adapter</p>
                        <p className="font-bold text-lg text-gray-900">{biodiversityData?.data.metadata.gee_adapter_version || "N/A"}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                        <p className="text-sm text-gray-600 mb-2">Data Sources</p>
                        <p className="font-bold text-lg text-green-700">{sourceInfo?.source_files?.length || 0} files</p>
                    </div>
                </div>
                <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-3 font-medium">Source Files</p>
                    <div className="flex flex-wrap gap-2">
                        {sourceInfo?.source_files?.map((file, idx) => (
                            <span key={idx} className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 font-medium">
                                {file.name} ({file.year})
                            </span>
                        )) || <span className="text-gray-500">No source files available</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;