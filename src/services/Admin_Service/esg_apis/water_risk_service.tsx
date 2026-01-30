/**
 * =====================
 * Types & Interfaces for Irrigation/Water Data
 * =====================
 */

export interface Coordinate {
    lat: number;
    lon: number;
    _id: string;
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
    created_at: string;
    updated_at: string;
}

export interface AnalysisPeriod {
    currentYear: number;
    previousYear: number | null;
    availableYears: number[];
    dataRange: string;
}

export interface KeyTotal {
    value: number | string;
    unit: string;
    trend?: string;
    industryBenchmark?: number;
    performance?: string;
    percentageOfTotal?: number;
    coverage?: string;
    gap?: number;
    rate?: number;
    volume?: number;
    unitVolume?: string;
    rating?: string;
    percentageOfTotalStr?: string;
    intensity?: number;
    unitIntensity?: string;
    drivers?: string[];
    level?: string;
    components?: {
        physical: number;
        regulatory: number;
        operational: number;
    };
    roiPeriod?: string;
}

export interface KeyTotals {
    totalWaterWithdrawal: KeyTotal;
    irrigationWaterUsage: KeyTotal;
    waterTreatmentCapacity: KeyTotal;
    waterReuse: KeyTotal;
    waterRelatedEnergy: KeyTotal;
    waterEfficiency: KeyTotal;
    waterRiskIndex: KeyTotal;
    costImplications: KeyTotal;
}

export interface MetricValue {
    year: number;
    value: string;
    numeric_value: number;
    source_notes: string;
    added_by: string;
    added_at: string;
    last_updated_at: string;
}

export interface Metric {
    metric_name: string;
    unit: string | null;
    description: string | null;
    is_active: boolean;
    category: string;
    values: MetricValue[];
}

export interface Metrics {
    water: Record<string, Metric[]>;
    energy: Record<string, Metric[]>;
    risk: Record<string, Metric[]>;
    all: {
        environmental: Metric[];
        social: Metric[];
        governance: Metric[];
        companyInfo: {
            name: string;
            industry: string;
            country: string;
            esgReportingFramework: string[];
            latestEsgReportYear: number;
            esgDataStatus: string;
            dataSource: string;
            verificationStatus: string;
            dataQualityScore: number | null;
            reportingPeriod: {
                start: number;
                end: number;
            };
        };
    };
}

export interface RiskScore {
    score: string | number;
    level: string;
    description?: string;
    factors?: string[];
    treatmentCoverage?: string;
    complianceStatus?: string;
    upcomingRegulations?: string[];
    annualCost?: string;
    exposure?: string;
    insurancePremium?: string;
}

export interface RiskAssessment {
    droughtRisk: RiskScore;
    scarcityRisk: RiskScore;
    qualityRisk: RiskScore;
    regulatoryRisk: RiskScore;
    financialRisk: RiskScore;
}

export interface ProjectionItem {
    year: number;
    value: string;
    change: string;
}

export interface EfficiencyGain {
    year: number;
    potentialSavings: string;
    investment: string;
}

export interface ClimateImpact {
    rainfallVariability: string;
    temperatureIncrease: string;
    evaporationLoss: string;
}

export interface Projections {
    scarcity: ProjectionItem[];
    efficiencyGains: EfficiencyGain[];
    climateImpact: ClimateImpact;
}

export interface GraphDataset {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string | string[];
    borderWidth?: number;
    borderDash?: number[];
    fill?: boolean;
    tension?: number;
    yAxisID?: string;
}

export interface GraphOptions {
    scales?: {
        y?: {
            type: string;
            position: string;
            title?: {
                display: boolean;
                text: string;
            };
        };
        y1?: {
            type: string;
            position: string;
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
    labels: (string | number)[];
    datasets: GraphDataset[];
    options?: GraphOptions;
}

export interface Graphs {
    waterUsageTrend: Graph;
    waterBalance: Graph;
    waterEnergyNexus: Graph;
    efficiencyRiskCorrelation: Graph;
    recyclingTrend: Graph;
    riskRadar: Graph;
    scarcityProjection: Graph;
    costBreakdown: Graph;
}

export interface Recommendations {
    highPriority: string[];
    mediumPriority: string[];
    longTerm: string[];
}

export interface Compliance {
    frameworks: string[];
    reportingStatus: string;
    nextReportDue: number;
    keyMetricsDisclosed: string;
    gaps: string;
}

export interface Metadata {
    dataQuality: string;
    verificationStatus: string;
    lastUpdated: string;
    analysisMethodology: string;
}

/**
 * =====================
 * Main Response Interface
 * =====================
 */

export interface IrrigationWaterResponse {
    message: string;
    api: string;
    data: {
        company: Company;
        analysisPeriod: AnalysisPeriod;
        keyTotals: KeyTotals;
        metrics: Metrics;
        riskAssessment: RiskAssessment;
        projections: Projections;
        graphs: Graphs;
        recommendations: Recommendations;
        compliance: Compliance;
        metadata: Metadata;
    };
}

/**
 * =====================
 * Request Parameters
 * =====================
 */

export interface IrrigationWaterParams {
    companyId: string;
    year?: number;
}

/**
 * =====================
 * Irrigation Water Service
 * =====================
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

/**
 * =====================
 * Helper Functions
 * =====================
 */

export const getAvailableWaterYears = (data: IrrigationWaterResponse): number[] => {
    return data.data.analysisPeriod.availableYears || [];
};

export const getCurrentYear = (data: IrrigationWaterResponse): number => {
    return data.data.analysisPeriod.currentYear;
};

export const getWaterSummary = (data: IrrigationWaterResponse) => {
    const totals = data.data.keyTotals;
    return {
        totalWaterWithdrawal: totals.totalWaterWithdrawal,
        irrigationWaterUsage: totals.irrigationWaterUsage,
        waterTreatmentCapacity: totals.waterTreatmentCapacity,
        waterReuse: totals.waterReuse,
        waterEfficiency: totals.waterEfficiency,
        waterRiskIndex: totals.waterRiskIndex,
        costImplications: totals.costImplications,
        waterRelatedEnergy: totals.waterRelatedEnergy,
    };
};

export const getRiskAssessment = (data: IrrigationWaterResponse) => {
    return data.data.riskAssessment;
};

export const getProjections = (data: IrrigationWaterResponse) => {
    return data.data.projections;
};

export const getWaterMetrics = (data: IrrigationWaterResponse) => {
    return data.data.metrics;
};

export const getEnvironmentalMetrics = (data: IrrigationWaterResponse) => {
    return data.data.metrics.all.environmental;
};

export const getSocialMetrics = (data: IrrigationWaterResponse) => {
    return data.data.metrics.all.social;
};

export const getGovernanceMetrics = (data: IrrigationWaterResponse) => {
    return data.data.metrics.all.governance;
};

export const getCompanyInfo = (data: IrrigationWaterResponse) => {
    return data.data.metrics.all.companyInfo;
};

export const getWaterGraphData = (data: IrrigationWaterResponse, graphType: keyof Graphs): Graph => {
    return data.data.graphs[graphType];
};

export const getAllWaterGraphData = (data: IrrigationWaterResponse): Graphs => {
    return data.data.graphs;
};

export const getRecommendations = (data: IrrigationWaterResponse) => {
    return data.data.recommendations;
};

export const getComplianceInfo = (data: IrrigationWaterResponse) => {
    return data.data.compliance;
};

export const getMetadata = (data: IrrigationWaterResponse) => {
    return data.data.metadata;
};

export const getWaterEfficiencyScore = (data: IrrigationWaterResponse): number => {
    return data.data.keyTotals.waterEfficiency.score as number;
};

export const getWaterRiskScore = (data: IrrigationWaterResponse): number => {
    return data.data.keyTotals.waterRiskIndex.score as number;
};

export const getWaterUsageTrend = (data: IrrigationWaterResponse) => {
    return data.data.graphs.waterUsageTrend;
};

export const getWaterBalanceData = (data: IrrigationWaterResponse) => {
    return data.data.graphs.waterBalance;
};

export const getWaterEnergyNexusData = (data: IrrigationWaterResponse) => {
    return data.data.graphs.waterEnergyNexus;
};

export const getRiskRadarData = (data: IrrigationWaterResponse) => {
    return data.data.graphs.riskRadar;
};

export const getScarcityProjectionData = (data: IrrigationWaterResponse) => {
    return data.data.graphs.scarcityProjection;
};

export const getCostBreakdownData = (data: IrrigationWaterResponse) => {
    return data.data.graphs.costBreakdown;
};

export const getIrrigationWaterUsage = (data: IrrigationWaterResponse, year?: number) => {
    const metrics = data.data.metrics.all.environmental;
    const irrigationMetric = metrics.find(m =>
        m.metric_name === "Water Usage - Irrigation Water Usage"
    );

    if (!irrigationMetric) return null;

    if (year) {
        const yearData = irrigationMetric.values.find(v => v.year === year);
        return yearData ? yearData.numeric_value : null;
    }

    return irrigationMetric.values;
};

export const getWaterTreatmentData = (data: IrrigationWaterResponse, year?: number) => {
    const metrics = data.data.metrics.all.environmental;
    const treatmentMetric = metrics.find(m =>
        m.metric_name === "Water treatment"
    );

    if (!treatmentMetric) return null;

    if (year) {
        const yearData = treatmentMetric.values.find(v => v.year === year);
        return yearData ? yearData.numeric_value : null;
    }

    return treatmentMetric.values;
};

export const getEffluentDischargeData = (data: IrrigationWaterResponse, year?: number) => {
    const metrics = data.data.metrics.all.environmental;
    const effluentMetric = metrics.find(m =>
        m.metric_name === "Effluent discharge for Irrigation"
    );

    if (!effluentMetric) return null;

    if (year) {
        const yearData = effluentMetric.values.find(v => v.year === year);
        return yearData ? yearData.numeric_value : null;
    }

    return effluentMetric.values;
};

export const getWaterMetricsByCategory = (data: IrrigationWaterResponse, category: 'environmental' | 'social' | 'governance') => {
    return data.data.metrics.all[category];
};

export const getMetricByName = (data: IrrigationWaterResponse, metricName: string): Metric | undefined => {
    const categories = ['environmental', 'social', 'governance'] as const;

    for (const category of categories) {
        const metric = data.data.metrics.all[category].find(m => m.metric_name === metricName);
        if (metric) return metric;
    }

    return undefined;
};

export const getYearlyWaterData = (data: IrrigationWaterResponse, year: number) => {
    const result: Record<string, any> = {};
    const categories = ['environmental', 'social', 'governance'] as const;

    for (const category of categories) {
        const metrics = data.data.metrics.all[category];
        metrics.forEach(metric => {
            const yearData = metric.values.find(v => v.year === year);
            if (yearData) {
                result[metric.metric_name] = {
                    value: yearData.numeric_value,
                    unit: metric.unit,
                    description: metric.description
                };
            }
        });
    }

    return result;
};

export const getWaterRiskComponents = (data: IrrigationWaterResponse) => {
    return data.data.keyTotals.waterRiskIndex.components;
};

export const getEfficiencyDrivers = (data: IrrigationWaterResponse) => {
    return data.data.keyTotals.waterEfficiency.drivers;
};

export const getHighPriorityRecommendations = (data: IrrigationWaterResponse) => {
    return data.data.recommendations.highPriority;
};

export const getMediumPriorityRecommendations = (data: IrrigationWaterResponse) => {
    return data.data.recommendations.mediumPriority;
};

export const getLongTermRecommendations = (data: IrrigationWaterResponse) => {
    return data.data.recommendations.longTerm;
};

export const getComplianceFrameworks = (data: IrrigationWaterResponse) => {
    return data.data.compliance.frameworks;
};

export const getDataQuality = (data: IrrigationWaterResponse) => {
    return data.data.metadata.dataQuality;
};

export const getVerificationStatus = (data: IrrigationWaterResponse) => {
    return data.data.metadata.verificationStatus;
};

export const getAnalysisMethodology = (data: IrrigationWaterResponse) => {
    return data.data.metadata.analysisMethodology;
};

export const getLastUpdated = (data: IrrigationWaterResponse) => {
    return data.data.metadata.lastUpdated;
};

export const getAreaOfInterest = (data: IrrigationWaterResponse) => {
    return data.data.company.area_of_interest_metadata;
};

export const getEsgContactPerson = (data: IrrigationWaterResponse) => {
    return data.data.company.esg_contact_person;
};

export const getDataSources = (data: IrrigationWaterResponse) => {
    return data.data.company.data_source;
};

export const getEsgFrameworks = (data: IrrigationWaterResponse) => {
    return data.data.company.esg_reporting_framework;
};