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
    Trash2,
    Package,
    ShieldAlert,
    DollarSign,
    Flame,
    Cpu,
    Archive,
} from "lucide-react";

// Color Palette (same as EnergyReportsTab)
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

interface WasteReportsTabProps {
    wasteData: any;
    selectedCompany: any;
    formatNumber: (num: number | null) => string;
    formatCurrency: (num: number | null) => string;
    formatPercent: (num: number | null) => string;
    selectedYear: number | null;
    availableYears: number[];
    onMetricClick: (metric: any, modalType: string) => void;
}

const WasteReportsTab: React.FC<WasteReportsTabProps> = ({
    wasteData,
    selectedCompany,
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

    if (!wasteData) {
        return (
            <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl">
                <div className="text-center max-w-md p-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                        <FileText className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">No Waste Reports Available</h3>
                    <p className="text-gray-600">Select a company to view waste management compliance and reporting information.</p>
                </div>
            </div>
        );
    }

    const apiData = wasteData?.data;
    if (!apiData) {
        return (
            <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl">
                <div className="text-center max-w-md p-8">
                    <AlertCircle className="w-12 h-12 mx-auto mb-6 text-amber-500" />
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">Invalid Data Format</h3>
                    <p className="text-gray-600">The waste data format is invalid or corrupted.</p>
                </div>
            </div>
        );
    }

    // Extract data from API response
    const companyInfo = apiData.company;
    const yearData = apiData.year_data;
    const wasteSummary = apiData.waste_summary;
    const performanceIndicators = wasteSummary?.performance_indicators;
    const wasteStreams = apiData.waste_streams;
    const incidentsAndTargets = apiData.incidents_and_targets;
    const circularEconomy = apiData.circular_economy;
    const environmentalMetrics = apiData.environmental_metrics;
    const graphsData = apiData.graphs;
    const recommendations = apiData.recommendations;
    const dataQuality = apiData.data_quality;
    const apiInfo = apiData.api_info;

    // Get reporting year
    const reportingYear = yearData?.requested_year || new Date().getFullYear();

    // Calculate key waste metrics
    const wasteMetrics = {
        // Get waste-related metrics from environmental metrics
        recycledWaste: environmentalMetrics?.metrics?.["Waste Management - Recycled waste (excl. Boiler Ash)"]?.values?.[0]?.numeric_value || 0,
        disposedWaste: environmentalMetrics?.metrics?.["Waste Management - Disposed waste (excl. Boiler Ash)"]?.values?.[0]?.numeric_value || 0,
        environmentIncidents: environmentalMetrics?.metrics?.["Environment Incidents"]?.values?.[0]?.numeric_value || 0,
        generalWaste: environmentalMetrics?.metrics?.["Environment Incidents - Waste streams produced - General Waste"]?.values?.[0]?.numeric_value || 0,
        hazardousWaste: environmentalMetrics?.metrics?.["Environment Incidents - Waste streams produced - Hazardous waste"]?.values?.[0]?.numeric_value || 0,
        boilerAsh: environmentalMetrics?.metrics?.["Environment Incidents - Waste streams produced - Boiler ash"]?.values?.[0]?.numeric_value || 0,
        recyclableWaste: environmentalMetrics?.metrics?.["Environment Incidents - Waste streams produced - Recyclable waste"]?.values?.[0]?.numeric_value || 0,

        // Performance indicators
        recyclingRate: parseFloat(performanceIndicators?.recycling_rate?.value?.toString() || "0"),
        totalWaste: parseFloat(performanceIndicators?.total_waste?.value?.toString() || "0"),
        costSavings: parseFloat(performanceIndicators?.cost_savings?.value?.toString().replace(',', '') || "0"),
        wasteIncidents: performanceIndicators?.waste_incidents?.value || 0,
    };

    // Calculate totals and percentages
    const totalWasteGenerated = wasteMetrics.recycledWaste + wasteMetrics.disposedWaste + wasteMetrics.generalWaste +
        wasteMetrics.hazardousWaste + wasteMetrics.boilerAsh + wasteMetrics.recyclableWaste;

    const wasteDiversionRate = totalWasteGenerated > 0 ?
        ((wasteMetrics.recycledWaste + wasteMetrics.recyclableWaste) / totalWasteGenerated) * 100 : 0;

    const hazardousWastePercentage = totalWasteGenerated > 0 ?
        (wasteMetrics.hazardousWaste / totalWasteGenerated) * 100 : 0;

    const landfillPercentage = totalWasteGenerated > 0 ?
        (wasteMetrics.disposedWaste / totalWasteGenerated) * 100 : 0;

    // Circular economy metrics
    const circularMetrics = {
        materialsRecovered: parseFloat(circularEconomy?.metrics?.materials_recovered?.value?.toString() || "0"),
        wasteToEnergy: parseFloat(circularEconomy?.metrics?.waste_to_energy?.value?.toString() || "0"),
        closedLoopProjects: circularEconomy?.metrics?.closed_loop_projects?.value || 0,
        circularSupplyChain: circularEconomy?.metrics?.circular_supply_chain?.value || "0%",
    };

    // Get ESG frameworks from company
    const esgFrameworks = companyInfo?.esg_reporting_framework || [];

    // Create metadata for technical section
    const metadata = {
        api_version: apiInfo?.version || "1.0",
        calculation_version: apiInfo?.calculation_version || "1.0",
        generated_at: apiInfo?.timestamp || new Date().toISOString(),
        endpoint: apiInfo?.endpoint || "waste-management",
        company_id: companyInfo?.id || companyInfo?._id || "N/A",
        period_requested: reportingYear.toString(),
        data_sources: [
            "Waste management records",
            "Recycling facility reports",
            "Incident tracking systems",
            "Circular economy initiatives"
        ]
    };

    // Key statistics
    const keyStats = {
        years_covered: availableYears.length || 1,
        total_metrics_analyzed: environmentalMetrics?.total_metrics || 0,
        current_year: reportingYear,
        recycling_rate: wasteMetrics.recyclingRate,
        waste_diversion_rate: wasteDiversionRate,
        circular_projects: circularMetrics.closedLoopProjects
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Report Navigation */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Waste Report Sections</h3>
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
                        { id: 'waste-streams', label: 'Waste Streams', icon: <Layers className="w-4 h-4" /> },
                        { id: 'incidents-compliance', label: 'Incidents & Compliance', icon: <ShieldAlert className="w-4 h-4" /> },
                        { id: 'circular-economy', label: 'Circular Economy', icon: <Recycle className="w-4 h-4" /> },
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
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Waste Management Overview</h3>
                                <p className="text-gray-600">Waste management reporting and compliance status</p>
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
                                            <p className="text-lg font-bold text-gray-900">{companyInfo?.name || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Industry</p>
                                            <p className="text-lg font-medium text-gray-800">{companyInfo?.industry || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Country</p>
                                            <p className="text-lg font-medium text-gray-800">{companyInfo?.country || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">ESG Contact</p>
                                            <p className="text-lg font-medium text-gray-800">
                                                {companyInfo?.esg_contact_person ?
                                                    `${companyInfo.esg_contact_person.name} (${companyInfo.esg_contact_person.email})` :
                                                    'Not specified'
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Latest ESG Report</p>
                                            <p className="text-lg font-medium text-gray-800">
                                                {companyInfo?.latest_esg_report_year ? `Year ${companyInfo.latest_esg_report_year}` : 'Not available'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">ESG Data Status</p>
                                            <p className="text-lg font-medium text-gray-800">{companyInfo?.esg_data_status || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                <h4 className="font-bold text-lg text-gray-900 mb-4">Waste Reporting Scope</h4>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Reporting Period</p>
                                        <p className="text-gray-800">{reportingYear}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Data Availability</p>
                                        <p className="text-gray-800">{yearData?.data_available ? 'Available' : 'Limited'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Waste Analysis Scope</p>
                                        <p className="text-gray-800">{companyInfo?.scope || 'Comprehensive waste management and circular economy analysis'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Key Statistics */}
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Key Waste Statistics</h3>
                            <BarChart3 className="w-8 h-8 text-green-600" />
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                <p className="text-sm text-gray-600 mb-2">Total Waste Generated</p>
                                <p className="text-2xl font-bold text-gray-900">{formatNumber(totalWasteGenerated)} tons</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200">
                                <p className="text-sm text-gray-600 mb-2">Recycling Rate</p>
                                <p className="text-2xl font-bold text-green-600">{wasteMetrics.recyclingRate.toFixed(1)}%</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-100 border-2 border-blue-200">
                                <p className="text-sm text-gray-600 mb-2">Waste Diversion Rate</p>
                                <p className="text-2xl font-bold text-blue-600">{wasteDiversionRate.toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Waste Summary Card */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border-2 border-green-200 shadow-xl p-8">
                        <div className="flex items-start gap-6">
                            <div className="p-5 rounded-3xl bg-white shadow-lg">
                                <Trash2 className="w-12 h-12 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Waste Management Summary</h3>
                                <p className="text-gray-700 text-lg mb-4">
                                    {wasteSummary?.overview?.key_message || 'Comprehensive waste management and circular economy analysis completed for the reporting period.'}
                                </p>
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
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Waste Management ESG Reporting Frameworks</h3>
                                <p className="text-gray-600">Frameworks and standards used for waste management ESG reporting</p>
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
                                        <p className="text-gray-700">This company has not specified any ESG reporting frameworks for waste management.</p>
                                    </div>
                                </div>
                            )}

                            {/* Waste Performance Indicators */}
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                <h4 className="font-bold text-lg text-gray-900 mb-4">Waste Management Key Performance Indicators</h4>
                                <div className="space-y-4">
                                    {performanceIndicators && Object.entries(performanceIndicators).map(([key, value], index) => (
                                        <div key={index} className="flex justify-between items-center p-4 bg-white rounded-xl border border-blue-100">
                                            <div className="flex items-center gap-3">
                                                {key === 'recycling_rate' ? <Recycle className="w-5 h-5 text-blue-600" /> :
                                                    key === 'hazardous_waste' ? <ShieldAlert className="w-5 h-5 text-red-600" /> :
                                                        key === 'cost_savings' ? <DollarSign className="w-5 h-5 text-green-600" /> :
                                                            <Trash2 className="w-5 h-5 text-blue-600" />}
                                                <span className="font-medium text-gray-800 capitalize">{key.replace(/_/g, ' ')}</span>
                                            </div>
                                            <span className="font-bold text-gray-900">
                                                {typeof value === 'object' && value.value ?
                                                    (key === 'cost_savings' ? formatCurrency(parseFloat(value.value.toString().replace(',', ''))) :
                                                        key === 'recycling_rate' ? formatPercent(parseFloat(value.value.toString())) :
                                                            formatNumber(parseFloat(value.value.toString())))
                                                    : 'N/A'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Compliance Status */}
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                                <h4 className="font-bold text-lg text-gray-900 mb-4">Compliance & Certification Status</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl">
                                        <div className="p-2 rounded-lg bg-green-100">
                                            <ShieldCheck className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800">Waste Management Compliance</p>
                                            <p className="text-sm text-gray-600">Status: <span className="font-semibold capitalize">{incidentsAndTargets?.compliance_status || 'Compliant'}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl">
                                        <div className="p-2 rounded-lg bg-blue-100">
                                            <Award className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800">Zero Waste Targets</p>
                                            <p className="text-sm text-gray-600">
                                                Progress: {incidentsAndTargets?.zero_waste_targets?.targets?.length || 0} active targets
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Waste Streams Report */}
            {selectedReport === 'waste-streams' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Waste Stream Analysis</h3>
                                <p className="text-gray-600">Detailed breakdown of waste types and management methods</p>
                            </div>
                            <Layers className="w-8 h-8 text-green-600" />
                        </div>

                        {/* Overall Waste Composition */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Overall Waste Composition</h4>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Recycle className="w-6 h-6 text-green-600" />
                                        <h5 className="font-bold text-lg text-gray-900">Recycled Waste</h5>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Total Recycled</span>
                                            <span className="font-bold text-green-600">{formatNumber(wasteMetrics.recycledWaste)} tons</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Percentage of Total</span>
                                            <span className="font-bold text-gray-900">
                                                {totalWasteGenerated > 0 ? ((wasteMetrics.recycledWaste / totalWasteGenerated) * 100).toFixed(1) : 0}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <ShieldAlert className="w-6 h-6 text-red-600" />
                                        <h5 className="font-bold text-lg text-gray-900">Hazardous Waste</h5>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Total Hazardous</span>
                                            <span className="font-bold text-red-600">{formatNumber(wasteMetrics.hazardousWaste)} tons</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Percentage of Total</span>
                                            <span className="font-bold text-gray-900">{hazardousWastePercentage.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Waste Stream Breakdown */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Waste Stream Breakdown</h4>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {wasteStreams?.categories?.map((category: any, index: number) => (
                                    <div key={index} className="p-5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 rounded-lg" style={{ backgroundColor: `${category.color}20` }}>
                                                {category.name === 'Recyclable' ? <Recycle className="w-4 h-4 text-green-600" /> :
                                                    category.name === 'Hazardous' ? <ShieldAlert className="w-4 h-4 text-red-600" /> :
                                                        category.name === 'Ash' ? <Flame className="w-4 h-4 text-orange-600" /> :
                                                            <Package className="w-4 h-4 text-gray-600" />}
                                            </div>
                                            <h5 className="font-bold text-gray-900">{category.name}</h5>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-800">
                                            {formatNumber(category.amount)} <span className="text-sm text-gray-600">{category.unit}</span>
                                        </p>
                                        <p className="text-sm text-gray-600 mt-2">
                                            {wasteStreams.total > 0 ? ((category.amount / wasteStreams.total) * 100).toFixed(1) : 0}% of total
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Waste Disposition */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Waste Disposition Summary</h4>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="p-5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <TrendingUp className="w-5 h-5 text-green-600" />
                                        <h5 className="font-bold text-gray-900">Waste Diversion</h5>
                                    </div>
                                    <p className="text-2xl font-bold text-green-600">{wasteDiversionRate.toFixed(1)}%</p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Diverted from landfill through recycling and recovery
                                    </p>
                                </div>

                                <div className="p-5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Trash2 className="w-5 h-5 text-gray-600" />
                                        <h5 className="font-bold text-gray-900">Landfill Disposal</h5>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-600">{landfillPercentage.toFixed(1)}%</p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Sent to landfill for final disposal
                                    </p>
                                </div>

                                <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                                        <h5 className="font-bold text-gray-900">Environment Incidents</h5>
                                    </div>
                                    <p className="text-2xl font-bold text-amber-600">{wasteMetrics.environmentIncidents}</p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Waste-related environment incidents reported
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Total Waste Summary */}
                        <div className="p-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-2 font-medium">Total Waste Generated</p>
                                    <p className="text-4xl font-bold text-green-700">
                                        {formatNumber(totalWasteGenerated)} <span className="text-lg">tons</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600 mb-2 font-medium">Recycling Rate</p>
                                    <p className="text-4xl font-bold text-gray-700">
                                        {wasteMetrics.recyclingRate.toFixed(1)} <span className="text-lg">%</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Incidents & Compliance Report */}
            {selectedReport === 'incidents-compliance' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Incidents & Compliance Analysis</h3>
                                <p className="text-gray-600">Waste incident tracking, compliance status, and zero waste targets</p>
                            </div>
                            <ShieldAlert className="w-8 h-8 text-green-600" />
                        </div>

                        {/* Incident Overview */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Waste Incident Overview</h4>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
                                    <p className="text-sm text-gray-600 mb-2">Total Incidents</p>
                                    <p className="text-2xl font-bold text-red-600">{incidentsAndTargets?.total_incidents || 0}</p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200">
                                    <p className="text-sm text-gray-600 mb-2">Current Year Incidents</p>
                                    <p className="text-2xl font-bold text-amber-600">{incidentsAndTargets?.current_year_incidents || 0}</p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <p className="text-sm text-gray-600 mb-2">Compliance Status</p>
                                    <p className="text-2xl font-bold text-green-600 capitalize">{incidentsAndTargets?.compliance_status || 'Compliant'}</p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                    <p className="text-sm text-gray-600 mb-2">Average Cost Impact</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {formatCurrency(
                                            incidentsAndTargets?.incidents?.reduce((acc: number, incident: any) =>
                                                acc + (incident.cost_impact || 0), 0) / (incidentsAndTargets?.incidents?.length || 1)
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Incidents */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Recent Waste Incidents</h4>
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                {incidentsAndTargets?.incidents?.slice(0, 10).map((incident: any) => (
                                    <div key={incident.id} className="p-4 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="font-semibold text-gray-900">{incident.type}</p>
                                                <p className="text-sm text-gray-600">{incident.date} • {incident.location}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-xl text-xs font-bold ${incident.severity === 'High'
                                                    ? 'bg-red-100 text-red-700'
                                                    : incident.severity === 'Medium'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-green-100 text-green-700'
                                                }`}>
                                                {incident.severity}
                                            </span>
                                        </div>
                                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-700">Waste Type:</span> {incident.waste_type}
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Quantity:</span> {incident.quantity}
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Cost Impact:</span> {formatCurrency(incident.cost_impact)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Zero Waste Targets */}
                        <div>
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Zero Waste Targets Progress</h4>
                            <div className="space-y-6">
                                {incidentsAndTargets?.zero_waste_targets?.targets?.map((target: any, index: number) => (
                                    <div key={index} className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <h5 className="font-bold text-lg text-gray-900">{target.name}</h5>
                                            <span className={`px-3 py-1 rounded-xl text-xs font-bold ${target.status === 'On Track'
                                                    ? 'bg-green-100 text-green-700'
                                                    : target.status === 'At Risk'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}>
                                                {target.status}
                                            </span>
                                        </div>
                                        <div className="mb-3">
                                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                <span>Progress</span>
                                                <span>{target.current_progress || '0%'}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className="h-3 rounded-full transition-all duration-500"
                                                    style={{
                                                        width: target.current_progress || '0%',
                                                        backgroundColor: target.status === 'On Track'
                                                            ? COLORS.primary
                                                            : target.status === 'At Risk'
                                                                ? COLORS.warning
                                                                : COLORS.danger
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-700">Current: {target.current_value || 'N/A'}</span>
                                            <span className="text-gray-700">Target: {target.target}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Circular Economy Report */}
            {selectedReport === 'circular-economy' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Circular Economy Analysis</h3>
                                <p className="text-gray-600">Materials recovery, waste-to-energy, and closed-loop systems</p>
                            </div>
                            <Recycle className="w-8 h-8 text-green-600" />
                        </div>

                        {/* Circular Economy Metrics */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Circular Economy Metrics</h4>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <p className="text-sm text-gray-600 mb-2">Materials Recovery Rate</p>
                                    <p className="text-2xl font-bold text-green-600">{circularMetrics.materialsRecovered.toFixed(1)}%</p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200">
                                    <p className="text-sm text-gray-600 mb-2">Waste to Energy</p>
                                    <p className="text-2xl font-bold text-yellow-600">{circularMetrics.wasteToEnergy.toFixed(1)}%</p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                    <p className="text-sm text-gray-600 mb-2">Closed Loop Projects</p>
                                    <p className="text-2xl font-bold text-blue-600">{circularMetrics.closedLoopProjects}</p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                                    <p className="text-sm text-gray-600 mb-2">Circular Supply Chain</p>
                                    <p className="text-2xl font-bold text-purple-600">{circularMetrics.circularSupplyChain}</p>
                                </div>
                            </div>
                        </div>

                        {/* Circular Economy Initiatives */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Circular Economy Initiatives</h4>
                            <div className="space-y-4">
                                {circularEconomy?.initiatives?.map((initiative: any, index: number) => (
                                    <div key={index} className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h5 className="font-bold text-lg text-gray-900 mb-2">{initiative.name}</h5>
                                                <p className="text-gray-700">{initiative.impact}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-xl text-xs font-bold ${initiative.status === 'Active'
                                                    ? 'bg-green-100 text-green-700'
                                                    : initiative.status === 'Expanding'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {initiative.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Started: {initiative.started}</span>
                                            <span>Impact: Significant</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Circular Economy Impact */}
                        <div className="p-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Circular Economy Impact Summary</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Total Materials Recovered</span>
                                    <span className="font-bold text-gray-900">{circularMetrics.materialsRecovered.toFixed(1)}% of waste stream</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Energy Generated from Waste</span>
                                    <span className="font-bold text-gray-900">{circularMetrics.wasteToEnergy.toFixed(1)}% conversion rate</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Closed-Loop Systems</span>
                                    <span className="font-bold text-gray-900">{circularMetrics.closedLoopProjects} active projects</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Circular Supply Chain Adoption</span>
                                    <span className="font-bold text-gray-900">{circularMetrics.circularSupplyChain} of suppliers</span>
                                </div>
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
                                        <p className="text-sm text-gray-600 mb-1">Waste Module Version</p>
                                        <p className="text-lg font-bold text-gray-900">1.0</p>
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
                                        <p className="text-sm text-gray-600 mb-2">Waste Stream Data</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            Available
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Circular Economy Data</p>
                                        <p className="text-lg font-bold text-gray-900">
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
                                <h3 className="text-2xl font-bold">Export Waste Management Report</h3>
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
                                        <span>Waste Stream Analysis</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span>Incidents & Compliance</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span>Circular Economy</span>
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
                                        alert(`Exporting Waste Management Report as ${exportFormat.toUpperCase()}`);
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

export default WasteReportsTab;