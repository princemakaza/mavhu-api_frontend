import React, { useState } from 'react';
import {
    Droplet,
    Waves,
    AlertTriangle,
    Gauge,
    MapPin,
    Globe,
    Target,
    Building,
    Calculator,
    Settings,
    Info,
    X,
    PieChart as PieChartIcon,
    LineChart as LineChartIcon,
    BarChart as BarChartIcon,
    Activity,
    CheckCircle,
    Calendar,
    TrendingUp,
    TrendingDown,
    ArrowRight,
    Share2,
    Download,
    Cloud,
    Leaf,
    Thermometer,
    Sun,
    Shield
} from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    Legend as RechartsLegend,
    ComposedChart
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Import service helpers
import {
    getWaterUsageAnalysis,
    getIrrigationWaterUsage,
    getTreatmentWaterUsage,
    getTotalWaterUsage,
    getWaterShortageRisk,
    getWaterSavingsAnalysis,
    getDetailedEnvironmentalMetrics,
    getEnvironmentalMetricsSummary,
    getIrrigationWaterCoordinates,
    getIrrigationWaterAreaOfInterest,
    getIrrigationWaterCompany,
    getCurrentIrrigationWaterYear,
    getConfidenceScore,
    type IrrigationWaterResponse
} from '../../../../services/Admin_Service/esg_apis/water_risk_service';

// Import shared GraphDisplay component
import GraphDisplay from '../soil_components/GraphDisplay';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Color palette (green theme, reused from soil carbon)
const PRIMARY_GREEN = '#22c55e';
const SECONDARY_GREEN = '#16a34a';
const LIGHT_GREEN = '#86efac';
const DARK_GREEN = '#15803d';
const EMERALD = '#10b981';
const LIME = '#84cc16';
const BACKGROUND_GRAY = '#f9fafb';

// Water-specific variants (teal shades)
const WATER_PRIMARY = '#0d9488';
const WATER_SECONDARY = '#0f766e';
const WATER_LIGHT = '#5eead4';
const WATER_DARK = '#115e59';

// Graph colour mapping
const graphColors = {
    irrigation: WATER_PRIMARY,
    treatment: SECONDARY_GREEN,
    effluent: EMERALD,
    total: DARK_GREEN,
    risk: '#f59e0b',
    savings: '#8b5cf6',
    esg: PRIMARY_GREEN
};

interface OverviewTabProps {
    waterData: IrrigationWaterResponse | null;
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
}

const OverviewTab: React.FC<OverviewTabProps> = ({
    waterData,
    selectedCompany,
    formatNumber,
    formatCurrency,
    formatPercent,
    getTrendIcon,
    onMetricClick,
    onCalculationClick,
    selectedYear,
    availableYears,
    loading,
    isRefreshing,
    coordinates: propCoordinates = [],
    areaName: propAreaName = "Irrigation Area",
    areaCovered: propAreaCovered = "N/A",
    colors
}) => {
    const [selectedGraph, setSelectedGraph] = useState<any>(null);
    const [selectedMetric, setSelectedMetric] = useState<any>(null);
    const [showMetricModal, setShowMetricModal] = useState(false);

    // Use provided colours or default to green palette
    const currentColors = colors || {
        primary: PRIMARY_GREEN,
        secondary: SECONDARY_GREEN,
        lightGreen: LIGHT_GREEN,
        darkGreen: DARK_GREEN,
        emerald: EMERALD,
        lime: LIME,
        background: BACKGROUND_GRAY,
    };

    const waterColors = {
        primary: currentColors.primary,
        secondary: currentColors.secondary,
        light: currentColors.lightGreen,
        dark: currentColors.darkGreen,
    };

    // If no data, show placeholder
    if (!waterData) {
        return (
            <div className="text-center py-12">
                <Droplet className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2 text-gray-700">No Data Available</h3>
                <p className="text-gray-500">Select a company to view irrigation water and risk data</p>
            </div>
        );
    }

    // --- Safe data extraction with fallbacks ---
    let waterUsageAnalysis: any = {
        irrigation_water: { current_value: null, trend: 'unknown' },
        treatment_water: { current_value: null, trend: 'unknown' },
        total_water_usage: { current_value: null, per_hectare: null },
        shortage_risk: { level: 'unknown', probability: 0, factors: [], mitigation_strategies: [] },
        water_savings_analysis: { potential_savings: 0 }
    };
    let irrigationWater: any = { current_value: null, trend: 'unknown' };
    let treatmentWater: any = { current_value: null, trend: 'unknown' };
    let totalWater: any = { current_value: null, per_hectare: null };
    let shortageRisk: any = { level: 'unknown', probability: 0, factors: [], mitigation: [] };
    let savingsAnalysis: any = { potential_savings: 0 };
    let envMetricsSummary: any = {
        total_ghg_emissions: 0,
        scope1_emissions: 0,
        scope2_emissions: 0,
        scope3_emissions: 0,
        irrigation_water_usage: null,
        treatment_water_usage: null,
        total_water_usage: null
    };
    let detailedEnvMetrics: any[] = [];
    let confidenceScore: any = { overall: 0 };
    let company: any = null;
    let currentYear: number | null = null;
    let mappedCoordinates: any[] = [];
    let areaOfInterest: any = null;

    try {
        waterUsageAnalysis = getWaterUsageAnalysis(waterData) || waterUsageAnalysis;
        irrigationWater = getIrrigationWaterUsage(waterData) || irrigationWater;
        treatmentWater = getTreatmentWaterUsage(waterData) || treatmentWater;
        totalWater = getTotalWaterUsage(waterData) || totalWater;
        shortageRisk = getWaterShortageRisk(waterData) || shortageRisk;
        savingsAnalysis = getWaterSavingsAnalysis(waterData) || savingsAnalysis;
        envMetricsSummary = getEnvironmentalMetricsSummary(waterData) || envMetricsSummary;
        detailedEnvMetrics = getDetailedEnvironmentalMetrics(waterData) || [];
        confidenceScore = getConfidenceScore(waterData) || confidenceScore;
        company = getIrrigationWaterCompany(waterData);
        currentYear = getCurrentIrrigationWaterYear(waterData);
        mappedCoordinates = getIrrigationWaterCoordinates(waterData) || [];
        areaOfInterest = getIrrigationWaterAreaOfInterest(waterData);
    } catch (error) {
        console.warn('Error extracting water data:', error);
    }

    // ----- Find the best irrigation efficiency record (the one with actual data) -----
    const getBestIrrigationRecord = () => {
        if (!waterData?.data?.existing_irrigation_efficiency_data) return null;
        const records = waterData.data.existing_irrigation_efficiency_data;
        const recordWithData = records.find(rec =>
            rec.metrics &&
            rec.metrics.length > 0 &&
            rec.metrics.some(m => m.yearly_data && m.yearly_data.length > 0)
        );
        return recordWithData || records.find(rec => rec.metrics && rec.metrics.length > 0) || null;
    };

    const bestRecord = getBestIrrigationRecord();

    // Helper to get value for a metric, optionally for a specific year
    const getMetricValueForYear = (metricName: string, year: number | null) => {
        if (!bestRecord?.metrics) return null;
        const metric = bestRecord.metrics.find(m => m.metric_name === metricName);
        if (!metric?.yearly_data || metric.yearly_data.length === 0) return null;

        // If year is provided, try to find that year
        if (year) {
            const yearStr = year.toString();
            const point = metric.yearly_data.find(d => d.year === yearStr);
            if (point) {
                return {
                    value: point.value,
                    unit: point.unit,
                    year: point.year,
                    data: metric.yearly_data
                };
            }
        }

        // Fallback to latest year
        const sorted = [...metric.yearly_data].sort((a, b) => parseInt(b.year) - parseInt(a.year));
        return {
            value: sorted[0]?.value ?? null,
            unit: metric.yearly_data[0]?.unit || '',
            year: sorted[0]?.year,
            data: metric.yearly_data
        };
    };

    const irrigationMetric = getMetricValueForYear("Total Irrigation Water (million ML)", selectedYear);
    const treatmentMetric = getMetricValueForYear("Water Treatment for Chiredzi (million ML)", selectedYear);
    const waterPerHaMetric = getMetricValueForYear("Water per Hectare (ML/ha)", selectedYear);
    const effluentMetric = getMetricValueForYear("Effluent Discharged (thousand ML)", selectedYear);

    // Hero card values (use extracted metrics or fallbacks)
    const heroIrrigationValue = irrigationMetric?.value ?? irrigationWater.current_value;
    const heroTreatmentValue = treatmentMetric?.value ?? treatmentWater.current_value;
    const heroWaterPerHa = waterPerHaMetric?.value ?? totalWater.per_hectare;
    const heroEffluentValue = effluentMetric?.value ?? null;
    const heroTotalWaterValue = (irrigationMetric?.value ?? 0) + (treatmentMetric?.value ?? 0);

    // Shortage risk comes from water_risk_analysis
    const heroShortageRisk = shortageRisk;

    // Display year label for each card (selected year or metric year)
    const displayYear = selectedYear ? selectedYear.toString() : (irrigationMetric?.year || 'Latest');

    // Final coordinates: prop > company > mapped
    const finalCoordinates = propCoordinates.length > 0
        ? propCoordinates
        : areaOfInterest?.coordinates?.length
            ? areaOfInterest.coordinates
            : mappedCoordinates;

    const mapCenter: [number, number] = finalCoordinates.length > 0
        ? [finalCoordinates[0].lat, finalCoordinates[0].lon]
        : [0, 0];

    const areaName = areaOfInterest?.name || propAreaName;
    const areaCovered = areaOfInterest?.area_covered || propAreaCovered;

    // Helper to get risk colour
    const getRiskColor = (level: string) => {
        switch (level.toLowerCase()) {
            case 'low': return currentColors.primary;
            case 'medium': return currentColors.lime;
            case 'high': return '#f59e0b';
            case 'critical': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getRiskLevelText = (level: string) => {
        switch (level.toLowerCase()) {
            case 'low': return 'Low Risk';
            case 'medium': return 'Moderate Risk';
            case 'high': return 'High Risk';
            case 'critical': return 'Critical Risk';
            default: return 'Unknown Risk';
        }
    };

    // Prepare chart data from the best record
    const prepareChartData = () => {
        try {
            if (!bestRecord?.metrics) return null;

            const getYearly = (metricName: string) => {
                const metric = bestRecord.metrics.find(m => m.metric_name === metricName);
                if (!metric?.yearly_data) return [];
                return [...metric.yearly_data].sort((a, b) => parseInt(a.year) - parseInt(b.year));
            };

            const irrigationYearly = getYearly("Total Irrigation Water (million ML)");
            const treatmentYearly = getYearly("Water Treatment for Chiredzi (million ML)");
            const effluentYearly = getYearly("Effluent Discharged (thousand ML)");
            const waterPerHaYearly = getYearly("Water per Hectare (ML/ha)");

            const years = [...new Set([
                ...irrigationYearly.map(d => d.year),
                ...treatmentYearly.map(d => d.year),
                ...effluentYearly.map(d => d.year)
            ])].sort();

            const yearlyData = years.map(year => ({
                year,
                irrigation: irrigationYearly.find(d => d.year === year)?.value || 0,
                treatment: treatmentYearly.find(d => d.year === year)?.value || 0,
                effluent: effluentYearly.find(d => d.year === year)?.value || 0,
                total: (irrigationYearly.find(d => d.year === year)?.value || 0) +
                    (treatmentYearly.find(d => d.year === year)?.value || 0) +
                    (effluentYearly.find(d => d.year === year)?.value || 0)
            }));

            const latestYear = years.length ? years[years.length - 1] : (currentYear?.toString() || '2024');
            const latestIrrigation = irrigationYearly.find(d => d.year === latestYear)?.value || 0;
            const latestTreatment = treatmentYearly.find(d => d.year === latestYear)?.value || 0;
            const latestEffluent = effluentYearly.find(d => d.year === latestYear)?.value || 0;
            const compositionData = [
                { name: 'Irrigation', value: latestIrrigation, color: graphColors.irrigation },
                { name: 'Treatment', value: latestTreatment, color: graphColors.treatment },
                { name: 'Effluent', value: latestEffluent, color: graphColors.effluent }
            ];

            const waterPerHaData = waterPerHaYearly.map(d => ({
                year: d.year,
                value: d.value
            }));

            // Data for the three new graphs
            // 1. Water per hectare bar chart (already have waterPerHaData)
            // 2. Effluent discharged line chart (use yearlyData)
            // 3. Water treatment pie chart (yearly breakdown)
            const treatmentPieData = treatmentYearly.map(d => ({
                name: d.year,
                value: d.value,
                color: graphColors.treatment
            }));

            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthlyData = months.map(month => ({
                month,
                irrigation: latestIrrigation / 12,
                treatment: latestTreatment / 12,
                effluent: latestEffluent / 12,
                total: (latestIrrigation + latestTreatment + latestEffluent) / 12
            }));

            const waterEnvMetrics = (detailedEnvMetrics || []).filter(m =>
                m.name?.toLowerCase().includes('water') ||
                m.name?.toLowerCase().includes('irrigation') ||
                m.name?.toLowerCase().includes('treatment') ||
                m.name?.toLowerCase().includes('effluent')
            ).map(m => ({
                name: m.name,
                value: m.current_value,
                unit: m.unit,
                color: graphColors.esg
            }));

            const riskGraph = waterData?.data?.graphs?.risk_assessment;
            const riskData = riskGraph?.labels?.map((label: string, idx: number) => ({
                subject: label,
                score: riskGraph.datasets?.[0]?.data?.[idx] || 0
            })) || [];

            const savingsData = [
                { name: 'Current Usage', value: heroTotalWaterValue, color: currentColors.primary },
                { name: 'Savings Potential', value: savingsAnalysis?.potential_savings || 0, color: graphColors.savings }
            ];

            return {
                yearlyData,
                compositionData,
                waterPerHaData,
                treatmentPieData,
                monthlyData,
                waterEnvMetrics,
                riskData,
                savingsData
            };
        } catch (error) {
            console.warn('Error preparing chart data:', error);
            return null;
        }
    };

    const chartData = prepareChartData();

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                    <p className="font-semibold mb-2 text-gray-800">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {formatNumber(entry.value)} {entry.unit || ''}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Define the six graphs (existing three + three new ones)
    const graphs = [
        {
            id: 'monthly-trend',
            title: 'Monthly Water Usage Trend',
            description: 'Irrigation, treatment & effluent over the year',
            icon: <LineChartIcon className="w-5 h-5" style={{ color: waterColors.primary }} />,
            component: chartData && (
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: 12 }} />
                        <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <RechartsLegend />
                        <Area type="monotone" dataKey="total" fill={waterColors.light} stroke={waterColors.dark} name="Total" fillOpacity={0.3} />
                        <Line type="monotone" dataKey="irrigation" stroke={graphColors.irrigation} name="Irrigation" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="treatment" stroke={graphColors.treatment} name="Treatment" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="effluent" stroke={graphColors.effluent} name="Effluent" strokeWidth={2} dot={{ r: 4 }} />
                    </ComposedChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'yearly-trend',
            title: 'Yearly Water Usage Trend',
            description: 'Historical data over available years',
            icon: <BarChartIcon className="w-5 h-5" style={{ color: waterColors.primary }} />,
            component: chartData && (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.yearlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="year" stroke="#6b7280" style={{ fontSize: 12 }} />
                        <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <RechartsLegend />
                        <Bar dataKey="irrigation" fill={graphColors.irrigation} name="Irrigation" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="treatment" fill={graphColors.treatment} name="Treatment" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="effluent" fill={graphColors.effluent} name="Effluent" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'water-per-ha-line',
            title: 'Water per Hectare (Line)',
            description: 'Irrigation water intensity (ML/ha) over years',
            icon: <Activity className="w-5 h-5" style={{ color: waterColors.primary }} />,
            component: chartData && (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.waterPerHaData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="year" stroke="#6b7280" style={{ fontSize: 12 }} />
                        <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="value" stroke={graphColors.irrigation} strokeWidth={3} dot={{ r: 5 }} name="ML/ha" />
                    </LineChart>
                </ResponsiveContainer>
            )
        },
        // NEW GRAPH 1: Water per Hectare as Bar Chart (2022-2025)
        {
            id: 'water-per-ha-bar',
            title: 'Water per Hectare (Bar)',
            description: 'Yearly irrigation water intensity (ML/ha)',
            icon: <BarChartIcon className="w-5 h-5" style={{ color: waterColors.primary }} />,
            component: chartData && (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.waterPerHaData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="year" stroke="#6b7280" style={{ fontSize: 12 }} />
                        <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" fill={graphColors.irrigation} name="ML/ha" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )
        },
        // NEW GRAPH 2: Effluent Discharged as Line Chart (2022-2025)
        {
            id: 'effluent-line',
            title: 'Effluent Discharged',
            description: 'Yearly effluent discharged (thousand ML)',
            icon: <LineChartIcon className="w-5 h-5" style={{ color: waterColors.primary }} />,
            component: chartData && (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.yearlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="year" stroke="#6b7280" style={{ fontSize: 12 }} />
                        <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="effluent" stroke={graphColors.effluent} strokeWidth={3} dot={{ r: 5 }} name="Effluent (thousand ML)" />
                    </LineChart>
                </ResponsiveContainer>
            )
        },
        // NEW GRAPH 3: Water Treatment as Pie Chart (2022-2025 breakdown)
        {
            id: 'treatment-pie',
            title: 'Water Treatment Breakdown',
            description: 'Yearly contribution to total treatment (million ML)',
            icon: <PieChartIcon className="w-5 h-5" style={{ color: waterColors.primary }} />,
            component: chartData && (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData.treatmentPieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.treatmentPieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color || graphColors.treatment} />
                            ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            )
        }
    ];

    return (
        <div className="space-y-8 pb-8">
            {/* Company Details Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200" style={{ background: `linear-gradient(to right, ${currentColors.primary}15, ${currentColors.emerald}15)` }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm">
                                <Building className="w-5 h-5" style={{ color: currentColors.primary }} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-0.5">{company?.name || selectedCompany?.name || "Company"}</h2>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-100 text-green-800 font-medium">
                                        {company?.industry || selectedCompany?.industry || "Agriculture"}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 font-medium">
                                        {company?.country || selectedCompany?.country || "Country"}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-medium">
                                        {selectedYear || currentYear || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-600 mb-0.5">Last Updated</p>
                            <p className="font-medium text-xs text-gray-900">
                                {waterData?.data?.metadata?.generated_at
                                    ? new Date(waterData.data.metadata.generated_at).toLocaleDateString()
                                    : 'N/A'}
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
                            <p className="font-bold text-sm text-green-700">{confidenceScore?.overall || 0}%</p>
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
                <div className="p-6 border-b border-gray-200" style={{ background: `linear-gradient(to right, ${currentColors.primary}15, ${currentColors.emerald}15)` }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Irrigation Area</h3>
                            <p className="text-gray-600 flex items-center gap-2">
                                <MapPin className="w-4 h-4" style={{ color: currentColors.primary }} />
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
                    {finalCoordinates.length > 0 ? (
                        <MapContainer
                            center={mapCenter}
                            zoom={10}
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
                                            <h3 className="font-bold" style={{ color: currentColors.primary }}>{areaName}</h3>
                                            <p className="text-sm text-gray-700">Lat: {finalCoordinates[0].lat.toFixed(4)}</p>
                                            <p className="text-sm text-gray-700">Lon: {finalCoordinates[0].lon.toFixed(4)}</p>
                                            <p className="text-sm text-gray-700 mt-2">Total Water: {formatNumber(heroTotalWaterValue)} m³</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            ) : (
                                <Polygon
                                    pathOptions={{ fillColor: currentColors.primary, color: currentColors.primary, fillOpacity: 0.3, weight: 2 }}
                                    positions={finalCoordinates.map(c => [c.lat, c.lon])}
                                >
                                    <Popup>
                                        <div className="p-2">
                                            <h3 className="font-bold" style={{ color: currentColors.primary }}>{areaName}</h3>
                                            <p className="text-sm text-gray-700">Area: {areaCovered}</p>
                                            <p className="text-sm text-gray-700">Points: {finalCoordinates.length}</p>
                                        </div>
                                    </Popup>
                                </Polygon>
                            )}
                        </MapContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                            <div className="text-center">
                                <MapPin className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: currentColors.primary }} />
                                <p className="text-gray-500 font-medium">No location data available</p>
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
                        <p className="font-bold text-lg text-gray-900">{areaCovered}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                            <Target className="w-4 h-4" style={{ color: currentColors.primary }} />
                            Monitoring Points
                        </p>
                        <p className="font-bold text-lg text-gray-900">{finalCoordinates.length} coordinates</p>
                    </div>
                </div>
            </div>

            {/* Hero Section - Key Metrics */}
            <div
                className="relative overflow-hidden rounded-2xl p-5 shadow-2xl"
                style={{ background: `linear-gradient(to right, ${currentColors.primary}, ${currentColors.darkGreen})` }}
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="text-xl font-bold mb-1 text-white">Irrigation Efficiency & Water Risk</h2>
                            <p className="text-green-100 text-sm">Real‑time irrigation and water metrics</p>
                        </div>
                        <button
                            onClick={() => onCalculationClick('overview')}
                            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 text-white text-xs"
                        >
                            <Calculator className="w-3.5 h-3.5" />
                            Methodology
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {/* Irrigation Water */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => onMetricClick({ value: heroIrrigationValue, unit: 'million ML', trend: irrigationWater.trend }, 'Irrigation Water')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Droplet className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Irrigation Water</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {formatNumber(heroIrrigationValue)}
                                <span className="text-sm ml-1 text-green-100">million ML</span>
                            </h3>
                            <div className="flex items-center justify-between">
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                    {irrigationMetric?.year || displayYear}
                                </span>
                                {getTrendIcon(irrigationWater.trend)}
                            </div>
                        </div>

                        {/* Treatment Water */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => onMetricClick({ value: heroTreatmentValue, unit: 'million ML', trend: treatmentWater.trend }, 'Treatment Water')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Waves className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Treatment Water</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {formatNumber(heroTreatmentValue)}
                                <span className="text-sm ml-1 text-green-100">million ML</span>
                            </h3>
                            <div className="flex items-center justify-between">
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                    {treatmentMetric?.year || displayYear}
                                </span>
                                {getTrendIcon(treatmentWater.trend)}
                            </div>
                        </div>

                        {/* Water per Hectare */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => onMetricClick({ value: heroWaterPerHa, unit: 'ML/ha' }, 'Water per Hectare')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Activity className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Water per Hectare</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {formatNumber(heroWaterPerHa)}
                                <span className="text-sm ml-1 text-green-100">ML/ha</span>
                            </h3>
                            <div className="flex items-center justify-between">
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                    {waterPerHaMetric?.year || displayYear}
                                </span>
                            </div>
                        </div>

                        {/* Effluent Discharged */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => onMetricClick({ value: heroEffluentValue, unit: 'thousand ML' }, 'Effluent Discharged')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Cloud className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Effluent Discharged</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {formatNumber(heroEffluentValue)}
                                <span className="text-sm ml-1 text-green-100">thousand ML</span>
                            </h3>
                            <div className="flex items-center justify-between">
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                    {effluentMetric?.year || displayYear}
                                </span>
                            </div>
                        </div>

                        {/* Total Water Usage */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => onMetricClick({ value: heroTotalWaterValue, unit: 'million ML', per_hectare: heroWaterPerHa }, 'Total Water Usage')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Gauge className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Total Water</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {formatNumber(heroTotalWaterValue)}
                                <span className="text-sm ml-1 text-green-100">million ML</span>
                            </h3>
                            <div className="flex items-center justify-between">
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                    Per ha: {formatNumber(heroWaterPerHa)} ML/ha
                                </span>
                            </div>
                        </div>

                        {/* Shortage Risk */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => onMetricClick(heroShortageRisk, 'Water Shortage Risk')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <AlertTriangle className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Shortage Risk</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {getRiskLevelText(heroShortageRisk.level)}
                            </h3>
                            <div className="flex items-center justify-between">
                                <span
                                    className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium"
                                    style={{
                                        backgroundColor: getRiskColor(heroShortageRisk.level) + '40',
                                        color: getRiskColor(heroShortageRisk.level)
                                    }}
                                >
                                    {heroShortageRisk.probability ? `${(heroShortageRisk.probability * 100).toFixed(0)}% prob.` : 'Unknown'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Six Graphs Grid */}
            {chartData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {graphs.map(graph => (
                        <GraphDisplay
                            key={graph.id}
                            title={graph.title}
                            description={graph.description}
                            icon={graph.icon}
                            onClick={() => setSelectedGraph(graph)}
                            onInfoClick={() => onCalculationClick(graph.id, { description: graph.description })}
                        >
                            {graph.component}
                        </GraphDisplay>
                    ))}
                </div>
            )}

            {/* Methodology Section */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Calculation Methodology</h3>
                        <p className="text-gray-600">Understand how irrigation efficiency & water risk metrics are calculated</p>
                    </div>
                    <Settings className="w-8 h-8" style={{ color: currentColors.primary }} />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div
                        className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 cursor-pointer hover:border-green-300 transition-all group"
                        onClick={() => onCalculationClick('irrigation', {
                            formula: "Sum of all irrigation water sources",
                            description: "Total water used for crop irrigation, measured in million ML."
                        })}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-green-100">
                                <Droplet className="w-6 h-6" style={{ color: currentColors.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Irrigation Water</h4>
                        </div>
                        <p className="text-gray-700 mb-4">Water abstracted from rivers and dams for sugarcane irrigation.</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-green-600 font-medium">Formula: River + Dam + Groundwater</span>
                            <Info className="w-5 h-5 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    <div
                        className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 cursor-pointer hover:border-blue-300 transition-all group"
                        onClick={() => onCalculationClick('treatment', {
                            formula: "Volume of water treated",
                            description: "Water processed through treatment plants for reuse or discharge."
                        })}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-blue-100">
                                <Waves className="w-6 h-6" style={{ color: currentColors.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Treatment Water</h4>
                        </div>
                        <p className="text-gray-700 mb-4">Water entering the treatment facility for purification.</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-600 font-medium">Formula: Inflow - Outflow</span>
                            <Info className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    <div
                        className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 cursor-pointer hover:border-amber-300 transition-all group"
                        onClick={() => onCalculationClick('effluent', {
                            formula: "Treated water released",
                            description: "Volume of treated effluent discharged into the environment."
                        })}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-amber-100">
                                <Cloud className="w-6 h-6" style={{ color: currentColors.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Effluent Discharge</h4>
                        </div>
                        <p className="text-gray-700 mb-4">Treated wastewater released back into rivers.</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-amber-600 font-medium">Formula: Treatment Outflow</span>
                            <Info className="w-5 h-5 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                </div>
                <div className="mt-6">
                    <button
                        onClick={() => onCalculationClick('full-methodology', {
                            irrigation: "Irrigation water = sum of all irrigation abstractions",
                            treatment: "Treatment water = water processed at treatment plant",
                            effluent: "Effluent discharge = treated water released"
                        })}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 hover:border-green-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <span className="font-semibold text-gray-700">View Complete Methodology</span>
                        <ArrowRight className="w-5 h-5" style={{ color: currentColors.primary }} />
                    </button>
                </div>
            </div>

            {/* Modal for enlarged graph */}
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
                                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedGraph.title}</h3>
                                    <p className="text-gray-600">{selectedGraph.description}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedGraph(null)}
                                    className="p-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 transition-all"
                                >
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="h-[500px]">{selectedGraph.component}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OverviewTab;