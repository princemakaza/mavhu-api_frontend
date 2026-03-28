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

export interface CompanyMetadata {
    has_area_of_interest: boolean;
    data_range_parsed: any[];
    data_start_year: number | null;
    data_end_year: number | null;
    has_esg_contact: boolean;
}

export interface Company {
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
    metadata: CompanyMetadata;
    area_of_interest_formatted: null;
}

export interface Metadata {
    api_version: string;
    calculation_version: string;
    gee_adapter_version: string;
    generated_at: string;
    endpoint: string;
    company_id: string;
    year_requested: number;
    year_used_for_current_values: number;
    trend_period: string;
    data_sources: string[];
    calculation_methods: string[];
}

export interface ReportingPeriod {
    start_year: number;
    end_year: number;
    current_year: number;
    data_available_years: number[];
    carbon_data_years: number[];
    esg_data_years: number[];
    note: string;
}

export interface ConfidenceScoreBreakdown {
    data_completeness: number;
    verification_status: number;
    temporal_coverage: number;
    methodological_rigor: number;
    monthly_data_availability: number;
}

export interface ConfidenceScore {
    overall: number;
    breakdown: ConfidenceScoreBreakdown;
    interpretation: string;
}

export interface SoilOrganicCarbonQuantification {
    current_value: number;
    unit: string;
    trend: string;
    trend_period: string;
    annual_change_percent: number | null;
    confidence: string;
    calculation_method: string;
    monthly_data_available: boolean;
    monthly_variation: number;
    interpretation: string;
}

export interface CarbonPermanenceAssessment {
    permanence_score: number | null;
    permanence_rating: string;
    risk_level: string;
    factors: string[];
    variance: number | null;
    trend: string;
    interpretation: string;
}

export interface SoilHealthTrends {
    soc_trend: string;
    carbon_stock_trend: string;
    sequestration_trend: string;
    vegetation_trend: string;
    emissions_trend: string;
    overall_trend: string;
    monitoring_period: string;
    trend_calculation_method: string;
    note: string;
}

export interface CarbonStockAnalysis {
    total_carbon_stock: number;
    unit: string;
    trend: string;
    sequestration_rate: number;
    sequestration_unit: string;
    annual_sequestration_total: number;
    net_balance: number;
    monthly_data_available: boolean;
}

export interface VegetationHealth {
    average_ndvi: number;
    ndvi_trend: string;
    classification: string;
    interpretation: string;
    monthly_data_available: boolean;
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

export interface CarbonEmissionFramework {
    sequestration_methodology: string;
    emission_methodology: string;
    calculation_approach: string;
    data_sources: string[];
}

export interface CalculatedSoc {
    average_tc_per_ha: number;
    min_tc_per_ha: number;
    max_tc_per_ha: number;
    month_count: number;
}

export interface CalculatedSequestration {
    total_delta_co2_t: number;
    average_monthly_delta_co2_t: number;
    sequestration_rate_tco2_per_ha_per_year: number | null;
}

export interface VegetationIndicators {
    average_ndvi: number;
    max_ndvi: number;
    min_ndvi: number;
    ndvi_variance: number;
}

export interface CarbonStockIndicators {
    average_co2_per_ha: number;
    min_co2_per_ha: number;
    max_co2_per_ha: number;
    month_count: number;
}

export interface SequestrationData {
    reporting_area_ha: number;
    soc_area_ha: number;
    monthly_data_count: number;
    annual_total_tco2: number;
    calculated_soc: CalculatedSoc;
    calculated_sequestration: CalculatedSequestration;
    vegetation_indicators: VegetationIndicators;
    carbon_stock_indicators: CarbonStockIndicators;
}

export interface EmissionsData {
    scope1_sources: number;
    scope1_total_tco2e: number;
    scope2_sources: number;
    scope2_total_tco2e: number;
    scope3_categories: number;
    scope3_total_tco2e: number;
    total_emissions_tco2e: number;
}

export interface DataQuality {
    completeness_score: number;
    verification_status: string;
}

export interface YearlyDataSummary {
    year: number;
    sequestration: SequestrationData;
    emissions: EmissionsData;
    data_quality: DataQuality;
}

export interface AreaCoverage {
    soc_area_ha: number;
}

export interface MonthlyData {
    month: string;
    month_number: number;
    ndvi_max: number;
    soc_tc_per_ha: number;
    soc_co2_t_per_ha: number;
    delta_soc_co2_t: number;
    biomass_c_t_per_ha: number;
    biomass_co2_t_per_ha: number;
    meaning: string;
}

export interface CarbonEmissionSummary {
    net_carbon_balance_tco2e: number;
}

export interface CarbonEmissionAccounting {
    framework: CarbonEmissionFramework;
    summary: CarbonEmissionSummary;
    methodology: string;
    emission_factors: EmissionFactor[];
    global_warming_potentials: GlobalWarmingPotentials;
    conversion_factors: ConversionFactors;
    yearly_data_summary: YearlyDataSummary[];
    area_coverage: AreaCoverage;
    detailed_monthly_data: MonthlyData[] | null;
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
    current_value: number;
    trend: string;
    years_available: number[];
    values: EnvironmentalMetricValue[];
}

export interface MetricsByCategory {
    climate_change: number;
    resource_use: number;
    biodiversity: number;
}

export interface EnvironmentalMetricsSummary {
    total_ghg_emissions: number | null;
    scope1_emissions: number | null;
    scope2_emissions: number | null;
    scope3_emissions: number | null;
    water_usage: number | null;
    energy_consumption: number | null;
    waste_generated: number | null;
}

export interface EnvironmentalMetrics {
    total_metrics: number;
    metrics_by_category: MetricsByCategory;
    detailed_metrics: EnvironmentalMetric[];
    summary: EnvironmentalMetricsSummary;
}

export interface EsgMetricCategory {
    count: number;
    metrics: string[];
}

export interface AllEsgMetrics {
    environmental: EsgMetricCategory;
    social: EsgMetricCategory;
    governance: EsgMetricCategory;
}

export interface GraphDataset {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string | string[] | number[] | any;
    fill?: boolean;
    tension?: number;
    stack?: string;
    borderWidth?: number;
}

export interface Graph {
    type: string;
    title: string;
    description: string;
    labels: string[] | number[];
    datasets: GraphDataset[];
    interpretation?: string;
    data_period?: string;
    note?: string;
}

export interface YearlyPrediction {
    year: number;
    sequestration_rate_tco2_per_ha: number;
    total_sequestration_tco2: number;
    carbon_credits: number;
    credit_value_usd: number;
    confidence: string;
    assumptions: string[];
}

export interface EligibilityCriteria {
    minimum_permanence: boolean;
    minimum_monitoring: boolean;
    verification_status: boolean;
    positive_sequestration: boolean;
}

export interface CarbonCreditPredictions {
    eligible: boolean;
    methodology: string;
    baseline_year: number;
    baseline_rate_tco2_per_ha: number;
    annual_growth_rate_percent: number;
    total_potential_credits: number;
    total_potential_value_usd: number;
    yearly_predictions: YearlyPrediction[];
    eligibility_status: EligibilityCriteria;
    credit_standards_applicable: string[];
}

export interface SoilDegradationMonitoring {
    degradation_status: string;
    regeneration_status: string;
    risk_factors: string[];
    improvement_opportunities: string[];
    degradation_score: number;
    regeneration_potential: number;
}

export interface RegenerativeAgricultureOutcomes {
    soil_health_score: number;
    soil_health_trend: string;
    carbon_sequestration_potential: number;
    permanence_score: number | null;
    vegetation_health_score: number | null;
    verification_status: string;
}

export interface Recommendation {
    category: string;
    actions: string[];
    expected_impact: string;
    priority: string;
}

export interface DataQualityAssessment {
    confidence_level: string;
    gaps_identified: string[];
    improvement_suggestions: string[];
}

export interface CarbonCreditReadiness {
    status: string;
    requirements_met: number;
    total_requirements: number;
    time_to_credits: string;
    estimated_annual_revenue: string;
}

export interface SummaryKeyIndicators {
    soil_organic_carbon: number;
    carbon_stock: number;
    net_carbon_balance: number;
    vegetation_health: number;
    sequestration_rate: number;
    permanence_rating: string;
}

export interface SummaryTrends {
    soil_health: string;
    carbon_stock: string;
    emissions: string;
    sequestration: string;
    vegetation: string;
    degradation: string;
    regeneration: string;
}

export interface Summary {
    key_indicators: SummaryKeyIndicators;
    trends: SummaryTrends;
    recommendations: Recommendation[];
    data_quality_assessment: DataQualityAssessment;
    carbon_credit_readiness: CarbonCreditReadiness;
}

export interface Graphs {
    soc_trend: Graph;
    carbon_balance: Graph;
    emissions_breakdown: Graph;
    monthly_soc: Graph;
    ndvi_trend: Graph;
    [key: string]: Graph;
}

/**
 * =====================
 * Main Response Interface
 * =====================
 */

export interface SoilHealthCarbonResponse {
    message: string;
    api: string;
    data: {
        metadata: Metadata;
        company: Company;
        reporting_period: ReportingPeriod;
        confidence_score: ConfidenceScore;
        soil_organic_carbon_quantification: SoilOrganicCarbonQuantification;
        carbon_permanence_assessment: CarbonPermanenceAssessment;
        soil_health_trends: SoilHealthTrends;
        carbon_stock_analysis: CarbonStockAnalysis;
        vegetation_health: VegetationHealth;
        carbon_emission_accounting: CarbonEmissionAccounting;
        environmental_metrics: EnvironmentalMetrics;
        all_esg_metrics: AllEsgMetrics;
        graphs: Graphs;
        regenerative_agriculture_outcomes: RegenerativeAgricultureOutcomes;
        carbon_credit_predictions: CarbonCreditPredictions;
        soil_degradation_monitoring: SoilDegradationMonitoring;
        summary: Summary;
    };
}

/**
 * =====================
 * Request Parameters
 * =====================
 */

export interface SoilHealthCarbonParams {
    companyId: string;
    year?: number;
}

/**
 * =====================
 * Soil Health Service
 * =====================
 */

/**
 * Get soil health and carbon quality data for a company
 */
export const getSoilHealthCarbonData = async (
    params: SoilHealthCarbonParams
): Promise<SoilHealthCarbonResponse> => {
    try {
        const { companyId, year } = params;

        const queryParams = new URLSearchParams();
        if (year !== undefined) {
            queryParams.append('year', year.toString());
        }

        const queryString = queryParams.toString();
        const url = `/esg-dashboard/soil-health-carbon/${companyId}${queryString ? `?${queryString}` : ''}`;

        const { data } = await api.get<SoilHealthCarbonResponse>(url);
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
                throw new Error("Soil health data not found for the specified company.");
            case 422:
                throw new Error(errorMessage || "Invalid year parameter or data format.");
            case 500:
                throw new Error("Server error occurred while fetching soil health data.");
            case 503:
                throw new Error("Soil health service is temporarily unavailable.");
            default:
                throw new Error(
                    errorMessage ||
                    error.response?.data?.detail ||
                    "Failed to fetch soil health and carbon quality data"
                );
        }
    }
};

/**
 * Get available years for soil health data
 */
export const getAvailableSoilHealthYears = (data: SoilHealthCarbonResponse): number[] => {
    return data.data.reporting_period.data_available_years || [];
};

/**
 * Get carbon data years for soil health data
 */
export const getCarbonDataYears = (data: SoilHealthCarbonResponse): number[] => {
    return data.data.reporting_period.carbon_data_years || [];
};

/**
 * Get ESG data years for soil health data
 */
export const getESGDataYears = (data: SoilHealthCarbonResponse): number[] => {
    return data.data.reporting_period.esg_data_years || [];
};

/**
 * Get current soil health status summary
 */
export const getSoilHealthSummary = (data: SoilHealthCarbonResponse) => {
    return {
        soilOrganicCarbon: data.data.soil_organic_carbon_quantification.current_value,
        carbonStock: data.data.carbon_stock_analysis.total_carbon_stock,
        netCarbonBalance: data.data.carbon_stock_analysis.net_balance,
        vegetationHealth: data.data.vegetation_health.average_ndvi,
        sequestrationRate: data.data.carbon_stock_analysis.sequestration_rate,
        permanenceRating: data.data.carbon_permanence_assessment.permanence_rating,
        confidenceScore: data.data.confidence_score.overall,
        trends: {
            soilHealth: data.data.soil_organic_carbon_quantification.trend,
            carbonStock: data.data.carbon_stock_analysis.trend,
            vegetation: data.data.vegetation_health.ndvi_trend,
            overall: data.data.soil_health_trends.overall_trend,
        }
    };
};

/**
 * Get soil organic carbon quantification details
 */
export const getSoilOrganicCarbonDetails = (data: SoilHealthCarbonResponse) => {
    return {
        ...data.data.soil_organic_carbon_quantification,
        monthlyVariationPercent: data.data.soil_organic_carbon_quantification.monthly_variation
            ? data.data.soil_organic_carbon_quantification.monthly_variation.toFixed(2)
            : null,
        annualChangePercent: data.data.soil_organic_carbon_quantification.annual_change_percent
            ? data.data.soil_organic_carbon_quantification.annual_change_percent.toFixed(2)
            : null,
        trendPeriod: data.data.soil_organic_carbon_quantification.trend_period,
    };
};

/**
 * Get carbon permanence assessment details
 */
export const getCarbonPermanenceDetails = (data: SoilHealthCarbonResponse) => {
    return {
        ...data.data.carbon_permanence_assessment,
        permanenceScoreFormatted: data.data.carbon_permanence_assessment.permanence_score
            ? `${data.data.carbon_permanence_assessment.permanence_score}/100`
            : "N/A",
        riskLevelColor: data.data.carbon_permanence_assessment.risk_level === "high"
            ? "error"
            : data.data.carbon_permanence_assessment.risk_level === "medium"
                ? "warning"
                : "success",
    };
};

/**
 * Get soil health trends summary
 */
export const getSoilHealthTrends = (data: SoilHealthCarbonResponse) => {
    return {
        ...data.data.soil_health_trends,
        trends: [
            { label: "SOC Trend", value: data.data.soil_health_trends.soc_trend },
            { label: "Carbon Stock Trend", value: data.data.soil_health_trends.carbon_stock_trend },
            { label: "Sequestration Trend", value: data.data.soil_health_trends.sequestration_trend },
            { label: "Vegetation Trend", value: data.data.soil_health_trends.vegetation_trend },
            { label: "Emissions Trend", value: data.data.soil_health_trends.emissions_trend },
        ],
        monitoringPeriod: data.data.soil_health_trends.monitoring_period,
        trendCalculationMethod: data.data.soil_health_trends.trend_calculation_method,
        note: data.data.soil_health_trends.note,
    };
};

/**
 * Get carbon stock analysis details
 */
export const getCarbonStockAnalysisDetails = (data: SoilHealthCarbonResponse) => {
    return {
        ...data.data.carbon_stock_analysis,
        sequestrationRateFormatted: data.data.carbon_stock_analysis.sequestration_rate
            ? data.data.carbon_stock_analysis.sequestration_rate.toFixed(2)
            : "0",
        annualSequestrationTotalFormatted: data.data.carbon_stock_analysis.annual_sequestration_total
            ? Math.round(data.data.carbon_stock_analysis.annual_sequestration_total).toLocaleString()
            : "0",
        netBalanceFormatted: data.data.carbon_stock_analysis.net_balance
            ? Math.round(data.data.carbon_stock_analysis.net_balance).toLocaleString()
            : "0",
        sequestrationUnit: data.data.carbon_stock_analysis.sequestration_unit,
    };
};

/**
 * Get vegetation health details
 */
export const getVegetationHealthDetails = (data: SoilHealthCarbonResponse) => {
    return {
        ...data.data.vegetation_health,
        averageNdviFormatted: data.data.vegetation_health.average_ndvi
            ? data.data.vegetation_health.average_ndvi.toFixed(3)
            : "0",
        ndviQuality: data.data.vegetation_health.classification,
        ndviTrend: data.data.vegetation_health.ndvi_trend,
        interpretation: data.data.vegetation_health.interpretation,
    };
};

/**
 * Get environmental metrics summary
 */
// Also update other functions to handle null data:
export const getEnvironmentalMetricsSummary = (data: SoilHealthCarbonResponse | null) => {
    if (!data || !data.data || !data.data.environmental_metrics) {
        return {
            totalMetrics: 0,
            metrics_by_category: {
                climate_change: 0,
                resource_use: 0,
                biodiversity: 0,
            },
            detailed_metrics: [],
            summary: {
                total_ghg_emissions: null,
                scope1_emissions: null,
                scope2_emissions: null,
                scope3_emissions: null,
                water_usage: null,
                energy_consumption: null,
                waste_generated: null,
            },
        };
    }
    
    const metrics = data.data.environmental_metrics;
    return {
        totalMetrics: metrics.total_metrics,
        metrics_by_category: metrics.metrics_by_category,
        detailed_metrics: metrics.detailed_metrics,
        summary: metrics.summary,
    };
};


/**
 * Get all ESG metrics summary
 */
// In soil_carbon_service.tsx, update the getAllESGMetricsSummary function:
export const getAllESGMetricsSummary = (data: SoilHealthCarbonResponse | null) => {
    if (!data || !data.data || !data.data.all_esg_metrics) {
        return {
            environmental: { count: 0, metrics: [] },
            social: { count: 0, metrics: [] },
            governance: { count: 0, metrics: [] },
            totalMetrics: 0,
        };
    }
    
    const allEsgMetrics = data.data.all_esg_metrics;
    return {
        ...allEsgMetrics,
        totalMetrics: (allEsgMetrics.environmental?.count || 0) +
            (allEsgMetrics.social?.count || 0) +
            (allEsgMetrics.governance?.count || 0),
    };
};


/**
 * Get carbon emission accounting details
 */
export const getCarbonEmissionDetails = (data: SoilHealthCarbonResponse) => {
    const yearlyData = data.data.carbon_emission_accounting.yearly_data_summary;
    const currentYearData = yearlyData.find(y => y.year === data.data.reporting_period.current_year);

    return {
        framework: data.data.carbon_emission_accounting.framework,
        summary: {
            ...data.data.carbon_emission_accounting.summary,
            netBalanceFormatted: data.data.carbon_emission_accounting.summary.net_carbon_balance_tco2e
                ? Math.round(data.data.carbon_emission_accounting.summary.net_carbon_balance_tco2e).toLocaleString()
                : "0",
        },
        methodology: data.data.carbon_emission_accounting.methodology,
        emissionFactors: data.data.carbon_emission_accounting.emission_factors,
        globalWarmingPotentials: data.data.carbon_emission_accounting.global_warming_potentials,
        conversionFactors: data.data.carbon_emission_accounting.conversion_factors,
        yearlyData: yearlyData.map(yearData => ({
            ...yearData,
            sequestration: {
                ...yearData.sequestration,
                annualTotalFormatted: yearData.sequestration.annual_total_tco2
                    ? Math.round(yearData.sequestration.annual_total_tco2).toLocaleString()
                    : "0",
                sequestrationRateFormatted: yearData.sequestration.calculated_sequestration.sequestration_rate_tco2_per_ha_per_year
                    ? yearData.sequestration.calculated_sequestration.sequestration_rate_tco2_per_ha_per_year.toFixed(2)
                    : "0",
                socAreaHaFormatted: yearData.sequestration.soc_area_ha.toLocaleString(),
            },
            emissions: {
                ...yearData.emissions,
                totalEmissionsFormatted: yearData.emissions.total_emissions_tco2e
                    ? Math.round(yearData.emissions.total_emissions_tco2e).toLocaleString()
                    : "0",
                scope1Formatted: yearData.emissions.scope1_total_tco2e.toLocaleString(),
                scope2Formatted: yearData.emissions.scope2_total_tco2e.toLocaleString(),
                scope3Formatted: yearData.emissions.scope3_total_tco2e.toLocaleString(),
            }
        })),
        currentYearData: currentYearData,
        areaCoverage: {
            ...data.data.carbon_emission_accounting.area_coverage,
            socAreaHaFormatted: data.data.carbon_emission_accounting.area_coverage.soc_area_ha.toLocaleString(),
        },
        monthlyDataAvailable: data.data.carbon_emission_accounting.detailed_monthly_data !== null,
        monthlyData: data.data.carbon_emission_accounting.detailed_monthly_data,
    };
};

/**
 * Get regenerative agriculture outcomes
 */
export const getRegenerativeAgricultureOutcomes = (data: SoilHealthCarbonResponse) => {
    const outcomes = data.data.regenerative_agriculture_outcomes;
    return {
        ...outcomes,
        soilHealthScoreFormatted: outcomes.soil_health_score ? `${Math.round(outcomes.soil_health_score)}/100` : "N/A",
        permanenceScoreFormatted: outcomes.permanence_score ? `${Math.round(outcomes.permanence_score)}/100` : "N/A",
        vegetationHealthScoreFormatted: outcomes.vegetation_health_score ? `${Math.round(outcomes.vegetation_health_score)}/100` : "N/A",
        sequestrationPotentialFormatted: outcomes.carbon_sequestration_potential
            ? Math.round(outcomes.carbon_sequestration_potential).toLocaleString()
            : "0",
        soilHealthTrend: outcomes.soil_health_trend,
        verificationStatus: outcomes.verification_status,
    };
};

/**
 * Get carbon credit predictions
 */
export const getCarbonCreditPredictions = (data: SoilHealthCarbonResponse) => {
    if (!data.data.carbon_credit_predictions) {
        return null;
    }

    const predictions = data.data.carbon_credit_predictions;
    
    return {
        ...predictions,
        eligibilityStatus: {
            ...predictions.eligibility_status,
            statusColor: predictions.eligible ? "success" : "error",
            requirementsMetPercent: predictions.eligibility_status ? 
                Math.round((Object.values(predictions.eligibility_status).filter(Boolean).length / Object.keys(predictions.eligibility_status).length) * 100)
                : 0,
        },
        yearlyPredictions: predictions.yearly_predictions.map(prediction => ({
            ...prediction,
            sequestrationRateFormatted: prediction.sequestration_rate_tco2_per_ha.toFixed(2),
            totalSequestrationFormatted: Math.round(prediction.total_sequestration_tco2).toLocaleString(),
            carbonCreditsFormatted: Math.round(prediction.carbon_credits).toLocaleString(),
            creditValueFormatted: `$${Math.round(prediction.credit_value_usd).toLocaleString()}`,
            confidenceColor: prediction.confidence === "high" ? "success" : prediction.confidence === "medium" ? "warning" : "error",
        })),
        totalPotentialValueFormatted: `$${Math.round(predictions.total_potential_value_usd).toLocaleString()}`,
        baselineRateFormatted: predictions.baseline_rate_tco2_per_ha.toFixed(2),
        annualGrowthRateFormatted: predictions.annual_growth_rate_percent.toFixed(2) + "%",
        totalPotentialCreditsFormatted: Math.round(predictions.total_potential_credits).toLocaleString(),
    };
};

/**
 * Get soil degradation monitoring details
 */
export const getSoilDegradationMonitoring = (data: SoilHealthCarbonResponse) => {
    const monitoring = data.data.soil_degradation_monitoring;
    return {
        ...monitoring,
        degradationStatusColor: monitoring.degradation_status === "high_risk" ? "error" :
            monitoring.degradation_status === "moderate_risk" ? "warning" : "success",
        regenerationStatusColor: monitoring.regeneration_status === "high" ? "success" :
            monitoring.regeneration_status === "medium" ? "warning" : "error",
        degradationScoreFormatted: `${monitoring.degradation_score}/100`,
        regenerationPotentialFormatted: `${monitoring.regeneration_potential}/100`,
        hasRiskFactors: monitoring.risk_factors.length > 0,
        hasImprovementOpportunities: monitoring.improvement_opportunities.length > 0,
    };
};

/**
 * Get recommendations for improvement
 */
export const getRecommendations = (data: SoilHealthCarbonResponse) => {
    return data.data.summary.recommendations.map(rec => ({
        ...rec,
        priorityColor: rec.priority === "High" ? "error" : rec.priority === "Medium" ? "warning" : "success",
    }));
};

/**
 * Get data quality assessment
 */
export const getDataQualityAssessment = (data: SoilHealthCarbonResponse) => {
    return {
        ...data.data.summary.data_quality_assessment,
        confidenceLevelColor: data.data.summary.data_quality_assessment.confidence_level === "High" ? "success" :
            data.data.summary.data_quality_assessment.confidence_level === "Medium" ? "warning" : "error",
        hasGaps: data.data.summary.data_quality_assessment.gaps_identified.length > 0,
        hasImprovementSuggestions: data.data.summary.data_quality_assessment.improvement_suggestions.length > 0,
    };
};

/**
 * Get carbon credit readiness
 */
export const getCarbonCreditReadiness = (data: SoilHealthCarbonResponse) => {
    const readiness = data.data.summary.carbon_credit_readiness;
    return {
        ...readiness,
        statusColor: readiness.status === "Ready" ? "success" : "warning",
        requirementsMetPercent: readiness.total_requirements > 0
            ? Math.round((readiness.requirements_met / readiness.total_requirements) * 100)
            : 0,
        progressColor: readiness.requirements_met >= readiness.total_requirements ? "success" :
            readiness.requirements_met >= readiness.total_requirements * 0.7 ? "warning" : "error",
    };
};

/**
 * Get graph data for visualization
 */
export const getGraphData = (data: SoilHealthCarbonResponse, graphType: string): Graph | null => {
    const graphs = data.data.graphs;
    return graphs[graphType] || null;
};

/**
 * Get all graph data
 */
export const getAllGraphData = (data: SoilHealthCarbonResponse): Graphs => {
    return data.data.graphs;
};

/**
 * Get available graph types
 */
export const getAvailableGraphTypes = (data: SoilHealthCarbonResponse): string[] => {
    return Object.keys(data.data.graphs);
};

/**
 * Get confidence score breakdown
 */
export const getConfidenceScoreBreakdown = (data: SoilHealthCarbonResponse) => {
    return {
        ...data.data.confidence_score,
        overallFormatted: `0/100`,
        breakdown: Object.entries(data.data.confidence_score.breakdown).map(([key, value]) => ({
            label: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            value: value,
            formatted: `0/100`,
        }))
    };
};

/**
 * Get metadata information
 */
export const getMetadata = (data: SoilHealthCarbonResponse) => {
    return {
        ...data.data.metadata,
        generatedAtFormatted: new Date(data.data.metadata.generated_at).toLocaleString(),
        dataSourcesCount: data.data.metadata.data_sources.length,
        calculationMethodsCount: data.data.metadata.calculation_methods.length,
        yearRequested: data.data.metadata.year_requested,
        yearUsedForCurrentValues: data.data.metadata.year_used_for_current_values,
        trendPeriod: data.data.metadata.trend_period,
    };
};

/**
 * Get company details
 */
export const getCompanyDetails = (data: SoilHealthCarbonResponse) => {
    return {
        ...data.data.company,
        areaOfInterest: data.data.company.area_of_interest_metadata,
        esgContact: data.data.company.esg_contact_person,
        reportingFrameworks: data.data.company.esg_reporting_framework,
        dataRange: data.data.company.data_range,
        metadata: data.data.company.metadata,
    };
};

/**
 * Get reporting period details
 */
export const getReportingPeriodDetails = (data: SoilHealthCarbonResponse) => {
    return {
        ...data.data.reporting_period,
        periodFormatted: `${data.data.reporting_period.start_year} - ${data.data.reporting_period.end_year}`,
        yearsCount: data.data.reporting_period.data_available_years.length,
        carbonDataYearsCount: data.data.reporting_period.carbon_data_years.length,
        esgDataYearsCount: data.data.reporting_period.esg_data_years.length,
        note: data.data.reporting_period.note,
    };
};

/**
 * Get key indicators for dashboard
 */
export const getDashboardIndicators = (data: SoilHealthCarbonResponse) => {
    const indicators = data.data.summary.key_indicators;
    return {
        soilHealth: {
            value: indicators.soil_organic_carbon,
            unit: "tC/ha",
            trend: data.data.summary.trends.soil_health,
            status: indicators.soil_organic_carbon > 30 ? "Excellent" :
                indicators.soil_organic_carbon > 20 ? "Good" :
                    indicators.soil_organic_carbon > 10 ? "Fair" : "Poor",
        },
        carbonStock: {
            value: indicators.carbon_stock,
            unit: "tCO2/ha",
            trend: data.data.summary.trends.carbon_stock,
        },
        sequestration: {
            value: indicators.sequestration_rate,
            unit: "tCO2/ha/year",
            trend: data.data.summary.trends.sequestration,
        },
        vegetationHealth: {
            value: indicators.vegetation_health,
            trend: data.data.summary.trends.vegetation,
            classification: data.data.vegetation_health.classification,
        },
        carbonBalance: {
            value: indicators.net_carbon_balance,
            unit: "tCO₂e",
            status: indicators.net_carbon_balance > 0 ? "Source" : "Sink",
        },
        confidenceScore: {
            value: data.data.confidence_score.overall,
            interpretation: data.data.confidence_score.interpretation,
        },
        permanenceRating: indicators.permanence_rating,
    };
};

/**
 * Get emission factors by category
 */
export const getEmissionFactorsByCategory = (data: SoilHealthCarbonResponse) => {
    const emissionFactors = data.data.carbon_emission_accounting.emission_factors;

    return {
        all: emissionFactors,
        bySource: emissionFactors.reduce((acc, factor) => {
            const category = factor.source.split(' ')[0];
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(factor);
            return acc;
        }, {} as Record<string, typeof emissionFactors>),
        count: emissionFactors.length,
    };
};

/**
 * Get yearly data comparison
 */
export const getYearlyDataComparison = (data: SoilHealthCarbonResponse) => {
    const yearlyData = data.data.carbon_emission_accounting.yearly_data_summary;

    return yearlyData.map(yearData => ({
        year: yearData.year,
        sequestration: yearData.sequestration.annual_total_tco2,
        emissions: yearData.emissions.total_emissions_tco2e,
        netBalance: yearData.sequestration.annual_total_tco2 - yearData.emissions.total_emissions_tco2e,
        soc: yearData.sequestration.calculated_soc.average_tc_per_ha,
        ndvi: yearData.sequestration.vegetation_indicators.average_ndvi,
        verificationStatus: yearData.data_quality.verification_status,
    }));
};

/**
 * Get environmental metric by name
 */
export const getEnvironmentalMetricByName = (data: SoilHealthCarbonResponse, metricName: string) => {
    return data.data.environmental_metrics.detailed_metrics.find(metric => metric.name === metricName);
};

/**
 * Get metrics trend analysis
 */
export const getMetricsTrendAnalysis = (data: SoilHealthCarbonResponse) => {
    const metrics = data.data.environmental_metrics.detailed_metrics;

    return {
        improving: metrics.filter(m => m.trend === "improving").length,
        declining: metrics.filter(m => m.trend === "declining").length,
        stable: metrics.filter(m => m.trend === "stable").length,
        total: metrics.length,
        improvementRate: metrics.length > 0 ? metrics.filter(m => m.trend === "improving").length / metrics.length * 100 : 0,
    };
};

/**
 * Check if data has monthly details
 */
export const hasMonthlyData = (data: SoilHealthCarbonResponse): boolean => {
    return data.data.carbon_emission_accounting.detailed_monthly_data !== null &&
        data.data.carbon_emission_accounting.detailed_monthly_data.length > 0;
};

/**
 * Check if data is verified
 */
export const isDataVerified = (data: SoilHealthCarbonResponse): boolean => {
    return data.data.carbon_emission_accounting.yearly_data_summary.some(
        yearData => yearData.data_quality.verification_status === "verified"
    );
};

/**
 * Get verification status summary
 */
export const getVerificationStatus = (data: SoilHealthCarbonResponse) => {
    const yearlyData = data.data.carbon_emission_accounting.yearly_data_summary;
    const verifiedYears = yearlyData.filter(y => y.data_quality.verification_status === "verified").length;

    return {
        totalYears: yearlyData.length,
        verifiedYears,
        verificationRate: yearlyData.length > 0 ? (verifiedYears / yearlyData.length) * 100 : 0,
        status: verifiedYears === yearlyData.length ? "Fully Verified" :
            verifiedYears > 0 ? "Partially Verified" : "Not Verified",
    };
};

/**
 * Get summary of all trends
 */
export const getAllTrends = (data: SoilHealthCarbonResponse) => {
    return {
        ...data.data.summary.trends,
        socTrend: data.data.soil_organic_carbon_quantification.trend,
        ndviTrend: data.data.vegetation_health.ndvi_trend,
        sequestrationTrend: data.data.soil_health_trends.sequestration_trend,
        emissionsTrend: data.data.soil_health_trends.emissions_trend,
        carbonStockTrend: data.data.soil_health_trends.carbon_stock_trend,
    };
};

/**
 * Get carbon credit eligibility details
 */
export const getCarbonCreditEligibility = (data: SoilHealthCarbonResponse) => {
    const predictions = data.data.carbon_credit_predictions;
    if (!predictions) return null;

    return {
        isEligible: predictions.eligible,
        eligibilityStatus: predictions.eligibility_status,
        creditStandards: predictions.credit_standards_applicable,
        totalPotentialValue: predictions.total_potential_value_usd,
        yearlyPredictions: predictions.yearly_predictions,
        methodology: predictions.methodology,
    };
};

export default {
    getSoilHealthCarbonData,
    getAvailableSoilHealthYears,
    getCarbonDataYears,
    getESGDataYears,
    getSoilHealthSummary,
    getSoilOrganicCarbonDetails,
    getCarbonPermanenceDetails,
    getSoilHealthTrends,
    getCarbonStockAnalysisDetails,
    getVegetationHealthDetails,
    getEnvironmentalMetricsSummary,
    getAllESGMetricsSummary,
    getCarbonEmissionDetails,
    getRegenerativeAgricultureOutcomes,
    getCarbonCreditPredictions,
    getSoilDegradationMonitoring,
    getRecommendations,
    getDataQualityAssessment,
    getCarbonCreditReadiness,
    getGraphData,
    getAllGraphData,
    getAvailableGraphTypes,
    getConfidenceScoreBreakdown,
    getMetadata,
    getCompanyDetails,
    getReportingPeriodDetails,
    getDashboardIndicators,
    getEmissionFactorsByCategory,
    getYearlyDataComparison,
    getEnvironmentalMetricByName,
    getMetricsTrendAnalysis,
    hasMonthlyData,
    isDataVerified,
    getVerificationStatus,
    getAllTrends,
    getCarbonCreditEligibility,
};