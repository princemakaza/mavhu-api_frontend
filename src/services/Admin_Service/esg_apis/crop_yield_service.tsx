import api from "../Auth_service/api";

export interface Coordinate {
    lat: number;
    lon: number;
    _id?: string;
}

export interface AreaOfInterest {
    name: string;
    area_covered: string;
    coordinates: Coordinate[];
}

export interface CompanyInfo {
    id: string;
    name: string;
    industry: string;
    country: string;
    area_of_interest: AreaOfInterest;
    esg_frameworks: string[];
    latest_report_year: number;
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
    spatial_resolution: string;
    temporal_resolution: string;
}

export interface ReportingPeriod {
    current_year: number;
    data_available_years: number[];
    carbon_data_available: boolean;
    satellite_data_years: number[];
    data_coverage_score: number;
}

export interface ConfidenceScore {
    overall: number;
    forecast_confidence: number;
    risk_assessment_confidence: number;
    data_quality: number;
    methodology_rigor: number;
    interpretation: string;
    improvement_areas: string[];
}

export interface GrowingSeasonMonth {
    month: string;
    ndvi: number;
    biomass: number;
}

export interface CalculationFactors {
    base_yield: number;
    ndvi_factor: string;
    water_efficiency: string;
    energy_efficiency: string;
    biomass_factor: string;
    soil_health_factor: string;
    climate_factor: string;
}

export interface ComparisonToIndustryAverage {
    industry_average: number;
    company_yield: number;
    percentage_difference: string;
    status: string;
    potential_improvement: number;
}

export interface SensitivityAnalysis {
    water_sensitivity: number;
    climate_sensitivity: number;
    management_sensitivity: number;
}

export interface NDVIIndicators {
    average_ndvi: number;
    max_ndvi: number;
    min_ndvi: number;
    ndvi_std_dev: number;
    growing_season_months: GrowingSeasonMonth[];
}

export interface YieldForecast {
    forecasted_yield: number;
    unit: string;
    confidence_score: number;
    calculation_factors: CalculationFactors;
    formula: string;
    ndvi_indicators: NDVIIndicators;
    season: string;
    comparison_to_industry_average: ComparisonToIndustryAverage;
    sensitivity_analysis: SensitivityAnalysis;
}

export interface RiskCategory {
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
    monitoring_indicators: string[];
}

export interface RiskAssessment {
    overall: {
        score: number;
        level: string;
        probability: string;
        primary_risks: RiskCategory[];
    };
    detailed_risks: DetailedRisk[];
    mitigation_priorities: string[];
    early_warning_indicators: string[];
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

export interface MetricSummaryItem {
    name: string;
    current_value: number;
    unit: string;
    trend: string;
}

export interface CategorySummary {
    total_metrics: number;
    total_usage?: number;
    total_consumption?: number;
    total_emissions?: number;
    total_waste?: number;
    efficiency_trend: string;
    intensity_trend?: string;
    recycling_rate?: number;
    key_metrics: MetricSummaryItem[];
}

export interface EnvironmentalMetrics {
    all_metrics: Record<string, EnvironmentalMetric>;
    categorized_metrics: {
        water: Record<string, EnvironmentalMetric>;
        energy: Record<string, EnvironmentalMetric>;
        emissions: Record<string, EnvironmentalMetric>;
        waste: Record<string, EnvironmentalMetric>;
        soil_land: Record<string, EnvironmentalMetric>;
        biodiversity: Record<string, EnvironmentalMetric>;
        other: Record<string, EnvironmentalMetric>;
    };
    summary: {
        water: CategorySummary;
        energy: CategorySummary;
        emissions: CategorySummary;
        waste: CategorySummary;
        overall: {
            total_metrics: number;
            data_coverage: number;
            completeness_score: number;
        };
    };
    key_performance_indicators: {
        water_use_efficiency: {
            value: number;
            unit: string;
            benchmark: number;
            status: string;
        };
        energy_productivity: {
            value: number;
            unit: string;
            benchmark: number;
            status: string;
        };
        carbon_intensity: {
            value: number;
            unit: string;
            benchmark: number;
            status: string;
        };
        soil_health_index: {
            value: number;
            unit: string;
            benchmark: number;
            status: string;
        };
    };
}

export interface CarbonEmissionFramework {
    sequestration_methodology: string;
    emission_methodology: string;
    calculation_approach: string;
    data_sources: string[];
}

export interface CarbonEmissionSummary {
    period: {
        start_year: number;
        end_year: number;
        years_count: number;
    };
    totals: {
        total_sequestration_tco2: number;
        total_emissions_tco2e: number;
        net_carbon_balance: number;
        average_area_ha: number;
    };
    averages: {
        annual_sequestration: number;
        annual_emissions: number;
        carbon_intensity: number;
        sequestration_rate: number;
    };
    trends: {
        sequestration_trend: number;
        emission_trend: number;
        sequestration_direction: string;
        emission_direction: string;
    };
    composition: {
        scope1_percentage: number;
        scope2_percentage: number;
        scope3_percentage: number;
        soc_sequestration_percentage: number;
    };
}

export interface MonthlyCarbonData {
    month: string;
    month_number: number;
    ndvi_max: number;
    soc_tc_per_ha: number;
    soc_co2_t_per_ha: number;
    delta_soc_co2_t: number;
    agb_t_per_ha: number;
    biomass_co2_total_t: number;
    meaning: string;
}

export interface VegetationSummary {
    average_ndvi: number;
    max_ndvi: number;
    min_ndvi: number;
    ndvi_std_dev: number;
    growing_season_months: GrowingSeasonMonth[];
}

export interface SOCSummary {
    average_soc: number;
    soc_change: number;
    sequestration_rate: number;
}

export interface BiomassSummary {
    average_biomass: number;
    peak_biomass_month: string;
    total_biomass_co2: number;
}

export interface AnnualSummary {
    total_biomass_co2_t: number;
    total_soc_co2_t: number;
    net_co2_stock_t: number;
    net_co2_change_t: number;
    sequestration_total_tco2: number;
}

export interface EmissionSource {
    source: string;
    parameter: string;
    unit: string;
    annual_per_ha: number;
    emission_factor: string;
    tco2e_per_ha_per_year: number;
    total_tco2e: number;
}

export interface EmissionCategory {
    category: string;
    parameter: string;
    unit: string;
    annual_activity_per_ha: number;
    emission_factor: string;
    tco2e_per_ha_per_year: number;
    total_tco2e: number;
}

export interface ScopeData {
    total_tco2e: number;
    total_tco2e_per_ha: number;
    sources?: EmissionSource[];
    categories?: EmissionCategory[];
}

export interface IntensityMetrics {
    scope1_intensity: number;
    scope2_intensity: number;
    scope3_intensity: number;
    total_intensity: number;
}

export interface DataQuality {
    completeness_score: number;
    verification_status: string;
}

export interface YearlyCarbonData {
    year: number;
    sequestration: {
        reporting_area_ha: number;
        soc_area_ha: number;
        monthly_data: MonthlyCarbonData[];
        vegetation_summary: VegetationSummary;
        soc_summary: SOCSummary;
        biomass_summary: BiomassSummary;
        annual_summary: AnnualSummary;
    };
    emissions: {
        scope1: ScopeData;
        scope2: ScopeData;
        scope3: ScopeData;
        totals: {
            total_scope_emission_tco2e: number;
            total_scope_emission_tco2e_per_ha: number;
            net_total_emission_tco2e: number;
        };
        intensity_metrics: IntensityMetrics;
    };
    data_quality: DataQuality;
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

export interface CarbonEmissionAccounting {
    framework: CarbonEmissionFramework;
    methodology: string;
    summary: CarbonEmissionSummary;
    yearly_data: YearlyCarbonData[];
    emission_factors: EmissionFactor[];
    global_warming_potentials: GlobalWarmingPotentials;
    conversion_factors: ConversionFactors;
}

export interface DataCoverage {
    months_with_data: number;
    growing_season_coverage: number;
    spatial_resolution: string;
    temporal_resolution: string;
    cloud_cover: string;
}

export interface SatelliteIndicators {
    ndvi_summary: VegetationSummary;
    soc_summary: SOCSummary;
    biomass_summary: BiomassSummary;
    data_coverage: DataCoverage;
}

export interface GraphDataset {
    label: string;
    data: number[] | { x: number; y: number; r: number }[];
    borderColor?: string;
    backgroundColor?: string | string[];
    fill?: boolean;
    tension?: number;
    borderDash?: number[];
    pointBackgroundColor?: string;
    borderWidth?: number;
}

export interface GraphOptions {
    scales?: {
        x?: {
            title?: {
                display: boolean;
                text: string;
            };
        };
        y?: {
            title?: {
                display: boolean;
                text: string;
            };
        };
    };
}

export interface Graph {
    type: string;
    title: string;
    description: string;
    labels: string[] | number[];
    datasets: GraphDataset[];
    options?: GraphOptions;
}

// FIXED: Updated to match both API responses
export interface Graphs {
    yield_trend?: Graph; // Only in 2025 response
    risk_distribution: Graph;
    ndvi_trend: Graph;
    soc_trend: Graph;
    biomass_accumulation: Graph;
    emissions_breakdown: Graph;
    yield_risk_correlation: Graph;
    forecast_confidence: Graph;
}

export interface SeasonalAdvisory {
    current_season: string;
    next_season: string;
    recommended_actions: string[];
    upcoming_risks: string[];
    planting_schedule: {
        primary_crop: string;
        planting_window: string;
        optimal_planting: string;
        duration: string;
        rotation: string;
    };
    harvest_window: {
        harvest_season: string;
        peak_harvest: string;
        expected_yield_period: string;
        post_harvest: string;
    };
}

export interface Summary {
    outlook: string;
    key_strengths: string[];
    key_concerns: string[];
    opportunities: string[];
    data_gaps: string[];
    next_steps: string[];
}

/**
 * =====================
 * Main Response Interface
 * =====================
 */

export interface CropYieldForecastResponse {
    message: string;
    api: string;
    data: {
        metadata: Metadata;
        company: CompanyInfo;
        reporting_period: ReportingPeriod;
        confidence_score: ConfidenceScore;
        yield_forecast: YieldForecast;
        risk_assessment: RiskAssessment;
        environmental_metrics: EnvironmentalMetrics;
        carbon_emission_accounting: CarbonEmissionAccounting;
        satellite_indicators: SatelliteIndicators;
        graphs: Graphs;
        recommendations: any[];
        seasonal_advisory: SeasonalAdvisory;
        summary: Summary;
    };
}

/**
 * =====================
 * Request Parameters
 * =====================
 */

export interface CropYieldForecastParams {
    companyId: string;
    year?: number; // Optional year parameter
}

/**
 * =====================
 * Crop Yield Service
 * =====================
 */

/**
 * Get crop yield forecast data for a company
 */
export const getCropYieldForecastData = async (
    params: CropYieldForecastParams
): Promise<CropYieldForecastResponse> => {
    try {
        const { companyId, year } = params;

        // Build query parameters
        const queryParams = new URLSearchParams();
        if (year !== undefined) {
            queryParams.append('year', year.toString());
        }

        const queryString = queryParams.toString();
        const url = `/esg-dashboard/crop-yield-forecast/${companyId}${queryString ? `?${queryString}` : ''}`;

        const { data } = await api.get<CropYieldForecastResponse>(url);
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
                throw new Error("Crop yield forecast data not found for the specified company.");
            case 422:
                throw new Error(errorMessage || "Invalid year parameter or data format.");
            case 500:
                throw new Error("Server error occurred while fetching crop yield forecast data.");
            case 503:
                throw new Error("Crop yield forecast service is temporarily unavailable.");
            default:
                throw new Error(
                    errorMessage ||
                    error.response?.data?.detail ||
                    "Failed to fetch crop yield forecast data"
                );
        }
    }
};

/**
 * Get available years for crop yield forecast data
 */
export const getAvailableCropYieldYears = (data: CropYieldForecastResponse): number[] => {
    return data.data.reporting_period.data_available_years || [];
};

/**
 * Get satellite data years for crop yield forecast
 */
export const getSatelliteDataYears = (data: CropYieldForecastResponse): number[] => {
    return data.data.reporting_period.satellite_data_years || [];
};

/**
 * Get yield forecast summary
 */
export const getYieldForecastSummary = (data: CropYieldForecastResponse) => {
    const forecast = data.data.yield_forecast;
    return {
        forecastedYield: forecast.forecasted_yield,
        unit: forecast.unit,
        confidenceScore: forecast.confidence_score,
        season: forecast.season,
        comparison: forecast.comparison_to_industry_average,
        sensitivityAnalysis: forecast.sensitivity_analysis
    };
};

/**
 * Get risk assessment summary
 */
export const getRiskAssessmentSummary = (data: CropYieldForecastResponse) => {
    const risk = data.data.risk_assessment;
    return {
        overallScore: risk.overall.score,
        riskLevel: risk.overall.level,
        probability: risk.overall.probability,
        primaryRisks: risk.overall.primary_risks,
        mitigationPriorities: risk.mitigation_priorities,
        detailedRisks: risk.detailed_risks
    };
};

/**
 * Get environmental metrics summary
 */
export const getEnvironmentalMetricsSummary = (data: CropYieldForecastResponse) => {
    const metrics = data.data.environmental_metrics;
    return {
        water: metrics.summary.water,
        energy: metrics.summary.energy,
        emissions: metrics.summary.emissions,
        waste: metrics.summary.waste,
        keyPerformanceIndicators: metrics.key_performance_indicators
    };
};

/**
 * Get carbon emission accounting data
 */
export const getCarbonEmissionData = (data: CropYieldForecastResponse) => {
    return data.data.carbon_emission_accounting;
};

/**
 * Get satellite indicators summary
 */
export const getSatelliteIndicators = (data: CropYieldForecastResponse) => {
    return data.data.satellite_indicators;
};

/**
 * Get graph data for visualization
 */
export const getGraphData = (data: CropYieldForecastResponse, graphType: string): Graph | undefined => {
    const graphs = data.data.graphs;

    switch (graphType) {
        case 'yield_trend':
            return graphs.yield_trend;
        case 'risk_distribution':
            return graphs.risk_distribution;
        case 'ndvi_trend':
            return graphs.ndvi_trend;
        case 'soc_trend':
            return graphs.soc_trend;
        case 'biomass_accumulation':
            return graphs.biomass_accumulation;
        case 'emissions_breakdown':
            return graphs.emissions_breakdown;
        case 'yield_risk_correlation':
            return graphs.yield_risk_correlation;
        case 'forecast_confidence':
            return graphs.forecast_confidence;
        default:
            return graphs.risk_distribution; // Default to risk distribution
    }
};

/**
 * Get all graph data
 */
export const getAllGraphData = (data: CropYieldForecastResponse): Graphs => {
    return data.data.graphs;
};

/**
 * Get confidence score breakdown
 */
export const getConfidenceScoreBreakdown = (data: CropYieldForecastResponse) => {
    return data.data.confidence_score;
};

/**
 * Get seasonal advisory
 */
export const getSeasonalAdvisory = (data: CropYieldForecastResponse) => {
    return data.data.seasonal_advisory;
};

/**
 * Get summary information
 */
export const getSummary = (data: CropYieldForecastResponse) => {
    return data.data.summary;
};

/**
 * Get metadata information
 */
export const getMetadata = (data: CropYieldForecastResponse) => {
    return data.data.metadata;
};

/**
 * Get company information
 */
export const getCompanyInfo = (data: CropYieldForecastResponse) => {
    return data.data.company;
};

/**
 * Get NDVI indicators
 */
export const getNDVIIndicators = (data: CropYieldForecastResponse) => {
    return data.data.yield_forecast.ndvi_indicators;
};

/**
 * Get calculation factors
 */
export const getCalculationFactors = (data: CropYieldForecastResponse) => {
    return data.data.yield_forecast.calculation_factors;
};

/**
 * Get monthly carbon data
 */
export const getMonthlyCarbonData = (data: CropYieldForecastResponse): MonthlyCarbonData[] => {
    const yearlyData = data.data.carbon_emission_accounting.yearly_data;
    return yearlyData.length > 0 ? yearlyData[0].sequestration.monthly_data : [];
};

/**
 * Get environmental metrics by category
 */
export const getMetricsByCategory = (data: CropYieldForecastResponse, category: string): Record<string, EnvironmentalMetric> => {
    const categories = data.data.environmental_metrics.categorized_metrics;
    switch (category) {
        case 'water':
            return categories.water;
        case 'energy':
            return categories.energy;
        case 'emissions':
            return categories.emissions;
        case 'waste':
            return categories.waste;
        case 'soil_land':
            return categories.soil_land;
        case 'biodiversity':
            return categories.biodiversity;
        case 'other':
            return categories.other;
        default:
            return {};
    }
};

/**
 * Get all environmental metrics
 */
export const getAllEnvironmentalMetrics = (data: CropYieldForecastResponse): Record<string, EnvironmentalMetric> => {
    return data.data.environmental_metrics.all_metrics;
};

/**
 * Get recommendations (empty array in current response)
 */
export const getRecommendations = (data: CropYieldForecastResponse) => {
    return data.data.recommendations;
};

/**
 * Get reporting period information
 */
export const getReportingPeriod = (data: CropYieldForecastResponse) => {
    return data.data.reporting_period;
};