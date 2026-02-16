import React, { useState, useMemo } from 'react';
import {
    Users,
    TrendingUp,
    TrendingDown,
    Activity,
    Target,
    Shield,
    CheckCircle,
    AlertTriangle,
    Building,
    MapPin,
    Share2,
    Download,
    Info,
    Calculator,
    Settings,
    ArrowRight,
    X,
    BarChart3,
    PieChart as PieChartIcon,
    LineChart as LineChartIcon,
    AreaChart as AreaChartIcon,
    Cloud,
    Globe,
    Trees,
    Leaf,
    Factory,
    Thermometer,
    Scale,
    Zap,
} from 'lucide-react';
import {
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    LineChart as RechartsLineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend as RechartsLegend,
    AreaChart,
    Area,
    BarChart as RechartsBarChart,
    Bar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ComposedChart,
} from "recharts";

// Import map components
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Import service helpers
import {
    getFarmCoordinates,
    getFarmAreaOfInterest,
    getComplianceScores,
    getTrainingMetrics,
    getScope3EngagementMetrics,
    getCarbonScope3,
    getFrameworkAlignment,
    getPoliciesAndCertifications,
    getDataQualityInfo,
    getGraphs,
    getOverallComplianceScore,
    getComplianceRating,
    getScope3Categories,
    getScope3TotalEmissions,
    getNetCarbonBalance,
    getTrainingHoursGraph,
    getScope3EngagementGraph,
    getScope3ByCategoryGraph,
    getFrameworkAlignmentGraph,
    getComplianceRadarGraph,
    getReportingYear,
    getCompany,
    getFarmComplianceDoc,           // added
    getRawMetrics,                   // added
    type FarmComplianceResponse,
    type Metric,                     // added
} from '../../../../services/Admin_Service/esg_apis/farm_compliance_service';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Color Palette (green theme)
const COLORS = {
    primary: '#22c55e',
    primaryDark: '#16a34a',
    primaryLight: '#86efac',
    secondary: '#10b981',
    accent: '#84cc16',
    success: '#22c55e',
    warning: '#eab308',
    danger: '#ef4444',
    info: '#3b82f6',
    scope1: '#3b82f6',
    scope2: '#eab308',
    scope3: '#a855f7',
    training: '#22c55e',
    supplier: '#f59e0b',
    framework: '#8b5cf6',
    carbon: '#ef4444',
    emerald: '#10b981',
    darkGreen: '#166534',
    lime: '#84cc16',
    lightGreen: '#bbf7d0',
};

interface ComplianceOverviewTabProps {
    complianceData: FarmComplianceResponse | null;
    selectedCompany: any; // AdminCompany type
    formatNumber: (num: number | null) => string;
    formatCurrency: (num: number | null) => string;
    formatPercent: (num: number | null) => string;
    getTrendIcon: (trend: string) => JSX.Element;
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
    colors: any; // the same color palette from parent
}

// Graph Card Component (reusable)
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

const ComplianceOverviewTab: React.FC<ComplianceOverviewTabProps> = ({
    complianceData,
    selectedCompany,
    formatNumber,
    formatPercent,
    getTrendIcon,
    selectedYear,
    coordinates,
    areaName,
    areaCovered,
    colors,
    onMetricClick,
    onCalculationClick,
}) => {
    const [selectedGraph, setSelectedGraph] = useState<any>(null);
    const [selectedMetric, setSelectedMetric] = useState<any>(null);
    const [showMetricModal, setShowMetricModal] = useState(false);

    if (!complianceData) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">No compliance data available</p>
            </div>
        );
    }

    // Use helpers to extract data
    const company = getCompany(complianceData);
    const scores = getComplianceScores(complianceData).scores;
    const rating = getComplianceRating(complianceData);
    const trainingMetrics = getTrainingMetrics(complianceData);
    const scope3Engagement = getScope3EngagementMetrics(complianceData);
    const carbonScope3 = getCarbonScope3(complianceData);
    const frameworkAlignment = getFrameworkAlignment(complianceData);
    const policies = getPoliciesAndCertifications(complianceData);
    const dataQuality = getDataQualityInfo(complianceData);
    const graphs = getGraphs(complianceData);
    const reportingYear = getReportingYear(complianceData);
    const farmComplianceDoc = getFarmComplianceDoc(complianceData);
    const rawMetrics = getRawMetrics(complianceData);

    // Determine the year to display (selectedYear or reportingYear)
    const displayYear = selectedYear || reportingYear;

    // Extract yearly training data from metrics
    const executiveMetric = rawMetrics.find(m => m.metric_name === 'Executive Training Hours');
    const seniorMetric = rawMetrics.find(m => m.metric_name === 'Senior Management Training Hours');
    const otherMetric = rawMetrics.find(m => m.metric_name === 'Other Employees Training Hours');

    // Helper to get yearly data as array of {year, value}
    const getYearlyData = (metric: Metric | undefined) => {
        if (!metric || !metric.yearly_data) return [];
        return metric.yearly_data.map(d => ({
            year: d.year,
            value: d.value,
        })).sort((a, b) => a.year.localeCompare(b.year));
    };

    const executiveYearly = getYearlyData(executiveMetric);
    const seniorYearly = getYearlyData(seniorMetric);
    const otherYearly = getYearlyData(otherMetric);

    // Get values for the display year
    const getValueForYear = (yearlyData: { year: string; value: number }[], year: number) => {
        const entry = yearlyData.find(d => d.year === year.toString());
        return entry ? entry.value : 0;
    };

    const execHours = getValueForYear(executiveYearly, displayYear);
    const seniorHours = getValueForYear(seniorYearly, displayYear);
    const otherHours = getValueForYear(otherYearly, displayYear);
    const totalTrainingHoursSum = execHours + seniorHours + otherHours;

    // Map data
    const farmArea = getFarmAreaOfInterest(complianceData);
    const farmCoordinates = getFarmCoordinates(complianceData);
    const finalCoordinates = farmCoordinates.length > 0 ? farmCoordinates : coordinates;
    const finalAreaName = farmArea?.name || areaName;
    const finalAreaCovered = farmArea?.area_covered || areaCovered;

    const mapCenter: [number, number] = finalCoordinates.length > 0
        ? [finalCoordinates[0].lat, finalCoordinates[0].lon]
        : [0, 0];

    // Get compliance rating color
    const getRatingColor = (rating: string) => {
        switch (rating.toLowerCase()) {
            case 'excellent': return COLORS.primary;
            case 'good': return COLORS.secondary;
            case 'fair': return '#fbbf24';
            case 'poor': return '#f59e0b';
            case 'needs improvement': return '#ef4444';
            default: return COLORS.primary;
        }
    };

    // Prepare data for Scope 3 categories bar chart
    const scope3Categories = getScope3Categories(complianceData) || [];
    // Aggregate by category name (some categories have multiple parameters)
    const scope3Aggregated: { [key: string]: number } = {};
    scope3Categories.forEach(cat => {
        scope3Aggregated[cat.category] = (scope3Aggregated[cat.category] || 0) + cat.tco2e_per_ha_per_year;
    });
    const scope3BarData = Object.entries(scope3Aggregated).map(([name, value]) => ({ name, value }));

    // Prepare data for Supplier Engagement bar chart
    const supplierEngagementData = [
        { name: 'Suppliers with Code', value: scope3Engagement.suppliers_with_code || 0 },
        { name: 'Suppliers Audited', value: scope3Engagement.suppliers_audited || 0 },
        { name: 'Non-Compliance Cases', value: scope3Engagement.non_compliance_cases || 0 },
        { name: 'Corrective Actions', value: scope3Engagement.corrective_actions || 0 },
    ].filter(item => item.value > 0); // only show if data exists

    // Summary metrics for hero
    const overallScore = getOverallComplianceScore(complianceData) || 0;
    const supplierComplianceScore = scores.supplierCodeAdoption || 0;
    const netCarbonBalance = getNetCarbonBalance(complianceData) || 0;

    // Data for methodology section
    const calculationFormulas = {
        complianceScore: {
            formula: "Weighted average of training, supplier, framework, and carbon scores",
            description: "Overall compliance score calculation",
        },
        training: {
            formula: "Sum of all employee training hours (executive, senior, other)",
            description: "Total training hours across all employee categories",
        },
        scope3: {
            formula: "Sum of emissions from purchased goods, fuel, transport, processing, etc.",
            description: "Scope 3 emissions across the value chain",
        },
    };

    // --- Graph definitions (3 line, 3 bar) based on actual metrics ---

    // 1. Line: Executive Training Hours Trend
    const lineDataExec = executiveYearly.map(d => ({ year: d.year, hours: d.value }));
    // 2. Line: Senior Management Training Hours Trend
    const lineDataSenior = seniorYearly.map(d => ({ year: d.year, hours: d.value }));
    // 3. Line: Other Employees Training Hours Trend
    const lineDataOther = otherYearly.map(d => ({ year: d.year, hours: d.value }));

    // Combined line data for a multi-line chart (optional, but we'll keep separate graphs as requested)
    // We'll create three separate line graphs.

    // 4. Bar: Training Hours by Category (for selected year)
    const trainingBarData = [
        { name: 'Executive', hours: execHours },
        { name: 'Senior Management', hours: seniorHours },
        { name: 'Other Employees', hours: otherHours },
    ];

    // 5. Bar: Scope 3 Emissions by Category
    const scope3BarDataFiltered = scope3BarData.filter(d => d.value > 0);

    // 6. Bar: Supplier Engagement Metrics
    const supplierBarData = supplierEngagementData;

    const overviewGraphs = [
        // 1. Line: Executive Training Hours Trend
        {
            id: 'executive-training-trend',
            title: "Executive Training Hours Trend",
            description: "Yearly trend of executive training hours",
            icon: <LineChartIcon className="w-5 h-5" style={{ color: colors.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={lineDataExec}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="year" stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 11 }} />
                        <YAxis stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 11 }} />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="hours" stroke={colors.primary} strokeWidth={2} dot={{ fill: colors.primary }} />
                    </RechartsLineChart>
                </ResponsiveContainer>
            ),
        },
        // 2. Line: Senior Management Training Hours Trend
        {
            id: 'senior-training-trend',
            title: "Senior Management Training Hours Trend",
            description: "Yearly trend of senior management training hours",
            icon: <LineChartIcon className="w-5 h-5" style={{ color: colors.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={lineDataSenior}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="year" stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 11 }} />
                        <YAxis stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 11 }} />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="hours" stroke={colors.emerald} strokeWidth={2} dot={{ fill: colors.emerald }} />
                    </RechartsLineChart>
                </ResponsiveContainer>
            ),
        },
        // 3. Line: Other Employees Training Hours Trend
        {
            id: 'other-training-trend',
            title: "Other Employees Training Hours Trend",
            description: "Yearly trend of other employees training hours",
            icon: <LineChartIcon className="w-5 h-5" style={{ color: colors.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={lineDataOther}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="year" stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 11 }} />
                        <YAxis stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 11 }} />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="hours" stroke={colors.secondary} strokeWidth={2} dot={{ fill: colors.secondary }} />
                    </RechartsLineChart>
                </ResponsiveContainer>
            ),
        },
        // 4. Bar: Training Hours by Category (selected year)
        {
            id: 'training-by-category',
            title: `Training Hours by Category (${displayYear})`,
            description: "Breakdown of training hours for the selected year",
            icon: <BarChart3 className="w-5 h-5" style={{ color: colors.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={trainingBarData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 11 }} />
                        <YAxis stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 11 }} />
                        <RechartsTooltip />
                        <Bar dataKey="hours" fill={colors.primary} radius={[4, 4, 0, 0]}>
                            {trainingBarData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 0 ? colors.primary : index === 1 ? colors.emerald : colors.secondary} />
                            ))}
                        </Bar>
                    </RechartsBarChart>
                </ResponsiveContainer>
            ),
        },
        // 5. Bar: Scope 3 Emissions by Category
        {
            id: 'scope3-by-category-bar',
            title: "Scope 3 Emissions by Category",
            description: "Emissions breakdown by category (tCO₂e/ha/yr)",
            icon: <Factory className="w-5 h-5" style={{ color: colors.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={scope3BarDataFiltered} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 10 }} width={100} />
                        <RechartsTooltip formatter={(value: any) => [`${value.toFixed(2)} tCO₂e/ha/yr`, 'Emissions']} />
                        <Bar dataKey="value" fill={colors.carbon} radius={[0, 4, 4, 0]} />
                    </RechartsBarChart>
                </ResponsiveContainer>
            ),
        },
        // 6. Bar: Supplier Engagement Metrics
        {
            id: 'supplier-engagement',
            title: "Supplier Engagement Metrics",
            description: "Key indicators for Scope 3 supplier management",
            icon: <Shield className="w-5 h-5" style={{ color: colors.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={supplierBarData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
                        <YAxis stroke="#6b7280" tick={{ fill: "#6b7280", fontSize: 11 }} />
                        <RechartsTooltip />
                        <Bar dataKey="value" fill={colors.supplier} radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                </ResponsiveContainer>
            ),
        },
    ];

    const handleMetricClickLocal = (metric: any, title: string, description: string, calculationType?: string) => {
        if (calculationType) {
            onCalculationClick(calculationType, metric);
        } else {
            setSelectedMetric({ ...metric, title, description });
            setShowMetricModal(true);
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
                                <h2 className="text-lg font-bold text-gray-900 mb-0.5">
                                    {selectedCompany?.name || company?.name || "Company"}
                                </h2>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-100 text-green-800 font-medium">
                                        {selectedCompany?.industry || company?.industry || "Industry"}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 font-medium">
                                        {selectedCompany?.country || company?.country || "Country"}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-medium">
                                        {displayYear}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-600 mb-0.5">Data Quality</p>
                            <p className="font-medium text-xs" style={{ color: colors.primary }}>
                                {dataQuality.data_coverage || 0}%
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Total Area</p>
                            <p className="font-bold text-sm text-gray-900">{finalAreaCovered}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Location Points</p>
                            <p className="font-bold text-sm text-gray-900">{finalCoordinates.length} {finalCoordinates.length === 1 ? 'point' : 'points'}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Reporting Year</p>
                            <p className="font-bold text-sm text-gray-900">{displayYear}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">ESG Frameworks</p>
                            <p className="font-bold text-sm" style={{ color: colors.primary }}>
                                {company?.esg_reporting_framework?.length || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200" style={{ background: `linear-gradient(to right, ${colors.primary}15, ${colors.emerald}15)` }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Area of Interest</h3>
                            <p className="text-gray-600 flex items-center gap-2">
                                <MapPin className="w-4 h-4" style={{ color: colors.primary }} />
                                {finalAreaName}
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
                                            <h3 className="font-bold mb-2" style={{ color: colors.primary }}>{finalAreaName}</h3>
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Area:</span> {finalAreaCovered}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Compliance Score:</span> {overallScore}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Carbon Balance:</span> {formatNumber(netCarbonBalance)} tCO₂e
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Training Hours:</span> {formatNumber(totalTrainingHoursSum)}
                                                </p>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ) : (
                                <Polygon
                                    pathOptions={{
                                        fillColor: colors.primary,
                                        color: colors.primary,
                                        fillOpacity: 0.3,
                                        weight: 2
                                    }}
                                    positions={finalCoordinates.map((coord: any) => [coord.lat, coord.lon])}
                                >
                                    <Popup>
                                        <div className="p-2">
                                            <h3 className="font-bold mb-2" style={{ color: colors.primary }}>{finalAreaName}</h3>
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Area:</span> {finalAreaCovered}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Compliance Score:</span> {overallScore}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Carbon Balance:</span> {formatNumber(netCarbonBalance)} tCO₂e
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Training Hours:</span> {formatNumber(totalTrainingHoursSum)}
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
                                    style={{ color: colors.primary }}
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
                            <Globe className="w-4 h-4" style={{ color: colors.primary }} />
                            Area Covered
                        </p>
                        <p className="font-bold text-lg text-gray-900">{finalAreaCovered}</p>
                        {selectedCompany?.name && (
                            <p className="text-xs text-gray-500 mt-1">{selectedCompany.name}</p>
                        )}
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                            <Target className="w-4 h-4" style={{ color: colors.primary }} />
                            Compliance Data
                        </p>
                        <p className="font-bold text-lg text-gray-900">Score: {overallScore}</p>
                        <p className="text-xs text-gray-500 mt-1">{rating}</p>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div
                className="relative overflow-hidden rounded-2xl p-5 shadow-2xl"
                style={{
                    background: `linear-gradient(to right, ${colors.darkGreen}, ${colors.primary})`
                }}
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="text-xl font-bold mb-1 text-white">Farm Management Compliance Dashboard</h2>
                            <p className="text-emerald-50 text-sm">Training + Scope 3 + Carbon Monitoring</p>
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
                        {/* Overall Compliance Score Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClickLocal(scores, "Overall Compliance Score", "Weighted average of all compliance metrics", "compliance-score")}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Target className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Overall Compliance</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">{overallScore}</h3>
                            <span
                                className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium"
                                style={{
                                    backgroundColor: `${getRatingColor(rating)}30`,
                                    color: getRatingColor(rating)
                                }}
                            >
                                {rating}
                            </span>
                        </div>

                        {/* Training Hours Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClickLocal({ execHours, seniorHours, otherHours, total: totalTrainingHoursSum }, "Training Hours", "Total training hours across all employee categories", "training")}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Users className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Training Hours</p>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-normal text-white">{formatNumber(totalTrainingHoursSum)}</h3>
                                <div className="text-[10px] text-white/80 flex flex-col">
                                    <span>Exec: {execHours} hrs</span>
                                    <span>Senior: {seniorHours} hrs</span>
                                    <span>Other: {otherHours} hrs</span>
                                </div>
                            </div>
                        </div>

                        {/* Supplier Compliance Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClickLocal(scope3Engagement, "Supplier Compliance", "Supplier code adoption, audits, and corrective actions", "supplier")}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Shield className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Supplier Compliance</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">{supplierComplianceScore}</h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                {scope3Engagement.suppliers_with_code || 0} with code
                            </span>
                        </div>

                        {/* Carbon Balance Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClickLocal(carbonScope3, "Carbon Balance", "Net carbon balance (emissions - sequestration)", "carbon")}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Activity className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Carbon Balance</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">{formatNumber(netCarbonBalance)}</h3>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${netCarbonBalance >= 0 ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'}`}>
                                {netCarbonBalance >= 0 ? 'Positive' : 'Negative'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Graphs Grid (2 columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {overviewGraphs.map((graph) => (
                    <GraphCard
                        key={graph.id}
                        title={graph.title}
                        description={graph.description}
                        icon={graph.icon}
                        onClick={() => setSelectedGraph(graph)}
                        onInfoClick={() => onCalculationClick(graph.id, { description: `Detailed calculation methodology for ${graph.title}` })}
                    >
                        {graph.component}
                    </GraphCard>
                ))}
            </div>

            {/* Data Quality & Compliance Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Data Quality */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: colors.darkGreen }}>
                        Data Quality & Verification
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" style={{ color: colors.primary }} />
                                <span className="text-sm text-gray-700">Data Completeness</span>
                            </div>
                            <span className="font-medium" style={{ color: colors.primary }}>
                                {dataQuality.data_coverage}%
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" style={{ color: colors.emerald }} />
                                <span className="text-sm text-gray-700">Verified Metrics</span>
                            </div>
                            <span className="font-medium" style={{ color: colors.emerald }}>
                                {formatNumber(dataQuality.verified_metrics)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {carbonScope3.data_quality.verification === 'verified' ?
                                    <CheckCircle className="w-4 h-4" style={{ color: colors.primary }} /> :
                                    <AlertTriangle className="w-4 h-4" style={{ color: '#f59e0b' }} />
                                }
                                <span className="text-sm text-gray-700">Carbon Verification</span>
                            </div>
                            <span className="font-medium" style={{
                                color: carbonScope3.data_quality.verification === 'verified' ? colors.primary : '#f59e0b'
                            }}>
                                {carbonScope3.data_quality.verification}
                            </span>
                        </div>
                        {dataQuality.last_verification_date && (
                            <div className="pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500">
                                    Last verified: {new Date(dataQuality.last_verification_date).toLocaleDateString()}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Framework Alignment */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: colors.darkGreen }}>
                        Framework Alignment
                    </h3>
                    <div className="space-y-3">
                        {[
                            { label: 'GRI Compliance', value: frameworkAlignment.gri_compliance },
                            { label: 'IFRS S1 Alignment', value: frameworkAlignment.ifrs_s1_alignment },
                            { label: 'IFRS S2 Alignment', value: frameworkAlignment.ifrs_s2_alignment },
                            { label: 'TCFD Implementation', value: frameworkAlignment.tcfd_implementation },
                        ].map((item, index) => (
                            <div key={index} className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">{item.label}</span>
                                    <span className="text-sm font-medium" style={{
                                        color: (item.value ?? 0) >= 80 ? colors.primary :
                                            (item.value ?? 0) >= 60 ? colors.emerald :
                                                (item.value ?? 0) >= 40 ? '#f59e0b' : '#ef4444'
                                    }}>
                                        {item.value ?? 0}
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${item.value ?? 0}%`,
                                            backgroundColor: (item.value ?? 0) >= 80 ? colors.primary :
                                                (item.value ?? 0) >= 60 ? colors.emerald :
                                                    (item.value ?? 0) >= 40 ? '#f59e0b' : '#ef4444'
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Key Statistics */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold" style={{ color: colors.primary }}>
                        Key Statistics
                    </h3>
                    <Globe className="w-5 h-5 text-gray-500" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: colors.primary }}>
                            {formatNumber(carbonScope3.sequestration_total_tco2 || 0)}
                        </p>
                        <p className="text-sm mt-1 text-gray-600">
                            Total CO₂ Sequestered
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: colors.emerald }}>
                            {scope3Engagement.suppliers_with_code || 0}
                        </p>
                        <p className="text-sm mt-1 text-gray-600">
                            Suppliers with Code
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: colors.secondary }}>
                            {policies.summary.total_policies || 0}
                        </p>
                        <p className="text-sm mt-1 text-gray-600">
                            Active Policies
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: colors.lime }}>
                            {formatNumber(totalTrainingHoursSum || 0)}
                        </p>
                        <p className="text-sm mt-1 text-gray-600">
                            Total Training Hours
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: colors.darkGreen }}>
                            {formatNumber(getScope3TotalEmissions(complianceData) || 0)}
                        </p>
                        <p className="text-sm mt-1 text-gray-600">
                            Scope 3 Emissions (tCO₂e)
                        </p>
                    </div>
                </div>
            </div>

            {/* Methodology Section */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Calculation Methodology</h3>
                        <p className="text-gray-600">Understand how compliance metrics are calculated</p>
                    </div>
                    <Settings className="w-8 h-8" style={{ color: colors.primary }} />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div
                        className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 cursor-pointer hover:border-green-300 transition-all group"
                        onClick={() => onCalculationClick("compliance-score", calculationFormulas.complianceScore)}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-green-100">
                                <Target className="w-6 h-6" style={{ color: colors.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Compliance Score</h4>
                        </div>
                        <p className="text-gray-700 mb-4">{calculationFormulas.complianceScore.description}</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: colors.primary, fontWeight: 500 }}>
                                Formula: Weighted average
                            </span>
                            <Info className="w-5 h-5" style={{ color: colors.primary, opacity: 0, transition: 'opacity 0.2s' }} />
                        </div>
                    </div>

                    <div
                        className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 cursor-pointer hover:border-blue-300 transition-all group"
                        onClick={() => onCalculationClick("training", calculationFormulas.training)}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-blue-100">
                                <Users className="w-6 h-6" style={{ color: colors.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Training Hours</h4>
                        </div>
                        <p className="text-gray-700 mb-4">{calculationFormulas.training.description}</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-600 font-medium">
                                Formula: Sum of categories
                            </span>
                            <Info className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    <div
                        className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 cursor-pointer hover:border-purple-300 transition-all group"
                        onClick={() => onCalculationClick("scope3", calculationFormulas.scope3)}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-purple-100">
                                <Factory className="w-6 h-6" style={{ color: colors.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Scope 3 Emissions</h4>
                        </div>
                        <p className="text-gray-700 mb-4">{calculationFormulas.scope3.description}</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-purple-600 font-medium">
                                Formula: Sum of categories
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
                        <ArrowRight className="w-5 h-5" style={{ color: colors.primary }} />
                    </button>
                </div>
            </div>

            {/* Notes Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border p-6" style={{ borderColor: colors.lightGreen }}>
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-100">
                        <Info className="w-5 h-5" style={{ color: colors.primary }} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold mb-2" style={{ color: colors.darkGreen }}>
                            Farm Management Compliance Notes
                        </h4>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-700">
                                <span className="font-semibold">Training metrics:</span> Total hours, employee coverage, and distribution across training types.
                            </p>
                            <p className="text-sm text-gray-700">
                                <span className="font-semibold">Scope 3 engagement:</span> Supplier compliance, audits conducted, and corrective actions.
                            </p>
                            <p className="text-sm text-gray-700">
                                <span className="font-semibold">Carbon accounting:</span> Complete scope 3 emissions with net carbon balance.
                            </p>
                            <p className="text-sm text-gray-700">
                                <span className="font-semibold">Framework alignment:</span> GRI, IFRS, TCFD compliance and implementation status.
                            </p>
                            <p className="text-sm text-gray-700">
                                <span className="font-semibold">Data quality:</span> Verification status, completeness scores, and last audit date.
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
                        <div className="p-6 border-b border-gray-200" style={{ background: `linear-gradient(to right, ${colors.primary}15, ${colors.emerald}15)` }}>
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
                                <div className="text-xl text-gray-600">tons of CO₂e</div>
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
                                        <span>Explore opportunities for improvement</span>
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

export default ComplianceOverviewTab;