import { useState, useRef } from "react";
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    PDFDownloadLink,
    PDFViewer,
} from '@react-pdf/renderer';
import {
    FileText,
    Download,
    Printer,
    Share2,
    Filter,
    Calendar,
    Eye,
    BarChart3,
    PieChart as PieChartIcon,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    AlertCircle,
    XCircle,
    Info,
    Shield,
    Award,
    Globe,
    Leaf,
    Droplet,
    Thermometer,
    Wind,
    Package,
    MapPin,
    Building,
    Target,
    Clock,
    DollarSign,
    Percent,
    Database,
    Cloud,
    RefreshCw,
    Search,
    Users,
    BarChart,
    LineChart,
} from "lucide-react";

// Import service functions from updated location
import {
    getYieldForecastSummary,
    getRiskAssessmentSummary,
    getEnvironmentalMetricsSummary,
    getCarbonEmissionData,
    getSatelliteIndicators,
    getConfidenceScoreBreakdown,
    getCompanyInfo,
    getMetadata,
    getSummary,
    getSeasonalAdvisory,
    getGraphData,
    getReportingPeriod,
    getNDVIIndicators,
    getCalculationFactors,
    getAllEnvironmentalMetrics,
    getAvailableCropYieldYears,
    getSatelliteDataYears,
    getMetricsByCategory,
    getMonthlyCarbonData,
    getRecommendations,
} from "../../../../services/Admin_Service/esg_apis/crop_yield_service";

// Import components
import GraphDisplay from "../soil_components/GraphDisplay";

// Color Palette
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
    water: '#3b82f6',
    carbon: '#8b5cf6',
    soil: '#d97706',
    vegetation: '#10b981',
};

interface ReportsTabProps {
    cropYieldData: any;
    selectedCompany: any;
    formatNumber: (num: number) => string;
    formatCurrency: (num: number) => string;
    formatPercent: (num: number) => string;
    getTrendIcon: (trend: string) => JSX.Element;
    selectedYear: number | null;
    availableYears: number[];
    loading: boolean;
    isRefreshing: boolean;
    onMetricClick: (metric: any, modalType: string) => void;
}

// PDF Styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 30,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        paddingBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#22c55e',
        borderBottomStyle: 'solid',
    },
    companyName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#16a34a',
        marginBottom: 5,
    },
    reportTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 10,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#16a34a',
        marginBottom: 10,
        backgroundColor: '#f0fdf4',
        padding: 8,
        borderRadius: 4,
    },
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        borderBottomStyle: 'solid',
    },
    metricLabel: {
        fontSize: 10,
        color: '#6b7280',
        flex: 2,
    },
    metricValue: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#374151',
        flex: 1,
        textAlign: 'right',
    },
    table: {
        display: 'table',
        width: 'auto',
        marginBottom: 20,
    },
    tableRow: {
        flexDirection: 'row',
    },
    tableCell: {
        padding: 8,
        fontSize: 9,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    tableHeader: {
        backgroundColor: '#f0fdf4',
        fontWeight: 'bold',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        fontSize: 8,
        color: '#9ca3af',
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        borderTopStyle: 'solid',
        paddingTop: 10,
    },
});

// PDF Report Component
const CropYieldReportPDF = ({ data }: any) => {
    const companyInfo = data.companyInfo;
    const yieldForecast = data.yieldForecast;
    const riskAssessment = data.riskAssessment;
    const environmentalMetrics = data.environmentalMetrics;
    const summary = data.summary;
    const metadata = data.metadata;
    const carbonData = data.carbonData;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.companyName}>{companyInfo?.name || "Company"}</Text>
                    <Text style={styles.reportTitle}>Crop Yield Forecast Report</Text>
                    <Text style={{ fontSize: 10, color: '#6b7280' }}>
                        Generated on: {new Date().toLocaleDateString()} |
                        API Version: {metadata?.api_version || "N/A"} |
                        Report Year: {metadata?.year_requested || "N/A"}
                    </Text>
                </View>

                {/* Executive Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Executive Summary</Text>
                    {summary?.outlook && (
                        <Text style={{ fontSize: 10, marginBottom: 8, lineHeight: 1.5 }}>
                            {summary.outlook}
                        </Text>
                    )}

                    <View style={{ marginTop: 10 }}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5 }}>
                            Key Strengths:
                        </Text>
                        {summary?.key_strengths?.map((strength: string, index: number) => (
                            <Text key={index} style={{ fontSize: 9, marginLeft: 10, marginBottom: 2 }}>
                                • {strength}
                            </Text>
                        )) || <Text style={{ fontSize: 9, color: '#9ca3af' }}>No data available</Text>}
                    </View>
                </View>

                {/* Yield Forecast Metrics */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Yield Forecast Metrics</Text>
                    <View style={styles.table}>
                        <View style={[styles.tableRow, styles.tableHeader]}>
                            <Text style={[styles.tableCell, { flex: 3 }]}>Metric</Text>
                            <Text style={[styles.tableCell, { flex: 2 }]}>Value</Text>
                            <Text style={[styles.tableCell, { flex: 2 }]}>Unit</Text>
                            <Text style={[styles.tableCell, { flex: 3 }]}>Description</Text>
                        </View>

                        {yieldForecast && (
                            <>
                                <View style={styles.tableRow}>
                                    <Text style={[styles.tableCell, { flex: 3 }]}>Forecasted Yield</Text>
                                    <Text style={[styles.tableCell, { flex: 2 }]}>{yieldForecast.forecastedYield?.toFixed(2) || "N/A"}</Text>
                                    <Text style={[styles.tableCell, { flex: 2 }]}>{yieldForecast.unit || "N/A"}</Text>
                                    <Text style={[styles.tableCell, { flex: 3 }]}>Expected crop yield for the season</Text>
                                </View>
                                <View style={styles.tableRow}>
                                    <Text style={[styles.tableCell, { flex: 3 }]}>Confidence Score</Text>
                                    <Text style={[styles.tableCell, { flex: 2 }]}>{yieldForecast.confidenceScore?.toFixed(1) || "N/A"}%</Text>
                                    <Text style={[styles.tableCell, { flex: 2 }]}>%</Text>
                                    <Text style={[styles.tableCell, { flex: 3 }]}>Model confidence in forecast</Text>
                                </View>
                                <View style={styles.tableRow}>
                                    <Text style={[styles.tableCell, { flex: 3 }]}>Industry Comparison</Text>
                                    <Text style={[styles.tableCell, { flex: 2 }]}>{yieldForecast.comparison?.percentage_difference || "N/A"}</Text>
                                    <Text style={[styles.tableCell, { flex: 2 }]}>% difference</Text>
                                    <Text style={[styles.tableCell, { flex: 3 }]}>Vs. industry average</Text>
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* Carbon Emission Accounting */}
                {carbonData && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Carbon Emission Accounting</Text>

                        {/* Framework and Methodology */}
                        <View style={{ marginBottom: 15 }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5 }}>
                                Framework & Methodology
                            </Text>
                            <Text style={{ fontSize: 9, marginBottom: 3 }}>
                                Sequestration Methodology: {carbonData.framework?.sequestration_methodology || "N/A"}
                            </Text>
                            <Text style={{ fontSize: 9, marginBottom: 3 }}>
                                Emission Methodology: {carbonData.framework?.emission_methodology || "N/A"}
                            </Text>
                            <Text style={{ fontSize: 9, marginBottom: 3 }}>
                                Calculation Approach: {carbonData.framework?.calculation_approach || "N/A"}
                            </Text>
                            <Text style={{ fontSize: 9 }}>
                                Methodology: {carbonData.methodology || "N/A"}
                            </Text>
                        </View>

                        {/* Scope Emissions Table */}
                        <View style={styles.table}>
                            <View style={[styles.tableRow, styles.tableHeader]}>
                                <Text style={[styles.tableCell, { flex: 3 }]}>Scope</Text>
                                <Text style={[styles.tableCell, { flex: 2 }]}>Total tCO2e</Text>
                                <Text style={[styles.tableCell, { flex: 2 }]}>tCO2e/ha</Text>
                                <Text style={[styles.tableCell, { flex: 3 }]}>Description</Text>
                            </View>

                            {carbonData.yearly_data?.[0]?.emissions && (
                                <>
                                    <View style={styles.tableRow}>
                                        <Text style={[styles.tableCell, { flex: 3 }]}>Scope 1</Text>
                                        <Text style={[styles.tableCell, { flex: 2 }]}>
                                            {carbonData.yearly_data[0].emissions.scope1?.total_tco2e?.toFixed(2) || "N/A"}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 2 }]}>
                                            {carbonData.yearly_data[0].emissions.scope1?.total_tco2e_per_ha?.toFixed(2) || "N/A"}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 3 }]}>Direct emissions</Text>
                                    </View>
                                    <View style={styles.tableRow}>
                                        <Text style={[styles.tableCell, { flex: 3 }]}>Scope 2</Text>
                                        <Text style={[styles.tableCell, { flex: 2 }]}>
                                            {carbonData.yearly_data[0].emissions.scope2?.total_tco2e?.toFixed(2) || "N/A"}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 2 }]}>
                                            {carbonData.yearly_data[0].emissions.scope2?.total_tco2e_per_ha?.toFixed(2) || "N/A"}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 3 }]}>Indirect energy emissions</Text>
                                    </View>
                                    <View style={styles.tableRow}>
                                        <Text style={[styles.tableCell, { flex: 3 }]}>Scope 3</Text>
                                        <Text style={[styles.tableCell, { flex: 2 }]}>
                                            {carbonData.yearly_data[0].emissions.scope3?.total_tco2e?.toFixed(2) || "N/A"}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 2 }]}>
                                            {carbonData.yearly_data[0].emissions.scope3?.total_tco2e_per_ha?.toFixed(2) || "N/A"}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 3 }]}>Other indirect emissions</Text>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>
                )}

                {/* Risk Assessment */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Risk Assessment Summary</Text>
                    <View style={styles.table}>
                        <View style={[styles.tableRow, styles.tableHeader]}>
                            <Text style={[styles.tableCell, { flex: 3 }]}>Risk Category</Text>
                            <Text style={[styles.tableCell, { flex: 2 }]}>Level</Text>
                            <Text style={[styles.tableCell, { flex: 2 }]}>Score</Text>
                            <Text style={[styles.tableCell, { flex: 3 }]}>Probability</Text>
                        </View>

                        {riskAssessment?.detailedRisks?.slice(0, 5).map((risk: any, index: number) => (
                            <View key={index} style={styles.tableRow}>
                                <Text style={[styles.tableCell, { flex: 3 }]}>{risk.category || "N/A"}</Text>
                                <Text style={[styles.tableCell, { flex: 2 }]}>{risk.level || "N/A"}</Text>
                                <Text style={[styles.tableCell, { flex: 2 }]}>{risk.score?.toFixed(1) || "N/A"}</Text>
                                <Text style={[styles.tableCell, { flex: 3 }]}>{risk.probability || "N/A"}</Text>
                            </View>
                        )) || (
                                <View style={styles.tableRow}>
                                    <Text style={[styles.tableCell, { flex: 10, textAlign: 'center', color: '#9ca3af' }]}>
                                        No risk assessment data available
                                    </Text>
                                </View>
                            )}
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Confidential Report - {companyInfo?.name || "Company"} Crop Yield Forecast</Text>
                    <Text>Page 1 of 1 • Generated by ESG Analytics Platform</Text>
                </View>
            </Page>
        </Document>
    );
};

const ReportsTab = ({
    cropYieldData,
    selectedCompany,
    formatNumber,
    formatCurrency,
    formatPercent,
    getTrendIcon,
    selectedYear,
    availableYears,
    loading,
    isRefreshing,
    onMetricClick,
}: ReportsTabProps) => {
    const [reportType, setReportType] = useState<'executive' | 'detailed' | 'compliance'>('executive');
    const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'excel'>('pdf');
    const [showPDFPreview, setShowPDFPreview] = useState(false);
    const [filteredYear, setFilteredYear] = useState<number | null>(selectedYear);
    const [searchQuery, setSearchQuery] = useState('');
    const tableRef = useRef<HTMLDivElement>(null);

    // =====================
    // DATA IMPORTS FROM API
    // =====================

    // 1) EXECUTIVE SUMMARY DATA
    const yieldForecast = cropYieldData ? getYieldForecastSummary(cropYieldData) : null;
    const riskAssessment = cropYieldData ? getRiskAssessmentSummary(cropYieldData) : null;
    const companyInfo = cropYieldData ? getCompanyInfo(cropYieldData) : null;
    const metadata = cropYieldData ? getMetadata(cropYieldData) : null;
    const summary = cropYieldData ? getSummary(cropYieldData) : null;
    const seasonalAdvisory = cropYieldData ? getSeasonalAdvisory(cropYieldData) : null;
    const confidenceScore = cropYieldData ? getConfidenceScoreBreakdown(cropYieldData) : null;

    // 2) DETAILED REPORTS DATA
    const environmentalMetrics = cropYieldData ? getEnvironmentalMetricsSummary(cropYieldData) : null;
    const carbonData = cropYieldData ? getCarbonEmissionData(cropYieldData) : null;
    const satelliteIndicators = cropYieldData ? getSatelliteIndicators(cropYieldData) : null;
    const ndviIndicators = cropYieldData ? getNDVIIndicators(cropYieldData) : null;
    const calculationFactors = cropYieldData ? getCalculationFactors(cropYieldData) : null;
    const allEnvironmentalMetrics = cropYieldData ? getAllEnvironmentalMetrics(cropYieldData) : null;
    const reportingPeriod = cropYieldData ? getReportingPeriod(cropYieldData) : null;
    const monthlyCarbonData = cropYieldData ? getMonthlyCarbonData(cropYieldData) : null;
    const recommendations = cropYieldData ? getRecommendations(cropYieldData) : null;

    // 3) COMPLIANCE DATA - Get ESG frameworks from companyInfo
    const esgFrameworks = companyInfo?.esg_frameworks || [];
    const latestReportYear = companyInfo?.latest_report_year || null;
    const dataSources = metadata?.data_sources || [];
    const calculationMethods = metadata?.calculation_methods || [];

    // =====================
    // REPORT TABLE DATA
    // =====================

    // Executive Summary Table
    const executiveSummaryTable = [
        {
            category: "Yield Performance",
            metrics: [
                {
                    label: "Forecasted Yield",
                    value: yieldForecast?.forecastedYield?.toFixed(2) || "N/A",
                    unit: yieldForecast?.unit || "N/A",
                    description: "Expected crop yield for current season",
                    trend: yieldForecast?.comparison?.status || "N/A",
                    icon: <Package className="w-4 h-4" />,
                },
                {
                    label: "Confidence Score",
                    value: yieldForecast?.confidenceScore?.toFixed(1) || "N/A",
                    unit: "%",
                    description: "Model confidence in yield forecast",
                    trend: confidenceScore?.interpretation?.split(" ")[0] || "N/A",
                    icon: <Shield className="w-4 h-4" />,
                },
                {
                    label: "Industry Comparison",
                    value: yieldForecast?.comparison?.percentage_difference || "N/A",
                    unit: "vs average",
                    description: "Performance relative to industry peers",
                    trend: yieldForecast?.comparison?.status || "N/A",
                    icon: <TrendingUp className="w-4 h-4" />,
                },
            ],
        },
        {
            category: "Risk Assessment",
            metrics: [
                {
                    label: "Overall Risk Score",
                    value: riskAssessment?.overallScore?.toFixed(1) || "N/A",
                    unit: "%",
                    description: "Aggregated risk assessment score",
                    trend: riskAssessment?.riskLevel || "N/A",
                    icon: <AlertCircle className="w-4 h-4" />,
                },
                {
                    label: "Primary Risk",
                    value: riskAssessment?.primaryRisks?.[0]?.category || "N/A",
                    unit: riskAssessment?.primaryRisks?.[0]?.level || "N/A",
                    description: "Most significant identified risk",
                    trend: riskAssessment?.probability || "N/A",
                    icon: <Info className="w-4 h-4" />,
                },
                {
                    label: "Mitigation Priority",
                    value: riskAssessment?.mitigationPriorities?.[0] || "N/A",
                    unit: "High/Med/Low",
                    description: "Top priority for risk mitigation",
                    trend: "Action Required",
                    icon: <Target className="w-4 h-4" />,
                },
            ],
        },
        {
            category: "Environmental Impact",
            metrics: [
                {
                    label: "Water Use Efficiency",
                    value: environmentalMetrics?.keyPerformanceIndicators?.water_use_efficiency?.value?.toFixed(2) || "N/A",
                    unit: environmentalMetrics?.keyPerformanceIndicators?.water_use_efficiency?.unit || "N/A",
                    description: "Water utilization efficiency score",
                    trend: environmentalMetrics?.keyPerformanceIndicators?.water_use_efficiency?.status || "N/A",
                    icon: <Droplet className="w-4 h-4" />,
                },
                {
                    label: "Carbon Intensity",
                    value: environmentalMetrics?.keyPerformanceIndicators?.carbon_intensity?.value?.toFixed(2) || "N/A",
                    unit: environmentalMetrics?.keyPerformanceIndicators?.carbon_intensity?.unit || "N/A",
                    description: "Carbon emissions per unit yield",
                    trend: environmentalMetrics?.keyPerformanceIndicators?.carbon_intensity?.status || "N/A",
                    icon: <Thermometer className="w-4 h-4" />,
                },
                {
                    label: "Soil Health Index",
                    value: environmentalMetrics?.keyPerformanceIndicators?.soil_health_index?.value?.toFixed(2) || "N/A",
                    unit: environmentalMetrics?.keyPerformanceIndicators?.soil_health_index?.unit || "N/A",
                    description: "Overall soil health assessment",
                    trend: environmentalMetrics?.keyPerformanceIndicators?.soil_health_index?.status || "N/A",
                    icon: <Leaf className="w-4 h-4" />,
                },
            ],
        },
    ];

    // Environmental Metrics Table
    const environmentalMetricsTable = allEnvironmentalMetrics ? Object.entries(allEnvironmentalMetrics).map(([metricKey, metric]: [string, any]) => ({
        parameter: metric.name,
        category: metric.category,
        value: metric.values && metric.values.length > 0 ? metric.values[metric.values.length - 1]?.value || "N/A" : "N/A",
        unit: metric.unit,
        description: metric.description,
        source: metric.values && metric.values.length > 0 ? metric.values[metric.values.length - 1]?.source_notes || "N/A" : "N/A",
    })) : [];

    // Carbon Emission Accounting Table - Scope Data
    const getScopeTableData = () => {
        if (!carbonData?.yearly_data?.[0]?.emissions) return [];

        const emissions = carbonData.yearly_data[0].emissions;
        const scopeData = [];

        // Scope 1 Sources
        if (emissions.scope1?.sources) {
            emissions.scope1.sources.forEach((source: any) => {
                scopeData.push({
                    scope: "Scope 1",
                    source: source.source,
                    parameter: source.parameter,
                    unit: source.unit,
                    annual_per_ha: source.annual_per_ha?.toFixed(2),
                    emission_factor: source.emission_factor,
                    tco2e_per_ha_per_year: source.tco2e_per_ha_per_year?.toFixed(2),
                    total_tco2e: source.total_tco2e?.toFixed(2),
                });
            });
        }

        // Scope 2 Sources
        if (emissions.scope2?.sources) {
            emissions.scope2.sources.forEach((source: any) => {
                scopeData.push({
                    scope: "Scope 2",
                    source: source.source,
                    parameter: source.parameter,
                    unit: source.unit,
                    annual_per_ha: source.annual_per_ha?.toFixed(2),
                    emission_factor: source.emission_factor,
                    tco2e_per_ha_per_year: source.tco2e_per_ha_per_year?.toFixed(2),
                    total_tco2e: source.total_tco2e?.toFixed(2),
                });
            });
        }

        // Scope 3 Categories
        if (emissions.scope3?.categories) {
            emissions.scope3.categories.forEach((category: any) => {
                scopeData.push({
                    scope: "Scope 3",
                    source: category.category,
                    parameter: category.parameter,
                    unit: category.unit,
                    annual_per_ha: category.annual_activity_per_ha?.toFixed(2),
                    emission_factor: category.emission_factor,
                    tco2e_per_ha_per_year: category.tco2e_per_ha_per_year?.toFixed(2),
                    total_tco2e: category.total_tco2e?.toFixed(2),
                });
            });
        }

        return scopeData;
    };

    // Detailed Report Metrics Table
    const detailedMetricsTable = [
        {
            section: "Environmental Metrics",
            data: environmentalMetricsTable.slice(0, 10), // Show first 10 metrics
        },
        {
            section: "Carbon Emission Accounting - Scope Breakdown",
            data: getScopeTableData(),
        },
        {
            section: "Yield Calculation Factors",
            data: calculationFactors ? Object.entries(calculationFactors).map(([key, value]) => ({
                parameter: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                value: typeof value === 'number' ? value.toFixed(2) : value,
                unit: key.includes('factor') || key.includes('efficiency') ? '%' : 'unit',
                description: `Impact factor for ${key.replace(/_/g, ' ')}`,
                impact: typeof value === 'number' && value > 0 ? 'Positive' : 'Neutral',
            })) : [],
        },
        {
            section: "NDVI Indicators",
            data: ndviIndicators ? [
                {
                    parameter: "Average NDVI",
                    value: ndviIndicators.average_ndvi?.toFixed(3) || "N/A",
                    unit: "index",
                    description: "Mean vegetation health index",
                    impact: ndviIndicators.average_ndvi > 0.6 ? "Good" : "Monitor",
                },
                {
                    parameter: "Max NDVI",
                    value: ndviIndicators.max_ndvi?.toFixed(3) || "N/A",
                    unit: "index",
                    description: "Peak vegetation health",
                    impact: "Optimal",
                },
                {
                    parameter: "Growing Season Months",
                    value: ndviIndicators.growing_season_months?.length || "N/A",
                    unit: "months",
                    description: "Active growing period",
                    impact: "Seasonal",
                },
            ] : [],
        },
    ];

    // Compliance Checklist - Updated with ESG Frameworks and Carbon Framework
    const complianceChecklist = [
        {
            requirement: "ESG Framework Compliance",
            status: esgFrameworks.length > 0 ? "Compliant" : "Not Compliant",
            details: esgFrameworks.join(", ") || "None specified",
            lastVerified: latestReportYear || "N/A",
            icon: <Award className="w-4 h-4" />,
        },
        {
            requirement: "Carbon Emission Accounting Framework",
            status: carbonData?.framework ? "Documented" : "Not Documented",
            details: carbonData?.framework ?
                `Sequestration: ${carbonData.framework.sequestration_methodology}, Emission: ${carbonData.framework.emission_methodology}` :
                "N/A",
            lastVerified: metadata?.generated_at ? new Date(metadata.generated_at).getFullYear() : "N/A",
            icon: <FileText className="w-4 h-4" />,
        },
        {
            requirement: "Carbon Emission Accounting Methodology",
            status: carbonData?.methodology ? "Documented" : "Not Documented",
            details: carbonData?.methodology || "N/A",
            lastVerified: metadata?.calculation_version || "N/A",
            icon: <Database className="w-4 h-4" />,
        },
        {
            requirement: "Data Quality & Verification",
            status: confidenceScore?.data_quality > 70 ? "Verified" : "Needs Review",
            details: `Score: ${confidenceScore?.data_quality || 0}%`,
            lastVerified: metadata?.generated_at ? new Date(metadata.generated_at).getFullYear() : "N/A",
            icon: <Database className="w-4 h-4" />,
        },
        {
            requirement: "Methodology Documentation",
            status: calculationMethods.length > 0 ? "Documented" : "Pending",
            details: calculationMethods.slice(0, 2).join(", ") || "Standard methods",
            lastVerified: metadata?.calculation_version || "N/A",
            icon: <FileText className="w-4 h-4" />,
        },
    ];

    // =====================
    // GRAPH DATA
    // =====================

    // Key Performance Indicators Graph
    const kpiGraphData = [
        {
            name: 'Yield Forecast',
            value: yieldForecast?.forecastedYield || 0,
            target: yieldForecast?.comparison?.industry_average || 0,
            unit: yieldForecast?.unit || 'tons/ha',
        },
        {
            name: 'Water Efficiency',
            value: environmentalMetrics?.keyPerformanceIndicators?.water_use_efficiency?.value || 0,
            target: environmentalMetrics?.keyPerformanceIndicators?.water_use_efficiency?.benchmark || 0,
            unit: environmentalMetrics?.keyPerformanceIndicators?.water_use_efficiency?.unit || 'kg/m³',
        },
        {
            name: 'Carbon Intensity',
            value: environmentalMetrics?.keyPerformanceIndicators?.carbon_intensity?.value || 0,
            target: environmentalMetrics?.keyPerformanceIndicators?.carbon_intensity?.benchmark || 0,
            unit: environmentalMetrics?.keyPerformanceIndicators?.carbon_intensity?.unit || 'kg CO₂e/ton',
        },
        {
            name: 'Risk Score',
            value: riskAssessment?.overallScore || 0,
            target: 30,
            unit: '%',
        },
    ];

    // Risk Distribution Graph
    const riskDistributionData = riskAssessment?.detailedRisks?.slice(0, 5).map((risk: any) => ({
        name: risk.category,
        value: risk.score,
        probability: risk.probability,
        color: risk.level === 'High' ? COLORS.danger :
            risk.level === 'Medium' ? COLORS.warning : COLORS.success,
    })) || [];

    // Carbon Emission Breakdown Graph
    const carbonEmissionData = carbonData?.yearly_data?.[0]?.emissions ? [
        {
            name: 'Scope 1',
            value: carbonData.yearly_data[0].emissions.scope1?.total_tco2e || 0,
            percentage: carbonData.summary?.composition?.scope1_percentage || 0,
            color: COLORS.danger,
        },
        {
            name: 'Scope 2',
            value: carbonData.yearly_data[0].emissions.scope2?.total_tco2e || 0,
            percentage: carbonData.summary?.composition?.scope2_percentage || 0,
            color: COLORS.warning,
        },
        {
            name: 'Scope 3',
            value: carbonData.yearly_data[0].emissions.scope3?.total_tco2e || 0,
            percentage: carbonData.summary?.composition?.scope3_percentage || 0,
            color: COLORS.info,
        },
    ] : [];

    // =====================
    // EXPORT FUNCTIONS
    // =====================

    const exportToCSV = () => {
        const csvData = [];

        // Add header
        csvData.push(['Category', 'Parameter', 'Value', 'Unit', 'Description', 'Status']);

        // Add executive summary data
        executiveSummaryTable.forEach(section => {
            section.metrics.forEach(metric => {
                csvData.push([
                    section.category,
                    metric.label,
                    metric.value,
                    metric.unit,
                    metric.description,
                    metric.trend,
                ]);
            });
        });

        // Convert to CSV string
        const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Crop_Yield_Report_${selectedCompany?.name || 'Company'}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const exportToExcel = () => {
        // In a real implementation, you would use a library like xlsx
        // For now, we'll show a message
        alert('Excel export would be implemented with xlsx library');
    };

    const printReport = () => {
        window.print();
    };

    // Prepare PDF data
    const pdfData = {
        companyInfo,
        yieldForecast,
        riskAssessment,
        environmentalMetrics,
        carbonData,
        summary,
        metadata,
        seasonalAdvisory,
        confidenceScore,
    };

    // Filter table data based on search
    const filteredExecutiveSummary = executiveSummaryTable.map(section => ({
        ...section,
        metrics: section.metrics.filter(metric =>
            metric.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            metric.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            metric.trend.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    })).filter(section => section.metrics.length > 0);

    return (
        <div className="space-y-8 pb-8">
            {/* Header */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Reports & Documentation</h2>
                        <p className="text-gray-600">
                            Generate, export, and analyze detailed crop yield reports for {selectedCompany?.name || "your company"}
                        </p>
                    </div>
                    <FileText className="w-8 h-8 text-green-600" />
                </div>

                {/* Report Type Selector */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <button
                        onClick={() => setReportType('executive')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${reportType === 'executive'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Executive Summary
                    </button>
                    <button
                        onClick={() => setReportType('detailed')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${reportType === 'detailed'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Detailed Reports
                    </button>
                    <button
                        onClick={() => setReportType('compliance')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${reportType === 'compliance'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Compliance & Documentation
                    </button>
                </div>

                {/* Export Controls */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200">
                            <Calendar className="w-4 h-4 text-gray-600" />
                            <select
                                value={filteredYear || ''}
                                onChange={(e) => setFilteredYear(e.target.value ? parseInt(e.target.value) : null)}
                                className="bg-transparent border-none focus:outline-none text-gray-900"
                            >
                                <option value="">All Years</option>
                                {availableYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search metrics..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowPDFPreview(!showPDFPreview)}
                            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-all"
                        >
                            <Eye className="w-4 h-4" />
                            Preview
                        </button>

                        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200">
                            <Download className="w-4 h-4 text-gray-600" />
                            <select
                                value={exportFormat}
                                onChange={(e) => setExportFormat(e.target.value as any)}
                                className="bg-transparent border-none focus:outline-none text-gray-900"
                            >
                                <option value="pdf">Export as PDF</option>
                                <option value="csv">Export as CSV</option>
                                <option value="excel">Export as Excel</option>
                            </select>
                        </div>

                        {exportFormat === 'pdf' && (
                            <PDFDownloadLink
                                document={<CropYieldReportPDF data={pdfData} />}
                                fileName={`Crop_Yield_Report_${selectedCompany?.name?.replace(/\s+/g, '_') || 'Company'}_${new Date().toISOString().split('T')[0]}.pdf`}
                            >
                                {({ loading }) => (
                                    <button
                                        disabled={loading}
                                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:opacity-90 transition-all"
                                    >
                                        {loading ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Download className="w-4 h-4" />
                                        )}
                                        Download PDF
                                    </button>
                                )}
                            </PDFDownloadLink>
                        )}

                        {exportFormat === 'csv' && (
                            <button
                                onClick={exportToCSV}
                                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:opacity-90 transition-all"
                            >
                                <Download className="w-4 h-4" />
                                Download CSV
                            </button>
                        )}

                        {exportFormat === 'excel' && (
                            <button
                                onClick={exportToExcel}
                                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:opacity-90 transition-all"
                            >
                                <Download className="w-4 h-4" />
                                Download Excel
                            </button>
                        )}

                        <button
                            onClick={printReport}
                            className="p-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 transition-all"
                        >
                            <Printer className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* PDF Preview Modal */}
            {showPDFPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden">
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">PDF Report Preview</h3>
                                <p className="text-gray-600">Preview of the generated report</p>
                            </div>
                            <button
                                onClick={() => setShowPDFPreview(false)}
                                className="p-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 transition-all"
                            >
                                <XCircle className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                        <div className="h-full p-4">
                            <PDFViewer width="100%" height="100%">
                                <CropYieldReportPDF data={pdfData} />
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            )}

           

            {/* Dynamic Report Table */}
            <div ref={tableRef} className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {reportType === 'executive' && 'Executive Summary Report'}
                                {reportType === 'detailed' && 'Detailed Metrics Report'}
                                {reportType === 'compliance' && 'Compliance & Documentation'}
                            </h3>
                            <p className="text-gray-600">
                                {reportType === 'executive' && 'Key findings and performance highlights'}
                                {reportType === 'detailed' && 'Comprehensive metrics and analysis'}
                                {reportType === 'compliance' && 'ESG compliance and verification status'}
                            </p>
                        </div>
                        <div className="text-sm text-gray-600">
                            Generated: {metadata?.generated_at ? new Date(metadata.generated_at).toLocaleDateString() : 'N/A'} |
                            Records: {
                                reportType === 'executive' ? filteredExecutiveSummary.reduce((acc, section) => acc + section.metrics.length, 0) :
                                    reportType === 'detailed' ? detailedMetricsTable.reduce((acc, section) => acc + section.data.length, 0) :
                                        complianceChecklist.length
                            }
                        </div>
                    </div>
                </div>

                {/* Executive Summary Table */}
                {reportType === 'executive' && (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Metric
                                    </th>
                                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Value
                                    </th>
                                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Unit
                                    </th>
                                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredExecutiveSummary.map((section, sectionIndex) => (
                                    section.metrics.map((metric, metricIndex) => (
                                        <tr
                                            key={`${sectionIndex}-${metricIndex}`}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            {metricIndex === 0 && (
                                                <td
                                                    rowSpan={section.metrics.length}
                                                    className="py-4 px-6 align-top border-r border-gray-200"
                                                >
                                                    <div className="font-medium text-gray-900">{section.category}</div>
                                                </td>
                                            )}
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1 rounded-md bg-green-50">
                                                        {metric.icon}
                                                    </div>
                                                    <span className="font-medium text-gray-900">{metric.label}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="font-bold text-gray-900">{metric.value}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-sm text-gray-600">{metric.unit}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-sm text-gray-700">{metric.description}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${metric.trend.includes('Above') || metric.trend.includes('Good')
                                                        ? 'bg-green-100 text-green-800' :
                                                        metric.trend.includes('Below') || metric.trend.includes('Poor')
                                                            ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {metric.trend}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Detailed Reports Table */}
                {reportType === 'detailed' && (
                    <div className="p-6">
                        <div className="space-y-8">
                            {detailedMetricsTable.map((section, sectionIndex) => (
                                <div key={sectionIndex} className="border border-gray-200 rounded-xl overflow-hidden">
                                    <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                        <h4 className="font-bold text-gray-900">{section.section}</h4>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    {section.section === "Environmental Metrics" && (
                                                        <>
                                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase">
                                                                Parameter
                                                            </th>
                                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase">
                                                                Category
                                                            </th>
                                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase">
                                                                Value
                                                            </th>
                                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase">
                                                                Unit
                                                            </th>
                                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase">
                                                                Description
                                                            </th>
                                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase">
                                                                Source
                                                            </th>
                                                        </>
                                                    )}
                                                    {section.section === "Carbon Emission Accounting - Scope Breakdown" && (
                                                        <>
                                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase">
                                                                Scope
                                                            </th>
                                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase">
                                                                Source/Category
                                                            </th>
                                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase">
                                                                Parameter
                                                            </th>
                                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase">
                                                                tCO₂e/ha/year
                                                            </th>
                                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase">
                                                                Total tCO₂e
                                                            </th>
                                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase">
                                                                Emission Factor
                                                            </th>
                                                        </>
                                                    )}
                                                    {section.section === "Yield Calculation Factors" && (
                                                        <>
                                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase">
                                                                Parameter
                                                            </th>
                                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase">
                                                                Value
                                                            </th>
                                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase">
                                                                Unit
                                                            </th>
                                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase">
                                                                Description
                                                            </th>
                                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase">
                                                                Impact
                                                            </th>
                                                        </>
                                                    )}
                                                    {section.section === "NDVI Indicators" && (
                                                        <>
                                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase">
                                                                Parameter
                                                            </th>
                                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase">
                                                                Value
                                                            </th>
                                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase">
                                                                Unit
                                                            </th>
                                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase">
                                                                Description
                                                            </th>
                                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase">
                                                                Impact
                                                            </th>
                                                        </>
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {section.data.map((item, itemIndex) => (
                                                    <tr key={itemIndex} className="hover:bg-gray-50">
                                                        {section.section === "Environmental Metrics" && (
                                                            <>
                                                                <td className="py-3 px-6">
                                                                    <span className="font-medium text-gray-900">{item.parameter}</span>
                                                                </td>
                                                                <td className="py-3 px-6">
                                                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                                                        {item.category}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-6">
                                                                    <span className="font-bold text-gray-900">{item.value}</span>
                                                                </td>
                                                                <td className="py-3 px-6">
                                                                    <span className="text-sm text-gray-600">{item.unit}</span>
                                                                </td>
                                                                <td className="py-3 px-6">
                                                                    <span className="text-sm text-gray-700">{item.description}</span>
                                                                </td>
                                                                <td className="py-3 px-6">
                                                                    <span className="text-sm text-gray-600">{item.source}</span>
                                                                </td>
                                                            </>
                                                        )}
                                                        {section.section === "Carbon Emission Accounting - Scope Breakdown" && (
                                                            <>
                                                                <td className="py-3 px-6">
                                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${item.scope === "Scope 1" ? "bg-red-100 text-red-800" :
                                                                            item.scope === "Scope 2" ? "bg-yellow-100 text-yellow-800" :
                                                                                "bg-blue-100 text-blue-800"
                                                                        }`}>
                                                                        {item.scope}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-6">
                                                                    <span className="font-medium text-gray-900">{item.source}</span>
                                                                </td>
                                                                <td className="py-3 px-6">
                                                                    <span className="text-sm text-gray-700">{item.parameter}</span>
                                                                </td>
                                                                <td className="py-3 px-6">
                                                                    <span className="font-bold text-gray-900">{item.tco2e_per_ha_per_year}</span>
                                                                </td>
                                                                <td className="py-3 px-6">
                                                                    <span className="font-bold text-gray-900">{item.total_tco2e}</span>
                                                                </td>
                                                                <td className="py-3 px-6">
                                                                    <span className="text-sm text-gray-600">{item.emission_factor}</span>
                                                                </td>
                                                            </>
                                                        )}
                                                        {(section.section === "Yield Calculation Factors" || section.section === "NDVI Indicators") && (
                                                            <>
                                                                <td className="py-3 px-6">
                                                                    <span className="font-medium text-gray-900">{item.parameter}</span>
                                                                </td>
                                                                <td className="py-3 px-6">
                                                                    <span className="font-bold text-gray-900">{item.value}</span>
                                                                </td>
                                                                <td className="py-3 px-6">
                                                                    <span className="text-sm text-gray-600">{item.unit}</span>
                                                                </td>
                                                                <td className="py-3 px-6">
                                                                    <span className="text-sm text-gray-700">{item.description}</span>
                                                                </td>
                                                                <td className="py-3 px-6">
                                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.impact === 'Positive' || item.impact === 'Good'
                                                                            ? 'bg-green-100 text-green-800' :
                                                                            item.impact === 'Negative' || item.impact === 'Poor'
                                                                                ? 'bg-red-100 text-red-800' :
                                                                                'bg-yellow-100 text-yellow-800'
                                                                        }`}>
                                                                        {item.impact}
                                                                    </span>
                                                                </td>
                                                            </>
                                                        )}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Compliance Table */}
                {reportType === 'compliance' && (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase">
                                        Requirement
                                    </th>
                                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase">
                                        Status
                                    </th>
                                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase">
                                        Details
                                    </th>
                                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase">
                                        Last Verified
                                    </th>
                                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {complianceChecklist.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-green-50">
                                                    {item.icon}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{item.requirement}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === 'Compliant' || item.status === 'Verified' || item.status === 'Documented' || item.status === 'Adequate'
                                                    ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-sm text-gray-700 max-w-xs">{item.details}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-sm text-gray-700">{item.lastVerified}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <button className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium transition-colors">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Table Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Data Source: {metadata?.endpoint || 'Crop Yield Forecast API'} |
                            Version: {metadata?.calculation_version || 'N/A'} |
                            Generated: {metadata?.generated_at ? new Date(metadata.generated_at).toLocaleString() : 'N/A'}
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => tableRef.current && tableRef.current.scrollIntoView({ behavior: 'smooth' })}
                                className="text-sm text-green-600 hover:text-green-700 font-medium"
                            >
                                <RefreshCw className="w-4 h-4 inline mr-1" />
                                Refresh Data
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                            >
                                <Printer className="w-4 h-4 inline mr-1" />
                                Print Table
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border border-green-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-green-100">
                            <Award className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">ESG Frameworks</h4>
                            <p className="text-sm text-gray-600">Compliance frameworks</p>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-green-700 mb-2">
                        {esgFrameworks.length}
                    </div>
                    <p className="text-sm text-gray-600">
                        {esgFrameworks.slice(0, 2).join(', ')}
                        {esgFrameworks.length > 2 ? ` +${esgFrameworks.length - 2} more` : ''}
                    </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl border border-blue-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-blue-100">
                            <Database className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">Environmental Metrics</h4>
                            <p className="text-sm text-gray-600">Tracked parameters</p>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-blue-700 mb-2">
                        {environmentalMetricsTable.length}
                    </div>
                    <p className="text-sm text-gray-600">
                        Across {new Set(environmentalMetricsTable.map(m => m.category)).size} categories
                    </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border border-purple-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-purple-100">
                            <Thermometer className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">Carbon Accounting</h4>
                            <p className="text-sm text-gray-600">Scope emissions data</p>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-purple-700 mb-2">
                        {getScopeTableData().length}
                    </div>
                    <p className="text-sm text-gray-600">
                        Sources & categories across all scopes
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ReportsTab;