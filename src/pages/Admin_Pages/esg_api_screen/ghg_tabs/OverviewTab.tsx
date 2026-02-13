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
    ghgData: any;
    themeClasses: ThemeClasses;
    chartColors: ChartColors;
    logoGreen: string;
    logoYellow: string;
    isDarkMode: boolean;
    coordinates: any[];
    areaName: string;
    areaCovered: string;
    selectedCompany: any;
    formatNumber: (num: number) => string;
    formatPercent: (num: number) => string;
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
    scope1: "#3b82f6",
    scope2: "#eab308",
    scope3: "#a855f7",
    // Graph 1 – CO₂ Stocks
    biomass: "#22c55e",
    soc: "#8b5cf6",
    netStock: "#10b981",
    // Graph 2 – CO₂ Deltas
    deltaBiomass: "#ef4444",
    deltaSoc: "#f59e0b",
    netChange: "#374151",
    // Graph 3 – Biomass Breakdown
    agb: "#16a34a",
    bgb: "#d97706",
    bioCarbon: "#059669",
    // Graph 4 – NDVI
    ndvi: "#22c55e",
};

// ─── GraphCard Shell ────────────────────────────────────────────────────────
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

// ─── Main Component ─────────────────────────────────────────────────────────
const OverviewTab: React.FC<OverviewTabProps> = ({
    ghgData,
    coordinates,
    areaName,
    areaCovered,
    selectedCompany,
    formatNumber,
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
            color: COLORS.scope1,
            percentage: totalScope > 0 ? (scope1Value / totalScope) * 100 : 0,
        },
        {
            name: "Scope 2",
            value: scope2Value,
            color: COLORS.scope2,
            percentage: totalScope > 0 ? (scope2Value / totalScope) * 100 : 0,
        },
        {
            name: "Scope 3",
            value: scope3Value,
            color: COLORS.scope3,
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
            soc_co2_total_t: monthlyGraphData.soc_co2_total_t[i],
            net_co2_stock_t: monthlyGraphData.net_co2_stock_t[i],
        }));
    })();

    // ── Graph 2 chart data: Monthly CO₂ Changes (Deltas) ───────────────────
    const graph2Data = (() => {
        if (!monthlyGraphData) return [];
        return monthlyGraphData.months.map((month, i) => ({
            month,
            delta_biomass_co2_t: monthlyGraphData.delta_biomass_co2_t[i],
            delta_soc_co2_t: monthlyGraphData.delta_soc_co2_t[i],
            net_co2_change_t: monthlyGraphData.net_co2_change_t[i],
        }));
    })();

    // ── Graph 3 chart data: Biomass Breakdown (per hectare) ────────────────
    const graph3Data = (() => {
        if (!monthlyGraphData) return [];
        return monthlyGraphData.months.map((month, i) => ({
            month,
            agb_t_per_ha: monthlyGraphData.agb_t_per_ha[i],
            bgb_t_per_ha: monthlyGraphData.bgb_t_per_ha[i],
            biomass_c_t_per_ha: monthlyGraphData.biomass_c_t_per_ha[i],
        }));
    })();

    // ── Graph 4 chart data: Vegetation Health (NDVI) ───────────────────────
    const graph4Data = (() => {
        if (!monthlyGraphData) return [];
        return monthlyGraphData.months.map((month, i) => ({
            month,
            ndvi_max: monthlyGraphData.ndvi_max[i],
        }));
    })();

    // ── Calculation formulas ────────────────────────────────────────────────
    const areaHa = keyMetrics?.carbon_intensity?.area_ha || 0;
    const carbonIntensity =
        ghgSummary?.carbonIntensity || keyMetrics?.carbon_intensity?.value || 0;

    const calculationFormulas = {
        emissions: {
            formula: "Scope 1 + Scope 2 + Scope 3 = Total Emissions",
            description: "Following GHG Protocol standards",
        },
        intensity: {
            formula: `${formatNumber(totalEmissions)} tCO₂e ÷ ${formatNumber(areaHa)} ha = ${carbonIntensity.toFixed(2)} tCO₂e/ha`,
            description: "Emissions per unit area",
        },
        netBalance: {
            formula: `${formatNumber(totalEmissions)} tCO₂e − ${formatNumber(totalSequestration)} tCO₂ = ${formatNumber(netCarbonBalance)} tCO₂e`,
            description:
                netCarbonBalance < 0 ? "Net Carbon Removal" : "Net Carbon Emissions",
        },
    };

    // ── Metric click handler ────────────────────────────────────────────────
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

    // ── Shared tooltip style ────────────────────────────────────────────────
    const tooltipStyle = {
        backgroundColor: "#ffffff",
        border: "1px solid #d1d5db",
        borderRadius: "0.5rem",
        padding: "8px",
    };

    // ── Graph definitions ───────────────────────────────────────────────────
    const overviewGraphs = [
        // ── Emissions by Scope (Pie) ──────────────────────────────────────
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
                            contentStyle={tooltipStyle}
                            formatter={(value: any) => [
                                `${formatNumber(value)} tCO₂e`,
                                "",
                            ]}
                        />
                    </RechartsPieChart>
                </ResponsiveContainer>
            ),
        },
        // ── Graph 1 – Total CO₂ Stocks ────────────────────────────────────
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
                                <stop offset="5%" stopColor={COLORS.biomass} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={COLORS.biomass} stopOpacity={0.02} />
                            </linearGradient>

                            <linearGradient id="grad_netstock" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.netStock} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={COLORS.netStock} stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 11 }} />
                        <YAxis stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 11 }} />
                        <RechartsTooltip
                            contentStyle={tooltipStyle}
                            formatter={(value: any, name: string) => [
                                `${formatNumber(Number(value))} t`,
                                name,
                            ]}
                        />
                        <RechartsLegend />
                        <Area type="monotone" dataKey="biomass_co2_total_t" name="Biomass CO₂" stroke={COLORS.biomass} fill="url(#grad_biomass)" strokeWidth={2} />
                        <Area type="monotone" dataKey="net_co2_stock_t" name="Net CO₂ Stock" stroke={COLORS.netStock} fill="url(#grad_netstock)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            ),
        },

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
                            contentStyle={tooltipStyle}
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
        },
        // ── Reduction Journey (Line) ──────────────────────────────────────
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
                            contentStyle={tooltipStyle}
                            formatter={(value: any) => [`${formatNumber(value)} tCO₂e`, ""]}
                        />
                        <RechartsLegend />
                        <RechartsLine type="monotone" dataKey="target" stroke={COLORS.primary} name="Target" strokeWidth={2} dot={{ fill: COLORS.primary, r: 4 }} />
                        <RechartsLine type="monotone" dataKey="current" stroke={COLORS.info} name="Current" strokeWidth={2} dot={{ fill: COLORS.info, r: 4 }} />
                    </RechartsLineChart>
                </ResponsiveContainer>
            ),
        },
    ];

    // ── Early return: loading ───────────────────────────────────────────────
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
            {/* ─── Company Details Card ───────────────────────────────────── */}
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
                        <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Data Confidence</p>
                            <p className="font-bold text-sm text-green-700">{confidenceScore?.toFixed(2) || 0}%</p>
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

            {/* ─── Leaflet Map ────────────────────────────────────────────── */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                Project Location
                            </h3>
                            <p className="text-gray-600 flex items-center gap-2">
                                <MapPin className="w-4 h-4" style={{ color: colors.primary }} />
                                {companyInfo.area_of_interest_metadata.name}
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
                                        (coord) => [coord.lat, coord.lon]
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
                                <Globe
                                    className="w-16 h-16 mx-auto mb-4 opacity-20"
                                    style={{ color: colors.primary }}
                                />
                                <p className="text-gray-500 font-medium">
                                    No location data available
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* ─── GHG Emissions Hero Banner ──────────────────────────────── */}
            <div
                className="relative overflow-hidden rounded-2xl p-5 shadow-2xl"
                style={{
                    background: `linear-gradient(to right, ${colors.primary}, ${colors.darkGreen})`,
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
                            <p className="text-green-100 text-sm">
                                Complete greenhouse gas emissions inventory
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
                        {/* Total Emissions */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() =>
                                handleMetricClick(
                                    ghgSummary,
                                    "Total GHG Emissions",
                                    "Total greenhouse gas emissions across all scopes",
                                    "total-emissions"
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
                                <span className="text-sm ml-1 text-green-100">tCO₂e</span>
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                All Scopes
                            </span>
                        </div>

                        {/* Scope 1 */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() =>
                                handleMetricClick(
                                    { value: ghgSummary.scope1 },
                                    "Scope 1 – Direct Emissions",
                                    "Emissions from owned or controlled sources",
                                    "scope1"
                                )
                            }
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Factory className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Scope 1 </p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {formatNumber(ghgSummary.scope1)}
                                <span className="text-sm ml-1 text-green-100">tCO₂e</span>
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                {ghgSummary.scopeComposition?.scope1?.toFixed(0) || 0}% of total
                            </span>
                        </div>

                        {/* Scope 2 */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() =>
                                handleMetricClick(
                                    { value: ghgSummary.scope2 },
                                    "Scope 2 – Energy",
                                    "Emissions from purchased electricity, heat, and cooling",
                                    "scope2"
                                )
                            }
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Zap className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Scope 2 </p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {formatNumber(ghgSummary.scope2)}
                                <span className="text-sm ml-1 text-green-100">tCO₂e</span>
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                {ghgSummary.scopeComposition?.scope2?.toFixed(0) || 0}% of total
                            </span>
                        </div>

                        {/* Net Carbon Balance */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() =>
                                handleMetricClick(
                                    ghgSummary,
                                    "Net Carbon Balance",
                                    "Total emissions minus carbon sequestration",
                                    "net-balance"
                                )
                            }
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Activity className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Scope 3</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {formatNumber(ghgSummary.scope3)}
                                <span className="text-sm ml-1 text-green-100">tCO₂e</span>
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
                                <span className="text-green-100 text-[10px]">
                                    {netCarbonBalance < 0 ? "✓ Positive" : "⚠ Needs Attention"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Graphs Grid (2-col) ────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {overviewGraphs
                    .filter((graph) => {
                        // Hide data-dependent graphs when there is no data
                        if (
                            ["total-co2-stocks", "monthly-co2-changes", "biomass-breakdown", "vegetation-health"].includes(graph.id) &&
                            !monthlyGraphData
                        )
                            return false;
                        if (graph.id === "reduction-progress" && reductionData.length === 0)
                            return false;
                        return true;
                    })
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

            {/* ─── Calculation Methodology ───────────────────────────────── */}
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
                        className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 cursor-pointer hover:border-green-300 transition-all group"
                        onClick={() =>
                            onCalculationClick("emissions", calculationFormulas.emissions)
                        }
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-green-100">
                                <Cloud className="w-6 h-6" style={{ color: colors.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Total Emissions</h4>
                        </div>
                        <p className="text-gray-700 mb-4">Sum of Scope 1, 2, and 3 emissions</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-green-600 font-medium">
                                Formula: Scope 1 + Scope 2 + Scope 3
                            </span>
                            <Info className="w-5 h-5 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    {/* Carbon Intensity */}
                    <div
                        className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 cursor-pointer hover:border-blue-300 transition-all group"
                        onClick={() =>
                            onCalculationClick("intensity", calculationFormulas.intensity)
                        }
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-blue-100">
                                <Scale className="w-6 h-6" style={{ color: colors.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Carbon Intensity</h4>
                        </div>
                        <p className="text-gray-700 mb-4">Emissions per unit area</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-600 font-medium">
                                Formula: Emissions ÷ Area
                            </span>
                            <Info className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    {/* Net Balance */}
                    <div
                        className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 cursor-pointer hover:border-purple-300 transition-all group"
                        onClick={() =>
                            onCalculationClick("net-balance", calculationFormulas.netBalance)
                        }
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-purple-100">
                                <Calculator className="w-6 h-6" style={{ color: colors.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Net Balance</h4>
                        </div>
                        <p className="text-gray-700 mb-4">Emissions minus sequestration</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-purple-600 font-medium">
                                Formula: Emissions − Sequestration
                            </span>
                            <Info className="w-5 h-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                </div>
            </div>


            {/* ─── Graph Expanded Modal ──────────────────────────────────── */}
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

            {/* ─── Metric Detail Modal ────────────────────────────────────── */}
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
                                background: `linear-gradient(to right, ${colors.primary}, ${colors.darkGreen})`,
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
                                    {formatNumber(selectedMetric.value)}
                                </div>
                                <div className="text-xl text-gray-600">tons of CO₂</div>
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
                                        <span>Set reduction targets and action plans</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span>
                                            Explore renewable energy and efficiency improvements
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