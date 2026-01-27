import React from 'react';
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
    Globe
} from 'lucide-react';
import {
    BiodiversityLandUseResponse,
    Company
} from '../../../../services/Admin_Service/esg_apis/biodiversity_api_service';

// Color Palette
const LOGO_GREEN = '#008000';
const LOGO_YELLOW = '#B8860B';

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
    onMetricClick
}) => {
    if (!biodiversityData) {
        return (
            <div className="text-center py-12">
                <Leaf className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Data Available</h3>
                <p className="text-gray-500">Select a company to view biodiversity and land use data</p>
            </div>
        );
    }

    const {
        biodiversity_assessment,
        deforestation_analysis,
        land_use_metrics,
        environmental_impact,
        social_governance,
        key_statistics,
        conservation_metrics,
        graphs
    } = biodiversityData.data;

    // Helper function to get color based on score
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        if (score >= 40) return 'text-orange-600';
        return 'text-red-600';
    };

    const getRiskColor = (level: string) => {
        switch (level.toLowerCase()) {
            case 'low': return 'text-green-600';
            case 'medium': return 'text-yellow-600';
            case 'high': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Biodiversity Score Card */}
                <div
                    className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onMetricClick(biodiversity_assessment, 'Biodiversity Assessment')}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-green-50 border border-green-200">
                            <Leaf className="w-6 h-6" style={{ color: LOGO_GREEN }} />
                        </div>
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getScoreColor(biodiversity_assessment.overall_score)} bg-opacity-10`}>
                            {biodiversity_assessment.rating}
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold mb-1" style={{ color: LOGO_GREEN }}>
                        {biodiversity_assessment.overall_score}/100
                    </h3>
                    <p className="text-gray-600 mb-2">Overall Biodiversity Score</p>
                    <div className="flex items-center text-sm">
                        {getTrendIcon(biodiversity_assessment.detailed_assessment.ndvi_analysis.trend)}
                        <span className="ml-2 text-gray-700">
                            {biodiversity_assessment.detailed_assessment.ndvi_analysis.trend}
                        </span>
                    </div>
                </div>

                {/* Deforestation Risk Card */}
                <div
                    className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onMetricClick(deforestation_analysis, 'Deforestation Analysis')}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getRiskColor(deforestation_analysis.risk_level)} bg-opacity-10`}>
                            {deforestation_analysis.risk_level}
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold mb-1 text-red-600">
                        {deforestation_analysis.risk_score}/100
                    </h3>
                    <p className="text-gray-600 mb-2">Deforestation Risk Score</p>
                    <div className="flex items-center text-sm">
                        <Trees className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-gray-700">
                            {deforestation_analysis.forest_coverage.coverage_percent} forest coverage
                        </span>
                    </div>
                </div>

                {/* Forest Coverage Card */}
                <div
                    className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onMetricClick(land_use_metrics, 'Land Use Metrics')}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                            <Trees className="w-6 h-6 text-emerald-600" />
                        </div>
                        {getTrendIcon(land_use_metrics.trends.forest_area_trend)}
                    </div>
                    <h3 className="text-3xl font-bold mb-1 text-emerald-700">
                        {land_use_metrics.current_year.forest_coverage_percent}
                    </h3>
                    <p className="text-gray-600 mb-2">Forest Coverage</p>
                    <div className="text-sm text-gray-700">
                        {formatNumber(land_use_metrics.current_year.forest_area)} ha of forest area
                    </div>
                </div>

                {/* Water Efficiency Card */}
                <div
                    className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onMetricClick(environmental_impact.water_management, 'Water Management')}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                            <Droplets className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getRiskColor(environmental_impact.water_management.risk_level)} bg-opacity-10`}>
                            {environmental_impact.water_management.risk_level}
                        </span>
                    </div>
                    <h3 className="text-3xl font-bold mb-1 text-blue-600">
                        {environmental_impact.water_management.efficiency.efficiency_score}/100
                    </h3>
                    <p className="text-gray-600 mb-2">Water Efficiency Score</p>
                    <div className="text-sm text-gray-700">
                        {environmental_impact.water_management.current_usage} usage
                    </div>
                </div>
            </div>

            {/* Biodiversity Components Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Biodiversity Components */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold" style={{ color: LOGO_GREEN }}>
                            Biodiversity Components
                        </h3>
                        <BarChart3 className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="space-y-4">
                        {Object.entries(biodiversity_assessment.components).map(([key, component]) => (
                            <div key={key} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium capitalize text-gray-700">{key}</span>
                                    <span className="font-semibold" style={{ color: LOGO_GREEN }}>
                                        {component.score}/100
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${component.score}%`,
                                            background: `linear-gradient(to right, ${LOGO_GREEN}, #006400)`
                                        }}
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {component.factors.slice(0, 3).map((factor, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                                        >
                                            {factor}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Conservation Metrics */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold" style={{ color: LOGO_GREEN }}>
                            Conservation Progress
                        </h3>
                        <Target className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-700">Habitat Restoration</span>
                                <span className="font-semibold" style={{ color: LOGO_GREEN }}>
                                    {conservation_metrics.habitat_restoration_potential.percent_of_target}
                                </span>
                            </div>
                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: conservation_metrics.habitat_restoration_potential.percent_of_target,
                                        background: `linear-gradient(to right, ${LOGO_GREEN}, #006400)`
                                    }}
                                />
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                {formatNumber(conservation_metrics.habitat_restoration_potential.current_restoration)} ha restored
                                of {formatNumber(conservation_metrics.habitat_restoration_potential.restoration_target)} ha target
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <CloudRain className="w-4 h-4 text-blue-500" />
                                    <span className="font-medium text-gray-700">Water Conservation</span>
                                </div>
                                <p className="text-2xl font-bold text-blue-600">
                                    {conservation_metrics.water_conservation_potential}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <Mountain className="w-4 h-4 text-emerald-500" />
                                    <span className="font-medium text-gray-700">Deforestation Prevention</span>
                                </div>
                                <p className="text-2xl font-bold text-emerald-600">
                                    {conservation_metrics.deforestation_prevention}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Environmental & Social Impact */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Waste Management */}
                <div
                    className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onMetricClick(environmental_impact.waste_management, 'Waste Management')}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-orange-50 border border-orange-200">
                            <Factory className="w-5 h-5 text-orange-600" />
                        </div>
                        <h4 className="font-bold text-gray-800">Waste Management</h4>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-600">Hazardous Waste</p>
                            <p className="text-lg font-semibold text-gray-800">
                                {environmental_impact.waste_management.hazardous_waste}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Recycled Waste</p>
                            <p className="text-lg font-semibold" style={{ color: LOGO_GREEN }}>
                                {formatPercent(environmental_impact.waste_management.recycled_waste)}
                            </p>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className={`text-sm font-semibold px-2 py-1 rounded ${getRiskColor(environmental_impact.waste_management.risk_level)} bg-opacity-10`}>
                                {environmental_impact.waste_management.risk_level} Risk
                            </span>
                            {getTrendIcon(environmental_impact.waste_management.trend)}
                        </div>
                    </div>
                </div>

                {/* Community Engagement */}
                <div
                    className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onMetricClick(social_governance.community_engagement, 'Community Engagement')}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-purple-50 border border-purple-200">
                            <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <h4 className="font-bold text-gray-800">Community Engagement</h4>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-600">Programs Count</p>
                            <p className="text-lg font-semibold text-purple-600">
                                {social_governance.community_engagement.programs_count} programs
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Local Employment</p>
                            <p className="text-lg font-semibold text-gray-800">
                                {formatPercent(social_governance.community_engagement.local_employment)}%
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Engagement Level</p>
                            <p className="text-lg font-semibold capitalize" style={{ color: LOGO_GREEN }}>
                                {social_governance.community_engagement.engagement_level}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Governance Strength */}
                <div
                    className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onMetricClick(social_governance.governance_strength, 'Governance Strength')}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-200">
                            <Shield className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h4 className="font-bold text-gray-800">Governance Strength</h4>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-600">Land Use Policy</p>
                            <p className="text-lg font-semibold capitalize text-gray-800">
                                {social_governance.governance_strength.land_use_policy}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Compliance Audits</p>
                            <p className="text-lg font-semibold text-indigo-600">
                                {social_governance.governance_strength.compliance_audits} audits
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Strength Level</p>
                            <p className="text-lg font-semibold capitalize" style={{ color: LOGO_GREEN }}>
                                {social_governance.governance_strength.strength_level}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Statistics Summary */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold" style={{ color: LOGO_GREEN }}>
                        Key Statistics
                    </h3>
                    <Globe className="w-5 h-5 text-gray-500" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: LOGO_GREEN }}>
                            {key_statistics.total_metrics_analyzed}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Metrics Analyzed</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-blue-600">
                            {key_statistics.years_covered}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Years Covered</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-emerald-600">
                            {key_statistics.biodiversity_metrics.endangered_species_count}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Endangered Species</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-red-600">
                            {key_statistics.risk_metrics.deforestation_alerts_count}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Deforestation Alerts</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: LOGO_YELLOW }}>
                            {key_statistics.social_governance_metrics.community_programs}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Community Programs</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;