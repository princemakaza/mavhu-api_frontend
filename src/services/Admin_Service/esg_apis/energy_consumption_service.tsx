// File: services/energyConsumptionService.ts
import api from "../Auth_service/api";

/**
 * =====================
 * Types & Interfaces for Energy Consumption
 * =====================
 */

export interface EnergyMetricValue {
    year: number;
    value: string;
    numeric_value: number;
    source_notes: string;
    added_at: string;
    last_updated_at: string;
}

export interface EnergyMetric {
    name: string;
    category: string;
    unit: string;
    description: string;
    values: EnergyMetricValue[];
}

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

export interface GridOperations {
    electricity_generated_mwh: string;
    electricity_purchased_mwh: string;
    electricity_exported_mwh: string;
    net_grid_import_mwh: string;
    grid_self_sufficiency_percentage: number;
    grid_dependency: string;
}

export interface Trends {
    coal_consumption: string;
    diesel_consumption: string;
    renewable_energy_adoption: string;
    clean_energy_transition: string;
    energy_efficiency: string;
}

export interface EnergyConsumptionData {
    company: any; // You can reuse existing company interface
    reporting_period: {
        year: number;
        date_range: string;
        fiscal_year: number;
    };
    all_metrics: {
        by_category: {
            environmental: Record<string, EnergyMetric>;
        };
    };
    energy_mix: EnergyMix;
    grid_operations: GridOperations;
    trends: Trends;
    kpis: Record<string, string | number>;
    graphs: Graph[];
    summary: {
        message: string;
        key_insight: string;
        recommendation: string;
    };
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

export interface EnergyConsumptionResponse {
    message: string;
    api: string;
    data: EnergyConsumptionData;
}

export interface EnergyConsumptionParams {
    companyId: string;
    year: number;
}

/**
 * =====================
 * Helper Functions for Energy Consumption Graphs
 * =====================
 */

export interface EnergyCategoryData {
    category: string;
    metrics: {
        name: string;
        value: number;
        unit: string;
    }[];
}

/**
 * =====================
 * Energy Consumption Service
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

/**
 * Extract energy consumption metrics from the data
 */
export const getEnergyConsumptionMetrics = (data: EnergyConsumptionData) => {
    const environmentalMetrics = data.all_metrics.by_category.environmental;
    const energyMetrics: Record<string, EnergyMetric> = {};

    // Filter only energy-related metrics
    Object.keys(environmentalMetrics).forEach(key => {
        const metric = environmentalMetrics[key];
        if (
            key.includes('Energy Consumption') ||
            key.includes('Electricity') ||
            key.includes('Bagasse') ||
            key.includes('Solar') ||
            key.includes('Coal') ||
            key.includes('Diesel') ||
            key.includes('Petrol')
        ) {
            energyMetrics[key] = metric;
        }
    });

    return energyMetrics;
};

/**
 * Generate energy consumption bar graphs
 */
export const generateEnergyConsumptionBarGraphs = (data: EnergyConsumptionData): Graph[] => {
    const energyMetrics = getEnergyConsumptionMetrics(data);
    const currentYear = data.reporting_period.year;

    const graphs: Graph[] = [];

    // Group 1: Renewable Energy Consumption
    const renewableMetrics = Object.entries(energyMetrics)
        .filter(([key]) => key.includes('Renewable'))
        .map(([name, metric]) => ({
            name: name.replace('Energy Consumption (Renewable) - ', ''),
            value: metric.values[0]?.numeric_value || 0,
            unit: metric.unit,
            fullName: name
        }));

    if (renewableMetrics.length > 0) {
        graphs.push({
            id: "renewable_energy_consumption",
            type: "bar",
            title: `Renewable Energy Consumption - ${currentYear}`,
            description: "Renewable energy sources consumption breakdown",
            labels: renewableMetrics.map(m => m.name),
            datasets: [
                {
                    label: `Consumption (${renewableMetrics[0]?.unit || 'units'})`,
                    data: renewableMetrics.map(m => m.value),
                    backgroundColor: [
                        "#27ae60", // Bagasse - Green
                        "#f1c40f", // Solar - Yellow
                    ],
                    borderColor: [
                        "#219a52",
                        "#f39c12"
                    ],
                    borderWidth: 1
                }
            ]
        });
    }

    // Group 2: Fossil Fuel Consumption
    const fossilMetrics = Object.entries(energyMetrics)
        .filter(([key]) => key.includes('Coal') || key.includes('Diesel') || key.includes('Petrol'))
        .filter(([key]) => !key.includes('Renewable'))
        .map(([name, metric]) => ({
            name: name.replace('Energy Consumption - ', ''),
            value: metric.values[0]?.numeric_value || 0,
            unit: metric.unit,
            fullName: name
        }));

    if (fossilMetrics.length > 0) {
        graphs.push({
            id: "fossil_fuel_consumption",
            type: "bar",
            title: `Fossil Fuel Consumption - ${currentYear}`,
            description: "Fossil fuel consumption breakdown (inside and outside company)",
            labels: fossilMetrics.map(m => m.name),
            datasets: [
                {
                    label: `Consumption (various units)`,
                    data: fossilMetrics.map(m => m.value),
                    backgroundColor: [
                        "#2c3e50", // Coal - Dark gray
                        "#e74c3c", // Inside Diesel - Red
                        "#e67e22", // Inside Petrol - Orange
                        "#c0392b", // Outside Petrol - Dark red
                        "#d35400", // Outside Diesel - Brown
                    ],
                    borderColor: [
                        "#1a252f",
                        "#c0392b",
                        "#d35400",
                        "#a93226",
                        "#ba4a00"
                    ],
                    borderWidth: 1
                }
            ]
        });
    }

    // Group 3: Electricity Operations
    const electricityMetrics = Object.entries(energyMetrics)
        .filter(([key]) => key.includes('Electricity'))
        .map(([name, metric]) => ({
            name: name.replace('Energy Consumption - ', ''),
            value: metric.values[0]?.numeric_value || 0,
            unit: metric.unit,
            fullName: name
        }));

    if (electricityMetrics.length > 0) {
        graphs.push({
            id: "electricity_operations",
            type: "bar",
            title: `Electricity Operations - ${currentYear}`,
            description: "Electricity generation, purchase, and export to grid",
            labels: electricityMetrics.map(m => m.name),
            datasets: [
                {
                    label: `Electricity (MWH)`,
                    data: electricityMetrics.map(m => m.value),
                    backgroundColor: [
                        "#9b59b6", // Generated - Purple
                        "#3498db", // Purchased - Blue
                        "#2ecc71", // Exported - Green
                    ],
                    borderColor: [
                        "#8e44ad",
                        "#2980b9",
                        "#27ae60"
                    ],
                    borderWidth: 1
                }
            ]
        });
    }

    // Group 4: All Energy Consumption Combined (for comparison)
    const allEnergyMetrics = Object.entries(energyMetrics)
        .map(([name, metric]) => ({
            name: metric.name.length > 30 ? metric.name.substring(0, 30) + '...' : metric.name,
            value: metric.values[0]?.numeric_value || 0,
            unit: metric.unit,
            fullName: name
        }))
        .sort((a, b) => b.value - a.value) // Sort by value descending
        .slice(0, 10); // Take top 10

    if (allEnergyMetrics.length > 0) {
        graphs.push({
            id: "all_energy_consumption",
            type: "bar",
            title: `Top Energy Consumption Metrics - ${currentYear}`,
            description: "Top 10 energy consumption metrics (various units)",
            labels: allEnergyMetrics.map(m => m.name),
            datasets: [
                {
                    label: "Consumption",
                    data: allEnergyMetrics.map(m => m.value),
                    backgroundColor: allEnergyMetrics.map((m, index) => {
                        // Color based on metric type
                        if (m.fullName.includes('Renewable')) return "#27ae60";
                        if (m.fullName.includes('Electricity')) return "#3498db";
                        if (m.fullName.includes('Coal')) return "#2c3e50";
                        if (m.fullName.includes('Diesel') || m.fullName.includes('Petrol')) return "#e74c3c";
                        return "#95a5a6";
                    }),
                    borderColor: allEnergyMetrics.map((m, index) => {
                        if (m.fullName.includes('Renewable')) return "#219a52";
                        if (m.fullName.includes('Electricity')) return "#2980b9";
                        if (m.fullName.includes('Coal')) return "#1a252f";
                        if (m.fullName.includes('Diesel') || m.fullName.includes('Petrol')) return "#c0392b";
                        return "#7f8c8d";
                    }),
                    borderWidth: 1
                }
            ]
        });
    }

    // Group 5: Energy Consumption by Category (normalized to common unit if possible)
    const energyByCategory = [
        {
            category: "Renewable",
            metrics: renewableMetrics,
            color: "#27ae60"
        },
        {
            category: "Fossil Fuels",
            metrics: fossilMetrics,
            color: "#e74c3c"
        },
        {
            category: "Electricity",
            metrics: electricityMetrics,
            color: "#3498db"
        }
    ];

    const categoryTotals = energyByCategory.map(category => {
        const total = category.metrics.reduce((sum, metric) => {
            // Note: This adds different units together - might not be meaningful
            // In production, you'd need to convert to common units
            return sum + metric.value;
        }, 0);
        return {
            category: category.category,
            total: total,
            color: category.color
        };
    });

    graphs.push({
        id: "energy_by_category",
        type: "bar",
        title: `Energy Consumption by Category - ${currentYear}`,
        description: "Total energy consumption grouped by category (note: units may vary)",
        labels: categoryTotals.map(c => c.category),
        datasets: [
            {
                label: "Total Consumption",
                data: categoryTotals.map(c => c.total),
                backgroundColor: categoryTotals.map(c => c.color),
                borderColor: categoryTotals.map(c => {
                    if (c.category === "Renewable") return "#219a52";
                    if (c.category === "Fossil Fuels") return "#c0392b";
                    return "#2980b9";
                }),
                borderWidth: 1
            }
        ]
    });

    return graphs;
};

/**
 * Get all graphs including the new energy consumption bar graphs
 */
export const getAllEnergyGraphs = (data: EnergyConsumptionData): Graph[] => {
    const existingGraphs = data.graphs || [];
    const energyBarGraphs = generateEnergyConsumptionBarGraphs(data);
    return [...existingGraphs, ...energyBarGraphs];
};

/**
 * Get specific graph by ID
 */
export const getEnergyGraphById = (data: EnergyConsumptionData, graphId: string): Graph | undefined => {
    const allGraphs = getAllEnergyGraphs(data);
    return allGraphs.find(graph => graph.id === graphId);
};

/**
 * Get energy consumption summary
 */
export const getEnergyConsumptionSummary = (data: EnergyConsumptionData) => {
    const energyMetrics = getEnergyConsumptionMetrics(data);
    const totalEnergyConsumption = Object.values(energyMetrics).reduce((sum, metric) => {
        return sum + (metric.values[0]?.numeric_value || 0);
    }, 0);

    const renewableMetrics = Object.entries(energyMetrics)
        .filter(([key]) => key.includes('Renewable'))
        .map(([, metric]) => metric.values[0]?.numeric_value || 0);

    const totalRenewable = renewableMetrics.reduce((sum, value) => sum + value, 0);

    return {
        totalEnergyConsumption,
        totalRenewable,
        renewablePercentage: totalEnergyConsumption > 0 ? (totalRenewable / totalEnergyConsumption * 100) : 0,
        metricsCount: Object.keys(energyMetrics).length,
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

    Object.entries(energyMetrics).forEach(([name, metric]) => {
        const metricInfo = {
            name: metric.name,
            value: metric.values[0]?.numeric_value || 0,
            unit: metric.unit,
            description: metric.description
        };

        if (name.includes('Renewable')) {
            metricsByType.renewable.push(metricInfo);
        } else if (name.includes('Electricity')) {
            metricsByType.electricity.push(metricInfo);
        } else if (name.includes('Coal') || name.includes('Diesel') || name.includes('Petrol')) {
            metricsByType.fossil.push(metricInfo);
        }
    });

    return metricsByType;
};

/**
 * Get energy mix information
 */
export const getEnergyMixData = (data: EnergyConsumptionData) => {
    return data.energy_mix;
};

/**
 * Get grid operations data
 */
export const getGridOperationsData = (data: EnergyConsumptionData) => {
    return data.grid_operations;
};

/**
 * Get energy trends
 */
export const getEnergyTrends = (data: EnergyConsumptionData) => {
    return data.trends;
};

/**
 * Get energy KPIs
 */
export const getEnergyKPIs = (data: EnergyConsumptionData) => {
    return data.kpis;
};

/**
 * Get company information
 */
export const getEnergyCompanyInfo = (data: EnergyConsumptionData) => {
    return data.company;
};

export default {
    getEnergyConsumptionData,
    getEnergyConsumptionMetrics,
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