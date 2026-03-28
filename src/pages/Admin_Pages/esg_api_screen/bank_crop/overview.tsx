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
    Landmark,
} from "lucide-react";

// ─── NEW SERVICE IMPORTS ───────────────────────────────────────────────
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

// ─── BANK COLOUR PALETTE (Navy & Gold) ─────────────────────────────────
const COLORS = {
    primary: "#0A3B5C",      // deep navy
    primaryDark: "#05283e",
    secondary: "#D4AF37",    // classic gold
    secondaryLight: "#f5e7b2",
    accent: "#D4AF37",
    success: "#2E7D32",
    warning: "#eab308",
    danger: "#dc2626",
    info: "#2563eb",
    company: "#0A3B5C",      // navy for company
    private: "#D4AF37",      // gold for private
    total: "#4B5563",        // gray for total
    sugar: "#7C3AED",
    molasses: "#B45309",
    ratio: "#2563eb",
    chart: ["#0A3B5C", "#D4AF37", "#4B5563", "#7C3AED", "#B45309", "#2563eb"],
    riskColors: ["#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6", "#10b981", "#eab308"],
};

// ─── GraphCard (reusable, now with navy/gold accents) ──────────────────
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
                        className="p-2 rounded-lg hover:bg-navy-100 transition-all"
                        style={{ color: COLORS.primary }}
                    >
                        <Info className="w-5 h-5" />
                    </button>
                    {icon}
                </div>
            </div>
        </div>
        <div className="p-4 h-80">{children}</div>
    </div>
);

// ─── PROPS ─────────────────────────────────────────────────────────────
interface OverviewTabProps {
    cropYieldData: CropYieldForecastResponse | null;
    selectedCompany?: any;
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

// ─── ESG EXPLANATION COMPONENT (plain‑language helper) ─────────────────
const ESGExplanation: React.FC<{
    title: string;
    environmental: string;
    social: string;
    governance: string;
}> = ({ title, environmental, social, governance }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: COLORS.primary }} />
            {title}
        </h4>
        <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: COLORS.primary }} />
                <div>
                    <span className="font-medium text-gray-700">Environmental: </span>
                    <span className="text-gray-600">{environmental}</span>
                </div>
            </div>
            <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: COLORS.secondary }} />
                <div>
                    <span className="font-medium text-gray-700">Social: </span>
                    <span className="text-gray-600">{social}</span>
                </div>
            </div>
            <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: COLORS.primaryDark }} />
                <div>
                    <span className="font-medium text-gray-700">Governance: </span>
                    <span className="text-gray-600">{governance}</span>
                </div>
            </div>
        </div>
    </div>
);

// ─── MAIN COMPONENT ────────────────────────────────────────────────────
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
    colors = COLORS, // override with navy/gold
}) => {
    // ── State for modals ───────────────────────────────────────────────
    const [selectedGraph, setSelectedGraph] = useState<any>(null);
    const [showMetricModal, setShowMetricModal] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState<any>(null);

    // ── Extract data using the utility functions ───────────────────────
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

    // Graph data from API
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

    // ── Derived values ─────────────────────────────────────────────────
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

    // ─── CHART DATA PREPARATION ────────────────────────────────────────
    const chartData = useMemo(() => {
        // 1. Company vs Private Yield (bar chart)
        const companyYield = yearlySummary?.company_yield ?? 0;
        const privateYield = yearlySummary?.private_yield ?? 0;
        const yieldComparisonData = [
            { name: "Company Estates", value: companyYield, fill: COLORS.company },
            { name: "Private Farmers", value: privateYield, fill: COLORS.private },
        ];

        // 2. Cane Harvested (tons) – using the table from the image
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
            metric: item.metric.split(" ").slice(0, 3).join(" "),
        }));

        // 5. Risk distribution – radar chart (from API)
        const radarData = riskGraph?.labels.map((label, idx) => ({
            category: label,
            score: riskGraph.datasets[0]?.data[idx] ?? 0,
        })) ?? [];

        // 6. Forecast confidence – bar chart (from API)
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

    // ─── GRAPH DEFINITIONS (with ESG‑focused titles & descriptions) ────
    const overviewGraphs = [
        {
            id: "yield-comparison",
            title: "Yield Comparison: Company vs. Private",
            description: "Who produces more per hectare?",
            icon: <BarChart3 className="w-5 h-5" style={{ color: COLORS.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.yieldComparisonData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" unit=" t/ha" />
                        <Tooltip
                            formatter={(value: any) => [`${value.toFixed(1)} t/ha`, "Yield"]}
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
            esg: {
                environmental: "Higher yields mean less land needed for same output, preserving natural habitats.",
                social: "Company estates often provide better wages and technology, but private farmers may need support.",
                governance: "Yield disparity can indicate governance gaps in contract farming or extension services.",
            },
        },
        {
            id: "cane-harvested",
            title: "Cane Harvested: Who contributes most?",
            description: "Breakdown of total cane milled",
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
            esg: {
                environmental: "Total cane milled correlates with water use, fertilizer application, and carbon footprint.",
                social: "Shares between company and private farmers reflect livelihoods and rural employment.",
                governance: "Data transparency on sourcing from private farmers is key to fair trade and sustainability reporting.",
            },
        },
        {
            id: "sugar-production",
            title: "Sugar & By‑products",
            description: "What becomes of the cane?",
            icon: <Factory className="w-5 h-5" style={{ color: COLORS.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.sugarProductionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" />
                        <YAxis yAxisId="left" stroke="#6b7280" unit=" t" />
                        <YAxis yAxisId="right" orientation="right" unit=" %" domain={[0, 20]} />
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
            esg: {
                environmental: "Molasses can be used for bioenergy, reducing waste; cane-to-sugar ratio affects processing emissions.",
                social: "Sugar is a staple; local processing creates jobs and supports communities.",
                governance: "Efficient processing reflects operational governance and technology adoption.",
            },
        },
        {
            id: "yoy-changes",
            title: "Year‑on‑Year Changes",
            description: "How performance is trending",
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
            esg: {
                environmental: "Positive trends may indicate better soil health or climate adaptation; declines could signal degradation.",
                social: "Stable yields support farmer incomes and community resilience.",
                governance: "Volatility may reflect governance issues in supply chain or risk management.",
            },
        },
        {
            id: "risk-radar",
            title: "Risk Profile (ESG Dimensions)",
            description: "Multi‑factor risk assessment",
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
                            contentStyle={{ backgroundColor: "#fff", borderRadius: 8 }}
                        />
                        <Legend />
                    </RadarChart>
                </ResponsiveContainer>
            ),
            esg: {
                environmental: "High scores in water or climate risk indicate vulnerability to droughts or floods.",
                social: "Labour or community risks affect local relations and operational stability.",
                governance: "Regulatory or compliance risks impact licensing and reputation.",
            },
        },
        {
            id: "forecast-confidence",
            title: "Forecast Confidence",
            description: "How reliable are the predictions?",
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
            esg: {
                environmental: "Low confidence in climate data may hide true environmental risks.",
                social: "Uncertainty about farmer data can affect social impact assessments.",
                governance: "Transparency in data sources builds trust with stakeholders.",
            },
        },
    ];

    // Additional full‑width graph: Area Under Cane
    const areaUnderCaneData = useMemo(() => {
        const totalArea = yearlySummary?.total_area ?? 0;
        return [{ name: "Total Area", value: totalArea, unit: "ha" }];
    }, [yearlySummary]);

    // ── Handlers ───────────────────────────────────────────────────────
    const handleMetricClick = (metric: any, title: string, description: string, calculationType?: string) => {
        if (calculationType) {
            onCalculationClick(calculationType, metric);
        } else {
            setSelectedMetric({ ...metric, title, description });
            setShowMetricModal(true);
        }
    };

    // ── Loading / No data states ───────────────────────────────────────
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
            {/* ── AREA OF INTEREST CARD (instead of company details) ────────── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div
                    className="p-4 border-b border-gray-200"
                    style={{ background: `linear-gradient(to right, ${COLORS.primary}15, ${COLORS.secondary}15)` }}
                >
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm">
                            <MapPin className="w-5 h-5" style={{ color: COLORS.primary }} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-0.5">Area of Interest</h2>
                            <p className="text-sm text-gray-600">{cropAreaName}</p>
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Area Covered</p>
                            <p className="font-bold text-sm text-gray-900">{cropAreaCovered}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Coordinates</p>
                            <p className="font-bold text-sm text-gray-900">{cropCoordinates.length} points</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Current Season</p>
                            <p className="font-bold text-sm text-gray-900">{currentSeason}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-navy-50 to-gold-50 border border-navy-200"
                            style={{ background: `linear-gradient(to bottom right, ${COLORS.primary}10, ${COLORS.secondary}10)` }}>
                            <p className="text-[10px] text-gray-600 mb-0.5">Data Confidence</p>
                            <p className="font-bold text-sm" style={{ color: COLORS.primary }}>{confidenceOverall}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── MAP SECTION (Area of Interest) ─────────────────────────────── */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200" style={{ background: `linear-gradient(to right, ${COLORS.primary}15, ${COLORS.secondary}15)` }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Field Location</h3>
                            <p className="text-gray-600 flex items-center gap-2">
                                <MapPin className="w-4 h-4" style={{ color: COLORS.primary }} />
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
                                            <h3 className="font-bold" style={{ color: COLORS.primary }}>{cropAreaName}</h3>
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
                                            <h3 className="font-bold" style={{ color: COLORS.primary }}>{cropAreaName}</h3>
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
                                <Globe className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: COLORS.primary }} />
                                <p className="text-gray-500 font-medium">No location data available</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── HERO BANNER (Key metrics with plain‑language ESG tags) ─────── */}
            <div
                className="relative overflow-hidden rounded-2xl p-5 shadow-2xl"
                style={{ backgroundColor: "#0A3B5C", color: "#fff", padding: "20px" }}           >
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="text-xl font-bold mb-1 text-white">Crop Yield & ESG Snapshot</h2>
                            <p className="text-gold-100 text-sm" style={{ color: COLORS.secondaryLight }}>
                                {currentSeason !== "N/A" ? `Current Season: ${currentSeason}` : "Real‑time assessment"}
                            </p>
                        </div>
                        <button
                            onClick={() => onCalculationClick("overview")}
                            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 text-white text-xs"
                        >
                            <Calculator className="w-3.5 h-3.5" />
                            How to read this?
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
                                    "Expected crop yield this season",
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
                                <span className="text-sm ml-1 text-gold-200">{yieldUnit}</span>
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-gold-400 text-navy-900 font-medium"
                                style={{ backgroundColor: COLORS.secondary, color: COLORS.primaryDark }}>
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
                                <span className="text-sm ml-1 text-gold-200">{yieldUnit}</span>
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
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${riskLevel === "Low"
                                        ? "bg-green-400 text-green-900"
                                        : riskLevel === "Medium"
                                            ? "bg-yellow-400 text-yellow-900"
                                            : "bg-red-400 text-red-900"
                                        }`}
                                >
                                    {riskLevel}
                                </span>
                                <span className="text-gold-200 text-[10px]">
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

            {/* ── 2‑COLUMN GRAPH GRID + ESG EXPLANATIONS ─────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {overviewGraphs.map((graph) => (
                    <div key={graph.id} className="space-y-2">
                        <GraphCard
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
                        <ESGExplanation
                            title={`What this means for ESG`}
                            environmental={graph.esg.environmental}
                            social={graph.esg.social}
                            governance={graph.esg.governance}
                        />
                    </div>
                ))}
            </div>

            {/* ── FULL‑WIDTH: Area Under Cane ────────────────────────────────── */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200" style={{ background: `linear-gradient(to right, ${COLORS.primary}15, ${COLORS.secondary}15)` }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl" style={{ backgroundColor: COLORS.primary + '20' }}>
                                <AreaChartIcon className="w-6 h-6" style={{ color: COLORS.primary }} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Area Under Cane</h3>
                                <p className="text-gray-600 text-sm">Total cultivated land</p>
                            </div>
                        </div>
                        <button
                            onClick={() => onCalculationClick("area-under-cane")}
                            className="p-2 rounded-lg hover:bg-navy-100 transition-all"
                            style={{ color: COLORS.primary }}
                        >
                            <Info className="w-5 h-5" />
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
                        <ESGExplanation
                            title="ESG perspective"
                            environmental="Larger area may imply more land conversion; efficient use reduces pressure on ecosystems."
                            social="Land tenure and smallholder inclusion matter for community relations."
                            governance="Clear land ownership and use rights are fundamental to sustainable governance."
                        />
                    </div>
                </div>
            </div>

            {/* ── DATA QUALITY & METHODOLOGY ─────────────────────────────────── */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Behind the Numbers</h3>
                        <p className="text-gray-600">How we measure and why it matters for ESG</p>
                    </div>
                    <Settings className="w-8 h-8" style={{ color: COLORS.primary }} />
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl border border-gray-200 hover:border-navy-300 transition-all"
                        style={{ background: `linear-gradient(to bottom right, ${COLORS.primary}05, white)` }}>
                        <h4 className="font-bold text-lg mb-2" style={{ color: COLORS.primary }}>Data Sources</h4>
                        <p className="text-gray-700 text-sm mb-4">
                            {companyInfo?.data_source?.join(", ") || "Satellite imagery, company reports, and public databases."}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {(companyInfo?.data_source || ["Sentinel‑2", "Landsat", "Company ESG reports"]).map((src, i) => (
                                <span key={i} className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">{src}</span>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-gray-200 hover:border-gold-300 transition-all"
                        style={{ background: `linear-gradient(to bottom right, ${COLORS.secondary}10, white)` }}>
                        <h4 className="font-bold text-lg mb-2" style={{ color: COLORS.secondary }}>Confidence Explained</h4>
                        <p className="text-gray-700 text-sm mb-2">
                            Overall confidence: <span className="font-bold">{confidenceOverall}%</span>
                        </p>
                        <p className="text-gray-600 text-xs">
                            {confidenceScore?.interpretation || "Based on data freshness, completeness, and model accuracy."}
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl border border-gray-200 hover:border-navy-300 transition-all">
                        <h4 className="font-bold text-lg mb-2" style={{ color: COLORS.primary }}>ESG Relevance</h4>
                        <ul className="text-sm text-gray-700 space-y-2 list-disc pl-4">
                            <li><span className="font-medium">Environmental:</span> Yield affects land‑use efficiency and carbon footprint.</li>
                            <li><span className="font-medium">Social:</span> Balance between company and private farmers reflects community impact.</li>
                            <li><span className="font-medium">Governance:</span> Data transparency and risk management indicate board oversight.</li>
                        </ul>
                    </div>
                </div>

                <button
                    onClick={() => onCalculationClick("full-methodology")}
                    className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 hover:border-navy-300 hover:bg-gradient-to-r hover:from-navy-50 hover:to-gold-50 transition-all duration-200 flex items-center justify-center gap-2"
                >
                    <span className="font-semibold text-gray-700">Read full methodology</span>
                    <ArrowRight className="w-5 h-5" style={{ color: COLORS.primary }} />
                </button>
            </div>

            {/* ── GRAPH EXPANDED MODAL ───────────────────────────────────────── */}
            {selectedGraph && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setSelectedGraph(null)}
                >
                    <div
                        className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-200" style={{ background: `linear-gradient(to right, ${COLORS.primary}15, ${COLORS.secondary}15)` }}>
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
                            <div className="mt-4">
                                <ESGExplanation
                                    title="ESG implications"
                                    environmental={selectedGraph.esg?.environmental || "See graph for details."}
                                    social={selectedGraph.esg?.social || "See graph for details."}
                                    governance={selectedGraph.esg?.governance || "See graph for details."}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── METRIC DETAIL MODAL ───────────────────────────────────────── */}
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
                                    <p className="text-gold-200">{selectedMetric.description}</p>
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
                                <div className="text-6xl font-bold mb-2" style={{ color: COLORS.primary }}>
                                    {typeof selectedMetric.value === "number"
                                        ? selectedMetric.value.toFixed(2)
                                        : selectedMetric.value ?? "N/A"}
                                </div>
                                <div className="text-xl text-gray-600">{selectedMetric.unit}</div>
                            </div>
                            <div className="p-6 rounded-xl border-2"
                                style={{ borderColor: COLORS.primary + '30', background: `linear-gradient(to bottom right, ${COLORS.primary}05, white)` }}>
                                <h4 className="font-bold text-gray-900 mb-2">ESG Insight</h4>
                                <div className="space-y-2 text-gray-700">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: COLORS.primary }} />
                                        <span>This metric helps track environmental efficiency and resource use.</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: COLORS.secondary }} />
                                        <span>Social implications depend on how yields are distributed among stakeholders.</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: COLORS.primaryDark }} />
                                        <span>Governance is reflected in the reliability and transparency of the data.</span>
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