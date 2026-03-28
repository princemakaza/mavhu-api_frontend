import React, { useState } from 'react';

// Icons
import {
    FileText,
    Download,
    Printer,
    MoreVertical,
    Building,
    BarChart3,
    BookOpen,
    Layers,
    Database,
    ShieldCheck,
    CheckCircle,
    AlertTriangle,
    X,
    FileSpreadsheet,
    Trees,
    Leaf,
    Users,
    Globe,
    MapPin,
    Phone,
    Mail,
    Link,
    Award,
    Target,
    Clock,
    Info,
    ChevronDown,
    ChevronRight,
    Activity,
    TrendingUp,
    TrendingDown,
    Cpu,
    GitBranch,
    Code2,
    Calendar,
    PieChart,
    Sprout,
    Bird,
    Landmark,
    Tractor,
    Shield,
    Droplets,
    Factory,
    Footprints,
    Sun,
    Wind,
    Mountain,
    TreePine,
} from "lucide-react";

// Import only what is actually exported from the service
import {
    getCompany,
    getMetadata,
    getReportingPeriod,
    getCurrentYear,
    getBaselineYear,
    getDataCompleteness,
    getMetricsByYear,
    getMetricSnapshot,
    getMetricsByCategory,
    getSummaryStatistics,
    getKeyPerformanceIndicators,
    getAllMetrics,
    findMetric,
    getMetricYearlyData,
    getMetricValueForYear,
    getDataQuality,
    isDataVerified,
    getValidationErrors,
    getSourceInformation,
    getGriReferences,
    getAudit,
    getAreaOfInterestMetadata,
    getCoordinatesForMapping,
    hasAreaOfInterest,
    getTotalAgriculturalArea,
    getTotalSurveyedArea,
    getTotalLpgDistributed,
    getTotalTreesPlanted,
    getLpgDistributionsForYear,
    getAreaUnderCaneForYear,
    getTotalAgriculturalLandForYear,
    getSurveyedLandAreaForYear,
    getAllGraphs,
    getLandUseCompositionGraph,
    getForestAreaTrendGraph,
    getSpeciesCountTrendGraph,
    getTreesPlantedTrendGraph,
    type BiodiversityLandUseResponse,
    type Company,
    type BiodiversityMetric,
    type MetricCategory,
    type Graph,
} from '../../../../services/Admin_Service/esg_apis/biodiversity_api_service';

// Color Palette (matches parent)
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

interface ReportsTabProps {
    biodiversityData: BiodiversityLandUseResponse | null;
    selectedCompany?: Company | null;
    formatNumber: (num: number) => string;
    formatCurrency?: (num: number) => string;
    formatPercent: (num: number) => string;
    getTrendIcon?: (trend: string) => JSX.Element;
    selectedYear: number | null;
    availableYears: number[];
    loading?: boolean;
    isRefreshing?: boolean;
    onMetricClick: (metric: any, modalType: string) => void;
    onCalculationClick?: (type: string, data?: any) => void;
}

const ReportsTab: React.FC<ReportsTabProps> = ({
    biodiversityData,
    selectedCompany,
    formatNumber,
    formatPercent,
    selectedYear,
    availableYears,
    onMetricClick,
}) => {
    const [selectedReport, setSelectedReport] = useState<string>('summary');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    if (!biodiversityData) {
        return (
            <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl">
                <div className="text-center max-w-md p-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                        <FileText className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">No Reports Available</h3>
                    <p className="text-gray-600">Select a company to view biodiversity and land use reports.</p>
                </div>
            </div>
        );
    }

    // ----------------------------------------------------------------------
    // 1. Use the available helper functions to extract data from the response
    // ----------------------------------------------------------------------
    const company = getCompany(biodiversityData);
    const metadata = getMetadata(biodiversityData);
    const reportingPeriod = getReportingPeriod(biodiversityData);
    const currentYear = getCurrentYear(biodiversityData);
    const baselineYear = getBaselineYear(biodiversityData);
    const dataCompleteness = getDataCompleteness(biodiversityData);

    const allMetrics = getAllMetrics(biodiversityData);
    const metricsByCategory = getMetricsByCategory(biodiversityData);
    const summaryStats = getSummaryStatistics(biodiversityData);
    const kpi = getKeyPerformanceIndicators(biodiversityData);
    const dataQuality = getDataQuality(biodiversityData);
    const sourceInfo = getSourceInformation(biodiversityData);
    const griRefs = getGriReferences(biodiversityData);
    const audit = getAudit(biodiversityData);
    const areaOfInterest = getAreaOfInterestMetadata(biodiversityData);

    // Graphs
    const allGraphs = getAllGraphs(biodiversityData);
    const landUseGraph = getLandUseCompositionGraph(biodiversityData);
    const forestTrendGraph = getForestAreaTrendGraph(biodiversityData);
    const speciesTrendGraph = getSpeciesCountTrendGraph(biodiversityData);
    const treesPlantedGraph = getTreesPlantedTrendGraph(biodiversityData);

    // ----------------------------------------------------------------------
    // 2. Build derived / computed objects for UI
    // ----------------------------------------------------------------------

    // Key statistics (derived)
    const keyStats = {
        years_covered: reportingPeriod.analysis_years.length,
        total_metrics_analyzed: allMetrics.length,
        data_quality_score: dataQuality.quality_score,
        verification_status: dataQuality.verification_status,
    };

    // ESG frameworks from company
    const esgFrameworks = company.esg_reporting_framework || [];

    // ----------------------------------------------------------------------
    // 3. Helper functions for UI
    // ----------------------------------------------------------------------
    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const handleExport = () => {
        console.log(`Exporting as ${exportFormat.toUpperCase()}`);
        alert(`Exporting as ${exportFormat.toUpperCase()} - This feature will be implemented soon.`);
        setIsExportModalOpen(false);
    };

    // Helper to render a metric card with icon
    const renderMetricCard = (
        title: string,
        value: number | string,
        icon: React.ReactNode,
        color: string = 'green',
        subtitle?: string
    ) => (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:border-green-300 transition-all">
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl bg-${color}-100`}>{icon}</div>
                <div>
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? formatNumber(value) : value}</p>
                    {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
                </div>
            </div>
        </div>
    );

    // ----------------------------------------------------------------------
    // 4. Render the component (biodiversity‑focused)
    // ----------------------------------------------------------------------
    return (
        <div className="space-y-8 pb-8">
            {/* Report Navigation */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Report Sections</h3>
                        <p className="text-gray-600">Navigate through biodiversity and land use reports</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsExportModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        <button className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2">
                    {[
                        { id: 'summary', label: 'Executive Summary', icon: <FileText className="w-4 h-4" /> },
                        { id: 'biodiversity-metrics', label: 'Biodiversity Metrics', icon: <TreePine className="w-4 h-4" /> },
                        { id: 'esg-frameworks', label: 'ESG Frameworks', icon: <BookOpen className="w-4 h-4" /> },
                        { id: 'methodology', label: 'Methodology', icon: <Layers className="w-4 h-4" /> },
                        { id: 'technical', label: 'Technical Data', icon: <Database className="w-4 h-4" /> },
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

            {/* Executive Summary */}
            {selectedReport === 'summary' && (
                <div className="space-y-8">
                    {/* Company Overview */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Company Overview</h3>
                                <p className="text-gray-600">Biodiversity and land use reporting profile</p>
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
                                <h4 className="font-bold text-lg text-gray-900 mb-4">Reporting Scope</h4>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Purpose</p>
                                        <p className="text-gray-800">{company.purpose || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Scope</p>
                                        <p className="text-gray-800">{company.scope || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Data Range</p>
                                        <p className="text-gray-800">{company.data_range || 'Not specified'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Key Statistics */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Key Statistics</h3>
                            <BarChart3 className="w-8 h-8 text-green-600" />
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                <p className="text-sm text-gray-600 mb-2">Analysis Years</p>
                                <p className="text-2xl font-bold text-gray-900">{keyStats.years_covered}</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                <p className="text-sm text-gray-600 mb-2">Current Year</p>
                                <p className="text-2xl font-bold text-gray-900">{currentYear}</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                <p className="text-sm text-gray-600 mb-2">Total Metrics</p>
                                <p className="text-2xl font-bold text-gray-900">{keyStats.total_metrics_analyzed}</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                <p className="text-sm text-gray-600 mb-2">Data Quality Score</p>
                                <p className="text-2xl font-bold text-gray-900">{dataQuality.quality_score ?? 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Summary Statistics Cards */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Biodiversity Summary</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {renderMetricCard(
                                'Conservation Area',
                                summaryStats.total_conservation_area,
                                <Shield className="w-6 h-6 text-green-600" />,
                                'green',
                                'hectares'
                            )}
                            {renderMetricCard(
                                'Agricultural Area',
                                summaryStats.total_agricultural_area,
                                <Tractor className="w-6 h-6 text-amber-600" />,
                                'amber',
                                'hectares'
                            )}
                            {renderMetricCard(
                                'Surveyed Area',
                                summaryStats.total_surveyed_area,
                                <MapPin className="w-6 h-6 text-blue-600" />,
                                'blue',
                                'hectares'
                            )}
                            {renderMetricCard(
                                'Trees Planted (Total)',
                                summaryStats.total_trees_planted,
                                <Trees className="w-6 h-6 text-green-600" />,
                                'green'
                            )}
                            {renderMetricCard(
                                'LPG Distributed',
                                summaryStats.total_lpg_distributed,
                                <Factory className="w-6 h-6 text-purple-600" />,
                                'purple',
                                'units'
                            )}
                            {renderMetricCard(
                                'Flora Species',
                                summaryStats.flora_species_count,
                                <Leaf className="w-6 h-6 text-emerald-600" />,
                                'emerald'
                            )}
                            {renderMetricCard(
                                'Fauna Species',
                                summaryStats.fauna_species_count,
                                <Bird className="w-6 h-6 text-indigo-600" />,
                                'indigo'
                            )}
                            {renderMetricCard(
                                'Restored Area',
                                summaryStats.total_restored_area,
                                <Sprout className="w-6 h-6 text-teal-600" />,
                                'teal',
                                'hectares'
                            )}
                            {renderMetricCard(
                                'Human‑Wildlife Conflicts',
                                summaryStats.human_wildlife_conflicts,
                                <Footprints className="w-6 h-6 text-red-600" />,
                                'red'
                            )}
                        </div>
                    </div>

                    {/* Data Quality & Verification */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <ShieldCheck className="w-6 h-6 text-green-600" />
                                Data Quality
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-gray-50">
                                    <p className="text-sm text-gray-600 mb-1">Verification Status</p>
                                    <p className="text-lg font-bold text-gray-900 capitalize">
                                        {dataQuality.verification_status.replace(/_/g, ' ')}
                                    </p>
                                </div>
                                {dataQuality.verified_by && (
                                    <div className="p-4 rounded-xl bg-gray-50">
                                        <p className="text-sm text-gray-600 mb-1">Verified By</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {dataQuality.verified_by.name || dataQuality.verified_by.email || 'Unknown'}
                                        </p>
                                    </div>
                                )}
                                {dataQuality.validation_errors.length > 0 && (
                                    <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                                        <p className="text-sm text-red-600 mb-2 flex items-center gap-1">
                                            <AlertTriangle className="w-4 h-4" />
                                            Validation Errors ({dataQuality.validation_errors.length})
                                        </p>
                                        <ul className="space-y-1">
                                            {dataQuality.validation_errors.slice(0, 3).map((err, idx) => (
                                                <li key={idx} className="text-xs text-red-700">
                                                    {err.metric_name} {err.year && `(${err.year})`}: {err.error_message}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Info className="w-6 h-6 text-blue-600" />
                                Source Information
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-gray-50">
                                    <p className="text-sm text-gray-600 mb-1">Original Source</p>
                                    <p className="text-lg font-bold text-gray-900">{sourceInfo.original_source || 'Not specified'}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-gray-50">
                                    <p className="text-sm text-gray-600 mb-1">Import Date</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {sourceInfo.import_date ? new Date(sourceInfo.import_date).toLocaleDateString() : 'Unknown'}
                                    </p>
                                </div>
                                {sourceInfo.source_files && sourceInfo.source_files.length > 0 && (
                                    <div className="p-4 rounded-xl bg-gray-50">
                                        <p className="text-sm text-gray-600 mb-2">Source Files</p>
                                        <ul className="space-y-1">
                                            {sourceInfo.source_files.map((file, idx) => (
                                                <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-gray-500" />
                                                    {file.name} ({file.year})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Biodiversity Metrics */}
            {selectedReport === 'biodiversity-metrics' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <TreePine className="w-8 h-8 text-green-600" />
                            <h3 className="text-2xl font-bold text-gray-900">Biodiversity Metrics by Category</h3>
                        </div>
                        <p className="text-gray-600 mb-8">Detailed breakdown of all biodiversity metrics tracked</p>

                        {Object.entries(metricsByCategory).map(([category, metrics]) => {
                            if (metrics.length === 0) return null;
                            const categoryLabels: Record<string, string> = {
                                agricultural_land: 'Agricultural Land',
                                conservation_protected_habitat: 'Conservation & Protected Habitat',
                                land_tenure: 'Land Tenure',
                                restoration_deforestation: 'Restoration & Deforestation',
                                fuelwood_substitution: 'Fuelwood Substitution',
                                biodiversity_flora: 'Biodiversity - Flora',
                                biodiversity_fauna: 'Biodiversity - Fauna',
                                human_wildlife_conflict: 'Human‑Wildlife Conflict',
                                summary: 'Summary Metrics',
                            };
                            const categoryIcons: Record<string, JSX.Element> = {
                                agricultural_land: <Tractor className="w-5 h-5 text-amber-600" />,
                                conservation_protected_habitat: <Shield className="w-5 h-5 text-green-600" />,
                                land_tenure: <Landmark className="w-5 h-5 text-blue-600" />,
                                restoration_deforestation: <Sprout className="w-5 h-5 text-emerald-600" />,
                                fuelwood_substitution: <Factory className="w-5 h-5 text-purple-600" />,
                                biodiversity_flora: <Leaf className="w-5 h-5 text-green-600" />,
                                biodiversity_fauna: <Bird className="w-5 h-5 text-indigo-600" />,
                                human_wildlife_conflict: <Footprints className="w-5 h-5 text-red-600" />,
                                summary: <BarChart3 className="w-5 h-5 text-gray-600" />,
                            };

                            return (
                                <div key={category} className="mb-8 border-b border-gray-200 pb-6 last:border-0">
                                    <button
                                        onClick={() => toggleSection(category)}
                                        className="flex items-center justify-between w-full text-left mb-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-gray-100">
                                                {categoryIcons[category] || <Activity className="w-5 h-5" />}
                                            </div>
                                            <h4 className="text-xl font-bold text-gray-900">
                                                {categoryLabels[category] || category.replace(/_/g, ' ')}
                                            </h4>
                                            <span className="text-sm text-gray-500">({metrics.length} metrics)</span>
                                        </div>
                                        {expandedSection === category ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                    </button>

                                    {expandedSection === category && (
                                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                                            {metrics.map((metric) => {
                                                // Get latest value for current year, fallback to most recent
                                                const latestEntry = metric.yearly_data
                                                    .sort((a, b) => b.fiscal_year - a.fiscal_year)[0];
                                                const value = latestEntry?.numeric_value ?? latestEntry?.value ?? 'N/A';
                                                const unit = latestEntry?.unit ? ` ${latestEntry.unit}` : '';
                                                return (
                                                    <div
                                                        key={metric._id}
                                                        className="p-5 rounded-2xl border border-gray-200 hover:border-green-300 cursor-pointer transition-all bg-white hover:shadow-md"
                                                        onClick={() => onMetricClick(metric, 'metric')}
                                                    >
                                                        <p className="font-semibold text-gray-900 mb-2">{metric.metric_name}</p>
                                                        <p className="text-sm text-gray-600 mb-3">{metric.description || 'No description'}</p>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs text-gray-500">Latest value:</span>
                                                            <span className="font-bold text-green-700">
                                                                {typeof value === 'number' ? formatNumber(value) : value}{unit}
                                                            </span>
                                                        </div>
                                                        {metric.yearly_data.length > 0 && (
                                                            <p className="text-xs text-gray-500 mt-2">
                                                                Data for {metric.yearly_data.length} year(s)
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ESG Frameworks Report */}
            {selectedReport === 'esg-frameworks' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">ESG Reporting Frameworks</h3>
                                <p className="text-gray-600">Frameworks and standards used for ESG reporting</p>
                            </div>
                            <BookOpen className="w-8 h-8 text-green-600" />
                        </div>

                        <div className="space-y-6">
                            {esgFrameworks.length > 0 ? (
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

                            {/* GRI References */}
                            {griRefs.length > 0 && (
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                                    <h4 className="font-bold text-lg text-gray-900 mb-4">GRI References</h4>
                                    <div className="space-y-3">
                                        {griRefs.map((ref, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{ref.standard}</p>
                                                    <p className="text-sm text-gray-600">{ref.metric_name}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${ref.compliance_status === 'compliant' ? 'bg-green-100 text-green-800' :
                                                        ref.compliance_status === 'partially_compliant' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {ref.compliance_status.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Methodology Report */}
            {selectedReport === 'methodology' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Methodology Details</h3>
                                <p className="text-gray-600">Calculation approaches and data processing workflows</p>
                            </div>
                            <Layers className="w-8 h-8 text-green-600" />
                        </div>

                        {/* Data Processing Workflow */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Data Processing Workflow</h4>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                                <p className="text-gray-800">
                                    {company.data_processing_workflow || 'Standard data processing workflow applied for biodiversity and land use analysis.'}
                                </p>
                            </div>
                        </div>

                        {/* Analytical Layer Metadata */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Analytical Layer Metadata</h4>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
                                <p className="text-gray-800">
                                    {company.analytical_layer_metadata || 'Standard analytical layers applied for environmental impact assessment.'}
                                </p>
                            </div>
                        </div>

                        {/* Data Sources */}
                        <div className="mb-8">
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Data Sources</h4>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                <div className="space-y-2">
                                    {metadata.data_sources?.length > 0 ? (
                                        metadata.data_sources.map((source, index) => (
                                            <div key={index} className="flex items-center gap-3">
                                                <Database className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                <span className="text-gray-700">{source}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-600">No specific data sources defined</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Data Completeness */}
                        <div>
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Data Completeness</h4>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                                <p className="text-gray-800 font-medium">{dataCompleteness}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Technical Data Report */}
            {selectedReport === 'technical' && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
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
                                    <p className="text-sm text-gray-600 mb-1">GEE Adapter Version</p>
                                    <p className="text-lg font-bold text-gray-900">{metadata.gee_adapter_version}</p>
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

                        {/* Audit Trail */}
                        <div>
                            <h4 className="font-bold text-lg text-gray-900 mb-4">Audit Trail</h4>
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">Created At</span>
                                        <span className="font-bold text-gray-900">{new Date(audit.created_at).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">Last Updated</span>
                                        <span className="font-bold text-gray-900">{new Date(audit.last_updated_at).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">Version</span>
                                        <span className="font-bold text-gray-900">{audit.version}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">Active</span>
                                        <span className="font-bold text-gray-900">{audit.is_active ? 'Yes' : 'No'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
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
        </div>
    );
};

export default ReportsTab;