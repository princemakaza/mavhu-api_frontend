import React, { useState } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Target,
    AlertTriangle,
    Info,
    Lightbulb,
    ShieldCheck,
    Users,
    Heart,
    Handshake,
    Shield,
    X,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    School,
    Hospital,
    DollarSign,
    Building,
    Globe,
    Award,
    BarChart3,
    Settings,
    Trophy,
    Smile,
    ThumbsUp,
} from "lucide-react";
import type { CommunityEngagementResponse } from '../../../../services/Admin_Service/esg_apis/community_engagement_service';
import {
    getCommunityEngagementSummary,
    getSocialLicenseDetails,
    getSDGAlignmentBreakdown,
    getCommunityBenefits,
    getEngagementScores,
    getKPIs,
    getStrategicInsights,
    getEngagementTrendAnalysis,
    getCommunityImpactSummary,
} from '../../../../services/Admin_Service/esg_apis/community_engagement_service';

// Enhanced Color Palette with Green Theme (same as EnergyAnalyticsTab)
const COLORS = {
    primary: '#008000',
    primaryDark: '#006400',
    primaryLight: '#10B981',
    primaryPale: '#D1FAE5',
    accent: '#22C55E',
    accentGold: '#F59E0B',
    success: '#10B981',
    warning: '#FBBF24',
    danger: '#EF4444',
    info: '#3B82F6',
};

interface CommunityAnalyticsTabProps {
    communityData: CommunityEngagementResponse | null;
    formatNumber: (num: number) => string;
    formatPercent: (num: number) => string;
    selectedYear: number | null;
    availableYears: number[];
    onMetricClick: (metric: any, modalType: string) => void;
}

const CommunityAnalyticsTab: React.FC<CommunityAnalyticsTabProps> = ({
    communityData,
    formatNumber,
    formatPercent,
}) => {
    const [activeInsightTab, setActiveInsightTab] = useState('trends');
    const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!communityData) {
        return (
            <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl">
                <div className="text-center max-w-md p-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                        <Users className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">No Community Analytics Data Available</h3>
                    <p className="text-gray-600 leading-relaxed">Select a company to view detailed community engagement analytics and insights.</p>
                </div>
            </div>
        );
    }

    const {
        company,
        analysis,
        esg_data,
        community_engagement,
        kpis,
        strategic_insights,
    } = communityData.data;

    // Get derived data using service functions
    const communitySummary = getCommunityEngagementSummary(communityData.data);
    const socialLicenseDetails = getSocialLicenseDetails(communityData.data);
    const sdgAlignment = getSDGAlignmentBreakdown(communityData.data);
    const communityBenefits = getCommunityBenefits(communityData.data);
    const engagementScores = getEngagementScores(communityData.data);
    const communityKPIs = getKPIs(communityData.data);
    const strategicInsights = getStrategicInsights(communityData.data);
    const engagementTrendAnalysis = getEngagementTrendAnalysis(communityData.data);
    const communityImpactSummary = getCommunityImpactSummary(communityData.data);

    // Helper function to get trend icon
    const getTrendIcon = (trend: string) => {
        const lowerTrend = trend?.toLowerCase() || '';
        if (lowerTrend.includes('increas') || lowerTrend.includes('improv') || lowerTrend.includes('grow') || lowerTrend.includes('positive')) {
            return <TrendingUp className="w-4 h-4 text-green-600" />;
        } else if (lowerTrend.includes('decreas') || lowerTrend.includes('declin') || lowerTrend.includes('reduc') || lowerTrend.includes('negative')) {
            return <TrendingDown className="w-4 h-4 text-red-600" />;
        }
        return <ChevronRight className="w-4 h-4 text-gray-600" />;
    };

    // Key metrics
    const socialLicenseScore = communitySummary.socialLicenseScore || 0;
    const overallEngagementScore = communitySummary.overallEngagementScore || 0;
    const sdgAlignmentScore = communitySummary.sdgAlignmentScore || 0;
    const communityTrustIndex = communitySummary.communityTrustIndex || 0;
    const stakeholderSatisfaction = communitySummary.stakeholderSatisfaction || 0;

    // Community impact metrics
    const studentsImpacted = communityBenefits?.education?.students_impacted || 0;
    const patientsServed = communityBenefits?.healthcare?.patients_served || 0;
    const jobsCreated = communityBenefits?.economic?.jobs_created || 0;
    const waterProjects = communityBenefits?.environmental?.water_access_projects || 0;

    // Key insights data
    const insights = {
        trends: [
            {
                title: 'Social License Improvement',
                description: `Social license score increased to ${socialLicenseScore.toFixed(1)}`,
                icon: <Handshake className="w-5 h-5 text-green-600" />,
                impact: socialLicenseScore > 80 ? 'High' : socialLicenseScore > 60 ? 'Medium' : 'Low',
                confidence: 0.88,
            },
            {
                title: 'Community Engagement Growth',
                description: `Overall engagement at ${overallEngagementScore.toFixed(1)} with ${engagementScores?.trend || 'stable'} trend`,
                icon: <Users className="w-5 h-5 text-blue-600" />,
                impact: overallEngagementScore > 75 ? 'High' : overallEngagementScore > 50 ? 'Medium' : 'Low',
                confidence: 0.85,
            },
            {
                title: 'SDG Alignment Progress',
                description: `SDG alignment improved to ${sdgAlignmentScore.toFixed(1)} with strong performance in ${sdgAlignment?.prioritySDGs?.slice(0, 2).join(', ') || 'multiple areas'}`,
                icon: <Target className="w-5 h-5 text-purple-600" />,
                impact: sdgAlignmentScore > 70 ? 'High' : sdgAlignmentScore > 50 ? 'Medium' : 'Low',
                confidence: 0.82,
            },
        ],
        risks: [
            {
                title: 'Social License Risk',
                description: `Social license at ${socialLicenseDetails?.level || 'medium'} level - ${socialLicenseScore.toFixed(1)}/100`,
                icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
                priority: socialLicenseScore < 60 ? 'High' : socialLicenseScore < 70 ? 'Medium' : 'Low',
                timeframe: 'Immediate',
            },
            {
                title: 'Community Trust Gap',
                description: `Community trust index at ${communityTrustIndex.toFixed(1)} - needs improvement in transparency`,
                icon: <Heart className="w-5 h-5 text-amber-600" />,
                priority: communityTrustIndex < 70 ? 'High' : communityTrustIndex < 80 ? 'Medium' : 'Low',
                timeframe: 'Monitor',
            },
            {
                title: 'Stakeholder Engagement Risk',
                description: `Stakeholder satisfaction at ${stakeholderSatisfaction.toFixed(1)}% - review engagement strategies`,
                icon: <Users className="w-5 h-5 text-orange-600" />,
                priority: stakeholderSatisfaction < 70 ? 'High' : stakeholderSatisfaction < 80 ? 'Medium' : 'Low',
                timeframe: 'Strategic',
            },
        ],
        opportunities: [
            {
                title: 'Education Program Expansion',
                description: `${studentsImpacted.toLocaleString()} students impacted - opportunity to expand to more schools`,
                icon: <School className="w-5 h-5 text-blue-600" />,
                value: studentsImpacted > 1000 ? 'High' : 'Medium',
                timeframe: '6-12 months',
            },
            {
                title: 'Healthcare Outreach',
                description: `${patientsServed.toLocaleString()} patients served - potential for mobile clinics`,
                icon: <Hospital className="w-5 h-5 text-red-600" />,
                value: 'High',
                timeframe: '1-2 years',
            },
            {
                title: 'Local Economic Development',
                description: `${jobsCreated.toLocaleString()} jobs created - opportunity for skills training programs`,
                icon: <DollarSign className="w-5 h-5 text-green-600" />,
                value: jobsCreated > 100 ? 'High' : 'Medium',
                timeframe: '3-6 months',
            },
        ],
    };

    // Community metrics analysis
    const communityMetricsData = [
        {
            title: 'Social License Score',
            value: socialLicenseScore,
            unit: '/100',
            trend: socialLicenseScore > 70 ? 'Improving' : socialLicenseScore > 50 ? 'Stable' : 'Needs Attention',
            level: socialLicenseDetails?.level || 'Medium',
            icon: <Handshake className="w-6 h-6 text-green-600" />,
        },
        {
            title: 'Engagement Score',
            value: overallEngagementScore,
            unit: '/100',
            trend: engagementScores?.trend || 'Stable',
            yoyChange: engagementScores?.yearOverYearChange || '0%',
            icon: <Users className="w-6 h-6 text-blue-600" />,
        },
        {
            title: 'SDG Alignment',
            value: sdgAlignmentScore,
            unit: '/100',
            trend: sdgAlignmentScore > 70 ? 'Strong' : sdgAlignmentScore > 50 ? 'Moderate' : 'Developing',
            prioritySDGs: sdgAlignment?.prioritySDGs?.length || 0,
            icon: <Target className="w-6 h-6 text-purple-600" />,
        },
        {
            title: 'Community Trust Index',
            value: communityTrustIndex,
            unit: '/100',
            trend: communityTrustIndex > 80 ? 'High' : communityTrustIndex > 60 ? 'Medium' : 'Low',
            icon: <Heart className="w-6 h-6 text-red-600" />,
        },
    ];

    // Social License Factor breakdown
    const socialLicenseBreakdown = socialLicenseDetails?.factors ?
        Object.entries(socialLicenseDetails.factors).map(([key, value]) => ({
            factor: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            percentage: value as number,
            icon: <Shield className="w-4 h-4 text-green-600" />,
        })) : [];

    // Engagement Category breakdown
    const engagementCategoryData = engagementScores?.byCategory ?
        Object.entries(engagementScores.byCategory).map(([key, value]) => ({
            category: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            score: value as number,
            icon: key.includes('education') ? <School className="w-4 h-4 text-blue-600" /> :
                key.includes('healthcare') ? <Hospital className="w-4 h-4 text-red-600" /> :
                    key.includes('economy') ? <DollarSign className="w-4 h-4 text-green-600" /> :
                        <Globe className="w-4 h-4 text-emerald-600" />,
        })) : [];

    // SDG Performance breakdown
    const sdgPerformanceData = sdgAlignment?.scores ?
        Object.entries(sdgAlignment.scores).map(([key, value]) => ({
            sdg: key.toUpperCase(),
            score: value as number,
            strength: sdgAlignment?.alignmentStrengths?.find(s => s.sdg.toLowerCase() === key.toLowerCase())?.strength || 'Moderate',
            icon: <Award className="w-4 h-4 text-purple-600" />,
        })) : [];

    // Community Impact Indicators
    const impactIndicators = [
        {
            title: 'Students Impacted',
            value: studentsImpacted,
            unit: '',
            trend: 'Growing',
            icon: <School className="w-5 h-5 text-blue-600" />,
        },
        {
            title: 'Patients Served',
            value: patientsServed,
            unit: '',
            trend: 'Stable',
            icon: <Hospital className="w-5 h-5 text-red-600" />,
        },
        {
            title: 'Jobs Created',
            value: jobsCreated,
            unit: '',
            trend: 'Increasing',
            icon: <DollarSign className="w-5 h-5 text-green-600" />,
        },
        {
            title: 'Water Projects',
            value: waterProjects,
            unit: '',
            trend: 'Expanding',
            icon: <Globe className="w-5 h-5 text-emerald-600" />,
        },
    ];

    // Performance indicators
    const performanceIndicators = [
        {
            title: 'Community Investment Ratio',
            value: communityKPIs.community_investment_ratio || 0,
            unit: '%',
            trend: communityKPIs.community_investment_ratio > 2 ? 'High' : communityKPIs.community_investment_ratio > 1 ? 'Medium' : 'Low',
            icon: <DollarSign className="w-5 h-5 text-green-600" />,
        },
        {
            title: 'Social ROI Multiplier',
            value: communityKPIs.social_roi_multiplier || 0,
            unit: 'x',
            trend: communityKPIs.social_roi_multiplier > 3 ? 'Excellent' : communityKPIs.social_roi_multiplier > 1.5 ? 'Good' : 'Developing',
            icon: <BarChart3 className="w-5 h-5 text-amber-600" />,
        },
        {
            title: 'Program Efficiency',
            value: communityKPIs.program_efficiency || 0,
            unit: '%',
            trend: communityKPIs.program_efficiency > 80 ? 'High' : communityKPIs.program_efficiency > 60 ? 'Medium' : 'Low',
            icon: <Trophy className="w-5 h-5 text-blue-600" />,
        },
        {
            title: 'Stakeholder Satisfaction',
            value: stakeholderSatisfaction,
            unit: '%',
            trend: stakeholderSatisfaction > 85 ? 'Excellent' : stakeholderSatisfaction > 70 ? 'Good' : 'Needs Improvement',
            icon: <Smile className="w-5 h-5 text-purple-600" />,
        },
    ];

    // Simplified explanations for community terms
    const simpleExplanations = {
        'Social License to Operate': 'Community acceptance and approval of company operations in their area',
        'Engagement Score': 'Measure of how effectively a company interacts with and supports its community',
        'SDG Alignment': 'How well company activities align with UN Sustainable Development Goals',
        'Community Trust Index': 'Level of trust and confidence the community has in the company',
        'Social ROI': 'Return on investment from social and community programs',
        'Stakeholder Satisfaction': 'How satisfied community members are with company engagement',
    };

    return (
        <div className="space-y-8 pb-8">

            {/* Key Insights Section */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10 hover:shadow-2xl transition-shadow duration-300">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                            Community Insights & Analytics
                        </h3>
                        <p className="text-gray-600 text-lg">Deep analysis of your community engagement and social impact</p>
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

            {/* Community Metrics Analysis */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                    Community Engagement Analysis
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                    {communityMetricsData.map((metric, index) => (
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
                                        {typeof metric.value === 'number' ? metric.value.toFixed(1) : metric.value} <span className="text-lg text-gray-600">{metric.unit}</span>
                                    </p>
                                    {'level' in metric && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            Level: <span className="font-semibold">{metric.level}</span>
                                        </p>
                                    )}
                                    {'yoyChange' in metric && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            Year-over-Year: {metric.yoyChange}
                                        </p>
                                    )}
                                    {'prioritySDGs' in metric && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            Priority SDGs: {metric.prioritySDGs}
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

            {/* Social License & Engagement Breakdown */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Social License Breakdown */}
                    <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-green-600" />
                            Social License Factors
                        </h4>
                        <div className="space-y-4">
                            {socialLicenseBreakdown.slice(0, 4).map((factor, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {factor.icon}
                                            <span className="font-semibold text-gray-900">{factor.factor}</span>
                                        </div>
                                        <span className="font-bold text-gray-900">{factor.percentage.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{ width: `${factor.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Engagement Category Breakdown */}
                    <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            Engagement by Category
                        </h4>
                        <div className="space-y-4">
                            {engagementCategoryData.map((category, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-blue-50 to-cyan-50"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {category.icon}
                                            <span className="font-semibold text-gray-900">{category.category}</span>
                                        </div>
                                        <span className="font-bold text-gray-900">{category.score.toFixed(1)}/100</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full"
                                            style={{ width: `${category.score}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Community Impact Indicators */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                    Community Impact Analysis
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {impactIndicators.map((indicator, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-3xl border-2 border-gray-200 hover:border-green-400 bg-gradient-to-br from-white to-gray-50 hover:from-green-50 hover:to-emerald-50 transition-all duration-300 hover:shadow-xl"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                                    {indicator.icon}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">{indicator.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatNumber(indicator.value)} {indicator.unit && <span className="text-lg">{indicator.unit}</span>}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            {/* SDG Performance */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                    SDG Performance Indicators
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {sdgPerformanceData.slice(0, 8).map((sdg, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-3xl border-2 border-gray-200 hover:border-purple-400 bg-gradient-to-br from-white to-gray-50 hover:from-purple-50 hover:to-pink-50 transition-all duration-300 hover:shadow-xl"
                        >
                            <div className="flex items-start gap-3 mb-4">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                                    {sdg.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900 mb-2">{sdg.sdg}</h4>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {sdg.score.toFixed(1)}<span className="text-lg text-gray-600">/100</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                                <span className={`text-sm font-semibold ${sdg.strength === 'Strong' ? 'text-green-700' : sdg.strength === 'Moderate' ? 'text-blue-700' : 'text-amber-700'}`}>
                                    {sdg.strength}
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
                    Community Performance Indicators
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {performanceIndicators.map((indicator, index) => (
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

            {/* Simplified Explanations */}
            <div className="bg-gradient-to-br from-white to-green-50 rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 shadow-lg">
                        <Info className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900">In Simple Terms</h3>
                        <p className="text-gray-600 text-lg">Understanding community engagement metrics made easy</p>
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
                                    <Users className="w-6 h-6 text-green-600" />
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
                            <p className="text-xl font-bold text-gray-900">{analysis.year}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-gray-50">
                            <p className="text-sm text-gray-600 mb-2">Metrics Tracked</p>
                            <p className="text-xl font-bold text-gray-900">{esg_data.summary.total_records} metrics</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-gray-50">
                            <p className="text-sm text-gray-600 mb-2">Confidence Score</p>
                            <p className="text-xl font-bold text-gray-900">{analysis.confidence_score}%</p>
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
                            <p className="text-sm font-semibold text-gray-900 mb-2">Social License Score</p>
                            <p className="text-sm text-gray-700">Weighted average of 8 key factors: transparency, community involvement, etc.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Engagement Score</p>
                            <p className="text-sm text-gray-700">Average of 4 category scores: education, healthcare, economy, environment</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                            <p className="text-sm font-semibold text-gray-900 mb-2">SDG Alignment</p>
                            <p className="text-sm text-gray-700">Weighted alignment with 8 Sustainable Development Goals</p>
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
                        <p className="text-gray-700 text-lg mb-4">{communityData.message}</p>
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
                                                {typeof value === 'number' ? formatNumber(value) : String(value)}
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
                                        <h3 className="text-3xl font-bold">Action Recommendations</h3>
                                        <p className="text-green-100 text-lg mt-1">Based on your community engagement analytics</p>
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
                                socialLicenseScore < 70 && {
                                    title: 'Improve Social License Score',
                                    description: `Social license is at ${socialLicenseScore.toFixed(1)}. Focus on increasing transparency and community involvement.`,
                                    impact: 'High',
                                    effort: 'Medium',
                                    timeframe: '6-12 months',
                                    icon: <Handshake className="w-6 h-6 text-green-600" />,
                                },
                                overallEngagementScore < 70 && {
                                    title: 'Enhance Community Engagement',
                                    description: `Overall engagement is ${overallEngagementScore.toFixed(1)}. Develop targeted programs for underperforming categories.`,
                                    impact: 'High',
                                    effort: 'High',
                                    timeframe: '1 year',
                                    icon: <Users className="w-6 h-6 text-blue-600" />,
                                },
                                engagementScores?.byCategory?.education < 70 && {
                                    title: 'Expand Education Programs',
                                    description: `Education engagement is ${engagementScores?.byCategory?.education.toFixed(1)}. Consider scholarship programs and school infrastructure.`,
                                    impact: 'Medium',
                                    effort: 'Medium',
                                    timeframe: '6-12 months',
                                    icon: <School className="w-6 h-6 text-blue-600" />,
                                },
                                engagementScores?.byCategory?.healthcare < 70 && {
                                    title: 'Strengthen Healthcare Outreach',
                                    description: `Healthcare engagement is ${engagementScores?.byCategory?.healthcare.toFixed(1)}. Explore mobile clinics and health awareness campaigns.`,
                                    impact: 'Medium',
                                    effort: 'Medium',
                                    timeframe: '1 year',
                                    icon: <Hospital className="w-6 h-6 text-red-600" />,
                                },
                                communityTrustIndex < 75 && {
                                    title: 'Build Community Trust',
                                    description: `Community trust index is ${communityTrustIndex.toFixed(1)}. Increase transparency and regular community meetings.`,
                                    impact: 'High',
                                    effort: 'Low',
                                    timeframe: '3-6 months',
                                    icon: <Heart className="w-6 h-6 text-pink-600" />,
                                },
                                stakeholderSatisfaction < 75 && {
                                    title: 'Improve Stakeholder Satisfaction',
                                    description: `Stakeholder satisfaction is ${stakeholderSatisfaction.toFixed(1)}%. Implement feedback mechanisms and address concerns.`,
                                    impact: 'Medium',
                                    effort: 'Low',
                                    timeframe: '3 months',
                                    icon: <ThumbsUp className="w-6 h-6 text-purple-600" />,
                                },
                                socialLicenseDetails?.recommendations && socialLicenseDetails.recommendations.length > 0 && {
                                    title: 'Address Social License Gaps',
                                    description: `${socialLicenseDetails.recommendations.length} specific recommendations available from social license analysis.`,
                                    impact: 'High',
                                    effort: 'Variable',
                                    timeframe: 'Ongoing',
                                    icon: <Shield className="w-6 h-6 text-green-600" />,
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

export default CommunityAnalyticsTab;