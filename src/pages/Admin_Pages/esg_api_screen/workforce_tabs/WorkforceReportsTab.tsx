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
    User,
    Users as UsersIcon,
    Target as TargetIcon,
    Award as AwardIcon,
    GraduationCap,
    Heart,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Percent,
    Calendar,
    Briefcase,
    UserCheck,
    UserPlus,
    UserMinus,
    Smile,
    Frown,
    ThumbsUp,
    Brain,
    Handshake,
    Globe as GlobeIcon,
    Scale,
    Building as BuildingIcon,
    Book,
    PieChart,
    Users as UsersGroup,
    Wrench,
    Lightbulb,
    Rocket,
} from "lucide-react";

// Color Palette (same as WasteReportsTab)
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

interface WorkforceReportsTabProps {
    workforceData: any;
    selectedCompany: any;
    formatNumber: (num: number | null) => string;
    formatCurrency: (num: number | null) => string;
    formatPercent: (num: number | null) => string;
    selectedYear: number | null;
    availableYears: number[];
    onMetricClick: (metric: any, modalType: string) => void;
}

const WorkforceReportsTab: React.FC<WorkforceReportsTabProps> = ({
    workforceData,
    selectedCompany,
    formatNumber,
    formatCurrency,
    formatPercent,
    availableYears,
    onMetricClick,
}) => {
    const [selectedReport, setSelectedReport] = useState<string>('esg-frameworks');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    if (!workforceData) {
        return (
            <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl">
                <div className="text-center max-w-md p-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="w-12 h-12 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">No Workforce Reports Available</h3>
                    <p className="text-gray-600">Select a company to view workforce diversity and social metrics information.</p>
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
                    <p className="text-gray-600">The workforce data format is invalid or corrupted.</p>
                </div>
            </div>
        );
    }

    // Extract data from API response
    const companyInfo = apiData.company;
    const yearData = apiData.year_data;
    const workforceSummary = apiData.workforce_summary;
    const workforceComposition = apiData.workforce_composition;
    const inclusionAndBelonging = apiData.inclusion_and_belonging;
    const socialMetrics = apiData.social_metrics;
    const detailedMetrics = apiData.detailed_workforce_metrics;
    const graphsData = apiData.graphs;
    const recommendations = apiData.recommendations;
    const dataQuality = apiData.data_quality;
    const apiInfo = apiData.api_info;
    const keyIndicators = apiData.key_indicators;

    // Get reporting year
    const reportingYear = yearData?.requested_year || new Date().getFullYear();

    // Performance indicators
    const performanceIndicators = workforceSummary?.performance_indicators;
    const totalEmployees = parseInt(performanceIndicators?.total_employees?.value?.toString() || "0");
    const genderDiversity = parseFloat(performanceIndicators?.gender_diversity?.value?.toString() || "0");
    const trainingHours = parseInt(performanceIndicators?.training_hours?.value?.toString() || "0");
    const engagementScore = parseFloat(performanceIndicators?.engagement_score?.value?.toString() || "0");

    // Workforce composition
    const genderDistribution = workforceComposition?.gender_distribution;
    const contractTypes = workforceComposition?.contract_types;
    const trainingSummary = workforceComposition?.training_summary;

    // Inclusion and belonging metrics
    const inclusionMetrics = inclusionAndBelonging?.metrics;
    const leadershipDiversity = inclusionMetrics?.leadership_diversity?.value || 0;
    const payEquity = inclusionMetrics?.pay_equity?.value || 0;
    const retentionRate = inclusionMetrics?.retention_rate?.value || 0;
    const inclusionScore = inclusionMetrics?.inclusion_score?.value || 0;

    // Calculate key metrics
    const maleCount = genderDistribution?.male?.count || 0;
    const femaleCount = genderDistribution?.female?.count || 0;
    const totalGenderCount = maleCount + femaleCount;
    
    const permanentCount = contractTypes?.permanent?.count || 0;
    const fixedTermCount = contractTypes?.fixed_term?.count || 0;
    const traineesCount = contractTypes?.trainees?.count || 0;
    const totalContractCount = permanentCount + fixedTermCount + (traineesCount || 0);

    // Get ESG frameworks from company
    const esgFrameworks = companyInfo?.esg_reporting_framework || [];

    // Create metadata for technical section
    const metadata = {
        api_version: apiInfo?.version || "1.0",
        calculation_version: apiInfo?.calculation_version || "1.0",
        generated_at: apiInfo?.timestamp || new Date().toISOString(),
        endpoint: apiInfo?.endpoint || "workforce-diversity",
        company_id: companyInfo?.id || companyInfo?._id || "N/A",
        period_requested: reportingYear.toString(),
        data_sources: [
            "HR management systems",
            "Payroll records",
            "Employee surveys",
            "Training management systems",
            "Diversity and inclusion reports"
        ]
    };

    // Key statistics
    const keyStats = {
        years_covered: availableYears.length || 1,
        total_metrics_analyzed: socialMetrics?.total_metrics || 0,
        current_year: reportingYear,
        gender_diversity_score: genderDiversity,
        engagement_score: engagementScore,
        inclusion_score: inclusionScore
    };

    // Get trend icons and colors
    const getTrendIcon = (trend: string) => {
        if (trend === 'up' || trend === 'increasing') {
            return <TrendingUpIcon className="w-4 h-4 text-green-600" />;
        } else if (trend === 'down' || trend === 'decreasing') {
            return <TrendingDownIcon className="w-4 h-4 text-red-600" />;
        }
        return null;
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Report Navigation */}
            <div className="bg-white rounded-3xl border-2 border-blue-100 shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Workforce Report Sections</h3>
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
                        { id: 'esg-frameworks', label: 'ESG Frameworks', icon: <BookOpen className="w-4 h-4" /> },
                        { id: 'workforce-composition', label: 'Workforce Composition', icon: <UsersGroup className="w-4 h-4" /> },
                        { id: 'inclusion-belonging', label: 'Inclusion & Belonging', icon: <Heart className="w-4 h-4" /> },
                        { id: 'training-development', label: 'Training & Development', icon: <GraduationCap className="w-4 h-4" /> },
                        { id: 'technical', label: 'Technical Data', icon: <Database className="w-4 h-4" /> },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedReport(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${selectedReport === tab.id
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

        
            {/* ESG Frameworks Report */}
            {selectedReport === 'esg-frameworks' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border-2 border-blue-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Workforce ESG Reporting Frameworks</h3>
                                <p className="text-gray-600">Frameworks and standards used for workforce diversity and social metrics reporting</p>
                            </div>
                            <BookOpen className="w-8 h-8 text-blue-600" />
                        </div>

                        <div className="space-y-6">
                            {esgFrameworks.length > 0 ? (
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
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
                                        <p className="text-gray-700">This company has not specified any ESG reporting frameworks for workforce diversity.</p>
                                    </div>
                                </div>
                            )}

                            {/* Performance Indicators */}
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                                <h4 className="font-bold text-lg text-gray-900 mb-4">Workforce Performance Indicators</h4>
                                <div className="space-y-4">
                                    {performanceIndicators && Object.entries(performanceIndicators).map(([key, value]: [string, any], index) => (
                                        <div key={index} className="flex justify-between items-center p-4 bg-white rounded-xl border border-purple-100">
                                            <div className="flex items-center gap-3">
                                                {key === 'total_employees' ? <Users className="w-5 h-5 text-blue-600" /> :
                                                    key === 'gender_diversity' ? <Scale className="w-5 h-5 text-pink-600" /> :
                                                        key === 'training_hours' ? <GraduationCap className="w-5 h-5 text-green-600" /> :
                                                            <Heart className="w-5 h-5 text-purple-600" />}
                                                <span className="font-medium text-gray-800 capitalize">{key.replace(/_/g, ' ')}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-bold text-gray-900">
                                                    {key === 'total_employees' ? formatNumber(value.value) :
                                                        key === 'gender_diversity' || key === 'engagement_score' ? 
                                                            `${parseFloat(value.value).toFixed(1)}${key === 'gender_diversity' ? '%' : ''}` :
                                                        formatNumber(value.value)}
                                                </span>
                                                {value.trend && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        {getTrendIcon(value.trend)}
                                                        <span className="text-xs text-gray-500">{value.trend}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Compliance Status */}
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <h4 className="font-bold text-lg text-gray-900 mb-4">Compliance & Reporting Status</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl">
                                        <div className="p-2 rounded-lg bg-green-100">
                                            <ShieldCheck className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800">Social Metrics Compliance</p>
                                            <p className="text-sm text-gray-600">
                                                Verified: {socialMetrics?.total_metrics - (yearData?.verification_summary?.unverified || 0)} of {socialMetrics?.total_metrics} metrics
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl">
                                        <div className="p-2 rounded-lg bg-blue-100">
                                            <Award className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800">Diversity Targets</p>
                                            <p className="text-sm text-gray-600">
                                                Active: {recommendations?.filter((r: any) => r.priority === 'High').length || 0} high priority targets
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Workforce Composition Report */}
            {selectedReport === 'workforce-composition' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border-2 border-blue-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Workforce Composition Analysis</h3>
                                <p className="text-gray-600">Detailed breakdown of workforce demographics and employment types</p>
                            </div>
                            <UsersGroup className="w-8 h-8 text-blue-600" />
                        </div>

                        {/* Gender Distribution */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Gender Distribution</h4>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <User className="w-6 h-6 text-blue-600" />
                                        <h5 className="font-bold text-lg text-gray-900">Male Employees</h5>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Count</span>
                                            <span className="font-bold text-blue-600">{formatNumber(maleCount)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Percentage</span>
                                            <span className="font-bold text-gray-900">
                                                {genderDistribution?.male?.percentage || '0%'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <User className="w-6 h-6 text-pink-600" />
                                        <h5 className="font-bold text-lg text-gray-900">Female Employees</h5>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Count</span>
                                            <span className="font-bold text-pink-600">{formatNumber(femaleCount)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Percentage</span>
                                            <span className="font-bold text-gray-900">
                                                {genderDistribution?.female?.percentage || '0%'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contract Type Breakdown */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Employment Contract Types</h4>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Briefcase className="w-5 h-5 text-green-600" />
                                        <h5 className="font-bold text-gray-900">Permanent</h5>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {formatNumber(permanentCount)}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        {contractTypes?.permanent?.percentage || '0%'} of workforce
                                    </p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Calendar className="w-5 h-5 text-amber-600" />
                                        <h5 className="font-bold text-gray-900">Fixed Term</h5>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {formatNumber(fixedTermCount)}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        {contractTypes?.fixed_term?.percentage || '0%'} of workforce
                                    </p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <GraduationCap className="w-5 h-5 text-purple-600" />
                                        <h5 className="font-bold text-gray-900">Trainees</h5>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {formatNumber(traineesCount)}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        {contractTypes?.trainees?.description || 'Training program participants'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Total Workforce Summary */}
                        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-2 font-medium">Total Workforce</p>
                                    <p className="text-4xl font-bold text-blue-700">
                                        {formatNumber(totalEmployees)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600 mb-2 font-medium">Gender Diversity Ratio</p>
                                    <p className="text-4xl font-bold text-gray-700">
                                        {totalGenderCount > 0 ? ((femaleCount / totalGenderCount) * 100).toFixed(1) : 0} <span className="text-lg">%</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Inclusion & Belonging Report */}
            {selectedReport === 'inclusion-belonging' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border-2 border-blue-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Inclusion & Belonging Analysis</h3>
                                <p className="text-gray-600">Diversity, equity, and inclusion metrics and initiatives</p>
                            </div>
                            <Heart className="w-8 h-8 text-pink-600" />
                        </div>

                        {/* Inclusion Metrics */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Inclusion Metrics</h4>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-200">
                                    <p className="text-sm text-gray-600 mb-2">Leadership Diversity</p>
                                    <p className="text-2xl font-bold text-purple-600">{leadershipDiversity.toFixed(1)}%</p>
                                    <p className="text-xs text-gray-500 mt-2">Representation in leadership</p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <p className="text-sm text-gray-600 mb-2">Pay Equity Score</p>
                                    <p className="text-2xl font-bold text-green-600">{payEquity.toFixed(1)}</p>
                                    <p className="text-xs text-gray-500 mt-2">On scale of 1-10</p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                    <p className="text-sm text-gray-600 mb-2">Retention Rate</p>
                                    <p className="text-2xl font-bold text-blue-600">{retentionRate.toFixed(1)}%</p>
                                    <p className="text-xs text-gray-500 mt-2">Employee retention</p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200">
                                    <p className="text-sm text-gray-600 mb-2">Inclusion Score</p>
                                    <p className="text-2xl font-bold text-pink-600">{inclusionScore.toFixed(1)}</p>
                                    <p className="text-xs text-gray-500 mt-2">Employee survey score</p>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Inclusion Metrics */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Detailed Inclusion Analysis</h4>
                            <div className="space-y-4">
                                {inclusionMetrics && Object.entries(inclusionMetrics).map(([key, metric]: [string, any], index) => (
                                    <div key={index} className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h5 className="font-bold text-lg text-gray-900 mb-2 capitalize">{key.replace(/_/g, ' ')}</h5>
                                                <p className="text-gray-700">{metric.description}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-3xl font-bold text-gray-800">
                                                    {metric.value}{metric.unit}
                                                </span>
                                                {metric.target && (
                                                    <p className="text-sm text-gray-600 mt-1">Target: {metric.target}</p>
                                                )}
                                            </div>
                                        </div>
                                        {metric.label && (
                                            <div className="text-sm text-gray-600">
                                                Metric: {metric.label}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Social Metrics Overview */}
                        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Social Metrics Overview</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Total Social Metrics Analyzed</span>
                                    <span className="font-bold text-gray-900">{socialMetrics?.total_metrics || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Metrics Categories</span>
                                    <span className="font-bold text-gray-900">
                                        {Object.keys(socialMetrics?.metrics_by_category || {}).length}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Verification Status</span>
                                    <span className="font-bold text-gray-900">
                                        {socialMetrics?.total_metrics - (yearData?.verification_summary?.unverified || 0)}/{socialMetrics?.total_metrics} verified
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Training & Development Report */}
            {selectedReport === 'training-development' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border-2 border-blue-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Training & Development Analysis</h3>
                                <p className="text-gray-600">Employee training, development programs, and skill enhancement</p>
                            </div>
                            <GraduationCap className="w-8 h-8 text-green-600" />
                        </div>

                        {/* Training Overview */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Training Overview</h4>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <p className="text-sm text-gray-600 mb-2">Total Training Hours</p>
                                    <p className="text-2xl font-bold text-green-600">{formatNumber(trainingHours)}</p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Total hours completed
                                    </p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                    <p className="text-sm text-gray-600 mb-2">Avg Hours per Employee</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {trainingSummary?.average_per_employee || '0'}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Per employee average
                                    </p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200">
                                    <p className="text-sm text-gray-600 mb-2">Industry Average</p>
                                    <p className="text-2xl font-bold text-amber-600">
                                        {trainingSummary?.industry_average || 'N/A'}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Benchmark comparison
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Training Compliance & Details */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Training Compliance & Details</h4>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <ClipboardCheck className="w-6 h-6 text-gray-600" />
                                        <h5 className="font-bold text-lg text-gray-900">Training Compliance</h5>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Status</span>
                                            <span className={`font-bold ${trainingSummary?.compliance === 'Compliant' ? 'text-green-600' : 'text-amber-600'}`}>
                                                {trainingSummary?.compliance || 'Not Specified'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Required Hours</span>
                                            <span className="font-bold text-gray-900">
                                                Based on industry standards
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Brain className="w-6 h-6 text-purple-600" />
                                        <h5 className="font-bold text-lg text-gray-900">Skill Development</h5>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Programs Available</span>
                                            <span className="font-bold text-gray-900">
                                                {detailedMetrics?.metrics ? Object.keys(detailedMetrics.metrics).length : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Focus Areas</span>
                                            <span className="font-bold text-gray-900">
                                                Leadership, Technical, Soft Skills
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                   
                    </div>
                </div>
            )}

            {/* Technical Data Report */}
            {selectedReport === 'technical' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border-2 border-blue-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Technical Metadata</h3>
                                <p className="text-gray-600">System information and data processing details</p>
                            </div>
                            <Database className="w-8 h-8 text-blue-600" />
                        </div>

                        {/* System Information */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">System Information</h4>
                            <div className="space-y-4">
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                                        <p className="text-sm text-gray-600 mb-1">API Version</p>
                                        <p className="text-lg font-bold text-gray-900">{metadata.api_version}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                        <p className="text-sm text-gray-600 mb-1">Calculation Version</p>
                                        <p className="text-lg font-bold text-gray-900">{metadata.calculation_version}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                                        <p className="text-sm text-gray-600 mb-1">Workforce Module Version</p>
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
                        <div>
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Data Quality & Verification</h4>
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
                                        <p className="text-sm text-gray-600 mb-2">Verification Status</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {socialMetrics?.total_metrics - (yearData?.verification_summary?.unverified || 0)}/{socialMetrics?.total_metrics} verified
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Last Updated</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {new Date(dataQuality?.last_updated || metadata.generated_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                {dataQuality?.notes && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="text-sm text-gray-600">{dataQuality.notes}</p>
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
                        <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold">Export Workforce Report</h3>
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
                                            className={`p-6 rounded-2xl border-2 transition-all text-left ${exportFormat === f.format ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className={`mb-3 ${exportFormat === f.format ? 'text-blue-600' : 'text-gray-400'}`}>
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
                                        <span>Workforce Composition</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span>Inclusion & Belonging</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span>Training & Development</span>
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
                                        alert(`Exporting Workforce Report as ${exportFormat.toUpperCase()}`);
                                        setIsExportModalOpen(false);
                                    }}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold"
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

export default WorkforceReportsTab;