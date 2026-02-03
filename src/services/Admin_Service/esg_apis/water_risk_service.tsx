import api from "../Auth_service/api";

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
    _id: string;
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
    __v?: number;
}

export interface Metadata {
    api_version: string;
    calculation_version: string;
    gee_adapter_version: string;
    generated_at: string;
    endpoint: string;
    company_id: string;
    year_requested: number;
    data_sources: string[];
}

export interface ReportingPeriod {
    start_year: number;
    end_year: number;
    current_year: number;
    data_available_years: number[];
}

export interface ConfidenceScore {
    overall: number;
    interpretation: string;
    factors: string[];
}

export interface WaterUsageItem {
    current_value: number | null;
    unit: string;
    trend: string;
    efficiency_score: number | null;
    savings_potential: number | null;
    monthly_data: any[];
}

export interface TotalWaterUsage {
    current_value: number | null;
    unit: string;
    trend: string;
    per_hectare: number | null;
    benchmark: number | null;
}

export interface ShortageRisk {
    level: string;
    probability: number | null;
    factors: string[];
    mitigation_strategies: string[];
}

export interface WaterSavingsAnalysis {
    potential_savings: number | null;
    cost_savings: number | null;
    implementation_cost: number | null;
    roi_period: number | null;
    recommendations: string[];
}

export interface WaterUsageAnalysis {
    irrigation_water: WaterUsageItem;
    treatment_water: WaterUsageItem;
    total_water_usage: TotalWaterUsage;
    shortage_risk: ShortageRisk;
    water_savings_analysis: WaterSavingsAnalysis;
}

export interface MetricValue {
    year: number;
    value: string;
    numeric_value: number;
    source_notes?: string;
}

export interface DetailedMetric {
    name: string;
    category: string;
    unit: string;
    description: string;
    current_value: number;
    trend: string;
    years_available: number[];
    values: MetricValue[];
}

export interface EnvironmentalMetricsSummary {
    total_ghg_emissions: number;
    scope1_emissions: number;
    scope2_emissions: number;
    scope3_emissions: number;
    irrigation_water_usage: number | null;
    treatment_water_usage: number | null;
    total_water_usage: number | null;
}

export interface EnvironmentalMetrics {
    total_metrics: number;
    detailed_metrics: DetailedMetric[];
    summary: EnvironmentalMetricsSummary;
}

export interface EsgMetric {
    name: string;
    category: string;
    unit: string | null;
    description: string | null;
    values: MetricValue[];
}

export interface AllEsgMetrics {
    environmental: Record<string, EsgMetric>;
    social: Record<string, EsgMetric>;
    governance: Record<string, EsgMetric>;
}

export interface StakeholderBenefits {
    farmers: {
        water_savings: {
            estimated_savings: number;
            unit: string;
            cost_savings: number;
            currency: string;
        };
        crop_yield_improvement: {
            estimated_improvement: string;
            factors: string[];
        };
        input_cost_reduction: {
            water_pumping_costs: number;
            fertilizer_efficiency: string;
            labor_savings: string;
        };
        risk_reduction: {
            drought_risk: string;
            water_cost_volatility: string;
            regulatory_compliance: string;
        };
    };
    banks: {
        water_related_risks: {
            shortage_risk: {
                level: string;
                probability: number | null;
                impact: string;
                mitigation: any[];
            };
            regulatory_risks: {
                water_use_permits: string;
                discharge_regulations: string;
                conservation_requirements: string;
            };
            reputation_risks: {
                community_relations: string;
                environmental_impact: string;
                stakeholder_perception: string;
            };
        };
        financial_implications: {
            potential_losses: number;
            insurance_costs: string;
            financing_terms: string;
        };
        recommendation: {
            loan_terms: string;
            monitoring_requirements: string;
            collateral_valuation: string;
        };
    };
    agritech_revenue_opportunities: {
        water_management_services: {
            smart_irrigation_systems: {
                potential_revenue: number;
                implementation_cost: number | null;
                roi_period: number | null;
                market_size: string;
            };
            water_monitoring_platforms: {
                subscription_revenue: number;
                installation_fee: number;
                maintenance_fee: number;
            };
            data_analytics_services: {
                per_hectare_fee: number;
                estimated_hectares: string;
                total_revenue: string;
            };
        };
        efficiency_improvements: {
            drip_irrigation_retrofits: {
                cost_per_hectare: number;
                water_savings: string;
                payback_period: string;
            };
            soil_moisture_sensors: {
                cost_per_sensor: number;
                coverage_per_sensor: string;
                roi: string;
            };
            water_recycling_systems: {
                installation_cost: number;
                operational_savings: number;
                roi_period: string;
            };
        };
        revenue_streams: {
            service_fees: number;
            subscription_fees: string;
            data_licensing: string;
            consulting_services: string;
        };
    };
}

export interface Recommendation {
    category: string;
    actions: string[];
    priority: string;
}

export interface Summary {
    key_findings: string[];
    recommendations: Recommendation[];
    next_steps: string[];
}

export interface IrrigationWaterResponse {
    message: string;
    api: string;
    data: {
        metadata: Metadata;
        company: Company;
        reporting_period: ReportingPeriod;
        confidence_score: ConfidenceScore;
        water_usage_analysis: WaterUsageAnalysis;
        environmental_metrics: EnvironmentalMetrics;
        all_esg_metrics: AllEsgMetrics;
        graphs: Record<string, any>;
        stakeholder_benefits: StakeholderBenefits;
        summary: Summary;
    };
}

export interface IrrigationWaterParams {
    companyId: string;
    year?: number;
}

/**
 * Get irrigation water data for a company
 */
export const getIrrigationWaterData = async (
    params: IrrigationWaterParams
): Promise<IrrigationWaterResponse> => {
    try {
        const { companyId, year } = params;

        // Build query parameters
        const queryParams = new URLSearchParams();
        if (year !== undefined) {
            queryParams.append('year', year.toString());
        }

        const queryString = queryParams.toString();
        const url = `/esg-dashboard/irrigation-water/${companyId}${queryString ? `?${queryString}` : ''}`;

        const { data } = await api.get<IrrigationWaterResponse>(url);
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
                throw new Error("Irrigation water data not found for the specified company.");
            case 422:
                throw new Error(errorMessage || "Invalid year parameter or data format.");
            case 500:
                throw new Error("Server error occurred while fetching irrigation water data.");
            case 503:
                throw new Error("Irrigation water service is temporarily unavailable.");
            default:
                throw new Error(
                    errorMessage ||
                    error.response?.data?.detail ||
                    "Failed to fetch irrigation water data"
                );
        }
    }
};

/**
 * Get available years for irrigation water data
 */
export const getAvailableIrrigationWaterYears = (data: IrrigationWaterResponse): number[] => {
    return data.data.reporting_period.data_available_years || [];
};

/**
 * Get water usage analysis data
 */
export const getWaterUsageAnalysis = (data: IrrigationWaterResponse) => {
    return data.data.water_usage_analysis;
};

/**
 * Get irrigation water usage data
 */
export const getIrrigationWaterUsage = (data: IrrigationWaterResponse) => {
    return data.data.water_usage_analysis.irrigation_water;
};

/**
 * Get treatment water usage data
 */
export const getTreatmentWaterUsage = (data: IrrigationWaterResponse) => {
    return data.data.water_usage_analysis.treatment_water;
};

/**
 * Get total water usage data
 */
export const getTotalWaterUsage = (data: IrrigationWaterResponse) => {
    return data.data.water_usage_analysis.total_water_usage;
};

/**
 * Get water shortage risk assessment
 */
export const getWaterShortageRisk = (data: IrrigationWaterResponse) => {
    return data.data.water_usage_analysis.shortage_risk;
};

/**
 * Get water savings analysis
 */
export const getWaterSavingsAnalysis = (data: IrrigationWaterResponse) => {
    return data.data.water_usage_analysis.water_savings_analysis;
};

/**
 * Get environmental metrics data
 */
export const getEnvironmentalMetricsData = (data: IrrigationWaterResponse) => {
    return data.data.environmental_metrics;
};

/**
 * Get detailed environmental metrics
 */
export const getDetailedEnvironmentalMetrics = (data: IrrigationWaterResponse) => {
    return data.data.environmental_metrics.detailed_metrics;
};

/**
 * Get environmental metrics summary
 */
export const getEnvironmentalMetricsSummary = (data: IrrigationWaterResponse) => {
    return data.data.environmental_metrics.summary;
};

/**
 * Get all ESG metrics
 */
export const getAllEsgMetrics = (data: IrrigationWaterResponse) => {
    return data.data.all_esg_metrics;
};

/**
 * Get environmental ESG metrics
 */
export const getEnvironmentalEsgMetrics = (data: IrrigationWaterResponse) => {
    return data.data.all_esg_metrics.environmental;
};

/**
 * Get social ESG metrics
 */
export const getSocialEsgMetrics = (data: IrrigationWaterResponse) => {
    return data.data.all_esg_metrics.social;
};

/**
 * Get governance ESG metrics
 */
export const getGovernanceEsgMetrics = (data: IrrigationWaterResponse) => {
    return data.data.all_esg_metrics.governance;
};

/**
 * Get stakeholder benefits analysis
 */
export const getStakeholderBenefits = (data: IrrigationWaterResponse) => {
    return data.data.stakeholder_benefits;
};

/**
 * Get farmers benefits analysis
 */
export const getFarmersBenefits = (data: IrrigationWaterResponse) => {
    return data.data.stakeholder_benefits.farmers;
};

/**
 * Get banks risk analysis
 */
export const getBanksRiskAnalysis = (data: IrrigationWaterResponse) => {
    return data.data.stakeholder_benefits.banks;
};

/**
 * Get agritech revenue opportunities
 */
export const getAgritechRevenueOpportunities = (data: IrrigationWaterResponse) => {
    return data.data.stakeholder_benefits.agritech_revenue_opportunities;
};

/**
 * Get summary and recommendations
 */
export const getIrrigationWaterSummary = (data: IrrigationWaterResponse) => {
    return data.data.summary;
};

/**
 * Get key findings
 */
export const getKeyFindings = (data: IrrigationWaterResponse) => {
    return data.data.summary.key_findings;
};

/**
 * Get recommendations
 */
export const getRecommendations = (data: IrrigationWaterResponse) => {
    return data.data.summary.recommendations;
};

/**
 * Get next steps
 */
export const getNextSteps = (data: IrrigationWaterResponse) => {
    return data.data.summary.next_steps;
};

/**
 * Get confidence score
 */
export const getConfidenceScore = (data: IrrigationWaterResponse) => {
    return data.data.confidence_score;
};

/**
 * Get water efficiency score
 */
export const getWaterEfficiencyScore = (data: IrrigationWaterResponse) => {
    return data.data.water_usage_analysis.irrigation_water.efficiency_score;
};

/**
 * Get water savings potential
 */
export const getWaterSavingsPotential = (data: IrrigationWaterResponse) => {
    return data.data.water_usage_analysis.water_savings_analysis.potential_savings;
};

/**
 * Get cost savings from water efficiency
 */
export const getWaterCostSavings = (data: IrrigationWaterResponse) => {
    return data.data.water_usage_analysis.water_savings_analysis.cost_savings;
};

/**
 * Get water usage per hectare
 */
export const getWaterUsagePerHectare = (data: IrrigationWaterResponse) => {
    return data.data.water_usage_analysis.total_water_usage.per_hectare;
};

/**
 * Get water usage benchmark
 */
export const getWaterUsageBenchmark = (data: IrrigationWaterResponse) => {
    return data.data.water_usage_analysis.total_water_usage.benchmark;
};

/**
 * Get irrigation water current value
 */
export const getIrrigationWaterCurrentValue = (data: IrrigationWaterResponse) => {
    return data.data.water_usage_analysis.irrigation_water.current_value;
};

/**
 * Get treatment water current value
 */
export const getTreatmentWaterCurrentValue = (data: IrrigationWaterResponse) => {
    return data.data.water_usage_analysis.treatment_water.current_value;
};

/**
 * Get total water current value
 */
export const getTotalWaterCurrentValue = (data: IrrigationWaterResponse) => {
    return data.data.water_usage_analysis.total_water_usage.current_value;
};

/**
 * Get water shortage risk level
 */
export const getWaterShortageRiskLevel = (data: IrrigationWaterResponse) => {
    return data.data.water_usage_analysis.shortage_risk.level;
};

/**
 * Get water shortage risk probability
 */
export const getWaterShortageRiskProbability = (data: IrrigationWaterResponse) => {
    return data.data.water_usage_analysis.shortage_risk.probability;
};

/**
 * Get water shortage mitigation strategies
 */
export const getWaterShortageMitigationStrategies = (data: IrrigationWaterResponse) => {
    return data.data.water_usage_analysis.shortage_risk.mitigation_strategies;
};

/**
 * Get ROI period for water efficiency improvements
 */
export const getWaterEfficiencyROIPeriod = (data: IrrigationWaterResponse) => {
    return data.data.water_usage_analysis.water_savings_analysis.roi_period;
};

/**
 * Check if water data is available
 */
export const isWaterDataAvailable = (data: IrrigationWaterResponse): boolean => {
    return data.data.water_usage_analysis.irrigation_water.current_value !== null ||
        data.data.water_usage_analysis.treatment_water.current_value !== null;
};

/**
 * Get company information
 */
export const getIrrigationWaterCompany = (data: IrrigationWaterResponse) => {
    return data.data.company;
};

/**
 * Get current year
 */
export const getCurrentIrrigationWaterYear = (data: IrrigationWaterResponse) => {
    return data.data.reporting_period.current_year;
};

/**
 * Get area of interest metadata
 */
export const getIrrigationWaterAreaOfInterest = (data: IrrigationWaterResponse) => {
    return data.data.company.area_of_interest_metadata;
};

/**
 * Get coordinates for mapping
 */
export const getIrrigationWaterCoordinates = (data: IrrigationWaterResponse): Coordinate[] => {
    return data.data.company.area_of_interest_metadata?.coordinates || [];
};

/**
 * Get metadata information
 */
export const getIrrigationWaterMetadata = (data: IrrigationWaterResponse) => {
    return data.data.metadata;
};

/**
 * Get GHG emissions data from environmental metrics
 */
export const getGHGEmissionsData = (data: IrrigationWaterResponse) => {
    const metrics = data.data.environmental_metrics.detailed_metrics;
    const ghgMetrics = {
        total: metrics.find(m => m.name === "Carbon Emissions (Total GHG, tCO2e)"),
        scope1: metrics.find(m => m.name === "GHG Scope 1 (tCO2e)"),
        scope2: metrics.find(m => m.name === "GHG Scope 2 (tCO2e)"),
        scope3: metrics.find(m => m.name === "GHG Scope 3 (tCO2e)")
    };
    return ghgMetrics;
};

/**
 * Get energy consumption data
 */
export const getEnergyConsumptionData = (data: IrrigationWaterResponse) => {
    const metrics = data.data.environmental_metrics.detailed_metrics;
    return {
        bagasse: metrics.find(m => m.name === "Energy Consumption (Renewable) - Bagasse Usage"),
        solar: metrics.find(m => m.name === "Energy Consumption (Renewable) - Solar Energy Usage"),
        coal: metrics.find(m => m.name === "Energy Consumption - Coal Consumption"),
        insideDiesel: metrics.find(m => m.name === "Energy Consumption - Inside Company Diesel Usage"),
        insidePetrol: metrics.find(m => m.name === "Energy Consumption - Inside Company Petrol Usage"),
        outsidePetrol: metrics.find(m => m.name === "Energy Consumption - Outside Company Petrol Usage"),
        outsideDiesel: metrics.find(m => m.name === "Energy Consumption - Outside Company Diesel Usage"),
        electricityGenerated: metrics.find(m => m.name === "Energy Consumption - Electricity Generated"),
        electricityPurchased: metrics.find(m => m.name === "Energy Consumption - Electricity Purchased"),
        electricityExported: metrics.find(m => m.name === "Energy Consumption - Electricity Exported to National Grid")
    };
};

/**
 * Get water metrics from detailed environmental metrics
 */
export const getWaterMetrics = (data: IrrigationWaterResponse) => {
    const metrics = data.data.environmental_metrics.detailed_metrics;
    return {
        irrigation: metrics.find(m => m.name === "Water Usage - Irrigation Water Usage"),
        treatment: metrics.find(m => m.name === "Water treatment"),
        effluent: metrics.find(m => m.name === "Effluent discharge for Irrigation")
    };
};

/**
 * Get waste management data
 */
export const getWasteManagementData = (data: IrrigationWaterResponse) => {
    const metrics = data.data.environmental_metrics.detailed_metrics;
    return {
        recycled: metrics.find(m => m.name === "Waste Management - Recycled waste (excl. Boiler Ash)"),
        disposed: metrics.find(m => m.name === "Waste Management - Disposed waste (excl. Boiler Ash)"),
        incidents: metrics.find(m => m.name === "Environment Incidents"),
        generalWaste: metrics.find(m => m.name === "Environment Incidents - Waste streams produced - General Waste"),
        hazardousWaste: metrics.find(m => m.name === "Environment Incidents - Waste streams produced - Hazardous waste"),
        boilerAsh: metrics.find(m => m.name === "Environment Incidents - Waste streams produced - Boiler ash"),
        recyclableWaste: metrics.find(m => m.name === "Environment Incidents - Waste streams produced - Recyclable waste")
    };
};

/**
 * Get high priority recommendations
 */
export const getHighPriorityRecommendations = (data: IrrigationWaterResponse) => {
    return data.data.summary.recommendations.filter(rec => rec.priority === "High");
};

/**
 * Get medium priority recommendations
 */
export const getMediumPriorityRecommendations = (data: IrrigationWaterResponse) => {
    return data.data.summary.recommendations.filter(rec => rec.priority === "Medium");
};

/**
 * Get low priority recommendations
 */
export const getLowPriorityRecommendations = (data: IrrigationWaterResponse) => {
    return data.data.summary.recommendations.filter(rec => rec.priority === "Low");
};

/**
 * Check if water risk is assessed
 */
export const isWaterRiskAssessed = (data: IrrigationWaterResponse): boolean => {
    return data.data.water_usage_analysis.shortage_risk.level !== "unknown";
};

/**
 * Get estimated water savings for farmers
 */
export const getFarmersWaterSavings = (data: IrrigationWaterResponse) => {
    return data.data.stakeholder_benefits.farmers.water_savings;
};

/**
 * Get banks' risk assessment
 */
export const getBanksRiskAssessment = (data: IrrigationWaterResponse) => {
    return data.data.stakeholder_benefits.banks.water_related_risks;
};

/**
 * Get agritech revenue potential
 */
export const getAgritechRevenuePotential = (data: IrrigationWaterResponse) => {
    const services = data.data.stakeholder_benefits.agritech_revenue_opportunities.water_management_services;
    return {
        smartIrrigation: services.smart_irrigation_systems.potential_revenue,
        waterMonitoring: services.water_monitoring_platforms.subscription_revenue,
        totalPotential: services.smart_irrigation_systems.potential_revenue +
            services.water_monitoring_platforms.subscription_revenue
    };
};