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
    Heart,
    Stethoscope,
    Shield,
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
    Ambulance, // Added Ambulance icon
} from "lucide-react";

// Types from API service
import {
    HealthSafetyResponse,
    CompanyInfo,
    HealthSafetySummary,
    IncidentData,
    SafetyCommittees,
    WorkerHealth,
    SocialMetrics,
    SafetyInitiatives,
    SafetyBenchmarks,
    Recommendation,
    DataQuality,
    ApiInfo,
    PerformanceIndicator
} from "../../../../services/Admin_Service/esg_apis/health_and_safety_service";

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

interface HealthSafetyReportsTabProps {
    healthSafetyData: HealthSafetyResponse | null;
    selectedCompany: any;
    formatNumber: (num: number | null) => string;
    formatCurrency: (num: number | null) => string;
    formatPercent: (num: number | null) => string;
    selectedYear: number | null;
    availableYears: number[];
    onMetricClick: (metric: any, modalType: string) => void;
}

const HealthSafetyReportsTab: React.FC<HealthSafetyReportsTabProps> = ({
    healthSafetyData,
    selectedCompany,
    formatNumber,
    formatCurrency,
    formatPercent,
    availableYears,
    onMetricClick,
}) => {
    const [selectedReport, setSelectedReport] = useState<string>('summary');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');

    if (!healthSafetyData) {
        return (
            <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl">
                <div className="text-center max-w-md p-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                        <FileText className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">No Health & Safety Reports Available</h3>
                    <p className="text-gray-600">Select a company to view health & safety performance and compliance information.</p>
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
                    <p className="text-gray-600">The health & safety data format is invalid or corrupted.</p>
                </div>
            </div>
        );
    }

    // Extract data from API response
    const companyInfo = apiData.company;
    const yearData = apiData.year_data;
    const healthSafetySummary = apiData.health_safety_summary;
    const performanceIndicators = healthSafetySummary?.performance_indicators;
    const incidentData = apiData.incident_data;
    const safetyCommittees = apiData.safety_committees;
    const workerHealth = apiData.worker_health;
    const socialMetrics = apiData.social_metrics;
    const safetyInitiatives = apiData.safety_initiatives;
    const safetyBenchmarks = apiData.safety_benchmarks;
    const recommendations = apiData.recommendations;
    const dataQuality = apiData.data_quality;
    const apiInfo = apiData.api_info;

    // Get reporting year
    const reportingYear = yearData?.requested_year || new Date().getFullYear();

    // Calculate key health & safety metrics
    const safetyMetrics = {
        injuryRate: parseFloat(performanceIndicators?.injury_rate?.value?.toString() || "0"),
        totalInjuries: performanceIndicators?.total_injuries?.value || 0,
        safetyMeetings: performanceIndicators?.safety_meetings?.value || 0,
        safetyTraining: parseInt(performanceIndicators?.safety_training?.value?.toString() || "0"),
        fatalities: incidentData?.fatalities?.count || 0,
        lostTimeInjuries: incidentData?.lost_time_injuries?.count || 0,
        totalRecordableInjuries: incidentData?.total_recordable_injuries?.count || 0,
        nearMisses: incidentData?.near_misses?.count || 0,
        safetyCultureScore: healthSafetySummary?.safety_snapshot?.safety_culture_score || 0,
        daysSinceLastLTI: healthSafetySummary?.safety_snapshot?.days_since_last_lost_time_injury || 0,
        ppeCompliance: workerHealth?.protective_equipment?.ppe_compliance || 0,
        firstAidCertified: workerHealth?.medical_services?.first_aid_certified_staff || 0,
    };

    // Calculate additional metrics
    const totalIncidents = safetyMetrics.fatalities + safetyMetrics.lostTimeInjuries +
        safetyMetrics.totalRecordableInjuries + safetyMetrics.nearMisses;

    const incidentSeverityRate = safetyMetrics.totalInjuries > 0 ?
        (safetyMetrics.fatalities + safetyMetrics.lostTimeInjuries) / safetyMetrics.totalInjuries * 100 : 0;

    // Get ESG frameworks from company
    const esgFrameworks = companyInfo?.esg_reporting_framework || [];

    // Create metadata for technical section
    const metadata = {
        api_version: apiInfo?.version || "1.0",
        calculation_version: apiInfo?.calculation_version || "1.0",
        generated_at: apiInfo?.timestamp || new Date().toISOString(),
        endpoint: apiInfo?.endpoint || "health-safety",
        company_id: companyInfo?.id || "N/A",
        period_requested: reportingYear.toString(),
        data_sources: [
            "Incident reporting systems",
            "Safety committee minutes",
            "Training records",
            "Medical examination reports",
            "PPE compliance audits"
        ]
    };

    // Key statistics
    const keyStats = {
        years_covered: availableYears.length || 1,
        total_metrics_analyzed: socialMetrics?.total_metrics || 0,
        current_year: reportingYear,
        injury_rate: safetyMetrics.injuryRate,
        safety_culture_score: safetyMetrics.safetyCultureScore,
        total_incidents: totalIncidents
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Report Navigation */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Health & Safety Report Sections</h3>
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
                        { id: 'incidents-safety', label: 'Incidents & Safety', icon: <ShieldAlert className="w-4 h-4" /> },
                        { id: 'worker-health', label: 'Worker Health', icon: <Heart className="w-4 h-4" /> },
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
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Health & Safety Overview</h3>
                                <p className="text-gray-600">Safety performance and compliance status</p>
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
                                            <p className="text-lg font-bold text-gray-900">{companyInfo?.name || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Industry</p>
                                            <p className="text-lg font-medium text-gray-800">{companyInfo?.industry || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Country</p>
                                            <p className="text-lg font-medium text-gray-800">{companyInfo?.country || "N/A"}</p>
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
                                            <p className="text-lg font-medium text-gray-800">{companyInfo?.esg_data_status || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                <h4 className="font-bold text-lg text-gray-900 mb-4">Safety Reporting Scope</h4>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Reporting Period</p>
                                        <p className="text-gray-800">{reportingYear}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Data Availability</p>
                                        <p className="text-gray-800">{yearData?.data_available ? 'Available' : 'Limited'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Safety Analysis Scope</p>
                                        <p className="text-gray-800">{companyInfo?.scope || 'Comprehensive health & safety analysis'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Key Statistics */}
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Key Safety Statistics</h3>
                            <BarChart3 className="w-8 h-8 text-green-600" />
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <p className="text-sm text-gray-600 mb-2">Injury Rate</p>
                                <p className="text-2xl font-bold text-green-600">{safetyMetrics.injuryRate.toFixed(2)}</p>
                                <p className="text-sm text-gray-600 mt-2">per 100 employees</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
                                <p className="text-sm text-gray-600 mb-2">Days Since Last LTI</p>
                                <p className="text-2xl font-bold text-red-600">{safetyMetrics.daysSinceLastLTI}</p>
                                <p className="text-sm text-gray-600 mt-2">days</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                <p className="text-sm text-gray-600 mb-2">Safety Culture Score</p>
                                <p className="text-2xl font-bold text-blue-600">{safetyMetrics.safetyCultureScore}/100</p>
                                <p className="text-sm text-gray-600 mt-2">survey score</p>
                            </div>
                        </div>
                    </div>

                    {/* Safety Summary Card */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border-2 border-green-200 shadow-xl p-8">
                        <div className="flex items-start gap-6">
                            <div className="p-5 rounded-3xl bg-white shadow-lg">
                                <ShieldCheck className="w-12 h-12 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Health & Safety Summary</h3>
                                <p className="text-gray-700 text-lg mb-4">
                                    {healthSafetySummary?.overview?.key_message || 'Comprehensive health & safety analysis completed for the reporting period.'}
                                </p>
                                <div className="grid md:grid-cols-2 gap-4 mb-6">
                                    <div className="p-4 rounded-xl bg-white/50 border border-green-200">
                                        <p className="text-sm text-gray-600 mb-1">Total Safety Meetings</p>
                                        <p className="text-xl font-bold text-gray-900">{safetyMetrics.safetyMeetings}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/50 border border-green-200">
                                        <p className="text-sm text-gray-600 mb-1">Safety Training Hours</p>
                                        <p className="text-xl font-bold text-gray-900">{safetyMetrics.safetyTraining}</p>
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
                            <h3 className="text-2xl font-bold text-gray-900">Safety Performance Indicators</h3>
                            <ActivityIcon className="w-8 h-8 text-green-600" />
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {performanceIndicators && Object.entries(performanceIndicators).map(([key, value], index) => (
                                <div key={index} className="p-5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        {key === 'injury_rate' ? <AlertOctagon className="w-5 h-5 text-red-600" /> :
                                            key === 'safety_meetings' ? <Users className="w-5 h-5 text-blue-600" /> :
                                                key === 'total_injuries' ? <Ambulance className="w-5 h-5 text-amber-600" /> :
                                                    <BookOpen className="w-5 h-5 text-green-600" />}
                                        <h5 className="font-bold text-gray-900 capitalize">{key.replace(/_/g, ' ')}</h5>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {typeof value === 'object' && value.value ?
                                            (key === 'injury_rate' ? parseFloat(value.value.toString()).toFixed(2) :
                                                formatNumber(parseFloat(value.value.toString())))
                                            : 'N/A'}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        {typeof value === 'object' && value.description ? value.description : ''}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Incidents & Safety Report */}
            {selectedReport === 'incidents-safety' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Incident Analysis & Safety Programs</h3>
                                <p className="text-gray-600">Incident tracking, safety committees, and preventive initiatives</p>
                            </div>
                            <ShieldAlert className="w-8 h-8 text-green-600" />
                        </div>

                        {/* Incident Overview */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Incident Overview</h4>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
                                    <p className="text-sm text-gray-600 mb-2">Fatalities</p>
                                    <p className="text-2xl font-bold text-red-600">{safetyMetrics.fatalities}</p>
                                    <p className="text-sm text-gray-600 mt-2">Zero tolerance target</p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200">
                                    <p className="text-sm text-gray-600 mb-2">Lost Time Injuries</p>
                                    <p className="text-2xl font-bold text-amber-600">{safetyMetrics.lostTimeInjuries}</p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Avg. recovery: {incidentData?.lost_time_injuries?.average_recovery_days || 0} days
                                    </p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                    <p className="text-sm text-gray-600 mb-2">Recordable Injuries</p>
                                    <p className="text-2xl font-bold text-blue-600">{safetyMetrics.totalRecordableInjuries}</p>
                                    <p className="text-sm text-gray-600 mt-2">Total reportable incidents</p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <p className="text-sm text-gray-600 mb-2">Near Misses</p>
                                    <p className="text-2xl font-bold text-green-600">{safetyMetrics.nearMisses}</p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Reporting rate: {incidentData?.near_misses?.reporting_rate || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Incident Severity Breakdown */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Incident Severity Breakdown</h4>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="text-center">
                                        <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                                            <Ambulance className="w-10 h-10 text-green-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {incidentData?.total_recordable_injuries?.severity_breakdown?.minor || 0}
                                        </p>
                                        <p className="text-gray-600">Minor Injuries</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-yellow-100 flex items-center justify-center">
                                            <AlertTriangle className="w-10 h-10 text-yellow-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {incidentData?.total_recordable_injuries?.severity_breakdown?.moderate || 0}
                                        </p>
                                        <p className="text-gray-600">Moderate Injuries</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-red-100 flex items-center justify-center">
                                            <AlertOctagon className="w-10 h-10 text-red-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {incidentData?.total_recordable_injuries?.severity_breakdown?.serious || 0}
                                        </p>
                                        <p className="text-gray-600">Serious Injuries</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Safety Committees */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Safety Committees</h4>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Users className="w-6 h-6 text-blue-600" />
                                        <h5 className="font-bold text-lg text-gray-900">Agriculture Committee</h5>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Meetings</span>
                                            <span className="font-bold text-gray-900">{safetyCommittees?.agriculture_committee?.meetings || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Members</span>
                                            <span className="font-bold text-gray-900">{safetyCommittees?.agriculture_committee?.members || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Initiatives Completed</span>
                                            <span className="font-bold text-gray-900">{safetyCommittees?.agriculture_committee?.initiatives_completed || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Factory className="w-6 h-6 text-green-600" />
                                        <h5 className="font-bold text-lg text-gray-900">Milling Committee</h5>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Meetings</span>
                                            <span className="font-bold text-gray-900">{safetyCommittees?.milling_committee?.meetings || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Members</span>
                                            <span className="font-bold text-gray-900">{safetyCommittees?.milling_committee?.members || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Initiatives Completed</span>
                                            <span className="font-bold text-gray-900">{safetyCommittees?.milling_committee?.initiatives_completed || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cross-Company Initiatives */}
                        {safetyCommittees?.cross_company_initiatives && safetyCommittees.cross_company_initiatives.length > 0 && (
                            <div className="mb-8">
                                <h4 className="font-bold text-lg text-gray-900 mb-4">Cross-Company Safety Initiatives</h4>
                                <div className="space-y-4">
                                    {safetyCommittees.cross_company_initiatives.map((initiative, index) => (
                                        <div key={index} className="p-4 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h5 className="font-bold text-lg text-gray-900 mb-2">{initiative.name}</h5>
                                                    <p className="text-gray-700">{initiative.impact}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-600">Participants</p>
                                                    <p className="text-lg font-bold text-gray-900">{initiative.participants || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex justify-between text-sm text-gray-600">
                                                <span>Frequency: {initiative.frequency || 'N/A'}</span>
                                                <span>Last Drill: {initiative.last_drill || 'N/A'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Safety Initiatives */}
                        <div>
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Active Safety Programs</h4>
                            <div className="space-y-4">
                                {safetyInitiatives?.active_programs?.map((program, index) => (
                                    <div key={index} className="p-5 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h5 className="font-bold text-lg text-gray-900 mb-2">{program.name}</h5>
                                                <p className="text-gray-700">{program.description}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Participation</p>
                                                <p className="text-lg font-bold text-gray-900">{program.participation || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                                            {program.impact && (
                                                <div>
                                                    <span className="font-medium text-gray-700">Impact:</span> {program.impact}
                                                </div>
                                            )}
                                            {program.departments_covered && (
                                                <div>
                                                    <span className="font-medium text-gray-700">Departments:</span> {program.departments_covered}
                                                </div>
                                            )}
                                            {program.trained_coaches && (
                                                <div>
                                                    <span className="font-medium text-gray-700">Trained Coaches:</span> {program.trained_coaches}
                                                </div>
                                            )}
                                            {program.contractors_trained && (
                                                <div>
                                                    <span className="font-medium text-gray-700">Contractors Trained:</span> {program.contractors_trained}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Worker Health Report */}
            {selectedReport === 'worker-health' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Worker Health & Wellness</h3>
                                <p className="text-gray-600">Medical services, wellness programs, and protective equipment</p>
                            </div>
                            <Heart className="w-8 h-8 text-green-600" />
                        </div>

                        {/* Medical Services */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Medical Services</h4>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                    <p className="text-sm text-gray-600 mb-2">Medical Examinations</p>
                                    <p className="text-2xl font-bold text-blue-600">{workerHealth?.medical_services?.medical_examinations || 0}</p>
                                    <p className="text-sm text-gray-600 mt-2">Annual check-ups</p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <p className="text-sm text-gray-600 mb-2">First Aid Certified</p>
                                    <p className="text-2xl font-bold text-green-600">{safetyMetrics.firstAidCertified}</p>
                                    <p className="text-sm text-gray-600 mt-2">Trained staff</p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                                    <p className="text-sm text-gray-600 mb-2">On-Site Clinics</p>
                                    <p className="text-2xl font-bold text-purple-600">{workerHealth?.medical_services?.on_site_clinics || 0}</p>
                                    <p className="text-sm text-gray-600 mt-2">Medical facilities</p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
                                    <p className="text-sm text-gray-600 mb-2">Emergency Response Teams</p>
                                    <p className="text-2xl font-bold text-red-600">{workerHealth?.medical_services?.emergency_response_teams || 0}</p>
                                    <p className="text-sm text-gray-600 mt-2">Trained responders</p>
                                </div>
                            </div>
                        </div>

                        {/* Wellness Programs */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Wellness Programs</h4>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <Brain className="w-5 h-5 text-green-600" />
                                            <h5 className="font-bold text-lg text-gray-900">Mental Health Support</h5>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {workerHealth?.wellness_programs?.mental_health_support ? (
                                                <>
                                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                                    <span className="text-gray-700">Available for all employees</span>
                                                </>
                                            ) : (
                                                <>
                                                    <X className="w-5 h-5 text-red-600" />
                                                    <span className="text-gray-700">Not available</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <ActivityIcon className="w-5 h-5 text-blue-600" />
                                            <h5 className="font-bold text-lg text-gray-900">Ergonomic Assessments</h5>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-800">
                                            {workerHealth?.wellness_programs?.ergonomic_assessments || 0}
                                        </p>
                                        <p className="text-sm text-gray-600">Workstation assessments completed</p>
                                    </div>
                                </div>

                                <div className="mt-6 grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h5 className="font-bold text-gray-900 mb-2">Health Screenings</h5>
                                        <p className="text-gray-700">{workerHealth?.wellness_programs?.health_screenings || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-gray-900 mb-2">Vaccination Campaigns</h5>
                                        <div className="space-y-1">
                                            {workerHealth?.wellness_programs?.vaccination_campaigns?.map((campaign, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                    <span className="text-gray-700">{campaign}</span>
                                                </div>
                                            )) || <span className="text-gray-700">No campaigns reported</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Protective Equipment */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Protective Equipment & Compliance</h4>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <HardHat className="w-6 h-6 text-amber-600" />
                                        <h5 className="font-bold text-lg text-gray-900">PPE Compliance</h5>
                                    </div>
                                    <p className="text-2xl font-bold text-amber-600">{safetyMetrics.ppeCompliance}%</p>
                                    <p className="text-sm text-gray-600 mt-2">Compliance rate across all sites</p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Shield className="w-6 h-6 text-gray-600" />
                                        <h5 className="font-bold text-lg text-gray-900">Annual Investment</h5>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {workerHealth?.protective_equipment?.annual_investment || 'N/A'}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">Investment in safety equipment</p>
                                </div>

                                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                        <h5 className="font-bold text-lg text-gray-900">Equipment Provided</h5>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">
                                        {workerHealth?.protective_equipment?.equipment_provided?.length || 0} types
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">PPE categories available</p>
                                </div>
                            </div>
                        </div>

                        {/* Equipment List */}
                        <div>
                            <h4 className="font-bold text-lg text-gray-900 mb-4">PPE Equipment Provided</h4>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {workerHealth?.protective_equipment?.equipment_provided?.map((equipment, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-white">
                                            <Shield className="w-4 h-4 text-blue-600" />
                                            <span className="text-gray-800">{equipment}</span>
                                        </div>
                                    )) || <p className="text-gray-600">No equipment data available</p>}
                                </div>
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
                                        <p className="text-sm text-gray-600 mb-1">Safety Module Version</p>
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
                                        <p className="text-sm text-gray-600 mb-2">Incident Data</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            Available
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Worker Health Data</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            Available
                                        </p>
                                    </div>
                                </div>
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
                                <h3 className="text-2xl font-bold">Export Health & Safety Report</h3>
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
                                        <span>Incident Analysis</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span>Worker Health & Wellness</span>
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
                                        alert(`Exporting Health & Safety Report as ${exportFormat.toUpperCase()}`);
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

export default HealthSafetyReportsTab;