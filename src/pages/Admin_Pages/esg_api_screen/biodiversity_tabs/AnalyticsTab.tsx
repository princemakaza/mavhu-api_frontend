import React, { useState } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Activity,
    Target,
    AlertTriangle,
    DollarSign,
    Info,
    Lightbulb,
    ShieldCheck,
    Leaf,
    Trees,
    Globe,
    Users,
    Shield,
    AlertCircle,
    CheckCircle,
    X,
    Download,
    Share2,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    Droplets,
    Factory,
    Sprout,
    TrendingUpDown,
} from "lucide-react";
import type { BiodiversityLandUseResponse } from '../../../../services/Admin_Service/esg_apis/biodiversity_api_service';

// Enhanced Color Palette with Green Theme
const COLORS = {
    primary: '#008000',
    primaryDark: '#006400',
    primaryLight: '#10B981',
    primaryPale: '#D1FAE5',
    accent: '#22C55E',
    accentGold: '#F59E0B',
    success: '#10B981',
    warning: '#FBBF24',
    danger: '#EF4444',
    info: '#3B82F6',
};

interface AnalyticsTabProps {
    biodiversityData: BiodiversityLandUseResponse | null;
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
}) => {
    const [activeInsightTab, setActiveInsightTab] = useState('trends');
    const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!biodiversityData) {
        return (
            <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl">
                <div className="text-center max-w-md p-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                        <Activity className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">No Analytics Data Available</h3>
                    <p className="text-gray-600 leading-relaxed">Select a company to view detailed biodiversity analytics and insights.</p>
                </div>
            </div>
        );
    }

    const {
        deforestation_analysis,
        land_use_metrics,
        environmental_impact,
        social_governance,
        carbon_emission_accounting,
        esg_metrics,
        key_statistics,
        reporting_period,
    } = biodiversityData.data;

    // Helper function to get trend icon
    const getTrendIcon = (trend: string) => {
        const lowerTrend = trend?.toLowerCase() || '';
        if (lowerTrend.includes('increas') || lowerTrend.includes('improv')) {
            return <TrendingUp className="w-4 h-4 text-green-600" />;
        } else if (lowerTrend.includes('decreas') || lowerTrend.includes('declin')) {
            return <TrendingDown className="w-4 h-4 text-red-600" />;
        }
        return <TrendingUpDown className="w-4 h-4 text-gray-600" />;
    };

    // Calculate derived metrics
    const getCurrentYearCarbonData = () => {
        const currentYear = reporting_period.current_year;
        return carbon_emission_accounting.yearly_data.find(y => y.year === currentYear);
    };

    const currentCarbonData = getCurrentYearCarbonData();
    const forestCoverage = deforestation_analysis.forest_coverage.coverage_percent || 0;
    const netCarbonBalance = currentCarbonData?.emissions.net_balance || 0;
    const totalSequestration = currentCarbonData?.sequestration.total_tco2 || 0;
    const totalEmissions = currentCarbonData?.emissions.total_tco2e || 0;

    // Key insights data
    const insights = {
        trends: [
            {
                title: 'Forest Coverage Trend',
                description: `Current forest coverage is ${forestCoverage.toFixed(1)}% with ${land_use_metrics.trends.forest_area_trend} trend`,
                icon: <Trees className="w-5 h-5 text-green-600" />,
                impact: land_use_metrics.trends.forest_area_trend.toLowerCase().includes('increas') ? 'High' : 'Medium',
                confidence: 0.85,
            },
            {
                title: 'Carbon Balance Status',
                description: `Net carbon balance is ${formatNumber(netCarbonBalance)} tCO₂, indicating ${netCarbonBalance < 0 ? 'net carbon sequestration' : 'net carbon emissions'}`,
                icon: <Leaf className="w-5 h-5 text-green-600" />,
                impact: 'High',
                confidence: 0.92,
            },
            {
                title: 'Agricultural Area Trend',
                description: `Agricultural expansion showing ${land_use_metrics.trends.agricultural_area_trend} pattern`,
                icon: <Sprout className="w-5 h-5 text-green-600" />,
                impact: 'Medium',
                confidence: 0.78,
            },
        ],
        risks: [
            {
                title: 'Deforestation Risk',
                description: `Forest coverage changed by ${deforestation_analysis.forest_coverage.change_percent.toFixed(1)}% from previous year`,
                icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
                priority: Math.abs(deforestation_analysis.forest_coverage.change_percent) > 5 ? 'High' : 'Medium',
                timeframe: 'Immediate',
            },
            {
                title: 'Agricultural Expansion',
                description: `Agricultural area changed by ${deforestation_analysis.agricultural_expansion.change_percent.toFixed(1)}%`,
                icon: <Globe className="w-5 h-5 text-amber-600" />,
                priority: Math.abs(deforestation_analysis.agricultural_expansion.change_percent) > 10 ? 'High' : 'Low',
                timeframe: 'Monitor',
            },
        ],
        opportunities: [
            {
                title: 'Carbon Credit Potential',
                description: totalSequestration > 0 ? `Potential ${formatNumber(totalSequestration * 0.1)} carbon credits annually from sequestration` : 'No carbon sequestration recorded',
                icon: <DollarSign className="w-5 h-5 text-green-600" />,
                value: totalSequestration > 1000 ? 'High' : 'Medium',
                timeframe: '1-2 years',
            },
            {
                title: 'Protected Area Enhancement',
                description: `Current protected area: ${deforestation_analysis.protected_area_coverage.percentage.toFixed(1)}% - ${deforestation_analysis.protected_area_coverage.percentage < 15 ? 'Expansion opportunity' : 'Well maintained'}`,
                icon: <Shield className="w-5 h-5 text-blue-600" />,
                value: 'Medium',
                timeframe: 'Ongoing',
            },
        ],
    };

    // Environmental metrics analysis
    const environmentalMetricsData = [
        {
            title: 'Water Management',
            value: environmental_impact.water_management.current_usage || 0,
            unit: 'm³',
            trend: environmental_impact.water_management.trend || 'Unknown',
            efficiency: environmental_impact.water_management.efficiency || 0,
            icon: <Droplets className="w-6 h-6 text-blue-600" />,
        },
        {
            title: 'Waste Management',
            value: environmental_impact.waste_management.hazardous_waste || 0,
            unit: 'tonnes',
            trend: environmental_impact.waste_management.trend || 'Unknown',
            recycled: environmental_impact.waste_management.recycled_waste || 0,
            icon: <Factory className="w-6 h-6 text-amber-600" />,
        },
        {
            title: 'Incident Management',
            value: environmental_impact.incident_management.total_incidents || 0,
            unit: 'incidents',
            trend: environmental_impact.incident_management.trend || 'Unknown',
            icon: <AlertCircle className="w-6 h-6 text-red-600" />,
        },
        {
            title: 'Soil Health',
            erosion: environmental_impact.soil_health.erosion_rate || 0,
            organic: environmental_impact.soil_health.organic_matter || 0,
            trend: environmental_impact.soil_health.trend || 'Unknown',
            icon: <Sprout className="w-6 h-6 text-green-600" />,
        },
    ];

    // Social governance metrics
    const socialGovernanceData = [
        {
            title: 'Community Programs',
            value: social_governance.community_engagement.programs_count || 0,
            label: 'Active Programs',
            icon: <Users className="w-6 h-6 text-purple-600" />,
        },
        {
            title: 'Local Employment',
            value: social_governance.community_engagement.local_employment || 0,
            label: 'Employees',
            icon: <Users className="w-6 h-6 text-blue-600" />,
        },
        {
            title: 'Compliance Audits',
            value: social_governance.governance_strength.compliance_audits || 0,
            label: 'Completed',
            icon: <ShieldCheck className="w-6 h-6 text-green-600" />,
        },
    ];

    // Carbon emission breakdown
    const carbonBreakdown = currentCarbonData ? [
        {
            scope: 'Scope 1',
            value: currentCarbonData.emissions.scope1_tco2e,
            percentage: totalEmissions > 0 ? (currentCarbonData.emissions.scope1_tco2e / totalEmissions) * 100 : 0,
        },
        {
            scope: 'Scope 2',
            value: currentCarbonData.emissions.scope2_tco2e,
            percentage: totalEmissions > 0 ? (currentCarbonData.emissions.scope2_tco2e / totalEmissions) * 100 : 0,
        },
        {
            scope: 'Scope 3',
            value: currentCarbonData.emissions.scope3_tco2e,
            percentage: totalEmissions > 0 ? (currentCarbonData.emissions.scope3_tco2e / totalEmissions) * 100 : 0,
        },
    ] : [];

    // Simplified explanations
    const simpleExplanations = {
        'Forest Coverage': 'Percentage of total land area covered by forests',
        'Carbon Balance': 'Difference between carbon stored and carbon released',
        'Carbon Sequestration': 'Amount of CO₂ captured and stored by forests',
        'Protected Areas': 'Land officially protected for conservation',
        'Water Efficiency': 'How effectively water resources are being used',
        'Soil Health': 'Quality and sustainability of soil conditions',
    };

    return (
        <div className="space-y-8 pb-8">

            {/* Key Insights Section */}
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

            {/* Environmental Metrics Analysis */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                    Environmental Impact Analysis
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                    {environmentalMetricsData.map((metric, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-3xl border-2 border-gray-200 hover:border-green-400 bg-gradient-to-br from-white to-gray-50 hover:from-green-50 hover:to-emerald-50 transition-all duration-300 hover:shadow-xl cursor-pointer"
                            onClick={() => {
                                setSelectedMetric(metric);
                                setIsModalOpen(true);
                            }}
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                                    {metric.icon}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-lg text-gray-900 mb-2">{metric.title}</h4>
                                    {'value' in metric && (
                                        <p className="text-3xl font-bold text-gray-900">
                                            {formatNumber(metric.value)} <span className="text-lg text-gray-600">{metric.unit}</span>
                                        </p>
                                    )}
                                    {metric.title === 'Soil Health' && (
                                        <>
                                            <p className="text-sm text-gray-600 mt-2">Erosion: {metric.erosion.toFixed(2)} t/ha/yr</p>
                                            <p className="text-sm text-gray-600">Organic Matter: {metric.organic.toFixed(2)}%</p>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                                {getTrendIcon(metric.trend)}
                                <span className="text-sm font-semibold text-gray-700">{metric.trend}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

    

            {/* Social Governance Metrics */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                    Social & Governance Metrics
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                    {socialGovernanceData.map((metric, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-3xl border-2 border-gray-200 hover:border-green-400 bg-gradient-to-br from-white to-gray-50 hover:from-green-50 hover:to-emerald-50 transition-all duration-300 hover:shadow-xl"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                                    {metric.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900 mb-2">{metric.title}</h4>
                                    <p className="text-3xl font-bold text-gray-900">{formatNumber(metric.value)}</p>
                                    <p className="text-sm text-gray-600 mt-1">{metric.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 p-6 rounded-3xl bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        Governance Policies
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-gray-900">Land Use Policy</p>
                                <p className="text-sm text-gray-600">{social_governance.governance_strength.land_use_policy || 'Not specified'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-gray-900">Biodiversity Policy</p>
                                <p className="text-sm text-gray-600">{social_governance.governance_strength.biodiversity_policy || 'Not specified'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simplified Explanations */}
            <div className="bg-gradient-to-br from-white to-green-50 rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 shadow-lg">
                        <Info className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900">In Simple Terms</h3>
                        <p className="text-gray-600 text-lg">Understanding biodiversity metrics made easy</p>
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

            {/* Data Quality & Methodology */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <ShieldCheck className="w-7 h-7 text-green-600" />
                        Data Quality
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-gray-50">
                            <p className="text-sm text-gray-600 mb-2">Data Completeness</p>
                            <p className="text-xl font-bold text-gray-900">{reporting_period.data_completeness}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-gray-50">
                            <p className="text-sm text-gray-600 mb-2">Years Covered</p>
                            <p className="text-xl font-bold text-gray-900">{reporting_period.analysis_years.length} years</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-gray-50">
                            <p className="text-sm text-gray-600 mb-2">Carbon Data Available</p>
                            <p className="text-xl font-bold text-gray-900">{reporting_period.carbon_data_available ? 'Yes' : 'No'}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <Info className="w-7 h-7 text-blue-600" />
                        Methodology
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Carbon Framework</p>
                            <p className="text-sm text-gray-700">{carbon_emission_accounting.framework.calculation_approach}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-green-50 border border-green-200">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Sequestration Method</p>
                            <p className="text-sm text-gray-700">{carbon_emission_accounting.framework.sequestration_methodology}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Emission Method</p>
                            <p className="text-sm text-gray-700">{carbon_emission_accounting.framework.emission_methodology}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metric Detail Modal */}
            {isModalOpen && selectedMetric && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-fadeIn" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full animate-slideUp" onClick={(e) => e.stopPropagation()}>
                        <div className="p-8 border-b-2 border-green-100 bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 text-white rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-3xl font-bold mb-2">Metric Details</h3>
                                    <p className="text-green-100 text-lg">{selectedMetric.title}</p>
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
                                {Object.entries(selectedMetric).map(([key, value]) => {
                                    if (key === 'icon') return null;
                                    return (
                                        <div key={key} className="p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                            <div className="text-sm text-gray-600 mb-2 capitalize font-semibold">{key.replace(/_/g, ' ')}</div>
                                            <div className="font-bold text-gray-900 text-lg">
                                                {typeof value === 'number' ? formatNumber(value) : String(value)}
                                            </div>
                                        </div>
                                    );
                                })}
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
                                    title: 'Enhance Forest Monitoring',
                                    description: `With current forest coverage at ${forestCoverage.toFixed(1)}%, implement regular satellite monitoring`,
                                    impact: 'High',
                                    effort: 'Medium',
                                    timeframe: '1 month',
                                    icon: <Trees className="w-6 h-6 text-green-600" />,
                                },
                                {
                                    title: 'Expand Protected Areas',
                                    description: `Increase protected area from ${deforestation_analysis.protected_area_coverage.percentage.toFixed(1)}% to 15%`,
                                    impact: 'High',
                                    effort: 'High',
                                    timeframe: '6 months',
                                    icon: <Shield className="w-6 h-6 text-blue-600" />,
                                },
                                totalSequestration > 0 && {
                                    title: 'Carbon Credit Registration',
                                    description: `Register for carbon credits - potential ${formatNumber(totalSequestration * 0.1)} credits annually`,
                                    impact: 'Medium',
                                    effort: 'Low',
                                    timeframe: '3 months',
                                    icon: <DollarSign className="w-6 h-6 text-amber-600" />,
                                },
                                social_governance.community_engagement.programs_count < 5 && {
                                    title: 'Community Engagement',
                                    description: 'Increase community conservation programs to improve social metrics',
                                    impact: 'Medium',
                                    effort: 'Medium',
                                    timeframe: '2 months',
                                    icon: <Users className="w-6 h-6 text-purple-600" />,
                                },
                            ].filter(Boolean).map((recommendation, index) => (
                                recommendation && (
                                    <div key={index} className="group p-8 rounded-3xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-green-400 hover:shadow-2xl transition-all duration-300">
                                        <div className="flex items-start gap-6">
                                            <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 group-hover:scale-110 transition-transform">
                                                {recommendation.icon}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-xl text-gray-900 mb-3">{recommendation.title}</h4>
                                                <p className="text-gray-700 leading-relaxed mb-5 font-medium">{recommendation.description}</p>
                                                <div className="flex items-center gap-4 flex-wrap">
                                                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-xl text-sm font-bold">
                                                        Impact: {recommendation.impact}
                                                    </span>
                                                    <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-xl text-sm font-bold">
                                                        Effort: {recommendation.effort}
                                                    </span>
                                                    <span className="px-4 py-2 bg-amber-100 text-amber-800 rounded-xl text-sm font-bold">
                                                        Time: {recommendation.timeframe}
                                                    </span>
                                                </div>
                                            </div>
                                            <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all font-bold hover:scale-105 shadow-lg">
                                                Start
                                            </button>
                                        </div>
                                    </div>
                                )
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