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
    selectedYear,
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

    // Safe data extraction with null checks
    const company = waterData?.data?.company || {};
    const metadata = waterData?.data?.metadata || {};
    const waterRiskAnalysis = waterData?.data?.water_risk_analysis || {};
    const dataQuality = waterData?.data?.data_quality || {};
    const summary = waterData?.data?.summary || { key_findings: [], recommendations: [] };
    
    // Get environmental metrics safely
    const environmentalMetrics = Array.isArray(waterData?.data?.environmental_metrics) 
        ? waterData.data.environmental_metrics 
        : [];
    
    // Get irrigation efficiency data safely
    const irrigationEfficiencyData = Array.isArray(waterData?.data?.existing_irrigation_efficiency_data) 
        ? waterData.data.existing_irrigation_efficiency_data 
        : [];
    
    // Get active irrigation data (the one with is_active true, or the first)
// Find the record that actually contains metrics
const activeIrrigationData = 
    irrigationEfficiencyData.find(item => item?.is_active === true && item?.metrics?.length > 0) ||
    irrigationEfficiencyData.find(item => item?.metrics?.length > 0) ||
    irrigationEfficiencyData[0];
    // Get metrics from active irrigation data safely
    const irrigationMetrics = activeIrrigationData?.metrics || [];

    // Helper function to find metric value from irrigation metrics for a specific year
    const findMetricValue = (metricName: string, year?: number | null): number | null => {
        if (!Array.isArray(irrigationMetrics)) return null;
        const metric = irrigationMetrics.find(m => m?.metric_name === metricName);
        if (!metric || !Array.isArray(metric.yearly_data) || metric.yearly_data.length === 0) return null;
        
        // If year provided, try to find that year's data
        if (year) {
            const yearStr = year.toString();
            const yearData = metric.yearly_data.find(d => d.year === yearStr);
            return yearData?.value ?? null;
        }
        
        // Otherwise, get the latest
        const sorted = [...metric.yearly_data].sort((a, b) => {
            const yearA = parseInt(a?.year || '0');
            const yearB = parseInt(b?.year || '0');
            return yearB - yearA;
        });
        return sorted[0]?.value ?? null;
    };

    // Get water usage values for selected year (or latest if not selected)
    const irrigationValue = findMetricValue("Total Irrigation Water (million ML)", selectedYear);
    const treatmentValue = findMetricValue("Water Treatment for Chiredzi (million ML)", selectedYear);
    const perHectare = findMetricValue("Water per Hectare (ML/ha)", selectedYear);
    const effluentValue = findMetricValue("Effluent Discharged (thousand ML)", selectedYear);
    const totalValue = waterRiskAnalysis?.total_water_usage ?? null; // may be null

    // Get shortage risk data
    const shortageRisk = waterRiskAnalysis?.shortage_risk || { level: 'unknown', probability: 0, factors: [], mitigation: [] };
    const shortageLevel = shortageRisk?.level || 'unknown';
    const shortageProbability = shortageRisk?.probability || 0;
    const mitigationStrategies = Array.isArray(shortageRisk?.mitigation) ? shortageRisk.mitigation : [];

    // Savings potential
    const savingsPotential = waterRiskAnalysis?.savings_potential || null;
    
    // Get ESG frameworks
    const esgFrameworks = Array.isArray(company?.esg_reporting_framework) 
        ? company.esg_reporting_framework 
        : [];

    // Get area of interest metadata
    const areaOfInterest = company?.area_of_interest_metadata || {};
    const areaName = areaOfInterest?.name || 'Not specified';
    const areaCovered = areaOfInterest?.area_covered || 'Not specified';

    // Get recommendations and key findings safely
    const recommendations = Array.isArray(summary?.recommendations) ? summary.recommendations : [];
    const keyFindings = Array.isArray(summary?.key_findings) ? summary.key_findings : [];

    // Get confidence score
    const confidenceScore = dataQuality?.score || 0;

    // Get data sources safely
    const dataSources = Array.isArray(company?.data_source) ? company.data_source : [];

    // Helper to get risk color
    const getRiskColor = (level: string) => {
        switch (level.toLowerCase()) {
            case 'low': return COLORS.success;
            case 'medium': return COLORS.warning;
            case 'high': return COLORS.danger;
            default: return '#6b7280';
        }
    };

    // Helper to get trend icon (simplified)
    const getTrendIcon = (trend: string) => {
        if (trend.toLowerCase().includes('improving') || trend.toLowerCase().includes('decrease')) {
            return <TrendingDown className="w-4 h-4 text-green-600" />;
        } else if (trend.toLowerCase().includes('declining') || trend.toLowerCase().includes('increase')) {
            return <TrendingUp className="w-4 h-4 text-red-600" />;
        }
        return <Activity className="w-4 h-4 text-yellow-600" />;
    };

    // Safe array iteration helper
    const safeMap = <T, U>(array: T[] | undefined | null, callback: (item: T, index: number) => U): U[] => {
        if (!array || !Array.isArray(array)) return [];
        return array.map(callback);
    };

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
                                            <p className="text-lg font-bold text-gray-900">{company?.name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Industry</p>
                                            <p className="text-lg font-medium text-gray-800">{company?.industry || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Country</p>
                                            <p className="text-lg font-medium text-gray-800">{company?.country || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Purpose</p>
                                            <p className="text-lg font-medium text-gray-800">{company?.purpose || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Scope</p>
                                            <p className="text-lg font-medium text-gray-800">{company?.scope || 'Not specified'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">ESG Contact</p>
                                            <p className="text-lg font-medium text-gray-800">
                                                {company?.esg_contact_person ?
                                                    `${company.esg_contact_person.name} (${company.esg_contact_person.email})` :
                                                    'Not specified'
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Latest ESG Report</p>
                                            <p className="text-lg font-medium text-gray-800">
                                                {company?.latest_esg_report_year ? `Year ${company.latest_esg_report_year}` : 'Not available'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">ESG Data Status</p>
                                            <p className="text-lg font-medium text-gray-800">{company?.esg_data_status || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Data Range</p>
                                            <p className="text-lg font-medium text-gray-800">{company?.data_range || 'Not specified'}</p>
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
                                    {areaOfInterest?.coordinates && Array.isArray(areaOfInterest.coordinates) && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Coordinates</p>
                                            <p className="text-gray-800">{areaOfInterest.coordinates.length} points</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Key Water Statistics - Enhanced with all metrics */}
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Key Water Statistics</h3>
                            <Droplet className="w-8 h-8 text-green-600" />
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Irrigation Water */}
                            <div 
                                className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 cursor-pointer hover:shadow-lg transition-all"
                                onClick={() => onMetricClick({ value: irrigationValue, unit: 'million ML' }, 'Irrigation Water')}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-medium text-gray-600">Irrigation Water</p>
                                    <Droplet className="w-5 h-5 text-green-600" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900 mb-1">
                                    {irrigationValue !== null ? formatNumber(irrigationValue) : '---'}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">million ML</span>
                                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                                        {selectedYear || 'Latest'}
                                    </span>
                                </div>
                            </div>

                            {/* Treatment Water */}
                            <div 
                                className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 cursor-pointer hover:shadow-lg transition-all"
                                onClick={() => onMetricClick({ value: treatmentValue, unit: 'million ML' }, 'Treatment Water')}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-medium text-gray-600">Treatment Water</p>
                                    <Waves className="w-5 h-5 text-blue-600" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900 mb-1">
                                    {treatmentValue !== null ? formatNumber(treatmentValue) : '---'}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">million ML</span>
                                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                        {selectedYear || 'Latest'}
                                    </span>
                                </div>
                            </div>

                            {/* Water per Hectare */}
                            <div 
                                className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 cursor-pointer hover:shadow-lg transition-all"
                                onClick={() => onMetricClick({ value: perHectare, unit: 'ML/ha' }, 'Water per Hectare')}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-medium text-gray-600">Water per Hectare</p>
                                    <Gauge className="w-5 h-5 text-purple-600" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900 mb-1">
                                    {perHectare !== null ? formatNumber(perHectare) : '---'}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">ML/ha</span>
                                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                                        {selectedYear || 'Latest'}
                                    </span>
                                </div>
                            </div>

                            {/* Effluent Discharged */}
                            <div 
                                className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 cursor-pointer hover:shadow-lg transition-all"
                                onClick={() => onMetricClick({ value: effluentValue, unit: 'thousand ML' }, 'Effluent Discharged')}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-medium text-gray-600">Effluent Discharged</p>
                                    <CloudRain className="w-5 h-5 text-amber-600" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900 mb-1">
                                    {effluentValue !== null ? formatNumber(effluentValue) : '---'}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">thousand ML</span>
                                    <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                                        {selectedYear || 'Latest'}
                                    </span>
                                </div>
                            </div>

                            {/* Total Water Usage */}
                            <div 
                                className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 cursor-pointer hover:shadow-lg transition-all"
                                onClick={() => onMetricClick({ value: totalValue, unit: 'million ML' }, 'Total Water Usage')}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-medium text-gray-600">Total Water Usage</p>
                                    <Database className="w-5 h-5 text-green-600" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900 mb-1">
                                    {totalValue !== null ? formatNumber(totalValue) : '---'}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">million ML</span>
                                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                                        {selectedYear || 'Latest'}
                                    </span>
                                </div>
                            </div>

                            {/* Shortage Risk */}
                            <div 
                                className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 cursor-pointer hover:shadow-lg transition-all"
                                onClick={() => onMetricClick(shortageRisk, 'Water Shortage Risk')}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-medium text-gray-600">Shortage Risk</p>
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900 mb-1">
                                    {shortageLevel !== 'unknown' ? shortageLevel.charAt(0).toUpperCase() + shortageLevel.slice(1) : '---'}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                        Probability: {shortageProbability ? formatPercent(shortageProbability * 100) : '---'}
                                    </span>
                                    <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                                        {selectedYear || 'Latest'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Data Quality Summary */}
                        <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-green-600" />
                                    <span className="text-sm font-medium text-gray-700">Data Confidence Score</span>
                                </div>
                                <span className="text-lg font-bold text-gray-900">{confidenceScore}%</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Based on available data sources and validation status.</p>
                        </div>
                    </div>

                    {/* Key Findings and Recommendations (existing) */}
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Findings & Recommendations</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <FileCheck className="w-5 h-5 text-green-600" />
                                    Key Findings
                                </h4>
                                <ul className="space-y-3">
                                    {keyFindings.length > 0 ? (
                                        keyFindings.map((finding, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                <span className="text-gray-700">{finding}</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-gray-500">No key findings available.</li>
                                    )}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-green-600" />
                                    Recommendations
                                </h4>
                                <ul className="space-y-3">
                                    {recommendations.length > 0 ? (
                                        recommendations.map((rec, idx) => {
                                            if (typeof rec === 'string') {
                                                return (
                                                    <li key={idx} className="flex items-start gap-2">
                                                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                                        <span className="text-gray-700">{rec}</span>
                                                    </li>
                                                );
                                            } else {
                                                // rec is an object with category and actions
                                                return (
                                                    <div key={idx} className="space-y-1">
                                                        <p className="font-semibold text-gray-800">{rec.category || 'General'}</p>
                                                        {rec.actions?.map((action: string, i: number) => (
                                                            <li key={i} className="flex items-start gap-2 ml-4">
                                                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                                                <span className="text-gray-700">{action}</span>
                                                            </li>
                                                        ))}
                                                    </div>
                                                );
                                            }
                                        })
                                    ) : (
                                        <li className="text-gray-500">No recommendations available.</li>
                                    )}
                                </ul>
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
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <h4 className="font-bold text-lg text-gray-900 mb-4">Implemented Frameworks</h4>
                                <div className="space-y-3">
                                    {safeMap(esgFrameworks, (framework, index) => (
                                        <div key={index} className="flex items-center gap-3 p-4 rounded-xl bg-white">
                                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                            <span className="font-medium text-gray-800">{framework}</span>
                                        </div>
                                    ))}
                                    {esgFrameworks.length === 0 && (
                                        <div className="text-center p-6">
                                            <p className="text-gray-600">No ESG frameworks defined</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Water ESG Metrics Summary */}
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                <h4 className="font-bold text-lg text-gray-900 mb-4">Water ESG Metrics Overview</h4>
                                <div className="space-y-4">
                                    {environmentalMetrics.length > 0 ? (
                                        environmentalMetrics.slice(0, 5).map((metric, index) => (
                                            <div key={index} className="p-4 bg-white rounded-xl border border-gray-200">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Droplet className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                                    <span className="font-medium text-gray-800">{metric?.metric_name || 'Unknown Metric'}</span>
                                                </div>
                                                {metric?.description && (
                                                    <p className="text-sm text-gray-600">{metric.description}</p>
                                                )}
                                                {metric?.unit && (
                                                    <p className="text-xs text-gray-500 mt-1">Unit: {metric.unit}</p>
                                                )}
                                                {metric?.value && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Value: {metric.value.numeric_value} {metric.unit}
                                                    </p>
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
                                            {irrigationValue ? formatNumber(irrigationValue) : '---'} ML
                                        </p>
                                    </div>
                                    <div className="text-center p-4 bg-white rounded-xl">
                                        <p className="text-sm text-gray-600 mb-2">Treatment Water</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {treatmentValue ? formatNumber(treatmentValue) : '---'} ML
                                        </p>
                                    </div>
                                    <div className="text-center p-4 bg-white rounded-xl">
                                        <p className="text-sm text-gray-600 mb-2">Total Water Usage</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {totalValue ? formatNumber(totalValue) : '---'} ML
                                        </p>
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
                                        ---
                                    </p>
                                    <p className="text-xs text-gray-500">Higher is better</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <p className="text-sm text-gray-600 mb-2">Usage per Hectare</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {perHectare ? formatNumber(perHectare) : '---'} ML/ha
                                    </p>
                                </div>
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                                    <p className="text-sm text-gray-600 mb-2">Industry Benchmark</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        --- ML
                                    </p>
                                </div>
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
                                    <p className="text-sm text-gray-600 mb-2">Savings Potential</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {savingsPotential ? formatNumber(savingsPotential) : '---'} ML
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
                                            {shortageProbability ? formatPercent(shortageProbability * 100) : '---'}
                                        </p>
                                    </div>
                                </div>
                                {mitigationStrategies.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-red-200">
                                        <p className="text-sm font-semibold text-gray-900 mb-2">Mitigation Strategies</p>
                                        <ul className="space-y-2">
                                            {safeMap(mitigationStrategies.slice(0, 3), (strategy, index) => (
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
                                            ---
                                        </p>
                                    </div>
                                    <div className="text-center p-4 bg-white rounded-xl">
                                        <p className="text-sm text-gray-600 mb-2">Implementation Cost</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            ---
                                        </p>
                                    </div>
                                    <div className="text-center p-4 bg-white rounded-xl">
                                        <p className="text-sm text-gray-600 mb-2">ROI Period</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            ---
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
                                        {company?.data_processing_workflow || 'Standard water usage calculation methodology applied.'}
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
                                    {safeMap(dataSources, (source, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <Database className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                            <span className="text-gray-700">{source}</span>
                                        </div>
                                    ))}
                                    {dataSources.length === 0 && (
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
                                    {company?.data_processing_workflow || 'Standard data processing workflow applied for water usage analysis.'}
                                </p>
                            </div>
                        </div>

                        {/* Analytical Layer Metadata */}
                        <div>
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Analytical Layer Metadata</h4>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
                                <p className="text-gray-800">
                                    {company?.analytical_layer_metadata || 'Standard analytical layers applied for water risk assessment.'}
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
                                        <p className="text-lg font-bold text-gray-900">{metadata?.api_version || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                        <p className="text-sm text-gray-600 mb-1">Calculation Version</p>
                                        <p className="text-lg font-bold text-gray-900">N/A</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                                        <p className="text-sm text-gray-600 mb-1">GEE Adapter Version</p>
                                        <p className="text-lg font-bold text-gray-900">N/A</p>
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
                                            {metadata?.generated_at ? new Date(metadata.generated_at).toLocaleString() : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Endpoint</span>
                                        <span className="font-bold text-gray-900">{metadata?.endpoint || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Company ID</span>
                                        <span className="font-bold text-gray-900">{metadata?.company_id || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">Year Requested</span>
                                        <span className="font-bold text-gray-900">{selectedYear || metadata?.year || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Company Data Sources */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Company Data Sources</h4>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                <div className="space-y-2">
                                    {safeMap(dataSources, (source, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                            <span className="text-gray-700">{source}</span>
                                        </div>
                                    ))}
                                    {dataSources.length === 0 && (
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
                                            {confidenceScore ? `${confidenceScore}%` : '---'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Years Available</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {availableYears?.length || 0}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Current Year</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {metadata?.year || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">ESG Data Status</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {company?.esg_data_status || '---'}
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