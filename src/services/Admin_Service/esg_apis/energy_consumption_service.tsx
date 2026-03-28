// File: services/energyConsumptionService.ts
import api from "../Auth_service/api";

/**
 * =====================
 * Types & Interfaces for Energy Consumption (aligned with API response)
 * =====================
 */

// --- Coordinates ---
export interface Coordinates {
    lat: number;
    lon: number;
    _id: string;
}

// --- Area of Interest Metadata ---
export interface AreaOfInterestMetadata {
    name: string;
    area_covered: string;
    coordinates: Coordinates[];
}

// --- ESG Contact Person ---
export interface ESGContactPerson {
    name: string;
    email: string;
    phone: string;
}

// --- Company Information ---
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
    esg_contact_person: ESGContactPerson;
    latest_esg_report_year: number;
    esg_data_status: string;
    has_esg_linked_pay: boolean;
    created_at: string;
    updated_at: string;
    __v: number;
}

// --- Energy Metric Yearly Value ---
export interface EnergyMetricYearlyValue {
    year: string;
    value: number | string;
    numeric_value: number;
    unit: string;
    source: string;
    added_by: string;
    _id: string;
    added_at: string;
    last_updated_at: string;
}

// --- Energy Metric List Item ---
export interface EnergyMetricListItem {
    item: string;
    count: number;
    details: string;
    source: string;
    _id: string;
    added_at: string;
}

// --- Energy Metric (from energy_consumption_data.metrics) ---
export interface EnergyMetric {
    category: string;
    metric_name: string;
    data_type: "yearly_series" | "list";
    yearly_data?: EnergyMetricYearlyValue[];
    list_data?: EnergyMetricListItem[];
    single_value?: {
        added_at: string;
    };
    is_active: boolean;
    created_by: string;
    _id: string;
    created_at: string;
    subcategory?: string; // present for fuel_consumption
}

// --- Energy Consumption Data (full object) ---
export interface EnergyConsumptionDataObject {
    _id: string;
    company: string;
    data_period_start: string;
    data_period_end: string;
    original_source: string;
    import_source: string;
    source_file_name: string;
    import_batch_id: string;
    import_date: string;
    data_quality_score: number | null;
    verification_status: string;
    validation_status: string;
    metrics: EnergyMetric[];
    summary_stats: {
        total_bagasse_usage: number;
        total_coal_consumption: number;
        total_electricity_generated: number;
        total_electricity_purchased: number;
        total_electricity_exported: number;
        total_solar_power_usage: number;
        total_fuel_consumption_inside: number;
        total_fuel_consumption_outside: number;
        average_solar_generation: number;
    };
    created_by: string;
    last_updated_by: string;
    version: number;
    is_active: boolean;
    source_files: any[];
    validation_errors: any[];
    gri_references: any[];
    forecast_data: any[];
    risk_assessment: any[];
    created_at: string;
    last_updated_at: string;
    __v: number;
}

// --- Reporting Period ---
export interface ReportingPeriod {
    year: number;
    date_range: string;
    fiscal_year: number;
}

// --- KPIs ---
export interface KPIs {
    renewable_energy_percentage: string;
    fossil_fuel_percentage: string;
    grid_dependency_percentage: string;
    energy_intensity: number;
    total_energy_consumption_gj: string;
    renewable_energy_generation_gj: string;
    carbon_intensity_tco2e_per_gj: number;
    clean_energy_transition_score: string;
}

// --- Energy Mix ---
export interface EnergyMix {
    renewable_sources: {
        percentage: string;
        breakdown: {
            bagasse: string;
            solar: string;
            other_renewables: string;
        };
        generation_gj: string;
    };
    fossil_sources: {
        percentage: string;
        breakdown: {
            coal: string;
            diesel: string;
            other_fossil: string;
        };
        consumption_gj: string;
    };
    total_energy_gj: string;
}

// --- Grid Operations ---
export interface GridOperations {
    electricity_generated_mwh: string;
    electricity_purchased_mwh: string;
    electricity_exported_mwh: string;
    net_grid_import_mwh: string;
    grid_self_sufficiency_percentage: number;
    grid_dependency: string;
}

// --- Trends ---
export interface Trends {
    coal_consumption: string;
    diesel_consumption: string;
    renewable_energy_adoption: string;
    clean_energy_transition: string;
    energy_efficiency: string;
}

// --- Carbon Emissions ---
export interface CarbonEmissions {
    year: number;
    emissions: {
        scope2: {
            total_tco2e_per_ha: number;
            total_tco2e: number;
            sources: any[];
        };
        scope3: {
            total_tco2e_per_ha: number;
            total_tco2e: number;
            categories: any[];
        };
        totals: {
            total_scope_emission_tco2e_per_ha: number;
            total_scope_emission_tco2e: number;
            net_total_emission_tco2e: number;
        };
    };
    data_quality: Record<string, any>;
}

// --- Financial Impact ---
export interface FinancialImpact {
    total_energy_cost_usd: string;
    renewable_energy_cost_savings_usd: string;
    carbon_cost_avoided_usd: string;
    total_savings_usd: string;
    roi_percentage: number;
    energy_cost_per_gj: number;
}

// --- Data Quality ---
export interface DataQuality {
    completeness_score: number;
    verified_metrics: number;
    total_expected_metrics: number;
    verification_status: string;
    notes: string;
    energy_data_coverage: string;
}

// --- Versions ---
export interface Versions {
    api: string;
    calculation: string;
    gee_adapter: string;
    last_updated: string;
}

// --- Summary ---
export interface Summary {
    message: string;
    key_insight: string;
    recommendation: string;
}

// --- Graph Dataset (matches API structure) ---
export interface GraphDataset {
    label?: string;
    data: number[];
    borderColor?: string | string[];
    backgroundColor?: string | string[];
    fill?: boolean;
    borderDash?: number[];
    tension?: number;
    borderWidth?: number;
}

// --- Graph (generic, matches any of the six graph objects) ---
export interface Graph {
    type: string;
    title: string;
    description: string;
    labels: (string | number)[];
    datasets: GraphDataset[];
}

// --- Graphs collection from API ---
export interface Graphs {
    energy_mix_chart: Graph;
    renewable_sources_chart: Graph;
    energy_consumption_trend: Graph;
    fossil_fuel_trend: Graph;
    grid_electricity_flow: Graph;
    renewable_growth_chart: Graph;
}

// --- Main Energy Consumption Data interface (matches API response.data) ---
export interface EnergyConsumptionData {
    company: Company;
    energy_consumption_data: EnergyConsumptionDataObject;
    reporting_period: ReportingPeriod;
    kpis: KPIs;
    energy_mix: EnergyMix;
    grid_operations: GridOperations;
    trends: Trends;
    carbon_emissions: CarbonEmissions;
    financial_impact: FinancialImpact;
    graphs: Graphs;
    versions: Versions;
    data_quality: DataQuality;
    summary: Summary;
}

// --- API Response wrapper ---
export interface EnergyConsumptionResponse {
    message: string;
    api: string;
    data: EnergyConsumptionData;
}

// --- Request params ---
export interface EnergyConsumptionParams {
    companyId: string;
    year: number;
}

/**
 * =====================
 * Helper Functions for Energy Consumption Graphs
 * =====================
 */

/**
 * Extract energy consumption metrics from the raw metrics array
 */
export const getEnergyConsumptionMetrics = (data: EnergyConsumptionData): EnergyMetric[] => {
    const allMetrics = data.energy_consumption_data.metrics;
    // Filter only energy-related categories (you can adjust keywords as needed)
    const energyKeywords = ['bagasse', 'coal', 'electricity', 'solar', 'diesel', 'petrol', 'fuel'];
    return allMetrics.filter(metric =>
        energyKeywords.some(keyword => metric.category.toLowerCase().includes(keyword))
    );
};

/**
 * Convert the graphs object to an array for easier iteration
 */
export const getGraphsArray = (data: EnergyConsumptionData): Graph[] => {
    const graphs = data.graphs;
    return [
        graphs.energy_mix_chart,
        graphs.renewable_sources_chart,
        graphs.energy_consumption_trend,
        graphs.fossil_fuel_trend,
        graphs.grid_electricity_flow,
        graphs.renewable_growth_chart
    ];
};

/**
 * Get a specific graph by its key (e.g., 'energy_mix_chart')
 */
export const getGraphByKey = (data: EnergyConsumptionData, key: keyof Graphs): Graph => {
    return data.graphs[key];
};

/**
 * Generate additional bar graphs from raw metrics (if needed)
 * This function creates graphs similar to the ones you originally had,
 * but using the actual metric data.
 */
export const generateEnergyConsumptionBarGraphs = (data: EnergyConsumptionData): Graph[] => {
    const energyMetrics = getEnergyConsumptionMetrics(data);
    const currentYear = data.reporting_period.year;
    const graphs: Graph[] = [];

    // Helper to get the latest yearly value for a metric
    const getLatestValue = (metric: EnergyMetric): number => {
        if (metric.data_type === 'yearly_series' && metric.yearly_data && metric.yearly_data.length > 0) {
            // Find the entry matching current year, or take the last
            const yearEntry = metric.yearly_data.find(y => y.year === String(currentYear));
            return yearEntry ? yearEntry.numeric_value : metric.yearly_data[metric.yearly_data.length - 1].numeric_value;
        }
        return 0;
    };

    // 1. Renewable Energy Consumption
    const renewableMetrics = energyMetrics
        .filter(m => m.category.includes('bagasse') || m.category.includes('solar'))
        .map(m => ({
            name: m.metric_name,
            value: getLatestValue(m),
            unit: m.yearly_data?.[0]?.unit || ''
        }));

    if (renewableMetrics.length > 0) {
        graphs.push({
            type: 'bar',
            title: `Renewable Energy Consumption - ${currentYear}`,
            description: 'Renewable energy sources consumption breakdown',
            labels: renewableMetrics.map(m => m.name),
            datasets: [{
                label: `Consumption (${renewableMetrics[0]?.unit || 'units'})`,
                data: renewableMetrics.map(m => m.value),
                // Colors can be added by the UI; we leave them undefined
            }]
        });
    }

    // 2. Fossil Fuel Consumption
    const fossilMetrics = energyMetrics
        .filter(m => m.category.includes('coal') || m.category.includes('diesel') || m.category.includes('petrol'))
        .map(m => ({
            name: m.metric_name,
            value: getLatestValue(m),
            unit: m.yearly_data?.[0]?.unit || ''
        }));

    if (fossilMetrics.length > 0) {
        graphs.push({
            type: 'bar',
            title: `Fossil Fuel Consumption - ${currentYear}`,
            description: 'Fossil fuel consumption breakdown',
            labels: fossilMetrics.map(m => m.name),
            datasets: [{
                label: `Consumption (various units)`,
                data: fossilMetrics.map(m => m.value)
            }]
        });
    }

    // 3. Electricity Operations
    const electricityMetrics = energyMetrics
        .filter(m => m.category.includes('electricity'))
        .map(m => ({
            name: m.metric_name,
            value: getLatestValue(m),
            unit: m.yearly_data?.[0]?.unit || ''
        }));

    if (electricityMetrics.length > 0) {
        graphs.push({
            type: 'bar',
            title: `Electricity Operations - ${currentYear}`,
            description: 'Electricity generation, purchase, and export',
            labels: electricityMetrics.map(m => m.name),
            datasets: [{
                label: `Electricity (MWH)`,
                data: electricityMetrics.map(m => m.value)
            }]
        });
    }

    // 4. Top Energy Consumption Metrics (by value)
    const allEnergyMetrics = energyMetrics
        .map(m => ({
            name: m.metric_name.length > 30 ? m.metric_name.substring(0, 30) + '...' : m.metric_name,
            value: getLatestValue(m),
            fullName: m.metric_name
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

    if (allEnergyMetrics.length > 0) {
        graphs.push({
            type: 'bar',
            title: `Top Energy Consumption Metrics - ${currentYear}`,
            description: 'Top 10 energy consumption metrics (various units)',
            labels: allEnergyMetrics.map(m => m.name),
            datasets: [{
                label: 'Consumption',
                data: allEnergyMetrics.map(m => m.value)
            }]
        });
    }

    // 5. Energy by Category (summed, but units may differ)
    const categories = [
        { name: 'Renewable', metrics: renewableMetrics },
        { name: 'Fossil Fuels', metrics: fossilMetrics },
        { name: 'Electricity', metrics: electricityMetrics }
    ];

    const categoryTotals = categories.map(cat => ({
        category: cat.name,
        total: cat.metrics.reduce((sum, m) => sum + m.value, 0)
    }));

    graphs.push({
        type: 'bar',
        title: `Energy Consumption by Category - ${currentYear}`,
        description: 'Total energy consumption grouped by category (note: units may vary)',
        labels: categoryTotals.map(c => c.category),
        datasets: [{
            label: 'Total Consumption',
            data: categoryTotals.map(c => c.total)
        }]
    });

    return graphs;
};

/**
 * Get all graphs: API-provided + generated bar graphs
 */
export const getAllEnergyGraphs = (data: EnergyConsumptionData): Graph[] => {
    const apiGraphs = getGraphsArray(data);
    const barGraphs = generateEnergyConsumptionBarGraphs(data);
    return [...apiGraphs, ...barGraphs];
};

/**
 * Get graph by ID (assuming we assign an id based on key or title)
 * For simplicity, we'll search by title (or you can map keys to ids)
 */
export const getEnergyGraphById = (data: EnergyConsumptionData, graphId: string): Graph | undefined => {
    const allGraphs = getAllEnergyGraphs(data);
    return allGraphs.find(graph => graph.title.toLowerCase().replace(/\s+/g, '_') === graphId);
};

/**
 * Get energy consumption summary
 */
export const getEnergyConsumptionSummary = (data: EnergyConsumptionData) => {
    const energyMetrics = getEnergyConsumptionMetrics(data);
    const latestValues = energyMetrics.map(m => {
        if (m.data_type === 'yearly_series' && m.yearly_data && m.yearly_data.length > 0) {
            return m.yearly_data[m.yearly_data.length - 1].numeric_value;
        }
        return 0;
    });
    const totalEnergyConsumption = latestValues.reduce((sum, val) => sum + val, 0);

    const renewableMetrics = energyMetrics.filter(m => m.category.includes('bagasse') || m.category.includes('solar'));
    const totalRenewable = renewableMetrics.reduce((sum, m) => {
        if (m.data_type === 'yearly_series' && m.yearly_data && m.yearly_data.length > 0) {
            return sum + m.yearly_data[m.yearly_data.length - 1].numeric_value;
        }
        return sum;
    }, 0);

    return {
        totalEnergyConsumption,
        totalRenewable,
        renewablePercentage: totalEnergyConsumption > 0 ? (totalRenewable / totalEnergyConsumption) * 100 : 0,
        metricsCount: energyMetrics.length,
        reportingYear: data.reporting_period.year
    };
};

/**
 * Get detailed energy metrics by type
 */
export const getDetailedEnergyMetrics = (data: EnergyConsumptionData) => {
    const energyMetrics = getEnergyConsumptionMetrics(data);
    const metricsByType = {
        renewable: [] as Array<{ name: string; value: number; unit: string }>,
        fossil: [] as Array<{ name: string; value: number; unit: string }>,
        electricity: [] as Array<{ name: string; value: number; unit: string }>
    };

    energyMetrics.forEach(metric => {
        const latestValue = metric.data_type === 'yearly_series' && metric.yearly_data && metric.yearly_data.length > 0
            ? metric.yearly_data[metric.yearly_data.length - 1].numeric_value
            : 0;
        const unit = metric.yearly_data?.[0]?.unit || '';

        const item = { name: metric.metric_name, value: latestValue, unit };

        if (metric.category.includes('bagasse') || metric.category.includes('solar')) {
            metricsByType.renewable.push(item);
        } else if (metric.category.includes('electricity')) {
            metricsByType.electricity.push(item);
        } else if (metric.category.includes('coal') || metric.category.includes('diesel') || metric.category.includes('petrol')) {
            metricsByType.fossil.push(item);
        }
    });

    return metricsByType;
};

/**
 * Get energy mix information (direct from API)
 */
export const getEnergyMixData = (data: EnergyConsumptionData): EnergyMix => {
    return data.energy_mix;
};

/**
 * Get grid operations data (direct from API)
 */
export const getGridOperationsData = (data: EnergyConsumptionData): GridOperations => {
    return data.grid_operations;
};

/**
 * Get energy trends (direct from API)
 */
export const getEnergyTrends = (data: EnergyConsumptionData): Trends => {
    return data.trends;
};

/**
 * Get energy KPIs (direct from API)
 */
export const getEnergyKPIs = (data: EnergyConsumptionData): KPIs => {
    return data.kpis;
};

/**
 * Get company information
 */
export const getEnergyCompanyInfo = (data: EnergyConsumptionData): Company => {
    return data.company;
};

/**
 * =====================
 * Main API call
 * =====================
 */
export const getEnergyConsumptionData = async (
    params: EnergyConsumptionParams
): Promise<EnergyConsumptionResponse> => {
    try {
        const { companyId, year } = params;

        const queryParams = new URLSearchParams();
        if (year !== undefined) {
            queryParams.append('year', year.toString());
        }

        const queryString = queryParams.toString();
        const url = `/esg-dashboard/energy-renewables/${companyId}${queryString ? `?${queryString}` : ''}`;

        const { data } = await api.get<EnergyConsumptionResponse>(url);
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
                throw new Error("Energy consumption data not found for the specified company.");
            case 422:
                throw new Error(errorMessage || "Invalid year parameter or data format.");
            case 500:
                throw new Error("Server error occurred while fetching energy consumption data.");
            case 503:
                throw new Error("Energy consumption service is temporarily unavailable.");
            default:
                throw new Error(
                    errorMessage ||
                    error.response?.data?.detail ||
                    "Failed to fetch energy consumption data"
                );
        }
    }
};

export default {
    getEnergyConsumptionData,
    getEnergyConsumptionMetrics,
    getGraphsArray,
    getGraphByKey,
    generateEnergyConsumptionBarGraphs,
    getAllEnergyGraphs,
    getEnergyGraphById,
    getEnergyConsumptionSummary,
    getDetailedEnergyMetrics,
    getEnergyMixData,
    getGridOperationsData,
    getEnergyTrends,
    getEnergyKPIs,
    getEnergyCompanyInfo,
};