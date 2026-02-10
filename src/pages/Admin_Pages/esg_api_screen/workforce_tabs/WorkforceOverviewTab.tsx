import React, { useState, useMemo, useEffect } from 'react';
import {
    Users,
    UserCog,
    Target,
    Award,
    GraduationCap,
    Shield,
    Heart,
    Globe,
    MapPin,
    Download,
    Share2,
    Info,
    PieChart as PieChartIcon,
    LineChart as LineChartIcon,
    BarChart as BarChartIcon,
    Radar,
    Activity,
    CheckCircle,
    X,
    ChevronRight,
    Calculator,
    Building,
    TrendingUp,
    TrendingDown,
    BarChart3,
    Users2,
    UserPlus,
    UserMinus,
    BookOpen,
    Briefcase,
    DollarSign,
    Clock,
    AlertCircle,
} from 'lucide-react';

// Import chart components
import {
    ResponsiveContainer,
    LineChart as RechartsLineChart,
    Line,
    BarChart as RechartsBarChart,
    Bar,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    RadarChart,
    Radar as RechartsRadar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    Legend as RechartsLegend,
    ScatterChart,
    Scatter,
} from 'recharts';

// Import map components
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Color Palette (matched to Waste OverviewTab)
const PRIMARY_GREEN = '#22c55e';
const SECONDARY_GREEN = '#16a34a';
const LIGHT_GREEN = '#86efac';
const DARK_GREEN = '#15803d';
const EMERALD = '#10b981';
const LIME = '#84cc16';
const BACKGROUND_GRAY = '#f9fafb';

// Create DESIGN_SYSTEM with the exact green colors
const DESIGN_SYSTEM = {
    primary: {
        main: PRIMARY_GREEN,
        light: LIGHT_GREEN,
        dark: DARK_GREEN,
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
    },
    secondary: {
        main: SECONDARY_GREEN,
        light: LIME,
        dark: DARK_GREEN,
        50: '#f7fee7',
        100: '#ecfccb',
    },
    variants: {
        emerald: EMERALD,
        lime: LIME,
        lightGreen: LIGHT_GREEN,
        background: BACKGROUND_GRAY,
    },
    status: {
        success: PRIMARY_GREEN,
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
    },
    context: {
        male: '#3b82f6',        // Blue for male
        female: '#ec4899',      // Pink for female
        permanent: PRIMARY_GREEN,  // Green for permanent
        fixedTerm: '#f59e0b',    // Orange for fixed term
        leadership: DARK_GREEN,   // Dark green for leadership
        payEquity: EMERALD,      // Emerald for pay equity
        retention: LIME,         // Lime for retention
        inclusion: '#8b5cf6',    // Purple for inclusion
    },
    charts: {
        primary: [PRIMARY_GREEN, EMERALD, LIGHT_GREEN, '#4ade80', '#86efac'],
        secondary: [SECONDARY_GREEN, DARK_GREEN, LIME, '#a3e635', '#d9f99d'],
        gender: ['#3b82f6', '#ec4899', '#8b5cf6', '#f59e0b', '#10b981'],
        contract: [PRIMARY_GREEN, '#f59e0b', '#3b82f6', '#ef4444', '#06b6d4'],
    },
    neutral: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
    }
};

interface GraphDisplayProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    onClick?: () => void;
    onInfoClick?: () => void;
}

const GraphDisplay: React.FC<GraphDisplayProps> = ({ title, description, icon, children, onClick, onInfoClick }) => {
    return (
        <div
            className="bg-white rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
            style={{ borderColor: DESIGN_SYSTEM.neutral[200] }}
            onClick={onClick}
        >
            <div className="p-4 border-b" style={{
                borderColor: DESIGN_SYSTEM.neutral[200],
                background: DESIGN_SYSTEM.variants.background
            }}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
                        <p className="text-sm text-gray-600">{description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {onInfoClick && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onInfoClick();
                                }}
                                className="p-2 rounded-lg hover:bg-green-100 transition-all"
                                style={{ color: DESIGN_SYSTEM.primary.main }}
                            >
                                <Info className="w-5 h-5" />
                            </button>
                        )}
                        {icon}
                    </div>
                </div>
            </div>
            <div className="p-4 h-80">{children}</div>
        </div>
    );
};

interface OverviewTabProps {
    workforceData: any;
    selectedCompany: any;
    formatNumber: (num: number | null) => string;
    formatCurrency: (num: number | null) => string;
    formatPercent: (num: number | null) => string;
    getTrendIcon: (trend: string) => React.ReactNode;
    selectedYear: number | null;
    availableYears: number[];
    loading: boolean;
    isRefreshing: boolean;
    onMetricClick: (metric: any, modalType: string) => void;
    onCalculationClick: (calculationType: string, data?: any) => void;
    coordinates?: any[];
    areaName?: string;
    areaCovered?: string;
    colors?: {
        primary: string;
        secondary: string;
        lightGreen: string;
        darkGreen: string;
        emerald: string;
        lime: string;
        background: string;
    };
    summaryMetrics?: any;
}

const WorkforceOverviewTab: React.FC<OverviewTabProps> = ({
    workforceData,
    selectedCompany,
    formatNumber,
    formatCurrency,
    formatPercent,
    getTrendIcon,
    onMetricClick,
    onCalculationClick,
    coordinates = [],
    areaName = "Workforce Area",
    areaCovered = "N/A",
    colors,
}) => {
    const [selectedGraph, setSelectedGraph] = useState<any>(null);
    const [selectedMetric, setSelectedMetric] = useState<any>(null);
    const [showMetricModal, setShowMetricModal] = useState(false);

    // Use provided colors or default to DESIGN_SYSTEM
    const currentColors = colors || {
        primary: PRIMARY_GREEN,
        secondary: SECONDARY_GREEN,
        lightGreen: LIGHT_GREEN,
        darkGreen: DARK_GREEN,
        emerald: EMERALD,
        lime: LIME,
        background: BACKGROUND_GRAY,
    };

    // Get API data from workforceData
    const apiData = workforceData?.data;

    // Extract performance indicators
    const performanceIndicators = useMemo(() => {
        if (!apiData?.workforce_summary?.performance_indicators) return null;
        return apiData.workforce_summary.performance_indicators;
    }, [apiData]);

    // Extract workforce composition
    const workforceComposition = useMemo(() => {
        if (!apiData?.workforce_composition) return null;
        return apiData.workforce_composition;
    }, [apiData]);

    // Extract inclusion and belonging data
    const inclusionAndBelonging = useMemo(() => {
        if (!apiData?.inclusion_and_belonging) return null;
        return apiData.inclusion_and_belonging;
    }, [apiData]);

    // Extract company info
    const companyInfo = useMemo(() => {
        if (!apiData?.company) return null;
        return apiData.company;
    }, [apiData]);

    // Extract social metrics
    const socialMetrics = useMemo(() => {
        if (!apiData?.social_metrics) return null;
        return apiData.social_metrics;
    }, [apiData]);

    // Extract key indicators
    const keyIndicators = useMemo(() => {
        if (!apiData?.key_indicators) return null;
        return apiData.key_indicators;
    }, [apiData]);

    // Extract recommendations
    const recommendations = useMemo(() => {
        if (!apiData?.recommendations) return null;
        return apiData.recommendations;
    }, [apiData]);

    // Extract graphs data
    const graphsData = useMemo(() => {
        if (!apiData?.graphs) return null;
        return apiData.graphs;
    }, [apiData]);

    // Get reporting year
    const reportingYear = apiData?.year_data?.requested_year || new Date().getFullYear();

    // Calculate workforce metrics from social metrics
    const workforceMetrics = useMemo(() => {
        if (!socialMetrics?.metrics) return null;

        const metrics = socialMetrics.metrics;

        // Get workforce-related metrics
        const totalEmployees = metrics["Human Capital - Total Employees"]?.values?.[0]?.numeric_value || 0;
        const femaleEmployees = metrics["Human Capital - Female Employees"]?.values?.[0]?.numeric_value || 0;
        const maleEmployees = metrics["Human Capital - Male Employees"]?.values?.[0]?.numeric_value || 0;
        const permanentEmployees = metrics["Human Capital - Employees by Contract Type - Permanent"]?.values?.[0]?.numeric_value || 0;
        const fixedTermEmployees = metrics["Human Capital - Employees by Contract Type - Fixed term contract"]?.values?.[0]?.numeric_value || 0;
        const graduateTrainees = metrics["Human Capital - Graduate Trainees"]?.values?.[0]?.numeric_value || 0;
        const apprentices = metrics["Human Capital - Apprentices"]?.values?.[0]?.numeric_value || 0;

        // Recruitment data
        const recruitmentMale = metrics["Diversity - Recruitment by gender including Seasonal FTCs"]?.values?.[0]?.numeric_value || 0;
        const recruitmentFemale = metrics["Diversity - Recruitment by gender including Seasonal FTCs"]?.values?.[1]?.numeric_value || 0;

        // Turnover data
        const turnoverMale = metrics["Diversity - Turnover by gender"]?.values?.[0]?.numeric_value || 0;
        const turnoverFemale = metrics["Diversity - Turnover by gender"]?.values?.[1]?.numeric_value || 0;

        // Training data
        const trainingMale = metrics["Employees' Education and Training - Average training hours by gender"]?.values?.[0]?.numeric_value || 0;
        const trainingFemale = metrics["Employees' Education and Training - Average training hours by gender"]?.values?.[1]?.numeric_value || 0;

        // Safety data
        const sheMeetingsAgriculture = metrics["Safety, Health, and Environment Committee Meetings"]?.values?.[0]?.numeric_value || 0;
        const sheMeetingsManufacturing = metrics["Safety, Health, and Environment Committee Meetings"]?.values?.[1]?.numeric_value || 0;
        const injuryRate = metrics["Work-related Injuries - Lost Time Injury Frequency Rate"]?.values?.[0]?.numeric_value || 0;

        // Calculate percentages and rates
        const genderDiversity = totalEmployees > 0 ? (femaleEmployees / totalEmployees) * 100 : 0;
        const permanentPercentage = totalEmployees > 0 ? (permanentEmployees / totalEmployees) * 100 : 0;
        const fixedTermPercentage = totalEmployees > 0 ? (fixedTermEmployees / totalEmployees) * 100 : 0;
        const turnoverRate = totalEmployees > 0 ? ((turnoverMale + turnoverFemale) / totalEmployees) * 100 : 0;

        return {
            totalEmployees,
            femaleEmployees,
            maleEmployees,
            permanentEmployees,
            fixedTermEmployees,
            graduateTrainees,
            apprentices,
            recruitmentMale,
            recruitmentFemale,
            turnoverMale,
            turnoverFemale,
            trainingMale,
            trainingFemale,
            sheMeetingsAgriculture,
            sheMeetingsManufacturing,
            injuryRate,
            genderDiversity,
            permanentPercentage,
            fixedTermPercentage,
            turnoverRate,
        };
    }, [socialMetrics]);

    // Get area of interest from selected company
    const companyAreaOfInterest = selectedCompany?.area_of_interest_metadata || apiData?.company?.area_of_interest_metadata;
    const finalCoordinates = companyAreaOfInterest?.coordinates || coordinates;
    const companyAreaName = companyAreaOfInterest?.name || areaName;
    const companyAreaCovered = companyAreaOfInterest?.area_covered || areaCovered;

    // Calculate map center based on coordinates
    const mapCenter = useMemo(() => {
        if (finalCoordinates.length === 0) return [0, 0];
        if (finalCoordinates.length === 1) return [finalCoordinates[0].lat, finalCoordinates[0].lon];

        // Calculate center for polygon
        const sum = finalCoordinates.reduce(
            (acc: any, coord: any) => {
                acc.lat += coord.lat;
                acc.lon += coord.lon;
                return acc;
            },
            { lat: 0, lon: 0 }
        );

        return [sum.lat / finalCoordinates.length, sum.lon / finalCoordinates.length];
    }, [finalCoordinates]);

    // Prepare chart data from API graphs
    const chartData = useMemo(() => {
        if (!graphsData) return null;

        // Workforce Trend (Line Chart)
        const workforceTrendData = graphsData.workforce_trend?.labels?.map((label: string, index: number) => ({
            year: label,
            total: graphsData.workforce_trend.datasets[0]?.data[index] || 0,
            female: graphsData.workforce_trend.datasets[1]?.data[index] || 0,
            diversity: graphsData.workforce_trend.datasets[2]?.data[index] || 0,
        })) || [];

        // Gender Distribution (Pie Chart)
        const genderDistributionData = [
            { name: 'Male', value: workforceComposition?.gender_distribution?.male?.count || 0, color: DESIGN_SYSTEM.context.male },
            { name: 'Female', value: workforceComposition?.gender_distribution?.female?.count || 0, color: DESIGN_SYSTEM.context.female },
        ];

        // Employment Types (Bar Chart)
        const employmentTypesData = [
            { type: 'Permanent', count: workforceComposition?.contract_types?.permanent?.count || 0, color: DESIGN_SYSTEM.context.permanent },
            { type: 'Fixed Term', count: workforceComposition?.contract_types?.fixed_term?.count || 0, color: DESIGN_SYSTEM.context.fixedTerm },
            { type: 'Graduate Trainees', count: workforceComposition?.contract_types?.trainees?.count || 0, color: DESIGN_SYSTEM.charts.primary[2] },
            { type: 'Apprentices', count: 1, color: DESIGN_SYSTEM.charts.primary[3] }, // Hardcoded from data
        ];

        // Inclusion Radar (Radar Chart)
        const inclusionRadarData = inclusionAndBelonging?.metrics ? [
            { subject: 'Gender Diversity', value: parseFloat(performanceIndicators?.gender_diversity?.value.toString()) || 0, fullMark: 100 },
            { subject: 'Leadership Diversity', value: inclusionAndBelonging.metrics.leadership_diversity.value || 0, fullMark: 100 },
            { subject: 'Pay Equity', value: inclusionAndBelonging.metrics.pay_equity.value || 0, fullMark: 100 },
            { subject: 'Employee Engagement', value: performanceIndicators?.engagement_score?.value || 0, fullMark: 100 },
            { subject: 'Retention Rate', value: inclusionAndBelonging.metrics.retention_rate.value || 0, fullMark: 100 },
            { subject: 'Inclusion Score', value: inclusionAndBelonging.metrics.inclusion_score.value || 0, fullMark: 100 },
        ] : [];

        return {
            workforceTrendData,
            genderDistributionData,
            employmentTypesData,
            inclusionRadarData,
        };
    }, [graphsData, workforceComposition, inclusionAndBelonging, performanceIndicators]);

    // Prepare detailed metric cards for workforce
    const detailedMetricCards = [
        {
            title: "Total Employees",
            value: workforceMetrics?.totalEmployees || 0,
            unit: "people",
            icon: <Users className="w-5 h-5" />,
            color: DESIGN_SYSTEM.primary.main,
            description: "Total workforce size including all contract types",
            metricName: "Human Capital - Total Employees"
        },
        {
            title: "Female Employees",
            value: workforceMetrics?.femaleEmployees || 0,
            unit: "people",
            icon: <Users2 className="w-5 h-5" />,
            color: DESIGN_SYSTEM.context.female,
            description: "Number of female employees in the workforce",
            metricName: "Human Capital - Female Employees"
        },
        {
            title: "Gender Diversity",
            value: workforceMetrics?.genderDiversity || 0,
            unit: "%",
            icon: <UserCog className="w-5 h-5" />,
            color: DESIGN_SYSTEM.primary.main,
            description: "Percentage of female employees in the workforce",
            metricName: "Calculated: (Female Employees / Total Employees) * 100"
        },
        {
            title: "Permanent Employees",
            value: workforceMetrics?.permanentEmployees || 0,
            unit: "people",
            icon: <Briefcase className="w-5 h-5" />,
            color: DESIGN_SYSTEM.context.permanent,
            description: "Employees with permanent employment contracts",
            metricName: "Human Capital - Employees by Contract Type - Permanent"
        },
        {
            title: "Fixed Term Employees",
            value: workforceMetrics?.fixedTermEmployees || 0,
            unit: "people",
            icon: <Clock className="w-5 h-5" />,
            color: DESIGN_SYSTEM.context.fixedTerm,
            description: "Employees with fixed-term or seasonal contracts",
            metricName: "Human Capital - Employees by Contract Type - Fixed term contract"
        },
        {
            title: "Leadership Diversity",
            value: inclusionAndBelonging?.metrics?.leadership_diversity?.value || 0,
            unit: "%",
            icon: <Award className="w-5 h-5" />,
            color: DESIGN_SYSTEM.context.leadership,
            description: "Percentage of leadership positions held by women",
            metricName: "Inclusion - Leadership Diversity"
        },
        {
            title: "Training Hours (Male)",
            value: workforceMetrics?.trainingMale || 0,
            unit: "hours",
            icon: <GraduationCap className="w-5 h-5" />,
            color: DESIGN_SYSTEM.context.male,
            description: "Average training hours completed by male employees",
            metricName: "Employees' Education and Training - Average training hours by gender (Male)"
        },
        {
            title: "Turnover Rate",
            value: workforceMetrics?.turnoverRate || 0,
            unit: "%",
            icon: <UserMinus className="w-5 h-5" />,
            color: DESIGN_SYSTEM.status.danger,
            description: "Percentage of employees who left the company",
            metricName: "Calculated: ((Male Turnover + Female Turnover) / Total Employees) * 100"
        }
    ];

    // Custom Tooltip Component
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-xl shadow-lg border" style={{ borderColor: DESIGN_SYSTEM.neutral[200] }}>
                    <p className="font-semibold mb-2" style={{ color: DESIGN_SYSTEM.neutral[800] }}>{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {typeof entry.value === 'number' ? formatNumber(entry.value) : entry.value}
                            {entry.dataKey === 'diversity' ? '%' : ''}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Define graphs using API data
    const graphs = [
        {
            id: 'workforce-trend',
            title: graphsData?.workforce_trend?.title || 'Workforce Growth & Diversity Trend',
            description: graphsData?.workforce_trend?.description || 'Tracking workforce growth and gender diversity over the years',
            icon: <LineChartIcon className="w-5 h-5" style={{ color: currentColors.primary }} />,
            component: chartData?.workforceTrendData ? (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={chartData.workforceTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DESIGN_SYSTEM.neutral[200]} />
                        <XAxis dataKey="year" stroke={DESIGN_SYSTEM.neutral[400]} />
                        <YAxis stroke={DESIGN_SYSTEM.neutral[400]} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <RechartsLegend />
                        <Line
                            type="monotone"
                            dataKey="total"
                            stroke={DESIGN_SYSTEM.context.male}
                            name="Total Employees"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="female"
                            stroke={DESIGN_SYSTEM.context.female}
                            name="Female Employees"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="diversity"
                            stroke={DESIGN_SYSTEM.primary.main}
                            name="Gender Diversity %"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                    </RechartsLineChart>
                </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full">No data available</div>,
            info: 'Shows the trend of total employees, female employees, and gender diversity percentage over time'
        },
        {
            id: 'gender-distribution',
            title: graphsData?.gender_distribution?.title || 'Gender Distribution',
            description: graphsData?.gender_distribution?.description || 'Current gender composition of our workforce',
            icon: <PieChartIcon className="w-5 h-5" style={{ color: currentColors.primary }} />,
            component: chartData?.genderDistributionData ? (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                        <Pie
                            data={chartData.genderDistributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            stroke="#fff"
                            strokeWidth={2}
                        >
                            {chartData.genderDistributionData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                        <RechartsLegend />
                    </RechartsPieChart>
                </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full">No data available</div>,
            info: 'Shows the breakdown of workforce by gender (male vs female)'
        },
        {
            id: 'employment-types',
            title: graphsData?.employment_types?.title || 'Employment Types',
            description: graphsData?.employment_types?.description || 'Breakdown of workforce by contract type',
            icon: <BarChartIcon className="w-5 h-5" style={{ color: currentColors.primary }} />,
            component: chartData?.employmentTypesData ? (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={chartData.employmentTypesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DESIGN_SYSTEM.neutral[200]} />
                        <XAxis dataKey="type" stroke={DESIGN_SYSTEM.neutral[400]} />
                        <YAxis stroke={DESIGN_SYSTEM.neutral[400]} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                            {chartData.employmentTypesData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </RechartsBarChart>
                </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full">No data available</div>,
            info: 'Shows the distribution of employees by contract type (permanent, fixed-term, trainees, apprentices)'
        },
        {
            id: 'inclusion-radar',
            title: graphsData?.inclusion_radar?.title || 'Inclusion & Belonging Metrics',
            description: graphsData?.inclusion_radar?.description || 'Comprehensive view of our inclusion performance',
            icon: <Radar className="w-5 h-5" style={{ color: currentColors.primary }} />,
            component: chartData?.inclusionRadarData ? (
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={90} data={chartData.inclusionRadarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <RechartsRadar
                            name="Our Performance"
                            dataKey="value"
                            stroke={DESIGN_SYSTEM.primary.main}
                            fill={DESIGN_SYSTEM.primary.main}
                            fillOpacity={0.6}
                        />
                        <RechartsTooltip />
                        <RechartsLegend />
                    </RadarChart>
                </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full">No data available</div>,
            info: 'Shows key inclusion metrics on a radar chart for easy comparison'
        }
    ];

    const handleMetricClick = (metric: any, title: string) => {
        setSelectedMetric({ ...metric, title });
        setShowMetricModal(true);
        onMetricClick(metric, 'workforce-metric');
    };

    if (!apiData) {
        return (
            <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4" style={{ color: DESIGN_SYSTEM.neutral[300] }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: DESIGN_SYSTEM.neutral[700] }}>No Workforce Diversity Data Available</h3>
                <p style={{ color: DESIGN_SYSTEM.neutral[500] }}>Select a company to view workforce diversity and inclusion data</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">
            {/* Company Details Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200" style={{ background: currentColors.background }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm">
                                <Building className="w-5 h-5" style={{ color: currentColors.primary }} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-0.5">
                                    {selectedCompany?.name || companyInfo?.name || "Company"}
                                </h2>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-100 text-green-800 font-medium">
                                        {selectedCompany?.industry || companyInfo?.industry || "Agriculture & Sugar Production"}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 font-medium">
                                        {selectedCompany?.country || companyInfo?.country || "Zimbabwe"}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-medium">
                                        {reportingYear}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-orange-100 text-orange-800 font-medium">
                                        Employees: {formatNumber(workforceMetrics?.totalEmployees || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-600 mb-0.5">Gender Diversity</p>
                            <p className="font-medium text-xs" style={{ color: currentColors.primary }}>
                                {performanceIndicators?.gender_diversity?.value || "18.1"}%
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Reporting Period</p>
                            <p className="font-bold text-sm text-gray-900">{reportingYear}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Total Workforce</p>
                            <p className="font-bold text-sm text-gray-900">
                                {formatNumber(workforceMetrics?.totalEmployees || 0)} employees
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Social Metrics</p>
                            <p className="font-bold text-sm text-gray-900">
                                {socialMetrics?.total_metrics || 16}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Data Quality</p>
                            <p className="font-bold text-sm" style={{ color: currentColors.primary }}>
                                {apiData.data_quality?.total_metrics || "16 metrics"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div
                className="relative overflow-hidden rounded-2xl p-5 shadow-2xl"
                style={{
                    background: `linear-gradient(to right, ${currentColors.darkGreen}, ${currentColors.primary})`
                }}
            >
                <div
                    className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                ></div>
                <div
                    className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                ></div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="text-xl font-bold mb-1 text-white">Workforce Diversity & Inclusion Dashboard</h2>
                            <p className="text-emerald-50 text-sm">Comprehensive workforce analytics, diversity tracking, and inclusion metrics</p>
                        </div>
                        <button
                            onClick={() => onCalculationClick("overview")}
                            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 text-white text-xs"
                        >
                            <Calculator className="w-3.5 h-3.5" />
                            How Calculated?
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Total Employees Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClick(performanceIndicators?.total_employees, 'Total Employees')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Users className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Total Employees</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {formatNumber(parseInt(performanceIndicators?.total_employees?.value?.toString() || "0"))}
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                {getTrendIcon(performanceIndicators?.total_employees?.trend || 'stable')}
                                {performanceIndicators?.total_employees?.trend || 'Trend'}
                            </span>
                        </div>

                        {/* Gender Diversity Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClick(performanceIndicators?.gender_diversity, 'Gender Diversity')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <UserCog className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Gender Diversity</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {performanceIndicators?.gender_diversity?.value || "18.1"}%
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                {getTrendIcon(performanceIndicators?.gender_diversity?.trend || 'stable')}
                                Target: {performanceIndicators?.gender_diversity?.target || '40%'}
                            </span>
                        </div>

                        {/* Training Hours Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClick(performanceIndicators?.training_hours, 'Training Hours')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <GraduationCap className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Training Hours</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {formatNumber(parseInt(performanceIndicators?.training_hours?.value?.toString() || "0"))}
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                {getTrendIcon(performanceIndicators?.training_hours?.trend || 'improving')}
                                Avg: {workforceComposition?.training_summary?.average_per_employee || '0.0'} hrs/emp
                            </span>
                        </div>

                        {/* Engagement Score Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClick(performanceIndicators?.engagement_score, 'Engagement Score')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Heart className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Engagement Score</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {performanceIndicators?.engagement_score?.value || 0}/100
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                {getTrendIcon(performanceIndicators?.engagement_score?.trend || 'stable')}
                                Target: {performanceIndicators?.engagement_score?.target || '85'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            {finalCoordinates.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200" style={{ background: currentColors.background }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Company Operations Area</h3>
                                <p className="text-gray-600 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" style={{ color: currentColors.primary }} />
                                    {companyAreaName}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 transition-all">
                                    <Share2 className="w-5 h-5 text-gray-600" />
                                </button>
                                <button className="p-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 transition-all">
                                    <Download className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="h-96">
                        <MapContainer
                            center={mapCenter}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                            className="leaflet-container z-0"
                        >
                            <TileLayer
                                attribution='&copy; OpenStreetMap contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {finalCoordinates.length === 1 ? (
                                <Marker position={[finalCoordinates[0].lat, finalCoordinates[0].lon]}>
                                    <Popup>
                                        <div className="p-2">
                                            <h3 className="font-bold mb-2" style={{ color: currentColors.primary }}>{companyAreaName}</h3>
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Area:</span> {companyAreaCovered}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Total Employees:</span> {formatNumber(workforceMetrics?.totalEmployees || 0)}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Gender Diversity:</span> {performanceIndicators?.gender_diversity?.value || "18.1"}%
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Industry:</span> {selectedCompany?.industry || companyInfo?.industry}
                                                </p>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ) : (
                                <Polygon
                                    pathOptions={{
                                        fillColor: currentColors.primary,
                                        color: currentColors.primary,
                                        fillOpacity: 0.3,
                                        weight: 2
                                    }}
                                    positions={finalCoordinates.map((coord: any) => [coord.lat, coord.lon])}
                                >
                                    <Popup>
                                        <div className="p-2">
                                            <h3 className="font-bold mb-2" style={{ color: currentColors.primary }}>{companyAreaName}</h3>
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Area:</span> {companyAreaCovered}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Coordinates:</span> {finalCoordinates.length} points
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Total Employees:</span> {formatNumber(workforceMetrics?.totalEmployees || 0)}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Gender Diversity:</span> {performanceIndicators?.gender_diversity?.value || "18.1"}%
                                                </p>
                                            </div>
                                        </div>
                                    </Popup>
                                </Polygon>
                            )}
                        </MapContainer>
                    </div>
                    <div className="p-6 grid grid-cols-2 gap-4 bg-gray-50">
                        <div className="p-4 rounded-xl bg-white border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                                <Globe className="w-4 h-4" style={{ color: currentColors.primary }} />
                                Area Covered
                            </p>
                            <p className="font-bold text-lg text-gray-900">{companyAreaCovered}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                                <Target className="w-4 h-4" style={{ color: currentColors.primary }} />
                                Workforce Size
                            </p>
                            <p className="font-bold text-lg text-gray-900">{formatNumber(workforceMetrics?.totalEmployees || 0)} employees</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Key Workforce Metrics Cards */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold" style={{ color: currentColors.primary }}>
                        Key Workforce Metrics
                    </h3>
                    <BarChart3 className="w-5 h-5" style={{ color: DESIGN_SYSTEM.neutral[500] }} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {detailedMetricCards.map((card, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-xl border border-gray-200 hover:border-green-300 transition-all cursor-pointer"
                            style={{
                                background: `linear-gradient(135deg, ${DESIGN_SYSTEM.neutral[50]} 0%, ${DESIGN_SYSTEM.neutral[100]} 100%)`
                            }}
                            onClick={() => handleMetricClick(card, card.title)}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: `${card.color}20` }}>
                                    {React.cloneElement(card.icon, { style: { color: card.color } })}
                                </div>
                                <h4 className="font-bold text-lg text-gray-900">{card.title}</h4>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold mb-2" style={{ color: card.color }}>
                                    {typeof card.value === 'number' ? formatNumber(card.value) : card.value}
                                    <span className="text-lg">{card.unit}</span>
                                </div>
                                <p className="text-sm text-gray-600 truncate" title={card.description}>
                                    {card.description.length > 30 ? card.description.substring(0, 30) + '...' : card.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {graphs.map((graph) => (
                    <GraphDisplay
                        key={graph.id}
                        title={graph.title}
                        description={graph.description}
                        icon={graph.icon}
                        onClick={() => setSelectedGraph(graph)}
                        onInfoClick={() => onCalculationClick(graph.id, { description: graph.info })}
                    >
                        {graph.component}
                    </GraphDisplay>
                ))}
            </div>

            {/* Key Statistics Summary */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold" style={{ color: currentColors.primary }}>
                        Workforce Performance Indicators
                    </h3>
                    <Activity className="w-5 h-5" style={{ color: DESIGN_SYSTEM.neutral[500] }} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.context.male }}>
                            {formatNumber(workforceMetrics?.maleEmployees || 0)}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Male Employees
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.context.female }}>
                            {formatNumber(workforceMetrics?.femaleEmployees || 0)}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Female Employees
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.context.permanent }}>
                            {formatPercent(workforceMetrics?.permanentPercentage || 0)}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Permanent Employees
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.context.fixedTerm }}>
                            {formatPercent(workforceMetrics?.fixedTermPercentage || 0)}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Fixed-Term Employees
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.context.inclusion }}>
                            {inclusionAndBelonging?.metrics?.inclusion_score?.value || 78}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Inclusion Score /100
                        </p>
                    </div>
                </div>
            </div>

            {/* Inclusion & Key Indicators Section */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Inclusion Metrics & Key Workforce Indicators</h3>
                        <p className="text-gray-600">Inclusion performance and workforce indicators for {reportingYear}</p>
                    </div>
                    <Target className="w-8 h-8" style={{ color: currentColors.primary }} />
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Inclusion Metrics */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Heart className="w-5 h-5" style={{ color: DESIGN_SYSTEM.context.inclusion }} />
                            Inclusion & Belonging Metrics
                        </h4>
                        <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                            {inclusionAndBelonging?.metrics && Object.entries(inclusionAndBelonging.metrics).map(([key, metric]: [string, any]) => (
                                <div key={key} className="p-4 rounded-xl border border-gray-200 hover:border-green-200 transition-all">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="font-semibold text-gray-900">{metric.label}</p>
                                            <p className="text-sm text-gray-600">{metric.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xl font-bold" style={{ color: currentColors.primary }}>
                                                {metric.value}{metric.unit}
                                            </span>
                                            {metric.target && (
                                                <p className="text-xs text-gray-500 mt-1">Target: {metric.target}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full transition-all duration-500"
                                            style={{
                                                width: `${metric.value}%`,
                                                backgroundColor: metric.value >= 80
                                                    ? currentColors.primary
                                                    : metric.value >= 60
                                                        ? DESIGN_SYSTEM.status.warning
                                                        : DESIGN_SYSTEM.status.danger
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

 <div>
    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Award className="w-5 h-5" style={{ color: currentColors.primary }} />
        Key Workforce Indicators
    </h4>
    <div className="space-y-6">
        {keyIndicators && Array.isArray(keyIndicators) && keyIndicators.length > 0 ? (
            keyIndicators.slice(0, 4).map((indicator: any, index: number) => (
                <div key={index} className="p-4 rounded-xl border border-gray-200 hover:border-blue-200 transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{indicator.name}</span>
                        <span className={`text-sm px-2 py-1 rounded-full ${indicator.trend === 'improving'
                                ? 'bg-green-50 text-green-600'
                                : indicator.trend === 'stable'
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'bg-yellow-50 text-yellow-600'
                            }`}>
                            {getTrendIcon(indicator.trend)}
                            {indicator.trend}
                        </span>
                    </div>
                    <div className="text-center mb-2">
                        <span className="text-2xl font-bold" style={{ color: currentColors.darkGreen }}>
                            {indicator.value}
                        </span>
                        <span className="text-sm text-gray-600 ml-1">{indicator.unit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{indicator.description}</span>
                        <span className="text-gray-500">Industry: {indicator.industry_average}</span>
                    </div>
                </div>
            ))
        ) : (
            <div className="text-center py-8 text-gray-500">
                <p>No key indicators data available</p>
                <p className="text-sm mt-2">Key workforce indicators will appear here once data is loaded</p>
            </div>
        )}
    </div>
</div>
                </div>
            </div>

            {/* Recommendations Section */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Improvement Recommendations</h3>
                        <p className="text-gray-600">Actionable insights to enhance workforce diversity and inclusion</p>
                    </div>
                    <Target className="w-8 h-8" style={{ color: currentColors.primary }} />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations?.slice(0, 3).map((rec: any, index: number) => (
                        <div key={index} className={`p-6 rounded-2xl border ${rec.priority === 'High'
                            ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
                            : rec.priority === 'Medium'
                                ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
                                : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                            }`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-3 rounded-xl ${rec.priority === 'High'
                                    ? 'bg-red-100'
                                    : rec.priority === 'Medium'
                                        ? 'bg-yellow-100'
                                        : 'bg-green-100'
                                    }`}>
                                    <Target className="w-6 h-6" style={{
                                        color: rec.priority === 'High'
                                            ? DESIGN_SYSTEM.status.danger
                                            : rec.priority === 'Medium'
                                                ? DESIGN_SYSTEM.status.warning
                                                : currentColors.primary
                                    }} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900">{rec.action}</h4>
                                    <span className={`text-xs px-2 py-1 rounded-full ${rec.priority === 'High'
                                        ? 'bg-red-100 text-red-600'
                                        : rec.priority === 'Medium'
                                            ? 'bg-yellow-100 text-yellow-600'
                                            : 'bg-green-100 text-green-600'
                                        }`}>
                                        {rec.priority} Priority
                                    </span>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-4">{rec.impact}</p>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Timeline: {rec.timeline}</span>
                                <span className="text-gray-500">{rec.metrics_affected?.length || 0} metrics affected</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Notes Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border p-6" style={{ borderColor: currentColors.lightGreen }}>
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-100">
                        <Info className="w-5 h-5" style={{ color: currentColors.primary }} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold mb-2" style={{ color: currentColors.darkGreen }}>
                            Workforce Diversity & Inclusion Notes
                        </h4>
                        <div className="space-y-2">
                            <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                <span className="font-semibold">Data Source:</span> HVE Integrated Report 2025
                            </p>
                            <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                <span className="font-semibold">Reporting Framework:</span> {companyInfo?.esg_reporting_framework?.join(', ') || 'IFRS S1 and S2, GRI, UNSDG'}
                            </p>
                            <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                <span className="font-semibold">ESG Contact:</span> {companyInfo?.esg_contact_person?.name || 'ESG & Sustainability Office'} ({companyInfo?.esg_contact_person?.email || 'info@tongaat.co.zw'})
                            </p>
                            <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                <span className="font-semibold">Purpose:</span> Track workforce composition, diversity metrics, and inclusion efforts to build a more equitable workplace.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Graph Modal */}
            {selectedGraph && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setSelectedGraph(null)}
                >
                    <div
                        className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-200" style={{ background: currentColors.background }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                                        {selectedGraph.title}
                                    </h3>
                                    <p className="text-gray-600">{selectedGraph.description}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 transition-all">
                                        <Download className="w-5 h-5 text-gray-600" />
                                    </button>
                                    <button
                                        onClick={() => setSelectedGraph(null)}
                                        className="p-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 transition-all"
                                    >
                                        <X className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="h-[500px]">{selectedGraph.component}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Metric Detail Modal */}
            {showMetricModal && selectedMetric && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowMetricModal(false)}
                >
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                        <div
                            className="p-6 border-b border-gray-200 text-white rounded-t-3xl"
                            style={{
                                background: `linear-gradient(to right, ${currentColors.primary}, ${currentColors.emerald})`
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold mb-1">{selectedMetric.title}</h3>
                                    <p className="text-emerald-50">Detailed metric information</p>
                                </div>
                                <button
                                    onClick={() => setShowMetricModal(false)}
                                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="mb-8">
                                <div className="text-center">
                                    <div className="text-6xl font-bold" style={{ color: currentColors.primary }}>
                                        {typeof selectedMetric.value === 'number'
                                            ? formatNumber(selectedMetric.value)
                                            : selectedMetric.value}
                                    </div>
                                    {selectedMetric.unit && (
                                        <div className="text-xl" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                                            {selectedMetric.unit}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div
                                    className="p-4 rounded-xl border"
                                    style={{
                                        backgroundColor: `${currentColors.primary}10`,
                                        borderColor: `${currentColors.primary}30`
                                    }}
                                >
                                    <div className="flex items-center gap-2" style={{ color: currentColors.darkGreen }}>
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-semibold">Current Status</span>
                                    </div>
                                    <p className="mt-2" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                        This metric shows the current state of {selectedMetric.title.toLowerCase()} for {reportingYear}.
                                    </p>
                                </div>
                                {selectedMetric.description && (
                                    <div
                                        className="p-4 rounded-xl border"
                                        style={{
                                            backgroundColor: `${DESIGN_SYSTEM.status.info}10`,
                                            borderColor: `${DESIGN_SYSTEM.status.info}30`
                                        }}
                                    >
                                        <div className="flex items-center gap-2" style={{ color: DESIGN_SYSTEM.status.info }}>
                                            <Info className="w-5 h-5" />
                                            <span className="font-semibold">What This Means</span>
                                        </div>
                                        <p className="mt-2" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                            {selectedMetric.description}
                                        </p>
                                    </div>
                                )}
                                {selectedMetric.metricName && (
                                    <div
                                        className="p-4 rounded-xl border"
                                        style={{
                                            backgroundColor: `${DESIGN_SYSTEM.neutral[100]}`,
                                            borderColor: `${DESIGN_SYSTEM.neutral[200]}`
                                        }}
                                    >
                                        <div className="flex items-center gap-2" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                            <BookOpen className="w-5 h-5" />
                                            <span className="font-semibold">How It's Measured</span>
                                        </div>
                                        <p className="mt-2 text-sm" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                                            {selectedMetric.metricName}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkforceOverviewTab;