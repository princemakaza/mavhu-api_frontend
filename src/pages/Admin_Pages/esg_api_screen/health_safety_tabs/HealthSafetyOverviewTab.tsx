import React, { useState, useMemo, useEffect } from 'react';
import {
    Shield,
    AlertTriangle,
    Hospital,
    Ambulance,
    Target,
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
    Settings,
    ArrowRight,
    Building,
    Flame,
    BarChart3,
    TrendingUp,
    TrendingDown,
    Zap,
    Cloud,
    Package,
    Cpu,
    Archive,
    Users,
    Heart,
    HardHat,
    AlertCircle,
    Clock,
    Award,
    ShieldCheck,
    Activity as ActivityIcon,
    Target as TargetIcon,
    Eye,
    Bell,
    FileText,
    CheckCircle2,
    XCircle,
    AlertOctagon,
    Thermometer,
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

// Color Palette (same as Waste OverviewTab)
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
        injuryRate: '#ef4444',
        safetyMeetings: '#3b82f6',
        totalInjuries: '#dc2626',
        safetyTraining: '#10b981',
        fatalities: '#7c2d12',
        lostTime: '#f59e0b',
        nearMisses: '#8b5cf6',
        ppeCompliance: '#22c55e',
        wellness: '#ec4899',
        medical: '#06b6d4',
    },
    charts: {
        primary: [PRIMARY_GREEN, EMERALD, LIGHT_GREEN, '#4ade80', '#86efac'],
        secondary: [SECONDARY_GREEN, DARK_GREEN, LIME, '#a3e635', '#d9f99d'],
        safety: [PRIMARY_GREEN, '#3b82f6', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899', '#84cc16'],
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
    healthSafetyData: any;
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

const HealthSafetyOverviewTab: React.FC<OverviewTabProps> = ({
    healthSafetyData,
    selectedCompany,
    formatNumber,
    formatCurrency,
    formatPercent,
    getTrendIcon,
    onMetricClick,
    onCalculationClick,
    coordinates = [],
    areaName = "Health & Safety Area",
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

    // Get API data from healthSafetyData
    const apiData = healthSafetyData?.data;

    // Extract health safety summary
    const healthSafetySummary = useMemo(() => {
        if (!apiData?.health_safety_summary) return null;
        return apiData.health_safety_summary;
    }, [apiData]);

    // Extract incident data
    const incidentData = useMemo(() => {
        if (!apiData?.incident_data) return null;
        return apiData.incident_data;
    }, [apiData]);

    // Extract safety committees
    const safetyCommittees = useMemo(() => {
        if (!apiData?.safety_committees) return null;
        return apiData.safety_committees;
    }, [apiData]);

    // Extract worker health data
    const workerHealth = useMemo(() => {
        if (!apiData?.worker_health) return null;
        return apiData.worker_health;
    }, [apiData]);

    // Extract company info
    const companyInfo = useMemo(() => {
        if (!apiData?.company) return null;
        return apiData.company;
    }, [apiData]);

    // Extract safety initiatives
    const safetyInitiatives = useMemo(() => {
        if (!apiData?.safety_initiatives) return null;
        return apiData.safety_initiatives;
    }, [apiData]);

    // Extract safety benchmarks
    const safetyBenchmarks = useMemo(() => {
        if (!apiData?.safety_benchmarks) return null;
        return apiData.safety_benchmarks;
    }, [apiData]);

    // Extract social metrics
    const socialMetrics = useMemo(() => {
        if (!apiData?.social_metrics) return null;
        return apiData.social_metrics;
    }, [apiData]);

    // Extract graphs data
    const graphsData = useMemo(() => {
        if (!apiData?.graphs) return null;
        return apiData.graphs;
    }, [apiData]);

    // Get reporting year
    const reportingYear = apiData?.year_data?.requested_year || new Date().getFullYear();

    // Calculate safety metrics from social metrics
    const safetyMetrics = useMemo(() => {
        if (!socialMetrics?.metrics) return null;

        const metrics = socialMetrics.metrics;

        // Get safety-related metrics
        const totalEmployees = metrics["Human Capital - Total Employees"]?.values?.[0]?.numeric_value || 0;
        const maleEmployees = metrics["Human Capital - Male Employees"]?.values?.[0]?.numeric_value || 0;
        const femaleEmployees = metrics["Human Capital - Female Employees"]?.values?.[0]?.numeric_value || 0;
        const safetyCommitteeMeetings = metrics["Safety, Health, and Environment Committee Meetings"]?.values || [];
        const ltifr = metrics["Work-related Injuries - Lost Time Injury Frequency Rate"]?.values?.[0]?.numeric_value || 0;
        const trainingHoursMale = metrics["Employees’ Education and Training - Average training hours by gender"]?.values?.[0]?.numeric_value || 0;
        const trainingHoursFemale = metrics["Employees’ Education and Training - Average training hours by gender"]?.values?.[1]?.numeric_value || 0;

        // Calculate totals and percentages
        const agricultureMeetings = safetyCommitteeMeetings[0]?.numeric_value || 0;
        const millingMeetings = safetyCommitteeMeetings[1]?.numeric_value || 0;
        const totalMeetings = agricultureMeetings + millingMeetings;
        const avgTrainingHours = totalEmployees > 0 ? ((trainingHoursMale * maleEmployees) + (trainingHoursFemale * femaleEmployees)) / totalEmployees : 0;
        const safetyCultureScore = healthSafetySummary?.safety_snapshot?.safety_culture_score || 0;
        const daysWithoutInjury = healthSafetySummary?.safety_snapshot?.days_since_last_lost_time_injury || 0;
        const ppeCompliance = workerHealth?.protective_equipment?.ppe_compliance || 0;

        return {
            totalEmployees,
            maleEmployees,
            femaleEmployees,
            agricultureMeetings,
            millingMeetings,
            totalMeetings,
            ltifr,
            trainingHoursMale,
            trainingHoursFemale,
            avgTrainingHours,
            safetyCultureScore,
            daysWithoutInjury,
            ppeCompliance,
        };
    }, [socialMetrics, healthSafetySummary, workerHealth]);

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

        // Injury Rate Trend (Line Chart)
        const injuryTrendData = graphsData.injury_rate_trend?.labels?.map((label: string | number, index: number) => ({
            year: label,
            ourRate: graphsData.injury_rate_trend.datasets[0]?.data[index] || 0,
            industryAverage: graphsData.injury_rate_trend.datasets[1]?.data[index] || 0,
            target: graphsData.injury_rate_trend.datasets[2]?.data[index] || 0,
        })) || [];

        // Incident Types Breakdown (Pie Chart)
        const incidentBreakdownData = graphsData.incident_types_breakdown?.labels?.map((label: string, index: number) => ({
            name: label,
            value: graphsData.incident_types_breakdown.datasets[0]?.data[index] || 0,
            color: graphsData.incident_types_breakdown.datasets[0]?.backgroundColor[index] || DESIGN_SYSTEM.charts.safety[index],
        })) || [];

        // Safety Activities by Department (Bar Chart)
        const safetyActivitiesData = graphsData.safety_activities_by_department?.labels?.map((label: string, index: number) => ({
            department: label,
            meetings: graphsData.safety_activities_by_department.datasets[0]?.data[index] || 0,
            observations: graphsData.safety_activities_by_department.datasets[1]?.data[index] || 0,
            training: graphsData.safety_activities_by_department.datasets[2]?.data[index] || 0,
        })) || [];

        // Safety Performance Areas (Radar Chart Data)
        const safetyPerformanceData = graphsData.safety_performance_areas?.labels?.map((label: string, index: number) => ({
            area: label,
            ourPerformance: graphsData.safety_performance_areas.datasets[0]?.data[index] || 0,
            industryBenchmark: graphsData.safety_performance_areas.datasets[1]?.data[index] || 0,
        })) || [];

        return {
            injuryTrendData,
            incidentBreakdownData,
            safetyActivitiesData,
            safetyPerformanceData,
        };
    }, [graphsData]);

    // Prepare detailed metric cards
    const detailedMetricCards = [
        {
            title: "Injury Rate (LTIFR)",
            value: healthSafetySummary?.performance_indicators?.injury_rate?.value || 0,
            unit: "per 200k hours",
            icon: <AlertTriangle className="w-5 h-5" />,
            color: DESIGN_SYSTEM.context.injuryRate,
            description: "Lost Time Injury Frequency Rate",
            metricName: "Work-related Injuries - Lost Time Injury Frequency Rate"
        },
        {
            title: "Safety Meetings",
            value: healthSafetySummary?.performance_indicators?.safety_meetings?.value || 0,
            unit: "meetings",
            icon: <Users className="w-5 h-5" />,
            color: DESIGN_SYSTEM.context.safetyMeetings,
            description: "Safety committee meetings held",
            metricName: "Safety, Health, and Environment Committee Meetings"
        },
        {
            title: "Total Injuries",
            value: incidentData?.total_recordable_injuries?.count || 0,
            unit: "",
            icon: <Ambulance className="w-5 h-5" />,
            color: DESIGN_SYSTEM.context.totalInjuries,
            description: "All work-related injuries requiring medical treatment",
            metricName: "Total Recordable Injuries"
        },
        {
            title: "Safety Training",
            value: healthSafetySummary?.performance_indicators?.safety_training?.value || 0,
            unit: "hours",
            icon: <Hospital className="w-5 h-5" />,
            color: DESIGN_SYSTEM.context.safetyTraining,
            description: "Total safety training hours completed",
            metricName: "Safety Training Hours"
        },
        {
            title: "PPE Compliance",
            value: workerHealth?.protective_equipment?.ppe_compliance || 0,
            unit: "%",
            icon: <HardHat className="w-5 h-5" />,
            color: DESIGN_SYSTEM.context.ppeCompliance,
            description: "Personal Protective Equipment compliance rate",
            metricName: "PPE Compliance Rate"
        },
        {
            title: "Safety Culture Score",
            value: healthSafetySummary?.safety_snapshot?.safety_culture_score || 0,
            unit: "",
            icon: <ShieldCheck className="w-5 h-5" />,
            color: currentColors.primary,
            description: "Overall safety culture assessment score",
            metricName: "Safety Culture Score"
        },
        {
            title: "Days Injury-Free",
            value: healthSafetySummary?.safety_snapshot?.days_since_last_lost_time_injury || 0,
            unit: "days",
            icon: <Clock className="w-5 h-5" />,
            color: DESIGN_SYSTEM.context.safetyTraining,
            description: "Days since last lost time injury",
            metricName: "Days Without Lost Time Injury"
        },
        {
            title: "First Aid Certified",
            value: workerHealth?.medical_services?.first_aid_certified_staff || 0,
            unit: "staff",
            icon: <Hospital className="w-5 h-5" />,
            color: DESIGN_SYSTEM.context.medical,
            description: "Number of first aid certified staff members",
            metricName: "First Aid Certified Staff"
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
            id: 'injury-trend',
            title: graphsData?.injury_rate_trend?.title || 'Injury Rate Trend',
            description: graphsData?.injury_rate_trend?.description || 'Tracking injury rate improvement over time',
            icon: <LineChartIcon className="w-5 h-5" style={{ color: currentColors.primary }} />,
            component: chartData?.injuryTrendData ? (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={chartData.injuryTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DESIGN_SYSTEM.neutral[200]} />
                        <XAxis dataKey="year" stroke={DESIGN_SYSTEM.neutral[400]} />
                        <YAxis stroke={DESIGN_SYSTEM.neutral[400]} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <RechartsLegend />
                        <Line
                            type="monotone"
                            dataKey="ourRate"
                            stroke={DESIGN_SYSTEM.context.injuryRate}
                            name="Our Injury Rate"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="industryAverage"
                            stroke={DESIGN_SYSTEM.neutral[400]}
                            name="Industry Average"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            strokeDasharray="5 5"
                        />
                        <Line
                            type="monotone"
                            dataKey="target"
                            stroke={currentColors.primary}
                            name="Our Target"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                    </RechartsLineChart>
                </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full">No data available</div>,
            info: 'Shows injury rate trend compared to industry average and our targets'
        },
        {
            id: 'incident-breakdown',
            title: graphsData?.incident_types_breakdown?.title || 'Incident Types Breakdown',
            description: graphsData?.incident_types_breakdown?.description || 'Types of safety incidents we experience',
            icon: <PieChartIcon className="w-5 h-5" style={{ color: currentColors.primary }} />,
            component: chartData?.incidentBreakdownData ? (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                        <Pie
                            data={chartData.incidentBreakdownData}
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
                            {chartData.incidentBreakdownData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                        <RechartsLegend />
                    </RechartsPieChart>
                </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full">No data available</div>,
            info: 'Shows breakdown of incident types to identify focus areas'
        },
        {
            id: 'safety-activities',
            title: graphsData?.safety_activities_by_department?.title || 'Safety Activities by Department',
            description: graphsData?.safety_activities_by_department?.description || 'Safety activities across different teams',
            icon: <BarChartIcon className="w-5 h-5" style={{ color: currentColors.primary }} />,
            component: chartData?.safetyActivitiesData ? (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={chartData.safetyActivitiesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DESIGN_SYSTEM.neutral[200]} />
                        <XAxis dataKey="department" stroke={DESIGN_SYSTEM.neutral[400]} />
                        <YAxis stroke={DESIGN_SYSTEM.neutral[400]} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <RechartsLegend />
                        <Bar
                            dataKey="meetings"
                            name="Safety Meetings"
                            radius={[8, 8, 0, 0]}
                            fill={DESIGN_SYSTEM.context.safetyMeetings}
                        />
                        <Bar
                            dataKey="observations"
                            name="Safety Observations"
                            radius={[8, 8, 0, 0]}
                            fill={DESIGN_SYSTEM.context.safetyTraining}
                        />
                        <Bar
                            dataKey="training"
                            name="Training Hours"
                            radius={[8, 8, 0, 0]}
                            fill={currentColors.primary}
                        />
                    </RechartsBarChart>
                </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full">No data available</div>,
            info: 'Shows safety activities across departments to identify engagement levels'
        },
        {
            id: 'safety-performance',
            title: graphsData?.safety_performance_areas?.title || 'Safety Performance Areas',
            description: graphsData?.safety_performance_areas?.description || 'Performance across different safety areas',
            icon: <Radar className="w-5 h-5" style={{ color: currentColors.primary }} />,
            component: chartData?.safetyPerformanceData ? (
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData.safetyPerformanceData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="area" />
                        <PolarRadiusAxis />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <RechartsRadar
                            name="Our Performance"
                            dataKey="ourPerformance"
                            stroke={currentColors.primary}
                            fill={currentColors.primary}
                            fillOpacity={0.2}
                        />
                        <RechartsRadar
                            name="Industry Benchmark"
                            dataKey="industryBenchmark"
                            stroke={DESIGN_SYSTEM.neutral[400]}
                            fill="none"
                            strokeDasharray="5 5"
                        />
                        <RechartsLegend />
                    </RadarChart>
                </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full">No data available</div>,
            info: 'Shows performance across safety areas compared to industry benchmarks'
        },
        {
            id: 'safety-initiatives',
            title: 'Safety Initiatives Impact',
            description: 'Impact of safety programs and initiatives',
            icon: <Target className="w-5 h-5" style={{ color: currentColors.primary }} />,
            component: safetyInitiatives?.active_programs ? (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                        data={safetyInitiatives.active_programs.map((program: any) => ({
                            name: program.name.length > 15 ? program.name.substring(0, 15) + '...' : program.name,
                            impact: program.impact?.includes('%') ? parseInt(program.impact.match(/\d+/)?.[0] || '0') : 0,
                            participants: program.participants || 0,
                        }))}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke={DESIGN_SYSTEM.neutral[200]} />
                        <XAxis dataKey="name" stroke={DESIGN_SYSTEM.neutral[400]} />
                        <YAxis stroke={DESIGN_SYSTEM.neutral[400]} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <RechartsLegend />
                        <Bar
                            dataKey="impact"
                            name="Impact %"
                            radius={[8, 8, 0, 0]}
                            fill={currentColors.primary}
                        />
                        <Bar
                            dataKey="participants"
                            name="Participants"
                            radius={[8, 8, 0, 0]}
                            fill={DESIGN_SYSTEM.context.safetyTraining}
                        />
                    </RechartsBarChart>
                </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full">No data available</div>,
            info: 'Shows impact and participation in safety initiatives'
        }
    ];

    const handleMetricClick = (metric: any, title: string) => {
        setSelectedMetric({ ...metric, title });
        setShowMetricModal(true);
        onMetricClick(metric, 'health-safety-metric');
    };

    if (!apiData) {
        return (
            <div className="text-center py-12">
                <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: DESIGN_SYSTEM.neutral[300] }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: DESIGN_SYSTEM.neutral[700] }}>No Health & Safety Data Available</h3>
                <p style={{ color: DESIGN_SYSTEM.neutral[500] }}>Select a company to view health and safety data</p>
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
                                <Shield className="w-5 h-5" style={{ color: currentColors.primary }} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-0.5">
                                    {selectedCompany?.name || companyInfo?.name || "Company"}
                                </h2>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-100 text-green-800 font-medium">
                                        {selectedCompany?.industry || companyInfo?.industry || "Health & Safety"}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 font-medium">
                                        {selectedCompany?.country || companyInfo?.country || "Country"}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-medium">
                                        {reportingYear}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-orange-100 text-orange-800 font-medium">
                                        Safety Goal: {healthSafetySummary?.safety_snapshot?.safety_goal || "Zero Harm"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-600 mb-0.5">Safety Culture Score</p>
                            <p className="font-medium text-xs" style={{ color: currentColors.primary }}>
                                {healthSafetySummary?.safety_snapshot?.safety_culture_score || "0"}
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
                            <p className="text-[10px] text-gray-600 mb-0.5">Total Employees</p>
                            <p className="font-bold text-sm text-gray-900">
                                {formatNumber(safetyMetrics?.totalEmployees)}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Safety Metrics</p>
                            <p className="font-bold text-sm text-gray-900">
                                {socialMetrics?.total_metrics || 0}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Audit Result</p>
                            <p className="font-bold text-sm" style={{ color: currentColors.primary }}>
                                {healthSafetySummary?.safety_snapshot?.audit_result || "N/A"}
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
                            <h2 className="text-xl font-bold mb-1 text-white">Health & Safety Dashboard</h2>
                            <p className="text-emerald-50 text-sm">Ensuring worker safety, health protection, and compliance monitoring</p>
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
                        {/* Injury Rate Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClick(healthSafetySummary?.performance_indicators?.injury_rate, 'Injury Rate')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <AlertTriangle className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Injury Rate (LTIFR)</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {healthSafetySummary?.performance_indicators?.injury_rate?.value || "0"}
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                {getTrendIcon(healthSafetySummary?.performance_indicators?.injury_rate?.trend || 'stable')}
                                {healthSafetySummary?.performance_indicators?.injury_rate?.trend || 'Trend'}
                            </span>
                        </div>

                        {/* Days Injury-Free Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClick(healthSafetySummary?.safety_snapshot, 'Days Without Injury')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Clock className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Days Injury-Free</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {formatNumber(healthSafetySummary?.safety_snapshot?.days_since_last_lost_time_injury || 0)}
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                {healthSafetySummary?.safety_snapshot?.days_since_last_lost_time_injury > 100 ? 'Excellent' : 'Good'}
                            </span>
                        </div>

                        {/* Safety Culture Score Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClick(healthSafetySummary?.safety_snapshot, 'Safety Culture Score')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Safety Culture</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {healthSafetySummary?.safety_snapshot?.safety_culture_score || "0"}
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                {healthSafetySummary?.safety_snapshot?.safety_culture_score > 80 ? 'Strong' : 'Needs Improvement'}
                            </span>
                        </div>

                        {/* PPE Compliance Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClick(workerHealth?.protective_equipment, 'PPE Compliance')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <HardHat className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">PPE Compliance</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {formatNumber(workerHealth?.protective_equipment?.ppe_compliance || 0)}%
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                {getTrendIcon('improving')}
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
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Safety Monitoring Area</h3>
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
                                                    <span className="font-semibold">Injury Rate:</span> {healthSafetySummary?.performance_indicators?.injury_rate?.value || "0"}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Safety Score:</span> {healthSafetySummary?.safety_snapshot?.safety_culture_score || "0"}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Total Employees:</span> {formatNumber(safetyMetrics?.totalEmployees)}
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
                                                    <span className="font-semibold">Injury Rate:</span> {healthSafetySummary?.performance_indicators?.injury_rate?.value || "0"}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Safety Score:</span> {healthSafetySummary?.safety_snapshot?.safety_culture_score || "0"}
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
                                Safety Coverage Area
                            </p>
                            <p className="font-bold text-lg text-gray-900">{companyAreaCovered}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                                <Target className="w-4 h-4" style={{ color: currentColors.primary }} />
                                Safety Monitoring Points
                            </p>
                            <p className="font-bold text-lg text-gray-900">{finalCoordinates.length} {finalCoordinates.length === 1 ? 'point' : 'points'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Key Safety Metrics Cards */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold" style={{ color: currentColors.primary }}>
                        Key Health & Safety Metrics
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

            {/* Graphs Grid - 5 Graphs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {graphs.slice(0, 4).map((graph) => (
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

            {/* 5th Graph - Safety Initiatives Impact */}
            <div className="grid grid-cols-1">
                <GraphDisplay
                    key="safety-initiatives"
                    title="Safety Initiatives Impact"
                    description="Impact of safety programs and initiatives"
                    icon={<Target className="w-5 h-5" style={{ color: currentColors.primary }} />}
                    onClick={() => setSelectedGraph(graphs[4])}
                    onInfoClick={() => onCalculationClick(graphs[4].id, { description: graphs[4].info })}
                >
                    {graphs[4].component}
                </GraphDisplay>
            </div>

            {/* Key Statistics Summary */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold" style={{ color: currentColors.primary }}>
                        Safety Performance Indicators
                    </h3>
                    <ActivityIcon className="w-5 h-5" style={{ color: DESIGN_SYSTEM.neutral[500] }} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.context.injuryRate }}>
                            {incidentData?.fatalities?.count || 0}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Fatalities
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.context.lostTime }}>
                            {incidentData?.lost_time_injuries?.count || 0}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Lost Time Injuries
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.context.nearMisses }}>
                            {incidentData?.near_misses?.count || 0}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Near Misses
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.context.medical }}>
                            {workerHealth?.medical_services?.first_aid_certified_staff || 0}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            First Aid Certified
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: currentColors.secondary }}>
                            {safetyMetrics?.totalMeetings || 0}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Safety Meetings
                        </p>
                    </div>
                </div>
            </div>

            {/* Incidents & Safety Initiatives Section */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Safety Incidents & Initiatives</h3>
                        <p className="text-gray-600">Incident tracking and safety initiatives progress for {reportingYear}</p>
                    </div>
                    <Shield className="w-8 h-8" style={{ color: currentColors.primary }} />
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Incident Severity Breakdown */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <AlertOctagon className="w-5 h-5" style={{ color: DESIGN_SYSTEM.context.injuryRate }} />
                            Incident Severity Breakdown
                        </h4>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold" style={{ color: DESIGN_SYSTEM.context.injuryRate }}>Serious Injuries</span>
                                    <span className="text-sm font-bold">{incidentData?.total_recordable_injuries?.severity_breakdown?.serious || 0}</span>
                                </div>
                                <div className="w-full bg-red-100 rounded-full h-3">
                                    <div
                                        className="h-3 rounded-full"
                                        style={{
                                            width: `${((incidentData?.total_recordable_injuries?.severity_breakdown?.serious || 0) /
                                                Math.max(1, (incidentData?.total_recordable_injuries?.severity_breakdown?.minor || 0) +
                                                    (incidentData?.total_recordable_injuries?.severity_breakdown?.moderate || 0) +
                                                    (incidentData?.total_recordable_injuries?.severity_breakdown?.serious || 0))) * 100}%`,
                                            backgroundColor: DESIGN_SYSTEM.context.injuryRate
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold" style={{ color: DESIGN_SYSTEM.context.lostTime }}>Moderate Injuries</span>
                                    <span className="text-sm font-bold">{incidentData?.total_recordable_injuries?.severity_breakdown?.moderate || 0}</span>
                                </div>
                                <div className="w-full bg-yellow-100 rounded-full h-3">
                                    <div
                                        className="h-3 rounded-full"
                                        style={{
                                            width: `${((incidentData?.total_recordable_injuries?.severity_breakdown?.moderate || 0) /
                                                Math.max(1, (incidentData?.total_recordable_injuries?.severity_breakdown?.minor || 0) +
                                                    (incidentData?.total_recordable_injuries?.severity_breakdown?.moderate || 0) +
                                                    (incidentData?.total_recordable_injuries?.severity_breakdown?.serious || 0))) * 100}%`,
                                            backgroundColor: DESIGN_SYSTEM.context.lostTime
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold" style={{ color: DESIGN_SYSTEM.context.safetyTraining }}>Minor Injuries</span>
                                    <span className="text-sm font-bold">{incidentData?.total_recordable_injuries?.severity_breakdown?.minor || 0}</span>
                                </div>
                                <div className="w-full bg-green-100 rounded-full h-3">
                                    <div
                                        className="h-3 rounded-full"
                                        style={{
                                            width: `${((incidentData?.total_recordable_injuries?.severity_breakdown?.minor || 0) /
                                                Math.max(1, (incidentData?.total_recordable_injuries?.severity_breakdown?.minor || 0) +
                                                    (incidentData?.total_recordable_injuries?.severity_breakdown?.moderate || 0) +
                                                    (incidentData?.total_recordable_injuries?.severity_breakdown?.serious || 0))) * 100}%`,
                                            backgroundColor: DESIGN_SYSTEM.context.safetyTraining
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active Safety Initiatives */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5" style={{ color: currentColors.primary }} />
                            Active Safety Programs
                        </h4>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {safetyInitiatives?.active_programs?.map((program: any, index: number) => (
                                <div key={index} className="p-4 rounded-xl border border-gray-200 hover:border-green-200 transition-all">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="font-semibold text-gray-900">{program.name}</p>
                                            <p className="text-sm text-gray-600">{program.description}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${program.participation?.includes('75%') || program.compliance_rate?.includes('98%')
                                            ? 'bg-green-50 text-green-600'
                                            : 'bg-blue-50 text-blue-600'
                                            }`}>
                                            Active
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        {program.participation && (
                                            <span className="text-gray-600">Participation: {program.participation}</span>
                                        )}
                                        {program.impact && (
                                            <span className="font-medium" style={{ color: currentColors.primary }}>
                                                Impact: {program.impact}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Worker Health & Wellness Programs */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Worker Health & Wellness</h3>
                        <p className="text-gray-600">Medical services and wellness programs for employee wellbeing</p>
                    </div>
                    <Heart className="w-8 h-8" style={{ color: currentColors.primary }} />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-blue-100">
                                <Hospital className="w-6 h-6" style={{ color: DESIGN_SYSTEM.context.medical }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Medical Services</h4>
                        </div>
                        <div className="space-y-2">
                            <p className="text-gray-700">
                                <span className="font-semibold" style={{ color: DESIGN_SYSTEM.context.medical }}>
                                    {workerHealth?.medical_services?.on_site_clinics || 0}
                                </span> on-site clinics
                            </p>
                            <p className="text-gray-700">
                                <span className="font-semibold" style={{ color: DESIGN_SYSTEM.context.medical }}>
                                    {workerHealth?.medical_services?.emergency_response_teams || 0}
                                </span> emergency response teams
                            </p>
                            <p className="text-gray-700">
                                <span className="font-semibold" style={{ color: DESIGN_SYSTEM.context.medical }}>
                                    {workerHealth?.medical_services?.first_aid_certified_staff || 0}
                                </span> first aid certified staff
                            </p>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-pink-100">
                                <Heart className="w-6 h-6" style={{ color: DESIGN_SYSTEM.context.wellness }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Wellness Programs</h4>
                        </div>
                        <div className="space-y-2">
                            <p className="text-gray-700">
                                {workerHealth?.wellness_programs?.mental_health_support ? (
                                    <span className="font-semibold" style={{ color: DESIGN_SYSTEM.context.wellness }}>
                                        Mental health support available
                                    </span>
                                ) : (
                                    'No mental health support'
                                )}
                            </p>
                            <p className="text-gray-700">
                                <span className="font-semibold" style={{ color: DESIGN_SYSTEM.context.wellness }}>
                                    {workerHealth?.wellness_programs?.ergonomic_assessments || 0}
                                </span> ergonomic assessments
                            </p>
                            <p className="text-gray-700">
                                Health screenings: <span className="font-semibold" style={{ color: DESIGN_SYSTEM.context.wellness }}>
                                    {workerHealth?.wellness_programs?.health_screenings || 'N/A'}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-green-100">
                                <HardHat className="w-6 h-6" style={{ color: DESIGN_SYSTEM.context.ppeCompliance }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Protective Equipment</h4>
                        </div>
                        <div className="space-y-2">
                            <p className="text-gray-700">
                                <span className="font-semibold" style={{ color: DESIGN_SYSTEM.context.ppeCompliance }}>
                                    {workerHealth?.protective_equipment?.ppe_compliance || 0}%
                                </span> PPE compliance rate
                            </p>
                            <p className="text-gray-700">
                                <span className="font-semibold" style={{ color: DESIGN_SYSTEM.context.ppeCompliance }}>
                                    {workerHealth?.protective_equipment?.annual_investment || '$0'}
                                </span> annual investment
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                                {workerHealth?.protective_equipment?.equipment_provided?.slice(0, 3).map((item: string, idx: number) => (
                                    <span key={idx} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                        {item}
                                    </span>
                                ))}
                                {workerHealth?.protective_equipment?.equipment_provided?.length > 3 && (
                                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                        +{workerHealth.protective_equipment.equipment_provided.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Safety Committees & Certifications */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Safety Committees & Certifications</h3>
                        <p className="text-gray-600">Committee activities and safety certifications</p>
                    </div>
                    <FileText className="w-8 h-8" style={{ color: currentColors.primary }} />
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Safety Committees */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5" style={{ color: DESIGN_SYSTEM.context.safetyMeetings }} />
                            Safety Committees
                        </h4>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                                <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-semibold text-gray-900">Agriculture Committee</h5>
                                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium">
                                        {safetyCommittees?.agriculture_committee?.members || 0} members
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">{safetyCommittees?.agriculture_committee?.meetings || 0} meetings</span>
                                    <span className="text-gray-600">{safetyCommittees?.agriculture_committee?.initiatives_completed || 0} initiatives</span>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {safetyCommittees?.agriculture_committee?.focus_areas?.slice(0, 3).map((area: string, idx: number) => (
                                        <span key={idx} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                            {area}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                                <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-semibold text-gray-900">Milling Committee</h5>
                                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 font-medium">
                                        {safetyCommittees?.milling_committee?.members || 0} members
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">{safetyCommittees?.milling_committee?.meetings || 0} meetings</span>
                                    <span className="text-gray-600">{safetyCommittees?.milling_committee?.initiatives_completed || 0} initiatives</span>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {safetyCommittees?.milling_committee?.focus_areas?.slice(0, 3).map((area: string, idx: number) => (
                                        <span key={idx} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                            {area}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Safety Certifications */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5" style={{ color: currentColors.primary }} />
                            Safety Certifications
                        </h4>
                        <div className="space-y-4">
                            {safetyBenchmarks?.certifications?.map((cert: any, index: number) => (
                                <div key={index} className="p-4 rounded-xl border border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {cert.status === 'Certified' || cert.status === 'Excellent' ? (
                                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-red-600" />
                                            )}
                                            <h5 className="font-semibold text-gray-900">{cert.name}</h5>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${cert.status === 'Certified' || cert.status === 'Excellent'
                                            ? 'bg-green-50 text-green-600'
                                            : 'bg-red-50 text-red-600'
                                            }`}>
                                            {cert.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {cert.valid_until && (
                                            <p>Valid until: {cert.valid_until}</p>
                                        )}
                                        {cert.last_audit && (
                                            <p>Last audit: {cert.last_audit}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
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
                            Health & Safety Notes
                        </h4>
                        <div className="space-y-2">
                            <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                <span className="font-semibold">Data Source:</span> HVE Integrated Report 2025
                            </p>
                            <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                <span className="font-semibold">Reporting Framework:</span> {companyInfo?.esg_reporting_framework?.join(', ') || 'IFRS S1 and S2, GRI, UNSDG'}
                            </p>
                            <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                <span className="font-semibold">Contact:</span> {companyInfo?.esg_contact_person?.name || 'ESG & Sustainability Office'} ({companyInfo?.esg_contact_person?.email || 'info@tongaat.co.zw'})
                            </p>
                            <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                <span className="font-semibold">Safety Goal:</span> {healthSafetySummary?.safety_snapshot?.safety_goal || 'Zero Harm'}
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
                                    <p className="text-emerald-50">Detailed health & safety metric information</p>
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
                                        This metric indicates the current state of {selectedMetric.title.toLowerCase()} within the monitored period.
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
                                            <span className="font-semibold">Description</span>
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
                                            <Archive className="w-5 h-5" />
                                            <span className="font-semibold">Metric Source</span>
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

export default HealthSafetyOverviewTab;