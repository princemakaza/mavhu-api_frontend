// compliance_tabs/ComplianceAnalyticsTab.tsx
import React, { useState, useMemo } from 'react';
import {
    BarChart3,
    PieChart,
    TrendingUp,
    TrendingDown,
    Filter,
    Download,
    Target,
    AlertTriangle,
    Lightbulb,
    Leaf,
    Users,
    Shield,
    CheckCircle,
    X,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Info,
    Calendar,
    TrendingUpDown,
    TargetIcon,
    Clock,
    Zap,
    Award,
    BarChart,
    ShieldCheck,
    Share2
} from 'lucide-react';
import type {
    FarmComplianceResponse,
    CarbonPredictions,
    Recommendations,
    Trends,
    Scope3Analysis,
    ComplianceScores,
    Metrics
} from '../../../../services/Admin_Service/esg_apis/farm_compliance_service';

interface ComplianceAnalyticsTabProps {
    complianceData: FarmComplianceResponse | null;
    formatNumber: (num: number | null) => string;
    formatPercent: (num: number | null) => string;
    colors: any;
    selectedYear: number | null;
}

const ComplianceAnalyticsTab: React.FC<ComplianceAnalyticsTabProps> = ({
    complianceData,
    formatNumber,
    formatPercent,
    colors,
    selectedYear,
}) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [showPredictionsModal, setShowPredictionsModal] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!complianceData) {
        return (
            <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl">
                <div className="text-center max-w-md p-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                        <Activity className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">No Compliance Analytics Data</h3>
                    <p className="text-gray-600 leading-relaxed">Select a company to view detailed compliance analytics and insights.</p>
                </div>
            </div>
        );
    }

    const {
        compliance_scores,
        metrics,
        scope3_analysis,
        trends,
        recommendations,
        carbon_predictions,
        data_quality,
        company,
        carbon_emissions,
        carbon_sequestration
    } = complianceData.data;

    // Helper function to get trend icon
    const getTrendIcon = (trend: string) => {
        const lowerTrend = trend?.toLowerCase() || '';
        if (lowerTrend.includes('increas') || lowerTrend.includes('improv') || lowerTrend.includes('posit')) {
            return <TrendingUp className="w-4 h-4 text-green-600" />;
        } else if (lowerTrend.includes('decreas') || lowerTrend.includes('declin') || lowerTrend.includes('negat')) {
            return <TrendingDown className="w-4 h-4 text-orange-600" />;
        }
        return <TrendingUpDown className="w-4 h-4 text-gray-600" />;
    };

    // Prepare data for charts
    const complianceBreakdownData = useMemo(() => {
        const scores = compliance_scores.scores;
        return {
            labels: ['Training', 'Supplier', 'GRI', 'IFRS S1', 'IFRS S2', 'TCFD', 'Carbon', 'Data Quality'],
            datasets: [{
                label: 'Compliance Score',
                data: [
                    scores.trainingHours,
                    scores.supplierCompliance,
                    scores.griCompliance,
                    scores.ifrsS1Alignment,
                    scores.ifrsS2Alignment,
                    scores.tcfdImplementation,
                    scores.carbonScore,
                    scores.dataQuality
                ],
                backgroundColor: [
                    '#059669',
                    '#10b981',
                    '#34d399',
                    '#6ee7b7',
                    '#047857',
                    '#065f46',
                    '#16a34a',
                    '#22c55e'
                ],
                borderWidth: 1
            }]
        };
    }, [compliance_scores, colors]);

    const trainingDistributionData = useMemo(() => {
        const distribution = metrics.training.training_distribution;
        return {
            labels: ['Farmer Training', 'Safety Training', 'Technical Training', 'Compliance Training'],
            datasets: [{
                data: [
                    distribution.farmer_training || 0,
                    distribution.safety_training || 0,
                    distribution.technical_training || 0,
                    distribution.compliance_training || 0
                ],
                backgroundColor: [
                    '#059669',
                    '#10b981',
                    '#34d399',
                    '#6ee7b7'
                ],
                borderWidth: 1
            }]
        };
    }, [metrics, colors]);

    const scope3MetricsData = useMemo(() => {
        const scope3Metrics = scope3_analysis.metrics;
        return {
            labels: ['Suppliers with Code', 'Suppliers Audited', 'Non-Compliance', 'Corrective Actions'],
            datasets: [{
                label: 'Scope 3 Metrics',
                data: [
                    scope3Metrics.suppliersWithCode || 0,
                    scope3Metrics.auditsConducted || 0,
                    scope3Metrics.nonCompliances || 0,
                    scope3Metrics.correctiveActions || 0
                ],
                backgroundColor: [
                    '#05966980',
                    '#10b98180',
                    '#f9731680',
                    '#6ee7b780'
                ],
                borderColor: [
                    '#059669',
                    '#10b981',
                    '#f97316',
                    '#6ee7b7'
                ],
                borderWidth: 2
            }]
        };
    }, [scope3_analysis, colors]);

    // Mock chart component with improved design
    const MockChart = ({ title, data, type = 'bar' }: { title: string; data: any; type?: string }) => (
        <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                    {title}
                </h3>
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                        <Filter className="w-4 h-4 text-green-600" />
                    </button>
                    <button className="p-2 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                        <Download className="w-4 h-4 text-green-600" />
                    </button>
                </div>
            </div>
            <div className="h-64 relative">
                <div className="absolute inset-0 flex items-end justify-between px-4 pb-4 gap-2">
                    {data.datasets[0].data.map((value: number, index: number) => {
                        const maxValue = Math.max(...data.datasets[0].data);
                        const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                        const color = Array.isArray(data.datasets[0].backgroundColor)
                            ? data.datasets[0].backgroundColor[index]
                            : data.datasets[0].backgroundColor;

                        return (
                            <div key={index} className="flex flex-col items-center flex-1">
                                <div className="w-full flex justify-center mb-2">
                                    <div
                                        className="w-full max-w-[60px] rounded-lg transition-all duration-300 hover:opacity-80 cursor-pointer"
                                        style={{
                                            height: `${Math.max(height, 5)}%`,
                                            backgroundColor: color,
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                        }}
                                    />
                                </div>
                                <span className="text-xs text-gray-600 text-center px-1 truncate w-full font-medium">
                                    {data.labels[index]}
                                </span>
                                <span className="text-sm font-semibold text-gray-900 mt-1">
                                    {value}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    // Key metrics summary with consistent green theme
    const keyMetrics = [
        {
            title: 'Overall Compliance',
            value: compliance_scores.scores.overall,
            change: '+5.2%',
            icon: Award,
            gradient: 'from-green-500 to-emerald-600',
            bg: 'bg-green-50',
            trend: trends.compliance_trend
        },
        {
            title: 'Training Hours',
            value: metrics.training.total_training_hours || 0,
            change: '+12.4%',
            icon: Users,
            gradient: 'from-emerald-500 to-teal-600',
            bg: 'bg-emerald-50',
            trend: trends.training_trend
        },
        {
            title: 'Supplier Compliance',
            value: compliance_scores.scores.supplierCompliance,
            change: '-2.1%',
            icon: Shield,
            gradient: 'from-teal-500 to-cyan-600',
            bg: 'bg-teal-50',
            trend: trends.scope3_trend
        },
        {
            title: 'Carbon Score',
            value: compliance_scores.scores.carbonScore,
            change: '+3.8%',
            icon: Leaf,
            gradient: 'from-lime-500 to-green-600',
            bg: 'bg-lime-50',
            trend: trends.carbon_trend
        }
    ];

    // Trend analysis items
    const trendAnalysisItems = [
        {
            label: 'Training Hours',
            trend: trends.training_trend,
            change: '+12.4% YoY',
            color: '#059669'
        },
        {
            label: 'Supplier Compliance',
            trend: trends.scope3_trend,
            change: '-2.1% YoY',
            color: '#10b981'
        },
        {
            label: 'Carbon Score',
            trend: trends.carbon_trend,
            change: '+5.8% YoY',
            color: '#34d399'
        },
        {
            label: 'Data Quality',
            trend: 'Stable',
            change: '+8.7% YoY',
            color: '#6ee7b7'
        },
        {
            label: 'GRI Compliance',
            trend: trends.compliance_trend,
            change: '+3.2% YoY',
            color: '#047857'
        },
    ];

    // Carbon predictions display
    const renderCarbonPredictions = () => {
        if (!carbon_predictions) return null;

        const {
            projected_emissions_next_year,
            carbon_neutrality_timeline,
            sequestration_potential,
            scope3_reduction_opportunities
        } = carbon_predictions;

        return (
            <div className="space-y-6">
                {/* Projected Emissions */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6">
                    <h4 className="font-semibold text-lg text-gray-900 mb-5 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white">
                            <TargetIcon className="w-5 h-5 text-green-600" />
                        </div>
                        Projected Emissions Next Year
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-white border border-green-100">
                            <p className="text-xs text-gray-600 mb-2 font-medium">Scope 1</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatNumber(projected_emissions_next_year.projected_scope1)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">tCO₂e</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white border border-green-100">
                            <p className="text-xs text-gray-600 mb-2 font-medium">Scope 2</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatNumber(projected_emissions_next_year.projected_scope2)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">tCO₂e</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white border border-green-100">
                            <p className="text-xs text-gray-600 mb-2 font-medium">Scope 3</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatNumber(projected_emissions_next_year.projected_scope3)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">tCO₂e</p>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                            <p className="text-xs mb-2 font-medium">Reduction</p>
                            <p className="text-2xl font-bold">
                                {projected_emissions_next_year.reduction_percentage}%
                            </p>
                            <p className="text-xs opacity-90 mt-1">vs current</p>
                        </div>
                    </div>
                </div>

                {/* Carbon Neutrality Timeline */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-6">
                    <h4 className="font-semibold text-lg text-gray-900 mb-5 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white">
                            <Calendar className="w-5 h-5 text-emerald-600" />
                        </div>
                        Carbon Neutrality Timeline
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-white border border-emerald-100">
                            <p className="text-xs text-gray-600 mb-2 font-medium">Target Year</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {carbon_neutrality_timeline.target_year}
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-white border border-emerald-100">
                            <p className="text-xs text-gray-600 mb-2 font-medium">Years Remaining</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {carbon_neutrality_timeline.years_remaining}
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-white border border-emerald-100">
                            <p className="text-xs text-gray-600 mb-2 font-medium">Annual Reduction</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatNumber(carbon_neutrality_timeline.required_annual_reduction)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">tCO₂/year</p>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                            <p className="text-xs mb-2 font-medium">Status</p>
                            <p className="text-2xl font-bold capitalize">
                                {carbon_neutrality_timeline.status}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sequestration Potential */}
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl border border-teal-200 p-6">
                    <h4 className="font-semibold text-lg text-gray-900 mb-5 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white">
                            <Leaf className="w-5 h-5 text-teal-600" />
                        </div>
                        Sequestration Potential
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-white border border-teal-100">
                            <p className="text-xs text-gray-600 mb-2 font-medium">Current</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatNumber(sequestration_potential.current_sequestration_tco2)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">tCO₂</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white border border-teal-100">
                            <p className="text-xs text-gray-600 mb-2 font-medium">Potential</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatNumber(sequestration_potential.potential_sequestration_tco2)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">tCO₂</p>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
                            <p className="text-xs mb-2 font-medium">Increase Possible</p>
                            <p className="text-2xl font-bold">
                                {sequestration_potential.increase_percentage}%
                            </p>
                            <p className="text-xs opacity-90 mt-1">improvement</p>
                        </div>
                    </div>
                </div>

                {/* Scope 3 Reduction Opportunities */}
                <div className="bg-gradient-to-br from-green-50 to-lime-50 rounded-2xl border border-green-200 p-6">
                    <h4 className="font-semibold text-lg text-gray-900 mb-5 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white">
                            <Zap className="w-5 h-5 text-green-600" />
                        </div>
                        Scope 3 Reduction Opportunities
                    </h4>
                    <div className="space-y-3">
                        {scope3_reduction_opportunities.reduction_opportunities.map((opportunity, index) => (
                            <div key={index} className="p-5 rounded-xl bg-white border border-green-100 hover:border-green-300 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${opportunity.priority === 'High'
                                                ? 'bg-orange-100 text-orange-700'
                                                : opportunity.priority === 'Medium'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-green-100 text-green-700'
                                            }`}>
                                            {opportunity.priority}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-900">{opportunity.area}</span>
                                    </div>
                                    <span className="text-xs font-medium text-green-600">{opportunity.potential_reduction}</span>
                                </div>
                                <div className="space-y-2">
                                    {opportunity.actions.map((action, actionIndex) => (
                                        <div key={actionIndex} className="flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-gray-700">{action}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 pb-8">

            {/* Tab Navigation */}
            <div className="flex items-center gap-3 flex-wrap bg-white p-2 rounded-2xl border border-green-100">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 min-w-[140px] px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'overview'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-green-50'
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <BarChart className="w-4 h-4" />
                        Overview
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('predictions')}
                    className={`flex-1 min-w-[140px] px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'predictions'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-green-50'
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Target className="w-4 h-4" />
                        Predictions
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('recommendations')}
                    className={`flex-1 min-w-[140px] px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'recommendations'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-green-50'
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Recommendations
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('trends')}
                    className={`flex-1 min-w-[140px] px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'trends'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-green-50'
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Trends
                    </div>
                </button>
            </div>

            {activeTab === 'overview' && (
                <>
                    {/* Key Metrics Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {keyMetrics.map((metric, index) => (
                            <div key={index} className={`${metric.bg} rounded-2xl border border-green-200 p-5 hover:shadow-md transition-all duration-300`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-xl bg-gradient-to-r ${metric.gradient}`}>
                                        <metric.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${metric.change.startsWith('+')
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {metric.change}
                                    </span>
                                </div>
                                <h4 className="text-sm font-medium text-gray-600 mb-2">{metric.title}</h4>
                                <p className="text-3xl font-bold text-gray-900 mb-2">
                                    {metric.value}
                                </p>
                                <div className="flex items-center gap-2">
                                    {getTrendIcon(metric.trend)}
                                    <span className="text-xs text-gray-600 font-medium">{metric.trend}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <MockChart
                            title="Compliance Score Breakdown"
                            data={complianceBreakdownData}
                        />
                        <MockChart
                            title="Training Distribution"
                            data={trainingDistributionData}
                            type="pie"
                        />
                        <MockChart
                            title="Scope 3 Engagement Metrics"
                            data={scope3MetricsData}
                        />

                        {/* Trend Analysis */}
                        <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Trend Analysis
                                </h3>
                                <button className="p-2 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                                    <Download className="w-4 h-4 text-green-600" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {trendAnalysisItems.map((item, index) => (
                                    <div key={index} className="p-4 rounded-xl border border-gray-200 hover:border-green-300 bg-gradient-to-r from-gray-50 to-white hover:from-green-50 hover:to-emerald-50 transition-all duration-300">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                                <span className="text-sm font-semibold text-gray-900">{item.label}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-gray-600 font-medium">{item.trend}</span>
                                                <span className={`text-sm font-semibold ${item.change.startsWith('+')
                                                        ? 'text-green-600'
                                                        : 'text-orange-600'
                                                    }`}>
                                                    {item.change}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'predictions' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-green-100 p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                                    <div className="w-1.5 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                                    Carbon Predictions & Projections
                                </h3>
                                <p className="text-gray-600">AI-powered forecasts and carbon neutrality roadmap</p>
                            </div>
                            <button className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all shadow-sm">
                                <Download className="w-5 h-5" />
                            </button>
                        </div>
                        {renderCarbonPredictions()}
                    </div>
                </div>
            )}

            {activeTab === 'recommendations' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-green-100 p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                                    <div className="w-1.5 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                                    Action Recommendations
                                </h3>
                                <p className="text-gray-600">Prioritized actions based on compliance analysis</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                                    <Share2 className="w-5 h-5 text-green-600" />
                                </button>
                                <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all shadow-sm font-medium text-sm">
                                    Export Plan
                                </button>
                            </div>
                        </div>

                        {/* Immediate Recommendations */}
                        <div className="mb-8">
                            <h4 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-orange-100">
                                    <Zap className="w-5 h-5 text-orange-600" />
                                </div>
                                Immediate Actions (0-3 months)
                            </h4>
                            <div className="grid md:grid-cols-2 gap-4">
                                {recommendations.immediate.map((recommendation, index) => (
                                    <div key={index} className="p-5 rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white hover:border-orange-300 transition-all duration-300">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-lg bg-orange-100 flex-shrink-0">
                                                <AlertTriangle className="w-5 h-5 text-orange-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h5 className="font-semibold text-base text-gray-900 mb-2">Priority {index + 1}</h5>
                                                <p className="text-sm text-gray-700 leading-relaxed mb-3">{recommendation}</p>
                                                <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all font-medium text-sm">
                                                    Start Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Medium Term Recommendations */}
                        <div className="mb-8">
                            <h4 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-100">
                                    <Calendar className="w-5 h-5 text-green-600" />
                                </div>
                                Medium Term (3-12 months)
                            </h4>
                            <div className="grid md:grid-cols-2 gap-4">
                                {recommendations.medium_term.map((recommendation, index) => (
                                    <div key={index} className="p-5 rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-white hover:border-green-300 transition-all duration-300">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-lg bg-green-100 flex-shrink-0">
                                                <Target className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h5 className="font-semibold text-base text-gray-900 mb-2">Goal {index + 1}</h5>
                                                <p className="text-sm text-gray-700 leading-relaxed mb-3">{recommendation}</p>
                                                <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-medium text-sm">
                                                    Plan Project
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Long Term Recommendations */}
                        <div>
                            <h4 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-100">
                                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                                </div>
                                Long Term (1-3 years)
                            </h4>
                            <div className="grid md:grid-cols-2 gap-4">
                                {recommendations.long_term.map((recommendation, index) => (
                                    <div key={index} className="p-5 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white hover:border-emerald-300 transition-all duration-300">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-lg bg-emerald-100 flex-shrink-0">
                                                <Award className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h5 className="font-semibold text-base text-gray-900 mb-2">Vision {index + 1}</h5>
                                                <p className="text-sm text-gray-700 leading-relaxed mb-3">{recommendation}</p>
                                                <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all font-medium text-sm">
                                                    Strategic Plan
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'trends' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-green-100 p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                                    <div className="w-1.5 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                                    Compliance Trends Analysis
                                </h3>
                                <p className="text-gray-600">Historical trends and performance patterns</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                                    <Filter className="w-5 h-5 text-green-600" />
                                </button>
                                <button className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all shadow-sm">
                                    <Download className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Trend Cards */}
                        <div className="grid md:grid-cols-2 gap-5">
                            <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                                <h4 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-white">
                                        <TrendingUp className="w-5 h-5 text-green-600" />
                                    </div>
                                    Training Trends
                                </h4>
                                <p className="text-3xl font-bold text-green-700 mb-2">{trends.training_trend}</p>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    Training hours showing {trends.training_trend.toLowerCase()} trend with {metrics.training.total_training_hours || 0} total hours
                                </p>
                            </div>

                            <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
                                <h4 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-white">
                                        <Shield className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    Compliance Trends
                                </h4>
                                <p className="text-3xl font-bold text-emerald-700 mb-2">{trends.compliance_trend}</p>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    Overall compliance {trends.compliance_trend.toLowerCase()} with current score of {compliance_scores.scores.overall}
                                </p>
                            </div>

                            <div className="p-6 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200">
                                <h4 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-white">
                                        <Users className="w-5 h-5 text-teal-600" />
                                    </div>
                                    Scope 3 Trends
                                </h4>
                                <p className="text-3xl font-bold text-teal-700 mb-2">{trends.scope3_trend}</p>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    Supplier engagement {trends.scope3_trend.toLowerCase()} with {scope3_analysis.metrics.suppliersWithCode || 0} compliant suppliers
                                </p>
                            </div>

                            <div className="p-6 rounded-xl bg-gradient-to-br from-lime-50 to-green-50 border border-lime-200">
                                <h4 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-white">
                                        <Leaf className="w-5 h-5 text-lime-600" />
                                    </div>
                                    Carbon Trends
                                </h4>
                                <p className="text-3xl font-bold text-lime-700 mb-2">{trends.carbon_trend}</p>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    Carbon performance {trends.carbon_trend.toLowerCase()} with net balance of {formatNumber(carbon_emissions.net_carbon_balance_tco2e)} tCO₂
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Data Quality Section */}
            <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl border border-green-100 shadow-sm p-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">Data Quality & Verification</h3>
                        <p className="text-gray-600">Metrics validation and verification status</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-xl border border-green-200 bg-white">
                        <p className="text-xs text-gray-600 mb-2 font-medium">Completeness Score</p>
                        <p className="text-3xl font-bold text-gray-900">{data_quality.data_coverage}%</p>
                    </div>
                    <div className="p-5 rounded-xl border border-green-200 bg-white">
                        <p className="text-xs text-gray-600 mb-2 font-medium">Verified Metrics</p>
                        <p className="text-3xl font-bold text-gray-900">{data_quality.verified_metrics}</p>
                    </div>
                    <div className="p-5 rounded-xl border border-green-200 bg-white">
                        <p className="text-xs text-gray-600 mb-2 font-medium">Carbon Data</p>
                        <p className="text-lg font-bold text-gray-900">
                            {data_quality.carbon_data_available ? 'Available' : 'Not Available'}
                        </p>
                    </div>
                    <div className="p-5 rounded-xl border border-green-200 bg-white">
                        <p className="text-xs text-gray-600 mb-2 font-medium">Verification Status</p>
                        <p className="text-lg font-bold text-gray-900">
                            {data_quality.carbon_verification_status}
                        </p>
                    </div>
                </div>
            </div>

            {/* Detailed Metrics Table */}
            <div className="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-green-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                                Detailed Compliance Metrics
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">Year: {selectedYear} | Company: {company.name}</p>
                        </div>
                        <button className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all shadow-sm font-medium text-sm">
                            Export Report
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gradient-to-r from-green-50 to-emerald-50">
                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Metric Category</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Current Value</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Target</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Variance</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { category: 'Overall Compliance', current: compliance_scores.scores.overall, target: 85, variance: compliance_scores.scores.overall - 85, status: compliance_scores.scores.overall >= 85 ? 'Achieved' : 'Below Target' },
                                { category: 'Training Hours', current: metrics.training.total_training_hours || 0, target: 1000, variance: (metrics.training.total_training_hours || 0) - 1000, status: (metrics.training.total_training_hours || 0) >= 1000 ? 'Achieved' : 'Below Target' },
                                { category: 'Trained Employees', current: metrics.training.employees_trained_total || 0, target: 50, variance: (metrics.training.employees_trained_total || 0) - 50, status: (metrics.training.employees_trained_total || 0) >= 50 ? 'Achieved' : 'Below Target' },
                                { category: 'Supplier Compliance', current: compliance_scores.scores.supplierCompliance, target: 80, variance: compliance_scores.scores.supplierCompliance - 80, status: compliance_scores.scores.supplierCompliance >= 80 ? 'Achieved' : 'Below Target' },
                                { category: 'GRI Compliance', current: compliance_scores.scores.griCompliance, target: 75, variance: compliance_scores.scores.griCompliance - 75, status: compliance_scores.scores.griCompliance >= 75 ? 'Achieved' : 'Below Target' },
                                { category: 'Carbon Score', current: compliance_scores.scores.carbonScore, target: 70, variance: compliance_scores.scores.carbonScore - 70, status: compliance_scores.scores.carbonScore >= 70 ? 'Achieved' : 'Below Target' },
                                { category: 'Data Quality', current: compliance_scores.scores.dataQuality, target: 90, variance: compliance_scores.scores.dataQuality - 90, status: compliance_scores.scores.dataQuality >= 90 ? 'Achieved' : 'Below Target' },
                            ].map((row, index) => (
                                <tr key={index} className="border-b border-gray-100 hover:bg-green-50 transition-colors">
                                    <td className="py-4 px-6 text-sm text-gray-900 font-medium">{row.category}</td>
                                    <td className="py-4 px-6 text-sm font-semibold text-gray-900">{row.current}</td>
                                    <td className="py-4 px-6 text-sm text-gray-700">{row.target}</td>
                                    <td className="py-4 px-6 text-sm">
                                        <span className={`font-semibold ${row.variance >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                                            {row.variance >= 0 ? '+' : ''}{row.variance}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-sm">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${row.status === 'Achieved'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ComplianceAnalyticsTab;