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
    BarChart as RechartsBarChart,
    Bar as RechartsBar,
    ComposedChart,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
} from "recharts";
import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
    Thermometer,
    Factory,
    Zap,
    Scale,
    AlertCircle,
    CheckCircle,
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
    Activity,
    BarChart3,
    LineChart as LineChartIcon,
    PieChart as PieChartIcon,
    AreaChart as AreaChartIcon,
    Calculator,
    Cloud,
    Settings,
    Package,
    Sprout,
    ThermometerSun,
    AlertTriangle,
    Target as TargetIcon,
    Award,
    Droplet,
    Sun,
    CloudRain,
    Trees,
    Wind,
    Eye,
    Leaf,
    ArrowRight,
    Radar as RadarIcon,
    Maximize2,
    Calendar,
    Users,
    Activity as ActivityIcon,
} from "lucide-react";

// Service functions
import {
    getYieldForecastSummary,
    getRiskAssessmentSummary,
    getCompanyInfo,
    getNDVIIndicators,
    getCalculationFactors,
    getEnvironmentalMetricsSummary,
    getConfidenceScoreBreakdown,
    getSeasonalAdvisory,
    getMonthlyCarbonData,
    getCarbonEmissionData,
    getAllGraphData,
    getSatelliteIndicators,
    getReportingPeriod,
    type CropYieldForecastResponse,
    type MonthlyCarbonDataDetail,
    type CompanyInfo,
    type Coordinate,
    type AreaOfInterest,
    type Graphs,
    type Graph,
    type CarbonYearlyData,
    type ScopeData,
} from "../../../../services/Admin_Service/esg_apis/crop_yield_service";

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ─── Theme & Color Types ────────────────────────────────────────────────────
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
    cropYieldData: CropYieldForecastResponse;
    selectedCompany: any;
    formatNumber: (num: number) => string;
    formatCurrency: (num: number) => string;
    formatPercent: (num: number) => string;
    getTrendIcon: (trend: string) => JSX.Element;
    selectedYear?: number | null;
    yearRange?: { startYear: number; endYear: number };
    yearFilterType?: "range" | "single";
    availableYears?: number[];
    loading?: boolean;
    isRefreshing?: boolean;
    summaryMetrics?: any;
    onYearFilterChange?: (type: "range" | "single") => void;
    onRangeChange?: (key: string, value: number) => void;
    onClearFilters?: () => void;
    onMetricClick?: (metric: any, modalType: string) => void;
    onCalculationClick?: (calculationType: string, data?: any) => void;
    colors?: {
        primary: string;
        secondary: string;
        lightGreen: string;
        darkGreen: string;
        emerald: string;
        lime: string;
        background: string;
    };
}

// ─── Global Color Palette (Green-Themed) ────────────────────────────────────
const COLORS = {
    primary: "#22c55e",
    primaryDark: "#16a34a",
    primaryLight: "#86efac",
    secondary: "#10b981",
    accent: "#84cc16",
    success: "#22c55e",
    warning: "#eab308",
    danger: "#ef4444",
    info: "#3b82f6",
    highYield: "#10b981",
    mediumYield: "#eab308",
    lowYield: "#ef4444",
    biomass: "#22c55e",
    soc: "#8b5cf6",
    netStock: "#10b981",
    deltaBiomass: "#ef4444",
    deltaSoc: "#f59e0b",
    netChange: "#374151",
    agb: "#16a34a",
    bgb: "#d97706",
    bioCarbon: "#059669",
    ndvi: "#22c55e",
    scope1: "#ef4444", // Red for Scope 1 (direct emissions)
    scope2: "#f59e0b", // Amber for Scope 2 (indirect energy)
    scope3: "#3b82f6", // Blue for Scope 3 (other indirect)
    biomassTotal: "#059669",
    biomassPerHa: "#86efac",
    environmental: "#10b981",
    social: "#3b82f6",
    governance: "#8b5cf6",
};

// GraphCard Component
const GraphCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    onInfoClick: () => void;
    children: React.ReactNode;
}> = ({ title, description, icon, onClick, onInfoClick, children }) => (
    <div
        className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
        onClick={onClick}
    >
        <div
            className="p-4 border-b border-gray-200"
            style={{
                background: `linear-gradient(to right, ${COLORS.primary}15, ${COLORS.secondary}15)`,
            }}
        >
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
                    <p className="text-sm text-gray-600">{description}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onInfoClick();
                        }}
                        className="p-2 rounded-lg hover:bg-green-100 transition-all"
                    >
                        <Info className="w-5 h-5 text-green-600" />
                    </button>
                    {icon}
                </div>
            </div>
        </div>
        <div className="p-4 h-80">{children}</div>
    </div>
);

// Helper function to safely extract percentage values
const extractPercentageValue = (value: any): number => {
    if (!value && value !== 0) return 0;

    if (typeof value === 'string') {
        const cleaned = value.replace('%', '').trim();
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
    } else if (typeof value === 'number') {
        return value;
    } else if (typeof value === 'object' && value !== null) {
        if (typeof value.value === 'number') return value.value;
        if (typeof value.percentage === 'number') return value.percentage;
        if (typeof value.score === 'number') return value.score;
    }

    return 0;
};

// ─── Main Component ─────────────────────────────────────────────────────────
const OverviewTab: React.FC<OverviewTabProps> = ({
    cropYieldData,
    selectedCompany,
    formatNumber,
    formatCurrency,
    formatPercent,
    getTrendIcon,
    selectedYear = null,
    yearRange = { startYear: 2020, endYear: 2024 },
    yearFilterType = "range",
    availableYears = [],
    loading = false,
    isRefreshing = false,
    summaryMetrics = null,
    onYearFilterChange = () => { },
    onRangeChange = () => { },
    onClearFilters = () => { },
    onMetricClick = () => { },
    onCalculationClick = () => { },
    colors = {
        primary: "#008000",
        secondary: "#B8860B",
        lightGreen: "#86efac",
        darkGreen: "#166534",
        emerald: "#10b981",
        lime: "#84cc16",
        background: "#f0fdf4",
    },
}) => {
    const [selectedGraph, setSelectedGraph] = useState<any>(null);
    const [showMetricModal, setShowMetricModal] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState<any>(null);

    // ── Derived data from service helpers ───────────────────────────────────
    const yieldForecast = cropYieldData ? getYieldForecastSummary(cropYieldData) : null;
    const riskAssessment = cropYieldData ? getRiskAssessmentSummary(cropYieldData) : null;
    const companyInfo = cropYieldData ? getCompanyInfo(cropYieldData) : null;
    const environmentalMetrics = cropYieldData ? getEnvironmentalMetricsSummary(cropYieldData) : null;
    const ndviIndicators = cropYieldData ? getNDVIIndicators(cropYieldData) : null;
    const calculationFactors = cropYieldData ? getCalculationFactors(cropYieldData) : null;
    const confidenceScore = cropYieldData ? getConfidenceScoreBreakdown(cropYieldData) : null;
    const seasonalAdvisory = cropYieldData ? getSeasonalAdvisory(cropYieldData) : null;
    const monthlyCarbonData = cropYieldData ? getMonthlyCarbonData(cropYieldData) : [];
    const carbonEmissionData = cropYieldData ? getCarbonEmissionData(cropYieldData) : null;
    const reportingPeriod = cropYieldData ? getReportingPeriod(cropYieldData) : null;
    const satelliteIndicators = cropYieldData ? getSatelliteIndicators(cropYieldData) : null;
    const allGraphs = cropYieldData ? getAllGraphData(cropYieldData) : null;

    // Get coordinates and area info
    const companyCoordinates = companyInfo?.area_of_interest.coordinates || [];
    const cropCoordinates = companyCoordinates.length > 0 ? companyCoordinates : [];
    const cropAreaName = companyInfo?.area_of_interest?.name || "Project Area";
    const cropAreaCovered = companyInfo?.area_of_interest?.area_covered || "N/A";

    // Key metrics
    const forecastedYield = yieldForecast?.forecastedYield || 0;
    const yieldUnit = yieldForecast?.unit || "tons/ha";
    const riskLevel = riskAssessment?.riskLevel || "Low";
    const riskScore = riskAssessment?.overallScore || 0;
    const confidenceOverall = confidenceScore?.overall || 0;
    const currentSeason = seasonalAdvisory?.current_season || "N/A";

    // Calculate map center
    const mapCenter: [number, number] = cropCoordinates.length > 0 
        ? [cropCoordinates[0].lat, cropCoordinates[0].lon] 
        : [0, 0];

    // ── Prepare chart data ─────────────────────────────────────────
    const prepareChartData = () => {
        // Yearly yield data
        const yearlyYieldData = (reportingPeriod?.data_available_years || []).map(year => {
            const yearCarbonData = carbonEmissionData?.yearly_data?.find((d: CarbonYearlyData) => d.year === year);
            const sequestration = yearCarbonData?.sequestration?.annual_summary?.total_biomass_co2_t || 0;
            
            const yieldValue = sequestration > 0 ? (sequestration / 100) * (calculationFactors?.base_yield || 1) : 0;
            const potentialValue = yieldValue * 1.2;
            
            return {
                year: year,
                yield: yieldValue,
                potential: potentialValue,
                color: yieldValue > forecastedYield * 1.1 ? COLORS.highYield : 
                       yieldValue > forecastedYield * 0.9 ? COLORS.mediumYield : COLORS.lowYield
            };
        });

        // Risk distribution data
        const riskDistributionData = (riskAssessment?.detailedRisks || []).map((risk: any) => ({
            name: risk.category || 'Unknown',
            value: risk.score || 0,
            color: risk.level === 'High' ? COLORS.danger :
                   risk.level === 'Medium' ? COLORS.warning : COLORS.success,
        }));

        // Yield components breakdown
        const yieldComponentsData = calculationFactors ? [
            {
                name: 'Base Yield',
                value: extractPercentageValue(calculationFactors.base_yield),
                color: COLORS.primary
            },
            {
                name: 'NDVI Factor',
                value: extractPercentageValue(calculationFactors.ndvi_factor),
                color: COLORS.secondary
            },
            {
                name: 'Water Efficiency',
                value: extractPercentageValue(calculationFactors.water_efficiency),
                color: COLORS.info
            },
            {
                name: 'Soil Health',
                value: extractPercentageValue(calculationFactors.soil_health_factor),
                color: COLORS.accent
            },
        ] : [];

        // Climate risk impact
        const climateRiskData = (riskAssessment?.detailedRisks || [])
            .filter((risk: any) => risk.category.includes('Climate') || risk.category.includes('Weather'))
            .map((risk: any) => ({
                factor: risk.category,
                impact: risk.score || 0,
                probability: risk.probability || 'Low'
            }));

        // Monthly NDVI data
        const monthlyNdviData = (ndviIndicators?.growing_season_months || []).length > 0
            ? ndviIndicators.growing_season_months.map((month: any) => ({
                month: month.month,
                ndvi: month.ndvi || 0,
                biomass: month.biomass || 0,
            }))
            : [];

        // Biomass data
        const biomassData = (monthlyCarbonData || []).map((data: MonthlyCarbonDataDetail) => ({
            month: data.month,
            biomass_co2_total_t: data.biomass_co2_total_t || 0,
            biomass_co2_t_per_ha: data.biomass_co2_t_per_ha || 0,
            month_number: data.month_number,
        }));

        // Scope emissions data for bar chart
        const scopeEmissionsData = (carbonEmissionData?.yearly_data || []).map((yearData: CarbonYearlyData) => {
            const scope1Total = yearData.emissions?.scope1?.total_tco2e || 0;
            const scope2Total = yearData.emissions?.scope2?.total_tco2e || 0;
            const scope3Total = yearData.emissions?.scope3?.total_tco2e || 0;
            
            return {
                year: yearData.year.toString(),
                scope1: scope1Total,
                scope2: scope2Total,
                scope3: scope3Total,
                total: yearData.emissions?.totals?.total_scope_emission_tco2e || 
                       (scope1Total + scope2Total + scope3Total),
            };
        });

        // Prepare data from API graphs if available
        const prepareDataFromAPI = () => {
            if (!allGraphs || Object.keys(allGraphs).length === 0) return null;

            const apiData: any = {};

            // Convert allGraphs to chart data format
            Object.entries(allGraphs).forEach(([key, graph]: [string, any]) => {
                if (graph.labels && graph.datasets) {
                    apiData[key] = {
                        labels: graph.labels,
                        datasets: graph.datasets,
                        interpretation: graph.interpretation,
                        note: graph.note,
                        data_period: graph.data_period
                    };

                    // Create Recharts compatible data
                    if (graph.labels && graph.datasets[0]?.data) {
                        apiData[`${key}Formatted`] = graph.labels.map((label: any, index: number) => ({
                            label: label,
                            value: graph.datasets[0].data[index],
                            ...(graph.datasets[0]?.backgroundColor && { color: graph.datasets[0].backgroundColor[index] })
                        }));
                    }
                }
            });

            return apiData;
        };

        const apiGraphData = prepareDataFromAPI();

        return {
            yearlyYieldData,
            riskDistributionData,
            yieldComponentsData,
            climateRiskData,
            monthlyNdviData,
            biomassData,
            scopeEmissionsData,
            apiGraphData,
        };
    };

    const chartData = prepareChartData();
    const apiGraphData = chartData.apiGraphData;

    // Calculate yield gap
    const currentYield = forecastedYield;
    const potentialYield = chartData.yearlyYieldData.length > 0 
        ? Math.max(...chartData.yearlyYieldData.map(d => d.potential))
        : currentYield * 1.2;
    const yieldGap = potentialYield - currentYield;
    const yieldGapPercentage = potentialYield > 0 ? (yieldGap / potentialYield) * 100 : 0;

    // ── Graph definitions ────────────────────────────────────────────────
    const overviewGraphs = [
        // Yield Trend Over Time
        {
            id: "yield-trend",
            title: "Yield Trend Over Time",
            description: "Historical and forecasted yield performance",
            icon: <LineChartIcon className="w-5 h-5" style={{ color: COLORS.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData.yearlyYieldData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                            dataKey="year" 
                            stroke="#6b7280" 
                            style={{ fontSize: '12px' }} 
                        />
                        <YAxis 
                            stroke="#6b7280" 
                            style={{ fontSize: '12px' }} 
                        />
                        <RechartsTooltip
                            contentStyle={{ 
                                backgroundColor: '#ffffff', 
                                border: '1px solid #d1d5db', 
                                borderRadius: '0.5rem',
                                color: '#374151'
                            }}
                            formatter={(value: any, name: any) => {
                                if (name === 'yield') return [`${value.toFixed(1)} ${yieldUnit}`, 'Actual Yield'];
                                if (name === 'potential') return [`${value.toFixed(1)} ${yieldUnit}`, 'Potential Yield'];
                                return [value, name];
                            }}
                        />
                        <RechartsLegend />
                        <RechartsBar
                            dataKey="yield"
                            name="Actual Yield"
                            radius={[4, 4, 0, 0]}
                            fill={(data: any) => data.color || COLORS.primary}
                        />
                        <RechartsLine
                            type="monotone"
                            dataKey="potential"
                            name="Potential Yield"
                            stroke={COLORS.darkGreen}
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ fill: COLORS.darkGreen, r: 4 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            ),
        },
        // Yield Components
        {
            id: "yield-components",
            title: "Yield Components",
            description: "Factors contributing to yield forecast",
            icon: <PieChartIcon className="w-5 h-5" style={{ color: COLORS.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={chartData.yieldComponentsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                            dataKey="name" 
                            stroke="#6b7280" 
                            style={{ fontSize: '10px' }} 
                        />
                        <YAxis 
                            stroke="#6b7280" 
                            style={{ fontSize: '12px' }} 
                        />
                        <RechartsTooltip
                            contentStyle={{ 
                                backgroundColor: '#ffffff', 
                                border: '1px solid #d1d5db', 
                                borderRadius: '0.5rem',
                                color: '#374151'
                            }}
                            formatter={(value: any) => [`${value.toFixed(1)}%`, 'Contribution']}
                        />
                        <RechartsBar
                            dataKey="value"
                            radius={[4, 4, 0, 0]}
                        >
                            {chartData.yieldComponentsData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.color} 
                                    stroke={entry.color}
                                    strokeWidth={1}
                                />
                            ))}
                        </RechartsBar>
                    </RechartsBarChart>
                </ResponsiveContainer>
            ),
        },
        // Climate Risk Impact
        {
            id: "climate-risk-impact",
            title: "Climate Risk Impact",
            description: "Impact of climate factors on yield",
            icon: <BarChart3 className="w-5 h-5" style={{ color: COLORS.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={chartData.climateRiskData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                            dataKey="factor" 
                            stroke="#6b7280" 
                            style={{ fontSize: '10px' }} 
                        />
                        <YAxis 
                            stroke="#6b7280" 
                            style={{ fontSize: '12px' }} 
                        />
                        <RechartsTooltip
                            contentStyle={{ 
                                backgroundColor: '#ffffff', 
                                border: '1px solid #d1d5db', 
                                borderRadius: '0.5rem',
                                color: '#374151'
                            }}
                            formatter={(value: any, name: any, props: any) => [
                                `${value}%`,
                                `Probability: ${props.payload.probability}`
                            ]}
                        />
                        <RechartsBar
                            dataKey="impact"
                            radius={[4, 4, 0, 0]}
                        >
                            {chartData.climateRiskData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={
                                        entry.probability === 'High' ? COLORS.danger :
                                        entry.probability === 'Medium' ? COLORS.warning : COLORS.success
                                    }
                                    stroke={
                                        entry.probability === 'High' ? COLORS.danger :
                                        entry.probability === 'Medium' ? COLORS.warning : COLORS.success
                                    }
                                    strokeWidth={1}
                                />
                            ))}
                        </RechartsBar>
                    </RechartsBarChart>
                </ResponsiveContainer>
            ),
        },
        // NDVI Trend
        {
            id: "ndvi-trend",
            title: "NDVI Trend",
            description: "Vegetation health during growing season",
            icon: <AreaChartIcon className="w-5 h-5" style={{ color: COLORS.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.monthlyNdviData}>
                        <defs>
                            <linearGradient id="grad_ndvi" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.ndvi} stopOpacity={0.5} />
                                <stop offset="95%" stopColor={COLORS.ndvi} stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                            dataKey="month" 
                            stroke="#6b7280" 
                            style={{ fontSize: '12px' }} 
                        />
                        <YAxis 
                            stroke="#6b7280" 
                            style={{ fontSize: '12px' }} 
                        />
                        <RechartsTooltip
                            contentStyle={{ 
                                backgroundColor: '#ffffff', 
                                border: '1px solid #d1d5db', 
                                borderRadius: '0.5rem',
                                color: '#374151'
                            }}
                            formatter={(value: any) => [Number(value).toFixed(3), "NDVI"]}
                        />
                        <RechartsLegend />
                        <Area
                            type="monotone"
                            dataKey="ndvi"
                            stroke={COLORS.ndvi}
                            fill="url(#grad_ndvi)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            ),
        },
        // Yield Gap Analysis
        {
            id: "yield-gap",
            title: "Yield Gap Analysis",
            description: "Current vs Potential Yield Comparison",
            icon: <BarChart3 className="w-5 h-5" style={{ color: COLORS.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={[
                        {
                            category: 'Yield Analysis',
                            current: currentYield,
                            potential: potentialYield,
                            gap: yieldGap
                        }
                    ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                            dataKey="category" 
                            stroke="#6b7280" 
                            style={{ fontSize: '12px' }} 
                        />
                        <YAxis 
                            stroke="#6b7280" 
                            style={{ fontSize: '12px' }} 
                        />
                        <RechartsTooltip
                            contentStyle={{ 
                                backgroundColor: '#ffffff', 
                                border: '1px solid #d1d5db', 
                                borderRadius: '0.5rem',
                                color: '#374151'
                            }}
                            formatter={(value: any, name: any) => {
                                if (name === 'current') return [`${value.toFixed(1)} ${yieldUnit}`, 'Current Yield'];
                                if (name === 'potential') return [`${value.toFixed(1)} ${yieldUnit}`, 'Potential Yield'];
                                if (name === 'gap') return [`${value.toFixed(1)} ${yieldUnit}`, 'Yield Gap'];
                                return [value, name];
                            }}
                        />
                        <RechartsLegend />
                        <RechartsBar 
                            dataKey="current" 
                            name="Current Yield" 
                            fill={COLORS.primary} 
                            radius={[4, 4, 0, 0]} 
                        />
                        <RechartsBar 
                            dataKey="potential" 
                            name="Potential Yield" 
                            fill={COLORS.lightGreen} 
                            radius={[4, 4, 0, 0]} 
                        />
                    </RechartsBarChart>
                </ResponsiveContainer>
            ),
        },
        // Biomass CO2 Storage
        {
            id: "biomass-storage",
            title: "Biomass CO2 Storage",
            description: "Monthly biomass CO2 storage in total and per hectare",
            icon: <Leaf className="w-5 h-5" style={{ color: COLORS.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData.biomassData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                            dataKey="month" 
                            stroke="#6b7280" 
                            style={{ fontSize: '12px' }} 
                        />
                        <YAxis 
                            stroke="#6b7280" 
                            style={{ fontSize: '12px' }} 
                        />
                        <RechartsTooltip
                            contentStyle={{ 
                                backgroundColor: '#ffffff', 
                                border: '1px solid #d1d5db', 
                                borderRadius: '0.5rem',
                                color: '#374151'
                            }}
                            formatter={(value: any, name: any) => {
                                if (name === 'biomass_co2_total_t') return [`${formatNumber(value)} t`, 'Total Biomass CO2'];
                                if (name === 'biomass_co2_t_per_ha') return [`${value.toFixed(2)} t/ha`, 'Biomass CO2 per ha'];
                                return [value, name];
                            }}
                        />
                        <RechartsLegend />
                        <RechartsLine
                            type="monotone"
                            dataKey="biomass_co2_total_t"
                            name="Total Biomass CO2"
                            stroke={COLORS.biomassTotal}
                            strokeWidth={3}
                            dot={{ r: 4, fill: COLORS.biomassTotal }}
                        />
                        <RechartsLine
                            type="monotone"
                            dataKey="biomass_co2_t_per_ha"
                            name="Biomass CO2 per ha"
                            stroke={COLORS.biomassPerHa}
                            strokeWidth={2}
                            strokeDasharray="3 3"
                            dot={{ r: 3, fill: COLORS.biomassPerHa }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            ),
        },
        // Scope Emissions - UPDATED TO BAR CHART
        {
            id: "scope-emissions",
            title: "Scope Emissions",
            description: "Yearly Scope 1, 2, and 3 emissions",
            icon: <Factory className="w-5 h-5" style={{ color: COLORS.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={chartData.scopeEmissionsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                            dataKey="year" 
                            stroke="#6b7280" 
                            style={{ fontSize: '12px' }} 
                        />
                        <YAxis 
                            stroke="#6b7280" 
                            style={{ fontSize: '12px' }} 
                        />
                        <RechartsTooltip
                            contentStyle={{ 
                                backgroundColor: '#ffffff', 
                                border: '1px solid #d1d5db', 
                                borderRadius: '0.5rem',
                                color: '#374151'
                            }}
                            formatter={(value: any, name: any) => {
                                const formattedValue = formatNumber ? formatNumber(value) : value.toLocaleString();
                                return [`${formattedValue} tCO2e`, name];
                            }}
                        />
                        <RechartsLegend />
                        <RechartsBar
                            dataKey="scope1"
                            name="Scope 1"
                            fill={COLORS.scope1}
                            radius={[4, 4, 0, 0]}
                            stroke={COLORS.scope1}
                            strokeWidth={1}
                        />
                        <RechartsBar
                            dataKey="scope2"
                            name="Scope 2"
                            fill={COLORS.scope2}
                            radius={[4, 4, 0, 0]}
                            stroke={COLORS.scope2}
                            strokeWidth={1}
                        />
                        <RechartsBar
                            dataKey="scope3"
                            name="Scope 3"
                            fill={COLORS.scope3}
                            radius={[4, 4, 0, 0]}
                            stroke={COLORS.scope3}
                            strokeWidth={1}
                        />
                    </RechartsBarChart>
                </ResponsiveContainer>
            ),
        },
    ];

    // Handle metric click
    const handleMetricClick = (
        metric: any,
        title: string,
        description: string,
        calculationType?: string
    ) => {
        if (calculationType) {
            onCalculationClick(calculationType, metric);
        } else {
            setSelectedMetric({ ...metric, title, description });
            setShowMetricModal(true);
        }
    };

    // ── Early return: loading ───────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Sprout className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 text-lg">Loading your crop yield data…</p>
                </div>
            </div>
        );
    }

    // ── Early return: no data ──────────────────────────────────────────────
    if (!cropYieldData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Data Available</h3>
                    <p className="text-gray-500">
                        No crop yield data found for {selectedCompany?.name || "the selected company"}.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">
            {/* Company Details Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200" style={{ background: `linear-gradient(to right, ${COLORS.primary}15, ${COLORS.emerald}15)` }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm">
                                <Building className="w-5 h-5" style={{ color: COLORS.primary }} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-0.5">
                                    {companyInfo?.name || selectedCompany?.name || "Company"}
                                </h2>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-100 text-green-800 font-medium">
                                        {companyInfo?.industry || selectedCompany?.industry || "Agriculture"}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 font-medium">
                                        {companyInfo?.country || selectedCompany?.country || "Country"}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-medium">
                                        {currentSeason}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-600 mb-0.5">Forecast Confidence</p>
                            <p className="font-medium text-xs text-green-700">{confidenceOverall}%</p>
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Total Area</p>
                            <p className="font-bold text-sm text-gray-900">{cropAreaCovered}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Location Points</p>
                            <p className="font-bold text-sm text-gray-900">{cropCoordinates.length} points</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Season</p>
                            <p className="font-bold text-sm text-gray-900">{currentSeason}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Data Confidence</p>
                            <p className="font-bold text-sm text-green-700">{confidenceOverall}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Crop Yield Hero Banner */}
<div className="relative overflow-hidden rounded-2xl p-5 shadow-2xl" style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.darkGreen})` }}>

                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="text-xl font-bold mb-1 text-white">Crop Yield Forecast Overview</h2>
                            <p className="text-green-100 text-sm">
                                {currentSeason !== "N/A" ? `Current Season: ${currentSeason}` : "Real-time crop yield forecasting and risk assessment"}
                            </p>
                        </div>
                        <button
                            onClick={() => onCalculationClick("overview")}
                            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 text-white text-xs"
                        >
                            <Calculator className="w-3.5 h-3.5" />
                            How Calculated?
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
                        {/* Forecasted Yield */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() =>
                                handleMetricClick(
                                    yieldForecast,
                                    "Yield Forecast",
                                    "Forecasted crop yield with confidence score",
                                    "yield-forecast"
                                )
                            }
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Package className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Forecasted Yield</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {currentYield.toFixed(1)}
                                <span className="text-sm ml-1 text-green-100">{yieldUnit}</span>
                            </h3>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${yieldForecast?.comparison?.status === 'Above Average' ?
                                'bg-green-400 text-green-900' :
                                'bg-yellow-400 text-yellow-900'
                                }`}>
                                {yieldForecast?.comparison?.status || 'Calculating...'}
                            </span>
                        </div>

                        {/* Yield Change */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() =>
                                handleMetricClick(
                                    yieldForecast?.comparison,
                                    "Yield Comparison",
                                    "Comparison to industry average",
                                    "yield-comparison"
                                )
                            }
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <TrendingUp className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Yield Change</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {typeof yieldForecast?.comparison?.percentage_difference === 'number' 
                                    ? `${yieldForecast.comparison.percentage_difference > 0 ? '+' : ''}${yieldForecast.comparison.percentage_difference.toFixed(1)}%`
                                    : '0%'}
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                vs Industry
                            </span>
                        </div>

                        {/* Risk Level */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() =>
                                handleMetricClick(
                                    riskAssessment,
                                    "Risk Assessment",
                                    "Overall crop production risk assessment",
                                    "risk-assessment"
                                )
                            }
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <AlertTriangle className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Risk Level</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {riskScore}%
                            </h3>
                            <div className="flex items-center justify-between">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${riskLevel === 'Low' ? 'bg-green-400 text-green-900' :
                                    riskLevel === 'Medium' ? 'bg-yellow-400 text-yellow-900' :
                                        'bg-red-400 text-red-900'
                                    }`}>
                                    {riskLevel}
                                </span>
                                <span className="text-green-100 text-[10px]">
                                    {riskAssessment?.probability || 'Calculating...'}
                                </span>
                            </div>
                        </div>

                        {/* Confidence Score */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() =>
                                handleMetricClick(
                                    confidenceScore,
                                    "Confidence Score",
                                    "Overall data and prediction confidence",
                                    "confidence-score"
                                )
                            }
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Shield className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Confidence Score</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {confidenceOverall}%
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                Data Quality
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Section - Updated to match soil carbon version */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Field Location</h3>
                            <p className="text-gray-600 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-green-600" />
                                {cropAreaName}
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
                    {cropCoordinates.length > 0 ? (
                        <MapContainer
                            center={mapCenter}
                            zoom={10}
                            style={{ height: '100%', width: '100%' }}
                            className="leaflet-container z-0"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {cropCoordinates.length === 1 ? (
                                <Marker position={[cropCoordinates[0].lat, cropCoordinates[0].lon]}>
                                    <Popup>
                                        <div className="p-2">
                                            <h3 className="font-bold" style={{ color: COLORS.primary }}>
                                                {cropAreaName}
                                            </h3>
                                            <p className="text-sm text-gray-700">Lat: {cropCoordinates[0].lat.toFixed(4)}</p>
                                            <p className="text-sm text-gray-700">Lon: {cropCoordinates[0].lon.toFixed(4)}</p>
                                            <p className="text-sm text-gray-700">Area: {cropAreaCovered}</p>
                                            <p className="text-sm text-gray-700">Crop Type: {yieldForecast?.crop_type || "Multiple"}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            ) : (
                                <Polygon
                                    pathOptions={{
                                        fillColor: COLORS.primary,
                                        color: COLORS.primary,
                                        fillOpacity: 0.3,
                                        weight: 2,
                                    }}
                                    positions={cropCoordinates.map((coord: Coordinate) => [coord.lat, coord.lon])}
                                >
                                    <Popup>
                                        <div className="p-2">
                                            <h3 className="font-bold" style={{ color: COLORS.primary }}>
                                                {cropAreaName}
                                            </h3>
                                            <p className="text-sm text-gray-700">Area: {cropAreaCovered}</p>
                                            <p className="text-sm text-gray-700">Points: {cropCoordinates.length} coordinates</p>
                                            <p className="text-sm text-gray-700">Crop Type: {yieldForecast?.crop_type || "Multiple"}</p>
                                            <p className="text-sm text-gray-700">Forecasted Yield: {currentYield.toFixed(1)} {yieldUnit}</p>
                                        </div>
                                    </Popup>
                                </Polygon>
                            )}
                        </MapContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                            <div className="text-center">
                                <Globe
                                    className="w-16 h-16 mx-auto mb-4 opacity-20"
                                    style={{ color: COLORS.primary }}
                                />
                                <p className="text-gray-500 font-medium">
                                    No location data available
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-6 grid grid-cols-2 gap-4 bg-gray-50">
                    <div className="p-4 rounded-xl bg-white border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-green-600" />
                            Area Covered
                        </p>
                        <p className="font-bold text-lg text-gray-900">{cropAreaCovered}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                            <TargetIcon className="w-4 h-4 text-green-600" />
                            Monitoring Points
                        </p>
                        <p className="font-bold text-lg text-gray-900">{cropCoordinates.length} coordinates</p>
                    </div>
                </div>
            </div>

            {/* Graphs Grid (2 columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {overviewGraphs
                    .filter((graph) => 
                        ["yield-trend", "yield-components", "climate-risk-impact", "ndvi-trend"].includes(graph.id)
                    )
                    .map((graph) => (
                        <GraphCard
                            key={graph.id}
                            title={graph.title}
                            description={graph.description}
                            icon={graph.icon}
                            onClick={() => setSelectedGraph(graph)}
                            onInfoClick={() =>
                                onCalculationClick(graph.id, {
                                    description: `Detailed calculation methodology for ${graph.title}`,
                                })
                            }
                        >
                            {graph.component}
                        </GraphCard>
                    ))}
            </div>

            {/* Full Width Graphs */}
            {/* Yield Gap Analysis Full Width */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-green-100">
                                <BarChart3 className="w-6 h-6" style={{ color: COLORS.primary }} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Yield Gap Analysis</h3>
                                <p className="text-gray-600 text-sm">Current vs potential yield comparison showing improvement opportunities</p>
                            </div>
                        </div>
                        <button
                            onClick={() => onCalculationClick('yield-gap', {
                                description: "Yield gap represents the difference between current farm yields and achievable yields under optimal conditions"
                            })}
                            className="p-2 rounded-lg hover:bg-green-100 transition-all"
                        >
                            <Info className="w-5 h-5" style={{ color: COLORS.primary }} />
                        </button>
                    </div>
                </div>
                <div className="p-8">
                    <div className="h-[400px]">
                        {overviewGraphs.find(g => g.id === "yield-gap")?.component}
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Current Yield</p>
                            <p className="font-bold text-lg text-gray-900">
                                {currentYield.toFixed(1)} {yieldUnit}
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Potential Yield</p>
                            <p className="font-bold text-lg text-gray-900">
                                {potentialYield.toFixed(1)} {yieldUnit}
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Yield Gap</p>
                            <p className="font-bold text-lg text-red-600">
                                {yieldGap.toFixed(1)} {yieldUnit} ({yieldGapPercentage.toFixed(1)}%)
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Carbon and Emissions Graphs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GraphCard
                    title="Biomass CO2 Storage"
                    description="Monthly biomass CO2 storage in total and per hectare"
                    icon={<Leaf className="w-5 h-5" style={{ color: COLORS.primary }} />}
                    onClick={() => setSelectedGraph(overviewGraphs[5])}
                    onInfoClick={() =>
                        onCalculationClick("biomass-storage", {
                            description: "Biomass CO2 storage calculation methodology",
                        })
                    }
                >
                    {overviewGraphs[5].component}
                </GraphCard>

                <GraphCard
                    title="Scope Emissions"
                    description="Yearly Scope 1, 2, and 3 emissions"
                    icon={<Factory className="w-5 h-5" style={{ color: COLORS.primary }} />}
                    onClick={() => setSelectedGraph(overviewGraphs[6])}
                    onInfoClick={() =>
                        onCalculationClick("scope-emissions", {
                            description: "Scope emissions calculation methodology",
                        })
                    }
                >
                    {overviewGraphs[6].component}
                </GraphCard>
            </div>

            {/* Methodology Section */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Calculation Methodology</h3>
                        <p className="text-gray-600">Understand how crop yield forecasts are calculated</p>
                    </div>
                    <Settings className="w-8 h-8" style={{ color: COLORS.primary }} />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div
                        className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 cursor-pointer hover:border-green-300 transition-all group"
                        onClick={() =>
                            onCalculationClick("yield-forecast", {
                                formula: "Base Yield × NDVI Factor × Water Efficiency × Soil Health",
                                description: "Multi-factor yield forecasting model",
                            })
                        }
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-green-100">
                                <Calculator className="w-6 h-6" style={{ color: COLORS.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Yield Forecast</h4>
                        </div>
                        <p className="text-gray-700 mb-4">Multi-factor yield prediction model</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-green-600 font-medium">
                                Formula: Base × NDVI × Water × Soil
                            </span>
                            <Info className="w-5 h-5 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    <div
                        className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 cursor-pointer hover:border-blue-300 transition-all group"
                        onClick={() =>
                            onCalculationClick("yield-gap", {
                                formula: `Potential Yield (${potentialYield.toFixed(1)} ${yieldUnit}) - Current Yield (${currentYield.toFixed(1)} ${yieldUnit}) = ${yieldGap.toFixed(1)} ${yieldUnit}`,
                                description: "Yield improvement opportunity",
                            })
                        }
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-blue-100">
                                <TargetIcon className="w-6 h-6" style={{ color: COLORS.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Yield Gap</h4>
                        </div>
                        <p className="text-gray-700 mb-4">Potential vs actual yield difference</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-600 font-medium">
                                Formula: Potential − Current
                            </span>
                            <Info className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    <div
                        className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 cursor-pointer hover:border-purple-300 transition-all group"
                        onClick={() =>
                            onCalculationClick("risk-assessment", {
                                formula: "Weighted average of all risk factors",
                                description: "Comprehensive risk assessment",
                            })
                        }
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-purple-100">
                                <Shield className="w-6 h-6" style={{ color: COLORS.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Risk Assessment</h4>
                        </div>
                        <p className="text-gray-700 mb-4">Comprehensive risk scoring</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-purple-600 font-medium">
                                Formula: Weighted risk factors
                            </span>
                            <Info className="w-5 h-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                </div>
                <div className="mt-6">
                    <button
                        onClick={() => onCalculationClick('full-methodology', {
                            yieldForecast: "Base Yield × NDVI Factor × Water Efficiency × Soil Health",
                            yieldGap: "Potential Yield - Current Yield",
                            riskAssessment: "Weighted average of all risk factors",
                            confidenceScore: "Data quality × Model accuracy × Temporal consistency"
                        })}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 hover:border-green-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <span className="font-semibold text-gray-700">View Complete Methodology</span>
                        <ArrowRight className="w-5 h-5 text-green-600" />
                    </button>
                </div>
            </div>

            {/* API Information Section */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">API & Data Information</h3>
                        <p className="text-gray-600">System versions and data sources</p>
                    </div>
                    <Shield className="w-8 h-8" style={{ color: COLORS.primary }} />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">Data Period</p>
                        <p className="font-bold text-lg text-gray-900">
                            {reportingPeriod?.data_period || "N/A"}
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">Available Years</p>
                        <p className="font-bold text-lg text-gray-900">
                            {reportingPeriod?.data_available_years?.length || 0} years
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">Satellite Source</p>
                        <p className="font-bold text-lg text-gray-900">
                            {satelliteIndicators?.satellite_source || "N/A"}
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                        <p className="text-sm text-gray-600 mb-2">Data Confidence</p>
                        <p className="font-bold text-lg text-green-700">{confidenceOverall}%</p>
                    </div>
                </div>
                <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-3 font-medium">Data Sources Used</p>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 font-medium">
                            Satellite Imagery
                        </span>
                        <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 font-medium">
                            Weather Data
                        </span>
                        <span className="px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 font-medium">
                            Soil Sensors
                        </span>
                        <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800 font-medium">
                            Field Surveys
                        </span>
                    </div>
                </div>
            </div>

            {/* Graph Expanded Modal */}
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
                    <div
                        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className="p-6 border-b border-gray-200 rounded-t-3xl text-white"
                            style={{
                                background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.darkGreen})`,
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold mb-1">
                                        {selectedMetric.title}
                                    </h3>
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
                                    {typeof selectedMetric.value === 'number' ?
                                        selectedMetric.value.toFixed(2) : selectedMetric.value}
                                </div>
                                <div className="text-xl text-gray-600">{selectedMetric.unit}</div>
                            </div>
                            <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <h4 className="font-bold text-gray-900 mb-2">Recommendations</h4>
                                <div className="space-y-2 text-gray-700">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span>Monitor this metric regularly to track progress</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span>Set improvement targets and action plans</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span>
                                            Explore precision agriculture and efficiency improvements
                                        </span>
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