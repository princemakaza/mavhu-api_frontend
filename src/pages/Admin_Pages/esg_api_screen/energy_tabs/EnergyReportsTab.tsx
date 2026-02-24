import React, { useState } from 'react';

// Icons
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
    Zap,
    Sun,
    Battery,
    Factory,
    Cloud,
    Wind,
    Leaf,
    Users,
    Globe,
    BarChartHorizontal,
    FileSpreadsheet,
    Calculator,
    Layers,
    BookOpen,
    TrendingUp,
    TrendingDown,
    BarChart2,
    Thermometer,
    Recycle,
} from "lucide-react";

// Import types and helper functions from energy consumption service
import type { EnergyConsumptionResponse } from '../../../../services/Admin_Service/esg_apis/energy_consumption_service';
import {
    getEnergyConsumptionSummary,
    getDetailedEnergyMetrics,
    getEnergyMixData,
    getGridOperationsData,
    getEnergyTrends,
    getEnergyKPIs,
    getEnergyCompanyInfo,
} from '../../../../services/Admin_Service/esg_apis/energy_consumption_service';

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
};

interface EnergyReportsTabProps {
    energyData: EnergyConsumptionResponse | null;
    formatNumber: (num: number) => string;
    formatPercent: (num: number) => string;
    selectedYear: number | null;
    availableYears: number[];
    onMetricClick: (metric: any, modalType: string) => void;
}

const EnergyReportsTab: React.FC<EnergyReportsTabProps> = ({
    energyData,
    formatNumber,
    formatPercent,
    availableYears,
    onMetricClick,
}) => {
    const [selectedReport, setSelectedReport] = useState<string>('summary');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    if (!energyData) {
        return (
            <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl">
                <div className="text-center max-w-md p-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                        <FileText className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">No Energy Reports Available</h3>
                    <p className="text-gray-600">Select a company to view energy consumption compliance and reporting information.</p>
                </div>
            </div>
        );
    }

    const data = energyData.data;

    // Get derived data using service functions
    const energySummary = getEnergyConsumptionSummary(data);
    const detailedMetrics = getDetailedEnergyMetrics(data);
    const energyMix = getEnergyMixData(data);
    const gridOps = getGridOperationsData(data);
    const trends = getEnergyTrends(data);
    const kpis = getEnergyKPIs(data);
    const companyInfo = getEnergyCompanyInfo(data);

    // Calculate derived metrics
    const renewablePercentage = parseFloat(energyMix.renewable_sources.percentage) || 0;
    const fossilPercentage = parseFloat(energyMix.fossil_sources.percentage) || 0;
    const totalEnergyGJ = parseFloat(energyMix.total_energy_gj) || 0;
    const renewableEnergyGJ = parseFloat(energyMix.renewable_sources.generation_gj) || 0;
    const fossilEnergyGJ = parseFloat(energyMix.fossil_sources.consumption_gj) || 0;
    const gridSelfSufficiency = gridOps.grid_self_sufficiency_percentage || 0;

    // Carbon emissions from API (if available)
    const netCarbonEmissions = data.carbon_emissions?.emissions?.totals?.net_total_emission_tco2e || 0;
    const carbonIntensity = parseFloat(kpis.carbon_intensity_tco2e_per_gj as any) || 0;

    // Get ESG frameworks from company
    const esgFrameworks = data.company.esg_reporting_framework || [];

    // Create metadata for technical section using versions from API
    const metadata = {
        api_version: data.versions.api,
        calculation_version: data.versions.calculation,
        gee_adapter_version: data.versions.gee_adapter,
        last_updated: data.versions.last_updated,
        endpoint: "energy-renewables",
        company_id: data.company._id,
        period_requested: data.reporting_period.year.toString(),
        data_sources: data.company.data_source || [
            "Energy consumption records",
            "Electricity generation data",
            "Fuel purchase records",
            "Grid operation reports"
        ]
    };

    // Key statistics
    const keyStats = {
        years_covered: availableYears.length || 1,
        total_metrics_analyzed: data.energy_consumption_data?.metrics?.length || 0,
        current_year: data.reporting_period.year,
        renewable_share: renewablePercentage,
        grid_independence: gridSelfSufficiency,
        carbon_emissions: netCarbonEmissions,
        data_quality_score: data.data_quality.completeness_score
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Report Navigation */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Energy Report Sections</h3>
                    <div className="flex gap-2">
                        <button className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50">
                            <Printer className="w-5 h-5" />
                        </button>
                        <button className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex gap-3 overflow-x-auto">
                    {[
                        { id: 'summary', label: 'Summary', icon: <FileText className="w-4 h-4" /> },
                        { id: 'esg-frameworks', label: 'ESG Frameworks', icon: <BookOpen className="w-4 h-4" /> },
                        { id: 'energy-mix', label: 'Energy Mix', icon: <Layers className="w-4 h-4" /> },
                        { id: 'grid-operations', label: 'Grid Operations', icon: <Zap className="w-4 h-4" /> },
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
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Energy Consumption Overview</h3>
                                <p className="text-gray-600">Energy reporting and compliance status</p>
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
                                            <p className="text-lg font-bold text-gray-900">{data.company.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Industry</p>
                                            <p className="text-lg font-medium text-gray-800">{data.company.industry}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Country</p>
                                            <p className="text-lg font-medium text-gray-800">{data.company.country}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">ESG Contact</p>
                                            <p className="text-lg font-medium text-gray-800">
                                                {data.company.esg_contact_person ?
                                                    `${data.company.esg_contact_person.name} (${data.company.esg_contact_person.email})` :
                                                    'Not specified'
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Latest ESG Report</p>
                                            <p className="text-lg font-medium text-gray-800">
                                                {data.company.latest_esg_report_year ? `Year ${data.company.latest_esg_report_year}` : 'Not available'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">ESG Data Status</p>
                                            <p className="text-lg font-medium text-gray-800">{data.company.esg_data_status || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                <h4 className="font-bold text-lg text-gray-900 mb-4">Energy Reporting Scope</h4>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Reporting Period</p>
                                        <p className="text-gray-800">{data.reporting_period.year} ({data.reporting_period.date_range})</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Fiscal Year</p>
                                        <p className="text-gray-800">{data.reporting_period.fiscal_year}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Energy Analysis Scope</p>
                                        <p className="text-gray-800">{data.company.scope || 'Comprehensive energy consumption analysis'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Key Statistics */}
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Key Energy Statistics</h3>
                            <BarChart3 className="w-8 h-8 text-green-600" />
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                <p className="text-sm text-gray-600 mb-2">Total Energy Consumption</p>
                                <p className="text-2xl font-bold text-gray-900">{formatNumber(totalEnergyGJ)} GJ</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200">
                                <p className="text-sm text-gray-600 mb-2">Renewable Share</p>
                                <p className="text-2xl font-bold text-green-600">{renewablePercentage.toFixed(1)}%</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-100 border-2 border-blue-200">
                                <p className="text-sm text-gray-600 mb-2">Grid Self-Sufficiency</p>
                                <p className="text-2xl font-bold text-blue-600">{gridSelfSufficiency.toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Energy Summary Card */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border-2 border-green-200 shadow-xl p-8">
                        <div className="flex items-start gap-6">
                            <div className="p-5 rounded-3xl bg-white shadow-lg">
                                <Zap className="w-12 h-12 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Energy Summary</h3>
                                <p className="text-gray-700 text-lg mb-4">{data.summary.message || 'Comprehensive energy consumption analysis completed for the reporting period.'}</p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setIsExportModalOpen(true)}
                                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all font-bold hover:scale-105 shadow-lg"
                                    >
                                        Export Report
                                    </button>
                                    <button className="px-6 py-3 bg-white border-2 border-green-500 text-green-600 rounded-2xl hover:bg-green-50 transition-all font-bold hover:scale-105 shadow-md">
                                        Share
                                    </button>
                                </div>
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
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Energy ESG Reporting Frameworks</h3>
                                <p className="text-gray-600">Frameworks and standards used for energy ESG reporting</p>
                            </div>
                            <BookOpen className="w-8 h-8 text-green-600" />
                        </div>

                        <div className="space-y-6">
                            {esgFrameworks.length > 0 ? (
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <h4 className="font-bold text-lg text-gray-900 mb-4">Implemented ESG Frameworks</h4>
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
                                        <p className="text-gray-700">This company has not specified any ESG reporting frameworks for energy.</p>
                                    </div>
                                </div>
                            )}

                            {/* Energy KPIs */}
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                <h4 className="font-bold text-lg text-gray-900 mb-4">Energy Key Performance Indicators</h4>
                                <div className="space-y-4">
                                    {Object.entries(kpis).map(([key, value], index) => (
                                        <div key={index} className="flex justify-between items-center p-4 bg-white rounded-xl border border-blue-100">
                                            <div className="flex items-center gap-3">
                                                <Zap className="w-5 h-5 text-blue-600" />
                                                <span className="font-medium text-gray-800">{key.replace(/_/g, ' ')}</span>
                                            </div>
                                            <span className="font-bold text-gray-900">
                                                {typeof value === 'number' ? formatNumber(value) : value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Energy Trends */}
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                                <h4 className="font-bold text-lg text-gray-900 mb-4">Energy Consumption Trends</h4>
                                <div className="space-y-4">
                                    {Object.entries(trends).map(([key, value], index) => (
                                        <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-xl">
                                            <div className="p-2 rounded-lg bg-purple-100">
                                                {key.includes('renewable') ? <Sun className="w-5 h-5 text-purple-600" /> :
                                                    key.includes('efficiency') ? <Zap className="w-5 h-5 text-purple-600" /> :
                                                        key.includes('coal') ? <Factory className="w-5 h-5 text-purple-600" /> :
                                                            key.includes('diesel') ? <Thermometer className="w-5 h-5 text-purple-600" /> :
                                                                <TrendingUp className="w-5 h-5 text-purple-600" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800 capitalize">{key.replace(/_/g, ' ')}</p>
                                                <p className="text-sm text-gray-600">Trend: <span className="font-semibold capitalize">{value}</span></p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Energy Mix Report */}
            {selectedReport === 'energy-mix' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Energy Mix Analysis</h3>
                                <p className="text-gray-600">Detailed breakdown of energy sources and consumption</p>
                            </div>
                            <Layers className="w-8 h-8 text-green-600" />
                        </div>

                        {/* Overall Energy Mix */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Overall Energy Mix</h4>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Sun className="w-6 h-6 text-green-600" />
                                        <h5 className="font-bold text-lg text-gray-900">Renewable Energy</h5>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Percentage</span>
                                            <span className="font-bold text-green-600">{renewablePercentage.toFixed(1)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Total Generation</span>
                                            <span className="font-bold text-gray-900">{formatNumber(renewableEnergyGJ)} GJ</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Factory className="w-6 h-6 text-red-600" />
                                        <h5 className="font-bold text-lg text-gray-900">Fossil Fuels</h5>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Percentage</span>
                                            <span className="font-bold text-red-600">{fossilPercentage.toFixed(1)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Total Consumption</span>
                                            <span className="font-bold text-gray-900">{formatNumber(fossilEnergyGJ)} GJ</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Renewable Breakdown */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Renewable Energy Breakdown</h4>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="p-5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Leaf className="w-5 h-5 text-green-600" />
                                        <h5 className="font-bold text-gray-900">Bagasse</h5>
                                    </div>
                                    <p className="text-2xl font-bold text-green-600">
                                        {parseFloat(energyMix.renewable_sources.breakdown.bagasse).toFixed(1)}%
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        {formatNumber(renewableEnergyGJ * (parseFloat(energyMix.renewable_sources.breakdown.bagasse) / 100))} GJ
                                    </p>
                                </div>

                                <div className="p-5 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Sun className="w-5 h-5 text-yellow-600" />
                                        <h5 className="font-bold text-gray-900">Solar</h5>
                                    </div>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {parseFloat(energyMix.renewable_sources.breakdown.solar).toFixed(1)}%
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        {formatNumber(renewableEnergyGJ * (parseFloat(energyMix.renewable_sources.breakdown.solar) / 100))} GJ
                                    </p>
                                </div>

                                <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Wind className="w-5 h-5 text-blue-600" />
                                        <h5 className="font-bold text-gray-900">Other Renewables</h5>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {parseFloat(energyMix.renewable_sources.breakdown.other_renewables).toFixed(1)}%
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        {formatNumber(renewableEnergyGJ * (parseFloat(energyMix.renewable_sources.breakdown.other_renewables) / 100))} GJ
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Fossil Breakdown */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Fossil Fuel Breakdown</h4>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="p-5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Factory className="w-5 h-5 text-gray-600" />
                                        <h5 className="font-bold text-gray-900">Coal</h5>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-600">
                                        {parseFloat(energyMix.fossil_sources.breakdown.coal).toFixed(1)}%
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        {formatNumber(fossilEnergyGJ * (parseFloat(energyMix.fossil_sources.breakdown.coal) / 100))} GJ
                                    </p>
                                </div>

                                <div className="p-5 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Thermometer className="w-5 h-5 text-red-600" />
                                        <h5 className="font-bold text-gray-900">Diesel</h5>
                                    </div>
                                    <p className="text-2xl font-bold text-red-600">
                                        {parseFloat(energyMix.fossil_sources.breakdown.diesel).toFixed(1)}%
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        {formatNumber(fossilEnergyGJ * (parseFloat(energyMix.fossil_sources.breakdown.diesel) / 100))} GJ
                                    </p>
                                </div>

                                <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Factory className="w-5 h-5 text-amber-600" />
                                        <h5 className="font-bold text-gray-900">Other Fossil</h5>
                                    </div>
                                    <p className="text-2xl font-bold text-amber-600">
                                        {parseFloat(energyMix.fossil_sources.breakdown.other_fossil).toFixed(1)}%
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        {formatNumber(fossilEnergyGJ * (parseFloat(energyMix.fossil_sources.breakdown.other_fossil) / 100))} GJ
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Total Energy */}
                        <div className="p-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-2 font-medium">Total Energy Consumption</p>
                                    <p className="text-4xl font-bold text-green-700">
                                        {formatNumber(totalEnergyGJ)} <span className="text-lg">GJ</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600 mb-2 font-medium">Carbon Emissions</p>
                                    <p className="text-4xl font-bold text-gray-700">
                                        {netCarbonEmissions.toFixed(0)} <span className="text-lg">tCO₂e</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Grid Operations Report */}
            {selectedReport === 'grid-operations' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Grid Operations Analysis</h3>
                                <p className="text-gray-600">Electricity generation, purchase, and export details</p>
                            </div>
                            <Zap className="w-8 h-8 text-green-600" />
                        </div>

                        {/* Grid Operations Metrics */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Grid Operations Metrics</h4>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <p className="text-sm text-gray-600 mb-2">Electricity Generated</p>
                                    <p className="text-2xl font-bold text-green-600">{formatNumber(parseFloat(gridOps.electricity_generated_mwh))} MWh</p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                    <p className="text-sm text-gray-600 mb-2">Electricity Purchased</p>
                                    <p className="text-2xl font-bold text-blue-600">{formatNumber(parseFloat(gridOps.electricity_purchased_mwh))} MWh</p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                                    <p className="text-sm text-gray-600 mb-2">Electricity Exported</p>
                                    <p className="text-2xl font-bold text-purple-600">{formatNumber(parseFloat(gridOps.electricity_exported_mwh))} MWh</p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                    <p className="text-sm text-gray-600 mb-2">Net Grid Import</p>
                                    <p className="text-2xl font-bold text-gray-600">{formatNumber(parseFloat(gridOps.net_grid_import_mwh))} MWh</p>
                                </div>
                            </div>
                        </div>

                        {/* Grid Performance */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Grid Performance Indicators</h4>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Battery className="w-6 h-6 text-blue-600" />
                                        <h5 className="font-bold text-lg text-gray-900">Grid Self-Sufficiency</h5>
                                    </div>
                                    <p className="text-3xl font-bold text-blue-600">{gridSelfSufficiency.toFixed(1)}%</p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Percentage of electricity needs met by self-generation
                                    </p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Zap className="w-6 h-6 text-amber-600" />
                                        <h5 className="font-bold text-lg text-gray-900">Grid Dependency</h5>
                                    </div>
                                    <p className="text-3xl font-bold text-amber-600">{gridOps.grid_dependency}%</p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Dependency on external grid for electricity supply
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Methodology */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Grid Operations Methodology</h4>
                            <p className="text-gray-800">
                                Grid operations data is calculated based on electricity generation records,
                                purchase invoices, and export agreements. Self-sufficiency percentage is
                                calculated as (Electricity Generated / Total Electricity Used) × 100, where
                                Total Electricity Used includes both generated and purchased electricity.
                            </p>
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
                                        <span className="text-gray-700">Last Updated</span>
                                        <span className="font-bold text-gray-900">
                                            {new Date(metadata.last_updated).toLocaleString()}
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
                                        <span className="text-gray-700">Period Requested</span>
                                        <span className="font-bold text-gray-900">{metadata.period_requested}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Data Sources */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Data Sources ({metadata.data_sources.length})</h4>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                <div className="space-y-2">
                                    {metadata.data_sources.map((source, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                            <span className="text-gray-700">{source}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Data Availability */}
                        <div>
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Data Availability</h4>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Total Metrics Analyzed</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {keyStats.total_metrics_analyzed}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Years Covered</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {keyStats.years_covered}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Data Quality Score</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {keyStats.data_quality_score}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Renewable Data</p>
                                        <p className="text-lg font-bold text-green-600">
                                            Available
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
                                <h3 className="text-2xl font-bold">Export Energy Report</h3>
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
                            <div className="pt-4 border-t">
                                <h4 className="font-bold mb-3">Included Sections</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span>Company Overview</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span>Energy Mix Analysis</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span>Grid Operations</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span>Technical Metadata</span>
                                    </div>
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
                                        alert(`Exporting Energy Report as ${exportFormat.toUpperCase()}`);
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

export default EnergyReportsTab;