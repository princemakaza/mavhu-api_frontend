import api from "../Auth_service/api";

/**
 * =====================
 * Types & Interfaces for Waste Management
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
    industry: string;
    country: string;
    esg_reporting_framework: string[];
    latest_esg_report_year: number;
    esg_data_status: string;
    has_esg_linked_pay: boolean;
    purpose: string;
    scope: string;
    area_of_interest_metadata: AreaOfInterestMetadata;
    esg_contact_person: EsgContactPerson;
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
    environmental_metrics_count: number;
    verification_summary: {
        unverified: number;
    };
    environmental_categories: Record<string, number>;
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

export interface WasteSummary {
    year: number;
    overview: {
        title: string;
        description: string;
        key_message: string;
    };
    performance_indicators: {
        recycling_rate: PerformanceIndicator;
        hazardous_waste: PerformanceIndicator;
        total_waste: PerformanceIndicator;
        waste_incidents: PerformanceIndicator;
        cost_savings: PerformanceIndicator;
    };
}

export interface WasteStreamCategory {
    name: string;
    amount: number;
    unit: string;
    color: string;
    description: string;
    examples: string[];
}

export interface WasteStreams {
    year: number;
    categories: WasteStreamCategory[];
    total: number;
}

export interface WasteIncident {
    id: number;
    date: string;
    type: string;
    severity: string;
    location: string;
    waste_type: string;
    quantity: string;
    status: string;
    cost_impact: number;
}

export interface ZeroWasteTarget {
    name: string;
    target: string;
    current_progress: string;
    status: string;
    current_value?: string;
}

export interface IncidentsAndTargets {
    year: number;
    current_year_incidents: number;
    total_incidents: number;
    incidents: WasteIncident[];
    zero_waste_targets: {
        current_year: number;
        targets: ZeroWasteTarget[];
    };
    compliance_status: string;
}

export interface CircularEconomyMetric {
    value: string | number;
    unit?: string;
    label: string;
    description: string;
}

export interface CircularEconomyInitiative {
    name: string;
    impact: string;
    status: string;
    started: string;
}

export interface CircularEconomy {
    year: number;
    overview: string;
    metrics: {
        materials_recovered: CircularEconomyMetric;
        waste_to_energy: CircularEconomyMetric;
        closed_loop_projects: CircularEconomyMetric;
        circular_supply_chain: CircularEconomyMetric;
    };
    initiatives: CircularEconomyInitiative[];
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

export interface EnvironmentalMetric {
    name: string;
    unit: string;
    description: string;
    category: string;
    values: MetricValue[];
    verification_status: string;
    data_source: string;
}

export interface EnvironmentalMetrics {
    year: number;
    total_metrics: number;
    metrics_by_category: Record<string, number>;
    metrics: Record<string, EnvironmentalMetric>;
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

export interface DetailedWasteMetrics {
    year: number;
    metrics: Record<string, any>;
}

export interface GraphDataset {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string | string[] | any;
    fill?: boolean;
    borderDash?: number[];
    tension?: number;
    borderWidth?: number;
    pointBackgroundColor?: string;
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
    waste_trend_over_time: Graph;
    waste_breakdown: Graph;
    waste_handling_methods: Graph;
    waste_vs_recycling: Graph;
    monthly_waste_pattern: Graph;
    waste_performance_radar: Graph;
}

export interface Recommendation {
    priority: string;
    action: string;
    impact: string;
    cost: string;
    timeline: string;
    year: number;
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

export interface WasteManagementResponse {
    message: string;
    api: string;
    data: {
        api_info: ApiInfo;
        year_data: YearData;
        company: CompanyInfo;
        waste_summary: WasteSummary;
        waste_streams: WasteStreams;
        incidents_and_targets: IncidentsAndTargets;
        circular_economy: CircularEconomy;
        environmental_metrics: EnvironmentalMetrics;
        detailed_waste_metrics: DetailedWasteMetrics;
        graphs: Graphs;
        recommendations: Recommendation[];
        data_quality: DataQuality;
    };
}

export interface WasteManagementParams {
    companyId: string;
    year?: number;
}

/**
 * =====================
 * Waste Management Service
 * =====================
 */

export const getWasteManagementData = async (
    params: WasteManagementParams
): Promise<WasteManagementResponse> => {
    try {
        const { companyId, year } = params;

        const queryParams = new URLSearchParams();
        if (year !== undefined) {
            queryParams.append('year', year.toString());
        }

        const queryString = queryParams.toString();
        const url = `/esg-dashboard/waste-management/${companyId}${queryString ? `?${queryString}` : ''}`;

        const { data } = await api.get<WasteManagementResponse>(url);
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
                throw new Error("Waste management data not found for the specified company.");
            case 422:
                throw new Error(errorMessage || "Invalid year parameter or data format.");
            case 500:
                throw new Error("Server error occurred while fetching waste management data.");
            case 503:
                throw new Error("Waste management service is temporarily unavailable.");
            default:
                throw new Error(
                    errorMessage ||
                    error.response?.data?.detail ||
                    "Failed to fetch waste management data"
                );
        }
    }
};

/**
 * =====================
 * Helper Functions for Waste Management
 * =====================
 */

/**
 * Get company information
 */
export const getWasteCompanyInfo = (data: WasteManagementResponse): CompanyInfo => {
    return data.data.company;
};

/**
 * Get waste summary data
 */
export const getWasteSummary = (data: WasteManagementResponse): WasteSummary => {
    return data.data.waste_summary;
};

/**
 * Get waste streams data
 */
export const getWasteStreams = (data: WasteManagementResponse): WasteStreams => {
    return data.data.waste_streams;
};

/**
 * Get incidents and targets data
 */
export const getIncidentsAndTargets = (data: WasteManagementResponse): IncidentsAndTargets => {
    return data.data.incidents_and_targets;
};

/**
 * Get circular economy data
 */
export const getCircularEconomy = (data: WasteManagementResponse): CircularEconomy => {
    return data.data.circular_economy;
};

/**
 * Get environmental metrics
 */
export const getEnvironmentalMetrics = (data: WasteManagementResponse): EnvironmentalMetrics => {
    return data.data.environmental_metrics;
};

/**
 * Get detailed waste metrics
 */
export const getDetailedWasteMetrics = (data: WasteManagementResponse): DetailedWasteMetrics => {
    return data.data.detailed_waste_metrics;
};

/**
 * Get all graphs
 */
export const getAllWasteGraphs = (data: WasteManagementResponse): Graphs => {
    return data.data.graphs;
};

/**
 * Get specific graph by type
 */
export const getWasteGraphByType = (data: WasteManagementResponse, graphType: string): Graph | undefined => {
    const graphs = data.data.graphs;
    switch (graphType) {
        case 'waste_trend_over_time':
            return graphs.waste_trend_over_time;
        case 'waste_breakdown':
            return graphs.waste_breakdown;
        case 'waste_handling_methods':
            return graphs.waste_handling_methods;
        case 'waste_vs_recycling':
            return graphs.waste_vs_recycling;
        case 'monthly_waste_pattern':
            return graphs.monthly_waste_pattern;
        case 'waste_performance_radar':
            return graphs.waste_performance_radar;
        default:
            return undefined;
    }
};

/**
 * Get recommendations
 */
export const getRecommendations = (data: WasteManagementResponse): Recommendation[] => {
    return data.data.recommendations;
};

/**
 * Get data quality information
 */
export const getDataQuality = (data: WasteManagementResponse): DataQuality => {
    return data.data.data_quality;
};

/**
 * Get API information
 */
export const getApiInfo = (data: WasteManagementResponse): ApiInfo => {
    return data.data.api_info;
};

/**
 * Get year data
 */
export const getYearData = (data: WasteManagementResponse): YearData => {
    return data.data.year_data;
};

/**
 * Get performance indicators
 */
export const getPerformanceIndicators = (data: WasteManagementResponse) => {
    return data.data.waste_summary.performance_indicators;
};

/**
 * Get recycling rate
 */
export const getRecyclingRate = (data: WasteManagementResponse): PerformanceIndicator => {
    return data.data.waste_summary.performance_indicators.recycling_rate;
};

/**
 * Get hazardous waste data
 */
export const getHazardousWaste = (data: WasteManagementResponse): PerformanceIndicator => {
    return data.data.waste_summary.performance_indicators.hazardous_waste;
};

/**
 * Get total waste generated
 */
export const getTotalWaste = (data: WasteManagementResponse): PerformanceIndicator => {
    return data.data.waste_summary.performance_indicators.total_waste;
};

/**
 * Get waste incidents data
 */
export const getWasteIncidents = (data: WasteManagementResponse): PerformanceIndicator => {
    return data.data.waste_summary.performance_indicators.waste_incidents;
};

/**
 * Get cost savings from waste management
 */
export const getCostSavings = (data: WasteManagementResponse): PerformanceIndicator => {
    return data.data.waste_summary.performance_indicators.cost_savings;
};

/**
 * Get zero waste targets
 */
export const getZeroWasteTargets = (data: WasteManagementResponse): ZeroWasteTarget[] => {
    return data.data.incidents_and_targets.zero_waste_targets.targets;
};

/**
 * Get current year incidents
 */
export const getCurrentYearIncidents = (data: WasteManagementResponse): WasteIncident[] => {
    const currentYear = data.data.year_data.requested_year;
    return data.data.incidents_and_targets.incidents.filter(
        incident => new Date(incident.date).getFullYear() === currentYear
    );
};

/**
 * Get all waste incidents
 */
export const getAllIncidents = (data: WasteManagementResponse): WasteIncident[] => {
    return data.data.incidents_and_targets.incidents;
};

/**
 * Get compliance status
 */
export const getComplianceStatus = (data: WasteManagementResponse): string => {
    return data.data.incidents_and_targets.compliance_status;
};

/**
 * Get circular economy initiatives
 */
export const getCircularEconomyInitiatives = (data: WasteManagementResponse): CircularEconomyInitiative[] => {
    return data.data.circular_economy.initiatives;
};

/**
 * Get circular economy metrics
 */
export const getCircularEconomyMetrics = (data: WasteManagementResponse) => {
    return data.data.circular_economy.metrics;
};

/**
 * Get waste stream categories
 */
export const getWasteStreamCategories = (data: WasteManagementResponse): WasteStreamCategory[] => {
    return data.data.waste_streams.categories;
};

/**
 * Get total waste amount
 */
export const getTotalWasteAmount = (data: WasteManagementResponse): number => {
    return data.data.waste_streams.total;
};

/**
 * Get waste metrics by category
 */
export const getWasteMetricsByCategory = (data: WasteManagementResponse, category: string): EnvironmentalMetric[] => {
    const metrics = data.data.environmental_metrics.metrics;
    return Object.values(metrics).filter(metric =>
        metric.name.toLowerCase().includes(category.toLowerCase()) ||
        metric.description.toLowerCase().includes(category.toLowerCase())
    );
};

/**
 * Get environmental metric by name
 */
export const getEnvironmentalMetricByName = (data: WasteManagementResponse, metricName: string): EnvironmentalMetric | undefined => {
    return data.data.environmental_metrics.metrics[metricName];
};

/**
 * Get all environmental metric names
 */
export const getAllEnvironmentalMetricNames = (data: WasteManagementResponse): string[] => {
    return Object.keys(data.data.environmental_metrics.metrics);
};

/**
 * Get metric categories breakdown
 */
export const getMetricCategoriesBreakdown = (data: WasteManagementResponse): Record<string, number> => {
    return data.data.environmental_metrics.metrics_by_category;
};

/**
 * Get total number of metrics
 */
export const getTotalMetricsCount = (data: WasteManagementResponse): number => {
    return data.data.environmental_metrics.total_metrics;
};

/**
 * Get data range information
 */
export const getDataRange = (data: WasteManagementResponse) => {
    return data.data.environmental_metrics.metadata.data_range;
};

/**
 * Get verification status
 */
export const getVerificationStatus = (data: WasteManagementResponse) => {
    return data.data.environmental_metrics.metadata.verification_status;
};

/**
 * Get area of interest metadata
 */
export const getAreaOfInterestMetadata = (data: WasteManagementResponse): AreaOfInterestMetadata => {
    return data.data.company.area_of_interest_metadata;
};

/**
 * Get ESG contact person
 */
export const getEsgContactPerson = (data: WasteManagementResponse): EsgContactPerson => {
    return data.data.company.esg_contact_person;
};

/**
 * Get ESG reporting frameworks
 */
export const getEsgReportingFrameworks = (data: WasteManagementResponse): string[] => {
    return data.data.company.esg_reporting_framework;
};

/**
 * Get requested year
 */
export const getRequestedYear = (data: WasteManagementResponse): number => {
    return data.data.year_data.requested_year;
};

/**
 * Check if data is available for the requested year
 */
export const isDataAvailable = (data: WasteManagementResponse): boolean => {
    return data.data.year_data.data_available;
};

/**
 * Get environmental metrics count
 */
export const getEnvironmentalMetricsCount = (data: WasteManagementResponse): number => {
    return data.data.year_data.environmental_metrics_count;
};

/**
 * Get high priority recommendations
 */
export const getHighPriorityRecommendations = (data: WasteManagementResponse): Recommendation[] => {
    return data.data.recommendations.filter(rec => rec.priority === 'High');
};

/**
 * Get medium priority recommendations
 */
export const getMediumPriorityRecommendations = (data: WasteManagementResponse): Recommendation[] => {
    return data.data.recommendations.filter(rec => rec.priority === 'Medium');
};

/**
 * Get low priority recommendations
 */
export const getLowPriorityRecommendations = (data: WasteManagementResponse): Recommendation[] => {
    return data.data.recommendations.filter(rec => rec.priority === 'Low');
};

/**
 * Calculate waste diversion rate (percentage of waste not sent to landfill)
 */
export const calculateWasteDiversionRate = (data: WasteManagementResponse): number => {
    const wasteStreams = data.data.waste_streams.categories;
    const totalWaste = data.data.waste_streams.total;

    if (totalWaste === 0) return 0;

    // Assume recyclable waste is diverted (you might want to adjust this based on your data)
    const recyclableWaste = wasteStreams.find(cat => cat.name === 'Recyclable')?.amount || 0;
    const divertedWaste = recyclableWaste; // Add other diverted waste types if available

    return (divertedWaste / totalWaste) * 100;
};

/**
 * Calculate waste intensity (waste per unit of production or revenue)
 */
export const calculateWasteIntensity = (data: WasteManagementResponse, productionUnits: number): number => {
    const totalWaste = data.data.waste_streams.total;
    return productionUnits > 0 ? totalWaste / productionUnits : 0;
};

/**
 * Get waste metrics summary for dashboard
 */
export const getWasteMetricsSummary = (data: WasteManagementResponse) => {
    const performance = data.data.waste_summary.performance_indicators;
    const streams = data.data.waste_streams;
    const incidents = data.data.incidents_and_targets;
    const circular = data.data.circular_economy.metrics;

    return {
        recyclingRate: parseFloat(performance.recycling_rate.value.toString()),
        hazardousWaste: parseFloat(performance.hazardous_waste.value.toString()),
        totalWaste: parseFloat(performance.total_waste.value.toString()),
        wasteIncidents: performance.waste_incidents.value as number,
        costSavings: parseFloat(performance.cost_savings.value.toString().replace(',', '')),
        totalWasteStreams: streams.total,
        wasteStreams: streams.categories,
        currentYearIncidents: incidents.current_year_incidents,
        complianceStatus: incidents.compliance_status,
        materialsRecovered: parseFloat(circular.materials_recovered.value.toString()),
        wasteToEnergy: parseFloat(circular.waste_to_energy.value.toString()),
        closedLoopProjects: circular.closed_loop_projects.value as number,
        circularSupplyChain: circular.circular_supply_chain.value
    };
};

/**
 * Get trending metrics (increase/decrease based on trend values)
 */
export const getTrendingMetrics = (data: WasteManagementResponse) => {
    const performance = data.data.waste_summary.performance_indicators;

    return {
        recyclingRate: performance.recycling_rate.trend,
        hazardousWaste: performance.hazardous_waste.trend,
        wasteIncidents: performance.waste_incidents.trend,
        costSavings: performance.cost_savings.trend
    };
};

export default {
    getWasteManagementData,
    getWasteCompanyInfo,
    getWasteSummary,
    getWasteStreams,
    getIncidentsAndTargets,
    getCircularEconomy,
    getEnvironmentalMetrics,
    getDetailedWasteMetrics,
    getAllWasteGraphs,
    getWasteGraphByType,
    getRecommendations,
    getDataQuality,
    getApiInfo,
    getYearData,
    getPerformanceIndicators,
    getRecyclingRate,
    getHazardousWaste,
    getTotalWaste,
    getWasteIncidents,
    getCostSavings,
    getZeroWasteTargets,
    getCurrentYearIncidents,
    getAllIncidents,
    getComplianceStatus,
    getCircularEconomyInitiatives,
    getCircularEconomyMetrics,
    getWasteStreamCategories,
    getTotalWasteAmount,
    getWasteMetricsByCategory,
    getEnvironmentalMetricByName,
    getAllEnvironmentalMetricNames,
    getMetricCategoriesBreakdown,
    getTotalMetricsCount,
    getDataRange,
    getVerificationStatus,
    getAreaOfInterestMetadata,
    getEsgContactPerson,
    getEsgReportingFrameworks,
    getRequestedYear,
    isDataAvailable,
    getEnvironmentalMetricsCount,
    getHighPriorityRecommendations,
    getMediumPriorityRecommendations,
    getLowPriorityRecommendations,
    calculateWasteDiversionRate,
    calculateWasteIntensity,
    getWasteMetricsSummary,
    getTrendingMetrics
};