// compliance_tabs/ComplianceOverviewTab.tsx
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
    Maximize2,
    PieChart as PieChartIcon,
    AreaChart as AreaChartIcon,
    LineChart as LineChartIcon,
    BarChart as BarChartIcon,
    Radar,
    Cloud,
    Globe,
    Trees,
    Leaf,
    Factory,
} from 'lucide-react';
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
    AreaChart,
    Area,
    Radar as RechartsRadar,

    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    BarChart,
    Bar,
    Pie,
    ComposedChart,
    Line,
    PieChart,
} from "recharts";


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

interface ComplianceOverviewTabProps {
    complianceData: any;
    selectedCompany: any;
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
    colors: any;
}

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

    // Extract data from compliance response
    const { compliance_scores, metrics, carbon_emissions, scope3_analysis, data_quality, trends } = complianceData.data;
    const carbonAccounting = complianceData.data.carbon_emission_accounting;
    const carbonSequestration = complianceData.data.carbon_sequestration;
    const policiesAndCertifications = complianceData.data.policies_and_certifications;

    const scores = compliance_scores.scores;
    const monthlySequestrationData = carbonAccounting?.yearly_data?.sequestration?.monthly_data || [];

    // Get compliance rating color
    const getRatingColor = (rating: string) => {
        switch (rating.toLowerCase()) {
            case 'excellent': return colors.primary;
            case 'good': return colors.secondary;
            case 'fair': return '#fbbf24';
            case 'poor': return '#f59e0b';
            case 'needs improvement': return '#ef4444';
            default: return colors.primary;
        }
    };

    // Get coordinates for map
    const companyAreaOfInterest = selectedCompany?.area_of_interest_metadata;
    const companyCoordinates = companyAreaOfInterest?.coordinates || [];
    const finalCoordinates = companyCoordinates.length > 0 ? companyCoordinates : coordinates;
    const finalAreaName = companyAreaOfInterest?.name || areaName;
    const finalAreaCovered = companyAreaOfInterest?.area_covered || areaCovered;

    // Calculate map center
    const mapCenter: [number, number] = finalCoordinates.length > 0
        ? [finalCoordinates[0].lat, finalCoordinates[0].lon]
        : [0, 0];

    // Prepare chart data with real API data
    const chartData = useMemo(() => {
        // Process monthly sequestration data for line charts
        const biomassChartData = monthlySequestrationData.map((month: any) => ({
            month: month.month,
            biomass_c: month.biomass_c_t_per_ha || 0,
            biomass_co2: month.biomass_co2_t_per_ha || 0,
            biomass_co2_total: month.biomass_co2_total_t || 0,
            delta_biomass: month.delta_biomass_co2_t || 0,
        }));

        const ndviChartData = monthlySequestrationData.map((month: any) => ({
            month: month.month,
            ndvi_max: month.ndvi_max || 0,
            agb_t_per_ha: month.agb_t_per_ha || 0,
            bgb_t_per_ha: month.bgb_t_per_ha || 0,
        }));

        const carbonSequestrationData = monthlySequestrationData.map((month: any) => ({
            month: month.month,
            biomass_co2: month.biomass_co2_total_t || 0,
            soc_co2: month.soc_co2_total_t || 0,
            net_co2_change: month.net_co2_change_t || 0,
            net_co2_stock: month.net_co2_stock_t || 0,
        }));

        // Training distribution data
        const trainingDistributionData = [
            {
                name: 'Farmer Training',
                value: metrics.training.training_distribution.farmer_training || 0,
                color: colors.primary
            },
            {
                name: 'Safety Training',
                value: metrics.training.training_distribution.safety_training || 0,
                color: colors.emerald
            },
            {
                name: 'Technical Training',
                value: metrics.training.training_distribution.technical_training || 0,
                color: colors.secondary
            },
            {
                name: 'Compliance Training',
                value: metrics.training.training_distribution.compliance_training || 0,
                color: colors.lime
            }
        ];

        // Carbon emissions breakdown
        const carbonEmissionsData = [
            { name: 'Scope 1', value: carbon_emissions.scope1_tco2e || 0, color: colors.primary },
            { name: 'Scope 2', value: carbon_emissions.scope2_tco2e || 0, color: colors.emerald },
            { name: 'Scope 3', value: carbon_emissions.scope3_tco2e || 0, color: colors.secondary },
            { name: 'Total', value: carbon_emissions.total_emissions_tco2e || 0, color: colors.darkGreen }
        ];

        // Scope 3 metrics
        const scope3MetricsData = [
            {
                name: 'Suppliers with Code',
                value: scope3_analysis.metrics.suppliersWithCode || 0,
                color: colors.primary
            },
            {
                name: 'Suppliers Audited',
                value: scope3_analysis.metrics.auditsConducted || 0,
                color: colors.emerald
            },
            {
                name: 'Training Hours',
                value: metrics.training.farmer_training_hours || 0,
                color: colors.secondary
            },
            {
                name: 'Non-Compliance',
                value: scope3_analysis.metrics.nonCompliances || 0,
                color: '#ef4444'
            },
            {
                name: 'Corrective Actions',
                value: scope3_analysis.metrics.correctiveActions || 0,
                color: colors.lime
            }
        ];

        // Compliance scores radar chart
        const complianceRadarData = [
            { component: 'Training', score: scores.trainingHours || 0, fullMark: 100 },
            { component: 'Supplier', score: scores.supplierCompliance || 0, fullMark: 100 },
            { component: 'GRI', score: scores.griCompliance || 0, fullMark: 100 },
            { component: 'IFRS S1', score: scores.ifrsS1Alignment || 0, fullMark: 100 },
            { component: 'IFRS S2', score: scores.ifrsS2Alignment || 0, fullMark: 100 },
            { component: 'TCFD', score: scores.tcfdImplementation || 0, fullMark: 100 },
        ];

        return {
            biomassChartData,
            ndviChartData,
            carbonSequestrationData,
            trainingDistributionData,
            carbonEmissionsData,
            scope3MetricsData,
            complianceRadarData,
        };
    }, [complianceData, colors]);

    // Define graphs with unified styling
    const graphs = [
        {
            id: 'biomass-chart',
            title: 'Biomass Carbon Storage',
            description: 'Monthly biomass carbon and CO2 per hectare',
            icon: <Trees className="w-5 h-5" style={{ color: colors.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData.biomassChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="month"
                            stroke="#666"
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis
                            yAxisId="left"
                            stroke="#666"
                            style={{ fontSize: '12px' }}
                            label={{ value: 't/ha', angle: -90, position: 'insideLeft', offset: 10 }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#666"
                            style={{ fontSize: '12px' }}
                            label={{ value: 'tCO₂/ha', angle: 90, position: 'insideRight', offset: 10 }}
                        />
                        <RechartsTooltip />
                        <RechartsLegend />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="biomass_c"
                            stroke={colors.primary}
                            name="Biomass C (t/ha)"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="biomass_co2"
                            stroke={colors.emerald}
                            name="Biomass CO₂ (t/ha)"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ r: 4 }}
                        />
                        <Bar
                            yAxisId="left"
                            dataKey="delta_biomass"
                            fill={colors.lightGreen}
                            name="Δ Biomass"
                            opacity={0.6}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            ),
            info: 'Biomass carbon storage and CO₂ equivalent per hectare'
        },
        {
            id: 'ndvi-chart',
            title: 'NDVI & Biomass Production',
            description: 'Vegetation health and biomass production trends',
            icon: <Leaf className="w-5 h-5" style={{ color: colors.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData.ndviChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="month"
                            stroke="#666"
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis
                            yAxisId="left"
                            stroke="#666"
                            style={{ fontSize: '12px' }}
                            domain={[0, 1]}
                            label={{ value: 'NDVI', angle: -90, position: 'insideLeft', offset: 10 }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#666"
                            style={{ fontSize: '12px' }}
                            label={{ value: 't/ha', angle: 90, position: 'insideRight', offset: 10 }}
                        />
                        <RechartsTooltip />
                        <RechartsLegend />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="ndvi_max"
                            stroke={colors.primary}
                            name="NDVI Max"
                            strokeWidth={3}
                            dot={{ r: 5, fill: colors.primary }}
                        />
                        <Area
                            yAxisId="right"
                            type="monotone"
                            dataKey="agb_t_per_ha"
                            stroke={colors.emerald}
                            fill={colors.emerald}
                            fillOpacity={0.3}
                            name="Above Ground Biomass"
                        />
                        <Area
                            yAxisId="right"
                            type="monotone"
                            dataKey="bgb_t_per_ha"
                            stroke={colors.secondary}
                            fill={colors.secondary}
                            fillOpacity={0.3}
                            name="Below Ground Biomass"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            ),
            info: 'NDVI shows vegetation health; biomass indicates carbon storage potential'
        },
        {
            id: 'carbon-sequestration',
            title: 'Carbon Sequestration',
            description: 'Monthly CO2 sequestration from biomass and soil',
            icon: <Cloud className="w-5 h-5" style={{ color: colors.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.carbonSequestrationData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="month"
                            stroke="#666"
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis
                            stroke="#666"
                            style={{ fontSize: '12px' }}
                            label={{ value: 'tCO₂', angle: -90, position: 'insideLeft', offset: 10 }}
                        />
                        <RechartsTooltip />
                        <RechartsLegend />
                        <Area
                            type="monotone"
                            dataKey="biomass_co2"
                            stackId="1"
                            stroke={colors.primary}
                            fill={colors.primary}
                            fillOpacity={0.6}
                            name="Biomass CO₂"
                        />
                        <Area
                            type="monotone"
                            dataKey="soc_co2"
                            stackId="1"
                            stroke={colors.emerald}
                            fill={colors.emerald}
                            fillOpacity={0.6}
                            name="Soil CO₂"
                        />
                        <Line
                            type="monotone"
                            dataKey="net_co2_change"
                            stroke={colors.darkGreen}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            name="Net Change"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            ),
            info: 'Total carbon sequestration from biomass growth and soil organic carbon'
        },

        {
            id: 'carbon-emissions',
            title: 'Carbon Emissions by Scope',
            description: 'Breakdown of greenhouse gas emissions',
            icon: <Factory className="w-5 h-5" style={{ color: colors.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.carbonEmissionsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="name"
                            stroke="#666"
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis
                            stroke="#666"
                            style={{ fontSize: '12px' }}
                            label={{ value: 'tCO₂e', angle: -90, position: 'insideLeft', offset: 10 }}
                        />
                        <RechartsTooltip />
                        <Bar
                            dataKey="value"
                            radius={[4, 4, 0, 0]}
                        >
                            {chartData.carbonEmissionsData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            ),
            info: 'Greenhouse gas emissions categorized by scope 1, 2, and 3'
        },

    ];

    // Custom Tooltip Component
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                    <p className="font-semibold mb-2 text-gray-900">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Company Details Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200" style={{ background: colors.background }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm">
                                <Building className="w-5 h-5" style={{ color: colors.primary }} />
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
                                        {selectedYear || new Date().getFullYear()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-600 mb-0.5">Data Quality</p>
                            <p className="font-medium text-xs" style={{ color: colors.primary }}>
                                {data_quality.data_coverage || 0}%
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
                            <p className="font-bold text-sm text-gray-900">{selectedYear || complianceData.data.reporting_year}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">ESG Frameworks</p>
                            <p className="font-bold text-sm" style={{ color: colors.primary }}>
                                {selectedCompany?.esg_reporting_framework?.length || 0}
                            </p>
                        </div>
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
                            onClick={() => onMetricClick(compliance_scores, 'score_details')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Target className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Overall Compliance</p>
                                {getTrendIcon(trends.compliance_trend)}
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {scores.overall}
                            </h3>
                            <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium`}
                                style={{
                                    backgroundColor: `${getRatingColor(compliance_scores.rating)}30`,
                                    color: getRatingColor(compliance_scores.rating)
                                }}
                            >
                                {compliance_scores.rating}
                            </span>
                        </div>

                        {/* Training Hours Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => onMetricClick(metrics.training, 'training_details')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Users className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Training Hours</p>
                                {getTrendIcon(trends.training_trend)}
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {formatNumber(metrics.training.total_training_hours)}
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                {formatNumber(metrics.training.employees_trained_total)} employees
                            </span>
                        </div>

                        {/* Supplier Compliance Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => onMetricClick(scope3_analysis, 'supplier_details')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Shield className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Supplier Compliance</p>
                                {getTrendIcon(trends.scope3_trend)}
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {scores.supplierCompliance}
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                {scope3_analysis.metrics.complianceRate} compliance rate
                            </span>
                        </div>

                        {/* Carbon Balance Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => onMetricClick(carbon_emissions, 'carbon_details')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Activity className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Carbon Balance</p>
                                {getTrendIcon(trends.carbon_trend)}
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {formatNumber(carbon_emissions.net_carbon_balance_tco2e)}
                            </h3>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${carbon_emissions.net_carbon_balance_tco2e >= 0 ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'}`}>
                                {carbon_emissions.net_carbon_balance_tco2e >= 0 ? 'Positive' : 'Negative'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200" style={{ background: colors.background }}>
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
                                                    <span className="font-semibold">Compliance Score:</span> {scores.overall}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Carbon Balance:</span> {formatNumber(carbon_emissions.net_carbon_balance_tco2e)} tCO₂e
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Training Hours:</span> {formatNumber(metrics.training.total_training_hours)}
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
                                                    <span className="font-semibold">Compliance Score:</span> {scores.overall}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Carbon Balance:</span> {formatNumber(carbon_emissions.net_carbon_balance_tco2e)} tCO₂e
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Training Hours:</span> {formatNumber(metrics.training.total_training_hours)}
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
                        <p className="font-bold text-lg text-gray-900">Score: {scores.overall}</p>
                        <p className="text-xs text-gray-500 mt-1">{compliance_scores.rating}</p>
                    </div>
                </div>
            </div>

            {/* Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {graphs.map((graph) => (
                    <div
                        key={graph.id}
                        className="bg-white rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                        style={{ borderColor: '#e5e7eb' }}
                        onClick={() => setSelectedGraph(graph)}
                    >
                        <div className="p-4 border-b" style={{
                            borderColor: '#e5e7eb',
                            background: colors.background
                        }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{graph.title}</h3>
                                    <p className="text-sm text-gray-600">{graph.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCalculationClick(graph.id, { description: graph.info });
                                        }}
                                        className="p-2 rounded-lg hover:bg-green-100 transition-all"
                                        style={{ color: colors.primary }}
                                    >
                                        <Info className="w-5 h-5" />
                                    </button>
                                    {graph.icon}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 h-80">{graph.component}</div>
                    </div>
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
                                {data_quality.data_coverage}%
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" style={{ color: colors.emerald }} />
                                <span className="text-sm text-gray-700">Verified Metrics</span>
                            </div>
                            <span className="font-medium" style={{ color: colors.emerald }}>
                                {formatNumber(data_quality.verified_metrics)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {carbon_emissions.data_quality.verification === 'verified' ?
                                    <CheckCircle className="w-4 h-4" style={{ color: colors.primary }} /> :
                                    <AlertTriangle className="w-4 h-4" style={{ color: '#f59e0b' }} />
                                }
                                <span className="text-sm text-gray-700">Carbon Verification</span>
                            </div>
                            <span className="font-medium" style={{
                                color: carbon_emissions.data_quality.verification === 'verified' ? colors.primary : '#f59e0b'
                            }}>
                                {carbon_emissions.data_quality.verification}
                            </span>
                        </div>
                        {data_quality.last_verification_date && (
                            <div className="pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500">
                                    Last verified: {new Date(data_quality.last_verification_date).toLocaleDateString()}
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
                            { label: 'GRI Compliance', value: scores.griCompliance },
                            { label: 'IFRS S1 Alignment', value: scores.ifrsS1Alignment },
                            { label: 'IFRS S2 Alignment', value: scores.ifrsS2Alignment },
                            { label: 'TCFD Implementation', value: scores.tcfdImplementation },
                        ].map((item, index) => (
                            <div key={index} className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">{item.label}</span>
                                    <span className="text-sm font-medium" style={{
                                        color: item.value >= 80 ? colors.primary :
                                            item.value >= 60 ? colors.emerald :
                                                item.value >= 40 ? '#f59e0b' : '#ef4444'
                                    }}>
                                        {item.value}
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${item.value}%`,
                                            backgroundColor: item.value >= 80 ? colors.primary :
                                                item.value >= 60 ? colors.emerald :
                                                    item.value >= 40 ? '#f59e0b' : '#ef4444'
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
                            {formatNumber(carbonSequestration.total_sequestration_tco2 || 0)}
                        </p>
                        <p className="text-sm mt-1 text-gray-600">
                            Total CO₂ Sequestered
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: colors.emerald }}>
                            {scope3_analysis.metrics.suppliersWithCode || 0}
                        </p>
                        <p className="text-sm mt-1 text-gray-600">
                            Suppliers with Code
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: colors.secondary }}>
                            {policiesAndCertifications.policies.summary.total_policies || 0}
                        </p>
                        <p className="text-sm mt-1 text-gray-600">
                            Active Policies
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: colors.lime }}>
                            {formatNumber(metrics.training.total_training_hours || 0)}
                        </p>
                        <p className="text-sm mt-1 text-gray-600">
                            Total Training Hours
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: colors.darkGreen }}>
                            {formatNumber(carbon_emissions.total_emissions_tco2e || 0)}
                        </p>
                        <p className="text-sm mt-1 text-gray-600">
                            Total Emissions (tCO₂e)
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
                        onClick={() =>
                            onCalculationClick("compliance-score", {
                                formula: "Weighted average of all compliance metrics",
                                description: "Overall compliance score calculation",
                            })
                        }
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-green-100">
                                <Target className="w-6 h-6" style={{ color: colors.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Compliance Score</h4>
                        </div>
                        <p className="text-gray-700 mb-4">Weighted average of all compliance metrics</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: colors.primary, fontWeight: 500 }}>
                                Formula: Weighted average
                            </span>
                            <Info className="w-5 h-5" style={{ color: colors.primary, opacity: 0, transition: 'opacity 0.2s' }} />
                        </div>
                    </div>

                    <div
                        className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 cursor-pointer hover:border-blue-300 transition-all group"
                        onClick={() =>
                            onCalculationClick("carbon-sequestration", {
                                formula: "Biomass Growth × Carbon Content × 3.67",
                                description: "CO₂ captured by vegetation growth",
                            })
                        }
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-blue-100">
                                <Cloud className="w-6 h-6" style={{ color: colors.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Carbon Sequestration</h4>
                        </div>
                        <p className="text-gray-700 mb-4">CO₂ captured by vegetation growth</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-600 font-medium">
                                Formula: Biomass × C × 3.67
                            </span>
                            <Info className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    <div
                        className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 cursor-pointer hover:border-purple-300 transition-all group"
                        onClick={() =>
                            onCalculationClick("scope3-emissions", {
                                formula: "Sum of all supply chain emission sources",
                                description: "Indirect emissions from the value chain",
                            })
                        }
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-purple-100">
                                <Factory className="w-6 h-6" style={{ color: colors.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Scope 3 Emissions</h4>
                        </div>
                        <p className="text-gray-700 mb-4">Indirect emissions from the value chain</p>
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
                                <span className="font-semibold">Carbon accounting:</span> Complete scope 1, 2, and 3 emissions with net carbon balance.
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
                        <div className="p-6 border-b border-gray-200" style={{ background: colors.background }}>
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
        </div>
    );
};

export default ComplianceOverviewTab;