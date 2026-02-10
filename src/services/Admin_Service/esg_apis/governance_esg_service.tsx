// File: services/governanceService.ts
import api from "../Auth_service/api";

/**
 * =====================
 * Types & Interfaces
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
    governance_metrics_count: number;
    verification_summary: {
        unverified: number;
    };
    governance_categories: Record<string, number>;
}

export interface TrendIndicator {
    trend: 'optimal' | 'good' | 'excellent' | 'improving' | 'declining' | 'stable';
    target: string;
}

export interface PerformanceIndicator {
    value: number | string;
    unit: string;
    label: string;
    description: string;
    trend: string;
    target: string;
    year: number;
}

export interface GovernanceSummary {
    year: number;
    overview: {
        title: string;
        description: string;
        key_message: string;
    };
    board_snapshot: {
        total_meetings: number;
        average_attendance: string;
        last_board_evaluation: string;
        evaluation_result: string;
        next_election: string;
    };
    performance_indicators: {
        board_size: PerformanceIndicator;
        board_independence: PerformanceIndicator;
        women_on_board: PerformanceIndicator;
        board_meetings: PerformanceIndicator;
    };
}

export interface BoardComposition {
    year: number;
    size_and_structure: {
        total_directors: number;
        executive_directors: number;
        non_executive_directors: number;
        independent_directors: number;
        tenure_distribution: {
            "0-3 years": number;
            "4-6 years": number;
            "7+ years": number;
        };
    };
    diversity_metrics: {
        gender_diversity: {
            women: number;
            men: number;
            percentage_women: number;
        };
        age_diversity: {
            under_50: number;
            "50-60": number;
            over_60: number;
            average_age: number;
        };
        nationality_diversity: {
            local_directors: number;
            international_directors: number;
            regions_represented: string[];
        };
    };
}

export interface Committee {
    name: string;
    chair: string;
    members: number;
    independent_members: number;
    meetings_held: number;
    focus: string;
}

export interface BoardCommittees {
    year: number;
    committees: Committee[];
    committee_effectiveness: {
        attendance_rate: string;
        decision_implementation: string;
        stakeholder_feedback_incorporated: string;
    };
}

export interface PolicyStatus {
    status: string;
    last_review?: string;
    employee_training_completion?: string;
    due_diligence_process?: string;
    incidents_reported?: number;
    reports_received?: number;
    investigation_rate?: string;
    retaliation_prevention?: string;
    suppliers_covered?: string;
    compliance_audits?: number;
}

export interface EthicsAndCompliance {
    year: number;
    policies_in_place: {
        ethics_code: PolicyStatus;
        anti_corruption: PolicyStatus;
        whistleblowing: PolicyStatus;
        supplier_code: PolicyStatus;
    };
    compliance_metrics: {
        regulatory_incidents: number;
        fines_penalties: number;
        audit_findings: string;
        ifrs_alignment: string;
    };
}

export interface ExecutiveCompensation {
    year: number;
    remuneration_disclosure: string;
    esg_linked_pay: {
        status: string;
        percentage_tied_to_esg: string;
        metrics_used: string[];
        performance_year: number;
    };
    pay_ratio: {
        ceo_to_median_employee: string;
        industry_average: string;
        trend: string;
    };
    shareholder_approval: {
        last_vote_on_pay: string;
        approval_rate: string;
        concerns_raised: string;
    };
}

export interface MetricValue {
    year: number;
    value: string;
    numeric_value: number | null;
    source_notes: string;
    added_at: string;
    added_by: string;
    verification_status: string;
}

export interface GovernanceMetric {
    name: string;
    unit: string | null;
    description: string | null;
    category: string;
    values: MetricValue[];
    verification_status: string;
    data_source: string;
}

export interface GovernanceMetricsData {
    year: number;
    total_metrics: number;
    metrics_by_category: Record<string, number>;
    metrics: Record<string, GovernanceMetric>;
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

export interface DetailedGovernanceMetrics {
    year: number;
    metrics: Record<string, {
        name: string;
        category: string;
        unit: string | null;
        description: string | null;
        values: Array<{
            year: number;
            value: string;
            numeric_value: number | null;
            source_notes: string;
            source_file: string;
            verification_status: string;
        }>;
    }>;
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
}

export interface Graph {
    type: string;
    title: string;
    description: string;
    labels: (string | number)[];
    datasets: GraphDataset[];
}

export interface ActiveProgram {
    name: string;
    description: string;
    progress?: string;
    impact?: string;
    participants?: number;
    satisfaction_rate?: string;
    implementation?: string;
    review_frequency?: string;
}

export interface FocusArea {
    area: string;
    action: string;
    timeline: string;
}

export interface GovernanceInitiatives {
    year: number;
    active_programs: ActiveProgram[];
    upcoming_focus_areas: FocusArea[];
}

export interface ExternalAssessment {
    framework: string;
    alignment: string;
    status: string;
    last_assessment: string;
}

export interface AwardRecognition {
    name: string;
    organization: string;
    year: number;
}

export interface GovernanceBenchmarks {
    year: number;
    external_assessments: ExternalAssessment[];
    awards_recognition: AwardRecognition[];
}

export interface Recommendation {
    priority: 'High' | 'Medium' | 'Low';
    action: string;
    impact: string;
    timeline: string;
    metrics_affected?: string[];
    responsible_committee?: string;
    investment_required?: string;
}

export interface DataRange {
    start: number;
    end: number;
    source: string;
    verification_status: string;
    data_quality_score: number | null;
}

export interface DataQuality {
    year: number;
    verification_status: {
        unverified: number;
    };
    data_range: DataRange[];
    total_metrics: number;
    last_updated: string;
    notes: string;
}

export interface GovernanceBoardData {
    api_info: ApiInfo;
    year_data: YearData;
    company: Company;
    governance_summary: GovernanceSummary;
    board_composition: BoardComposition;
    board_committees: BoardCommittees;
    ethics_and_compliance: EthicsAndCompliance;
    executive_compensation: ExecutiveCompensation;
    governance_metrics: GovernanceMetricsData;
    detailed_governance_metrics: DetailedGovernanceMetrics;
    graphs: {
        year: number;
        board_composition_trend: Graph;
        board_diversity_breakdown: Graph;
        committee_performance: Graph;
        governance_performance_areas: Graph;
    };
    governance_initiatives: GovernanceInitiatives;
    governance_benchmarks: GovernanceBenchmarks;
    recommendations: Recommendation[];
    data_quality: DataQuality;
}

export interface GovernanceBoardResponse {
    message: string;
    api: string;
    data: GovernanceBoardData;
}

export interface GovernanceBoardParams {
    companyId: string;
    year: number;
}

/**
 * =====================
 * Governance Board Service
 * =====================
 */

export const getGovernanceBoardData = async (
    params: GovernanceBoardParams
): Promise<GovernanceBoardResponse> => {
    try {
        const { companyId, year } = params;

        const queryParams = new URLSearchParams();
        if (year !== undefined) {
            queryParams.append('year', year.toString());
        }

        const queryString = queryParams.toString();
        const url = `/esg-dashboard/governance-board/${companyId}${queryString ? `?${queryString}` : ''}`;

        const { data } = await api.get<GovernanceBoardResponse>(url);
        return data;
    } catch (error: any) {
        const statusCode = error.response?.status;
        const errorMessage =
            error.response?.data?.error || error.response?.data?.message;

        switch (statusCode) {
            case 400:
                throw new Error(errorMessage || "Invalid request parameters");
            case 401:
                throw new Error("Unauthorized access. Please check your authentication token.");
            case 403:
                throw new Error("You don't have permission to access this resource.");
            case 404:
                throw new Error("Governance board data not found for the specified company.");
            case 422:
                throw new Error(errorMessage || "Invalid year parameter or data format.");
            case 500:
                throw new Error("Server error occurred while fetching governance board data.");
            case 503:
                throw new Error("Governance board service is temporarily unavailable.");
            default:
                throw new Error(
                    errorMessage ||
                    error.response?.data?.detail ||
                    "Failed to fetch governance board data"
                );
        }
    }
};

/**
 * Helper function to extract key performance indicators
 */
export const getKeyPerformanceIndicators = (data: GovernanceBoardData) => {
    const { performance_indicators } = data.governance_summary;
    return {
        boardSize: performance_indicators.board_size,
        boardIndependence: performance_indicators.board_independence,
        womenOnBoard: performance_indicators.women_on_board,
        boardMeetings: performance_indicators.board_meetings,
    };
};

/**
 * Helper function to get board composition summary
 */
export const getBoardCompositionSummary = (data: GovernanceBoardData) => {
    const { size_and_structure, diversity_metrics } = data.board_composition;

    return {
        size: size_and_structure.total_directors,
        executive: size_and_structure.executive_directors,
        nonExecutive: size_and_structure.non_executive_directors,
        independent: size_and_structure.independent_directors,
        tenure: size_and_structure.tenure_distribution,
        gender: {
            women: diversity_metrics.gender_diversity.women,
            men: diversity_metrics.gender_diversity.men,
            percentageWomen: diversity_metrics.gender_diversity.percentage_women,
        },
        age: diversity_metrics.age_diversity,
        nationality: diversity_metrics.nationality_diversity,
    };
};

/**
 * Helper function to get committee effectiveness metrics
 */
export const getCommitteeEffectiveness = (data: GovernanceBoardData) => {
    const { committees, committee_effectiveness } = data.board_committees;

    return {
        committees: committees.map(committee => ({
            name: committee.name,
            members: committee.members,
            independentMembers: committee.independent_members,
            meetingsHeld: committee.meetings_held,
            independencePercentage: (committee.independent_members / committee.members) * 100,
        })),
        effectiveness: committee_effectiveness,
    };
};

/**
 * Helper function to get ethics and compliance status
 */
export const getEthicsComplianceStatus = (data: GovernanceBoardData) => {
    const { policies_in_place, compliance_metrics } = data.ethics_and_compliance;

    return {
        policies: {
            ethicsCode: {
                implemented: policies_in_place.ethics_code.status === 'Implemented',
                lastReview: policies_in_place.ethics_code.last_review,
                trainingCompletion: policies_in_place.ethics_code.employee_training_completion,
            },
            antiCorruption: {
                implemented: policies_in_place.anti_corruption.status === 'Implemented',
                incidents: policies_in_place.anti_corruption.incidents_reported,
                dueDiligence: policies_in_place.anti_corruption.due_diligence_process,
            },
            whistleblowing: {
                implemented: policies_in_place.whistleblowing.status === 'Implemented',
                reports: policies_in_place.whistleblowing.reports_received,
                investigationRate: policies_in_place.whistleblowing.investigation_rate,
            },
            supplierCode: {
                implemented: policies_in_place.supplier_code.status === 'Implemented',
                suppliersCovered: policies_in_place.supplier_code.suppliers_covered,
                audits: policies_in_place.supplier_code.compliance_audits,
            },
        },
        compliance: compliance_metrics,
    };
};

/**
 * Helper function to get executive compensation details
 */
export const getExecutiveCompensationDetails = (data: GovernanceBoardData) => {
    const { esg_linked_pay, pay_ratio, shareholder_approval, remuneration_disclosure } = data.executive_compensation;

    return {
        esgLinked: {
            implemented: esg_linked_pay.status === 'Implemented',
            percentage: esg_linked_pay.percentage_tied_to_esg,
            metrics: esg_linked_pay.metrics_used,
        },
        payRatio: {
            ceoToMedian: parseFloat(pay_ratio.ceo_to_median_employee.split(':')[0]),
            industryAverage: parseFloat(pay_ratio.industry_average.split(':')[0]),
            trend: pay_ratio.trend,
        },
        shareholderApproval: {
            lastVote: shareholder_approval.last_vote_on_pay,
            approvalRate: parseFloat(shareholder_approval.approval_rate.replace('%', '')),
            concerns: shareholder_approval.concerns_raised,
        },
        disclosure: remuneration_disclosure,
    };
};

/**
 * Helper function to get all governance metrics by category
 */
export const getGovernanceMetricsByCategory = (data: GovernanceBoardData) => {
    const { metrics, metrics_by_category } = data.governance_metrics;

    const categories: Record<string, Array<{
        name: string;
        value: string;
        numericValue: number | null;
        unit: string | null;
        source: string;
        verificationStatus: string;
    }>> = {};

    Object.entries(metrics_by_category).forEach(([category, count]) => {
        categories[category] = [];
    });

    Object.values(metrics).forEach(metric => {
        // Find the category this metric belongs to
        const categoryEntry = Object.entries(metrics_by_category).find(
            ([category]) => metric.name.toLowerCase().includes(category.toLowerCase())
        );

        if (categoryEntry) {
            const [category] = categoryEntry;
            categories[category].push({
                name: metric.name,
                value: metric.values[0]?.value || 'N/A',
                numericValue: metric.values[0]?.numeric_value || null,
                unit: metric.unit,
                source: metric.data_source,
                verificationStatus: metric.verification_status,
            });
        }
    });

    return categories;
};

/**
 * Helper function to get data quality summary
 */
export const getDataQualitySummary = (data: GovernanceBoardData) => {
    const { verification_status, total_metrics, last_updated, notes } = data.data_quality;

    return {
        verifiedMetrics: total_metrics - verification_status.unverified,
        unverifiedMetrics: verification_status.unverified,
        verificationRate: ((total_metrics - verification_status.unverified) / total_metrics) * 100,
        lastUpdated: new Date(last_updated),
        notes,
    };
};

/**
 * Helper function to get recommendations by priority
 */
export const getRecommendationsByPriority = (data: GovernanceBoardData) => {
    const recommendations = data.recommendations;

    return {
        high: recommendations.filter(rec => rec.priority === 'High'),
        medium: recommendations.filter(rec => rec.priority === 'Medium'),
        low: recommendations.filter(rec => rec.priority === 'Low'),
    };
};

/**
 * Helper function to get all graphs
 */
export const getAllGraphs = (data: GovernanceBoardData) => {
    return [
        data.graphs.board_composition_trend,
        data.graphs.board_diversity_breakdown,
        data.graphs.committee_performance,
        data.graphs.governance_performance_areas,
    ];
};

/**
 * Helper function to get company info
 */
export const getCompanyInfo = (data: GovernanceBoardData) => {
    return data.company;
};

/**
 * Helper function to get governance summary
 */
export const getGovernanceSummary = (data: GovernanceBoardData) => {
    return data.governance_summary;
};

/**
 * Helper function to check if governance data is available
 */
export const hasGovernanceData = (data: GovernanceBoardData) => {
    return data.year_data.data_available;
};

/**
 * Helper function to get verification status of metrics
 */
export const getMetricsVerificationStatus = (data: GovernanceBoardData) => {
    const allMetrics = Object.values(data.governance_metrics.metrics);

    return {
        verified: allMetrics.filter(metric => metric.verification_status === 'verified').length,
        unverified: allMetrics.filter(metric => metric.verification_status === 'unverified').length,
        pending: allMetrics.filter(metric => metric.verification_status === 'pending').length,
    };
};

/**
 * Helper function to get governance performance score
 */
export const calculateGovernanceScore = (data: GovernanceBoardData) => {
    const indicators = data.governance_summary.performance_indicators;
    const effectiveness = data.board_committees.committee_effectiveness;

    // Extract numeric values from performance indicators
    const boardIndependenceValue = typeof indicators.board_independence.value === 'number'
        ? indicators.board_independence.value
        : parseFloat(indicators.board_independence.value.toString());

    const womenOnBoardValue = typeof indicators.women_on_board.value === 'number'
        ? indicators.women_on_board.value
        : parseFloat(indicators.women_on_board.value.toString());

    // Calculate a simple governance score based on key metrics
    let score = 0;
    let maxScore = 0;

    // Board independence (max 25 points)
    const independenceScore = (boardIndependenceValue || 0) / 50 * 25;
    score += Math.min(independenceScore, 25);
    maxScore += 25;

    // Gender diversity (max 25 points)
    const diversityScore = (womenOnBoardValue || 0) / 30 * 25;
    score += Math.min(diversityScore, 25);
    maxScore += 25;

    // Committee effectiveness (max 25 points)
    const attendanceRate = parseFloat(effectiveness.attendance_rate.replace('%', ''));
    const committeeScore = attendanceRate / 100 * 25;
    score += committeeScore;
    maxScore += 25;

    // Ethics & compliance (max 25 points)
    const compliance = data.ethics_and_compliance.compliance_metrics;
    const complianceScore = compliance.regulatory_incidents === 0 ? 25 : 15;
    score += complianceScore;
    maxScore += 25;

    return {
        score: Math.round((score / maxScore) * 100),
        breakdown: {
            boardIndependence: Math.min(independenceScore, 25),
            genderDiversity: Math.min(diversityScore, 25),
            committeeEffectiveness: committeeScore,
            ethicsCompliance: complianceScore,
        },
        maxScore: maxScore,
    };
};

/**
 * Helper function to get year-over-year comparison
 */
export const getYearOverYearComparison = (currentData: GovernanceBoardData, previousData?: GovernanceBoardData) => {
    if (!previousData) return null;

    const currentIndicators = currentData.governance_summary.performance_indicators;
    const previousIndicators = previousData.governance_summary.performance_indicators;

    // Helper function to extract numeric value
    const extractNumericValue = (indicator: PerformanceIndicator): number => {
        if (typeof indicator.value === 'number') {
            return indicator.value;
        }
        const num = parseFloat(indicator.value.toString());
        return isNaN(num) ? 0 : num;
    };

    const currentBoardSize = extractNumericValue(currentIndicators.board_size);
    const previousBoardSize = extractNumericValue(previousIndicators.board_size);

    const currentIndependence = extractNumericValue(currentIndicators.board_independence);
    const previousIndependence = extractNumericValue(previousIndicators.board_independence);

    const currentWomen = extractNumericValue(currentIndicators.women_on_board);
    const previousWomen = extractNumericValue(previousIndicators.women_on_board);

    return {
        boardSize: {
            current: currentBoardSize,
            previous: previousBoardSize,
            change: currentBoardSize - previousBoardSize,
        },
        boardIndependence: {
            current: currentIndependence,
            previous: previousIndependence,
            change: currentIndependence - previousIndependence,
        },
        womenOnBoard: {
            current: currentWomen,
            previous: previousWomen,
            change: currentWomen - previousWomen,
        },
    };
};

/**
 * Helper function to extract numeric value from a performance indicator
 */
export const getNumericValueFromIndicator = (indicator: PerformanceIndicator): number => {
    if (typeof indicator.value === 'number') {
        return indicator.value;
    }

    const num = parseFloat(indicator.value.toString());
    return isNaN(num) ? 0 : num;
};

/**
 * Helper function to get CSR metrics
 */
export const getCSRMetrics = (data: GovernanceBoardData) => {
    const metrics = data.governance_metrics.metrics;

    return {
        education: {
            maleStudents: metrics['Corporate Social Responsibility - Education Attendance -  [Males]']?.values[0]?.numeric_value || 0,
            femaleStudents: metrics['Corporate Social Responsibility - Education Attendance -  [Females]']?.values[0]?.numeric_value || 0,
            totalStudents: (metrics['Corporate Social Responsibility - Education Attendance -  [Males]']?.values[0]?.numeric_value || 0) +
                (metrics['Corporate Social Responsibility - Education Attendance -  [Females]']?.values[0]?.numeric_value || 0),
        },
        health: {
            hospitalAttendees: metrics['Health and Well being - Hospital attendees  - Total']?.values[0]?.numeric_value || 0,
        },
        suppliers: {
            totalSuppliers: metrics['Number of suppliers']?.values[0]?.numeric_value || 0,
            localProcurement: metrics['Relationship with suppliers - Procurement Spent']?.values[0]?.value || 'N/A',
            internationalProcurement: metrics['Relationship with suppliers - Procurement Spent']?.values[1]?.value || 'N/A',
        }
    };
};

/**
 * Helper function to get compliance metrics summary
 */
export const getComplianceMetrics = (data: GovernanceBoardData) => {
    const metrics = data.governance_metrics.metrics;

    return {
        ethicsCode: metrics['Ethics / Code of Conduct']?.values[0]?.value || 'N/A',
        antiCorruption: metrics['Anti-Corruption / Anti-Bribery Policy']?.values[0]?.value || 'N/A',
        whistleblowing: metrics['Whistleblowing Mechanism']?.values[0]?.value || 'N/A',
        complianceIncidents: metrics['Compliance Incidents']?.values[0]?.value || 'N/A',
        executiveRemuneration: metrics['Executive Remuneration Disclosure']?.values[0]?.value || 'N/A',
        esgLinkedPay: metrics['ESG Linked to Executive Pay']?.values[0]?.value || 'N/A',
        supplierCode: metrics['Supplier Code of Conduct']?.values[0]?.value || 'N/A',
        ifrsDisclosures: metrics['IFRS / Sustainability-Related Financial Disclosures']?.values[0]?.value || 'N/A',
    };
};

/**
 * Helper function to get committee composition
 */
export const getCommitteeComposition = (data: GovernanceBoardData) => {
    const committees = data.board_committees.committees;

    return committees.map(committee => ({
        name: committee.name,
        chair: committee.chair,
        totalMembers: committee.members,
        independentMembers: committee.independent_members,
        independencePercentage: (committee.independent_members / committee.members) * 100,
        meetingsHeld: committee.meetings_held,
        focus: committee.focus,
    }));
};

/**
 * Helper function to get governance initiatives summary
 */
export const getGovernanceInitiativesSummary = (data: GovernanceBoardData) => {
    const initiatives = data.governance_initiatives;

    return {
        activePrograms: initiatives.active_programs,
        upcomingFocusAreas: initiatives.upcoming_focus_areas,
        totalActivePrograms: initiatives.active_programs.length,
    };
};

/**
 * Helper function to get external benchmarks
 */
export const getExternalBenchmarks = (data: GovernanceBoardData) => {
    const benchmarks = data.governance_benchmarks;

    return {
        assessments: benchmarks.external_assessments,
        awards: benchmarks.awards_recognition,
        totalAssessments: benchmarks.external_assessments.length,
        totalAwards: benchmarks.awards_recognition.length,
    };
};

export default {
    getGovernanceBoardData,
    getKeyPerformanceIndicators,
    getBoardCompositionSummary,
    getCommitteeEffectiveness,
    getEthicsComplianceStatus,
    getExecutiveCompensationDetails,
    getGovernanceMetricsByCategory,
    getDataQualitySummary,
    getRecommendationsByPriority,
    getAllGraphs,
    getCompanyInfo,
    getGovernanceSummary,
    hasGovernanceData,
    getMetricsVerificationStatus,
    calculateGovernanceScore,
    getYearOverYearComparison,
    getNumericValueFromIndicator,
    getCSRMetrics,
    getComplianceMetrics,
    getCommitteeComposition,
    getGovernanceInitiativesSummary,
    getExternalBenchmarks,
};