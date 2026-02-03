// compliance_tabs/ComplianceReportsTab.tsx
import React, { useState } from 'react';
import { 
    FileText, 
    Download, 
    Printer, 
    Eye, 
    Calendar, 
    User, 
    CheckCircle, 
    AlertTriangle,
    FilePieChart,
    BarChart2,
    Share2,
    Building,
    MapPin,
    Database,
    Target,
    Layers,
    BookOpen,
    ShieldCheck,
    ClipboardCheck,
    FileSpreadsheet,
    Calculator,
    TrendingUp,
    TrendingDown,
    MoreVertical,
    ChevronRight,
    ChevronDown,
    X,
    Mail,
    Phone,
    Globe,
    Users,
    Zap,
    Activity,
    Clock
} from 'lucide-react';

// Import types and helper functions
import {
    FarmComplianceResponse,
    getFarmComplianceCompany,
    getCarbonEmissions,
    getCarbonSequestration,
    getComplianceScores,
    getGRIAlignmentMetrics,
    getTrainingMetrics,
    getFrameworkAlignment,
    getFarmAreaOfInterest,
    getESGFrameworks,
    getESGContactPerson,
    getScope1Breakdown,
    getScope3Breakdown,
    getCarbonIntensityPerHa,
    getCompliancePriorities,
    getMonthlyCarbonChange
} from '../../../../services/Admin_Service/esg_apis/farm_compliance_service';

interface ComplianceReportsTabProps {
    complianceData: FarmComplianceResponse | null;
    selectedCompany: any;
    formatNumber: (num: number | null) => string;
    formatPercent: (num: number | null) => string;
    colors: any;
    selectedYear: number | null;
}

const ComplianceReportsTab: React.FC<ComplianceReportsTabProps> = ({
    complianceData,
    selectedCompany,
    formatNumber,
    formatPercent,
    colors,
    selectedYear,
}) => {
    const [selectedReport, setSelectedReport] = useState<string>('summary');
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');

    if (!complianceData) {
        return (
            <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl">
                <div className="text-center max-w-md p-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                        <FileText className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">No Compliance Data Available</h3>
                    <p className="text-gray-600">Select a company to view compliance and reporting information.</p>
                </div>
            </div>
        );
    }

    // Get data using helper functions
    const company = getFarmComplianceCompany(complianceData);
    const carbonEmissions = getCarbonEmissions(complianceData);
    const carbonSequestration = getCarbonSequestration(complianceData);
    const complianceScores = getComplianceScores(complianceData);
    const griIfrsData = complianceData.data.gri_ifrs_data;
    const trainingMetrics = getTrainingMetrics(complianceData);
    const frameworkAlignment = getFrameworkAlignment(complianceData);
    const areaOfInterest = getFarmAreaOfInterest(complianceData);
    const esgFrameworks = getESGFrameworks(complianceData);
    const esgContactPerson = getESGContactPerson(complianceData);
    const scope1Breakdown = getScope1Breakdown(complianceData);
    const scope3Breakdown = getScope3Breakdown(complianceData);
    const carbonIntensity = getCarbonIntensityPerHa(complianceData);
    const compliancePriorities = getCompliancePriorities(complianceData);
    const monthlyCarbonChange = getMonthlyCarbonChange(complianceData);

    // Carbon accounting data
    const carbonAccounting = complianceData.data.carbon_emission_accounting;
    const createdBy = carbonAccounting.created_by;
    const methodologyStatement = carbonAccounting.emission_references.methodology_statement;
    const monthlySequestrationData = carbonAccounting.yearly_data.sequestration.monthly_data;

    // Policies and certifications
    const policies = complianceData.data.policies_and_certifications.policies;
    const certifications = complianceData.data.policies_and_certifications.certifications;

    // Scope 3 analysis
    const scope3Analysis = complianceData.data.scope3_analysis;

    // Data quality
    const dataQuality = complianceData.data.data_quality;

    // Color palette
    const COLORS = {
        primary: colors.primary || '#008000',
        primaryDark: colors.darkGreen || '#006400',
        primaryLight: colors.lightGreen || '#10B981',
        secondary: colors.secondary || '#B8860B',
        accent: colors.accent || '#22C55E',
        success: colors.emerald || '#10B981',
        warning: colors.warning || '#F59E0B',
        danger: colors.danger || '#EF4444',
        info: colors.info || '#3B82F6',
        purple: colors.purple || '#8B5CF6',
        lime: colors.lime || '#84CC16',
    };

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const handleExport = () => {
        setIsExportModalOpen(true);
    };

    const renderSummaryReport = () => (
        <div className="space-y-8">
            {/* Company Overview */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Company Overview</h3>
                        <p className="text-gray-600">Compliance reporting and ESG status</p>
                    </div>
                    <Building className="w-8 h-8 text-green-600" />
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
                                    <p className="text-sm text-gray-600 mb-1">Registration Number</p>
                                    <p className="text-lg font-medium text-gray-800">{company.registrationNumber}</p>
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
                                        {esgContactPerson ? 
                                            `${esgContactPerson.name} (${esgContactPerson.email})` : 
                                            'Not specified'
                                        }
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Latest ESG Report Year</p>
                                    <p className="text-lg font-medium text-gray-800">
                                        {company.latest_esg_report_year ? `Year ${company.latest_esg_report_year}` : 'Not available'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">ESG Data Status</p>
                                    <p className="text-lg font-medium text-gray-800">{company.esg_data_status || 'Not specified'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">ESG Linked Pay</p>
                                    <p className="text-lg font-medium text-gray-800">
                                        {company.has_esg_linked_pay ? 'Yes' : 'No'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Purpose and Scope */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                            <div className="flex items-center gap-3 mb-4">
                                <Target className="w-5 h-5 text-blue-600" />
                                <h4 className="font-bold text-lg text-gray-900">Purpose</h4>
                            </div>
                            <p className="text-gray-800">{company.purpose || 'Not specified'}</p>
                        </div>

                        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                            <div className="flex items-center gap-3 mb-4">
                                <Globe className="w-5 h-5 text-purple-600" />
                                <h4 className="font-bold text-lg text-gray-900">Scope</h4>
                            </div>
                            <p className="text-gray-800">{company.scope || 'Not specified'}</p>
                        </div>
                    </div>

                    {/* Area of Interest */}
                    {areaOfInterest && (
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
                            <div className="flex items-center gap-3 mb-4">
                                <MapPin className="w-5 h-5 text-amber-600" />
                                <h4 className="font-bold text-lg text-gray-900">Area of Interest</h4>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Name</p>
                                    <p className="text-lg font-medium text-gray-800">{areaOfInterest.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Area Covered</p>
                                    <p className="text-lg font-medium text-gray-800">{areaOfInterest.area_covered}</p>
                                </div>
                            </div>
                            {areaOfInterest.coordinates && areaOfInterest.coordinates.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm text-gray-600 mb-2">Coordinates</p>
                                    <div className="flex flex-wrap gap-2">
                                        {areaOfInterest.coordinates.slice(0, 3).map((coord, index) => (
                                            <span key={index} className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border">
                                                {coord.lat.toFixed(4)}, {coord.lon.toFixed(4)}
                                            </span>
                                        ))}
                                        {areaOfInterest.coordinates.length > 3 && (
                                            <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-500 border">
                                                +{areaOfInterest.coordinates.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>


            {/* Key Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-green-100">
                            <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Training Hours</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatNumber(trainingMetrics.total_training_hours)}
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">Total training completed</p>
                </div>

                <div className="bg-white rounded-3xl border-2 border-blue-100 shadow-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-blue-100">
                            <ClipboardCheck className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Verified Policies</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {policies.summary.verified_policies}
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">Out of {policies.summary.total_policies} total</p>
                </div>

                <div className="bg-white rounded-3xl border-2 border-purple-100 shadow-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-purple-100">
                            <Target className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Carbon Balance</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatNumber(carbonEmissions.net_carbon_balance_tco2e)}
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">Net CO₂ equivalent</p>
                </div>

                <div className="bg-white rounded-3xl border-2 border-amber-100 shadow-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-amber-100">
                            <Database className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Data Quality</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatNumber(dataQuality.data_coverage)}
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">% data coverage</p>
                </div>
            </div>
        </div>
    );

    const renderESGFrameworksReport = () => (
        <div className="space-y-8">
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">ESG Reporting Frameworks</h3>
                        <p className="text-gray-600">Frameworks and standards used for ESG reporting</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-green-600" />
                </div>

                <div className="space-y-6">
                    {/* ESG Frameworks */}
                    {esgFrameworks && esgFrameworks.length > 0 ? (
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Implemented Frameworks</h4>
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
                                <p className="text-gray-700">This company has not specified any ESG reporting frameworks.</p>
                            </div>
                        </div>
                    )}

                    {/* GRI/IFRS Alignment */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-lg text-gray-900">GRI/IFRS Alignment Metrics</h4>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                                {griIfrsData.summary.total_alignment_metrics} metrics
                            </span>
                        </div>
                        
                        <div className="space-y-4">
                            {griIfrsData.alignments.map((alignment, index) => (
                                <div key={index} className="p-4 rounded-xl bg-white border border-blue-100">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="font-medium text-gray-900">{alignment.metric_name}</p>
                                            <p className="text-sm text-gray-500">{alignment.category}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                                            {alignment.value}
                                        </span>
                                    </div>
                                    {alignment.source_notes && (
                                        <p className="text-sm text-gray-600 mt-2">{alignment.source_notes}</p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 p-4 rounded-xl bg-white">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-sm text-gray-600 mb-1">Total Sources</p>
                                    <p className="text-xl font-bold text-gray-900">{griIfrsData.summary.total_gri_ifrs_sources}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-600 mb-1">Alignment Score</p>
                                    <p className="text-xl font-bold text-gray-900">{griIfrsData.summary.average_alignment_score}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-600 mb-1">Metrics</p>
                                    <p className="text-xl font-bold text-gray-900">{griIfrsData.summary.total_alignment_metrics}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Framework Alignment Scores */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.entries(frameworkAlignment).map(([key, value]) => (
                            <div key={key} className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                                <p className="text-sm text-gray-600 mb-2">
                                    {key.replace(/_/g, ' ').toUpperCase()}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatNumber(value as number)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderCarbonAccountingReport = () => (
        <div className="space-y-8">
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Carbon Emission Accounting</h3>
                        <p className="text-gray-600">Comprehensive carbon accounting and analysis</p>
                    </div>
                    <Calculator className="w-8 h-8 text-green-600" />
                </div>

                <div className="space-y-6">
                    {/* Carbon Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                            <p className="text-sm text-gray-600 mb-2">Scope 1 Emissions</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatNumber(carbonEmissions.scope1_tco2e)} tCO₂e
                            </p>
                        </div>
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                            <p className="text-sm text-gray-600 mb-2">Scope 2 Emissions</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatNumber(carbonEmissions.scope2_tco2e)} tCO₂e
                            </p>
                        </div>
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                            <p className="text-sm text-gray-600 mb-2">Scope 3 Emissions</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatNumber(carbonEmissions.scope3_tco2e)} tCO₂e
                            </p>
                        </div>
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
                            <p className="text-sm text-gray-600 mb-2">Total Emissions</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatNumber(carbonEmissions.total_emissions_tco2e)} tCO₂e
                            </p>
                        </div>
                    </div>

                    {/* Carbon Sequestration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                            <div className="flex items-center gap-3 mb-4">
                                <Activity className="w-5 h-5 text-green-600" />
                                <h4 className="font-bold text-lg text-gray-900">Carbon Sequestration</h4>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700">Biomass CO₂</span>
                                    <span className="font-bold text-gray-900">
                                        {formatNumber(carbonSequestration.biomass_co2_t)} tCO₂
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700">Soil Organic Carbon</span>
                                    <span className="font-bold text-gray-900">
                                        {formatNumber(carbonSequestration.soc_co2_t)} tCO₂
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t">
                                    <span className="text-gray-700 font-medium">Total Sequestration</span>
                                    <span className="font-bold text-green-600 text-lg">
                                        {formatNumber(carbonSequestration.total_sequestration_tco2)} tCO₂
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                            <div className="flex items-center gap-3 mb-4">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                <h4 className="font-bold text-lg text-gray-900">Net Carbon Balance</h4>
                            </div>
                            <div className="text-center py-6">
                                <p className="text-5xl font-bold mb-2" style={{
                                    color: carbonEmissions.net_carbon_balance_tco2e < 0 ? COLORS.success : COLORS.danger
                                }}>
                                    {formatNumber(carbonEmissions.net_carbon_balance_tco2e)} tCO₂e
                                </p>
                                <p className="text-gray-600">
                                    {carbonEmissions.net_carbon_balance_tco2e < 0 ? 'Carbon Negative' : 'Carbon Positive'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Carbon Data */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                        <h4 className="font-bold text-lg text-gray-900 mb-4">Monthly Carbon Change</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-300">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Month</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Net Change (tCO₂)</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Sequestration (tCO₂)</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthlyCarbonChange.slice(0, 6).map((month, index) => (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 text-gray-800">{month.month}</td>
                                            <td className="py-3 px-4">
                                                <span className={`font-medium ${month.netChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {formatNumber(month.netChange)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-700">{formatNumber(month.sequestration)}</td>
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-gray-600">{month.meaning}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Data Quality */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                        <h4 className="font-bold text-lg text-gray-900 mb-4">Carbon Data Quality</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-white rounded-xl">
                                <p className="text-sm text-gray-600 mb-1">Completeness</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {formatPercent(carbonEmissions.data_quality.completeness)}
                                </p>
                            </div>
                            <div className="text-center p-4 bg-white rounded-xl">
                                <p className="text-sm text-gray-600 mb-1">Verification</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {carbonEmissions.data_quality.verification}
                                </p>
                            </div>
                            <div className="text-center p-4 bg-white rounded-xl">
                                <p className="text-sm text-gray-600 mb-1">Carbon Data</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {dataQuality.carbon_data_available ? 'Available' : 'Not Available'}
                                </p>
                            </div>
                            <div className="text-center p-4 bg-white rounded-xl">
                                <p className="text-sm text-gray-600 mb-1">Quality Score</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {formatPercent(dataQuality.carbon_data_quality)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMethodologyReport = () => (
        <div className="space-y-8">
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Methodology Details</h3>
                        <p className="text-gray-600">Calculation approaches and data processing workflows</p>
                    </div>
                    <Layers className="w-8 h-8 text-green-600" />
                </div>

                <div className="space-y-6">
                    {/* Methodology Statement */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="w-5 h-5 text-green-600" />
                            <h4 className="font-bold text-lg text-gray-900">Methodology Statement</h4>
                        </div>
                        <p className="text-gray-800">{methodologyStatement || 'Standard methodology applied.'}</p>
                    </div>

                    {/* Data Processing Workflow */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Zap className="w-5 h-5 text-blue-600" />
                            <h4 className="font-bold text-lg text-gray-900">Data Processing Workflow</h4>
                        </div>
                        <p className="text-gray-800">
                            {company.data_processing_workflow || 'Standard data processing workflow applied for compliance reporting.'}
                        </p>
                    </div>

                    {/* Analytical Layer Metadata */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Layers className="w-5 h-5 text-purple-600" />
                            <h4 className="font-bold text-lg text-gray-900">Analytical Layer Metadata</h4>
                        </div>
                        <p className="text-gray-800">
                            {company.analytical_layer_metadata || 'Standard analytical layers applied for environmental compliance assessment.'}
                        </p>
                    </div>

                    {/* Data Sources */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
                        <div className="flex items-center gap-3 mb-4">
                            <Database className="w-5 h-5 text-amber-600" />
                            <h4 className="font-bold text-lg text-gray-900">Data Sources</h4>
                        </div>
                        <div className="space-y-2">
                            {company.data_source && company.data_source.length > 0 ? (
                                company.data_source.map((source, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                                        <Database className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                        <span className="text-gray-700">{source}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-600">No specific data sources defined</p>
                            )}
                        </div>
                    </div>

                    {/* Carbon Framework */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                        <h4 className="font-bold text-lg text-gray-900 mb-4">Carbon Calculation Framework</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 bg-white rounded-xl">
                                <p className="text-sm text-gray-600 mb-1">Sequestration Methodology</p>
                                <p className="font-medium text-gray-800">
                                    {carbonAccounting.framework?.sequestration_methodology || 'Not specified'}
                                </p>
                            </div>
                            <div className="p-4 bg-white rounded-xl">
                                <p className="text-sm text-gray-600 mb-1">Emission Methodology</p>
                                <p className="font-medium text-gray-800">
                                    {carbonAccounting.framework?.emission_methodology || 'Not specified'}
                                </p>
                            </div>
                            <div className="p-4 bg-white rounded-xl">
                                <p className="text-sm text-gray-600 mb-1">Calculation Approach</p>
                                <p className="font-medium text-gray-800">
                                    {carbonAccounting.framework?.calculation_approach || 'Not specified'}
                                </p>
                            </div>
                            <div className="p-4 bg-white rounded-xl">
                                <p className="text-sm text-gray-600 mb-1">Data Sources</p>
                                <div className="space-y-1">
                                    {carbonAccounting.framework?.data_sources?.slice(0, 2).map((source, index) => (
                                        <p key={index} className="text-sm text-gray-700">{source}</p>
                                    ))}
                                    {carbonAccounting.framework?.data_sources?.length > 2 && (
                                        <p className="text-sm text-gray-500">
                                            +{carbonAccounting.framework.data_sources.length - 2} more
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTechnicalReport = () => (
        <div className="space-y-8">
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Technical Metadata</h3>
                        <p className="text-gray-600">System information and data processing details</p>
                    </div>
                    <Database className="w-8 h-8 text-green-600" />
                </div>

                <div className="space-y-6">
                    {/* Created By */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                        <div className="flex items-center gap-3 mb-4">
                            <User className="w-5 h-5 text-green-600" />
                            <h4 className="font-bold text-lg text-gray-900">Created By</h4>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">User ID</p>
                                <p className="text-lg font-medium text-gray-800">{createdBy._id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Email</p>
                                <p className="text-lg font-medium text-gray-800">{createdBy.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* System Information */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                        <h4 className="font-bold text-lg text-gray-900 mb-4">System Information</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-white rounded-xl">
                                <p className="text-sm text-gray-600 mb-1">Status</p>
                                <p className="font-medium text-gray-800">{carbonAccounting.status}</p>
                            </div>
                            <div className="p-4 bg-white rounded-xl">
                                <p className="text-sm text-gray-600 mb-1">Active</p>
                                <p className="font-medium text-gray-800">
                                    {carbonAccounting.is_active ? 'Yes' : 'No'}
                                </p>
                            </div>
                            <div className="p-4 bg-white rounded-xl">
                                <p className="text-sm text-gray-600 mb-1">Document ID</p>
                                <p className="font-medium text-gray-800 text-sm">{carbonAccounting.document_id}</p>
                            </div>
                        </div>
                    </div>

                    {/* Timestamps */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                            <div className="flex items-center gap-3 mb-4">
                                <Calendar className="w-5 h-5 text-purple-600" />
                                <h4 className="font-bold text-lg text-gray-900">Creation Details</h4>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Created At</span>
                                    <span className="font-medium text-gray-800">
                                        {new Date(carbonAccounting.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Last Updated</span>
                                    <span className="font-medium text-gray-800">
                                        {new Date(carbonAccounting.last_updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
                            <div className="flex items-center gap-3 mb-4">
                                <Clock className="w-5 h-5 text-amber-600" />
                                <h4 className="font-bold text-lg text-gray-900">Data Range</h4>
                            </div>
                            <p className="text-gray-800">{company.data_range || 'Not specified'}</p>
                        </div>
                    </div>

                    {/* Data Management */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                        <h4 className="font-bold text-lg text-gray-900 mb-4">Data Management</h4>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-white rounded-xl">
                                    <p className="text-sm text-gray-600 mb-1">Validation Status</p>
                                    <p className="font-medium text-gray-800">
                                        {carbonAccounting.data_management.validation_status}
                                    </p>
                                </div>
                                <div className="p-4 bg-white rounded-xl">
                                    <p className="text-sm text-gray-600 mb-1">Import History</p>
                                    <p className="font-medium text-gray-800">
                                        {carbonAccounting.data_management.import_history.length} imports
                                    </p>
                                </div>
                                <div className="p-4 bg-white rounded-xl">
                                    <p className="text-sm text-gray-600 mb-1">Verification Status</p>
                                    <p className="font-medium text-gray-800">
                                        {dataQuality.verification_status || 'Not specified'}
                                    </p>
                                </div>
                                <div className="p-4 bg-white rounded-xl">
                                    <p className="text-sm text-gray-600 mb-1">Last Verification</p>
                                    <p className="font-medium text-gray-800">
                                        {dataQuality.last_verification_date ? 
                                            new Date(dataQuality.last_verification_date).toLocaleDateString() : 
                                            'Not verified'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-8">
            {/* Report Navigation */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Compliance Report Sections</h3>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        <button className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex gap-3 overflow-x-auto">
                    {[
                        { id: 'summary', label: 'Summary', icon: <FileText className="w-4 h-4" /> },
                        { id: 'esg-frameworks', label: 'ESG Frameworks', icon: <BookOpen className="w-4 h-4" /> },
                        { id: 'carbon-accounting', label: 'Carbon Accounting', icon: <Calculator className="w-4 h-4" /> },
                        { id: 'methodology', label: 'Methodology', icon: <Layers className="w-4 h-4" /> },
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

            {/* Selected Report Content */}
            {selectedReport === 'summary' && renderSummaryReport()}
            {selectedReport === 'esg-frameworks' && renderESGFrameworksReport()}
            {selectedReport === 'carbon-accounting' && renderCarbonAccountingReport()}
            {selectedReport === 'methodology' && renderMethodologyReport()}
            {selectedReport === 'technical' && renderTechnicalReport()}

            {/* Export Modal */}
            {isExportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setIsExportModalOpen(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold">Export Compliance Report</h3>
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
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    onClick={() => setIsExportModalOpen(false)}
                                    className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        alert(`Exporting ${selectedReport} report as ${exportFormat.toUpperCase()}`);
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

export default ComplianceReportsTab;