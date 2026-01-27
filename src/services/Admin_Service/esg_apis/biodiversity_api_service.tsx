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
    period_requested: string;
    data_sources: string[];
    calculation_methods: string[];
    compliance_frameworks: string[];
}

export interface ReportingPeriod {
    current_year: number;
    baseline_year: number;
    analysis_years: number[];
    period_covered: string;
    data_completeness: string;
    carbon_data_available: boolean;
    monthly_data_available: boolean;
}

export interface BiodiversityComponent {
    score: number;
    weight: number;
    factors: string[];
}

export interface BiodiversityComponents {
    environmental: BiodiversityComponent;
    social: BiodiversityComponent;
    governance: BiodiversityComponent;
    conservation: BiodiversityComponent;
}

export interface NDVIAnalysis {
    score: number;
    trend: string;
}

export interface SpeciesDiversity {
    score: number;
    category: string;
    indicators: string[];
    confidence: string;
}

export interface FragmentationRisk {
    risk_score: number;
    level: string;
    contributing_factors: string[];
    mitigation_needed: boolean;
}

export interface DetailedAssessment {
    ndvi_analysis: NDVIAnalysis;
    habitat_integrity: string;
    species_diversity: SpeciesDiversity;
    fragmentation_risk: FragmentationRisk;
    water_impact: string;
    waste_impact: string;
    incident_impact: string;
    social_engagement: string;
    governance_strength: string;
}

export interface BiodiversityAssessment {
    overall_score: number;
    rating: string;
    components: BiodiversityComponents;
    detailed_assessment: DetailedAssessment;
}

export interface YearlyNDVISummary {
    year: number;
    avg_ndvi: number;
    max_ndvi: number;
    min_ndvi: number;
    seasonal_variation: number;
    biomass_co2_total: number;
    soc_co2_total: number;
}

export interface NDVIAnalysisDetailed {
    yearly_summaries: YearlyNDVISummary[];
    detected_trends: string[];
    overall_ndvi_trend: string;
    deforestation_risk: string;
    data_quality: string;
}

export interface YearlyRisk {
    year: number;
    forest_area: number;
    agricultural_area: number;
    ndvi_score: number;
    risk_score: number;
}

export interface DeforestationAlert {
    id?: string;
    date?: string;
    location?: string;
    area_affected?: number;
    confidence?: string;
}

export interface DeforestationAnalysis {
    risk_score: number;
    risk_level: string;
    forest_coverage: {
        current: number;
        previous: number;
        change_percent: string;
        coverage_percent: string;
    };
    agricultural_expansion: {
        current: number;
        previous: number;
        change_percent: string;
        expansion_rate: string;
    };
    protected_area_coverage: string;
    ndvi_analysis: NDVIAnalysisDetailed;
    risk_factors: string[];
    yearly_risk: YearlyRisk[];
    deforestation_alerts: DeforestationAlert[];
    compliance_status: string;
}

export interface LandUseMetrics {
    current_year: {
        total_area: number;
        forest_area: number;
        agricultural_area: number;
        protected_area: number;
        forest_coverage_percent: string;
        protected_area_percent: string;
    };
    trends: {
        forest_area_trend: string;
        agricultural_area_trend: string;
        total_area_trend: string;
    };
    change_analysis: {
        period?: string;
        forest_area?: {
            start: number;
            end: number;
            change: number;
            trend: string;
        };
        agricultural_area?: {
            start: number;
            end: number;
            change: number;
            trend: string;
        };
        change_detected?: boolean;
        primary_driver?: string;
        implications?: string;
        message?: string;
    };
}

export interface WaterEfficiency {
    water_per_ha: number;
    efficiency_score: number;
    rating: string;
}

export interface WaterManagement {
    current_usage: string;
    trend: string;
    efficiency: WaterEfficiency;
    risk_level: string;
}

export interface WasteManagement {
    hazardous_waste: string;
    recycled_waste: number;
    trend: string;
    risk_level: string;
}

export interface IncidentManagement {
    total_incidents: number;
    trend: string;
    risk_level: string;
}

export interface SoilHealth {
    erosion_rate: number;
    organic_matter: number;
    trend: string;
}

export interface EnvironmentalImpact {
    water_management: WaterManagement;
    waste_management: WasteManagement;
    incident_management: IncidentManagement;
    soil_health: SoilHealth;
}

export interface CommunityEngagement {
    programs_count: number;
    local_employment: number;
    land_rights_complaints: number;
    engagement_level: string;
}

export interface GovernanceStrength {
    land_use_policy: string;
    biodiversity_policy: string;
    compliance_audits: number;
    strength_level: string;
}

export interface SocialGovernance {
    community_engagement: CommunityEngagement;
    governance_strength: GovernanceStrength;
}

export interface MonthlyTrend {
    month: number;
    month_name: string;
    avg_ndvi: number;
    data_points: number;
}

export interface NDVIAnalysisSummary {
    monthly_trends: MonthlyTrend[];
    overall_avg_ndvi: number;
    best_month: MonthlyTrend;
    worst_month: MonthlyTrend;
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
    summary: {
        period: {
            start_year: number;
            end_year: number;
            years_count: number;
        };
        ndvi_analysis: NDVIAnalysisSummary;
    };
    ndvi_analysis: NDVIAnalysisSummary;
    yearly_data: YearlyCarbonData[];
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

export interface EsgMetricsSummary {
    total_metrics: number;
    environmental_metrics: number;
    social_metrics: number;
    governance_metrics: number;
    data_coverage_years: number;
}

export interface EsgMetrics {
    environmental: EnvironmentalMetric[];
    social: EnvironmentalMetric[];
    governance: EnvironmentalMetric[];
    summary: EsgMetricsSummary;
}

export interface GraphDataset {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string | string[];
    fill?: boolean;
    borderDash?: number[];
    tension?: number;
    borderWidth?: number;
    type?: string;
}

export interface GraphDataPoint {
    x: number;
    y: number;
    r: number;
}

export interface ScatterDataset {
    label: string;
    data: GraphDataPoint[];
    backgroundColor: string;
}

export interface Graph {
    type: string;
    title: string;
    description: string;
    labels: (string | number)[];
    datasets: (GraphDataset | ScatterDataset)[];
}

export interface EnvironmentalMetrics {
    total_water_usage: string;
    total_hazardous_waste: string;
    total_incidents: number;
    forest_coverage_percent: string;
    protected_area_percent: string;
}

export interface BiodiversityMetrics {
    overall_score: string;
    ndvi_score: string;
    endangered_species_count: number;
    habitat_restoration_area: string;
    restoration_progress: string;
}

export interface RiskMetrics {
    deforestation_risk_score: number;
    deforestation_alerts_count: number;
    fragmentation_risk: string;
    compliance_status: string;
}

export interface CarbonMetrics {
    total_sequestration: number;
    total_emissions: number;
    net_carbon_balance: number;
    ndvi_trend: string;
}

export interface SocialGovernanceMetrics {
    community_programs: number;
    land_use_policy: string;
    biodiversity_policy: string;
}

export interface KeyStatistics {
    total_metrics_analyzed: number;
    years_covered: number;
    current_year: number;
    environmental_metrics: EnvironmentalMetrics;
    biodiversity_metrics: BiodiversityMetrics;
    risk_metrics: RiskMetrics;
    carbon_metrics: CarbonMetrics;
    social_governance_metrics: SocialGovernanceMetrics;
}

export interface HabitatRestorationPotential {
    current_restoration: number;
    restoration_target: number;
    remaining_potential: number;
    percent_of_target: string;
}

export interface ConservationMetrics {
    habitat_restoration_potential: HabitatRestorationPotential;
    carbon_sequestration_potential: string;
    water_conservation_potential: string;
    biodiversity_enhancement_target: string;
    deforestation_prevention: string;
}

export interface SDGAlignment {
    goal: string;
    alignment: string;
}

export interface HVECompliance {
    applicable: boolean;
    requirements: string[];
    current_status: string;
    verification_required: boolean;
    notes: string;
}

export interface SASBCompliance {
    applicable: boolean;
    standards: string[];
    compliance_level: string;
    metrics_coverage: string[];
    gap_analysis: string;
}

export interface TCFDCompliance {
    applicable: boolean;
    climate_risk_assessment: string;
    scenario_analysis: string;
    physical_risks: string[];
    transition_risks: string[];
    reporting_status: string;
}

export interface GRICompliance {
    standards: string[];
    disclosure_level: string;
    verification_status: string;
    improvement_areas: string[];
}

export interface UNSDGCompliance {
    goals: SDGAlignment[];
    overall_alignment: string;
    contribution_areas: string[];
}

export interface ISOCompliance {
    standards: string[];
    certification_status: string;
    gap_analysis: string;
}

export interface StandardsCompliance {
    hve: HVECompliance;
    sasb: SASBCompliance;
    tcfd: TCFDCompliance;
    gri: GRICompliance;
    unsdg: UNSDGCompliance;
    iso: ISOCompliance;
}

export interface HVEComplianceDetails {
    deforestation_status: string;
    compliance_status: string;
    verification_requirements: string[];
    last_assessment_date: string;
    next_assessment_due: string;
}

export interface Recommendation {
    category: string;
    priority: string;
    recommendation: string;
    impact: string;
    timeframe: string;
    cost_estimate: string;
    compliance_benefit: string;
}

export interface Summary {
    overall_assessment: string;
    key_strengths: string[];
    critical_areas: string[];
    next_steps: string[];
    outlook: string;
}

export interface Graphs {
    biodiversity_trend?: Graph;
    land_use_composition: Graph;
    ndvi_monthly_trend: Graph;
    deforestation_risk_timeline?: Graph;
    environmental_correlation?: Graph;
    biodiversity_components: Graph;
    carbon_balance_trend?: Graph;
    monthly_carbon_sequestration: Graph;
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
        conservation_metrics: ConservationMetrics;
        standards_compliance: StandardsCompliance;
        hve_compliance: HVEComplianceDetails;
        recommendations: Recommendation[];
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
    year?: number; // Optional year parameter
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
 * Get current biodiversity summary
 */
export const getBiodiversitySummary = (data: BiodiversityLandUseResponse) => {
    const assessment = data.data.biodiversity_assessment;
    return {
        overallScore: assessment.overall_score,
        rating: assessment.rating,
        components: assessment.components,
        detailedAssessment: assessment.detailed_assessment
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
 * Get conservation metrics
 */
export const getConservationMetrics = (data: BiodiversityLandUseResponse) => {
    return data.data.conservation_metrics;
};

/**
 * Get standards compliance data
 */
export const getStandardsCompliance = (data: BiodiversityLandUseResponse) => {
    return data.data.standards_compliance;
};

/**
 * Get HVE compliance details
 */
export const getHveCompliance = (data: BiodiversityLandUseResponse) => {
    return data.data.hve_compliance;
};

/**
 * Get recommendations
 */
export const getRecommendations = (data: BiodiversityLandUseResponse) => {
    return data.data.recommendations;
};

/**
 * Get graph data for visualization
 */
export const getBiodiversityGraphData = (data: BiodiversityLandUseResponse, graphType: keyof Graphs): Graph | undefined => {
    const graphs = data.data.graphs;
    return graphs[graphType];
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
 * Get yearly NDVI summaries
 */
export const getYearlyNDVISummaries = (data: BiodiversityLandUseResponse) => {
    return data.data.deforestation_analysis.ndvi_analysis.yearly_summaries;
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
 * Get NDVI analysis summary
 */
export const getNDVIAnalysisSummary = (data: BiodiversityLandUseResponse) => {
    return data.data.carbon_emission_accounting.ndvi_analysis;
};

/**
 * Get monthly NDVI trends
 */
export const getMonthlyNDVITrends = (data: BiodiversityLandUseResponse) => {
    return data.data.carbon_emission_accounting.ndvi_analysis.monthly_trends;
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
 * Check if monthly data is available
 */
export const isMonthlyDataAvailable = (data: BiodiversityLandUseResponse) => {
    return data.data.reporting_period.monthly_data_available;
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
 * Get deforestation risk score
 */
export const getDeforestationRiskScore = (data: BiodiversityLandUseResponse) => {
    return data.data.deforestation_analysis.risk_score;
};

/**
 * Get deforestation risk level
 */
export const getDeforestationRiskLevel = (data: BiodiversityLandUseResponse) => {
    return data.data.deforestation_analysis.risk_level;
};

/**
 * Get forest coverage percentage
 */
export const getForestCoveragePercentage = (data: BiodiversityLandUseResponse) => {
    return data.data.land_use_metrics.current_year.forest_coverage_percent;
};

/**
 * Get protected area percentage
 */
export const getProtectedAreaPercentage = (data: BiodiversityLandUseResponse) => {
    return data.data.land_use_metrics.current_year.protected_area_percent;
};

/**
 * Get compliance frameworks
 */
export const getComplianceFrameworks = (data: BiodiversityLandUseResponse) => {
    return data.data.metadata.compliance_frameworks;
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
 * Filter recommendations by priority
 */
export const getRecommendationsByPriority = (data: BiodiversityLandUseResponse, priority: string) => {
    return data.data.recommendations.filter(rec => rec.priority === priority);
};

/**
 * Get recommendations by category
 */
export const getRecommendationsByCategory = (data: BiodiversityLandUseResponse, category: string) => {
    return data.data.recommendations.filter(rec => rec.category === category);
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
 * Get ESG metrics summary
 */
export const getEsgMetricsSummary = (data: BiodiversityLandUseResponse) => {
    return data.data.esg_metrics.summary;
};

/**
 * Get overall biodiversity score trend
 */
export const getBiodiversityScoreTrend = (data: BiodiversityLandUseResponse): number[] => {
    // This would typically come from the biodiversity_trend graph or yearly data
    // For now, we'll extract from the graph if available
    const graph = data.data.graphs.biodiversity_trend;
    if (graph && graph.datasets[0]) {
        return graph.datasets[0].data as number[];
    }
    return [];
};

/**
 * Get carbon balance trend
 */
export const getCarbonBalanceTrend = (data: BiodiversityLandUseResponse) => {
    const graph = data.data.graphs.carbon_balance_trend;
    if (graph) {
        return {
            labels: graph.labels,
            datasets: graph.datasets
        };
    }
    return null;
};