import api from "../Auth_service/api";

/**
 * =====================
 * Types & Interfaces for Workforce & Diversity
 * =====================
 */

export interface Coordinate {
    lat: number;
    lon: number;
    _id?: string;
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

export interface CompanyInfo {
    id: string;
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
}

export interface ApiInfo {
    version: string;
    calculation_version: string;
    gee_adapter_version: string;
    endpoint: string;
    timestamp: string;
    requested_year: number;
}

export interface YearData {
    requested_year: number;
    data_available: boolean;
    social_metrics_count: number;
    verification_summary: {
        unverified: number;
    };
    social_categories: Record<string, number>;
}

export interface PerformanceIndicator {
    value: string | number;
    unit: string;
    label: string;
    description: string;
    trend: string;
    industry_average?: string;
    target?: string;
    year: number;
}

export interface WorkforceSummary {
    year: number;
    overview: {
        title: string;
        description: string;
        key_message: string;
    };
    performance_indicators: {
        total_employees: PerformanceIndicator;
        gender_diversity: PerformanceIndicator;
        training_hours: PerformanceIndicator;
        engagement_score: PerformanceIndicator;
    };
}

export interface GenderDistribution {
    male: {
        count: number;
        percentage: string;
    };
    female: {
        count: number;
        percentage: string;
    };
}

export interface ContractTypes {
    permanent: {
        count: number;
        percentage: string;
    };
    fixed_term: {
        count: number;
        percentage: string;
    };
    trainees: {
        count: number;
        description: string;
    };
}

export interface TrainingSummary {
    total_hours: number;
    average_per_employee: string;
    industry_average: string;
    compliance: string;
}

export interface WorkforceComposition {
    year: number;
    gender_distribution: GenderDistribution;
    contract_types: ContractTypes;
    training_summary: TrainingSummary;
}

export interface InclusionMetric {
    value: number;
    unit: string;
    label: string;
    description: string;
    target?: string;
}

export interface InclusionAndBelonging {
    year: number;
    metrics: {
        leadership_diversity: InclusionMetric;
        pay_equity: InclusionMetric;
        retention_rate: InclusionMetric;
        inclusion_score: InclusionMetric;
    };
}

export interface MetricValue {
    year: number;
    value: string;
    numeric_value: number;
    source_notes: string;
    added_at: string;
    added_by: string;
    verification_status: string;
}

export interface SocialMetric {
    name: string;
    unit: string | null;
    description: string | null;
    category: string;
    values: MetricValue[];
    verification_status: string;
    data_source: string;
}

export interface SocialMetrics {
    year: number;
    total_metrics: number;
    metrics_by_category: Record<string, number>;
    metrics: Record<string, SocialMetric>;
    metadata: {
        data_range: Array<{
            start: number;
            end: number;
            source: string;
            verification_status: string;
            data_quality_score: number | null;
        }>;
        verification_status: {
            unverified: number;
        };
        years_requested: number[];
    };
}

export interface DetailedWorkforceMetrics {
    year: number;
    metrics: Record<string, {
        name: string;
        category: string;
        unit: string | null;
        description: string | null;
        values: MetricValue[];
    }>;
}

export interface GraphDataset {
    label: string;
    data: number[] | Array<{ x: number; y: number; r: number }>;
    borderColor?: string;
    backgroundColor?: string | string[] | any;
    fill?: boolean;
    borderDash?: number[];
    tension?: number;
    borderWidth?: number;
    pointBackgroundColor?: string;
    yAxisID?: string;
    tooltip?: string;
}

export interface Graph {
    type: string;
    title: string;
    description: string;
    labels: (string | number)[];
    datasets: GraphDataset[];
}

export interface Graphs {
    workforce_trend: Graph;
    gender_distribution: Graph;
    employment_types: Graph;
    training_development: Graph;
    inclusion_radar: Graph;
    diversity_performance_correlation: Graph;
}

export interface KeyIndicator {
    name: string;
    value: string;
    unit: string;
    trend: string;
    description: string;
    industry_average: string;
}

export interface Recommendation {
    priority: string;
    action: string;
    impact: string;
    timeline: string;
    metrics_affected: string[];
}

export interface DataQuality {
    year: number;
    verification_status: {
        unverified: number;
    };
    data_range: Array<{
        start: number;
        end: number;
        source: string;
        verification_status: string;
        data_quality_score: number | null;
    }>;
    total_metrics: number;
    last_updated: string;
    notes: string;
}

/**
 * =====================
 * Main Response Interface
 * =====================
 */

export interface WorkforceDiversityResponse {
    message: string;
    api: string;
    data: {
        api_info: ApiInfo;
        year_data: YearData;
        company: CompanyInfo;
        workforce_summary: WorkforceSummary;
        workforce_composition: WorkforceComposition;
        inclusion_and_belonging: InclusionAndBelonging;
        social_metrics: SocialMetrics;
        detailed_workforce_metrics: DetailedWorkforceMetrics;
        graphs: Graphs;
        key_indicators: KeyIndicator[];
        recommendations: Recommendation[];
        data_quality: DataQuality;
    };
}

export interface WorkforceDiversityParams {
    companyId: string;
    year?: number;
}

/**
 * =====================
 * Workforce & Diversity Service
 * =====================
 */

export const getWorkforceDiversityData = async (
    params: WorkforceDiversityParams
): Promise<WorkforceDiversityResponse> => {
    try {
        const { companyId, year } = params;

        const queryParams = new URLSearchParams();
        if (year !== undefined) {
            queryParams.append('year', year.toString());
        }

        const queryString = queryParams.toString();
        const url = `/esg-dashboard/workforce-diversity/${companyId}${queryString ? `?${queryString}` : ''}`;

        const { data } = await api.get<WorkforceDiversityResponse>(url);
        return data;
    } catch (error: any) {
        const statusCode = error.response?.status;
        const errorMessage = error.response?.data?.error || error.response?.data?.message;

        switch (statusCode) {
            case 400:
                throw new Error(errorMessage || "Invalid request parameters");
            case 401:
                throw new Error("Unauthorized access. Please check your authentication token.");
            case 403:
                throw new Error("You don't have permission to access this resource.");
            case 404:
                throw new Error("Workforce diversity data not found for the specified company.");
            case 422:
                throw new Error(errorMessage || "Invalid year parameter or data format.");
            case 500:
                throw new Error("Server error occurred while fetching workforce diversity data.");
            case 503:
                throw new Error("Workforce diversity service is temporarily unavailable.");
            default:
                throw new Error(
                    errorMessage ||
                    error.response?.data?.detail ||
                    "Failed to fetch workforce diversity data"
                );
        }
    }
};

/**
 * =====================
 * Helper Functions for Workforce & Diversity
 * =====================
 */

/**
 * Get company information
 */
export const getWorkforceCompanyInfo = (data: WorkforceDiversityResponse): CompanyInfo => {
    return data.data.company;
};

/**
 * Get workforce summary data
 */
export const getWorkforceSummary = (data: WorkforceDiversityResponse): WorkforceSummary => {
    return data.data.workforce_summary;
};

/**
 * Get workforce composition data
 */
export const getWorkforceComposition = (data: WorkforceDiversityResponse): WorkforceComposition => {
    return data.data.workforce_composition;
};

/**
 * Get inclusion and belonging data
 */
export const getInclusionAndBelonging = (data: WorkforceDiversityResponse): InclusionAndBelonging => {
    return data.data.inclusion_and_belonging;
};

/**
 * Get social metrics
 */
export const getSocialMetrics = (data: WorkforceDiversityResponse): SocialMetrics => {
    return data.data.social_metrics;
};

/**
 * Get detailed workforce metrics
 */
export const getDetailedWorkforceMetrics = (data: WorkforceDiversityResponse): DetailedWorkforceMetrics => {
    return data.data.detailed_workforce_metrics;
};

/**
 * Get all graphs
 */
export const getAllWorkforceGraphs = (data: WorkforceDiversityResponse): Graphs => {
    return data.data.graphs;
};

/**
 * Get specific graph by type
 */
export const getWorkforceGraphByType = (data: WorkforceDiversityResponse, graphType: string): Graph | undefined => {
    const graphs = data.data.graphs;
    switch (graphType) {
        case 'workforce_trend':
            return graphs.workforce_trend;
        case 'gender_distribution':
            return graphs.gender_distribution;
        case 'employment_types':
            return graphs.employment_types;
        case 'training_development':
            return graphs.training_development;
        case 'inclusion_radar':
            return graphs.inclusion_radar;
        case 'diversity_performance_correlation':
            return graphs.diversity_performance_correlation;
        default:
            return undefined;
    }
};

/**
 * Get key indicators
 */
export const getKeyIndicators = (data: WorkforceDiversityResponse): KeyIndicator[] => {
    return data.data.key_indicators;
};

/**
 * Get recommendations
 */
export const getRecommendations = (data: WorkforceDiversityResponse): Recommendation[] => {
    return data.data.recommendations;
};

/**
 * Get data quality information
 */
export const getDataQuality = (data: WorkforceDiversityResponse): DataQuality => {
    return data.data.data_quality;
};

/**
 * Get API information
 */
export const getApiInfo = (data: WorkforceDiversityResponse): ApiInfo => {
    return data.data.api_info;
};

/**
 * Get year data
 */
export const getYearData = (data: WorkforceDiversityResponse): YearData => {
    return data.data.year_data;
};

/**
 * Get performance indicators
 */
export const getPerformanceIndicators = (data: WorkforceDiversityResponse) => {
    return data.data.workforce_summary.performance_indicators;
};

/**
 * Get total employees
 */
export const getTotalEmployees = (data: WorkforceDiversityResponse): PerformanceIndicator => {
    return data.data.workforce_summary.performance_indicators.total_employees;
};

/**
 * Get gender diversity
 */
export const getGenderDiversity = (data: WorkforceDiversityResponse): PerformanceIndicator => {
    return data.data.workforce_summary.performance_indicators.gender_diversity;
};

/**
 * Get training hours
 */
export const getTrainingHours = (data: WorkforceDiversityResponse): PerformanceIndicator => {
    return data.data.workforce_summary.performance_indicators.training_hours;
};

/**
 * Get engagement score
 */
export const getEngagementScore = (data: WorkforceDiversityResponse): PerformanceIndicator => {
    return data.data.workforce_summary.performance_indicators.engagement_score;
};

/**
 * Get gender distribution
 */
export const getGenderDistribution = (data: WorkforceDiversityResponse): GenderDistribution => {
    return data.data.workforce_composition.gender_distribution;
};

/**
 * Get contract types
 */
export const getContractTypes = (data: WorkforceDiversityResponse): ContractTypes => {
    return data.data.workforce_composition.contract_types;
};

/**
 * Get training summary
 */
export const getTrainingSummary = (data: WorkforceDiversityResponse): TrainingSummary => {
    return data.data.workforce_composition.training_summary;
};

/**
 * Get inclusion metrics
 */
export const getInclusionMetrics = (data: WorkforceDiversityResponse) => {
    return data.data.inclusion_and_belonging.metrics;
};

/**
 * Get leadership diversity metric
 */
export const getLeadershipDiversity = (data: WorkforceDiversityResponse): InclusionMetric => {
    return data.data.inclusion_and_belonging.metrics.leadership_diversity;
};

/**
 * Get pay equity metric
 */
export const getPayEquity = (data: WorkforceDiversityResponse): InclusionMetric => {
    return data.data.inclusion_and_belonging.metrics.pay_equity;
};

/**
 * Get retention rate metric
 */
export const getRetentionRate = (data: WorkforceDiversityResponse): InclusionMetric => {
    return data.data.inclusion_and_belonging.metrics.retention_rate;
};

/**
 * Get inclusion score metric
 */
export const getInclusionScore = (data: WorkforceDiversityResponse): InclusionMetric => {
    return data.data.inclusion_and_belonging.metrics.inclusion_score;
};

/**
 * Get social metric by name
 */
export const getSocialMetricByName = (data: WorkforceDiversityResponse, metricName: string): SocialMetric | undefined => {
    return data.data.social_metrics.metrics[metricName];
};

/**
 * Get all social metric names
 */
export const getAllSocialMetricNames = (data: WorkforceDiversityResponse): string[] => {
    return Object.keys(data.data.social_metrics.metrics);
};

/**
 * Get metric categories breakdown
 */
export const getSocialMetricCategoriesBreakdown = (data: WorkforceDiversityResponse): Record<string, number> => {
    return data.data.social_metrics.metrics_by_category;
};

/**
 * Get total number of metrics
 */
export const getTotalSocialMetricsCount = (data: WorkforceDiversityResponse): number => {
    return data.data.social_metrics.total_metrics;
};

/**
 * Get social data range information
 */
export const getSocialDataRange = (data: WorkforceDiversityResponse) => {
    return data.data.social_metrics.metadata.data_range;
};

/**
 * Get social verification status
 */
export const getSocialVerificationStatus = (data: WorkforceDiversityResponse) => {
    return data.data.social_metrics.metadata.verification_status;
};

/**
 * Get area of interest metadata
 */
export const getAreaOfInterestMetadata = (data: WorkforceDiversityResponse): AreaOfInterestMetadata => {
    return data.data.company.area_of_interest_metadata;
};

/**
 * Get ESG contact person
 */
export const getEsgContactPerson = (data: WorkforceDiversityResponse): EsgContactPerson => {
    return data.data.company.esg_contact_person;
};

/**
 * Get ESG reporting frameworks
 */
export const getEsgReportingFrameworks = (data: WorkforceDiversityResponse): string[] => {
    return data.data.company.esg_reporting_framework;
};

/**
 * Get requested year
 */
export const getRequestedYear = (data: WorkforceDiversityResponse): number => {
    return data.data.year_data.requested_year;
};

/**
 * Check if data is available for the requested year
 */
export const isDataAvailable = (data: WorkforceDiversityResponse): boolean => {
    return data.data.year_data.data_available;
};

/**
 * Get social metrics count
 */
export const getSocialMetricsCount = (data: WorkforceDiversityResponse): number => {
    return data.data.year_data.social_metrics_count;
};

/**
 * Get high priority recommendations
 */
export const getHighPriorityRecommendations = (data: WorkforceDiversityResponse): Recommendation[] => {
    return data.data.recommendations.filter(rec => rec.priority === 'High');
};

/**
 * Get medium priority recommendations
 */
export const getMediumPriorityRecommendations = (data: WorkforceDiversityResponse): Recommendation[] => {
    return data.data.recommendations.filter(rec => rec.priority === 'Medium');
};

/**
 * Get low priority recommendations
 */
export const getLowPriorityRecommendations = (data: WorkforceDiversityResponse): Recommendation[] => {
    return data.data.recommendations.filter(rec => rec.priority === 'Low');
};

/**
 * Calculate workforce growth rate
 */
export const calculateWorkforceGrowthRate = (currentYear: number, previousYear: number): number => {
    if (previousYear === 0) return 0;
    return ((currentYear - previousYear) / previousYear) * 100;
};

/**
 * Calculate gender diversity ratio
 */
export const calculateGenderDiversityRatio = (femaleCount: number, maleCount: number): number => {
    const total = femaleCount + maleCount;
    if (total === 0) return 0;
    return femaleCount / total;
};

/**
 * Calculate employee turnover rate
 */
export const calculateTurnoverRate = (employeesLeft: number, averageEmployees: number): number => {
    if (averageEmployees === 0) return 0;
    return (employeesLeft / averageEmployees) * 100;
};

/**
 * Calculate average training hours per employee
 */
export const calculateAverageTrainingHours = (totalHours: number, totalEmployees: number): number => {
    if (totalEmployees === 0) return 0;
    return totalHours / totalEmployees;
};

/**
 * Get workforce metrics summary for dashboard
 */
export const getWorkforceMetricsSummary = (data: WorkforceDiversityResponse) => {
    const performance = data.data.workforce_summary.performance_indicators;
    const composition = data.data.workforce_composition;
    const inclusion = data.data.inclusion_and_belonging.metrics;
    const keyIndicators = data.data.key_indicators;

    return {
        totalEmployees: parseInt(performance.total_employees.value.toString()),
        genderDiversity: parseFloat(performance.gender_diversity.value.toString()),
        trainingHours: parseInt(performance.training_hours.value.toString()),
        engagementScore: performance.engagement_score.value as number,
        maleEmployees: composition.gender_distribution.male.count,
        femaleEmployees: composition.gender_distribution.female.count,
        permanentEmployees: composition.contract_types.permanent.count,
        fixedTermEmployees: composition.contract_types.fixed_term.count,
        leadershipDiversity: inclusion.leadership_diversity.value,
        payEquity: inclusion.pay_equity.value,
        retentionRate: inclusion.retention_rate.value,
        inclusionScore: inclusion.inclusion_score.value,
        keyIndicators: keyIndicators
    };
};

/**
 * Get trending metrics (increase/decrease based on trend values)
 */
export const getTrendingMetrics = (data: WorkforceDiversityResponse) => {
    const performance = data.data.workforce_summary.performance_indicators;

    return {
        totalEmployees: performance.total_employees.trend,
        genderDiversity: performance.gender_diversity.trend,
        trainingHours: performance.training_hours.trend,
        engagementScore: performance.engagement_score.trend
    };
};

/**
 * Calculate workforce diversity score
 */
export const calculateDiversityScore = (data: WorkforceDiversityResponse): number => {
    const inclusion = data.data.inclusion_and_belonging.metrics;

    // Weighted average of diversity metrics
    const weights = {
        leadershipDiversity: 0.3,
        genderDiversity: 0.3,
        inclusionScore: 0.2,
        payEquity: 0.2
    };

    const genderDiversity = parseFloat(data.data.workforce_summary.performance_indicators.gender_diversity.value.toString());

    return (
        (inclusion.leadership_diversity.value * weights.leadershipDiversity) +
        (genderDiversity * weights.genderDiversity) +
        (inclusion.inclusion_score.value * weights.inclusionScore) +
        (inclusion.pay_equity.value * weights.payEquity)
    );
};

/**
 * Get employee count by category
 */
export const getEmployeeCountByCategory = (data: WorkforceDiversityResponse) => {
    const composition = data.data.workforce_composition;
    return {
        permanent: composition.contract_types.permanent.count,
        fixedTerm: composition.contract_types.fixed_term.count,
        trainees: composition.contract_types.trainees.count,
        total: composition.gender_distribution.male.count + composition.gender_distribution.female.count
    };
};

/**
 * Get workforce demographics summary
 */
export const getWorkforceDemographics = (data: WorkforceDiversityResponse) => {
    const composition = data.data.workforce_composition;
    const total = composition.gender_distribution.male.count + composition.gender_distribution.female.count;

    return {
        malePercentage: parseFloat(composition.gender_distribution.male.percentage),
        femalePercentage: parseFloat(composition.gender_distribution.female.percentage),
        permanentPercentage: parseFloat(composition.contract_types.permanent.percentage),
        fixedTermPercentage: parseFloat(composition.contract_types.fixed_term.percentage),
        totalEmployees: total
    };
};

/**
 * Get training effectiveness metrics
 */
export const getTrainingEffectiveness = (data: WorkforceDiversityResponse) => {
    const training = data.data.workforce_composition.training_summary;
    const socialMetrics = data.data.social_metrics.metrics;

    // Extract training hours by gender from social metrics
    const trainingByGender = socialMetrics["Employees’ Education and Training - Average training hours by gender"];
    const trainingByCategory = socialMetrics["Employees’ Education and Training - Average training hours by employee category"];

    return {
        totalHours: training.total_hours,
        averagePerEmployee: parseFloat(training.average_per_employee),
        industryAverage: training.industry_average,
        compliance: training.compliance,
        trainingByGender: trainingByGender?.values || [],
        trainingByCategory: trainingByCategory?.values || []
    };
};

export default {
    getWorkforceDiversityData,
    getWorkforceCompanyInfo,
    getWorkforceSummary,
    getWorkforceComposition,
    getInclusionAndBelonging,
    getSocialMetrics,
    getDetailedWorkforceMetrics,
    getAllWorkforceGraphs,
    getWorkforceGraphByType,
    getKeyIndicators,
    getRecommendations,
    getDataQuality,
    getApiInfo,
    getYearData,
    getPerformanceIndicators,
    getTotalEmployees,
    getGenderDiversity,
    getTrainingHours,
    getEngagementScore,
    getGenderDistribution,
    getContractTypes,
    getTrainingSummary,
    getInclusionMetrics,
    getLeadershipDiversity,
    getPayEquity,
    getRetentionRate,
    getInclusionScore,
    getSocialMetricByName,
    getAllSocialMetricNames,
    getSocialMetricCategoriesBreakdown,
    getTotalSocialMetricsCount,
    getSocialDataRange,
    getSocialVerificationStatus,
    getAreaOfInterestMetadata,
    getEsgContactPerson,
    getEsgReportingFrameworks,
    getRequestedYear,
    isDataAvailable,
    getSocialMetricsCount,
    getHighPriorityRecommendations,
    getMediumPriorityRecommendations,
    getLowPriorityRecommendations,
    calculateWorkforceGrowthRate,
    calculateGenderDiversityRatio,
    calculateTurnoverRate,
    calculateAverageTrainingHours,
    getWorkforceMetricsSummary,
    getTrendingMetrics,
    calculateDiversityScore,
    getEmployeeCountByCategory,
    getWorkforceDemographics,
    getTrainingEffectiveness
};