import api from "../Auth_service/api";

// ============================================================================
// INTERFACES – EXACTLY MATCHING THE NEW API RESPONSE
// ============================================================================

export interface Metadata {
    api_version: string;
    calculation_version: string;
    gee_adapter_version: string;
    generated_at: string;
    endpoint: string;
    company_id: string;
    year_requested: number;
    data_source: {
        record_id: string;
        version: number;
        import_source: string;
        source_file: string;
        original_source: string;
        data_period: {
            start: string;
            end: string;
        };
    };
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
    area_of_interest_metadata: {
        name: string;
        area_covered: string;
        coordinates: Array<{
            lat: number;
            lon: number;
            _id: string;
        }>;
    };
    data_range: string;
    data_processing_workflow: string;
    analytical_layer_metadata: string;
    esg_reporting_framework: string[];
    esg_contact_person: {
        name: string;
        email: string;
        phone: string;
    };
    latest_esg_report_year: number;
    esg_data_status: string;
    has_esg_linked_pay: boolean;
    created_at: string;
    updated_at: string;
    __v: number;
}

export interface ReportingPeriod {
    current_year: number;
    data_available_years: string[]; // Note: array of strings, not numbers
    data_coverage_score: number;
}

export interface ConfidenceScore {
    overall: number;
    forecast_confidence: number;
    risk_assessment_confidence: number;
    interpretation: string;
    improvement_areas: string[];
}

export interface YieldForecast {
    forecasted_yield: number;
    unit: string;
    confidence_score: number;
    calculation_factors: {
        base_yield: number;
        historical_data_available: boolean;
        yoy_trend_available: boolean;
    };
    formula: string;
    season: string;
    next_season_forecast: {
        year: number;
        predicted_yield: number;
        confidence: number;
    };
}

export interface PrimaryRisk {
    category: string;
    level: string;
    score: number;
}

export interface DetailedRisk {
    category: string;
    level: string;
    score: number;
    probability: string;
    factors: string[];
    mitigation: string[];
}

export interface RiskAssessment {
    overall: {
        score: number;
        level: string;
        probability: string;
        primary_risks: PrimaryRisk[];
    };
    detailed_risks: DetailedRisk[];
    mitigation_priorities: string[];
}

export interface YearlyDataPoint {
    year: string;
    value: string;
    numeric_value: number;
    unit: string;
    source: string;
    added_by: string;
    _id: string;
    added_at: string;
    last_updated_at: string;
}

export interface CropYieldMetric {
    category: string;
    subcategory: string;
    metric_name: string;
    data_type: "yearly_series";
    yearly_data: YearlyDataPoint[];
    single_value: {
        added_at: string;
    };
    is_active: boolean;
    created_by: string;
    _id: string;
    list_data: any[];
    created_at: string;
}

export interface YearOverYearChange {
    metric: string;
    period: string;
    change: string;
    numeric_change: number;
}

export interface CropYieldMetrics {
    yearly_summary: {
        total_cane_harvested_company: number;
        total_cane_harvested_private: number;
        total_cane_milled: number;
        total_sugar_produced_company: number;
        total_molasses_produced: number;
        cane_to_sugar_ratio: number;
        company_yield: number;
        private_yield: number;
        total_area: number;
    };
    categorized_metrics: {
        cane_harvested: Record<string, CropYieldMetric>;
        sugar_production: Record<string, CropYieldMetric>;
        sugar_cane_yield: Record<string, CropYieldMetric>;
        area_under_cane: Record<string, CropYieldMetric>;
        year_over_year_change: Record<string, never>;
        other: Record<string, never>;
    };
    year_over_year_changes: YearOverYearChange[];
}

export interface GraphDataset {
    label?: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    pointBackgroundColor?: string;
    fill?: boolean;
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

export interface Graphs {
    risk_distribution: Graph;
    forecast_confidence: Graph;
}

export interface SeasonalAdvisory {
    current_season: string;
    next_season: string;
    planting_window: string;
    harvest_window: string;
    recommended_actions: string[];
}

export interface Summary {
    outlook: string;
    key_strengths: string[];
    key_concerns: string[];
    opportunities: string[];
    data_gaps: string[];
    next_steps: string[];
}

export interface CropYieldForecastResponse {
    message: string;
    api: string;
    data: {
        metadata: Metadata;
        company: Company;
        reporting_period: ReportingPeriod;
        confidence_score: ConfidenceScore;
        yield_forecast: YieldForecast;
        risk_assessment: RiskAssessment;
        crop_yield_metrics: CropYieldMetrics;
        graphs: Graphs;
        recommendations: any[];
        seasonal_advisory: SeasonalAdvisory;
        summary: Summary;
    };
}

// ============================================================================
// REQUEST PARAMETERS
// ============================================================================

export interface CropYieldForecastParams {
    companyId: string;
    year?: number;
}

// ============================================================================
// MAIN SERVICE FUNCTION
// ============================================================================

export const getCropYieldForecastData = async (
    params: CropYieldForecastParams
): Promise<CropYieldForecastResponse> => {
    try {
        const { companyId, year } = params;

        const queryParams = new URLSearchParams();
        if (year !== undefined) {
            queryParams.append("year", year.toString());
        }

        const queryString = queryParams.toString();
        const url = `/esg-dashboard/crop-yield-forecast/${companyId}${queryString ? `?${queryString}` : ""
            }`;

        const { data } = await api.get<CropYieldForecastResponse>(url);
        return data;
    } catch (error: any) {
        const statusCode = error.response?.status;
        const errorMessage =
            error.response?.data?.error || error.response?.data?.message;

        switch (statusCode) {
            case 400:
                throw new Error(errorMessage || "Invalid request parameters");
            case 401:
                throw new Error(
                    "Unauthorized access. Please check your authentication token."
                );
            case 403:
                throw new Error(
                    "You don't have permission to access this resource."
                );
            case 404:
                throw new Error(
                    "Crop yield forecast data not found for the specified company."
                );
            case 422:
                throw new Error(
                    errorMessage || "Invalid year parameter or data format."
                );
            case 500:
                throw new Error(
                    "Server error occurred while fetching crop yield forecast data."
                );
            case 503:
                throw new Error(
                    "Crop yield forecast service is temporarily unavailable."
                );
            default:
                throw new Error(
                    errorMessage ||
                    error.response?.data?.detail ||
                    "Failed to fetch crop yield forecast data"
                );
        }
    }
};

// ============================================================================
// UTILITY FUNCTIONS – UPDATED FOR THE NEW RESPONSE STRUCTURE
// ============================================================================

/**
 * Get available years (as strings) for crop yield forecast data.
 */
export const getAvailableCropYieldYears = (
    data: CropYieldForecastResponse
): string[] => {
    return data.data.reporting_period.data_available_years || [];
};

/**
 * Get yield forecast summary (current year).
 */
export const getYieldForecastSummary = (
    data: CropYieldForecastResponse
) => {
    const forecast = data.data.yield_forecast;
    return {
        forecastedYield: forecast.forecasted_yield,
        unit: forecast.unit,
        confidenceScore: forecast.confidence_score,
        season: forecast.season,
        calculationFactors: forecast.calculation_factors,
        nextSeasonForecast: forecast.next_season_forecast,
    };
};

/**
 * Get risk assessment summary.
 */
export const getRiskAssessmentSummary = (
    data: CropYieldForecastResponse
) => {
    const risk = data.data.risk_assessment;
    return {
        overallScore: risk.overall.score,
        riskLevel: risk.overall.level,
        probability: risk.overall.probability,
        primaryRisks: risk.overall.primary_risks,
        mitigationPriorities: risk.mitigation_priorities,
        detailedRisks: risk.detailed_risks,
    };
};

/**
 * Get confidence score breakdown.
 */
export const getConfidenceScoreBreakdown = (
    data: CropYieldForecastResponse
) => {
    return data.data.confidence_score;
};

/**
 * Get graph data for visualization.
 * Only 'risk_distribution' and 'forecast_confidence' are available.
 */
export const getGraphData = (
    data: CropYieldForecastResponse,
    graphType: "risk_distribution" | "forecast_confidence"
): Graph | undefined => {
    const graphs = data.data.graphs;
    return graphs[graphType];
};

/**
 * Get all graph data.
 */
export const getAllGraphData = (
    data: CropYieldForecastResponse
): Graphs => {
    return data.data.graphs;
};

/**
 * Get seasonal advisory.
 */
export const getSeasonalAdvisory = (
    data: CropYieldForecastResponse
) => {
    return data.data.seasonal_advisory;
};

/**
 * Get summary information.
 */
export const getSummary = (data: CropYieldForecastResponse) => {
    return data.data.summary;
};

/**
 * Get metadata information.
 */
export const getMetadata = (data: CropYieldForecastResponse) => {
    return data.data.metadata;
};

/**
 * Get company information.
 */
export const getCompanyInfo = (data: CropYieldForecastResponse) => {
    return data.data.company;
};

/**
 * Get reporting period information.
 */
export const getReportingPeriod = (data: CropYieldForecastResponse) => {
    return data.data.reporting_period;
};

/**
 * Get recommendations (always empty array in current response).
 */
export const getRecommendations = (data: CropYieldForecastResponse) => {
    return data.data.recommendations;
};

// ============================================================================
// NEW UTILITIES FOR CROP YIELD METRICS
// ============================================================================

/**
 * Get the yearly summary of crop yield metrics.
 */
export const getCropYieldYearlySummary = (
    data: CropYieldForecastResponse
) => {
    return data.data.crop_yield_metrics.yearly_summary;
};

/**
 * Get all categorized metrics.
 */
export const getAllCategorizedMetrics = (
    data: CropYieldForecastResponse
) => {
    return data.data.crop_yield_metrics.categorized_metrics;
};

/**
 * Get metrics for a specific category (e.g., 'cane_harvested', 'sugar_production').
 */
export const getMetricsByCategory = (
    data: CropYieldForecastResponse,
    category:
        | "cane_harvested"
        | "sugar_production"
        | "sugar_cane_yield"
        | "area_under_cane"
        | "year_over_year_change"
        | "other"
): Record<string, CropYieldMetric> => {
    const categories = data.data.crop_yield_metrics.categorized_metrics;
    return categories[category] || {};
};

/**
 * Get year-over-year changes array.
 */
export const getYearOverYearChanges = (
    data: CropYieldForecastResponse
): YearOverYearChange[] => {
    return data.data.crop_yield_metrics.year_over_year_changes || [];
};

/**
 * Extract numeric values for a given metric across years.
 * Useful for charting.
 */
export const getMetricTimeSeries = (
    data: CropYieldForecastResponse,
    metricId: string // the _id of the metric
): { years: string[]; values: number[]; unit: string } | null => {
    const metrics = data.data.crop_yield_metrics.categorized_metrics;
    const allMetrics = {
        ...metrics.cane_harvested,
        ...metrics.sugar_production,
        ...metrics.sugar_cane_yield,
        ...metrics.area_under_cane,
    };
    const metric = allMetrics[metricId];
    if (!metric) return null;
    return {
        years: metric.yearly_data.map((d) => d.year),
        values: metric.yearly_data.map((d) => d.numeric_value),
        unit: metric.yearly_data[0]?.unit || "",
    };
};