// compliance_tabs/ComplianceReportsTab.tsx
import React, { useState } from 'react';
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
    FileCheck,
    Eye,
    Info,
    Copy,
    Mail,
    MoreVertical,
    Building,
    MapPin,
    Phone,
    Link,
    DollarSign,
    Leaf,
    Mountain,
    Target,
    Award,
    AlertTriangle,
    X,
    BadgeCheck,
    Sprout,
    Shield,
    BarChartHorizontal,
    BookOpen,
    Cpu,
    Server,
    Layers,
    GitBranch,
    Activity,
    Users,
    Factory,
    PieChart,
    BarChart,
    TrendingUp,
    TrendingDown,
} from 'lucide-react';

// Import helpers and types
import {
    FarmComplianceResponse,
    getCompany,
    getReportingYear,
    getTrainingMetrics,
    getScope3EngagementMetrics,
    getCarbonScope3,
    getComplianceScores,
    getFrameworkAlignment,
    getPoliciesAndCertifications,
    getDataQualityInfo,
    getRecommendations,
    getGRIIFRSData,
    getGraphs,
    getOverallComplianceScore,
    getComplianceRating,
    getScope3TotalEmissions,
    getNetCarbonBalance,
    getFarmAreaOfInterest,
    getESGFrameworks,
    getESGContactPerson,
    getLatestESGReportYear,
    getScope3Categories,
    getScope3BreakdownWithPercent,
    getCompliancePriorities,
    getMetricValue,
    getRawMetrics,           // added
    getFarmComplianceDoc,    // added
    type Metric,
} from '../../../../services/Admin_Service/esg_apis/farm_compliance_service';

// Simple DataTable component (reused)
const DataTable = ({ columns, data, onRowClick }: any) => {
    if (!data || data.length === 0) {
        return <div className="text-center py-8 text-gray-500">No data available</div>;
    }
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                        {columns.map((col: any) => (
                            <th key={col.key} className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row: any, idx: number) => (
                        <tr
                            key={idx}
                            className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => onRowClick?.(row)}
                        >
                            {columns.map((col: any) => (
                                <td key={col.key} className="py-3 px-4 text-sm text-gray-800">
                                    {col.accessor ? col.accessor(row) : row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Color palette (same as other tabs)
const COLORS = {
    primary: '#22c55e',
    primaryDark: '#16a34a',
    primaryLight: '#86efac',
    secondary: '#10b981',
    accent: '#84cc16',
    success: '#22c55e',
    warning: '#eab308',
    danger: '#ef4444',
    info: '#3b82f6',
    purple: '#8b5cf6',
};

interface ComplianceReportsTabProps {
    complianceData: FarmComplianceResponse | null;
    selectedCompany: any; // AdminCompany type
    formatNumber: (num: number | null) => string;
    formatCurrency: (num: number | null) => string;
    formatPercent: (num: number | null) => string;
    getTrendIcon: (trend: string) => JSX.Element;
    selectedYear: number | null;
    availableYears: number[];
    loading: boolean;
    isRefreshing: boolean;
    onMetricClick: (metric: any, modalType: string) => void;
    colors?: any;
}

const ComplianceReportsTab: React.FC<ComplianceReportsTabProps> = ({
    complianceData,
    selectedCompany,
    formatNumber,
    formatPercent,
    getTrendIcon,
    selectedYear,
    onMetricClick,
}) => {
    const [selectedReport, setSelectedReport] = useState<string>('summary');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
    const [selectedAuditLog, setSelectedAuditLog] = useState<any>(null);

    if (!complianceData) {
        return (
            <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl">
                <div className="text-center max-w-md p-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                        <FileText className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">No Compliance Data Available</h3>
                    <p className="text-gray-600">Select a company to view farm management compliance reports.</p>
                </div>
            </div>
        );
    }

    // Extract data using helpers
    const company = getCompany(complianceData);
    const reportingYear = getReportingYear(complianceData);
    const trainingMetrics = getTrainingMetrics(complianceData);
    const scope3Engagement = getScope3EngagementMetrics(complianceData);
    const carbonScope3 = getCarbonScope3(complianceData);
    const complianceScores = getComplianceScores(complianceData);
    const frameworkAlignment = getFrameworkAlignment(complianceData);
    const policiesAndCerts = getPoliciesAndCertifications(complianceData);
    const dataQuality = getDataQualityInfo(complianceData);
    const recommendations = getRecommendations(complianceData);
    const griIfrsData = getGRIIFRSData(complianceData);
    const graphs = getGraphs(complianceData);
    const esgFrameworks = getESGFrameworks(complianceData);
    const esgContact = getESGContactPerson(complianceData);
    const areaOfInterest = getFarmAreaOfInterest(complianceData);
    const overallScore = getOverallComplianceScore(complianceData) || 0;
    const rating = getComplianceRating(complianceData);
    const totalScope3 = getScope3TotalEmissions(complianceData) || 0;
    const netBalance = getNetCarbonBalance(complianceData) || 0;
    const priorities = getCompliancePriorities(complianceData);
    const scope3Breakdown = getScope3BreakdownWithPercent(complianceData);

    // ===== Raw metrics from farm_compliance_doc =====
    const rawMetrics = getRawMetrics(complianceData);

    // Helper to find metric by name
    const findMetric = (name: string) => rawMetrics.find(m => m.metric_name === name);

    // Yearly training metrics
    const execMetric = findMetric('Executive Training Hours');
    const seniorMetric = findMetric('Senior Management Training Hours');
    const otherMetric = findMetric('Other Employees Training Hours');

    const getYearlyData = (metric: Metric | undefined) => {
        if (!metric || !metric.yearly_data) return [];
        return metric.yearly_data.map(d => ({
            year: d.year,
            value: d.value,
            unit: d.unit,
        })).sort((a, b) => a.year.localeCompare(b.year));
    };

    const execYearly = getYearlyData(execMetric);
    const seniorYearly = getYearlyData(seniorMetric);
    const otherYearly = getYearlyData(otherMetric);

    // List metrics
    const focusMetric = findMetric('Training Focus Areas');
    const deliveryMetric = findMetric('Training Delivery Methods');
    const programMetric = findMetric('Compliance Programs');

    const focusItems = focusMetric?.list_data?.map(item => item.item) || [];
    const deliveryItems = deliveryMetric?.list_data?.map(item => item.item) || [];
    const programItems = programMetric?.list_data?.map(item => item.item) || [];

    // Summary cards (using aggregated helpers – they already pull from all_metrics)
    const summaryCards = [
        {
            title: 'Overall Compliance',
            value: overallScore,
            description: `Rating: ${rating}`,
            icon: <Target className="w-8 h-8 text-white" />,
            color: 'from-green-500 to-emerald-600',
        },
        {
            title: 'Training Hours',
            value: formatNumber(trainingMetrics.total_training_hours),
            description: `${trainingMetrics.employees_trained_total || 0} employees trained`,
            icon: <Users className="w-8 h-8 text-white" />,
            color: 'from-blue-500 to-cyan-600',
        },
        {
            title: 'Scope 3 Emissions',
            value: formatNumber(totalScope3),
            description: 'tCO₂e total',
            icon: <Factory className="w-8 h-8 text-white" />,
            color: 'from-purple-500 to-pink-600',
        },
        {
            title: 'Carbon Balance',
            value: formatNumber(netBalance),
            description: netBalance < 0 ? 'Net sink' : 'Net source',
            icon: <Activity className="w-8 h-8 text-white" />,
            color: netBalance < 0 ? 'from-teal-500 to-green-600' : 'from-yellow-500 to-amber-600',
        },
    ];

    // Compliance checklist (using real data)
    const complianceChecklist = [
        {
            requirement: 'Training Hours Target (>50)',
            status: (trainingMetrics.total_training_hours || 0) >= 50 ? 'Completed' : 'Pending',
            target: '50 hours',
            current: formatNumber(trainingMetrics.total_training_hours),
        },
        {
            requirement: 'Supplier Code Adoption',
            status: (scope3Engagement.suppliers_with_code || 0) > 0 ? 'In Progress' : 'Pending',
            target: 'All suppliers',
            current: `${scope3Engagement.suppliers_with_code || 0} with code`,
        },
        {
            requirement: 'Supplier Audits',
            status: (scope3Engagement.suppliers_audited || 0) > 0 ? 'In Progress' : 'Pending',
            target: '100% of key suppliers',
            current: `${scope3Engagement.suppliers_audited || 0} audited`,
        },
        {
            requirement: 'GRI Compliance',
            status: (frameworkAlignment.gri_compliance || 0) >= 70 ? 'Completed' : 'In Progress',
            target: '70%',
            current: formatPercent(frameworkAlignment.gri_compliance),
        },
        {
            requirement: 'IFRS S1 Alignment',
            status: (frameworkAlignment.ifrs_s1_alignment || 0) >= 70 ? 'Completed' : 'In Progress',
            target: '70%',
            current: formatPercent(frameworkAlignment.ifrs_s1_alignment),
        },
        {
            requirement: 'Carbon Scope 3 Score',
            status: (complianceScores.scores.carbonScope3 || 0) >= 70 ? 'Completed' : 'In Progress',
            target: '70%',
            current: formatPercent(complianceScores.scores.carbonScope3),
        },
    ];

    // Audit trail from import history
    const auditTrail = (complianceData.data.audit_trails.imports || []).map((imp: any) => ({
        id: imp.batch_id || 'N/A',
        action: 'Import',
        user: 'System',
        timestamp: new Date(imp.import_date).toLocaleDateString(),
        status: 'Completed',
        changes: imp.metrics_imported || 0,
    }));

    // Emission factors (from carbon_scope3 categories)
    const emissionFactorsData = scope3Breakdown.map((cat: any) => ({
        source: cat.parameter,
        value: cat.tco2e_per_ha_per_year,
        unit: 'tCO₂e/ha/yr',
        gwp: cat.ef_number || 0,
        gwpSource: 'IPCC AR5',
        lastUpdated: complianceData.data.metadata.generated_at,
        isActive: true,
    }));

    // Methodology data
    const methodologyData = {
        selectedYear: selectedYear || reportingYear,
        esgFrameworks: esgFrameworks || [],
        dataSources: company.data_source || [],
        apiVersion: complianceData.data.versions.api,
        calculationVersion: complianceData.data.versions.calculation,
        geeAdapterVersion: complianceData.data.versions.gee_adapter,
        carbonMethodology: carbonScope3.data_quality?.verification || 'Not specified',
        sequestrationMethodology: 'IPCC Tier 1 (default)',
        emissionMethodology: 'GHG Protocol Scope 3',
    };

    // Table columns
    const tableColumns = {
        compliance: [
            { key: 'requirement', header: 'Requirement', className: 'font-semibold' },
            {
                key: 'status',
                header: 'Status',
                accessor: (row: any) => (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${row.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            row.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                        }`}>
                        {row.status}
                    </span>
                ),
            },
            { key: 'target', header: 'Target' },
            { key: 'current', header: 'Current' },
        ],
        emissionFactors: [
            { key: 'source', header: 'Source' },
            { key: 'value', header: 'Value', accessor: (row: any) => row.value.toFixed(2) },
            { key: 'unit', header: 'Unit' },
            { key: 'gwp', header: 'GWP', accessor: (row: any) => row.gwp.toFixed(2) },
            { key: 'gwpSource', header: 'GWP Source' },
            {
                key: 'lastUpdated',
                header: 'Last Updated',
                accessor: (row: any) => new Date(row.lastUpdated).toLocaleDateString(),
            },
        ],
        audit: [
            { key: 'id', header: 'Batch ID' },
            { key: 'action', header: 'Action' },
            { key: 'user', header: 'User' },
            { key: 'timestamp', header: 'Timestamp' },
            { key: 'status', header: 'Status' },
            { key: 'changes', header: 'Metrics Imported' },
        ],
        yearlyTraining: [
            { key: 'year', header: 'Year' },
            { key: 'executive', header: 'Executive (hrs)' },
            { key: 'senior', header: 'Senior (hrs)' },
            { key: 'other', header: 'Other (hrs)' },
            { key: 'total', header: 'Total (hrs)' },
        ],
        listMetrics: [
            { key: 'category', header: 'Category' },
            { key: 'items', header: 'Items', accessor: (row: any) => row.items.join(', ') },
            { key: 'count', header: 'Count' },
        ],
    };

    // Prepare yearly training table data
    const allYears = [...new Set([...execYearly.map(d => d.year), ...seniorYearly.map(d => d.year), ...otherYearly.map(d => d.year)])].sort();
    const yearlyTrainingData = allYears.map(year => {
        const execVal = execYearly.find(d => d.year === year)?.value || 0;
        const seniorVal = seniorYearly.find(d => d.year === year)?.value || 0;
        const otherVal = otherYearly.find(d => d.year === year)?.value || 0;
        return {
            year,
            executive: execVal,
            senior: seniorVal,
            other: otherVal,
            total: execVal + seniorVal + otherVal,
        };
    });

    // List metrics data
    const listMetricsData = [
        { category: 'Training Focus Areas', items: focusItems, count: focusItems.length },
        { category: 'Training Delivery Methods', items: deliveryItems, count: deliveryItems.length },
        { category: 'Compliance Programs', items: programItems, count: programItems.length },
    ];

    const handleExport = () => {
        console.log(`Exporting in ${exportFormat.toUpperCase()} format...`);
        alert(`${exportFormat.toUpperCase()} export started. Download will begin shortly.`);
        setIsExportModalOpen(false);
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Report Type Navigation */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Farm Management Compliance Reports</h3>
                        <p className="text-gray-600">Training + Scope 3 + Carbon Monitoring</p>
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
                        { id: 'methodology', label: 'Methodology & Data', icon: <BookOpen className="w-4 h-4" /> },
                        { id: 'compliance', label: 'Compliance Checklist', icon: <ShieldCheck className="w-4 h-4" /> },
                        { id: 'audit', label: 'Audit Trail', icon: <Clock className="w-4 h-4" /> },
                        { id: 'technical', label: 'Technical Data', icon: <Database className="w-4 h-4" /> },
                        { id: 'export', label: 'Export Data', icon: <Download className="w-4 h-4" /> },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedReport(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${selectedReport === tab.id
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
                    {/* Key Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {summaryCards.map((card, idx) => (
                            <div
                                key={idx}
                                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.color} p-6 shadow-lg cursor-pointer hover:shadow-xl transition-all`}
                                onClick={() => onMetricClick(card, 'summary')}
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 rounded-xl bg-white/20">{card.icon}</div>
                                        {getTrendIcon('improving')}
                                    </div>
                                    <p className="text-white/80 text-sm mb-1">{card.title}</p>
                                    <p className="text-3xl font-bold text-white mb-2">{card.value}</p>
                                    <p className="text-white/70 text-xs">{card.description}</p>
                                </div>
                            </div>
                        ))}
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
                            {priorities.slice(0, 4).map((priority, idx) => (
                                <div key={idx} className="p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                    <div className="flex items-start gap-3">
                                        {idx < 2 ? (
                                            <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                                        ) : (
                                            <AlertTriangle className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" />
                                        )}
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-1">Priority {idx + 1}</h4>
                                            <p className="text-gray-700">{priority}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recommendations */}
                        <div className="mt-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Recommendations</h4>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="p-5 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-200">
                                    <h5 className="font-bold text-red-800 mb-2">Immediate</h5>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                        {recommendations.immediate.map((rec, i) => (
                                            <li key={i}>{rec}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="p-5 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200">
                                    <h5 className="font-bold text-yellow-800 mb-2">Medium Term</h5>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                        {recommendations.medium_term.map((rec, i) => (
                                            <li key={i}>{rec}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="p-5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                                    <h5 className="font-bold text-green-800 mb-2">Long Term</h5>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                        {recommendations.long_term.map((rec, i) => (
                                            <li key={i}>{rec}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {selectedReport === 'methodology' && (
                <div className="space-y-8">
                    {/* Methodology Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="p-6 rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-green-100">
                                    <Calendar className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900">Reporting Year</h4>
                                    <p className="text-sm text-gray-600">Selected Analysis Period</p>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-green-600 mb-2">
                                {methodologyData.selectedYear}
                            </p>
                            <p className="text-sm text-gray-600">
                                Data analyzed for this reporting period
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-blue-100">
                                    <Cpu className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900">Calculation Methods</h4>
                                    <p className="text-sm text-gray-600">Applied methodologies</p>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-blue-600 mb-2">
                                {methodologyData.esgFrameworks.length}
                            </p>
                            <p className="text-sm text-gray-600">
                                Different calculation approaches used
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-purple-100">
                                    <Server className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900">Data Sources</h4>
                                    <p className="text-sm text-gray-600">Information origins</p>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-purple-600 mb-2">
                                {methodologyData.dataSources.length}
                            </p>
                            <p className="text-sm text-gray-600">
                                Primary and secondary data sources
                            </p>
                        </div>
                    </div>

                    {/* Version Information */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">System Versions</h3>
                                <p className="text-gray-600">Software and calculation framework versions</p>
                            </div>
                            <Layers className="w-8 h-8 text-green-600" />
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 rounded-lg bg-gray-200">
                                        <CodeIcon className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <h4 className="font-bold text-gray-900">API Version</h4>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {methodologyData.apiVersion}
                                </p>
                                <p className="text-sm text-gray-600 mt-2">REST API specification version</p>
                            </div>

                            <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 rounded-lg bg-gray-200">
                                        <CalculatorIcon className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <h4 className="font-bold text-gray-900">Calculation Version</h4>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {methodologyData.calculationVersion}
                                </p>
                                <p className="text-sm text-gray-600 mt-2">Algorithm and formula version</p>
                            </div>

                            <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 rounded-lg bg-gray-200">
                                        <Database className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <h4 className="font-bold text-gray-900">GEE Adapter Version</h4>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {methodologyData.geeAdapterVersion}
                                </p>
                                <p className="text-sm text-gray-600 mt-2">Google Earth Engine integration</p>
                            </div>
                        </div>
                    </div>

                    {/* ESG Frameworks and Methodologies */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">ESG Reporting Frameworks</h3>
                                    <p className="text-gray-600">Compliance and reporting standards</p>
                                </div>
                                <Shield className="w-6 h-6 text-green-600" />
                            </div>

                            <div className="space-y-4">
                                {methodologyData.esgFrameworks.length > 0 ? (
                                    methodologyData.esgFrameworks.map((framework: string, index: number) => (
                                        <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-green-100">
                                                    <FileText className="w-4 h-4 text-green-600" />
                                                </div>
                                                <span className="font-medium text-gray-900">{framework}</span>
                                            </div>
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 rounded-xl bg-gray-50 text-center text-gray-500">
                                        No ESG frameworks configured
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">Carbon Accounting Framework</h3>
                                    <p className="text-gray-600">Emission calculation methodology</p>
                                </div>
                                <GitBranch className="w-6 h-6 text-green-600" />
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                                    <h4 className="font-bold text-gray-900 mb-2">Methodology</h4>
                                    <p className="text-gray-700">{methodologyData.carbonMethodology}</p>
                                </div>

                                <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                                    <h4 className="font-bold text-gray-900 mb-2">Sequestration Approach</h4>
                                    <p className="text-gray-700">{methodologyData.sequestrationMethodology}</p>
                                </div>

                                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
                                    <h4 className="font-bold text-gray-900 mb-2">Emission Approach</h4>
                                    <p className="text-gray-700">{methodologyData.emissionMethodology}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Sources */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">Data Sources</h3>
                                <p className="text-gray-600">Primary and secondary data origins</p>
                            </div>
                            <Database className="w-8 h-8 text-green-600" />
                        </div>

                        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <div className="flex flex-wrap gap-3">
                                {methodologyData.dataSources.length > 0 ? (
                                    methodologyData.dataSources.map((source: string, index: number) => (
                                        <span key={index} className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                            {source}
                                        </span>
                                    ))
                                ) : (
                                    <span className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-500 border border-gray-200">
                                        No data sources available
                                    </span>
                                )}
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
                                <p className="text-gray-600">Track compliance against key targets</p>
                            </div>
                            <ShieldCheck className="w-8 h-8 text-green-600" />
                        </div>

                        <DataTable
                            columns={tableColumns.compliance}
                            data={complianceChecklist}
                            onRowClick={(row) => onMetricClick(row, 'compliance')}
                        />
                    </div>

                    {/* Policies & Certifications */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Policies & Certifications</h3>
                                <p className="text-gray-600">Active policies and certifications</p>
                            </div>
                            <Award className="w-6 h-6 text-green-600" />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-bold text-gray-800 mb-3">Policies ({policiesAndCerts.policies.length})</h4>
                                <div className="space-y-2">
                                    {policiesAndCerts.policies.map((policy, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                                            <span className="font-medium text-gray-800">{policy.title}</span>
                                            {policy.verified ? (
                                                <BadgeCheck className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <AlertCircle className="w-5 h-5 text-yellow-600" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 mb-3">Certifications ({policiesAndCerts.certifications.length})</h4>
                                <div className="space-y-2">
                                    {policiesAndCerts.certifications.map((cert, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                                            <span className="font-medium text-gray-800">{cert.name || cert.title || 'Certification'}</span>
                                            <span className="text-xs text-gray-500">{cert.year}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
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
                                <p className="text-gray-600">History of imports and data changes</p>
                            </div>
                            <Clock className="w-8 h-8 text-green-600" />
                        </div>

                        <DataTable
                            columns={tableColumns.audit}
                            data={auditTrail}
                            onRowClick={(row) => setSelectedAuditLog(row)}
                        />
                    </div>
                </div>
            )}

            {selectedReport === 'technical' && (
                <div className="space-y-8">
                    {/* Yearly Training Hours Table */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Yearly Training Hours</h3>
                                <p className="text-gray-600">Breakdown by employee category</p>
                            </div>
                            <Users className="w-6 h-6 text-green-600" />
                        </div>

                        <DataTable
                            columns={tableColumns.yearlyTraining}
                            data={yearlyTrainingData}
                            onRowClick={(row) => onMetricClick(row, 'yearlyTraining')}
                        />
                    </div>

                    {/* List Metrics */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Training Details (List Metrics)</h3>
                                <p className="text-gray-600">Focus areas, delivery methods, and compliance programs</p>
                            </div>
                            <BarChart className="w-6 h-6 text-green-600" />
                        </div>

                        <DataTable
                            columns={tableColumns.listMetrics}
                            data={listMetricsData}
                            onRowClick={(row) => onMetricClick(row, 'listMetrics')}
                        />
                    </div>

                    {/* Training Metrics (from aggregated) */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Training Metrics</h3>
                                <p className="text-gray-600">Employee training details</p>
                            </div>
                            <Users className="w-6 h-6 text-green-600" />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl bg-gray-50">
                                <p className="text-sm text-gray-600 mb-1">Total Hours</p>
                                <p className="text-2xl font-bold text-gray-900">{formatNumber(trainingMetrics.total_training_hours)}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gray-50">
                                <p className="text-sm text-gray-600 mb-1">Farmer Hours</p>
                                <p className="text-2xl font-bold text-gray-900">{formatNumber(trainingMetrics.farmer_training_hours)}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gray-50">
                                <p className="text-sm text-gray-600 mb-1">Safety Hours</p>
                                <p className="text-2xl font-bold text-gray-900">{formatNumber(trainingMetrics.safety_training_hours)}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gray-50">
                                <p className="text-sm text-gray-600 mb-1">Technical Hours</p>
                                <p className="text-2xl font-bold text-gray-900">{formatNumber(trainingMetrics.technical_training_hours)}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gray-50">
                                <p className="text-sm text-gray-600 mb-1">Employees Trained</p>
                                <p className="text-2xl font-bold text-gray-900">{formatNumber(trainingMetrics.employees_trained_total)}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gray-50">
                                <p className="text-sm text-gray-600 mb-1">Farmers Trained</p>
                                <p className="text-2xl font-bold text-gray-900">{formatNumber(trainingMetrics.employees_trained_farmers)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Scope 3 Engagement */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Scope 3 Engagement</h3>
                                <p className="text-gray-600">Supplier and value chain metrics</p>
                            </div>
                            <Factory className="w-6 h-6 text-green-600" />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl bg-gray-50">
                                <p className="text-sm text-gray-600 mb-1">Suppliers with Code</p>
                                <p className="text-2xl font-bold text-gray-900">{formatNumber(scope3Engagement.suppliers_with_code)}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gray-50">
                                <p className="text-sm text-gray-600 mb-1">Suppliers Audited</p>
                                <p className="text-2xl font-bold text-gray-900">{formatNumber(scope3Engagement.suppliers_audited)}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gray-50">
                                <p className="text-sm text-gray-600 mb-1">Supplier Training Hours</p>
                                <p className="text-2xl font-bold text-gray-900">{formatNumber(scope3Engagement.supplier_training_hours)}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gray-50">
                                <p className="text-sm text-gray-600 mb-1">Non-Compliance Cases</p>
                                <p className="text-2xl font-bold text-gray-900">{formatNumber(scope3Engagement.non_compliance_cases)}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gray-50">
                                <p className="text-sm text-gray-600 mb-1">Corrective Actions</p>
                                <p className="text-2xl font-bold text-gray-900">{formatNumber(scope3Engagement.corrective_actions)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Carbon Scope 3 Breakdown */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Carbon Scope 3 Breakdown</h3>
                                <p className="text-gray-600">Detailed emissions by category</p>
                            </div>
                            <PieChart className="w-6 h-6 text-green-600" />
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Category</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Parameter</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">tCO₂e/ha/yr</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">% of Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {scope3Breakdown.map((cat: any, idx: number) => (
                                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm text-gray-800">{cat.category}</td>
                                            <td className="py-3 px-4 text-sm text-gray-800">{cat.parameter}</td>
                                            <td className="py-3 px-4 text-sm text-gray-800">{cat.tco2e_per_ha_per_year.toFixed(2)}</td>
                                            <td className="py-3 px-4 text-sm text-gray-800">{cat.percentage.toFixed(1)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Emission Factors Table */}
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
                            data={emissionFactorsData}
                            onRowClick={(row) => onMetricClick(row, 'emissionFactor')}
                        />
                    </div>
                </div>
            )}

            {selectedReport === 'export' && (
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">Export Data</h3>
                            <p className="text-gray-600">Download compliance reports in various formats</p>
                        </div>
                        <Download className="w-8 h-8 text-green-600" />
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { format: 'pdf', icon: <FileText className="w-12 h-12" />, label: 'PDF Report', desc: 'Formatted compliance report' },
                            { format: 'excel', icon: <FileSpreadsheet className="w-12 h-12" />, label: 'Excel', desc: 'Spreadsheet with all metrics' },
                            { format: 'csv', icon: <FileText className="w-12 h-12" />, label: 'CSV', desc: 'Raw data export' },
                        ].map((opt) => (
                            <button
                                key={opt.format}
                                onClick={() => {
                                    setExportFormat(opt.format as any);
                                    setIsExportModalOpen(true);
                                }}
                                className="p-8 rounded-2xl border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all text-center group"
                            >
                                <div className="text-gray-400 group-hover:text-green-600 mb-4">
                                    {opt.icon}
                                </div>
                                <h4 className="font-bold text-lg text-gray-900 mb-1">{opt.label}</h4>
                                <p className="text-sm text-gray-600">{opt.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Export Modal */}
            {isExportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsExportModalOpen(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold mb-1">Export Report</h3>
                                    <p className="text-green-100">Choose format and options</p>
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
                                        className={`p-6 rounded-2xl border-2 transition-all ${exportFormat === 'pdf'
                                                ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <FileText className={`w-10 h-10 mx-auto mb-3 ${exportFormat === 'pdf' ? 'text-green-600' : 'text-gray-400'}`} />
                                        <span className={`font-semibold ${exportFormat === 'pdf' ? 'text-green-700' : 'text-gray-700'}`}>PDF</span>
                                    </button>
                                    <button
                                        onClick={() => setExportFormat('excel')}
                                        className={`p-6 rounded-2xl border-2 transition-all ${exportFormat === 'excel'
                                                ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <FileSpreadsheet className={`w-10 h-10 mx-auto mb-3 ${exportFormat === 'excel' ? 'text-green-600' : 'text-gray-400'}`} />
                                        <span className={`font-semibold ${exportFormat === 'excel' ? 'text-green-700' : 'text-gray-700'}`}>Excel</span>
                                    </button>
                                    <button
                                        onClick={() => setExportFormat('csv')}
                                        className={`p-6 rounded-2xl border-2 transition-all ${exportFormat === 'csv'
                                                ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <FileText className={`w-10 h-10 mx-auto mb-3 ${exportFormat === 'csv' ? 'text-green-600' : 'text-gray-400'}`} />
                                        <span className={`font-semibold ${exportFormat === 'csv' ? 'text-green-700' : 'text-gray-700'}`}>CSV</span>
                                    </button>
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
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold mb-1">Audit Log Details</h3>
                                    <p className="text-green-100">Complete action information</p>
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
                                    <p className="text-sm text-gray-600 mb-2 font-medium">Batch ID</p>
                                    <p className="font-bold text-lg text-gray-900">{selectedAuditLog.id}</p>
                                </div>
                                <div className="p-5 rounded-xl bg-gray-50">
                                    <p className="text-sm text-gray-600 mb-2 font-medium">Status</p>
                                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
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
                                <div className="p-5 rounded-xl bg-gray-50">
                                    <p className="text-sm text-gray-600 mb-2 font-medium">Metrics Imported</p>
                                    <p className="font-bold text-lg text-gray-900">{selectedAuditLog.changes}</p>
                                </div>
                            </div>
                            <div className="flex justify-end pt-6 border-t border-gray-200">
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
        </div>
    );
};

// Helper icons (reused from soil carbon report)
const CodeIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
);

const CalculatorIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);

export default ComplianceReportsTab;