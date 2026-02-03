import React, { useState } from 'react';
import {
    FileText,
    Download,
    ShieldCheck,
    CheckCircle,
    AlertCircle,
    Clock,
    Database,
    BarChart3,
    FileCheck,
    Activity,
    Eye,
    ChevronDown,
    ChevronRight,
    Info,
    X,
    Building,
    MapPin,
    Phone,
    Mail,
    Link,
    AlertTriangle,
    Target,
    Award,
    MoreVertical,
    Printer,
    ClipboardCheck,
    Droplet,
    Waves,
    Gauge,
    CloudRain,
    Factory,
    Users,
    BarChartHorizontal,
    FileSpreadsheet,
    Calculator,
    Zap,
    Layers,
    BookOpen,
    TrendingUp,
    TrendingDown,
    BarChart2,
    Thermometer,
    Wind,
    Sprout,
} from "lucide-react";

// Import types and helper functions from water API
import {
    IrrigationWaterResponse,
    getIrrigationWaterCompany,
    getIrrigationWaterMetadata,
    getWaterUsageAnalysis,
    getEnvironmentalMetricsData,
    getAllEsgMetrics,
    getStakeholderBenefits,
    getIrrigationWaterSummary,
    getConfidenceScore,
    getCurrentIrrigationWaterYear,
    getRecommendations,
    getKeyFindings,
    getNextSteps,
    getWaterUsagePerHectare,
    getWaterUsageBenchmark,
    getWaterEfficiencyScore,
    getWaterSavingsPotential,
    getWaterCostSavings,
    getWaterShortageRisk,
    getWaterShortageRiskLevel,
    getWaterShortageRiskProbability,
    getWaterShortageMitigationStrategies,
    getWaterEfficiencyROIPeriod,
} from '../../../../services/Admin_Service/esg_apis/water_risk_service';

// Color Palette
const COLORS = {
    primary: '#008000',
    primaryDark: '#006400',
    primaryLight: '#10B981',
    secondary: '#B8860B',
    accent: '#22C55E',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    purple: '#8B5CF6',
    waterBlue: '#0D9488',
    waterTeal: '#14B8A6',
};

interface ReportsTabProps {
    waterData: IrrigationWaterResponse | null;
    formatNumber: (num: number) => string;
    formatCurrency: (num: number) => string;
    formatPercent: (num: number) => string;
    selectedYear: number | null;
    availableYears: number[];
    onMetricClick: (metric: any, modalType: string) => void;
}

const ReportsTab: React.FC<ReportsTabProps> = ({
    waterData,
    formatNumber,
    formatCurrency,
    formatPercent,
    availableYears,
    onMetricClick,
}) => {
    const [selectedReport, setSelectedReport] = useState<string>('summary');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    if (!waterData) {
        return (
            <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl">
                <div className="text-center max-w-md p-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                        <FileText className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">No Water Reports Available</h3>
                    <p className="text-gray-600">Select a company to view water compliance and reporting information.</p>
                </div>
            </div>
        );
    }

    // Get data using helper functions
    const company = getIrrigationWaterCompany(waterData);
    const metadata = getIrrigationWaterMetadata(waterData);
    const waterUsageAnalysis = getWaterUsageAnalysis(waterData);
    const environmentalMetrics = getEnvironmentalMetricsData(waterData);
    const allEsgMetrics = getAllEsgMetrics(waterData);
    const stakeholderBenefits = getStakeholderBenefits(waterData);
    const summary = getIrrigationWaterSummary(waterData);
    const confidenceScore = getConfidenceScore(waterData);
    const currentYear = getCurrentIrrigationWaterYear(waterData);

    // Extract specific water data
    const irrigationWater = waterUsageAnalysis?.irrigation_water;
    const treatmentWater = waterUsageAnalysis?.treatment_water;
    const totalWater = waterUsageAnalysis?.total_water_usage;
    const shortageRisk = getWaterShortageRisk(waterData);
    const waterSavings = waterUsageAnalysis?.water_savings_analysis;

    // Get recommendations and next steps
    const recommendations = getRecommendations(waterData);
    const keyFindings = getKeyFindings(waterData);
    const nextSteps = getNextSteps(waterData);

    // Calculate water metrics
    const irrigationValue = irrigationWater?.current_value || 0;
    const treatmentValue = treatmentWater?.current_value || 0;
    const totalValue = totalWater?.current_value || 0;
    const efficiencyScore = getWaterEfficiencyScore(waterData) || 0;
    const savingsPotential = getWaterSavingsPotential(waterData) || 0;
    const costSavings = getWaterCostSavings(waterData) || 0;
    const perHectare = getWaterUsagePerHectare(waterData) || 0;
    const benchmark = getWaterUsageBenchmark(waterData) || 0;
    const shortageLevel = getWaterShortageRiskLevel(waterData) || 'unknown';
    const shortageProbability = getWaterShortageRiskProbability(waterData) || 0;
    const mitigationStrategies = getWaterShortageMitigationStrategies(waterData) || [];
    const roiPeriod = getWaterEfficiencyROIPeriod(waterData) || 0;

    // Get ESG frameworks
    const esgFrameworks = company.esg_reporting_framework || [];

    // Get water-specific ESG metrics
    const waterEsgMetrics = Object.values(allEsgMetrics?.environmental || {}).filter(metric =>
        metric?.name?.toLowerCase().includes('water') ||
        metric?.name?.toLowerCase().includes('irrigation') ||
        metric?.name?.toLowerCase().includes('treatment') ||
        metric?.name?.toLowerCase().includes('effluent')
    );

    // Extract area of interest metadata
    const areaOfInterest = company.area_of_interest_metadata;
    const areaName = areaOfInterest?.name || 'Not specified';
    const areaCovered = areaOfInterest?.area_covered || 'Not specified';

    return (
        <div className="space-y-8 pb-8">
            {/* Report Navigation */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Water Report Sections</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsExportModalOpen(true)}
                            className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                        <button className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50">
                            <Printer className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex gap-3 overflow-x-auto">
                    {[
                        { id: 'summary', label: 'Summary', icon: <FileText className="w-4 h-4" /> },
                        { id: 'esg-frameworks', label: 'ESG Frameworks', icon: <BookOpen className="w-4 h-4" /> },
                        { id: 'water-accounting', label: 'Water Accounting', icon: <Calculator className="w-4 h-4" /> },
                        { id: 'methodology', label: 'Methodology', icon: <Layers className="w-4 h-4" /> },
                        { id: 'technical', label: 'Technical Data', icon: <Database className="w-4 h-4" /> },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedReport(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${selectedReport === tab.id
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Report */}
            {selectedReport === 'summary' && (
                <div className="space-y-8">
                    {/* Company Overview */}
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Company Overview</h3>
                                <p className="text-gray-600">Water management reporting and compliance status</p>
                            </div>
                            <Building className="w-8 h-8 text-green-600" />
                        </div>

                        <div className="space-y-6">
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <h4 className="font-bold text-lg text-gray-900 mb-4">Company Information</h4>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Company Name</p>
                                            <p className="text-lg font-bold text-gray-900">{company.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Industry</p>
                                            <p className="text-lg font-medium text-gray-800">{company.industry}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Country</p>
                                            <p className="text-lg font-medium text-gray-800">{company.country}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Purpose</p>
                                            <p className="text-lg font-medium text-gray-800">{company.purpose || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Scope</p>
                                            <p className="text-lg font-medium text-gray-800">{company.scope || 'Not specified'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">ESG Contact</p>
                                            <p className="text-lg font-medium text-gray-800">
                                                {company.esg_contact_person ?
                                                    `${company.esg_contact_person.name} (${company.esg_contact_person.email})` :
                                                    'Not specified'
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Latest ESG Report</p>
                                            <p className="text-lg font-medium text-gray-800">
                                                {company.latest_esg_report_year ? `Year ${company.latest_esg_report_year}` : 'Not available'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">ESG Data Status</p>
                                            <p className="text-lg font-medium text-gray-800">{company.esg_data_status || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Data Range</p>
                                            <p className="text-lg font-medium text-gray-800">{company.data_range || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                <h4 className="font-bold text-lg text-gray-900 mb-4">Area of Interest</h4>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Area Name</p>
                                        <p className="text-gray-800">{areaName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Area Covered</p>
                                        <p className="text-gray-800">{areaCovered}</p>
                                    </div>
                                    {areaOfInterest?.coordinates && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Coordinates</p>
                                            <p className="text-gray-800">{areaOfInterest.coordinates.length} points</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Key Water Statistics */}
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Key Water Statistics</h3>
                            <Droplet className="w-8 h-8 text-green-600" />
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                <p className="text-sm text-gray-600 mb-2">Total Water Usage</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {totalValue > 0 ? formatNumber(totalValue) : '---'} m³
                                </p>
                            </div>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                <p className="text-sm text-gray-600 mb-2">Water Efficiency</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {efficiencyScore > 0 ? formatPercent(efficiencyScore) : '---'}
                                </p>
                            </div>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                <p className="text-sm text-gray-600 mb-2">Shortage Risk Level</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {shortageLevel !== 'unknown' ? shortageLevel : '---'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ESG Frameworks Report */}
            {selectedReport === 'esg-frameworks' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">ESG Reporting Frameworks</h3>
                                <p className="text-gray-600">Frameworks and standards used for ESG reporting</p>
                            </div>
                            <BookOpen className="w-8 h-8 text-green-600" />
                        </div>

                        <div className="space-y-6">
                            {esgFrameworks.length > 0 ? (
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <h4 className="font-bold text-lg text-gray-900 mb-4">Implemented Frameworks</h4>
                                    <div className="space-y-3">
                                        {esgFrameworks.map((framework, index) => (
                                            <div key={index} className="flex items-center gap-3 p-4 rounded-xl bg-white">
                                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                                <span className="font-medium text-gray-800">{framework}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200">
                                    <div className="text-center">
                                        <BookOpen className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                                        <h4 className="text-lg font-bold text-gray-900 mb-2">No ESG Frameworks Defined</h4>
                                        <p className="text-gray-700">This company has not specified any ESG reporting frameworks.</p>
                                    </div>
                                </div>
                            )}

                            {/* Water ESG Metrics Summary */}
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                <h4 className="font-bold text-lg text-gray-900 mb-4">Water ESG Metrics Overview</h4>
                                <div className="space-y-4">
                                    {waterEsgMetrics.length > 0 ? (
                                        waterEsgMetrics.slice(0, 5).map((metric, index) => (
                                            <div key={index} className="p-4 bg-white rounded-xl border border-gray-200">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Droplet className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                                    <span className="font-medium text-gray-800">{metric.name}</span>
                                                </div>
                                                {metric.description && (
                                                    <p className="text-sm text-gray-600">{metric.description}</p>
                                                )}
                                                {metric.unit && (
                                                    <p className="text-xs text-gray-500 mt-1">Unit: {metric.unit}</p>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center p-6">
                                            <p className="text-gray-600">No water-specific ESG metrics available</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Water Accounting Report */}
            {selectedReport === 'water-accounting' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Water Usage Accounting</h3>
                                <p className="text-gray-600">Detailed water usage analysis and metrics</p>
                            </div>
                            <Calculator className="w-8 h-8 text-green-600" />
                        </div>

                        {/* Overall Water Usage */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Water Usage Breakdown</h4>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="text-center p-4 bg-white rounded-xl">
                                        <p className="text-sm text-gray-600 mb-2">Irrigation Water</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {irrigationValue > 0 ? formatNumber(irrigationValue) : '---'} m³
                                        </p>
                                        <p className="text-xs text-gray-500">{irrigationWater?.trend || '---'}</p>
                                    </div>
                                    <div className="text-center p-4 bg-white rounded-xl">
                                        <p className="text-sm text-gray-600 mb-2">Treatment Water</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {treatmentValue > 0 ? formatNumber(treatmentValue) : '---'} m³
                                        </p>
                                        <p className="text-xs text-gray-500">{treatmentWater?.trend || '---'}</p>
                                    </div>
                                    <div className="text-center p-4 bg-white rounded-xl">
                                        <p className="text-sm text-gray-600 mb-2">Total Water Usage</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {totalValue > 0 ? formatNumber(totalValue) : '---'} m³
                                        </p>
                                        <p className="text-xs text-gray-500">{totalWater?.trend || '---'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Efficiency and Benchmarking */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Efficiency & Benchmarking</h4>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                    <p className="text-sm text-gray-600 mb-2">Water Efficiency Score</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {efficiencyScore > 0 ? formatPercent(efficiencyScore) : '---'}
                                    </p>
                                    <p className="text-xs text-gray-500">Higher is better</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <p className="text-sm text-gray-600 mb-2">Usage per Hectare</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {perHectare > 0 ? formatNumber(perHectare) : '---'} m³/ha
                                    </p>
                                </div>
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                                    <p className="text-sm text-gray-600 mb-2">Industry Benchmark</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {benchmark > 0 ? formatNumber(benchmark) : '---'} m³
                                    </p>
                                </div>
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
                                    <p className="text-sm text-gray-600 mb-2">Savings Potential</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {savingsPotential > 0 ? formatNumber(savingsPotential) : '---'} m³
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Risk Assessment */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Water Shortage Risk Assessment</h4>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Risk Level</p>
                                        <p className={`text-2xl font-bold ${shortageLevel === 'high' ? 'text-red-600' :
                                                shortageLevel === 'medium' ? 'text-yellow-600' :
                                                    shortageLevel === 'low' ? 'text-green-600' :
                                                        'text-gray-600'
                                            }`}>
                                            {shortageLevel !== 'unknown' ? shortageLevel : '---'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Probability</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {shortageProbability > 0 ? formatPercent(shortageProbability * 100) : '---'}
                                        </p>
                                    </div>
                                </div>
                                {mitigationStrategies.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-red-200">
                                        <p className="text-sm font-semibold text-gray-900 mb-2">Mitigation Strategies</p>
                                        <ul className="space-y-2">
                                            {mitigationStrategies.slice(0, 3).map((strategy, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm text-gray-700">{strategy}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Financial Impact */}
                        <div>
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Financial Impact Analysis</h4>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="text-center p-4 bg-white rounded-xl">
                                        <p className="text-sm text-gray-600 mb-2">Cost Savings Potential</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {costSavings > 0 ? formatCurrency(costSavings) : '---'}
                                        </p>
                                    </div>
                                    <div className="text-center p-4 bg-white rounded-xl">
                                        <p className="text-sm text-gray-600 mb-2">Implementation Cost</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {waterSavings?.implementation_cost ? formatCurrency(waterSavings.implementation_cost) : '---'}
                                        </p>
                                    </div>
                                    <div className="text-center p-4 bg-white rounded-xl">
                                        <p className="text-sm text-gray-600 mb-2">ROI Period</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {roiPeriod > 0 ? `${roiPeriod} years` : '---'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Methodology Report */}
            {selectedReport === 'methodology' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Methodology Details</h3>
                                <p className="text-gray-600">Water metrics calculation and data processing workflows</p>
                            </div>
                            <Layers className="w-8 h-8 text-green-600" />
                        </div>

                        {/* Calculation Framework */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Water Calculation Framework</h4>
                            <div className="space-y-4">
                                <div className="p-5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Calculator className="w-5 h-5 text-green-600" />
                                        <h5 className="font-bold text-gray-900">Calculation Approach</h5>
                                    </div>
                                    <p className="text-gray-800 pl-8">
                                        {company.data_processing_workflow || 'Standard water usage calculation methodology applied.'}
                                    </p>
                                </div>

                                <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Droplet className="w-5 h-5 text-blue-600" />
                                        <h5 className="font-bold text-gray-900">Water Efficiency Calculation</h5>
                                    </div>
                                    <p className="text-gray-800 pl-8">
                                        Efficiency calculated based on water input versus agricultural output ratio.
                                    </p>
                                </div>

                                <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                                        <h5 className="font-bold text-gray-900">Risk Assessment Methodology</h5>
                                    </div>
                                    <p className="text-gray-800 pl-8">
                                        Risk assessment based on water availability, quality parameters, and regulatory compliance factors.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Data Sources */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Data Sources</h4>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                <div className="space-y-2">
                                    {metadata.data_sources?.map((source, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <Database className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                            <span className="text-gray-700">{source}</span>
                                        </div>
                                    )) || (
                                            <p className="text-gray-600">No specific data sources defined</p>
                                        )}
                                </div>
                            </div>
                        </div>

                        {/* Data Processing Workflow */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Data Processing Workflow</h4>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                                <p className="text-gray-800">
                                    {company.data_processing_workflow || 'Standard data processing workflow applied for water usage analysis.'}
                                </p>
                            </div>
                        </div>

                        {/* Analytical Layer Metadata */}
                        <div>
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Analytical Layer Metadata</h4>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
                                <p className="text-gray-800">
                                    {company.analytical_layer_metadata || 'Standard analytical layers applied for water risk assessment.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Technical Data Report */}
            {selectedReport === 'technical' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Technical Metadata</h3>
                                <p className="text-gray-600">System information and data processing details</p>
                            </div>
                            <Database className="w-8 h-8 text-green-600" />
                        </div>

                        {/* System Information */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">System Information</h4>
                            <div className="space-y-4">
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                        <p className="text-sm text-gray-600 mb-1">API Version</p>
                                        <p className="text-lg font-bold text-gray-900">{metadata.api_version}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                        <p className="text-sm text-gray-600 mb-1">Calculation Version</p>
                                        <p className="text-lg font-bold text-gray-900">{metadata.calculation_version}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                                        <p className="text-sm text-gray-600 mb-1">GEE Adapter Version</p>
                                        <p className="text-lg font-bold text-gray-900">{metadata.gee_adapter_version}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Data Generation Details */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Data Generation Details</h4>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Generated At</span>
                                        <span className="font-bold text-gray-900">
                                            {new Date(metadata.generated_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Endpoint</span>
                                        <span className="font-bold text-gray-900">{metadata.endpoint}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Company ID</span>
                                        <span className="font-bold text-gray-900">{metadata.company_id}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Year Requested</span>
                                        <span className="font-bold text-gray-900">{metadata.year_requested}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Company Data Sources */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Company Data Sources</h4>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                <div className="space-y-2">
                                    {company.data_source?.map((source, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                            <span className="text-gray-700">{source}</span>
                                        </div>
                                    )) || (
                                            <p className="text-gray-600">No company data sources defined</p>
                                        )}
                                </div>
                            </div>
                        </div>

                        {/* Data Quality */}
                        <div>
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Data Quality</h4>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Confidence Score</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {confidenceScore.overall ? `${confidenceScore.overall}%` : '---'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Years Available</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {availableYears.length}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Current Year</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {currentYear}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">ESG Data Status</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {company.esg_data_status || '---'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        
            {/* Export Modal */}
            {isExportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setIsExportModalOpen(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold">Export Water Report</h3>
                                <button onClick={() => setIsExportModalOpen(false)} className="p-2 rounded-xl bg-white/20 hover:bg-white/30">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <h4 className="font-bold mb-4">Select Format</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { format: 'pdf', icon: <FileText className="w-8 h-8" />, label: 'PDF', description: 'Formatted document' },
                                        { format: 'excel', icon: <FileSpreadsheet className="w-8 h-8" />, label: 'Excel', description: 'Spreadsheet data' },
                                        { format: 'csv', icon: <FileText className="w-8 h-8" />, label: 'CSV', description: 'Raw data export' },
                                    ].map((f) => (
                                        <button
                                            key={f.format}
                                            onClick={() => setExportFormat(f.format as any)}
                                            className={`p-6 rounded-2xl border-2 transition-all text-left ${exportFormat === f.format ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className={`mb-3 ${exportFormat === f.format ? 'text-green-600' : 'text-gray-400'}`}>
                                                {f.icon}
                                            </div>
                                            <p className="font-bold mb-1">{f.label}</p>
                                            <p className="text-sm text-gray-600">{f.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    onClick={() => setIsExportModalOpen(false)}
                                    className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        alert(`Exporting water report as ${exportFormat.toUpperCase()}`);
                                        setIsExportModalOpen(false);
                                    }}
                                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold"
                                >
                                    Export
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsTab;