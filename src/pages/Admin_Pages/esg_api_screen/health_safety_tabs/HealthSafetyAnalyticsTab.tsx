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
    Ambulance,
    AlertCircle,
    Clock,
    Activity,
    Heart,
    Brain,
    Award,
    Shield,
    X,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    Briefcase,
    Stethoscope,
    Thermometer,
    Zap,
    Bell,
    BarChart3,
    Settings,
    Trash2,
    DollarSign,
    Package,
    Flame,
    Cpu,
    Archive,
    ActivitySquare,
    Bandage,
    Calendar,
    CheckCircle,
    ClipboardCheck,
    Eye,
    FileText,
    Flag,
    Home,
    MapPin,
    MessageSquare,
    PieChart,
    Search,
    Star,
    UserCheck,
    UserPlus,
    Virus,
    Wifi,
    Factory, // Added Factory icon here
} from "lucide-react";

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

interface HealthSafetyAnalyticsTabProps {
    healthSafetyData: any;
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

const HealthSafetyAnalyticsTab: React.FC<HealthSafetyAnalyticsTabProps> = ({
    healthSafetyData,
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

    if (!healthSafetyData) {
        return (
            <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl">
                <div className="text-center max-w-md p-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                        <ShieldCheck className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">No Health & Safety Analytics Data Available</h3>
                    <p className="text-gray-600 leading-relaxed">Select a company to view detailed health & safety analytics and insights.</p>
                </div>
            </div>
        );
    }

    const apiData = healthSafetyData?.data;
    if (!apiData) {
        return (
            <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl">
                <div className="text-center max-w-md p-8">
                    <AlertCircle className="w-12 h-12 mx-auto mb-6 text-amber-500" />
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">Invalid Data Format</h3>
                    <p className="text-gray-600 leading-relaxed">The health & safety data format is invalid or corrupted.</p>
                </div>
            </div>
        );
    }

    // Extract data from API response
    const companyInfo = apiData.company;
    const yearData = apiData.year_data;
    const healthSafetySummary = apiData.health_safety_summary;
    const incidentData = apiData.incident_data;
    const safetyCommittees = apiData.safety_committees;
    const workerHealth = apiData.worker_health;
    const socialMetrics = apiData.social_metrics;
    const detailedMetrics = apiData.detailed_health_safety_metrics;
    const graphsData = apiData.graphs;
    const safetyInitiatives = apiData.safety_initiatives;
    const safetyBenchmarks = apiData.safety_benchmarks;
    const recommendations = apiData.recommendations;
    const dataQuality = apiData.data_quality;

    // Get reporting year
    const reportingYear = yearData?.requested_year || new Date().getFullYear();

    // Calculate key health & safety metrics
    const healthSafetyMetrics = useMemo(() => {
        if (!healthSafetySummary || !incidentData) return null;

        const performance = healthSafetySummary.performance_indicators;
        const incidents = incidentData;
        const safetySnapshot = healthSafetySummary.safety_snapshot;

        // Calculate derived metrics
        const injuryRate = parseFloat(performance.injury_rate.value as string) || 0;
        const totalInjuries = parseInt(performance.total_injuries.value as string) || 0;
        const safetyMeetings = parseInt(performance.safety_meetings.value as string) || 0;
        const safetyTrainingHours = parseInt(performance.safety_training.value as string) || 0;
        const daysSinceLastLTI = safetySnapshot?.days_since_last_lost_time_injury || 0;
        const safetyCultureScore = safetySnapshot?.safety_culture_score || 0;
        const fatalities = incidents.fatalities?.count || 0;
        const lostTimeInjuries = incidents.lost_time_injuries?.count || 0;
        const totalRecordableInjuries = incidents.total_recordable_injuries?.count || 0;
        const nearMisses = incidents.near_misses?.count || 0;

        // Calculate incident severity breakdown
        const severityBreakdown = incidents.total_recordable_injuries?.severity_breakdown || { minor: 0, moderate: 0, serious: 0 };
        const totalSeverity = severityBreakdown.minor + severityBreakdown.moderate + severityBreakdown.serious;

        // Calculate percentages
        const minorPercentage = totalSeverity > 0 ? (severityBreakdown.minor / totalSeverity) * 100 : 0;
        const moderatePercentage = totalSeverity > 0 ? (severityBreakdown.moderate / totalSeverity) * 100 : 0;
        const seriousPercentage = totalSeverity > 0 ? (severityBreakdown.serious / totalSeverity) * 100 : 0;

        // Get PPE compliance
        const ppeCompliance = workerHealth?.protective_equipment?.ppe_compliance || 0;

        // Get medical services
        const medicalExams = workerHealth?.medical_services?.medical_examinations || 0;
        const firstAidCertified = workerHealth?.medical_services?.first_aid_certified_staff || 0;
        const emergencyTeams = workerHealth?.medical_services?.emergency_response_teams || 0;

        // Safety committees
        const agriCommittee = safetyCommittees?.agriculture_committee;
        const millingCommittee = safetyCommittees?.milling_committee;
        const totalCommitteeMeetings = (agriCommittee?.meetings || 0) + (millingCommittee?.meetings || 0);
        const totalCommitteeMembers = (agriCommittee?.members || 0) + (millingCommittee?.members || 0);

        // Calculate safety score (composite)
        const safetyScore = Math.max(0, 100 -
            (fatalities * 20) -
            (lostTimeInjuries * 10) -
            (totalRecordableInjuries * 5) +
            (safetyCultureScore) +
            (ppeCompliance) +
            (Math.min(safetyTrainingHours / 100, 10)) +
            (Math.min(safetyMeetings / 12, 10)) +
            (Math.min(nearMisses / 100, 5)) // Near misses indicate good reporting culture
        );

        return {
            injuryRate,
            totalInjuries,
            safetyMeetings,
            safetyTrainingHours,
            daysSinceLastLTI,
            safetyCultureScore,
            fatalities,
            lostTimeInjuries,
            totalRecordableInjuries,
            nearMisses,
            severityBreakdown,
            minorPercentage,
            moderatePercentage,
            seriousPercentage,
            ppeCompliance,
            medicalExams,
            firstAidCertified,
            emergencyTeams,
            totalCommitteeMeetings,
            totalCommitteeMembers,
            safetyScore,
        };
    }, [healthSafetySummary, incidentData, workerHealth, safetyCommittees]);

    // Get trend data from graphs
    const trends = useMemo(() => {
        if (!graphsData?.injury_rate_trend) return null;

        const injuryTrend = graphsData.injury_rate_trend;
        const labels = injuryTrend.labels || [];
        const injuryData = injuryTrend.datasets?.[0]?.data as number[] || [];

        // Calculate trends
        const getTrend = (data: number[]) => {
            if (data.length < 2) return 'Stable';
            const first = data[0];
            const last = data[data.length - 1];
            const percentageChange = ((last - first) / first) * 100;

            if (percentageChange > 10) return 'Increasing';
            if (percentageChange < -10) return 'Decreasing';
            return 'Stable';
        };

        return {
            injuryRateTrend: getTrend(injuryData),
            safetyPerformanceTrend: healthSafetyMetrics?.safetyScore > 80 ? 'Improving' :
                healthSafetyMetrics?.safetyScore > 60 ? 'Stable' : 'Declining',
            incidentTrend: (healthSafetyMetrics?.totalRecordableInjuries || 0) > 5 ? 'Monitor' : 'Improving',
        };
    }, [graphsData, healthSafetyMetrics]);

    // Key insights data
    const insights = {
        trends: [
            {
                title: 'Safety Culture Score',
                description: `Safety culture score of ${healthSafetyMetrics?.safetyCultureScore}/100 indicates ${healthSafetyMetrics?.safetyCultureScore > 80 ? 'strong' : 'moderate'} safety culture`,
                icon: <ShieldCheck className="w-5 h-5 text-green-600" />,
                impact: healthSafetyMetrics?.safetyCultureScore > 80 ? 'High' : healthSafetyMetrics?.safetyCultureScore > 60 ? 'Medium' : 'Low',
                confidence: 0.92,
            },
            {
                title: 'Injury Rate Trend',
                description: `Injury rate shows ${healthSafetySummary?.performance_indicators?.injury_rate?.trend?.toLowerCase() || 'stable'} trend at ${healthSafetyMetrics?.injuryRate?.toFixed(2) || '0'} per 100 employees`,
                icon: <Activity className="w-5 h-5 text-green-600" />,
                impact: healthSafetyMetrics?.injuryRate < 2 ? 'Low' : healthSafetyMetrics?.injuryRate < 5 ? 'Medium' : 'High',
                confidence: 0.88,
            },
            {
                title: 'Days Without Lost Time Injury',
                description: `${healthSafetyMetrics?.daysSinceLastLTI || 0} days since last lost time injury`,
                icon: <Calendar className="w-5 h-5 text-blue-600" />,
                impact: healthSafetyMetrics?.daysSinceLastLTI > 365 ? 'Excellent' : healthSafetyMetrics?.daysSinceLastLTI > 180 ? 'Good' : 'Monitor',
                confidence: 0.95,
            },
        ],
        risks: [
            {
                title: 'Fatalities Risk',
                description: `${healthSafetyMetrics?.fatalities || 0} fatalities reported in current period`,
                icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
                priority: healthSafetyMetrics?.fatalities > 0 ? 'Critical' : 'Low',
                timeframe: 'Immediate',
            },
            {
                title: 'Severity of Injuries',
                description: `${healthSafetyMetrics?.seriousPercentage?.toFixed(1) || 0}% of injuries are serious`,
                icon: <Bandage className="w-5 h-5 text-amber-600" />,
                priority: healthSafetyMetrics?.seriousPercentage > 20 ? 'High' : healthSafetyMetrics?.seriousPercentage > 10 ? 'Medium' : 'Low',
                timeframe: 'Monitor',
            },
            {
                title: 'PPE Compliance Gap',
                description: `PPE compliance at ${healthSafetyMetrics?.ppeCompliance || 0}%, ${healthSafetyMetrics?.ppeCompliance < 95 ? 'below' : 'meeting'} target`,
                icon: <Shield className="w-5 h-5 text-yellow-600" />,
                priority: healthSafetyMetrics?.ppeCompliance < 90 ? 'High' : healthSafetyMetrics?.ppeCompliance < 95 ? 'Medium' : 'Low',
                timeframe: 'Short-term',
            },
        ],
        opportunities: [
            {
                title: 'Increase Safety Training',
                description: `Potential to increase safety training from ${healthSafetyMetrics?.safetyTrainingHours || 0} to recommended 40+ hours annually`,
                icon: <Users className="w-5 h-5 text-green-600" />,
                value: healthSafetyMetrics?.safetyTrainingHours < 30 ? 'High' : 'Medium',
                timeframe: '3-6 months',
            },
            {
                title: 'Enhance Near Miss Reporting',
                description: `${healthSafetyMetrics?.nearMisses || 0} near misses reported - opportunity to improve reporting culture`,
                icon: <Eye className="w-5 h-5 text-blue-600" />,
                value: healthSafetyMetrics?.nearMisses < 50 ? 'High' : 'Medium',
                timeframe: '1-2 years',
            },
            {
                title: 'Expand Wellness Programs',
                description: workerHealth?.wellness_programs?.mental_health_support ?
                    'Wellness programs exist - opportunity to expand' :
                    'Opportunity to implement mental health support programs',
                icon: <Heart className="w-5 h-5 text-purple-600" />,
                value: 'High',
                timeframe: '6-12 months',
            },
        ],
    };

    // Health & Safety metrics analysis
    const safetyMetricsData = [
        {
            title: 'Total Recordable Injuries',
            value: healthSafetyMetrics?.totalRecordableInjuries || 0,
            unit: 'injuries',
            trend: trends?.incidentTrend || 'Stable',
            icon: <Activity className="w-6 h-6 text-red-600" />,
            percentage: healthSafetyMetrics?.totalRecordableInjuries > 10 ? 'High' : 'Moderate',
        },
        {
            title: 'Lost Time Injuries',
            value: healthSafetyMetrics?.lostTimeInjuries || 0,
            unit: 'injuries',
            trend: healthSafetyMetrics?.lostTimeInjuries > 2 ? 'Monitor' : 'Stable',
            icon: <Calendar className="w-6 h-6 text-amber-600" />,
            averageDays: incidentData?.lost_time_injuries?.average_recovery_days || 0,
        },
        {
            title: 'Safety Training Hours',
            value: healthSafetyMetrics?.safetyTrainingHours || 0,
            unit: 'hours',
            trend: healthSafetyMetrics?.safetyTrainingHours > 30 ? 'Improving' : 'Needs Attention',
            icon: <Users className="w-6 h-6 text-green-600" />,
            target: 40,
        },
        {
            title: 'PPE Compliance',
            value: healthSafetyMetrics?.ppeCompliance || 0,
            unit: '%',
            trend: healthSafetyMetrics?.ppeCompliance > 95 ? 'Excellent' : healthSafetyMetrics?.ppeCompliance > 90 ? 'Good' : 'Needs Improvement',
            icon: <Shield className="w-6 h-6 text-blue-600" />,
            target: 98,
        },
    ];

    // Incident severity breakdown
    const incidentSeverityData = [
        {
            severity: 'Minor',
            count: healthSafetyMetrics?.severityBreakdown?.minor || 0,
            percentage: healthSafetyMetrics?.minorPercentage || 0,
            color: '#10B981',
            icon: <CheckCircle className="w-4 h-4 text-green-600" />,
        },
        {
            severity: 'Moderate',
            count: healthSafetyMetrics?.severityBreakdown?.moderate || 0,
            percentage: healthSafetyMetrics?.moderatePercentage || 0,
            color: '#FBBF24',
            icon: <AlertCircle className="w-4 h-4 text-yellow-600" />,
        },
        {
            severity: 'Serious',
            count: healthSafetyMetrics?.severityBreakdown?.serious || 0,
            percentage: healthSafetyMetrics?.seriousPercentage || 0,
            color: '#EF4444',
            icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
        },
    ];

    // Safety committee analysis
    const committeeAnalysis = [
        {
            title: 'Agriculture Committee',
            meetings: safetyCommittees?.agriculture_committee?.meetings || 0,
            members: safetyCommittees?.agriculture_committee?.members || 0,
            initiatives: safetyCommittees?.agriculture_committee?.initiatives_completed || 0,
            focusAreas: safetyCommittees?.agriculture_committee?.focus_areas || [],
            icon: <Home className="w-5 h-5 text-green-600" />,
        },
        {
            title: 'Milling Committee',
            meetings: safetyCommittees?.milling_committee?.meetings || 0,
            members: safetyCommittees?.milling_committee?.members || 0,
            initiatives: safetyCommittees?.milling_committee?.initiatives_completed || 0,
            focusAreas: safetyCommittees?.milling_committee?.focus_areas || [],
            icon: <Factory className="w-5 h-5 text-blue-600" />,
        },
        {
            title: 'Total Committee Meetings',
            value: healthSafetyMetrics?.totalCommitteeMeetings || 0,
            unit: 'meetings',
            icon: <Users className="w-5 h-5 text-purple-600" />,
        },
        {
            title: 'Cross-Company Initiatives',
            value: safetyCommittees?.cross_company_initiatives?.length || 0,
            unit: 'initiatives',
            icon: <Target className="w-5 h-5 text-amber-600" />,
        },
    ];

    // Worker health metrics
    const workerHealthData = [
        {
            title: 'Medical Examinations',
            value: healthSafetyMetrics?.medicalExams || 0,
            unit: 'exams',
            trend: 'Regular',
            icon: <Stethoscope className="w-5 h-5 text-green-600" />,
        },
        {
            title: 'First Aid Certified Staff',
            value: healthSafetyMetrics?.firstAidCertified || 0,
            unit: 'staff',
            trend: healthSafetyMetrics?.firstAidCertified > 20 ? 'Good' : 'Needs Improvement',
            icon: <Ambulance className="w-5 h-5 text-red-600" />,
        },
        {
            title: 'Emergency Response Teams',
            value: healthSafetyMetrics?.emergencyTeams || 0,
            unit: 'teams',
            trend: 'Established',
            icon: <Bell className="w-5 h-5 text-blue-600" />,
        },
        {
            title: 'Mental Health Support',
            value: workerHealth?.wellness_programs?.mental_health_support ? 'Available' : 'Not Available',
            unit: '',
            trend: workerHealth?.wellness_programs?.mental_health_support ? 'Good' : 'Needs Implementation',
            icon: <Brain className="w-5 h-5 text-purple-600" />,
        },
    ];

    // Performance indicators
    const performanceIndicatorsData = [
        {
            title: 'Injury Rate',
            value: healthSafetyMetrics?.injuryRate || 0,
            unit: 'per 100 employees',
            trend: trends?.injuryRateTrend || 'Stable',
            icon: <Activity className="w-5 h-5 text-red-600" />,
        },
        {
            title: 'Safety Culture Score',
            value: healthSafetyMetrics?.safetyCultureScore || 0,
            unit: '/100',
            trend: healthSafetyMetrics?.safetyCultureScore > 80 ? 'Excellent' : healthSafetyMetrics?.safetyCultureScore > 60 ? 'Good' : 'Needs Improvement',
            icon: <ShieldCheck className="w-5 h-5 text-green-600" />,
        },
        {
            title: 'Near Miss Reporting Rate',
            value: incidentData?.near_misses?.reporting_rate || '0%',
            unit: '',
            trend: incidentData?.near_misses?.trend === 'increasing' ? 'Improving' : 'Stable',
            icon: <Eye className="w-5 h-5 text-blue-600" />,
        },
        {
            title: 'Overall Safety Score',
            value: healthSafetyMetrics?.safetyScore || 0,
            unit: '/100',
            trend: trends?.safetyPerformanceTrend || 'Stable',
            icon: <Award className="w-5 h-5 text-amber-600" />,
        },
    ];

    // Safety initiatives data
    const safetyInitiativesData = safetyInitiatives?.active_programs?.slice(0, 4) || [];

    // Benchmarks comparison
    const benchmarksData = [
        {
            metric: 'LTIFR (Our Company)',
            value: safetyBenchmarks?.comparison_data?.our_ltifr || '0.0',
            unit: '',
            comparison: 'vs Industry',
            icon: <Activity className="w-4 h-4 text-green-600" />,
        },
        {
            metric: 'Industry Average LTIFR',
            value: safetyBenchmarks?.comparison_data?.industry_average_ltifr || '0.0',
            unit: '',
            comparison: 'Benchmark',
            icon: <BarChart3 className="w-4 h-4 text-blue-600" />,
        },
        {
            metric: 'Safety Training Hours',
            value: safetyBenchmarks?.comparison_data?.our_safety_training_hours || 0,
            unit: 'hours',
            comparison: `Industry: ${safetyBenchmarks?.comparison_data?.industry_average_training_hours || 0}`,
            icon: <Users className="w-4 h-4 text-purple-600" />,
        },
        {
            metric: 'Best in Class LTIFR',
            value: safetyBenchmarks?.comparison_data?.best_in_class_ltifr || '0.0',
            unit: '',
            comparison: 'Target',
            icon: <Target className="w-4 h-4 text-amber-600" />,
        },
    ];

    // Simplified explanations for health & safety terms
    const simpleExplanations = {
        'LTIFR (Lost Time Injury Frequency Rate)': 'Number of lost time injuries per million hours worked',
        'Safety Culture Score': 'Measure of employee attitudes, beliefs, and perceptions regarding safety',
        'Near Miss Reporting': 'Reporting of incidents that could have resulted in injury but did not',
        'PPE Compliance': 'Percentage of workers properly using required personal protective equipment',
        'Total Recordable Injury Rate (TRIR)': 'Number of recordable injuries per 100 full-time employees',
        'Safety Committees': 'Structured groups responsible for overseeing safety programs and initiatives',
    };

    return (
        <div className="space-y-8 pb-8">

            {/* Key Insights Section */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10 hover:shadow-2xl transition-shadow duration-300">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                            Health & Safety Insights & Analytics
                        </h3>
                        <p className="text-gray-600 text-lg">Deep analysis of workplace health, safety performance, and risk management</p>
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
                                        <span className={`px-4 py-2 rounded-xl text-xs font-bold ${(insight.impact || insight.priority || insight.value) === 'High' || (insight.impact || insight.priority || insight.value) === 'Critical' || (insight.impact || insight.priority || insight.value) === 'Excellent'
                                            ? 'bg-green-100 text-green-700'
                                            : (insight.impact || insight.priority || insight.value) === 'Medium' || (insight.impact || insight.priority || insight.value) === 'Good'
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

            {/* Health & Safety Metrics Analysis */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                    Health & Safety Performance Analysis
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                    {safetyMetricsData.map((metric, index) => (
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
                                    {'percentage' in metric && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            Severity: {metric.percentage}
                                        </p>
                                    )}
                                    {'averageDays' in metric && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            Avg Recovery: {metric.averageDays} days
                                        </p>
                                    )}
                                    {'target' in metric && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            Target: {metric.target} {metric.unit}
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

            {/* Incident Analysis & Committees */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Incident Severity Breakdown */}
                    <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-red-600" />
                            Incident Severity Breakdown
                        </h4>
                        <div className="space-y-4">
                            {incidentSeverityData.map((severity, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-red-50 to-orange-50"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {severity.icon}
                                            <span className="font-semibold text-gray-900">{severity.severity}</span>
                                        </div>
                                        <span className="font-bold text-gray-900">{severity.percentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                        <div
                                            className="h-2 rounded-full"
                                            style={{
                                                width: `${severity.percentage}%`,
                                                backgroundColor: severity.color
                                            }}
                                        ></div>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {formatNumber(severity.count)} incidents
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Safety Committees Analysis */}
                    <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            Safety Committees Analysis
                        </h4>
                        <div className="space-y-4">
                            {committeeAnalysis.map((committee, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-blue-50 to-cyan-50"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {committee.icon}
                                            <span className="font-semibold text-gray-900">{committee.title}</span>
                                        </div>
                                        {'meetings' in committee ? (
                                            <span className="font-bold text-gray-900">
                                                {formatNumber(committee.meetings)} meetings
                                            </span>
                                        ) : (
                                            <span className="font-bold text-gray-900">
                                                {formatNumber(committee.value)} {committee.unit}
                                            </span>
                                        )}
                                    </div>
                                    {'members' in committee && (
                                        <p className="text-sm text-gray-600">
                                            {committee.members} members • {committee.initiatives} initiatives completed
                                        </p>
                                    )}
                                    {'focusAreas' in committee && committee.focusAreas.length > 0 && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            Focus: {committee.focusAreas.slice(0, 2).join(', ')}...
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Worker Health & Wellness */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                    Worker Health & Wellness Analysis
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {workerHealthData.map((metric, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-3xl border-2 border-gray-200 hover:border-purple-400 bg-gradient-to-br from-white to-gray-50 hover:from-purple-50 hover:to-pink-50 transition-all duration-300 hover:shadow-xl"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                                    {metric.icon}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">{metric.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {typeof metric.value === 'number' ? formatNumber(metric.value) : metric.value}
                                        <span className="text-lg">{metric.unit}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                                {getTrendIcon(metric.trend)}
                                <span className="text-sm font-semibold text-gray-700">{metric.trend}</span>
                            </div>
                        </div>
                    ))}
                </div>
                {workerHealth?.wellness_programs?.health_screenings && (
                    <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-2 font-medium">Health Screenings</p>
                                <p className="text-xl font-bold text-purple-700">
                                    {workerHealth.wellness_programs.health_screenings}
                                </p>
                            </div>
                            {workerHealth?.wellness_programs?.vaccination_campaigns?.length > 0 && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-2 font-medium">Vaccination Campaigns</p>
                                    <p className="text-xl font-bold text-purple-600">
                                        {workerHealth.wellness_programs.vaccination_campaigns.length} campaigns
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Performance Indicators */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                    Safety Performance Indicators
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

            {/* Safety Initiatives & Benchmarks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Safety Initiatives */}
                <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <Target className="w-7 h-7 text-blue-600" />
                        Active Safety Initiatives
                    </h3>
                    <div className="space-y-4">
                        {safetyInitiativesData.map((initiative, index) => (
                            <div key={index} className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-xl bg-white">
                                        <Target className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 mb-1">{initiative.name}</h4>
                                        <p className="text-sm text-gray-600 mb-2">{initiative.description}</p>
                                        {initiative.participation && (
                                            <p className="text-xs text-gray-500">Participation: {initiative.participation}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {safetyInitiatives?.upcoming_focus_areas?.length > 0 && (
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 mt-6">
                                <h4 className="font-semibold text-gray-900 mb-3">Upcoming Focus Areas</h4>
                                {safetyInitiatives.upcoming_focus_areas.slice(0, 2).map((area, index) => (
                                    <div key={index} className="flex items-center gap-2 mb-2">
                                        <ChevronRight className="w-4 h-4 text-amber-600" />
                                        <span className="text-sm text-gray-700">{area.area} ({area.timeline})</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Benchmarks Comparison */}
                <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <BarChart3 className="w-7 h-7 text-amber-600" />
                        Industry Benchmarks
                    </h3>
                    <div className="space-y-4">
                        {benchmarksData.map((benchmark, index) => (
                            <div key={index} className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {benchmark.icon}
                                        <span className="font-semibold text-gray-900">{benchmark.metric}</span>
                                    </div>
                                    <span className="font-bold text-gray-900">
                                        {typeof benchmark.value === 'number' ? formatNumber(benchmark.value) : benchmark.value}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600">{benchmark.comparison}</p>
                            </div>
                        ))}
                        {safetyBenchmarks?.certifications?.length > 0 && (
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 mt-6">
                                <h4 className="font-semibold text-gray-900 mb-3">Safety Certifications</h4>
                                {safetyBenchmarks.certifications.slice(0, 3).map((cert, index) => (
                                    <div key={index} className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span className="text-sm text-gray-700">{cert.name} - {cert.status}</span>
                                    </div>
                                ))}
                            </div>
                        )}
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
                        <p className="text-gray-600 text-lg">Understanding health & safety metrics made easy</p>
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
                                    <ShieldCheck className="w-6 h-6 text-green-600" />
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

                <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <Settings className="w-7 h-7 text-blue-600" />
                        Calculation Methodology
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-green-50 border border-green-200">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Injury Rate (LTIFR)</p>
                            <p className="text-sm text-gray-700">(Number of Lost Time Injuries × 1,000,000) / Total Hours Worked</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Safety Culture Score</p>
                            <p className="text-sm text-gray-700">Composite score based on employee surveys, audit results, and safety observations</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                            <p className="text-sm font-semibold text-gray-900 mb-2">PPE Compliance Rate</p>
                            <p className="text-sm text-gray-700">(Number of compliant observations / Total observations) × 100</p>
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
                            Your health & safety performance shows {healthSafetyMetrics?.safetyScore > 80 ? 'strong' : 'moderate'} safety culture with {healthSafetyMetrics?.fatalities > 0 ? 'critical areas for improvement' : 'opportunities for enhancement'} in safety training and incident prevention.
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
                                        <h3 className="text-3xl font-bold">Action Recommendations</h3>
                                        <p className="text-green-100 text-lg mt-1">Based on your health & safety analytics</p>
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
                                healthSafetyMetrics?.fatalities > 0 && {
                                    title: 'Enhanced Fatality Prevention Program',
                                    description: `${healthSafetyMetrics?.fatalities} fatalities reported. Implement root cause analysis and enhanced safety controls.`,
                                    impact: 'Critical',
                                    effort: 'High',
                                    timeframe: 'Immediate',
                                    icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
                                },
                                healthSafetyMetrics?.safetyTrainingHours < 30 && {
                                    title: 'Increase Safety Training Hours',
                                    description: `Current safety training at ${healthSafetyMetrics?.safetyTrainingHours} hours. Target 40+ hours annually for high-risk roles.`,
                                    impact: 'High',
                                    effort: 'Medium',
                                    timeframe: '3-6 months',
                                    icon: <Users className="w-6 h-6 text-green-600" />,
                                },
                                healthSafetyMetrics?.ppeCompliance < 95 && {
                                    title: 'Improve PPE Compliance Program',
                                    description: `PPE compliance at ${healthSafetyMetrics?.ppeCompliance}%. Implement regular audits and training refreshers.`,
                                    impact: 'High',
                                    effort: 'Medium',
                                    timeframe: '1-3 months',
                                    icon: <Shield className="w-6 h-6 text-blue-600" />,
                                },
                                healthSafetyMetrics?.seriousPercentage > 15 && {
                                    title: 'Reduce Serious Injury Frequency',
                                    description: `${healthSafetyMetrics?.seriousPercentage.toFixed(1)}% of injuries are serious. Focus on high-risk activity controls.`,
                                    impact: 'High',
                                    effort: 'High',
                                    timeframe: '6-12 months',
                                    icon: <Bandage className="w-6 h-6 text-amber-600" />,
                                },
                                healthSafetyMetrics?.nearMisses < 100 && {
                                    title: 'Enhance Near Miss Reporting Culture',
                                    description: `${healthSafetyMetrics?.nearMisses} near misses reported. Implement anonymous reporting and recognition program.`,
                                    impact: 'Medium',
                                    effort: 'Low',
                                    timeframe: '1-2 months',
                                    icon: <Eye className="w-6 h-6 text-purple-600" />,
                                },
                                !workerHealth?.wellness_programs?.mental_health_support && {
                                    title: 'Implement Mental Health Support Program',
                                    description: 'No mental health support currently available. Implement employee assistance program and mental health first aid.',
                                    impact: 'High',
                                    effort: 'Medium',
                                    timeframe: '3-6 months',
                                    icon: <Brain className="w-6 h-6 text-pink-600" />,
                                },
                                healthSafetyMetrics?.firstAidCertified < 10 && {
                                    title: 'Increase First Aid Certified Staff',
                                    description: `Only ${healthSafetyMetrics?.firstAidCertified} staff first aid certified. Target 10% of workforce certified.`,
                                    impact: 'Medium',
                                    effort: 'Low',
                                    timeframe: '2-4 months',
                                    icon: <Ambulance className="w-6 h-6 text-red-600" />,
                                },
                                ...(recommendations?.slice(0, 3) || []).map(rec => ({
                                    title: rec.action,
                                    description: rec.impact,
                                    impact: rec.priority,
                                    effort: rec.investment_required ? (rec.investment_required.includes('High') ? 'High' : 'Medium') : 'Medium',
                                    timeframe: rec.timeline,
                                    icon: <Target className="w-6 h-6 text-emerald-600" />,
                                }))
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
                                                    <span className={`px-4 py-2 rounded-xl text-sm font-bold ${recommendation.impact === 'Critical' || recommendation.impact === 'High'
                                                        ? 'bg-red-100 text-red-800'
                                                        : recommendation.impact === 'Medium'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-amber-100 text-amber-800'
                                                        }`}>
                                                        Impact: {recommendation.impact}
                                                    </span>
                                                    <span className={`px-4 py-2 rounded-xl text-sm font-bold ${recommendation.effort === 'High'
                                                        ? 'bg-red-100 text-red-800'
                                                        : recommendation.effort === 'Medium'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-amber-100 text-amber-800'
                                                        }`}>
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

export default HealthSafetyAnalyticsTab;