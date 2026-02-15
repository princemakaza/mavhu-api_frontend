import api from "../Auth_service/api";

// ==================== Existing interfaces (reused) ====================
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

// ==================== New interfaces matching the API response ====================

export interface Metadata {
    api_version: string;
    generated_at: string;
    endpoint: string;
    company_id: string;
    year: number;
}

export interface EnvironmentalMetricValue {
    year: number;
    value: string;
    numeric_value: number;
    source_notes?: string;
    added_by?: string;
    added_at?: string;
}

export interface EnvironmentalMetric {
    metric_name: string;
    unit: string;
    description: string;
    value: EnvironmentalMetricValue;
}

export interface MetricYearlyDataPoint {
    year: string;
    value: number;
    unit: string;
    source: string;
    added_by: string;
    _id: string;
    added_at: string;
    last_updated_at: string;
}

export interface IrrigationEfficiencyMetric {
    category: string;
    metric_name: string;
    data_type: string;
    yearly_data: MetricYearlyDataPoint[];
    single_value: { added_at: string };
    is_active: boolean;
    created_by: string;
    _id: string;
    list_data: any[];
    created_at: string;
}

export interface GriReference {
    standard: string;
    metric_name: string;
    compliance_status: string;
    reporting_year: string;
    _id: string;
}

export interface IrrigationEfficiencyData {
    _id: string;
    company: string;
    data_period_start: string;
    data_period_end: string;
    original_source: string;
    import_source: string;
    source_file_name?: string;
    import_batch_id?: string;
    import_date: string;
    data_quality_score: number | null;
    verification_status: string;
    validation_status: string;
    metrics: IrrigationEfficiencyMetric[];
    summary_stats: {
        total_irrigation_water: number;
        avg_water_per_hectare: number;
        total_effluent_discharged: number;
        avg_water_treatment: number;
        water_sources_count: number;
        last_updated?: string;
    };
    created_by: string;
    last_updated_by: string | null;
    version: number;
    is_active: boolean;
    source_files: any[];
    validation_errors: any[];
    gri_references?: GriReference[];
    forecast_data: any[];
    risk_assessment: any[];
    created_at: string;
    last_updated_at: string;
    __v: number;
    // optional fields from second object
    import_notes?: string;
    validation_notes?: string;
    verified_at?: string | null;
    verified_by?: string | null;
    source_file_metadata?: any;
}

export interface ShortageRisk {
    level: string;
    probability: number;
    factors: string[];
    mitigation: string[];
}

export interface WaterRiskAnalysis {
    irrigation_water: {
        value: number | null;
        trend: string;
    };
    treatment_water: {
        value: number | null;
        trend: string;
    };
    total_water_usage: number | null;
    shortage_risk: ShortageRisk;
    savings_potential: number | null;
}

export interface Graphs {
    risk_assessment: {
        type: string;
        title: string;
        labels: string[];
        datasets: Array<{
            label: string;
            data: number[];
        }>;
    };
}

export interface DataQuality {
    score: number;
    verification_status: string;
    validation_status: string;
    metrics_count: number;
    water_metrics_count: number;
}

export interface Recommendation {
    category: string;
    actions: string[];
    priority: string;
}

export interface Summary {
    key_findings: string[];
    recommendations: Recommendation[];
}

export interface IrrigationWaterResponse {
    message: string;
    api: string;
    data: {
        metadata: Metadata;
        company: Company;
        environmental_metrics: EnvironmentalMetric[];
        water_metrics: any[]; // empty in example
        existing_irrigation_efficiency_data: IrrigationEfficiencyData[];
        water_risk_analysis: WaterRiskAnalysis;
        graphs: Graphs;
        data_quality: DataQuality;
        summary: Summary;
    };
}

export interface IrrigationWaterParams {
    companyId: string;
    year?: number;
}

// ==================== Helper functions ====================

/**
 * Get irrigation water data for a company
 */
export const getIrrigationWaterData = async (
    params: IrrigationWaterParams
): Promise<IrrigationWaterResponse> => {
    try {
        const { companyId, year } = params;

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

// ==================== Data extraction helpers ====================

/**
 * Get the active irrigation efficiency data record
 */
const getActiveIrrigationData = (data: IrrigationWaterResponse): IrrigationEfficiencyData | undefined => {
    return data.data.existing_irrigation_efficiency_data.find(item => item.is_active === true);
};

/**
 * Get a specific metric from the active irrigation efficiency data by metric name
 */
export const getIrrigationMetric = (data: IrrigationWaterResponse, metricName: string): IrrigationEfficiencyMetric | undefined => {
    const active = getActiveIrrigationData(data);
    return active?.metrics.find(m => m.metric_name === metricName);
};

/**
 * Get the latest yearly value for a metric (by highest year)
 */
const getLatestYearlyValue = (metric: IrrigationEfficiencyMetric | undefined): number | null => {
    if (!metric || !metric.yearly_data || metric.yearly_data.length === 0) return null;
    const sorted = [...metric.yearly_data].sort((a, b) => parseInt(b.year) - parseInt(a.year));
    return sorted[0]?.value ?? null;
};

/**
 * Get available years for irrigation water data
 */
export const getAvailableIrrigationWaterYears = (data: IrrigationWaterResponse): number[] => {
    const years = new Set<number>();
    data.data.existing_irrigation_efficiency_data.forEach(record => {
        record.metrics.forEach(metric => {
            metric.yearly_data.forEach(dp => {
                const y = parseInt(dp.year);
                if (!isNaN(y)) years.add(y);
            });
        });
    });
    return Array.from(years).sort((a, b) => a - b);
};

/**
 * Get water usage analysis (compatible with old structure)
 */
export const getWaterUsageAnalysis = (data: IrrigationWaterResponse) => {
    const irrigationMetric = getIrrigationMetric(data, "Total Irrigation Water (million ML)");
    const treatmentMetric = getIrrigationMetric(data, "Water Treatment for Chiredzi (million ML)");
    const waterPerHaMetric = getIrrigationMetric(data, "Water per Hectare (ML/ha)");
    const effluentMetric = getIrrigationMetric(data, "Effluent Discharged (thousand ML)");

    return {
        irrigation_water: {
            current_value: getLatestYearlyValue(irrigationMetric),
            unit: irrigationMetric?.yearly_data[0]?.unit || "million ML",
            trend: data.data.water_risk_analysis.irrigation_water.trend,
            efficiency_score: null,
            savings_potential: data.data.water_risk_analysis.savings_potential,
            monthly_data: []
        },
        treatment_water: {
            current_value: getLatestYearlyValue(treatmentMetric),
            unit: treatmentMetric?.yearly_data[0]?.unit || "million ML",
            trend: data.data.water_risk_analysis.treatment_water.trend,
            efficiency_score: null,
            savings_potential: null,
            monthly_data: []
        },
        total_water_usage: {
            current_value: data.data.water_risk_analysis.total_water_usage,
            unit: "million ML",
            trend: "unknown",
            per_hectare: getLatestYearlyValue(waterPerHaMetric),
            benchmark: null
        },
        shortage_risk: {
            level: data.data.water_risk_analysis.shortage_risk.level,
            probability: data.data.water_risk_analysis.shortage_risk.probability,
            factors: data.data.water_risk_analysis.shortage_risk.factors,
            mitigation_strategies: data.data.water_risk_analysis.shortage_risk.mitigation
        },
        water_savings_analysis: {
            potential_savings: data.data.water_risk_analysis.savings_potential,
            cost_savings: null,
            implementation_cost: null,
            roi_period: null,
            recommendations: []
        }
    };
};

/**
 * Get irrigation water usage data
 */
export const getIrrigationWaterUsage = (data: IrrigationWaterResponse) => {
    const usage = getWaterUsageAnalysis(data);
    return usage.irrigation_water;
};

/**
 * Get treatment water usage data
 */
export const getTreatmentWaterUsage = (data: IrrigationWaterResponse) => {
    const usage = getWaterUsageAnalysis(data);
    return usage.treatment_water;
};

/**
 * Get total water usage data
 */
export const getTotalWaterUsage = (data: IrrigationWaterResponse) => {
    const usage = getWaterUsageAnalysis(data);
    return usage.total_water_usage;
};

/**
 * Get water shortage risk assessment
 */
export const getWaterShortageRisk = (data: IrrigationWaterResponse) => {
    return data.data.water_risk_analysis.shortage_risk;
};

/**
 * Get water savings analysis
 */
export const getWaterSavingsAnalysis = (data: IrrigationWaterResponse) => {
    const usage = getWaterUsageAnalysis(data);
    return usage.water_savings_analysis;
};

/**
 * Get environmental metrics data (array of metrics)
 */
export const getEnvironmentalMetricsData = (data: IrrigationWaterResponse) => {
    return data.data.environmental_metrics;
};

/**
 * Get detailed environmental metrics (array of processed metrics)
 */
export const getDetailedEnvironmentalMetrics = (data: IrrigationWaterResponse) => {
    return data.data.environmental_metrics.map(metric => ({
        name: metric.metric_name,
        category: "environmental",
        unit: metric.unit,
        description: metric.description,
        current_value: metric.value.numeric_value,
        trend: "unknown", // not provided
        years_available: [metric.value.year],
        values: [{
            year: metric.value.year,
            value: metric.value.value,
            numeric_value: metric.value.numeric_value,
            source_notes: metric.value.source_notes
        }]
    }));
};

/**
 * Get environmental metrics summary
 */
export const getEnvironmentalMetricsSummary = (data: IrrigationWaterResponse) => {
    const metrics = data.data.environmental_metrics;
    const findNumeric = (name: string) => metrics.find(m => m.metric_name === name)?.value.numeric_value ?? 0;

    return {
        total_ghg_emissions: findNumeric("Carbon Emissions (Total GHG, tCO2e)"),
        scope1_emissions: findNumeric("GHG Scope 1 (tCO2e)"),
        scope2_emissions: findNumeric("GHG Scope 2 (tCO2e)"),
        scope3_emissions: findNumeric("GHG Scope 3 (tCO2e)"),
        irrigation_water_usage: findNumeric("Water Usage - Irrigation Water Usage") || null,
        treatment_water_usage: findNumeric("Water treatment") || null,
        total_water_usage: data.data.water_risk_analysis.total_water_usage
    };
};

/**
 * Get all ESG metrics (only environmental available)
 */
export const getAllEsgMetrics = (data: IrrigationWaterResponse) => {
    const env: Record<string, any> = {};
    data.data.environmental_metrics.forEach(m => {
        env[m.metric_name] = {
            name: m.metric_name,
            category: "environmental",
            unit: m.unit,
            description: m.description,
            values: [{
                year: m.value.year,
                value: m.value.value,
                numeric_value: m.value.numeric_value,
                source_notes: m.value.source_notes
            }]
        };
    });

    return {
        environmental: env,
        social: {},
        governance: {}
    };
};

/**
 * Get environmental ESG metrics
 */
export const getEnvironmentalEsgMetrics = (data: IrrigationWaterResponse) => {
    return getAllEsgMetrics(data).environmental;
};

/**
 * Get social ESG metrics (empty)
 */
export const getSocialEsgMetrics = () => {
    return {};
};

/**
 * Get governance ESG metrics (empty)
 */
export const getGovernanceEsgMetrics = () => {
    return {};
};

/**
 * Get stakeholder benefits (not available, returns empty structure)
 */
export const getStakeholderBenefits = () => {
    return {
        farmers: {
            water_savings: { estimated_savings: 0, unit: "", cost_savings: 0, currency: "" },
            crop_yield_improvement: { estimated_improvement: "", factors: [] },
            input_cost_reduction: { water_pumping_costs: 0, fertilizer_efficiency: "", labor_savings: "" },
            risk_reduction: { drought_risk: "", water_cost_volatility: "", regulatory_compliance: "" }
        },
        banks: {
            water_related_risks: {
                shortage_risk: { level: "", probability: null, impact: "", mitigation: [] },
                regulatory_risks: { water_use_permits: "", discharge_regulations: "", conservation_requirements: "" },
                reputation_risks: { community_relations: "", environmental_impact: "", stakeholder_perception: "" }
            },
            financial_implications: { potential_losses: 0, insurance_costs: "", financing_terms: "" },
            recommendation: { loan_terms: "", monitoring_requirements: "", collateral_valuation: "" }
        },
        agritech_revenue_opportunities: {
            water_management_services: {
                smart_irrigation_systems: { potential_revenue: 0, implementation_cost: null, roi_period: null, market_size: "" },
                water_monitoring_platforms: { subscription_revenue: 0, installation_fee: 0, maintenance_fee: 0 },
                data_analytics_services: { per_hectare_fee: 0, estimated_hectares: "", total_revenue: "" }
            },
            efficiency_improvements: {
                drip_irrigation_retrofits: { cost_per_hectare: 0, water_savings: "", payback_period: "" },
                soil_moisture_sensors: { cost_per_sensor: 0, coverage_per_sensor: "", roi: "" },
                water_recycling_systems: { installation_cost: 0, operational_savings: 0, roi_period: "" }
            },
            revenue_streams: { service_fees: 0, subscription_fees: "", data_licensing: "", consulting_services: "" }
        }
    };
};

/**
 * Get farmers benefits analysis (empty)
 */
export const getFarmersBenefits = (data: IrrigationWaterResponse) => {
    return getStakeholderBenefits().farmers;
};

/**
 * Get banks risk analysis (empty)
 */
export const getBanksRiskAnalysis = (data: IrrigationWaterResponse) => {
    return getStakeholderBenefits().banks;
};

/**
 * Get agritech revenue opportunities (empty)
 */
export const getAgritechRevenueOpportunities = (data: IrrigationWaterResponse) => {
    return getStakeholderBenefits().agritech_revenue_opportunities;
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
 * Get next steps (not available, return empty array)
 */
export const getNextSteps = () => {
    return [];
};

/**
 * Get confidence score (not available, return default)
 */
export const getConfidenceScore = (data: IrrigationWaterResponse) => {
    return {
        overall: data.data.data_quality.score,
        interpretation: data.data.data_quality.verification_status,
        factors: []
    };
};

/**
 * Get water efficiency score (not available)
 */
export const getWaterEfficiencyScore = () => {
    return null;
};

/**
 * Get water savings potential
 */
export const getWaterSavingsPotential = (data: IrrigationWaterResponse) => {
    return data.data.water_risk_analysis.savings_potential;
};

/**
 * Get cost savings from water efficiency (not available)
 */
export const getWaterCostSavings = () => {
    return null;
};

/**
 * Get water usage per hectare
 */
export const getWaterUsagePerHectare = (data: IrrigationWaterResponse) => {
    const metric = getIrrigationMetric(data, "Water per Hectare (ML/ha)");
    return getLatestYearlyValue(metric);
};

/**
 * Get water usage benchmark (not available)
 */
export const getWaterUsageBenchmark = () => {
    return null;
};

/**
 * Get irrigation water current value
 */
export const getIrrigationWaterCurrentValue = (data: IrrigationWaterResponse) => {
    const metric = getIrrigationMetric(data, "Total Irrigation Water (million ML)");
    return getLatestYearlyValue(metric);
};

/**
 * Get treatment water current value
 */
export const getTreatmentWaterCurrentValue = (data: IrrigationWaterResponse) => {
    const metric = getIrrigationMetric(data, "Water Treatment for Chiredzi (million ML)");
    return getLatestYearlyValue(metric);
};

/**
 * Get total water current value
 */
export const getTotalWaterCurrentValue = (data: IrrigationWaterResponse) => {
    return data.data.water_risk_analysis.total_water_usage;
};

/**
 * Get water shortage risk level
 */
export const getWaterShortageRiskLevel = (data: IrrigationWaterResponse) => {
    return data.data.water_risk_analysis.shortage_risk.level;
};

/**
 * Get water shortage risk probability
 */
export const getWaterShortageRiskProbability = (data: IrrigationWaterResponse) => {
    return data.data.water_risk_analysis.shortage_risk.probability;
};

/**
 * Get water shortage mitigation strategies
 */
export const getWaterShortageMitigationStrategies = (data: IrrigationWaterResponse) => {
    return data.data.water_risk_analysis.shortage_risk.mitigation;
};

/**
 * Get ROI period for water efficiency improvements (not available)
 */
export const getWaterEfficiencyROIPeriod = () => {
    return null;
};

/**
 * Check if water data is available
 */
export const isWaterDataAvailable = (data: IrrigationWaterResponse): boolean => {
    return getIrrigationWaterCurrentValue(data) !== null ||
        getTreatmentWaterCurrentValue(data) !== null;
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
    return data.data.metadata.year;
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
    const metrics = data.data.environmental_metrics;
    const find = (name: string) => metrics.find(m => m.metric_name === name);
    return {
        total: find("Carbon Emissions (Total GHG, tCO2e)"),
        scope1: find("GHG Scope 1 (tCO2e)"),
        scope2: find("GHG Scope 2 (tCO2e)"),
        scope3: find("GHG Scope 3 (tCO2e)")
    };
};

/**
 * Get energy consumption data
 */
export const getEnergyConsumptionData = (data: IrrigationWaterResponse) => {
    const metrics = data.data.environmental_metrics;
    const find = (name: string) => metrics.find(m => m.metric_name === name);
    return {
        bagasse: find("Energy Consumption (Renewable) - Bagasse Usage"),
        solar: find("Energy Consumption (Renewable) - Solar Energy Usage"),
        coal: find("Energy Consumption - Coal Consumption"),
        insideDiesel: find("Energy Consumption - Inside Company Diesel Usage"),
        insidePetrol: find("Energy Consumption - Inside Company Petrol Usage"),
        outsidePetrol: find("Energy Consumption - Outside Company Petrol Usage"),
        outsideDiesel: find("Energy Consumption - Outside Company Diesel Usage"),
        electricityGenerated: find("Energy Consumption - Electricity Generated"),
        electricityPurchased: find("Energy Consumption - Electricity Purchased"),
        electricityExported: find("Energy Consumption - Electricity Exported to National Grid")
    };
};

/**
 * Get water metrics from detailed environmental metrics
 */
export const getWaterMetrics = (data: IrrigationWaterResponse) => {
    const metrics = data.data.environmental_metrics;
    const find = (name: string) => metrics.find(m => m.metric_name === name);
    return {
        irrigation: find("Water Usage - Irrigation Water Usage"),
        treatment: find("Water treatment"),
        effluent: find("Effluent discharge for Irrigation")
    };
};

/**
 * Get waste management data
 */
export const getWasteManagementData = (data: IrrigationWaterResponse) => {
    const metrics = data.data.environmental_metrics;
    const find = (name: string) => metrics.find(m => m.metric_name === name);
    return {
        recycled: find("Waste Management - Recycled waste (excl. Boiler Ash)"),
        disposed: find("Waste Management - Disposed waste (excl. Boiler Ash)"),
        incidents: find("Environment Incidents"),
        generalWaste: find("Environment Incidents - Waste streams produced - General Waste"),
        hazardousWaste: find("Environment Incidents - Waste streams produced - Hazardous waste"),
        boilerAsh: find("Environment Incidents - Waste streams produced - Boiler ash"),
        recyclableWaste: find("Environment Incidents - Waste streams produced - Recyclable waste")
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
    return data.data.water_risk_analysis.shortage_risk.level !== "unknown";
};

/**
 * Get estimated water savings for farmers (not available)
 */
export const getFarmersWaterSavings = () => {
    return {
        estimated_savings: 0,
        unit: "",
        cost_savings: 0,
        currency: ""
    };
};

/**
 * Get banks' risk assessment (not available)
 */
export const getBanksRiskAssessment = () => {
    return {
        shortage_risk: { level: "", probability: null, impact: "", mitigation: [] },
        regulatory_risks: { water_use_permits: "", discharge_regulations: "", conservation_requirements: "" },
        reputation_risks: { community_relations: "", environmental_impact: "", stakeholder_perception: "" }
    };
};

/**
 * Get agritech revenue potential (not available)
 */
export const getAgritechRevenuePotential = () => {
    return {
        smartIrrigation: 0,
        waterMonitoring: 0,
        totalPotential: 0
    };
};