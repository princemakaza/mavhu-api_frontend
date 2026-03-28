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
 * Farm Compliance Document (raw)
 * =====================
 */
export interface MetricYearlyValue {
    year: string;
    value: number;
    unit: string;
    source: string;
    added_by: User;
    _id: string;
    added_at: string;
    last_updated_at: string;
}

export interface MetricListItem {
    item: string;
    source: string;
    _id: string;
    added_at: string;
}

export interface Metric {
    category: string;
    metric_name: string;
    data_type: "yearly_series" | "list";
    yearly_data?: MetricYearlyValue[];
    list_data?: MetricListItem[];
    single_value: {
        added_at: string;
    };
    is_active: boolean;
    created_by: string;
    _id: string;
    created_at: string;
}

export interface User {
    _id: string;
    email: string;
    phone: string;
    full_name: string;
    status: string;
    email_verified: boolean;
    auth_providers: any[];
    created_at: string;
    updated_at: string;
    __v: number;
}

export interface SummaryStats {
    total_executive_hours: number;
    total_senior_management_hours: number;
    total_other_employees_hours: number;
    avg_executive_hours: number;
    avg_senior_management_hours: number;
    avg_other_employees_hours: number;
    training_focus_areas_count: number;
    training_delivery_methods_count: number;
    compliance_programs_count: number;
}

export interface FarmComplianceDoc {
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
    metrics: Metric[];
    summary_stats: SummaryStats;
    created_by: User;
    last_updated_by: User;
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

/**
 * =====================
 * Farm Compliance (flattened)
 * =====================
 */
export interface FlattenedMetric {
    category: string;
    unit: string;
    value: number;
    source: string;
    added_at: string;
    added_by: User;
}

export interface FarmComplianceMetrics {
    training: {
        total_training_hours: number | null;
        farmer_training_hours: number | null;
        safety_training_hours: number | null;
        technical_training_hours: number | null;
        compliance_training_hours: number | null;
        employees_trained_total: number | null;
        employees_trained_farmers: number | null;
    };
    scope3_engagement: {
        suppliers_with_code: number | null;
        suppliers_audited: number | null;
        supplier_training_hours: number | null;
        non_compliance_cases: number | null;
        corrective_actions: number | null;
    };
}

export interface FarmCompliance {
    document_id: string;
    data_period: {
        start: string;
        end: string;
    };
    all_metrics: Record<string, FlattenedMetric>; // metric_name -> metric
    metrics: FarmComplianceMetrics;
    summary_stats: SummaryStats;
    gri_references: any[];
    forecast_data: any[];
    risk_assessment: any[];
    import_info: {
        import_source: string;
        source_file_name: string;
        import_date: string;
        data_quality_score: number | null;
        verification_status: string;
    };
    metadata: {
        version: number;
        created_at: string;
        created_by: User;
        last_updated_at: string;
        last_updated_by: User;
        validation_status: string;
    };
}

/**
 * =====================
 * Carbon Scope 3
 * =====================
 */
export interface Scope3Category {
    category: string;
    parameter: string;
    unit: string;
    annual_activity_per_ha: number;
    emission_factor: string;
    ef_number: number;
    tco2e_per_ha_per_year: number;
}

export interface CarbonScope3 {
    total_tco2e: number;
    total_tco2e_per_ha: number;
    categories: Scope3Category[];
    sequestration_total_tco2: number;
    net_balance_tco2e: number;
    data_quality: {
        completeness: number;
        verification: string;
    };
}

/**
 * =====================
 * Framework Alignment
 * =====================
 */
export interface FrameworkAlignment {
    gri_compliance: number | null;
    ifrs_s1_alignment: number | null;
    ifrs_s2_alignment: number | null;
    tcfd_implementation: number | null;
    sasb_alignment: number | null;
    unsdg_alignment: number | null;
    cdp_score: number | null;
}

/**
 * =====================
 * GRI/IFRS Data
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

export interface Policy {
    name: string;
    category: string;
    status: string;
    description: string | null;
    verified: boolean;
}

export interface GRIIFRSData {
    sources: any[];
    alignments: AlignmentMetric[];
    files: any[];
    policies: Policy[];
    certifications: any[];
}

/**
 * =====================
 * Policies & Certifications
 * =====================
 */
export interface PolicyItem {
    title: string;
    description: string | null;
    category: string;
    status: string;
    year: number;
    verified: boolean;
}

export interface PoliciesAndCertifications {
    policies: PolicyItem[];
    certifications: any[];
    summary: {
        total_policies: number;
        total_certifications: number;
    };
}

/**
 * =====================
 * Audit Trails
 * =====================
 */
export interface ImportHistory {
    batch_id?: string;
    source_file: string;
    file_type: string;
    import_date: string;
    metrics_imported: number;
    import_notes?: string;
}

export interface AuditTrails {
    verifications: any[];
    validations: any[];
    imports: ImportHistory[];
    qualityScores: any[];
}

/**
 * =====================
 * Compliance Scores
 * =====================
 */
export interface ComplianceScores {
    scores: {
        trainingHours: number;
        trainedEmployees: number;
        supplierCodeAdoption: number;
        supplierAudits: number;
        nonCompliance: number;
        frameworkAlignment: number;
        carbonScope3: number;
        overall: number;
    };
    assessmentDate: string;
    rating: string;
}

/**
 * =====================
 * Graphs
 * =====================
 */
export interface GraphDataset {
    label?: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
}

export interface Graph {
    type: string;
    title: string;
    description: string;
    labels: string[];
    datasets: GraphDataset[];
}

export interface Graphs {
    trainingHours: Graph;
    scope3Engagement: Graph;
    scope3ByCategory: Graph;
    frameworkAlignment: Graph;
    complianceRadar: Graph;
}

/**
 * =====================
 * Data Quality Info
 * =====================
 */
export interface DataQualityInfo {
    verified_metrics: number;
    last_verification_date: string | null;
    data_coverage: number;
    carbon_data_available: boolean;
}

/**
 * =====================
 * Recommendations
 * =====================
 */
export interface Recommendations {
    immediate: string[];
    medium_term: string[];
    long_term: string[];
}

/**
 * =====================
 * Metadata
 * =====================
 */
export interface Metadata {
    generated_at: string;
    data_sources: {
        farm_compliance: number;
        esg_data: number;
        carbon_data: number;
    };
    year: number;
}

/**
 * =====================
 * Versions
 * =====================
 */
export interface Versions {
    api: string;
    calculation: string;
    gee_adapter: string;
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
        versions: Versions;
        company: Company;
        reporting_year: number;
        time_period: string;
        farm_compliance_doc: FarmComplianceDoc;
        farm_compliance: FarmCompliance;
        carbon_scope3: CarbonScope3;
        framework_alignment: FrameworkAlignment;
        gri_ifrs_data: GRIIFRSData;
        policies_and_certifications: PoliciesAndCertifications;
        audit_trails: AuditTrails;
        compliance_scores: ComplianceScores;
        graphs: Graphs;
        data_quality: DataQualityInfo;
        recommendations: Recommendations;
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
 * =====================
 * Helper Functions
 * =====================
 */

// --- Company ---
export const getCompany = (data: FarmComplianceResponse) => data.data.company;
export const getFarmAreaOfInterest = (data: FarmComplianceResponse) => data.data.company.area_of_interest_metadata;
export const getFarmCoordinates = (data: FarmComplianceResponse) => data.data.company.area_of_interest_metadata?.coordinates || [];
export const getESGFrameworks = (data: FarmComplianceResponse) => data.data.company.esg_reporting_framework;
export const getESGContactPerson = (data: FarmComplianceResponse) => data.data.company.esg_contact_person;
export const getLatestESGReportYear = (data: FarmComplianceResponse) => data.data.company.latest_esg_report_year;
export const hasESGLinkedPay = (data: FarmComplianceResponse) => data.data.company.has_esg_linked_pay;

// --- Reporting ---
export const getReportingYear = (data: FarmComplianceResponse) => data.data.reporting_year;
export const getTimePeriod = (data: FarmComplianceResponse) => data.data.time_period;

// --- Farm Compliance Document (raw) ---
export const getFarmComplianceDoc = (data: FarmComplianceResponse) => data.data.farm_compliance_doc;
export const getRawMetrics = (data: FarmComplianceResponse) => data.data.farm_compliance_doc.metrics;

// --- Farm Compliance (flattened) ---
export const getFarmCompliance = (data: FarmComplianceResponse) => data.data.farm_compliance;
export const getAllMetrics = (data: FarmComplianceResponse) => data.data.farm_compliance.all_metrics;
export const getTrainingMetrics = (data: FarmComplianceResponse) => data.data.farm_compliance.metrics.training;
export const getScope3EngagementMetrics = (data: FarmComplianceResponse) => data.data.farm_compliance.metrics.scope3_engagement;
export const getComplianceSummaryStats = (data: FarmComplianceResponse) => data.data.farm_compliance.summary_stats;
export const getImportInfo = (data: FarmComplianceResponse) => data.data.farm_compliance.import_info;

// --- Carbon Scope 3 ---
export const getCarbonScope3 = (data: FarmComplianceResponse) => data.data.carbon_scope3;
export const getScope3Categories = (data: FarmComplianceResponse) => data.data.carbon_scope3.categories;
export const getScope3TotalEmissions = (data: FarmComplianceResponse) => data.data.carbon_scope3.total_tco2e;
export const getScope3EmissionsPerHa = (data: FarmComplianceResponse) => data.data.carbon_scope3.total_tco2e_per_ha;
export const getSequestrationTotal = (data: FarmComplianceResponse) => data.data.carbon_scope3.sequestration_total_tco2;
export const getNetCarbonBalance = (data: FarmComplianceResponse) => data.data.carbon_scope3.net_balance_tco2e;
export const getCarbonDataQuality = (data: FarmComplianceResponse) => data.data.carbon_scope3.data_quality;

// --- Framework Alignment ---
export const getFrameworkAlignment = (data: FarmComplianceResponse) => data.data.framework_alignment;

// --- GRI/IFRS Data ---
export const getGRIIFRSData = (data: FarmComplianceResponse) => data.data.gri_ifrs_data;
export const getGRIAlignments = (data: FarmComplianceResponse) => data.data.gri_ifrs_data.alignments;
export const getGRIPolicies = (data: FarmComplianceResponse) => data.data.gri_ifrs_data.policies;

// --- Policies & Certifications ---
export const getPoliciesAndCertifications = (data: FarmComplianceResponse) => data.data.policies_and_certifications;
export const getPolicies = (data: FarmComplianceResponse) => data.data.policies_and_certifications.policies;
export const getCertifications = (data: FarmComplianceResponse) => data.data.policies_and_certifications.certifications;
export const getPoliciesSummary = (data: FarmComplianceResponse) => data.data.policies_and_certifications.summary;

// --- Audit Trails ---
export const getAuditTrails = (data: FarmComplianceResponse) => data.data.audit_trails;
export const getImportHistory = (data: FarmComplianceResponse) => data.data.audit_trails.imports;

// --- Compliance Scores ---
export const getComplianceScores = (data: FarmComplianceResponse) => data.data.compliance_scores;
export const getOverallComplianceScore = (data: FarmComplianceResponse) => data.data.compliance_scores.scores.overall;
export const getComplianceRating = (data: FarmComplianceResponse) => data.data.compliance_scores.rating;
export const getScoreBreakdown = (data: FarmComplianceResponse) => data.data.compliance_scores.scores;

// --- Graphs ---
export const getGraphs = (data: FarmComplianceResponse) => data.data.graphs;
export const getTrainingHoursGraph = (data: FarmComplianceResponse) => data.data.graphs.trainingHours;
export const getScope3EngagementGraph = (data: FarmComplianceResponse) => data.data.graphs.scope3Engagement;
export const getScope3ByCategoryGraph = (data: FarmComplianceResponse) => data.data.graphs.scope3ByCategory;
export const getFrameworkAlignmentGraph = (data: FarmComplianceResponse) => data.data.graphs.frameworkAlignment;
export const getComplianceRadarGraph = (data: FarmComplianceResponse) => data.data.graphs.complianceRadar;

// --- Data Quality ---
export const getDataQualityInfo = (data: FarmComplianceResponse) => data.data.data_quality;
export const isCarbonDataAvailable = (data: FarmComplianceResponse) => data.data.data_quality.carbon_data_available;

// --- Recommendations ---
export const getRecommendations = (data: FarmComplianceResponse) => data.data.recommendations;
export const getImmediateRecommendations = (data: FarmComplianceResponse) => data.data.recommendations.immediate;
export const getMediumTermRecommendations = (data: FarmComplianceResponse) => data.data.recommendations.medium_term;
export const getLongTermRecommendations = (data: FarmComplianceResponse) => data.data.recommendations.long_term;

// --- Metadata ---
export const getMetadata = (data: FarmComplianceResponse) => data.data.metadata;
export const getDataSourcesCount = (data: FarmComplianceResponse) => data.data.metadata.data_sources;

// --- Versions ---
export const getVersions = (data: FarmComplianceResponse) => data.data.versions;

/**
 * =====================
 * Derived / Calculated Helpers
 * =====================
 */

/**
 * Get a specific metric value by name from all_metrics (for the reporting year)
 */
export const getMetricValue = (data: FarmComplianceResponse, metricName: string): number | null => {
    const metric = data.data.farm_compliance.all_metrics[metricName];
    return metric?.value ?? null;
};

/**
 * Get compliance improvement priorities based on low scores
 */
export const getCompliancePriorities = (data: FarmComplianceResponse): string[] => {
    const scores = data.data.compliance_scores.scores;
    const priorities: string[] = [];

    if (scores.trainingHours < 50) priorities.push("Increase training hours");
    if (scores.trainedEmployees < 50) priorities.push("Train more employees");
    if (scores.supplierCodeAdoption < 50) priorities.push("Improve supplier code adoption");
    if (scores.supplierAudits < 50) priorities.push("Conduct more supplier audits");
    if (scores.frameworkAlignment < 50) priorities.push("Enhance ESG framework alignment");
    if (scores.carbonScope3 < 50) priorities.push("Reduce Scope 3 carbon emissions");

    return priorities;
};

/**
 * Calculate carbon intensity per hectare (using net balance)
 */
export const getCarbonIntensityPerHa = (data: FarmComplianceResponse): number | null => {
    const area = data.data.farm_compliance_doc.summary_stats.total_executive_hours; // not actual area, placeholder?
    // Actually, area is not directly available; we could use the reporting area if present, but it's not in this response.
    // Returning null as area is missing.
    return null;
};

/**
 * Get breakdown of Scope 3 emissions by category with percentages
 */
export const getScope3BreakdownWithPercent = (data: FarmComplianceResponse) => {
    const categories = data.data.carbon_scope3.categories;
    const total = data.data.carbon_scope3.total_tco2e;
    return categories.map(cat => ({
        ...cat,
        percentage: total > 0 ? (cat.tco2e_per_ha_per_year * 100) / total : 0
    }));
};