import React, { useState, useMemo } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Target,
    AlertTriangle,
    Info,
    Lightbulb,
    ShieldCheck,
    Users,
    Award,
    Scale,
    Shield,
    X,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    Briefcase,
    UserCheck,
    Gavel,
    Building,
    BarChart3,
    Settings,
    DollarSign,
    Package,
    AlertCircle,
    Clock,
    Cpu,
    Archive,
    CheckCircle,
    XCircle,
    Percent,
    Calendar,
    Target as TargetIcon,
    Heart,
    BookOpen,
    Globe,
    Star,
    Trophy,
    Award as AwardIcon,
    FileText,
    Lock,
    Eye,
    Users as UsersIcon,
} from "lucide-react";

// Enhanced Color Palette with Green Theme (same as WasteAnalyticsTab)
const COLORS = {
    primary: '#22c55e',
    primaryDark: '#15803d',
    primaryLight: '#86efac',
    primaryPale: '#D1FAE5',
    accent: '#16a34a',
    accentGold: '#F59E0B',
    success: '#10B981',
    warning: '#FBBF24',
    danger: '#EF4444',
    info: '#3B82F6',
    purple: '#8B5CF6',
    blue: '#3B82F6',
};

interface GovernanceAnalyticsTabProps {
    governanceData: any;
    selectedCompany: any;
    formatNumber: (num: number | null) => string;
    formatCurrency: (num: number | null) => string;
    formatPercent: (num: number | null) => string;
    getTrendIcon: (trend: string) => React.ReactNode;
    selectedYear: number | null;
    availableYears: number[];
    onMetricClick: (metric: any, modalType: string) => void;
    onCalculationClick: (calculationType: string, data?: any) => void;
    summaryMetrics?: any;
}

// Helper function to calculate governance score - defined OUTSIDE the component
const calculateGovernanceScore = (metrics: any) => {
    let score = 0;
    let maxScore = 100;

    // Board independence (max 25 points)
    const independenceScore = Math.min((metrics.boardIndependence / 50) * 25, 25);
    score += independenceScore;

    // Gender diversity (max 25 points)
    const diversityScore = Math.min((metrics.percentageWomen / 30) * 25, 25);
    score += diversityScore;

    // Committee effectiveness (max 25 points)
    const committeeScore = (metrics.committeeEffectiveness / 100) * 25;
    score += committeeScore;

    // Ethics & compliance (max 25 points)
    const complianceScore = metrics.regulatoryIncidents === 0 ? 25 : 15;
    score += complianceScore;

    // ESG-linked pay bonus (up to 10 bonus points)
    const esgPayBonus = metrics.esgLinkedPayPercentage > 0 ? Math.min(metrics.esgLinkedPayPercentage / 10, 10) : 0;
    score += esgPayBonus;

    return Math.round((score / (maxScore + (esgPayBonus > 0 ? 10 : 0))) * 100);
};

const GovernanceAnalyticsTab: React.FC<GovernanceAnalyticsTabProps> = ({
    governanceData,
    selectedCompany,
    formatNumber,
    formatCurrency,
    formatPercent,
    getTrendIcon,
    onMetricClick,
    onCalculationClick,
    summaryMetrics,
}) => {
    const [activeInsightTab, setActiveInsightTab] = useState('trends');
    const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // governanceData is already the data object from GovernanceBoardScreen
    const apiData = governanceData;

    if (!apiData) {
        return (
            <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl">
                <div className="text-center max-w-md p-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                        <Building className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">No Governance Analytics Data Available</h3>
                    <p className="text-gray-600 leading-relaxed">Select a company to view detailed governance analytics and insights.</p>
                </div>
            </div>
        );
    }

    // Extract data from API response
    const companyInfo = apiData.company;
    const yearData = apiData.year_data;
    const governanceSummary = apiData.governance_summary;
    const performanceIndicators = governanceSummary?.performance_indicators;
    const boardComposition = apiData.board_composition;
    const boardCommittees = apiData.board_committees;
    const ethicsAndCompliance = apiData.ethics_and_compliance;
    const executiveCompensation = apiData.executive_compensation;
    const governanceMetrics = apiData.governance_metrics;
    const governanceInitiatives = apiData.governance_initiatives;
    const governanceBenchmarks = apiData.governance_benchmarks;
    const graphsData = apiData.graphs;
    const recommendations = apiData.recommendations;
    const dataQuality = apiData.data_quality;

    // Get reporting year
    const reportingYear = yearData?.requested_year || new Date().getFullYear();

    // Calculate key governance metrics
    const governanceMetricsData = useMemo(() => {
        if (!governanceMetrics?.metrics) return null;

        const metrics = governanceMetrics.metrics;

        // Get key metrics
        const boardSize = performanceIndicators?.board_size?.value || 0;
        const boardIndependence = performanceIndicators?.board_independence?.value || 0;
        const womenOnBoard = performanceIndicators?.women_on_board?.value || 0;
        const boardMeetings = performanceIndicators?.board_meetings?.value || 0;

        // Calculate metrics from board composition
        const totalDirectors = boardComposition?.size_and_structure?.total_directors || 0;
        const independentDirectors = boardComposition?.size_and_structure?.independent_directors || 0;
        const womenDirectors = boardComposition?.diversity_metrics?.gender_diversity?.women || 0;
        const percentageWomen = boardComposition?.diversity_metrics?.gender_diversity?.percentage_women || 0;

        // Ethics and compliance metrics
        const ethicsCodeStatus = ethicsAndCompliance?.policies_in_place?.ethics_code?.status || 'Not Implemented';
        const antiCorruptionStatus = ethicsAndCompliance?.policies_in_place?.anti_corruption?.status || 'Not Implemented';
        const whistleblowingStatus = ethicsAndCompliance?.policies_in_place?.whistleblowing?.status || 'Not Implemented';
        const regulatoryIncidents = ethicsAndCompliance?.compliance_metrics?.regulatory_incidents || 0;
        const finesPenalties = ethicsAndCompliance?.compliance_metrics?.fines_penalties || 0;

        // Executive compensation metrics
        const esgLinkedPayStatus = executiveCompensation?.esg_linked_pay?.status || 'Not Implemented';
        const esgLinkedPayPercentage = parseFloat(executiveCompensation?.esg_linked_pay?.percentage_tied_to_esg?.replace('%', '') || "0");
        const payRatio = executiveCompensation?.pay_ratio?.ceo_to_median_employee || 'N/A';
        const shareholderApprovalRate = parseFloat(executiveCompensation?.shareholder_approval?.approval_rate?.replace('%', '') || "0");

        // Calculate overall governance score
        const governanceScore = calculateGovernanceScore({
            boardIndependence: typeof boardIndependence === 'number' ? boardIndependence : parseFloat(boardIndependence.toString() || "0"),
            percentageWomen,
            committeeEffectiveness: parseFloat(boardCommittees?.committee_effectiveness?.attendance_rate?.replace('%', '') || "0"),
            regulatoryIncidents,
            esgLinkedPayPercentage,
        });

        return {
            boardSize,
            boardIndependence: typeof boardIndependence === 'number' ? boardIndependence : parseFloat(boardIndependence.toString() || "0"),
            womenOnBoard: typeof womenOnBoard === 'number' ? womenOnBoard : parseFloat(womenOnBoard.toString() || "0"),
            boardMeetings: typeof boardMeetings === 'number' ? boardMeetings : parseFloat(boardMeetings.toString() || "0"),
            totalDirectors,
            independentDirectors,
            womenDirectors,
            percentageWomen,
            ethicsCodeStatus,
            antiCorruptionStatus,
            whistleblowingStatus,
            regulatoryIncidents,
            finesPenalties,
            esgLinkedPayStatus,
            esgLinkedPayPercentage,
            payRatio,
            shareholderApprovalRate,
            governanceScore,
        };
    }, [governanceMetrics, performanceIndicators, boardComposition, ethicsAndCompliance, executiveCompensation, boardCommittees]);

    // Get trend data
    const trends = useMemo(() => {
        if (!graphsData?.board_composition_trend) return null;

        const trendData = graphsData.board_composition_trend;
        const labels = trendData.labels || [];
        const boardIndependenceData = trendData.datasets?.find(d => d.label?.includes('Independence'))?.data || [];
        const womenOnBoardData = trendData.datasets?.find(d => d.label?.includes('Women'))?.data || [];

        // Calculate trends
        const getTrend = (data: number[]) => {
            if (data.length < 2) return 'Stable';
            const first = data[0];
            const last = data[data.length - 1];
            const percentageChange = ((last - first) / first) * 100;

            if (percentageChange > 5) return 'Improving';
            if (percentageChange < -5) return 'Declining';
            return 'Stable';
        };

        return {
            boardIndependenceTrend: getTrend(boardIndependenceData),
            womenOnBoardTrend: getTrend(womenOnBoardData),
            governanceScoreTrend: governanceMetricsData?.governanceScore > 75 ? 'Excellent' :
                governanceMetricsData?.governanceScore > 60 ? 'Good' : 'Needs Improvement',
        };
    }, [graphsData, governanceMetricsData]);

    // Key insights data
    const insights = {
        trends: [
            {
                title: 'Board Independence Progress',
                description: `Board independence at ${governanceMetricsData?.boardIndependence?.toFixed(1) || '0'}%, ${governanceMetricsData?.boardIndependence >= 50 ? 'meeting' : 'below'} best practice`,
                icon: <UserCheck className="w-5 h-5 text-green-600" />,
                impact: governanceMetricsData?.boardIndependence >= 50 ? 'High' : governanceMetricsData?.boardIndependence >= 30 ? 'Medium' : 'Low',
                confidence: 0.92,
            },
            {
                title: 'Gender Diversity Trend',
                description: `Women representation at ${governanceMetricsData?.percentageWomen?.toFixed(1) || '0'}%, showing ${performanceIndicators?.women_on_board?.trend?.toLowerCase() || 'stable'} trend`,
                icon: <Users className="w-5 h-5 text-purple-600" />,
                impact: governanceMetricsData?.percentageWomen >= 30 ? 'High' : governanceMetricsData?.percentageWomen >= 20 ? 'Medium' : 'Low',
                confidence: 0.88,
            },
            {
                title: 'ESG-Linked Compensation',
                description: `${governanceMetricsData?.esgLinkedPayPercentage?.toFixed(1) || '0'}% of executive pay linked to ESG metrics`,
                icon: <DollarSign className="w-5 h-5 text-blue-600" />,
                impact: governanceMetricsData?.esgLinkedPayPercentage > 10 ? 'High' : governanceMetricsData?.esgLinkedPayPercentage > 0 ? 'Medium' : 'Low',
                confidence: 0.75,
            },
        ],
        risks: [
            {
                title: 'Regulatory Compliance Risk',
                description: `${governanceMetricsData?.regulatoryIncidents || 0} regulatory incidents reported`,
                icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
                priority: governanceMetricsData?.regulatoryIncidents > 5 ? 'High' : governanceMetricsData?.regulatoryIncidents > 2 ? 'Medium' : 'Low',
                timeframe: 'Immediate',
            },
            {
                title: 'Board Diversity Gap',
                description: `${governanceMetricsData?.percentageWomen?.toFixed(1) || '0'}% women on board, below 30% target`,
                icon: <Users className="w-5 h-5 text-amber-600" />,
                priority: governanceMetricsData?.percentageWomen < 20 ? 'High' : governanceMetricsData?.percentageWomen < 30 ? 'Medium' : 'Low',
                timeframe: 'Monitor',
            },
            {
                title: 'Policy Implementation',
                description: `${governanceMetricsData?.whistleblowingStatus === 'Implemented' ? 'Whistleblowing' : 'Key policies'} not fully implemented`,
                icon: <Shield className="w-5 h-5 text-gray-600" />,
                priority: governanceMetricsData?.whistleblowingStatus !== 'Implemented' ? 'High' : 'Low',
                timeframe: 'Strategic',
            },
        ],
        opportunities: [
            {
                title: 'Increase Board Diversity',
                description: `Opportunity to increase women representation from ${governanceMetricsData?.percentageWomen?.toFixed(1) || '0'}% to 30% target`,
                icon: <Users className="w-5 h-5 text-green-600" />,
                value: governanceMetricsData?.percentageWomen < 30 ? 'High' : 'Medium',
                timeframe: '6-12 months',
            },
            {
                title: 'Enhance ESG-Linked Pay',
                description: `Expand ESG-linked compensation from ${governanceMetricsData?.esgLinkedPayPercentage?.toFixed(1) || '0'}% to industry average`,
                icon: <DollarSign className="w-5 h-5 text-yellow-600" />,
                value: governanceMetricsData?.esgLinkedPayPercentage < 20 ? 'High' : 'Medium',
                timeframe: '1-2 years',
            },
            {
                title: 'Strengthen Committee Governance',
                description: `Improve committee effectiveness scores from current level`,
                icon: <Building className="w-5 h-5 text-blue-600" />,
                value: 'High',
                timeframe: '3-6 months',
            },
        ],
    };

    // Governance metrics analysis
    const governanceMetricsAnalysis = [
        {
            title: 'Board Size',
            value: governanceMetricsData?.boardSize || 0,
            unit: 'directors',
            trend: trends?.boardIndependenceTrend || 'Stable',
            icon: <Users className="w-6 h-6 text-gray-600" />,
        },
        {
            title: 'Board Independence',
            value: governanceMetricsData?.boardIndependence || 0,
            unit: '%',
            trend: governanceMetricsData?.boardIndependence >= 50 ? 'Excellent' : 'Needs Improvement',
            target: '50%',
            icon: <UserCheck className="w-6 h-6 text-green-600" />,
        },
        {
            title: 'Women on Board',
            value: governanceMetricsData?.percentageWomen || 0,
            unit: '%',
            trend: governanceMetricsData?.percentageWomen >= 30 ? 'Good' : 'Needs Improvement',
            target: '30%',
            icon: <Users className="w-6 h-6 text-purple-600" />,
        },
        {
            title: 'Governance Score',
            value: governanceMetricsData?.governanceScore || 0,
            unit: '/100',
            trend: trends?.governanceScoreTrend || 'Stable',
            icon: <Award className="w-6 h-6 text-emerald-600" />,
        },
    ];

    // Board composition breakdown
    const boardCompositionBreakdown = useMemo(() => {
        if (!boardComposition?.size_and_structure) return [];

        const structure = boardComposition.size_and_structure;
        const total = structure.total_directors;

        return [
            {
                type: 'Independent Directors',
                percentage: total > 0 ? (structure.independent_directors / total) * 100 : 0,
                value: structure.independent_directors,
                icon: <UserCheck className="w-4 h-4 text-green-600" />,
            },
            {
                type: 'Executive Directors',
                percentage: total > 0 ? (structure.executive_directors / total) * 100 : 0,
                value: structure.executive_directors,
                icon: <Briefcase className="w-4 h-4 text-blue-600" />,
            },
            {
                type: 'Non-Executive Directors',
                percentage: total > 0 ? (structure.non_executive_directors / total) * 100 : 0,
                value: structure.non_executive_directors,
                icon: <Users className="w-4 h-4 text-gray-600" />,
            },
        ];
    }, [boardComposition]);

    // Committee analysis
    const committeesAnalysis = useMemo(() => {
        if (!boardCommittees?.committees) return [];

        return boardCommittees.committees.map((committee: any) => ({
            name: committee.name,
            meetings: committee.meetings_held,
            members: committee.members,
            independent: committee.independent_members,
            icon: committee.name?.includes('Audit') ? <FileText className="w-5 h-5 text-blue-600" /> :
                committee.name?.includes('Compensation') ? <DollarSign className="w-5 h-5 text-green-600" /> :
                    committee.name?.includes('Governance') ? <Building className="w-5 h-5 text-purple-600" /> :
                        <Users className="w-5 h-5 text-gray-600" />,
        }));
    }, [boardCommittees]);

    // Ethics and compliance status
    const ethicsComplianceData = [
        {
            title: 'Ethics Code',
            status: governanceMetricsData?.ethicsCodeStatus === 'Implemented',
            icon: <ShieldCheck className="w-5 h-5 text-green-600" />,
            lastReview: ethicsAndCompliance?.policies_in_place?.ethics_code?.last_review,
        },
        {
            title: 'Anti-Corruption Policy',
            status: governanceMetricsData?.antiCorruptionStatus === 'Implemented',
            icon: <Lock className="w-5 h-5 text-red-600" />,
            incidents: ethicsAndCompliance?.policies_in_place?.anti_corruption?.incidents_reported,
        },
        {
            title: 'Whistleblowing Mechanism',
            status: governanceMetricsData?.whistleblowingStatus === 'Implemented',
            icon: <Eye className="w-5 h-5 text-blue-600" />,
            reports: ethicsAndCompliance?.policies_in_place?.whistleblowing?.reports_received,
        },
        {
            title: 'Supplier Code',
            status: ethicsAndCompliance?.policies_in_place?.supplier_code?.status === 'Implemented',
            icon: <Package className="w-5 h-5 text-amber-600" />,
            suppliers: ethicsAndCompliance?.policies_in_place?.supplier_code?.suppliers_covered,
        },
    ];

    // Executive compensation analysis
    const executiveCompensationData = [
        {
            title: 'ESG-Linked Pay',
            value: governanceMetricsData?.esgLinkedPayPercentage || 0,
            unit: '%',
            status: governanceMetricsData?.esgLinkedPayStatus === 'Implemented' ? 'Implemented' : 'Not Implemented',
            icon: <DollarSign className="w-5 h-5 text-green-600" />,
        },
        {
            title: 'CEO Pay Ratio',
            value: governanceMetricsData?.payRatio,
            unit: '',
            status: governanceMetricsData?.payRatio?.includes(':') ? 'Disclosed' : 'Not Disclosed',
            icon: <Scale className="w-5 h-5 text-blue-600" />,
        },
        {
            title: 'Shareholder Approval',
            value: governanceMetricsData?.shareholderApprovalRate || 0,
            unit: '%',
            status: governanceMetricsData?.shareholderApprovalRate > 80 ? 'Strong' : 'Moderate',
            icon: <UsersIcon className="w-5 h-5 text-purple-600" />,
        },
        {
            title: 'Fines & Penalties',
            value: governanceMetricsData?.finesPenalties || 0,
            unit: '$',
            status: governanceMetricsData?.finesPenalties === 0 ? 'None' : 'Issued',
            icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
        },
    ];

    // Performance indicators
    const performanceIndicatorsData = [
        {
            title: 'Board Meetings',
            value: governanceMetricsData?.boardMeetings || 0,
            unit: 'meetings',
            trend: governanceMetricsData?.boardMeetings >= 6 ? 'Good' : 'Below Target',
            icon: <Calendar className="w-5 h-5 text-green-600" />,
        },
        {
            title: 'Committee Attendance',
            value: parseFloat(boardCommittees?.committee_effectiveness?.attendance_rate?.replace('%', '') || "0"),
            unit: '%',
            trend: parseFloat(boardCommittees?.committee_effectiveness?.attendance_rate?.replace('%', '') || "0") > 90 ? 'Excellent' : 'Good',
            icon: <Users className="w-5 h-5 text-blue-600" />,
        },
        {
            title: 'Regulatory Incidents',
            value: governanceMetricsData?.regulatoryIncidents || 0,
            unit: 'incidents',
            trend: governanceMetricsData?.regulatoryIncidents === 0 ? 'Excellent' : 'Monitor',
            icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
        },
        {
            title: 'Policy Implementation Rate',
            value: (ethicsComplianceData.filter(item => item.status).length / ethicsComplianceData.length) * 100,
            unit: '%',
            trend: (ethicsComplianceData.filter(item => item.status).length / ethicsComplianceData.length) * 100 > 75 ? 'Good' : 'Needs Improvement',
            icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
        },
    ];

    // Simplified explanations for governance terms
    const simpleExplanations = {
        'Board Independence': 'Percentage of board members who are independent (not employed by the company)',
        'ESG-Linked Pay': 'Portion of executive compensation tied to environmental, social, and governance performance',
        'Whistleblowing Mechanism': 'System for employees to report unethical behavior without fear of retaliation',
        'CEO Pay Ratio': 'Ratio of CEO compensation to median employee compensation',
        'Board Diversity': 'Representation of different genders, ages, and nationalities on the board',
        'Governance Score': 'Overall assessment of corporate governance quality and practices',
    };

    // Governance initiatives
    const governanceInitiativesData = useMemo(() => {
        if (!governanceInitiatives?.active_programs) return [];

        return governanceInitiatives.active_programs.map((program: any) => ({
            name: program.name,
            description: program.description,
            progress: program.progress,
            impact: program.impact,
            icon: program.name?.includes('Training') ? <BookOpen className="w-5 h-5 text-green-600" /> :
                program.name?.includes('Diversity') ? <Users className="w-5 h-5 text-purple-600" /> :
                    <TargetIcon className="w-5 h-5 text-blue-600" />,
        }));
    }, [governanceInitiatives]);

    // External benchmarks
    const externalBenchmarksData = useMemo(() => {
        if (!governanceBenchmarks) return { awards: [], assessments: [] };

        return {
            awards: governanceBenchmarks.awards_recognition?.slice(0, 3) || [],
            assessments: governanceBenchmarks.external_assessments?.slice(0, 3) || [],
        };
    }, [governanceBenchmarks]);

    return (
        <div className="space-y-8 pb-8">

            {/* Key Insights Section */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10 hover:shadow-2xl transition-shadow duration-300">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                            Governance & Board Analytics
                        </h3>
                        <p className="text-gray-600 text-lg">Comprehensive analysis of corporate governance, board effectiveness, and compliance</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <button
                            onClick={() => setActiveInsightTab('trends')}
                            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${activeInsightTab === 'trends'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200 scale-105'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Trends
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveInsightTab('risks')}
                            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${activeInsightTab === 'risks'
                                ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg shadow-red-200 scale-105'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Risks & Alerts
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveInsightTab('opportunities')}
                            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${activeInsightTab === 'opportunities'
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-200 scale-105'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                Opportunities
                            </div>
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(activeInsightTab === 'trends' ? insights.trends :
                        activeInsightTab === 'risks' ? insights.risks :
                            insights.opportunities).map((insight, index) => (
                                <div
                                    key={index}
                                    className="group p-7 rounded-3xl border-2 border-gray-200 hover:border-green-400 bg-gradient-to-br from-white to-gray-50 hover:from-green-50 hover:to-emerald-50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                                >
                                    <div className="flex items-start gap-4 mb-5">
                                        <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-green-100 group-hover:to-emerald-100 transition-all duration-300 group-hover:scale-110">
                                            {insight.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-green-700 transition-colors">
                                                {insight.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {insight.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                        <span className={`px-4 py-2 rounded-xl text-xs font-bold ${(insight.impact || insight.priority || insight.value) === 'High'
                                            ? 'bg-green-100 text-green-700'
                                            : (insight.impact || insight.priority || insight.value) === 'Medium'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {insight.impact || insight.priority || insight.value}
                                        </span>
                                        <span className="text-xs text-gray-500 font-semibold">
                                            {insight.timeframe || `${('confidence' in insight ? insight.confidence * 100 : 85).toFixed(0)}% confidence`}
                                        </span>
                                    </div>
                                </div>
                            ))}
                </div>
            </div>

            {/* Governance Metrics Analysis */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                    Governance Metrics Analysis
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                    {governanceMetricsAnalysis.map((metric, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-3xl border-2 border-gray-200 hover:border-green-400 bg-gradient-to-br from-white to-gray-50 hover:from-green-50 hover:to-emerald-50 transition-all duration-300 hover:shadow-xl cursor-pointer"
                            onClick={() => {
                                setSelectedMetric(metric);
                                setIsModalOpen(true);
                            }}
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                                    {metric.icon}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-lg text-gray-900 mb-2">{metric.title}</h4>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {formatNumber(metric.value)} <span className="text-lg text-gray-600">{metric.unit}</span>
                                    </p>
                                    {'target' in metric && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            Target: {metric.target}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                                {getTrendIcon(metric.trend)}
                                <span className="text-sm font-semibold text-gray-700">{metric.trend}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Board Composition & Committees */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Board Composition Breakdown */}
                    <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Users className="w-5 h-5 text-green-600" />
                            Board Composition
                        </h4>
                        <div className="space-y-4">
                            {boardCompositionBreakdown.map((item, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {item.icon}
                                            <span className="font-semibold text-gray-900">{item.type}</span>
                                        </div>
                                        <span className="font-bold text-gray-900">{item.percentage.toFixed(1)}%</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {formatNumber(item.value)} directors
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Committees Analysis */}
                    <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Building className="w-5 h-5 text-blue-600" />
                            Committee Performance
                        </h4>
                        <div className="space-y-4">
                            {committeesAnalysis.map((committee, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-blue-50 to-cyan-50"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {committee.icon}
                                            <span className="font-semibold text-gray-900">{committee.name}</span>
                                        </div>
                                        <span className="font-bold text-gray-900">
                                            {committee.meetings} meetings
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {committee.members} members ({committee.independent} independent)
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Ethics & Compliance Analysis */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                    Ethics & Compliance Analysis
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {ethicsComplianceData.map((item, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-3xl border-2 border-gray-200 hover:border-blue-400 bg-gradient-to-br from-white to-gray-50 hover:from-blue-50 hover:to-cyan-50 transition-all duration-300 hover:shadow-xl"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">{item.title}</p>
                                    <p className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        {item.status ? (
                                            <>
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                                <span className="text-green-700">Implemented</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-5 h-5 text-red-600" />
                                                <span className="text-red-700">Not Implemented</span>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                            {item.lastReview && (
                                <p className="text-xs text-gray-500 mt-2">Last review: {item.lastReview}</p>
                            )}
                            {'incidents' in item && item.incidents !== undefined && (
                                <p className="text-xs text-gray-500 mt-2">Incidents: {item.incidents}</p>
                            )}
                            {'reports' in item && item.reports !== undefined && (
                                <p className="text-xs text-gray-500 mt-2">Reports: {item.reports}</p>
                            )}
                            {'suppliers' in item && item.suppliers && (
                                <p className="text-xs text-gray-500 mt-2">Suppliers: {item.suppliers}</p>
                            )}
                        </div>
                    ))}
                </div>
                <div className="p-6 rounded-3xl bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-2 font-medium">Regulatory Incidents</p>
                            <p className="text-4xl font-bold text-red-700">
                                {governanceMetricsData?.regulatoryIncidents || 0}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-2 font-medium">Fines & Penalties</p>
                            <p className="text-4xl font-bold text-orange-600">
                                {formatCurrency(governanceMetricsData?.finesPenalties || 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Executive Compensation */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                    Executive Compensation Analysis
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {executiveCompensationData.map((item, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-3xl border-2 border-gray-200 hover:border-green-400 bg-gradient-to-br from-white to-gray-50 hover:from-green-50 hover:to-emerald-50 transition-all duration-300 hover:shadow-xl"
                        >
                            <div className="flex items-start gap-3 mb-4">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                                    {item.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h4>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {typeof item.value === 'number' ? formatNumber(item.value) : item.value}
                                        <span className="text-lg text-gray-600"> {item.unit}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'Implemented' || item.status === 'Strong' || item.status === 'None'
                                        ? 'bg-green-100 text-green-700'
                                        : item.status === 'Disclosed' || item.status === 'Moderate'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                    {item.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Performance Indicators */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                    Governance Performance Indicators
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {performanceIndicatorsData.map((indicator, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-3xl border-2 border-gray-200 hover:border-green-400 bg-gradient-to-br from-white to-gray-50 hover:from-green-50 hover:to-emerald-50 transition-all duration-300 hover:shadow-xl"
                        >
                            <div className="flex items-start gap-3 mb-4">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                                    {indicator.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900 mb-2">{indicator.title}</h4>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {typeof indicator.value === 'number' ? indicator.value.toFixed(2) : indicator.value}
                                        <span className="text-lg text-gray-600"> {indicator.unit}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                                {getTrendIcon(indicator.trend)}
                                <span className="text-sm font-semibold text-gray-700">{indicator.trend}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Governance Initiatives & Benchmarks */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Governance Initiatives */}
                    <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <TargetIcon className="w-5 h-5 text-green-600" />
                            Active Governance Initiatives
                        </h4>
                        <div className="space-y-4">
                            {governanceInitiativesData.slice(0, 3).map((initiative, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        {initiative.icon}
                                        <span className="font-semibold text-gray-900">{initiative.name}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{initiative.description}</p>
                                    {initiative.progress && (
                                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full"
                                                style={{ width: initiative.progress }}
                                            ></div>
                                        </div>
                                    )}
                                    {initiative.impact && (
                                        <p className="text-xs text-gray-500">Impact: {initiative.impact}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* External Benchmarks */}
                    <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <AwardIcon className="w-5 h-5 text-purple-600" />
                            External Benchmarks
                        </h4>
                        <div className="space-y-4">
                            {externalBenchmarksData.awards.map((award: any, index: number) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-purple-50 to-pink-50"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Trophy className="w-4 h-4 text-yellow-600" />
                                        <span className="font-semibold text-gray-900">{award.name}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">{award.organization} ({award.year})</p>
                                </div>
                            ))}
                            {externalBenchmarksData.assessments.map((assessment: any, index: number) => (
                                <div
                                    key={`assessment-${index}`}
                                    className="p-4 rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-blue-50 to-cyan-50"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Star className="w-4 h-4 text-blue-600" />
                                        <span className="font-semibold text-gray-900">{assessment.framework}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">Status: {assessment.status} ({assessment.last_assessment})</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Simplified Explanations */}
            <div className="bg-gradient-to-br from-white to-green-50 rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 shadow-lg">
                        <Info className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900">In Simple Terms</h3>
                        <p className="text-gray-600 text-lg">Understanding governance metrics made easy</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(simpleExplanations).map(([term, explanation], index) => (
                        <div
                            key={index}
                            className="group p-7 rounded-3xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 hover:border-green-400 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-4 rounded-2xl bg-white shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                                    <Building className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-green-700 transition-colors">
                                        {term}
                                    </h4>
                                    <p className="text-gray-700 leading-relaxed font-medium">{explanation}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Data Quality & Methodology */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <ShieldCheck className="w-7 h-7 text-green-600" />
                        Data Quality
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-gray-50">
                            <p className="text-sm text-gray-600 mb-2">Reporting Year</p>
                            <p className="text-xl font-bold text-gray-900">{reportingYear}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-gray-50">
                            <p className="text-sm text-gray-600 mb-2">Governance Metrics Tracked</p>
                            <p className="text-xl font-bold text-gray-900">{governanceMetrics?.total_metrics || 0} metrics</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-gray-50">
                            <p className="text-sm text-gray-600 mb-2">Data Completeness</p>
                            <p className="text-xl font-bold text-gray-900">
                                {dataQuality?.verification_status?.unverified === 0 ? 'High' : 'Medium'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <Settings className="w-7 h-7 text-blue-600" />
                        Calculation Methodology
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-green-50 border border-green-200">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Governance Score</p>
                            <p className="text-sm text-gray-700">Board Independence + Gender Diversity + Committee Effectiveness + Compliance</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Board Independence</p>
                            <p className="text-sm text-gray-700">(Independent Directors / Total Directors) × 100</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Gender Diversity</p>
                            <p className="text-sm text-gray-700">(Women Directors / Total Directors) × 100</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary & Recommendations */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border-2 border-green-200 shadow-xl p-10">
                <div className="flex items-start gap-6">
                    <div className="p-5 rounded-3xl bg-white shadow-lg">
                        <Lightbulb className="w-12 h-12 text-green-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Key Summary & Insight</h3>
                        <p className="text-gray-700 text-lg mb-4">
                            Your governance performance shows {governanceMetricsData?.governanceScore > 75 ? 'strong' : 'moderate'} governance practices with opportunities for improvement in board diversity and policy implementation.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowRecommendationsModal(true)}
                                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all font-bold hover:scale-105 shadow-lg"
                            >
                                View Recommendations
                            </button>
                            <button className="px-6 py-3 bg-white border-2 border-green-500 text-green-600 rounded-2xl hover:bg-green-50 transition-all font-bold hover:scale-105 shadow-md">
                                Download Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metric Detail Modal */}
            {isModalOpen && selectedMetric && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-fadeIn" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full animate-slideUp" onClick={(e) => e.stopPropagation()}>
                        <div className="p-8 border-b-2 border-green-100 bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 text-white rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-3xl font-bold mb-2">Metric Details</h3>
                                    <p className="text-green-100 text-lg">{selectedMetric.title}</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-3 rounded-2xl bg-white/20 hover:bg-white/30 transition-all hover:scale-110"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-10">
                            <div className="space-y-5">
                                {Object.entries(selectedMetric).map(([key, value]) => {
                                    if (key === 'icon') return null;
                                    return (
                                        <div key={key} className="p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                            <div className="text-sm text-gray-600 mb-2 capitalize font-semibold">{key.replace(/_/g, ' ')}</div>
                                            <div className="font-bold text-gray-900 text-lg">
                                                {typeof value === 'number' ?
                                                    (key.includes('value') ? formatNumber(value) : value.toFixed(2))
                                                    : String(value)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recommendations Modal */}
            {showRecommendationsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-fadeIn" onClick={() => setShowRecommendationsModal(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-slideUp" onClick={(e) => e.stopPropagation()}>
                        <div className="p-8 border-b-2 border-green-100 bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 text-white rounded-t-3xl sticky top-0 z-10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-md">
                                        <Lightbulb className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-bold">Governance Action Recommendations</h3>
                                        <p className="text-green-100 text-lg mt-1">Based on your governance analytics</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowRecommendationsModal(false)}
                                    className="p-3 rounded-2xl bg-white/20 hover:bg-white/30 transition-all hover:scale-110"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-10 space-y-6">
                            {[
                                {
                                    title: 'Increase Board Diversity',
                                    description: `Current women representation is ${governanceMetricsData?.percentageWomen?.toFixed(1) || '0'}%. Aim for at least 30% women on board.`,
                                    impact: 'High',
                                    effort: 'Medium',
                                    timeframe: '6-12 months',
                                    icon: <Users className="w-6 h-6 text-purple-600" />,
                                },
                                {
                                    title: 'Strengthen ESG-Linked Pay',
                                    description: `Only ${governanceMetricsData?.esgLinkedPayPercentage?.toFixed(1) || '0'}% of executive pay is linked to ESG metrics. Increase to industry average of 20%.`,
                                    impact: 'High',
                                    effort: 'Medium',
                                    timeframe: '1-2 years',
                                    icon: <DollarSign className="w-6 h-6 text-green-600" />,
                                },
                                governanceMetricsData?.boardIndependence < 50 && {
                                    title: 'Improve Board Independence',
                                    description: `Board independence at ${governanceMetricsData?.boardIndependence?.toFixed(1) || '0'}%. Increase independent directors to reach 50% target.`,
                                    impact: 'High',
                                    effort: 'High',
                                    timeframe: '1 year',
                                    icon: <UserCheck className="w-6 h-6 text-blue-600" />,
                                },
                                governanceMetricsData?.whistleblowingStatus !== 'Implemented' && {
                                    title: 'Implement Whistleblowing Mechanism',
                                    description: `Whistleblowing mechanism not implemented. Establish anonymous reporting system with proper safeguards.`,
                                    impact: 'Medium',
                                    effort: 'Low',
                                    timeframe: '3 months',
                                    icon: <Eye className="w-6 h-6 text-red-600" />,
                                },
                                {
                                    title: 'Enhance Committee Effectiveness',
                                    description: `Committee attendance at ${parseFloat(boardCommittees?.committee_effectiveness?.attendance_rate?.replace('%', '') || "0")}%. Implement regular effectiveness reviews.`,
                                    impact: 'Medium',
                                    effort: 'Low',
                                    timeframe: '3 months',
                                    icon: <Building className="w-6 h-6 text-amber-600" />,
                                },
                                governanceMetricsData?.regulatoryIncidents > 0 && {
                                    title: 'Compliance Training Program',
                                    description: `${governanceMetricsData?.regulatoryIncidents || 0} regulatory incidents reported. Implement comprehensive compliance training.`,
                                    impact: 'High',
                                    effort: 'High',
                                    timeframe: '2 years',
                                    icon: <AlertTriangle className="w-6 h-6 text-emerald-600" />,
                                },
                            ].filter(Boolean).map((recommendation, index) => (
                                recommendation && (
                                    <div key={index} className="group p-8 rounded-3xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-green-400 hover:shadow-2xl transition-all duration-300">
                                        <div className="flex items-start gap-6">
                                            <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 group-hover:scale-110 transition-transform">
                                                {recommendation.icon}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-xl text-gray-900 mb-3">{recommendation.title}</h4>
                                                <p className="text-gray-700 leading-relaxed mb-5 font-medium">{recommendation.description}</p>
                                                <div className="flex items-center gap-4 flex-wrap">
                                                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-xl text-sm font-bold">
                                                        Impact: {recommendation.impact}
                                                    </span>
                                                    <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-xl text-sm font-bold">
                                                        Effort: {recommendation.effort}
                                                    </span>
                                                    <span className="px-4 py-2 bg-amber-100 text-amber-800 rounded-xl text-sm font-bold">
                                                        Time: {recommendation.timeframe}
                                                    </span>
                                                </div>
                                            </div>
                                            <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all font-bold hover:scale-105 shadow-lg">
                                                Start
                                            </button>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default GovernanceAnalyticsTab;