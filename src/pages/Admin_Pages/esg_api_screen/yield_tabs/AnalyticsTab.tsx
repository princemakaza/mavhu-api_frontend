import { useState } from "react";

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
    ChevronRight,
    ChevronDown,
    BarChart2,
    PieChart,
    LineChart,
    Activity as ActivityIcon,
    AlertOctagon,
    Target as TargetIcon,
    TrendingUp as TrendingUpIcon,
    CloudRain,
    ThermometerSun,
    Wind as WindIcon,
    Droplets,
    Sprout,
} from "lucide-react";

// Import service functions from crop_yield_service
import {
    getYieldForecastSummary,
    getRiskAssessmentSummary,
    getEnvironmentalMetricsSummary,
    getCarbonEmissionData,
    getSatelliteIndicators,
    getConfidenceScoreBreakdown,
    getNDVIIndicators,
    getCalculationFactors,
    getMonthlyCarbonData,
    getMetricsByCategory,
    getSummary,
    getSeasonalAdvisory,
    getRecommendations,
} from "../../../../services/Admin_Service/esg_apis/crop_yield_service";

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
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        yieldForecast: true,
        riskAssessment: true,
        environmentalMetrics: true,
        carbonAnalysis: true,
        mlInsights: true,
        seasonalAdvisory: true,
        recommendations: true,
    });
    const [selectedScenario, setSelectedScenario] = useState<'best' | 'worst' | 'baseline'>('baseline');
    const [selectedMetric, setSelectedMetric] = useState<any>(null);
    const [showMetricModal, setShowMetricModal] = useState(false);
    const [showInsightsModal, setShowInsightsModal] = useState(false);
    const [activeAnalysis, setActiveAnalysis] = useState<string>('yield');

    // Toggle section expansion
    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    // =====================
    // DATA IMPORTS FROM API
    // =====================

    // 1) YIELD FORECAST DATA
    const yieldForecast = cropYieldData ? getYieldForecastSummary(cropYieldData) : null;
    const sensitivityAnalysis = yieldForecast?.sensitivityAnalysis;
    const calculationFactors = cropYieldData ? getCalculationFactors(cropYieldData) : null;
    const confidenceScore = cropYieldData ? getConfidenceScoreBreakdown(cropYieldData) : null;
    const summaryData = cropYieldData ? getSummary(cropYieldData) : null;
    const seasonalAdvisory = cropYieldData ? getSeasonalAdvisory(cropYieldData) : null;
    const recommendations = cropYieldData ? getRecommendations(cropYieldData) : null;

    // Predictive modeling results
    const predictiveModelData = {
        forecastedYield: yieldForecast?.forecastedYield || 0,
        confidence: yieldForecast?.confidenceScore || 0,
        calculationFormula: yieldForecast?.formula || 'N/A',
        baseYield: calculationFactors?.base_yield || 0,
        ndviFactor: calculationFactors?.ndvi_factor || 0,
        waterEfficiency: calculationFactors?.water_efficiency || 0,
        soilHealthFactor: calculationFactors?.soil_health_factor || 0,
        climateFactor: calculationFactors?.climate_factor || 0,
    };

    // Scenario analysis data
    const scenarioData = {
        bestCase: {
            yield: predictiveModelData.forecastedYield * 1.15,
            probability: 30,
            conditions: ['Optimal rainfall', 'No pest pressure', 'Ideal temperatures'],
            factors: {
                water: '95% efficiency',
                temperature: '+2°C optimal',
                ndvi: '0.8+ sustained',
            },
        },
        worstCase: {
            yield: predictiveModelData.forecastedYield * 0.85,
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
                water: `${predictiveModelData.waterEfficiency}% efficiency`,
                temperature: 'Normal range',
                ndvi: 'Seasonal average',
            },
        },
    };

    // 2) ENVIRONMENTAL IMPACT ANALYTICS DATA
    const environmentalMetrics = cropYieldData ? getEnvironmentalMetricsSummary(cropYieldData) : null;
    const carbonData = cropYieldData ? getCarbonEmissionData(cropYieldData) : null;

    // Water usage vs yield correlation
    const waterMetrics = cropYieldData ? getMetricsByCategory(cropYieldData, 'water') : {};

    // Carbon footprint per unit yield
    const carbonIntensity = environmentalMetrics?.keyPerformanceIndicators?.carbon_intensity || { value: 0, unit: 'kg CO₂e/ton' };

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

    // 4) COMPARATIVE ANALYSIS DATA
    const industryComparison = yieldForecast?.comparison || null;

    // Peer benchmarking data
    const peerBenchmarkingData = [
        { company: 'Industry Average', yield: industryComparison?.industry_average || 0, efficiency: 75, carbonIntensity: 150 },
        { company: selectedCompany?.name || 'Your Company', yield: industryComparison?.company_yield || 0, efficiency: predictiveModelData.waterEfficiency, carbonIntensity: carbonIntensity.value },
        { company: 'Top Performer', yield: (industryComparison?.industry_average || 0) * 1.2, efficiency: 90, carbonIntensity: 120 },
        { company: 'Regional Average', yield: (industryComparison?.industry_average || 0) * 0.95, efficiency: 70, carbonIntensity: 160 },
    ];

    // Handle metric click
    const handleMetricClick = (metric: any, title: string) => {
        setSelectedMetric({ ...metric, title });
        setShowMetricModal(true);
    };

    // =====================
    // RENDER COMPONENT
    // =====================

    return (
        <div className="space-y-8 pb-8">
            {/* Hero Section with Key Metrics */}
  

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
                                    <span className="text-sm font-bold text-gray-900">__%</span>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <p className="text-xs font-semibold text-gray-600 uppercase">Key Factors</p>
                                {Object.entries(scenario.factors).map(([factor, value]) => (
                                    <div key={factor} className="flex justify-between text-sm">
                                        <span className="text-gray-600 capitalize">{factor}:</span>
                                        <span className="font-medium text-gray-900">0</span>
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

            {/* Analytics Sections - Text Based Only */}
            <div className="space-y-6">
                {/* Yield Forecast Analysis */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                    <div
                        className="p-6 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleSection('yieldForecast')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-green-100">
                                    <Sprout className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Yield Forecast Analysis</h3>
                                    <p className="text-gray-600">Predictive modeling and scenario analysis</p>
                                </div>
                            </div>
                            {expandedSections.yieldForecast ?
                                <ChevronDown className="w-6 h-6 text-gray-400" /> :
                                <ChevronRight className="w-6 h-6 text-gray-400" />
                            }
                        </div>
                    </div>

                    {expandedSections.yieldForecast && (
                        <div className="p-6 space-y-6">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                                    <p className="text-sm font-medium text-gray-600 mb-1">Forecasted Yield</p>
                                    <p className="text-2xl font-bold text-gray-900">{predictiveModelData.forecastedYield.toFixed(1)} tons/ha</p>
                                    <p className="text-xs text-gray-500 mt-1">Based on current conditions</p>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                                    <p className="text-sm font-medium text-gray-600 mb-1">Confidence Score</p>
                                    <p className="text-2xl font-bold text-gray-900">__%</p>
                                    <p className="text-xs text-gray-500 mt-1">Model accuracy</p>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                                    <p className="text-sm font-medium text-gray-600 mb-1">Season</p>
                                    <p className="text-2xl font-bold text-gray-900">{yieldForecast?.season || 'Current'}</p>
                                    <p className="text-xs text-gray-500 mt-1">Growing season</p>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                                    <p className="text-sm font-medium text-gray-600 mb-1">Industry Comparison</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {industryComparison?.percentage_difference ?
                                            `${industryComparison.percentage_difference > 0 ? '+' : ''}${industryComparison.percentage_difference.toFixed(1)}%` :
                                            'N/A'
                                        }
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">vs Industry Average</p>
                                </div>
                            </div>

                            {/* Calculation Factors */}
                            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                                <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-blue-600" />
                                    Calculation Factors
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Base Yield</p>
                                        <p className="text-lg font-bold text-gray-900">{predictiveModelData.baseYield.toFixed(1)} tons/ha</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">NDVI Factor</p>
                                        <p className="text-lg font-bold text-gray-900">{predictiveModelData.ndviFactor.toFixed(1)}%</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Water Efficiency</p>
                                        <p className="text-lg font-bold text-gray-900">{predictiveModelData.waterEfficiency.toFixed(1)}%</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Climate Factor</p>
                                        <p className="text-lg font-bold text-gray-900">{predictiveModelData.climateFactor.toFixed(1)}%</p>
                                    </div>
                                </div>
                                {yieldForecast?.formula && (
                                    <div className="mt-4 p-4 bg-white rounded-xl border border-blue-100">
                                        <p className="text-sm font-medium text-gray-600 mb-2">Calculation Formula</p>
                                        <p className="text-sm text-gray-700 font-mono bg-gray-50 p-3 rounded-lg">
                                            {yieldForecast.formula}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Sensitivity Analysis */}
                            {sensitivityAnalysis && (
                                <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
                                    <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                        Sensitivity Analysis
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-white rounded-xl p-4 border border-yellow-200">
                                            <p className="text-sm font-medium text-gray-600 mb-1">Water Sensitivity</p>
                                            <p className="text-2xl font-bold text-gray-900">{sensitivityAnalysis.water_sensitivity}%</p>
                                            <p className="text-xs text-gray-500 mt-1">Impact on yield</p>
                                        </div>
                                        <div className="bg-white rounded-xl p-4 border border-yellow-200">
                                            <p className="text-sm font-medium text-gray-600 mb-1">Climate Sensitivity</p>
                                            <p className="text-2xl font-bold text-gray-900">{sensitivityAnalysis.climate_sensitivity}%</p>
                                            <p className="text-xs text-gray-500 mt-1">Weather impact</p>
                                        </div>
                                        <div className="bg-white rounded-xl p-4 border border-yellow-200">
                                            <p className="text-sm font-medium text-gray-600 mb-1">Management Sensitivity</p>
                                            <p className="text-2xl font-bold text-gray-900">{sensitivityAnalysis.management_sensitivity}%</p>
                                            <p className="text-xs text-gray-500 mt-1">Practice impact</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Risk Assessment */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                    <div
                        className="p-6 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleSection('riskAssessment')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-red-100">
                                    <AlertOctagon className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Risk Assessment</h3>
                                    <p className="text-gray-600">Detailed risk analysis and mitigation strategies</p>
                                </div>
                            </div>
                            {expandedSections.riskAssessment ?
                                <ChevronDown className="w-6 h-6 text-gray-400" /> :
                                <ChevronRight className="w-6 h-6 text-gray-400" />
                            }
                        </div>
                    </div>

                    {expandedSections.riskAssessment && riskAssessment && (
                        <div className="p-6 space-y-6">
                            {/* Overall Risk Summary */}
                            <div className={`rounded-2xl p-6 border-2 ${riskAssessment.riskLevel === 'High' ? 'bg-red-50 border-red-200' :
                                    riskAssessment.riskLevel === 'Medium' ? 'bg-yellow-50 border-yellow-200' :
                                        'bg-green-50 border-green-200'
                                }`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900">Overall Risk Assessment</h4>
                                        <p className="text-gray-600">Current risk level and probability</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-4xl font-bold text-gray-900 mb-1">__%</div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${riskAssessment.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                                                riskAssessment.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                            }`}>
                                            {riskAssessment.riskLevel} Risk
                                        </span>
                                    </div>
                                </div>
                                <p className="text-gray-700">Probability of yield impact: <strong>_____</strong></p>
                            </div>

                            {/* Primary Risks */}
                            {riskAssessment.primaryRisks && riskAssessment.primaryRisks.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="font-bold text-lg text-gray-900">Primary Risk Factors</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {riskAssessment.primaryRisks.map((risk: any, index: number) => (
                                            <div key={index} className="bg-white rounded-xl p-4 border border-gray-200">
                                                <div className="flex items-start justify-between mb-2">
                                                    <span className="font-medium text-gray-900">{risk.category}</span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${risk.level === 'High' ? 'bg-red-100 text-red-800' :
                                                            risk.level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-green-100 text-green-800'
                                                        }`}>
                                                        {risk.level}
                                                    </span>
                                                </div>
                                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${risk.score}%`,
                                                            backgroundColor: risk.level === 'High' ? '#ef4444' :
                                                                risk.level === 'Medium' ? '#eab308' :
                                                                    '#22c55e'
                                                        }}
                                                    ></div>
                                                </div>
                                                <p className="text-xs text-gray-600">Score: ___%</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Mitigation Priorities */}
                            {riskAssessment.mitigationPriorities && riskAssessment.mitigationPriorities.length > 0 && (
                                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                                    <h4 className="font-bold text-lg text-gray-900 mb-4">Mitigation Priorities</h4>
                                    <ul className="space-y-2">
                                        {riskAssessment.mitigationPriorities.map((priority: string, index: number) => (
                                            <li key={index} className="flex items-start gap-2 text-gray-700">
                                                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                                <span>{priority}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Environmental Metrics */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                    <div
                        className="p-6 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleSection('environmentalMetrics')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-emerald-100">
                                    <Leaf className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Environmental Metrics</h3>
                                    <p className="text-gray-600">Sustainability and resource efficiency metrics</p>
                                </div>
                            </div>
                            {expandedSections.environmentalMetrics ?
                                <ChevronDown className="w-6 h-6 text-gray-400" /> :
                                <ChevronRight className="w-6 h-6 text-gray-400" />
                            }
                        </div>
                    </div>

                    {expandedSections.environmentalMetrics && (
                        <div className="p-6 space-y-6">
                            {/* Sustainability KPIs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {Object.entries(sustainabilityMetrics).map(([key, metric]: [string, any]) => (
                                    <div
                                        key={key}
                                        className="bg-white rounded-xl p-4 border border-gray-200 cursor-pointer hover:border-green-300 transition-colors"
                                        onClick={() => handleMetricClick(metric, key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">
                                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                </p>
                                                <p className="text-xs text-gray-500">{metric.unit}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${metric.status === 'Good' ? 'bg-green-100 text-green-800' :
                                                metric.status === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {metric.status}
                                            </span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                        {metric.benchmark && (
                                            <p className="text-xs text-gray-600 mt-1">Benchmark: {metric.benchmark}</p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Water Metrics */}
                            {Object.keys(waterMetrics).length > 0 && (
                                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                                    <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                                        <Droplets className="w-5 h-5 text-blue-600" />
                                        Water Management Metrics
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {Object.entries(waterMetrics).slice(0, 6).map(([key, metric]: [string, any]) => (
                                            <div key={key} className="bg-white rounded-xl p-4 border border-blue-200">
                                                <p className="text-sm font-medium text-gray-600 mb-1">{metric.name}</p>
                                                <p className="text-lg font-bold text-gray-900">
                                                    {metric.values && metric.values.length > 0 ? metric.values[0].value : 'N/A'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">{metric.unit}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Summary Data */}
                            {environmentalMetrics && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {Object.entries(environmentalMetrics).map(([category, data]: [string, any]) => {
                                        if (typeof data === 'object' && data !== null && 'total_metrics' in data) {
                                            return (
                                                <div key={category} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                                    <p className="text-sm font-medium text-gray-600 mb-1 capitalize">{category}</p>
                                                    <p className="text-2xl font-bold text-gray-900">{data.total_metrics || 0}</p>
                                                    <p className="text-xs text-gray-500 mt-1">metrics tracked</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }).filter(Boolean)}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Carbon Analysis */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                    <div
                        className="p-6 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleSection('carbonAnalysis')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-purple-100">
                                    <ThermometerSun className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Carbon Analysis</h3>
                                    <p className="text-gray-600">Carbon emissions and sequestration analysis</p>
                                </div>
                            </div>
                            {expandedSections.carbonAnalysis ?
                                <ChevronDown className="w-6 h-6 text-gray-400" /> :
                                <ChevronRight className="w-6 h-6 text-gray-400" />
                            }
                        </div>
                    </div>

                    {expandedSections.carbonAnalysis && carbonData && (
                        <div className="p-6 space-y-6">
                            {/* Carbon Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                                    <h4 className="font-bold text-lg text-gray-900 mb-2">Carbon Sequestration</h4>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {carbonData.summary?.totals?.total_sequestration_tco2?.toFixed(1) || '0'}
                                    </p>
                                    <p className="text-gray-600">tCO₂ total</p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Trend: <span className="font-medium">{carbonData.summary?.trends?.sequestration_direction || 'Stable'}</span>
                                    </p>
                                </div>
                                <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                                    <h4 className="font-bold text-lg text-gray-900 mb-2">Carbon Emissions</h4>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {carbonData.summary?.totals?.total_emissions_tco2e?.toFixed(1) || '0'}
                                    </p>
                                    <p className="text-gray-600">tCO₂e total</p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Trend: <span className="font-medium">{carbonData.summary?.trends?.emission_direction || 'Stable'}</span>
                                    </p>
                                </div>
                                <div className={`rounded-2xl p-6 border-2 ${(carbonData.summary?.totals?.net_carbon_balance || 0) >= 0 ?
                                        'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                                    }`}>
                                    <h4 className="font-bold text-lg text-gray-900 mb-2">Net Carbon Balance</h4>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {carbonData.summary?.totals?.net_carbon_balance?.toFixed(1) || '0'}
                                    </p>
                                    <p className="text-gray-600">tCO₂e</p>
                                    <p className={`text-sm font-medium mt-2 ${(carbonData.summary?.totals?.net_carbon_balance || 0) >= 0 ?
                                            'text-green-700' : 'text-red-700'
                                        }`}>
                                        {(carbonData.summary?.totals?.net_carbon_balance || 0) >= 0 ?
                                            'Carbon Positive' : 'Carbon Negative'}
                                    </p>
                                </div>
                            </div>

                            {/* Emission Breakdown */}
                            {carbonData.summary?.composition && (
                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                                    <h4 className="font-bold text-lg text-gray-900 mb-4">Emission Composition</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                                            <p className="text-sm font-medium text-gray-600 mb-1">Scope 1</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {carbonData.summary.composition.scope1_percentage?.toFixed(1) || '0'}%
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">Direct emissions</p>
                                        </div>
                                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                                            <p className="text-sm font-medium text-gray-600 mb-1">Scope 2</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {carbonData.summary.composition.scope2_percentage?.toFixed(1) || '0'}%
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">Indirect energy</p>
                                        </div>
                                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                                            <p className="text-sm font-medium text-gray-600 mb-1">Scope 3</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {carbonData.summary.composition.scope3_percentage?.toFixed(1) || '0'}%
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">Supply chain</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Intensity Metrics */}
                            {carbonData.yearly_data && carbonData.yearly_data.length > 0 &&
                                carbonData.yearly_data[0].emissions?.intensity_metrics && (
                                    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                                        <h4 className="font-bold text-lg text-gray-900 mb-4">Carbon Intensity Metrics</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="bg-white rounded-xl p-4 border border-blue-200">
                                                <p className="text-sm font-medium text-gray-600 mb-1">Scope 1 Intensity</p>
                                                <p className="text-lg font-bold text-gray-900">
                                                    {carbonData.yearly_data[0].emissions.intensity_metrics.scope1_intensity?.toFixed(1) || '0'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">tCO₂e/ha</p>
                                            </div>
                                            <div className="bg-white rounded-xl p-4 border border-blue-200">
                                                <p className="text-sm font-medium text-gray-600 mb-1">Scope 2 Intensity</p>
                                                <p className="text-lg font-bold text-gray-900">
                                                    {carbonData.yearly_data[0].emissions.intensity_metrics.scope2_intensity?.toFixed(1) || '0'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">tCO₂e/ha</p>
                                            </div>
                                            <div className="bg-white rounded-xl p-4 border border-blue-200">
                                                <p className="text-sm font-medium text-gray-600 mb-1">Scope 3 Intensity</p>
                                                <p className="text-lg font-bold text-gray-900">
                                                    {carbonData.yearly_data[0].emissions.intensity_metrics.scope3_intensity?.toFixed(1) || '0'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">tCO₂e/ha</p>
                                            </div>
                                            <div className="bg-white rounded-xl p-4 border border-blue-200">
                                                <p className="text-sm font-medium text-gray-600 mb-1">Total Intensity</p>
                                                <p className="text-lg font-bold text-gray-900">
                                                    {carbonData.yearly_data[0].emissions.intensity_metrics.total_intensity?.toFixed(1) || '0'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">tCO₂e/ha</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                        </div>
                    )}
                </div>

                {/* Machine Learning Insights */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                    <div
                        className="p-6 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleSection('mlInsights')}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-indigo-100">
                                    <Cpu className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Machine Learning Insights</h3>
                                    <p className="text-gray-600">AI-powered analytics and feature importance</p>
                                </div>
                            </div>
                            {expandedSections.mlInsights ?
                                <ChevronDown className="w-6 h-6 text-gray-400" /> :
                                <ChevronRight className="w-6 h-6 text-gray-400" />
                            }
                        </div>
                    </div>

                    {expandedSections.mlInsights && (
                        <div className="p-6 space-y-6">
                            {/* ML Performance Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-200">
                                    <p className="text-sm font-medium text-gray-600 mb-1">Overall Accuracy</p>
                                    <p className="text-2xl font-bold text-gray-900">{mlAccuracyMetrics.overallAccuracy}%</p>
                                    <p className="text-xs text-gray-500 mt-1">Model performance</p>
                                </div>
                         
                                <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-200">
                                    <p className="text-sm font-medium text-gray-600 mb-1">Data Quality</p>
                                    <p className="text-2xl font-bold text-gray-900">__%</p>
                                    <p className="text-xs text-gray-500 mt-1">Input data score</p>
                                </div>
                                <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-200">
                                    <p className="text-sm font-medium text-gray-600 mb-1">Methodology Rigor</p>
                                    <p className="text-2xl font-bold text-gray-900">__%</p>
                                    <p className="text-xs text-gray-500 mt-1">Process quality</p>
                                </div>
                            </div>

                            {/* Feature Importance */}
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                                <h4 className="font-bold text-lg text-gray-900 mb-4">Feature Importance Analysis</h4>
                                <div className="space-y-3">
                                    {featureImportanceData.map((feature, index) => (
                                        <div key={index} className="bg-white rounded-xl p-4 border border-gray-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900">{feature.feature}</span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${feature.category === 'Satellite' ? 'bg-green-100 text-green-800' :
                                                            feature.category === 'Soil' ? 'bg-amber-100 text-amber-800' :
                                                                feature.category === 'Resource' ? 'bg-blue-100 text-blue-800' :
                                                                    feature.category === 'Climate' ? 'bg-cyan-100 text-cyan-800' :
                                                                        'bg-purple-100 text-purple-800'
                                                        }`}>
                                                        {feature.category}
                                                    </span>
                                                </div>
                                                <span className="text-lg font-bold text-gray-900">__%</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${feature.importance}%`,
                                                        backgroundColor: feature.impact === 'Positive' ? '#22c55e' :
                                                            feature.impact === 'Variable' ? '#eab308' :
                                                                '#3b82f6'
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                <span>Impact: {feature.impact}</span>
                                                <span>Contribution to prediction</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ML Interpretation */}
                            {mlAccuracyMetrics.interpretation && mlAccuracyMetrics.interpretation !== 'N/A' && (
                                <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                                    <h4 className="font-bold text-lg text-gray-900 mb-2">Model Interpretation</h4>
                                    <p className="text-gray-700">{mlAccuracyMetrics.interpretation}</p>
                                </div>
                            )}

                            {/* Improvement Areas */}
                            {mlAccuracyMetrics.improvementAreas && mlAccuracyMetrics.improvementAreas.length > 0 && (
                                <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
                                    <h4 className="font-bold text-lg text-gray-900 mb-2">Improvement Areas</h4>
                                    <ul className="space-y-2">
                                        {mlAccuracyMetrics.improvementAreas.map((area: string, index: number) => (
                                            <li key={index} className="flex items-start gap-2 text-gray-700">
                                                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                                <span>{area}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Peer Benchmarking */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-amber-100">
                                <TargetIcon className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Peer Benchmarking</h3>
                                <p className="text-gray-600">Comparison with industry peers and regional averages</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="text-left p-4 text-sm font-medium text-gray-600">Company</th>
                                        <th className="text-left p-4 text-sm font-medium text-gray-600">Yield (tons/ha)</th>
                                        <th className="text-left p-4 text-sm font-medium text-gray-600">Water Efficiency</th>
                                        <th className="text-left p-4 text-sm font-medium text-gray-600">Carbon Intensity</th>
                                        <th className="text-left p-4 text-sm font-medium text-gray-600">Performance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {peerBenchmarkingData.map((company, index) => (
                                        <tr
                                            key={index}
                                            className={`hover:bg-gray-50 ${company.company === selectedCompany?.name || company.company.includes('Your') ? 'bg-green-50' : ''}`}
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    {company.company === selectedCompany?.name || company.company.includes('Your') ? (
                                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                    ) : (
                                                        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                                                    )}
                                                    <span className="font-medium text-gray-900">{company.company}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900">{company.yield.toFixed(1)}</span>
                                                    <span className="text-sm text-gray-500">tons/ha</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900">{company.efficiency}%</span>
                                                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full"
                                                            style={{
                                                                width: `${company.efficiency}%`,
                                                                backgroundColor: company.efficiency >= 80 ? '#22c55e' :
                                                                    company.efficiency >= 60 ? '#eab308' :
                                                                        '#ef4444'
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="font-medium text-gray-900">{company.carbonIntensity}</span>
                                                <span className="text-sm text-gray-500 ml-1">kg CO₂e/ton</span>
                                            </td>
                                            <td className="p-4">
                                                {company.company === selectedCompany?.name || company.company.includes('Your') ? (
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Your Performance
                                                    </span>
                                                ) : company.yield > peerBenchmarkingData[0].yield ? (
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Above Average
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        Below Average
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

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
                                            Current water efficiency at {predictiveModelData.waterEfficiency}% indicates room for improvement.
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