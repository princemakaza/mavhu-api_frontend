import { useState } from "react";

// Icons
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
    Sprout,
    Shield,
    BarChartHorizontal,
    BookOpen,
    Cpu,
    Server,
    Layers,
    GitBranch,
    Activity,
} from "lucide-react";

// Service functions
import {
    getDataQualityAssessment,
    getMetadata,
    getEmissionFactorsByCategory,
    getCarbonCreditReadiness,
    getCompanyDetails,
    getReportingPeriodDetails,
    getVerificationStatus,
    getCarbonEmissionDetails,
    getEnvironmentalMetricsSummary,
    getRecommendations,
    getConfidenceScoreBreakdown,
    getDashboardIndicators,
    getSoilOrganicCarbonDetails,
    getCarbonStockAnalysisDetails,
    getVegetationHealthDetails,
} from "../../../../services/Admin_Service/esg_apis/soil_carbon_service";

// Components
import DataTable from "../soil_components/DataTable";

// Enhanced Color Palette with Green Theme
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
}

const ReportsTab = ({
    soilHealthData,
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
    const [selectedAuditLog, setSelectedAuditLog] = useState<any>(null);

    // Get data using helper functions
    const dataQualityAssessment = soilHealthData ? getDataQualityAssessment(soilHealthData) : null;
    const metadata = soilHealthData ? getMetadata(soilHealthData) : null;
    const emissionFactors = soilHealthData ? getEmissionFactorsByCategory(soilHealthData) : null;
    const carbonCreditReadiness = soilHealthData ? getCarbonCreditReadiness(soilHealthData) : null;
    const companyDetails = soilHealthData ? getCompanyDetails(soilHealthData) : null;
    const reportingPeriod = soilHealthData ? getReportingPeriodDetails(soilHealthData) : null;
    const verificationStatus = soilHealthData ? getVerificationStatus(soilHealthData) : null;
    const carbonEmissionDetails = soilHealthData ? getCarbonEmissionDetails(soilHealthData) : null;
    const environmentalMetrics = soilHealthData ? getEnvironmentalMetricsSummary(soilHealthData) : null;
    const recommendations = soilHealthData ? getRecommendations(soilHealthData) : null;
    const confidenceScore = soilHealthData ? getConfidenceScoreBreakdown(soilHealthData) : null;
    const dashboardIndicators = soilHealthData ? getDashboardIndicators(soilHealthData) : null;
    const soilOrganicCarbon = soilHealthData ? getSoilOrganicCarbonDetails(soilHealthData) : null;
    const carbonStockAnalysis = soilHealthData ? getCarbonStockAnalysisDetails(soilHealthData) : null;
    const vegetationHealth = soilHealthData ? getVegetationHealthDetails(soilHealthData) : null;

    // Prepare report data
    const prepareReportData = () => {
        // Compliance Checklist Data
        const complianceChecklist = [
            { 
                requirement: 'GHG Protocol Compliance', 
                status: verificationStatus?.status === 'Fully Verified' ? 'Completed' : 'Pending', 
                date: metadata?.generatedAtFormatted || 'N/A', 
                verifiedBy: verificationStatus?.verifiedBy || 'N/A' 
            },
            { 
                requirement: 'ISO 14064-2:2019', 
                status: verificationStatus?.verificationRate && verificationStatus.verificationRate > 50 ? 'In Progress' : 'Pending', 
                date: reportingPeriod?.current_year?.toString() || 'N/A', 
                verifiedBy: 'System' 
            },
            { 
                requirement: 'Verified Carbon Standard (VCS)', 
                status: carbonCreditReadiness?.status === 'Ready' ? 'Completed' : 'Pending', 
                date: metadata?.generatedAtFormatted || 'N/A', 
                verifiedBy: carbonCreditReadiness?.verifiedBy || 'N/A' 
            },
        ];

        // Audit Trail Data
        const auditTrail = [
            { 
                id: 'AUD001', 
                action: 'Data Collection', 
                user: 'System', 
                timestamp: metadata?.generatedAtFormatted || new Date().toLocaleDateString(), 
                status: 'Completed', 
                changes: metadata?.data_sources?.length || 0 
            },
            { 
                id: 'AUD002', 
                action: 'Quality Check', 
                user: 'System', 
                timestamp: metadata?.generatedAtFormatted || new Date().toLocaleDateString(), 
                status: 'Completed', 
                changes: dataQualityAssessment?.gaps_identified?.length || 0 
            },
            { 
                id: 'AUD003', 
                action: 'Report Generation', 
                user: 'System', 
                timestamp: metadata?.generatedAtFormatted || new Date().toLocaleDateString(), 
                status: 'Completed', 
                changes: environmentalMetrics?.totalMetrics || 0 
            },
        ];

        // Emission Factors Table Data
        const emissionFactorsData = emissionFactors?.all?.slice(0, 10).map((factor: any) => ({
            id: factor._id || 'N/A',
            source: factor.source || 'N/A',
            value: factor.emission_factor_value || 0,
            unit: factor.emission_factor_unit || 'N/A',
            gwp: factor.gwp_value || 0,
            gwpSource: factor.gwp_source || 'N/A',
            lastUpdated: factor.last_updated_at || 'N/A',
            isActive: factor.is_active !== undefined ? factor.is_active : false,
        })) || [];

        // Methodology Data
        const methodologyData = {
            selectedYear: selectedYear || metadata?.yearRequested || new Date().getFullYear(),
            calculationMethods: companyDetails.esg_reporting_framework.length || [],
            dataSources: metadata?.data_sources || [],
            apiVersion: metadata?.api_version || 'N/A',
            calculationVersion: metadata?.calculation_version || 'N/A',
            geeAdapterVersion: metadata?.gee_adapter_version || 'N/A',
            esgFrameworks: selectedCompany?.esg_reporting_framework || [],
            carbonFramework: carbonEmissionDetails?.framework || {},
            carbonMethodology: carbonEmissionDetails?.methodology || 'N/A',
            scopeInfo: {
                scope1: carbonEmissionDetails?.currentYearData?.emissions?.scope1_total_tco2e || 0,
                scope2: carbonEmissionDetails?.currentYearData?.emissions?.scope2_total_tco2e || 0,
                scope3: carbonEmissionDetails?.currentYearData?.emissions?.scope3_total_tco2e || 0,
            },
            environmentalMetricsCount: environmentalMetrics?.totalMetrics || 0,
            environmentalCategories: environmentalMetrics?.metrics_by_category || {},
        };

        return {
            complianceChecklist,
            auditTrail,
            emissionFactorsData,
            methodologyData,
        };
    };

    const reportData = prepareReportData();

    // Table columns configuration
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

        emissionFactors: [
            { key: 'source', header: 'Source' },
            { key: 'value', header: 'Value', accessor: (row: any) => formatNumber(row.value) },
            { key: 'unit', header: 'Unit' },
            { key: 'gwp', header: 'GWP', accessor: (row: any) => row.gwp.toFixed(2) },
            { key: 'gwpSource', header: 'GWP Source' },
            { 
                key: 'lastUpdated', 
                header: 'Last Updated', 
                accessor: (row: any) => row.lastUpdated !== 'N/A' ? new Date(row.lastUpdated).toLocaleDateString() : 'N/A'
            },
            { 
                key: 'isActive', 
                header: 'Active', 
                accessor: (row: any) => (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                        row.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        {row.isActive ? 'Active' : 'Inactive'}
                    </span>
                )
            },
        ],
    };

    // Export function
    const handleExport = () => {
        console.log(`Exporting in ${exportFormat.toUpperCase()} format...`);
        alert(`${exportFormat.toUpperCase()} export started. Download will begin shortly.`);
        setIsExportModalOpen(false);
    };

    // Report Summary Cards
    const summaryCards = [
        {
            title: 'Verification Status',
            value: verificationStatus?.status || 'N/A',
            description: `${verificationStatus?.verifiedYears || 0} of ${verificationStatus?.totalYears || 0} years verified`,
            icon: <ShieldCheck className="w-8 h-8 text-white" />,
            color: 'from-green-500 to-emerald-600',
        },
        {
            title: 'Carbon Credit Readiness',
            value: `${carbonCreditReadiness?.requirements_met_percent || 0}%`,
            description: `${carbonCreditReadiness?.requirements_met || 0} of ${carbonCreditReadiness?.total_requirements || 0} requirements met`,
            icon: <Target className="w-8 h-8 text-white" />,
            color: 'from-yellow-500 to-amber-600',
        },
        {
            title: 'Data Quality',
            value: dataQualityAssessment?.confidence_level || 'N/A',
            description: `${dataQualityAssessment?.gaps_identified?.length || 0} gaps identified`,
            icon: <Award className="w-8 h-8 text-white" />,
            color: 'from-blue-500 to-cyan-600',
        },
        {
            title: 'Confidence Score',
            value: confidenceScore?.overallFormatted || 'N/A',
            description: 'Overall data confidence',
            icon: <BadgeCheck className="w-8 h-8 text-white" />,
            color: 'from-purple-500 to-pink-600',
        },
    ];

    return (
        <div className="space-y-8 pb-8">
   
            {/* Report Type Navigation */}
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
                        // { id: 'audit', label: 'Audit Trail', icon: <Clock className="w-4 h-4" /> },
                        { id: 'technical', label: 'Technical Data', icon: <Database className="w-4 h-4" /> },
                        { id: 'export', label: 'Export Data', icon: <Download className="w-4 h-4" /> },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedReport(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                                selectedReport === tab.id
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

            {/* Report Content */}
            {selectedReport === 'summary' && (
                <div className="space-y-8">
                    {/* Key Findings */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">Key Findings</h3>
                                <p className="text-gray-600">Critical insights from the reporting period</p>
                            </div>
                            <FileCheck className="w-8 h-8 text-green-600" />
                        </div>
                        
                        <div className="space-y-4">
                            <div className="p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Emissions Reduction Status</h4>
                                        <p className="text-gray-700">
                                            Carbon emissions: {carbonEmissionDetails?.summary?.net_carbon_balance_tco2e ? 
                                            (carbonEmissionDetails.summary.net_carbon_balance_tco2e < 0 ? 'Carbon Negative' : 'Carbon Positive') : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Soil Carbon Improvement</h4>
                                        <p className="text-gray-700">
                                            Soil organic carbon {soilOrganicCarbon?.annual_change_percent ? 
                                            (soilOrganicCarbon.annual_change_percent > 0 ? 'increased' : 'decreased') : 'changed'} by{' '}
                                            {soilOrganicCarbon?.annual_change_percent ? Math.abs(soilOrganicCarbon.annual_change_percent).toFixed(1) : '0'}% annually
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Verification Status</h4>
                                        <p className="text-gray-700">
                                            {verificationStatus?.status || 'N/A'} verification status for {verificationStatus?.totalYears || 0} years
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Compliance Status</h4>
                                        <p className="text-gray-700">
                                            {carbonCreditReadiness?.requirements_met || 0} of {carbonCreditReadiness?.total_requirements || 0} compliance requirements met
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {selectedReport === 'methodology' && (
                <div className="space-y-8">
                    {/* Methodology Overview Cards */}
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
                                Data analyzed for this reporting period
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
                                {reportData.methodologyData.esgFrameworks.length}
                            </p>
                            <p className="text-sm text-gray-600">
                                Different calculation approaches used
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
                                Primary and secondary data sources
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
                                <p className="text-sm text-gray-600 mt-2">REST API specification version</p>
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
                                <p className="text-sm text-gray-600 mt-2">Algorithm and formula version</p>
                            </div>

                            <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 rounded-lg bg-gray-200">
                                        <Database className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <h4 className="font-bold text-gray-900">GEE Adapter Version</h4>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {reportData.methodologyData.geeAdapterVersion}
                                </p>
                                <p className="text-sm text-gray-600 mt-2">Google Earth Engine integration</p>
                            </div>
                        </div>
                    </div>

                    {/* ESG Frameworks and Methodologies */}
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
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">Carbon Accounting Framework</h3>
                                    <p className="text-gray-600">Emission calculation methodology</p>
                                </div>
                                <GitBranch className="w-6 h-6 text-green-600" />
                            </div>
                            
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                                    <h4 className="font-bold text-gray-900 mb-2">Methodology</h4>
                                    <p className="text-gray-700">{reportData.methodologyData.carbonMethodology}</p>
                                </div>
                                
                                <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                                    <h4 className="font-bold text-gray-900 mb-2">Sequestration Approach</h4>
                                    <p className="text-gray-700">
                                        {reportData.methodologyData.carbonFramework.sequestration_methodology || 'N/A'}
                                    </p>
                                </div>
                                
                                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
                                    <h4 className="font-bold text-gray-900 mb-2">Emission Approach</h4>
                                    <p className="text-gray-700">
                                        {reportData.methodologyData.carbonFramework.emission_methodology || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

              

                    {/* Environmental Metrics Summary */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">Environmental Metrics</h3>
                                <p className="text-gray-600">Tracked sustainability indicators</p>
                            </div>
                            <BarChartHorizontal className="w-8 h-8 text-green-600" />
                        </div>
        
                        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Data Sources</h4>
                            <div className="flex flex-wrap gap-3">
                                {reportData.methodologyData.dataSources.length > 0 ? (
                                    reportData.methodologyData.dataSources.map((source: string, index: number) => (
                                        <span key={index} className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                            {source}
                                        </span>
                                    ))
                                ) : (
                                    <span className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-500 border border-gray-200">
                                        No data sources available
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
{/* 
            {selectedReport === 'audit' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">Audit Trail</h3>
                                <p className="text-gray-600">Complete history of system actions and changes</p>
                            </div>
                            <Clock className="w-8 h-8 text-green-600" />
                        </div>
                        
                        <DataTable
                            columns={tableColumns.audit}
                            data={reportData.auditTrail}
                            onRowClick={(row) => setSelectedAuditLog(row)}
                        />
                    </div>
                </div>
            )} */}

            {selectedReport === 'technical' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">Emission Factors</h3>
                                <p className="text-gray-600">Technical emission factor database</p>
                            </div>
                            <Database className="w-8 h-8 text-green-600" />
                        </div>
                        
                        <DataTable
                            columns={tableColumns.emissionFactors}
                            data={reportData.emissionFactorsData}
                            onRowClick={(row) => onMetricClick(row, 'emissionFactor')}
                        />
                    </div>
                </div>
            )}

            {/* Export Modal */}
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

            {/* Audit Log Details Modal */}
            {selectedAuditLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedAuditLog(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold mb-1">Audit Log Details</h3>
                                    <p className="text-cyan-100">Complete action information</p>
                                </div>
                                <button 
                                    onClick={() => setSelectedAuditLog(null)}
                                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 rounded-xl bg-gray-50">
                                    <p className="text-sm text-gray-600 mb-2 font-medium">Action ID</p>
                                    <p className="font-bold text-lg text-gray-900">{selectedAuditLog.id}</p>
                                </div>
                                <div className="p-5 rounded-xl bg-gray-50">
                                    <p className="text-sm text-gray-600 mb-2 font-medium">Status</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                        selectedAuditLog.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                        selectedAuditLog.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {selectedAuditLog.status}
                                    </span>
                                </div>
                                <div className="p-5 rounded-xl bg-gray-50">
                                    <p className="text-sm text-gray-600 mb-2 font-medium">User</p>
                                    <p className="font-bold text-lg text-gray-900">{selectedAuditLog.user}</p>
                                </div>
                                <div className="p-5 rounded-xl bg-gray-50">
                                    <p className="text-sm text-gray-600 mb-2 font-medium">Timestamp</p>
                                    <p className="font-bold text-lg text-gray-900">{selectedAuditLog.timestamp}</p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => setSelectedAuditLog(null)}
                                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Add missing icon components
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

const ZapIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

export default ReportsTab;