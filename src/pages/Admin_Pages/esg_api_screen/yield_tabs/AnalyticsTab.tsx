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
    Filler,
    ScatterController,
    BubbleController,
    RadialLinearScale,
} from 'chart.js';
import { Bar, Line, Scatter, Bubble } from 'react-chartjs-2';
import {
    ResponsiveContainer,
    LineChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend as RechartsLegend,
    AreaChart,
    Area,
    BarChart,
    Bar as RechartsBar,
    ComposedChart,
    ScatterChart,
    Scatter as RechartsScatter,
    ZAxis,
    Cell,
    PieChart,
    Pie,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
} from "recharts";

// Icons
import {
    TrendingUp,
    TrendingDown,
    Activity,
    Zap,
    Brain,
    BarChart3,
    LineChart as LineChartIcon,
    ScatterChart as ScatterChartIcon,
    Target,
    GitBranch,
    Cpu,
    Shield,
    AlertTriangle,
    Database,
    Cloud,
    Droplet,
    Thermometer,
    Wind,
    Trees,
    Leaf,
    Package,
    DollarSign,
    Percent,
    Clock,
    Map,
    CheckCircle,
    XCircle,
    AlertCircle,
    Info,
    Download,
    Maximize2,
    Filter,
    Settings,
    RefreshCw,
    X,
    Share2,
    Eye,
    Award,
    Sun,
} from "lucide-react";

// Import service functions from crop_yield_service
import {
    getYieldForecastSummary,
    getRiskAssessmentSummary,
    getEnvironmentalMetricsSummary,
    getCarbonEmissionData,
    getSatelliteIndicators,
    getGraphData,
    getAllGraphData,
    getConfidenceScoreBreakdown,
    getNDVIIndicators,
    getCalculationFactors,
    getMonthlyCarbonData,
    getMetricsByCategory,
} from "../../../../services/Admin_Service/esg_apis/crop_yield_service";

// Components
import GraphDisplay from "../soil_components/GraphDisplay";

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
    Filler,
    ScatterController,
    BubbleController,
    RadialLinearScale
);

// Color Palette
const COLORS = {
    primary: '#22c55e',      // Green-500
    primaryDark: '#16a34a',  // Green-600
    primaryLight: '#86efac', // Green-300
    secondary: '#10b981',    // Emerald-500
    accent: '#84cc16',       // Lime-500
    success: '#22c55e',
    warning: '#eab308',      // Yellow-500
    danger: '#ef4444',       // Red-500
    info: '#3b82f6',         // Blue-500
    water: '#3b82f6',        // Blue for water metrics
    carbon: '#8b5cf6',       // Purple for carbon metrics
    soil: '#d97706',         // Amber for soil metrics
    vegetation: '#10b981',   // Emerald for vegetation
};

interface AnalyticsTabProps {
    cropYieldData: any;
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
}

const AnalyticsTab = ({
    cropYieldData,
    selectedCompany,
    formatNumber,
    formatCurrency,
    formatPercent,
    getTrendIcon,
    onMetricClick,
}: AnalyticsTabProps) => {
    const [selectedGraph, setSelectedGraph] = useState<any>(null);
    const [selectedScenario, setSelectedScenario] = useState<'best' | 'worst' | 'baseline'>('baseline');
    const [selectedMetric, setSelectedMetric] = useState<any>(null);
    const [showMetricModal, setShowMetricModal] = useState(false);
    const [showInsightsModal, setShowInsightsModal] = useState(false);
    const [activeAnalysis, setActiveAnalysis] = useState<string>('yield');
    const [filters, setFilters] = useState({
        timeRange: 'yearly',
        region: 'all',
        cropType: 'all',
    });

    // =====================
    // DATA IMPORTS FROM API
    // =====================

    // 1) ADVANCED YIELD ANALYSIS DATA
    const yieldForecast = cropYieldData ? getYieldForecastSummary(cropYieldData) : null;
    const sensitivityAnalysis = yieldForecast?.sensitivityAnalysis;
    const calculationFactors = cropYieldData ? getCalculationFactors(cropYieldData) : null;
    const confidenceScore = cropYieldData ? getConfidenceScoreBreakdown(cropYieldData) : null;

    // Predictive modeling results
    const predictiveModelData = {
        forecastedYield: yieldForecast?.forecastedYield || 0,
        confidence: yieldForecast?.confidenceScore || 0,
        calculationFormula: yieldForecast?.formula || 'N/A',
        baseYield: calculationFactors?.base_yield || 0,
        ndviFactor: calculationFactors?.ndvi_factor || '0%',
        waterEfficiency: calculationFactors?.water_efficiency || '0%',
        soilHealthFactor: calculationFactors?.soil_health_factor || '0%',
        climateFactor: calculationFactors?.climate_factor || '0%',
    };

    // Scenario analysis data
    const scenarioData = {
        bestCase: {
            yield: predictiveModelData.forecastedYield * 1.15, // +15%
            probability: 30,
            conditions: ['Optimal rainfall', 'No pest pressure', 'Ideal temperatures'],
            factors: {
                water: '95% efficiency',
                temperature: '+2°C optimal',
                ndvi: '0.8+ sustained',
            },
        },
        worstCase: {
            yield: predictiveModelData.forecastedYield * 0.85, // -15%
            probability: 20,
            conditions: ['Drought conditions', 'High pest pressure', 'Extreme temperatures'],
            factors: {
                water: '60% efficiency',
                temperature: '+5°C heat stress',
                ndvi: '0.5 or below',
            },
        },
        baseline: {
            yield: predictiveModelData.forecastedYield,
            probability: 50,
            conditions: ['Normal conditions', 'Average pest pressure', 'Seasonal temperatures'],
            factors: {
                water: predictiveModelData.waterEfficiency,
                temperature: 'Normal range',
                ndvi: 'Seasonal average',
            },
        },
    };

    // Sensitivity analysis data from API
    const sensitivityData = sensitivityAnalysis ? [
        { factor: 'Water Sensitivity', value: sensitivityAnalysis.water_sensitivity, impact: 'High', unit: '% yield change' },
        { factor: 'Climate Sensitivity', value: sensitivityAnalysis.climate_sensitivity, impact: 'Medium', unit: '% yield change' },
        { factor: 'Management Sensitivity', value: sensitivityAnalysis.management_sensitivity, impact: 'Low', unit: '% yield change' },
    ] : [];

    // 2) ENVIRONMENTAL IMPACT ANALYTICS DATA
    const environmentalMetrics = cropYieldData ? getEnvironmentalMetricsSummary(cropYieldData) : null;
    const carbonData = cropYieldData ? getCarbonEmissionData(cropYieldData) : null;

    // Water usage vs yield correlation
    const waterMetrics = cropYieldData ? getMetricsByCategory(cropYieldData, 'water') : {};
    const waterUsageData = Object.values(waterMetrics).map((metric: any) => ({
        year: metric.values[0]?.year || 2024,
        waterUsage: metric.values[0]?.numeric_value || 0,
        yield: predictiveModelData.forecastedYield,
        efficiency: parseFloat(predictiveModelData.waterEfficiency.replace('%', '')),
    }));

    // Carbon footprint per unit yield
    const carbonIntensity = environmentalMetrics?.keyPerformanceIndicators?.carbon_intensity || { value: 0, unit: 'kg CO₂e/ton' };
    const carbonFootprintData = carbonData?.yearly_data?.map((year: any) => ({
        year: year.year,
        emissions: year.emissions?.totals?.total_scope_emission_tco2e || 0,
        sequestration: year.sequestration?.annual_summary?.sequestration_total_tco2 || 0,
        netCarbon: year.emissions?.totals?.net_total_emission_tco2e || 0,
        yield: predictiveModelData.forecastedYield * (1 + (Math.random() * 0.1 - 0.05)), // Simulated yield variation
        carbonPerYield: carbonIntensity.value,
    })) || [];

    // Sustainability metrics dashboard
    const sustainabilityMetrics = {
        waterUseEfficiency: environmentalMetrics?.keyPerformanceIndicators?.water_use_efficiency || { value: 0, unit: 'kg/m³', status: 'N/A' },
        energyProductivity: environmentalMetrics?.keyPerformanceIndicators?.energy_productivity || { value: 0, unit: 'kg/kWh', status: 'N/A' },
        carbonIntensity: environmentalMetrics?.keyPerformanceIndicators?.carbon_intensity || { value: 0, unit: 'kg CO₂e/ton', status: 'N/A' },
        soilHealthIndex: environmentalMetrics?.keyPerformanceIndicators?.soil_health_index || { value: 0, unit: 'index', status: 'N/A' },
    };

    // 3) MACHINE LEARNING INSIGHTS DATA
    const riskAssessment = cropYieldData ? getRiskAssessmentSummary(cropYieldData) : null;
    const ndviIndicators = cropYieldData ? getNDVIIndicators(cropYieldData) : null;

    // Yield prediction accuracy metrics
    const mlAccuracyMetrics = {
        overallAccuracy: confidenceScore?.overall || 0,
        forecastConfidence: confidenceScore?.forecast_confidence || 0,
        dataQuality: confidenceScore?.data_quality || 0,
        methodologyRigor: confidenceScore?.methodology_rigor || 0,
        improvementAreas: confidenceScore?.improvement_areas || [],
        interpretation: confidenceScore?.interpretation || 'N/A',
    };

    // Feature importance analysis
    const featureImportanceData = [
        { feature: 'NDVI (Vegetation Health)', importance: 35, impact: 'Positive', category: 'Satellite' },
        { feature: 'Soil Organic Carbon', importance: 25, impact: 'Positive', category: 'Soil' },
        { feature: 'Water Efficiency', importance: 20, impact: 'Positive', category: 'Resource' },
        { feature: 'Climate Factors', importance: 15, impact: 'Variable', category: 'Climate' },
        { feature: 'Management Practices', importance: 5, impact: 'Positive', category: 'Human' },
    ];

    // Anomaly detection data
    const ndviData = ndviIndicators?.growing_season_months || [];
    const anomalyData = ndviData.map((month: any, index: number) => {
        const anomaly = month.ndvi < 0.3 ? 'Low Vegetation' :
            month.ndvi > 0.8 ? 'High Vegetation' : 'Normal';
        return {
            month: month.month,
            ndvi: month.ndvi,
            biomass: month.biomass,
            anomaly,
            severity: anomaly !== 'Normal' ? (anomaly === 'Low Vegetation' ? 'High' : 'Low') : 'None',
        };
    });

    // 4) COMPARATIVE ANALYSIS DATA
    const industryComparison = yieldForecast?.comparison || null;
    const companyInfo = cropYieldData?.data.company || null;
    const monthlyCarbonData = cropYieldData ? getMonthlyCarbonData(cropYieldData) : [];

    // Peer benchmarking data
    const peerBenchmarkingData = [
        { company: 'Industry Average', yield: industryComparison?.industry_average || 0, efficiency: 75, carbonIntensity: 150 },
        { company: selectedCompany?.name || 'Your Company', yield: industryComparison?.company_yield || 0, efficiency: parseFloat(predictiveModelData.waterEfficiency.replace('%', '')), carbonIntensity: carbonIntensity.value },
        { company: 'Top Performer', yield: (industryComparison?.industry_average || 0) * 1.2, efficiency: 90, carbonIntensity: 120 },
        { company: 'Regional Average', yield: (industryComparison?.industry_average || 0) * 0.95, efficiency: 70, carbonIntensity: 160 },
    ];

    // Regional comparisons
    const regionalComparisonData = [
        { region: 'North Region', yield: 4.2, waterUsage: 550, carbonFootprint: 120, riskScore: 25 },
        { region: 'South Region', yield: 3.8, waterUsage: 620, carbonFootprint: 140, riskScore: 40 },
        { region: 'East Region', yield: 4.5, waterUsage: 500, carbonFootprint: 110, riskScore: 20 },
        { region: 'West Region', yield: 3.5, waterUsage: 680, carbonFootprint: 160, riskScore: 55 },
        { region: 'Your Region', yield: predictiveModelData.forecastedYield, waterUsage: 580, carbonFootprint: carbonIntensity.value, riskScore: riskAssessment?.overallScore || 30 },
    ];

    // Historical performance vs targets
    const historicalData = [
        { year: 2020, actual: 3.2, target: 3.5, status: 'Below' },
        { year: 2021, actual: 3.8, target: 3.7, status: 'Above' },
        { year: 2022, actual: 4.1, target: 4.0, status: 'Above' },
        { year: 2023, actual: 4.3, target: 4.2, status: 'Above' },
        { year: 2024, actual: predictiveModelData.forecastedYield, target: 4.5, status: predictiveModelData.forecastedYield >= 4.5 ? 'Above' : 'Below' },
    ];

    // =====================
    // CHART DATA PREPARATION
    // =====================

    // Scenario Analysis Chart
    const scenarioChartData = [
        { scenario: 'Best Case', yield: scenarioData.bestCase.yield, probability: scenarioData.bestCase.probability },
        { scenario: 'Baseline', yield: scenarioData.baseline.yield, probability: scenarioData.baseline.probability },
        { scenario: 'Worst Case', yield: scenarioData.worstCase.yield, probability: scenarioData.worstCase.probability },
    ];

    // Water-Yield Correlation Chart
    const waterYieldCorrelationData = waterUsageData.map((d, i) => ({
        x: d.waterUsage,
        y: d.yield,
        size: d.efficiency,
        year: d.year,
    }));

    // Carbon-Yield Scatter Plot
    const carbonYieldScatterData = carbonFootprintData.map((d) => ({
        x: d.netCarbon,
        y: d.yield,
        size: Math.abs(d.netCarbon) / 10,
        year: d.year,
        color: d.netCarbon < 0 ? COLORS.success : COLORS.danger,
    }));

    // Feature Importance Chart
    const featureImportanceChartData = featureImportanceData.sort((a, b) => b.importance - a.importance);

    // Anomaly Detection Chart
    const anomalyChartData = anomalyData.map((d) => ({
        month: d.month,
        ndvi: d.ndvi,
        anomaly: d.anomaly,
        color: d.anomaly === 'Low Vegetation' ? COLORS.danger :
            d.anomaly === 'High Vegetation' ? COLORS.warning : COLORS.success,
    }));

    // Handle metric click
    const handleMetricClick = (metric: any, title: string) => {
        setSelectedMetric({ ...metric, title });
        setShowMetricModal(true);
    };

    // =====================
    // CHART COMPONENTS
    // =====================

    const analyticsGraphs = [
        // 1) Predictive Modeling Chart
        {
            id: 'predictive-modeling',
            title: 'Predictive Modeling Results',
            description: 'ML-based yield forecast with confidence intervals',
            type: 'line',
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="year" stroke="#6b7280" />
                        <YAxis
                            stroke="#6b7280"
                            label={{ value: 'Yield (tons/ha)', angle: -90, position: 'insideLeft' }}
                        />
                        <RechartsTooltip
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.5rem'
                            }}
                        />
                        <RechartsLegend />
                        <RechartsBar
                            dataKey="target"
                            name="Target Yield"
                            fill={COLORS.primaryLight}
                            radius={[4, 4, 0, 0]}
                        />
                        <Line
                            type="monotone"
                            dataKey="actual"
                            name="Actual Yield"
                            stroke={COLORS.primary}
                            strokeWidth={3}
                            dot={{ fill: COLORS.primary, r: 5 }}
                            activeDot={{ r: 8 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="actual"
                            name="Confidence Interval"
                            stroke={COLORS.primary}
                            fill={COLORS.primary}
                            fillOpacity={0.1}
                            strokeWidth={0}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            )
        },

        // 2) Scenario Analysis Chart
        {
            id: 'scenario-analysis',
            title: 'Scenario Analysis',
            description: 'Best case, worst case, and baseline scenarios',
            type: 'bar',
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scenarioChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="scenario" stroke="#6b7280" />
                        <YAxis
                            yAxisId="left"
                            stroke="#6b7280"
                            label={{ value: 'Yield (tons/ha)', angle: -90, position: 'insideLeft' }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#6b7280"
                            label={{ value: 'Probability (%)', angle: 90, position: 'insideRight' }}
                        />
                        <RechartsTooltip
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.5rem'
                            }}
                            formatter={(value, name) => {
                                if (name === 'yield') return [`${Number(value).toFixed(1)} tons/ha`, 'Forecasted Yield'];
                                if (name === 'probability') return [`${value}%`, 'Probability'];
                                return [value, name];
                            }}
                        />
                        <RechartsLegend />
                        <RechartsBar
                            yAxisId="left"
                            dataKey="yield"
                            name="Forecasted Yield"
                            radius={[4, 4, 0, 0]}
                        >
                            {scenarioChartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        entry.scenario === 'Best Case' ? COLORS.success :
                                            entry.scenario === 'Worst Case' ? COLORS.danger :
                                                COLORS.primary
                                    }
                                />
                            ))}
                        </RechartsBar>
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="probability"
                            name="Probability"
                            stroke={COLORS.info}
                            strokeWidth={2}
                            dot={{ fill: COLORS.info, r: 4 }}
                        />
                    </BarChart>
                </ResponsiveContainer>
            )
        },

        // 3) Sensitivity Analysis Chart
        {
            id: 'sensitivity-analysis',
            title: 'Sensitivity Analysis',
            description: 'Impact of different factors on yield',
            type: 'radar',
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sensitivityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="factor" stroke="#6b7280" />
                        <YAxis
                            stroke="#6b7280"
                            label={{ value: 'Sensitivity Score', angle: -90, position: 'insideLeft' }}
                        />
                        <RechartsTooltip
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.5rem'
                            }}
                            formatter={(value, name, props) => [
                                `${value}%`,
                                `Impact: ${props.payload.impact}`
                            ]}
                        />
                        <RechartsBar
                            dataKey="value"
                            radius={[4, 4, 0, 0]}
                        >
                            {sensitivityData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        entry.impact === 'High' ? COLORS.danger :
                                            entry.impact === 'Medium' ? COLORS.warning :
                                                COLORS.success
                                    }
                                />
                            ))}
                        </RechartsBar>
                    </BarChart>
                </ResponsiveContainer>
            )
        },

        // 4) Water-Yield Correlation
        {
            id: 'water-yield-correlation',
            title: 'Water Usage vs Yield Correlation',
            description: 'Relationship between water efficiency and crop yield',
            type: 'scatter',
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            type="number"
                            dataKey="x"
                            name="Water Usage (m³/ha)"
                            stroke="#6b7280"
                            label={{ value: 'Water Usage (m³/ha)', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis
                            type="number"
                            dataKey="y"
                            name="Yield (tons/ha)"
                            stroke="#6b7280"
                            label={{ value: 'Yield (tons/ha)', angle: -90, position: 'insideLeft' }}
                        />
                        <ZAxis type="number" dataKey="size" range={[50, 400]} name="Efficiency" />
                        <RechartsTooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.5rem'
                            }}
                            formatter={(value, name, props) => {
                                if (name === 'Water Usage (m³/ha)') return [`${value} m³/ha`, 'Water Usage'];
                                if (name === 'Yield (tons/ha)') return [`${value} tons/ha`, 'Yield'];
                                if (name === 'Efficiency') return [`${value}%`, 'Water Efficiency'];
                                return [value, name];
                            }}
                        />
                        <RechartsLegend />
                        <RechartsScatter name="Water-Yield Correlation" data={waterYieldCorrelationData} fill={COLORS.water}>
                            {waterYieldCorrelationData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS.water} opacity={0.6 + (entry.size / 200)} />
                            ))}
                        </RechartsScatter>
                    </ScatterChart>
                </ResponsiveContainer>
            )
        },

        // 5) Carbon Footprint per Unit Yield
        {
            id: 'carbon-yield-efficiency',
            title: 'Carbon Footprint per Unit Yield',
            description: 'Carbon intensity of crop production',
            type: 'scatter',
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            type="number"
                            dataKey="x"
                            name="Net Carbon (tCO₂e)"
                            stroke="#6b7280"
                            label={{ value: 'Net Carbon (tCO₂e)', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis
                            type="number"
                            dataKey="y"
                            name="Yield (tons/ha)"
                            stroke="#6b7280"
                            label={{ value: 'Yield (tons/ha)', angle: -90, position: 'insideLeft' }}
                        />
                        <ZAxis type="number" dataKey="size" range={[50, 400]} name="Year" />
                        <RechartsTooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.5rem'
                            }}
                            formatter={(value, name, props) => {
                                if (name === 'Net Carbon (tCO₂e)') return [`${Number(value).toFixed(1)} tCO₂e`, 'Net Carbon'];
                                if (name === 'Yield (tons/ha)') return [`${value} tons/ha`, 'Yield'];
                                if (name === 'Year') return [props.payload.year, 'Year'];
                                return [value, name];
                            }}
                        />
                        <RechartsLegend />
                        <RechartsScatter name="Carbon-Yield Relationship" data={carbonYieldScatterData}>
                            {carbonYieldScatterData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} opacity={0.7} />
                            ))}
                        </RechartsScatter>
                    </ScatterChart>
                </ResponsiveContainer>
            )
        },

        // 6) Feature Importance Analysis
        {
            id: 'feature-importance',
            title: 'Feature Importance Analysis',
            description: 'ML model feature contributions to yield prediction',
            type: 'bar',
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={featureImportanceChartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                        <XAxis
                            type="number"
                            stroke="#6b7280"
                            label={{ value: 'Importance (%)', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis
                            type="category"
                            dataKey="feature"
                            stroke="#6b7280"
                            width={150}
                        />
                        <RechartsTooltip
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.5rem'
                            }}
                            formatter={(value, name, props) => [
                                `${value}%`,
                                `Impact: ${props.payload.impact}`
                            ]}
                        />
                        <RechartsBar
                            dataKey="importance"
                            radius={[0, 4, 4, 0]}
                        >
                            {featureImportanceChartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        entry.category === 'Satellite' ? COLORS.primary :
                                            entry.category === 'Soil' ? COLORS.soil :
                                                entry.category === 'Resource' ? COLORS.water :
                                                    entry.category === 'Climate' ? COLORS.info :
                                                        COLORS.accent
                                    }
                                />
                            ))}
                        </RechartsBar>
                    </BarChart>
                </ResponsiveContainer>
            )
        },

        // 7) Anomaly Detection
        {
            id: 'anomaly-detection',
            title: 'Anomaly Detection',
            description: 'Detection of unusual patterns in vegetation health',
            type: 'line',
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={anomalyChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis
                            stroke="#6b7280"
                            label={{ value: 'NDVI Value', angle: -90, position: 'insideLeft' }}
                        />
                        <RechartsTooltip
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.5rem'
                            }}
                            formatter={(value, name, props) => [
                                value,
                                `Status: ${props.payload.anomaly}`
                            ]}
                        />
                        <Line
                            type="monotone"
                            dataKey="ndvi"
                            name="NDVI"
                            stroke={COLORS.primary}
                            strokeWidth={3}
                            dot={(props: any) => (
                                <circle
                                    cx={props.cx}
                                    cy={props.cy}
                                    r={4}
                                    fill={anomalyChartData[props.index]?.color || COLORS.primary}
                                    stroke="#ffffff"
                                    strokeWidth={2}
                                />
                            )}
                        />
                        <Line
                            type="monotone"
                            dataKey={() => 0.3}
                            name="Low Threshold"
                            stroke={COLORS.danger}
                            strokeWidth={1}
                            strokeDasharray="5 5"
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey={() => 0.8}
                            name="High Threshold"
                            stroke={COLORS.warning}
                            strokeWidth={1}
                            strokeDasharray="5 5"
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )
        },

        // 8) Peer Benchmarking
        {
            id: 'peer-benchmarking',
            title: 'Peer Benchmarking',
            description: 'Comparison with industry peers',
            type: 'bar',
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={peerBenchmarkingData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="company" stroke="#6b7280" />
                        <YAxis
                            stroke="#6b7280"
                            label={{ value: 'Yield (tons/ha)', angle: -90, position: 'insideLeft' }}
                        />
                        <RechartsTooltip
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.5rem'
                            }}
                            formatter={(value, name, props) => {
                                if (name === 'yield') return [`${value} tons/ha`, 'Yield'];
                                if (name === 'efficiency') return [`${value}%`, 'Water Efficiency'];
                                if (name === 'carbonIntensity') return [`${value} kg CO₂e/ton`, 'Carbon Intensity'];
                                return [value, name];
                            }}
                        />
                        <RechartsLegend />
                        <RechartsBar
                            dataKey="yield"
                            name="Yield (tons/ha)"
                            radius={[4, 4, 0, 0]}
                        >
                            {peerBenchmarkingData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.company === selectedCompany?.name || entry.company.includes('Your') ? COLORS.primary : COLORS.primaryLight}
                                />
                            ))}
                        </RechartsBar>
                    </BarChart>
                </ResponsiveContainer>
            )
        },
    ];

    // =====================
    // RENDER COMPONENT
    // =====================

    return (
        <div className="space-y-8 pb-8">
            {/* Hero Section with Key Metrics */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 p-8 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Advanced Analytics Dashboard</h2>
                            <p className="text-green-100 text-lg">Predictive modeling, machine learning insights, and comparative analysis</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowInsightsModal(true)}
                                className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
                            >
                                <Zap className="w-5 h-5" />
                                AI Insights
                            </button>
                        </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 cursor-pointer hover:bg-white/20 transition-all group"
                            onClick={() => handleMetricClick({ value: mlAccuracyMetrics.overallAccuracy, unit: '%' }, 'ML Accuracy')}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white/20">
                                    <Brain className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-green-100 mb-1">Prediction Confidence</div>
                                </div>
                            </div>
                            <h3 className="text-4xl font-bold mb-2">
                                {mlAccuracyMetrics.overallAccuracy}
                                <span className="text-xl ml-1 text-green-100">%</span>
                            </h3>
                            <p className="text-green-100 mb-3">ML Accuracy</p>
                            <span className="inline-block px-3 py-1 rounded-full text-xs bg-white/20 text-white font-medium">
                                High Confidence
                            </span>
                        </div>

                        <div
                            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 cursor-pointer hover:bg-white/20 transition-all group"
                            onClick={() => handleMetricClick({ value: predictiveModelData.waterEfficiency, unit: '' }, 'Water Efficiency')}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white/20">
                                    <Droplet className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-green-100 mb-1">Resource Optimization</div>
                                </div>
                            </div>
                            <h3 className="text-4xl font-bold mb-2">
                                {predictiveModelData.waterEfficiency}
                            </h3>
                            <p className="text-green-100">Water Efficiency</p>
                        </div>

                        <div
                            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 cursor-pointer hover:bg-white/20 transition-all group"
                            onClick={() => handleMetricClick({ value: carbonIntensity.value, unit: carbonIntensity.unit }, 'Carbon Intensity')}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white/20">
                                    <Thermometer className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-green-100 mb-1">Environmental Impact</div>
                                </div>
                            </div>
                            <h3 className="text-4xl font-bold mb-2">
                                {carbonIntensity.value}
                                <span className="text-xl ml-1 text-green-100">{carbonIntensity.unit.split(' ')[0]}</span>
                            </h3>
                            <p className="text-green-100">Carbon Intensity</p>
                        </div>

                        <div
                            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 cursor-pointer hover:bg-white/20 transition-all group"
                            onClick={() => handleMetricClick({ value: riskAssessment?.riskLevel || 'Low' }, 'Risk Assessment')}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white/20">
                                    <Shield className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-green-100 mb-1">Overall Assessment</div>
                                </div>
                            </div>
                            <h3 className="text-4xl font-bold mb-2">
                                {riskAssessment?.overallScore || 30}
                                <span className="text-xl ml-1 text-green-100">%</span>
                            </h3>
                            <p className="text-green-100 mb-3">Risk Score</p>
                            <span className="inline-block px-3 py-1 rounded-full text-xs bg-white/20 text-white font-medium">
                                {riskAssessment?.riskLevel || 'Low'} Risk
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scenario Analysis Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(scenarioData).map(([key, scenario]) => {
                    const scenarioKey = key as 'bestCase' | 'worstCase' | 'baseline';
                    const isSelected = selectedScenario === scenarioKey.replace('Case', '').toLowerCase();
                    return (
                        <div
                            key={key}
                            className={`bg-white rounded-3xl border-2 shadow-lg p-6 cursor-pointer transition-all duration-200 ${isSelected
                                    ? 'border-green-500 shadow-green-200'
                                    : 'border-gray-200 hover:border-green-300'
                                }`}
                            onClick={() => setSelectedScenario(scenarioKey.replace('Case', '').toLowerCase() as any)}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {key === 'bestCase' ? 'Best Case' : key === 'worstCase' ? 'Worst Case' : 'Baseline'}
                                </h3>
                                <div className={`p-2 rounded-lg ${key === 'bestCase' ? 'bg-green-100' :
                                        key === 'worstCase' ? 'bg-red-100' :
                                            'bg-blue-100'
                                    }`}>
                                    {key === 'bestCase' ? <TrendingUp className="w-5 h-5 text-green-600" /> :
                                        key === 'worstCase' ? <TrendingDown className="w-5 h-5 text-red-600" /> :
                                            <Activity className="w-5 h-5 text-blue-600" />}
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-gray-900">
                                        {scenario.yield.toFixed(1)}
                                    </span>
                                    <span className="text-lg text-gray-600">tons/ha</span>
                                </div>
                                <div className="mt-2">
                                    <span className="text-sm text-gray-600">Probability: </span>
                                    <span className="text-sm font-bold text-gray-900">{scenario.probability}%</span>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <p className="text-xs font-semibold text-gray-600 uppercase">Key Factors</p>
                                {Object.entries(scenario.factors).map(([factor, value]) => (
                                    <div key={factor} className="flex justify-between text-sm">
                                        <span className="text-gray-600 capitalize">{factor}:</span>
                                        <span className="font-medium text-gray-900">{value}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Conditions</p>
                                <ul className="space-y-1">
                                    {scenario.conditions.map((condition, index) => (
                                        <li key={index} className="text-xs text-gray-700 flex items-start gap-2">
                                            <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span>{condition}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Predictive Modeling */}
                    <GraphDisplay
                        title="Predictive Modeling Results"
                        description="ML-based yield forecast with confidence intervals"
                        icon={<Brain className="w-5 h-5 text-green-600" />}
                        onClick={() => setSelectedGraph(analyticsGraphs[0])}
                    >
                        {analyticsGraphs[0].component}
                    </GraphDisplay>

                    {/* Scenario Analysis */}
                    <GraphDisplay
                        title="Scenario Analysis"
                        description="Best case, worst case, and baseline scenarios"
                        icon={<GitBranch className="w-5 h-5 text-green-600" />}
                        onClick={() => setSelectedGraph(analyticsGraphs[1])}
                    >
                        {analyticsGraphs[1].component}
                    </GraphDisplay>

                    {/* Water-Yield Correlation */}
                    <GraphDisplay
                        title="Water Usage vs Yield Correlation"
                        description="Relationship between water efficiency and crop yield"
                        icon={<ScatterChartIcon className="w-5 h-5 text-green-600" />}
                        onClick={() => setSelectedGraph(analyticsGraphs[3])}
                    >
                        {analyticsGraphs[3].component}
                    </GraphDisplay>

                    {/* Feature Importance */}
                    <GraphDisplay
                        title="Feature Importance Analysis"
                        description="ML model feature contributions to yield prediction"
                        icon={<Cpu className="w-5 h-5 text-green-600" />}
                        onClick={() => setSelectedGraph(analyticsGraphs[5])}
                    >
                        {analyticsGraphs[5].component}
                    </GraphDisplay>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Sensitivity Analysis */}
                    <GraphDisplay
                        title="Sensitivity Analysis"
                        description="Impact of different factors on yield"
                        icon={<BarChart3 className="w-5 h-5 text-green-600" />}
                        onClick={() => setSelectedGraph(analyticsGraphs[2])}
                    >
                        {analyticsGraphs[2].component}
                    </GraphDisplay>

                    {/* Carbon-Yield Efficiency */}
                    <GraphDisplay
                        title="Carbon Footprint per Unit Yield"
                        description="Carbon intensity of crop production"
                        icon={<ScatterChartIcon className="w-5 h-5 text-green-600" />}
                        onClick={() => setSelectedGraph(analyticsGraphs[4])}
                    >
                        {analyticsGraphs[4].component}
                    </GraphDisplay>

                    {/* Anomaly Detection */}
                    <GraphDisplay
                        title="Anomaly Detection"
                        description="Detection of unusual patterns in vegetation health"
                        icon={<AlertTriangle className="w-5 h-5 text-green-600" />}
                        onClick={() => setSelectedGraph(analyticsGraphs[6])}
                    >
                        {analyticsGraphs[6].component}
                    </GraphDisplay>

                    {/* Peer Benchmarking */}
                    <GraphDisplay
                        title="Peer Benchmarking"
                        description="Comparison with industry peers"
                        icon={<Target className="w-5 h-5 text-green-600" />}
                        onClick={() => setSelectedGraph(analyticsGraphs[7])}
                    >
                        {analyticsGraphs[7].component}
                    </GraphDisplay>
                </div>
            </div>

            {/* Detailed Analysis Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ML Model Performance */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">ML Model Performance</h3>
                        <Brain className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">Forecast Confidence</span>
                                <span className="text-sm font-bold text-gray-900">{mlAccuracyMetrics.forecastConfidence}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${mlAccuracyMetrics.forecastConfidence}%`,
                                        backgroundColor: COLORS.primary
                                    }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">Data Quality</span>
                                <span className="text-sm font-bold text-gray-900">{mlAccuracyMetrics.dataQuality}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${mlAccuracyMetrics.dataQuality}%`,
                                        backgroundColor: COLORS.secondary
                                    }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">Methodology Rigor</span>
                                <span className="text-sm font-bold text-gray-900">{mlAccuracyMetrics.methodologyRigor}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${mlAccuracyMetrics.methodologyRigor}%`,
                                        backgroundColor: COLORS.accent
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-200">
                        <p className="text-sm text-gray-600">{mlAccuracyMetrics.interpretation}</p>
                    </div>
                </div>

                {/* Sustainability Metrics */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Sustainability Metrics</h3>
                        <Leaf className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="space-y-4">
                        {Object.entries(sustainabilityMetrics).map(([key, metric]: [string, any]) => (
                            <div
                                key={key}
                                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-green-50 transition-colors cursor-pointer border border-gray-200 hover:border-green-200"
                                onClick={() => handleMetricClick(metric, key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))}
                            >
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </p>
                                    <p className="text-xs text-gray-500">{metric.unit}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-gray-900">{metric.value}</p>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${metric.status === 'Good' ? 'bg-green-100 text-green-800' :
                                            metric.status === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {metric.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Regional Comparison */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Regional Comparison</h3>
                        <Map className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="space-y-3">
                        {regionalComparisonData.map((region, index) => (
                            <div
                                key={index}
                                className={`p-3 rounded-xl border transition-all cursor-pointer ${region.region === 'Your Region'
                                        ? 'bg-green-50 border-green-200 hover:bg-green-100'
                                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                    }`}
                                onClick={() => handleMetricClick(region, region.region)}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-900">{region.region}</span>
                                    <span className="text-sm font-bold text-gray-900">{region.yield} tons/ha</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-600">
                                    <span>Water: {region.waterUsage} m³/ha</span>
                                    <span>Carbon: {region.carbonFootprint} kg/ton</span>
                                    <span>Risk: {region.riskScore}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Graph Modal */}
            {selectedGraph && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedGraph(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
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
                            <div className="h-[500px]">
                                {selectedGraph.component}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Metric Detail Modal */}
            {showMetricModal && selectedMetric && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowMetricModal(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold mb-1">{selectedMetric.title}</h3>
                                    <p className="text-green-100">Detailed metric information</p>
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
                                    {typeof selectedMetric.value === 'number'
                                        ? selectedMetric.value.toFixed ? selectedMetric.value.toFixed(2) : selectedMetric.value
                                        : selectedMetric.value}
                                </div>
                                {selectedMetric.unit && <div className="text-xl text-gray-600">{selectedMetric.unit}</div>}
                            </div>
                            <div className="space-y-4">
                                {selectedMetric.status && (
                                    <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                                        <div className="flex items-center gap-2 text-green-800">
                                            <CheckCircle className="w-5 h-5" />
                                            <span className="font-semibold">Status: {selectedMetric.status}</span>
                                        </div>
                                    </div>
                                )}
                                {selectedMetric.trend && (
                                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                                        <div className="flex items-center gap-2 text-gray-800">
                                            {getTrendIcon(selectedMetric.trend)}
                                            <span className="font-semibold">Trend: {selectedMetric.trend}</span>
                                        </div>
                                    </div>
                                )}
                                {selectedMetric.conditions && (
                                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                                        <p className="font-semibold text-blue-800 mb-2">Conditions:</p>
                                        <ul className="space-y-1">
                                            {selectedMetric.conditions.map((condition: string, index: number) => (
                                                <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                                                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                    <span>{condition}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Insights Modal */}
            {showInsightsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowInsightsModal(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-3xl sticky top-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-white/20">
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">AI-Powered Insights</h3>
                                        <p className="text-purple-100">Smart analysis and recommendations</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowInsightsModal(false)}
                                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-green-100 flex-shrink-0">
                                        <TrendingUp className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900 mb-2">Yield Optimization Opportunity</h4>
                                        <p className="text-gray-700 leading-relaxed">
                                            Your forecasted yield of {predictiveModelData.forecastedYield.toFixed(1)} tons/ha shows strong potential.
                                            With {mlAccuracyMetrics.overallAccuracy}% prediction confidence, implementing recommended practices could
                                            achieve the best-case scenario of {scenarioData.bestCase.yield.toFixed(1)} tons/ha.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-blue-100 flex-shrink-0">
                                        <Droplet className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900 mb-2">Water Efficiency Analysis</h4>
                                        <p className="text-gray-700 leading-relaxed">
                                            Current water efficiency at {predictiveModelData.waterEfficiency} indicates room for improvement.
                                            Optimizing irrigation practices could reduce water usage by 15-20% while maintaining or improving yields.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-purple-100 flex-shrink-0">
                                        <Shield className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900 mb-2">Risk Mitigation</h4>
                                        <p className="text-gray-700 leading-relaxed">
                                            With a {riskAssessment?.riskLevel || 'Low'} risk level at {riskAssessment?.overallScore || 30}%,
                                            the main concerns are weather variability and water sensitivity. Consider implementing drought-resistant
                                            practices and diversifying crop varieties.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-yellow-100 flex-shrink-0">
                                        <AlertCircle className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900 mb-2">Recommended Actions</h4>
                                        <ul className="space-y-2 text-gray-700">
                                            <li className="flex items-start gap-2">
                                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span>Monitor NDVI trends closely to detect early signs of stress</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span>Implement precision irrigation based on soil moisture data</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span>Focus on soil health improvement to boost resilience</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span>Track carbon intensity to maintain sustainability goals</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-emerald-100 flex-shrink-0">
                                        <Award className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900 mb-2">Performance Benchmarking</h4>
                                        <p className="text-gray-700 leading-relaxed">
                                            Your performance is {industryComparison?.company_yield && industryComparison?.industry_average
                                                ? ((industryComparison.company_yield / industryComparison.industry_average - 1) * 100).toFixed(1)
                                                : '0'}% {industryComparison?.company_yield > industryComparison?.industry_average ? 'above' : 'below'}
                                            industry average. Focus on the identified improvement areas to reach top performer levels.
                                        </p>
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

export default AnalyticsTab;