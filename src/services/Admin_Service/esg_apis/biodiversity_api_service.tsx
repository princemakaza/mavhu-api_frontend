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
    period_requested: string;
    data_sources: string[];
}
export interface ReportingPeriod {
    current_year: number;
    baseline_year: number;
    analysis_years: number[];
    period_covered: string;
    data_completeness: string;
    carbon_data_available: boolean;
}
export interface BiodiversityAssessment {
    environmental_metrics: {
        "Carbon Emissions (Total GHG, tCO2e)": number;
        "GHG Scope 1 (tCO2e)": number;
        "GHG Scope 2 (tCO2e)": number;
        "GHG Scope 3 (tCO2e)": number;
    };
    social_metrics: Record<string, any>;
    governance_metrics: Record<string, any>;
    current_year: number;
}
export interface ForestCoverage {
    current: number;
    previous: number;
    change_percent: number;
    coverage_percent: number;
}
export interface AgriculturalExpansion {
    current: number;
    previous: number;
    change_percent: number;
}

export interface ProtectedAreaCoverage {
    area: number;
    percentage: number;
}

export interface DeforestationAnalysis {
    forest_coverage: ForestCoverage;
    agricultural_expansion: AgriculturalExpansion;
    protected_area_coverage: ProtectedAreaCoverage;
}

export interface CurrentYearLandUse {
    total_area: number | null;
    forest_area: number | null;
    agricultural_area: number | null;
    protected_area: number | null;
}

export interface LandUseTrends {
    forest_area_trend: string;
    agricultural_area_trend: string;
}

export interface ChangeAnalysis {
    change_detected: boolean;
    message: string;
}

export interface LandUseMetrics {
    current_year: CurrentYearLandUse;
    trends: LandUseTrends;
    change_analysis: ChangeAnalysis;
}

export interface WaterManagement {
    current_usage: number | null;
    trend: string;
    efficiency: number | null;
}

export interface WasteManagement {
    hazardous_waste: number | null;
    recycled_waste: number | null;
    trend: string;
}

export interface IncidentManagement {
    total_incidents: number | null;
    trend: string;
}

export interface SoilHealth {
    erosion_rate: number | null;
    organic_matter: number | null;
    trend: string;
}

export interface EnvironmentalImpact {
    water_management: WaterManagement;
    waste_management: WasteManagement;
    incident_management: IncidentManagement;
    soil_health: SoilHealth;
}

export interface CommunityEngagement {
    programs_count: number | null;
    local_employment: number | null;
    land_rights_complaints: number | null;
}

export interface GovernanceStrength {
    land_use_policy: string | null;
    biodiversity_policy: string | null;
    compliance_audits: number | null;
}

export interface SocialGovernance {
    community_engagement: CommunityEngagement;
    governance_strength: GovernanceStrength;
}

export interface CarbonFramework {
    sequestration_methodology: string;
    emission_methodology: string;
    calculation_approach: string;
    data_sources: string[];
}

export interface MonthlyCarbonData {
    month: string;
    month_name: string;
    ndvi_max: number;
    ndvi_mean: number;
    biomass_co2: number;
    soc_co2: number;
    total_co2: number;
}

export interface SequestrationData {
    total_tco2: number;
    biomass_co2: number;
    soc_co2: number;
    monthly_data: MonthlyCarbonData[];
}

export interface EmissionsData {
    total_tco2e: number;
    scope1_tco2e: number;
    scope2_tco2e: number;
    scope3_tco2e: number;
    net_balance: number;
}

export interface LandAreaData {
    total_ha: number;
    soc_area_ha: number;
}

export interface YearlyCarbonData {
    year: number;
    sequestration: SequestrationData;
    emissions: EmissionsData;
    land_area: LandAreaData;
}

export interface CarbonEmissionAccounting {
    framework: CarbonFramework;
    methodology: string;
    yearly_data: YearlyCarbonData[];
}

export interface EsgMetricValue {
    year: number;
    value: string;
    numeric_value: number;
    source_notes: string;
}

export interface EnvironmentalMetric {
    name: string;
    unit: string;
    description: string;
    current_value: number;
    values: EsgMetricValue[];
}

export interface EsgMetrics {
    environmental: EnvironmentalMetric[];
    social: any[];
    governance: any[];
}

export interface GraphDataset {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
    borderDash?: number[];
}

export interface Graph {
    type: string;
    title: string;
    description: string;
    labels: string[];
    datasets: GraphDataset[];
}

export interface Graphs {
    ndvi_monthly_trends: {
        [year: string]: Graph;
    };
}

export interface KeyStatistics {
    total_metrics_analyzed: number;
    years_covered: number;
    current_year: number;
    environmental_metrics: Record<string, any>;
    biodiversity_metrics: Record<string, any>;
    social_governance_metrics: Record<string, any>;
}

export interface DataAvailability {
    total_metrics: number;
    years_covered: number;
    carbon_data: boolean;
    ndvi_data: boolean;
}

export interface NotableMetrics {
    forest_coverage: number | null;
    water_usage: number | null;
    incidents_count: number | null;
}

export interface Summary {
    data_availability: DataAvailability;
    notable_metrics: NotableMetrics;
}

/**
 * =====================
 * Main Response Interface
 * =====================
 */
export interface BiodiversityLandUseResponse {
    message: string;
    api: string;
    data: {
        metadata: Metadata;
        company: Company;
        reporting_period: ReportingPeriod;
        biodiversity_assessment: BiodiversityAssessment;
        deforestation_analysis: DeforestationAnalysis;
        land_use_metrics: LandUseMetrics;
        environmental_impact: EnvironmentalImpact;
        social_governance: SocialGovernance;
        carbon_emission_accounting: CarbonEmissionAccounting;
        esg_metrics: EsgMetrics;
        graphs: Graphs;
        key_statistics: KeyStatistics;
        summary: Summary;
    };
}

/**
 * =====================
 * Request Parameters
 * =====================
 */
export interface BiodiversityLandUseParams {
    companyId: string;
    year?: number;
}

/**
 * =====================
 * Biodiversity & Land Use Service
 * =====================
 */

/**
 * Get biodiversity and land use data for a company
 */
export const getBiodiversityLandUseData = async (
    params: BiodiversityLandUseParams
): Promise<BiodiversityLandUseResponse> => {
    try {
        const { companyId, year } = params;

        // Build query parameters
        const queryParams = new URLSearchParams();
        if (year !== undefined) {
            queryParams.append('year', year.toString());
        }

        const queryString = queryParams.toString();
        const url = `/esg-dashboard/biodiversity-landuse/${companyId}${queryString ? `?${queryString}` : ''}`;

        const { data } = await api.get<BiodiversityLandUseResponse>(url);
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
                throw new Error("Biodiversity and land use data not found for the specified company.");
            case 422:
                throw new Error(errorMessage || "Invalid year parameter or data format.");
            case 500:
                throw new Error("Server error occurred while fetching biodiversity and land use data.");
            case 503:
                throw new Error("Biodiversity and land use service is temporarily unavailable.");
            default:
                throw new Error(
                    errorMessage ||
                    error.response?.data?.detail ||
                    "Failed to fetch biodiversity and land use data"
                );
        }
    }
};

/**
 * Get available years for biodiversity data
 */
export const getAvailableBiodiversityYears = (data: BiodiversityLandUseResponse): number[] => {
    return data.data.reporting_period.analysis_years || [];
};

/**
 * Get biodiversity assessment summary
 */
export const getBiodiversitySummary = (data: BiodiversityLandUseResponse) => {
    const assessment = data.data.biodiversity_assessment;
    return {
        environmental_metrics: assessment.environmental_metrics,
        social_metrics: assessment.social_metrics,
        governance_metrics: assessment.governance_metrics,
        current_year: assessment.current_year
    };
};

/**
 * Get deforestation analysis data
 */
export const getDeforestationAnalysis = (data: BiodiversityLandUseResponse) => {
    return data.data.deforestation_analysis;
};

/**
 * Get land use metrics
 */
export const getLandUseMetrics = (data: BiodiversityLandUseResponse) => {
    return data.data.land_use_metrics;
};

/**
 * Get environmental impact data
 */
export const getEnvironmentalImpact = (data: BiodiversityLandUseResponse) => {
    return data.data.environmental_impact;
};

/**
 * Get social governance data
 */
export const getSocialGovernance = (data: BiodiversityLandUseResponse) => {
    return data.data.social_governance;
};

/**
 * Get carbon emission accounting data
 */
export const getBiodiversityCarbonEmissionAccounting = (data: BiodiversityLandUseResponse) => {
    return data.data.carbon_emission_accounting;
};

/**
 * Get ESG metrics
 */
export const getEsgMetrics = (data: BiodiversityLandUseResponse) => {
    return data.data.esg_metrics;
};

/**
 * Get key statistics
 */
export const getKeyStatistics = (data: BiodiversityLandUseResponse) => {
    return data.data.key_statistics;
};

/**
 * Get graph data for visualization
 */
export const getBiodiversityGraphData = (data: BiodiversityLandUseResponse, year?: number): Graph | undefined => {
    const graphs = data.data.graphs;
    const yearKey = year ? year.toString() : data.data.reporting_period.current_year.toString();
    return graphs.ndvi_monthly_trends[yearKey];
};

/**
 * Get all graph data
 */
export const getAllBiodiversityGraphData = (data: BiodiversityLandUseResponse) => {
    return data.data.graphs;
};

/**
 * Get metadata information
 */
export const getBiodiversityMetadata = (data: BiodiversityLandUseResponse) => {
    return data.data.metadata;
};

/**
 * Get yearly carbon data
 */
export const getYearlyCarbonData = (data: BiodiversityLandUseResponse) => {
    return data.data.carbon_emission_accounting.yearly_data;
};

/**
 * Get carbon data by year
 */
export const getCarbonDataByYear = (data: BiodiversityLandUseResponse, year: number) => {
    return data.data.carbon_emission_accounting.yearly_data.find(
        (yearlyData) => yearlyData.year === year
    );
};

/**
 * Get monthly carbon data for a specific year
 */
export const getMonthlyCarbonData = (data: BiodiversityLandUseResponse, year: number) => {
    const yearlyData = getCarbonDataByYear(data, year);
    return yearlyData?.sequestration.monthly_data || [];
};

/**
 * Get company information
 */
export const getBiodiversityCompany = (data: BiodiversityLandUseResponse) => {
    return data.data.company;
};

/**
 * Get current year
 */
export const getCurrentBiodiversityYear = (data: BiodiversityLandUseResponse) => {
    return data.data.reporting_period.current_year;
};

/**
 * Get baseline year
 */
export const getBaselineBiodiversityYear = (data: BiodiversityLandUseResponse) => {
    return data.data.reporting_period.baseline_year;
};

/**
 * Get data completeness
 */
export const getDataCompleteness = (data: BiodiversityLandUseResponse) => {
    return data.data.reporting_period.data_completeness;
};

/**
 * Check if carbon data is available
 */
export const isBiodiversityCarbonDataAvailable = (data: BiodiversityLandUseResponse) => {
    return data.data.reporting_period.carbon_data_available;
};

/**
 * Get summary assessment
 */
export const getBiodiversitySummaryAssessment = (data: BiodiversityLandUseResponse) => {
    return data.data.summary;
};

/**
 * Get area of interest metadata
 */
export const getAreaOfInterestMetadata = (data: BiodiversityLandUseResponse) => {
    return data.data.company.area_of_interest_metadata;
};

/**
 * Get forest coverage percentage
 */
export const getForestCoveragePercentage = (data: BiodiversityLandUseResponse) => {
    return data.data.deforestation_analysis.forest_coverage.coverage_percent;
};

/**
 * Get protected area percentage
 */
export const getProtectedAreaPercentage = (data: BiodiversityLandUseResponse) => {
    return data.data.deforestation_analysis.protected_area_coverage.percentage;
};

/**
 * Get water management data
 */
export const getWaterManagement = (data: BiodiversityLandUseResponse) => {
    return data.data.environmental_impact.water_management;
};

/**
 * Get waste management data
 */
export const getWasteManagement = (data: BiodiversityLandUseResponse) => {
    return data.data.environmental_impact.waste_management;
};

/**
 * Get incident management data
 */
export const getIncidentManagement = (data: BiodiversityLandUseResponse) => {
    return data.data.environmental_impact.incident_management;
};

/**
 * Get soil health data
 */
export const getSoilHealth = (data: BiodiversityLandUseResponse) => {
    return data.data.environmental_impact.soil_health;
};

/**
 * Get community engagement data
 */
export const getCommunityEngagement = (data: BiodiversityLandUseResponse) => {
    return data.data.social_governance.community_engagement;
};

/**
 * Get governance strength data
 */
export const getGovernanceStrength = (data: BiodiversityLandUseResponse) => {
    return data.data.social_governance.governance_strength;
};

/**
 * Get environmental metrics
 */
export const getEnvironmentalMetrics = (data: BiodiversityLandUseResponse) => {
    return data.data.esg_metrics.environmental;
};

/**
 * Get social metrics
 */
export const getSocialMetrics = (data: BiodiversityLandUseResponse) => {
    return data.data.esg_metrics.social;
};

/**
 * Get governance metrics
 */
export const getGovernanceMetrics = (data: BiodiversityLandUseResponse) => {
    return data.data.esg_metrics.governance;
};

/**
 * Get NDVI monthly trends for a specific year
 */
export const getNDVIMonthlyTrends = (data: BiodiversityLandUseResponse, year?: number) => {
    const graphData = getBiodiversityGraphData(data, year);
    if (graphData && graphData.datasets[0]) {
        return graphData.datasets[0].data;
    }
    return [];
};

/**
 * Get carbon balance (net balance)
 */
export const getCarbonBalance = (data: BiodiversityLandUseResponse, year?: number) => {
    const targetYear = year || data.data.reporting_period.current_year;
    const yearlyData = getCarbonDataByYear(data, targetYear);
    return yearlyData?.emissions.net_balance || 0;
};

/**
 * Get total carbon emissions
 */
export const getTotalCarbonEmissions = (data: BiodiversityLandUseResponse, year?: number) => {
    const targetYear = year || data.data.reporting_period.current_year;
    const yearlyData = getCarbonDataByYear(data, targetYear);
    return yearlyData?.emissions.total_tco2e || 0;
};

/**
 * Get carbon sequestration total
 */
export const getCarbonSequestration = (data: BiodiversityLandUseResponse, year?: number) => {
    const targetYear = year || data.data.reporting_period.current_year;
    const yearlyData = getCarbonDataByYear(data, targetYear);
    return yearlyData?.sequestration.total_tco2 || 0;
};

/**
 * Get scope breakdown for a specific year
 */
export const getScopeBreakdown = (data: BiodiversityLandUseResponse, year?: number) => {
    const targetYear = year || data.data.reporting_period.current_year;
    const yearlyData = getCarbonDataByYear(data, targetYear);
    if (yearlyData) {
        return {
            scope1: yearlyData.emissions.scope1_tco2e,
            scope2: yearlyData.emissions.scope2_tco2e,
            scope3: yearlyData.emissions.scope3_tco2e
        };
    }
    return null;
};

/**
 * Check if company has area of interest defined
 */
export const hasAreaOfInterest = (data: BiodiversityLandUseResponse): boolean => {
    return !!data.data.company.area_of_interest_metadata?.coordinates?.length;
};

/**
 * Get coordinates for mapping
 */
export const getCoordinatesForMapping = (data: BiodiversityLandUseResponse): Coordinate[] => {
    return data.data.company.area_of_interest_metadata?.coordinates || [];
};

/**
 * Get data availability summary
 */
export const getDataAvailabilitySummary = (data: BiodiversityLandUseResponse) => {
    return data.data.summary.data_availability;
};

/**
 * Get notable metrics
 */
export const getNotableMetrics = (data: BiodiversityLandUseResponse) => {
    return data.data.summary.notable_metrics;
};