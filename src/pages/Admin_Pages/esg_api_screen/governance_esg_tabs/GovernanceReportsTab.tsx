import React, { useState } from 'react';

// Icons
import {
    FileText,
    Download,
    Shield,
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
    Heart,
    Stethoscope,
    Shield as ShieldIcon,
    AlertOctagon,
    Bell,
    Crosshair,
    Target as TargetIcon,
    UserCheck,
    Brain,
    Activity as ActivityIcon,
    Dumbbell,
    Coffee,
    Moon,
    Home,
    Building as BuildingIcon,
    HardHat,
    Construction,
    Users as UsersIcon,
    Briefcase,
    Map,
    Navigation,
    Compass,
    Gavel,
    Scale,
    GraduationCap,
    Handshake,
    Trophy,
    Star,
    Percent,
    Calendar,
    FileCode,
    Code,
    Server,
    Network,
    Cpu as CpuIcon,
    ShieldCheck,
    Lock,
    Key,
    UsersRound,
    Building2,
    Landmark,
    BriefcaseBusiness,
    FileBarChart,
    FilePieChart,
    FileLineChart,
    FileBarChart2,
    FileSpreadsheet as FileSpreadsheetIcon,
    Search,
    Filter,
    SortAsc,
    SortDesc,
    BarChart,
    PieChart,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Hash,
    List,
    Grid,
    Table,
    CheckSquare,
    XCircle,
    Clock as ClockIcon,
} from "lucide-react";

// Types from API service
import {
    GovernanceBoardData,
    Company,
    GovernanceSummary,
    BoardComposition,
    BoardCommittees,
    EthicsAndCompliance,
    ExecutiveCompensation,
    GovernanceMetricsData,
    GovernanceInitiatives,
    GovernanceBenchmarks,
    Recommendation,
    DataQuality,
    ApiInfo,
    PerformanceIndicator,
    Committee,
    ActiveProgram,
    ExternalAssessment,
    AwardRecognition,
    Coordinate,
    GovernanceMetric,
    MetricValue
} from "../../../../services/Admin_Service/esg_apis/governance_esg_service";

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

interface GovernanceReportsTabProps {
    governanceData: GovernanceBoardData | null | undefined;
    selectedCompany: Company | undefined;
    formatNumber: (num: number | null) => string;
    formatCurrency: (num: number | null) => string;
    formatPercent: (num: number | null) => string;
    getTrendIcon: (trend: string) => React.ReactNode;
    selectedYear: number | null;
    availableYears: number[];
    latestYear: number | null;
    loading: boolean;
    isRefreshing: boolean;
    onMetricClick: (metric: any, modalType: string) => void;
    onCalculationClick: (calculationType: string, data?: any) => void;
    coordinates: Coordinate[];
    areaName: string;
    areaCovered: string;
    colors: {
        primary: string;
        secondary: string;
        lightGreen: string;
        darkGreen: string;
        emerald: string;
        lime: string;
        background: string;
    };
    summaryMetrics: any;
    
    // Helper functions
    getGovernanceGraphs: () => any[];
    getGovernanceSummary: () => GovernanceSummary | null;
    getBoardCompositionSummary: () => any;
    getCommitteeEffectiveness: () => any;
    getEthicsComplianceStatus: () => any;
    getExecutiveCompensationDetails: () => any;
    getGovernanceMetricsByCategory: () => any;
    calculateGovernanceScore: () => { score: number; breakdown: any; maxScore: number }; // Updated type
    getRecommendationsByPriority: () => any;
    getDataQualitySummary: () => any;
    getCSRMetrics: () => any;
    getComplianceMetrics: () => any;
    getCommitteeComposition: () => any[];
    getGovernanceInitiativesSummary: () => any;
    getExternalBenchmarks: () => any;
    getKeyPerformanceIndicators: () => any;
    getMetricsVerificationStatus: () => any;
}

const GovernanceReportsTab: React.FC<GovernanceReportsTabProps> = ({
    governanceData,
    selectedCompany,
    formatNumber,
    formatCurrency,
    formatPercent,
    getTrendIcon,
    selectedYear,
    availableYears,
    latestYear,
    loading,
    isRefreshing,
    onMetricClick,
    onCalculationClick,
    coordinates,
    areaName,
    areaCovered,
    colors,
    summaryMetrics,
    getGovernanceGraphs,
    getGovernanceSummary,
    getBoardCompositionSummary,
    getCommitteeEffectiveness,
    getEthicsComplianceStatus,
    getExecutiveCompensationDetails,
    getGovernanceMetricsByCategory,
    calculateGovernanceScore,
    getRecommendationsByPriority,
    getDataQualitySummary,
    getCSRMetrics,
    getComplianceMetrics,
    getCommitteeComposition,
    getGovernanceInitiativesSummary,
    getExternalBenchmarks,
    getKeyPerformanceIndicators,
    getMetricsVerificationStatus,
}) => {
    const [selectedReport, setSelectedReport] = useState<string>('summary');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
    const [metricsSearch, setMetricsSearch] = useState('');
    const [metricsViewMode, setMetricsViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    if (loading) {
        return (
            <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl">
                <div className="text-center max-w-md p-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                        <FileText className="w-12 h-12 text-green-600 animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">Loading Governance Reports</h3>
                    <p className="text-gray-600">Please wait while we load the governance data...</p>
                </div>
            </div>
        );
    }

    if (!governanceData) {
        return (
            <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl">
                <div className="text-center max-w-md p-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                        <FileText className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">No Governance Reports Available</h3>
                    <p className="text-gray-600">Select a company to view governance performance and board information.</p>
                </div>
            </div>
        );
    }

    // Get data from helper functions
    const governanceSummary = getGovernanceSummary();
    const boardComposition = getBoardCompositionSummary();
    const committeeEffectiveness = getCommitteeEffectiveness();
    const ethicsCompliance = getEthicsComplianceStatus();
    const executiveCompensation = getExecutiveCompensationDetails();
    const csrMetrics = getCSRMetrics();
    const complianceMetrics = getComplianceMetrics();
    const committeeComposition = getCommitteeComposition();
    const governanceInitiatives = getGovernanceInitiativesSummary();
    const externalBenchmarks = getExternalBenchmarks();
    const kpis = getKeyPerformanceIndicators();
    const dataQuality = getDataQualitySummary();
    const verificationStatus = getMetricsVerificationStatus();
    
    // FIXED: Extract score from the governance score object
    const governanceScoreObject = calculateGovernanceScore();
    const governanceScoreValue = governanceScoreObject.score; // Extract just the score
    
    // Get all governance metrics
    const governanceMetricsData = governanceData.governance_metrics;
    const allMetrics = governanceMetricsData?.metrics || {};
    const metricsByCategory = getGovernanceMetricsByCategory();
    
    // Get performance indicators from summary
    const performanceIndicators = governanceSummary?.performance_indicators || {
        board_size: { value: 0, unit: '', label: '', description: '', trend: '', target: '', year: 0 },
        board_independence: { value: 0, unit: '', label: '', description: '', trend: '', target: '', year: 0 },
        women_on_board: { value: 0, unit: '', label: '', description: '', trend: '', target: '', year: 0 },
        board_meetings: { value: 0, unit: '', label: '', description: '', trend: '', target: '', year: 0 }
    };

    // Get reporting year
    const reportingYear = selectedYear || latestYear || new Date().getFullYear();

    // Calculate key governance metrics
    const governanceMetricsSummary = {
        boardSize: typeof performanceIndicators?.board_size?.value === 'number'
            ? performanceIndicators.board_size.value
            : parseFloat(performanceIndicators?.board_size?.value?.toString() || "0"),
        boardIndependence: typeof performanceIndicators?.board_independence?.value === 'number'
            ? performanceIndicators.board_independence.value
            : parseFloat(performanceIndicators?.board_independence?.value?.toString() || "0"),
        womenOnBoard: typeof performanceIndicators?.women_on_board?.value === 'number'
            ? performanceIndicators.women_on_board.value
            : parseFloat(performanceIndicators?.women_on_board?.value?.toString() || "0"),
        boardMeetings: typeof performanceIndicators?.board_meetings?.value === 'number'
            ? performanceIndicators.board_meetings.value
            : parseFloat(performanceIndicators?.board_meetings?.value?.toString() || "0"),
        totalDirectors: boardComposition?.size || 0,
        independentDirectors: boardComposition?.independent || 0,
        executiveDirectors: boardComposition?.executive || 0,
        averageAge: boardComposition?.age?.average_age || 0,
        regulatoryIncidents: ethicsCompliance?.compliance?.regulatory_incidents || 0,
        finesPenalties: ethicsCompliance?.compliance?.fines_penalties || 0,
    };

    // Get committee data
    const boardCommitteesData = governanceData.board_committees;
    const attendanceRate = parseFloat(committeeEffectiveness?.effectiveness?.attendance_rate?.replace('%', '') || "0");

    // Get company info
    const companyInfo = governanceData.company;
    const esgFrameworks = companyInfo?.esg_reporting_framework || [];

    // Create metadata for technical section
    const metadata = {
        api_version: governanceData?.api_info?.version || "1.0",
        calculation_version: governanceData?.api_info?.calculation_version || "1.0",
        generated_at: governanceData?.api_info?.timestamp || new Date().toISOString(),
        endpoint: governanceData?.api_info?.endpoint || "governance-board",
        company_id: companyInfo?.id || "N/A",
        period_requested: reportingYear.toString(),
        data_sources: [
            "Board meeting minutes",
            "Annual reports",
            "ESG disclosures",
            "Committee reports",
            "Regulatory filings"
        ]
    };

    // Key statistics
    const keyStats = {
        years_covered: availableYears.length || 1,
        total_metrics_analyzed: governanceMetricsData?.total_metrics || 0,
        current_year: reportingYear,
        governance_score: governanceScoreValue, // Use extracted score value
        board_independence: governanceMetricsSummary.boardIndependence,
        total_committees: boardCommitteesData?.committees?.length || 0
    };

    // Get all unique categories from metrics
    const allCategories = Object.keys(governanceMetricsData?.metrics_by_category || {});
    
    // Filter metrics based on search and category
    const filteredMetrics = Object.entries(allMetrics).filter(([key, metric]) => {
        const matchesSearch = metricsSearch === '' || 
            metric.name.toLowerCase().includes(metricsSearch.toLowerCase()) ||
            metric.description?.toLowerCase().includes(metricsSearch.toLowerCase()) ||
            metric.category.toLowerCase().includes(metricsSearch.toLowerCase());
        
        const matchesCategory = selectedCategory === 'all' || metric.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });

    // Get verification status badge
    const getVerificationBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'verified':
                return (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                    </span>
                );
            case 'unverified':
                return (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Unverified
                    </span>
                );
            case 'pending':
                return (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        Pending
                    </span>
                );
            default:
                return (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {status || 'Unknown'}
                    </span>
                );
        }
    };

    // Get category badge
    const getCategoryBadge = (category: string) => {
        const categoryColors: Record<string, string> = {
            'ethics': 'bg-purple-100 text-purple-800',
            'compliance': 'bg-blue-100 text-blue-800',
            'board': 'bg-green-100 text-green-800',
            'committee': 'bg-teal-100 text-teal-800',
            'executive': 'bg-amber-100 text-amber-800',
            'csr': 'bg-cyan-100 text-cyan-800',
            'supplier': 'bg-indigo-100 text-indigo-800',
            'reporting': 'bg-pink-100 text-pink-800',
            'diversity': 'bg-violet-100 text-violet-800',
        };

        const defaultColor = 'bg-gray-100 text-gray-800';
        const colorClass = categoryColors[category.toLowerCase()] || defaultColor;
        
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                {category}
            </span>
        );
    };

    // Format metric value
    const formatMetricValue = (metric: GovernanceMetric) => {
        const value = metric.values?.[0];
        if (!value) return 'N/A';
        
        const numericValue = value.numeric_value;
        if (numericValue === null) return value.value;
        
        // Format based on metric name and unit
        if (metric.name.toLowerCase().includes('percentage') || metric.unit === '%') {
            return `${numericValue.toFixed(1)}%`;
        }
        if (metric.name.toLowerCase().includes('currency') || metric.name.toLowerCase().includes('cost') || metric.name.toLowerCase().includes('price')) {
            return formatCurrency(numericValue);
        }
        if (Number.isInteger(numericValue)) {
            return formatNumber(numericValue);
        }
        return numericValue.toFixed(2);
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Report Navigation */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Governance Report Sections</h3>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setIsExportModalOpen(true)}
                            className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50"
                        >
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
                        { id: 'board-committees', label: 'Board & Committees', icon: <Users className="w-4 h-4" /> },
                        { id: 'ethics-compliance', label: 'Ethics & Compliance', icon: <Shield className="w-4 h-4" /> },
                        { id: 'governance-metrics', label: 'Governance Metrics', icon: <BarChart3 className="w-4 h-4" /> },
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
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Governance Overview</h3>
                                <p className="text-gray-600">Board performance, independence, and compliance status</p>
                            </div>
                            <Shield className="w-8 h-8 text-green-600" />
                        </div>

                        <div className="space-y-6">
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <h4 className="font-bold text-lg text-gray-900 mb-4">Company Information</h4>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Company Name</p>
                                            <p className="text-lg font-bold text-gray-900">{selectedCompany?.name || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Industry</p>
                                            <p className="text-lg font-medium text-gray-800">{selectedCompany?.industry || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Country</p>
                                            <p className="text-lg font-medium text-gray-800">{selectedCompany?.country || "N/A"}</p>
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
                                            <p className="text-lg font-medium text-gray-800">{selectedCompany?.esg_data_status || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                <h4 className="font-bold text-lg text-gray-900 mb-4">Governance Reporting Scope</h4>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Reporting Period</p>
                                        <p className="text-gray-800">{reportingYear}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Data Availability</p>
                                        <p className="text-gray-800">{governanceData?.year_data?.data_available ? 'Available' : 'Limited'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Governance Analysis Scope</p>
                                        <p className="text-gray-800">{selectedCompany?.scope || 'Comprehensive governance and board analysis'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">ESG Frameworks</p>
                                        <div className="flex flex-wrap gap-2">
                                            {esgFrameworks.map((framework, index) => (
                                                <span key={index} className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                                                    {framework}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Key Statistics */}
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Key Governance Statistics</h3>
                            <BarChart3 className="w-8 h-8 text-green-600" />
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <p className="text-sm text-gray-600 mb-2">Governance Score</p>
                                {/* FIXED: Using extracted score value, not the object */}
                                <p className="text-2xl font-bold text-green-600">{governanceScoreValue}/100</p>
                                <p className="text-sm text-gray-600 mt-2">Overall performance</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                <p className="text-sm text-gray-600 mb-2">Board Independence</p>
                                <p className="text-2xl font-bold text-blue-600">{governanceMetricsSummary.boardIndependence}%</p>
                                <p className="text-sm text-gray-600 mt-2">Independent directors</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                                <p className="text-sm text-gray-600 mb-2">Women on Board</p>
                                <p className="text-2xl font-bold text-purple-600">{governanceMetricsSummary.womenOnBoard}%</p>
                                <p className="text-sm text-gray-600 mt-2">Gender diversity</p>
                            </div>
                        </div>
                    </div>

                    {/* Governance Summary Card */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border-2 border-green-200 shadow-xl p-8">
                        <div className="flex items-start gap-6">
                            <div className="p-5 rounded-3xl bg-white shadow-lg">
                                <ShieldCheck className="w-12 h-12 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Governance Summary</h3>
                                <p className="text-gray-700 text-lg mb-4">
                                    {governanceSummary?.overview?.key_message || 'Comprehensive governance analysis completed for the reporting period.'}
                                </p>
                                <div className="grid md:grid-cols-2 gap-4 mb-6">
                                    <div className="p-4 rounded-xl bg-white/50 border border-green-200">
                                        <p className="text-sm text-gray-600 mb-1">Total Board Meetings</p>
                                        <p className="text-xl font-bold text-gray-900">{governanceMetricsSummary.boardMeetings}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/50 border border-green-200">
                                        <p className="text-sm text-gray-600 mb-1">Average Board Attendance</p>
                                        <p className="text-xl font-bold text-gray-900">{governanceSummary?.board_snapshot?.average_attendance || "0%"}</p>
                                    </div>
                                </div>
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

                    {/* Performance Indicators */}
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Governance Performance Indicators</h3>
                            <ActivityIcon className="w-8 h-8 text-green-600" />
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {performanceIndicators && Object.entries(performanceIndicators).map(([key, value]: [string, any], index) => (
                                <div key={index} className="p-5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        {key === 'board_size' ? <Users className="w-5 h-5 text-blue-600" /> :
                                            key === 'board_independence' ? <Shield className="w-5 h-5 text-green-600" /> :
                                                key === 'women_on_board' ? <UsersIcon className="w-5 h-5 text-purple-600" /> :
                                                    <Calendar className="w-5 h-5 text-amber-600" />}
                                        <h5 className="font-bold text-gray-900 capitalize">{key.replace(/_/g, ' ')}</h5>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {key === 'board_independence' || key === 'women_on_board' ?
                                            `${value.value}%` :
                                            value.value}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        {value.description}
                                    </p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Target: {value.target}</span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${value.trend === 'optimal' || value.trend === 'excellent' ? 'bg-green-100 text-green-800' :
                                            value.trend === 'good' ? 'bg-blue-100 text-blue-800' :
                                                'bg-amber-100 text-amber-800'}`}>
                                            {value.trend}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Board & Committees Report */}
            {selectedReport === 'board-committees' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Board Composition & Committees</h3>
                                <p className="text-gray-600">Board structure, diversity, and committee performance</p>
                            </div>
                            <Users className="w-8 h-8 text-green-600" />
                        </div>

                        {/* Board Composition */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Board Composition</h4>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                    <p className="text-sm text-gray-600 mb-2">Total Directors</p>
                                    <p className="text-2xl font-bold text-blue-600">{governanceMetricsSummary.totalDirectors}</p>
                                    <p className="text-sm text-gray-600 mt-2">Board size</p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <p className="text-sm text-gray-600 mb-2">Independent Directors</p>
                                    <p className="text-2xl font-bold text-green-600">{governanceMetricsSummary.independentDirectors}</p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        {Math.round((governanceMetricsSummary.independentDirectors / governanceMetricsSummary.totalDirectors) * 100)}% of board
                                    </p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                                    <p className="text-sm text-gray-600 mb-2">Women Directors</p>
                                    <p className="text-2xl font-bold text-purple-600">{boardComposition?.gender?.women || 0}</p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        {boardComposition?.gender?.percentageWomen || 0}% of board
                                    </p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200">
                                    <p className="text-sm text-gray-600 mb-2">Average Age</p>
                                    <p className="text-2xl font-bold text-amber-600">{governanceMetricsSummary.averageAge}</p>
                                    <p className="text-sm text-gray-600 mt-2">years</p>
                                </div>
                            </div>
                        </div>

                        {/* Board Tenure Distribution */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Board Tenure Distribution</h4>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="text-center">
                                        <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Calendar className="w-10 h-10 text-blue-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {boardComposition?.tenure?.["0-3 years"] || 0}
                                        </p>
                                        <p className="text-gray-600">0-3 Years</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                                            <Calendar className="w-10 h-10 text-green-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {boardComposition?.tenure?.["4-6 years"] || 0}
                                        </p>
                                        <p className="text-gray-600">4-6 Years</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center">
                                            <Calendar className="w-10 h-10 text-amber-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {boardComposition?.tenure?.["7+ years"] || 0}
                                        </p>
                                        <p className="text-gray-600">7+ Years</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Board Committees */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Board Committees</h4>
                            <div className="space-y-4">
                                {boardCommitteesData?.committees?.map((committee: Committee, index: number) => (
                                    <div key={index} className="p-5 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h5 className="font-bold text-lg text-gray-900 mb-2">{committee.name}</h5>
                                                <p className="text-gray-700">Chair: {committee.chair}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Independence</p>
                                                <p className="text-lg font-bold text-gray-900">
                                                    {Math.round((committee.independent_members / committee.members) * 100)}%
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-700">Members:</span> {committee.members}
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Independent:</span> {committee.independent_members}
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Meetings Held:</span> {committee.meetings_held}
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <span className="font-medium text-gray-700">Focus:</span> {committee.focus}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Committee Effectiveness */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Committee Effectiveness</h4>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <UserCheck className="w-6 h-6 text-green-600" />
                                        <h5 className="font-bold text-lg text-gray-900">Attendance Rate</h5>
                                    </div>
                                    <p className="text-2xl font-bold text-green-600">{attendanceRate}%</p>
                                    <p className="text-sm text-gray-600 mt-2">Average committee attendance</p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <CheckCircle className="w-6 h-6 text-blue-600" />
                                        <h5 className="font-bold text-lg text-gray-900">Decision Implementation</h5>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {committeeEffectiveness?.effectiveness?.decision_implementation || "0%"}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">Implementation rate</p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Users className="w-6 h-6 text-purple-600" />
                                        <h5 className="font-bold text-lg text-gray-900">Stakeholder Feedback</h5>
                                    </div>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {committeeEffectiveness?.effectiveness?.stakeholder_feedback_incorporated || "0%"}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">Incorporated into decisions</p>
                                </div>
                            </div>
                        </div>

                        {/* Governance Initiatives */}
                        <div>
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Governance Initiatives</h4>
                            <div className="space-y-4">
                                {governanceInitiatives?.activePrograms?.map((program: ActiveProgram, index: number) => (
                                    <div key={index} className="p-5 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h5 className="font-bold text-lg text-gray-900 mb-2">{program.name}</h5>
                                                <p className="text-gray-700">{program.description}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Progress</p>
                                                <p className="text-lg font-bold text-gray-900">{program.progress || 'N/A'}</p>
                                            </div>
                                        </div>
                                        {program.impact && (
                                            <div className="mt-2">
                                                <span className="font-medium text-gray-700">Impact:</span> {program.impact}
                                            </div>
                                        )}
                                        {program.participants && (
                                            <div className="mt-2">
                                                <span className="font-medium text-gray-700">Participants:</span> {program.participants}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Ethics & Compliance Report */}
            {selectedReport === 'ethics-compliance' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Ethics, Compliance & Social Responsibility</h3>
                                <p className="text-gray-600">Policies, regulatory compliance, and corporate social responsibility</p>
                            </div>
                            <Scale className="w-8 h-8 text-green-600" />
                        </div>

                        {/* Policies Status */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Policy Implementation Status</h4>
                            <div className="space-y-4">
                                {ethicsCompliance?.policies && Object.entries(ethicsCompliance.policies).map(([key, policy]: [string, any]) => (
                                    <div key={key} className="p-5 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h5 className="font-bold text-lg text-gray-900 mb-2">{key.replace(/_/g, ' ').toUpperCase()}</h5>
                                                <p className="text-gray-700">Status: {policy.implemented ? 'Implemented' : 'Not Implemented'}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${policy.implemented
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {policy.implemented ? 'Implemented' : 'Not Implemented'}
                                            </span>
                                        </div>
                                        {policy.lastReview && (
                                            <p className="text-sm text-gray-700">
                                                Last Review: {policy.lastReview}
                                            </p>
                                        )}
                                        {policy.trainingCompletion && (
                                            <p className="text-sm text-gray-700">
                                                Training Completion: {policy.trainingCompletion}
                                            </p>
                                        )}
                                        {policy.incidents !== undefined && (
                                            <p className="text-sm text-gray-700">
                                                Incidents Reported: {policy.incidents}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Compliance Metrics */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Compliance Metrics</h4>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
                                    <p className="text-sm text-gray-600 mb-2">Regulatory Incidents</p>
                                    <p className="text-2xl font-bold text-red-600">{governanceMetricsSummary.regulatoryIncidents}</p>
                                    <p className="text-sm text-gray-600 mt-2">Zero tolerance target</p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200">
                                    <p className="text-sm text-gray-600 mb-2">Fines & Penalties</p>
                                    <p className="text-2xl font-bold text-amber-600">{governanceMetricsSummary.finesPenalties}</p>
                                    <p className="text-sm text-gray-600 mt-2">Monetary penalties</p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                    <p className="text-sm text-gray-600 mb-2">Audit Findings</p>
                                    <p className="text-lg font-bold text-blue-600">
                                        {ethicsCompliance?.compliance?.audit_findings || "No findings"}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">Last audit results</p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <p className="text-sm text-gray-600 mb-2">IFRS Alignment</p>
                                    <p className="text-lg font-bold text-green-600">
                                        {ethicsCompliance?.compliance?.ifrs_alignment || "Partial"}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">Sustainability disclosures</p>
                                </div>
                            </div>
                        </div>

                        {/* Executive Compensation */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Executive Compensation</h4>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <DollarSign className="w-6 h-6 text-purple-600" />
                                        <h5 className="font-bold text-lg text-gray-900">ESG-Linked Pay</h5>
                                    </div>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {executiveCompensation?.esgLinked?.implemented ? 'Yes' : 'No'}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        {executiveCompensation?.esgLinked?.percentage || '0%'} tied to ESG
                                    </p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Percent className="w-6 h-6 text-blue-600" />
                                        <h5 className="font-bold text-lg text-gray-900">Shareholder Approval</h5>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {executiveCompensation?.shareholderApproval?.approvalRate || 0}%
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Last vote: {executiveCompensation?.shareholderApproval?.lastVote || 'N/A'}
                                    </p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <FileText className="w-6 h-6 text-green-600" />
                                        <h5 className="font-bold text-lg text-gray-900">Disclosure Status</h5>
                                    </div>
                                    <p className="text-lg font-bold text-green-600">
                                        {executiveCompensation?.disclosure || "Partial"}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">Remuneration disclosure</p>
                                </div>
                            </div>
                        </div>

                        {/* Corporate Social Responsibility */}
                        <div>
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Corporate Social Responsibility</h4>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <GraduationCap className="w-6 h-6 text-blue-600" />
                                        <h5 className="font-bold text-lg text-gray-900">Education Support</h5>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-600">{csrMetrics?.education?.totalStudents || 0}</p>
                                    <p className="text-sm text-gray-600 mt-2">Students supported</p>
                                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-600">Male:</span> {csrMetrics?.education?.maleStudents || 0}
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Female:</span> {csrMetrics?.education?.femaleStudents || 0}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Heart className="w-6 h-6 text-green-600" />
                                        <h5 className="font-bold text-lg text-gray-900">Healthcare Access</h5>
                                    </div>
                                    <p className="text-2xl font-bold text-green-600">{formatNumber(csrMetrics?.health?.hospitalAttendees || 0)}</p>
                                    <p className="text-sm text-gray-600 mt-2">Hospital attendees served</p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Handshake className="w-6 h-6 text-amber-600" />
                                        <h5 className="font-bold text-lg text-gray-900">Supplier Relations</h5>
                                    </div>
                                    <p className="text-2xl font-bold text-amber-600">{csrMetrics?.suppliers?.totalSuppliers || 0}</p>
                                    <p className="text-sm text-gray-600 mt-2">Suppliers engaged</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Governance Metrics Report - NEW SECTION */}
            {selectedReport === 'governance-metrics' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Governance Metrics Dashboard</h3>
                                <p className="text-gray-600">Complete list of all governance metrics and their values</p>
                            </div>
                            <BarChart3 className="w-8 h-8 text-green-600" />
                        </div>

                        {/* Metrics Summary */}
                        <div className="mb-8">
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <p className="text-sm text-gray-600 mb-2">Total Metrics</p>
                                    <p className="text-2xl font-bold text-green-600">{governanceMetricsData?.total_metrics || 0}</p>
                                    <p className="text-sm text-gray-600 mt-2">All governance metrics</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                    <p className="text-sm text-gray-600 mb-2">Categories</p>
                                    <p className="text-2xl font-bold text-blue-600">{allCategories.length}</p>
                                    <p className="text-sm text-gray-600 mt-2">Metric categories</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                                    <p className="text-sm text-gray-600 mb-2">Verified Metrics</p>
                                    <p className="text-2xl font-bold text-purple-600">{verificationStatus?.verified || 0}</p>
                                    <p className="text-sm text-gray-600 mt-2">Quality assured data</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200">
                                    <p className="text-sm text-gray-600 mb-2">Reporting Year</p>
                                    <p className="text-2xl font-bold text-amber-600">{reportingYear}</p>
                                    <p className="text-sm text-gray-600 mt-2">Current data period</p>
                                </div>
                            </div>

                            {/* Search and Filters */}
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 mb-6">
                                <div className="flex flex-col md:flex-row gap-4 mb-6">
                                    <div className="flex-1">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                placeholder="Search metrics by name, description, or category..."
                                                value={metricsSearch}
                                                onChange={(e) => setMetricsSearch(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setMetricsViewMode('grid')}
                                            className={`p-3 rounded-xl border ${metricsViewMode === 'grid' ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            <Grid className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setMetricsViewMode('list')}
                                            className={`p-3 rounded-xl border ${metricsViewMode === 'list' ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            <List className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Category Filters */}
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setSelectedCategory('all')}
                                        className={`px-4 py-2 rounded-lg font-medium ${selectedCategory === 'all' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                    >
                                        All Categories ({Object.keys(allMetrics).length})
                                    </button>
                                    {allCategories.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => setSelectedCategory(category)}
                                            className={`px-4 py-2 rounded-lg font-medium ${selectedCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                        >
                                            {category} ({governanceMetricsData?.metrics_by_category?.[category] || 0})
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Metrics Display */}
                            <div className="mb-4">
                                <h4 className="font-bold text-lg text-gray-900 mb-4">
                                    {filteredMetrics.length} Metrics Found
                                    {selectedCategory !== 'all' && ` in ${selectedCategory}`}
                                </h4>
                            </div>

                            {metricsViewMode === 'grid' ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredMetrics.map(([key, metric]) => (
                                        <div 
                                            key={key} 
                                            className="p-5 rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-green-300 transition-all duration-300 cursor-pointer"
                                            onClick={() => onMetricClick(metric, 'governance-metric')}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <h5 className="font-bold text-gray-900 mb-2 line-clamp-2">{metric.name}</h5>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        {getCategoryBadge(metric.category)}
                                                        {getVerificationBadge(metric.verification_status)}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-gray-900 mb-1">
                                                        {formatMetricValue(metric)}
                                                    </div>
                                                    {metric.unit && (
                                                        <div className="text-sm text-gray-600">{metric.unit}</div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                                {metric.description || 'No description available'}
                                            </p>
                                            
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-500">Data Source:</span>
                                                    <span className="font-medium text-gray-700">{metric.data_source}</span>
                                                </div>
                                                {metric.values?.[0]?.source_notes && (
                                                    <div className="flex items-start text-sm">
                                                        <span className="text-gray-500 mr-2">Notes:</span>
                                                        <span className="text-gray-700 flex-1">{metric.values[0].source_notes}</span>
                                                    </div>
                                                )}
                                                {metric.values?.[0]?.added_at && (
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-500">Last Updated:</span>
                                                        <span className="text-gray-700">
                                                            {new Date(metric.values[0].added_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredMetrics.map(([key, metric]) => (
                                        <div 
                                            key={key} 
                                            className="p-5 rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-green-300 transition-all duration-300 cursor-pointer"
                                            onClick={() => onMetricClick(metric, 'governance-metric')}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <h5 className="font-bold text-gray-900 mb-2">{metric.name}</h5>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {getCategoryBadge(metric.category)}
                                                        {getVerificationBadge(metric.verification_status)}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-3">
                                                        {metric.description || 'No description available'}
                                                    </p>
                                                </div>
                                                <div className="text-right min-w-[120px]">
                                                    <div className="text-2xl font-bold text-gray-900 mb-1">
                                                        {formatMetricValue(metric)}
                                                    </div>
                                                    {metric.unit && (
                                                        <div className="text-sm text-gray-600">{metric.unit}</div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Data Source:</span>
                                                    <p className="font-medium text-gray-700">{metric.data_source}</p>
                                                </div>
                                                {metric.values?.[0]?.source_notes && (
                                                    <div className="md:col-span-2">
                                                        <span className="text-gray-500">Notes:</span>
                                                        <p className="text-gray-700">{metric.values[0].source_notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {filteredMetrics.length === 0 && (
                                <div className="text-center py-12">
                                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h4 className="text-xl font-bold text-gray-700 mb-2">No Metrics Found</h4>
                                    <p className="text-gray-600">
                                        {metricsSearch ? `No metrics match your search for "${metricsSearch}"` : 'No metrics available for the selected category'}
                                    </p>
                                    {metricsSearch && (
                                        <button 
                                            onClick={() => {
                                                setMetricsSearch('');
                                                setSelectedCategory('all');
                                            }}
                                            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            Clear Search
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Categories Breakdown */}
                        <div className="mt-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Metrics by Category</h4>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {allCategories.map((category) => {
                                    const count = governanceMetricsData?.metrics_by_category?.[category] || 0;
                                    return (
                                        <div key={category} className="p-4 rounded-xl border border-gray-200 bg-white">
                                            <div className="flex items-center justify-between mb-2">
                                                <h5 className="font-medium text-gray-900">{category}</h5>
                                                {getCategoryBadge(category)}
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">{count}</p>
                                            <p className="text-sm text-gray-600">metrics</p>
                                        </div>
                                    );
                                })}
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
                                        <p className="text-sm text-gray-600 mb-1">Governance Module Version</p>
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

                        {/* Data Quality & Verification */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Data Quality & Verification</h4>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <p className="text-sm text-gray-600 mb-2">Total Metrics Analyzed</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {keyStats.total_metrics_analyzed}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">Governance metrics</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                    <p className="text-sm text-gray-600 mb-2">Unverified Metrics</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {verificationStatus?.unverified || 0}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">Requiring verification</p>
                                </div>
                            </div>
                        </div>

                        {/* External Benchmarks & Awards */}
                        <div>
                            <h4 className="font-bold text-lg text-gray-900 mb-4">External Benchmarks & Awards</h4>
                            <div className="space-y-4">
                                {externalBenchmarks?.assessments?.map((assessment: ExternalAssessment, index: number) => (
                                    <div key={index} className="p-4 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h5 className="font-bold text-gray-900">{assessment.framework}</h5>
                                                <p className="text-sm text-gray-600">Status: {assessment.status}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Alignment</p>
                                                <p className="text-lg font-bold text-green-600">{assessment.alignment}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {externalBenchmarks?.awards && externalBenchmarks.awards.length > 0 && (
                                    <div className="mt-6">
                                        <h5 className="font-bold text-gray-900 mb-3">Awards & Recognition</h5>
                                        <div className="space-y-2">
                                            {externalBenchmarks.awards.map((award: AwardRecognition, index: number) => (
                                                <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200">
                                                    <Trophy className="w-4 h-4 text-yellow-600" />
                                                    <div>
                                                        <p className="font-medium text-gray-900">{award.name}</p>
                                                        <p className="text-sm text-gray-600">{award.organization} ({award.year})</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
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
                                <h3 className="text-2xl font-bold">Export Governance Report</h3>
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
                                        { format: 'excel', icon: <FileSpreadsheetIcon className="w-8 h-8" />, label: 'Excel', description: 'Spreadsheet data' },
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
                                        <span>Board Composition & Committees</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span>Ethics & Compliance</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span>Governance Metrics ({Object.keys(allMetrics).length})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span>Corporate Social Responsibility</span>
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
                                        alert(`Exporting Governance Report as ${exportFormat.toUpperCase()}`);
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

export default GovernanceReportsTab;