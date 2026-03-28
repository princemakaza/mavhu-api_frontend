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
} from "lucide-react";
import {
    getGhgSummary,
    getScopeBreakdown,
    getCarbonEmissionAccounting,
    getYearlyDataSummary,
    getSequestrationSummary,
    getKeyEmissionMetrics,
    getMonthlyGraphData,
    getCompanyInfo,
    getReportingYear,
    getDataAvailability,
    MonthlyGraphData,
} from "../../../../services/Admin_Service/esg_apis/ghg_emmision";

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ─── Theme & Color Types (using bank palette from props) ───────────────────
interface OverviewTabProps {
    ghgData: any;
    selectedCompany: any;
    formatNumber: (num: number) => string;
    formatPercent: (num: number) => string;
    getTrendIcon?: (trend: string) => JSX.Element;
    selectedYear?: number | null;
    availableYears?: number[];
    latestYear?: number | null;
    loading?: boolean;
    isRefreshing?: boolean;
    onMetricClick: (metric: any, modalType: string) => void;
    onCalculationClick: (calculationType: string, data?: any) => void;
    colors: {
        primary: string;   // navy #0A3B5C
        secondary: string; // gold #D4AF37
        lightBg: string;
        cardBg: string;
    };
}

// ─── ESG Explanation Component (plain language) ───────────────────────────
const ESGExplanation: React.FC<{
    title: string;
    environmental: string;
    social: string;
    governance: string;
    colors: { primary: string; secondary: string };
}> = ({ title, environmental, social, governance, colors }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mt-2">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: colors.primary }} />
            {title}
        </h4>
        <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: colors.primary }} />
                <div>
                    <span className="font-medium text-gray-700">Environmental: </span>
                    <span className="text-gray-600">{environmental}</span>
                </div>
            </div>
            <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: colors.secondary }} />
                <div>
                    <span className="font-medium text-gray-700">Social: </span>
                    <span className="text-gray-600">{social}</span>
                </div>
            </div>
            <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: colors.primary }} />
                <div>
                    <span className="font-medium text-gray-700">Governance: </span>
                    <span className="text-gray-600">{governance}</span>
                </div>
            </div>
        </div>
    </div>
);

// ─── GraphCard Shell (bank styled) ────────────────────────────────────────
const GraphCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    onInfoClick: () => void;
    children: React.ReactNode;
    colors: { primary: string; secondary: string };
}> = ({ title, description, icon, onClick, onInfoClick, children, colors }) => (
    <div
        className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
        onClick={onClick}
    >
        <div
            className="p-4 border-b border-gray-200"
            style={{
                background: `linear-gradient(to right, ${colors.primary}15, ${colors.secondary}15)`,
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
                        className="p-2 rounded-lg hover:bg-navy-100 transition-all"
                        style={{ color: colors.primary }}
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

// ─── Main Component ─────────────────────────────────────────────────────────
const OverviewTab: React.FC<OverviewTabProps> = ({
    ghgData,
    selectedCompany,
    formatNumber,
    formatPercent,
    onMetricClick,
    onCalculationClick,
    colors,
}) => {
    const [selectedGraph, setSelectedGraph] = useState<any>(null);
    const [showMetricModal, setShowMetricModal] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState<any>(null);

    // ── Derived data from service helpers ───────────────────────────────────
    const ghgSummary = ghgData ? getGhgSummary(ghgData) : null;
    const scopeBreakdown = ghgData ? getScopeBreakdown(ghgData) : null;
    const carbonAccounting = ghgData ? getCarbonEmissionAccounting(ghgData) : null;
    const yearlySummary = ghgData ? getYearlyDataSummary(ghgData) : null;
    const sequestrationSummary = ghgData ? getSequestrationSummary(ghgData) : null;
    const keyMetrics = ghgData ? getKeyEmissionMetrics(ghgData) : null;
    const monthlyGraphData: MonthlyGraphData | null = ghgData
        ? getMonthlyGraphData(ghgData)
        : null;
    const companyInfo = ghgData ? getCompanyInfo(ghgData) : null;
    const currentYear = ghgData ? getReportingYear(ghgData) : null;
    const dataAvailability = ghgData ? getDataAvailability(ghgData) : null;

    // Confidence from data availability
    const confidenceScore =
        dataAvailability?.carbon_data_quality?.completeness_score || 0;

    // ── Totals ──────────────────────────────────────────────────────────────
    const totalEmissions = ghgSummary?.totalEmissions || 0;
    const netCarbonBalance =
        ghgSummary?.netBalance || keyMetrics?.net_carbon_balance?.value || 0;
    const totalSequestration = sequestrationSummary?.total || 0;

    // ── Scope pie data ──────────────────────────────────────────────────────
    const scope1Value = ghgSummary?.scope1 || 0;
    const scope2Value = ghgSummary?.scope2 || 0;
    const scope3Value = ghgSummary?.scope3 || 0;
    const totalScope = scope1Value + scope2Value + scope3Value;

    const scopeData = [
        {
            name: "Scope 1",
            value: scope1Value,
            color: colors.primary,
            percentage: totalScope > 0 ? (scope1Value / totalScope) * 100 : 0,
        },
        {
            name: "Scope 2",
            value: scope2Value,
            color: colors.secondary,
            percentage: totalScope > 0 ? (scope2Value / totalScope) * 100 : 0,
        },
        {
            name: "Scope 3",
            value: scope3Value,
            color: "#6B7280", // gray for third
            percentage: totalScope > 0 ? (scope3Value / totalScope) * 100 : 0,
        },
    ];

    // ── Reduction journey (simplified yearly trend) ────────────────────────
    const reductionData = (() => {
        if (!yearlySummary || !ghgSummary) return [];
        const base = ghgSummary.totalEmissions;
        const yr = currentYear || 2024;
        return [
            { year: yr - 2, target: base * 1.15, current: base * 1.1 },
            { year: yr - 1, target: base * 1.08, current: base * 1.05 },
            { year: yr, target: base * 0.9, current: base },
        ];
    })();

    // ── Graph 1 chart data: Total CO₂ Stocks ──────────────────────────────
    const graph1Data = (() => {
        if (!monthlyGraphData) return [];
        return monthlyGraphData.months.map((month, i) => ({
            month,
            biomass_co2_total_t: monthlyGraphData.biomass_co2_total_t[i],
            net_co2_stock_t: monthlyGraphData.net_co2_stock_t[i],
        }));
    })();

    // ── Graph definitions with ESG explanations ─────────────────────────────
    const overviewGraphs = [
        // 1. Emissions by Scope (Pie)
        {
            id: "emissions-breakdown",
            title: "Emissions by Scope",
            description: "Breakdown of emissions by scope",
            icon: <PieChartIcon className="w-5 h-5" style={{ color: colors.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                        <Pie
                            data={scopeData.filter((item) => item.value > 0)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) =>
                                `${name}: ${percentage.toFixed(0)}%`
                            }
                            outerRadius={100}
                            dataKey="value"
                        >
                            {scopeData
                                .filter((item) => item.value > 0)
                                .map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                        </Pie>
                        <RechartsTooltip
                            contentStyle={{ backgroundColor: "#fff", borderRadius: 8, border: "1px solid #d1d5db" }}
                            formatter={(value: any) => [
                                `${formatNumber(value)} tCO₂e`,
                                "",
                            ]}
                        />
                    </RechartsPieChart>
                </ResponsiveContainer>
            ),
            esg: {
                environmental: "Shows which parts of the business create the most emissions. Scope 1 (direct) often has the biggest immediate impact on the environment.",
                social: "High Scope 3 emissions (supply chain) can indicate social risks like supplier working conditions or community reliance.",
                governance: "Clear scope breakdown helps track progress against reduction targets and shows management's commitment to transparency.",
            },
        },
        // 2. Total CO₂ Stocks (Area chart)
        {
            id: "total-co2-stocks",
            title: "Total CO₂ Stocks",
            description: "Where your total carbon is sitting over time",
            icon: <AreaChartIcon className="w-5 h-5" style={{ color: colors.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={graph1Data}>
                        <defs>
                            <linearGradient id="grad_biomass" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={colors.primary} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={colors.primary} stopOpacity={0.02} />
                            </linearGradient>
                            <linearGradient id="grad_netstock" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={colors.secondary} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={colors.secondary} stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 11 }} />
                        <YAxis stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 11 }} />
                        <RechartsTooltip
                            contentStyle={{ backgroundColor: "#fff", borderRadius: 8 }}
                            formatter={(value: any, name: string) => [
                                `${formatNumber(Number(value))} t`,
                                name === "biomass_co2_total_t" ? "Biomass CO₂" : "Net CO₂ Stock",
                            ]}
                        />
                        <RechartsLegend />
                        <Area type="monotone" dataKey="biomass_co2_total_t" name="Biomass CO₂" stroke={colors.primary} fill="url(#grad_biomass)" strokeWidth={2} />
                        <Area type="monotone" dataKey="net_co2_stock_t" name="Net CO₂ Stock" stroke={colors.secondary} fill="url(#grad_netstock)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            ),
            esg: {
                environmental: "Shows how carbon stored in plants and soil changes over the year. Healthy ecosystems store more carbon, helping fight climate change.",
                social: "Land use and farming practices affect local communities – stable carbon stocks often mean sustainable land management.",
                governance: "Monitoring carbon stocks demonstrates long‑term thinking and responsible asset management.",
            },
        },
        // 3. Emissions Comparison (Bar chart)
        {
            id: "scope-comparison",
            title: "Emissions Comparison",
            description: "Compare different emission scopes",
            icon: <BarChart3 className="w-5 h-5" style={{ color: colors.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={scopeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 10 }} />
                        <YAxis stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 11 }} />
                        <RechartsTooltip
                            contentStyle={{ backgroundColor: "#fff", borderRadius: 8 }}
                            formatter={(value: any) => [`${formatNumber(value)} tCO₂e`, "Emissions"]}
                        />
                        <RechartsBar dataKey="value" radius={[4, 4, 0, 0]}>
                            {scopeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </RechartsBar>
                    </RechartsBarChart>
                </ResponsiveContainer>
            ),
            esg: {
                environmental: "Direct comparison helps prioritise which emission sources to tackle first for the biggest environmental gain.",
                social: "Scope 3 emissions often involve many people (suppliers, customers) – reducing them can improve community relations.",
                governance: "Tracking all three scopes shows comprehensive climate governance and readiness for regulations.",
            },
        },
        // 4. Reduction Journey (Line chart)
        {
            id: "reduction-progress",
            title: "Reduction Journey",
            description: "Progress towards emission targets",
            icon: <LineChartIcon className="w-5 h-5" style={{ color: colors.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={reductionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="year" stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 11 }} />
                        <YAxis stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 11 }} />
                        <RechartsTooltip
                            contentStyle={{ backgroundColor: "#fff", borderRadius: 8 }}
                            formatter={(value: any) => [`${formatNumber(value)} tCO₂e`, ""]}
                        />
                        <RechartsLegend />
                        <RechartsLine type="monotone" dataKey="target" stroke={colors.primary} name="Target" strokeWidth={2} dot={{ fill: colors.primary, r: 4 }} />
                        <RechartsLine type="monotone" dataKey="current" stroke={colors.secondary} name="Current" strokeWidth={2} dot={{ fill: colors.secondary, r: 4 }} />
                    </RechartsLineChart>
                </ResponsiveContainer>
            ),
            esg: {
                environmental: "Shows whether the company is on track to meet its climate goals. Missing targets could mean higher future emissions.",
                social: "Communities and employees expect credible climate action – visible progress builds trust.",
                governance: "Setting and reporting against targets demonstrates board‑level accountability and strategic planning.",
            },
        },
    ];

    // ── Early return if no data ─────────────────────────────────────────────
    if (!ghgSummary || !scopeBreakdown) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Thermometer className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 text-lg">
                        Loading your GHG emissions data…
                    </p>
                </div>
            </div>
        );
    }

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <div className="space-y-8 pb-8">
            {/* Company Details Card (bank styled) */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div
                    className="p-4 border-b border-gray-200"
                    style={{ background: `linear-gradient(to right, ${colors.primary}15, ${colors.secondary}15)` }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm">
                                <Building className="w-5 h-5" style={{ color: colors.primary }} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-0.5">{selectedCompany?.name || "Company"}</h2>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-navy-100 text-navy-800 font-medium"
                                        style={{ background: `${colors.primary}20`, color: colors.primary }}>
                                        {selectedCompany?.industry || "Industry"}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-gold-100 text-gold-800 font-medium"
                                        style={{ background: `${colors.secondary}20`, color: colors.secondary }}>
                                        {selectedCompany?.country || "Country"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-600 mb-0.5">Last Updated</p>
                            <p className="font-medium text-xs text-gray-900">
                                {new Date(ghgData?.data?.metadata?.generated_at || new Date()).toLocaleDateString()}
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
                        <div
                            className="p-3 rounded-xl border"
                            style={{ background: `linear-gradient(to bottom right, ${colors.primary}10, ${colors.secondary}10)`, borderColor: colors.primary }}
                        >
                            <p className="text-[10px] text-gray-600 mb-0.5">Data Confidence</p>
                            <p className="font-bold text-sm" style={{ color: colors.primary }}>{confidenceScore?.toFixed(2) || 0}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                <div
                    className="p-6 border-b border-gray-200"
                    style={{ background: `linear-gradient(to right, ${colors.primary}15, ${colors.secondary}15)` }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Project Location</h3>
                            <p className="text-gray-600 flex items-center gap-2">
                                <MapPin className="w-4 h-4" style={{ color: colors.primary }} />
                                {companyInfo?.area_of_interest_metadata?.name || "No area name"}
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
                    {companyInfo?.area_of_interest_metadata?.coordinates?.length ? (
                        <MapContainer
                            center={[
                                companyInfo.area_of_interest_metadata.coordinates[0].lat,
                                companyInfo.area_of_interest_metadata.coordinates[0].lon,
                            ]}
                            zoom={10}
                            style={{ height: "100%", width: "100%" }}
                            className="leaflet-container z-0"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {companyInfo.area_of_interest_metadata.coordinates.length === 1 ? (
                                <Marker
                                    position={[
                                        companyInfo.area_of_interest_metadata.coordinates[0].lat,
                                        companyInfo.area_of_interest_metadata.coordinates[0].lon,
                                    ]}
                                >
                                    <Popup>
                                        <div className="p-2">
                                            <h3 className="font-bold" style={{ color: colors.primary }}>
                                                {companyInfo.area_of_interest_metadata.name}
                                            </h3>
                                            <p className="text-sm text-gray-700">
                                                Lat: {companyInfo.area_of_interest_metadata.coordinates[0].lat.toFixed(4)}
                                            </p>
                                            <p className="text-sm text-gray-700">
                                                Lon: {companyInfo.area_of_interest_metadata.coordinates[0].lon.toFixed(4)}
                                            </p>
                                        </div>
                                    </Popup>
                                </Marker>
                            ) : (
                                <Polygon
                                    pathOptions={{
                                        fillColor: colors.primary,
                                        color: colors.primary,
                                        fillOpacity: 0.3,
                                        weight: 2,
                                    }}
                                    positions={companyInfo.area_of_interest_metadata.coordinates.map(
                                        (coord: any) => [coord.lat, coord.lon]
                                    )}
                                >
                                    <Popup>
                                        <div className="p-2">
                                            <h3 className="font-bold" style={{ color: colors.primary }}>
                                                {companyInfo.area_of_interest_metadata.name}
                                            </h3>
                                            <p className="text-sm text-gray-700">
                                                Area Covered: {companyInfo.area_of_interest_metadata.area_covered}
                                            </p>
                                            <p className="text-sm text-gray-700">
                                                Points: {companyInfo.area_of_interest_metadata.coordinates.length}
                                            </p>
                                        </div>
                                    </Popup>
                                </Polygon>
                            )}
                        </MapContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                            <div className="text-center">
                                <Globe className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: colors.primary }} />
                                <p className="text-gray-500 font-medium">No location data available</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* GHG Emissions Hero Banner (bank styled) */}
            <div
                className="relative overflow-hidden rounded-2xl p-5 shadow-2xl"
                style={{
                    background: `linear-gradient(to right, ${colors.primary}, #05283e)`, // navy gradient
                }}
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="text-xl font-bold mb-1 text-white">
                                GHG Emissions Overview
                            </h2>
                            <p className="text-gold-200 text-sm" style={{ color: colors.secondary }}>
                                Complete greenhouse gas emissions inventory
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
                        {/* Total Emissions */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() =>
                                onMetricClick(
                                    ghgSummary,
                                    "Total GHG Emissions",
                                    "Total greenhouse gas emissions across all scopes"
                                )
                            }
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Thermometer className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Total GHG Emissions</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {formatNumber(totalEmissions)}
                                <span className="text-sm ml-1 text-gold-200">tCO₂e</span>
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                All Scopes
                            </span>
                        </div>

                        {/* Scope 1 */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() =>
                                onMetricClick(
                                    { value: ghgSummary.scope1 },
                                    "Scope 1 – Direct Emissions",
                                    "Emissions from owned or controlled sources"
                                )
                            }
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Factory className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Scope 1</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {formatNumber(ghgSummary.scope1)}
                                <span className="text-sm ml-1 text-gold-200">tCO₂e</span>
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                {ghgSummary.scopeComposition?.scope1?.toFixed(0) || 0}% of total
                            </span>
                        </div>

                        {/* Scope 2 */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() =>
                                onMetricClick(
                                    { value: ghgSummary.scope2 },
                                    "Scope 2 – Energy",
                                    "Emissions from purchased electricity, heat, and cooling"
                                )
                            }
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Zap className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Scope 2</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {formatNumber(ghgSummary.scope2)}
                                <span className="text-sm ml-1 text-gold-200">tCO₂e</span>
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                {ghgSummary.scopeComposition?.scope2?.toFixed(0) || 0}% of total
                            </span>
                        </div>

                        {/* Scope 3 */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() =>
                                onMetricClick(
                                    { value: ghgSummary.scope3 },
                                    "Scope 3 – Value Chain",
                                    "All other indirect emissions in the value chain"
                                )
                            }
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Globe className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Scope 3</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {formatNumber(ghgSummary.scope3)}
                                <span className="text-sm ml-1 text-gold-200">tCO₂e</span>
                            </h3>
                            <div className="flex items-center justify-between">
                                <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${netCarbonBalance < 0
                                            ? "bg-green-400 text-green-900"
                                            : "bg-red-400 text-red-900"
                                        }`}
                                >
                                    {netCarbonBalance < 0 ? "Carbon Sink" : "Carbon Source"}
                                </span>
                                <span className="text-gold-200 text-[10px]">
                                    {netCarbonBalance < 0 ? "✓ Positive" : "⚠ Needs Attention"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Graphs Grid with ESG Explanations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {overviewGraphs
                    .filter((graph) => {
                        if (graph.id === "total-co2-stocks" && !monthlyGraphData) return false;
                        if (graph.id === "reduction-progress" && reductionData.length === 0) return false;
                        return true;
                    })
                    .map((graph) => (
                        <div key={graph.id} className="space-y-2">
                            <GraphCard
                                title={graph.title}
                                description={graph.description}
                                icon={graph.icon}
                                onClick={() => setSelectedGraph(graph)}
                                onInfoClick={() =>
                                    onCalculationClick(graph.id, {
                                        description: `Detailed calculation methodology for ${graph.title}`,
                                    })
                                }
                                colors={colors}
                            >
                                {graph.component}
                            </GraphCard>
                            <ESGExplanation
                                title="What this means for ESG"
                                environmental={graph.esg.environmental}
                                social={graph.esg.social}
                                governance={graph.esg.governance}
                                colors={colors}
                            />
                        </div>
                    ))}
            </div>

            {/* Calculation Methodology */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                            Calculation Methodology
                        </h3>
                        <p className="text-gray-600">
                            Understand how GHG emissions are calculated
                        </p>
                    </div>
                    <Settings className="w-8 h-8" style={{ color: colors.primary }} />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Total Emissions */}
                    <div
                        className="p-6 rounded-2xl border border-gray-200 hover:border-navy-300 transition-all cursor-pointer"
                        style={{ background: `linear-gradient(to bottom right, ${colors.primary}05, white)` }}
                        onClick={() => onCalculationClick("emissions")}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl" style={{ background: `${colors.primary}20` }}>
                                <Cloud className="w-6 h-6" style={{ color: colors.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Total Emissions</h4>
                        </div>
                        <p className="text-gray-700 mb-4">Sum of Scope 1, 2, and 3 emissions</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium" style={{ color: colors.primary }}>
                                Formula: Scope 1 + Scope 2 + Scope 3
                            </span>
                            <Info className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: colors.primary }} />
                        </div>
                    </div>

                    {/* Carbon Intensity */}
                    <div
                        className="p-6 rounded-2xl border border-gray-200 hover:border-gold-300 transition-all cursor-pointer"
                        style={{ background: `linear-gradient(to bottom right, ${colors.secondary}10, white)` }}
                        onClick={() => onCalculationClick("intensity")}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl" style={{ background: `${colors.secondary}20` }}>
                                <Scale className="w-6 h-6" style={{ color: colors.secondary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Carbon Intensity</h4>
                        </div>
                        <p className="text-gray-700 mb-4">Emissions per unit area</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium" style={{ color: colors.secondary }}>
                                Formula: Emissions ÷ Area
                            </span>
                            <Info className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: colors.secondary }} />
                        </div>
                    </div>

                    {/* Net Balance */}
                    <div
                        className="p-6 rounded-2xl border border-gray-200 hover:border-navy-300 transition-all cursor-pointer"
                        style={{ background: `linear-gradient(to bottom right, ${colors.primary}05, white)` }}
                        onClick={() => onCalculationClick("net-balance")}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl" style={{ background: `${colors.primary}20` }}>
                                <Calculator className="w-6 h-6" style={{ color: colors.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Net Balance</h4>
                        </div>
                        <p className="text-gray-700 mb-4">Emissions minus sequestration</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium" style={{ color: colors.primary }}>
                                Formula: Emissions − Sequestration
                            </span>
                            <Info className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: colors.primary }} />
                        </div>
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
                        <div className="p-6 border-b border-gray-200" style={{ background: `linear-gradient(to right, ${colors.primary}15, ${colors.secondary}15)` }}>
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
                            <div className="mt-4">
                                <ESGExplanation
                                    title="ESG implications"
                                    environmental={selectedGraph.esg?.environmental || "See graph for details."}
                                    social={selectedGraph.esg?.social || "See graph for details."}
                                    governance={selectedGraph.esg?.governance || "See graph for details."}
                                    colors={colors}
                                />
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
                        <div
                            className="p-6 border-b border-gray-200 rounded-t-3xl text-white"
                            style={{ background: `linear-gradient(to right, ${colors.primary}, #05283e)` }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold mb-1">
                                        {selectedMetric.title}
                                    </h3>
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
                                <div className="text-6xl font-bold mb-2" style={{ color: colors.primary }}>
                                    {formatNumber(selectedMetric.value)}
                                </div>
                                <div className="text-xl text-gray-600">tons of CO₂e</div>
                            </div>
                            <div className="p-6 rounded-xl border-2" style={{ borderColor: `${colors.primary}30`, background: `linear-gradient(to bottom right, ${colors.primary}05, white)` }}>
                                <h4 className="font-bold text-gray-900 mb-2">ESG Insight</h4>
                                <div className="space-y-2 text-gray-700">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: colors.primary }} />
                                        <span>This metric helps track environmental impact and resource use.</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: colors.secondary }} />
                                        <span>Social implications depend on how emissions affect local communities.</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: colors.primary }} />
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