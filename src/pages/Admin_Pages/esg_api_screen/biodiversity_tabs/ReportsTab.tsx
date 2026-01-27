import React, { useState } from 'react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend as RechartsLegend,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ComposedChart,
    Line,
    Area,
} from "recharts";

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
    Trees,
    Leaf,
    Users,
    Globe,
    BarChartHorizontal,
    FileSpreadsheet,
} from "lucide-react";

// Import types and helper functions from biodiversity API
import { BiodiversityLandUseResponse } from '../../../../services/Admin_Service/esg_apis/biodiversity_api_service';

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

interface ReportsTabProps {
    biodiversityData: BiodiversityLandUseResponse | null;
    formatNumber: (num: number) => string;
    formatPercent: (num: number) => string;
    selectedYear: number | null;
    availableYears: number[];
    onMetricClick: (metric: any, modalType: string) => void;
}

const ReportsTab: React.FC<ReportsTabProps> = ({
    biodiversityData,
    formatNumber,
    formatPercent,
    availableYears,
    onMetricClick,
}) => {
    const [selectedReport, setSelectedReport] = useState<string>('summary');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
    const [selectedAuditLog, setSelectedAuditLog] = useState<any>(null);
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [selectedGraph, setSelectedGraph] = useState<any>(null);

    if (!biodiversityData) {
        return (
            <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl">
                <div className="text-center max-w-md p-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                        <FileText className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">No Reports Available</h3>
                    <p className="text-gray-600">Select a company to view compliance and reporting information.</p>
                </div>
            </div>
        );
    }

    const {
        metadata,
        company,
        biodiversity_assessment,
        deforestation_analysis,
        land_use_metrics,
        carbon_emission_accounting,
        key_statistics,
        standards_compliance,
        hve_compliance,
        recommendations,
        social_governance,
        esg_metrics,
    } = biodiversityData.data;

    // Prepare report data
    const complianceData = [
        { framework: 'HVE', status: hve_compliance.compliance_status, progress: hve_compliance.compliance_status === 'Compliant' ? 100 : 75 },
        { framework: 'SASB', status: standards_compliance.sasb.compliance_level, progress: standards_compliance.sasb.compliance_level === 'High' ? 100 : 60 },
        { framework: 'UN SDG', status: standards_compliance.unsdg.overall_alignment, progress: standards_compliance.unsdg.overall_alignment === 'High' ? 100 : 80 },
        { framework: 'ISO', status: standards_compliance.iso.certification_status, progress: standards_compliance.iso.certification_status === 'Certified' ? 100 : 40 },
        { framework: 'GRI', status: standards_compliance.gri.disclosure_level, progress: standards_compliance.gri.disclosure_level === 'Comprehensive' ? 100 : 65 },
    ];

    const biodiversityComponents = [
        { component: 'Environmental', score: biodiversity_assessment.components.environmental.score },
        { component: 'Social', score: biodiversity_assessment.components.social.score },
        { component: 'Governance', score: biodiversity_assessment.components.governance.score },
        { component: 'Conservation', score: biodiversity_assessment.components.conservation.score },
    ];

    const yearlyPerformance = carbon_emission_accounting.yearly_data.map((year) => ({
        year: year.year,
        sequestration: year.sequestration.total_tco2,
        emissions: year.emissions.total_tco2e,
        netBalance: year.emissions.net_balance,
    }));

    // Simulated audit trail and verification data
    const auditTrail = [
        { id: 'AUD001', action: 'Deforestation Analysis', user: 'System', timestamp: new Date().toISOString(), status: 'Completed', changes: 24 },
        { id: 'AUD002', action: 'Biodiversity Assessment', user: 'Analyst', timestamp: new Date().toISOString(), status: 'Completed', changes: 18 },
        { id: 'AUD003', action: 'Compliance Review', user: 'Auditor', timestamp: new Date().toISOString(), status: 'In Progress', changes: 12 },
    ];

    const verificationHistory = [
        { year: 2023, status: 'Verified', verifiedBy: 'External Auditor', verifiedAt: '2024-01-15', score: 92 },
        { year: 2022, status: 'Verified', verifiedBy: 'External Auditor', verifiedAt: '2023-01-20', score: 88 },
        { year: 2021, status: 'Verified', verifiedBy: 'Internal Team', verifiedAt: '2022-01-18', score: 85 },
    ];

    const complianceChecklist = [
        { requirement: 'HVE Deforestation Status', status: hve_compliance.deforestation_status === 'No Deforestation' ? 'Completed' : 'In Progress', date: hve_compliance.last_assessment_date },
        { requirement: 'Carbon Balance Reporting', status: 'Completed', date: new Date().toLocaleDateString() },
        { requirement: 'Biodiversity Assessment', status: 'Completed', date: new Date().toLocaleDateString() },
        { requirement: 'Social Engagement', status: social_governance.community_engagement.engagement_level === 'High' ? 'Completed' : 'In Progress', date: new Date().toLocaleDateString() },
    ];

    // Graph components
    const ComplianceChart = () => (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={complianceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="framework" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" label={{ value: 'Progress (%)', angle: -90, position: 'insideLeft' }} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                <Bar dataKey="progress" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );

    const BiodiversityRadar = () => (
        <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={biodiversityComponents}>
                <PolarGrid stroke="#d1d5db" />
                <PolarAngleAxis dataKey="component" style={{ fontSize: '12px' }} />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar dataKey="score" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.6} strokeWidth={2} />
                <RechartsTooltip />
            </RadarChart>
        </ResponsiveContainer>
    );

    const PerformanceChart = () => (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={yearlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="year" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <RechartsTooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                <RechartsLegend />
                <Bar dataKey="sequestration" fill={COLORS.primary} name="Sequestration" radius={[4, 4, 0, 0]} />
                <Bar dataKey="emissions" fill={COLORS.danger} name="Emissions" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="netBalance" stroke={COLORS.info} strokeWidth={3} name="Net Balance" />
            </ComposedChart>
        </ResponsiveContainer>
    );

    const reportGraphs = [
        { id: 'compliance', title: 'Compliance Status', description: 'Progress across frameworks', component: <ComplianceChart /> },
        { id: 'biodiversity', title: 'Biodiversity Components', description: 'Performance breakdown', component: <BiodiversityRadar /> },
        { id: 'performance', title: 'Yearly Performance', description: 'Annual trends', component: <PerformanceChart /> },
    ];

    return (
        <div className="space-y-8 pb-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-green-600 to-teal-600 p-10 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-4xl font-bold mb-2">Reports & Compliance</h2>
                            <p className="text-green-100 text-lg">Documentation and regulatory compliance tracking</p>
                        </div>
                        <button
                            onClick={() => setIsExportModalOpen(true)}
                            className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl font-bold transition-all flex items-center gap-2"
                        >
                            <Download className="w-5 h-5" />
                            Export Report
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5 hover:bg-white/20 transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <ShieldCheck className="w-6 h-6" />
                                <span className="text-xs font-bold px-2 py-1 bg-green-400 text-green-900 rounded-full">
                                    {hve_compliance.compliance_status === 'Compliant' ? '100%' : '75%'}
                                </span>
                            </div>
                            <p className="text-3xl font-bold">{biodiversity_assessment.overall_score}</p>
                            <p className="text-green-100 text-sm">Biodiversity Score</p>
                        </div>
                        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5 hover:bg-white/20 transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <Target className="w-6 h-6" />
                            </div>
                            <p className="text-3xl font-bold">{complianceData.filter(c => c.progress >= 80).length}/{complianceData.length}</p>
                            <p className="text-green-100 text-sm">Frameworks Compliant</p>
                        </div>
                        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5 hover:bg-white/20 transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <ClipboardCheck className="w-6 h-6" />
                            </div>
                            <p className="text-3xl font-bold">{recommendations.length}</p>
                            <p className="text-green-100 text-sm">Action Items</p>
                        </div>
                        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5 hover:bg-white/20 transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <Award className="w-6 h-6" />
                            </div>
                            <p className="text-3xl font-bold">{verificationHistory.filter(v => v.status === 'Verified').length}</p>
                            <p className="text-green-100 text-sm">Years Verified</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Navigation */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Report Sections</h3>
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
                        { id: 'compliance', label: 'Compliance', icon: <ShieldCheck className="w-4 h-4" /> },
                        { id: 'audit', label: 'Audit Trail', icon: <Clock className="w-4 h-4" /> },
                        { id: 'verification', label: 'Verification', icon: <FileCheck className="w-4 h-4" /> },
                        { id: 'technical', label: 'Technical', icon: <Database className="w-4 h-4" /> },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedReport(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${
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

            {/* Summary Report */}
            {selectedReport === 'summary' && (
                <div className="space-y-8">
                    {/* Charts Grid */}
                    <div className="grid lg:grid-cols-2 gap-6">
                        {reportGraphs.map((graph) => (
                            <div key={graph.id} className="bg-white rounded-3xl border-2 border-gray-200 shadow-lg p-8 hover:shadow-2xl transition-all">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{graph.title}</h3>
                                        <p className="text-gray-600 text-sm">{graph.description}</p>
                                    </div>
                                    <button onClick={() => setSelectedGraph(graph)} className="p-2 rounded-xl bg-gray-100 hover:bg-green-100">
                                        <Eye className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="h-[300px]">{graph.component}</div>
                            </div>
                        ))}
                    </div>

                    {/* Key Findings */}
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Key Findings</h3>
                            <FileCheck className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="space-y-4">
                            <div className="p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-1">Strong Compliance Status</h4>
                                        <p className="text-gray-700">{hve_compliance.compliance_status} - {hve_compliance.deforestation_status}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-1">Forest Coverage Stable</h4>
                                        <p className="text-gray-700">Maintained at {land_use_metrics.current_year.forest_coverage_percent}% with {land_use_metrics.trends.forest_area_trend} trend</p>
                                    </div>
                                </div>
                            </div>
                            {deforestation_analysis.risk_level !== 'Low' && (
                                <div className="p-5 rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-1">Monitor Risk Areas</h4>
                                            <p className="text-gray-700">Risk: {deforestation_analysis.risk_score} ({deforestation_analysis.risk_level}) - {deforestation_analysis.deforestation_alerts.length} alerts</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Company Info */}
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Company Information</h3>
                            <Building className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                {[
                                    { label: 'Company', value: company.name },
                                    { label: 'Industry', value: company.industry },
                                    { label: 'Registration', value: company.registrationNumber },
                                    { label: 'Country', value: company.country },
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between p-4 rounded-xl bg-gray-50">
                                        <span className="text-gray-600 font-medium">{item.label}</span>
                                        <span className="font-bold text-gray-900">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-4">
                                {[
                                    { icon: <Mail className="w-5 h-5" />, value: company.email },
                                    { icon: <Phone className="w-5 h-5" />, value: company.phone },
                                    { icon: <MapPin className="w-5 h-5" />, value: company.address },
                                    ...(company.website ? [{ icon: <Link className="w-5 h-5" />, value: company.website }] : []),
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                                        <div className="text-gray-400">{item.icon}</div>
                                        <span className="text-gray-700">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Compliance Report */}
            {selectedReport === 'compliance' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Compliance Checklist</h3>
                        <div className="space-y-4">
                            {complianceChecklist.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-5 rounded-xl border-2 border-gray-200 hover:border-green-300 transition-all">
                                    <div>
                                        <h4 className="font-bold text-gray-900">{item.requirement}</h4>
                                        <p className="text-sm text-gray-600">{item.date}</p>
                                    </div>
                                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                                        item.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Standards Details */}
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Standards Compliance</h3>
                        <div className="space-y-6">
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-bold text-lg">HVE Compliance</h4>
                                    <span className="px-4 py-2 rounded-full text-sm font-bold bg-green-100 text-green-800">
                                        {hve_compliance.compliance_status}
                                    </span>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-white">
                                        <p className="text-sm text-gray-600">Status</p>
                                        <p className="font-bold">{hve_compliance.deforestation_status}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white">
                                        <p className="text-sm text-gray-600">Last Assessment</p>
                                        <p className="font-bold">{hve_compliance.last_assessment_date}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Audit Trail */}
            {selectedReport === 'audit' && (
                <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Audit Trail</h3>
                    <div className="space-y-4">
                        {auditTrail.map((log) => (
                            <div key={log.id} className="flex items-start gap-4 p-6 rounded-2xl border-2 border-gray-200 hover:border-green-300 transition-all cursor-pointer" onClick={() => setSelectedAuditLog(log)}>
                                <Activity className="w-6 h-6 text-green-600 flex-shrink-0" />
                                <div className="flex-1">
                                    <div className="flex justify-between mb-2">
                                        <h4 className="font-bold text-gray-900">{log.action}</h4>
                                        <span className="text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">By {log.user} • {log.changes} changes</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    log.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {log.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Verification */}
            {selectedReport === 'verification' && (
                <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Verification History</h3>
                    <div className="space-y-4">
                        {verificationHistory.map((record) => (
                            <div key={record.year} className="p-6 rounded-2xl border-2 border-gray-200 hover:border-green-300 transition-all">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900">Year {record.year}</h4>
                                        <p className="text-sm text-gray-600">Verified by {record.verifiedBy} on {record.verifiedAt}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                            record.status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {record.status}
                                        </span>
                                        <p className="text-2xl font-bold text-green-600 mt-2">{record.score}%</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Technical Data */}
            {selectedReport === 'technical' && (
                <div className="space-y-6">
                    {[
                        { id: 'metadata', title: 'Technical Metadata', icon: <Database className="w-6 h-6" />, content: (
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-xl bg-gray-50">
                                    <p className="text-sm text-gray-600 mb-1">API Version</p>
                                    <p className="font-bold">{metadata.api_version}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-gray-50">
                                    <p className="text-sm text-gray-600 mb-1">Data Sources</p>
                                    <p className="font-bold">{metadata.data_sources.length}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-gray-50">
                                    <p className="text-sm text-gray-600 mb-1">Generated</p>
                                    <p className="font-bold">{new Date(metadata.generated_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        )},
                        { id: 'esg', title: 'ESG Metrics', icon: <BarChart3 className="w-6 h-6" />, content: (
                            <div className="grid grid-cols-4 gap-4">
                                {[
                                    { label: 'Environmental', value: esg_metrics.summary.environmental_metrics },
                                    { label: 'Social', value: esg_metrics.summary.social_metrics },
                                    { label: 'Governance', value: esg_metrics.summary.governance_metrics },
                                    { label: 'Total', value: esg_metrics.summary.total_metrics },
                                ].map((m, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-gray-50">
                                        <p className="text-sm text-gray-600">{m.label}</p>
                                        <p className="text-2xl font-bold">{m.value}</p>
                                    </div>
                                ))}
                            </div>
                        )},
                    ].map((section) => (
                        <div key={section.id} className="bg-white rounded-3xl border-2 border-green-100 shadow-xl overflow-hidden">
                            <button onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)} className="w-full flex items-center justify-between p-6 hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-green-100">{section.icon}</div>
                                    <h3 className="text-xl font-bold">{section.title}</h3>
                                </div>
                                <ChevronDown className={`w-5 h-5 transition-transform ${expandedSection === section.id ? 'rotate-180' : ''}`} />
                            </button>
                            {expandedSection === section.id && <div className="px-6 pb-6">{section.content}</div>}
                        </div>
                    ))}
                </div>
            )}

            {/* Export Modal */}
            {isExportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setIsExportModalOpen(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold">Export Report</h3>
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
                                        { format: 'pdf', icon: <FileText className="w-8 h-8" />, label: 'PDF' },
                                        { format: 'excel', icon: <FileSpreadsheet className="w-8 h-8" />, label: 'Excel' },
                                        { format: 'csv', icon: <FileText className="w-8 h-8" />, label: 'CSV' },
                                    ].map((f) => (
                                        <button key={f.format} onClick={() => setExportFormat(f.format as any)} className={`p-6 rounded-2xl border-2 transition-all ${
                                            exportFormat === f.format ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                                        }`}>
                                            <div className={exportFormat === f.format ? 'text-green-600' : 'text-gray-400'}>{f.icon}</div>
                                            <p className="mt-2 font-bold">{f.label}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button onClick={() => setIsExportModalOpen(false)} className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-bold">
                                    Cancel
                                </button>
                                <button onClick={() => { alert(`Exporting as ${exportFormat.toUpperCase()}`); setIsExportModalOpen(false); }} className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold">
                                    Export
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Audit Details Modal */}
            {selectedAuditLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedAuditLog(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold">Audit Details</h3>
                                <button onClick={() => setSelectedAuditLog(null)} className="p-2 rounded-xl bg-white/20 hover:bg-white/30">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                {[
                                    { label: 'Action ID', value: selectedAuditLog.id },
                                    { label: 'Status', value: selectedAuditLog.status },
                                    { label: 'User', value: selectedAuditLog.user },
                                    { label: 'Changes', value: selectedAuditLog.changes },
                                ].map((item, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-gray-50">
                                        <p className="text-sm text-gray-600">{item.label}</p>
                                        <p className="font-bold">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setSelectedAuditLog(null)} className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Graph Modal */}
            {selectedGraph && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedGraph(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-3xl border-b-2 border-green-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold">{selectedGraph.title}</h3>
                                    <p className="text-gray-600">{selectedGraph.description}</p>
                                </div>
                                <button onClick={() => setSelectedGraph(null)} className="p-2 rounded-xl bg-white hover:bg-gray-50 border">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="h-[400px]">{selectedGraph.component}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsTab;