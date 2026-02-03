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
    numeric_value: number;
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
 * Social ESG Metrics Service
 * =====================
 */

/**
 * Get social ESG data for a company with optional year filter
 */
export const getSocialEsgData = async (
    params: GetEsgDataParams
): Promise<EsgDataResponse> => {
    try {
        const { companyId, year } = params;

        let url = `/esg-data/company/${companyId}/category/social`;

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
                throw new Error("Social ESG data not found for the specified company.");
            case 422:
                throw new Error(errorMessage || "Invalid filter parameters or data format.");
            case 500:
                throw new Error("Server error occurred while fetching social ESG data.");
            case 503:
                throw new Error("Social ESG data service is temporarily unavailable.");
            default:
                throw new Error(
                    errorMessage ||
                    error.response?.data?.detail ||
                    "Failed to fetch social ESG data"
                );
        }
    }
};

/**
 * Get all social ESG data for a company (all years)
 */
export const getAllSocialEsgData = async (companyId: string): Promise<EsgDataResponse> => {
    return getSocialEsgData({ companyId });
};

/**
 * Get metrics grouped by social sub-categories
 */
export const getSocialMetricsBySubCategory = (data: EsgDataRecord[]): {
    [subCategory: string]: {
        count: number;
        metrics: EsgMetric[];
    }
} => {
    const result: { [subCategory: string]: { count: number; metrics: EsgMetric[] } } = {};

    data.forEach(record => {
        record.metrics.forEach(metric => {
            // Extract sub-category from metric name (e.g., "Human Capital - Total Employees" -> "Human Capital")
            const parts = metric.metric_name.split(' - ');
            const subCategory = parts.length > 1 ? parts[0] : 'Other';

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
export const getSocialMetricsByYear = (data: EsgDataRecord[]): YearlyMetrics => {
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
 * Get unique years from social ESG data
 */
export const getAvailableSocialYears = (data: EsgDataRecord[]): number[] => {
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
 * Get company social ESG summary
 */
export const getCompanySocialEsgSummary = (data: EsgDataRecord[]): CompanyEsgSummary => {
    const company = data[0]?.company;
    const years = getAvailableSocialYears(data);

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
 * Get social metrics summary specific to Tongaat Hulett
 */
export const getSocialMetricsSummary = (data: EsgDataRecord[]) => {
    const socialMetrics = getMetricsByCategory(data).social?.metrics || [];

    // Find specific metrics for social performance
    const totalEmployees = socialMetrics.find(m =>
        m.metric_name.includes('Human Capital - Total Employees')
    );

    const femaleEmployees = socialMetrics.find(m =>
        m.metric_name.includes('Human Capital - Female Employees')
    );

    const maleEmployees = socialMetrics.find(m =>
        m.metric_name.includes('Human Capital - Male Employees')
    );

    const permanentEmployees = socialMetrics.find(m =>
        m.metric_name.includes('Employees by Contract Type - Permanent')
    );

    const fixedTermEmployees = socialMetrics.find(m =>
        m.metric_name.includes('Employees by Contract Type - Fixed term contract')
    );

    const graduateTrainees = socialMetrics.find(m =>
        m.metric_name.includes('Human Capital - Graduate Trainees')
    );

    const apprentices = socialMetrics.find(m =>
        m.metric_name.includes('Human Capital - Apprentices')
    );

    const trainingHoursMale = socialMetrics.find(m =>
        m.metric_name.includes('Average training hours by gender') && m.unit === 'Male'
    );

    const trainingHoursFemale = socialMetrics.find(m =>
        m.metric_name.includes('Average training hours by gender') && m.unit === 'Female'
    );

    const ltifr = socialMetrics.find(m =>
        m.metric_name.includes('Lost Time Injury Frequency Rate')
    );

    const pensionContributions = socialMetrics.find(m =>
        m.metric_name.includes('Pension Contributions US$m') && m.unit === 'Hippo Valley Pension Fund'
    );

    const nssaContributions = socialMetrics.find(m =>
        m.metric_name.includes('Pension Contributions US$m') && m.unit === 'NSSA'
    );

    const getLatestValue = (metric?: EsgMetric): number | null => {
        if (!metric || metric.values.length === 0) return null;
        const latest = metric.values.reduce((a, b) => a.year > b.year ? a : b);
        return latest.numeric_value;
    };

    const getUnit = (metric?: EsgMetric): string => {
        return metric?.unit || 'N/A';
    };

    // Calculate gender diversity percentage
    const femaleCount = getLatestValue(femaleEmployees) || 0;
    const totalCount = getLatestValue(totalEmployees) || 1;
    const femalePercentage = totalCount > 0 ? (femaleCount / totalCount) * 100 : 0;

    // Calculate employment type percentages
    const permanentCount = getLatestValue(permanentEmployees) || 0;
    const fixedTermCount = getLatestValue(fixedTermEmployees) || 0;
    const permanentPercentage = totalCount > 0 ? (permanentCount / totalCount) * 100 : 0;
    const fixedTermPercentage = totalCount > 0 ? (fixedTermCount / totalCount) * 100 : 0;

    return {
        workforce: {
            total_employees: {
                value: getLatestValue(totalEmployees),
                unit: getUnit(totalEmployees),
                metric_name: totalEmployees?.metric_name
            },
            female_employees: {
                value: getLatestValue(femaleEmployees),
                unit: getUnit(femaleEmployees),
                metric_name: femaleEmployees?.metric_name,
                percentage: parseFloat(femalePercentage.toFixed(1))
            },
            male_employees: {
                value: getLatestValue(maleEmployees),
                unit: getUnit(maleEmployees),
                metric_name: maleEmployees?.metric_name,
                percentage: parseFloat((100 - femalePercentage).toFixed(1))
            }
        },
        employment_types: {
            permanent: {
                value: getLatestValue(permanentEmployees),
                unit: getUnit(permanentEmployees),
                metric_name: permanentEmployees?.metric_name,
                percentage: parseFloat(permanentPercentage.toFixed(1))
            },
            fixed_term: {
                value: getLatestValue(fixedTermEmployees),
                unit: getUnit(fixedTermEmployees),
                metric_name: fixedTermEmployees?.metric_name,
                percentage: parseFloat(fixedTermPercentage.toFixed(1))
            }
        },
        development: {
            graduate_trainees: {
                value: getLatestValue(graduateTrainees),
                unit: getUnit(graduateTrainees),
                metric_name: graduateTrainees?.metric_name
            },
            apprentices: {
                value: getLatestValue(apprentices),
                unit: getUnit(apprentices),
                metric_name: apprentices?.metric_name
            },
            training_hours_male: {
                value: getLatestValue(trainingHoursMale),
                unit: getUnit(trainingHoursMale),
                metric_name: trainingHoursMale?.metric_name
            },
            training_hours_female: {
                value: getLatestValue(trainingHoursFemale),
                unit: getUnit(trainingHoursFemale),
                metric_name: trainingHoursFemale?.metric_name
            }
        },
        safety: {
            ltifr: {
                value: getLatestValue(ltifr),
                unit: getUnit(ltifr),
                metric_name: ltifr?.metric_name
            }
        },
        welfare: {
            pension_fund: {
                value: getLatestValue(pensionContributions),
                unit: getUnit(pensionContributions),
                metric_name: pensionContributions?.metric_name
            },
            nssa: {
                value: getLatestValue(nssaContributions),
                unit: getUnit(nssaContributions),
                metric_name: nssaContributions?.metric_name
            }
        }
    };
};

/**
 * Get chart data for a specific social metric
 */
export const getSocialMetricChartData = (data: EsgDataRecord[], metricName: string, unit?: string): MetricChart | null => {
    // Find the metric by name and unit
    let foundMetric: EsgMetric | undefined;

    for (const record of data) {
        foundMetric = record.metrics.find(metric => {
            const nameMatches = metric.metric_name === metricName;
            const unitMatches = !unit || metric.unit === unit;
            return nameMatches && unitMatches;
        });

        if (foundMetric) break;
    }

    if (!foundMetric) return null;

    const metric = foundMetric;
    const values = metric.values
        .filter(v => v.numeric_value !== null)
        .sort((a, b) => a.year - b.year);

    if (values.length === 0) return null;

    const dataset: ChartDataset = {
        label: `${metric.metric_name}${metric.unit ? ` (${metric.unit})` : ''}`,
        data: values.map(v => ({
            year: v.year,
            value: v.numeric_value!,
            source_notes: v.source_notes
        })),
        borderColor: getSocialCategoryColor(metric.metric_name),
        backgroundColor: getSocialCategoryColor(metric.metric_name, 0.1),
        tension: 0.4
    };

    return {
        metric_name: metric.metric_name,
        category: metric.category,
        unit: metric.unit,
        datasets: [dataset]
    };
};

/**
 * Get chart data for workforce metrics
 */
export const getWorkforceChartData = (data: EsgDataRecord[]): MetricChart[] => {
    const charts: MetricChart[] = [];

    const workforceMetrics = [
        'Human Capital - Total Employees',
        'Human Capital - Female Employees',
        'Human Capital - Male Employees',
        'Human Capital - Employees by Contract Type - Permanent',
        'Human Capital - Employees by Contract Type - Fixed term contract'
    ];

    workforceMetrics.forEach(metricName => {
        const chart = getSocialMetricChartData(data, metricName);
        if (chart) {
            charts.push(chart);
        }
    });

    return charts;
};

/**
 * Get chart data for safety metrics
 */
export const getSafetyChartData = (data: EsgDataRecord[]): MetricChart[] => {
    const charts: MetricChart[] = [];

    const safetyMetrics = [
        'Work-related Injuries - Lost Time Injury Frequency Rate'
    ];

    safetyMetrics.forEach(metricName => {
        const chart = getSocialMetricChartData(data, metricName);
        if (chart) {
            charts.push(chart);
        }
    });

    return charts;
};

/**
 * Get social category color for charts
 */
const getSocialCategoryColor = (metricName: string, opacity: number = 1): string => {
    const colors: Record<string, string> = {
        // Workforce metrics
        'Human Capital - Total Employees': `rgba(33, 150, 243, ${opacity})`,           // Blue
        'Human Capital - Female Employees': `rgba(233, 30, 99, ${opacity})`,           // Pink
        'Human Capital - Male Employees': `rgba(76, 175, 80, ${opacity})`,             // Green
        'Human Capital - Employees by Contract Type - Permanent': `rgba(255, 152, 0, ${opacity})`, // Orange
        'Human Capital - Employees by Contract Type - Fixed term contract': `rgba(156, 39, 176, ${opacity})`, // Purple

        // Development metrics
        'Human Capital - Graduate Trainees': `rgba(0, 188, 212, ${opacity})`,          // Cyan
        'Human Capital - Apprentices': `rgba(103, 58, 183, ${opacity})`,               // Deep Purple
        'Average training hours by gender': `rgba(255, 193, 7, ${opacity})`,           // Amber

        // Safety metrics
        'Work-related Injuries - Lost Time Injury Frequency Rate': `rgba(244, 67, 54, ${opacity})`, // Red

        // Welfare metrics
        'Pension Contributions US$m': `rgba(139, 195, 74, ${opacity})`,                // Light Green

        // Default
        'default': `rgba(158, 158, 158, ${opacity})`                                   // Gray fallback
    };

    // Find matching color
    for (const [key, color] of Object.entries(colors)) {
        if (metricName.includes(key)) {
            return color;
        }
    }

    return colors.default;
};

/**
 * Calculate workforce diversity metrics
 */
export const calculateDiversityMetrics = (data: EsgDataRecord[]) => {
    const socialMetrics = getMetricsByCategory(data).social?.metrics || [];

    const femaleEmployees = socialMetrics.find(m =>
        m.metric_name.includes('Human Capital - Female Employees')
    );

    const totalEmployees = socialMetrics.find(m =>
        m.metric_name.includes('Human Capital - Total Employees')
    );

    const getLatestValue = (metric?: EsgMetric): number => {
        if (!metric || metric.values.length === 0) return 0;
        const latest = metric.values.reduce((a, b) => a.year > b.year ? a : b);
        return latest.numeric_value || 0;
    };

    const femaleCount = getLatestValue(femaleEmployees);
    const totalCount = getLatestValue(totalEmployees);

    const femalePercentage = totalCount > 0 ? (femaleCount / totalCount) * 100 : 0;
    const malePercentage = totalCount > 0 ? 100 - femalePercentage : 0;

    return {
        female_percentage: parseFloat(femalePercentage.toFixed(2)),
        male_percentage: parseFloat(malePercentage.toFixed(2)),
        gender_balance_index: parseFloat((femalePercentage / 50).toFixed(2)), // Target: 50%
        has_gender_parity: femalePercentage >= 40 && femalePercentage <= 60
    };
};

/**
 * Calculate safety performance metrics
 */
export const calculateSafetyMetrics = (data: EsgDataRecord[]) => {
    const socialMetrics = getMetricsByCategory(data).social?.metrics || [];

    const ltifr = socialMetrics.find(m =>
        m.metric_name.includes('Lost Time Injury Frequency Rate')
    );

    const getLatestValue = (metric?: EsgMetric): number | null => {
        if (!metric || metric.values.length === 0) return null;
        const latest = metric.values.reduce((a, b) => a.year > b.year ? a : b);
        return latest.numeric_value;
    };

    const currentLtifr = getLatestValue(ltifr);

    return {
        current_ltifr: currentLtifr,
        safety_level: currentLtifr ?
            currentLtifr < 0.05 ? 'Excellent' :
                currentLtifr < 0.1 ? 'Good' :
                    currentLtifr < 0.2 ? 'Fair' : 'Needs Improvement'
            : 'Unknown',
        industry_benchmark: 0.1, // Sugar industry benchmark
        is_below_benchmark: currentLtifr ? currentLtifr < 0.1 : false
    };
};

/**
 * Get metrics with missing data
 */
export const getSocialMetricsWithMissingData = (data: EsgDataRecord[]): EsgMetric[] => {
    const allMetrics: EsgMetric[] = [];

    data.forEach(record => {
        record.metrics.forEach(metric => {
            // Check for missing numeric values or incomplete time series
            const years = getAvailableSocialYears([record]);
            const metricYears = metric.values.map(v => v.year);
            const missingYears = years.filter(y => !metricYears.includes(y));

            if (metric.values.length === 0 ||
                metric.values.some(v => v.numeric_value === null) ||
                missingYears.length > 0) {
                allMetrics.push(metric);
            }
        });
    });

    return allMetrics;
};

/**
 * Get latest social metric values
 */
export const getLatestSocialMetricValues = (data: EsgDataRecord[]): Record<string, any> => {
    const result: Record<string, any> = {};
    const years = getAvailableSocialYears(data);
    const latestYear = years.length > 0 ? Math.max(...years) : new Date().getFullYear();

    data.forEach(record => {
        record.metrics.forEach(metric => {
            const latestValue = metric.values
                .filter(v => v.year === latestYear)
                .pop();

            if (latestValue) {
                const key = metric.metric_name
                    .replace(/\s+/g, '_')
                    .replace(/[^\w]/g, '')
                    .toLowerCase();

                result[key] = {
                    value: latestValue.numeric_value !== null ? latestValue.numeric_value : latestValue.value,
                    unit: metric.unit,
                    year: latestYear,
                    source_notes: latestValue.source_notes,
                    metric_name: metric.metric_name,
                    category: metric.category
                };
            }
        });
    });

    return result;
};

/**
 * Export social metrics to CSV format
 */
export const exportSocialMetricsToCSV = (data: EsgDataRecord[]): string => {
    const headers = ['Category', 'Metric Name', 'Unit', 'Description', 'Year', 'Value', 'Numeric Value', 'Source Notes', 'Added At'];
    const rows: string[][] = [headers];

    data.forEach(record => {
        record.metrics.forEach(metric => {
            metric.values.forEach(value => {
                rows.push([
                    metric.category,
                    metric.metric_name,
                    metric.unit || '',
                    metric.description || '',
                    value.year.toString(),
                    value.value,
                    value.numeric_value?.toString() || '',
                    value.source_notes,
                    value.added_at
                ]);
            });
        });
    });

    return rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
};

/**
 * Compare social metrics between two years
 */
export const compareSocialMetricYears = (
    data: EsgDataRecord[],
    year1: number,
    year2: number
): Array<{
    metric_name: string;
    category: string;
    unit: string | null;
    year1_value: number | string | null;
    year2_value: number | string | null;
    change: number | string;
    change_percent: string;
    trend: 'increasing' | 'decreasing' | 'stable';
}> => {
    const comparison: Array<{
        metric_name: string;
        category: string;
        unit: string | null;
        year1_value: number | string | null;
        year2_value: number | string | null;
        change: number | string;
        change_percent: string;
        trend: 'increasing' | 'decreasing' | 'stable';
    }> = [];

    const allMetrics: EsgMetric[] = [];
    data.forEach(record => {
        allMetrics.push(...record.metrics);
    });

    allMetrics.forEach(metric => {
        const value1 = metric.values.find(v => v.year === year1);
        const value2 = metric.values.find(v => v.year === year2);

        if (value1 && value2) {
            let change: number | string = 'N/A';
            let change_percent: string = 'N/A';
            let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';

            if (value1.numeric_value !== null && value2.numeric_value !== null) {
                change = value2.numeric_value - value1.numeric_value;
                if (value1.numeric_value !== 0) {
                    const percent = ((change / Math.abs(value1.numeric_value)) * 100);
                    change_percent = `${percent.toFixed(2)}%`;
                    trend = change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable';
                } else {
                    change_percent = '∞';
                    trend = value2.numeric_value > 0 ? 'increasing' : 'stable';
                }
            }

            comparison.push({
                metric_name: metric.metric_name,
                category: metric.category,
                unit: metric.unit,
                year1_value: value1.numeric_value !== null ? value1.numeric_value : value1.value,
                year2_value: value2.numeric_value !== null ? value2.numeric_value : value2.value,
                change,
                change_percent,
                trend
            });
        }
    });

    return comparison.sort((a, b) => {
        if (typeof a.change === 'number' && typeof b.change === 'number') {
            return Math.abs(b.change) - Math.abs(a.change);
        }
        return 0;
    });
};

/**
 * Get key social metrics for dashboard display
 */
export const getKeySocialMetrics = (data: EsgDataRecord[]) => {
    const summary = getSocialMetricsSummary(data);
    const diversity = calculateDiversityMetrics(data);
    const safety = calculateSafetyMetrics(data);

    return {
        workforce: {
            total: summary.workforce.total_employees,
            gender_ratio: {
                female: summary.workforce.female_employees,
                male: summary.workforce.male_employees
            },
            diversity_score: diversity
        },
        employment: {
            permanent: summary.employment_types.permanent,
            fixed_term: summary.employment_types.fixed_term
        },
        development: {
            trainees: summary.development.graduate_trainees,
            apprentices: summary.development.apprentices,
            training: {
                male: summary.development.training_hours_male,
                female: summary.development.training_hours_female
            }
        },
        safety: {
            ltifr: summary.safety.ltifr,
            performance: safety
        },
        welfare: {
            pension: summary.welfare.pension_fund,
            nssa: summary.welfare.nssa
        }
    };
};

/**
 * Get area of interest coordinates for mapping
 */
export const getAreaOfInterest = (data: EsgDataRecord[]): CompanyAreaOfInterest | null => {
    const record = data[0];
    return record?.company?.area_of_interest_metadata || null;
};

export default {
    getSocialEsgData,
    getAllSocialEsgData,
    getSocialMetricsBySubCategory,
    getSocialMetricsByYear,
    getAvailableSocialYears,
    getCompanySocialEsgSummary,
    getSocialMetricsSummary,
    getKeySocialMetrics,
    getSocialMetricChartData,
    getWorkforceChartData,
    getSafetyChartData,
    calculateDiversityMetrics,
    calculateSafetyMetrics,
    getSocialMetricsWithMissingData,
    getLatestSocialMetricValues,
    exportSocialMetricsToCSV,
    compareSocialMetricYears,
    getAreaOfInterest,
    getMetricsByCategory // Export reusable function
};