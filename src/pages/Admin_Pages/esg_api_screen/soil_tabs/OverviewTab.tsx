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
    AreaChart,
    Area,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
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
    Leaf,
    Thermometer,
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
    Radar as RadarIcon,
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
    Calendar,
    Award,
    Zap,
    Droplet,
    Sun,
    Calculator,
    Cloud,
    Users,
    Settings,
    AlertTriangle,
} from "lucide-react";

// Service functions
import {
    getDashboardIndicators,
    getEnvironmentalMetricsSummary,
    getAllESGMetricsSummary,
    getRegenerativeAgricultureOutcomes,
    getConfidenceScoreBreakdown,
    getYearlyDataComparison,
    getSoilHealthTrends,
    getCarbonEmissionDetails,
    getAllGraphData,
} from "../../../../services/Admin_Service/esg_apis/soil_carbon_service";

// Components
import GraphDisplay from "../soil_components/GraphDisplay";

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

interface OverviewTabProps {
    soilHealthData: any;
    selectedCompany: any;
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
    soilHealthData,
    selectedCompany,
    formatNumber,
    formatCurrency,
    formatPercent,
    getTrendIcon,
    onMetricClick,
    onCalculationClick,
    colors,
}: OverviewTabProps) => {
    // Get data using helper functions
    const dashboardIndicators = soilHealthData ? getDashboardIndicators(soilHealthData) : null;
    const environmentalMetrics = soilHealthData ? getEnvironmentalMetricsSummary(soilHealthData) : null;
    const allEsgMetrics = soilHealthData ? getAllESGMetricsSummary(soilHealthData) : null;
    const regenerativeOutcomes = soilHealthData ? getRegenerativeAgricultureOutcomes(soilHealthData) : null;
    const confidenceScore = soilHealthData ? getConfidenceScoreBreakdown(soilHealthData) : null;
    const yearlyComparison = soilHealthData ? getYearlyDataComparison(soilHealthData) : null;
    const soilHealthTrends = soilHealthData ? getSoilHealthTrends(soilHealthData) : null;
    const carbonEmissionDetails = soilHealthData ? getCarbonEmissionDetails(soilHealthData) : null;
    const allGraphs = soilHealthData ? getAllGraphData(soilHealthData) : null;

    // Get coordinates and area info
    const coordinates = soilHealthData?.data?.company?.area_of_interest_metadata?.coordinates || [];
    const areaName = soilHealthData?.data?.company?.area_of_interest_metadata?.name || "Project Area";
    const areaCovered = soilHealthData?.data?.company?.area_of_interest_metadata?.area_covered || "N/A";

    // Calculate totals for display
    const totalCarbonStock = carbonEmissionDetails?.summary?.socAreaHa && dashboardIndicators?.carbonStock?.value ?
        carbonEmissionDetails.summary.socAreaHa * dashboardIndicators.carbonStock.value : 0;

    const totalSequestration = carbonEmissionDetails?.summary?.totalSequestration || 0;
    const totalEmissions = carbonEmissionDetails?.summary?.totalEmissions || 0;
    const netCarbonBalance = dashboardIndicators?.carbonBalance?.value || 0;

    // Get conversion factors from data
    const conversionFactors = soilHealthData?.data?.carbon_emission_accounting?.conversion_factors || {
        carbon_to_co2: 3.6667,
        n2o_n_to_n2o: 1.5714,
        carbon_fraction: 0.47
    };

    // Color palette for graphs
    const graphColors = {
        socTrend: "#10b981", // Emerald
        ndviTrend: "#84cc16", // Lime
        carbonBalancePositive: "#10b981", // Emerald
        carbonBalanceNegative: "#ef4444", // Red
        emissions: "#f59e0b", // Amber
        sequestration: "#3b82f6", // Blue
        vegetation: "#84cc16", // Lime
        biomassC: "#8b5cf6", // Violet
        biomassCO2: "#ec4899", // Pink
        socCO2: "#3b82f6", // Blue
        deltaSocCO2: "#8b5cf6", // Violet
        scope1: "#ef4444", // Red
        scope2: "#f97316", // Orange
        scope3: "#f59e0b", // Amber
        environmental: "#10b981", // Emerald
        social: "#3b82f6", // Blue
        governance: "#8b5cf6", // Violet
    };

    // Prepare chart data from API graphs
    const prepareChartDataFromAPI = () => {
        if (!allGraphs || Object.keys(allGraphs).length === 0) return null;

        // Get monthly data directly from the API
        const monthlyData = soilHealthData?.data?.carbon_emission_accounting?.detailed_monthly_data || [];

        return {
            // SOC Trend (from API)
            socTrendData: allGraphs.soc_trend?.labels?.map((label: any, index: number) => ({
                month: label,
                value: allGraphs.soc_trend?.datasets?.[0]?.data?.[index] || 0,
            })) || [],

            // Emissions Breakdown (from API)
            emissionsBreakdownData: allGraphs.emissions_breakdown?.labels?.map((label: any, index: number) => ({
                name: label,
                value: allGraphs.emissions_breakdown?.datasets?.[0]?.data?.[index] || 0,
                color: graphColors[`scope${index + 1}` as keyof typeof graphColors] || colors.primary,
            })) || [],

            // Monthly SOC (from API)
            monthlySocData: allGraphs.monthly_soc?.labels?.map((label: any, index: number) => ({
                month: label,
                soc: allGraphs.monthly_soc?.datasets?.[0]?.data?.[index] || 0,
            })) || [],

            // NDVI Trend (from API)
            ndviTrendData: allGraphs.ndvi_trend?.labels?.map((label: any, index: number) => ({
                month: label,
                ndvi: allGraphs.ndvi_trend?.datasets?.[0]?.data?.[index] || 0,
            })) || [],

            // Sequestration Rate (from API)
            sequestrationRateData: allGraphs.sequestration_rate?.labels?.map((label: any, index: number) => ({
                year: label,
                rate: allGraphs.sequestration_rate?.datasets?.[0]?.data?.[index] || 0,
            })) || [],

            // Carbon Intensity (from API)
            carbonIntensityData: allGraphs.carbon_intensity?.labels?.map((label: any, index: number) => ({
                category: label,
                intensity: allGraphs.carbon_intensity?.datasets?.[0]?.data?.[index] || 0,
            })) || [],

            // Detailed Emissions (from API) - Scope 1, 2, 3
            detailedEmissionsData: allGraphs.detailed_emissions?.labels?.map((label: any, index: number) => ({
                category: label,
                scope1: allGraphs.detailed_emissions?.datasets?.find((d: any) => d.label === 'Scope 1')?.data?.[index] || 0,
                scope2: allGraphs.detailed_emissions?.datasets?.find((d: any) => d.label === 'Scope 2')?.data?.[index] || 0,
                scope3: allGraphs.detailed_emissions?.datasets?.find((d: any) => d.label === 'Scope 3')?.data?.[index] || 0,
            })) || [],

            // Monthly Sequestration (from API)
            monthlySequestrationData: allGraphs.monthly_sequestration?.labels?.map((label: any, index: number) => ({
                month: label,
                sequestration: allGraphs.monthly_sequestration?.datasets?.[0]?.data?.[index] || 0,
            })) || [],



            // Yearly comparison
            yearlyComparisonData: yearlyComparison || [],

            // NEW: Monthly Biomass Data (Carbon and CO2)
            monthlyBiomassData: monthlyData.map((data: any) => ({
                month: data.month,
                biomassC: data.biomass_c_t_per_ha || 0,
                biomassCO2: data.biomass_co2_t_per_ha || 0,
            })),

            // NEW: Monthly SOC CO2 and Delta
            monthlySocCO2Data: monthlyData.map((data: any) => ({
                month: data.month,
                socCO2: data.soc_co2_t_per_ha || 0,
                deltaSocCO2: data.delta_soc_co2_t || 0,
            })),

            // NEW: Monthly NDVI Max
            monthlyNdviMaxData: monthlyData.map((data: any) => ({
                month: data.month,
                ndviMax: data.ndvi_max || 0,
            })),
        };
    };

    const chartData = prepareChartDataFromAPI();

    // Handle metric click
    const handleMetricClick = (metric: any, title: string, calculationType?: string) => {
        if (calculationType) {
            onCalculationClick(calculationType, metric);
        }
    };

    // Calculate formulas for display
    const getCalculationFormulas = () => {
        const socValue = dashboardIndicators?.soilHealth?.value || 0;
        const socAreaHa = carbonEmissionDetails?.areaCoverage?.socAreaHaFormatted || 0;

        return {
            soc: {
                formula: "Satellite NDVI indices → Biomass → SOC",
                description: "Using Sentinel-2 imagery with IPCC conversion factors"
            },
            carbonStock: {
                formula: `${socValue.toFixed(2)} tC/ha × ${conversionFactors.carbon_to_co2} = ${(socValue * conversionFactors.carbon_to_co2).toFixed(2)} tCO₂/ha`,
                total: `${(socValue * conversionFactors.carbon_to_co2).toFixed(2)} tCO₂/ha × ${formatNumber(Number(socAreaHa))} ha = ${formatNumber(totalCarbonStock)} tCO₂`
            },
            netBalance: {
                formula: `${formatNumber(totalSequestration)} tCO₂ (sequestration) - ${formatNumber(totalEmissions)} tCO₂e (emissions) = ${formatNumber(netCarbonBalance)} tCO₂e`,
                description: netCarbonBalance < 0 ? "Carbon Sink (Net Removal)" : "Carbon Source (Net Emissions)"
            }
        };
    };

    const calculationFormulas = getCalculationFormulas();

    // Custom tooltip formatter for graphs
    const customTooltipFormatter = (value: any, name: string, props: any) => {
        if (name === 'SOC' || name === 'soc') {
            return [`${Number(value).toFixed(2)} tC/ha`, name];
        }
        if (name === 'NDVI' || name === 'ndvi' || name === 'ndviMax') {
            return [`${Number(value).toFixed(3)}`, name];
        }
        if (name.includes('CO2') || name === 'emissions' || name === 'sequestration') {
            return [`${formatNumber(Number(value))} tCO₂${name === 'emissions' ? 'e' : ''}`, name];
        }
        if (name === 'rate' || name === 'intensity') {
            return [`${Number(value).toFixed(2)} tCO₂/ha${name === 'rate' ? '/yr' : ''}`, name];
        }
        return [`${Number(value).toFixed(2)}`, name];
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
                            <p className="text-[10px] text-gray-600 mb-0.5">Last Updated</p>
                            <p className="font-medium text-xs text-gray-900">
                                {new Date(soilHealthData?.data?.metadata?.generated_at || new Date()).toLocaleDateString()}
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







            {/* Environmental Overview */}
            <div className="relative overflow-hidden rounded-2xl p-5 shadow-2xl" style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.darkGreen})` }}>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="text-xl font-bold mb-1 text-white">Environmental Overview</h2>
                            <p className="text-green-100 text-sm">Real-time soil health and carbon metrics</p>
                        </div>
                        <button
                            onClick={() => onCalculationClick('overview')}
                            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 text-white text-xs"
                        >
                            <Calculator className="w-3.5 h-3.5" />
                            Methodology
                        </button>
                    </div>
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
                        {/* SOC Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all group"
                            onClick={() => handleMetricClick(dashboardIndicators?.soilHealth, 'Soil Organic Carbon', 'soc')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Leaf className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Soil Organic Carbon</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {dashboardIndicators?.soilHealth?.value.toFixed(2) || '0.00'}
                                <span className="text-sm ml-1 text-green-100">{dashboardIndicators?.soilHealth?.unit || 'tC/ha'}</span>
                            </h3>
                            <div className="flex items-center justify-between">
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                    {dashboardIndicators?.soilHealth?.status || 'N/A'}
                                </span>
                                {getTrendIcon(dashboardIndicators?.soilHealth?.trend || '')}
                            </div>
                        </div>

                        {/* Carbon Stock Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all group"
                            onClick={() => handleMetricClick(dashboardIndicators?.carbonStock, 'Carbon Stock', 'carbon-stock')}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-white/20">
                                        <Thermometer className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <p className="text-white font-bold text-xs">Carbon Stock</p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCalculationClick('carbon-stock', {
                                            formula: calculationFormulas.carbonStock.formula,
                                            total: calculationFormulas.carbonStock.total
                                        });
                                    }}
                                    className="p-1 rounded-lg hover:bg-white/20 transition-all"
                                >
                                    <Info className="w-3 h-3 text-green-100" />
                                </button>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {formatNumber(dashboardIndicators?.carbonStock?.value || 0)}
                                <span className="text-sm ml-1 text-green-100">{dashboardIndicators?.carbonStock?.unit || 'tCO₂/ha'}</span>
                            </h3>
                            <div className="flex items-center justify-between">
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                    Total: {formatNumber(totalCarbonStock)} tCO₂
                                </span>
                                {getTrendIcon(dashboardIndicators?.carbonStock?.trend || '')}
                            </div>
                        </div>

                        {/* Net Carbon Balance Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all group"
                            onClick={() => handleMetricClick(dashboardIndicators?.carbonBalance, 'Net Carbon Balance', 'net-balance')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <ActivityIcon className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Net Carbon Balance</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {formatNumber(Math.abs(netCarbonBalance))}
                                <span className="text-sm ml-1 text-green-100">tCO₂e</span>
                            </h3>
                            <div className="flex items-center justify-between">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${netCarbonBalance < 0 ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'}`}>
                                    {netCarbonBalance < 0 ? 'Carbon Sink' : 'Carbon Source'}
                                </span>
                                <span className="text-green-100 text-[10px]">
                                    {netCarbonBalance < 0 ? '✓ Positive' : '⚠ Needs Attention'}
                                </span>
                            </div>
                        </div>

                        {/* Vegetation Health Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all group"
                            onClick={() => handleMetricClick(dashboardIndicators?.vegetationHealth, 'Vegetation Health', 'ndvi')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Sun className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Vegetation Health (NDVI)</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {dashboardIndicators?.vegetationHealth?.value.toFixed(3) || '0.000'}
                            </h3>
                            <div className="flex items-center justify-between">
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                    {dashboardIndicators?.vegetationHealth?.classification || 'N/A'}
                                </span>
                                {getTrendIcon(dashboardIndicators?.vegetationHealth?.trend || '')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Graphs Grid (2 columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly SOC Graph */}
                {chartData?.monthlySocData && chartData.monthlySocData.length > 0 && (
                    <GraphDisplay
                        title="Monthly SOC Variation"
                        description="Soil organic carbon variation throughout the year"
                        icon={<AreaChartIcon className="w-5 h-5" style={{ color: colors.primary }} />}
                        onClick={() => { }}
                        onInfoClick={() => onCalculationClick('monthly-soc', {
                            description: allGraphs?.monthly_soc?.interpretation || "Monthly SOC variation analysis"
                        })}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData.monthlySocData}>
                                <defs>
                                    <linearGradient id="colorMonthlySoc" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={graphColors.socTrend} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={graphColors.socTrend} stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                    formatter={customTooltipFormatter}
                                />
                                <Area type="monotone" dataKey="soc" stroke={graphColors.socTrend} fillOpacity={1} fill="url(#colorMonthlySoc)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </GraphDisplay>
                )}

                {/* Emissions Breakdown from API */}




                {/* Sequestration Rate */}
                {chartData?.sequestrationRateData && chartData.sequestrationRateData.length > 0 && (
                    <GraphDisplay
                        title="Sequestration Rate"
                        description="Annual carbon sequestration rates"
                        icon={<BarChart3 className="w-5 h-5" style={{ color: colors.primary }} />}
                        onClick={() => { }}
                        onInfoClick={() => onCalculationClick('sequestration-rate', {
                            description: allGraphs?.sequestration_rate?.interpretation || "Sequestration rate analysis"
                        })}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData.sequestrationRateData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="year" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                    formatter={(value: any) => [`${Number(value).toFixed(2)} tCO₂/ha/yr`, 'Rate']}
                                />
                                <Bar dataKey="rate" fill={graphColors.sequestration} radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </GraphDisplay>
                )}

                {/* Carbon Intensity */}
                {chartData?.carbonIntensityData && chartData.carbonIntensityData.length > 0 && (
                    <GraphDisplay
                        title="Carbon Intensity"
                        description="Carbon intensity by category"
                        icon={<BarChart3 className="w-5 h-5" style={{ color: colors.primary }} />}
                        onClick={() => { }}
                        onInfoClick={() => onCalculationClick('carbon-intensity', {
                            description: allGraphs?.carbon_intensity?.interpretation || "Carbon intensity analysis"
                        })}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData.carbonIntensityData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="category" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                    formatter={(value: any) => [`${Number(value).toFixed(2)} tCO₂e/ha`, 'Intensity']}
                                />
                                <Bar dataKey="intensity" fill={graphColors.emissions} radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </GraphDisplay>
                )}

                {/* Detailed Emissions - Scope 1, 2, 3 */}
                {chartData?.detailedEmissionsData && chartData.detailedEmissionsData.length > 0 && (
                    <GraphDisplay
                        title="Detailed Emissions by Scope"
                        description="Scope 1, 2, and 3 emissions comparison"
                        icon={<BarChart3 className="w-5 h-5" style={{ color: colors.primary }} />}
                        onClick={() => { }}
                        onInfoClick={() => onCalculationClick('detailed-emissions', {
                            description: allGraphs?.detailed_emissions?.interpretation || "Detailed emissions analysis by scope"
                        })}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData.detailedEmissionsData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="category" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                    formatter={(value: any) => [`${formatNumber(value)} tCO₂e`, '']}
                                />
                                <RechartsLegend />
                                <Bar dataKey="scope1" fill={graphColors.scope1} name="Scope 1" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="scope2" fill={graphColors.scope2} name="Scope 2" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="scope3" fill={graphColors.scope3} name="Scope 3" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </GraphDisplay>
                )}

                {/* Monthly Sequestration */}
                {chartData?.monthlySequestrationData && chartData.monthlySequestrationData.length > 0 && (
                    <GraphDisplay
                        title="Monthly Sequestration"
                        description="Monthly carbon sequestration rates"
                        icon={<AreaChartIcon className="w-5 h-5" style={{ color: colors.primary }} />}
                        onClick={() => { }}
                        onInfoClick={() => onCalculationClick('monthly-sequestration', {
                            description: allGraphs?.monthly_sequestration?.interpretation || "Monthly sequestration analysis"
                        })}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData.monthlySequestrationData}>
                                <defs>
                                    <linearGradient id="colorSequestration" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={graphColors.sequestration} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={graphColors.sequestration} stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                    formatter={(value: any) => [`${Number(value).toFixed(2)} tCO₂`, 'Sequestration']}
                                />
                                <Area type="monotone" dataKey="sequestration" stroke={graphColors.sequestration} fillOpacity={1} fill="url(#colorSequestration)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </GraphDisplay>
                )}



                {/* Monthly Biomass (Carbon and CO2) */}
                {chartData?.monthlyBiomassData && chartData.monthlyBiomassData.length > 0 && (
                    <GraphDisplay
                        title="Monthly Biomass Analysis"
                        description="Biomass carbon and CO2 throughout the year"
                        icon={<LineChartIcon className="w-5 h-5" style={{ color: colors.primary }} />}
                        onClick={() => { }}
                        onInfoClick={() => onCalculationClick('monthly-biomass', {
                            description: "Monthly biomass carbon (tC/ha) and CO2 equivalent (tCO2/ha) measurements"
                        })}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsLineChart data={chartData.monthlyBiomassData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                    formatter={customTooltipFormatter}
                                />
                                <RechartsLegend />
                                <RechartsLine
                                    type="monotone"
                                    dataKey="biomassC"
                                    stroke={graphColors.biomassC}
                                    strokeWidth={2}
                                    dot={{ fill: graphColors.biomassC, r: 4 }}
                                    name="Biomass C (tC/ha)"
                                />
                                <RechartsLine
                                    type="monotone"
                                    dataKey="biomassCO2"
                                    stroke={graphColors.biomassCO2}
                                    strokeWidth={2}
                                    dot={{ fill: graphColors.biomassCO2, r: 4 }}
                                    name="Biomass CO₂ (tCO₂/ha)"
                                />
                            </RechartsLineChart>
                        </ResponsiveContainer>
                    </GraphDisplay>
                )}
            </div>
            {chartData?.monthlySocCO2Data && chartData.monthlySocCO2Data.length > 0 && (
                <GraphDisplay
                    title="Monthly SOC CO₂ Metrics"
                    description="SOC CO₂ per hectare and delta changes"
                    icon={<LineChartIcon className="w-5 h-5" style={{ color: colors.primary }} />}
                    onClick={() => { }}
                    onInfoClick={() => onCalculationClick('monthly-soc-co2', {
                        description: "Monthly SOC CO₂ (tCO₂/ha) and delta SOC CO₂ (tCO₂) tracking changes in soil carbon"
                    })}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart data={chartData.monthlySocCO2Data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                            <RechartsTooltip
                                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                formatter={customTooltipFormatter}
                            />
                            <RechartsLegend />
                            <RechartsLine
                                type="monotone"
                                dataKey="socCO2"
                                stroke={graphColors.socCO2}
                                strokeWidth={2}
                                dot={{ fill: graphColors.socCO2, r: 4 }}
                                name="SOC CO₂ (tCO₂/ha)"
                            />
                            <RechartsLine
                                type="monotone"
                                dataKey="deltaSocCO2"
                                stroke={graphColors.deltaSocCO2}
                                strokeWidth={2}
                                dot={{ fill: graphColors.deltaSocCO2, r: 4 }}
                                name="Δ SOC CO₂ (tCO₂)"
                            />
                        </RechartsLineChart>
                    </ResponsiveContainer>
                </GraphDisplay>
            )}

            {chartData?.monthlyNdviMaxData && chartData.monthlyNdviMaxData.length > 0 && (
                <GraphDisplay
                    title="Monthly NDVI Maximum"
                    description="Peak vegetation health index per month"
                    icon={<AreaChartIcon className="w-5 h-5" style={{ color: colors.primary }} />}
                    onClick={() => { }}
                    onInfoClick={() => onCalculationClick('monthly-ndvi-max', {
                        description: "Maximum NDVI values recorded each month indicating peak vegetation health"
                    })}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData.monthlyNdviMaxData}>
                            <defs>
                                <linearGradient id="colorNdviMax" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={graphColors.ndviTrend} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={graphColors.ndviTrend} stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} domain={[0, 1]} />
                            <RechartsTooltip
                                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                formatter={(value: any) => [`${Number(value).toFixed(3)}`, 'NDVI Max']}
                            />
                            <Area
                                type="monotone"
                                dataKey="ndviMax"
                                stroke={graphColors.ndviTrend}
                                fillOpacity={1}
                                fill="url(#colorNdviMax)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </GraphDisplay>
            )}
            {/* FULL WIDTH NDVI TREND GRAPH - AT THE BOTTOM */}
            {chartData?.ndviTrendData && chartData.ndviTrendData.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-green-100">
                                    <LineChartIcon className="w-6 h-6" style={{ color: colors.primary }} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">NDVI Trend Analysis</h3>
                                    <p className="text-gray-600 text-sm">Vegetation health index trend over time - Key indicator of ecosystem health</p>
                                </div>
                            </div>
                            <button
                                onClick={() => onCalculationClick('ndvi-trend', {
                                    description: allGraphs?.ndvi_trend?.interpretation || "NDVI > 0.4 indicates healthy vegetation; trends show ecosystem changes"
                                })}
                                className="p-2 rounded-lg hover:bg-green-100 transition-all"
                            >
                                <Info className="w-5 h-5" style={{ color: colors.primary }} />
                            </button>
                        </div>
                    </div>
                    <div className="p-8">
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData.ndviTrendData}>
                                    <defs>
                                        <linearGradient id="colorNdviTrend" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={graphColors.ndviTrend} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={graphColors.ndviTrend} stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                    <YAxis
                                        stroke="#6b7280"
                                        style={{ fontSize: '12px' }}
                                        domain={[0, 1]}
                                        tickFormatter={(value) => value.toFixed(2)}
                                    />
                                    <RechartsTooltip
                                        contentStyle={{
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '0.5rem',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                        }}
                                        formatter={(value: any) => [`${Number(value).toFixed(3)}`, 'NDVI']}
                                        labelFormatter={(label) => `Year: ${label}`}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="ndvi"
                                        stroke={graphColors.ndviTrend}
                                        fillOpacity={1}
                                        fill="url(#colorNdviTrend)"
                                        strokeWidth={3}
                                        activeDot={{ r: 6, fill: graphColors.ndviTrend }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: graphColors.ndviTrend }}></div>
                                    <span>NDVI Trend</span>
                                </div>
                                <div className="text-xs">
                                    {allGraphs?.ndvi_trend?.data_period ? `Data Period: ${allGraphs.ndvi_trend.data_period}` : ''}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs italic">
                                    {allGraphs?.ndvi_trend?.note || ""}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* FULL WIDTH SOIL CARBON TREND GRAPH - AT THE BOTTOM */}
            {chartData?.socTrendData && chartData.socTrendData.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-green-100">
                                    <AreaChartIcon className="w-6 h-6" style={{ color: colors.primary }} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Soil Organic Carbon Trend Analysis</h3>
                                    <p className="text-gray-600 text-sm">Historical SOC values over time - Key indicator of soil health and carbon storage capacity</p>
                                </div>
                            </div>
                            <button
                                onClick={() => onCalculationClick('soc-trend', {
                                    description: allGraphs?.soc_trend?.interpretation || "Higher SOC indicates better soil health and carbon storage capacity"
                                })}
                                className="p-2 rounded-lg hover:bg-green-100 transition-all"
                            >
                                <Info className="w-5 h-5" style={{ color: colors.primary }} />
                            </button>
                        </div>
                    </div>
                    <div className="p-8">
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData.socTrendData}>
                                    <defs>
                                        <linearGradient id="colorSocTrend" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={graphColors.socTrend} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={graphColors.socTrend} stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                    <YAxis
                                        stroke="#6b7280"
                                        style={{ fontSize: '12px' }}
                                        label={{ value: 'SOC (tC/ha)', angle: -90, position: 'insideLeft' }}
                                    />
                                    <RechartsTooltip
                                        contentStyle={{
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '0.5rem',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                        }}
                                        formatter={(value: any) => [`${Number(value).toFixed(2)} tC/ha`, 'Soil Organic Carbon']}
                                        labelFormatter={(label) => `Year: ${label}`}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke={graphColors.socTrend}
                                        fillOpacity={1}
                                        fill="url(#colorSocTrend)"
                                        strokeWidth={3}
                                        activeDot={{ r: 6, fill: graphColors.socTrend }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: graphColors.socTrend }}></div>
                                    <span>Soil Organic Carbon (tC/ha)</span>
                                </div>
                                <div className="text-xs">
                                    {allGraphs?.soc_trend?.data_period ? `Data Period: ${allGraphs.soc_trend.data_period}` : ''}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs italic">
                                    {allGraphs?.soc_trend?.note || ""}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Methodology Section */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Calculation Methodology</h3>
                        <p className="text-gray-600">Understand how our metrics are calculated</p>
                    </div>
                    <Settings className="w-8 h-8" style={{ color: colors.primary }} />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div
                        className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 cursor-pointer hover:border-green-300 transition-all group"
                        onClick={() => onCalculationClick('soc', calculationFormulas.soc)}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-green-100">
                                <Leaf className="w-6 h-6" style={{ color: colors.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">SOC Calculation</h4>
                        </div>
                        <p className="text-gray-700 mb-4">Soil Organic Carbon using satellite imagery</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-green-600 font-medium">Formula: {calculationFormulas.soc.formula}</span>
                            <Info className="w-5 h-5 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    <div
                        className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 cursor-pointer hover:border-blue-300 transition-all group"
                        onClick={() => onCalculationClick('carbon-stock', calculationFormulas.carbonStock)}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-blue-100">
                                <Cloud className="w-6 h-6" style={{ color: colors.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Carbon Stock</h4>
                        </div>
                        <p className="text-gray-700 mb-4">Total carbon stored in soil</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-600 font-medium">Formula: tCO₂ = tC/ha × {conversionFactors.carbon_to_co2}</span>
                            <Info className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    <div
                        className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 cursor-pointer hover:border-purple-300 transition-all group"
                        onClick={() => onCalculationClick('net-balance', calculationFormulas.netBalance)}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-purple-100">
                                <Calculator className="w-6 h-6" style={{ color: colors.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Net Balance</h4>
                        </div>
                        <p className="text-gray-700 mb-4">Sequestration minus emissions</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-purple-600 font-medium">Formula: Net = Emissions - Sequestration</span>
                            <Info className="w-5 h-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                </div>
                <div className="mt-6">
                    <button
                        onClick={() => onCalculationClick('full-methodology', {
                            soc: calculationFormulas.soc,
                            carbonStock: calculationFormulas.carbonStock,
                            netBalance: calculationFormulas.netBalance,
                            conversionFactors
                        })}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 hover:border-green-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <span className="font-semibold text-gray-700">View Complete Methodology</span>
                        <ArrowRight className="w-5 h-5 text-green-600" />
                    </button>
                </div>
            </div>

            {/* API Version & Data Source Information */}
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
                        <p className="font-bold text-lg text-gray-900">{soilHealthData?.data?.metadata?.api_version || "N/A"}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">Calculation Version</p>
                        <p className="font-bold text-lg text-gray-900">{soilHealthData?.data?.metadata?.calculation_version || "N/A"}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">GEE Adapter Version</p>
                        <p className="font-bold text-lg text-gray-900">{soilHealthData?.data?.metadata?.gee_adapter_version || "N/A"}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                        <p className="text-sm text-gray-600 mb-2">Data Sources</p>
                        <p className="font-bold text-lg text-green-700">{soilHealthData?.data?.metadata?.data_sources?.length || 0} sources</p>
                    </div>
                </div>
                <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-3 font-medium">Calculation Methods Used</p>
                    <div className="flex flex-wrap gap-2">
                        {soilHealthData?.data?.metadata?.calculation_methods?.map((method: string, index: number) => (
                            <span key={index} className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 font-medium">
                                {method}
                            </span>
                        )) || <span className="text-gray-500">No methods available</span>}
                    </div>
                </div>
            </div>


        </div>
    );
};

export default OverviewTab;