import api from "../Auth_service/api";

// =====================
// Shared / Primitive Types
// =====================

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

export interface SourceFile {
    _id?: string;
    name: string;
    year: string;
    pages: string;
    type: "annual_report" | "integrated_report" | "sustainability_report" | "other";
}

// =====================
// Company
// =====================

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

// =====================
// Metadata
// =====================

export interface Metadata {
    api_version: string;
    calculation_version: string;
    gee_adapter_version: string;
    generated_at: string;
    endpoint: string;
    company_id: string;
    period_requested: string;
    data_sources: string[];
    record_id: string;
    record_version: number;
}

// =====================
// Reporting Period
// =====================

export interface ReportingPeriod {
    data_period_start: string;
    data_period_end: string;
    current_year: number;
    baseline_year: number;
    analysis_years: number[];
    period_covered: string;
    data_completeness: string;
}

// =====================
// User Ref (populated)
// =====================

export interface UserRef {
    _id: string;
    name?: string;
    email?: string;
}

// =====================
// Yearly Data Entry (inside a metric)
// =====================

export interface YearlyDataEntry {
    _id?: string;
    year: string;                    // e.g. "31.03.2025 (FY25)" or "FY25"
    fiscal_year: number;             // e.g. 2025
    value: number | string | null;
    numeric_value: number | null;
    unit: string | null;
    source: string | null;
    notes: string | null;
    added_by: UserRef | null;
    added_at: string;
    last_updated_by?: UserRef | null;
    last_updated_at?: string;
}

// =====================
// Single Value (inside a metric)
// =====================

export interface SingleValue {
    value?: number | string | null;
    numeric_value?: number | null;
    unit?: string | null;
    source?: string | null;
    notes?: string | null;
    as_of_date?: string | null;
    added_by?: UserRef | null;
    added_at?: string;
}

// =====================
// List Data Item (inside a metric)
// =====================

export interface ListDataItem {
    item?: string;
    count?: number;
    details?: string;
    source?: string;
    added_at?: string;
}

// =====================
// Metric (BiodiversityMetric)
// =====================

export type MetricCategory =
    | "agricultural_land"
    | "conservation_protected_habitat"
    | "land_tenure"
    | "restoration_deforestation"
    | "fuelwood_substitution"
    | "biodiversity_flora"
    | "biodiversity_fauna"
    | "human_wildlife_conflict"
    | "summary";

export type MetricDataType = "yearly_series" | "single_value" | "list" | "summary";

export interface BiodiversityMetric {
    _id?: string;
    category: MetricCategory;
    subcategory?: string | null;
    metric_name: string;
    description?: string | null;
    data_type: MetricDataType;
    yearly_data: YearlyDataEntry[];
    single_value?: SingleValue;
    list_data?: ListDataItem[];
    summary_value?: {
        key_metric?: string;
        latest_value?: number | string | null;
        trend?: string;
        notes?: string;
        as_of_date?: string;
    };
    is_active: boolean;
    created_at?: string;
    created_by?: UserRef | null;
}

// =====================
// Yearly Data By Year
// =====================

/** A single metric's data as it appears inside yearly_data_by_year */
export interface YearlyMetricSnapshot {
    category: MetricCategory;
    subcategory?: string | null;
    metric_name: string;
    description?: string | null;
    year_label: string;
    fiscal_year: number | null;
    value: number | string | null;
    numeric_value: number | null;
    unit: string | null;
    source: string | null;
    notes: string | null;
    added_by: UserRef | null;
    added_at: string | null;
    last_updated_by: UserRef | null;
    last_updated_at: string | null;
}

/** One year's worth of metric snapshots, keyed by "category__metric_name" */
export interface YearlyDataEntry2 {
    year: number;
    metrics: Record<string, YearlyMetricSnapshot>;
}

/** yearly_data_by_year top-level object, keyed by year string e.g. "2025" */
export type YearlyDataByYear = Record<string, YearlyDataEntry2>;

// =====================
// Metrics By Category
// =====================

export interface MetricsByCategory {
    agricultural_land: BiodiversityMetric[];
    conservation_protected_habitat: BiodiversityMetric[];
    land_tenure: BiodiversityMetric[];
    restoration_deforestation: BiodiversityMetric[];
    fuelwood_substitution: BiodiversityMetric[];
    biodiversity_flora: BiodiversityMetric[];
    biodiversity_fauna: BiodiversityMetric[];
    human_wildlife_conflict: BiodiversityMetric[];
    summary: BiodiversityMetric[];
}

// =====================
// Source Information
// =====================

export interface SourceInformation {
    original_source?: string;
    source_files?: SourceFile[];
    import_source?: string;
    source_file_name?: string;
    source_file_metadata?: Record<string, any> | null;
    import_batch_id?: string;
    import_date?: string;
    import_notes?: string;
}

// =====================
// Validation Error
// =====================

export interface ValidationError {
    metric_name?: string;
    year?: string;
    error_message?: string;
    field?: string;
    severity?: "warning" | "error" | "critical";
}

// =====================
// Data Quality
// =====================

export interface DataQuality {
    quality_score: number | null;
    verification_status: "unverified" | "pending_review" | "verified" | "audited" | "disputed";
    verified_by?: UserRef | null;
    verified_at?: string | null;
    verification_notes?: string | null;
    validation_status: "not_validated" | "validating" | "validated" | "failed_validation";
    validation_errors: ValidationError[];
    validation_notes?: string | null;
}

// =====================
// Summary Statistics
// =====================

export interface SummaryStatistics {
    total_conservation_area: number;
    total_agricultural_area: number;
    total_surveyed_area: number;
    total_trees_planted: number;
    total_lpg_distributed: number;
    flora_species_count: number;
    fauna_species_count: number;
    total_restored_area: number;
    trees_planted_cumulative: number;
    lpg_distributions: number;
    human_wildlife_conflicts: number;
    last_updated?: string;
}

// =====================
// GRI Reference
// =====================

export interface GriReference {
    _id?: string;
    standard: string;
    metric_name: string;
    compliance_status: "compliant" | "partially_compliant" | "non_compliant" | "not_applicable";
    reporting_year: string;
}

// =====================
// Graphs (chart configs)
// =====================

export interface GraphDataset {
    label?: string;
    data: (number | null)[];
    borderColor?: string;
    backgroundColor?: string | string[];
    fill?: boolean;
    tension?: number;
    borderWidth?: number;
}

export interface Graph {
    type: "line" | "bar" | "doughnut" | "pie" | string;
    title: string;
    description: string;
    labels: (string | number)[];
    datasets: GraphDataset[];
}

export interface Graphs {
    land_use_composition?: Graph;
    forest_area_trend?: Graph;
    species_count_trend?: Graph;
    trees_planted_trend?: Graph;
    [key: string]: Graph | undefined;
}

// =====================
// Key Performance Indicators
// =====================

export interface KeyPerformanceIndicators {
    conservation_area: number;
    agricultural_area: number;
    restored_area: number;
    flora_species: number;
    fauna_species: number;
    trees_planted_cumulative: number;
    lpg_distributions: number;
    human_wildlife_conflicts: number;
}

// =====================
// Audit
// =====================

export interface Audit {
    created_at: string;
    created_by: UserRef | null;
    last_updated_at: string;
    last_updated_by: UserRef | null;
    version: number;
    previous_version?: any | null;
    deleted_at?: string | null;
    deleted_by?: UserRef | null;
    is_active: boolean;
}

// =====================
// Main Response Interface
// =====================

export interface BiodiversityLandUseData {
    metadata: Metadata;
    company: Company;
    reporting_period: ReportingPeriod;
    yearly_data_by_year: YearlyDataByYear;
    source_information: SourceInformation;
    data_quality: DataQuality;
    summary_statistics: SummaryStatistics;
    gri_references: GriReference[];
    metrics_by_category: MetricsByCategory;
    all_metrics: BiodiversityMetric[];
    graphs: Graphs;
    key_performance_indicators: KeyPerformanceIndicators;
    audit: Audit;
}

export interface BiodiversityLandUseResponse {
    message: string;
    api: string;
    data: BiodiversityLandUseData;
}

// =====================
// Request Parameters
// =====================

export interface BiodiversityLandUseParams {
    companyId: string;
    year?: number;
    startYear?: number;
    endYear?: number;
}

// =====================
// API Call
// =====================

export const getBiodiversityLandUseData = async (
    params: BiodiversityLandUseParams
): Promise<BiodiversityLandUseResponse> => {
    try {
        const { companyId, year, startYear, endYear } = params;

        const queryParams = new URLSearchParams();
        if (year !== undefined) queryParams.append("year", year.toString());
        if (startYear !== undefined) queryParams.append("startYear", startYear.toString());
        if (endYear !== undefined) queryParams.append("endYear", endYear.toString());

        const queryString = queryParams.toString();
        const url = `/esg-dashboard/biodiversity-landuse/${companyId}${queryString ? `?${queryString}` : ""}`;

        const { data } = await api.get<BiodiversityLandUseResponse>(url);
        return data;
    } catch (error: any) {
        const statusCode = error.response?.status;
        const errorMessage = error.response?.data?.error || error.response?.data?.message;

        switch (statusCode) {
            case 400: throw new Error(errorMessage || "Invalid request parameters");
            case 401: throw new Error("Unauthorized access. Please check your authentication token.");
            case 403: throw new Error("You don't have permission to access this resource.");
            case 404: throw new Error("Biodiversity and land use data not found for the specified company.");
            case 422: throw new Error(errorMessage || "Invalid year parameter or data format.");
            case 500: throw new Error("Server error occurred while fetching biodiversity and land use data.");
            case 503: throw new Error("Biodiversity and land use service is temporarily unavailable.");
            default:
                throw new Error(
                    errorMessage ||
                    error.response?.data?.detail ||
                    "Failed to fetch biodiversity and land use data"
                );
        }
    }
};

// =====================
// Accessor Helpers
// =====================

/** All fiscal years available in the response */
export const getAvailableYears = (data: BiodiversityLandUseResponse): number[] =>
    data.data.reporting_period.analysis_years ?? [];

/** Full company object */
export const getCompany = (data: BiodiversityLandUseResponse): Company =>
    data.data.company;

/** Metadata block */
export const getMetadata = (data: BiodiversityLandUseResponse): Metadata =>
    data.data.metadata;

/** Reporting period block */
export const getReportingPeriod = (data: BiodiversityLandUseResponse): ReportingPeriod =>
    data.data.reporting_period;

/** Current (latest) fiscal year */
export const getCurrentYear = (data: BiodiversityLandUseResponse): number =>
    data.data.reporting_period.current_year;

/** Baseline (earliest) fiscal year */
export const getBaselineYear = (data: BiodiversityLandUseResponse): number =>
    data.data.reporting_period.baseline_year;

/** Data completeness string */
export const getDataCompleteness = (data: BiodiversityLandUseResponse): string =>
    data.data.reporting_period.data_completeness;

// ---- yearly_data_by_year ----

/** All metric snapshots for a specific fiscal year */
export const getMetricsByYear = (
    data: BiodiversityLandUseResponse,
    year: number
): Record<string, YearlyMetricSnapshot> | null =>
    data.data.yearly_data_by_year[year.toString()]?.metrics ?? null;

/** A single metric snapshot for a specific year, by composite key "category__metric_name" */
export const getMetricSnapshotByYear = (
    data: BiodiversityLandUseResponse,
    year: number,
    compositeKey: string
): YearlyMetricSnapshot | null =>
    data.data.yearly_data_by_year[year.toString()]?.metrics[compositeKey] ?? null;

/** Convenience: get a metric snapshot by category + metric_name */
export const getMetricSnapshot = (
    data: BiodiversityLandUseResponse,
    year: number,
    category: MetricCategory,
    metricName: string
): YearlyMetricSnapshot | null =>
    getMetricSnapshotByYear(data, year, `${category}__${metricName}`);

// ---- metrics_by_category ----

export const getMetricsByCategory = (data: BiodiversityLandUseResponse): MetricsByCategory =>
    data.data.metrics_by_category;

export const getAgriculturalLandMetrics = (data: BiodiversityLandUseResponse): BiodiversityMetric[] =>
    data.data.metrics_by_category.agricultural_land;

export const getConservationMetrics = (data: BiodiversityLandUseResponse): BiodiversityMetric[] =>
    data.data.metrics_by_category.conservation_protected_habitat;

export const getLandTenureMetrics = (data: BiodiversityLandUseResponse): BiodiversityMetric[] =>
    data.data.metrics_by_category.land_tenure;

export const getRestorationMetrics = (data: BiodiversityLandUseResponse): BiodiversityMetric[] =>
    data.data.metrics_by_category.restoration_deforestation;

export const getFuelwoodMetrics = (data: BiodiversityLandUseResponse): BiodiversityMetric[] =>
    data.data.metrics_by_category.fuelwood_substitution;

export const getFloraMetrics = (data: BiodiversityLandUseResponse): BiodiversityMetric[] =>
    data.data.metrics_by_category.biodiversity_flora;

export const getFaunaMetrics = (data: BiodiversityLandUseResponse): BiodiversityMetric[] =>
    data.data.metrics_by_category.biodiversity_fauna;

export const getHumanWildlifeMetrics = (data: BiodiversityLandUseResponse): BiodiversityMetric[] =>
    data.data.metrics_by_category.human_wildlife_conflict;

// ---- all_metrics ----

export const getAllMetrics = (data: BiodiversityLandUseResponse): BiodiversityMetric[] =>
    data.data.all_metrics;

/** Find a metric from the flat array by category + name */
export const findMetric = (
    data: BiodiversityLandUseResponse,
    category: MetricCategory,
    metricName: string
): BiodiversityMetric | undefined =>
    data.data.all_metrics.find(
        (m) => m.category === category && m.metric_name === metricName
    );

/** Get all yearly_data entries for a specific metric */
export const getMetricYearlyData = (
    data: BiodiversityLandUseResponse,
    category: MetricCategory,
    metricName: string
): YearlyDataEntry[] =>
    findMetric(data, category, metricName)?.yearly_data ?? [];

/** Get a single year's entry from within a specific metric */
export const getMetricValueForYear = (
    data: BiodiversityLandUseResponse,
    category: MetricCategory,
    metricName: string,
    year: number
): YearlyDataEntry | undefined =>
    getMetricYearlyData(data, category, metricName).find((yd) => yd.fiscal_year === year);

// ---- summary_statistics ----

export const getSummaryStatistics = (data: BiodiversityLandUseResponse): SummaryStatistics =>
    data.data.summary_statistics;

// ---- key_performance_indicators ----

export const getKeyPerformanceIndicators = (data: BiodiversityLandUseResponse): KeyPerformanceIndicators =>
    data.data.key_performance_indicators;

// ---- graphs ----

export const getAllGraphs = (data: BiodiversityLandUseResponse): Graphs =>
    data.data.graphs;

export const getLandUseCompositionGraph = (data: BiodiversityLandUseResponse): Graph | undefined =>
    data.data.graphs.land_use_composition;

export const getForestAreaTrendGraph = (data: BiodiversityLandUseResponse): Graph | undefined =>
    data.data.graphs.forest_area_trend;

export const getSpeciesCountTrendGraph = (data: BiodiversityLandUseResponse): Graph | undefined =>
    data.data.graphs.species_count_trend;

export const getTreesPlantedTrendGraph = (data: BiodiversityLandUseResponse): Graph | undefined =>
    data.data.graphs.trees_planted_trend;

// ---- data_quality ----

export const getDataQuality = (data: BiodiversityLandUseResponse): DataQuality =>
    data.data.data_quality;

export const isDataVerified = (data: BiodiversityLandUseResponse): boolean =>
    ["verified", "audited"].includes(data.data.data_quality.verification_status);

export const getValidationErrors = (data: BiodiversityLandUseResponse): ValidationError[] =>
    data.data.data_quality.validation_errors;

// ---- source_information ----

export const getSourceInformation = (data: BiodiversityLandUseResponse): SourceInformation =>
    data.data.source_information;

// ---- gri_references ----

export const getGriReferences = (data: BiodiversityLandUseResponse): GriReference[] =>
    data.data.gri_references;

// ---- audit ----

export const getAudit = (data: BiodiversityLandUseResponse): Audit =>
    data.data.audit;

// ---- company convenience ----

export const getAreaOfInterestMetadata = (data: BiodiversityLandUseResponse): AreaOfInterestMetadata | undefined =>
    data.data.company.area_of_interest_metadata;

export const getCoordinatesForMapping = (data: BiodiversityLandUseResponse): Coordinate[] =>
    data.data.company.area_of_interest_metadata?.coordinates ?? [];

export const hasAreaOfInterest = (data: BiodiversityLandUseResponse): boolean =>
    !!data.data.company.area_of_interest_metadata?.coordinates?.length;

// ---- common derived values ----

export const getTotalAgriculturalArea = (data: BiodiversityLandUseResponse): number =>
    data.data.summary_statistics.total_agricultural_area;

export const getTotalSurveyedArea = (data: BiodiversityLandUseResponse): number =>
    data.data.summary_statistics.total_surveyed_area;

export const getTotalLpgDistributed = (data: BiodiversityLandUseResponse): number =>
    data.data.summary_statistics.total_lpg_distributed;

export const getTotalTreesPlanted = (data: BiodiversityLandUseResponse): number =>
    data.data.summary_statistics.total_trees_planted;

export const getLpgDistributionsForYear = (
    data: BiodiversityLandUseResponse,
    year: number
): number | null =>
    getMetricSnapshot(data, year, "fuelwood_substitution", "LPG Distributed (kg)")?.numeric_value ?? null;

export const getAreaUnderCaneForYear = (
    data: BiodiversityLandUseResponse,
    year: number
): number | null =>
    getMetricSnapshot(data, year, "agricultural_land", "Area Under Cane")?.numeric_value ?? null;

export const getTotalAgriculturalLandForYear = (
    data: BiodiversityLandUseResponse,
    year: number
): number | null =>
    getMetricSnapshot(data, year, "agricultural_land", "Total Agricultural Land (Cane + Orchards)")?.numeric_value ?? null;

export const getSurveyedLandAreaForYear = (
    data: BiodiversityLandUseResponse,
    year: number
): number | null =>
    getMetricSnapshot(data, year, "land_tenure", "Total Surveyed Land Area")?.numeric_value ?? null;