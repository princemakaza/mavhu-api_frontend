import React, { useState, useMemo } from "react";
import {
    ComposedChart,
    Line,
    Bar,
    BarChart,
    PieChart,
    Pie,
    Cell,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { MapContainer, TileLayer, Marker, Polygon, Popup } from "react-leaflet";
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
    LineChart,
    PieChart as PieChartIcon,
    AreaChart as AreaChartIcon,
    Calculator,
    Settings,
    Package,
    Sprout,
    AlertTriangle,
    Target,
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
    Calendar,
    Users,
} from "lucide-react";

// ─── NEW SERVICE IMPORTS (exact types from your updated API) ───────────────
import {
    CropYieldForecastResponse,
    getYieldForecastSummary,
    getRiskAssessmentSummary,
    getCompanyInfo,
    getConfidenceScoreBreakdown,
    getSeasonalAdvisory,
    getReportingPeriod,
    getGraphData,
    getAllGraphData,
    getCropYieldYearlySummary,
    getMetricsByCategory,
    getYearOverYearChanges,
    getMetricTimeSeries,
    getSummary,
    getMetadata,
} from "../../../../services/Admin_Service/esg_apis/crop_yield_service";

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ─── GREEN THEME COLOURS ───────────────────────────────────────────────────
const COLORS = {
    primary: "#22c55e",      // fresh green
    primaryDark: "#16a34a",
    primaryLight: "#86efac",
    secondary: "#10b981",
    accent: "#84cc16",
    success: "#22c55e",
    warning: "#eab308",
    danger: "#ef4444",
    info: "#3b82f6",
    company: "#22c55e",
    private: "#f59e0b",
    total: "#10b981",
    sugar: "#8b5cf6",
    molasses: "#d97706",
    ratio: "#3b82f6",
    // For charts
    chart: ["#22c55e", "#10b981", "#84cc16", "#16a34a", "#059669", "#34d399"],
    riskColors: ["#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6", "#10b981", "#eab308"],
};

// ─── GraphCard (reusable) ──────────────────────────────────────────────────
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
            style={{ background: `linear-gradient(to right, ${COLORS.primary}15, ${COLORS.secondary}15)` }}
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

// ─── PROPS ─────────────────────────────────────────────────────────────────
interface OverviewTabProps {
    cropYieldData: CropYieldForecastResponse | null;   // new API response
    selectedCompany?: any;                             // fallback
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

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
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
    onYearFilterChange = () => {},
    onRangeChange = () => {},
    onClearFilters = () => {},
    onMetricClick = () => {},
    onCalculationClick = () => {},
    colors = {
        primary: "#22c55e",
        secondary: "#10b981",
        lightGreen: "#86efac",
        darkGreen: "#16a34a",
        emerald: "#10b981",
        lime: "#84cc16",
        background: "#f0fdf4",
    },
}) => {
    // ── State for modals ─────────────────────────────────────────────────
    const [selectedGraph, setSelectedGraph] = useState<any>(null);
    const [showMetricModal, setShowMetricModal] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState<any>(null);

    // ── Extract data using the new utility functions ─────────────────────
    const dataRoot = cropYieldData?.data;

    // Company & location
    const companyInfo = cropYieldData ? getCompanyInfo(cropYieldData) : null;
    const areaMetadata = companyInfo?.area_of_interest_metadata;
    const cropCoordinates = areaMetadata?.coordinates || [];
    const cropAreaName = areaMetadata?.name || "Project Area";
    const cropAreaCovered = areaMetadata?.area_covered || "N/A";

    // Reporting, confidence, forecast, risk
    const reportingPeriod = cropYieldData ? getReportingPeriod(cropYieldData) : null;
    const confidenceScore = cropYieldData ? getConfidenceScoreBreakdown(cropYieldData) : null;
    const yieldForecast = cropYieldData ? getYieldForecastSummary(cropYieldData) : null;
    const riskAssessment = cropYieldData ? getRiskAssessmentSummary(cropYieldData) : null;
    const seasonalAdvisory = cropYieldData ? getSeasonalAdvisory(cropYieldData) : null;
    const summary = cropYieldData ? getSummary(cropYieldData) : null;

    // Yearly metrics & year‑over‑year changes
    const yearlySummary = cropYieldData ? getCropYieldYearlySummary(cropYieldData) : null;
    const yoyChanges = cropYieldData ? getYearOverYearChanges(cropYieldData) : [];

    // Graph data from API (risk_distribution, forecast_confidence)
    const riskGraph = cropYieldData ? getGraphData(cropYieldData, "risk_distribution") : null;
    const confidenceGraph = cropYieldData ? getGraphData(cropYieldData, "forecast_confidence") : null;

    // Additional metrics for custom graphs
    const caneHarvestedMetrics = cropYieldData
        ? getMetricsByCategory(cropYieldData, "cane_harvested")
        : {};
    const sugarProductionMetrics = cropYieldData
        ? getMetricsByCategory(cropYieldData, "sugar_production")
        : {};
    const yieldMetrics = cropYieldData
        ? getMetricsByCategory(cropYieldData, "sugar_cane_yield")
        : {};
    const areaMetrics = cropYieldData
        ? getMetricsByCategory(cropYieldData, "area_under_cane")
        : {};

    // ── Derived values for hero banner ───────────────────────────────────
    const forecastedYield = yieldForecast?.forecastedYield ?? 0;
    const yieldUnit = yieldForecast?.unit ?? "t/ha";
    const riskLevel = riskAssessment?.riskLevel ?? "Low";
    const riskScore = riskAssessment?.overallScore ?? 0;
    const confidenceOverall = confidenceScore?.overall ?? 0;
    const currentSeason = seasonalAdvisory?.current_season ?? "N/A";

    // Map center
    const mapCenter: [number, number] =
        cropCoordinates.length > 0
            ? [cropCoordinates[0].lat, cropCoordinates[0].lon]
            : [0, 0];

    // ─── CHART DATA PREPARATION ──────────────────────────────────────────
    const chartData = useMemo(() => {
        // 1. Company vs Private Yield (bar chart)
        const companyYield = yearlySummary?.company_yield ?? 0;
        const privateYield = yearlySummary?.private_yield ?? 0;
        const yieldComparisonData = [
            { name: "Company Estates", value: companyYield, fill: COLORS.company },
            { name: "Private Farmers", value: privateYield, fill: COLORS.private },
        ];

        // 2. Cane Harvested (tons)
        const totalCaneMilled = yearlySummary?.total_cane_milled ?? 0;
        const privateCaneHarvested = yearlySummary?.total_cane_harvested_private ?? 0;
        const companyCaneHarvested = yearlySummary?.total_cane_harvested_company ?? 0;
        const caneHarvestedData = [
            { name: "Company Estates", value: companyCaneHarvested, fill: COLORS.company },
            { name: "Private Farmers", value: privateCaneHarvested, fill: COLORS.private },
            { name: "Total Milled", value: totalCaneMilled, fill: COLORS.total },
        ];

        // 3. Sugar Production (tons & ratio)
        const companySugar = yearlySummary?.total_sugar_produced_company ?? 0;
        const molasses = yearlySummary?.total_molasses_produced ?? 0;
        const caneToSugarRatio = yearlySummary?.cane_to_sugar_ratio ?? 0;
        const sugarProductionData = [
            { name: "Company Sugar", value: companySugar, fill: COLORS.sugar },
            { name: "Molasses", value: molasses, fill: COLORS.molasses },
            { name: "Cane/Sugar Ratio", value: caneToSugarRatio, fill: COLORS.ratio, unit: "%" },
        ];

        // 4. Year‑over‑Year Changes (latest 3 periods)
        const latestYoy = yoyChanges.slice(-6).map((item) => ({
            period: item.period,
            change: item.numeric_change,
            metric: item.metric.split(" ").slice(0, 3).join(" "), // shorten
        }));

        // 5. Risk distribution – radar chart (from API)
        const radarData = riskGraph?.labels.map((label, idx) => ({
            category: label,
            score: riskGraph.datasets[0]?.data[idx] ?? 0,
        })) ?? [];

        // 6. Forecast confidence – polar area / bar (from API)
        const confidenceChartData =
            confidenceGraph?.labels.map((label, idx) => ({
                name: label,
                value: confidenceGraph.datasets[0]?.data[idx] ?? 0,
                color: (confidenceGraph.datasets[0]?.backgroundColor as string[])?.[idx] ?? COLORS.primary,
            })) ?? [];

        return {
            yieldComparisonData,
            caneHarvestedData,
            sugarProductionData,
            yoyData: latestYoy,
            radarData,
            confidenceData: confidenceChartData,
        };
    }, [cropYieldData, yearlySummary, yoyChanges, riskGraph, confidenceGraph]);

    // ─── GRAPH DEFINITIONS (6+ graphs) ───────────────────────────────────
    const overviewGraphs = [
        // 1. Radar: Risk Profile
        {
            id: "risk-radar",
            title: "Crop Production Risk Profile",
            description: "Multi‑dimensional risk assessment",
            icon: <RadarIcon className="w-5 h-5" style={{ color: COLORS.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData.radarData}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="category" tick={{ fill: "#4b5563", fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#6b7280" }} />
                        <Radar
                            name="Risk Score"
                            dataKey="score"
                            stroke={COLORS.danger}
                            fill={COLORS.danger}
                            fillOpacity={0.3}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: "#fff", borderRadius: 8, border: "1px solid #d1d5db" }}
                        />
                        <Legend />
                    </RadarChart>
                </ResponsiveContainer>
            ),
        },
        // 2. Polar/Bar: Forecast Confidence
        {
            id: "forecast-confidence",
            title: "Forecast Confidence Components",
            description: "Data availability for yield forecast",
            icon: <PieChartIcon className="w-5 h-5" style={{ color: COLORS.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.confidenceData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" domain={[0, 100]} stroke="#6b7280" />
                        <YAxis type="category" dataKey="name" stroke="#6b7280" width={120} fontSize={11} />
                        <Tooltip
                            formatter={(value: any) => [`${value}%`, "Score"]}
                            contentStyle={{ backgroundColor: "#fff", borderRadius: 8 }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {chartData.confidenceData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color || COLORS.primary} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            ),
        },
        // 3. Yield Comparison: Company vs Private
        {
            id: "yield-comparison",
            title: "Yield Comparison",
            description: "Company estates vs private farmers",
            icon: <BarChart3 className="w-5 h-5" style={{ color: COLORS.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.yieldComparisonData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" unit=" t/ha" />
                        <Tooltip
                            formatter={(value: any, name: any) => [`${value.toFixed(1)} t/ha`, name]}
                            contentStyle={{ backgroundColor: "#fff", borderRadius: 8 }}
                        />
                        <Legend />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {chartData.yieldComparisonData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            ),
        },
        // 4. Cane Harvested
        {
            id: "cane-harvested",
            title: "Cane Harvested",
            description: "Company, private & total milled (tons)",
            icon: <Package className="w-5 h-5" style={{ color: COLORS.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.caneHarvestedData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" unit=" t" />
                        <Tooltip
                            formatter={(value: any) => [formatNumber(value), "tons"]}
                            contentStyle={{ backgroundColor: "#fff", borderRadius: 8 }}
                        />
                        <Legend />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {chartData.caneHarvestedData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            ),
        },
        // 5. Sugar Production
        {
            id: "sugar-production",
            title: "Sugar Production",
            description: "Company sugar, molasses, cane/sugar ratio",
            icon: <Factory className="w-5 h-5" style={{ color: COLORS.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.sugarProductionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" />
                        <YAxis
                            stroke="#6b7280"
                            yAxisId="left"
                            unit=" t"
                            domain={[0, "auto"]}
                        />
                        <YAxis
                            stroke="#6b7280"
                            yAxisId="right"
                            orientation="right"
                            unit=" %"
                            domain={[0, 20]}
                        />
                        <Tooltip
                            formatter={(value: any, name: any, props: any) => {
                                const unit = props.payload.unit || "t";
                                return [`${value.toFixed(1)} ${unit}`, name];
                            }}
                            contentStyle={{ backgroundColor: "#fff", borderRadius: 8 }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="value" radius={[4, 4, 0, 0]}>
                            {chartData.sugarProductionData.slice(0, 2).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                        <Bar yAxisId="right" dataKey="value" radius={[4, 4, 0, 0]}>
                            <Cell fill={COLORS.ratio} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            ),
        },
        // 6. Year‑over‑Year Changes (latest periods)
        {
            id: "yoy-changes",
            title: "Year‑over‑Year Changes",
            description: "Historical performance trends",
            icon: <TrendingUp className="w-5 h-5" style={{ color: COLORS.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData.yoyData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" domain={[-20, 20]} tickFormatter={(v) => `${v}%`} stroke="#6b7280" />
                        <YAxis dataKey="period" type="category" stroke="#6b7280" width={100} fontSize={11} />
                        <Tooltip
                            formatter={(value: any) => [`${value > 0 ? "+" : ""}${value}%`, "Change"]}
                            contentStyle={{ backgroundColor: "#fff", borderRadius: 8 }}
                        />
                        <Legend />
                        <Bar dataKey="change" radius={[0, 4, 4, 0]}>
                            {chartData.yoyData.map((entry, idx) => (
                                <Cell
                                    key={`cell-${idx}`}
                                    fill={entry.change >= 0 ? COLORS.success : COLORS.danger}
                                />
                            ))}
                        </Bar>
                        <Line type="monotone" dataKey="change" stroke={COLORS.primary} strokeWidth={2} />
                    </ComposedChart>
                </ResponsiveContainer>
            ),
        },
    ];

    // Additional full‑width graph: Area under cane (could be a seventh)
    const areaUnderCaneData = useMemo(() => {
        const totalArea = yearlySummary?.total_area ?? 0;
        return [{ name: "Total Area", value: totalArea, unit: "ha" }];
    }, [yearlySummary]);

    // ── Handlers ─────────────────────────────────────────────────────────
    const handleMetricClick = (metric: any, title: string, description: string, calculationType?: string) => {
        if (calculationType) {
            onCalculationClick(calculationType, metric);
        } else {
            setSelectedMetric({ ...metric, title, description });
            setShowMetricModal(true);
        }
    };

    // ── Loading / No data states ─────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Sprout className="w-16 h-16 mx-auto mb-4 text-gray-300 animate-pulse" />
                    <p className="text-gray-500 text-lg">Loading crop yield forecast...</p>
                </div>
            </div>
        );
    }

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
            {/* ── Company Details Card ──────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div
                    className="p-4 border-b border-gray-200"
                    style={{ background: `linear-gradient(to right, ${COLORS.primary}15, ${COLORS.secondary}15)` }}
                >
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

            {/* ── Hero Banner ───────────────────────────────────────────────── */}
            <div
                className="relative overflow-hidden rounded-2xl p-5 shadow-2xl"
                style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.darkGreen})` }}
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="text-xl font-bold mb-1 text-white">Crop Yield Forecast Overview</h2>
                            <p className="text-green-100 text-sm">
                                {currentSeason !== "N/A" ? `Current Season: ${currentSeason}` : "Real‑time crop yield and risk assessment"}
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
                                    { value: forecastedYield, unit: yieldUnit },
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
                                {forecastedYield.toFixed(1)}
                                <span className="text-sm ml-1 text-green-100">{yieldUnit}</span>
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-green-400 text-green-900 font-medium">
                                {yieldForecast?.calculationFactors?.historical_data_available ? "Historical" : "Current"}
                            </span>
                        </div>

                        {/* Next Season Forecast */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() =>
                                handleMetricClick(
                                    yieldForecast?.nextSeasonForecast,
                                    "Next Season Forecast",
                                    "Predicted yield for the upcoming season",
                                    "next-season"
                                )
                            }
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <TrendingUp className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Next Season</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {yieldForecast?.nextSeasonForecast?.predicted_yield?.toFixed(1) ?? "N/A"}
                                <span className="text-sm ml-1 text-green-100">{yieldUnit}</span>
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                Confidence: {yieldForecast?.nextSeasonForecast?.confidence ?? 0}%
                            </span>
                        </div>

                        {/* Risk Level */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() =>
                                handleMetricClick(
                                    { level: riskLevel, score: riskScore },
                                    "Risk Assessment",
                                    "Overall crop production risk",
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
                                <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                        riskLevel === "Low"
                                            ? "bg-green-400 text-green-900"
                                            : riskLevel === "Medium"
                                            ? "bg-yellow-400 text-yellow-900"
                                            : "bg-red-400 text-red-900"
                                    }`}
                                >
                                    {riskLevel}
                                </span>
                                <span className="text-green-100 text-[10px]">
                                    {riskAssessment?.probability || ""}
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
                                {confidenceScore?.interpretation || "Data Quality"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Map Section ───────────────────────────────────────────────── */}
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
                            style={{ height: "100%", width: "100%" }}
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
                                            <h3 className="font-bold text-green-600">{cropAreaName}</h3>
                                            <p className="text-sm text-gray-700">Lat: {cropCoordinates[0].lat.toFixed(4)}</p>
                                            <p className="text-sm text-gray-700">Lon: {cropCoordinates[0].lon.toFixed(4)}</p>
                                            <p className="text-sm text-gray-700">Area: {cropAreaCovered}</p>
                                            <p className="text-sm text-gray-700">Yield: {forecastedYield.toFixed(1)} t/ha</p>
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
                                    positions={cropCoordinates.map((coord: any) => [coord.lat, coord.lon])}
                                >
                                    <Popup>
                                        <div className="p-2">
                                            <h3 className="font-bold text-green-600">{cropAreaName}</h3>
                                            <p className="text-sm text-gray-700">Area: {cropAreaCovered}</p>
                                            <p className="text-sm text-gray-700">Coordinates: {cropCoordinates.length} points</p>
                                            <p className="text-sm text-gray-700">Yield: {forecastedYield.toFixed(1)} t/ha</p>
                                        </div>
                                    </Popup>
                                </Polygon>
                            )}
                        </MapContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                            <div className="text-center">
                                <Globe className="w-16 h-16 mx-auto mb-4 opacity-20 text-green-600" />
                                <p className="text-gray-500 font-medium">No location data available</p>
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
                            <Target className="w-4 h-4 text-green-600" />
                            Monitoring Points
                        </p>
                        <p className="font-bold text-lg text-gray-900">{cropCoordinates.length} coordinates</p>
                    </div>
                </div>
            </div>

            {/* ── 2‑Column Graph Grid (first 6 graphs) ───────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {overviewGraphs.map((graph) => (
                    <GraphCard
                        key={graph.id}
                        title={graph.title}
                        description={graph.description}
                        icon={graph.icon}
                        onClick={() => setSelectedGraph(graph)}
                        onInfoClick={() =>
                            onCalculationClick(graph.id, { description: `Detailed methodology for ${graph.title}` })
                        }
                    >
                        {graph.component}
                    </GraphCard>
                ))}
            </div>

            {/* ── Full‑width: Area Under Cane (extra graph) ──────────────────── */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-green-100">
                                <AreaChartIcon className="w-6 h-6" style={{ color: COLORS.primary }} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Area Under Cane</h3>
                                <p className="text-gray-600 text-sm">Total cultivated area (hectares)</p>
                            </div>
                        </div>
                        <button
                            onClick={() => onCalculationClick("area-under-cane")}
                            className="p-2 rounded-lg hover:bg-green-100 transition-all"
                        >
                            <Info className="w-5 h-5 text-green-600" />
                        </button>
                    </div>
                </div>
                <div className="p-8">
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={areaUnderCaneData}>
                                <defs>
                                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.5} />
                                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" unit=" ha" />
                                <Tooltip
                                    formatter={(value: any) => [`${formatNumber(value)} ha`, "Area"]}
                                    contentStyle={{ backgroundColor: "#fff", borderRadius: 8 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={COLORS.primary}
                                    fill="url(#areaGradient)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Total Cultivated Area</p>
                        <p className="font-bold text-2xl text-gray-900">{formatNumber(areaUnderCaneData[0]?.value ?? 0)} ha</p>
                    </div>
                </div>
            </div>

            {/* ── Methodology Section ────────────────────────────────────────── */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Calculation Methodology</h3>
                        <p className="text-gray-600">How crop yield forecasts and risks are derived</p>
                    </div>
                    <Settings className="w-8 h-8" style={{ color: COLORS.primary }} />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div
                        className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 cursor-pointer hover:border-green-300 transition-all group"
                        onClick={() =>
                            onCalculationClick("yield-forecast", {
                                formula: yieldForecast?.formula || "Yield = Current year data",
                                factors: yieldForecast?.calculationFactors,
                            })
                        }
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-green-100">
                                <Calculator className="w-6 h-6" style={{ color: COLORS.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Yield Forecast</h4>
                        </div>
                        <p className="text-gray-700 mb-4">
                            {yieldForecast?.formula || "Current year yield with historical adjustment"}
                        </p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-green-600 font-medium">
                                Confidence: {yieldForecast?.confidenceScore ?? 0}%
                            </span>
                            <Info className="w-5 h-5 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    <div
                        className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 cursor-pointer hover:border-blue-300 transition-all group"
                        onClick={() =>
                            onCalculationClick("risk-assessment", {
                                overall: riskAssessment?.overallScore,
                                primaryRisks: riskAssessment?.primaryRisks,
                            })
                        }
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-blue-100">
                                <Shield className="w-6 h-6" style={{ color: COLORS.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Risk Assessment</h4>
                        </div>
                        <p className="text-gray-700 mb-4">Multi‑factor risk scoring (operational, yield, water, etc.)</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-600 font-medium">Score: {riskScore}</span>
                            <Info className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    <div
                        className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 cursor-pointer hover:border-purple-300 transition-all group"
                        onClick={() =>
                            onCalculationClick("confidence-score", {
                                overall: confidenceScore?.overall,
                                forecast: confidenceScore?.forecast_confidence,
                                risk: confidenceScore?.risk_assessment_confidence,
                                improvement: confidenceScore?.improvement_areas,
                            })
                        }
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-purple-100">
                                <Award className="w-6 h-6" style={{ color: COLORS.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Confidence Score</h4>
                        </div>
                        <p className="text-gray-700 mb-4">{confidenceScore?.interpretation || "Data confidence"}</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-purple-600 font-medium">{confidenceOverall}% overall</span>
                            <Info className="w-5 h-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                </div>
                <div className="mt-6">
                    <button
                        onClick={() => onCalculationClick("full-methodology", { summary: summary })}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 hover:border-green-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <span className="font-semibold text-gray-700">View Complete Methodology</span>
                        <ArrowRight className="w-5 h-5 text-green-600" />
                    </button>
                </div>
            </div>

            {/* ── API & Data Information ─────────────────────────────────────── */}
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
                            {reportingPeriod?.data_available_years?.length
                                ? `${reportingPeriod.data_available_years[0]} – ${reportingPeriod.data_available_years.slice(-1)[0]}`
                                : "N/A"}
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">Available Years</p>
                        <p className="font-bold text-lg text-gray-900">
                            {reportingPeriod?.data_available_years?.length ?? 0} periods
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">Satellite Source</p>
                        <p className="font-bold text-lg text-gray-900">
                            {companyInfo?.data_source?.join(", ") || "Sentinel-2"}
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
                        {companyInfo?.data_source?.map((src, i) => (
                            <span key={i} className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 font-medium">
                                {src}
                            </span>
                        )) || (
                            <>
                                <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">Satellite Imagery</span>
                                <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">Company Reports</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Graph Expanded Modal ──────────────────────────────────────── */}
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
                            <div className="h-[500px]">{selectedGraph.component}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Metric Detail Modal ───────────────────────────────────────── */}
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
                            style={{ background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.primaryDark})` }}
                        >
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
                                    {typeof selectedMetric.value === "number"
                                        ? selectedMetric.value.toFixed(2)
                                        : selectedMetric.value ?? "N/A"}
                                </div>
                                <div className="text-xl text-gray-600">{selectedMetric.unit}</div>
                            </div>
                            <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <h4 className="font-bold text-gray-900 mb-2">Insights</h4>
                                <div className="space-y-2 text-gray-700">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                        <span>Monitor this metric regularly to track progress.</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                        <span>Compare with industry benchmarks for context.</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                        <span>Explore efficiency improvements to optimise performance.</span>
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