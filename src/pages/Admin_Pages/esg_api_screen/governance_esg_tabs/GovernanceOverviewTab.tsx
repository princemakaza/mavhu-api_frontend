import React, { useState, useMemo, useEffect } from 'react';
import {
    Users,
    Shield,
    Award,
    Target,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    X,
    ChevronRight,
    Calculator,
    Settings,
    ArrowRight,
    Building,
    BarChart3,
    PieChart as PieChartIcon,
    LineChart as LineChartIcon,
    BarChart as BarChartIcon,
    Radar,
    Activity,
    Download,
    Share2,
    Info,
    MapPin,
    Globe,
    DollarSign,
    AlertTriangle,
    Calendar,
    UserCheck,
    Percent,
    FileText,
    Gavel,
    Scale,
    BookOpen,
    Star,
    Trophy,
    ClipboardCheck,
    Briefcase,
    Heart,
    GraduationCap,
    Stethoscope,
    Handshake,
    Users as UsersIcon,
    Eye,
    Clock,
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
    Area,
    AreaChart,
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

// Color Palette (matched to WasteOverviewTab)
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
        board: PRIMARY_GREEN,
        independent: '#3b82f6',
        women: '#ec4899',
        ethics: '#8b5cf6',
        compliance: '#f59e0b',
        csr: '#10b981',
        remuneration: '#f97316',
        supplier: '#06b6d4',
        incidents: '#ef4444',
        success: PRIMARY_GREEN,
    },
    charts: {
        primary: [PRIMARY_GREEN, EMERALD, LIGHT_GREEN, '#4ade80', '#86efac'],
        secondary: [SECONDARY_GREEN, DARK_GREEN, LIME, '#a3e635', '#d9f99d'],
        governance: [PRIMARY_GREEN, '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#f97316', '#84cc16'],
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
    governanceData: any;
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

// Import types from governance service - FIXED PATH
import {
    GovernanceBoardData,
    PerformanceIndicator,
    Committee,
    PolicyStatus,
    Recommendation,
} from '../../../services/Admin_Service/esg_apis/governace_esg_service';

const GovernanceOverviewTab: React.FC<OverviewTabProps> = ({
    governanceData,
    selectedCompany,
    formatNumber,
    formatCurrency,
    formatPercent,
    getTrendIcon,
    onMetricClick,
    onCalculationClick,
    coordinates = [],
    areaName = "Governance Area",
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

    // Get API data from governanceData - FIXED: governanceData is already the data object
    const apiData = governanceData as GovernanceBoardData;

    // Extract key data sections
    const governanceSummary = apiData?.governance_summary;
    const boardComposition = apiData?.board_composition;
    const boardCommittees = apiData?.board_committees;
    const ethicsAndCompliance = apiData?.ethics_and_compliance;
    const executiveCompensation = apiData?.executive_compensation;
    const governanceMetrics = apiData?.governance_metrics;
    const governanceInitiatives = apiData?.governance_initiatives;
    const governanceBenchmarks = apiData?.governance_benchmarks;
    const recommendations = apiData?.recommendations;
    const dataQuality = apiData?.data_quality;
    const companyInfo = apiData?.company;
    const graphs = apiData?.graphs;

    // Get reporting year
    const reportingYear = apiData?.year_data?.requested_year || new Date().getFullYear();

    // Calculate governance score
    const governanceScore = useMemo(() => {
        if (!governanceSummary?.performance_indicators) return null;

        const indicators = governanceSummary.performance_indicators;

        // Simple scoring based on performance indicators
        let score = 0;
        let maxScore = 100;

        // Board independence (25 points)
        const independenceValue = typeof indicators.board_independence.value === 'number'
            ? indicators.board_independence.value
            : parseFloat(indicators.board_independence.value.toString());
        score += (independenceValue / 50) * 25;

        // Women on board (25 points)
        const womenValue = typeof indicators.women_on_board.value === 'number'
            ? indicators.women_on_board.value
            : parseFloat(indicators.women_on_board.value.toString());
        score += (womenValue / 30) * 25;

        // Board meetings (25 points)
        const meetingsValue = typeof indicators.board_meetings.value === 'number'
            ? indicators.board_meetings.value
            : parseFloat(indicators.board_meetings.value.toString());
        score += Math.min((meetingsValue / 6) * 25, 25);

        // Board size (25 points) - optimal range 8-12
        const sizeValue = typeof indicators.board_size.value === 'number'
            ? indicators.board_size.value
            : parseFloat(indicators.board_size.value.toString());
        if (sizeValue >= 8 && sizeValue <= 12) {
            score += 25;
        } else if (sizeValue >= 6 && sizeValue <= 14) {
            score += 15;
        } else {
            score += 5;
        }

        return Math.round(score);
    }, [governanceSummary]);

    // Get area of interest from selected company
    const companyAreaOfInterest = selectedCompany?.area_of_interest_metadata || companyInfo?.area_of_interest_metadata;
    const finalCoordinates = companyAreaOfInterest?.coordinates || coordinates;
    const companyAreaName = companyAreaOfInterest?.name || areaName;
    const companyAreaCovered = companyAreaOfInterest?.area_covered || areaCovered;

    // Calculate map center based on coordinates
    const mapCenter = useMemo(() => {
        if (!finalCoordinates || finalCoordinates.length === 0) return [0, 0];
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

    // Prepare detailed metric cards
    const detailedMetricCards = useMemo(() => {
        if (!governanceSummary?.performance_indicators) return [];

        const indicators = governanceSummary.performance_indicators;

        return [
            {
                title: "Board Size",
                value: indicators.board_size.value,
                unit: "members",
                icon: <Users className="w-5 h-5" />,
                color: DESIGN_SYSTEM.context.board,
                description: indicators.board_size.description,
                target: indicators.board_size.target
            },
            {
                title: "Independent Directors",
                value: indicators.board_independence.value,
                unit: "%",
                icon: <Shield className="w-5 h-5" />,
                color: DESIGN_SYSTEM.context.independent,
                description: indicators.board_independence.description,
                target: indicators.board_independence.target
            },
            {
                title: "Women on Board",
                value: indicators.women_on_board.value,
                unit: "%",
                icon: <UsersIcon className="w-5 h-5" />,
                color: DESIGN_SYSTEM.context.women,
                description: indicators.women_on_board.description,
                target: indicators.women_on_board.target
            },
            {
                title: "Board Meetings",
                value: indicators.board_meetings.value,
                unit: "meetings",
                icon: <Calendar className="w-5 h-5" />,
                color: DESIGN_SYSTEM.context.compliance,
                description: indicators.board_meetings.description,
                target: indicators.board_meetings.target
            },
            {
                title: "Governance Score",
                value: governanceScore || 0,
                unit: "/100",
                icon: <Star className="w-5 h-5" />,
                color: currentColors.primary,
                description: "Overall governance performance score",
                target: "Target: 80+"
            },
            {
                title: "Committee Independence",
                value: boardCommittees?.committee_effectiveness?.attendance_rate || "0%",
                unit: "",
                icon: <UserCheck className="w-5 h-5" />,
                color: DESIGN_SYSTEM.context.independent,
                description: "Average committee attendance rate",
                target: "Target: 90%+"
            },
            {
                title: "Regulatory Incidents",
                value: ethicsAndCompliance?.compliance_metrics?.regulatory_incidents || 0,
                unit: "",
                icon: <AlertTriangle className="w-5 h-5" />,
                color: DESIGN_SYSTEM.context.incidents,
                description: "Number of regulatory incidents reported",
                target: "Target: 0"
            },
            {
                title: "Shareholder Approval",
                value: executiveCompensation?.shareholder_approval?.approval_rate || "0%",
                unit: "",
                icon: <Percent className="w-5 h-5" />,
                color: DESIGN_SYSTEM.context.success,
                description: "Last vote on executive compensation",
                target: "Target: 75%+"
            }
        ];
    }, [governanceSummary, boardCommittees, ethicsAndCompliance, executiveCompensation, governanceScore, currentColors]);

    // Prepare CSR metrics
    const csrMetrics = useMemo(() => {
        if (!governanceMetrics?.metrics) return null;

        const metrics = governanceMetrics.metrics;

        // Extract CSR metrics
        const maleStudents = metrics['Corporate Social Responsibility - Education Attendance -  [Males]']?.values?.[0]?.numeric_value || 0;
        const femaleStudents = metrics['Corporate Social Responsibility - Education Attendance -  [Females]']?.values?.[0]?.numeric_value || 0;
        const hospitalAttendees = metrics['Health and Well being - Hospital attendees  - Total']?.values?.[0]?.numeric_value || 0;
        const totalSuppliers = metrics['Number of suppliers']?.values?.[0]?.numeric_value || 0;

        return {
            totalStudents: maleStudents + femaleStudents,
            maleStudents,
            femaleStudents,
            hospitalAttendees,
            totalSuppliers,
            genderRatio: femaleStudents > 0 ? (maleStudents / femaleStudents).toFixed(2) : 'N/A'
        };
    }, [governanceMetrics]);

    // Prepare policy metrics
    const policyMetrics = useMemo(() => {
        if (!ethicsAndCompliance?.policies_in_place) return null;

        const policies = ethicsAndCompliance.policies_in_place;

        // Calculate implemented policies
        const implementedPolicies = Object.values(policies).filter((policy: any) =>
            policy.status === 'Implemented'
        ).length;

        const totalPolicies = Object.keys(policies).length;

        return {
            implementedPolicies,
            totalPolicies,
            implementationRate: (implementedPolicies / totalPolicies) * 100,
            policies
        };
    }, [ethicsAndCompliance]);

    // Prepare chart data from API graphs
    const chartData = useMemo(() => {
        if (!graphs) return null;

        // Board Composition Trend (Line Chart)
        const boardCompositionData = graphs.board_composition_trend?.labels?.map((label: string | number, index: number) => ({
            year: label.toString(),
            boardSize: graphs.board_composition_trend.datasets[0]?.data[index] || 0,
            womenOnBoard: graphs.board_composition_trend.datasets[1]?.data[index] || 0,
            independentDirectors: graphs.board_composition_trend.datasets[2]?.data[index] || 0,
        })) || [];

        // Board Diversity Breakdown (Pie Chart)
        const boardDiversityData = graphs.board_diversity_breakdown?.labels?.map((label: string, index: number) => ({
            name: label,
            value: graphs.board_diversity_breakdown.datasets[0]?.data[index] || 0,
            color: graphs.board_diversity_breakdown.datasets[0]?.backgroundColor?.[index] || DESIGN_SYSTEM.charts.governance[index],
        })) || [];

        // Committee Performance (Bar Chart)
        const committeePerformanceData = graphs.committee_performance?.labels?.map((label: string, index: number) => ({
            committee: label,
            meetingsHeld: graphs.committee_performance.datasets[0]?.data[index] || 0,
            independentMembers: graphs.committee_performance.datasets[1]?.data[index] || 0,
            attendanceRate: graphs.committee_performance.datasets[2]?.data[index] || 0,
            color: DESIGN_SYSTEM.charts.governance[index],
        })) || [];

        // Governance Performance Areas (Radar Chart)
        const governancePerformanceData = graphs.governance_performance_areas?.labels?.map((label: string, index: number) => ({
            area: label,
            ourPerformance: graphs.governance_performance_areas.datasets[0]?.data[index] || 0,
            industryBenchmark: graphs.governance_performance_areas.datasets[1]?.data[index] || 0,
        })) || [];

        // Performance Indicators Bar Chart (Created from data)
        const performanceIndicatorsData = governanceSummary?.performance_indicators ? [
            {
                indicator: 'Board Size',
                value: typeof governanceSummary.performance_indicators.board_size.value === 'number'
                    ? governanceSummary.performance_indicators.board_size.value
                    : parseFloat(governanceSummary.performance_indicators.board_size.value.toString()),
                target: 10, // Average target
                color: DESIGN_SYSTEM.charts.governance[0]
            },
            {
                indicator: 'Independence',
                value: typeof governanceSummary.performance_indicators.board_independence.value === 'number'
                    ? governanceSummary.performance_indicators.board_independence.value
                    : parseFloat(governanceSummary.performance_indicators.board_independence.value.toString()),
                target: 50, // Target from data
                color: DESIGN_SYSTEM.charts.governance[1]
            },
            {
                indicator: 'Women %',
                value: typeof governanceSummary.performance_indicators.women_on_board.value === 'number'
                    ? governanceSummary.performance_indicators.women_on_board.value
                    : parseFloat(governanceSummary.performance_indicators.women_on_board.value.toString()),
                target: 30, // Target from data
                color: DESIGN_SYSTEM.charts.governance[2]
            },
            {
                indicator: 'Meetings',
                value: typeof governanceSummary.performance_indicators.board_meetings.value === 'number'
                    ? governanceSummary.performance_indicators.board_meetings.value
                    : parseFloat(governanceSummary.performance_indicators.board_meetings.value.toString()),
                target: 6, // Target from data
                color: DESIGN_SYSTEM.charts.governance[3]
            }
        ] : [];

        return {
            boardCompositionData,
            boardDiversityData,
            committeePerformanceData,
            governancePerformanceData,
            performanceIndicatorsData,
        };
    }, [graphs, governanceSummary]);

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
    const graphsList = [
        {
            id: 'board-composition',
            title: graphs?.board_composition_trend?.title || 'Board Composition Trend',
            description: graphs?.board_composition_trend?.description || 'Tracking board evolution over time',
            icon: <LineChartIcon className="w-5 h-5" style={{ color: currentColors.primary }} />,
            component: chartData?.boardCompositionData ? (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={chartData.boardCompositionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DESIGN_SYSTEM.neutral[200]} />
                        <XAxis dataKey="year" stroke={DESIGN_SYSTEM.neutral[400]} />
                        <YAxis stroke={DESIGN_SYSTEM.neutral[400]} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <RechartsLegend />
                        <Line
                            type="monotone"
                            dataKey="boardSize"
                            stroke={DESIGN_SYSTEM.context.board}
                            name="Board Size"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="womenOnBoard"
                            stroke={DESIGN_SYSTEM.context.women}
                            name="Women on Board (%)"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="independentDirectors"
                            stroke={DESIGN_SYSTEM.context.independent}
                            name="Independent Directors (%)"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                    </RechartsLineChart>
                </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full">No data available</div>,
            info: 'Shows the trend of board composition, diversity, and independence over the years'
        },
        {
            id: 'board-diversity',
            title: graphs?.board_diversity_breakdown?.title || 'Board Diversity Breakdown',
            description: graphs?.board_diversity_breakdown?.description || 'Current composition of our board',
            icon: <PieChartIcon className="w-5 h-5" style={{ color: currentColors.primary }} />,
            component: chartData?.boardDiversityData ? (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                        <Pie
                            data={chartData.boardDiversityData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            stroke="#fff"
                            strokeWidth={2}
                        >
                            {chartData.boardDiversityData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                        <RechartsLegend />
                    </RechartsPieChart>
                </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full">No data available</div>,
            info: 'Shows the breakdown of board composition by gender and director type'
        },
        {
            id: 'committee-performance',
            title: graphs?.committee_performance?.title || 'Committee Performance',
            description: graphs?.committee_performance?.description || 'Board committee activities and independence',
            icon: <BarChartIcon className="w-5 h-5" style={{ color: currentColors.primary }} />,
            component: chartData?.committeePerformanceData ? (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={chartData.committeePerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DESIGN_SYSTEM.neutral[200]} />
                        <XAxis dataKey="committee" stroke={DESIGN_SYSTEM.neutral[400]} />
                        <YAxis stroke={DESIGN_SYSTEM.neutral[400]} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <RechartsLegend />
                        <Bar
                            dataKey="meetingsHeld"
                            name="Meetings Held"
                            radius={[8, 8, 0, 0]}
                            fill={DESIGN_SYSTEM.context.board}
                        />
                        <Bar
                            dataKey="independentMembers"
                            name="Independent Members"
                            radius={[8, 8, 0, 0]}
                            fill={DESIGN_SYSTEM.context.independent}
                        />
                        <Bar
                            dataKey="attendanceRate"
                            name="Attendance Rate"
                            radius={[8, 8, 0, 0]}
                            fill={DESIGN_SYSTEM.context.success}
                        />
                    </RechartsBarChart>
                </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full">No data available</div>,
            info: 'Shows board committee performance metrics including meetings and independence'
        },
        {
            id: 'governance-performance',
            title: graphs?.governance_performance_areas?.title || 'Governance Performance',
            description: graphs?.governance_performance_areas?.description || 'Performance across governance areas',
            icon: <Radar className="w-5 h-5" style={{ color: currentColors.primary }} />,
            component: chartData?.governancePerformanceData ? (
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={chartData.governancePerformanceData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="area" stroke={DESIGN_SYSTEM.neutral[400]} />
                        <PolarRadiusAxis stroke={DESIGN_SYSTEM.neutral[400]} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <RechartsLegend />
                        <RechartsRadar
                            name="Our Performance"
                            dataKey="ourPerformance"
                            stroke={DESIGN_SYSTEM.context.board}
                            fill={DESIGN_SYSTEM.context.board}
                            fillOpacity={0.3}
                        />
                        <RechartsRadar
                            name="Industry Benchmark"
                            dataKey="industryBenchmark"
                            stroke={DESIGN_SYSTEM.context.independent}
                            fill={DESIGN_SYSTEM.context.independent}
                            fillOpacity={0.3}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full">No data available</div>,
            info: 'Radar chart showing performance across different governance areas compared to industry benchmarks'
        },
        {
            id: 'performance-indicators',
            title: 'Governance Performance Indicators',
            description: 'Key governance metrics compared to targets',
            icon: <BarChart3 className="w-5 h-5" style={{ color: currentColors.primary }} />,
            component: chartData?.performanceIndicatorsData ? (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={chartData.performanceIndicatorsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DESIGN_SYSTEM.neutral[200]} />
                        <XAxis dataKey="indicator" stroke={DESIGN_SYSTEM.neutral[400]} />
                        <YAxis stroke={DESIGN_SYSTEM.neutral[400]} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Bar
                            dataKey="value"
                            name="Current Value"
                            radius={[8, 8, 0, 0]}
                        >
                            {chartData.performanceIndicatorsData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                        <Line
                            type="monotone"
                            dataKey="target"
                            stroke={DESIGN_SYSTEM.neutral[600]}
                            name="Target"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                        />
                    </RechartsBarChart>
                </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full">No data available</div>,
            info: 'Bar chart showing key governance indicators compared to their targets'
        }
    ];

    const handleMetricClick = (metric: any, title: string) => {
        setSelectedMetric({ ...metric, title });
        setShowMetricModal(true);
        onMetricClick(metric, 'governance-metric');
    };

    if (!apiData) {
        return (
            <div className="text-center py-12">
                <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: DESIGN_SYSTEM.neutral[300] }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: DESIGN_SYSTEM.neutral[700] }}>No Governance Data Available</h3>
                <p style={{ color: DESIGN_SYSTEM.neutral[500] }}>Select a company to view governance and board metrics data</p>
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
                                        {selectedCompany?.industry || companyInfo?.industry || "Governance"}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 font-medium">
                                        {selectedCompany?.country || companyInfo?.country || "Country"}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-medium">
                                        {reportingYear}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-orange-100 text-orange-800 font-medium">
                                        Governance Score: {governanceScore || 0}/100
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-600 mb-0.5">Independent Directors</p>
                            <p className="font-medium text-xs" style={{ color: currentColors.primary }}>
                                {governanceSummary?.performance_indicators?.board_independence?.value || "0"}%
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
                            <p className="text-[10px] text-gray-600 mb-0.5">Governance Metrics</p>
                            <p className="font-bold text-sm text-gray-900">
                                {governanceMetrics?.total_metrics || 0}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Board Committees</p>
                            <p className="font-bold text-sm text-gray-900">
                                {boardCommittees?.committees?.length || 0}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Data Quality</p>
                            <p className="font-bold text-sm" style={{ color: currentColors.primary }}>
                                {dataQuality?.verification_status?.unverified || "N/A"}
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
                            <h2 className="text-xl font-bold mb-1 text-white">Governance & Board Metrics Dashboard</h2>
                            <p className="text-emerald-50 text-sm">Comprehensive board oversight, ethics, compliance, and governance tracking</p>
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
                        {/* Governance Score Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClick({ value: governanceScore }, 'Governance Score')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Star className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Governance Score</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {governanceScore || 0}/100
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                {governanceScore >= 80 ? 'Excellent' : governanceScore >= 60 ? 'Good' : 'Needs Improvement'}
                            </span>
                        </div>

                        {/* Board Independence Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClick(governanceSummary?.performance_indicators?.board_independence, 'Board Independence')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Shield className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Board Independence</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {governanceSummary?.performance_indicators?.board_independence?.value || "0"}%
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                {getTrendIcon(governanceSummary?.performance_indicators?.board_independence?.trend || 'stable')}
                                Target: {governanceSummary?.performance_indicators?.board_independence?.target || "N/A"}
                            </span>
                        </div>

                        {/* Women on Board Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClick(governanceSummary?.performance_indicators?.women_on_board, 'Women on Board')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <UsersIcon className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Women on Board</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {governanceSummary?.performance_indicators?.women_on_board?.value || "0"}%
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                {getTrendIcon(governanceSummary?.performance_indicators?.women_on_board?.trend || 'stable')}
                                Target: {governanceSummary?.performance_indicators?.women_on_board?.target || "30%"}
                            </span>
                        </div>

                        {/* Board Meetings Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClick(governanceSummary?.performance_indicators?.board_meetings, 'Board Meetings')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Calendar className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Board Meetings</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {governanceSummary?.performance_indicators?.board_meetings?.value || "0"}
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                {getTrendIcon(governanceSummary?.performance_indicators?.board_meetings?.trend || 'stable')}
                                Avg Attendance: {governanceSummary?.board_snapshot?.average_attendance || "0%"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            {finalCoordinates && finalCoordinates.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200" style={{ background: currentColors.background }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Area of Interest</h3>
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
                                                    <span className="font-semibold">Governance Score:</span> {governanceScore || 0}/100
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Board Size:</span> {governanceSummary?.performance_indicators?.board_size?.value || "0"}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Women on Board:</span> {governanceSummary?.performance_indicators?.women_on_board?.value || "0"}%
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
                                                    <span className="font-semibold">Governance Score:</span> {governanceScore || 0}/100
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Board Independence:</span> {governanceSummary?.performance_indicators?.board_independence?.value || "0"}%
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
                                Monitoring Points
                            </p>
                            <p className="font-bold text-lg text-gray-900">{finalCoordinates.length} {finalCoordinates.length === 1 ? 'point' : 'points'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Key Governance Metrics Cards */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold" style={{ color: currentColors.primary }}>
                        Key Governance Metrics
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
                                    {card.value}
                                    <span className="text-lg">{card.unit}</span>
                                </div>
                                <p className="text-sm text-gray-600" title={card.description}>
                                    {card.description?.length > 30 ? card.description.substring(0, 30) + '...' : card.description}
                                </p>
                                {card.target && (
                                    <p className="text-xs mt-2" style={{ color: DESIGN_SYSTEM.neutral[500] }}>
                                        Target: {card.target}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Full Width Top Graph */}
            <div className="w-full">
                <GraphDisplay
                    key="board-composition-full"
                    title={graphsList[0].title}
                    description={graphsList[0].description}
                    icon={graphsList[0].icon}
                    onClick={() => setSelectedGraph(graphsList[0])}
                    onInfoClick={() => onCalculationClick('board-composition', { description: graphsList[0].info })}
                >
                    {graphsList[0].component}
                </GraphDisplay>
            </div>

            {/* Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {graphsList.slice(1, 5).map((graph) => (
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

            {/* Board Composition Details */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold" style={{ color: currentColors.primary }}>
                        Board Composition Details
                    </h3>
                    <Users className="w-5 h-5" style={{ color: DESIGN_SYSTEM.neutral[500] }} />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.context.board }}>
                            {boardComposition?.size_and_structure?.total_directors || 0}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Total Directors
                        </p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.context.independent }}>
                            {boardComposition?.size_and_structure?.independent_directors || 0}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Independent Directors
                        </p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.context.women }}>
                            {boardComposition?.diversity_metrics?.gender_diversity?.women || 0}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Women Directors
                        </p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.context.compliance }}>
                            {boardComposition?.size_and_structure?.executive_directors || 0}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Executive Directors
                        </p>
                    </div>
                </div>
            </div>

            {/* Board Committees Section */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Board Committees & Effectiveness</h3>
                        <p className="text-gray-600">Committee structure and performance for {reportingYear}</p>
                    </div>
                    <ClipboardCheck className="w-8 h-8" style={{ color: currentColors.primary }} />
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Committees List */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Briefcase className="w-5 h-5" style={{ color: DESIGN_SYSTEM.context.independent }} />
                            Board Committees
                        </h4>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {boardCommittees?.committees?.map((committee: Committee, index: number) => (
                                <div key={index} className="p-4 rounded-xl border border-gray-200 hover:border-blue-200 transition-all">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="font-semibold text-gray-900">{committee.name}</p>
                                            <p className="text-sm text-gray-600">Chair: {committee.chair}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${committee.independent_members === committee.members
                                            ? 'bg-green-50 text-green-600'
                                            : committee.independent_members >= committee.members * 0.7
                                                ? 'bg-yellow-50 text-yellow-600'
                                                : 'bg-red-50 text-red-600'
                                            }`}>
                                            {Math.round((committee.independent_members / committee.members) * 100)}% Independent
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-700 mb-2">
                                        <span className="font-medium">Focus:</span> {committee.focus}
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Members: {committee.members}</span>
                                        <span className="font-medium" style={{ color: DESIGN_SYSTEM.context.board }}>
                                            Meetings: {committee.meetings_held}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Committee Effectiveness */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" style={{ color: currentColors.primary }} />
                            Committee Effectiveness
                        </h4>
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-900">Attendance Rate</span>
                                    <span className="text-sm px-2 py-1 rounded-full bg-green-50 text-green-600">
                                        {boardCommittees?.committee_effectiveness?.attendance_rate || "0%"}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="h-3 rounded-full transition-all duration-500"
                                        style={{
                                            width: boardCommittees?.committee_effectiveness?.attendance_rate || '0%',
                                            backgroundColor: parseFloat(boardCommittees?.committee_effectiveness?.attendance_rate) >= 90
                                                ? currentColors.primary
                                                : parseFloat(boardCommittees?.committee_effectiveness?.attendance_rate) >= 80
                                                    ? DESIGN_SYSTEM.status.warning
                                                    : DESIGN_SYSTEM.status.danger
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-900">Decision Implementation</span>
                                    <span className="text-sm px-2 py-1 rounded-full bg-green-50 text-green-600">
                                        {boardCommittees?.committee_effectiveness?.decision_implementation || "0%"}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="h-3 rounded-full transition-all duration-500"
                                        style={{
                                            width: boardCommittees?.committee_effectiveness?.decision_implementation || '0%',
                                            backgroundColor: currentColors.primary
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-900">Stakeholder Feedback Incorporated</span>
                                    <span className="text-sm px-2 py-1 rounded-full bg-green-50 text-green-600">
                                        {boardCommittees?.committee_effectiveness?.stakeholder_feedback_incorporated || "0%"}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="h-3 rounded-full transition-all duration-500"
                                        style={{
                                            width: boardCommittees?.committee_effectiveness?.stakeholder_feedback_incorporated || '0%',
                                            backgroundColor: parseFloat(boardCommittees?.committee_effectiveness?.stakeholder_feedback_incorporated) >= 80
                                                ? currentColors.primary
                                                : parseFloat(boardCommittees?.committee_effectiveness?.stakeholder_feedback_incorporated) >= 60
                                                    ? DESIGN_SYSTEM.status.warning
                                                    : DESIGN_SYSTEM.status.danger
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ethics & Compliance Section */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Ethics & Compliance</h3>
                        <p className="text-gray-600">Policies, incidents, and compliance metrics for {reportingYear}</p>
                    </div>
                    <Scale className="w-8 h-8" style={{ color: currentColors.primary }} />
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Policies Status */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5" style={{ color: DESIGN_SYSTEM.context.ethics }} />
                            Policies Status
                        </h4>
                        <div className="space-y-4">
                            {policyMetrics && Object.entries(policyMetrics.policies || {}).map(([key, policy]: [string, any]) => (
                                <div key={key} className="p-4 rounded-xl border border-gray-200 hover:border-purple-200 transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <p className="font-semibold text-gray-900">{key.replace(/_/g, ' ').toUpperCase()}</p>
                                            <p className="text-sm text-gray-600">Status: {policy.status}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${policy.status === 'Implemented'
                                            ? 'bg-green-50 text-green-600'
                                            : 'bg-red-50 text-red-600'
                                            }`}>
                                            {policy.status}
                                        </span>
                                    </div>
                                    {policy.last_review && (
                                        <p className="text-sm text-gray-700">
                                            Last Review: {policy.last_review}
                                        </p>
                                    )}
                                    {policy.employee_training_completion && (
                                        <p className="text-sm text-gray-700">
                                            Training: {policy.employee_training_completion}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Compliance Metrics */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <ClipboardCheck className="w-5 h-5" style={{ color: DESIGN_SYSTEM.context.compliance }} />
                            Compliance Metrics
                        </h4>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
                                    <p className="text-sm text-gray-600 mb-1">Regulatory Incidents</p>
                                    <p className="text-2xl font-bold" style={{ color: DESIGN_SYSTEM.context.incidents }}>
                                        {ethicsAndCompliance?.compliance_metrics?.regulatory_incidents || 0}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200">
                                    <p className="text-sm text-gray-600 mb-1">Fines & Penalties</p>
                                    <p className="text-2xl font-bold" style={{ color: DESIGN_SYSTEM.status.warning }}>
                                        {ethicsAndCompliance?.compliance_metrics?.fines_penalties || 0}
                                    </p>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                                <p className="text-sm text-gray-600 mb-1">Audit Findings</p>
                                <p className="font-bold" style={{ color: currentColors.primary }}>
                                    {ethicsAndCompliance?.compliance_metrics?.audit_findings || "No findings"}
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                                <p className="text-sm text-gray-600 mb-1">IFRS Alignment</p>
                                <p className="font-bold" style={{ color: DESIGN_SYSTEM.status.info }}>
                                    {ethicsAndCompliance?.compliance_metrics?.ifrs_alignment || "Not specified"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CSR & Social Metrics */}
            {csrMetrics && (
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">Corporate Social Responsibility</h3>
                            <p className="text-gray-600">Community impact and social metrics for {reportingYear}</p>
                        </div>
                        <Heart className="w-8 h-8" style={{ color: DESIGN_SYSTEM.context.csr }} />
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-blue-100">
                                    <GraduationCap className="w-6 h-6" style={{ color: DESIGN_SYSTEM.status.info }} />
                                </div>
                                <h4 className="font-bold text-lg text-gray-900">Education</h4>
                            </div>
                            <p className="text-gray-700">
                                <span className="font-semibold" style={{ color: DESIGN_SYSTEM.status.info }}>
                                    {formatNumber(csrMetrics.totalStudents)}
                                </span> students supported across primary and secondary schools
                            </p>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">Male Students</p>
                                    <p className="font-bold" style={{ color: DESIGN_SYSTEM.status.info }}>{formatNumber(csrMetrics.maleStudents)}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">Female Students</p>
                                    <p className="font-bold" style={{ color: DESIGN_SYSTEM.context.women }}>{formatNumber(csrMetrics.femaleStudents)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-green-100">
                                    <Stethoscope className="w-6 h-6" style={{ color: currentColors.primary }} />
                                </div>
                                <h4 className="font-bold text-lg text-gray-900">Health & Wellbeing</h4>
                            </div>
                            <p className="text-gray-700">
                                <span className="font-semibold" style={{ color: currentColors.primary }}>
                                    {formatNumber(csrMetrics.hospitalAttendees)}
                                </span> hospital attendees served at the medical centre
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-purple-100">
                                    <Handshake className="w-6 h-6" style={{ color: DESIGN_SYSTEM.context.supplier }} />
                                </div>
                                <h4 className="font-bold text-lg text-gray-900">Supplier Relations</h4>
                            </div>
                            <p className="text-gray-700">
                                <span className="font-semibold" style={{ color: DESIGN_SYSTEM.context.supplier }}>
                                    {formatNumber(csrMetrics.totalSuppliers)}
                                </span> suppliers engaged, with focus on local procurement
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Recommendations Section */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Governance Recommendations</h3>
                        <p className="text-gray-600">Priority actions for governance improvement</p>
                    </div>
                    <Target className="w-8 h-8" style={{ color: currentColors.primary }} />
                </div>
                <div className="space-y-4">
                    {recommendations?.slice(0, 3).map((recommendation: Recommendation, index: number) => (
                        <div
                            key={index}
                            className={`p-6 rounded-xl border transition-all ${recommendation.priority === 'High'
                                ? 'border-red-200 bg-red-50 hover:bg-red-100'
                                : recommendation.priority === 'Medium'
                                    ? 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100'
                                    : 'border-blue-200 bg-blue-50 hover:bg-blue-100'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${recommendation.priority === 'High'
                                            ? 'bg-red-100 text-red-700'
                                            : recommendation.priority === 'Medium'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {recommendation.priority} Priority
                                        </span>
                                        <span className="text-sm text-gray-600">Timeline: {recommendation.timeline}</span>
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-900">{recommendation.action}</h4>
                                </div>
                                {recommendation.responsible_committee && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                        {recommendation.responsible_committee}
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-700 mb-3">{recommendation.impact}</p>
                            {recommendation.metrics_affected && (
                                <div className="flex flex-wrap gap-2">
                                    {recommendation.metrics_affected.map((metric: string, idx: number) => (
                                        <span
                                            key={idx}
                                            className="px-2 py-1 rounded-full text-xs bg-white border border-gray-200 text-gray-700"
                                        >
                                            {metric}
                                        </span>
                                    ))}
                                </div>
                            )}
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
                            Governance & Board Metrics Notes
                        </h4>
                        <div className="space-y-2">
                            <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                <span className="font-semibold">Data Source:</span> HVE Integrated Report 2025
                            </p>
                            <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                <span className="font-semibold">Reporting Framework:</span> {companyInfo?.esg_reporting_framework?.join(', ') || 'Not specified'}
                            </p>
                            <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                <span className="font-semibold">Contact:</span> {companyInfo?.esg_contact_person?.name || 'N/A'} ({companyInfo?.esg_contact_person?.email || 'N/A'})
                            </p>
                            <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                <span className="font-semibold">Data Quality:</span> {dataQuality?.verification_status?.unverified || 0} unverified metrics out of {dataQuality?.total_metrics || 0} total metrics
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
                                        This metric indicates the current state of {selectedMetric.title.toLowerCase()} within the monitored period.
                                    </p>
                                    {selectedMetric.target && (
                                        <p className="mt-2 text-sm" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                                            <span className="font-semibold">Target:</span> {selectedMetric.target}
                                        </p>
                                    )}
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
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GovernanceOverviewTab;