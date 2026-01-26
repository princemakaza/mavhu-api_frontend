import { useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend as RechartsLegend,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    ComposedChart,
    Area,
} from "recharts";

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
    BarChart3,
    PieChart as PieChartIcon,
    FileCheck,
    TrendingUp,
    TrendingDown,
    Activity,
    Eye,
    Filter,
    Search,
    ChevronDown,
    ChevronRight,
    Info,
    ExternalLink,
    Copy,
    Share2,
    Mail,
    Bell,
    Settings,
    MoreVertical,
    Users,
    Globe,
    Building,
    MapPin,
    Phone,
    Link,
    Hash,
    Percent,
    DollarSign,
    Thermometer,
    Leaf,
    Wind,
    Waves,
    Mountain,
    Target,
    Award,
    AlertTriangle,
    X,
    BadgeCheck,
    ClipboardCheck,
    FileSignature,
    Stamp,
    ScrollText,
    Shield,
    BarChartHorizontal,
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
    getAllESGMetricsSummary,
    getRecommendations,
    getConfidenceScoreBreakdown,
    getDashboardIndicators,
} from "../../../../services/Admin_Service/esg_apis/soil_carbon_service";

// Components
import DataTable from "../soil_components/DataTable";
import GraphDisplay from "../soil_components/GraphDisplay";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

// Enhanced Color Palette with Green Theme
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
    purple: '#8b5cf6',       // Purple-500
    gradient1: '#22c55e',
    gradient2: '#10b981',
    gradient3: '#84cc16',
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
    const [selectedGraph, setSelectedGraph] = useState<any>(null);
    const [selectedReport, setSelectedReport] = useState<string>('summary');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
    const [selectedAuditLog, setSelectedAuditLog] = useState<any>(null);
    const [showReportModal, setShowReportModal] = useState(false);

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
    const allEsgMetrics = soilHealthData ? getAllESGMetricsSummary(soilHealthData) : null;
    const recommendations = soilHealthData ? getRecommendations(soilHealthData) : null;
    const confidenceScore = soilHealthData ? getConfidenceScoreBreakdown(soilHealthData) : null;
    const dashboardIndicators = soilHealthData ? getDashboardIndicators(soilHealthData) : null;

    // Prepare report data
    const prepareReportData = () => {
        // Data Quality Graph Data
        const dataQualityData = [
            { category: 'Completeness', score: dataQualityAssessment?.confidenceLevel === 'High' ? 95 : 
                dataQualityAssessment?.confidenceLevel === 'Medium' ? 75 : 50, color: COLORS.primary },
            { category: 'Verification', score: verificationStatus?.verificationRate || 0, color: COLORS.secondary },
            { category: 'Timeliness', score: 88, color: COLORS.info },
            { category: 'Accuracy', score: 92, color: COLORS.accent },
        ];

        // Carbon Credit Readiness Graph Data
        const readinessData = carbonCreditReadiness ? [
            { requirement: 'Permanence', status: carbonCreditReadiness.requirements_met_percent >= 100 ? 100 : 75, color: COLORS.primary },
            { requirement: 'Monitoring', status: carbonCreditReadiness.requirements_met_percent >= 70 ? 100 : 50, color: COLORS.secondary },
            { requirement: 'Verification', status: verificationStatus?.verificationRate || 0, color: COLORS.info },
            { requirement: 'Additionality', status: 65, color: COLORS.purple },
            { requirement: 'Leakage', status: 80, color: COLORS.accent },
        ] : [];

        // Compliance Checklist Data
        const complianceChecklist = [
            { requirement: 'GHG Protocol Compliance', status: 'Completed', date: '2024-01-15', verifiedBy: 'Audit Team A' },
            { requirement: 'ISO 14064-2:2019', status: 'In Progress', date: '2024-02-28', verifiedBy: 'Internal Audit' },
            { requirement: 'Verified Carbon Standard (VCS)', status: 'Pending', date: '2024-03-15', verifiedBy: 'TBD' },
            { requirement: 'Gold Standard', status: 'Not Started', date: '2024-04-30', verifiedBy: 'TBD' },
            { requirement: 'Climate Action Reserve', status: 'Completed', date: '2023-12-10', verifiedBy: 'External Auditor' },
        ];

        // Audit Trail Data
        const auditTrail = [
            { id: 'AUD001', action: 'Data Collection', user: 'John Doe', timestamp: '2024-01-15 10:30:00', status: 'Completed', changes: 42 },
            { id: 'AUD002', action: 'Quality Check', user: 'Jane Smith', timestamp: '2024-01-16 14:20:00', status: 'Completed', changes: 8 },
            { id: 'AUD003', action: 'Verification', user: 'Bob Wilson', timestamp: '2024-01-18 09:15:00', status: 'Completed', changes: 3 },
            { id: 'AUD004', action: 'Report Generation', user: 'Alice Brown', timestamp: '2024-01-19 16:45:00', status: 'In Progress', changes: 12 },
            { id: 'AUD005', action: 'Review', user: 'Charlie Davis', timestamp: '2024-01-20 11:10:00', status: 'Pending', changes: 0 },
        ];

        // Verification History
        const verificationHistory = carbonEmissionDetails?.yearlyData?.map((year: any) => ({
            year: year.year,
            verificationStatus: year.data_quality.verification_status,
            verifiedBy: year.data_quality.verified_by || 'N/A',
            verifiedAt: year.data_quality.verified_at || 'N/A',
            completenessScore: year.data_quality.completeness_score,
            notes: year.data_quality.verification_notes || 'No notes',
        })) || [];

        // Emission Factors Table Data
        const emissionFactorsData = emissionFactors?.all?.slice(0, 10).map((factor: any) => ({
            id: factor._id,
            source: factor.source,
            value: factor.emission_factor_value,
            unit: factor.emission_factor_unit,
            gwp: factor.gwp_value,
            gwpSource: factor.gwp_source,
            lastUpdated: factor.last_updated_at,
            isActive: factor.is_active,
        })) || [];

        return {
            dataQualityData,
            readinessData,
            complianceChecklist,
            auditTrail,
            verificationHistory,
            emissionFactorsData,
        };
    };

    const reportData = prepareReportData();

    // Report Graphs
    const reportGraphs = [
        {
            id: 'data-quality-dashboard',
            title: 'Data Quality Dashboard',
            description: 'Overall data quality metrics and compliance scores',
            type: 'bar',
            data: reportData.dataQualityData,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.dataQualityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="category" stroke="#6b7280" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
                        <RechartsTooltip
                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                            formatter={(value: any) => `${value}%`}
                        />
                        <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                            {reportData.dataQualityData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                        <Line type="monotone" dataKey="score" stroke="#374151" strokeWidth={2} dot={false} />
                    </BarChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'carbon-credit-readiness',
            title: 'Carbon Credit Readiness',
            description: 'Progress towards carbon credit eligibility requirements',
            type: 'composed',
            data: reportData.readinessData,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={reportData.readinessData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="requirement" stroke="#6b7280" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} label={{ value: 'Progress (%)', angle: -90, position: 'insideLeft' }} />
                        <RechartsTooltip
                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                            formatter={(value: any) => `${value}%`}
                        />
                        <Bar dataKey="status" radius={[8, 8, 0, 0]} barSize={40}>
                            {reportData.readinessData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                        <Area type="monotone" dataKey="status" fill={COLORS.primary} fillOpacity={0.1} stroke={COLORS.primary} strokeWidth={2} />
                    </ComposedChart>
                </ResponsiveContainer>
            )
        },
    ];

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
            {
                key: 'actions',
                header: 'Actions',
                accessor: (row: any) => (
                    <div className="flex space-x-2">
                        <button className="p-1 text-blue-600 hover:text-blue-800">
                            <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-green-600 hover:text-green-800">
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                )
            },
        ],
        audit: [
            { key: 'id', header: 'ID' },
            { key: 'action', header: 'Action' },
            { key: 'user', header: 'User' },
            { key: 'timestamp', header: 'Timestamp' },
            { 
                key: 'status', 
                header: 'Status', 
                accessor: (row: any) => (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                        row.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        row.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                        {row.status}
                    </span>
                )
            },
            { key: 'changes', header: 'Changes' },
            {
                key: 'view',
                header: '',
                accessor: (row: any) => (
                    <button 
                        onClick={() => setSelectedAuditLog(row)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                        View Details
                    </button>
                )
            },
        ],
        verification: [
            { key: 'year', header: 'Year' },
            { 
                key: 'verificationStatus', 
                header: 'Status', 
                accessor: (row: any) => (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                        row.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                        row.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                        {row.verificationStatus}
                    </span>
                )
            },
            { key: 'verifiedBy', header: 'Verified By' },
            { key: 'verifiedAt', header: 'Verified At' },
            { 
                key: 'completenessScore', 
                header: 'Completeness', 
                accessor: (row: any) => (
                    <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                                className="h-full rounded-full bg-green-500"
                                style={{ width: `${row.completenessScore}%` }}
                            ></div>
                        </div>
                        <span className="text-sm">{row.completenessScore}%</span>
                    </div>
                )
            },
            { key: 'notes', header: 'Notes', className: 'max-w-xs truncate' },
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
                accessor: (row: any) => new Date(row.lastUpdated).toLocaleDateString() 
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

    // Report generation function
    const generateReport = (type: string) => {
        console.log(`Generating ${type} report...`);
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} report generation started. You will be notified when ready.`);
    };

    // Export function
    const handleExport = () => {
        console.log(`Exporting in ${exportFormat.toUpperCase()} format...`);
        alert(`${exportFormat.toUpperCase()} export started. Download will begin shortly.`);
        setIsExportModalOpen(false);
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Hero Section with Report Overview */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 p-8 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Reports & Compliance</h2>
                            <p className="text-cyan-100 text-lg">Comprehensive documentation and audit trails</p>
                        </div>
                        <button 
                            onClick={() => setIsExportModalOpen(true)}
                            className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
                        >
                            <Download className="w-5 h-5" />
                            Export Report
                        </button>
                    </div>

                    {/* Report Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 hover:bg-white/20 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white/20">
                                    <ShieldCheck className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xs font-medium px-3 py-1 bg-green-400 text-green-900 rounded-full">
                                    {verificationStatus?.verificationRate?.toFixed(0) || 0}%
                                </span>
                            </div>
                            <h3 className="text-4xl font-bold mb-2">{verificationStatus?.verifiedYears || 0}</h3>
                            <p className="text-cyan-100">Verified Years</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 hover:bg-white/20 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white/20">
                                    <Target className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xs font-medium px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full">
                                    {carbonCreditReadiness?.requirements_met_percent || 0}%
                                </span>
                            </div>
                            <h3 className="text-4xl font-bold mb-2">
                                {carbonCreditReadiness?.requirements_met || 0}/{carbonCreditReadiness?.total_requirements || 0}
                            </h3>
                            <p className="text-cyan-100">Credit Readiness</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 hover:bg-white/20 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white/20">
                                    <ClipboardCheck className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xs font-medium px-3 py-1 bg-blue-400 text-blue-900 rounded-full">
                                    Active
                                </span>
                            </div>
                            <h3 className="text-4xl font-bold mb-2">
                                {reportData.complianceChecklist.filter((c: any) => c.status === 'Completed').length}
                            </h3>
                            <p className="text-cyan-100">Completed Audits</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 hover:bg-white/20 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white/20">
                                    <Award className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xs font-medium px-3 py-1 bg-purple-400 text-purple-900 rounded-full">
                                    {dataQualityAssessment?.confidence_level || 'Medium'}
                                </span>
                            </div>
                            <h3 className="text-4xl font-bold mb-2">
                                {confidenceScore?.overall || 0}%
                            </h3>
                            <p className="text-cyan-100">Data Quality</p>
                        </div>
                    </div>
                </div>
            </div>

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
                        { id: 'compliance', label: 'Compliance', icon: <ShieldCheck className="w-4 h-4" /> },
                        { id: 'audit', label: 'Audit Trail', icon: <Clock className="w-4 h-4" /> },
                        { id: 'verification', label: 'Verification', icon: <FileCheck className="w-4 h-4" /> },
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
                    {/* Report Graphs */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <GraphDisplay
                            title="Data Quality Dashboard"
                            description="Overall data quality metrics and compliance scores"
                            icon={<BarChart3 className="w-5 h-5 text-green-600" />}
                            onClick={() => setSelectedGraph(reportGraphs[0])}
                        >
                            {reportGraphs[0].component}
                        </GraphDisplay>

                        <GraphDisplay
                            title="Carbon Credit Readiness"
                            description="Progress towards carbon credit eligibility requirements"
                            icon={<PieChartIcon className="w-5 h-5 text-green-600" />}
                            onClick={() => setSelectedGraph(reportGraphs[1])}
                        >
                            {reportGraphs[1].component}
                        </GraphDisplay>
                    </div>

                    {/* Executive Summary Cards */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="group p-6 rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:border-green-300 transition-all">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-xl bg-green-100 group-hover:bg-green-200 transition-colors">
                                    <ShieldCheck className="w-6 h-6 text-green-600" />
                                </div>
                                <h4 className="font-bold text-lg text-gray-900">Verification Status</h4>
                            </div>
                            <p className="text-3xl font-bold mb-2 text-green-600">
                                {verificationStatus?.status || 'Not Verified'}
                            </p>
                            <p className="text-sm text-gray-600">
                                {verificationStatus?.verifiedYears || 0} of {verificationStatus?.totalYears || 0} years verified
                            </p>
                        </div>

                        <div className="group p-6 rounded-2xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 hover:border-yellow-300 transition-all">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-xl bg-yellow-100 group-hover:bg-yellow-200 transition-colors">
                                    <Target className="w-6 h-6 text-yellow-600" />
                                </div>
                                <h4 className="font-bold text-lg text-gray-900">Carbon Credit Readiness</h4>
                            </div>
                            <p className="text-3xl font-bold mb-2 text-yellow-600">
                                {carbonCreditReadiness?.requirements_met_percent || 0}%
                            </p>
                            <p className="text-sm text-gray-600">
                                {carbonCreditReadiness?.requirements_met || 0} of {carbonCreditReadiness?.total_requirements || 0} requirements met
                            </p>
                        </div>

                        <div className="group p-6 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 hover:border-blue-300 transition-all">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
                                    <Award className="w-6 h-6 text-blue-600" />
                                </div>
                                <h4 className="font-bold text-lg text-gray-900">Data Quality</h4>
                            </div>
                            <p className="text-3xl font-bold mb-2 text-blue-600">
                                {dataQualityAssessment?.confidence_level || 'Medium'}
                            </p>
                            <p className="text-sm text-gray-600">
                                {dataQualityAssessment?.gaps_identified?.length || 0} gaps identified
                            </p>
                        </div>
                    </div>

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
                                        <h4 className="font-semibold text-gray-900 mb-1">Emissions Reduction Achievement</h4>
                                        <p className="text-gray-700">Carbon emissions reduced by 15% compared to baseline year</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Soil Carbon Improvement</h4>
                                        <p className="text-gray-700">Soil organic carbon increased by 8.2% annually</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Pending Verification</h4>
                                        <p className="text-gray-700">Verification process for 2023 data is pending completion</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Compliance Status</h4>
                                        <p className="text-gray-700">All mandatory compliance requirements have been met</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Company Information */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">Company Information</h3>
                                <p className="text-gray-600">Organization details and contact information</p>
                            </div>
                            <Building className="w-8 h-8 text-green-600" />
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-5">
                                <h4 className="font-bold text-lg text-gray-900 mb-4">Basic Information</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 rounded-xl bg-gray-50">
                                        <span className="text-gray-600 font-medium">Company Name</span>
                                        <span className="font-semibold text-gray-900">{selectedCompany?.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 rounded-xl bg-gray-50">
                                        <span className="text-gray-600 font-medium">Industry</span>
                                        <span className="font-semibold text-gray-900">{selectedCompany?.industry}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 rounded-xl bg-gray-50">
                                        <span className="text-gray-600 font-medium">Registration Number</span>
                                        <span className="font-semibold text-gray-900">{selectedCompany?.registrationNumber}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <h4 className="font-bold text-lg text-gray-900 mb-4">Contact Information</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                                        <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-700">{selectedCompany?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                                        <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-700">{selectedCompany?.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                                        <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-700">{selectedCompany?.address}</span>
                                    </div>
                                    {selectedCompany?.website && (
                                        <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                                            <Link className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                            <a href={selectedCompany.website} className="text-blue-600 hover:underline">
                                                {selectedCompany.website}
                                            </a>
                                        </div>
                                    )}
                                </div>
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

                        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <h4 className="font-bold text-lg text-gray-900 mb-6">Compliance Status Summary</h4>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="text-center p-5 rounded-xl bg-white shadow-sm">
                                    <div className="text-4xl font-bold text-green-600 mb-2">2</div>
                                    <div className="text-sm text-gray-600 font-medium">Completed</div>
                                </div>
                                <div className="text-center p-5 rounded-xl bg-white shadow-sm">
                                    <div className="text-4xl font-bold text-yellow-600 mb-2">1</div>
                                    <div className="text-sm text-gray-600 font-medium">In Progress</div>
                                </div>
                                <div className="text-center p-5 rounded-xl bg-white shadow-sm">
                                    <div className="text-4xl font-bold text-gray-600 mb-2">2</div>
                                    <div className="text-sm text-gray-600 font-medium">Pending</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">Reporting Frameworks</h3>
                            <p className="text-gray-600">Active compliance frameworks and standards</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {selectedCompany?.reportingFrameworks?.map((framework: string, index: number) => (
                                <div key={index} className="group p-6 rounded-2xl border-2 border-gray-200 hover:border-green-300 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 transition-all">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 rounded-xl bg-gray-100 group-hover:bg-green-100 transition-colors">
                                            <FileText className="w-5 h-5 text-green-600" />
                                        </div>
                                        <h4 className="font-bold text-gray-900">{framework}</h4>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Status: <span className="font-medium text-green-600">Active</span></span>
                                        <span className="text-gray-500">2024-01-15</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

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

                        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900 mb-1">Audit Summary</h4>
                                    <p className="text-sm text-gray-600">65 actions logged, 42 changes detected</p>
                                </div>
                                <button className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium flex items-center gap-2">
                                    <Download className="w-4 h-4" />
                                    Download Audit Log
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">Recent Activities</h3>
                            <p className="text-gray-600">Latest system actions and updates</p>
                        </div>
                        <div className="space-y-4">
                            {reportData.auditTrail.slice(0, 3).map((log: any, index: number) => (
                                <div key={index} className="flex items-start gap-4 p-6 rounded-2xl border-2 border-gray-200 hover:border-green-300 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 transition-all">
                                    <div className="p-3 rounded-xl bg-gray-100">
                                        <Activity className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-bold text-lg text-gray-900">{log.action}</h4>
                                            <span className="text-sm text-gray-500">{log.timestamp}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">By {log.user} • {log.changes} changes made</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                            log.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                            log.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {log.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {selectedReport === 'verification' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">Verification History</h3>
                                <p className="text-gray-600">Complete verification records and status</p>
                            </div>
                            <FileCheck className="w-8 h-8 text-green-600" />
                        </div>
                        
                        <DataTable
                            columns={tableColumns.verification}
                            data={reportData.verificationHistory}
                            onRowClick={(row) => onMetricClick(row, 'verification')}
                        />

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                                <div className="text-4xl font-bold mb-2 text-green-600">
                                    {verificationStatus?.verificationRate?.toFixed(1) || 0}%
                                </div>
                                <div className="text-sm text-gray-600 font-medium">Verification Rate</div>
                            </div>
                            <div className="p-6 rounded-2xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50">
                                <div className="text-4xl font-bold mb-2 text-yellow-600">
                                    {verificationStatus?.verifiedYears || 0}
                                </div>
                                <div className="text-sm text-gray-600 font-medium">Verified Years</div>
                            </div>
                            <div className="p-6 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                                <div className="text-4xl font-bold mb-2 text-blue-600">
                                    {verificationStatus?.totalYears || 0}
                                </div>
                                <div className="text-sm text-gray-600 font-medium">Total Years</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">Verification Details</h3>
                            <p className="text-gray-600">Process and methodology information</p>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-bold text-lg text-gray-900 mb-4">Verification Process</h4>
                                <p className="text-gray-600 leading-relaxed mb-6">
                                    All data undergoes a rigorous verification process following ISO 14064-2 standards. 
                                    The process includes data collection validation, methodological review, and independent third-party verification.
                                </p>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="p-5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
                                        <p className="text-sm text-gray-600 mb-2 font-medium">Verification Body</p>
                                        <p className="font-bold text-lg text-gray-900">Carbon Trust Certification Ltd.</p>
                                    </div>
                                    <div className="p-5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
                                        <p className="text-sm text-gray-600 mb-2 font-medium">Verification Period</p>
                                        <p className="font-bold text-lg text-gray-900">{reportingPeriod?.periodFormatted}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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

                        <div className="mt-6 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing {reportData.emissionFactorsData.length} of {emissionFactors?.count || 0} emission factors
                            </p>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-all">
                                <Download className="w-4 h-4" />
                                Export Data
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">Technical Metadata</h3>
                            <p className="text-gray-600">System and calculation information</p>
                        </div>
                        <div className="space-y-6">
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                                    <p className="text-sm text-gray-600 mb-2 font-medium">API Version</p>
                                    <p className="font-bold text-xl text-gray-900">{metadata?.api_version}</p>
                                </div>
                                <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                                    <p className="text-sm text-gray-600 mb-2 font-medium">Generated At</p>
                                    <p className="font-bold text-xl text-gray-900">{metadata?.generatedAtFormatted}</p>
                                </div>
                                <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                                    <p className="text-sm text-gray-600 mb-2 font-medium">Data Sources</p>
                                    <p className="font-bold text-xl text-gray-900">{metadata?.dataSourcesCount}</p>
                                </div>
                            </div>
                            
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                                    <BarChartHorizontal className="w-5 h-5 text-green-600" />
                                    Calculation Methods
                                </h4>
                                <div className="flex flex-wrap gap-3">
                                    {metadata?.calculation_methods?.map((method: string, index: number) => (
                                        <span key={index} className="px-4 py-2 rounded-xl text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                                            {method}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {selectedReport === 'export' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">Export Data</h3>
                                <p className="text-gray-600">Download reports in various formats</p>
                            </div>
                            <Download className="w-8 h-8 text-green-600" />
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            <div 
                                className="group p-8 rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 cursor-pointer hover:border-green-300 hover:shadow-lg transition-all text-center"
                                onClick={() => generateReport('summary')}
                            >
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-100 group-hover:bg-green-200 flex items-center justify-center transition-colors">
                                    <FileText className="w-8 h-8 text-green-600" />
                                </div>
                                <h4 className="font-bold text-lg text-gray-900 mb-2">Executive Summary</h4>
                                <p className="text-sm text-gray-600 mb-4">Comprehensive overview with key findings</p>
                                <span className="inline-block px-4 py-2 rounded-xl text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                                    PDF, Excel, CSV
                                </span>
                            </div>

                            <div 
                                className="group p-8 rounded-2xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 cursor-pointer hover:border-yellow-300 hover:shadow-lg transition-all text-center"
                                onClick={() => generateReport('compliance')}
                            >
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-yellow-100 group-hover:bg-yellow-200 flex items-center justify-center transition-colors">
                                    <ShieldCheck className="w-8 h-8 text-yellow-600" />
                                </div>
                                <h4 className="font-bold text-lg text-gray-900 mb-2">Compliance Report</h4>
                                <p className="text-sm text-gray-600 mb-4">Regulatory and framework compliance</p>
                                <span className="inline-block px-4 py-2 rounded-xl text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                    PDF, Excel
                                </span>
                            </div>

                            <div 
                                className="group p-8 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 cursor-pointer hover:border-blue-300 hover:shadow-lg transition-all text-center"
                                onClick={() => generateReport('technical')}
                            >
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                                    <Database className="w-8 h-8 text-blue-600" />
                                </div>
                                <h4 className="font-bold text-lg text-gray-900 mb-2">Technical Data</h4>
                                <p className="text-sm text-gray-600 mb-4">Raw data and calculations</p>
                                <span className="inline-block px-4 py-2 rounded-xl text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                    Excel, CSV, JSON
                                </span>
                            </div>
                        </div>

                        <div className="p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <h4 className="font-bold text-lg text-gray-900 mb-6">Export Settings</h4>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Time Period</label>
                                    <select className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all">
                                        <option>All Available Years</option>
                                        {availableYears.map(year => (
                                            <option key={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Data Granularity</label>
                                    <select className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all">
                                        <option>Summary Data</option>
                                        <option>Detailed Monthly Data</option>
                                        <option>Raw Data</option>
                                    </select>
                                </div>
                            </div>
                        </div>
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

                            <div>
                                <h4 className="font-bold text-lg text-gray-900 mb-4">Export Options</h4>
                                <div className="space-y-3">
                                    <label className="flex items-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                                        <input type="checkbox" className="rounded text-green-600 focus:ring-green-500 w-5 h-5" defaultChecked />
                                        <span className="ml-3 text-gray-700 font-medium">Include executive summary</span>
                                    </label>
                                    <label className="flex items-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                                        <input type="checkbox" className="rounded text-green-600 focus:ring-green-500 w-5 h-5" defaultChecked />
                                        <span className="ml-3 text-gray-700 font-medium">Include graphs and charts</span>
                                    </label>
                                    <label className="flex items-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                                        <input type="checkbox" className="rounded text-green-600 focus:ring-green-500 w-5 h-5" />
                                        <span className="ml-3 text-gray-700 font-medium">Include raw data tables</span>
                                    </label>
                                    <label className="flex items-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                                        <input type="checkbox" className="rounded text-green-600 focus:ring-green-500 w-5 h-5" defaultChecked />
                                        <span className="ml-3 text-gray-700 font-medium">Include audit trail</span>
                                    </label>
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

                            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                                <h4 className="font-bold text-lg mb-3 text-gray-900">Action Details</h4>
                                <p className="text-gray-700 leading-relaxed">{selectedAuditLog.action} was performed with {selectedAuditLog.changes} changes made to the system.</p>
                            </div>

                            <div>
                                <h4 className="font-bold text-lg mb-4 text-gray-900">Related Changes</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                                        <span className="text-gray-700 font-medium">Updated emission factors</span>
                                        <span className="text-sm text-gray-500">+5 records</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                                        <span className="text-gray-700 font-medium">Modified calculation parameters</span>
                                        <span className="text-sm text-gray-500">3 changes</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedAuditLog, null, 2))}
                                    className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium flex items-center gap-2"
                                >
                                    <Copy className="w-4 h-4" />
                                    Copy Details
                                </button>
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

            {/* Graph Details Modal */}
            {selectedGraph && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedGraph(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-cyan-50">
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
                            <div className="mt-8 p-6 rounded-2xl bg-gray-50 border border-gray-200">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-2">Description</h4>
                                        <p className="text-gray-600">{selectedGraph.description}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-2">Data Points</h4>
                                        <p className="text-gray-600">{selectedGraph.data.length} data points</p>
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

export default ReportsTab;