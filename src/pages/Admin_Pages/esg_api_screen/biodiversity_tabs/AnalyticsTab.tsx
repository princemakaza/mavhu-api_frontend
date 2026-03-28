import React, { useState } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Activity,
    Target,
    AlertTriangle,
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
    Bird,
    Tractor,
    Landmark,
    Footprints,
    TreePine,
    MapPin,
} from "lucide-react";

// Import types and helpers from the biodiversity service
import type { BiodiversityLandUseResponse, BiodiversityMetric } from '../../../../services/Admin_Service/esg_apis/biodiversity_api_service';
import {
    getCompany,
    getReportingPeriod,
    getCurrentYear,
    getDataCompleteness,
    getSummaryStatistics,
    getKeyPerformanceIndicators,
    getAllMetrics,
    getMetricsByCategory,
    getDataQuality,
    getSourceInformation,
    getGriReferences,
    getAudit,
    getAreaOfInterestMetadata,
    getTotalAgriculturalArea,
    getTotalSurveyedArea,
    getTotalTreesPlanted,
    getAllGraphs,
    getLandUseCompositionGraph,
    getForestAreaTrendGraph,
    getSpeciesCountTrendGraph,
    getTreesPlantedTrendGraph,
} from '../../../../services/Admin_Service/esg_apis/biodiversity_api_service';

// Import Company type from companies_service (optional)
import type { Company } from '../../../../services/Admin_Service/companies_service';

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
    onMetricClick: (metric: BiodiversityMetric, modalType: string) => void;
    company?: Company | null;
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
    biodiversityData,
    formatNumber,
    formatPercent,
    selectedYear,
    availableYears,
    onMetricClick,
    company,
}) => {
    const [activeInsightTab, setActiveInsightTab] = useState('trends');
    const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState<BiodiversityMetric | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // If no data, show placeholder
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

    // Extract data using helpers
    const companyFromData = getCompany(biodiversityData);
    const reportingPeriod = getReportingPeriod(biodiversityData);
    const currentYear = getCurrentYear(biodiversityData);
    const dataCompleteness = getDataCompleteness(biodiversityData);
    const summaryStats = getSummaryStatistics(biodiversityData);
    const kpi = getKeyPerformanceIndicators(biodiversityData);
    const allMetrics = getAllMetrics(biodiversityData);
    const metricsByCategory = getMetricsByCategory(biodiversityData);
    const dataQuality = getDataQuality(biodiversityData);
    const sourceInfo = getSourceInformation(biodiversityData);
    const griRefs = getGriReferences(biodiversityData);
    const audit = getAudit(biodiversityData);
    const areaOfInterest = getAreaOfInterestMetadata(biodiversityData);
    const graphs = getAllGraphs(biodiversityData);
    const landUseGraph = getLandUseCompositionGraph(biodiversityData);
    const forestTrendGraph = getForestAreaTrendGraph(biodiversityData);
    const speciesTrendGraph = getSpeciesCountTrendGraph(biodiversityData);
    const treesPlantedGraph = getTreesPlantedTrendGraph(biodiversityData);

    // Helper to get trend icon (simplified)
    const getTrendIcon = (trend?: string) => {
        const lower = trend?.toLowerCase() || '';
        if (lower.includes('increas') || lower.includes('up')) return <TrendingUp className="w-4 h-4 text-green-600" />;
        if (lower.includes('decreas') || lower.includes('down')) return <TrendingDown className="w-4 h-4 text-red-600" />;
        return <TrendingUpDown className="w-4 h-4 text-gray-600" />;
    };

    // Derive insights from summary statistics and KPIs
    const insights = {
        trends: [
            {
                title: 'Conservation Area',
                description: `Total protected area is ${formatNumber(summaryStats.total_conservation_area)} ha.`,
                icon: <Shield className="w-5 h-5 text-green-600" />,
                impact: summaryStats.total_conservation_area > 1000 ? 'High' : 'Medium',
                confidence: 0.9,
            },
            {
                title: 'Agricultural Land',
                description: `Agricultural area covers ${formatNumber(summaryStats.total_agricultural_area)} ha.`,
                icon: <Tractor className="w-5 h-5 text-amber-600" />,
                impact: 'Medium',
                confidence: 0.85,
            },
            {
                title: 'Biodiversity Richness',
                description: `${summaryStats.flora_species_count} flora and ${summaryStats.fauna_species_count} fauna species recorded.`,
                icon: <TreePine className="w-5 h-5 text-green-600" />,
                impact: summaryStats.flora_species_count > 50 ? 'High' : 'Medium',
                confidence: 0.88,
            },
        ],
        risks: [
            {
                title: 'Human‑Wildlife Conflict',
                description: `${summaryStats.human_wildlife_conflicts} incidents recorded.`,
                icon: <Footprints className="w-5 h-5 text-red-600" />,
                priority: summaryStats.human_wildlife_conflicts > 10 ? 'High' : 'Low',
                timeframe: 'Ongoing',
            },
            {
                title: 'Restoration Progress',
                description: `${formatNumber(summaryStats.total_restored_area)} ha restored to date.`,
                icon: <Sprout className="w-5 h-5 text-green-600" />,
                priority: summaryStats.total_restored_area > 500 ? 'Medium' : 'Low',
                timeframe: 'Monitor',
            },
        ],
        opportunities: [
            {
                title: 'Tree Planting Potential',
                description: `${formatNumber(summaryStats.total_trees_planted)} trees planted. Opportunity to expand.`,
                icon: <Trees className="w-5 h-5 text-green-600" />,
                value: summaryStats.total_trees_planted > 10000 ? 'High' : 'Medium',
                timeframe: '1-2 years',
            },
            {
                title: 'LPG Distribution Impact',
                description: `${formatNumber(summaryStats.total_lpg_distributed)} kg LPG distributed, reducing fuelwood demand.`,
                icon: <Factory className="w-5 h-5 text-purple-600" />,
                value: summaryStats.total_lpg_distributed > 5000 ? 'Medium' : 'Low',
                timeframe: 'Ongoing',
            },
        ],
    };

    // Build metrics display by category (for later use)
    const categoryLabels: Record<string, string> = {
        agricultural_land: 'Agricultural Land',
        conservation_protected_habitat: 'Conservation & Protected Habitat',
        land_tenure: 'Land Tenure',
        restoration_deforestation: 'Restoration & Deforestation',
        fuelwood_substitution: 'Fuelwood Substitution',
        biodiversity_flora: 'Biodiversity - Flora',
        biodiversity_fauna: 'Biodiversity - Fauna',
        human_wildlife_conflict: 'Human‑Wildlife Conflict',
        summary: 'Summary Metrics',
    };

    const categoryIcons: Record<string, JSX.Element> = {
        agricultural_land: <Tractor className="w-5 h-5 text-amber-600" />,
        conservation_protected_habitat: <Shield className="w-5 h-5 text-green-600" />,
        land_tenure: <Landmark className="w-5 h-5 text-blue-600" />,
        restoration_deforestation: <Sprout className="w-5 h-5 text-emerald-600" />,
        fuelwood_substitution: <Factory className="w-5 h-5 text-purple-600" />,
        biodiversity_flora: <Leaf className="w-5 h-5 text-green-600" />,
        biodiversity_fauna: <Bird className="w-5 h-5 text-indigo-600" />,
        human_wildlife_conflict: <Footprints className="w-5 h-5 text-red-600" />,
        summary: <Activity className="w-5 h-5 text-gray-600" />,
    };

    // Simplified explanations for key terms
    const simpleExplanations: Record<string, string> = {
        'Conservation Area': 'Land legally protected for biodiversity conservation.',
        'Agricultural Land': 'Area used for crop cultivation or livestock.',
        'Surveyed Area': 'Total land area that has been physically surveyed.',
        'Trees Planted': 'Cumulative number of trees planted in restoration efforts.',
        'Flora Species': 'Number of distinct plant species identified.',
        'Fauna Species': 'Number of distinct animal species identified.',
        'Restored Area': 'Land area where ecosystems have been restored.',
        'Human‑Wildlife Conflict': 'Incidents where wildlife negatively impacts human activities.',
        'LPG Distribution': 'Liquefied Petroleum Gas distributed to reduce wood fuel use.',
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

            {/* Biodiversity KPIs */}
            <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                    Key Biodiversity Indicators
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 rounded-3xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-2xl bg-green-100">
                                <Shield className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Conservation Area</p>
                                <p className="text-2xl font-bold text-gray-900">{formatNumber(kpi.conservation_area)} ha</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 rounded-3xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-2xl bg-amber-100">
                                <Tractor className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Agricultural Area</p>
                                <p className="text-2xl font-bold text-gray-900">{formatNumber(kpi.agricultural_area)} ha</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 rounded-3xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-2xl bg-emerald-100">
                                <Sprout className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Restored Area</p>
                                <p className="text-2xl font-bold text-gray-900">{formatNumber(kpi.restored_area)} ha</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 rounded-3xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-2xl bg-green-100">
                                <Trees className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Trees Planted</p>
                                <p className="text-2xl font-bold text-gray-900">{formatNumber(kpi.trees_planted_cumulative)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 rounded-3xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-2xl bg-indigo-100">
                                <Leaf className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Flora Species</p>
                                <p className="text-2xl font-bold text-gray-900">{kpi.flora_species}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 rounded-3xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-2xl bg-purple-100">
                                <Bird className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Fauna Species</p>
                                <p className="text-2xl font-bold text-gray-900">{kpi.fauna_species}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 rounded-3xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-2xl bg-blue-100">
                                <Factory className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">LPG Distributed</p>
                                <p className="text-2xl font-bold text-gray-900">{formatNumber(kpi.lpg_distributions)} kg</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 rounded-3xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-2xl bg-red-100">
                                <Footprints className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Human‑Wildlife Conflicts</p>
                                <p className="text-2xl font-bold text-gray-900">{kpi.human_wildlife_conflicts}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        
            {/* Area of Interest & Data Quality */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {areaOfInterest && (
                    <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <MapPin className="w-7 h-7 text-green-600" />
                            Area of Interest
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-gray-50">
                                <p className="text-sm text-gray-600 mb-2">Name</p>
                                <p className="text-xl font-bold text-gray-900">{areaOfInterest.name}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-gray-50">
                                <p className="text-sm text-gray-600 mb-2">Area Covered</p>
                                <p className="text-xl font-bold text-gray-900">{areaOfInterest.area_covered}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-gray-50">
                                <p className="text-sm text-gray-600 mb-2">Coordinates</p>
                                <p className="text-xl font-bold text-gray-900">{areaOfInterest.coordinates?.length || 0} points</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-3xl border-2 border-green-100 shadow-xl p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <ShieldCheck className="w-7 h-7 text-green-600" />
                        Data Quality
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-gray-50">
                            <p className="text-sm text-gray-600 mb-2">Data Completeness</p>
                            <p className="text-xl font-bold text-gray-900">{dataCompleteness}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-gray-50">
                            <p className="text-sm text-gray-600 mb-2">Years Covered</p>
                            <p className="text-xl font-bold text-gray-900">{reportingPeriod.analysis_years.length} years</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-gray-50">
                            <p className="text-sm text-gray-600 mb-2">Quality Score</p>
                            <p className="text-xl font-bold text-gray-900">{dataQuality.quality_score ?? 'N/A'}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-gray-50">
                            <p className="text-sm text-gray-600 mb-2">Verification Status</p>
                            <p className="text-xl font-bold text-gray-900 capitalize">{dataQuality.verification_status.replace(/_/g, ' ')}</p>
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

            {/* Metric Detail Modal */}
            {isModalOpen && selectedMetric && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-fadeIn" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full animate-slideUp" onClick={(e) => e.stopPropagation()}>
                        <div className="p-8 border-b-2 border-green-100 bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 text-white rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-3xl font-bold mb-2">{selectedMetric.metric_name}</h3>
                                    <p className="text-green-100 text-lg">{categoryLabels[selectedMetric.category] || selectedMetric.category}</p>
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
                                <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                    <div className="text-sm text-gray-600 mb-2 font-semibold">Description</div>
                                    <div className="font-medium text-gray-900 text-lg">{selectedMetric.description || 'No description'}</div>
                                </div>
                                <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                    <div className="text-sm text-gray-600 mb-2 font-semibold">Data Type</div>
                                    <div className="font-medium text-gray-900 text-lg">{selectedMetric.data_type}</div>
                                </div>
                                {selectedMetric.yearly_data.length > 0 && (
                                    <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                        <div className="text-sm text-gray-600 mb-2 font-semibold">Latest Value</div>
                                        <div className="font-medium text-gray-900 text-lg">
                                            {selectedMetric.yearly_data[selectedMetric.yearly_data.length - 1]?.numeric_value ?? 'N/A'}
                                            {selectedMetric.yearly_data[selectedMetric.yearly_data.length - 1]?.unit ? ` ${selectedMetric.yearly_data[selectedMetric.yearly_data.length - 1].unit}` : ''}
                                        </div>
                                    </div>
                                )}
                                {selectedMetric.yearly_data.length > 1 && (
                                    <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                        <div className="text-sm text-gray-600 mb-2 font-semibold">Data Points</div>
                                        <div className="font-medium text-gray-900 text-lg">{selectedMetric.yearly_data.length} years</div>
                                    </div>
                                )}
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
                                    title: 'Enhance Conservation Monitoring',
                                    description: `Current conservation area is ${formatNumber(summaryStats.total_conservation_area)} ha. Consider regular monitoring to assess effectiveness.`,
                                    impact: 'High',
                                    effort: 'Medium',
                                    timeframe: '3 months',
                                    icon: <Shield className="w-6 h-6 text-green-600" />,
                                },
                                {
                                    title: 'Expand Restoration Efforts',
                                    description: `${formatNumber(summaryStats.total_restored_area)} ha restored so far. Identify additional areas for restoration.`,
                                    impact: 'High',
                                    effort: 'High',
                                    timeframe: '1 year',
                                    icon: <Sprout className="w-6 h-6 text-green-600" />,
                                },
                                summaryStats.total_trees_planted > 0 && {
                                    title: 'Tree Planting Campaign',
                                    description: `Already planted ${formatNumber(summaryStats.total_trees_planted)} trees. Plan next planting season.`,
                                    impact: 'Medium',
                                    effort: 'Low',
                                    timeframe: '6 months',
                                    icon: <Trees className="w-6 h-6 text-green-600" />,
                                },
                                summaryStats.human_wildlife_conflicts > 5 && {
                                    title: 'Mitigate Human‑Wildlife Conflict',
                                    description: `${summaryStats.human_wildlife_conflicts} incidents reported. Implement community awareness programs.`,
                                    impact: 'Medium',
                                    effort: 'Medium',
                                    timeframe: '3 months',
                                    icon: <Footprints className="w-6 h-6 text-amber-600" />,
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