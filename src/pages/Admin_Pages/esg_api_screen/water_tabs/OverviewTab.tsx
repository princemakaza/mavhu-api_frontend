import React, { useState, useMemo } from 'react';
import {
    Droplet,
    Waves,
    CloudRain,
    Thermometer,
    Wind,
    Factory,
    AlertTriangle,
    Shield,
    Target,
    MapPin,
    Globe,
    Building,
    Calculator,
    Settings,
    ArrowRight,
    Download,
    Share2,
    Info,
    X,
    PieChart as PieChartIcon,
    LineChart as LineChartIcon,
    BarChart as BarChartIcon,
    Activity,
    CheckCircle,
    Clock,
    Calendar,
    Zap,
    Droplets,
    Gauge,
    Waves as WavesIcon,
    Cloud,
    AlertCircle,
    ChevronRight,
    Filter,
    Maximize2
} from 'lucide-react';
import {
    IrrigationWaterResponse,
    getWaterUsageAnalysis,
    getIrrigationWaterUsage,
    getTreatmentWaterUsage,
    getTotalWaterUsage,
    getWaterShortageRisk,
    getWaterSavingsAnalysis,
    getAllEsgMetrics,
    getStakeholderBenefits,
    getIrrigationWaterSummary,
    getKeyFindings,
    getRecommendations,
    getConfidenceScore,
    getWaterEfficiencyScore,
    getWaterSavingsPotential,
    getWaterCostSavings,
    getIrrigationWaterCurrentValue,
    getTreatmentWaterCurrentValue,
    getTotalWaterCurrentValue,
    getWaterShortageRiskLevel,
    getWaterShortageRiskProbability,
    getIrrigationWaterCompany,
    getCurrentIrrigationWaterYear,
    getIrrigationWaterCoordinates,
} from '../../../../services/Admin_Service/esg_apis/water_risk_service';

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

// Default Color Palette (green theme)
const PRIMARY_GREEN = '#22c55e';       // Green-500
const SECONDARY_GREEN = '#16a34a';     // Green-600
const LIGHT_GREEN = '#86efac';         // Green-300
const DARK_GREEN = '#15803d';          // Green-700
const EMERALD = '#10b981';             // Emerald-500
const LIME = '#84cc16';                // Lime-500
const BACKGROUND_GRAY = '#f9fafb';     // Gray-50

// Water-specific colors (green theme)
const WATER_PRIMARY = '#0d9488';       // Teal-600 for water
const WATER_SECONDARY = '#0f766e';     // Teal-700
const WATER_LIGHT = '#5eead4';         // Teal-200
const WATER_DARK = '#115e59';          // Teal-800

// Create DESIGN_SYSTEM with green colors for water theme
const DESIGN_SYSTEM = {
    // Primary brand colors - using green theme
    primary: {
        main: PRIMARY_GREEN,      // '#22c55e'
        light: LIGHT_GREEN,       // '#86efac'
        dark: DARK_GREEN,         // '#15803d'
        50: '#f0fdf4',           // lightest green
        100: '#dcfce7',          // light green
        200: '#bbf7d0',          // medium light green
    },
    // Secondary accent colors
    secondary: {
        main: SECONDARY_GREEN,    // '#16a34a'
        light: LIME,              // '#84cc16'
        dark: DARK_GREEN,         // '#15803d'
        50: '#f7fee7',           // lightest lime
        100: '#ecfccb',          // light lime
    },
    // Water-specific colors (teal shades)
    water: {
        primary: WATER_PRIMARY,   // '#0d9488'
        secondary: WATER_SECONDARY, // '#0f766e'
        light: WATER_LIGHT,       // '#5eead4'
        dark: WATER_DARK,         // '#115e59'
        50: '#f0fdfa',           // lightest teal
        100: '#ccfbf1',          // light teal
        200: '#99f6e4',          // medium light teal
    },
    // Additional variants
    variants: {
        emerald: EMERALD,         // '#10b981'
        lime: LIME,               // '#84cc16'
        lightGreen: LIGHT_GREEN,  // '#86efac'
        background: BACKGROUND_GRAY, // '#f9fafb'
    },
    // Status colors
    status: {
        success: PRIMARY_GREEN,   // '#22c55e'
        warning: '#f59e0b',       // Amber 500
        danger: '#ef4444',        // Red 500
        info: WATER_PRIMARY,      // Using water primary for info
    },
    // Contextual colors for water (using green/teal palette)
    context: {
        freshwater: WATER_PRIMARY,    // '#0d9488'
        groundwater: WATER_DARK,      // '#115e59'
        surfaceWater: '#0ea5e9',      // Sky blue 500
        wastewater: '#8b5cf6',        // Violet 500
        drinkingWater: EMERALD,       // '#10b981'
        industrialWater: '#f59e0b',   // Amber 500
        agriculturalWater: LIME,      // '#84cc16'
        ecosystemWater: PRIMARY_GREEN, // '#22c55e'
        irrigationWater: '#84cc16',   // Lime for irrigation
        treatmentWater: '#8b5cf6',    // Violet for treatment
        effluentDischarge: '#ec4899', // Pink for effluent
    },
    // Chart colors - coordinated palette using green colors
    charts: {
        primary: [WATER_PRIMARY, WATER_SECONDARY, WATER_LIGHT, '#2dd4bf', '#5eead4'],
        secondary: [PRIMARY_GREEN, SECONDARY_GREEN, LIME, '#a3e635', '#d9f99d'],
        mixed: [WATER_PRIMARY, PRIMARY_GREEN, '#0ea5e9', '#8b5cf6', '#ec4899', '#0d9488'],
        gradient: {
            water: `linear-gradient(135deg, ${WATER_PRIMARY} 0%, ${WATER_SECONDARY} 100%)`,
            green: `linear-gradient(135deg, ${PRIMARY_GREEN} 0%, ${EMERALD} 100%)`,
            amber: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
            multi: `linear-gradient(135deg, ${WATER_PRIMARY} 0%, ${PRIMARY_GREEN} 50%, ${WATER_LIGHT} 100%)`,
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
    waterData: IrrigationWaterResponse | null;
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
}

const OverviewTab: React.FC<OverviewTabProps> = ({
    waterData,
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
    areaName = "Area of Interest",
    areaCovered = "N/A",
    colors
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

    // Water-specific colors
    const waterColors = {
        primary: currentColors.primary,      // Use primary green for water
        secondary: currentColors.secondary,  // Use secondary green
        light: currentColors.lightGreen,     // Use light green
        dark: currentColors.darkGreen,       // Use dark green
    };

    if (!waterData) {
        return (
            <div className="text-center py-12">
                <Droplet className="w-16 h-16 mx-auto mb-4" style={{ color: DESIGN_SYSTEM.neutral[300] }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: DESIGN_SYSTEM.neutral[700] }}>No Data Available</h3>
                <p style={{ color: DESIGN_SYSTEM.neutral[500] }}>Select a company to view water risk and usage data</p>
            </div>
        );
    }

    // Get data using helper functions
    const waterUsageAnalysis = getWaterUsageAnalysis(waterData);
    const irrigationWaterUsage = getIrrigationWaterUsage(waterData);
    const treatmentWaterUsage = getTreatmentWaterUsage(waterData);
    const totalWaterUsage = getTotalWaterUsage(waterData);
    const waterShortageRisk = getWaterShortageRisk(waterData);
    const waterSavingsAnalysis = getWaterSavingsAnalysis(waterData);
    const allEsgMetrics = getAllEsgMetrics(waterData);
    const stakeholderBenefits = getStakeholderBenefits(waterData);
    const summary = getIrrigationWaterSummary(waterData);
    const confidenceScore = getConfidenceScore(waterData);
    const company = getIrrigationWaterCompany(waterData);
    const currentYear = getCurrentIrrigationWaterYear(waterData);
    const mappedCoordinates = getIrrigationWaterCoordinates(waterData);

    // Extract area of interest from selectedCompany
    const companyAreaOfInterest = selectedCompany?.area_of_interest_metadata;
    const companyCoordinates = companyAreaOfInterest?.coordinates || [];
    const companyAreaName = companyAreaOfInterest?.name || areaName;
    const companyAreaCovered = companyAreaOfInterest?.area_covered || areaCovered;

    // Use company coordinates first, then provided coordinates, then fallback to mapped coordinates
    const finalCoordinates = companyCoordinates.length > 0
        ? companyCoordinates
        : coordinates.length > 0
            ? coordinates
            : mappedCoordinates;

    // Calculate map center from final coordinates
    const mapCenter: [number, number] = finalCoordinates.length > 0
        ? [finalCoordinates[0].lat, finalCoordinates[0].lon]
        : [0, 0];

    // FIXED: Properly filter water-related ESG metrics
    const waterRelatedEsgMetrics = useMemo(() => {
        if (!allEsgMetrics) return [];

        // Get all metrics from all categories
        const allMetrics = [
            ...Object.values(allEsgMetrics.environmental || {}),
            ...Object.values(allEsgMetrics.social || {}),
            ...Object.values(allEsgMetrics.governance || {})
        ];

        // Filter water-related metrics
        return allMetrics.filter((metric: any) => {
            const name = metric.name?.toLowerCase() || '';
            return (
                name.includes('water') ||
                name.includes('irrigation') ||
                name.includes('treatment') ||
                name.includes('effluent')
            );
        });
    }, [allEsgMetrics]);

    // Prepare bar chart data from water-related metrics
    const prepareBarChartData = useMemo(() => {
        if (!waterRelatedEsgMetrics || waterRelatedEsgMetrics.length === 0) {
            return [];
        }

        // Get the target year for data extraction
        const targetYear = selectedYear || currentYear;

        return waterRelatedEsgMetrics
            .map((metric: any) => {
                // Find the value for the target year
                const yearValue = metric.values?.find((v: any) => v.year === targetYear);
                const numericValue = yearValue?.numeric_value || 0;

                return {
                    name: metric.name,
                    value: numericValue,
                    unit: metric.unit,
                    description: metric.description,
                    category: metric.category,
                    year: targetYear
                };
            })
            .sort((a: any, b: any) => b.value - a.value) // Sort by value descending
            .slice(0, 8); // Take top 8 metrics
    }, [waterRelatedEsgMetrics, selectedYear, currentYear]);

    // Prepare chart data with real API data where available
    const prepareChartData = () => {
        const mockMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Monthly water usage data (from API if available, otherwise mock)
        const monthlyUsageData = irrigationWaterUsage?.monthly_data && irrigationWaterUsage.monthly_data.length > 0
            ? irrigationWaterUsage.monthly_data.map((data: any) => ({
                month: data.month || data.month_name || 'Month',
                irrigation: data.value || data.irrigation_water || 0,
                treatment: treatmentWaterUsage?.current_value ? treatmentWaterUsage.current_value / 12 : 0,
                total: (data.value || 0) + (treatmentWaterUsage?.current_value ? treatmentWaterUsage.current_value / 12 : 0)
            }))
            : mockMonths.map((month, index) => ({
                month,
                irrigation: irrigationWaterUsage?.current_value ? irrigationWaterUsage.current_value / 12 : 0,
                treatment: treatmentWaterUsage?.current_value ? treatmentWaterUsage.current_value / 12 : 0,
                total: (irrigationWaterUsage?.current_value || 0) / 12 + (treatmentWaterUsage?.current_value || 0) / 12
            }));

        // Water usage composition
        const irrigationValue = irrigationWaterUsage?.current_value || 0;
        const treatmentValue = treatmentWaterUsage?.current_value || 0;
        const otherWater = Math.max(0, (totalWaterUsage?.current_value || 0) - irrigationValue - treatmentValue);

        // Yearly trend data (last 5 years)
        const yearlyTrendYears = availableYears.length > 0
            ? availableYears.slice(-5).sort()
            : Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);

        // Use the prepared bar chart data from water-related metrics
        const esgMetricsData = prepareBarChartData.map((metric: any, index: number) => ({
            name: metric.name || `Metric ${index + 1}`,
            value: metric.value || 0,
            unit: metric.unit || '',
            description: metric.description || '',
            color: index % 3 === 0 ? DESIGN_SYSTEM.context.irrigationWater :
                index % 3 === 1 ? DESIGN_SYSTEM.context.treatmentWater :
                    DESIGN_SYSTEM.context.effluentDischarge
        }));

        return {
            // Water Usage Trend Data
            waterUsageTrendData: monthlyUsageData,

            // Water Usage Composition
            waterUsageData: [
                {
                    name: 'Irrigation',
                    value: irrigationValue,
                    color: DESIGN_SYSTEM.context.irrigationWater
                },
                {
                    name: 'Treatment',
                    value: treatmentValue,
                    color: DESIGN_SYSTEM.context.treatmentWater
                },
                {
                    name: 'Effluent Discharge',
                    value: otherWater * 0.3, // Assuming 30% of other water is effluent
                    color: DESIGN_SYSTEM.context.effluentDischarge
                },
                {
                    name: 'Other',
                    value: otherWater * 0.7,
                    color: DESIGN_SYSTEM.neutral[400]
                }
            ],

            // Water Risk Assessment Data
            waterRiskData: [
                { component: 'Availability', score: waterShortageRisk.probability ? 100 - (waterShortageRisk.probability * 100) : 50, fullMark: 100 },
                { component: 'Quality', score: 75, fullMark: 100 },
                { component: 'Regulatory', score: 85, fullMark: 100 },
                { component: 'Efficiency', score: waterUsageAnalysis?.irrigation_water?.efficiency_score || 0, fullMark: 100 },
                { component: 'Sustainability', score: 70, fullMark: 100 },
                { component: 'Infrastructure', score: 65, fullMark: 100 },
            ],

            // Yearly Water Usage Trend
            yearlyWaterData: yearlyTrendYears.map(year => ({
                year,
                irrigation: irrigationValue * (0.9 + Math.random() * 0.2),
                treatment: treatmentValue * (0.9 + Math.random() * 0.2),
                effluent: otherWater * 0.3 * (0.9 + Math.random() * 0.2),
                total: (irrigationValue + treatmentValue + otherWater) * (0.9 + Math.random() * 0.2)
            })),

            // Water Savings Potential
            waterSavingsData: [
                {
                    category: 'Current Usage',
                    value: totalWaterUsage?.current_value || 0,
                    color: waterColors.primary
                },
                {
                    category: 'Savings Potential',
                    value: waterSavingsAnalysis?.potential_savings || 0,
                    color: DESIGN_SYSTEM.primary.main
                },
                {
                    category: 'Efficient Usage',
                    value: (totalWaterUsage?.current_value || 0) - (waterSavingsAnalysis?.potential_savings || 0),
                    color: waterColors.secondary
                }
            ],

            // ESG Water Metrics - Using real data from waterRelatedEsgMetrics
            esgWaterMetricsData: esgMetricsData,

            // Efficiency Metrics
            efficiencyMetricsData: [
                { metric: 'Irrigation Efficiency', score: irrigationWaterUsage?.efficiency_score || 0, target: 85 },
                { metric: 'Treatment Efficiency', score: 78, target: 90 },
                { metric: 'Water Recycling', score: 45, target: 75 },
                { metric: 'Loss Reduction', score: 68, target: 95 }
            ]
        };
    };

    const chartData = prepareChartData();

    // Helper function to get color based on score
    const getScoreColor = (score: number) => {
        if (score >= 80) return DESIGN_SYSTEM.primary.main;
        if (score >= 60) return DESIGN_SYSTEM.secondary.main;
        if (score >= 40) return DESIGN_SYSTEM.variants.lime;
        return DESIGN_SYSTEM.status.danger;
    };

    const getRiskColor = (level: string) => {
        switch (level.toLowerCase()) {
            case 'low': return DESIGN_SYSTEM.primary.main;
            case 'medium': return DESIGN_SYSTEM.variants.lime;
            case 'high': return DESIGN_SYSTEM.status.danger;
            case 'critical': return '#dc2626';
            default: return DESIGN_SYSTEM.neutral[600];
        }
    };

    const getRiskLevelText = (level: string) => {
        switch (level.toLowerCase()) {
            case 'low': return 'Low Risk';
            case 'medium': return 'Moderate Risk';
            case 'high': return 'High Risk';
            case 'critical': return 'Critical Risk';
            default: return 'Unknown Risk';
        }
    };

    const handleMetricClick = (metric: any, title: string) => {
        setSelectedMetric({ ...metric, title });
        setShowMetricModal(true);
    };

    const handleCalculationClick = (calculationType: string, data?: any) => {
        onCalculationClick(calculationType, data);
    };

    // Custom Tooltip Component
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-xl shadow-lg border" style={{ borderColor: DESIGN_SYSTEM.neutral[200] }}>
                    <p className="font-semibold mb-2" style={{ color: DESIGN_SYSTEM.neutral[800] }}>{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {typeof entry.value === 'number' ? formatNumber(entry.value) : entry.value} {entry.dataKey === 'efficiency_score' ? '%' : 'm³'}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Custom Tooltip for Bar Chart
    const BarChartTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-4 rounded-xl shadow-lg border" style={{ borderColor: DESIGN_SYSTEM.neutral[200] }}>
                    <p className="font-semibold mb-2" style={{ color: DESIGN_SYSTEM.neutral[800] }}>{data.name}</p>
                    <div className="space-y-1">
                        <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Value: <span className="font-medium" style={{ color: DESIGN_SYSTEM.primary.main }}>
                                {formatNumber(data.value)} {data.unit || ''}
                            </span>
                        </p>
                        {data.description && (
                            <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[500] }}>
                                {data.description}
                            </p>
                        )}
                        <p className="text-xs mt-2" style={{ color: DESIGN_SYSTEM.neutral[400] }}>
                            Year: {data.year || selectedYear || currentYear}
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Define 4 key graphs (as requested) - All water-related
    const graphs = [
        {
            id: 'water-usage-trend',
            title: 'Monthly Water Usage Trend',
            description: 'Irrigation vs Treatment water consumption',
            icon: <LineChartIcon className="w-5 h-5" style={{ color: waterColors.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData.waterUsageTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DESIGN_SYSTEM.neutral[200]} />
                        <XAxis
                            dataKey="month"
                            stroke={DESIGN_SYSTEM.neutral[400]}
                            style={{ fontSize: '12px', fontWeight: 500 }}
                        />
                        <YAxis
                            stroke={DESIGN_SYSTEM.neutral[400]}
                            style={{ fontSize: '12px', fontWeight: 500 }}
                            label={{ value: 'm³', angle: -90, position: 'insideLeft' }}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <RechartsLegend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                        />
                        <Area
                            type="monotone"
                            dataKey="total"
                            fill={waterColors.light}
                            stroke={waterColors.primary}
                            name="Total Water"
                            fillOpacity={0.3}
                        />
                        <Line
                            type="monotone"
                            dataKey="irrigation"
                            stroke={DESIGN_SYSTEM.context.irrigationWater}
                            name="Irrigation Water"
                            strokeWidth={2}
                            dot={{ fill: DESIGN_SYSTEM.context.irrigationWater, r: 4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="treatment"
                            stroke={DESIGN_SYSTEM.context.treatmentWater}
                            name="Treatment Water"
                            strokeWidth={2}
                            dot={{ fill: DESIGN_SYSTEM.context.treatmentWater, r: 4 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            ),
            info: 'Monthly water consumption patterns for irrigation and treatment processes'
        },
        {
            id: 'water-usage-composition',
            title: 'Water Usage Composition',
            description: 'Breakdown of water consumption by type',
            icon: <PieChartIcon className="w-5 h-5" style={{ color: waterColors.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                        <Pie
                            data={chartData.waterUsageData}
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
                            {chartData.waterUsageData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <RechartsTooltip
                            content={<CustomTooltip />}
                            formatter={(value) => [formatNumber(value as number), 'Volume']}
                        />
                    </RechartsPieChart>
                </ResponsiveContainer>
            ),
            info: 'Distribution of water consumption across irrigation, treatment, and effluent discharge'
        },
        {
            id: 'yearly-water-trend',
            title: 'Yearly Water Usage Trend',
            description: 'Irrigation, Treatment & Effluent over 5 years',
            icon: <BarChartIcon className="w-5 h-5" style={{ color: waterColors.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData.yearlyWaterData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DESIGN_SYSTEM.neutral[200]} />
                        <XAxis
                            dataKey="year"
                            stroke={DESIGN_SYSTEM.neutral[400]}
                            style={{ fontSize: '12px', fontWeight: 500 }}
                        />
                        <YAxis
                            stroke={DESIGN_SYSTEM.neutral[400]}
                            style={{ fontSize: '12px', fontWeight: 500 }}
                            label={{ value: 'm³', angle: -90, position: 'insideLeft' }}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <RechartsLegend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                        />
                        <Bar
                            dataKey="irrigation"
                            name="Irrigation Water"
                            fill={DESIGN_SYSTEM.context.irrigationWater}
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar
                            dataKey="treatment"
                            name="Treatment Water"
                            fill={DESIGN_SYSTEM.context.treatmentWater}
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar
                            dataKey="effluent"
                            name="Effluent Discharge"
                            fill={DESIGN_SYSTEM.context.effluentDischarge}
                            radius={[4, 4, 0, 0]}
                        />
                        <Line
                            type="monotone"
                            dataKey="total"
                            stroke={waterColors.primary}
                            name="Total Water"
                            strokeWidth={3}
                            dot={{ fill: waterColors.primary, r: 4 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            ),
            info: 'Yearly trends in irrigation water usage, treatment water, and effluent discharge'
        },
        {
            id: 'esg-water-metrics',
            title: 'ESG Water Metrics',
            description: 'Water-related ESG performance indicators',
            icon: <BarChartIcon className="w-5 h-5" style={{ color: waterColors.primary }} />,
            component: (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                        data={chartData.esgWaterMetricsData}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke={DESIGN_SYSTEM.neutral[200]} />
                        <XAxis
                            type="number"
                            stroke={DESIGN_SYSTEM.neutral[400]}
                            style={{ fontSize: '12px', fontWeight: 500 }}
                            label={{ value: 'Value', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis
                            dataKey="name"
                            type="category"
                            stroke={DESIGN_SYSTEM.neutral[400]}
                            style={{ fontSize: '12px', fontWeight: 500 }}
                            width={150}
                            tick={{ fontSize: 11 }}
                        />
                        <RechartsTooltip
                            content={<BarChartTooltip />}
                        />
                        <RechartsLegend />
                        <Bar
                            dataKey="value"
                            name="ESG Metric Value"
                            radius={[0, 4, 4, 0]}
                        >
                            {chartData.esgWaterMetricsData.map((entry: any, index: number) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    onClick={() => {
                                        const metric = waterRelatedEsgMetrics.find((m: any) => m.name === entry.name);
                                        if (metric) {
                                            handleMetricClick({
                                                ...metric,
                                                currentValue: entry.value,
                                                unit: entry.unit,
                                                description: entry.description
                                            }, entry.name);
                                        }
                                    }}
                                    style={{ cursor: 'pointer' }}
                                />
                            ))}
                        </Bar>
                    </RechartsBarChart>
                </ResponsiveContainer>
            ),
            info: 'Water-related ESG metrics including irrigation efficiency, treatment performance, and water risk indicators'
        }
    ];

    // Calculate summary metrics
    const summaryMetrics = {
        totalWaterUsage: totalWaterUsage?.current_value || 0,
        waterEfficiency: irrigationWaterUsage?.efficiency_score || 0,
        shortageRiskLevel: waterShortageRisk?.level || 'unknown',
        shortageRiskProbability: waterShortageRisk?.probability || 0,
        savingsPotential: waterSavingsAnalysis?.potential_savings || 0,
        costSavings: waterSavingsAnalysis?.cost_savings || 0,
        irrigationWater: irrigationWaterUsage?.current_value || 0,
        treatmentWater: treatmentWaterUsage?.current_value || 0,
        effluentDischarge: (totalWaterUsage?.current_value || 0) - (irrigationWaterUsage?.current_value || 0) - (treatmentWaterUsage?.current_value || 0),
        confidenceScore: confidenceScore?.overall || 0
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Company Details Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200" style={{ background: currentColors.background }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm">
                                <Building className="w-5 h-5" style={{ color: waterColors.primary }} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-0.5">
                                    {company?.name || selectedCompany?.name || "Company"}
                                </h2>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-100 text-green-800 font-medium">
                                        {company?.industry || selectedCompany?.industry || "Agricultural"}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 font-medium">
                                        {company?.country || selectedCompany?.country || "Country"}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-medium">
                                        {currentYear || new Date().getFullYear()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-600 mb-0.5">Data Confidence</p>
                            <p className="font-medium text-xs" style={{ color: waterColors.primary }}>
                                {summaryMetrics.confidenceScore}%
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Total Area</p>
                            <p className="font-bold text-sm text-gray-900">{companyAreaCovered}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Location Points</p>
                            <p className="font-bold text-sm text-gray-900">{finalCoordinates.length} {finalCoordinates.length === 1 ? 'point' : 'points'}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Monitoring Period</p>
                            <p className="font-bold text-sm text-gray-900">
                                {availableYears[0] || currentYear - 5}-{currentYear}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                            <p className="text-[10px] text-gray-600 mb-0.5">Data Confidence</p>
                            <p className="font-bold text-sm" style={{ color: waterColors.primary }}>
                                {summaryMetrics.confidenceScore}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div
                className="relative overflow-hidden rounded-2xl p-5 shadow-2xl"
                style={{
                    background: `linear-gradient(to right, ${waterColors.dark}, ${waterColors.primary})`
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
                            <h2 className="text-xl font-bold mb-1 text-white">Water Risk & Usage Dashboard</h2>
                            <p className="text-green-50 text-sm">Comprehensive water management monitoring</p>
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
                        {/* Total Water Usage Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClick(totalWaterUsage, 'Total Water Usage')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Droplet className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Total Water Usage</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {formatNumber(summaryMetrics.totalWaterUsage)}
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                m³
                            </span>
                        </div>

                        {/* Water Efficiency Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClick(irrigationWaterUsage, 'Water Efficiency')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Gauge className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Water Efficiency</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {summaryMetrics.waterEfficiency}%
                            </h3>
                            <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${summaryMetrics.waterEfficiency >= 80 ? 'bg-green-400 text-green-900' :
                                    summaryMetrics.waterEfficiency >= 60 ? 'bg-yellow-400 text-yellow-900' :
                                        'bg-red-400 text-red-900'
                                    }`}
                            >
                                {summaryMetrics.waterEfficiency >= 80 ? 'Excellent' :
                                    summaryMetrics.waterEfficiency >= 60 ? 'Good' :
                                        summaryMetrics.waterEfficiency >= 40 ? 'Fair' : 'Poor'}
                            </span>
                        </div>

                        {/* Water Shortage Risk Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClick(waterShortageRisk, 'Water Shortage Risk')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <AlertTriangle className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Shortage Risk</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {getRiskLevelText(summaryMetrics.shortageRiskLevel)}
                            </h3>
                            <span
                                className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium"
                                style={{
                                    backgroundColor: getRiskColor(summaryMetrics.shortageRiskLevel) + '40',
                                    color: getRiskColor(summaryMetrics.shortageRiskLevel)
                                }}
                            >
                                {summaryMetrics.shortageRiskProbability ? `${(summaryMetrics.shortageRiskProbability * 100).toFixed(0)}% probability` : 'Unknown'}
                            </span>
                        </div>

                        {/* Effluent Discharge Card */}
                        <div
                            className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => handleMetricClick({ value: summaryMetrics.effluentDischarge, unit: 'm³' }, 'Effluent Discharge')}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <Waves className="w-3.5 h-3.5 text-white" />
                                </div>
                                <p className="text-white font-bold text-xs">Effluent Discharge</p>
                            </div>
                            <h3 className="text-xl font-normal mb-2 text-white">
                                {formatNumber(summaryMetrics.effluentDischarge)}
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                m³
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
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Area of Interest</h3>
                            <p className="text-gray-600 flex items-center gap-2">
                                <MapPin className="w-4 h-4" style={{ color: waterColors.primary }} />
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
                    {finalCoordinates.length > 0 ? (
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
                                            <h3 className="font-bold mb-2" style={{ color: waterColors.primary }}>{companyAreaName}</h3>
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Area:</span> {companyAreaCovered}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Latitude:</span> {finalCoordinates[0].lat.toFixed(6)}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Longitude:</span> {finalCoordinates[0].lon.toFixed(6)}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Total Water Usage:</span> {formatNumber(summaryMetrics.totalWaterUsage)} m³
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Water Efficiency:</span> {summaryMetrics.waterEfficiency}%
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Shortage Risk:</span> {getRiskLevelText(summaryMetrics.shortageRiskLevel)}
                                                </p>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ) : (
                                <Polygon
                                    pathOptions={{
                                        fillColor: waterColors.primary,
                                        color: waterColors.primary,
                                        fillOpacity: 0.3,
                                        weight: 2
                                    }}
                                    positions={finalCoordinates.map((coord: any) => [coord.lat, coord.lon])}
                                >
                                    <Popup>
                                        <div className="p-2">
                                            <h3 className="font-bold mb-2" style={{ color: waterColors.primary }}>{companyAreaName}</h3>
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Area:</span> {companyAreaCovered}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Coordinates:</span> {finalCoordinates.length} points
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Total Water Usage:</span> {formatNumber(summaryMetrics.totalWaterUsage)} m³
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Water Efficiency:</span> {summaryMetrics.waterEfficiency}%
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Shortage Risk:</span> {getRiskLevelText(summaryMetrics.shortageRiskLevel)}
                                                </p>
                                                <p className="text-sm text-gray-700">
                                                    <span className="font-semibold">Savings Potential:</span> {formatNumber(summaryMetrics.savingsPotential)} m³
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
                                    style={{ color: waterColors.primary }}
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
                            <Globe className="w-4 h-4" style={{ color: waterColors.primary }} />
                            Area Covered
                        </p>
                        <p className="font-bold text-lg text-gray-900">{companyAreaCovered}</p>
                        {company?.name && (
                            <p className="text-xs text-gray-500 mt-1">{company.name}</p>
                        )}
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1 flex items-center gap-2">
                            <Target className="w-4 h-4" style={{ color: waterColors.primary }} />
                            Water Monitoring Points
                        </p>
                        <p className="font-bold text-lg text-gray-900">{finalCoordinates.length} {finalCoordinates.length === 1 ? 'point' : 'points'}</p>
                        {finalCoordinates.length > 1 && (
                            <p className="text-xs text-gray-500 mt-1">Water basin boundary</p>
                        )}
                    </div>
                </div>
            </div>

            {/* 4 Key Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {graphs.map((graph) => (
                    <GraphDisplay
                        key={graph.id}
                        title={graph.title}
                        description={graph.description}
                        icon={graph.icon}
                        onClick={() => setSelectedGraph(graph)}
                        onInfoClick={() => handleCalculationClick(graph.id, { description: graph.info })}
                    >
                        {graph.component}
                    </GraphDisplay>
                ))}
            </div>

            {/* Key Statistics Summary */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold" style={{ color: waterColors.primary }}>
                        Key Statistics
                    </h3>
                    <Droplet className="w-5 h-5" style={{ color: DESIGN_SYSTEM.neutral[500] }} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: waterColors.primary }}>
                            {formatNumber(summaryMetrics.totalWaterUsage)}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Total Water Usage
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.context.irrigationWater }}>
                            {formatNumber(summaryMetrics.irrigationWater)}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Irrigation Water
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.context.treatmentWater }}>
                            {formatNumber(summaryMetrics.treatmentWater)}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Treatment Water
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.context.effluentDischarge }}>
                            {formatNumber(summaryMetrics.effluentDischarge)}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Effluent Discharge
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: DESIGN_SYSTEM.status.danger }}>
                            {summaryMetrics.shortageRiskProbability ? `${(summaryMetrics.shortageRiskProbability * 100).toFixed(0)}%` : 'N/A'}
                        </p>
                        <p className="text-sm mt-1" style={{ color: DESIGN_SYSTEM.neutral[600] }}>
                            Shortage Risk
                        </p>
                    </div>
                </div>
            </div>

            {/* Methodology Section */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">Calculation Methodology</h3>
                        <p className="text-gray-600">Understand how water metrics are calculated</p>
                    </div>
                    <Settings className="w-8 h-8" style={{ color: waterColors.primary }} />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div
                        className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 cursor-pointer hover:border-green-300 transition-all group"
                        onClick={() =>
                            onCalculationClick("water-usage", {
                                formula: "Irrigation + Treatment + Effluent + Other",
                                description: "Sum of all water consumption sources including effluent discharge",
                            })
                        }
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-green-100">
                                <Droplet className="w-6 h-6" style={{ color: waterColors.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Water Usage</h4>
                        </div>
                        <p className="text-gray-700 mb-4">Total water consumption from all sources including effluent discharge</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: waterColors.primary, fontWeight: 500 }}>
                                Formula: Irrigation + Treatment + Effluent + Other
                            </span>
                            <Info className="w-5 h-5" style={{ color: waterColors.primary, opacity: 0, transition: 'opacity 0.2s' }} />
                        </div>
                    </div>

                    <div
                        className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 cursor-pointer hover:border-green-300 transition-all group"
                        onClick={() =>
                            onCalculationClick("water-efficiency", {
                                formula: "Output / Water Input × 100",
                                description: "Efficiency of water utilization in irrigation",
                            })
                        }
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-green-100">
                                <Gauge className="w-6 h-6" style={{ color: waterColors.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Irrigation Efficiency</h4>
                        </div>
                        <p className="text-gray-700 mb-4">Effectiveness of water utilization in irrigation processes</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: DESIGN_SYSTEM.primary.main, fontWeight: 500 }}>
                                Formula: Crop Yield / Water Input × 100
                            </span>
                            <Info className="w-5 h-5" style={{ color: DESIGN_SYSTEM.primary.main, opacity: 0, transition: 'opacity 0.2s' }} />
                        </div>
                    </div>

                    <div
                        className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 cursor-pointer hover:border-amber-300 transition-all group"
                        onClick={() =>
                            onCalculationClick("effluent-discharge", {
                                formula: "Total Water - (Irrigation + Treatment)",
                                description: "Calculation of effluent discharge volume",
                            })
                        }
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-amber-100">
                                <Waves className="w-6 h-6" style={{ color: waterColors.primary }} />
                            </div>
                            <h4 className="font-bold text-lg text-gray-900">Effluent Discharge</h4>
                        </div>
                        <p className="text-gray-700 mb-4">Volume of wastewater discharged from treatment processes</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-amber-600 font-medium">
                                Formula: Total Water - (Irrigation + Treatment)
                            </span>
                            <Info className="w-5 h-5 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                </div>
                <div className="mt-6">
                    <button
                        onClick={() => onCalculationClick('full-methodology')}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 hover:border-green-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <span className="font-semibold text-gray-700">View Complete Methodology</span>
                        <ArrowRight className="w-5 h-5" style={{ color: waterColors.primary }} />
                    </button>
                </div>
            </div>

            {/* Notes Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border p-6" style={{ borderColor: waterColors.light }}>
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-100">
                        <Info className="w-5 h-5" style={{ color: waterColors.primary }} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold mb-2" style={{ color: waterColors.dark }}>
                            Water Risk & Usage Notes
                        </h4>
                        <div className="space-y-2">
                            <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                <span className="font-semibold">Irrigation Water:</span> Water used for agricultural irrigation, calculated based on crop type, area, and irrigation method.
                            </p>
                            <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                <span className="font-semibold">Treatment Water:</span> Water used in treatment processes including purification and wastewater treatment.
                            </p>
                            <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                <span className="font-semibold">Effluent Discharge:</span> Treated wastewater discharged into the environment, monitored for compliance with environmental regulations.
                            </p>
                            <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                <span className="font-semibold">Water Efficiency:</span> Measures how effectively water is used in irrigation, with higher scores indicating better utilization.
                            </p>
                            <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                <span className="font-semibold">ESG Metrics:</span> Water-related ESG indicators help investors assess environmental performance and regulatory compliance.
                            </p>
                            <p className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                <span className="font-semibold">Data Sources:</span> Satellite monitoring, IoT sensors, weather stations, and regulatory compliance reports.
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
                                background: `linear-gradient(to right, ${waterColors.primary}, ${waterColors.secondary})`
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold mb-1">{selectedMetric.title}</h3>
                                    <p className="text-green-50">Detailed metric information</p>
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
                                    <div className="text-6xl font-bold" style={{ color: waterColors.primary }}>
                                        {typeof selectedMetric.currentValue === 'number' ?
                                            selectedMetric.unit === '%' ?
                                                selectedMetric.currentValue.toFixed(1) + '%' :
                                                formatNumber(selectedMetric.currentValue)
                                            : selectedMetric.value}
                                    </div>
                                    {selectedMetric.unit && selectedMetric.unit !== '%' && (
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
                                        backgroundColor: `${waterColors.primary}10`,
                                        borderColor: `${waterColors.primary}30`
                                    }}
                                >
                                    <div className="flex items-center gap-2" style={{ color: waterColors.dark }}>
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-semibold">Current Status</span>
                                    </div>
                                    <p className="mt-2" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                        This metric indicates the current state of {selectedMetric.title.toLowerCase()} within the monitored area.
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
                                {selectedMetric.values && selectedMetric.values.length > 0 && (
                                    <div
                                        className="p-4 rounded-xl border"
                                        style={{
                                            backgroundColor: `${DESIGN_SYSTEM.primary.main}10`,
                                            borderColor: `${DESIGN_SYSTEM.primary.main}30`
                                        }}
                                    >
                                        <div className="flex items-center gap-2" style={{ color: DESIGN_SYSTEM.primary.main }}>
                                            <Calendar className="w-5 h-5" />
                                            <span className="font-semibold">Historical Data</span>
                                        </div>
                                        <div className="mt-3 space-y-2">
                                            {selectedMetric.values.slice(-3).reverse().map((value: any, index: number) => (
                                                <div key={index} className="flex justify-between items-center">
                                                    <span className="text-sm" style={{ color: DESIGN_SYSTEM.neutral[700] }}>
                                                        Year {value.year}
                                                    </span>
                                                    <span className="font-medium" style={{ color: waterColors.primary }}>
                                                        {formatNumber(value.numeric_value)} {selectedMetric.unit}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
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

export default OverviewTab;