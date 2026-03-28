import api from "../Auth_service/api";

/**
 * =====================
 * Types & Interfaces for Health & Safety
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

export interface CompanyInfo {
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
    social_metrics_count: number;
    verification_summary: {
        unverified: number;
    };
    social_categories: Record<string, number>;
}

export interface PerformanceIndicator {
    value: string | number;
    unit: string;
    label: string;
    description: string;
    trend: string;
    target?: string;
    year: number;
}

export interface HealthSafetySummary {
    year: number;
    overview: {
        title: string;
        description: string;
        key_message: string;
    };
    safety_snapshot: {
        days_since_last_lost_time_injury: number;
        safety_goal: string;
        safety_culture_score: number;
        last_safety_audit_date: string;
        audit_result: string;
    };
    performance_indicators: {
        injury_rate: PerformanceIndicator;
        safety_meetings: PerformanceIndicator;
        total_injuries: PerformanceIndicator;
        safety_training: PerformanceIndicator;
    };
}

export interface IncidentData {
    year: number;
    fatalities: {
        count: number;
        description: string;
        trend: string;
    };
    lost_time_injuries: {
        count: number;
        description: string;
        average_recovery_days: number;
    };
    total_recordable_injuries: {
        count: number;
        description: string;
        severity_breakdown: {
            minor: number;
            moderate: number;
            serious: number;
        };
    };
    near_misses: {
        count: number;
        description: string;
        reporting_rate: string;
        trend: string;
    };
}

export interface SafetyCommittee {
    meetings: number;
    members: number;
    focus_areas: string[];
    initiatives_completed: number;
}

export interface CrossCompanyInitiative {
    name: string;
    participants?: number;
    impact?: string;
    frequency?: string;
    last_drill?: string;
    effectiveness?: string;
}

export interface SafetyCommittees {
    year: number;
    agriculture_committee: SafetyCommittee;
    milling_committee: SafetyCommittee;
    cross_company_initiatives: CrossCompanyInitiative[];
}

export interface MedicalServices {
    medical_examinations: number;
    first_aid_certified_staff: number;
    on_site_clinics: number;
    emergency_response_teams: number;
}

export interface WellnessPrograms {
    mental_health_support: boolean;
    ergonomic_assessments: number;
    health_screenings: string;
    vaccination_campaigns: string[];
}

export interface ProtectiveEquipment {
    ppe_compliance: number;
    equipment_provided: string[];
    annual_investment: string;
}

export interface WorkerHealth {
    year: number;
    medical_services: MedicalServices;
    wellness_programs: WellnessPrograms;
    protective_equipment: ProtectiveEquipment;
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

export interface SocialMetric {
    name: string;
    unit: string | null;
    description: string | null;
    category: string;
    values: MetricValue[];
    verification_status: string;
    data_source: string;
}

export interface SocialMetrics {
    year: number;
    total_metrics: number;
    metrics_by_category: Record<string, number>;
    metrics: Record<string, SocialMetric>;
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

export interface GraphDataset {
    label: string;
    data: number[] | string[];
    borderColor?: string;
    backgroundColor?: string | string[] | any;
    fill?: boolean;
    borderDash?: number[];
    tension?: number;
    borderWidth?: number;
    pointBackgroundColor?: string;
}

export interface Graph {
    type: string;
    title: string;
    description: string;
    labels: (string | number)[];
    datasets: GraphDataset[];
}

export interface Graphs {
    injury_rate_trend: Graph;
    incident_types_breakdown: Graph;
    safety_activities_by_department: Graph;
    safety_performance_areas: Graph;
}

export interface SafetyInitiative {
    name: string;
    description: string;
    participation?: string;
    impact?: string;
    trained_coaches?: number;
    departments_covered?: string;
    contractors_trained?: number;
    compliance_rate?: string;
}

export interface UpcomingFocusArea {
    area: string;
    action: string;
    timeline: string;
}

export interface SafetyInitiatives {
    year: number;
    active_programs: SafetyInitiative[];
    upcoming_focus_areas: UpcomingFocusArea[];
}

export interface Certification {
    name: string;
    status: string;
    valid_until?: string;
    last_audit?: string;
}

export interface SafetyBenchmarks {
    year: number;
    comparison_data: {
        our_ltifr: string;
        industry_average_ltifr: string;
        best_in_class_ltifr: string;
        our_safety_training_hours: number;
        industry_average_training_hours: string;
        our_ppe_compliance: number;
        industry_average_ppe_compliance: string;
    };
    certifications: Certification[];
}

export interface Recommendation {
    priority: string;
    action: string;
    impact: string;
    timeline: string;
    responsible_department?: string;
    investment_required?: string;
    metrics_affected?: string[];
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

export interface HealthSafetyResponse {
    message: string;
    api: string;
    data: {
        api_info: ApiInfo;
        year_data: YearData;
        company: CompanyInfo;
        health_safety_summary: HealthSafetySummary;
        incident_data: IncidentData;
        safety_committees: SafetyCommittees;
        worker_health: WorkerHealth;
        social_metrics: SocialMetrics;
        detailed_health_safety_metrics: {
            year: number;
            metrics: Record<string, any>;
        };
        graphs: Graphs;
        safety_initiatives: SafetyInitiatives;
        safety_benchmarks: SafetyBenchmarks;
        recommendations: Recommendation[];
        data_quality: DataQuality;
    };
}

export interface HealthSafetyParams {
    companyId: string;
    year?: number;
}

/**
 * =====================
 * Health & Safety Service
 * =====================
 */

export const getHealthSafetyData = async (
    params: HealthSafetyParams
): Promise<HealthSafetyResponse> => {
    try {
        const { companyId, year } = params;

        const queryParams = new URLSearchParams();
        if (year !== undefined) {
            queryParams.append('year', year.toString());
        }

        const queryString = queryParams.toString();
        const url = `/esg-dashboard/health-safety/${companyId}${queryString ? `?${queryString}` : ''}`;

        const { data } = await api.get<HealthSafetyResponse>(url);
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
                throw new Error("Health & safety data not found for the specified company.");
            case 422:
                throw new Error(errorMessage || "Invalid year parameter or data format.");
            case 500:
                throw new Error("Server error occurred while fetching health & safety data.");
            case 503:
                throw new Error("Health & safety service is temporarily unavailable.");
            default:
                throw new Error(
                    errorMessage ||
                    error.response?.data?.detail ||
                    "Failed to fetch health & safety data"
                );
        }
    }
};

/**
 * =====================
 * Helper Functions for Health & Safety
 * =====================
 */

/**
 * Get company information
 */
export const getHealthSafetyCompanyInfo = (data: HealthSafetyResponse): CompanyInfo => {
    return data.data.company;
};

/**
 * Get health & safety summary data
 */
export const getHealthSafetySummary = (data: HealthSafetyResponse): HealthSafetySummary => {
    return data.data.health_safety_summary;
};

/**
 * Get incident data
 */
export const getIncidentData = (data: HealthSafetyResponse): IncidentData => {
    return data.data.incident_data;
};

/**
 * Get safety committees data
 */
export const getSafetyCommittees = (data: HealthSafetyResponse): SafetyCommittees => {
    return data.data.safety_committees;
};

/**
 * Get worker health data
 */
export const getWorkerHealth = (data: HealthSafetyResponse): WorkerHealth => {
    return data.data.worker_health;
};

/**
 * Get social metrics
 */
export const getSocialMetrics = (data: HealthSafetyResponse): SocialMetrics => {
    return data.data.social_metrics;
};

/**
 * Get all graphs
 */
export const getAllHealthSafetyGraphs = (data: HealthSafetyResponse): Graphs => {
    return data.data.graphs;
};

/**
 * Get specific graph by type
 */
export const getHealthSafetyGraphByType = (data: HealthSafetyResponse, graphType: string): Graph | undefined => {
    const graphs = data.data.graphs;
    switch (graphType) {
        case 'injury_rate_trend':
            return graphs.injury_rate_trend;
        case 'incident_types_breakdown':
            return graphs.incident_types_breakdown;
        case 'safety_activities_by_department':
            return graphs.safety_activities_by_department;
        case 'safety_performance_areas':
            return graphs.safety_performance_areas;
        default:
            return undefined;
    }
};

/**
 * Get safety initiatives
 */
export const getSafetyInitiatives = (data: HealthSafetyResponse): SafetyInitiatives => {
    return data.data.safety_initiatives;
};

/**
 * Get safety benchmarks
 */
export const getSafetyBenchmarks = (data: HealthSafetyResponse): SafetyBenchmarks => {
    return data.data.safety_benchmarks;
};

/**
 * Get recommendations
 */
export const getRecommendations = (data: HealthSafetyResponse): Recommendation[] => {
    return data.data.recommendations;
};

/**
 * Get data quality information
 */
export const getDataQuality = (data: HealthSafetyResponse): DataQuality => {
    return data.data.data_quality;
};

/**
 * Get API information
 */
export const getApiInfo = (data: HealthSafetyResponse): ApiInfo => {
    return data.data.api_info;
};

/**
 * Get year data
 */
export const getYearData = (data: HealthSafetyResponse): YearData => {
    return data.data.year_data;
};

/**
 * Get performance indicators
 */
export const getPerformanceIndicators = (data: HealthSafetyResponse) => {
    return data.data.health_safety_summary.performance_indicators;
};

/**
 * Get injury rate
 */
export const getInjuryRate = (data: HealthSafetyResponse): PerformanceIndicator => {
    return data.data.health_safety_summary.performance_indicators.injury_rate;
};

/**
 * Get safety meetings data
 */
export const getSafetyMeetings = (data: HealthSafetyResponse): PerformanceIndicator => {
    return data.data.health_safety_summary.performance_indicators.safety_meetings;
};

/**
 * Get total injuries
 */
export const getTotalInjuries = (data: HealthSafetyResponse): PerformanceIndicator => {
    return data.data.health_safety_summary.performance_indicators.total_injuries;
};

/**
 * Get safety training data
 */
export const getSafetyTraining = (data: HealthSafetyResponse): PerformanceIndicator => {
    return data.data.health_safety_summary.performance_indicators.safety_training;
};

/**
 * Get safety snapshot
 */
export const getSafetySnapshot = (data: HealthSafetyResponse) => {
    return data.data.health_safety_summary.safety_snapshot;
};

/**
 * Get fatalities data
 */
export const getFatalities = (data: HealthSafetyResponse) => {
    return data.data.incident_data.fatalities;
};

/**
 * Get lost time injuries
 */
export const getLostTimeInjuries = (data: HealthSafetyResponse) => {
    return data.data.incident_data.lost_time_injuries;
};

/**
 * Get total recordable injuries
 */
export const getTotalRecordableInjuries = (data: HealthSafetyResponse) => {
    return data.data.incident_data.total_recordable_injuries;
};

/**
 * Get near misses data
 */
export const getNearMisses = (data: HealthSafetyResponse) => {
    return data.data.incident_data.near_misses;
};

/**
 * Get agriculture committee data
 */
export const getAgricultureCommittee = (data: HealthSafetyResponse): SafetyCommittee => {
    return data.data.safety_committees.agriculture_committee;
};

/**
 * Get milling committee data
 */
export const getMillingCommittee = (data: HealthSafetyResponse): SafetyCommittee => {
    return data.data.safety_committees.milling_committee;
};

/**
 * Get cross company initiatives
 */
export const getCrossCompanyInitiatives = (data: HealthSafetyResponse): CrossCompanyInitiative[] => {
    return data.data.safety_committees.cross_company_initiatives;
};

/**
 * Get medical services data
 */
export const getMedicalServices = (data: HealthSafetyResponse): MedicalServices => {
    return data.data.worker_health.medical_services;
};

/**
 * Get wellness programs
 */
export const getWellnessPrograms = (data: HealthSafetyResponse): WellnessPrograms => {
    return data.data.worker_health.wellness_programs;
};

/**
 * Get protective equipment data
 */
export const getProtectiveEquipment = (data: HealthSafetyResponse): ProtectiveEquipment => {
    return data.data.worker_health.protective_equipment;
};

/**
 * Get social metric by name
 */
export const getSocialMetricByName = (data: HealthSafetyResponse, metricName: string): SocialMetric | undefined => {
    return data.data.social_metrics.metrics[metricName];
};

/**
 * Get all social metric names
 */
export const getAllSocialMetricNames = (data: HealthSafetyResponse): string[] => {
    return Object.keys(data.data.social_metrics.metrics);
};

/**
 * Get metric categories breakdown
 */
export const getSocialMetricCategoriesBreakdown = (data: HealthSafetyResponse): Record<string, number> => {
    return data.data.social_metrics.metrics_by_category;
};

/**
 * Get total number of metrics
 */
export const getTotalSocialMetricsCount = (data: HealthSafetyResponse): number => {
    return data.data.social_metrics.total_metrics;
};

/**
 * Get social data range information
 */
export const getSocialDataRange = (data: HealthSafetyResponse) => {
    return data.data.social_metrics.metadata.data_range;
};

/**
 * Get social verification status
 */
export const getSocialVerificationStatus = (data: HealthSafetyResponse) => {
    return data.data.social_metrics.metadata.verification_status;
};

/**
 * Get area of interest metadata
 */
export const getAreaOfInterestMetadata = (data: HealthSafetyResponse): AreaOfInterestMetadata => {
    return data.data.company.area_of_interest_metadata;
};

/**
 * Get ESG contact person
 */
export const getEsgContactPerson = (data: HealthSafetyResponse): EsgContactPerson => {
    return data.data.company.esg_contact_person;
};

/**
 * Get ESG reporting frameworks
 */
export const getEsgReportingFrameworks = (data: HealthSafetyResponse): string[] => {
    return data.data.company.esg_reporting_framework;
};

/**
 * Get requested year
 */
export const getRequestedYear = (data: HealthSafetyResponse): number => {
    return data.data.year_data.requested_year;
};

/**
 * Check if data is available for the requested year
 */
export const isDataAvailable = (data: HealthSafetyResponse): boolean => {
    return data.data.year_data.data_available;
};

/**
 * Get social metrics count
 */
export const getSocialMetricsCount = (data: HealthSafetyResponse): number => {
    return data.data.year_data.social_metrics_count;
};

/**
 * Get active safety programs
 */
export const getActiveSafetyPrograms = (data: HealthSafetyResponse): SafetyInitiative[] => {
    return data.data.safety_initiatives.active_programs;
};

/**
 * Get upcoming focus areas
 */
export const getUpcomingFocusAreas = (data: HealthSafetyResponse): UpcomingFocusArea[] => {
    return data.data.safety_initiatives.upcoming_focus_areas;
};

/**
 * Get comparison data from benchmarks
 */
export const getComparisonData = (data: HealthSafetyResponse) => {
    return data.data.safety_benchmarks.comparison_data;
};

/**
 * Get certifications
 */
export const getCertifications = (data: HealthSafetyResponse): Certification[] => {
    return data.data.safety_benchmarks.certifications;
};

/**
 * Get high priority recommendations
 */
export const getHighPriorityRecommendations = (data: HealthSafetyResponse): Recommendation[] => {
    return data.data.recommendations.filter(rec => rec.priority === 'High');
};

/**
 * Get medium priority recommendations
 */
export const getMediumPriorityRecommendations = (data: HealthSafetyResponse): Recommendation[] => {
    return data.data.recommendations.filter(rec => rec.priority === 'Medium');
};

/**
 * Get low priority recommendations
 */
export const getLowPriorityRecommendations = (data: HealthSafetyResponse): Recommendation[] => {
    return data.data.recommendations.filter(rec => rec.priority === 'Low');
};

/**
 * Calculate injury rate per employee
 */
export const calculateInjuryRatePerEmployee = (injuryCount: number, employeeCount: number): number => {
    if (employeeCount === 0) return 0;
    return (injuryCount / employeeCount) * 1000; // per 1000 employees
};

/**
 * Calculate safety compliance score
 */
export const calculateSafetyComplianceScore = (
    ppeCompliance: number,
    trainingHours: number,
    meetingCount: number
): number => {
    const weights = {
        ppe: 0.4,
        training: 0.3,
        meetings: 0.3
    };

    return (
        (ppeCompliance * weights.ppe) +
        (Math.min(trainingHours / 10, 1) * 100 * weights.training) + // Assuming 10 hours is target
        (Math.min(meetingCount / 12, 1) * 100 * weights.meetings)   // Assuming 12 meetings is target
    );
};

/**
 * Calculate days without incident
 */
export const calculateDaysWithoutIncident = (lastInjuryDate: string): number => {
    const lastDate = new Date(lastInjuryDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calculate near miss reporting efficiency
 */
export const calculateNearMissEfficiency = (nearMissCount: number, totalIncidents: number): number => {
    if (totalIncidents === 0) return 0;
    return (nearMissCount / (nearMissCount + totalIncidents)) * 100;
};

/**
 * Get safety metrics summary for dashboard
 */
export const getSafetyMetricsSummary = (data: HealthSafetyResponse) => {
    const summary = data.data.health_safety_summary;
    const incidents = data.data.incident_data;
    const benchmarks = data.data.safety_benchmarks.comparison_data;

    return {
        injuryRate: parseFloat(summary.performance_indicators.injury_rate.value as string),
        totalInjuries: summary.performance_indicators.total_injuries.value as number,
        safetyMeetings: summary.performance_indicators.safety_meetings.value as number,
        safetyTraining: parseInt(summary.performance_indicators.safety_training.value as string),
        fatalities: incidents.fatalities.count,
        lostTimeInjuries: incidents.lost_time_injuries.count,
        nearMisses: incidents.near_misses.count,
        industryAverage: parseFloat(benchmarks.industry_average_ltifr),
        ppeCompliance: benchmarks.our_ppe_compliance,
        safetyCultureScore: summary.safety_snapshot.safety_culture_score
    };
};

/**
 * Get trending metrics (increase/decrease based on trend values)
 */
export const getSafetyTrendingMetrics = (data: HealthSafetyResponse) => {
    const performance = data.data.health_safety_summary.performance_indicators;
    const incidents = data.data.incident_data;

    return {
        injuryRate: performance.injury_rate.trend,
        safetyMeetings: performance.safety_meetings.trend,
        totalInjuries: performance.total_injuries.trend,
        safetyTraining: performance.safety_training.trend,
        fatalities: incidents.fatalities.trend,
        nearMisses: incidents.near_misses.trend
    };
};

/**
 * Calculate overall safety score
 */
export const calculateOverallSafetyScore = (data: HealthSafetyResponse): number => {
    const summary = data.data.health_safety_summary;
    const incidents = data.data.incident_data;
    const benchmarks = data.data.safety_benchmarks.comparison_data;

    const weights = {
        injuryRate: 0.3,
        cultureScore: 0.25,
        ppeCompliance: 0.2,
        training: 0.15,
        fatalities: 0.1
    };

    // Normalize injury rate (lower is better)
    const injuryRate = parseFloat(summary.performance_indicators.injury_rate.value as string);
    const industryAvg = parseFloat(benchmarks.industry_average_ltifr);
    const normalizedInjuryRate = Math.max(0, 100 - (injuryRate / industryAvg) * 100);

    // Normalize training hours
    const trainingHours = parseInt(summary.performance_indicators.safety_training.value as string);
    const industryTraining = parseInt(benchmarks.industry_average_training_hours);
    const normalizedTraining = Math.min(100, (trainingHours / industryTraining) * 100);

    // Penalty for fatalities
    const fatalitiesPenalty = incidents.fatalities.count > 0 ? 0 : 100;

    return (
        (normalizedInjuryRate * weights.injuryRate) +
        (summary.safety_snapshot.safety_culture_score * weights.cultureScore) +
        (benchmarks.our_ppe_compliance * weights.ppeCompliance) +
        (normalizedTraining * weights.training) +
        (fatalitiesPenalty * weights.fatalities)
    );
};

/**
 * Get incident severity breakdown
 */
export const getIncidentSeverityBreakdown = (data: HealthSafetyResponse) => {
    const injuries = data.data.incident_data.total_recordable_injuries.severity_breakdown;
    const total = injuries.minor + injuries.moderate + injuries.serious;

    return {
        minor: {
            count: injuries.minor,
            percentage: total > 0 ? (injuries.minor / total) * 100 : 0
        },
        moderate: {
            count: injuries.moderate,
            percentage: total > 0 ? (injuries.moderate / total) * 100 : 0
        },
        serious: {
            count: injuries.serious,
            percentage: total > 0 ? (injuries.serious / total) * 100 : 0
        },
        total
    };
};

/**
 * Get department safety performance
 */
export const getDepartmentSafetyPerformance = (data: HealthSafetyResponse) => {
    const graph = data.data.graphs.safety_activities_by_department;
    const departments = graph.labels as string[];
    const meetings = graph.datasets[0].data as number[];
    const observations = graph.datasets[1].data as number[];
    const training = graph.datasets[2].data as number[];

    return departments.map((dept, index) => ({
        department: dept,
        safetyMeetings: meetings[index],
        safetyObservations: observations[index],
        safetyTrainingHours: training[index],
        totalScore: (meetings[index] * 0.3) + (observations[index] * 0.4) + (training[index] * 0.3)
    }));
};

/**
 * Calculate cost savings from safety initiatives
 */
export const calculateSafetyCostSavings = (
    incidentReduction: number,
    avgIncidentCost: number,
    programCost: number
): number => {
    return (incidentReduction * avgIncidentCost) - programCost;
};

/**
 * Get safety training effectiveness metrics
 */
export const getTrainingEffectiveness = (data: HealthSafetyResponse) => {
    const summary = data.data.health_safety_summary;
    const benchmarks = data.data.safety_benchmarks.comparison_data;

    return {
        trainingHours: parseInt(summary.performance_indicators.safety_training.value as string),
        industryAverage: parseInt(benchmarks.industry_average_training_hours),
        firstAidCertified: data.data.worker_health.medical_services.first_aid_certified_staff,
        totalEmployees: parseInt(data.data.social_metrics.metrics["Human Capital - Total Employees"].values[0].value),
        trainingCoverage: data.data.worker_health.medical_services.first_aid_certified_staff /
            parseInt(data.data.social_metrics.metrics["Human Capital - Total Employees"].values[0].value) * 100
    };
};

export default {
    getHealthSafetyData,
    getHealthSafetyCompanyInfo,
    getHealthSafetySummary,
    getIncidentData,
    getSafetyCommittees,
    getWorkerHealth,
    getSocialMetrics,
    getAllHealthSafetyGraphs,
    getHealthSafetyGraphByType,
    getSafetyInitiatives,
    getSafetyBenchmarks,
    getRecommendations,
    getDataQuality,
    getApiInfo,
    getYearData,
    getPerformanceIndicators,
    getInjuryRate,
    getSafetyMeetings,
    getTotalInjuries,
    getSafetyTraining,
    getSafetySnapshot,
    getFatalities,
    getLostTimeInjuries,
    getTotalRecordableInjuries,
    getNearMisses,
    getAgricultureCommittee,
    getMillingCommittee,
    getCrossCompanyInitiatives,
    getMedicalServices,
    getWellnessPrograms,
    getProtectiveEquipment,
    getSocialMetricByName,
    getAllSocialMetricNames,
    getSocialMetricCategoriesBreakdown,
    getTotalSocialMetricsCount,
    getSocialDataRange,
    getSocialVerificationStatus,
    getAreaOfInterestMetadata,
    getEsgContactPerson,
    getEsgReportingFrameworks,
    getRequestedYear,
    isDataAvailable,
    getSocialMetricsCount,
    getActiveSafetyPrograms,
    getUpcomingFocusAreas,
    getComparisonData,
    getCertifications,
    getHighPriorityRecommendations,
    getMediumPriorityRecommendations,
    getLowPriorityRecommendations,
    calculateInjuryRatePerEmployee,
    calculateSafetyComplianceScore,
    calculateDaysWithoutIncident,
    calculateNearMissEfficiency,
    getSafetyMetricsSummary,
    getSafetyTrendingMetrics,
    calculateOverallSafetyScore,
    getIncidentSeverityBreakdown,
    getDepartmentSafetyPerformance,
    calculateSafetyCostSavings,
    getTrainingEffectiveness
};