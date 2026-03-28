import api from "../Auth_service/api";

/**
 * =====================
 * Types & Interfaces
 * =====================
 */

export interface CompanyAreaOfInterest {
    name: string;
    area_covered: string;
    coordinates: Array<{
        lat: number;
        lon: number;
        _id: string;
    }>;
}

export interface EsgContactPerson {
    name: string;
    email: string;
    phone: string;
}

export interface Company {
    area_of_interest_metadata: CompanyAreaOfInterest;
    esg_contact_person: EsgContactPerson;
    _id: string;
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
    data_range: string;
    data_processing_workflow: string;
    analytical_layer_metadata: string;
    esg_reporting_framework: string[];
    latest_esg_report_year: number;
    esg_data_status: string;
    has_esg_linked_pay: boolean;
    created_at: string;
    updated_at: string;
    __v: number;
}

export interface EsgMetricValue {
    year: number;
    value: string;
    numeric_value: number | null;
    source_notes: string;
    added_by: string;
    _id: string;
    added_at: string;
    last_updated_at: string;
}

export interface EsgMetric {
    category: string;
    metric_name: string;
    unit: string | null;
    description: string | null;
    values: EsgMetricValue[];
    is_active: boolean;
    created_by: string;
    _id: string;
    created_at: string;
}

export interface User {
    _id: string;
    email: string;
    full_name: string;
}

export interface ApiMetadata {
    api_version: string;
    calculation_version: string;
    gee_adapter_version: string;
    retrieved_at: string;
    filter_criteria: {
        company: string;
        year: number;
        category: string;
    };
}

export interface EsgDataRecord {
    _id: string;
    company: Company;
    reporting_period_start: number;
    reporting_period_end: number;
    data_source: string;
    source_file_name: string;
    source_file_type: string;
    import_batch_id: string;
    import_date: string;
    data_quality_score: number | null;
    verification_status: string;
    validation_status: string;
    metrics: EsgMetric[];
    created_by: User;
    last_updated_by: User;
    is_active: boolean;
    validation_errors: any[];
    created_at: string;
    last_updated_at: string;
    __v: number;
    metadata: ApiMetadata;
}

export interface EsgDataResponse {
    message: string;
    count: number;
    filter: {
        company: string;
        year: number;
        category: string;
    };
    versions: {
        api_version: string;
        calculation_version: string;
        gee_adapter_version: string;
    };
    esgData: EsgDataRecord[];
}

export interface MetricsByCategory {
    [category: string]: {
        count: number;
        metrics: EsgMetric[];
    };
}

export interface YearlyMetrics {
    [year: number]: {
        [category: string]: EsgMetric[];
    };
}

export interface CategorySummary {
    category: string;
    total_metrics: number;
    metrics_by_unit: { [unit: string]: number };
    has_time_series: boolean;
    latest_year: number;
}

export interface CompanyEsgSummary {
    company: Company;
    reporting_years: number[];
    categories_summary: CategorySummary[];
    total_metrics: number;
    data_quality_score: number | null;
    verification_status: string;
    last_updated: string;
    api_version: string;
}

export interface ChartDataPoint {
    year: number;
    value: number;
    source_notes: string;
}

export interface ChartDataset {
    label: string;
    data: ChartDataPoint[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
}

export interface MetricChart {
    metric_name: string;
    category: string;
    unit: string | null;
    datasets: ChartDataset[];
}

/**
 * =====================
 * Governance Sub-Categories
 * =====================
 */

export interface BoardCompositionMetrics {
    board_size: {
        value: string;
        year: number;
        trend: 'stable' | 'decreasing' | 'increasing';
    };
    board_meetings: {
        count: number;
        year: number;
        trend: 'stable' | 'decreasing' | 'increasing';
    };
}

export interface CommitteeMetrics {
    audit_compliance: {
        non_executive_percent: string;
        independent_percent: string;
        year: number;
    };
    risk_management: {
        executive_percent: string;
        non_executive_percent: string;
        independent_percent: string;
        year: number;
    };
    remuneration_nominations: {
        non_executive_percent: string;
        independent_percent: string;
        year: number;
    };
    stakeholder_engagement: {
        executive_percent: string;
        non_executive_percent: string;
        independent_percent: string;
        year: number;
    };
}

export interface CsrMetrics {
    education: {
        males: number;
        females: number;
        total: number;
        year: number;
    };
    health_wellbeing: {
        hospital_attendees: number;
        year: number;
    };
}

export interface SupplierMetrics {
    procurement: {
        local: string;
        foreign: string;
        total: string;
        year: number;
    };
    suppliers_count: {
        count: number;
        year: number;
        trend: 'stable' | 'decreasing' | 'increasing';
    };
}

export interface ComplianceMetrics {
    ethics_code: {
        status: boolean;
        year: number;
    };
    anti_corruption: {
        status: boolean;
        year: number;
    };
    whistleblowing: {
        mechanism: string;
        year: number;
    };
    incidents: {
        count: string;
        year: number;
    };
    supplier_code: {
        status: boolean;
        year: number;
    };
    ifrs_compliance: {
        status: string;
        year: number;
    };
}

export interface RemunerationMetrics {
    disclosure: {
        status: string;
        year: number;
    };
    esg_linked: {
        status: boolean;
        year: number;
    };
}

export interface GovernanceSummary {
    board_composition: BoardCompositionMetrics;
    committees: CommitteeMetrics;
    csr: CsrMetrics;
    suppliers: SupplierMetrics;
    compliance: ComplianceMetrics;
    remuneration: RemunerationMetrics;
}

/**
 * =====================
 * Request Parameters
 * =====================
 */

export interface GetEsgDataParams {
    companyId: string;
    year?: number;
    category?: string;
}

/**
 * =====================
 * Governance ESG Metrics Service
 * =====================
 */

/**
 * Get governance ESG data for a company with optional year filter
 */
export const getGovernanceEsgData = async (
    params: GetEsgDataParams
): Promise<EsgDataResponse> => {
    try {
        const { companyId, year } = params;

        let url = `/esg-data/company/${companyId}/category/governance`;

        if (year) {
            url += `?year=${year}`;
        }

        const { data } = await api.get<EsgDataResponse>(url);
        return data;
    } catch (error: any) {
        const statusCode = error.response?.status;
        const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;

        switch (statusCode) {
            case 400:
                throw new Error(errorMessage || "Invalid request parameters");
            case 401:
                throw new Error("Unauthorized access. Please check your authentication token.");
            case 403:
                throw new Error("You don't have permission to access this resource.");
            case 404:
                throw new Error("Governance ESG data not found for the specified company.");
            case 422:
                throw new Error(errorMessage || "Invalid filter parameters or data format.");
            case 500:
                throw new Error("Server error occurred while fetching governance ESG data.");
            case 503:
                throw new Error("Governance ESG data service is temporarily unavailable.");
            default:
                throw new Error(
                    errorMessage ||
                    error.response?.data?.detail ||
                    "Failed to fetch governance ESG data"
                );
        }
    }
};

/**
 * Get all governance ESG data for a company (all years)
 */
export const getAllGovernanceEsgData = async (companyId: string): Promise<EsgDataResponse> => {
    return getGovernanceEsgData({ companyId });
};

/**
 * Get metrics grouped by governance sub-categories
 */
export const getGovernanceMetricsBySubCategory = (data: EsgDataRecord[]): {
    [subCategory: string]: {
        count: number;
        metrics: EsgMetric[];
    }
} => {
    const result: { [subCategory: string]: { count: number; metrics: EsgMetric[] } } = {};

    data.forEach(record => {
        record.metrics.forEach(metric => {
            // Extract sub-category based on metric name patterns
            let subCategory = 'Other';
            
            if (metric.metric_name.includes('Board')) {
                subCategory = 'Board Governance';
            } else if (metric.metric_name.includes('Committee') || metric.metric_name.includes('Audit') || metric.metric_name.includes('Risk') || metric.metric_name.includes('Remuneration') || metric.metric_name.includes('Stakeholder')) {
                subCategory = 'Board Committees';
            } else if (metric.metric_name.includes('CSR') || metric.metric_name.includes('Social Responsibility') || metric.metric_name.includes('Education') || metric.metric_name.includes('Health')) {
                subCategory = 'Corporate Social Responsibility';
            } else if (metric.metric_name.includes('Supplier') || metric.metric_name.includes('Procurement')) {
                subCategory = 'Supplier & Procurement';
            } else if (metric.metric_name.includes('Ethics') || metric.metric_name.includes('Anti-Corruption') || metric.metric_name.includes('Whistleblowing') || metric.metric_name.includes('Compliance') || metric.metric_name.includes('IFRS')) {
                subCategory = 'Compliance & Ethics';
            } else if (metric.metric_name.includes('Remuneration') || metric.metric_name.includes('Pay')) {
                subCategory = 'Executive Remuneration';
            }

            if (!result[subCategory]) {
                result[subCategory] = {
                    count: 0,
                    metrics: []
                };
            }

            result[subCategory].metrics.push(metric);
            result[subCategory].count++;
        });
    });

    return result;
};

/**
 * Get metrics grouped by year
 */
export const getGovernanceMetricsByYear = (data: EsgDataRecord[]): YearlyMetrics => {
    const yearlyMetrics: YearlyMetrics = {};

    data.forEach(record => {
        record.metrics.forEach(metric => {
            metric.values.forEach(value => {
                const year = value.year;

                if (!yearlyMetrics[year]) {
                    yearlyMetrics[year] = {};
                }

                const category = metric.category.toLowerCase();

                if (!yearlyMetrics[year][category]) {
                    yearlyMetrics[year][category] = [];
                }

                // Create a copy of metric with only this year's value
                const yearlyMetric = {
                    ...metric,
                    values: [value]
                };

                yearlyMetrics[year][category].push(yearlyMetric);
            });
        });
    });

    return yearlyMetrics;
};

/**
 * Get unique years from governance ESG data
 */
export const getAvailableGovernanceYears = (data: EsgDataRecord[]): number[] => {
    const years = new Set<number>();

    data.forEach(record => {
        record.metrics.forEach(metric => {
            metric.values.forEach(value => {
                years.add(value.year);
            });
        });
    });

    return Array.from(years).sort((a, b) => a - b);
};

/**
 * Get company governance ESG summary
 */
export const getCompanyGovernanceEsgSummary = (data: EsgDataRecord[]): CompanyEsgSummary => {
    const company = data[0]?.company;
    const years = getAvailableGovernanceYears(data);

    const categories_summary: CategorySummary[] = [];
    let total_metrics = 0;

    const metricsByCategory = getMetricsByCategory(data);

    Object.entries(metricsByCategory).forEach(([category, categoryData]) => {
        // Group metrics by unit
        const units: { [unit: string]: number } = {};
        categoryData.metrics.forEach(metric => {
            const unit = metric.unit || 'unknown';
            units[unit] = (units[unit] || 0) + 1;
        });

        const has_time_series = categoryData.metrics.some(m => m.values.length > 1);

        categories_summary.push({
            category,
            total_metrics: categoryData.count,
            metrics_by_unit: units,
            has_time_series,
            latest_year: Math.max(...years)
        });

        total_metrics += categoryData.count;
    });

    // Calculate average data quality score
    const dataQualityScores = data
        .filter(record => record.data_quality_score !== null)
        .map(record => record.data_quality_score as number);

    const data_quality_score = dataQualityScores.length > 0
        ? dataQualityScores.reduce((a, b) => a + b, 0) / dataQualityScores.length
        : null;

    // Get latest update date
    const last_updated = data.reduce((latest, record) =>
        new Date(record.last_updated_at) > new Date(latest) ? record.last_updated_at : latest,
        data[0]?.last_updated_at || ''
    );

    // Get verification status (most common)
    const verificationStatuses = data.map(r => r.verification_status);
    const verification_status = verificationStatuses.length > 0
        ? verificationStatuses[0]
        : 'unknown';

    return {
        company: company!,
        reporting_years: years,
        categories_summary,
        total_metrics,
        data_quality_score,
        verification_status,
        last_updated,
        api_version: data[0]?.metadata?.api_version || '1.0.0'
    };
};

/**
 * Get metrics grouped by category (reusable)
 */
export const getMetricsByCategory = (data: EsgDataRecord[]): MetricsByCategory => {
    const result: MetricsByCategory = {};

    data.forEach(record => {
        record.metrics.forEach(metric => {
            const category = metric.category.toLowerCase();

            if (!result[category]) {
                result[category] = {
                    count: 0,
                    metrics: []
                };
            }

            result[category].metrics.push(metric);
            result[category].count++;
        });
    });

    return result;
};

/**
 * Extract board size metrics
 */
const getBoardSizeMetrics = (metrics: EsgMetric[]): BoardCompositionMetrics['board_size'] | null => {
    const boardSizeMetric = metrics.find(m => m.metric_name === 'Board Size');
    if (!boardSizeMetric) return null;

    const latestValue = boardSizeMetric.values.reduce((a, b) => a.year > b.year ? a : b);
    const previousValue = boardSizeMetric.values.sort((a, b) => b.year - a.year)[1];

    let trend: 'stable' | 'decreasing' | 'increasing' = 'stable';
    if (previousValue) {
        const currentSize = parseInt(latestValue.value);
        const previousSize = parseInt(previousValue.value);
        if (currentSize > previousSize) trend = 'increasing';
        else if (currentSize < previousSize) trend = 'decreasing';
    }

    return {
        value: latestValue.value,
        year: latestValue.year,
        trend
    };
};

/**
 * Extract board meeting metrics
 */
const getBoardMeetingMetrics = (metrics: EsgMetric[]): BoardCompositionMetrics['board_meetings'] | null => {
    const meetingMetric = metrics.find(m => m.metric_name === 'Board Attendance - Number of meetings held');
    if (!meetingMetric) return null;

    const latestValue = meetingMetric.values.reduce((a, b) => a.year > b.year ? a : b);
    const previousValue = meetingMetric.values.sort((a, b) => b.year - a.year)[1];

    let trend: 'stable' | 'decreasing' | 'increasing' = 'stable';
    if (previousValue && latestValue.numeric_value !== null && previousValue.numeric_value !== null) {
        if (latestValue.numeric_value > previousValue.numeric_value) trend = 'increasing';
        else if (latestValue.numeric_value < previousValue.numeric_value) trend = 'decreasing';
    }

    return {
        count: latestValue.numeric_value || 0,
        year: latestValue.year,
        trend
    };
};

/**
 * Extract committee metrics
 */
const getCommitteeMetrics = (metrics: EsgMetric[]): CommitteeMetrics => {
    const result: CommitteeMetrics = {
        audit_compliance: {
            non_executive_percent: '',
            independent_percent: '',
            year: 0
        },
        risk_management: {
            executive_percent: '',
            non_executive_percent: '',
            independent_percent: '',
            year: 0
        },
        remuneration_nominations: {
            non_executive_percent: '',
            independent_percent: '',
            year: 0
        },
        stakeholder_engagement: {
            executive_percent: '',
            non_executive_percent: '',
            independent_percent: '',
            year: 0
        }
    };

    // Find latest year
    const latestYear = Math.max(...metrics.flatMap(m => m.values.map(v => v.year)));

    // Audit and Compliance Committee
    const auditNonExec = metrics.find(m => 
        m.metric_name === 'Audit and Compliance Committee' && m.unit === 'Non-exe cutive Directors'
    );
    const auditIndependent = metrics.find(m => 
        m.metric_name === 'Audit and Compliance Committee' && m.unit === 'Independent Non-executive Directors'
    );

    if (auditNonExec) {
        const latest = auditNonExec.values.find(v => v.year === latestYear);
        if (latest) result.audit_compliance.non_executive_percent = latest.value;
    }
    if (auditIndependent) {
        const latest = auditIndependent.values.find(v => v.year === latestYear);
        if (latest) {
            result.audit_compliance.independent_percent = latest.value;
            result.audit_compliance.year = latestYear;
        }
    }

    // Risk Management & Sustainability Committee
    const riskExec = metrics.find(m => 
        m.metric_name === 'Risk Management & Sustainability Committee' && m.unit === 'Executive Directors'
    );
    const riskNonExec = metrics.find(m => 
        m.metric_name === 'Risk Management & Sustainability Committee' && m.unit === 'Non-executive Directors'
    );
    const riskIndependent = metrics.find(m => 
        m.metric_name === 'Risk Management & Sustainability Committee' && m.unit === 'Independent Non-executive Directors'
    );

    [riskExec, riskNonExec, riskIndependent].forEach((metric, idx) => {
        if (metric) {
            const latest = metric.values.find(v => v.year === latestYear);
            if (latest) {
                if (idx === 0) result.risk_management.executive_percent = latest.value;
                else if (idx === 1) result.risk_management.non_executive_percent = latest.value;
                else if (idx === 2) {
                    result.risk_management.independent_percent = latest.value;
                    result.risk_management.year = latestYear;
                }
            }
        }
    });

    // Remunerations and Nominations Committee
    const remNonExec = metrics.find(m => 
        m.metric_name === 'Remunerations and Nominations Committee' && m.unit === 'Non-executive Directors'
    );
    const remIndependent = metrics.find(m => 
        m.metric_name === 'Remunerations and Nominations Committee' && m.unit === 'Independent Non-executive Directors'
    );

    if (remNonExec) {
        const latest = remNonExec.values.find(v => v.year === latestYear);
        if (latest) result.remuneration_nominations.non_executive_percent = latest.value;
    }
    if (remIndependent) {
        const latest = remIndependent.values.find(v => v.year === latestYear);
        if (latest) {
            result.remuneration_nominations.independent_percent = latest.value;
            result.remuneration_nominations.year = latestYear;
        }
    }

    // Stakeholder Engagement Committee
    const stakeExec = metrics.find(m => 
        m.metric_name === 'Stakeholder Engagement Committee' && m.unit === 'Executive Directors'
    );
    const stakeNonExec = metrics.find(m => 
        m.metric_name === 'Stakeholder Engagement Committee' && m.unit === 'Non-executive Directors'
    );
    const stakeIndependent = metrics.find(m => 
        m.metric_name === 'Stakeholder Engagement Committee' && m.unit === 'Independent Non-executive Directors'
    );

    [stakeExec, stakeNonExec, stakeIndependent].forEach((metric, idx) => {
        if (metric) {
            const latest = metric.values.find(v => v.year === latestYear);
            if (latest) {
                if (idx === 0) result.stakeholder_engagement.executive_percent = latest.value;
                else if (idx === 1) result.stakeholder_engagement.non_executive_percent = latest.value;
                else if (idx === 2) {
                    result.stakeholder_engagement.independent_percent = latest.value;
                    result.stakeholder_engagement.year = latestYear;
                }
            }
        }
    });

    return result;
};

/**
 * Extract CSR metrics
 */
const getCsrMetrics = (metrics: EsgMetric[]): CsrMetrics => {
    const result: CsrMetrics = {
        education: {
            males: 0,
            females: 0,
            total: 0,
            year: 0
        },
        health_wellbeing: {
            hospital_attendees: 0,
            year: 0
        }
    };

    const latestYear = Math.max(...metrics.flatMap(m => m.values.map(v => v.year)));

    // Education metrics
    const educationMales = metrics.find(m => 
        m.metric_name === 'Corporate Social Responsibility - Education Attendance -  [Males]'
    );
    const educationFemales = metrics.find(m => 
        m.metric_name === 'Corporate Social Responsibility - Education Attendance -  [Females]'
    );

    if (educationMales) {
        const latest = educationMales.values.find(v => v.year === latestYear);
        if (latest && latest.numeric_value !== null) {
            result.education.males = latest.numeric_value;
            result.education.year = latestYear;
        }
    }

    if (educationFemales) {
        const latest = educationFemales.values.find(v => v.year === latestYear);
        if (latest && latest.numeric_value !== null) {
            result.education.females = latest.numeric_value;
            result.education.total = result.education.males + latest.numeric_value;
        }
    }

    // Health metrics
    const healthTotal = metrics.find(m => 
        m.metric_name === 'Health and Well being - Hospital attendees  - Total'
    );

    if (healthTotal) {
        const latest = healthTotal.values.find(v => v.year === latestYear);
        if (latest && latest.numeric_value !== null) {
            result.health_wellbeing.hospital_attendees = latest.numeric_value;
            result.health_wellbeing.year = latestYear;
        }
    }

    return result;
};

/**
 * Extract supplier metrics
 */
const getSupplierMetrics = (metrics: EsgMetric[]): SupplierMetrics => {
    const result: SupplierMetrics = {
        procurement: {
            local: '',
            foreign: '',
            total: '',
            year: 0
        },
        suppliers_count: {
            count: 0,
            year: 0,
            trend: 'stable'
        }
    };

    const latestYear = Math.max(...metrics.flatMap(m => m.values.map(v => v.year)));

    // Procurement metrics
    const procurementLocal = metrics.find(m => 
        m.metric_name === 'Relationship with suppliers - Procurement Spent' && m.unit === 'Local suppliers'
    );
    const procurementForeign = metrics.find(m => 
        m.metric_name === 'Relationship with suppliers - Procurement Spent' && m.unit === 'Foreign suppliers'
    );

    if (procurementLocal) {
        const latest = procurementLocal.values.find(v => v.year === latestYear);
        if (latest) {
            result.procurement.local = latest.value;
            result.procurement.year = latestYear;
        }
    }

    if (procurementForeign) {
        const latest = procurementForeign.values.find(v => v.year === latestYear);
        if (latest) {
            result.procurement.foreign = latest.value;
            
            // Calculate total if possible
            const localAmount = parseFloat(result.procurement.local.replace(/[^0-9.-]+/g, '')) || 0;
            const foreignAmount = parseFloat(latest.value.replace(/[^0-9.-]+/g, '')) || 0;
            const totalAmount = localAmount + foreignAmount;
            
            if (!isNaN(totalAmount) && totalAmount > 0) {
                result.procurement.total = `US$${totalAmount.toFixed(1)}m`;
            }
        }
    }

    // Suppliers count
    const suppliersCount = metrics.find(m => m.metric_name === 'Number of suppliers');
    if (suppliersCount) {
        const latest = suppliersCount.values.find(v => v.year === latestYear);
        const previous = suppliersCount.values.sort((a, b) => b.year - a.year)[1];

        if (latest && latest.numeric_value !== null) {
            result.suppliers_count.count = latest.numeric_value;
            result.suppliers_count.year = latestYear;

            if (previous && previous.numeric_value !== null) {
                if (latest.numeric_value > previous.numeric_value) result.suppliers_count.trend = 'increasing';
                else if (latest.numeric_value < previous.numeric_value) result.suppliers_count.trend = 'decreasing';
            }
        }
    }

    return result;
};

/**
 * Extract compliance metrics
 */
const getComplianceMetrics = (metrics: EsgMetric[]): ComplianceMetrics => {
    const result: ComplianceMetrics = {
        ethics_code: {
            status: false,
            year: 0
        },
        anti_corruption: {
            status: false,
            year: 0
        },
        whistleblowing: {
            mechanism: '',
            year: 0
        },
        incidents: {
            count: '',
            year: 0
        },
        supplier_code: {
            status: false,
            year: 0
        },
        ifrs_compliance: {
            status: '',
            year: 0
        }
    };

    const latestYear = Math.max(...metrics.flatMap(m => m.values.map(v => v.year)));

    // Ethics/Code of Conduct
    const ethicsCode = metrics.find(m => m.metric_name === 'Ethics / Code of Conduct');
    if (ethicsCode) {
        const latest = ethicsCode.values.find(v => v.year === latestYear);
        if (latest) {
            result.ethics_code.status = latest.value === 'In place';
            result.ethics_code.year = latestYear;
        }
    }

    // Anti-Corruption
    const antiCorruption = metrics.find(m => m.metric_name === 'Anti-Corruption / Anti-Bribery Policy');
    if (antiCorruption) {
        const latest = antiCorruption.values.find(v => v.year === latestYear);
        if (latest) {
            result.anti_corruption.status = latest.value === 'Yes';
            result.anti_corruption.year = latestYear;
        }
    }

    // Whistleblowing
    const whistleblowing = metrics.find(m => m.metric_name === 'Whistleblowing Mechanism');
    if (whistleblowing) {
        const latest = whistleblowing.values.find(v => v.year === latestYear);
        if (latest) {
            result.whistleblowing.mechanism = latest.value;
            result.whistleblowing.year = latestYear;
        }
    }

    // Compliance Incidents
    const incidents = metrics.find(m => m.metric_name === 'Compliance Incidents');
    if (incidents) {
        const latest = incidents.values.find(v => v.year === latestYear);
        if (latest) {
            result.incidents.count = latest.value;
            result.incidents.year = latestYear;
        }
    }

    // Supplier Code
    const supplierCode = metrics.find(m => m.metric_name === 'Supplier Code of Conduct');
    if (supplierCode) {
        const latest = supplierCode.values.find(v => v.year === latestYear);
        if (latest) {
            result.supplier_code.status = latest.value === 'In place';
            result.supplier_code.year = latestYear;
        }
    }

    // IFRS Compliance
    const ifrs = metrics.find(m => m.metric_name === 'IFRS / Sustainability-Related Financial Disclosures');
    if (ifrs) {
        const latest = ifrs.values.find(v => v.year === latestYear);
        if (latest) {
            result.ifrs_compliance.status = latest.value;
            result.ifrs_compliance.year = latestYear;
        }
    }

    return result;
};

/**
 * Extract remuneration metrics
 */
const getRemunerationMetrics = (metrics: EsgMetric[]): RemunerationMetrics => {
    const result: RemunerationMetrics = {
        disclosure: {
            status: '',
            year: 0
        },
        esg_linked: {
            status: false,
            year: 0
        }
    };

    const latestYear = Math.max(...metrics.flatMap(m => m.values.map(v => v.year)));

    // Executive Remuneration Disclosure
    const remunerationDisclosure = metrics.find(m => m.metric_name === 'Executive Remuneration Disclosure');
    if (remunerationDisclosure) {
        const latest = remunerationDisclosure.values.find(v => v.year === latestYear);
        if (latest) {
            result.disclosure.status = latest.value;
            result.disclosure.year = latestYear;
        }
    }

    // ESG Linked Pay
    const esgLinkedPay = metrics.find(m => m.metric_name === 'ESG Linked to Executive Pay');
    if (esgLinkedPay) {
        const latest = esgLinkedPay.values.find(v => v.year === latestYear);
        if (latest) {
            result.esg_linked.status = latest.value === 'Yes';
            result.esg_linked.year = latestYear;
        }
    }

    return result;
};

/**
 * Get comprehensive governance metrics summary
 */
export const getGovernanceMetricsSummary = (data: EsgDataRecord[]): GovernanceSummary => {
    const allMetrics: EsgMetric[] = data.flatMap(record => record.metrics);

    const boardSize = getBoardSizeMetrics(allMetrics);
    const boardMeetings = getBoardMeetingMetrics(allMetrics);
    const committees = getCommitteeMetrics(allMetrics);
    const csr = getCsrMetrics(allMetrics);
    const suppliers = getSupplierMetrics(allMetrics);
    const compliance = getComplianceMetrics(allMetrics);
    const remuneration = getRemunerationMetrics(allMetrics);

    return {
        board_composition: {
            board_size: boardSize || { value: 'N/A', year: 0, trend: 'stable' },
            board_meetings: boardMeetings || { count: 0, year: 0, trend: 'stable' }
        },
        committees,
        csr,
        suppliers,
        compliance,
        remuneration
    };
};

/**
 * Get key governance metrics for dashboard display
 */
export const getKeyGovernanceMetrics = (data: EsgDataRecord[]) => {
    const summary = getGovernanceMetricsSummary(data);

    return {
        board: {
            size: summary.board_composition.board_size,
            meetings: summary.board_composition.board_meetings,
            independence: {
                audit: summary.committees.audit_compliance.independent_percent,
                risk: summary.committees.risk_management.independent_percent,
                remuneration: summary.committees.remuneration_nominations.independent_percent
            }
        },
        csr: {
            education: summary.csr.education,
            health: summary.csr.health_wellbeing
        },
        procurement: {
            local_spend: summary.suppliers.procurement.local,
            foreign_spend: summary.suppliers.procurement.foreign,
            supplier_count: summary.suppliers.suppliers_count
        },
        compliance: {
            ethics: summary.compliance.ethics_code,
            anti_corruption: summary.compliance.anti_corruption,
            whistleblowing: summary.compliance.whistleblowing,
            incidents: summary.compliance.incidents
        },
        disclosure: {
            remuneration: summary.remuneration.disclosure,
            esg_linked: summary.remuneration.esg_linked
        }
    };
};


/**

/**
 * Calculate board independence score
 */
export const calculateBoardIndependenceScore = (data: EsgDataRecord[]): number => {
    const metrics = data.flatMap(record => record.metrics);
    const committeeMetrics = getCommitteeMetrics(metrics);
    
    let totalIndependentPercent = 0;
    let count = 0;
    
    // Collect all independent percentages
    const independentValues = [
        committeeMetrics.audit_compliance.independent_percent,
        committeeMetrics.risk_management.independent_percent,
        committeeMetrics.remuneration_nominations.independent_percent,
        committeeMetrics.stakeholder_engagement.independent_percent
    ];
    
    independentValues.forEach(value => {
        if (value && value !== 'Not reported') {
            const percent = parseFloat(value.replace('%', ''));
            if (!isNaN(percent)) {
                totalIndependentPercent += percent;
                count++;
            }
        }
    });
    
    // Also consider board size (smaller boards often have better independence)
    const boardSizeMetric = metrics.find(m => m.metric_name === 'Board Size');
    if (boardSizeMetric) {
        const latest = boardSizeMetric.values.reduce((a, b) => a.year > b.year ? a : b);
        const boardSize = parseInt(latest.value);
        // Ideal board size is 8-12, score based on deviation from ideal
        const idealSize = 10;
        const sizeScore = 100 - Math.min(100, Math.abs(boardSize - idealSize) * 10);
        totalIndependentPercent += sizeScore;
        count++;
    }
    
    return count > 0 ? Math.round(totalIndependentPercent / count) : 0;
};

/**
 * Calculate compliance score
 */
export const calculateComplianceScore = (data: EsgDataRecord[]): number => {
    const metrics = data.flatMap(record => record.metrics);
    const complianceMetrics = getComplianceMetrics(metrics);
    
    let score = 0;
    let maxScore = 0;
    
    // Ethics/Code of Conduct (20 points)
    maxScore += 20;
    if (complianceMetrics.ethics_code.status) score += 20;
    
    // Anti-Corruption Policy (20 points)
    maxScore += 20;
    if (complianceMetrics.anti_corruption.status) score += 20;
    
    // Whistleblowing Mechanism (20 points)
    maxScore += 20;
    if (complianceMetrics.whistleblowing.mechanism && complianceMetrics.whistleblowing.mechanism !== 'Not reported') {
        score += 20;
    }
    
    // No Compliance Incidents (20 points)
    maxScore += 20;
    if (complianceMetrics.incidents.count && complianceMetrics.incidents.count.includes('0')) {
        score += 20;
    }
    
    // Supplier Code of Conduct (10 points)
    maxScore += 10;
    if (complianceMetrics.supplier_code.status) score += 10;
    
    // IFRS Compliance (10 points)
    maxScore += 10;
    if (complianceMetrics.ifrs_compliance.status && complianceMetrics.ifrs_compliance.status.includes('alignment')) {
        score += 10;
    }
    
    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
};

/**
 * Calculate CSR impact score
 */
export const calculateCsrImpactScore = (data: EsgDataRecord[]): number => {
    const metrics = data.flatMap(record => record.metrics);
    const csrMetrics = getCsrMetrics(metrics);
    
    let score = 0;
    
    // Education metrics (max 50 points)
    if (csrMetrics.education.total > 0) {
        const educationScore = Math.min(50, (csrMetrics.education.total / 1000) * 5);
        score += educationScore;
    }
    
    // Health metrics (max 50 points)
    if (csrMetrics.health_wellbeing.hospital_attendees > 0) {
        const healthScore = Math.min(50, (csrMetrics.health_wellbeing.hospital_attendees / 10000) * 5);
        score += healthScore;
    }
    
    // Trend bonus (based on year-over-year increase)
    const educationMalesMetric = metrics.find(m => 
        m.metric_name === 'Corporate Social Responsibility - Education Attendance -  [Males]'
    );
    const educationFemalesMetric = metrics.find(m => 
        m.metric_name === 'Corporate Social Responsibility - Education Attendance -  [Females]'
    );
    
    if (educationMalesMetric && educationMalesMetric.values.length >= 2) {
        const sorted = educationMalesMetric.values.sort((a, b) => b.year - a.year);
        if (sorted[0].numeric_value !== null && sorted[1].numeric_value !== null) {
            const increase = sorted[0].numeric_value - sorted[1].numeric_value;
            if (increase > 0) score += 5;
        }
    }
    
    return Math.min(100, score);
};




/**
 * Get area of interest coordinates for mapping
 */
export const getAreaOfInterest = (data: EsgDataRecord[]): CompanyAreaOfInterest | null => {
    const record = data[0];
    return record?.company?.area_of_interest_metadata || null;
};

/**
 * Calculate overall governance score
 */
export const calculateOverallGovernanceScore = (data: EsgDataRecord[]): {
    score: number;
    breakdown: {
        board_independence: number;
        committee_effectiveness: number;
        csr_impact: number;
        compliance: number;
        disclosure: number;
    };
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
} => {
    const boardScore = calculateBoardIndependenceScore(data);
    const complianceScore = calculateComplianceScore(data);
    const csrScore = calculateCsrImpactScore(data);
    
    // Committee effectiveness score (simplified)
    const committeeScore = 75; // Placeholder - could be enhanced with more analysis
    
    // Disclosure score
    const metrics = data.flatMap(record => record.metrics);
    const remunerationMetrics = getRemunerationMetrics(metrics);
    let disclosureScore = 0;
    
    if (remunerationMetrics.disclosure.status === 'Fully disclosed') disclosureScore += 50;
    if (remunerationMetrics.esg_linked.status) disclosureScore += 30;
    
    // Check for other disclosures
    const ifrsMetric = metrics.find(m => m.metric_name === 'IFRS / Sustainability-Related Financial Disclosures');
    if (ifrsMetric) {
        const latest = ifrsMetric.values.reduce((a, b) => a.year > b.year ? a : b);
        if (latest.value.includes('alignment')) disclosureScore += 20;
    }
    
    const breakdown = {
        board_independence: boardScore,
        committee_effectiveness: committeeScore,
        csr_impact: csrScore,
        compliance: complianceScore,
        disclosure: disclosureScore
    };
    
    const totalScore = Math.round(
        (boardScore + committeeScore + csrScore + complianceScore + disclosureScore) / 5
    );
    
    // Determine grade
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (totalScore >= 90) grade = 'A';
    else if (totalScore >= 80) grade = 'B';
    else if (totalScore >= 70) grade = 'C';
    else if (totalScore >= 60) grade = 'D';
    else grade = 'F';
    
    return {
        score: totalScore,
        breakdown,
        grade
    };
};

export default {
    getGovernanceEsgData,
    getAllGovernanceEsgData,
    getGovernanceMetricsBySubCategory,
    getGovernanceMetricsByYear,
    getAvailableGovernanceYears,
    getCompanyGovernanceEsgSummary,
    getGovernanceMetricsSummary,
    getKeyGovernanceMetrics,
    calculateBoardIndependenceScore,
    calculateComplianceScore,
    calculateCsrImpactScore,
    calculateOverallGovernanceScore,
    getAreaOfInterest,
    getMetricsByCategory // Export reusable function
};