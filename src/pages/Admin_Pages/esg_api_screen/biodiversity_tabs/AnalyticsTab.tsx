import React, { useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler,
    ScatterController,
} from 'chart.js';
import {
    ResponsiveContainer,
    LineChart as RechartsLineChart,
    Line as RechartsLine,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend as RechartsLegend,
    AreaChart,
    Area,
    BarChart,
    Bar,
    ScatterChart,
    Scatter,
    ComposedChart,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Cell,
    ZAxis,
    PieChart as RechartsPieChart,
    Pie,
    Sector,
} from "recharts";

// Icons
import {
    TrendingUp,
    TrendingDown,
    Activity,
    Target,
    BarChart3,
    LineChart as LineChartIcon,
    PieChart as PieChartIcon,
    AreaChart as AreaChartIcon,
    ScatterChart as ScatterChartIcon,
    Radar as RadarIcon,
    GitBranch,
    Network,
    Filter,
    Search,
    Eye,
    Info,
    AlertTriangle,
    DollarSign,
    Clock,
    Gauge,
    ThermometerSun,
    CloudRain,
    Waves,
    Mountain,
    Sprout,
    X,
    Download,
    Share2,
    CheckCircle,
    Zap,
    Brain,
    TrendingUpDown,
    BadgeCheck,
    Lightbulb,
    ShieldCheck,
    BarChartHorizontal,
    Leaf,
    Trees,
    Globe,
    Droplets,
    Factory,
    Users,
    Shield,
    AlertCircle,
    Calendar,
    MapPin,
    ChevronRight,
    BarChart2,
    LandPlot,
    ArrowUpRight,
    ArrowDownRight,
    Maximize2,
} from "lucide-react";

// Enhanced Color Palette with Green Theme
const COLORS = {
    // Primary Greens
    primary: '#008000',           // Main brand green
    primaryDark: '#006400',       // Dark green
    primaryLight: '#10B981',      // Emerald green
    primaryPale: '#D1FAE5',       // Very light green

    // Accent Colors (complementary to green)
    accent: '#22C55E',            // Bright green
    accentGold: '#F59E0B',        // Warm gold (replaces harsh yellows)

    // Semantic Colors (green-tinted)
    success: '#10B981',           // Success green
    warning: '#FBBF24',           // Amber warning
    danger: '#EF4444',            // Red for critical alerts
    info: '#3B82F6',              // Blue for info

    // Chart Colors (harmonious green palette)
    chart1: '#008000',            // Primary green
    chart2: '#10B981',            // Emerald
    chart3: '#34D399',            // Light emerald
    chart4: '#6EE7B7',            // Pale green
    chart5: '#A7F3D0',            // Very pale green
    chart6: '#059669',            // Deep green

    // Neutral Colors
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',

    // Gradients
    gradientStart: '#047857',     // Forest green
    gradientMid: '#10B981',       // Emerald
    gradientEnd: '#34D399',       // Light emerald
};

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler,
    ScatterController
);

interface AnalyticsTabProps {
    biodiversityData: any;
    formatNumber: (num: number) => string;
    formatPercent: (num: number) => string;
    selectedYear: number | null;
    availableYears: number[];
    onMetricClick: (metric: any, modalType: string) => void;
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
    biodiversityData,
    formatNumber,
    formatPercent,
    onMetricClick,
}) => {
    const [selectedGraph, setSelectedGraph] = useState<any>(null);
    const [selectedTable, setSelectedTable] = useState<'statistical' | 'alerts' | 'metrics'>('statistical');
    const [selectedMetric, setSelectedMetric] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeInsightTab, setActiveInsightTab] = useState('trends');
    const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);
    const [expandedGraph, setExpandedGraph] = useState<string | null>(null);

    if (!biodiversityData) {
        return (
            <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl">
                <div className="text-center max-w-md p-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                        <BarChart3 className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">No Analytics Data Available</h3>
                    <p className="text-gray-600 leading-relaxed">Select a company to view detailed biodiversity analytics and insights.</p>
                </div>
            </div>
        );
    }

    const {
        deforestation_analysis,
        graphs,
        key_statistics,
        carbon_emission_accounting,
        biodiversity_assessment,
        land_use_metrics,
        environmental_impact,
        social_governance,
        esg_metrics,
        conservation_metrics,
    } = biodiversityData.data;

    // Helper function to get trend icon
    const getTrendIcon = (trend: string) => {
        switch (trend?.toLowerCase()) {
            case 'increasing':
            case 'improving':
                return <TrendingUp className="w-4 h-4 text-green-600" />;
            case 'decreasing':
            case 'declining':
                return <TrendingDown className="w-4 h-4 text-red-600" />;
            default:
                return <TrendingUpDown className="w-4 h-4 text-gray-600" />;
        }
    };

    // Prepare data for visualizations
    const prepareAnalyticsData = () => {
        // Deforestation Risk Timeline Data
        const deforestationRiskData = deforestation_analysis.yearly_risk.map((risk: any) => ({
            year: risk.year,
            riskScore: risk.risk_score,
            forestArea: risk.forest_area,
            agriArea: risk.agricultural_area,
            ndviScore: risk.ndvi_score,
        }));

        // Land Use Composition Data with Green Theme
        const landUseData = [
            { name: 'Forest', value: parseFloat(land_use_metrics.current_year.forest_coverage_percent), color: COLORS.chart1 },
            { name: 'Agriculture', value: land_use_metrics.current_year.agricultural_area, color: COLORS.accentGold },
            { name: 'Protected', value: parseFloat(land_use_metrics.current_year.protected_area_percent || '0'), color: COLORS.chart2 },
            { name: 'Other', value: 100 - parseFloat(land_use_metrics.current_year.forest_coverage_percent) - parseFloat(land_use_metrics.current_year.protected_area_percent || '0'), color: COLORS.gray400 },
        ];

        // NDVI Monthly Trend Data
        const ndviTrendData = carbon_emission_accounting.ndvi_analysis.monthly_trends.map((month: any) => ({
            month: month.month_name,
            ndvi: month.avg_ndvi,
            dataPoints: month.data_points,
        }));

        // Carbon Balance Trend Data
        const carbonData = carbon_emission_accounting.yearly_data.map((year: any) => ({
            year: year.year,
            sequestration: year.sequestration.total_tco2,
            emissions: year.emissions.total_tco2e,
            netBalance: year.emissions.net_balance,
        }));

        // Biodiversity Components Radar Data
        const biodiversityComponents = [
            { component: 'Environment', score: biodiversity_assessment.components.environmental.score, fullMark: 100 },
            { component: 'Social', score: biodiversity_assessment.components.social.score, fullMark: 100 },
            { component: 'Governance', score: biodiversity_assessment.components.governance.score, fullMark: 100 },
            { component: 'Conservation', score: biodiversity_assessment.components.conservation.score, fullMark: 100 },
        ];

        // Environmental Impact Correlation Data
        const correlationData = [
            { x: biodiversity_assessment.detailed_assessment.ndvi_analysis.score, y: carbon_emission_accounting.ndvi_analysis.overall_avg_ndvi, z: deforestation_analysis.risk_score, category: 'Vegetation' },
            { x: environmental_impact.water_management.efficiency.score, y: environmental_impact.soil_health.organic_matter, z: 50, category: 'Water & Soil' },
            { x: social_governance.community_engagement.engagement_level === 'High' ? 80 : 60, y: social_governance.governance_strength.compliance_audits, z: 30, category: 'Social' },
        ];

        // Deforestation Alerts Timeline
        const alertData = deforestation_analysis.deforestation_alerts.map((alert: any, index: number) => ({
            month: alert.date || `Alert ${index + 1}`,
            area: alert.area_affected || 0,
            confidence: alert.confidence === 'High' ? 1 : alert.confidence === 'Medium' ? 0.7 : 0.3,
        }));

        // Monthly Carbon Data
        const monthlyCarbonData = carbon_emission_accounting.yearly_data.flatMap((year: any) =>
            year.sequestration.monthly_data.map((month: any) => ({
                year: year.year,
                month: month.month_name,
                sequestration: month.total_co2,
                ndvi: month.ndvi_mean,
            }))
        );

        // Performance Metrics
        const performanceMetrics = [
            { metric: 'Biodiversity Score', value: biodiversity_assessment.overall_score, target: 80, unit: 'points' },
            { metric: 'Forest Coverage', value: parseFloat(land_use_metrics.current_year.forest_coverage_percent), target: 30, unit: '%' },
            { metric: 'Carbon Balance', value: key_statistics.carbon_metrics.net_carbon_balance, target: 0, unit: 'tCO₂' },
            { metric: 'Risk Score', value: deforestation_analysis.risk_score, target: 30, unit: 'points' },
            { metric: 'Community Programs', value: social_governance.community_engagement.programs_count, target: 5, unit: 'programs' },
        ];

        return {
            deforestationRiskData,
            landUseData,
            ndviTrendData,
            carbonData,
            biodiversityComponents,
            correlationData,
            alertData,
            monthlyCarbonData,
            performanceMetrics,
        };
    };

    const analyticsData = prepareAnalyticsData();

    // Graph configurations with enhanced styling
    const analyticsGraphs = [
        {
            id: 'deforestation-risk',
            title: 'Deforestation Risk Timeline',
            description: 'Track deforestation risk scores over time with forest area changes',
            icon: <LineChartIcon className="w-5 h-5" />,
            type: 'composed',
            data: analyticsData.deforestationRiskData,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={analyticsData.deforestationRiskData}>
                        <defs>
                            <linearGradient id="forestGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={COLORS.chart1} stopOpacity={0.8} />
                                <stop offset="100%" stopColor={COLORS.chart1} stopOpacity={0.2} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray200} strokeOpacity={0.5} />
                        <XAxis dataKey="year" stroke={COLORS.gray600} style={{ fontSize: '13px', fontWeight: 500 }} />
                        <YAxis yAxisId="left" stroke={COLORS.gray600} style={{ fontSize: '13px', fontWeight: 500 }} />
                        <YAxis yAxisId="right" orientation="right" stroke={COLORS.gray600} style={{ fontSize: '13px', fontWeight: 500 }} />
                        <RechartsTooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                border: `1px solid ${COLORS.gray200}`,
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                                padding: '12px'
                            }}
                            formatter={(value: any, name: any) => [
                                formatNumber(value),
                                name === 'riskScore' ? 'Risk Score' : name === 'forestArea' ? 'Forest Area (ha)' : 'NDVI Score'
                            ]}
                        />
                        <RechartsLegend wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 500 }} />
                        <Bar yAxisId="left" dataKey="forestArea" fill="url(#forestGradient)" name="Forest Area" radius={[8, 8, 0, 0]} />
                        <RechartsLine yAxisId="right" type="monotone" dataKey="riskScore" stroke={COLORS.danger} strokeWidth={3} dot={{ r: 6, fill: COLORS.danger, strokeWidth: 2, stroke: '#fff' }} name="Risk Score" />
                        <RechartsLine yAxisId="right" type="monotone" dataKey="ndviScore" stroke={COLORS.info} strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 5 }} name="NDVI Score" />
                    </ComposedChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'land-use-composition',
            title: 'Land Use Composition',
            description: 'Distribution of land types including forest, agriculture, and protected areas',
            icon: <PieChartIcon className="w-5 h-5" />,
            type: 'pie',
            data: analyticsData.landUseData,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                        <defs>
                            <filter id="shadow">
                                <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.15" />
                            </filter>
                        </defs>
                        <Pie
                            data={analyticsData.landUseData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={110}
                            paddingAngle={3}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                            labelLine={{ stroke: COLORS.gray400, strokeWidth: 1 }}
                            style={{ filter: 'url(#shadow)' }}
                        >
                            {analyticsData.landUseData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={3} />
                            ))}
                        </Pie>
                        <RechartsTooltip
                            formatter={(value) => [`${value}%`, 'Percentage']}
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                border: `1px solid ${COLORS.gray200}`,
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                                padding: '12px'
                            }}
                        />
                        <RechartsLegend wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 500 }} />
                    </RechartsPieChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'carbon-balance',
            title: 'Carbon Balance Analysis',
            description: 'Carbon sequestration vs emissions over time',
            icon: <BarChart3 className="w-5 h-5" />,
            type: 'area',
            data: analyticsData.carbonData,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData.carbonData}>
                        <defs>
                            <linearGradient id="colorSequestration" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.chart2} stopOpacity={0.9} />
                                <stop offset="95%" stopColor={COLORS.chart2} stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray200} strokeOpacity={0.5} />
                        <XAxis dataKey="year" stroke={COLORS.gray600} style={{ fontSize: '13px', fontWeight: 500 }} />
                        <YAxis stroke={COLORS.gray600} style={{ fontSize: '13px', fontWeight: 500 }} />
                        <RechartsTooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                border: `1px solid ${COLORS.gray200}`,
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                                padding: '12px'
                            }}
                            formatter={(value: any) => formatNumber(value)}
                        />
                        <RechartsLegend wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 500 }} />
                        <Area type="monotone" dataKey="sequestration" stroke={COLORS.chart2} strokeWidth={2.5} fillOpacity={1} fill="url(#colorSequestration)" name="Sequestration" />
                        <Area type="monotone" dataKey="emissions" stroke={COLORS.danger} strokeWidth={2.5} fillOpacity={1} fill="url(#colorEmissions)" name="Emissions" />
                        <RechartsLine type="monotone" dataKey="netBalance" stroke={COLORS.info} strokeWidth={3} dot={{ r: 6, fill: COLORS.info, strokeWidth: 2, stroke: '#fff' }} name="Net Balance" />
                    </AreaChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'biodiversity-components',
            title: 'Biodiversity Assessment',
            description: 'Performance across environmental, social, governance, and conservation components',
            icon: <RadarIcon className="w-5 h-5" />,
            type: 'radar',
            data: analyticsData.biodiversityComponents,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={analyticsData.biodiversityComponents}>
                        <defs>
                            <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={COLORS.chart1} stopOpacity={0.8} />
                                <stop offset="100%" stopColor={COLORS.chart3} stopOpacity={0.3} />
                            </linearGradient>
                        </defs>
                        <PolarGrid stroke={COLORS.gray300} strokeWidth={1.5} />
                        <PolarAngleAxis
                            dataKey="component"
                            style={{ fontSize: '13px', fontWeight: 600, fill: COLORS.gray700 }}
                        />
                        <PolarRadiusAxis
                            domain={[0, 100]}
                            style={{ fontSize: '12px', fill: COLORS.gray600 }}
                            stroke={COLORS.gray300}
                        />
                        <Radar
                            name="Score"
                            dataKey="score"
                            stroke={COLORS.primary}
                            fill="url(#radarGradient)"
                            fillOpacity={0.7}
                            strokeWidth={3}
                        />
                        <RechartsTooltip
                            formatter={(value) => [`${value} points`, 'Score']}
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                border: `1px solid ${COLORS.gray200}`,
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                                padding: '12px'
                            }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'ndvi-trend',
            title: 'Vegetation Health (NDVI)',
            description: 'Monthly NDVI trends showing vegetation health throughout the year',
            icon: <Sprout className="w-5 h-5" />,
            type: 'line',
            data: analyticsData.ndviTrendData,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={analyticsData.ndviTrendData}>
                        <defs>
                            <linearGradient id="ndviGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor={COLORS.chart1} />
                                <stop offset="50%" stopColor={COLORS.chart2} />
                                <stop offset="100%" stopColor={COLORS.chart3} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray200} strokeOpacity={0.5} />
                        <XAxis dataKey="month" stroke={COLORS.gray600} style={{ fontSize: '13px', fontWeight: 500 }} />
                        <YAxis stroke={COLORS.gray600} style={{ fontSize: '13px', fontWeight: 500 }} />
                        <RechartsTooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                border: `1px solid ${COLORS.gray200}`,
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                                padding: '12px'
                            }}
                            formatter={(value: any) => value.toFixed(3)}
                        />
                        <RechartsLegend wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 500 }} />
                        <RechartsLine
                            type="monotone"
                            dataKey="ndvi"
                            stroke="url(#ndviGradient)"
                            strokeWidth={3.5}
                            dot={{ r: 6, fill: COLORS.chart2, strokeWidth: 2, stroke: '#fff' }}
                            name="NDVI Index"
                            activeDot={{ r: 8, strokeWidth: 3 }}
                        />
                    </RechartsLineChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'correlation-analysis',
            title: 'Environmental Correlations',
            description: 'Relationships between biodiversity, vegetation health, and carbon metrics',
            icon: <GitBranch className="w-5 h-5" />,
            type: 'scatter',
            data: analyticsData.correlationData,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray200} strokeOpacity={0.5} />
                        <XAxis type="number" dataKey="x" name="Biodiversity Score" stroke={COLORS.gray600} style={{ fontSize: '13px', fontWeight: 500 }} />
                        <YAxis type="number" dataKey="y" name="Vegetation Health" stroke={COLORS.gray600} style={{ fontSize: '13px', fontWeight: 500 }} />
                        <ZAxis type="number" range={[100, 500]} dataKey="z" name="Risk Score" />
                        <RechartsTooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                border: `1px solid ${COLORS.gray200}`,
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                                padding: '12px'
                            }}
                            cursor={{ strokeDasharray: '3 3', stroke: COLORS.primary }}
                        />
                        <Scatter
                            name="Data Points"
                            data={analyticsData.correlationData}
                            fill={COLORS.chart2}
                            shape="circle"
                            stroke={COLORS.primary}
                            strokeWidth={2}
                        />
                    </ScatterChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'monthly-carbon',
            title: 'Monthly Carbon Flow',
            description: 'Monthly carbon sequestration and vegetation health patterns',
            icon: <Activity className="w-5 h-5" />,
            type: 'composed',
            data: analyticsData.monthlyCarbonData.slice(0, 12),
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={analyticsData.monthlyCarbonData.slice(0, 12)}>
                        <defs>
                            <linearGradient id="carbonGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={COLORS.chart3} stopOpacity={0.9} />
                                <stop offset="100%" stopColor={COLORS.chart4} stopOpacity={0.3} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray200} strokeOpacity={0.5} />
                        <XAxis dataKey="month" stroke={COLORS.gray600} style={{ fontSize: '13px', fontWeight: 500 }} />
                        <YAxis yAxisId="left" stroke={COLORS.gray600} style={{ fontSize: '13px', fontWeight: 500 }} />
                        <YAxis yAxisId="right" orientation="right" stroke={COLORS.gray600} style={{ fontSize: '13px', fontWeight: 500 }} />
                        <RechartsTooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                border: `1px solid ${COLORS.gray200}`,
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                                padding: '12px'
                            }}
                        />
                        <RechartsLegend wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 500 }} />
                        <Bar yAxisId="left" dataKey="sequestration" fill="url(#carbonGradient)" name="Sequestration (tCO₂)" radius={[8, 8, 0, 0]} />
                        <RechartsLine yAxisId="right" type="monotone" dataKey="ndvi" stroke={COLORS.info} strokeWidth={3} dot={{ r: 5, fill: COLORS.info, strokeWidth: 2, stroke: '#fff' }} name="NDVI Index" />
                    </ComposedChart>
                </ResponsiveContainer>
            )
        },
        {
            id: 'performance-metrics',
            title: 'Performance Dashboard',
            description: 'Key metrics compared to targets',
            icon: <Target className="w-5 h-5" />,
            type: 'bar',
            data: analyticsData.performanceMetrics,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.performanceMetrics}>
                        <defs>
                            <linearGradient id="barGradient1" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={COLORS.chart1} stopOpacity={0.9} />
                                <stop offset="100%" stopColor={COLORS.chart2} stopOpacity={0.7} />
                            </linearGradient>
                            <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={COLORS.accentGold} stopOpacity={0.8} />
                                <stop offset="100%" stopColor={COLORS.warning} stopOpacity={0.6} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray200} strokeOpacity={0.5} />
                        <XAxis dataKey="metric" angle={-45} textAnchor="end" height={100} stroke={COLORS.gray600} style={{ fontSize: '12px', fontWeight: 500 }} />
                        <YAxis stroke={COLORS.gray600} style={{ fontSize: '13px', fontWeight: 500 }} />
                        <RechartsTooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                border: `1px solid ${COLORS.gray200}`,
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                                padding: '12px'
                            }}
                            formatter={(value, name) => [value, name]}
                        />
                        <RechartsLegend wrapperStyle={{ paddingTop: '10px', fontSize: '13px', fontWeight: 500 }} />
                        <Bar dataKey="value" fill="url(#barGradient1)" name="Current Value" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="target" fill="url(#barGradient2)" name="Target" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )
        },
    ];

    // Table columns configuration
    const tableColumns = {
        statistical: [
            { key: 'year', header: 'Year' },
            { key: 'riskScore', header: 'Risk Score', accessor: (row: any) => row.riskScore },
            { key: 'forestArea', header: 'Forest Area (ha)', accessor: (row: any) => formatNumber(row.forestArea) },
            { key: 'agriArea', header: 'Agriculture Area (ha)', accessor: (row: any) => formatNumber(row.agriArea) },
            { key: 'ndviScore', header: 'NDVI Score', accessor: (row: any) => row.ndviScore.toFixed(2) },
        ],
        alerts: [
            { key: 'date', header: 'Date' },
            { key: 'location', header: 'Location' },
            { key: 'area', header: 'Area Affected', accessor: (row: any) => row.area ? `${formatNumber(row.area)} ha` : 'N/A' },
            {
                key: 'confidence',
                header: 'Confidence',
                accessor: (row: any) => (
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${row.confidence === 1 ? 'bg-red-100 text-red-700' :
                        row.confidence === 0.7 ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                        {row.confidence === 1 ? 'High' : row.confidence === 0.7 ? 'Medium' : 'Low'}
                    </span>
                )
            },
        ],
        metrics: [
            { key: 'metric', header: 'Metric', className: 'font-semibold' },
            { key: 'value', header: 'Current Value' },
            { key: 'target', header: 'Target' },
            { key: 'unit', header: 'Unit' },
            {
                key: 'status',
                header: 'Status',
                accessor: (row: any) => (
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${row.value >= row.target ? 'bg-green-100 text-green-700' :
                        'bg-amber-100 text-amber-700'
                        }`}>
                        {row.value >= row.target ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                        {row.value >= row.target ? 'Meeting Target' : 'Below Target'}
                    </span>
                )
            },
        ],
    };

    // Key insights data
    const insights = {
        trends: [
            {
                title: 'Deforestation Risk Trend',
                description: 'Risk score decreased by 15% over the last 3 years due to improved conservation efforts',
                icon: <Trees className="w-5 h-5 text-green-600" />,
                impact: 'High',
                confidence: 0.85,
            },
            {
                title: 'Carbon Sink Strength',
                description: 'Net carbon balance remains negative, indicating strong carbon sequestration',
                icon: <Leaf className="w-5 h-5 text-green-600" />,
                impact: 'High',
                confidence: 0.92,
            },
            {
                title: 'Biodiversity Improvement',
                description: 'Overall biodiversity score increased by 8 points this year',
                icon: <Sprout className="w-5 h-5 text-green-600" />,
                impact: 'Medium',
                confidence: 0.78,
            },
        ],
        risks: [
            {
                title: 'Deforestation Alerts',
                description: `${deforestation_analysis.deforestation_alerts.length} high-confidence alerts detected this year`,
                icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
                priority: 'High',
                timeframe: 'Immediate',
            },
            {
                title: 'Agricultural Expansion',
                description: `Agricultural area increased by ${land_use_metrics.change_analysis.agricultural_area?.change || 0}%`,
                icon: <LandPlot className="w-5 h-5 text-amber-600" />,
                priority: 'Medium',
                timeframe: 'Monitor',
            },
        ],
        opportunities: [
            {
                title: 'Carbon Credit Potential',
                description: `Potential ${formatNumber(key_statistics.carbon_metrics.total_sequestration * 0.1)} carbon credits annually`,
                icon: <DollarSign className="w-5 h-5 text-green-600" />,
                value: 'High',
                timeframe: '1-2 years',
            },
            {
                title: 'Conservation Partnerships',
                description: 'Strong governance foundation enables conservation partnerships',
                icon: <Users className="w-5 h-5 text-blue-600" />,
                value: 'Medium',
                timeframe: 'Ongoing',
            },
        ],
    };

    // Simplified explanation for non-ESG users
    const simpleExplanations = {
        'Biodiversity Score': 'Overall health of plants and animals in the area',
        'Deforestation Risk': 'How likely forests are being cut down',
        'Carbon Balance': 'Difference between carbon stored and carbon released',
        'NDVI': 'Measure of how green and healthy the vegetation is',
        'Forest Coverage': 'Percentage of land covered by forests',
        'Carbon Sequestration': 'How much carbon is being captured and stored',
        'Protected Areas': 'Land officially protected for conservation',
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Enhanced Hero Section with Green Gradient */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-green-600 to-teal-600 p-10 text-white shadow-2xl">
                {/* Animated Background Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>
                <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-emerald-300/10 rounded-full blur-2xl"></div>

                <div className="relative z-10">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-10 gap-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-md shadow-lg">
                                    <Trees className="w-10 h-10" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold mb-2 tracking-tight">Biodiversity Analytics</h1>
                                    <p className="text-green-100 text-lg font-medium">Track conservation efforts and environmental impact</p>
                                </div>
                            </div>

                            {/* Enhanced Metric Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                <div className="group bg-white/15 backdrop-blur-md rounded-2xl p-5 hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-pointer shadow-lg">
                                    <p className="text-sm text-green-100 mb-2 font-medium">Biodiversity Score</p>
                                    <div className="flex items-end gap-2 mb-2">
                                        <p className="text-3xl font-bold">
                                            {Number(biodiversity_assessment.overall_score).toFixed(2)}
                                        </p>
                                        <p className="text-lg font-semibold text-green-200">/100</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 bg-white/25 rounded-lg text-xs font-bold">
                                            {biodiversity_assessment.rating}
                                        </span>
                                        <TrendingUp className="w-4 h-4 text-green-200" />
                                    </div>
                                </div>

                                <div className={`group bg-white/15 backdrop-blur-md rounded-2xl p-5 hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-pointer shadow-lg ${deforestation_analysis.risk_level === 'High' ? 'ring-2 ring-red-300/50' : ''
                                    }`}>
                                    <p className="text-sm text-green-100 mb-2 font-medium">Risk Level</p>
                                    <p className={`text-3xl font-bold mb-2 ${deforestation_analysis.risk_level === 'High' ? 'text-red-200' :
                                            deforestation_analysis.risk_level === 'Medium' ? 'text-amber-200' : 'text-green-200'
                                        }`}>
                                        {deforestation_analysis.risk_level}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 bg-white/25 rounded-lg text-xs font-bold">
                                            Score: {deforestation_analysis.risk_score}
                                        </span>
                                        {deforestation_analysis.risk_level === 'High' && <AlertTriangle className="w-4 h-4 text-red-200" />}
                                    </div>
                                </div>

                                <div className="group bg-white/15 backdrop-blur-md rounded-2xl p-5 hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-pointer shadow-lg">
                                    <p className="text-sm text-green-100 mb-2 font-medium">Forest Coverage</p>
                                    <div className="flex items-end gap-2 mb-2">
                                        <p className="text-3xl font-bold">{land_use_metrics.current_year.forest_coverage_percent}</p>
                                        <p className="text-lg font-semibold text-green-200">%</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getTrendIcon(land_use_metrics.trends.forest_area_trend)}
                                        <span className="text-xs font-bold text-green-200">
                                            {land_use_metrics.trends.forest_area_trend}
                                        </span>
                                    </div>
                                </div>

                                <div className="group bg-white/15 backdrop-blur-md rounded-2xl p-5 hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-pointer shadow-lg">
                                    <p className="text-sm text-green-100 mb-2 font-medium">Carbon Balance</p>
                                    <p className={`text-3xl font-bold mb-2 ${key_statistics.carbon_metrics.net_carbon_balance >= 0 ? 'text-red-200' : 'text-green-200'
                                        }`}>
                                        {formatNumber(key_statistics.carbon_metrics.net_carbon_balance)}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 bg-white/25 rounded-lg text-xs font-bold">
                                            {key_statistics.carbon_metrics.net_carbon_balance >= 0 ? 'Net Source' : 'Net Sink'}
                                        </span>
                                        <Leaf className="w-4 h-4 text-green-200" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowRecommendationsModal(true)}
                            className="group px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl font-bold transition-all duration-300 flex items-center gap-3 whitespace-nowrap shadow-xl hover:shadow-2xl hover:scale-105"
                        >
                            <Lightbulb className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                            Get Recommendations
                            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Enhanced Key Insights Section */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10 hover:shadow-2xl transition-shadow duration-300">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                            Key Insights
                        </h3>
                        <p className="text-gray-600 text-lg">What your biodiversity data is telling you</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <button
                            onClick={() => setActiveInsightTab('trends')}
                            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${activeInsightTab === 'trends'
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200 scale-105'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Trends
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveInsightTab('risks')}
                            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${activeInsightTab === 'risks'
                                    ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg shadow-red-200 scale-105'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Risks & Alerts
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveInsightTab('opportunities')}
                            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${activeInsightTab === 'opportunities'
                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-200 scale-105'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                Opportunities
                            </div>
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(activeInsightTab === 'trends' ? insights.trends :
                        activeInsightTab === 'risks' ? insights.risks :
                            insights.opportunities).map((insight, index) => (
                                <div
                                    key={index}
                                    className="group p-7 rounded-3xl border-2 border-gray-200 hover:border-green-400 bg-gradient-to-br from-white to-gray-50 hover:from-green-50 hover:to-emerald-50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                                >
                                    <div className="flex items-start gap-4 mb-5">
                                        <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-green-100 group-hover:to-emerald-100 transition-all duration-300 group-hover:scale-110">
                                            {insight.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-green-700 transition-colors">
                                                {insight.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {insight.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                        <span className={`px-4 py-2 rounded-xl text-xs font-bold ${(insight.impact || insight.priority || insight.value) === 'High'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {insight.impact || insight.priority || insight.value}
                                        </span>
                                        <span className="text-xs text-gray-500 font-semibold">
                                            {insight.timeframe || `${('confidence' in insight ? insight.confidence * 100 : 85).toFixed(0)}% confidence`}
                                        </span>
                                    </div>
                                </div>
                            ))}
                </div>
            </div>

            {/* Enhanced Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {analyticsGraphs.map((graph) => (
                    <div
                        key={graph.id}
                        className={`group bg-white rounded-3xl border-2 border-gray-200 hover:border-green-300 shadow-lg hover:shadow-2xl p-8 transition-all duration-300 ${expandedGraph === graph.id ? 'lg:col-span-2' : ''
                            }`}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 group-hover:from-green-200 group-hover:to-emerald-200 transition-all">
                                    {graph.icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                                        {graph.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">{graph.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setExpandedGraph(expandedGraph === graph.id ? null : graph.id)}
                                    className="p-3 rounded-xl bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-700 transition-all duration-200 hover:scale-110"
                                    title={expandedGraph === graph.id ? "Collapse" : "Expand"}
                                >
                                    {expandedGraph === graph.id ? (
                                        <X className="w-5 h-5" />
                                    ) : (
                                        <Maximize2 className="w-5 h-5" />
                                    )}
                                </button>
                                <button
                                    onClick={() => setSelectedGraph(graph)}
                                    className="p-3 rounded-xl bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-700 transition-all duration-200 hover:scale-110"
                                    title="View Details"
                                >
                                    <Info className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className={`${expandedGraph === graph.id ? 'h-[500px]' : 'h-[320px]'} transition-all duration-300 rounded-2xl overflow-hidden`}>
                            {graph.component}
                        </div>

                        <div className="mt-6 pt-6 border-t-2 border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl font-medium">
                                        <Activity className="w-4 h-4 text-green-600" />
                                        {graph.data.length} data points
                                    </span>
                                </div>
                                <button
                                    onClick={() => onMetricClick(graph.data, graph.title)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                                >
                                    View Details
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Enhanced Data Tables Section */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10 hover:shadow-2xl transition-shadow duration-300">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                            Data Analysis
                        </h3>
                        <p className="text-gray-600 text-lg">Detailed breakdown of biodiversity metrics</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSelectedTable('statistical')}
                            className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${selectedTable === 'statistical'
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200 scale-105'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                                }`}
                        >
                            Yearly Trends
                        </button>
                        <button
                            onClick={() => setSelectedTable('alerts')}
                            className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${selectedTable === 'alerts'
                                    ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg shadow-red-200 scale-105'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                                }`}
                        >
                            Deforestation Alerts
                        </button>
                        <button
                            onClick={() => setSelectedTable('metrics')}
                            className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${selectedTable === 'metrics'
                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-200 scale-105'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                                }`}
                        >
                            Performance Metrics
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border-2 border-gray-100">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
                            <tr className="border-b-2 border-green-100">
                                {tableColumns[selectedTable].map((column) => (
                                    <th key={column.key} className="text-left py-5 px-6 text-gray-700 font-bold text-sm uppercase tracking-wide">
                                        {column.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(selectedTable === 'statistical' ? analyticsData.deforestationRiskData :
                                selectedTable === 'alerts' ? deforestation_analysis.deforestation_alerts :
                                    analyticsData.performanceMetrics).map((row: any, index: number) => (
                                        <tr
                                            key={index}
                                            className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 cursor-pointer transition-all duration-200"
                                            onClick={() => {
                                                setSelectedMetric(row);
                                                setIsModalOpen(true);
                                            }}
                                        >
                                            {tableColumns[selectedTable].map((column) => (
                                                <td key={column.key} className="py-5 px-6 text-gray-700 font-medium">
                                                    {column.accessor ? column.accessor(row) : row[column.key]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl">
                    <p className="text-sm text-gray-700 font-medium flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Showing {
                            selectedTable === 'statistical' ? analyticsData.deforestationRiskData.length :
                                selectedTable === 'alerts' ? deforestation_analysis.deforestation_alerts.length :
                                    analyticsData.performanceMetrics.length
                        } records • Click any row for detailed analysis
                    </p>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-green-300 text-gray-700 hover:text-green-700 text-sm font-bold transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md">
                            <Download className="w-4 h-4" />
                            Export Data
                        </button>
                        <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm font-bold transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg">
                            <Share2 className="w-4 h-4" />
                            Share Report
                        </button>
                    </div>
                </div>
            </div>

            {/* Enhanced Simplified Explanations */}
            <div className="bg-gradient-to-br from-white to-green-50 rounded-3xl border-2 border-green-100 shadow-xl p-10 hover:shadow-2xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 shadow-lg">
                            <Info className="w-8 h-8 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-2">In Simple Terms</h3>
                            <p className="text-gray-600 text-lg">Understanding biodiversity metrics made easy</p>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(simpleExplanations).map(([term, explanation], index) => (
                        <div
                            key={index}
                            className="group p-7 rounded-3xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 hover:border-green-400 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-4 rounded-2xl bg-white shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                                    <Leaf className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-green-700 transition-colors">
                                        {term}
                                    </h4>
                                    <p className="text-gray-700 leading-relaxed font-medium">{explanation}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Enhanced Confidence and Methodology Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                                Data Confidence
                            </h3>
                            <p className="text-gray-600">How reliable is this data?</p>
                        </div>
                        <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl">
                            <ShieldCheck className="w-7 h-7 text-green-600" />
                            <span className="text-4xl font-bold text-green-600">
                                {biodiversityData.data.metadata.data_quality?.confidence_score || 85}%
                            </span>
                        </div>
                    </div>
                    <div className="space-y-6">
                        {[
                            { label: 'Data Completeness', value: 92, color: 'from-green-500 to-emerald-600' },
                            { label: 'Source Reliability', value: 88, color: 'from-blue-500 to-cyan-600' },
                            { label: 'Update Frequency', value: 75, color: 'from-amber-500 to-yellow-600' },
                            { label: 'Verification Level', value: 80, color: 'from-purple-500 to-pink-600' },
                        ].map((item, index) => (
                            <div key={index}>
                                <div className="flex justify-between mb-3">
                                    <span className="text-sm font-bold text-gray-700">{item.label}</span>
                                    <span className="text-sm font-bold text-gray-900">{item.value}%</span>
                                </div>
                                <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-1000 shadow-md`}
                                        style={{ width: `${item.value}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                                Methodology
                            </h3>
                            <p className="text-gray-600">How we calculate these metrics</p>
                        </div>
                        <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl">
                            <BadgeCheck className="w-7 h-7 text-green-600" />
                        </div>
                    </div>
                    <div className="space-y-5">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg">
                            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-3 text-lg">
                                <BarChartHorizontal className="w-6 h-6 text-green-600" />
                                Data Sources
                            </h4>
                            <ul className="space-y-3">
                                {biodiversityData.data.metadata.data_sources.map((source: string, index: number) => (
                                    <li key={index} className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span>{source}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg">
                            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-3 text-lg">
                                <Target className="w-6 h-6 text-blue-600" />
                                Calculation Methods
                            </h4>
                            <ul className="space-y-3">
                                {biodiversityData.data.metadata.calculation_methods.map((method: string, index: number) => (
                                    <li key={index} className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <span>{method}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Graph Detail Modal */}
            {selectedGraph && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-fadeIn" onClick={() => setSelectedGraph(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden animate-slideUp" onClick={(e) => e.stopPropagation()}>
                        <div className="p-8 border-b-2 border-green-100 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-white shadow-lg">
                                        {selectedGraph.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-bold text-gray-900">{selectedGraph.title}</h3>
                                        <p className="text-gray-600 mt-1 text-lg">{selectedGraph.description}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button className="p-4 rounded-2xl bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-green-300 transition-all hover:scale-110">
                                        <Download className="w-5 h-5 text-gray-600" />
                                    </button>
                                    <button
                                        onClick={() => setSelectedGraph(null)}
                                        className="p-4 rounded-2xl bg-white hover:bg-red-50 border-2 border-gray-200 hover:border-red-300 transition-all hover:scale-110"
                                    >
                                        <X className="w-5 h-5 text-gray-600 hover:text-red-600" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-10">
                            <div className="h-[500px] mb-8 rounded-2xl overflow-hidden bg-gray-50 p-4">
                                {selectedGraph.component}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                {[
                                    { label: 'Data Points', value: selectedGraph.data.length, icon: <Activity className="w-5 h-5 text-green-600" /> },
                                    { label: 'Time Range', value: `${selectedGraph.data.length} periods`, icon: <Clock className="w-5 h-5 text-blue-600" /> },
                                    { label: 'Last Updated', value: 'Today', icon: <Calendar className="w-5 h-5 text-purple-600" /> },
                                    { label: 'Confidence', value: '85%', icon: <ShieldCheck className="w-5 h-5 text-emerald-600" /> },
                                ].map((stat, index) => (
                                    <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border-2 border-gray-200 hover:border-green-300 transition-all hover:shadow-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            {stat.icon}
                                            <p className="text-sm text-gray-600 font-semibold">{stat.label}</p>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Metric Detail Modal */}
            {isModalOpen && selectedMetric && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-fadeIn" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full animate-slideUp" onClick={(e) => e.stopPropagation()}>
                        <div className="p-8 border-b-2 border-green-100 bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 text-white rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-3xl font-bold mb-2">Metric Details</h3>
                                    <p className="text-green-100 text-lg">Detailed information and insights</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-3 rounded-2xl bg-white/20 hover:bg-white/30 transition-all hover:scale-110"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-10">
                            <div className="space-y-5">
                                {Object.entries(selectedMetric).map(([key, value]) => (
                                    <div key={key} className="p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 hover:border-green-300 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 transition-all">
                                        <div className="text-sm text-gray-600 mb-2 capitalize font-semibold">{key.replace(/_/g, ' ')}</div>
                                        <div className="font-bold text-gray-900 text-lg">
                                            {typeof value === 'number' ? formatNumber(value) : String(value)}
                                        </div>
                                        {simpleExplanations[key] && (
                                            <div className="text-xs text-gray-600 mt-3 flex items-center gap-2 p-3 bg-white rounded-xl">
                                                <Info className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                <span className="font-medium">{simpleExplanations[key]}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 pt-8 border-t-2 border-gray-200">
                                <h4 className="font-bold text-gray-900 mb-4 text-xl flex items-center gap-2">
                                    <Lightbulb className="w-6 h-6 text-green-600" />
                                    What This Means
                                </h4>
                                <p className="text-gray-700 leading-relaxed font-medium">
                                    This metric helps track your environmental impact. Improvements indicate better conservation efforts,
                                    while declines may require intervention to protect biodiversity.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recommendations Modal */}
            {showRecommendationsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-fadeIn" onClick={() => setShowRecommendationsModal(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-slideUp" onClick={(e) => e.stopPropagation()}>
                        <div className="p-8 border-b-2 border-green-100 bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 text-white rounded-t-3xl sticky top-0 z-10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-md">
                                        <Lightbulb className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-bold">Action Recommendations</h3>
                                        <p className="text-green-100 text-lg mt-1">Based on your biodiversity analytics</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowRecommendationsModal(false)}
                                    className="p-3 rounded-2xl bg-white/20 hover:bg-white/30 transition-all hover:scale-110"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-10 space-y-6">
                            {[
                                {
                                    title: 'Increase Forest Monitoring',
                                    description: 'Implement monthly satellite monitoring to detect deforestation early',
                                    impact: 'High',
                                    effort: 'Medium',
                                    timeframe: '1 month',
                                    icon: <Trees className="w-6 h-6 text-green-600" />,
                                    color: 'green',
                                },
                                {
                                    title: 'Expand Protected Areas',
                                    description: `Increase protected area coverage from ${land_use_metrics.current_year.protected_area_percent}% to 15%`,
                                    impact: 'High',
                                    effort: 'High',
                                    timeframe: '6 months',
                                    icon: <Shield className="w-6 h-6 text-blue-600" />,
                                    color: 'blue',
                                },
                                {
                                    title: 'Carbon Credit Registration',
                                    description: 'Register for carbon credits based on your negative carbon balance',
                                    impact: 'Medium',
                                    effort: 'Low',
                                    timeframe: '3 months',
                                    icon: <DollarSign className="w-6 h-6 text-amber-600" />,
                                    color: 'amber',
                                },
                                {
                                    title: 'Community Engagement Program',
                                    description: 'Start 2 new community conservation programs to improve social score',
                                    impact: 'Medium',
                                    effort: 'Medium',
                                    timeframe: '2 months',
                                    icon: <Users className="w-6 h-6 text-purple-600" />,
                                    color: 'purple',
                                },
                            ].map((recommendation, index) => (
                                <div key={index} className={`group p-8 rounded-3xl border-2 border-${recommendation.color}-200 bg-gradient-to-br from-white to-${recommendation.color}-50 hover:border-${recommendation.color}-400 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
                                    <div className="flex items-start gap-6">
                                        <div className={`p-4 rounded-2xl bg-${recommendation.color}-100 group-hover:bg-${recommendation.color}-200 transition-all group-hover:scale-110`}>
                                            {recommendation.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-xl text-gray-900 mb-3">{recommendation.title}</h4>
                                            <p className="text-gray-700 leading-relaxed mb-5 font-medium">{recommendation.description}</p>
                                            <div className="flex items-center gap-4 flex-wrap">
                                                <span className={`px-4 py-2 bg-green-100 text-green-800 rounded-xl text-sm font-bold`}>
                                                    Impact: {recommendation.impact}
                                                </span>
                                                <span className={`px-4 py-2 bg-blue-100 text-blue-800 rounded-xl text-sm font-bold`}>
                                                    Effort: {recommendation.effort}
                                                </span>
                                                <span className={`px-4 py-2 bg-amber-100 text-amber-800 rounded-xl text-sm font-bold`}>
                                                    Time: {recommendation.timeframe}
                                                </span>
                                            </div>
                                        </div>
                                        <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all font-bold hover:scale-105 shadow-lg hover:shadow-xl">
                                            Start
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default AnalyticsTab;