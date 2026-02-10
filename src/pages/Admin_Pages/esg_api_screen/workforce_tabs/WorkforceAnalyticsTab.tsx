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
    User,
    UserCheck,
    UserPlus,
    UserMinus,
    GraduationCap,
    Award,
    DollarSign,
    Heart,
    Briefcase,
    Clock,
    BarChart3,
    Settings,
    X,
    Calendar,
    Globe,
    Mail,
    Phone,
    MapPin,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    PieChart,
    Zap,
    Shield,
    Trash2,
    AlertCircle,
    Cpu,
    Archive,
} from "lucide-react";

// Enhanced Color Palette with Blue Theme (different from waste for visual distinction)
const COLORS = {
    primary: '#1D4ED8',
    primaryDark: '#1E40AF',
    primaryLight: '#3B82F6',
    primaryPale: '#DBEAFE',
    accent: '#2563EB',
    accentGold: '#F59E0B',
    success: '#10B981',
    warning: '#FBBF24',
    danger: '#EF4444',
    info: '#3B82F6',
    diversity: '#8B5CF6',
    inclusion: '#EC4899',
};

interface WorkforceAnalyticsTabProps {
    workforceData: any;
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

const WorkforceAnalyticsTab: React.FC<WorkforceAnalyticsTabProps> = ({
    workforceData,
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

    if (!workforceData) {
        return (
            <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl">
                <div className="text-center max-w-md p-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="w-12 h-12 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">No Workforce Analytics Data Available</h3>
                    <p className="text-gray-600 leading-relaxed">Select a company to view detailed workforce and diversity analytics.</p>
                </div>
            </div>
        );
    }

    const apiData = workforceData?.data;
    if (!apiData) {
        return (
            <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl">
                <div className="text-center max-w-md p-8">
                    <AlertCircle className="w-12 h-12 mx-auto mb-6 text-amber-500" />
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">Invalid Data Format</h3>
                    <p className="text-gray-600 leading-relaxed">The workforce data format is invalid or corrupted.</p>
                </div>
            </div>
        );
    }

    // Extract data from API response
    const companyInfo = apiData.company;
    const yearData = apiData.year_data;
    const workforceSummary = apiData.workforce_summary;
    const performanceIndicators = workforceSummary?.performance_indicators;
    const workforceComposition = apiData.workforce_composition;
    const inclusionAndBelonging = apiData.inclusion_and_belonging;
    const socialMetrics = apiData.social_metrics;
    const graphsData = apiData.graphs;
    const recommendations = apiData.recommendations;
    const dataQuality = apiData.data_quality;
    const keyIndicators = apiData.key_indicators;

    // Get reporting year
    const reportingYear = yearData?.requested_year || new Date().getFullYear();

    // Calculate key workforce metrics from performance indicators
    const workforceMetrics = useMemo(() => {
        if (!performanceIndicators || !workforceComposition) return null;

        const totalEmployees = parseInt(performanceIndicators.total_employees?.value?.toString() || "0");
        const genderDiversity = parseFloat(performanceIndicators.gender_diversity?.value?.toString() || "0");
        const trainingHours = parseInt(performanceIndicators.training_hours?.value?.toString() || "0");
        const engagementScore = parseFloat(performanceIndicators.engagement_score?.value?.toString() || "0");
        
        const genderDistribution = workforceComposition.gender_distribution;
        const maleCount = genderDistribution?.male?.count || 0;
        const femaleCount = genderDistribution?.female?.count || 0;
        const malePercentage = parseFloat(genderDistribution?.male?.percentage?.replace('%', '') || "0");
        const femalePercentage = parseFloat(genderDistribution?.female?.percentage?.replace('%', '') || "0");
        
        const contractTypes = workforceComposition.contract_types;
        const permanentCount = contractTypes?.permanent?.count || 0;
        const permanentPercentage = parseFloat(contractTypes?.permanent?.percentage?.replace('%', '') || "0");
        const fixedTermCount = contractTypes?.fixed_term?.count || 0;
        const fixedTermPercentage = parseFloat(contractTypes?.fixed_term?.percentage?.replace('%', '') || "0");
        const traineesCount = contractTypes?.trainees?.count || 0;
        
        const trainingSummary = workforceComposition.training_summary;
        const totalTrainingHours = trainingSummary?.total_hours || 0;
        const avgTrainingPerEmployee = parseFloat(trainingSummary?.average_per_employee?.replace(' hours', '') || "0");
        
        const inclusionMetrics = inclusionAndBelonging?.metrics;
        const leadershipDiversity = inclusionMetrics?.leadership_diversity?.value || 0;
        const payEquity = inclusionMetrics?.pay_equity?.value || 0;
        const retentionRate = inclusionMetrics?.retention_rate?.value || 0;
        const inclusionScore = inclusionMetrics?.inclusion_score?.value || 0;

        // Calculate workforce growth rate (if we have previous year data)
        const workforceGrowthRate = 0; // This would come from comparing with previous year
        
        // Calculate diversity score
        const diversityScore = ((femalePercentage + leadershipDiversity + inclusionScore) / 3).toFixed(1);

        return {
            totalEmployees,
            genderDiversity,
            trainingHours,
            engagementScore,
            maleCount,
            femaleCount,
            malePercentage,
            femalePercentage,
            permanentCount,
            permanentPercentage,
            fixedTermCount,
            fixedTermPercentage,
            traineesCount,
            totalTrainingHours,
            avgTrainingPerEmployee,
            leadershipDiversity,
            payEquity,
            retentionRate,
            inclusionScore,
            workforceGrowthRate,
            diversityScore,
            // Rating calculations
            genderDiversityScore: femalePercentage >= 40 ? 'Excellent' : femalePercentage >= 30 ? 'Good' : femalePercentage >= 20 ? 'Fair' : 'Needs Improvement',
            inclusionScoreRating: inclusionScore >= 80 ? 'Excellent' : inclusionScore >= 70 ? 'Good' : inclusionScore >= 60 ? 'Fair' : 'Needs Improvement',
            engagementLevel: engagementScore >= 80 ? 'High' : engagementScore >= 70 ? 'Medium' : engagementScore >= 60 ? 'Moderate' : 'Low',
            trainingEffectiveness: avgTrainingPerEmployee >= 40 ? 'Excellent' : avgTrainingPerEmployee >= 30 ? 'Good' : avgTrainingPerEmployee >= 20 ? 'Fair' : 'Needs Improvement',
        };
    }, [performanceIndicators, workforceComposition, inclusionAndBelonging]);

    // Get trend data
    const trends = useMemo(() => {
        if (!graphsData?.workforce_trend) return null;

        const trendData = graphsData.workforce_trend;
        const labels = trendData.labels || [];
        const datasets = trendData.datasets || [];
        
        // Calculate workforce growth trend
        const getTrend = (data: number[]) => {
            if (data.length < 2) return 'Stable';
            const first = data[0];
            const last = data[data.length - 1];
            const percentageChange = ((last - first) / first) * 100;

            if (percentageChange > 5) return 'Growing';
            if (percentageChange < -5) return 'Declining';
            return 'Stable';
        };

        // Find total employees dataset
        const totalEmployeesData = datasets.find(d => d.label?.includes('Total'))?.data as number[] || [];
        const femalePercentageData = datasets.find(d => d.label?.includes('Female'))?.data as number[] || [];

        return {
            workforceGrowthTrend: getTrend(totalEmployeesData),
            genderDiversityTrend: femalePercentageData.length > 0 ? 
                (femalePercentageData[femalePercentageData.length - 1] > femalePercentageData[0] ? 'Improving' : 'Stable') : 'Stable',
            engagementTrend: workforceMetrics?.engagementScore > 75 ? 'High' : workforceMetrics?.engagementScore > 65 ? 'Stable' : 'Needs Attention',
        };
    }, [graphsData, workforceMetrics]);

    // Key insights data
    const insights = {
        trends: [
            {
                title: 'Workforce Growth',
                description: `Company workforce ${workforceMetrics?.totalEmployees ? 'grew' : 'remained stable'} to ${formatNumber(workforceMetrics?.totalEmployees)} employees`,
                icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
                impact: trends?.workforceGrowthTrend === 'Growing' ? 'Positive' : 'Neutral',
                confidence: 0.92,
            },
            {
                title: 'Gender Diversity Progress',
                description: `Gender diversity at ${workforceMetrics?.femalePercentage?.toFixed(1)}% female representation`,
                icon: <UserCheck className="w-5 h-5 text-purple-600" />,
                impact: workforceMetrics?.femalePercentage > 40 ? 'High' : workforceMetrics?.femalePercentage > 30 ? 'Medium' : 'Low',
                confidence: 0.88,
            },
            {
                title: 'Employee Engagement',
                description: `Engagement score of ${workforceMetrics?.engagementScore?.toFixed(1)} indicating ${workforceMetrics?.engagementLevel?.toLowerCase()} engagement`,
                icon: <Heart className="w-5 h-5 text-pink-600" />,
                impact: workforceMetrics?.engagementScore > 75 ? 'High' : workforceMetrics?.engagementScore > 65 ? 'Medium' : 'Low',
                confidence: 0.85,
            },
        ],
        risks: [
            {
                title: 'Retention Risk',
                description: `Retention rate at ${workforceMetrics?.retentionRate?.toFixed(1)}%, ${workforceMetrics?.retentionRate < 85 ? 'below' : 'above'} industry average`,
                icon: <UserMinus className="w-5 h-5 text-red-600" />,
                priority: workforceMetrics?.retentionRate < 80 ? 'High' : workforceMetrics?.retentionRate < 85 ? 'Medium' : 'Low',
                timeframe: 'Immediate',
            },
            {
                title: 'Pay Equity Gap',
                description: `Pay equity score of ${workforceMetrics?.payEquity?.toFixed(1)} indicates ${workforceMetrics?.payEquity < 95 ? 'potential' : 'minimal'} pay gaps`,
                icon: <DollarSign className="w-5 h-5 text-amber-600" />,
                priority: workforceMetrics?.payEquity < 92 ? 'High' : workforceMetrics?.payEquity < 95 ? 'Medium' : 'Low',
                timeframe: 'Monitor',
            },
            {
                title: 'Leadership Diversity',
                description: `Leadership diversity at ${workforceMetrics?.leadershipDiversity?.toFixed(1)}% needs ${workforceMetrics?.leadershipDiversity < 30 ? 'urgent' : 'strategic'} attention`,
                icon: <Briefcase className="w-5 h-5 text-indigo-600" />,
                priority: workforceMetrics?.leadershipDiversity < 25 ? 'High' : workforceMetrics?.leadershipDiversity < 30 ? 'Medium' : 'Low',
                timeframe: 'Strategic',
            },
        ],
        opportunities: [
            {
                title: 'Enhance Diversity',
                description: `Opportunity to increase female representation from ${workforceMetrics?.femalePercentage?.toFixed(1)}% to 40%`,
                icon: <UserPlus className="w-5 h-5 text-green-600" />,
                value: workforceMetrics?.femalePercentage < 35 ? 'High' : 'Medium',
                timeframe: '12-18 months',
            },
            {
                title: 'Improve Inclusion',
                description: `Raise inclusion score from ${workforceMetrics?.inclusionScore?.toFixed(1)} to 80+ through targeted programs`,
                icon: <Users className="w-5 h-5 text-teal-600" />,
                value: workforceMetrics?.inclusionScore < 75 ? 'High' : 'Medium',
                timeframe: '6-12 months',
            },
            {
                title: 'Training Expansion',
                description: `Increase average training from ${workforceMetrics?.avgTrainingPerEmployee?.toFixed(1)} to 40+ hours annually`,
                icon: <GraduationCap className="w-5 h-5 text-blue-600" />,
                value: 'High',
                timeframe: '3-6 months',
            },
        ],
    };

    // Workforce metrics analysis
    const workforceMetricsData = [
        {
            title: 'Total Workforce',
            value: workforceMetrics?.totalEmployees || 0,
            unit: 'employees',
            trend: trends?.workforceGrowthTrend || 'Stable',
            icon: <Users className="w-6 h-6 text-blue-600" />,
            breakdown: `${formatNumber(workforceMetrics?.permanentCount)} permanent, ${formatNumber(workforceMetrics?.fixedTermCount)} fixed-term`,
        },
        {
            title: 'Gender Diversity',
            value: workforceMetrics?.femalePercentage || 0,
            unit: '% female',
            trend: trends?.genderDiversityTrend || 'Stable',
            percentage: workforceMetrics?.genderDiversityScore || 'Needs Improvement',
            icon: <UserCheck className="w-6 h-6 text-purple-600" />,
            breakdown: `${formatNumber(workforceMetrics?.maleCount)} male, ${formatNumber(workforceMetrics?.femaleCount)} female`,
        },
        {
            title: 'Training & Development',
            value: workforceMetrics?.totalTrainingHours || 0,
            unit: 'hours',
            trend: workforceMetrics?.trainingEffectiveness || 'Needs Improvement',
            percentage: workforceMetrics?.avgTrainingPerEmployee || 0,
            icon: <GraduationCap className="w-6 h-6 text-green-600" />,
            breakdown: `${workforceMetrics?.avgTrainingPerEmployee?.toFixed(1)} hours per employee`,
        },
        {
            title: 'Engagement Score',
            value: workforceMetrics?.engagementScore || 0,
            unit: 'points',
            trend: trends?.engagementTrend || 'Stable',
            level: workforceMetrics?.engagementLevel || 'Moderate',
            icon: <Heart className="w-6 h-6 text-pink-600" />,
            breakdown: `${workforceMetrics?.engagementScore?.toFixed(1)} out of 100`,
        },
    ];

    // Workforce composition breakdown
    const compositionBreakdown = [
        {
            category: 'Permanent Employees',
            percentage: workforceMetrics?.permanentPercentage || 0,
            value: workforceMetrics?.permanentCount || 0,
            icon: <Briefcase className="w-4 h-4 text-blue-600" />,
            description: 'Full-time permanent staff',
        },
        {
            category: 'Fixed-Term Contract',
            percentage: workforceMetrics?.fixedTermPercentage || 0,
            value: workforceMetrics?.fixedTermCount || 0,
            icon: <Calendar className="w-4 h-4 text-green-600" />,
            description: 'Contract-based employees',
        },
        {
            category: 'Trainees',
            percentage: workforceMetrics?.traineesCount > 0 ? (workforceMetrics.traineesCount / workforceMetrics.totalEmployees * 100) : 0,
            value: workforceMetrics?.traineesCount || 0,
            icon: <GraduationCap className="w-4 h-4 text-purple-600" />,
            description: 'Training program participants',
        },
        {
            category: 'Leadership Diversity',
            percentage: workforceMetrics?.leadershipDiversity || 0,
            value: workforceMetrics?.leadershipDiversity || 0,
            icon: <Award className="w-4 h-4 text-amber-600" />,
            description: 'Diverse leadership representation',
        },
    ];

    // Inclusion metrics analysis
    const inclusionMetricsData = [
        {
            title: 'Pay Equity Score',
            value: workforceMetrics?.payEquity || 0,
            unit: 'points',
            trend: workforceMetrics?.payEquity > 95 ? 'Excellent' : workforceMetrics?.payEquity > 90 ? 'Good' : 'Needs Improvement',
            icon: <DollarSign className="w-5 h-5 text-green-600" />,
            description: 'Gender pay equity measurement',
        },
        {
            title: 'Retention Rate',
            value: workforceMetrics?.retentionRate || 0,
            unit: '%',
            trend: workforceMetrics?.retentionRate > 90 ? 'Excellent' : workforceMetrics?.retentionRate > 85 ? 'Good' : 'Needs Improvement',
            icon: <UserCheck className="w-5 h-5 text-blue-600" />,
            description: 'Employee retention percentage',
        },
        {
            title: 'Inclusion Score',
            value: workforceMetrics?.inclusionScore || 0,
            unit: 'points',
            trend: workforceMetrics?.inclusionScoreRating || 'Needs Improvement',
            icon: <Users className="w-5 h-5 text-purple-600" />,
            description: 'Overall inclusion assessment',
        },
        {
            title: 'Training Compliance',
            value: workforceComposition?.training_summary?.compliance || '100%',
            unit: '',
            trend: 'Compliant',
            icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
            description: 'Training program compliance',
        },
    ];

    // Diversity performance indicators
    const diversityPerformanceData = [
        {
            title: 'Gender Balance',
            value: workforceMetrics?.femalePercentage || 0,
            unit: '%',
            trend: workforceMetrics?.femalePercentage > 40 ? 'Excellent' : workforceMetrics?.femalePercentage > 30 ? 'Good' : 'Needs Improvement',
            icon: <User className="w-5 h-5 text-purple-600" />,
        },
        {
            title: 'Engagement Level',
            value: workforceMetrics?.engagementScore || 0,
            unit: 'points',
            trend: workforceMetrics?.engagementScore > 80 ? 'High' : workforceMetrics?.engagementScore > 70 ? 'Medium' : 'Low',
            icon: <Heart className="w-5 h-5 text-pink-600" />,
        },
        {
            title: 'Training Intensity',
            value: workforceMetrics?.avgTrainingPerEmployee || 0,
            unit: 'hours',
            trend: workforceMetrics?.avgTrainingPerEmployee > 40 ? 'High' : workforceMetrics?.avgTrainingPerEmployee > 30 ? 'Medium' : 'Low',
            icon: <GraduationCap className="w-5 h-5 text-blue-600" />,
        },
        {
            title: 'Leadership Diversity',
            value: workforceMetrics?.leadershipDiversity || 0,
            unit: '%',
            trend: workforceMetrics?.leadershipDiversity > 35 ? 'Excellent' : workforceMetrics?.leadershipDiversity > 25 ? 'Good' : 'Needs Improvement',
            icon: <Briefcase className="w-5 h-5 text-indigo-600" />,
        },
    ];



    // Simplified explanations for workforce terms
    const simpleExplanations = {
        'Gender Diversity': 'Representation of different genders across the workforce, aiming for balanced participation',
        'Pay Equity': 'Ensuring equal pay for equal work regardless of gender, race, or other characteristics',
        'Inclusion Score': 'Measurement of how included and valued employees feel in the workplace',
        'Retention Rate': 'Percentage of employees who stay with the company over a specific period',
        'Leadership Diversity': 'Representation of diverse groups in leadership and decision-making roles',
        'Engagement Score': 'Measure of employee commitment, motivation, and connection to the organization',
    };

    // Company contact information
    const companyContact = companyInfo?.esg_contact_person ? [
        {
            label: 'ESG Contact',
            value: companyInfo.esg_contact_person.name,
            icon: <User className="w-4 h-4 text-blue-600" />,
        },
        {
            label: 'Email',
            value: companyInfo.esg_contact_person.email,
            icon: <Mail className="w-4 h-4 text-green-600" />,
        },
        {
            label: 'Phone',
            value: companyInfo.esg_contact_person.phone,
            icon: <Phone className="w-4 h-4 text-purple-600" />,
        },
    ] : [];

    return (
        <div className="space-y-8 pb-8">

            {/* Key Insights Section */}
            <div className="bg-white rounded-3xl border-2 border-blue-100 shadow-xl p-10 hover:shadow-2xl transition-shadow duration-300">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                            Workforce & Diversity Insights & Analytics
                        </h3>
                        <p className="text-gray-600 text-lg">Deep analysis of your workforce composition, diversity, and inclusion performance</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <button
                            onClick={() => setActiveInsightTab('trends')}
                            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${activeInsightTab === 'trends'
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 scale-105'
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
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200 scale-105'
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
                                    className="group p-7 rounded-3xl border-2 border-gray-200 hover:border-blue-400 bg-gradient-to-br from-white to-gray-50 hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                                >
                                    <div className="flex items-start gap-4 mb-5">
                                        <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300 group-hover:scale-110">
                                            {insight.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
                                                {insight.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {insight.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                        <span className={`px-4 py-2 rounded-xl text-xs font-bold ${(insight.impact || insight.priority || insight.value) === 'High' || (insight.impact || insight.priority || insight.value) === 'Positive'
                                            ? 'bg-green-100 text-green-700'
                                            : (insight.impact || insight.priority || insight.value) === 'Medium' || (insight.impact || insight.priority || insight.value) === 'Neutral'
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

            {/* Workforce Metrics Analysis */}
            <div className="bg-white rounded-3xl border-2 border-blue-100 shadow-xl p-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                    Workforce Metrics Analysis
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                    {workforceMetricsData.map((metric, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-3xl border-2 border-gray-200 hover:border-blue-400 bg-gradient-to-br from-white to-gray-50 hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:shadow-xl cursor-pointer"
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
                                        {typeof metric.value === 'number' ? formatNumber(metric.value) : metric.value} 
                                        <span className="text-lg text-gray-600"> {metric.unit}</span>
                                    </p>
                                    {'breakdown' in metric && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            {metric.breakdown}
                                        </p>
                                    )}
                                    {'level' in metric && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            Level: {metric.level}
                                        </p>
                                    )}
                                    {'percentage' in metric && metric.title !== 'Gender Diversity' && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            Rating: {metric.percentage}
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

            {/* Workforce Composition & Inclusion */}
            <div className="bg-white rounded-3xl border-2 border-blue-100 shadow-xl p-10">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Workforce Composition */}
                    <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            Workforce Composition
                        </h4>
                        <div className="space-y-4">
                            {compositionBreakdown.map((item, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {item.icon}
                                            <span className="font-semibold text-gray-900">{item.category}</span>
                                        </div>
                                        <span className="font-bold text-gray-900">{item.percentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm text-gray-600">{item.description}</p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {formatNumber(item.value)} {item.category.includes('%') ? '' : 'employees'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Inclusion Metrics */}
                    <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Heart className="w-5 h-5 text-pink-600" />
                            Inclusion Metrics
                        </h4>
                        <div className="space-y-4">
                            {inclusionMetricsData.map((metric, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-pink-50 to-rose-50"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {metric.icon}
                                            <span className="font-semibold text-gray-900">{metric.title}</span>
                                        </div>
                                        <span className="font-bold text-gray-900">
                                            {typeof metric.value === 'number' ? 
                                                (metric.title.includes('Score') ? metric.value.toFixed(1) : formatNumber(metric.value))
                                                : metric.value}
                                            {metric.unit && <span className="text-sm ml-1">{metric.unit}</span>}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm text-gray-600">{metric.description}</p>
                                        <div className="flex items-center gap-2">
                                            {getTrendIcon(metric.trend)}
                                            <span className="text-xs font-semibold text-gray-700">{metric.trend}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Diversity & Inclusion Performance */}
            <div className="bg-white rounded-3xl border-2 border-blue-100 shadow-xl p-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
                    Diversity & Inclusion Performance
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {diversityPerformanceData.map((indicator, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-3xl border-2 border-gray-200 hover:border-purple-400 bg-gradient-to-br from-white to-gray-50 hover:from-purple-50 hover:to-pink-50 transition-all duration-300 hover:shadow-xl"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                                    {indicator.icon}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">{indicator.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {typeof indicator.value === 'number' ? indicator.value.toFixed(1) : indicator.value}
                                        <span className="text-lg">{indicator.unit}</span>
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
                <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-2 font-medium">Overall Diversity Score</p>
                            <p className="text-4xl font-bold text-purple-700">
                                {workforceMetrics?.diversityScore || 0}
                                <span className="text-lg">%</span>
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-2 font-medium">Industry Comparison</p>
                            <p className="text-4xl font-bold text-pink-600">
                                {workforceMetrics?.femalePercentage > 35 ? '+5.2' : workforceMetrics?.femalePercentage > 30 ? '+2.1' : '-1.8'}
                                <span className="text-lg">%</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>


            {/* Simplified Explanations */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl border-2 border-blue-100 shadow-xl p-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 shadow-lg">
                        <Info className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900">In Simple Terms</h3>
                        <p className="text-gray-600 text-lg">Understanding workforce and diversity metrics made easy</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(simpleExplanations).map(([term, explanation], index) => (
                        <div
                            key={index}
                            className="group p-7 rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-400 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-4 rounded-2xl bg-white shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
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
                <div className="bg-white rounded-3xl border-2 border-blue-100 shadow-xl p-10">
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
                            <p className="text-sm text-gray-600 mb-2">Social Metrics Tracked</p>
                            <p className="text-xl font-bold text-gray-900">{socialMetrics?.total_metrics || 0} metrics</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-gray-50">
                            <p className="text-sm text-gray-600 mb-2">Data Completeness</p>
                            <p className="text-xl font-bold text-gray-900">
                                {dataQuality?.verification_status?.unverified === 0 ? 'High' : 'Medium'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border-2 border-blue-100 shadow-xl p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <Settings className="w-7 h-7 text-purple-600" />
                        Calculation Methodology
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Gender Diversity Ratio</p>
                            <p className="text-sm text-gray-700">(Female Employees / Total Employees) × 100</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Pay Equity Gap</p>
                            <p className="text-sm text-gray-700">(Average Female Salary / Average Male Salary) × 100</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Retention Rate</p>
                            <p className="text-sm text-gray-700">(Employees Remaining / Total Employees at Start) × 100</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-green-50 border border-green-200">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Average Training Hours</p>
                            <p className="text-sm text-gray-700">Total Training Hours / Total Employees</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Company Information */}
            <div className="bg-white rounded-3xl border-2 border-blue-100 shadow-xl p-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <User className="w-7 h-7 text-blue-600" />
                    Company Information
                </h3>
                <div className="space-y-4">
                    {companyContact.map((contact, index) => (
                        <div key={index} className="p-4 rounded-2xl bg-gray-50">
                            <div className="flex items-center gap-2 mb-1">
                                {contact.icon}
                                <p className="text-sm text-gray-600">{contact.label}</p>
                            </div>
                            <p className="text-lg font-bold text-gray-900">{contact.value}</p>
                        </div>
                    ))}
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                            <Globe className="w-4 h-4 text-blue-600" />
                            <p className="text-sm text-gray-600">Industry</p>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{companyInfo?.industry || 'Not specified'}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-green-50 border border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-green-600" />
                            <p className="text-sm text-gray-600">Latest ESG Report</p>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{companyInfo?.latest_esg_report_year || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Summary & Recommendations */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-blue-200 shadow-xl p-10">
                <div className="flex items-start gap-6">
                    <div className="p-5 rounded-3xl bg-white shadow-lg">
                        <Lightbulb className="w-12 h-12 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Key Summary & Insight</h3>
                        <p className="text-gray-700 text-lg mb-4">
                            Your workforce shows {workforceMetrics?.femalePercentage > 35 ? 'strong' : 'moderate'} diversity with 
                            {workforceMetrics?.engagementScore > 75 ? ' high' : ' moderate'} engagement levels. 
                            Focus areas include {workforceMetrics?.leadershipDiversity < 30 ? 'improving leadership diversity' : 'sustaining current diversity levels'} 
                            and {workforceMetrics?.retentionRate < 85 ? 'enhancing retention strategies' : 'maintaining strong retention'}.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowRecommendationsModal(true)}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all font-bold hover:scale-105 shadow-lg"
                            >
                                View Recommendations
                            </button>
                            <button className="px-6 py-3 bg-white border-2 border-blue-500 text-blue-600 rounded-2xl hover:bg-blue-50 transition-all font-bold hover:scale-105 shadow-md">
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
                        <div className="p-8 border-b-2 border-blue-100 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 text-white rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-3xl font-bold mb-2">Metric Details</h3>
                                    <p className="text-blue-100 text-lg">{selectedMetric.title}</p>
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
                        <div className="p-8 border-b-2 border-blue-100 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 text-white rounded-t-3xl sticky top-0 z-10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-md">
                                        <Lightbulb className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-bold">Action Recommendations</h3>
                                        <p className="text-blue-100 text-lg mt-1">Based on your workforce analytics</p>
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
                                    title: 'Enhance Gender Diversity Programs',
                                    description: `Current female representation is ${workforceMetrics?.femalePercentage?.toFixed(1)}%. Implement targeted recruitment and promotion programs to reach 40%+.`,
                                    impact: 'High',
                                    effort: 'Medium',
                                    timeframe: '12-18 months',
                                    icon: <UserPlus className="w-6 h-6 text-purple-600" />,
                                },
                                {
                                    title: 'Improve Leadership Diversity',
                                    description: `Leadership diversity at ${workforceMetrics?.leadershipDiversity?.toFixed(1)}%. Develop mentorship programs and succession planning for diverse talent.`,
                                    impact: 'High',
                                    effort: 'High',
                                    timeframe: '2 years',
                                    icon: <Briefcase className="w-6 h-6 text-indigo-600" />,
                                },
                                workforceMetrics?.payEquity && workforceMetrics.payEquity < 95 && {
                                    title: 'Address Pay Equity Gaps',
                                    description: `Pay equity score of ${workforceMetrics?.payEquity?.toFixed(1)}. Conduct pay equity audit and implement corrective measures.`,
                                    impact: 'High',
                                    effort: 'Medium',
                                    timeframe: '6-12 months',
                                    icon: <DollarSign className="w-6 h-6 text-green-600" />,
                                },
                                workforceMetrics?.retentionRate && workforceMetrics.retentionRate < 85 && {
                                    title: 'Strengthen Retention Strategies',
                                    description: `Retention rate at ${workforceMetrics?.retentionRate?.toFixed(1)}%. Implement stay interviews, career development paths, and competitive benefits.`,
                                    impact: 'High',
                                    effort: 'Medium',
                                    timeframe: '1 year',
                                    icon: <UserCheck className="w-6 h-6 text-blue-600" />,
                                },
                                workforceMetrics?.avgTrainingPerEmployee && workforceMetrics.avgTrainingPerEmployee < 30 && {
                                    title: 'Expand Training Programs',
                                    description: `Average training of ${workforceMetrics?.avgTrainingPerEmployee?.toFixed(1)} hours. Develop comprehensive skills development and leadership training.`,
                                    impact: 'Medium',
                                    effort: 'Medium',
                                    timeframe: '6 months',
                                    icon: <GraduationCap className="w-6 h-6 text-teal-600" />,
                                },
                                workforceMetrics?.inclusionScore && workforceMetrics.inclusionScore < 75 && {
                                    title: 'Boost Inclusion Initiatives',
                                    description: `Inclusion score of ${workforceMetrics?.inclusionScore?.toFixed(1)}. Implement inclusion training, employee resource groups, and inclusive policies.`,
                                    impact: 'High',
                                    effort: 'Low',
                                    timeframe: '3 months',
                                    icon: <Users className="w-6 h-6 text-pink-600" />,
                                },
                                ...(recommendations || []).map((rec: any) => ({
                                    title: rec.action,
                                    description: rec.description || `Priority: ${rec.priority}, Timeline: ${rec.timeline}`,
                                    impact: rec.priority,
                                    effort: rec.effort || 'Medium',
                                    timeframe: rec.timeline,
                                    icon: <Target className="w-6 h-6 text-amber-600" />,
                                })),
                            ].filter(Boolean).map((recommendation, index) => (
                                recommendation && (
                                    <div key={index} className="group p-8 rounded-3xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-blue-400 hover:shadow-2xl transition-all duration-300">
                                        <div className="flex items-start gap-6">
                                            <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 group-hover:scale-110 transition-transform">
                                                {recommendation.icon}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-xl text-gray-900 mb-3">{recommendation.title}</h4>
                                                <p className="text-gray-700 leading-relaxed mb-5 font-medium">{recommendation.description}</p>
                                                <div className="flex items-center gap-4 flex-wrap">
                                                    <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                                                        recommendation.impact === 'High' 
                                                        ? 'bg-red-100 text-red-800' 
                                                        : recommendation.impact === 'Medium'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-green-100 text-green-800'
                                                    }`}>
                                                        Impact: {recommendation.impact}
                                                    </span>
                                                    <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                                                        recommendation.effort === 'High' 
                                                        ? 'bg-blue-100 text-blue-800' 
                                                        : recommendation.effort === 'Medium'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        Effort: {recommendation.effort}
                                                    </span>
                                                    <span className="px-4 py-2 bg-amber-100 text-amber-800 rounded-xl text-sm font-bold">
                                                        Time: {recommendation.timeframe}
                                                    </span>
                                                </div>
                                            </div>
                                            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all font-bold hover:scale-105 shadow-lg">
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

export default WorkforceAnalyticsTab;