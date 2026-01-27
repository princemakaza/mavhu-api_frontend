import api from "../Auth_service/api";

/**
 * =====================
 * Types & Interfaces
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

export interface Company {
    id: string;
    name: string;
    registrationNumber: string;
    email: string;
    phone: string;
    address: string;
    website?: string;
    country: string;
    industry: string;
    description?: string;
    purpose?: string;
    scope?: string;
    data_source?: string[];
    area_of_interest_metadata?: AreaOfInterestMetadata;
    data_range?: string;
    data_processing_workflow?: string;
    analytical_layer_metadata?: string;
    esg_reporting_framework?: string[];
    esg_contact_person?: EsgContactPerson;
    latest_esg_report_year?: number;
    esg_data_status?: string;
    has_esg_linked_pay?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Metadata {
    api_version: string;
    calculation_version: string;
    gee_adapter_version: string;
    generated_at: string;
    endpoint: string;
    company_id: string;
    year_requested: number | null;
    data_sources: string[];
    calculation_methods: string[];
    compliance_frameworks: string[];
}

export interface ReportingPeriod {
    current_year: number;
    baseline_year: number;
    previous_year: number | null;
    available_years: number[];
    carbon_data_available: boolean;
    data_coverage: string;
}

export interface ConfidenceAssessment {
    overall_score: number;
    data_completeness: number;
    methodological_rigor: number;
    verification_status: number;
    temporal_coverage: number;
    interpretation: string;
}

export interface KeyTotal {
    value: number;
    unit: string;
    description: string;
}

export interface DetailedSource {
    source: string;
    parameter: string;
    unit: string;
    annual_per_ha?: number;
    annual_activity_per_ha?: number;
    emission_factor: string;
    ef_number: number;
    gwp?: number;
    tco2e_per_ha_per_year: number;
    methodological_justification: string;
    calculation_notes: string;
    total_tco2e: number;
}

// FIXED: Made categories optional since Scope 1 and Scope 2 don't have it
export interface ScopeData {
    definition: string;
    examples: string[];
    current_year: number;
    trend: string;
    percentage_of_total: number;
    detailed_sources?: DetailedSource[];
    categories?: Record<string, number>; // Only exists in Scope 3
    detailed_categories?: DetailedSource[]; // Only exists in Scope 3
}

export interface ScopeBreakdown {
    scope1: ScopeData;
    scope2: ScopeData;
    scope3: ScopeData;
}

export interface IntensityAnalysis {
    carbon_intensity: number;
    unit: string;
    benchmark: number;
    performance: string;
    trend: string;
}

export interface TargetAlignment {
    paris_agreement: string;
    science_based_targets: string;
    net_zero: string;
}

export interface FutureTarget {
    target_year: number;
    years_to_target: number;
    target_value: number;
    required_annual_reduction: number;
    current_progress: number;
    alignment: TargetAlignment;
}

export interface CurrentPerformance {
    baseline_year: number;
    baseline_emissions: number;
    current_emissions: number;
    reduction_achieved: number;
    annual_reduction_rate: number;
}

export interface Alignment {
    paris_agreement: string;
    national_contributions: string;
    corporate_commitments: string;
}

export interface ReductionTargets {
    current_performance: CurrentPerformance;
    future_targets: FutureTarget[];
    alignment: Alignment;
}

export interface CarbonEmissionFramework {
    sequestration_methodology: string;
    emission_methodology: string;
    calculation_approach: string;
    data_sources: string[];
}

export interface EmissionFactor {
    source: string;
    activity_data: string;
    default_ef_start: string;
    notes_source: string;
    emission_factor_code: string;
    emission_factor_value: number;
    emission_factor_unit: string;
    gwp_value: number;
    gwp_source: string;
    conversion_factor: number;
    is_active: boolean;
    created_at: string;
    last_updated_at: string;
    _id: string;
}

export interface GlobalWarmingPotentials {
    n2o_gwp: number;
    ch4_gwp: number;
    source: string;
}

export interface ConversionFactors {
    n2o_n_to_n2o: number;
    carbon_to_co2: number;
    carbon_fraction: number;
}

export interface Scope1Data {
    total_tco2e: number;
    total_tco2e_per_ha: number;
    categories: Record<string, number>;
    sources: DetailedSource[];
}

export interface Scope2Data {
    total_tco2e: number;
    total_tco2e_per_ha: number;
    energy_sources: Record<string, number>;
    sources: DetailedSource[];
}

export interface Scope3Data {
    total_tco2e: number;
    total_tco2e_per_ha: number;
    ghg_protocol_categories: Record<string, number>;
    categories: DetailedSource[];
}

export interface YearlyData {
    year: number;
    scope1: Scope1Data;
    scope2: Scope2Data;
    scope3: Scope3Data;
    totals: {
        total_scope_emission_tco2e: number;
        total_scope_emission_tco2e_per_ha: number;
        net_total_emission_tco2e: number;
    };
    intensity_metrics: {
        scope1_intensity: number;
        scope2_intensity: number;
        scope3_intensity: number;
        total_intensity: number;
        per_production_unit: {
            scope1_per_unit: number;
            scope2_per_unit: number;
            scope3_per_unit: number;
            total_per_unit: number;
            unit: string;
        };
    };
    data_quality: {
        completeness_score: number;
        verification_status: string;
    };
}

export interface CarbonEmissionAccounting {
    framework: CarbonEmissionFramework;
    methodology: string;
    summary: {
        period: {
            start_year: number;
            end_year: number;
            years_count: number;
        };
        totals: {
            total_scope1_tco2e: number;
            total_scope2_tco2e: number;
            total_scope3_tco2e: number;
            total_emissions_tco2e: number;
            cumulative_co2e: number;
            average_area_ha: number;
        };
        averages: {
            annual_scope1: number;
            annual_scope2: number;
            annual_scope3: number;
            annual_total: number;
            carbon_intensity: number;
        };
        trends: {
            scope1_trend: number;
            scope2_trend: number;
            scope3_trend: number;
            total_trend: number;
            scope1_direction: string;
            scope2_direction: string;
            scope3_direction: string;
            total_direction: string;
        };
        composition: {
            scope1_percentage: number;
            scope2_percentage: number;
            scope3_percentage: number;
            scope1_breakdown: Record<string, number>;
            scope2_breakdown: Record<string, number>;
            scope3_breakdown: Record<string, number>;
        };
        intensity_metrics: {
            scope1_intensity: number;
            scope2_intensity: number;
            scope3_intensity: number;
            total_intensity: number;
        };
    };
    emission_factors: EmissionFactor[];
    global_warming_potentials: GlobalWarmingPotentials;
    conversion_factors: ConversionFactors;
    yearly_data: YearlyData[];
}

export interface EnvironmentalMetricValue {
    year: number;
    value: string;
    numeric_value: number;
    source_notes: string;
}

export interface EnvironmentalMetric {
    name: string;
    category: string;
    unit: string;
    description: string;
    values: EnvironmentalMetricValue[];
}

export interface MetricsSummaryItem {
    name: string;
    category: string;
    unit: string;
    current_value: number;
    trend: string;
    years_available: number[];
}

export interface EmissionMetrics {
    all_metrics: Record<string, EnvironmentalMetric>;
    key_metrics_summary: MetricsSummaryItem[];
}

export interface GraphDataset {
    label: string;
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
    labels: (string | number)[];
    datasets: GraphDataset[];
}

export interface ComplianceRecommendation {
    category: string;
    priority: string;
    action: string;
    impact: string;
    compliance_benefit: string;
    timeframe: string;
}

export interface ReportingDeadlines {
    cdp: string;
    annual_report: string;
    sustainability_report: string;
    regulatory_submissions: string;
}

export interface ReportingRequirements {
    mandatory: string[];
    voluntary: string[];
    deadlines: ReportingDeadlines;
    verification_required: boolean;
    penalties_non_compliance: string;
}

export interface Summary {
    overall_assessment: string;
    key_achievements: string[];
    critical_areas: string[]; // FIXED: Changed from any[] to string[]
    next_steps: string[];
    outlook: string;
}

/**
 * =====================
 * Main Response Interface
 * =====================
 */

export interface GhgEmissionResponse {
    message: string;
    api: string;
    data: {
        metadata: Metadata;
        company: Company;
        reporting_period: ReportingPeriod;
        confidence_assessment: ConfidenceAssessment;
        key_totals: {
            total_emissions_current_year: KeyTotal;
            scope1_direct_emissions: KeyTotal;
            scope2_indirect_energy: KeyTotal;
            scope3_value_chain: KeyTotal;
            cumulative_emissions: KeyTotal;
            carbon_intensity: KeyTotal;
            reduction_from_baseline: KeyTotal;
            scope3_percentage_of_total: KeyTotal;
        };
        scope_breakdown: ScopeBreakdown;
        intensity_analysis: IntensityAnalysis;
        reduction_targets: ReductionTargets;
        carbon_emission_accounting: CarbonEmissionAccounting;
        emission_metrics: EmissionMetrics;
        graphs: {
            total_emissions_trend?: Graph; // Optional since it may not exist for single year
            scope_composition: Graph;
            scope_trends?: Graph; // Optional since it may not exist for single year
            scope1_breakdown: Graph;
            scope3_categories: Graph;
            cumulative_emissions?: Graph; // Optional since it may not exist for single year
            reduction_progress?: Graph; // Optional since it may not exist for single year
        };
        compliance_recommendations: ComplianceRecommendation[];
        reporting_requirements: ReportingRequirements;
        summary: Summary;
    };
}

/**
 * =====================
 * Request Parameters
 * =====================
 */

export interface GhgEmissionParams {
    companyId: string;
    year?: number; // Optional year parameter
}

/**
 * =====================
 * GHG Emission Service
 * =====================
 */

/**
 * Get GHG emissions data for a company
 */
export const getGhgEmissionData = async (
    params: GhgEmissionParams
): Promise<GhgEmissionResponse> => {
    try {
        const { companyId, year } = params;

        // Build query parameters
        const queryParams = new URLSearchParams();
        if (year !== undefined) {
            queryParams.append('year', year.toString());
        }

        const queryString = queryParams.toString();
        const url = `/esg-dashboard/ghg-emissions/${companyId}${queryString ? `?${queryString}` : ''}`;

        const { data } = await api.get<GhgEmissionResponse>(url);
        return data;
    } catch (error: any) {
        const statusCode = error.response?.status;
        const errorMessage = error.response?.data?.error || error.response?.data?.message;

        // Handle specific error cases
        switch (statusCode) {
            case 400:
                throw new Error(errorMessage || "Invalid request parameters");
            case 401:
                throw new Error("Unauthorized access. Please check your authentication token.");
            case 403:
                throw new Error("You don't have permission to access this resource.");
            case 404:
                throw new Error("GHG emissions data not found for the specified company.");
            case 422:
                throw new Error(errorMessage || "Invalid year parameter or data format.");
            case 500:
                throw new Error("Server error occurred while fetching GHG emissions data.");
            case 503:
                throw new Error("GHG emissions service is temporarily unavailable.");
            default:
                throw new Error(
                    errorMessage ||
                    error.response?.data?.detail ||
                    "Failed to fetch GHG emissions data"
                );
        }
    }
};

/**
 * Get available years for GHG emissions data
 */
export const getAvailableGhgYears = (data: GhgEmissionResponse): number[] => {
    return data.data.reporting_period.available_years || [];
};

/**
 * Get current GHG emissions summary
 */
export const getGhgSummary = (data: GhgEmissionResponse) => {
    const totals = data.data.key_totals;
    return {
        totalEmissions: totals.total_emissions_current_year.value,
        scope1: totals.scope1_direct_emissions.value,
        scope2: totals.scope2_indirect_energy.value,
        scope3: totals.scope3_value_chain.value,
        carbonIntensity: totals.carbon_intensity.value,
        reductionFromBaseline: totals.reduction_from_baseline.value,
        scope3Percentage: totals.scope3_percentage_of_total.value,
        confidenceScore: data.data.confidence_assessment.overall_score,
        trends: {
            scope1: data.data.scope_breakdown.scope1.trend,
            scope2: data.data.scope_breakdown.scope2.trend,
            scope3: data.data.scope_breakdown.scope3.trend,
        }
    };
};

/**
 * Get scope breakdown data
 */
export const getScopeBreakdown = (data: GhgEmissionResponse) => {
    return data.data.scope_breakdown;
};

/**
 * Get scope 1 detailed sources
 */
export const getScope1Sources = (data: GhgEmissionResponse) => {
    return data.data.scope_breakdown.scope1.detailed_sources || [];
};

/**
 * Get scope 2 detailed sources
 */
export const getScope2Sources = (data: GhgEmissionResponse) => {
    return data.data.scope_breakdown.scope2.detailed_sources || [];
};

/**
 * Get scope 3 detailed categories
 */
export const getScope3Categories = (data: GhgEmissionResponse) => {
    return data.data.scope_breakdown.scope3.detailed_categories || [];
};

/**
 * Get carbon emission accounting data
 */
export const getCarbonEmissionAccounting = (data: GhgEmissionResponse) => {
    return data.data.carbon_emission_accounting;
};

/**
 * Get emission metrics
 */
export const getEmissionMetrics = (data: GhgEmissionResponse) => {
    return data.data.emission_metrics;
};

/**
 * Get reduction targets
 */
export const getReductionTargets = (data: GhgEmissionResponse) => {
    return data.data.reduction_targets;
};

/**
 * Get current performance data
 */
export const getCurrentPerformance = (data: GhgEmissionResponse) => {
    return data.data.reduction_targets.current_performance;
};

/**
 * Get future targets
 */
export const getFutureTargets = (data: GhgEmissionResponse) => {
    return data.data.reduction_targets.future_targets;
};

/**
 * Get intensity analysis
 */
export const getIntensityAnalysis = (data: GhgEmissionResponse) => {
    return data.data.intensity_analysis;
};

/**
 * Get compliance recommendations
 */
export const getComplianceRecommendations = (data: GhgEmissionResponse) => {
    return data.data.compliance_recommendations;
};

/**
 * Get reporting requirements
 */
export const getReportingRequirements = (data: GhgEmissionResponse) => {
    return data.data.reporting_requirements;
};

/**
 * Get graph data for visualization
 */
export const getGhgGraphData = (data: GhgEmissionResponse, graphType: string): Graph | undefined => {
    const graphs = data.data.graphs;

    switch (graphType) {
        case 'total_emissions_trend':
            return graphs.total_emissions_trend;
        case 'scope_composition':
            return graphs.scope_composition;
        case 'scope_trends':
            return graphs.scope_trends;
        case 'scope1_breakdown':
            return graphs.scope1_breakdown;
        case 'scope3_categories':
            return graphs.scope3_categories;
        case 'cumulative_emissions':
            return graphs.cumulative_emissions;
        case 'reduction_progress':
            return graphs.reduction_progress;
        default:
            return graphs.scope_composition; // Default to scope composition
    }
};

/**
 * Get all graph data
 */
export const getAllGhgGraphData = (data: GhgEmissionResponse) => {
    return data.data.graphs;
};

/**
 * Get confidence assessment
 */
export const getConfidenceAssessment = (data: GhgEmissionResponse) => {
    return data.data.confidence_assessment;
};

/**
 * Get summary assessment
 */
export const getSummary = (data: GhgEmissionResponse) => {
    return data.data.summary;
};

/**
 * Get metadata information
 */
export const getGhgMetadata = (data: GhgEmissionResponse) => {
    return data.data.metadata;
};

/**
 * Get emission factors
 */
export const getEmissionFactors = (data: GhgEmissionResponse) => {
    return data.data.carbon_emission_accounting.emission_factors;
};

/**
 * Get yearly data by year
 */
export const getYearlyData = (data: GhgEmissionResponse, year: number) => {
    return data.data.carbon_emission_accounting.yearly_data.find(
        (yearlyData) => yearlyData.year === year
    );
};

/**
 * Get all yearly data
 */
export const getAllYearlyData = (data: GhgEmissionResponse) => {
    return data.data.carbon_emission_accounting.yearly_data;
};

/**
 * Get key metrics summary
 */
export const getKeyMetricsSummary = (data: GhgEmissionResponse) => {
    return data.data.emission_metrics.key_metrics_summary;
};

/**
 * Get emission metrics by name
 */
export const getEmissionMetric = (data: GhgEmissionResponse, metricName: string) => {
    return data.data.emission_metrics.all_metrics[metricName];
};

/**
 * Get compliance frameworks
 */
export const getComplianceFrameworks = (data: GhgEmissionResponse) => {
    return data.data.metadata.compliance_frameworks;
};

/**
 * Get data coverage information
 */
export const getDataCoverage = (data: GhgEmissionResponse) => {
    return data.data.reporting_period.data_coverage;
};

/**
 * Check if carbon data is available
 */
export const isCarbonDataAvailable = (data: GhgEmissionResponse) => {
    return data.data.reporting_period.carbon_data_available;
};

/**
 * Get company information
 */
export const getGhgCompany = (data: GhgEmissionResponse) => {
    return data.data.company;
};

/**
 * Get current year
 */
export const getCurrentYear = (data: GhgEmissionResponse) => {
    return data.data.reporting_period.current_year;
};

/**
 * Get baseline year
 */
export const getBaselineYear = (data: GhgEmissionResponse) => {
    return data.data.reporting_period.baseline_year;
};

/**
 * Get previous year
 */
export const getPreviousYear = (data: GhgEmissionResponse) => {
    return data.data.reporting_period.previous_year;
};