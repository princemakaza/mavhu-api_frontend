import { useState } from "react";

// Icons (same as soil carbon report)
import {
    FileText,
    Download,
    Printer,
    FileSpreadsheet,
    ShieldCheck,
    CheckCircle,
    AlertCircle,
    Calendar,
    Clock,
    Database,
    FileCheck,
    Eye,
    Info,
    Copy,
    Mail,
    MoreVertical,
    Building,
    MapPin,
    Phone,
    Link,
    DollarSign,
    Leaf,
    Mountain,
    Target,
    Award,
    AlertTriangle,
    X,
    BadgeCheck,
    Shield,
    BarChartHorizontal,
    BookOpen,
    Cpu,
    Server,
    Layers,
    GitBranch,
    Activity,
    Package,
    Droplet,
    Thermometer,
    Wind,
    TrendingUp,
    TrendingDown,
    Cloud,
    Users,
} from "lucide-react";

// Service functions – new crop yield API utilities
import {
    getYieldForecastSummary,
    getRiskAssessmentSummary,
    getConfidenceScoreBreakdown,
    getCompanyInfo,
    getMetadata,
    getSummary,
    getSeasonalAdvisory,
    getReportingPeriod,
    getCropYieldYearlySummary,
    getAllCategorizedMetrics,
    getYearOverYearChanges,
} from "../../../../services/Admin_Service/esg_apis/crop_yield_service";

// Components
import DataTable from "../soil_components/DataTable";

// Enhanced Color Palette – same as soil carbon
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
    purple: '#8b5cf6',
};

interface ReportsTabProps {
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

const ReportsTab = ({
    cropYieldData,
    selectedCompany,
    formatNumber,
    formatCurrency,
    formatPercent,
    getTrendIcon,
    selectedYear,
    availableYears,
    onMetricClick,
}: ReportsTabProps) => {
    const [selectedReport, setSelectedReport] = useState<string>('summary');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');

    // ========================================================================
    // DATA EXTRACTION – using new crop yield service utilities
    // ========================================================================
    const metadata = cropYieldData ? getMetadata(cropYieldData) : null;
    const companyInfo = cropYieldData ? getCompanyInfo(cropYieldData) : null;
    const reportingPeriod = cropYieldData ? getReportingPeriod(cropYieldData) : null;
    const confidenceScore = cropYieldData ? getConfidenceScoreBreakdown(cropYieldData) : null;
    const yieldForecast = cropYieldData ? getYieldForecastSummary(cropYieldData) : null;
    const riskAssessment = cropYieldData ? getRiskAssessmentSummary(cropYieldData) : null;
    const summary = cropYieldData ? getSummary(cropYieldData) : null;
    const seasonalAdvisory = cropYieldData ? getSeasonalAdvisory(cropYieldData) : null;
    const yearlySummary = cropYieldData ? getCropYieldYearlySummary(cropYieldData) : null;
    const yearOverYearChanges = cropYieldData ? getYearOverYearChanges(cropYieldData) : null;
    const allMetrics = cropYieldData ? getAllCategorizedMetrics(cropYieldData) : null;

    // Extract ESG frameworks from company info (string array)
    const esgFrameworks = companyInfo?.esg_reporting_framework || [];

    // Extract data sources from metadata
    const dataSources = metadata?.data_source ? [
        metadata.data_source.original_source,
        metadata.data_source.import_source,
    ].filter(Boolean) : [];

    // ========================================================================
    // PREPARE REPORT DATA (following soil carbon pattern)
    // ========================================================================
    const prepareReportData = () => {
        // Compliance Checklist – based on available data
        const complianceChecklist = [
            {
                requirement: 'ESG Framework Compliance',
                status: esgFrameworks.length > 0 ? 'Completed' : 'Pending',
                date: companyInfo?.latest_esg_report_year?.toString() || 'N/A',
                verifiedBy: companyInfo?.esg_contact_person?.name || 'System',
            },
            {
                requirement: 'Yield Forecast Confidence',
                status: (confidenceScore?.forecast_confidence || 0) > 70 ? 'Completed' : 'In Progress',
                date: metadata?.generated_at ? new Date(metadata.generated_at).toLocaleDateString() : 'N/A',
                verifiedBy: 'Model',
            },
            {
                requirement: 'Risk Assessment Coverage',
                status: (riskAssessment?.detailedRisks?.length || 0) > 0 ? 'Completed' : 'Pending',
                date: reportingPeriod?.current_year?.toString() || 'N/A',
                verifiedBy: 'System',
            },
            {
                requirement: 'Data Quality Check',
                status: (confidenceScore?.overall || 0) > 65 ? 'Completed' : 'In Progress',
                date: metadata?.generated_at ? new Date(metadata.generated_at).toLocaleDateString() : 'N/A',
                verifiedBy: 'System',
            },
        ];

        // Technical Data – calculation factors and yearly summary
        const technicalData = yieldForecast?.calculationFactors ? [
            {
                parameter: 'Base Yield',
                value: yieldForecast.calculationFactors.base_yield,
                unit: yieldForecast.unit,
                description: 'Historical base yield used in forecast',
                source: 'Historical data',
            },
            {
                parameter: 'YoY Trend Available',
                value: yieldForecast.calculationFactors.yoy_trend_available ? 'Yes' : 'No',
                unit: '',
                description: 'Year-over-year trend data availability',
                source: 'System',
            },
            {
                parameter: 'Next Season Forecast',
                value: yieldForecast.nextSeasonForecast?.predicted_yield || 'N/A',
                unit: yieldForecast.unit,
                description: `Predicted yield for ${yieldForecast.nextSeasonForecast?.year}`,
                source: 'Model',
            },
            {
                parameter: 'Forecast Confidence',
                value: `${yieldForecast.confidenceScore}%`,
                unit: '%',
                description: 'Model confidence in current forecast',
                source: 'Machine Learning Model',
            },
        ] : [];

        // Add yearly summary metrics as technical data
        if (yearlySummary) {
            technicalData.push(
                {
                    parameter: 'Total Cane Harvested (Company)',
                    value: yearlySummary.total_cane_harvested_company,
                    unit: 'tons',
                    description: 'Company-owned cane harvest',
                    source: 'Internal',
                },
                {
                    parameter: 'Total Cane Harvested (Private)',
                    value: yearlySummary.total_cane_harvested_private,
                    unit: 'tons',
                    description: 'Private grower cane harvest',
                    source: 'External',
                },
                {
                    parameter: 'Total Sugar Produced',
                    value: yearlySummary.total_sugar_produced_company,
                    unit: 'tons',
                    description: 'Sugar produced by company',
                    source: 'Internal',
                },
                {
                    parameter: 'Company Yield',
                    value: yearlySummary.company_yield,
                    unit: 'tons/ha',
                    description: 'Yield per hectare (company)',
                    source: 'Calculated',
                }
            );
        }

        // Methodology Data – versions, frameworks, data sources
        const methodologyData = {
            selectedYear: selectedYear || reportingPeriod?.current_year || new Date().getFullYear(),
            calculationMethods: Object.keys(allMetrics || {}).length,
            dataSources: dataSources,
            apiVersion: metadata?.api_version || 'N/A',
            calculationVersion: metadata?.calculation_version || 'N/A',
            geeAdapterVersion: metadata?.gee_adapter_version || 'N/A',
            esgFrameworks: esgFrameworks,
            seasonalAdvisory: seasonalAdvisory,
            yearOverYearChanges: yearOverYearChanges || [],
            confidenceScore: confidenceScore?.overall || 0,
        };

        return {
            complianceChecklist,
            technicalData,
            methodologyData,
        };
    };

    const reportData = prepareReportData();

    // ========================================================================
    // TABLE COLUMN CONFIGURATIONS (same style as soil carbon)
    // ========================================================================
    const tableColumns = {
        compliance: [
            { key: 'requirement', header: 'Requirement', className: 'font-semibold' },
            {
                key: 'status',
                header: 'Status',
                accessor: (row: any) => (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        row.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        row.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        row.status === 'Pending' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                        {row.status}
                    </span>
                )
            },
            { key: 'date', header: 'Target Date' },
            { key: 'verifiedBy', header: 'Verified By' },
        ],

        technical: [
            { key: 'parameter', header: 'Parameter', className: 'font-semibold' },
            {
                key: 'value',
                header: 'Value',
                accessor: (row: any) => typeof row.value === 'number' ? formatNumber(row.value) : row.value
            },
            { key: 'unit', header: 'Unit' },
            { key: 'description', header: 'Description' },
            { key: 'source', header: 'Source' },
        ],
    };

    // ========================================================================
    // SUMMARY CARDS (like soil carbon)
    // ========================================================================
    const summaryCards = [
        {
            title: 'Forecasted Yield',
            value: yieldForecast?.forecastedYield ? formatNumber(yieldForecast.forecastedYield) : 'N/A',
            description: `${yieldForecast?.unit || 'tons/ha'} | Season: ${yieldForecast?.season || 'N/A'}`,
            icon: <Package className="w-8 h-8 text-white" />,
            color: 'from-green-500 to-emerald-600',
        },
        {
            title: 'Confidence Score',
            value: confidenceScore?.overall ? `${confidenceScore.overall}%` : 'N/A',
            description: `Forecast: ${confidenceScore?.forecast_confidence || 0}% · Risk: ${confidenceScore?.risk_assessment_confidence || 0}%`,
            icon: <BadgeCheck className="w-8 h-8 text-white" />,
            color: 'from-yellow-500 to-amber-600',
        },
        {
            title: 'Risk Level',
            value: riskAssessment?.riskLevel || 'N/A',
            description: `Overall Score: ${riskAssessment?.overallScore || 0}%`,
            icon: <AlertTriangle className="w-8 h-8 text-white" />,
            color: 'from-blue-500 to-cyan-600',
        },
        {
            title: 'Data Coverage',
            value: reportingPeriod?.data_coverage_score ? `${reportingPeriod.data_coverage_score}%` : 'N/A',
            description: `${reportingPeriod?.data_available_years?.length || 0} years available`,
            icon: <Database className="w-8 h-8 text-white" />,
            color: 'from-purple-500 to-pink-600',
        },
    ];

    // ========================================================================
    // EXPORT HANDLER
    // ========================================================================
    const handleExport = () => {
        console.log(`Exporting in ${exportFormat.toUpperCase()} format...`);
        alert(`${exportFormat.toUpperCase()} export started. Download will begin shortly.`);
        setIsExportModalOpen(false);
    };

    return (
        <div className="space-y-8 pb-8">
            {/* ========== REPORT TYPE NAVIGATION ========== */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Report Sections</h3>
                        <p className="text-gray-600">Navigate through different report categories</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all">
                            <Printer className="w-4 h-4" />
                            Print
                        </button>
                        <button className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2">
                    {[
                        { id: 'summary', label: 'Executive Summary', icon: <FileText className="w-4 h-4" /> },
                        { id: 'methodology', label: 'Methodology & Data', icon: <BookOpen className="w-4 h-4" /> },
                        { id: 'compliance', label: 'Compliance', icon: <ShieldCheck className="w-4 h-4" /> },
                        { id: 'technical', label: 'Technical Data', icon: <Database className="w-4 h-4" /> },
                        { id: 'export', label: 'Export Data', icon: <Download className="w-4 h-4" /> },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setSelectedReport(tab.id);
                                if (tab.id === 'export') setIsExportModalOpen(true);
                            }}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                                selectedReport === tab.id && tab.id !== 'export'
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

            {/* ========== SUMMARY CARDS ========== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryCards.map((card, idx) => (
                    <div
                        key={idx}
                        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.color} p-6 shadow-lg`}
                    >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    {card.icon}
                                </div>
                            </div>
                            <p className="text-white/80 text-sm font-medium mb-1">{card.title}</p>
                            <p className="text-white text-3xl font-bold mb-2">{card.value}</p>
                            <p className="text-white/80 text-xs">{card.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ========== REPORT CONTENT ========== */}

            {/* ---------- Executive Summary ---------- */}
            {selectedReport === 'summary' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">Key Findings</h3>
                                <p className="text-gray-600">Critical insights from the crop yield forecast</p>
                            </div>
                            <FileCheck className="w-8 h-8 text-green-600" />
                        </div>
                        
                        <div className="space-y-4">
                            <div className="p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Yield Forecast Outlook</h4>
                                        <p className="text-gray-700">
                                            {summary?.outlook || 'No outlook available.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Key Strengths</h4>
                                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                                            {summary?.key_strengths?.map((strength, i) => (
                                                <li key={i}>{strength}</li>
                                            )) || <li>No strengths identified</li>}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {summary?.key_concerns && summary.key_concerns.length > 0 && (
                                <div className="p-5 rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-1">Key Concerns</h4>
                                            <ul className="list-disc list-inside text-gray-700 space-y-1">
                                                {summary.key_concerns.map((concern, i) => (
                                                    <li key={i}>{concern}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Seasonal Advisory</h4>
                                        <p className="text-gray-700">
                                            Current season: {seasonalAdvisory?.current_season || 'N/A'} · 
                                            Next season: {seasonalAdvisory?.next_season || 'N/A'}
                                        </p>
                                        <p className="text-gray-600 text-sm mt-1">
                                            Planting: {seasonalAdvisory?.planting_window || 'N/A'} · 
                                            Harvest: {seasonalAdvisory?.harvest_window || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ---------- Methodology & Data ---------- */}
            {selectedReport === 'methodology' && (
                <div className="space-y-8">
                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="p-6 rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-green-100">
                                    <Calendar className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900">Reporting Year</h4>
                                    <p className="text-sm text-gray-600">Selected Analysis Period</p>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-green-600 mb-2">
                                {reportData.methodologyData.selectedYear}
                            </p>
                            <p className="text-sm text-gray-600">
                                Coverage: {reportingPeriod?.data_coverage_score}% · {reportingPeriod?.data_available_years?.length || 0} years
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-blue-100">
                                    <Cpu className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900">Calculation Methods</h4>
                                    <p className="text-sm text-gray-600">Applied methodologies</p>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-blue-600 mb-2">
                                {reportData.methodologyData.calculationMethods}
                            </p>
                            <p className="text-sm text-gray-600">
                                Distinct metric categories
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-purple-100">
                                    <Server className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900">Data Sources</h4>
                                    <p className="text-sm text-gray-600">Information origins</p>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-purple-600 mb-2">
                                {reportData.methodologyData.dataSources.length}
                            </p>
                            <p className="text-sm text-gray-600">
                                Primary and secondary sources
                            </p>
                        </div>
                    </div>

                    {/* Version Information */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">System Versions</h3>
                                <p className="text-gray-600">Software and calculation framework versions</p>
                            </div>
                            <Layers className="w-8 h-8 text-green-600" />
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 rounded-lg bg-gray-200">
                                        <CodeIcon className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <h4 className="font-bold text-gray-900">API Version</h4>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {reportData.methodologyData.apiVersion}
                                </p>
                                <p className="text-sm text-gray-600 mt-2">REST API specification</p>
                            </div>

                            <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 rounded-lg bg-gray-200">
                                        <CalculatorIcon className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <h4 className="font-bold text-gray-900">Calculation Version</h4>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {reportData.methodologyData.calculationVersion}
                                </p>
                                <p className="text-sm text-gray-600 mt-2">Algorithm version</p>
                            </div>

                            <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 rounded-lg bg-gray-200">
                                        <Database className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <h4 className="font-bold text-gray-900">GEE Adapter</h4>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {reportData.methodologyData.geeAdapterVersion}
                                </p>
                                <p className="text-sm text-gray-600 mt-2">Earth Engine integration</p>
                            </div>
                        </div>
                    </div>

                    {/* ESG Frameworks and Seasonal Advisory */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">ESG Reporting Frameworks</h3>
                                    <p className="text-gray-600">Compliance and reporting standards</p>
                                </div>
                                <Shield className="w-6 h-6 text-green-600" />
                            </div>
                            
                            <div className="space-y-4">
                                {reportData.methodologyData.esgFrameworks.length > 0 ? (
                                    reportData.methodologyData.esgFrameworks.map((framework: string, index: number) => (
                                        <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-green-100">
                                                    <FileText className="w-4 h-4 text-green-600" />
                                                </div>
                                                <span className="font-medium text-gray-900">{framework}</span>
                                            </div>
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 rounded-xl bg-gray-50 text-center text-gray-500">
                                        No ESG frameworks configured
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">Seasonal Advisory</h3>
                                    <p className="text-gray-600">Crop calendar and recommendations</p>
                                </div>
                                <SproutIcon className="w-6 h-6 text-green-600" />
                            </div>
                            
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                                    <h4 className="font-bold text-gray-900 mb-2">Current Season</h4>
                                    <p className="text-gray-700">{seasonalAdvisory?.current_season || 'N/A'}</p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Planting: {seasonalAdvisory?.planting_window || 'N/A'} · 
                                        Harvest: {seasonalAdvisory?.harvest_window || 'N/A'}
                                    </p>
                                </div>
                                
                                <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                                    <h4 className="font-bold text-gray-900 mb-2">Recommended Actions</h4>
                                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                                        {seasonalAdvisory?.recommended_actions?.map((action, i) => (
                                            <li key={i}>{action}</li>
                                        )) || <li>No recommendations available</li>}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Year-over-Year Changes */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">Year-over-Year Changes</h3>
                                <p className="text-gray-600">Annual variations in key metrics</p>
                            </div>
                            <ActivityIcon className="w-8 h-8 text-green-600" />
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase">Metric</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase">Period</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase">Change</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase">Numeric Change</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {yearOverYearChanges && yearOverYearChanges.length > 0 ? (
                                        yearOverYearChanges.map((change, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="py-3 px-4 font-medium">{change.metric}</td>
                                                <td className="py-3 px-4">{change.period}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        change.numeric_change > 0 ? 'bg-green-100 text-green-800' :
                                                        change.numeric_change < 0 ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {change.change}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">{change.numeric_change.toFixed(2)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="py-4 px-4 text-center text-gray-500">
                                                No year-over-year data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ---------- Compliance ---------- */}
            {selectedReport === 'compliance' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">Compliance Checklist</h3>
                                <p className="text-gray-600">Track regulatory and framework compliance status</p>
                            </div>
                            <ShieldCheck className="w-8 h-8 text-green-600" />
                        </div>
                        
                        <DataTable
                            columns={tableColumns.compliance}
                            data={reportData.complianceChecklist}
                            onRowClick={(row) => onMetricClick(row, 'compliance')}
                        />
                    </div>
                </div>
            )}

            {/* ---------- Technical Data ---------- */}
            {selectedReport === 'technical' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">Yield & Calculation Factors</h3>
                                <p className="text-gray-600">Technical parameters and yearly summary</p>
                            </div>
                            <Database className="w-8 h-8 text-green-600" />
                        </div>
                        
                        <DataTable
                            columns={tableColumns.technical}
                            data={reportData.technicalData}
                            onRowClick={(row) => onMetricClick(row, 'technical')}
                        />
                    </div>
                </div>
            )}

            {/* ========== EXPORT MODAL ========== */}
            {isExportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsExportModalOpen(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold mb-1">Export Report</h3>
                                    <p className="text-cyan-100">Choose format and options</p>
                                </div>
                                <button 
                                    onClick={() => setIsExportModalOpen(false)}
                                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-8 space-y-8">
                            <div>
                                <h4 className="font-bold text-lg text-gray-900 mb-4">Select Export Format</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <button
                                        onClick={() => setExportFormat('pdf')}
                                        className={`p-6 rounded-2xl border-2 transition-all ${
                                            exportFormat === 'pdf' 
                                                ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <FileText className={`w-10 h-10 mx-auto mb-3 ${exportFormat === 'pdf' ? 'text-green-600' : 'text-gray-400'}`} />
                                        <span className={`font-semibold ${exportFormat === 'pdf' ? 'text-green-700' : 'text-gray-700'}`}>PDF</span>
                                    </button>
                                    <button
                                        onClick={() => setExportFormat('excel')}
                                        className={`p-6 rounded-2xl border-2 transition-all ${
                                            exportFormat === 'excel' 
                                                ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <FileSpreadsheet className={`w-10 h-10 mx-auto mb-3 ${exportFormat === 'excel' ? 'text-green-600' : 'text-gray-400'}`} />
                                        <span className={`font-semibold ${exportFormat === 'excel' ? 'text-green-700' : 'text-gray-700'}`}>Excel</span>
                                    </button>
                                    <button
                                        onClick={() => setExportFormat('csv')}
                                        className={`p-6 rounded-2xl border-2 transition-all ${
                                            exportFormat === 'csv' 
                                                ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <FileText className={`w-10 h-10 mx-auto mb-3 ${exportFormat === 'csv' ? 'text-green-600' : 'text-gray-400'}`} />
                                        <span className={`font-semibold ${exportFormat === 'csv' ? 'text-green-700' : 'text-gray-700'}`}>CSV</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => setIsExportModalOpen(false)}
                                    className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleExport}
                                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                                >
                                    Export Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper icon components (copied from soil carbon)
const CodeIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
);

const CalculatorIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);

const SproutIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l2 2 4-2-2 4 2 2M9 21l-4-4M12 17l4 4" />
    </svg>
);

const ActivityIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

export default ReportsTab;