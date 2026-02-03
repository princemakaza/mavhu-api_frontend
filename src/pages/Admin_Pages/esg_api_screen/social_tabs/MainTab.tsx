import React, { useState, useMemo } from 'react';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Activity,
    Database,
    Calendar,
    FileText,
    Filter,
    ChevronDown,
    ChevronUp,
    Search,
    Grid3x3,
    Table,
    BarChart2,
    PieChart,
    LineChart,
    MapPin,
    Globe,
    AlertCircle,
    Info,
    Maximize2,
    Minimize2,
    RefreshCw,
    Eye,
    EyeOff,
    Plus,
    Minus,
    ChevronLeft,
    ChevronRight,
    Grid,
    List,
    Settings,
    MoreVertical,
    Target,
    Share2,
    Building,
    Users,
    User,
    Heart,
    Shield,
    GraduationCap,
    X,
    ExternalLink,
    Clock,
    Hash,
    Award,
} from "lucide-react";

// Import types and helper functions from Social ESG service
import {
    type EsgDataRecord,
    type EsgMetric,
    type EsgMetricValue,
    getSocialMetricsSummary,
    getCompanySocialEsgSummary,
    getAvailableSocialYears,
    calculateDiversityMetrics,
    calculateSafetyMetrics,
} from '../../../../services/Admin_Service/esg_apis/esg_social_service';

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

// Color Palette (social theme - greens)
const COLORS = {
    primary: '#22c55e',
    primaryDark: '#16a34a',
    primaryLight: '#86efac',
    darkGreen: '#15803d',
    emerald: '#10b981',
    lime: '#84cc16',
    background: '#f9fafb',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    purple: '#8B5CF6',
    teal: '#14B8A6',
    orange: '#F97316',
    blue: '#3B82F6',
    pink: '#EC4899',
};

interface MainTabProps {
    esgData: EsgDataRecord[];
    summaryMetrics: any;
    selectedCompany: any;
    formatNumber: (num: number | null) => string;
    formatCurrency: (num: number | null) => string;
    formatPercent: (num: number | null) => string;
    getTrendIcon: (trend: string) => React.ReactNode;
    selectedYear: number | null;
    availableYears: number[];
    latestYear: number | null;
    loading: boolean;
    isRefreshing: boolean;
    onMetricClick: (metric: any, modalType: string) => void;
    onCalculationClick: (calculationType: string, data?: any) => void;
    coordinates: any[];
    areaName: string;
    areaCovered: string;
    colors: any;
    metricsBySubCategory: any;
    getChartData: (metricName: string, unit?: string) => any;
    getWorkforceCharts: () => any[];
    getSafetyCharts: () => any[];
    compareYears: (year1: number, year2: number) => any[];
}

// Modal Component for Metric Details
interface MetricModalProps {
    isOpen: boolean;
    onClose: () => void;
    metric: EsgMetric | null;
    formatNumber: (num: number | null) => string;
    esgYears: number[];
    selectedCompany: any;
}

const MetricModal: React.FC<MetricModalProps> = ({
    isOpen,
    onClose,
    metric,
    formatNumber,
    esgYears,
    selectedCompany,
}) => {
    if (!isOpen || !metric) return null;

    const getMetricValueForYear = (year: number): EsgMetricValue | null => {
        return metric.values.find(v => v.year === year) || null;
    };

    const latestValue = metric.values.reduce((prev, curr) =>
        prev.year > curr.year ? prev : curr
    );

    // Determine category color
    const getCategoryColor = () => {
        const name = metric.metric_name.toLowerCase();
        if (name.includes('employee') || name.includes('workforce') || name.includes('trainee') || name.includes('apprentice')) {
            return COLORS.blue;
        } else if (name.includes('diversity') || name.includes('gender') || name.includes('female') || name.includes('male')) {
            return COLORS.pink;
        } else if (name.includes('safety') || name.includes('injury') || name.includes('health') || name.includes('ltifr')) {
            return COLORS.warning;
        } else if (name.includes('training') || name.includes('education') || name.includes('hours') || name.includes('development')) {
            return COLORS.orange;
        } else if (name.includes('pension') || name.includes('welfare') || name.includes('nssa') || name.includes('contribution')) {
            return COLORS.teal;
        }
        return COLORS.primary;
    };

    const categoryColor = getCategoryColor();

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={onClose}
                />

                {/* Modal panel */}
                <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                    {/* Modal header */}
                    <div className="relative p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ background: `${categoryColor}20` }}
                                >
                                    {categoryColor === COLORS.blue && <Users className="w-6 h-6" style={{ color: categoryColor }} />}
                                    {categoryColor === COLORS.pink && <User className="w-6 h-6" style={{ color: categoryColor }} />}
                                    {categoryColor === COLORS.warning && <Shield className="w-6 h-6" style={{ color: categoryColor }} />}
                                    {categoryColor === COLORS.orange && <GraduationCap className="w-6 h-6" style={{ color: categoryColor }} />}
                                    {categoryColor === COLORS.teal && <Heart className="w-6 h-6" style={{ color: categoryColor }} />}
                                    {categoryColor === COLORS.primary && <BarChart3 className="w-6 h-6" style={{ color: categoryColor }} />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {metric.metric_name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span
                                            className="px-3 py-1 rounded-full text-xs font-medium"
                                            style={{
                                                background: `${categoryColor}20`,
                                                color: categoryColor
                                            }}
                                        >
                                            {metric.unit || 'No unit specified'}
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                            {metric.category || 'Uncategorized'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                    </div>

                    {/* Modal content */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left column - Basic info */}
                            <div className="lg:col-span-2 space-y-6">
                                {metric.description && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Description</h4>
                                        <p className="text-gray-600">{metric.description}</p>
                                    </div>
                                )}

                                {/* Time series data */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Historical Data</h4>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Year
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Value
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Source Notes
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Data Quality
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {metric.values
                                                    .sort((a, b) => b.year - a.year)
                                                    .map((value, index) => (
                                                        <tr key={index} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                                                    <span className="font-medium text-gray-900">{value.year}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <span className="font-bold text-lg" style={{ color: categoryColor }}>
                                                                    {value.numeric_value !== null
                                                                        ? formatNumber(value.numeric_value)
                                                                        : value.value || 'N/A'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="max-w-xs">
                                                                    <p className="text-sm text-gray-600 truncate" title={value.source_notes}>
                                                                        {value.source_notes || 'No notes'}
                                                                    </p>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full rounded-full"
                                                                            style={{
                                                                                width: `${value.data_quality_score || 0}%`,
                                                                                background: value.data_quality_score >= 80
                                                                                    ? COLORS.success
                                                                                    : value.data_quality_score >= 60
                                                                                        ? COLORS.warning
                                                                                        : COLORS.danger
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <span className="ml-2 text-sm text-gray-600">
                                                                        {value.data_quality_score || 0}%
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Right column - Statistics and metadata */}
                            <div className="space-y-6">
                                {/* Current Value Card */}
                                <div
                                    className="rounded-xl p-5 border"
                                    style={{
                                        background: `linear-gradient(135deg, ${categoryColor}10, ${categoryColor}05)`,
                                        borderColor: `${categoryColor}30`
                                    }}
                                >
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Current Value</h4>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold" style={{ color: categoryColor }}>
                                            {latestValue.numeric_value !== null
                                                ? formatNumber(latestValue.numeric_value)
                                                : latestValue.value || 'N/A'}
                                        </span>
                                        <span className="text-gray-500">{metric.unit}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">
                                            Latest data from {latestValue.year}
                                        </span>
                                    </div>
                                </div>

            

                                {/* Actions */}
                                <div className="space-y-2">
                                    <button
                                        className="w-full py-3 rounded-lg font-medium transition-colors text-white flex items-center justify-center gap-2"
                                        style={{
                                            background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.darkGreen})`,
                                        }}
                                    >
                                        <BarChart3 className="w-4 h-4" />
                                        View Chart
                                    </button>
                                    <button
                                        className="w-full py-3 rounded-lg font-medium transition-colors border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Export Data
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 font-medium"
                            >
                                Close
                            </button>
                            <button
                                className="px-4 py-2 rounded-lg font-medium text-white"
                                style={{
                                    background: `linear-gradient(to right, ${categoryColor}, ${categoryColor}DD)`,
                                }}
                            >
                                Save Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MainTab: React.FC<MainTabProps> = ({
    esgData,
    summaryMetrics,
    selectedCompany,
    formatNumber,
    formatCurrency,
    formatPercent,
    getTrendIcon,
    selectedYear,
    availableYears,
    latestYear,
    loading,
    isRefreshing,
    onMetricClick,
    onCalculationClick,
    coordinates,
    areaName,
    areaCovered,
    colors,
    metricsBySubCategory,
    getChartData,
    getWorkforceCharts,
    getSafetyCharts,
    compareYears,
}) => {
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
    const [selectedMetricType, setSelectedMetricType] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [expandedMetric, setExpandedMetric] = useState<string | null>(null);
    const [selectedChartYear, setSelectedChartYear] = useState<number>(latestYear || new Date().getFullYear());
    const [showAllMetrics, setShowAllMetrics] = useState<boolean>(false);
    const [sortBy, setSortBy] = useState<'name' | 'value' | 'unit' | 'year'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [activeTab, setActiveTab] = useState<'overview' | 'workforce' | 'diversity' | 'safety' | 'training' | 'welfare' | 'all'>('overview');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState<EsgMetric | null>(null);

    // Get workforce composition data for selected year
    const workforceCompositionData = useMemo(() => {
        if (!esgData.length) return null;

        const yearData = esgData.filter(record => record.year === selectedChartYear);
        if (!yearData.length) return null;

        // Calculate metrics for selected year
        const metrics = {
            permanent: { value: 0, percentage: 0 },
            fixed_term: { value: 0, percentage: 0 },
            graduate_trainees: { value: 0 },
            apprentices: { value: 0 },
            total_employees: { value: 0 }
        };

        // Find relevant metrics for the selected year
        yearData.forEach(record => {
            record.metrics.forEach(metric => {
                const metricName = metric.metric_name.toLowerCase();
                const latestValue = metric.values.find(v => v.year === selectedChartYear);
                const numericValue = latestValue?.numeric_value || 0;

                if (metricName.includes('permanent') && metricName.includes('contract')) {
                    metrics.permanent.value = numericValue;
                } else if (metricName.includes('fixed term contract')) {
                    metrics.fixed_term.value = numericValue;
                } else if (metricName.includes('graduate trainee')) {
                    metrics.graduate_trainees.value = numericValue;
                } else if (metricName.includes('apprentice')) {
                    metrics.apprentices.value = numericValue;
                } else if (metricName.includes('total employee')) {
                    metrics.total_employees.value = numericValue;
                }
            });
        });

        // Calculate percentages
        const totalContracts = metrics.permanent.value + metrics.fixed_term.value;
        if (totalContracts > 0) {
            metrics.permanent.percentage = (metrics.permanent.value / totalContracts) * 100;
            metrics.fixed_term.percentage = (metrics.fixed_term.value / totalContracts) * 100;
        }

        return metrics;
    }, [esgData, selectedChartYear]);

    // Get social metrics summary
    const socialSummary = useMemo(() => {
        if (!esgData.length) return null;
        return getSocialMetricsSummary(esgData);
    }, [esgData]);

    // Calculate diversity metrics
    const diversityMetrics = useMemo(() => {
        if (!esgData.length) return null;
        return calculateDiversityMetrics(esgData);
    }, [esgData]);

    // Calculate safety metrics
    const safetyMetrics = useMemo(() => {
        if (!esgData.length) return null;
        return calculateSafetyMetrics(esgData);
    }, [esgData]);

    // Get available years
    const esgYears = useMemo(() => {
        if (!esgData.length) return [];
        return getAvailableSocialYears(esgData);
    }, [esgData]);

    // Get all social metrics
    const allSocialMetrics = useMemo(() => {
        const socialMetricsArray = [];
        if (metricsBySubCategory) {
            Object.values(metricsBySubCategory).forEach((category: any) => {
                if (category.metrics) {
                    socialMetricsArray.push(...category.metrics);
                }
            });
        }

        if (!searchQuery) return socialMetricsArray;

        const query = searchQuery.toLowerCase();
        return socialMetricsArray.filter(metric =>
            metric.metric_name.toLowerCase().includes(query) ||
            metric.description?.toLowerCase().includes(query) ||
            metric.unit?.toLowerCase().includes(query) ||
            metric.category.toLowerCase().includes(query)
        );
    }, [metricsBySubCategory, searchQuery]);

    // Filter metrics by active tab
    const filteredMetrics = useMemo(() => {
        let metrics = allSocialMetrics;

        switch (activeTab) {
            case 'workforce':
                metrics = metrics.filter(metric => {
                    const name = metric.metric_name.toLowerCase();
                    return name.includes('employee') || name.includes('workforce') ||
                        name.includes('trainee') || name.includes('apprentice') ||
                        name.includes('permanent') || name.includes('fixed term');
                });
                break;
            case 'diversity':
                metrics = metrics.filter(metric => {
                    const name = metric.metric_name.toLowerCase();
                    return name.includes('diversity') || name.includes('gender') ||
                        name.includes('recruitment') || name.includes('turnover') ||
                        name.includes('female') || name.includes('male');
                });
                break;
            case 'safety':
                metrics = metrics.filter(metric => {
                    const name = metric.metric_name.toLowerCase();
                    return name.includes('safety') || name.includes('injury') ||
                        name.includes('health') || name.includes('ltifr') ||
                        name.includes('accident');
                });
                break;
            case 'training':
                metrics = metrics.filter(metric => {
                    const name = metric.metric_name.toLowerCase();
                    return name.includes('training') || name.includes('education') ||
                        name.includes('hours') || name.includes('development');
                });
                break;
            case 'welfare':
                metrics = metrics.filter(metric => {
                    const name = metric.metric_name.toLowerCase();
                    return name.includes('pension') || name.includes('welfare') ||
                        name.includes('nssa') || name.includes('contribution') ||
                        name.includes('benefit');
                });
                break;
            case 'all':
                // Apply additional filtering if selectedMetricType is not 'all'
                if (selectedMetricType !== 'all') {
                    metrics = metrics.filter(metric => {
                        const name = metric.metric_name.toLowerCase();
                        if (selectedMetricType === 'workforce') {
                            return name.includes('employee') || name.includes('workforce') ||
                                name.includes('trainee') || name.includes('apprentice');
                        } else if (selectedMetricType === 'diversity') {
                            return name.includes('diversity') || name.includes('gender') ||
                                name.includes('recruitment') || name.includes('turnover');
                        } else if (selectedMetricType === 'safety') {
                            return name.includes('safety') || name.includes('injury') ||
                                name.includes('health') || name.includes('ltifr');
                        } else if (selectedMetricType === 'training') {
                            return name.includes('training') || name.includes('education') ||
                                name.includes('hours');
                        } else if (selectedMetricType === 'welfare') {
                            return name.includes('pension') || name.includes('welfare') ||
                                name.includes('nssa') || name.includes('contribution');
                        }
                        return true;
                    });
                }
                break;
        }

        // Sort metrics
        metrics.sort((a, b) => {
            let aValue = 0;
            let bValue = 0;

            switch (sortBy) {
                case 'name':
                    aValue = a.metric_name.toLowerCase();
                    bValue = b.metric_name.toLowerCase();
                    break;
                case 'value':
                    const aLatest = a.values.reduce((prev, curr) =>
                        prev.year > curr.year ? prev : curr
                    );
                    const bLatest = b.values.reduce((prev, curr) =>
                        prev.year > curr.year ? prev : curr
                    );
                    aValue = aLatest.numeric_value || 0;
                    bValue = bLatest.numeric_value || 0;
                    break;
                case 'unit':
                    aValue = a.unit?.toLowerCase() || '';
                    bValue = b.unit?.toLowerCase() || '';
                    break;
                case 'year':
                    aValue = a.values.length > 0 ? Math.max(...a.values.map(v => v.year)) : 0;
                    bValue = b.values.length > 0 ? Math.max(...b.values.map(v => v.year)) : 0;
                    break;
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return showAllMetrics ? metrics : metrics.slice(0, activeTab === 'all' ? 12 : 12);
    }, [allSocialMetrics, activeTab, selectedMetricType, sortBy, sortOrder, showAllMetrics]);

    // Get key metrics for bar chart
    const barChartMetrics = useMemo(() => {
        const keyMetrics = [
            { name: 'Human Capital - Total Employees', icon: Users },
            { name: 'Human Capital - Female Employees', icon: User },
            { name: 'Human Capital - Male Employees', icon: User },
            { name: 'Human Capital - Employees by Contract Type - Permanent', icon: FileText },
            { name: 'Human Capital - Employees by Contract Type - Fixed term contract', icon: FileText },
            { name: 'Human Capital - Graduate Trainees', icon: GraduationCap },
            { name: 'Human Capital - Apprentices', icon: GraduationCap },
            { name: 'Employees\' Education and Training - Average training hours by gender', unit: 'Male' },
            { name: 'Employees\' Education and Training - Average training hours by gender', unit: 'Female' },
            { name: 'Work-related Injuries - Lost Time Injury Frequency Rate', icon: Shield },
            { name: 'Welfare - Pension Contributions US$m', unit: 'Hippo Valley Pension Fund', icon: Heart },
            { name: 'Welfare - Pension Contributions US$m', unit: 'NSSA', icon: Heart },
        ];

        return keyMetrics.map(item => {
            const metric = allSocialMetrics.find(m => {
                const nameMatches = m.metric_name === item.name;
                const unitMatches = !item.unit || m.unit === item.unit;
                return nameMatches && unitMatches;
            });

            if (!metric) return null;

            const latestValue = metric.values.reduce((prev, curr) =>
                prev.year > curr.year ? prev : curr
            );

            return {
                name: metric.metric_name,
                value: latestValue.numeric_value || 0,
                unit: metric.unit,
                icon: item.icon,
                trend: metric.values.length > 1 ? 'stable' : 'unknown',
            };
        }).filter(Boolean);
    }, [allSocialMetrics]);

    // Get max value for bar chart scaling
    const maxBarValue = useMemo(() => {
        if (barChartMetrics.length === 0) return 100;
        return Math.max(...barChartMetrics.map(m => m.value)) * 1.1;
    }, [barChartMetrics]);

    // Get metric type options
    const metricTypes = [
        { id: 'all', label: 'All Metrics', color: COLORS.primary },
        { id: 'workforce', label: 'Workforce', color: COLORS.blue },
        { id: 'diversity', label: 'Diversity', color: COLORS.pink },
        { id: 'training', label: 'Training', color: COLORS.orange },
        { id: 'safety', label: 'Safety', color: COLORS.warning },
        { id: 'welfare', label: 'Welfare', color: COLORS.teal },
    ];

    // Tabs configuration
    const tabs = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'workforce', label: 'Workforce', icon: Users },
        { id: 'diversity', label: 'Diversity & Inclusion', icon: User },
        { id: 'safety', label: 'Health & Safety', icon: Shield },
        { id: 'training', label: 'Training & Development', icon: GraduationCap },
        { id: 'welfare', label: 'Welfare', icon: Heart },
        { id: 'all', label: 'All Metrics', icon: Database },
    ];

    // Handle metric click to open modal
    const handleMetricClick = (metric: EsgMetric) => {
        setSelectedMetric(metric);
        setIsModalOpen(true);
    };

    // Close modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedMetric(null);
    };

    // Handle year comparison
    const handleCompareYears = (year1: number, year2: number) => {
        const comparison = compareYears(year1, year2);
        onCalculationClick('year-comparison', comparison);
    };

    // Get metric value for specific year
    const getMetricValueForYear = (metric: EsgMetric, year: number): EsgMetricValue | null => {
        return metric.values.find(v => v.year === year) || null;
    };

    // Sort handler
    const handleSort = (column: typeof sortBy) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    // Get sort icon
    const getSortIcon = (column: typeof sortBy) => {
        if (sortBy !== column) return null;
        return sortOrder === 'asc' ?
            <ChevronUp className="w-4 h-4 ml-1" /> :
            <ChevronDown className="w-4 h-4 ml-1" />;
    };

    // Extract area of interest from selectedCompany
    const companyAreaOfInterest = selectedCompany?.area_of_interest_metadata;
    const companyCoordinates = companyAreaOfInterest?.coordinates || [];
    const companyAreaName = companyAreaOfInterest?.name || areaName;
    const companyAreaCovered = companyAreaOfInterest?.area_covered || areaCovered;

    // Use company coordinates first, then provided coordinates
    const finalCoordinates = companyCoordinates.length > 0
        ? companyCoordinates
        : coordinates;

    // Calculate map center from final coordinates
    const mapCenter: [number, number] = finalCoordinates.length > 0
        ? [finalCoordinates[0].lat, finalCoordinates[0].lon]
        : [0, 0];

    // Calculate total metrics
    const totalMetrics = allSocialMetrics.length;
    const metricsWithTimeSeries = allSocialMetrics.filter(m => m.values.length > 1).length;
    const uniqueUnits = new Set(allSocialMetrics.map(m => m.unit)).size;

    if (loading || isRefreshing) {
        return (
            <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 text-green-600 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600">Loading social data...</p>
                </div>
            </div>
        );
    }

    if (!esgData.length) {
        return (
            <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl">
                <div className="text-center max-w-md p-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                        <Users className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">No Social Data Available</h3>
                    <p className="text-gray-600">No social ESG data found for the selected company and year.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-8 pb-8">
                {/* Company Details Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                    <div className="p-4 border-b border-gray-200" style={{ background: COLORS.background }}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm">
                                    <Building className="w-5 h-5" style={{ color: COLORS.primary }} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 mb-0.5">
                                        {selectedCompany?.name || "Company"}
                                    </h2>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-100 text-green-800 font-medium">
                                            {selectedCompany?.industry || "Social"}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 font-medium">
                                            {selectedCompany?.country || "Country"}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-medium">
                                            {selectedYear || latestYear || new Date().getFullYear()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-600 mb-0.5">Data Quality</p>
                                <p className="font-medium text-xs" style={{ color: COLORS.primary }}>
                                    {esgData[0]?.data_quality_score || 0}%
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
                                <p className="text-[10px] text-gray-600 mb-0.5">Reporting Years</p>
                                <p className="font-bold text-sm text-gray-900">{esgYears.length}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                                <p className="text-[10px] text-gray-600 mb-0.5">Social Metrics</p>
                                <p className="font-bold text-sm" style={{ color: COLORS.primary }}>
                                    {totalMetrics}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hero Section - Green Top Section */}
                <div
                    className="relative overflow-hidden rounded-2xl p-5 shadow-2xl"
                    style={{
                        background: `linear-gradient(to right, ${COLORS.darkGreen}, ${COLORS.primary})`
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
                                <h2 className="text-xl font-bold mb-1 text-white">Social Performance Dashboard</h2>
                                <p className="text-emerald-50 text-sm">Comprehensive social metrics and analysis</p>
                            </div>
                            <button
                                onClick={() => onCalculationClick("overview")}
                                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 text-white text-xs"
                            >
                                <Activity className="w-3.5 h-3.5" />
                                How Calculated?
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {/* Total Employees Card */}
                            <div
                                className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                                onClick={() => onMetricClick(socialSummary?.workforce?.total_employees, 'Total Employees')}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1.5 rounded-lg bg-white/20">
                                        <Users className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <p className="text-white font-bold text-xs">Total Employees</p>
                                </div>
                                <h3 className="text-xl font-normal mb-2 text-white">
                                    {socialSummary?.workforce?.total_employees?.value ?
                                        formatNumber(socialSummary.workforce.total_employees.value) : '---'}
                                </h3>
                                <div className="flex gap-1">
                                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-green-500/30 text-white font-medium">
                                        {socialSummary?.workforce?.female_employees?.percentage ?
                                            `${socialSummary.workforce.female_employees.percentage}% Female` : '--% Female'}
                                    </span>
                                </div>
                            </div>

                            {/* Gender Diversity Card */}
                            <div
                                className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                                onClick={() => onMetricClick(diversityMetrics, 'Gender Diversity')}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1.5 rounded-lg bg-white/20">
                                        <User className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <p className="text-white font-bold text-xs">Gender Diversity</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-emerald-100 mb-1">Female</p>
                                        <h3 className="text-xl font-normal text-white">
                                            {socialSummary?.workforce?.female_employees?.percentage ?
                                                `${socialSummary.workforce.female_employees.percentage}%` : '--%'}
                                        </h3>
                                    </div>
                                    <div>
                                        <p className="text-xs text-emerald-100 mb-1">Male</p>
                                        <h3 className="text-xl font-normal text-white">
                                            {socialSummary?.workforce?.male_employees?.percentage ?
                                                `${socialSummary.workforce.male_employees.percentage}%` : '--%'}
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            {/* Safety Performance Card */}
                            <div
                                className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                                onClick={() => onMetricClick(socialSummary?.safety?.ltifr, 'Safety Performance')}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1.5 rounded-lg bg-white/20">
                                        <Shield className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <p className="text-white font-bold text-xs">Safety (LTIFR)</p>
                                </div>
                                <h3 className="text-xl font-normal mb-2 text-white">
                                    {socialSummary?.safety?.ltifr?.value ?
                                        socialSummary.safety.ltifr.value.toFixed(3) : '---'}
                                </h3>
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                    {safetyMetrics?.safety_level || 'Good'}
                                </span>
                            </div>

                            {/* Training Hours Card */}
                            <div
                                className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-3 cursor-pointer hover:bg-white/20 transition-all"
                                onClick={() => onMetricClick(socialSummary?.development, 'Training & Development')}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1.5 rounded-lg bg-white/20">
                                        <GraduationCap className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <p className="text-white font-bold text-xs">Avg Training Hours</p>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <p className="text-xs text-emerald-100 mb-1">Male</p>
                                        <h3 className="text-lg font-normal text-white">
                                            {socialSummary?.development?.training_hours_male?.value ?
                                                formatNumber(socialSummary.development.training_hours_male.value) : '--'}
                                        </h3>
                                    </div>
                                    <div>
                                        <p className="text-xs text-emerald-100 mb-1">Female</p>
                                        <h3 className="text-lg font-normal text-white">
                                            {socialSummary?.development?.training_hours_female?.value ?
                                                formatNumber(socialSummary.development.training_hours_female.value) : '--'}
                                        </h3>
                                    </div>
                                </div>
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-medium">
                                    Hours
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Workforce Composition Section */}
                <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Workforce Composition</h3>
                            <p className="text-gray-600">Breakdown of employees by type and contract for selected year</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <select
                                    value={selectedChartYear}
                                    onChange={(e) => setSelectedChartYear(Number(e.target.value))}
                                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    {esgYears.map(year => (
                                        <option key={year} value={year}>
                                            {year}
                                            {year === latestYear ? ' (Latest)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Permanent Employees */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white border border-green-200">
                                    <FileText className="w-6 h-6" style={{ color: COLORS.primary }} />
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-bold text-green-800 bg-green-200">
                                    {workforceCompositionData?.permanent?.percentage?.toFixed(1) || 0}%
                                </span>
                            </div>
                            <h4 className="text-3xl font-bold text-gray-900 mb-2">
                                {workforceCompositionData?.permanent?.value ?
                                    formatNumber(workforceCompositionData.permanent.value) : '---'}
                            </h4>
                            <p className="text-gray-600 font-medium">Permanent Employees</p>
                            <div className="mt-4 h-2 bg-green-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${workforceCompositionData?.permanent?.percentage || 0}%`,
                                        background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.emerald})`
                                    }}
                                ></div>
                            </div>
                        </div>

                        {/* Fixed-term Employees */}
                        <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-6 border border-blue-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white border border-blue-200">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-bold text-blue-800 bg-blue-200">
                                    {workforceCompositionData?.fixed_term?.percentage?.toFixed(1) || 0}%
                                </span>
                            </div>
                            <h4 className="text-3xl font-bold text-gray-900 mb-2">
                                {workforceCompositionData?.fixed_term?.value ?
                                    formatNumber(workforceCompositionData.fixed_term.value) : '---'}
                            </h4>
                            <p className="text-gray-600 font-medium">Fixed-term Employees</p>
                            <div className="mt-4 h-2 bg-blue-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-blue-500"
                                    style={{
                                        width: `${workforceCompositionData?.fixed_term?.percentage || 0}%`
                                    }}
                                ></div>
                            </div>
                        </div>

                        {/* Graduate Trainees */}
                        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white border border-purple-200">
                                    <GraduationCap className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                            <h4 className="text-3xl font-bold text-gray-900 mb-2">
                                {workforceCompositionData?.graduate_trainees?.value ?
                                    formatNumber(workforceCompositionData.graduate_trainees.value) : '---'}
                            </h4>
                            <p className="text-gray-600 font-medium">Graduate Trainees</p>
                            <div className="mt-4 flex items-center gap-2">
                                <div className="w-full h-2 bg-purple-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-purple-500"
                                        style={{
                                            width: workforceCompositionData?.graduate_trainees?.value ?
                                                `${Math.min(workforceCompositionData.graduate_trainees.value / 10 * 100, 100)}%` : '0%'
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Apprentices */}
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white border border-orange-200">
                                    <GraduationCap className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                            <h4 className="text-3xl font-bold text-gray-900 mb-2">
                                {workforceCompositionData?.apprentices?.value ?
                                    formatNumber(workforceCompositionData.apprentices.value) : '---'}
                            </h4>
                            <p className="text-gray-600 font-medium">Apprentices</p>
                            <div className="mt-4 flex items-center gap-2">
                                <div className="w-full h-2 bg-orange-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-orange-500"
                                        style={{
                                            width: workforceCompositionData?.apprentices?.value ?
                                                `${Math.min(workforceCompositionData.apprentices.value / 20 * 100, 100)}%` : '0%'
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Social Metrics Categories</h3>
                            <p className="text-gray-600">Explore social metrics by category</p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search metrics..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            {/* Only show metric type filter on "All Metrics" tab */}
                            {activeTab === 'all' && (
                                <select
                                    value={selectedMetricType}
                                    onChange={(e) => setSelectedMetricType(e.target.value)}
                                    className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    {metricTypes.map(type => (
                                        <option key={type.id} value={type.id}>{type.label}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id as any);
                                        if (tab.id !== 'all') {
                                            setSelectedMetricType('all');
                                        }
                                    }}
                                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${isActive
                                        ? 'text-white shadow-lg transform scale-[1.02]'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    style={isActive ? {
                                        background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.darkGreen})`,
                                    } : {}}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'overview' ? (
                        /* Overview Tab - Bar Chart */
                        <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Key Social Metrics</h3>
                                    <p className="text-gray-600">Overview of major social performance indicators</p>
                                </div>
                            </div>

                            {/* Bar Chart */}
                            <div className="h-80 mt-8">
                                {barChartMetrics.length > 0 ? (
                                    <div className="h-full flex items-end gap-2 overflow-x-auto p-4 bg-gradient-to-b from-green-50 to-emerald-50 rounded-2xl">
                                        {barChartMetrics.map((metric, index) => {
                                            const Icon = metric.icon;
                                            const color = index % 3 === 0 ? COLORS.primary :
                                                index % 3 === 1 ? COLORS.blue :
                                                    index % 3 === 2 ? COLORS.purple : COLORS.orange;

                                            return (
                                                <div key={index} className="flex flex-col items-center flex-1 min-w-[80px]">
                                                    {/* Bar */}
                                                    <div className="relative w-8 mb-2">
                                                        <div
                                                            className="w-full rounded-t-lg transition-all duration-300 hover:opacity-90"
                                                            style={{
                                                                height: `${(metric.value / maxBarValue) * 100}%`,
                                                                background: `linear-gradient(to top, ${color}, ${COLORS.emerald})`,
                                                                minHeight: '20px',
                                                            }}
                                                        >
                                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded whitespace-nowrap">
                                                                {formatNumber(metric.value)}
                                                                <div className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Icon and Metric Info */}
                                                    <div className="text-center">
                                                        {Icon && (
                                                            <div className="w-6 h-6 mx-auto mb-1 flex items-center justify-center rounded-full bg-gray-100">
                                                                <Icon className="w-3 h-3 text-gray-600" />
                                                            </div>
                                                        )}
                                                        <p className="text-xs text-gray-600 font-medium mb-1 truncate max-w-[100px]">
                                                            {metric.name.split(' - ')[1] || metric.name}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500">{metric.unit || 'Count'}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
                                        <div className="text-center">
                                            <BarChart3 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                                            <p className="text-gray-600">No bar chart data available</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Legend */}
                            <div className="mt-6 flex flex-wrap gap-4 justify-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded" style={{ background: COLORS.primary }}></div>
                                    <span className="text-sm text-gray-600">Workforce</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded" style={{ background: COLORS.blue }}></div>
                                    <span className="text-sm text-gray-600">Diversity</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded" style={{ background: COLORS.purple }}></div>
                                    <span className="text-sm text-gray-600">Training</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded" style={{ background: COLORS.orange }}></div>
                                    <span className="text-sm text-gray-600">Welfare</span>
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'all' ? (
                        /* All Metrics Tab - Table View */
                        <div className="overflow-x-auto rounded-2xl border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
                                    <tr>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-green-100"
                                            onClick={() => handleSort('name')}
                                        >
                                            <div className="flex items-center">
                                                Metric Name
                                                {getSortIcon('name')}
                                            </div>
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-green-100"
                                            onClick={() => handleSort('unit')}
                                        >
                                            <div className="flex items-center">
                                                Unit
                                                {getSortIcon('unit')}
                                            </div>
                                        </th>
                                        {esgYears.map(year => (
                                            <th key={year} className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                                                {year}
                                                {year === latestYear && (
                                                    <span className="ml-1 text-green-600">●</span>
                                                )}
                                            </th>
                                        ))}
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                                            Trend
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredMetrics.map((metric) => {
                                        const latestValue = metric.values.reduce((prev, curr) =>
                                            prev.year > curr.year ? prev : curr
                                        );
                                        const hasTrend = metric.values.length > 1;
                                        const metricType = metricTypes.find(t =>
                                            metric.metric_name.toLowerCase().includes(t.id) ||
                                            (t.id === 'all' ? false : metric.description?.toLowerCase().includes(t.id))
                                        ) || metricTypes[0];

                                        return (
                                            <tr
                                                key={metric._id}
                                                className="hover:bg-green-50 transition-colors cursor-pointer"
                                                onClick={() => handleMetricClick(metric)}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-start gap-3">
                                                        <div
                                                            className="w-3 h-3 rounded-full mt-1.5"
                                                            style={{ background: metricType.color }}
                                                        ></div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{metric.metric_name}</p>
                                                            {metric.description && (
                                                                <p className="text-sm text-gray-500 mt-1">{metric.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                                        style={{
                                                            background: `${metricType.color}20`,
                                                            color: metricType.color
                                                        }}
                                                    >
                                                        {metric.unit || 'N/A'}
                                                    </span>
                                                </td>
                                                {esgYears.map(year => {
                                                    const value = getMetricValueForYear(metric, year);
                                                    return (
                                                        <td key={year} className="px-6 py-4">
                                                            {value ? (
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold text-gray-900">
                                                                        {value.numeric_value !== null ?
                                                                            formatNumber(value.numeric_value) :
                                                                            value.value}
                                                                    </span>
                                                                    {value.source_notes && (
                                                                        <span className="text-xs text-gray-500 mt-1" title={value.source_notes}>
                                                                            {value.source_notes.length > 30 ?
                                                                                `${value.source_notes.substring(0, 30)}...` :
                                                                                value.source_notes}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400">-</span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                                <td className="px-6 py-4">
                                                    {hasTrend ? (
                                                        <div className="flex items-center gap-2">
                                                            {getTrendIcon('stable')}
                                                            <span className="text-sm text-gray-600">
                                                                {metric.values.length} year{metric.values.length > 1 ? 's' : ''}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">No trend</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleMetricClick(metric);
                                                            }}
                                                            className="p-2 rounded-lg text-white hover:opacity-90 transition-opacity"
                                                            title="View Details"
                                                            style={{
                                                                background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.darkGreen})`
                                                            }}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {filteredMetrics.length === 0 && (
                                <div className="text-center py-12">
                                    <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">No metrics found</h4>
                                    <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Category Tabs - Grid View */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredMetrics.map((metric) => {
                                const latestValue = metric.values.reduce((prev, curr) =>
                                    prev.year > curr.year ? prev : curr
                                );
                                let metricType;

                                // Determine color based on active tab
                                switch (activeTab) {
                                    case 'workforce':
                                        metricType = { color: COLORS.blue };
                                        break;
                                    case 'diversity':
                                        metricType = { color: COLORS.pink };
                                        break;
                                    case 'safety':
                                        metricType = { color: COLORS.warning };
                                        break;
                                    case 'training':
                                        metricType = { color: COLORS.orange };
                                        break;
                                    case 'welfare':
                                        metricType = { color: COLORS.teal };
                                        break;
                                    default:
                                        metricType = { color: COLORS.primary };
                                }

                                return (
                                    <div
                                        key={metric._id}
                                        className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-6 hover:border-green-300 transition-all hover:shadow-lg cursor-pointer"
                                        onClick={() => handleMetricClick(metric)}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                                style={{ background: `${metricType.color}20` }}
                                            >
                                                {activeTab === 'workforce' && <Users className="w-5 h-5" style={{ color: metricType.color }} />}
                                                {activeTab === 'diversity' && <User className="w-5 h-5" style={{ color: metricType.color }} />}
                                                {activeTab === 'training' && <GraduationCap className="w-5 h-5" style={{ color: metricType.color }} />}
                                                {activeTab === 'safety' && <Shield className="w-5 h-5" style={{ color: metricType.color }} />}
                                                {activeTab === 'welfare' && <Heart className="w-5 h-5" style={{ color: metricType.color }} />}
                                            </div>
                                            <span
                                                className="px-2 py-1 rounded-full text-xs font-medium"
                                                style={{
                                                    background: `${metricType.color}20`,
                                                    color: metricType.color
                                                }}
                                            >
                                                {metric.unit || 'N/A'}
                                            </span>
                                        </div>

                                        <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">
                                            {metric.metric_name}
                                        </h4>

                                        {metric.description && (
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                                {metric.description}
                                            </p>
                                        )}

                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Latest Value</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {latestValue.numeric_value !== null ?
                                                        formatNumber(latestValue.numeric_value) :
                                                        latestValue.value}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600">
                                                        {metric.values.length} year{metric.values.length > 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Click for details
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Load More / Show Less for non-table views */}
                    {activeTab !== 'all' && filteredMetrics.length > 0 && (
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setShowAllMetrics(!showAllMetrics)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-white"
                                style={{
                                    background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.darkGreen})`,
                                }}
                            >
                                {showAllMetrics ? (
                                    <>
                                        <Minus className="w-4 h-4" />
                                        Show Less
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4" />
                                        Show More Metrics
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Summary Stats */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 rounded-xl bg-green-50 border border-green-200">
                                <p className="text-2xl font-bold text-gray-900">{filteredMetrics.length}</p>
                                <p className="text-sm text-gray-600">
                                    {activeTab === 'all' ? 'Total' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Metrics
                                </p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-blue-50 border border-blue-200">
                                <p className="text-2xl font-bold text-gray-900">{esgYears.length}</p>
                                <p className="text-sm text-gray-600">Years Available</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-purple-50 border border-purple-200">
                                <p className="text-2xl font-bold text-gray-900">
                                    {new Set(filteredMetrics.map(m => m.unit)).size}
                                </p>
                                <p className="text-sm text-gray-600">Unique Units</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-amber-50 border border-amber-200">
                                <p className="text-2xl font-bold text-gray-900">
                                    {filteredMetrics.filter(m => m.values.length > 1).length}
                                </p>
                                <p className="text-sm text-gray-600">Time Series</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metric Details Modal */}
            <MetricModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                metric={selectedMetric}
                formatNumber={formatNumber}
                esgYears={esgYears}
                selectedCompany={selectedCompany}
            />
        </>
    );
};

export default MainTab;