// File: services/communityEngagementService.ts
import api from "../Auth_service/api";

/**
 * =====================
 * Types & Interfaces
 * =====================
 */

export interface Coordinate {
    lat: number;
    lon: number;
    _id: string;
}

export interface AreaOfInterestMetadata {
    name: string;
    area_covered: string;
    coordinates: Coordinate[];
}

export interface EsgContactPerson {
    name: string;
    email: string;
    phone: string;
}

export interface Company {
    _id: string;
    name: string;
    registrationNumber: string;
    email: string;
    phone: string;
    address: string;
    website: string;
    country: string;
    industry: string;
    description: string;
    purpose: string;
    scope: string;
    data_source: string[];
    area_of_interest_metadata: AreaOfInterestMetadata;
    data_range: string;
    data_processing_workflow: string;
    analytical_layer_metadata: string;
    esg_reporting_framework: string[];
    esg_contact_person: EsgContactPerson;
    latest_esg_report_year: number;
    esg_data_status: string;
    has_esg_linked_pay: boolean;
    created_at: string;
    updated_at: string;
    __v: number;
}

export interface MetricValue {
    year: number;
    value: string;
    numeric_value: number | null;
    source_notes: string;
    confidence_score: number;
    added_by: string;
    added_at: string;
    last_updated_at: string;
}

export interface DataQuality {
    sources: string[];
    verification_status: string[];
    years: number[];
}

export interface ESGDataMetric {
    name: string;
    category: string;
    unit: string | null;
    description: string | null;
    values: MetricValue[];
    data_quality: DataQuality;
}

export interface ESGCategory {
    [key: string]: ESGDataMetric;
}

export interface ESGData {
    summary: {
        total_records: number;
        reporting_periods: Array<{
            start: number;
            end: number;
            year_range: string;
        }>;
        data_sources: string[];
        verification_status: {
            unverified: number;
        };
        import_stats: {
            from_files: number;
            manual_entries: number;
            average_quality_score: number;
        };
    };
    by_category: {
        environmental: ESGCategory;
        social: ESGCategory;
        governance: ESGCategory;
    };
}

export interface Version {
    api: string;
    calculation: string;
    gee_adapter: string;
    last_updated: string;
}

export interface DataCoverage {
    environmental: number;
    social: number;
    governance: number;
    total_metrics: number;
}

export interface Analysis {
    year: number;
    confidence_score: number;
    data_coverage: DataCoverage;
}

export interface BenefitsMetrics {
    students_impacted: number;
    schools_supported: number;
    scholarships_awarded: number;
    infrastructure_projects: number;
    metrics_used: string[];
}

export interface Benefits {
    education: BenefitsMetrics;
    healthcare: BenefitsMetrics;
    economic: BenefitsMetrics;
    environmental: {
        water_access_projects: number;
        sanitation_improvements: number;
        renewable_energy_projects: number;
        metrics_count: number;
    };
}

export interface EngagementScores {
    overall: number;
    education: number;
    healthcare: number;
    local_economy: number;
    environmental: number;
    trend: string;
    year_over_year_change: string;
}

export interface SocialLicenseFactors {
    transparency: number;
    community_involvement: number;
    ethical_practices: number;
    local_employment: number;
    environmental_stewardship: number;
    regulatory_compliance: number;
    stakeholder_trust: number;
    community_approval: number;
}

export interface SocialLicenseBuildingBlocks {
    trust_and_transparency: boolean;
    community_participation: boolean;
    ethical_leadership: boolean;
    local_value_creation: boolean;
    environmental_responsibility: boolean;
}

export interface SocialLicense {
    score: number;
    factors: SocialLicenseFactors;
    level: string;
    supporting_metrics: {
        transparency_count: number;
        ethics_count: number;
        stakeholder_count: number;
    };
    building_blocks: SocialLicenseBuildingBlocks;
    recommendations: string[];
}

export interface SDGAlignment {
    score: number;
    metrics: string[];
    weight: number;
}

export interface SDGAlignmentStrength {
    sdg: string;
    strength: string;
    contributing_metrics: string[];
}

export interface CommunityImpactMapping {
    SDG3: string;
    SDG4: string;
    SDG8: string;
    SDG11: string;
    SDG16: string;
}

export interface SDGAlignmentData {
    scores: {
        sdg3: number;
        sdg4: number;
        sdg6: number;
        sdg7: number;
        sdg8: number;
        sdg12: number;
        sdg13: number;
        sdg16: number;
    };
    total_alignment_score: number;
    priority_sdgs: string[];
    detailed_scores: {
        [key: string]: SDGAlignment;
    };
    community_focus_sdgs: string[];
    alignment_strengths: SDGAlignmentStrength[];
    community_impact_mapping: CommunityImpactMapping;
}

export interface CommunityEngagementData {
    benefits: Benefits;
    engagement_scores: EngagementScores;
    social_license: SocialLicense;
    sdg_alignment: SDGAlignmentData;
}

export interface GraphDataset {
    label?: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string | string[];
    fill?: boolean;
    borderDash?: number[];
    tension?: number;
    borderWidth?: number;
}

export interface Graph {
    type: string;
    title: string;
    description: string;
    labels: string[];
    datasets: GraphDataset[];
}

export interface KPIs {
    community_investment_ratio: number;
    social_roi_multiplier: number;
    stakeholder_satisfaction: number;
    program_efficiency: number;
    sustainability_index: number;
    community_trust_index: number;
}

export interface StrategicInsights {
    strengths: string[];
    opportunities: string[];
    risks: string[];
}

export interface ReportingPeriod {
    start: number;
    end: number;
    year_range: string;
}

export interface CommunityEngagementResponse {
    message: string;
    api: string;
    data: {
        version: Version;
        company: Company;
        analysis: Analysis;
        esg_data: ESGData;
        community_engagement: CommunityEngagementData;
        graphs: {
            investmentTrend: Graph;
            impactDistribution: Graph;
            socialLicenseComponents: Graph;
            sdgHeatmap: Graph;
        };
        kpis: KPIs;
        strategic_insights: StrategicInsights;
    };
}

export interface CommunityEngagementParams {
    companyId: string;
    year: number;
}

/**
 * =====================
 * Community Engagement Service
 * =====================
 */

export const getCommunityEngagementData = async (
    params: CommunityEngagementParams
): Promise<CommunityEngagementResponse> => {
    try {
        const { companyId, year } = params;

        const queryParams = new URLSearchParams();
        if (year !== undefined) {
            queryParams.append('year', year.toString());
        }

        const queryString = queryParams.toString();
        const url = `/esg-dashboard/community-engagement/${companyId}${queryString ? `?${queryString}` : ''}`;

        const { data } = await api.get<CommunityEngagementResponse>(url);
        return data;
    } catch (error: any) {
        const statusCode = error.response?.status;
        const errorMessage =
            error.response?.data?.error || error.response?.data?.message;

        switch (statusCode) {
            case 400:
                throw new Error(errorMessage || "Invalid request parameters");
            case 401:
                throw new Error("Unauthorized access. Please check your authentication token.");
            case 403:
                throw new Error("You don't have permission to access this resource.");
            case 404:
                throw new Error("Community engagement data not found for the specified company.");
            case 422:
                throw new Error(errorMessage || "Invalid year parameter or data format.");
            case 500:
                throw new Error("Server error occurred while fetching community engagement data.");
            case 503:
                throw new Error("Community engagement service is temporarily unavailable.");
            default:
                throw new Error(
                    errorMessage ||
                    error.response?.data?.detail ||
                    "Failed to fetch community engagement data"
                );
        }
    }
};

/**
 * Get community engagement summary
 */
export const getCommunityEngagementSummary = (data: CommunityEngagementResponse['data']) => {
    return {
        socialLicenseScore: data.community_engagement.social_license.score,
        overallEngagementScore: data.community_engagement.engagement_scores.overall,
        sdgAlignmentScore: data.community_engagement.sdg_alignment.total_alignment_score,
        communityTrustIndex: data.kpis.community_trust_index,
        stakeholderSatisfaction: data.kpis.stakeholder_satisfaction
    };
};

/**
 * Get social license to operate details
 */
export const getSocialLicenseDetails = (data: CommunityEngagementResponse['data']) => {
    const socialLicense = data.community_engagement.social_license;
    return {
        score: socialLicense.score,
        level: socialLicense.level,
        factors: socialLicense.factors,
        buildingBlocks: socialLicense.building_blocks,
        recommendations: socialLicense.recommendations
    };
};

/**
 * Get SDG alignment breakdown
 */
export const getSDGAlignmentBreakdown = (data: CommunityEngagementResponse['data']) => {
    const sdg = data.community_engagement.sdg_alignment;
    return {
        scores: sdg.scores,
        prioritySDGs: sdg.priority_sdgs,
        alignmentStrengths: sdg.alignment_strengths,
        communityFocusSDGs: sdg.community_focus_sdgs
    };
};

/**
 * Get community benefits breakdown
 */
export const getCommunityBenefits = (data: CommunityEngagementResponse['data']) => {
    const benefits = data.community_engagement.benefits;
    return {
        education: benefits.education,
        healthcare: benefits.healthcare,
        economic: benefits.economic,
        environmental: benefits.environmental
    };
};

/**
 * Get engagement scores breakdown
 */
export const getEngagementScores = (data: CommunityEngagementResponse['data']) => {
    const scores = data.community_engagement.engagement_scores;
    return {
        overall: scores.overall,
        byCategory: {
            education: scores.education,
            healthcare: scores.healthcare,
            local_economy: scores.local_economy,
            environmental: scores.environmental
        },
        trend: scores.trend,
        yearOverYearChange: scores.year_over_year_change
    };
};

/**
 * Get key performance indicators
 */
export const getKPIs = (data: CommunityEngagementResponse['data']) => {
    return data.kpis;
};

/**
 * Get strategic insights
 */
export const getStrategicInsights = (data: CommunityEngagementResponse['data']) => {
    return data.strategic_insights;
};

/**
 * Get all graphs
 */
export const getAllGraphs = (data: CommunityEngagementResponse['data']) => {
    return data.graphs;
};

/**
 * Get specific graph by type
 */
export const getGraphByType = (data: CommunityEngagementResponse['data'], graphType: keyof CommunityEngagementResponse['data']['graphs']) => {
    return data.graphs[graphType];
};

/**
 * Get ESG data summary
 */
export const getESGDataSummary = (data: CommunityEngagementResponse['data']) => {
    return {
        totalRecords: data.esg_data.summary.total_records,
        reportingPeriods: data.esg_data.summary.reporting_periods,
        dataSources: data.esg_data.summary.data_sources,
        importStats: data.esg_data.summary.import_stats
    };
};

/**
 * Get data coverage metrics
 */
export const getDataCoverage = (data: CommunityEngagementResponse['data']) => {
    return data.analysis.data_coverage;
};

/**
 * Get company information
 */
export const getCompanyInfo = (data: CommunityEngagementResponse['data']) => {
    return data.company;
};

/**
 * Get analysis metadata
 */
export const getAnalysisMetadata = (data: CommunityEngagementResponse['data']) => {
    return {
        year: data.analysis.year,
        confidenceScore: data.analysis.confidence_score,
        dataCoverage: data.analysis.data_coverage
    };
};

/**
 * Get version information
 */
export const getVersionInfo = (data: CommunityEngagementResponse['data']) => {
    return data.version;
};

/**
 * Calculate community investment ROI
 */
export const calculateCommunityInvestmentROI = (data: CommunityEngagementResponse['data']) => {
    const kpis = data.kpis;
    return {
        investmentRatio: kpis.community_investment_ratio,
        socialROI: kpis.social_roi_multiplier,
        estimatedEconomicValue: kpis.social_roi_multiplier * kpis.community_investment_ratio * 1000000 // Assuming ratio is per million
    };
};

/**
 * Get top-performing areas
 */
export const getTopPerformingAreas = (data: CommunityEngagementResponse['data']) => {
    const scores = data.community_engagement.engagement_scores;
    const areas = [
        { name: 'Environmental', score: scores.environmental },
        { name: 'Education', score: scores.education },
        { name: 'Healthcare', score: scores.healthcare },
        { name: 'Local Economy', score: scores.local_economy }
    ];

    return areas.sort((a, b) => b.score - a.score);
};

/**
 * Get areas needing improvement
 */
export const getAreasNeedingImprovement = (data: CommunityEngagementResponse['data']) => {
    const scores = data.community_engagement.engagement_scores;
    const areas = [
        { name: 'Education', score: scores.education, current: scores.education, target: 80 },
        { name: 'Healthcare', score: scores.healthcare, current: scores.healthcare, target: 80 },
        { name: 'Local Economy', score: scores.local_economy, current: scores.local_economy, target: 80 },
        { name: 'Environmental', score: scores.environmental, current: scores.environmental, target: 90 }
    ];

    return areas.filter(area => area.current < area.target)
        .sort((a, b) => a.current - b.current);
};

/**
 * Get stakeholder metrics
 */
export const getStakeholderMetrics = (data: CommunityEngagementResponse['data']) => {
    const socialLicense = data.community_engagement.social_license;
    return {
        trustLevel: socialLicense.factors.stakeholder_trust,
        communityApproval: socialLicense.factors.community_approval,
        transparency: socialLicense.factors.transparency,
        communityInvolvement: socialLicense.factors.community_involvement
    };
};

/**
 * Get metrics for specific SDG
 */
export const getMetricsForSDG = (data: CommunityEngagementResponse['data'], sdg: string) => {
    const sdgData = data.community_engagement.sdg_alignment;
    return sdgData.detailed_scores[sdg]?.metrics || [];
};

/**
 * Generate SDG progress report
 */
export const generateSDGProgressReport = (data: CommunityEngagementResponse['data']) => {
    const sdg = data.community_engagement.sdg_alignment;
    return {
        overallAlignment: sdg.total_alignment_score,
        topPerformingSDGs: sdg.priority_sdgs,
        communityImpact: sdg.community_impact_mapping,
        strengths: sdg.alignment_strengths.filter(s => s.strength === 'strong'),
        weaknesses: sdg.alignment_strengths.filter(s => s.strength === 'weak')
    };
};

/**
 * Get engagement trend analysis
 */
export const getEngagementTrendAnalysis = (data: CommunityEngagementResponse['data']) => {
    const engagementScores = data.community_engagement.engagement_scores;
    const yoyChange = parseFloat(engagementScores.year_over_year_change.replace('%', ''));

    return {
        currentTrend: engagementScores.trend,
        yearOverYearChange: yoyChange,
        isImproving: yoyChange > 0,
        needsAttention: engagementScores.trend === 'needs_improvement'
    };
};

/**
 * Get community impact summary
 */
export const getCommunityImpactSummary = (data: CommunityEngagementResponse['data']) => {
    const benefits = data.community_engagement.benefits;
    const economicImpact = benefits.economic;

    return {
        totalLocalProcurement: economicImpact.local_procurement_usd,
        estimatedJobsCreated: economicImpact.jobs_created,
        studentsImpacted: benefits.education.students_impacted,
        patientsServed: benefits.healthcare.patients_served,
        schoolsSupported: benefits.education.schools_supported,
        trainingPrograms: economicImpact.training_programs
    };
};

/**
 * Check if data is available for specific category
 */
export const hasDataForCategory = (data: CommunityEngagementResponse['data'], category: keyof ESGData['by_category']) => {
    return Object.keys(data.esg_data.by_category[category]).length > 0;
};

/**
 * Get confidence level based on score
 */
export const getConfidenceLevel = (score: number): string => {
    if (score >= 90) return 'High';
    if (score >= 75) return 'Medium';
    if (score >= 60) return 'Low';
    return 'Very Low';
};

/**
 * Get social license risk level
 */
export const getSocialLicenseRiskLevel = (data: CommunityEngagementResponse['data']): string => {
    const score = data.community_engagement.social_license.score;
    if (score >= 85) return 'Low Risk';
    if (score >= 70) return 'Medium Risk';
    return 'High Risk';
};

export default {
    getCommunityEngagementData,
    getCommunityEngagementSummary,
    getSocialLicenseDetails,
    getSDGAlignmentBreakdown,
    getCommunityBenefits,
    getEngagementScores,
    getKPIs,
    getStrategicInsights,
    getAllGraphs,
    getGraphByType,
    getESGDataSummary,
    getDataCoverage,
    getCompanyInfo,
    getAnalysisMetadata,
    getVersionInfo,
    calculateCommunityInvestmentROI,
    getTopPerformingAreas,
    getAreasNeedingImprovement,
    getStakeholderMetrics,
    getMetricsForSDG,
    generateSDGProgressReport,
    getEngagementTrendAnalysis,
    getCommunityImpactSummary,
    hasDataForCategory,
    getConfidenceLevel,
    getSocialLicenseRiskLevel
};