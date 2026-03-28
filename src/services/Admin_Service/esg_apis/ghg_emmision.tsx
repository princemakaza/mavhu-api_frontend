// File: services/ghgEmissionsService.ts
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
    year: number;
    data_sources: string[];
}

export interface MetricValue {
    year: number;
    value: string;
    numeric_value: number;
    source_notes: string;
    added_by: string;
    added_at: string;
    last_updated_at: string;
    last_updated_by?: string;
}

export interface EnvironmentalMetric {
    id: string;
    name: string;
    category: string;
    unit: string;
    description: string;
    values: MetricValue[];
    is_active: boolean;
    created_at: string;
    created_by: string;
}

export interface KeyMetrics {
    total_ghg_emissions: {
        value: number;
        unit: string;
        description: string;
        scope1: number;
        scope2: number;
        scope3: number;
    };
    net_carbon_balance: {
        value: number;
        unit: string;
        description: string;
        emissions: number;
        sequestration: number;
        is_positive: boolean;
    };
    carbon_intensity: {
        value: number;
        unit: string;
        description: string;
        area_ha: number;
    };
    scope_composition: {
        scope1_percentage: number;
        scope2_percentage: number;
        scope3_percentage: number;
        unit: string;
        description: string;
    };
    sequestration_capacity: {
        value: number;
        unit: string;
        description: string;
        sequestration_rate: number;
        sequestration_unit: string;
    };
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

export interface SequestrationMonthlyData {
    month: string;
    month_number: number;
    year: number;
    ndvi_max: number;
    agb_t_per_ha: number;
    bgb_t_per_ha: number;
    biomass_c_t_per_ha: number;
    biomass_co2_t_per_ha: number;
    biomass_co2_total_t: number;
    delta_biomass_co2_t: number;
    soc_tc_per_ha: number;
    soc_co2_t_per_ha: number;
    soc_co2_total_t: number;
    delta_soc_co2_t: number;
    net_co2_stock_t: number;
    net_co2_change_t: number;
    meaning: string;
    reporting_area_ha?: number;
    soc_area_ha?: number;
    is_baseline: boolean;
    _id: string;
}

export interface SequestrationMethodology {
    component: string;
    method_applied: string;
    standard_source: string;
    purpose: string;
    parameters?: any;
    _id: string;
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

export interface CarbonYearSummary {
    year: number;
    emissions: {
        scope1: number;
        scope2: number;
        scope3: number;
        total: number;
        net: number;
    };
    sequestration: {
        total: number;
        biomass: number;
        soc: number;
    };
    area: number;
    intensity_metrics: {
        scope1_intensity: number;
        scope2_intensity: number;
        scope3_intensity: number;
        total_intensity: number;
    };
}

export interface YearlyCarbonData {
    year: number;
    scope1: {
        total_tco2e: number;
        sources: DetailedSource[];
        intensity: number;
    };
    scope2: {
        total_tco2e: number;
        sources: DetailedSource[];
        intensity: number;
    };
    scope3: {
        total_tco2e: number;
        categories: DetailedSource[];
        intensity: number;
    };
    sequestration: {
        total_tco2: number;
        biomass_co2: number;
        soc_co2: number;
        area_ha: number;
        monthly_data: SequestrationMonthlyData[];
        methodologies: SequestrationMethodology[];
    };
    totals: {
        total_emissions: number;
        net_emissions: number;
        total_intensity: number;
    };
    data_quality: {
        completeness_score: number;
        verification_status: string;
        verified_by?: string;
        verified_at?: string;
        verification_notes?: string;
    };
}

export interface CarbonEmissionFramework {
    sequestration_methodology: string;
    emission_methodology: string;
    data_sources: any[];
    calculation_approach: string;
}

export interface CarbonEmissionAccounting {
    id: string;
    framework: CarbonEmissionFramework;
    methodology: string;
    year_summary: CarbonYearSummary;
    emission_factors: EmissionFactor[];
    global_warming_potentials: GlobalWarmingPotentials;
    conversion_factors: ConversionFactors;
    yearly_data: YearlyCarbonData[];
    summary: {
        net_carbon_balance_tco2e: number;
    };
    data_management: {
        validation_status: string;
        import_history: any[];
        validation_errors: any[];
    };
    status: string;
    is_active: boolean;
    created_at: string;
    created_by: any;
    last_updated_at: string;
    last_updated_by: any;
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
    id: string;
    type: string;
    title: string;
    description: string;
    labels: string[] | number[];
    datasets: GraphDataset[];
    metadata?: any;
}

export interface DataAvailability {
    environmental_metrics_count: number;
    carbon_accounting_available: boolean;
    carbon_data_quality: {
        completeness_score: number;
        verification_status: string;
    };
}

export interface Summary {
    total_emissions: number;
    net_balance: number;
    carbon_intensity: number;
    sequestration_capacity: number;
    has_detailed_carbon_data: boolean;
    environmental_metrics_total: number;
}

export interface GHGEmissionsData {
    metadata: Metadata;
    company: Company;
    reporting_year: number;
    environmental_metrics: Record<string, EnvironmentalMetric>;
    key_metrics: KeyMetrics;
    carbon_emission_accounting: CarbonEmissionAccounting | null;
    graphs: Graph[];
    data_availability: DataAvailability;
    summary: Summary;
}

export interface GHGEmissionsResponse {
    message: string;
    api: string;
    data: GHGEmissionsData;
}

export interface GHGEmissionsParams {
    companyId: string;
    year: number;
}

/**
 * =====================
 * Helper Functions for Monthly Data Graphs
 * =====================
 */

export interface MonthlyGraphData {
    months: string[];
    biomass_co2_total_t: number[];
    soc_co2_total_t: number[];
    net_co2_stock_t: number[];
    delta_biomass_co2_t: number[];
    delta_soc_co2_t: number[];
    net_co2_change_t: number[];
    agb_t_per_ha: number[];
    bgb_t_per_ha: number[];
    biomass_c_t_per_ha: number[];
    ndvi_max: number[];
}

/**
 * =====================
 * GHG Emissions Service
 * =====================
 */

export const getGhgEmissionData = async (
    params: GHGEmissionsParams
): Promise<GHGEmissionsResponse> => {
    try {
        const { companyId, year } = params;

        const queryParams = new URLSearchParams();
        if (year !== undefined) {
            queryParams.append('year', year.toString());
        }

        const queryString = queryParams.toString();
        const url = `/esg-dashboard/ghg-emissions/${companyId}${queryString ? `?${queryString}` : ''}`;

        const { data } = await api.get<GHGEmissionsResponse>(url);
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
 * Extract monthly data for graph generation
 */
export const getMonthlyGraphData = (data: GHGEmissionsData): MonthlyGraphData | null => {
    if (!data.carbon_emission_accounting?.yearly_data?.[0]?.sequestration?.monthly_data) {
        return null;
    }

    const monthlyData = data.carbon_emission_accounting.yearly_data[0].sequestration.monthly_data;

    // Sort by month number
    const sortedMonthlyData = [...monthlyData].sort((a, b) => a.month_number - b.month_number);

    return {
        months: sortedMonthlyData.map(m => m.month),
        biomass_co2_total_t: sortedMonthlyData.map(m => m.biomass_co2_total_t || 0),
        soc_co2_total_t: sortedMonthlyData.map(m => m.soc_co2_total_t || 0),
        net_co2_stock_t: sortedMonthlyData.map(m => m.net_co2_stock_t || 0),
        delta_biomass_co2_t: sortedMonthlyData.map(m => m.delta_biomass_co2_t || 0),
        delta_soc_co2_t: sortedMonthlyData.map(m => m.delta_soc_co2_t || 0),
        net_co2_change_t: sortedMonthlyData.map(m => m.net_co2_change_t || 0),
        agb_t_per_ha: sortedMonthlyData.map(m => m.agb_t_per_ha || 0),
        bgb_t_per_ha: sortedMonthlyData.map(m => m.bgb_t_per_ha || 0),
        biomass_c_t_per_ha: sortedMonthlyData.map(m => m.biomass_c_t_per_ha || 0),
        ndvi_max: sortedMonthlyData.map(m => m.ndvi_max || 0),
    };
};

/**
 * Generate line graphs from monthly data
 */
export const generateMonthlyLineGraphs = (data: GHGEmissionsData): Graph[] => {
    const monthlyData = getMonthlyGraphData(data);
    if (!monthlyData) {
        return [];
    }

    const graphs: Graph[] = [];

    // Graph 1: Monthly CO₂ Stocks
    graphs.push({
        id: "monthly_co2_stocks",
        type: "line",
        title: `Monthly CO₂ Stocks - ${data.reporting_year}`,
        description: "Monthly CO₂ stocks from biomass, soil organic carbon, and net stock",
        labels: monthlyData.months,
        datasets: [
            {
                label: "Biomass CO₂ (t)",
                data: monthlyData.biomass_co2_total_t,
                borderColor: "#27ae60",
                backgroundColor: "rgba(39, 174, 96, 0.1)",
                fill: true,
                tension: 0.4
            },
            {
                label: "SOC CO₂ (t)",
                data: monthlyData.soc_co2_total_t,
                borderColor: "#8e44ad",
                backgroundColor: "rgba(142, 68, 173, 0.1)",
                fill: true,
                tension: 0.4
            },
            {
                label: "Net CO₂ Stock (t)",
                data: monthlyData.net_co2_stock_t,
                borderColor: "#3498db",
                backgroundColor: "rgba(52, 152, 219, 0.1)",
                fill: true,
                tension: 0.4
            }
        ]
    });

    // Graph 2: Monthly CO₂ Changes (Deltas)
    graphs.push({
        id: "monthly_co2_changes",
        type: "line",
        title: `Monthly CO₂ Changes - ${data.reporting_year}`,
        description: "Monthly changes in CO₂ stocks",
        labels: monthlyData.months,
        datasets: [
            {
                label: "Δ Biomass CO₂ (t)",
                data: monthlyData.delta_biomass_co2_t,
                borderColor: "#e74c3c",
                backgroundColor: "rgba(231, 76, 60, 0.1)",
                fill: true,
                tension: 0.4
            },
            {
                label: "Δ SOC CO₂ (t)",
                data: monthlyData.delta_soc_co2_t,
                borderColor: "#f39c12",
                backgroundColor: "rgba(243, 156, 18, 0.1)",
                fill: true,
                tension: 0.4
            },
            {
                label: "Net CO₂ Change (t)",
                data: monthlyData.net_co2_change_t,
                borderColor: "#2c3e50",
                backgroundColor: "rgba(44, 62, 80, 0.1)",
                fill: true,
                tension: 0.4
            }
        ]
    });

    // Graph 3: Biomass Breakdown (per hectare)
    graphs.push({
        id: "biomass_breakdown",
        type: "line",
        title: `Biomass Breakdown (per hectare) - ${data.reporting_year}`,
        description: "Monthly above-ground, below-ground, and total carbon in biomass per hectare",
        labels: monthlyData.months,
        datasets: [
            {
                label: "Above Ground Biomass (t/ha)",
                data: monthlyData.agb_t_per_ha,
                borderColor: "#16a085",
                backgroundColor: "rgba(22, 160, 133, 0.1)",
                fill: true,
                tension: 0.4
            },
            {
                label: "Below Ground Biomass (t/ha)",
                data: monthlyData.bgb_t_per_ha,
                borderColor: "#d35400",
                backgroundColor: "rgba(211, 84, 0, 0.1)",
                fill: true,
                tension: 0.4
            },
            {
                label: "Total Biomass Carbon (tC/ha)",
                data: monthlyData.biomass_c_t_per_ha,
                borderColor: "#c0392b",
                backgroundColor: "rgba(192, 57, 43, 0.1)",
                fill: true,
                tension: 0.4
            }
        ]
    });

    // Graph 4: Vegetation Health
    graphs.push({
        id: "vegetation_health",
        type: "line",
        title: `Vegetation Health (NDVI) - ${data.reporting_year}`,
        description: "Monthly maximum NDVI values for vegetation health monitoring",
        labels: monthlyData.months,
        datasets: [
            {
                label: "NDVI Max",
                data: monthlyData.ndvi_max,
                borderColor: "#27ae60",
                backgroundColor: "rgba(39, 174, 96, 0.1)",
                fill: true,
                tension: 0.4
            }
        ]
    });

    return graphs;
};

/**
 * Get all graphs including monthly line graphs
 */
export const getAllGraphs = (data: GHGEmissionsData): Graph[] => {
    const existingGraphs = data.graphs || [];
    const monthlyGraphs = generateMonthlyLineGraphs(data);
    return [...existingGraphs, ...monthlyGraphs];
};

/**
 * Get specific graph by ID
 */
export const getGraphById = (data: GHGEmissionsData, graphId: string): Graph | undefined => {
    const allGraphs = getAllGraphs(data);
    return allGraphs.find(graph => graph.id === graphId);
};

/**
 * Get summary of GHG emissions
 */
export const getGhgSummary = (data: GHGEmissionsData) => {
    const keyMetrics = data.key_metrics;
    return {
        totalEmissions: keyMetrics.total_ghg_emissions.value,
        scope1: keyMetrics.total_ghg_emissions.scope1,
        scope2: keyMetrics.total_ghg_emissions.scope2,
        scope3: keyMetrics.total_ghg_emissions.scope3,
        netBalance: keyMetrics.net_carbon_balance.value,
        carbonIntensity: keyMetrics.carbon_intensity.value,
        sequestration: keyMetrics.sequestration_capacity.value,
        scopeComposition: {
            scope1: keyMetrics.scope_composition.scope1_percentage,
            scope2: keyMetrics.scope_composition.scope2_percentage,
            scope3: keyMetrics.scope_composition.scope3_percentage,
        }
    };
};

/**
 * Get scope breakdown data
 */
export const getScopeBreakdown = (data: GHGEmissionsData) => {
    const carbonData = data.carbon_emission_accounting;
    if (!carbonData) return null;

    const yearlyData = carbonData.yearly_data[0];
    return {
        scope1: {
            total: yearlyData.scope1.total_tco2e,
            sources: yearlyData.scope1.sources,
            intensity: yearlyData.scope1.intensity
        },
        scope2: {
            total: yearlyData.scope2.total_tco2e,
            sources: yearlyData.scope2.sources,
            intensity: yearlyData.scope2.intensity
        },
        scope3: {
            total: yearlyData.scope3.total_tco2e,
            categories: yearlyData.scope3.categories,
            intensity: yearlyData.scope3.intensity
        }
    };
};

/**
 * Get environmental metrics summary
 */
export const getEnvironmentalMetricsSummary = (data: GHGEmissionsData) => {
    const metrics = Object.values(data.environmental_metrics);
    return metrics.map(metric => ({
        name: metric.name,
        category: metric.category,
        unit: metric.unit,
        description: metric.description,
        currentValue: metric.values[0]?.numeric_value || 0,
        sourceNotes: metric.values[0]?.source_notes || '',
        year: metric.values[0]?.year || data.reporting_year
    }));
};

/**
 * Get carbon emission accounting data
 */
export const getCarbonEmissionAccounting = (data: GHGEmissionsData) => {
    return data.carbon_emission_accounting;
};

/**
 * Get key emission metrics
 */
export const getKeyEmissionMetrics = (data: GHGEmissionsData) => {
    return data.key_metrics;
};

/**
 * Get company information
 */
export const getCompanyInfo = (data: GHGEmissionsData) => {
    return data.company;
};

/**
 * Get metadata information
 */
export const getMetadata = (data: GHGEmissionsData) => {
    return data.metadata;
};

/**
 * Get data availability information
 */
export const getDataAvailability = (data: GHGEmissionsData) => {
    return data.data_availability;
};

/**
 * Get reporting year
 */
export const getReportingYear = (data: GHGEmissionsData) => {
    return data.reporting_year;
};

/**
 * Check if carbon accounting data is available
 */
export const hasCarbonAccounting = (data: GHGEmissionsData) => {
    return data.data_availability.carbon_accounting_available;
};

/**
 * Get sequestration methodologies
 */
export const getSequestrationMethodologies = (data: GHGEmissionsData) => {
    const carbonData = data.carbon_emission_accounting;
    if (!carbonData) return [];

    return carbonData.yearly_data[0]?.sequestration?.methodologies || [];
};

/**
 * Get emission factors
 */
export const getEmissionFactors = (data: GHGEmissionsData) => {
    const carbonData = data.carbon_emission_accounting;
    if (!carbonData) return [];

    return carbonData.emission_factors || [];
};

/**
 * Get monthly sequestration data
 */
export const getMonthlySequestrationData = (data: GHGEmissionsData) => {
    const carbonData = data.carbon_emission_accounting;
    if (!carbonData) return [];

    return carbonData.yearly_data[0]?.sequestration?.monthly_data || [];
};

/**
 * Get all environmental metrics
 */
export const getAllEnvironmentalMetrics = (data: GHGEmissionsData) => {
    return data.environmental_metrics;
};

/**
 * Get specific environmental metric by name
 */
export const getEnvironmentalMetric = (data: GHGEmissionsData, metricName: string) => {
    return data.environmental_metrics[metricName];
};

/**
 * Get carbon intensity metrics
 */
export const getCarbonIntensityMetrics = (data: GHGEmissionsData) => {
    const carbonData = data.carbon_emission_accounting;
    if (!carbonData) return null;

    return carbonData.year_summary.intensity_metrics;
};

/**
 * Get sequestration summary
 */
export const getSequestrationSummary = (data: GHGEmissionsData) => {
    const carbonData = data.carbon_emission_accounting;
    if (!carbonData) return null;

    return carbonData.year_summary.sequestration;
};

/**
 * Get emissions summary
 */
export const getEmissionsSummary = (data: GHGEmissionsData) => {
    const carbonData = data.carbon_emission_accounting;
    if (!carbonData) return null;

    return carbonData.year_summary.emissions;
};

/**
 * Get yearly data summary
 */
export const getYearlyDataSummary = (data: GHGEmissionsData) => {
    const carbonData = data.carbon_emission_accounting;
    if (!carbonData) return null;

    return carbonData.year_summary;
};

export default {
    getGhgEmissionData,
    getMonthlyGraphData,
    generateMonthlyLineGraphs,
    getAllGraphs,
    getGraphById,
    getGhgSummary,
    getScopeBreakdown,
    getEnvironmentalMetricsSummary,
    getCarbonEmissionAccounting,
    getKeyEmissionMetrics,
    getCompanyInfo,
    getMetadata,
    getDataAvailability,
    getReportingYear,
    hasCarbonAccounting,
    getSequestrationMethodologies,
    getEmissionFactors,
    getMonthlySequestrationData,
    getAllEnvironmentalMetrics,
    getEnvironmentalMetric,
    getCarbonIntensityMetrics,
    getSequestrationSummary,
    getEmissionsSummary,
    getYearlyDataSummary,
};