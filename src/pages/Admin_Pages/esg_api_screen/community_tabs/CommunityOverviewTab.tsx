import React, { useState, useMemo, useEffect } from 'react';
import {
    Users,
    Heart,
    Handshake,
    Target,
    Globe,
    Building,
    School,
    Hospital,
    DollarSign,
    Award,
    Shield,
    TrendingUp,
    TrendingDown,
    Activity,
    CheckCircle,
    AlertCircle,
    X,
    ChevronRight,
    Calculator,
    Settings,
    ArrowRight,
    MapPin,
    Maximize2,
    Download,
    Share2,
    Info,
    PieChart as PieChartIcon,
    AreaChart as AreaChartIcon,
    LineChart as LineChartIcon,
    BarChart as BarChartIcon,
    Radar,
    BarChart3,
    Leaf,
    Recycle,
    Thermometer,
    RefreshCw,
    AlertTriangle,
    Zap,
} from 'lucide-react';
import {
    CommunityEngagementResponse,
    getCommunityEngagementSummary,
    getSocialLicenseDetails,
    getSDGAlignmentBreakdown,
    getCommunityBenefits,
    getEngagementScores,
    getKPIs,
    getStrategicInsights,
    getAllGraphs,
    getEngagementTrendAnalysis,
    getCommunityImpactSummary,
} from '../../../../services/Admin_Service/esg_apis/community_engagement_service';

// Import chart components
import {
    ResponsiveContainer,
    AreaChart as RechartsAreaChart,
    Area,
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
    ComposedChart,
    ScatterChart,
    Scatter,
    ZAxis
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

// Color Palette (matched to Energy OverviewTab)
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
        socialLicense: PRIMARY_GREEN,
        engagement: EMERALD,
        sdgAlignment: '#3b82f6',
        education: '#8b5cf6',
        healthcare: '#ef4444',
        economic: '#f59e0b',
        environmental: '#10b981',
    },
    charts: {
        primary: [PRIMARY_GREEN, EMERALD, LIGHT_GREEN, '#4ade80', '#86efac'],
        secondary: [SECONDARY_GREEN, DARK_GREEN, LIME, '#a3e635', '#d9f99d'],
        sdg: [PRIMARY_GREEN, '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#06b6d4'],
        gradient: {
            social: `linear-gradient(135deg, ${PRIMARY_GREEN} 0%, ${EMERALD} 100%)`,
            sdg: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            engagement: 'linear-gradient(135deg, #10b981 0%, #84cc16 100%)',
        }
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
    communityData: CommunityEngagementResponse | null;
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
    getCommunityGraphs?: () => any[];
}

const CommunityOverviewTab: React.FC<OverviewTabProps> = ({
    communityData,
    selectedCompany,
    formatNumber,
    formatCurrency,
    formatPercent,
    getTrendIcon,
    onMetricClick,
    onCalculationClick,
    selectedYear,
    availableYears,
    loading,
    isRefreshing,
    coordinates = [],
    areaName = "Community Engagement Area",
    areaCovered = "N/A",
    colors,
    summaryMetrics,
    getCommunityGraphs
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

    // Extract data using service functions
    const communitySummary = useMemo(() => {
        if (!communityData?.data) return null;
        try {
            return getCommunityEngagementSummary(communityData.data);
        } catch (error) {
            console.error('Error getting community summary:', error);
            return null;
        }
    }, [communityData]);

    const socialLicenseDetails = useMemo(() => {
        if (!communityData?.data) return null;
        try {
            return getSocialLicenseDetails(communityData.data);
        } catch (error) {
            console.error('Error getting social license details:', error);
            return null;
        }
    }, [communityData]);

    const sdgAlignment = useMemo(() => {
        if (!communityData?.data) return null;
        try {
            return getSDGAlignmentBreakdown(communityData.data);
        } catch (error) {
            console.error('Error getting SDG alignment:', error);
            return null;
        }
    }, [communityData]);

    const communityBenefits = useMemo(() => {
        if (!communityData?.data) return null;
        try {
            return getCommunityBenefits(communityData.data);
        } catch (error) {
            console.error('Error getting community benefits:', error);
            return null;
        }
    }, [communityData]);

    const engagementScores = useMemo(() => {
        if (!communityData?.data) return null;
        try {
            return getEngagementScores(communityData.data);
        } catch (error) {
            console.error('Error getting engagement scores:', error);
            return null;
        }
    }, [communityData]);

    const kpis = useMemo(() => {
        if (!communityData?.data) return null;
        try {
            return getKPIs(communityData.data);
        } catch (error) {
            console.error('Error getting KPIs:', error);
            return null;
        }
    }, [communityData]);

    const strategicInsights = useMemo(() => {
        if (!communityData?.data) return null;
        try {
            return getStrategicInsights(communityData.data);
        } catch (error) {
            console.error('Error getting strategic insights:', error);
            return null;
        }
    }, [communityData]);

    const engagementTrendAnalysis = useMemo(() => {
        if (!communityData?.data) return null;
        try {
            return getEngagementTrendAnalysis(communityData.data);
        } catch (error) {
            console.error('Error getting engagement trend analysis:', error);
            return null;
        }
    }, [communityData]);

    const communityImpactSummary = useMemo(() => {
        if (!communityData?.data) return null;
        try {
            return getCommunityImpactSummary(communityData.data);
        } catch (error) {
            console.error('Error getting community impact summary:', error);
            return null;
        }
    }, [communityData]);

    // Get reporting year
    const reportingYear = communityData?.data?.analysis?.year || selectedYear || new Date().getFullYear();

    // Get area of interest from selected company
    const companyAreaOfInterest = communityData?.data?.company?.area_of_interest_metadata || selectedCompany?.area_of_interest_metadata;
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

    if (!communityData || !communityData.data) {
        return (
            <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4" style={{ color: DESIGN_SYSTEM.neutral[300] }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: DESIGN_SYSTEM.neutral[700] }}>No Community Engagement Data Available</h3>
                <p style={{ color: DESIGN_SYSTEM.neutral[500] }}>Select a company to view community engagement and social impact data</p>
            </div>
        );
    }

    // Prepare chart data
    const prepareChartData = () => {
        // Social License Factors
        const socialLicenseFactorsData = socialLicenseDetails?.factors ?
            Object.entries(socialLicenseDetails.factors).map(([key, value]) => ({
                name: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                value: value as number,
                fullMark: 100,
                color: DESIGN_SYSTEM.context.socialLicense
            })) : [];

        // Engagement Scores by Category
        const engagementScoresData = engagementScores?.byCategory ?
            Object.entries(engagementScores.byCategory).map(([key, value]) => ({
                name: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                value: value as number,
                color: DESIGN_SYSTEM.context.engagement
            })) : [];

        // SDG Alignment Scores
        const sdgScoresData = sdgAlignment?.scores ?
            Object.entries(sdgAlignment.scores).map(([key, value]) => ({
                name: key.toUpperCase(),
                value: value as number,
                color: DESIGN_SYSTEM.context.sdgAlignment
            })) : [];

        // Community Benefits Breakdown
        const communityBenefitsData = [
            {
                name: 'Education',
                value: communityBenefits?.education?.students_impacted || 0,
                color: DESIGN_SYSTEM.context.education
            },
            {
                name: 'Healthcare',
                value: communityBenefits?.healthcare?.patients_served || 0,
                color: DESIGN_SYSTEM.context.healthcare
            },
            {
                name: 'Economic',
                value: communityBenefits?.economic?.jobs_created || 0,
                color: DESIGN_SYSTEM.context.economic
            },
            {
                name: 'Environmental',
                value: communityBenefits?.environmental?.water_access_projects || 0,
                color: DESIGN_SYSTEM.context.environmental
            }
        ];

        // Monthly Impact Trends (mock - would need actual monthly data)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const impactTrendData = months.map(month => ({
            month,
            engagement: Math.random() * 20 + 70,
            satisfaction: Math.random() * 15 + 75,
            impact: Math.random() * 25 + 60
        }));

        // Stakeholder Trust Components
        const stakeholderComponents = [
            {
                component: 'Transparency',
                score: socialLicenseDetails?.factors?.transparency || 0,
                fullMark: 100
            },
            {
                component: 'Community Involvement',
                score: socialLicenseDetails?.factors?.community_involvement || 0,
                fullMark: 100
            },
            {
                component: 'Ethical Practices',
                score: socialLicenseDetails?.factors?.ethical_practices || 0,
                fullMark: 100
            },
            {
                component: 'Local Employment',
                score: socialLicenseDetails?.factors?.local_employment || 0,
                fullMark: 100
            },
            {
                component: 'Environmental Stewardship',
                score: socialLicenseDetails?.factors?.environmental_stewardship || 0,
                fullMark: 100
            },
            {
                component: 'Regulatory Compliance',
                score: socialLicenseDetails?.factors?.regulatory_compliance || 0,
                fullMark: 100
            },
        ];

        // Year-over-Year Comparison (mock)
        const yearlyComparisonData = [
            {
                year: reportingYear - 2,
                socialLicense: (communitySummary?.socialLicenseScore || 0) * 0.8,
                engagement: (communitySummary?.overallEngagementScore || 0) * 0.8,
                sdgAlignment: (communitySummary?.sdgAlignmentScore || 0) * 0.8
            },
            {
                year: reportingYear - 1,
                socialLicense: (communitySummary?.socialLicenseScore || 0) * 0.9,
                engagement: (communitySummary?.overallEngagementScore || 0) * 0.9,
                sdgAlignment: (communitySummary?.sdgAlignmentScore || 0) * 0.9
            },
            {
                year: reportingYear,
                socialLicense: communitySummary?.socialLicenseScore || 0,
                engagement: communitySummary?.overallEngagementScore || 0,
                sdgAlignment: communitySummary?.sdgAlignmentScore || 0
            },
        ];

        return {
            socialLicenseFactorsData,
            engagementScoresData,
            sdgScoresData,
            communityBenefitsData,
            impactTrendData,
            stakeholderComponents,
            yearlyComparisonData
        };
    };

    const chartData = prepareChartData();

    // Prepare detailed metric cards
    const detailedMetricCards = [
        {
            title: "Social License Score",
            value: communitySummary?.socialLicenseScore || 0,
            unit: "/100",
            icon: <Handshake className="w-5 h-5" />,
            color: currentColors.primary,
            description: "Measure of community acceptance and trust"
        },
        {
            title: "Engagement Score",
            value: communitySummary?.overallEngagementScore || 0,
            unit: "/100",
            icon: <Users className="w-5 h-5" />,
            color: DESIGN_SYSTEM.context.engagement,
            description: "Overall community engagement effectiveness"
        },
        {
            title: "SDG Alignment",
            value: communitySummary?.sdgAlignmentScore || 0,
            unit: "/100",
            icon: <Target className="w-5 h-5" />,
            color: DESIGN_SYSTEM.context.sdgAlignment,
            description: "Alignment with Sustainable Development Goals"
        },
        {
            title: "Community Trust",
            value: communitySummary?.communityTrustIndex || 0,
            unit: "/100",
            icon: <Heart className="w-5 h-5" />,
            color: DESIGN_SYSTEM.context.healthcare,
            description: "Community trust and satisfaction index"
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
                            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Define graphs with unified styling
    const graphs = [
        {
            id: 'social-license-factors',
            title: 'Social License Components',
            description: 'Breakdown of social license factors',
            icon: <Shield className="w-5 h-5" style={{ color: currentColors.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={chartData.socialLicenseFactorsData}>
                        <PolarGrid stroke={DESIGN_SYSTEM.neutral[300]} />
                        <PolarAngleAxis
                            dataKey="name"
                            style={{ fontSize: '11px', fontWeight: 600 }}
                            stroke={DESIGN_SYSTEM.neutral[600]}
                        />
                        <PolarRadiusAxis stroke={DESIGN_SYSTEM.neutral[300]} />
                        <RechartsRadar
                            name="Score"
                            dataKey="value"
                            stroke={currentColors.primary}
                            fill={currentColors.primary}
                            fillOpacity={0.5}
                            strokeWidth={3}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                    </RadarChart>
                </ResponsiveContainer>
            ),
            info: 'Shows the breakdown of factors contributing to Social License to Operate score'
        },
        {
            id: 'engagement-scores',
            title: 'Engagement Scores by Category',
            description: 'Engagement scores across different community areas',
            icon: <Users className="w-5 h-5" style={{ color: DESIGN_SYSTEM.context.engagement }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={chartData.engagementScoresData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DESIGN_SYSTEM.neutral[200]} />
                        <XAxis
                            dataKey="name"
                            stroke={DESIGN_SYSTEM.neutral[400]}
                            style={{ fontSize: '12px', fontWeight: 500 }}
                        />
                        <YAxis
                            stroke={DESIGN_SYSTEM.neutral[400]}
                            style={{ fontSize: '12px', fontWeight: 500 }}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Bar
                            dataKey="value"
                            radius={[8, 8, 0, 0]}
                        >
                            {chartData.engagementScoresData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </RechartsBarChart>
                </ResponsiveContainer>
            ),
            info: 'Community engagement scores across education, healthcare, local economy, and environmental areas'
        },
        {
            id: 'sdg-alignment',
            title: 'SDG Alignment Scores',
            description: 'Alignment with Sustainable Development Goals',
            icon: <Target className="w-5 h-5" style={{ color: DESIGN_SYSTEM.context.sdgAlignment }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={chartData.sdgScoresData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DESIGN_SYSTEM.neutral[200]} />
                        <XAxis
                            dataKey="name"
                            stroke={DESIGN_SYSTEM.neutral[400]}
                            style={{ fontSize: '12px', fontWeight: 500 }}
                        />
                        <YAxis
                            stroke={DESIGN_SYSTEM.neutral[400]}
                            style={{ fontSize: '12px', fontWeight: 500 }}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Bar
                            dataKey="value"
                            radius={[8, 8, 0, 0]}
                        >
                            {chartData.sdgScoresData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </RechartsBarChart>
                </ResponsiveContainer>
            ),
            info: 'Alignment scores with various Sustainable Development Goals (SDGs)'
        },
        {
            id: 'community-benefits',
            title: 'Community Benefits Breakdown',
            description: 'Impact across different community areas',
            icon: <Heart className="w-5 h-5" style={{ color: DESIGN_SYSTEM.context.healthcare }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={chartData.communityBenefitsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DESIGN_SYSTEM.neutral[200]} />
                        <XAxis
                            dataKey="name"
                            stroke={DESIGN_SYSTEM.neutral[400]}
                            style={{ fontSize: '12px', fontWeight: 500 }}
                        />
                        <YAxis
                            stroke={DESIGN_SYSTEM.neutral[400]}
                            style={{ fontSize: '12px', fontWeight: 500 }}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Bar
                            dataKey="value"
                            radius={[8, 8, 0, 0]}
                        >
                            {chartData.communityBenefitsData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </RechartsBarChart>
                </ResponsiveContainer>
            ),
            info: 'Community benefits across education, healthcare, economic development, and environmental projects'
        },
        {
            id: 'impact-trends',
            title: 'Monthly Impact Trends',
            description: 'Community impact trends throughout the year',
            icon: <LineChartIcon className="w-5 h-5" style={{ color: currentColors.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={chartData.impactTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DESIGN_SYSTEM.neutral[200]} />
                        <XAxis
                            dataKey="month"
                            stroke={DESIGN_SYSTEM.neutral[400]}
                            style={{ fontSize: '12px', fontWeight: 500 }}
                        />
                        <YAxis
                            stroke={DESIGN_SYSTEM.neutral[400]}
                            style={{ fontSize: '12px', fontWeight: 500 }}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <RechartsLegend />
                        <Line
                            type="monotone"
                            dataKey="engagement"
                            stroke={currentColors.primary}
                            name="Engagement"
                            strokeWidth={3}
                            dot={{ fill: currentColors.primary, r: 4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="satisfaction"
                            stroke={DESIGN_SYSTEM.context.healthcare}
                            name="Satisfaction"
                            strokeWidth={3}
                            dot={{ fill: DESIGN_SYSTEM.context.healthcare, r: 4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="impact"
                            stroke={DESIGN_SYSTEM.context.sdgAlignment}
                            name="Impact"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                        />
                    </RechartsLineChart>
                </ResponsiveContainer>
            ),
            info: 'Monthly trends showing variations in community engagement, satisfaction, and impact'
        },
        {
            id: 'stakeholder-trust',
            title: 'Stakeholder Trust Components',
            description: 'Multi-dimensional stakeholder trust assessment',
            icon: <Radar className="w-5 h-5" style={{ color: currentColors.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={chartData.stakeholderComponents}>
                        <PolarGrid stroke={DESIGN_SYSTEM.neutral[300]} />
                        <PolarAngleAxis
                            dataKey="component"
                            style={{ fontSize: '12px', fontWeight: 600 }}
                            stroke={DESIGN_SYSTEM.neutral[600]}
                        />
                        <PolarRadiusAxis stroke={DESIGN_SYSTEM.neutral[300]} />
                        <RechartsRadar
                            name="Trust Score"
                            dataKey="score"
                            stroke={currentColors.primary}
                            fill={currentColors.primary}
                            fillOpacity={0.5}
                            strokeWidth={3}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                    </RadarChart>
                </ResponsiveContainer>
            ),
            info: 'Comprehensive assessment of stakeholder trust across different operational aspects'
        }
    ];

    const handleMetricClick = (metric: any, title: string) => {
        setSelectedMetric({ ...metric, title });
        setShowMetricModal(true);
    };

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
                                    {selectedCompany?.name || communityData.data.company.name || "Company"}
                                </h2>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-100 text-green-800 font-medium">
                                        {selectedCompany?.industry || communityData.data.company.industry || "Industry"}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 font-medium">
                                        {selectedCompany?.country || communityData.data.company.country || "Country"}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-medium">
                                        {reportingYear}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-600 mb-0.5">Social License Score</p>
                            <p className="font-medium text-xs" style={{ color: currentColors.primary }}>
                                {communitySummary?.socialLicenseScore?.toFixed(1) || "0"}
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
                            <p className="text-[10px] text-gray-600 mb-0.5">Total Metrics</p>
                            <p className="font-bold text-sm text-gray-900">
                                {communityData.data.esg_data?.summary?.total_records || 0}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Data Sources</p>
                            <p className="font-bold text-sm text-gray-900">
                                {communityData.data.esg_data?.summary?.data_sources?.length || 0}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Confidence Score</p>
                            <p className="font-bold text-sm" style={{ color: currentColors.primary }}>
                                {communityData.data.analysis?.confidence_score || 0}%
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
                            <h2 className="text-xl font-bold mb-1 text-white">Community Engagement & Social Impact Dashboard</h2>
                            <p className="text-emerald-50 text-sm">Comprehensive community engagement and social license tracking</p>
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
                        {/* Social License Score Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClick(socialLicenseDetails, 'Social License Score')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Handshake className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Social License</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {communitySummary?.socialLicenseScore?.toFixed(1) || "0"}
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                {socialLicenseDetails?.level || "N/A"}
                            </span>
                        </div>

                        {/* Engagement Score Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClick(engagementScores, 'Engagement Score')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Users className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Engagement Score</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {communitySummary?.overallEngagementScore?.toFixed(1) || "0"}
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                {getTrendIcon(engagementScores?.trend || "stable")}
                                {engagementScores?.trend || "Trend"}
                            </span>
                        </div>

                        {/* SDG Alignment Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClick(sdgAlignment, 'SDG Alignment')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Target className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">SDG Alignment</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {communitySummary?.sdgAlignmentScore?.toFixed(1) || "0"}
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                {sdgAlignment?.prioritySDGs?.length || 0} SDGs
                            </span>
                        </div>

                        {/* Community Trust Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClick(kpis, 'Community Trust')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Heart className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Community Trust</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {communitySummary?.communityTrustIndex?.toFixed(1) || "0"}
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                Index
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200" style={{ background: currentColors.background }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Community Impact Area</h3>
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
                    {finalCoordinates && finalCoordinates.length > 0 ? (
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
                                                    <span className="font-semibold">Social License Score:</span> {communitySummary?.socialLicenseScore?.toFixed(1) || "0"}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Engagement Score:</span> {communitySummary?.overallEngagementScore?.toFixed(1) || "0"}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Community Benefits:</span> {formatNumber(communityImpactSummary?.studentsImpacted || 0)} students impacted
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
                                                    <span className="font-semibold">Social License Score:</span> {communitySummary?.socialLicenseScore?.toFixed(1) || "0"}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Engagement Score:</span> {communitySummary?.overallEngagementScore?.toFixed(1) || "0"}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">SDG Alignment:</span> {communitySummary?.sdgAlignmentScore?.toFixed(1) || "0"}
                                                </p>
                                            </div>
                                        </div>
                                    </Popup>
                                </Polygon>
                            )}
                        </MapContainer>
                    ) : (
                        <div
                            className="h-full flex items-center justify-center"
                            style={{
                                background: `linear-gradient(135deg, ${DESIGN_SYSTEM.neutral[50]} 0%, ${DESIGN_SYSTEM.neutral[100]} 100%)`
                            }}
                        >
                            <div className="text-center">
                                <MapPin
                                    className="w-16 h-16 mx-auto mb-4 opacity-20"
                                    style={{ color: currentColors.primary }}
                                />
                                <p className="font-medium" style={{ color: DESIGN_SYSTEM.neutral[500] }}>
                                    No location data available
                                </p>
                                <p className="text-sm mt-2" style={{ color: DESIGN_SYSTEM.neutral[400] }}>
                                    {selectedCompany?.name
                                        ? `No area of interest configured for ${selectedCompany.name}`
                                        : 'Please select a company with location data'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-6 grid grid-cols-2 gap-4 bg-gray-50">
                    <div className="p-4 rounded-xl bg-white border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                            <Globe className="w-4 h-4" style={{ color: currentColors.primary }} />
                            Community Area
                        </p>
                        <p className="font-bold text-lg text-gray-900">{companyAreaCovered}</p>
                        {selectedCompany?.name && (
                            <p className="text-xs text-gray-500 mt-1">{selectedCompany.name}</p>
                        )}
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                            <Target className="w-4 h-4" style={{ color: currentColors.primary }} />
                            Impact Points
                        </p>
                        <p className="font-bold text-lg text-gray-900">{finalCoordinates?.length || 0} {finalCoordinates?.length === 1 ? 'point' : 'points'}</p>
                        {finalCoordinates && finalCoordinates.length > 1 && (
                            <p className="text-xs text-gray-500 mt-1">Community boundary</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Community Impact Cards */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold" style={{ color: currentColors.primary }}>
                        Community Impact Metrics
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
                                    {typeof card.value === 'number' ? card.value.toFixed(1) : card.value}
                                    <span className="text-lg">{card.unit}</span>
                                </div>
                                {card.description && (
                                    <p className="text-sm text-gray-600">
                                        {card.description}
                                    </p>
                                )}
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
                        Community Performance Indicators
                    </h3>
                    <Activity className="w-5 h-5" style={{ color: DESIGN_SYSTEM.neutral[500] }} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.context.education }}>
                            {formatNumber(communityBenefits?.education?.students_impacted || 0)}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Students Impacted
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.context.healthcare }}>
                            {formatNumber(communityBenefits?.healthcare?.patients_served || 0)}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Patients Served
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.context.economic }}>
                            {formatNumber(communityBenefits?.economic?.jobs_created || 0)}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Jobs Created
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.context.environmental }}>
                            {formatNumber(communityBenefits?.environmental?.water_access_projects || 0)}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Water Projects
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: currentColors.secondary }}>
                            {formatCurrency(communityBenefits?.economic?.local_procurement_usd || 0)}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Local Procurement
                        </p>
                    </div>
                </div>
            </div>

            {/* Social License Section */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Social License to Operate</h3>
                        <p className="text-gray-600">Community acceptance and trust metrics for {reportingYear}</p>
                    </div>
                    <Shield className="w-8 h-8" style={{ color: currentColors.primary }} />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-green-100">
                                <Handshake className="w-6 h-6" style={{ color: currentColors.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Social License Score</h4>
                        </div>
                        <div className="text-center mb-4">
                            <div className="text-5xl font-bold" style={{ color: currentColors.primary }}>
                                {communitySummary?.socialLicenseScore?.toFixed(1) || "0"}
                            </div>
                            <p className="text-gray-700 mt-2">
                                <span className="font-semibold" style={{ color: currentColors.primary }}>
                                    {socialLicenseDetails?.level || "N/A"}
                                </span> level of social license
                            </p>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-blue-100">
                                <Users className="w-6 h-6" style={{ color: DESIGN_SYSTEM.status.info }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Stakeholder Trust</h4>
                        </div>
                        <p className="text-gray-700 mb-4">
                            <span className="font-semibold" style={{ color: DESIGN_SYSTEM.status.info }}>
                                {socialLicenseDetails?.factors?.stakeholder_trust || "0"}%
                            </span> stakeholder trust level.
                        </p>
                        <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${socialLicenseDetails?.factors?.stakeholder_trust || 0}%` }}
                                ></div>
                            </div>
                            <span className="text-sm font-semibold">{socialLicenseDetails?.factors?.stakeholder_trust || "0"}%</span>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-yellow-100">
                                <Target className="w-6 h-6" style={{ color: DESIGN_SYSTEM.status.warning }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Community Approval</h4>
                        </div>
                        <p className="text-gray-700 mb-4">
                            <span className="font-semibold" style={{ color: DESIGN_SYSTEM.status.warning }}>
                                {socialLicenseDetails?.factors?.community_approval || "0"}%
                            </span> community approval rating.
                        </p>
                        <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-yellow-500 h-2 rounded-full"
                                    style={{ width: `${socialLicenseDetails?.factors?.community_approval || 0}%` }}
                                ></div>
                            </div>
                            <span className="text-sm font-semibold">{socialLicenseDetails?.factors?.community_approval || "0"}%</span>
                        </div>
                    </div>
                </div>
                {socialLicenseDetails?.recommendations && socialLicenseDetails.recommendations.length > 0 && (
                    <div className="mt-8 p-6 rounded-2xl bg-gray-50 border border-gray-200">
                        <h4 className="font-bold text-lg text-gray-900 mb-4">Recommendations for Improvement</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            {socialLicenseDetails.recommendations.slice(0, 4).map((rec, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                    <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: currentColors.primary }} />
                                    <p className="text-sm text-gray-700">{rec}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Methodology Section */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Calculation Methodology</h3>
                        <p className="text-gray-600">Understand how community engagement metrics are calculated</p>
                    </div>
                    <Settings className="w-8 h-8" style={{ color: currentColors.primary }} />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div
                        className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 cursor-pointer hover:border-green-300 transition-all group"
                        onClick={() =>
                            onCalculationClick("social-license", {
                                formula: "Weighted average of 8 key factors",
                                description: "Social License to Operate score calculation",
                            })
                        }
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-green-100">
                                <Handshake className="w-6 h-6" style={{ color: currentColors.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Social License Score</h4>
                        </div>
                        <p className="text-gray-700 mb-4">Weighted average of transparency, community involvement, ethical practices, etc.</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: currentColors.primary, fontWeight: 500 }}>
                                8 weighted factors
                            </span>
                            <Info className="w-5 h-5" style={{ color: currentColors.primary, opacity: 0, transition: 'opacity 0.2s' }} />
                        </div>
                    </div>

                    <div
                        className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 cursor-pointer hover:border-blue-300 transition-all group"
                        onClick={() =>
                            onCalculationClick("engagement-score", {
                                formula: "Average of category engagement scores",
                                description: "Overall engagement score calculation",
                            })
                        }
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-blue-100">
                                <Users className="w-6 h-6" style={{ color: DESIGN_SYSTEM.status.info }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Engagement Score</h4>
                        </div>
                        <p className="text-gray-700 mb-4">Average of education, healthcare, local economy, and environmental engagement</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-600 font-medium">
                                4 categories averaged
                            </span>
                            <Info className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    <div
                        className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 cursor-pointer hover:border-purple-300 transition-all group"
                        onClick={() =>
                            onCalculationClick("sdg-alignment", {
                                formula: "Weighted average of SDG contributions",
                                description: "SDG alignment score calculation",
                            })
                        }
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-purple-100">
                                <Target className="w-6 h-6" style={{ color: '#8b5cf6' }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">SDG Alignment</h4>
                        </div>
                        <p className="text-gray-700 mb-4">Weighted alignment with 8 key Sustainable Development Goals</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-purple-600 font-medium">
                                8 SDGs weighted
                            </span>
                            <Info className="w-5 h-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                </div>
                <div className="mt-6">
                    <button
                        onClick={() => onCalculationClick('full-methodology')}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 hover:border-green-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <span className="font-semibold text-gray-700">View Complete Methodology</span>
                        <ArrowRight className="w-5 h-5" style={{ color: currentColors.primary }} />
                    </button>
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
                            Community Engagement & Social Impact Notes
                        </h4>
                        <div className="space-y-2">
                            <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                <span className="font-semibold">Social License to Operate:</span> Measures community acceptance, trust, and approval of company operations.
                            </p>
                            <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                <span className="font-semibold">Engagement scores:</span> Track effectiveness across education, healthcare, local economy, and environmental initiatives.
                            </p>
                            <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                <span className="font-semibold">SDG alignment:</span> Measures contribution to Sustainable Development Goals 3, 4, 6, 7, 8, 12, 13, and 16.
                            </p>
                            <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                <span className="font-semibold">ESG benefits:</span> Strong community engagement enhances reputation, reduces operational risks, and creates shared value.
                            </p>
                            <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                <span className="font-semibold">Investor insights:</span> High social license scores indicate lower community risks and stronger stakeholder relationships.
                            </p>
                            <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                <span className="font-semibold">Regulatory compliance:</span> Helps meet social responsibility requirements and community development obligations.
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
                                        {typeof selectedMetric.value === 'number' ? selectedMetric.value.toFixed(2) : selectedMetric.value}
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
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityOverviewTab;