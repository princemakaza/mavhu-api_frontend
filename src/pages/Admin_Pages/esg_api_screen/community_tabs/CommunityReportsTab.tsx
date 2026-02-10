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

    X,

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
    Heart,
    GraduationCap,
    Stethoscope,
    DollarSign,
    Shield,
    TargetIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Activity as ActivityIcon,
    PieChart,
    Award as AwardIcon,
    Compass,
    Globe as GlobeIcon,
    Star,
    ThumbsUp,
    AlertOctagon,
} from "lucide-react";

// Import types and helper functions from community engagement service
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
    blue: '#3B82F6',
    pink: '#EC4899',
    indigo: '#6366F1',
    cyan: '#06B6D4',
    rose: '#F43F5E',
    orange: '#F97316',
};

interface CommunityReportsTabProps {
    communityData: CommunityEngagementResponse | null;
    formatNumber: (num: number) => string;
    formatPercent: (num: number) => string;
    formatCurrency: (num: number) => string;
    selectedYear: number | null;
    availableYears: number[];
    onMetricClick: (metric: any, modalType: string) => void;
}

const CommunityReportsTab: React.FC<CommunityReportsTabProps> = ({
    communityData,
    formatNumber,
    formatPercent,
    formatCurrency,
    availableYears,
    onMetricClick,
}) => {
    const [selectedReport, setSelectedReport] = useState<string>('summary');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [selectedMetric, setSelectedMetric] = useState<any>(null);
    const [isMetricModalOpen, setIsMetricModalOpen] = useState(false);

    if (!communityData) {
        return (
            <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl">
                <div className="text-center max-w-md p-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                        <Users className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">No Community Reports Available</h3>
                    <p className="text-gray-600">Select a company to view community engagement and social impact reporting information.</p>
                </div>
            </div>
        );
    }

    const {
        company,
        analysis,
        esg_data,
        community_engagement,
        graphs,
        kpis,
        strategic_insights,
        version,
    } = communityData.data;

    // Get derived data using service functions
    const engagementSummary = getCommunityEngagementSummary(communityData.data);
    const socialLicenseDetails = getSocialLicenseDetails(communityData.data);
    const sdgAlignment = getSDGAlignmentBreakdown(communityData.data);
    const communityBenefits = getCommunityBenefits(communityData.data);
    const engagementScores = getEngagementScores(communityData.data);
    const communityKPIs = getKPIs(communityData.data);
    const strategicInsights = getStrategicInsights(communityData.data);
    const trendAnalysis = getEngagementTrendAnalysis(communityData.data);
    const impactSummary = getCommunityImpactSummary(communityData.data);

    // Calculate derived metrics
    const socialLicenseScore = socialLicenseDetails.score || 0;
    const socialLicenseLevel = socialLicenseDetails.level || "Developing";
    const overallEngagementScore = engagementScores.overall || 0;
    const sdgAlignmentScore = sdgAlignment.scores?.total_alignment_score || 0;
    const communityTrustIndex = communityKPIs.community_trust_index || 0;
    const stakeholderSatisfaction = communityKPIs.stakeholder_satisfaction || 0;

    // Social License Factors
    const socialLicenseFactors = socialLicenseDetails.factors || {};

    // Community Benefits Totals
    const totalStudentsImpacted = communityBenefits.education?.students_impacted || 0;
    const totalPatientsServed = communityBenefits.healthcare?.patients_served || 0;
    const totalJobsCreated = communityBenefits.economic?.jobs_created || 0;
    const totalInvestment = communityKPIs.community_investment_ratio ? communityKPIs.community_investment_ratio * 1000000 : 0; // Assuming ratio is per million

    // Strategic Insights
    const strengths = strategicInsights.strengths || [];
    const opportunities = strategicInsights.opportunities || [];
    const risks = strategicInsights.risks || [];

    // Get ESG frameworks from company
    const esgFrameworks = company.esg_reporting_framework || [];

    // Get all metrics from ESG data
    const getAllMetrics = () => {
        const metrics: any[] = [];

        // Environmental metrics
        Object.entries(esg_data.by_category.environmental || {}).forEach(([key, metric]) => {
            metrics.push({
                ...metric,
                category: 'Environmental',
                icon: <Leaf className="w-5 h-5 text-green-600" />
            });
        });

        // Social metrics
        Object.entries(esg_data.by_category.social || {}).forEach(([key, metric]) => {
            metrics.push({
                ...metric,
                category: 'Social',
                icon: <Users className="w-5 h-5 text-blue-600" />
            });
        });

        // Governance metrics
        Object.entries(esg_data.by_category.governance || {}).forEach(([key, metric]) => {
            metrics.push({
                ...metric,
                category: 'Governance',
                icon: <Shield className="w-5 h-5 text-purple-600" />
            });
        });

        return metrics;
    };

    const allMetrics = getAllMetrics();

    // Create metadata for technical section
    const metadata = {
        api_version: version?.api || "1.0",
        calculation_version: version?.calculation || "1.0",
        generated_at: new Date().toISOString(),
        endpoint: "community-engagement",
        company_id: company._id || company.id || "N/A",
        period_requested: analysis.year?.toString() || "N/A",
        data_sources: esg_data.summary?.data_sources || [
            "Community engagement records",
            "Social investment reports",
            "Stakeholder feedback",
        ]
    };

    // Key statistics
    const keyStats = {
        years_covered: availableYears.length || 1,
        total_metrics_analyzed: allMetrics.length || 0,
        current_year: analysis.year || new Date().getFullYear(),
        social_license_score: socialLicenseScore,
        engagement_score: overallEngagementScore,
        community_trust_index: communityTrustIndex,
        total_beneficiaries: totalStudentsImpacted + totalPatientsServed
    };

    // Handle metric click for detailed view
    const handleMetricCardClick = (metric: any) => {
        setSelectedMetric(metric);
        setIsMetricModalOpen(true);
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Report Navigation */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Community Report Sections</h3>
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
                        { id: 'metrics', label: 'All Metrics', icon: <Database className="w-4 h-4" /> },
                        { id: 'esg-frameworks', label: 'ESG Frameworks', icon: <BookOpen className="w-4 h-4" /> },
                        { id: 'community-benefits', label: 'Community Benefits', icon: <Heart className="w-4 h-4" /> },
                        { id: 'social-license', label: 'Social License', icon: <ShieldCheck className="w-4 h-4" /> },
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
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Community Engagement Overview</h3>
                                <p className="text-gray-600">Social impact and community engagement reporting status</p>
                            </div>
                            <Users className="w-8 h-8 text-green-600" />
                        </div>

                        <div className="space-y-6">
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <h4 className="font-bold text-lg text-gray-900 mb-4">Company Information</h4>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Company Name</p>
                                            <p className="text-lg font-bold text-gray-900">{company.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Industry</p>
                                            <p className="text-lg font-medium text-gray-800">{company.industry}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Country</p>
                                            <p className="text-lg font-medium text-gray-800">{company.country}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">ESG Contact</p>
                                            <p className="text-lg font-medium text-gray-800">
                                                {company.esg_contact_person ?
                                                    `${company.esg_contact_person.name} (${company.esg_contact_person.email})` :
                                                    'Not specified'
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Latest ESG Report</p>
                                            <p className="text-lg font-medium text-gray-800">
                                                {company.latest_esg_report_year ? `Year ${company.latest_esg_report_year}` : 'Not available'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">ESG Data Status</p>
                                            <p className="text-lg font-medium text-gray-800">{company.esg_data_status || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                <h4 className="font-bold text-lg text-gray-900 mb-4">Community Engagement Scope</h4>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Analysis Year</p>
                                        <p className="text-gray-800">{analysis.year || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Data Confidence</p>
                                        <p className="text-gray-800">{analysis.confidence_score ? `${analysis.confidence_score}%` : 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Community Focus Area</p>
                                        <p className="text-gray-800">{company.area_of_interest_metadata?.name || 'Not specified'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Key Statistics */}
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Key Community Statistics</h3>
                            <BarChart3 className="w-8 h-8 text-green-600" />
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200">
                                <p className="text-sm text-gray-600 mb-2">Social License Score</p>
                                <p className="text-2xl font-bold text-green-600">{socialLicenseScore.toFixed(1)}/100</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-100 border-2 border-blue-200">
                                <p className="text-sm text-gray-600 mb-2">Engagement Score</p>
                                <p className="text-2xl font-bold text-blue-600">{overallEngagementScore.toFixed(1)}/100</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-100 border-2 border-purple-200">
                                <p className="text-sm text-gray-600 mb-2">Community Trust Index</p>
                                <p className="text-2xl font-bold text-purple-600">{communityTrustIndex.toFixed(1)}/100</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-100 border-2 border-orange-200">
                                <p className="text-sm text-gray-600 mb-2">Total Beneficiaries</p>
                                <p className="text-2xl font-bold text-orange-600">{formatNumber(totalStudentsImpacted + totalPatientsServed)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Strategic Insights Summary */}
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Strategic Insights</h3>
                            <Compass className="w-8 h-8 text-green-600" />
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <ThumbsUp className="w-6 h-6 text-green-600" />
                                    <h5 className="font-bold text-lg text-gray-900">Strengths</h5>
                                </div>
                                <div className="space-y-2">
                                    {strengths.slice(0, 3).map((strength, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-gray-700">{strength}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <GlobeIcon className="w-6 h-6 text-blue-600" />
                                    <h5 className="font-bold text-lg text-gray-900">Opportunities</h5>
                                </div>
                                <div className="space-y-2">
                                    {opportunities.slice(0, 3).map((opportunity, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-gray-700">{opportunity}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <AlertOctagon className="w-6 h-6 text-red-600" />
                                    <h5 className="font-bold text-lg text-gray-900">Risks</h5>
                                </div>
                                <div className="space-y-2">
                                    {risks.slice(0, 3).map((risk, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-gray-700">{risk}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Community Summary Card */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border-2 border-green-200 shadow-xl p-8">
                        <div className="flex items-start gap-6">
                            <div className="p-5 rounded-3xl bg-white shadow-lg">
                                <Heart className="w-12 h-12 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Community Engagement Summary</h3>
                                <p className="text-gray-700 text-lg mb-4">
                                    Comprehensive community engagement and social impact analysis completed for the reporting period.
                                    The company demonstrates {socialLicenseLevel.toLowerCase()} social license to operate with strong engagement in key community areas.
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

            {/* All Metrics Report */}
            {selectedReport === 'metrics' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">All Community Engagement Metrics</h3>
                                <p className="text-gray-600">Complete breakdown of all ESG metrics for community engagement</p>
                            </div>
                            <Database className="w-8 h-8 text-green-600" />
                        </div>

                        <div className="mb-6">
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <p className="text-sm text-gray-600 mb-1">Total Metrics</p>
                                    <p className="text-2xl font-bold text-gray-900">{allMetrics.length}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                    <p className="text-sm text-gray-600 mb-1">Environmental Metrics</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {allMetrics.filter(m => m.category === 'Environmental').length}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                                    <p className="text-sm text-gray-600 mb-1">Social Metrics</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {allMetrics.filter(m => m.category === 'Social').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {allMetrics.map((metric, index) => {
                                const latestValue = metric.values?.[metric.values.length - 1];
                                const value = latestValue?.numeric_value || latestValue?.value || 'N/A';

                                return (
                                    <div
                                        key={index}
                                        onClick={() => handleMetricCardClick(metric)}
                                        className="p-6 rounded-2xl border-2 border-gray-200 hover:border-green-300 hover:shadow-lg transition-all cursor-pointer bg-white"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-gray-100">
                                                    {metric.icon}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 uppercase">{metric.category}</p>
                                                    <h4 className="font-bold text-gray-900 line-clamp-1">{metric.name}</h4>
                                                </div>
                                            </div>
                                            <Eye className="w-5 h-5 text-gray-400" />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Latest Value</span>
                                                <span className="font-bold text-lg text-gray-900">
                                                    {typeof value === 'number' ? formatNumber(value) : value}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Unit</span>
                                                <span className="font-medium text-gray-800">{metric.unit || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Data Quality</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${metric.data_quality?.verification_status?.includes('verified')
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {metric.data_quality?.verification_status?.[0] || 'Unverified'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {metric.description || 'No description available'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {allMetrics.length === 0 && (
                            <div className="text-center py-12">
                                <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h4 className="text-lg font-bold text-gray-900 mb-2">No Metrics Available</h4>
                                <p className="text-gray-600">No community engagement metrics found for this company.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ESG Frameworks Report */}
            {selectedReport === 'esg-frameworks' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Community ESG Reporting Frameworks</h3>
                                <p className="text-gray-600">Frameworks and standards used for community ESG reporting</p>
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
                                        <p className="text-gray-700">This company has not specified any ESG reporting frameworks for community engagement.</p>
                                    </div>
                                </div>
                            )}

                            {/* Community KPIs */}
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                <h4 className="font-bold text-lg text-gray-900 mb-4">Community Key Performance Indicators</h4>
                                <div className="space-y-4">
                                    {Object.entries(communityKPIs).map(([key, value], index) => (
                                        <div key={index} className="flex justify-between items-center p-4 bg-white rounded-xl border border-blue-100">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-blue-100">
                                                    {key.includes('investment') ? <DollarSign className="w-5 h-5 text-blue-600" /> :
                                                        key.includes('satisfaction') ? <ThumbsUp className="w-5 h-5 text-blue-600" /> :
                                                            key.includes('trust') ? <Shield className="w-5 h-5 text-blue-600" /> :
                                                                key.includes('efficiency') ? <ActivityIcon className="w-5 h-5 text-blue-600" /> :
                                                                    <BarChart3 className="w-5 h-5 text-blue-600" />}
                                                </div>
                                                <span className="font-medium text-gray-800 capitalize">{key.replace(/_/g, ' ')}</span>
                                            </div>
                                            <span className="font-bold text-gray-900">
                                                {typeof value === 'number' ?
                                                    (key.includes('ratio') || key.includes('multiplier') ? value.toFixed(2) :
                                                        key.includes('index') || key.includes('satisfaction') ? `${value.toFixed(1)}/100` :
                                                            formatNumber(value))
                                                    : value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Data Quality */}
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                                <h4 className="font-bold text-lg text-gray-900 mb-4">Data Quality & Coverage</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-white rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Database className="w-5 h-5 text-purple-600" />
                                            <span className="font-medium text-gray-800">Data Confidence Score</span>
                                        </div>
                                        <span className="font-bold text-purple-600">{analysis.confidence_score}%</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-4 bg-white rounded-xl">
                                            <p className="text-sm text-gray-600 mb-1">Environmental</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                {analysis.data_coverage?.environmental || 0}%
                                            </p>
                                        </div>
                                        <div className="p-4 bg-white rounded-xl">
                                            <p className="text-sm text-gray-600 mb-1">Social</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                {analysis.data_coverage?.social || 0}%
                                            </p>
                                        </div>
                                        <div className="p-4 bg-white rounded-xl">
                                            <p className="text-sm text-gray-600 mb-1">Governance</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                {analysis.data_coverage?.governance || 0}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Community Benefits Report */}
            {selectedReport === 'community-benefits' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Community Benefits Analysis</h3>
                                <p className="text-gray-600">Detailed breakdown of community benefits and social impact</p>
                            </div>
                            <Heart className="w-8 h-8 text-green-600" />
                        </div>

                        {/* Overall Benefits Summary */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Community Benefits Summary</h4>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <GraduationCap className="w-6 h-6 text-green-600" />
                                        <h5 className="font-bold text-lg text-gray-900">Education</h5>
                                    </div>
                                    <p className="text-3xl font-bold text-green-600">{formatNumber(totalStudentsImpacted)}</p>
                                    <p className="text-sm text-gray-600 mt-2">Students Impacted</p>
                                    <div className="mt-3 text-sm">
                                        <p className="text-gray-700">
                                            Schools Supported: {communityBenefits.education?.schools_supported || 0}
                                        </p>
                                        <p className="text-gray-700">
                                            Scholarships: {communityBenefits.education?.scholarships_awarded || 0}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Stethoscope className="w-6 h-6 text-blue-600" />
                                        <h5 className="font-bold text-lg text-gray-900">Healthcare</h5>
                                    </div>
                                    <p className="text-3xl font-bold text-blue-600">{formatNumber(totalPatientsServed)}</p>
                                    <p className="text-sm text-gray-600 mt-2">Patients Served</p>
                                    <div className="mt-3 text-sm">
                                        <p className="text-gray-700">
                                            Health Projects: {communityBenefits.healthcare?.infrastructure_projects || 0}
                                        </p>
                                        <p className="text-gray-700">
                                            Clinics Supported: {communityBenefits.healthcare?.schools_supported || 0}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <DollarSign className="w-6 h-6 text-orange-600" />
                                        <h5 className="font-bold text-lg text-gray-900">Economic</h5>
                                    </div>
                                    <p className="text-3xl font-bold text-orange-600">{formatNumber(totalJobsCreated)}</p>
                                    <p className="text-sm text-gray-600 mt-2">Jobs Created</p>
                                    <div className="mt-3 text-sm">
                                        <p className="text-gray-700">
                                            Training Programs: {communityBenefits.economic?.training_programs || 0}
                                        </p>
                                        <p className="text-gray-700">
                                            Local Procurement: {formatCurrency(communityBenefits.economic?.local_procurement_usd || 0)}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Leaf className="w-6 h-6 text-purple-600" />
                                        <h5 className="font-bold text-lg text-gray-900">Environmental</h5>
                                    </div>
                                    <p className="text-3xl font-bold text-purple-600">
                                        {communityBenefits.environmental?.water_access_projects || 0}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">Water Projects</p>
                                    <div className="mt-3 text-sm">
                                        <p className="text-gray-700">
                                            Sanitation: {communityBenefits.environmental?.sanitation_improvements || 0}
                                        </p>
                                        <p className="text-gray-700">
                                            Energy Projects: {communityBenefits.environmental?.renewable_energy_projects || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Engagement Scores */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Engagement Performance Scores</h4>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <p className="text-sm text-gray-600 mb-2">Education Engagement</p>
                                    <p className="text-2xl font-bold text-green-600">{engagementScores.byCategory?.education?.toFixed(1) || 0}/100</p>
                                </div>
                                <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                    <p className="text-sm text-gray-600 mb-2">Healthcare Engagement</p>
                                    <p className="text-2xl font-bold text-blue-600">{engagementScores.byCategory?.healthcare?.toFixed(1) || 0}/100</p>
                                </div>
                                <div className="p-5 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200">
                                    <p className="text-sm text-gray-600 mb-2">Economic Engagement</p>
                                    <p className="text-2xl font-bold text-orange-600">{engagementScores.byCategory?.local_economy?.toFixed(1) || 0}/100</p>
                                </div>
                                <div className="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                                    <p className="text-sm text-gray-600 mb-2">Environmental Engagement</p>
                                    <p className="text-2xl font-bold text-purple-600">{engagementScores.byCategory?.environmental?.toFixed(1) || 0}/100</p>
                                </div>
                            </div>
                        </div>

                        {/* Total Impact */}
                        <div className="p-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-2 font-medium">Total Community Investment</p>
                                    <p className="text-4xl font-bold text-green-700">
                                        {formatCurrency(totalInvestment)}
                                    </p>
                                </div>
                                <div className="text-center md:text-right">
                                    <p className="text-sm text-gray-600 mb-2 font-medium">Social ROI Multiplier</p>
                                    <p className="text-4xl font-bold text-gray-700">
                                        {communityKPIs.social_roi_multiplier?.toFixed(2) || 'N/A'}x
                                    </p>
                                </div>
                                <div className="text-center md:text-right">
                                    <p className="text-sm text-gray-600 mb-2 font-medium">Program Efficiency</p>
                                    <p className="text-4xl font-bold text-blue-700">
                                        {communityKPIs.program_efficiency?.toFixed(1) || 0}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Social License Report */}
            {selectedReport === 'social-license' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Social License to Operate Analysis</h3>
                                <p className="text-gray-600">Community acceptance, trust, and operational legitimacy</p>
                            </div>
                            <ShieldCheck className="w-8 h-8 text-green-600" />
                        </div>

                        {/* Social License Score */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Social License Assessment</h4>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Shield className="w-6 h-6 text-green-600" />
                                        <h5 className="font-bold text-lg text-gray-900">Overall Score</h5>
                                    </div>
                                    <div className="text-center">
                                        <div className="relative inline-block">
                                            <div className="w-48 h-48 rounded-full border-8 border-gray-200 relative">
                                                <div
                                                    className="absolute top-0 left-0 w-full h-full rounded-full border-8 border-transparent"
                                                    style={{
                                                        borderTopColor: socialLicenseScore >= 80 ? '#10B981' :
                                                            socialLicenseScore >= 60 ? '#F59E0B' : '#EF4444',
                                                        borderRightColor: socialLicenseScore >= 80 ? '#10B981' :
                                                            socialLicenseScore >= 60 ? '#F59E0B' : '#EF4444',
                                                        borderBottomColor: socialLicenseScore >= 80 ? '#10B981' :
                                                            socialLicenseScore >= 60 ? '#F59E0B' : '#EF4444',
                                                        borderLeftColor: socialLicenseScore >= 80 ? '#10B981' :
                                                            socialLicenseScore >= 60 ? '#F59E0B' : '#EF4444',
                                                        transform: `rotate(${45 + (socialLicenseScore * 2.7)}deg)`
                                                    }}
                                                ></div>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <p className="text-5xl font-bold text-gray-900">{socialLicenseScore.toFixed(0)}</p>
                                                    <p className="text-lg text-gray-600">/100</p>
                                                    <p className="text-sm font-medium mt-2" style={{
                                                        color: socialLicenseScore >= 80 ? '#10B981' :
                                                            socialLicenseScore >= 60 ? '#F59E0B' : '#EF4444'
                                                    }}>
                                                        {socialLicenseLevel}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <BarChart3 className="w-6 h-6 text-blue-600" />
                                        <h5 className="font-bold text-lg text-gray-900">Key Factors</h5>
                                    </div>
                                    <div className="space-y-3">
                                        {Object.entries(socialLicenseFactors).slice(0, 5).map(([key, value], index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <span className="text-sm text-gray-700 capitalize">{key.replace(/_/g, ' ')}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full"
                                                            style={{
                                                                width: `${value}%`,
                                                                backgroundColor: value >= 80 ? '#10B981' :
                                                                    value >= 60 ? '#F59E0B' : '#EF4444'
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900 w-10">{value}%</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Building Blocks */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Social License Building Blocks</h4>
                            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                                {Object.entries(socialLicenseDetails.buildingBlocks || {}).map(([key, value], index) => (
                                    <div key={index} className={`p-4 rounded-xl border-2 ${value ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`p-2 rounded-lg ${value ? 'bg-green-100' : 'bg-gray-100'}`}>
                                                {value ? (
                                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                                ) : (
                                                    <AlertCircle className="w-5 h-5 text-gray-400" />
                                                )}
                                            </div>
                                            <h5 className="font-bold text-gray-900 text-sm capitalize">{key.replace(/_/g, ' ')}</h5>
                                        </div>
                                        <p className={`text-xs ${value ? 'text-green-700' : 'text-gray-500'}`}>
                                            {value ? 'Established' : 'Needs Development'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recommendations */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Strategic Recommendations</h4>
                            <div className="space-y-3">
                                {socialLicenseDetails.recommendations?.map((recommendation, index) => (
                                    <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-xl">
                                        <Target className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-gray-800">{recommendation}</p>
                                    </div>
                                ))}
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
                                        <p className="text-sm text-gray-600 mb-1">Community Module Version</p>
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
                                        <span className="text-gray-700">Analysis Year</span>
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
                                        <p className="text-sm text-gray-600 mb-2">Community Benefits Data</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {totalStudentsImpacted > 0 || totalPatientsServed > 0 ? 'Available' : 'Limited'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">SDG Alignment Data</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {sdgAlignmentScore > 0 ? 'Available' : 'Limited'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Metric Detail Modal */}
            {isMetricModalOpen && selectedMetric && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setIsMetricModalOpen(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-white/20">
                                        {selectedMetric.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">{selectedMetric.name}</h3>
                                        <p className="text-sm opacity-90">{selectedMetric.category} • {selectedMetric.unit || 'No unit'}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsMetricModalOpen(false)} className="p-2 rounded-xl bg-white/20 hover:bg-white/30">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            {/* Metric Description */}
                            <div>
                                <h4 className="font-bold mb-2 text-lg">Description</h4>
                                <p className="text-gray-700 bg-gray-50 p-4 rounded-xl">
                                    {selectedMetric.description || 'No description available for this metric.'}
                                </p>
                            </div>

                            {/* Current Value */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <h4 className="font-bold mb-3">Current Value</h4>
                                    {selectedMetric.values?.length > 0 ? (
                                        <div>
                                            <p className="text-3xl font-bold text-green-600 mb-2">
                                                {selectedMetric.values[selectedMetric.values.length - 1].numeric_value
                                                    ? formatNumber(selectedMetric.values[selectedMetric.values.length - 1].numeric_value)
                                                    : selectedMetric.values[selectedMetric.values.length - 1].value}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Year: {selectedMetric.values[selectedMetric.values.length - 1].year}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">No data available</p>
                                    )}
                                </div>

                                {/* Data Quality */}
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                    <h4 className="font-bold mb-3">Data Quality</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Verification Status</span>
                                            <span className="font-bold">
                                                {selectedMetric.data_quality?.verification_status?.join(', ') || 'Unverified'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Sources</span>
                                            <span className="font-bold">
                                                {selectedMetric.data_quality?.sources?.length || 0} sources
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Years Available</span>
                                            <span className="font-bold">
                                                {selectedMetric.data_quality?.years?.length || 0} years
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Historical Values */}
                            {selectedMetric.values && selectedMetric.values.length > 0 && (
                                <div>
                                    <h4 className="font-bold mb-3">Historical Values</h4>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    <th className="text-left p-3">Year</th>
                                                    <th className="text-left p-3">Value</th>
                                                    <th className="text-left p-3">Numeric Value</th>
                                                    <th className="text-left p-3">Source Notes</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedMetric.values.map((value: any, index: number) => (
                                                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="p-3">{value.year}</td>
                                                        <td className="p-3 font-medium">{value.value}</td>
                                                        <td className="p-3">
                                                            {value.numeric_value ? formatNumber(value.numeric_value) : 'N/A'}
                                                        </td>
                                                        <td className="p-3 text-sm text-gray-600">
                                                            {value.source_notes || 'No notes'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    onClick={() => setIsMetricModalOpen(false)}
                                    className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-bold"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        console.log('Export metric:', selectedMetric);
                                        alert(`Exporting ${selectedMetric.name} data`);
                                    }}
                                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold"
                                >
                                    Export Metric Data
                                </button>
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
                                <h3 className="text-2xl font-bold">Export Community Report</h3>
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
                                        <span>All Metrics ({allMetrics.length})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span>Community Benefits Analysis</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span>Social License Assessment</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span>SDG Alignment</span>
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
                                        alert(`Exporting Community Engagement Report as ${exportFormat.toUpperCase()}`);
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

export default CommunityReportsTab;