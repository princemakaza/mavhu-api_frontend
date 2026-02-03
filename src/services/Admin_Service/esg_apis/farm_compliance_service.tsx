// FarmComplianceService.ts
import api from "../Auth_service/api";

/**
 * =====================
 * Base Interfaces
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
    website: string;
    country: string;
    industry: string;
    description: string;
    purpose: string;
    scope: string;
    data_source: string[];
    area_of_interest_metadata?: AreaOfInterestMetadata;
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

/**
 * =====================
 * Carbon Emission Accounting Interfaces
 * =====================
 */
export interface CreatedBy {
    _id: string;
    email: string;
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

export interface EmissionReferences {
    methodology_statement: string;
    emission_factors: EmissionFactor[];
    global_warming_potentials: GlobalWarmingPotentials;
    conversion_factors: ConversionFactors;
}

export interface CarbonFramework {
    sequestration_methodology: string;
    emission_methodology: string;
    calculation_approach: string;
    data_sources: string[];
}

export interface MonthlySequestrationData {
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
    is_baseline: boolean;
    _id: string;
}

export interface SequestrationMethodology {
    component: string;
    method_applied: string;
    standard_source: string;
    purpose: string;
    _id: string;
}

export interface AnnualSequestrationSummary {
    total_biomass_co2_t: number;
    total_soc_co2_t: number;
    net_co2_stock_t: number;
    net_co2_change_t: number;
    sequestration_total_tco2: number;
}

export interface EmissionSource {
    source: string;
    parameter: string;
    unit: string;
    annual_per_ha: number;
    emission_factor: string;
    ef_number: number;
    gwp: number;
    tco2e_per_ha_per_year: number;
    methodological_justification: string;
    reference: string;
    calculation_notes: string;
    is_active: boolean;
    _id: string;
}

export interface Scope1Emissions {
    sources: EmissionSource[];
    total_tco2e_per_ha: number;
    total_tco2e: number;
}

export interface Scope2Source {
    source: string;
    parameter: string;
    unit: string;
    annual_activity_per_ha: number;
    emission_factor: string;
    ef_number: number;
    tco2e_per_ha_per_year: number;
    methodological_justification: string;
    reference: string;
    calculation_notes: string;
    is_active: boolean;
    _id: string;
}

export interface Scope2Emissions {
    sources: Scope2Source[];
    total_tco2e_per_ha: number;
    total_tco2e: number;
}

export interface Scope3Category {
    category: string;
    parameter: string;
    unit: string;
    annual_activity_per_ha: number;
    emission_factor: string;
    ef_number: number;
    tco2e_per_ha_per_year: number;
    methodological_justification: string;
    reference: string;
    calculation_notes: string;
    is_active: boolean;
    _id: string;
}

export interface Scope3Emissions {
    categories: Scope3Category[];
    total_tco2e_per_ha: number;
    total_tco2e: number;
}

export interface EmissionsData {
    scope1: Scope1Emissions;
    scope2: Scope2Emissions;
    scope3: Scope3Emissions;
    total_scope_emission_tco2e_per_ha: number;
    total_scope_emission_tco2e: number;
    net_total_emission_tco2e: number;
}

export interface DataQuality {
    completeness_score: number;
    verification_status: string;
}

export interface ImportHistory {
    batch_id?: string;
    source_file: string;
    file_type: string;
    import_date: string;
    metrics_imported: number;
    import_notes?: string;
}

export interface DataManagement {
    validation_status: string;
    import_history: ImportHistory[];
    validation_errors: any[];
}

export interface CarbonEmissionAccounting {
    document_id: string;
    status: string;
    is_active: boolean;
    created_at: string;
    created_by: CreatedBy;
    last_updated_at: string;
    last_updated_by: CreatedBy;
    emission_references: EmissionReferences;
    framework: CarbonFramework;
    yearly_data: {
        year: number;
        sequestration: {
            reporting_area_ha: number;
            soc_area_ha: number;
            monthly_data: MonthlySequestrationData[];
            methodologies: SequestrationMethodology[];
            annual_summary: AnnualSequestrationSummary;
        };
        emissions: EmissionsData;
        data_quality: DataQuality;
        source_file: string;
        imported_at: string;
        last_updated_at: string;
    };
    summary: {
        net_carbon_balance_tco2e: number;
    };
    data_management: DataManagement;
}

/**
 * =====================
 * Carbon Emissions & Sequestration Interfaces
 * =====================
 */
export interface CarbonEmissions {
    scope1_tco2e: number;
    scope2_tco2e: number;
    scope3_tco2e: number;
    total_emissions_tco2e: number;
    net_carbon_balance_tco2e: number;
    data_quality: {
        completeness: number;
        verification: string;
    };
}

export interface CarbonSequestration {
    biomass_co2_t: number;
    soc_co2_t: number;
    total_sequestration_tco2: number;
    net_co2_change: number;
}

/**
 * =====================
 * Metrics Interfaces
 * =====================
 */
export interface TrainingMetrics {
    total_training_hours: number | null;
    farmer_training_hours: number | null;
    employees_trained_total: number | null;
    employees_trained_farmers: number | null;
    training_distribution: {
        farmer_training: number | null;
        safety_training: number | null;
        technical_training: number | null;
        compliance_training: number | null;
    };
}

export interface Scope3Engagement {
    suppliers_with_code: number | null;
    suppliers_audited: number | null;
    supplier_training_hours: number | null;
    non_compliance_cases: number | null;
    corrective_actions: number | null;
}

export interface FrameworkAlignment {
    gri_compliance: number | null;
    ifrs_s1_alignment: number | null;
    ifrs_s2_alignment: number | null;
    tcfd_implementation: number | null;
    sasb_alignment: number | null;
    unsdg_alignment: number | null;
    cdp_score: number | null;
}

export interface Metrics {
    training: TrainingMetrics;
    scope3_engagement: Scope3Engagement;
    framework_alignment: FrameworkAlignment;
}

/**
 * =====================
 * GRI/IFRS Data Interfaces
 * =====================
 */
export interface AlignmentMetric {
    metric_name: string;
    category: string;
    value: string;
    numeric_value: number | null;
    source_notes: string;
    unit: string | null;
}

export interface GRIIFRSData {
    sources: any[];
    alignments: AlignmentMetric[];
    files: any[];
    summary: {
        total_gri_ifrs_sources: number;
        total_alignment_metrics: number;
        average_alignment_score: string;
    };
}

/**
 * =====================
 * Policies & Certifications Interfaces
 * =====================
 */
export interface Policy {
    title: string;
    description: string | null;
    category: string;
    status: string;
    year: number;
    verified: boolean;
}

export interface Policies {
    list: Policy[];
    esg_frameworks: string[];
    compliance_status: Record<string, any>;
    summary: {
        total_policies: number;
        verified_policies: number;
        active_standards: number;
    };
}

export interface Certifications {
    list: any[];
    summary: {
        total_certifications: number;
        active_certifications: number;
        pending_certifications: number;
    };
}

export interface PoliciesAndCertifications {
    policies: Policies;
    certifications: Certifications;
}

/**
 * =====================
 * Audit Trails Interfaces
 * =====================
 */
export interface AuditSummary {
    total_verifications: number;
    total_validations: number;
    recent_import: string;
    average_quality_score: number | null;
}

export interface AuditTrails {
    verifications: any[];
    validations: any[];
    imports: ImportHistory[];
    summary: AuditSummary;
}

/**
 * =====================
 * Compliance Scores Interfaces
 * =====================
 */
export interface ComplianceScores {
    scores: {
        trainingHours: number;
        trainedEmployees: number;
        supplierCompliance: number;
        ifrsS1Alignment: number;
        ifrsS2Alignment: number;
        griCompliance: number;
        tcfdImplementation: number;
        carbonScore: number;
        dataQuality: number;
        verification: number;
        overall: number;
    };
    assessmentDate: string;
    weights: {
        training: string;
        supplier_engagement: string;
        ifrs_alignment: string;
        gri_compliance: string;
        tcfd: string;
        carbon_performance: string;
        data_quality: string;
        verification: string;
    };
    rating: string;
}

/**
 * =====================
 * Graph Interfaces
 * =====================
 */
export interface GraphDataset {
    label: string;
    data: (number | null)[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    type?: string;
    yAxisID?: string;
}

export interface GraphOptions {
    scales: {
        y: {
            title: {
                display: boolean;
                text: string;
            };
        };
        y1: {
            position: string;
            title: {
                display: boolean;
                text: string;
            };
        };
    };
}

export interface Graph {
    type: string;
    title: string;
    description: string;
    labels: string[];
    datasets: GraphDataset[];
    options?: GraphOptions;
}

export interface Graphs {
    complianceBreakdown: Graph;
    carbonEmissionBreakdown: Graph;
    trainingComplianceCorrelation: Graph;
    frameworkAlignment: Graph;
}

/**
 * =====================
 * Scope 3 Analysis Interfaces
 * =====================
 */
export interface Scope3Metrics {
    suppliersWithCode: number;
    trainedSuppliers: number;
    auditsConducted: number;
    nonCompliances: number;
    correctiveActions: number;
    complianceRate: string;
}

export interface Scope3ReductionOpportunity {
    priority: string;
    area: string;
    potential_reduction: string;
    actions: string[];
}

export interface Scope3Analysis {
    metrics: Scope3Metrics;
    analysis: {
        dataSources: number;
        verifiedSupplierData: number;
        riskLevel: string;
    };
}

/**
 * =====================
 * Data Quality Interfaces
 * =====================
 */
export interface DataQualityInfo {
    verified_metrics: number;
    last_verification_date: string | null;
    data_coverage: number;
    carbon_data_available: boolean;
    carbon_data_quality: number;
    carbon_verification_status: string;
}

/**
 * =====================
 * Trends Interfaces
 * =====================
 */
export interface Trends {
    training_trend: string;
    compliance_trend: string;
    scope3_trend: string;
    certification_trend: string;
    carbon_trend: string;
}

/**
 * =====================
 * Recommendations Interfaces
 * =====================
 */
export interface Recommendations {
    immediate: string[];
    medium_term: string[];
    long_term: string[];
}

/**
 * =====================
 * Carbon Predictions Interfaces
 * =====================
 */
export interface ProjectedEmissions {
    projected_scope1: number;
    projected_scope2: number;
    projected_scope3: number;
    total_projected: number;
    reduction_percentage: number;
    assumptions: string[];
}

export interface CarbonNeutralityTimeline {
    status: string;
    target_year: number;
    years_remaining: number;
    required_annual_reduction: number;
    current_net_balance: number;
    assumptions: string[];
}

export interface SequestrationPotential {
    current_sequestration_tco2: number;
    potential_sequestration_tco2: number;
    increase_possible_tco2: number;
    increase_percentage: number;
    area_ha: number;
    sequestration_per_ha: number;
    potential_per_ha: number;
    recommendations: string[];
}

export interface Scope3ReductionOpportunity {
    priority: string;
    area: string;
    potential_reduction: string;
    actions: string[];
}

export interface Scope3ReductionOpportunities {
    scope3_percentage: string;
    emission_intensity: number;
    reduction_opportunities: Scope3ReductionOpportunity[];
    estimated_total_reduction_tco2e: number;
    timeline_months: number;
}

export interface CarbonPredictions {
    projected_emissions_next_year: ProjectedEmissions;
    carbon_neutrality_timeline: CarbonNeutralityTimeline;
    sequestration_potential: SequestrationPotential;
    scope3_reduction_opportunities: Scope3ReductionOpportunities;
}

/**
 * =====================
 * Metadata Interfaces
 * =====================
 */
export interface Metadata {
    generated_at: string;
    data_sources_count: number;
    metrics_extracted: number;
    carbon_data_included: boolean;
    carbon_accounting_complete: boolean;
    year: number;
}

/**
 * =====================
 * Main Response Interface
 * =====================
 */
export interface FarmComplianceResponse {
    message: string;
    api: string;
    data: {
        company: Company;
        reporting_year: number;
        time_period: string;
        carbon_emission_accounting: CarbonEmissionAccounting;
        carbon_emissions: CarbonEmissions;
        carbon_sequestration: CarbonSequestration;
        metrics: Metrics;
        gri_ifrs_data: GRIIFRSData;
        policies_and_certifications: PoliciesAndCertifications;
        audit_trails: AuditTrails;
        compliance_scores: ComplianceScores;
        graphs: Graphs;
        scope3_analysis: Scope3Analysis;
        data_quality: DataQualityInfo;
        trends: Trends;
        recommendations: Recommendations;
        carbon_predictions: CarbonPredictions;
        metadata: Metadata;
    };
}

/**
 * =====================
 * Request Parameters
 * =====================
 */
export interface FarmComplianceParams {
    companyId: string;
    year?: number;
}

/**
 * =====================
 * Farm Compliance Service
 * =====================
 */

/**
 * Get farm compliance data for a company
 */
export const getFarmComplianceData = async (
    params: FarmComplianceParams
): Promise<FarmComplianceResponse> => {
    try {
        const { companyId, year } = params;

        // Build query parameters
        const queryParams = new URLSearchParams();
        if (year !== undefined) {
            queryParams.append('year', year.toString());
        }

        const queryString = queryParams.toString();
        const url = `/esg-dashboard/farm-compliance/${companyId}${queryString ? `?${queryString}` : ''}`;

        const { data } = await api.get<FarmComplianceResponse>(url);
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
                throw new Error("Farm compliance data not found for the specified company.");
            case 422:
                throw new Error(errorMessage || "Invalid year parameter or data format.");
            case 500:
                throw new Error("Server error occurred while fetching farm compliance data.");
            case 503:
                throw new Error("Farm compliance service is temporarily unavailable.");
            default:
                throw new Error(
                    errorMessage ||
                    error.response?.data?.detail ||
                    "Failed to fetch farm compliance data"
                );
        }
    }
};

/**
 * Helper Functions
 */

/**
 * Get company information
 */
export const getFarmComplianceCompany = (data: FarmComplianceResponse) => {
    return data.data.company;
};

/**
 * Get carbon emissions data
 */
export const getCarbonEmissions = (data: FarmComplianceResponse) => {
    return data.data.carbon_emissions;
};

/**
 * Get carbon sequestration data
 */
export const getCarbonSequestration = (data: FarmComplianceResponse) => {
    return data.data.carbon_sequestration;
};

/**
 * Get compliance scores
 */
export const getComplianceScores = (data: FarmComplianceResponse) => {
    return data.data.compliance_scores;
};

/**
 * Get overall compliance score
 */
export const getOverallComplianceScore = (data: FarmComplianceResponse) => {
    return data.data.compliance_scores.scores.overall;
};

/**
 * Get compliance rating
 */
export const getComplianceRating = (data: FarmComplianceResponse) => {
    return data.data.compliance_scores.rating;
};

/**
 * Get scope breakdown for carbon emissions
 */
export const getScopeBreakdown = (data: FarmComplianceResponse) => {
    const emissions = data.data.carbon_emissions;
    return {
        scope1: emissions.scope1_tco2e,
        scope2: emissions.scope2_tco2e,
        scope3: emissions.scope3_tco2e,
        total: emissions.total_emissions_tco2e,
        netBalance: emissions.net_carbon_balance_tco2e
    };
};

/**
 * Get monthly sequestration data
 */
export const getMonthlySequestrationData = (data: FarmComplianceResponse) => {
    return data.data.carbon_emission_accounting.yearly_data.sequestration.monthly_data;
};

/**
 * Get compliance graphs
 */
export const getComplianceGraphs = (data: FarmComplianceResponse) => {
    return data.data.graphs;
};

/**
 * Get recommendations
 */
export const getComplianceRecommendations = (data: FarmComplianceResponse) => {
    return data.data.recommendations;
};

/**
 * Get carbon predictions
 */
export const getCarbonPredictions = (data: FarmComplianceResponse) => {
    return data.data.carbon_predictions;
};

/**
 * Get scope 3 analysis
 */
export const getScope3Analysis = (data: FarmComplianceResponse) => {
    return data.data.scope3_analysis;
};

/**
 * Get policies and certifications
 */
export const getPoliciesAndCertifications = (data: FarmComplianceResponse) => {
    return data.data.policies_and_certifications;
};

/**
 * Get audit trails
 */
export const getAuditTrails = (data: FarmComplianceResponse) => {
    return data.data.audit_trails;
};

/**
 * Get data quality information
 */
export const getDataQualityInfo = (data: FarmComplianceResponse) => {
    return data.data.data_quality;
};

/**
 * Get trends
 */
export const getComplianceTrends = (data: FarmComplianceResponse) => {
    return data.data.trends;
};

/**
 * Get GRI/IFRS alignment metrics
 */
export const getGRIAlignmentMetrics = (data: FarmComplianceResponse) => {
    return data.data.gri_ifrs_data.alignments;
};

/**
 * Get training metrics
 */
export const getTrainingMetrics = (data: FarmComplianceResponse) => {
    return data.data.metrics.training;
};

/**
 * Get framework alignment
 */
export const getFrameworkAlignment = (data: FarmComplianceResponse) => {
    return data.data.metrics.framework_alignment;
};

/**
 * Get area of interest metadata
 */
export const getFarmAreaOfInterest = (data: FarmComplianceResponse) => {
    return data.data.company.area_of_interest_metadata;
};

/**
 * Get coordinates for mapping
 */
export const getFarmCoordinates = (data: FarmComplianceResponse) => {
    return data.data.company.area_of_interest_metadata?.coordinates || [];
};

/**
 * Get emission factors
 */
export const getEmissionFactors = (data: FarmComplianceResponse) => {
    return data.data.carbon_emission_accounting.emission_references.emission_factors;
};

/**
 * Get reporting year
 */
export const getReportingYear = (data: FarmComplianceResponse) => {
    return data.data.reporting_year;
};

/**
 * Check if carbon data is available
 */
export const isCarbonDataAvailable = (data: FarmComplianceResponse) => {
    return data.data.data_quality.carbon_data_available;
};

/**
 * Get net carbon balance
 */
export const getNetCarbonBalance = (data: FarmComplianceResponse) => {
    return data.data.carbon_emissions.net_carbon_balance_tco2e;
};

/**
 * Get carbon neutrality timeline
 */
export const getCarbonNeutralityTimeline = (data: FarmComplianceResponse) => {
    return data.data.carbon_predictions.carbon_neutrality_timeline;
};

/**
 * Get sequestration potential
 */
export const getSequestrationPotential = (data: FarmComplianceResponse) => {
    return data.data.carbon_predictions.sequestration_potential;
};

/**
 * Get scope 3 reduction opportunities
 */
export const getScope3ReductionOpportunities = (data: FarmComplianceResponse) => {
    return data.data.carbon_predictions.scope3_reduction_opportunities;
};

/**
 * Calculate carbon intensity per hectare
 */
export const getCarbonIntensityPerHa = (data: FarmComplianceResponse) => {
    const emissions = data.data.carbon_emissions;
    const area = data.data.carbon_emission_accounting.yearly_data.sequestration.reporting_area_ha;

    if (area === 0) return null;

    return {
        scope1: emissions.scope1_tco2e / area,
        scope2: emissions.scope2_tco2e / area,
        scope3: emissions.scope3_tco2e / area,
        total: emissions.total_emissions_tco2e / area,
        net: emissions.net_carbon_balance_tco2e / area
    };
};

/**
 * Get compliance improvement priorities
 */
export const getCompliancePriorities = (data: FarmComplianceResponse): string[] => {
    const scores = data.data.compliance_scores.scores;
    const priorities: string[] = [];

    if (scores.trainingHours < 50) priorities.push("Increase training hours");
    if (scores.trainedEmployees < 50) priorities.push("Train more employees");
    if (scores.supplierCompliance < 50) priorities.push("Improve supplier compliance");
    if (scores.ifrsS1Alignment < 50) priorities.push("Enhance IFRS S1 alignment");
    if (scores.ifrsS2Alignment < 50) priorities.push("Enhance IFRS S2 alignment");
    if (scores.griCompliance < 50) priorities.push("Improve GRI compliance");
    if (scores.carbonScore < 50) priorities.push("Reduce carbon emissions");
    if (scores.dataQuality < 50) priorities.push("Improve data quality");

    return priorities;
};

/**
 * Get carbon emission breakdown by source
 */
export const getScope1Breakdown = (data: FarmComplianceResponse) => {
    return data.data.carbon_emission_accounting.yearly_data.emissions.scope1.sources;
};

/**
 * Get scope 3 breakdown by category
 */
export const getScope3Breakdown = (data: FarmComplianceResponse) => {
    return data.data.carbon_emission_accounting.yearly_data.emissions.scope3.categories;
};

/**
 * Get monthly carbon change data
 */
export const getMonthlyCarbonChange = (data: FarmComplianceResponse) => {
    const monthlyData = data.data.carbon_emission_accounting.yearly_data.sequestration.monthly_data;
    return monthlyData.map(month => ({
        month: month.month,
        monthNumber: month.month_number,
        netChange: month.net_co2_change_t,
        sequestration: month.biomass_co2_total_t + month.soc_co2_total_t,
        meaning: month.meaning
    }));
};

/**
 * Check if company has ESG linked pay
 */
export const hasESGLinkedPay = (data: FarmComplianceResponse) => {
    return data.data.company.has_esg_linked_pay;
};

/**
 * Get ESG frameworks
 */
export const getESGFrameworks = (data: FarmComplianceResponse) => {
    return data.data.company.esg_reporting_framework;
};

/**
 * Get ESG contact person
 */
export const getESGContactPerson = (data: FarmComplianceResponse) => {
    return data.data.company.esg_contact_person;
};

/**
 * Get latest ESG report year
 */
export const getLatestESGReportYear = (data: FarmComplianceResponse) => {
    return data.data.company.latest_esg_report_year;
};

/**
 * Get total land area
 */
export const getTotalLandArea = (data: FarmComplianceResponse) => {
    return data.data.carbon_emission_accounting.yearly_data.sequestration.reporting_area_ha;
};

/**
 * Get carbon accounting status
 */
export const getCarbonAccountingStatus = (data: FarmComplianceResponse) => {
    return data.data.carbon_emission_accounting.status;
};

/**
 * Get data verification status
 */
export const getVerificationStatus = (data: FarmComplianceResponse) => {
    return {
        carbon: data.data.carbon_emissions.data_quality.verification,
        overall: data.data.compliance_scores.scores.verification
    };
};

/**
 * Get import history
 */
export const getImportHistory = (data: FarmComplianceResponse) => {
    return data.data.audit_trails.imports;
};

/**
 * Get recent import date
 */
export const getRecentImportDate = (data: FarmComplianceResponse) => {
    return data.data.audit_trails.summary.recent_import;
};