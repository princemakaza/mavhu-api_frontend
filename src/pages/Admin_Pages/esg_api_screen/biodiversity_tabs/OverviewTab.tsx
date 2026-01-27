import React, { useState } from 'react';
import {
    Leaf,
    Trees,
    Droplets,
    AlertTriangle,
    BarChart3,
    Target,
    Shield,
    Mountain,
    CloudRain,
    Factory,
    Users,
    Globe,
    MapPin,
    Maximize2,
    Download,
    Share2,
    Info,
    PieChart,
    AreaChart,
    LineChart,
    BarChart,
    Radar,
    Activity,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    AlertCircle,
    X
} from 'lucide-react';
import {
    BiodiversityLandUseResponse,
    Company,
    getYearlyNDVISummaries,
    getYearlyCarbonData,
    getMonthlyNDVITrends,
    getDeforestationAnalysis,
    // getBiodiversityAssessment
} from '../../../../services/Admin_Service/esg_apis/biodiversity_api_service';

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
    ComposedChart
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

// Unified Color System - Professional & Cohesive
const DESIGN_SYSTEM = {
    // Primary brand colors
    primary: {
        main: '#059669',      // Emerald 600
        light: '#10b981',     // Emerald 500
        dark: '#047857',      // Emerald 700
        50: '#ecfdf5',        // Emerald 50
        100: '#d1fae5',       // Emerald 100
        200: '#a7f3d0',       // Emerald 200
    },
    // Secondary accent colors
    secondary: {
        main: '#f59e0b',      // Amber 500
        light: '#fbbf24',     // Amber 400
        dark: '#d97706',      // Amber 600
        50: '#fffbeb',        // Amber 50
        100: '#fef3c7',       // Amber 100
    },
    // Status colors
    status: {
        success: '#10b981',   // Emerald 500
        warning: '#f59e0b',   // Amber 500
        danger: '#ef4444',    // Red 500
        info: '#3b82f6',      // Blue 500
    },
    // Contextual colors
    context: {
        forest: '#059669',    // Emerald 600
        water: '#06b6d4',     // Cyan 500
        protected: '#8b5cf6', // Violet 500
        agricultural: '#f59e0b', // Amber 500
        soil: '#92400e',      // Amber 900
        biodiversity: '#10b981', // Emerald 500
    },
    // Chart colors - coordinated palette
    charts: {
        primary: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
        secondary: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7'],
        mixed: ['#059669', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'],
        gradient: {
            emerald: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            amber: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
            blue: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
            multi: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
        }
    },
    // Neutral colors
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
}

const GraphDisplay: React.FC<GraphDisplayProps> = ({ title, description, icon, children, onClick }) => {
    return (
        <div
            className="bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
            style={{ borderColor: DESIGN_SYSTEM.neutral[200] }}
            onClick={onClick}
        >
            <div className="p-5 border-b" style={{ 
                borderColor: DESIGN_SYSTEM.neutral[100],
                background: `linear-gradient(to right, ${DESIGN_SYSTEM.primary[50]}, ${DESIGN_SYSTEM.neutral[50]})`
            }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl border" style={{
                            backgroundColor: DESIGN_SYSTEM.primary[50],
                            borderColor: DESIGN_SYSTEM.primary[200]
                        }}>
                            {icon}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800">{title}</h4>
                            <p className="text-xs" style={{ color: DESIGN_SYSTEM.neutral[500] }}>{description}</p>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <button 
                            className="p-2 rounded-lg transition-colors"
                            style={{ 
                                backgroundColor: 'transparent',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = DESIGN_SYSTEM.neutral[100]}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <Maximize2 className="w-4 h-4" style={{ color: DESIGN_SYSTEM.neutral[500] }} />
                        </button>
                        <button 
                            className="p-2 rounded-lg transition-colors"
                            style={{ 
                                backgroundColor: 'transparent',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = DESIGN_SYSTEM.neutral[100]}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <Download className="w-4 h-4" style={{ color: DESIGN_SYSTEM.neutral[500] }} />
                        </button>
                    </div>
                </div>
            </div>
            <div className="p-5 h-64 bg-white">
                {children}
            </div>
        </div>
    );
};

interface OverviewTabProps {
    biodiversityData: BiodiversityLandUseResponse | null;
    selectedCompany: Company | undefined;
    formatNumber: (num: number) => string;
    formatCurrency: (num: number) => string;
    formatPercent: (num: number) => string;
    getTrendIcon: (trend: string) => React.ReactNode;
    selectedYear: number | null;
    availableYears: number[];
    loading: boolean;
    isRefreshing: boolean;
    onMetricClick: (metric: any, modalType: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
    biodiversityData,
    selectedCompany,
    formatNumber,
    formatPercent,
    getTrendIcon,
    onMetricClick,
    selectedYear,
    availableYears,
    loading,
    isRefreshing
}) => {
    const [selectedGraph, setSelectedGraph] = useState<any>(null);
    const [selectedMetric, setSelectedMetric] = useState<any>(null);
    const [showMetricModal, setShowMetricModal] = useState(false);

    if (!biodiversityData) {
        return (
            <div className="text-center py-12">
                <Leaf className="w-16 h-16 mx-auto mb-4" style={{ color: DESIGN_SYSTEM.neutral[300] }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: DESIGN_SYSTEM.neutral[700] }}>No Data Available</h3>
                <p style={{ color: DESIGN_SYSTEM.neutral[500] }}>Select a company to view biodiversity and land use data</p>
            </div>
        );
    }

    const {
        biodiversity_assessment,
        deforestation_analysis,
        land_use_metrics,
        environmental_impact,
        social_governance,
        carbon_emission_accounting,
        key_statistics,
        conservation_metrics,
        company
    } = biodiversityData.data;

    // Get coordinates and area info
    const coordinates = company.area_of_interest_metadata?.coordinates || [];
    const areaName = company.area_of_interest_metadata?.name || "Area of Interest";
    const areaCovered = company.area_of_interest_metadata?.area_covered || "N/A";

    // Prepare chart data
    const prepareChartData = () => {
        const ndviSummaries = getYearlyNDVISummaries(biodiversityData);
        const carbonData = getYearlyCarbonData(biodiversityData);
        const monthlyTrends = getMonthlyNDVITrends(biodiversityData);
        const deforestationRisk = getDeforestationAnalysis(biodiversityData);
        // const biodiversityAssessment = getBiodiversityAssessment(biodiversityData);

        return {
            // NDVI Trend Data
            ndviTrendData: ndviSummaries?.map((summary: any) => ({
                year: summary.year,
                avgNDVI: summary.avg_ndvi,
                maxNDVI: summary.max_ndvi,
                minNDVI: summary.min_ndvi
            })) || [],

            // Monthly NDVI Data
            monthlyNDVIData: monthlyTrends?.map((trend: any) => ({
                month: trend.month_name,
                avgNDVI: trend.avg_ndvi,
                dataPoints: trend.data_points
            })) || [],

            // Land Use Composition
            landUseData: [
                { name: 'Forest', value: land_use_metrics.current_year.forest_area, color: DESIGN_SYSTEM.context.forest },
                { name: 'Agricultural', value: land_use_metrics.current_year.agricultural_area, color: DESIGN_SYSTEM.context.agricultural },
                { name: 'Protected', value: land_use_metrics.current_year.protected_area, color: DESIGN_SYSTEM.context.protected },
                { name: 'Other', value: land_use_metrics.current_year.total_area - 
                    (land_use_metrics.current_year.forest_area + 
                     land_use_metrics.current_year.agricultural_area + 
                     land_use_metrics.current_year.protected_area), 
                  color: DESIGN_SYSTEM.neutral[400] }
            ],

            // Carbon Balance Data
            carbonBalanceData: carbonData?.map((data: any) => ({
                year: data.year,
                sequestration: data.sequestration.total_tco2,
                emissions: data.emissions.total_tco2e,
                netBalance: data.emissions.net_balance
            })) || [],

            // Deforestation Risk Timeline
            deforestationRiskData: deforestationRisk?.yearly_risk?.map((risk: any) => ({
                year: risk.year,
                riskScore: risk.risk_score,
                forestArea: risk.forest_area,
                ndviScore: risk.ndvi_score
            })) || [],

            // Biodiversity Components Radar Data
            biodiversityComponentsData: [
                { component: 'Environmental', score: biodiversity_assessment.components.environmental.score, fullMark: 100 },
                { component: 'Social', score: biodiversity_assessment.components.social.score, fullMark: 100 },
                { component: 'Governance', score: biodiversity_assessment.components.governance.score, fullMark: 100 },
                { component: 'Conservation', score: biodiversity_assessment.components.conservation.score, fullMark: 100 },
            ],

            // Environmental Impact Data
            environmentalImpactData: [
                { category: 'Water', score: environmental_impact.water_management.efficiency.efficiency_score, risk: environmental_impact.water_management.risk_level },
                { category: 'Waste', score: environmental_impact.waste_management.recycled_waste * 100, risk: environmental_impact.waste_management.risk_level },
                { category: 'Incidents', score: 100 - (environmental_impact.incident_management.total_incidents * 10), risk: environmental_impact.incident_management.risk_level },
                { category: 'Soil', score: environmental_impact.soil_health.organic_matter * 20, risk: 'medium' },
            ]
        };
    };

    const chartData = prepareChartData();

    // Helper function to get color based on score
    const getScoreColor = (score: number) => {
        if (score >= 80) return DESIGN_SYSTEM.status.success;
        if (score >= 60) return DESIGN_SYSTEM.secondary.main;
        if (score >= 40) return DESIGN_SYSTEM.secondary.light;
        return DESIGN_SYSTEM.status.danger;
    };

    const getRiskColor = (level: string) => {
        switch (level.toLowerCase()) {
            case 'low': return DESIGN_SYSTEM.status.success;
            case 'medium': return DESIGN_SYSTEM.secondary.main;
            case 'high': return DESIGN_SYSTEM.status.danger;
            default: return DESIGN_SYSTEM.neutral[600];
        }
    };

    const handleMetricClick = (metric: any, title: string) => {
        setSelectedMetric({ ...metric, title });
        setShowMetricModal(true);
    };

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
            id: 'ndvi-trend',
            title: 'NDVI Trend Over Years',
            description: 'Normalized Difference Vegetation Index trend',
            icon: <LineChart className="w-5 h-5" style={{ color: DESIGN_SYSTEM.primary.main }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={chartData.ndviTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DESIGN_SYSTEM.neutral[200]} />
                        <XAxis 
                            dataKey="year" 
                            stroke={DESIGN_SYSTEM.neutral[400]} 
                            style={{ fontSize: '12px', fontWeight: 500 }} 
                        />
                        <YAxis 
                            stroke={DESIGN_SYSTEM.neutral[400]} 
                            style={{ fontSize: '12px', fontWeight: 500 }} 
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <RechartsLegend 
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                        />
                        <Line 
                            type="monotone" 
                            dataKey="avgNDVI" 
                            stroke={DESIGN_SYSTEM.primary.main} 
                            name="Average NDVI" 
                            strokeWidth={3} 
                            dot={{ fill: DESIGN_SYSTEM.primary.main, r: 5, strokeWidth: 2, stroke: '#fff' }} 
                            activeDot={{ r: 7 }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="maxNDVI" 
                            stroke={DESIGN_SYSTEM.primary.light} 
                            name="Max NDVI" 
                            strokeWidth={2} 
                            strokeDasharray="5 5" 
                            dot={{ fill: DESIGN_SYSTEM.primary.light, r: 4 }} 
                        />
                    </RechartsLineChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'land-use-composition',
            title: 'Land Use Composition',
            description: 'Current land use distribution',
            icon: <PieChart className="w-5 h-5" style={{ color: DESIGN_SYSTEM.primary.main }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                        <Pie
                            data={chartData.landUseData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                            outerRadius={90}
                            fill="#8884d8"
                            dataKey="value"
                            stroke="#fff"
                            strokeWidth={3}
                        >
                            {chartData.landUseData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                    </RechartsPieChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'monthly-ndvi',
            title: 'Monthly NDVI Variation',
            description: 'Seasonal vegetation health',
            icon: <AreaChart className="w-5 h-5" style={{ color: DESIGN_SYSTEM.primary.main }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsAreaChart data={chartData.monthlyNDVIData}>
                        <defs>
                            <linearGradient id="colorNDVI" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={DESIGN_SYSTEM.primary.main} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={DESIGN_SYSTEM.primary.main} stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={DESIGN_SYSTEM.neutral[200]} />
                        <XAxis 
                            dataKey="month" 
                            stroke={DESIGN_SYSTEM.neutral[400]} 
                            style={{ fontSize: '11px', fontWeight: 500 }} 
                        />
                        <YAxis 
                            stroke={DESIGN_SYSTEM.neutral[400]} 
                            style={{ fontSize: '12px', fontWeight: 500 }} 
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Area 
                            type="monotone" 
                            dataKey="avgNDVI" 
                            stroke={DESIGN_SYSTEM.primary.main} 
                            fillOpacity={1} 
                            fill="url(#colorNDVI)" 
                            strokeWidth={3} 
                        />
                    </RechartsAreaChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'deforestation-risk',
            title: 'Deforestation Risk Timeline',
            description: 'Risk score trend over years',
            icon: <AlertTriangle className="w-5 h-5" style={{ color: DESIGN_SYSTEM.status.danger }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData.deforestationRiskData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DESIGN_SYSTEM.neutral[200]} />
                        <XAxis 
                            dataKey="year" 
                            stroke={DESIGN_SYSTEM.neutral[400]} 
                            style={{ fontSize: '12px', fontWeight: 500 }} 
                        />
                        <YAxis 
                            stroke={DESIGN_SYSTEM.neutral[400]} 
                            style={{ fontSize: '12px', fontWeight: 500 }} 
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <RechartsLegend 
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                        />
                        <Bar 
                            dataKey="riskScore" 
                            fill={DESIGN_SYSTEM.status.danger} 
                            name="Risk Score" 
                            radius={[8, 8, 0, 0]} 
                            opacity={0.8}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="forestArea" 
                            stroke={DESIGN_SYSTEM.context.forest} 
                            name="Forest Area" 
                            strokeWidth={3} 
                            dot={{ fill: DESIGN_SYSTEM.context.forest, r: 5, strokeWidth: 2, stroke: '#fff' }} 
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'biodiversity-components',
            title: 'Biodiversity Components',
            description: 'Multi-dimensional assessment',
            icon: <Radar className="w-5 h-5" style={{ color: DESIGN_SYSTEM.primary.main }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={chartData.biodiversityComponentsData}>
                        <PolarGrid stroke={DESIGN_SYSTEM.neutral[300]} />
                        <PolarAngleAxis 
                            dataKey="component" 
                            style={{ fontSize: '12px', fontWeight: 600 }} 
                            stroke={DESIGN_SYSTEM.neutral[600]}
                        />
                        <PolarRadiusAxis stroke={DESIGN_SYSTEM.neutral[300]} />
                        <RechartsRadar 
                            name="Score" 
                            dataKey="score" 
                            stroke={DESIGN_SYSTEM.primary.main} 
                            fill={DESIGN_SYSTEM.primary.main} 
                            fillOpacity={0.5} 
                            strokeWidth={3} 
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                    </RadarChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'carbon-balance',
            title: 'Carbon Balance Trend',
            description: 'Sequestration vs Emissions',
            icon: <Activity className="w-5 h-5" style={{ color: DESIGN_SYSTEM.primary.main }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData.carbonBalanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DESIGN_SYSTEM.neutral[200]} />
                        <XAxis 
                            dataKey="year" 
                            stroke={DESIGN_SYSTEM.neutral[400]}
                            style={{ fontSize: '12px', fontWeight: 500 }} 
                        />
                        <YAxis 
                            stroke={DESIGN_SYSTEM.neutral[400]}
                            style={{ fontSize: '12px', fontWeight: 500 }} 
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <RechartsLegend 
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                        />
                        <Bar 
                            dataKey="emissions" 
                            fill={DESIGN_SYSTEM.status.danger} 
                            name="Emissions" 
                            radius={[8, 8, 0, 0]} 
                            opacity={0.7}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="sequestration" 
                            stroke={DESIGN_SYSTEM.primary.main} 
                            name="Sequestration" 
                            strokeWidth={3} 
                            dot={{ fill: DESIGN_SYSTEM.primary.main, r: 6, strokeWidth: 2, stroke: '#fff' }} 
                        />
                        <Line 
                            type="monotone" 
                            dataKey="netBalance" 
                            stroke={DESIGN_SYSTEM.status.info} 
                            name="Net Balance" 
                            strokeWidth={3} 
                            strokeDasharray="5 5" 
                            dot={{ fill: DESIGN_SYSTEM.status.info, r: 5 }} 
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            )
        }
    ];

    return (
        <div className="space-y-8 pb-8">
            {/* Hero Section */}
            <div 
                className="relative overflow-hidden rounded-3xl p-8 text-white shadow-xl"
                style={{
                    background: `linear-gradient(135deg, ${DESIGN_SYSTEM.primary.dark} 0%, ${DESIGN_SYSTEM.primary.main} 50%, ${DESIGN_SYSTEM.primary.light} 100%)`
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
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold mb-2">Biodiversity & Land Use Dashboard</h2>
                        <p className="text-emerald-50 text-lg">Comprehensive ecosystem health monitoring</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Biodiversity Score Card */}
                        <div
                            className="backdrop-blur-md rounded-2xl border p-6 cursor-pointer transition-all group"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                borderColor: 'rgba(255, 255, 255, 0.3)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
                            onClick={() => handleMetricClick(biodiversity_assessment, 'Biodiversity Assessment')}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div 
                                    className="p-3 rounded-xl"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <Leaf className="w-6 h-6 text-white" />
                                </div>
                                <span 
                                    className="text-sm font-semibold px-3 py-1 rounded-full"
                                    style={{ 
                                        color: getScoreColor(biodiversity_assessment.overall_score),
                                        backgroundColor: 'rgba(255, 255, 255, 0.25)'
                                    }}
                                >
                                    {biodiversity_assessment.rating}
                                </span>
                            </div>
                            <h3 className="text-4xl font-bold mb-2">
                                {biodiversity_assessment.overall_score}/100
                            </h3>
                            <p className="text-emerald-50">Overall Biodiversity Score</p>
                        </div>

                        {/* Deforestation Risk Card */}
                        <div
                            className="backdrop-blur-md rounded-2xl border p-6 cursor-pointer transition-all group"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                borderColor: 'rgba(255, 255, 255, 0.3)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
                            onClick={() => handleMetricClick(deforestation_analysis, 'Deforestation Analysis')}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div 
                                    className="p-3 rounded-xl"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <AlertTriangle className="w-6 h-6 text-white" />
                                </div>
                                <span 
                                    className="text-sm font-semibold px-3 py-1 rounded-full"
                                    style={{ 
                                        color: getRiskColor(deforestation_analysis.risk_level),
                                        backgroundColor: 'rgba(255, 255, 255, 0.25)'
                                    }}
                                >
                                    {deforestation_analysis.risk_level}
                                </span>
                            </div>
                            <h3 className="text-4xl font-bold mb-2">
                                {deforestation_analysis.risk_score}/100
                            </h3>
                            <p className="text-emerald-50">Deforestation Risk Score</p>
                        </div>

                        {/* Forest Coverage Card */}
                        <div
                            className="backdrop-blur-md rounded-2xl border p-6 cursor-pointer transition-all group"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                borderColor: 'rgba(255, 255, 255, 0.3)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
                            onClick={() => handleMetricClick(land_use_metrics, 'Land Use Metrics')}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div 
                                    className="p-3 rounded-xl"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <Trees className="w-6 h-6 text-white" />
                                </div>
                                {getTrendIcon(land_use_metrics.trends.forest_area_trend)}
                            </div>
                            <h3 className="text-4xl font-bold mb-2">
                                {land_use_metrics.current_year.forest_coverage_percent}
                            </h3>
                            <p className="text-emerald-50">Forest Coverage</p>
                        </div>

                        {/* Carbon Balance Card */}
                        <div
                            className="backdrop-blur-md rounded-2xl border p-6 cursor-pointer transition-all group"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                borderColor: 'rgba(255, 255, 255, 0.3)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
                            onClick={() => handleMetricClick(carbon_emission_accounting, 'Carbon Accounting')}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div 
                                    className="p-3 rounded-xl"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                >
                                    <Activity className="w-6 h-6 text-white" />
                                </div>
                                <span 
                                    className="text-sm font-semibold px-3 py-1 rounded-full"
                                    style={{ 
                                        color: carbon_emission_accounting.yearly_data[0]?.emissions.net_balance >= 0 ? DESIGN_SYSTEM.status.success : DESIGN_SYSTEM.status.danger,
                                        backgroundColor: 'rgba(255, 255, 255, 0.25)'
                                    }}
                                >
                                    {carbon_emission_accounting.yearly_data[0]?.emissions.net_balance >= 0 ? 'Positive' : 'Negative'}
                                </span>
                            </div>
                            <h3 className="text-4xl font-bold mb-2">
                                {formatNumber(Math.abs(carbon_emission_accounting.yearly_data[0]?.emissions.net_balance || 0))}
                            </h3>
                            <p className="text-emerald-50">Net Carbon Balance</p>
                        </div>
                    </div>
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
                    >
                        {graph.component}
                    </GraphDisplay>
                ))}
            </div>

            {/* Map Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map - Spanning 2 columns */}
                <div 
                    className="lg:col-span-2 bg-white rounded-3xl border shadow-lg overflow-hidden"
                    style={{ borderColor: DESIGN_SYSTEM.neutral[200] }}
                >
                    <div 
                        className="p-6 border-b"
                        style={{ 
                            borderColor: DESIGN_SYSTEM.neutral[200],
                            background: `linear-gradient(to right, ${DESIGN_SYSTEM.primary[50]}, ${DESIGN_SYSTEM.neutral[50]})`
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold mb-1" style={{ color: DESIGN_SYSTEM.neutral[900] }}>
                                    Area of Interest
                                </h3>
                                <p className="flex items-center gap-2" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                                    <MapPin className="w-4 h-4" style={{ color: DESIGN_SYSTEM.primary.main }} />
                                    {areaName}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    className="p-2 rounded-lg bg-white border transition-all"
                                    style={{ borderColor: DESIGN_SYSTEM.neutral[200] }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = DESIGN_SYSTEM.neutral[50]}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                                >
                                    <Share2 className="w-5 h-5" style={{ color: DESIGN_SYSTEM.neutral[600] }} />
                                </button>
                                <button 
                                    className="p-2 rounded-lg bg-white border transition-all"
                                    style={{ borderColor: DESIGN_SYSTEM.neutral[200] }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = DESIGN_SYSTEM.neutral[50]}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                                >
                                    <Download className="w-5 h-5" style={{ color: DESIGN_SYSTEM.neutral[600] }} />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="h-96">
                        {coordinates.length > 0 ? (
                            <MapContainer
                                center={[coordinates[0]?.lat || 0, coordinates[0]?.lon || 0]}
                                zoom={10}
                                style={{ height: '100%', width: '100%' }}
                                className="leaflet-container z-0"
                            >
                                <TileLayer
                                    attribution='&copy; OpenStreetMap contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {coordinates.length === 1 ? (
                                    <Marker position={[coordinates[0].lat, coordinates[0].lon]}>
                                        <Popup>
                                            <div className="p-2">
                                                <h3 className="font-bold" style={{ color: DESIGN_SYSTEM.primary.main }}>{areaName}</h3>
                                                <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                                    Lat: {coordinates[0].lat.toFixed(4)}
                                                </p>
                                                <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                                    Lon: {coordinates[0].lon.toFixed(4)}
                                                </p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ) : (
                                    <Polygon
                                        pathOptions={{ 
                                            fillColor: DESIGN_SYSTEM.primary.main, 
                                            color: DESIGN_SYSTEM.primary.main, 
                                            fillOpacity: 0.3, 
                                            weight: 2 
                                        }}
                                        positions={coordinates.map((coord: any) => [coord.lat, coord.lon])}
                                    >
                                        <Popup>
                                            <div className="p-2">
                                                <h3 className="font-bold" style={{ color: DESIGN_SYSTEM.primary.main }}>{areaName}</h3>
                                                <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                                    Area: {areaCovered}
                                                </p>
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
                                        style={{ color: DESIGN_SYSTEM.primary.main }} 
                                    />
                                    <p className="font-medium" style={{ color: DESIGN_SYSTEM.neutral[500] }}>
                                        No location data available
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div 
                        className="p-6 grid grid-cols-2 gap-4"
                        style={{ backgroundColor: DESIGN_SYSTEM.neutral[50] }}
                    >
                        <div 
                            className="p-4 rounded-xl bg-white border"
                            style={{ borderColor: DESIGN_SYSTEM.neutral[200] }}
                        >
                            <p 
                                className="text-xs mb-1 flex items-center gap-2"
                                style={{ color: DESIGN_SYSTEM.neutral[600] }}
                            >
                                <Globe className="w-4 h-4" style={{ color: DESIGN_SYSTEM.primary.main }} />
                                Area Covered
                            </p>
                            <p className="font-bold text-lg" style={{ color: DESIGN_SYSTEM.neutral[900] }}>
                                {areaCovered}
                            </p>
                        </div>
                        <div 
                            className="p-4 rounded-xl bg-white border"
                            style={{ borderColor: DESIGN_SYSTEM.neutral[200] }}
                        >
                            <p 
                                className="text-xs mb-1 flex items-center gap-2"
                                style={{ color: DESIGN_SYSTEM.neutral[600] }}
                            >
                                <Target className="w-4 h-4" style={{ color: DESIGN_SYSTEM.primary.main }} />
                                Coordinates
                            </p>
                            <p className="font-bold text-lg" style={{ color: DESIGN_SYSTEM.neutral[900] }}>
                                {coordinates.length} points
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Sidebar */}
                <div className="space-y-6">
                    {/* Conservation Progress */}
                    <div 
                        className="bg-white rounded-3xl border shadow-lg p-6"
                        style={{ borderColor: DESIGN_SYSTEM.neutral[200] }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold" style={{ color: DESIGN_SYSTEM.neutral[900] }}>
                                Conservation Progress
                            </h3>
                            <Target className="w-5 h-5" style={{ color: DESIGN_SYSTEM.primary.main }} />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                        Habitat Restoration
                                    </span>
                                    <span className="text-sm font-bold" style={{ color: DESIGN_SYSTEM.primary.main }}>
                                        {conservation_metrics.habitat_restoration_potential.percent_of_target}
                                    </span>
                                </div>
                                <div 
                                    className="w-full h-2 rounded-full overflow-hidden"
                                    style={{ backgroundColor: DESIGN_SYSTEM.neutral[100] }}
                                >
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: conservation_metrics.habitat_restoration_potential.percent_of_target,
                                            backgroundColor: DESIGN_SYSTEM.primary.main
                                        }}
                                    ></div>
                                </div>
                                <p className="text-xs mt-2" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                                    {formatNumber(conservation_metrics.habitat_restoration_potential.current_restoration)} ha restored
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div 
                                    className="p-3 rounded-xl border"
                                    style={{ 
                                        backgroundColor: `${DESIGN_SYSTEM.status.info}10`,
                                        borderColor: `${DESIGN_SYSTEM.status.info}30`
                                    }}
                                >
                                    <CloudRain className="w-4 h-4 mb-2" style={{ color: DESIGN_SYSTEM.status.info }} />
                                    <p className="text-xs" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                                        Water Conservation
                                    </p>
                                    <p className="font-bold" style={{ color: DESIGN_SYSTEM.status.info }}>
                                        {conservation_metrics.water_conservation_potential}
                                    </p>
                                </div>
                                <div 
                                    className="p-3 rounded-xl border"
                                    style={{ 
                                        backgroundColor: `${DESIGN_SYSTEM.primary.main}10`,
                                        borderColor: `${DESIGN_SYSTEM.primary.main}30`
                                    }}
                                >
                                    <Mountain className="w-4 h-4 mb-2" style={{ color: DESIGN_SYSTEM.primary.main }} />
                                    <p className="text-xs" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                                        Deforestation Prevention
                                    </p>
                                    <p className="font-bold" style={{ color: DESIGN_SYSTEM.primary.main }}>
                                        {conservation_metrics.deforestation_prevention}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Environmental Impact */}
                    <div 
                        className="rounded-3xl shadow-lg p-6 text-white"
                        style={{
                            background: `linear-gradient(135deg, ${DESIGN_SYSTEM.primary.main} 0%, ${DESIGN_SYSTEM.primary.light} 100%)`
                        }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">Environmental Impact</h3>
                            <Leaf className="w-6 h-6" />
                        </div>
                        <div className="space-y-4">
                            <div 
                                className="flex items-center justify-between p-3 rounded-xl backdrop-blur-sm"
                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                            >
                                <div className="flex items-center gap-2">
                                    <Droplets className="w-4 h-4" />
                                    <span className="text-sm">Water Efficiency</span>
                                </div>
                                <span className="font-bold">
                                    {environmental_impact.water_management.efficiency.efficiency_score}/100
                                </span>
                            </div>
                            <div 
                                className="flex items-center justify-between p-3 rounded-xl backdrop-blur-sm"
                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                            >
                                <div className="flex items-center gap-2">
                                    <Factory className="w-4 h-4" />
                                    <span className="text-sm">Waste Recycled</span>
                                </div>
                                <span className="font-bold">
                                    {formatPercent(environmental_impact.waste_management.recycled_waste)}
                                </span>
                            </div>
                            <div 
                                className="flex items-center justify-between p-3 rounded-xl backdrop-blur-sm"
                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                            >
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    <span className="text-sm">Soil Health</span>
                                </div>
                                <span className="font-bold">
                                    {environmental_impact.soil_health.organic_matter}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Statistics Summary */}
            <div 
                className="bg-white rounded-2xl border p-6"
                style={{ borderColor: DESIGN_SYSTEM.neutral[200] }}
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold" style={{ color: DESIGN_SYSTEM.primary.main }}>
                        Key Statistics
                    </h3>
                    <Globe className="w-5 h-5" style={{ color: DESIGN_SYSTEM.neutral[500] }} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.primary.main }}>
                            {key_statistics.total_metrics_analyzed}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Metrics Analyzed
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.status.info }}>
                            {key_statistics.years_covered}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Years Covered
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.primary.light }}>
                            {key_statistics.biodiversity_metrics.endangered_species_count}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Endangered Species
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.status.danger }}>
                            {key_statistics.risk_metrics.deforestation_alerts_count}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Deforestation Alerts
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.secondary.main }}>
                            {key_statistics.social_governance_metrics.community_programs}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Community Programs
                        </p>
                    </div>
                </div>
            </div>

            {/* Graph Modal */}
            {selectedGraph && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" 
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                    onClick={() => setSelectedGraph(null)}
                >
                    <div 
                        className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div 
                            className="p-6 border-b"
                            style={{ 
                                borderColor: DESIGN_SYSTEM.neutral[200],
                                background: `linear-gradient(to right, ${DESIGN_SYSTEM.primary[50]}, ${DESIGN_SYSTEM.primary[100]})`
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold mb-1" style={{ color: DESIGN_SYSTEM.neutral[900] }}>
                                        {selectedGraph.title}
                                    </h3>
                                    <p style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                                        {selectedGraph.description}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        className="p-3 rounded-xl bg-white border transition-all"
                                        style={{ borderColor: DESIGN_SYSTEM.neutral[200] }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = DESIGN_SYSTEM.neutral[50]}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                                    >
                                        <Download className="w-5 h-5" style={{ color: DESIGN_SYSTEM.neutral[600] }} />
                                    </button>
                                    <button
                                        onClick={() => setSelectedGraph(null)}
                                        className="p-3 rounded-xl bg-white border transition-all"
                                        style={{ borderColor: DESIGN_SYSTEM.neutral[200] }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = DESIGN_SYSTEM.neutral[50]}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                                    >
                                        <X className="w-5 h-5" style={{ color: DESIGN_SYSTEM.neutral[600] }} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="h-[500px]">
                                {selectedGraph.component}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Metric Detail Modal */}
            {showMetricModal && selectedMetric && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" 
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                    onClick={() => setShowMetricModal(false)}
                >
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                        <div 
                            className="p-6 border-b text-white rounded-t-3xl"
                            style={{ 
                                borderColor: DESIGN_SYSTEM.neutral[200],
                                background: `linear-gradient(135deg, ${DESIGN_SYSTEM.primary.main} 0%, ${DESIGN_SYSTEM.primary.light} 100%)`
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold mb-1">{selectedMetric.title}</h3>
                                    <p className="text-emerald-50">Detailed metric information</p>
                                </div>
                                <button
                                    onClick={() => setShowMetricModal(false)}
                                    className="p-2 rounded-xl transition-all"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-8">
                            {selectedMetric.value && (
                                <div className="text-center mb-8">
                                    <div className="text-6xl font-bold" style={{ color: DESIGN_SYSTEM.primary.main }}>
                                        {typeof selectedMetric.value === 'number' ? selectedMetric.value.toFixed(2) : selectedMetric.value}
                                    </div>
                                    {selectedMetric.unit && (
                                        <div className="text-xl" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                                            {selectedMetric.unit}
                                        </div>
                                    )}
                                </div>
                            )}
                            {selectedMetric.rating && (
                                <div 
                                    className="p-4 rounded-xl border mb-4"
                                    style={{
                                        backgroundColor: `${DESIGN_SYSTEM.primary.main}10`,
                                        borderColor: `${DESIGN_SYSTEM.primary.main}30`
                                    }}
                                >
                                    <div className="flex items-center gap-2" style={{ color: DESIGN_SYSTEM.primary.dark }}>
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-semibold">Rating: {selectedMetric.rating}</span>
                                    </div>
                                </div>
                            )}
                            {selectedMetric.trend && (
                                <div 
                                    className="p-4 rounded-xl border mb-4"
                                    style={{
                                        backgroundColor: DESIGN_SYSTEM.neutral[50],
                                        borderColor: DESIGN_SYSTEM.neutral[200]
                                    }}
                                >
                                    <div className="flex items-center gap-2" style={{ color: DESIGN_SYSTEM.neutral[800] }}>
                                        {getTrendIcon(selectedMetric.trend)}
                                        <span className="font-semibold">Trend: {selectedMetric.trend}</span>
                                    </div>
                                </div>
                            )}
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
            )}
        </div>
    );
};

export default OverviewTab;