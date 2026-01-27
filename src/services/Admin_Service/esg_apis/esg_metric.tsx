import api from "../Auth_service/api";

/**
 * =====================
 * Types & Interfaces
 * =====================
 */

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
    category: 'environmental' | 'social' | 'governance';
    metric_name: string;
    unit: string | null;
    description: string | null;
    values: EsgMetricValue[];
    is_active: boolean;
    created_by: string;
    _id: string;
    created_at: string;
}

export interface Company {
    _id: string;
    name: string;
    registrationNumber: string;
    industry: string;
}

export interface User {
    _id: string;
    email: string;
    full_name: string;
}

export interface ImportBatchInfo {
    import_batch_id?: string;
    import_date: string;
    import_notes?: string;
}

export interface DataQualityInfo {
    data_quality_score: number | null;
    verification_status: 'verified' | 'unverified' | 'pending';
    validation_status: 'validated' | 'not_validated' | 'partially_validated';
    validation_errors: any[];
}

export interface EsgDataRecord {
    _id: string;
    company: Company;
    reporting_period_start: number;
    reporting_period_end: number;
    data_source: string;
    source_file_name: string;
    source_file_type: string;
    metrics: EsgMetric[];
    created_by: User;
    last_updated_by: string;
    is_active: boolean;
    created_at: string;
    last_updated_at: string;
    __v: number;
    
    // Optional fields based on API response
    import_notes?: string;
    data_quality_score?: number | null;
    verification_status?: string;
    validation_status?: string;
    validation_errors?: any[];
    import_batch_id?: string;
    import_date?: string;
}

export interface EsgDataResponse {
    message: string;
    count: number;
    esgData: EsgDataRecord[];
}

export interface MetricsByCategory {
    environmental: {
        count: number;
        metrics: EsgMetric[];
    };
    social: {
        count: number;
        metrics: EsgMetric[];
    };
    governance: {
        count: number;
        metrics: EsgMetric[];
    };
}

export interface YearlyMetrics {
    [year: number]: {
        environmental: EsgMetric[];
        social: EsgMetric[];
        governance: EsgMetric[];
    };
}

export interface MetricTrend {
    metric_name: string;
    category: string;
    values: Array<{
        year: number;
        value: number | null;
    }>;
    trend: 'increasing' | 'decreasing' | 'stable' | 'fluctuating' | 'unknown';
    unit: string | null;
}

export interface CategorySummary {
    category: string;
    total_metrics: number;
    verified_metrics: number;
    latest_year: number;
    has_time_series: boolean;
}

export interface CompanyEsgSummary {
    company: Company;
    reporting_years: number[];
    categories_summary: CategorySummary[];
    total_metrics: number;
    data_quality_score: number | null;
    last_updated: string;
}

export interface MetricFilters {
    category?: 'environmental' | 'social' | 'governance' | 'all';
    year?: number;
    search?: string;
    verified_only?: boolean;
    unit?: string;
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
    filters?: MetricFilters;
}

/**
 * =====================
 * ESG Metrics Service
 * =====================
 */

/**
 * Get ESG data for a company
 */
export const getEsgData = async (
    params: GetEsgDataParams
): Promise<EsgDataResponse> => {
    try {
        const { companyId, filters } = params;

        const queryParams = new URLSearchParams();
        
        if (filters) {
            if (filters.category && filters.category !== 'all') {
                queryParams.append('category', filters.category);
            }
            if (filters.year) {
                queryParams.append('year', filters.year.toString());
            }
            if (filters.search) {
                queryParams.append('search', filters.search);
            }
            if (filters.verified_only) {
                queryParams.append('verified_only', 'true');
            }
            if (filters.unit) {
                queryParams.append('unit', filters.unit);
            }
        }

        const queryString = queryParams.toString();
        const url = `/esg-data/company/${companyId}${queryString ? `?${queryString}` : ''}`;

        const { data } = await api.get<EsgDataResponse>(url);
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
                throw new Error("ESG data not found for the specified company.");
            case 422:
                throw new Error(errorMessage || "Invalid filter parameters or data format.");
            case 500:
                throw new Error("Server error occurred while fetching ESG data.");
            case 503:
                throw new Error("ESG data service is temporarily unavailable.");
            default:
                throw new Error(
                    errorMessage ||
                    error.response?.data?.detail ||
                    "Failed to fetch ESG data"
                );
        }
    }
};

/**
 * Get metrics grouped by category
 */
export const getMetricsByCategory = (data: EsgDataRecord[]): MetricsByCategory => {
    const result: MetricsByCategory = {
        environmental: { count: 0, metrics: [] },
        social: { count: 0, metrics: [] },
        governance: { count: 0, metrics: [] },
    };

    data.forEach(record => {
        record.metrics.forEach(metric => {
            const category = metric.category.toLowerCase() as keyof MetricsByCategory;
            if (result[category]) {
                result[category].metrics.push(metric);
                result[category].count++;
            }
        });
    });

    return result;
};

/**
 * Get metrics grouped by year
 */
export const getMetricsByYear = (data: EsgDataRecord[]): YearlyMetrics => {
    const yearlyMetrics: YearlyMetrics = {};

    data.forEach(record => {
        record.metrics.forEach(metric => {
            metric.values.forEach(value => {
                const year = value.year;
                
                if (!yearlyMetrics[year]) {
                    yearlyMetrics[year] = {
                        environmental: [],
                        social: [],
                        governance: []
                    };
                }

                // Create a copy of metric with only this year's value
                const yearlyMetric = {
                    ...metric,
                    values: [value]
                };

                const category = metric.category.toLowerCase() as keyof typeof yearlyMetrics[number];
                if (yearlyMetrics[year][category]) {
                    yearlyMetrics[year][category].push(yearlyMetric);
                }
            });
        });
    });

    return yearlyMetrics;
};

/**
 * Get unique years from ESG data
 */
export const getAvailableYears = (data: EsgDataRecord[]): number[] => {
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
 * Get company ESG summary
 */
export const getCompanyEsgSummary = (data: EsgDataRecord[]): CompanyEsgSummary => {
    const company = data[0]?.company;
    const years = getAvailableYears(data);
    
    const metricsByCategory = getMetricsByCategory(data);
    const categories_summary: CategorySummary[] = [];
    
    let total_metrics = 0;
    let verified_metrics = 0;
Object.entries(metricsByCategory).forEach(([category, data]) => {
    const categoryData = data as { count: number; metrics: EsgMetric[] };

    const verifiedInCategory = categoryData.metrics.filter(
        m => m.verification_status === 'verified'
    ).length;

    categories_summary.push({
        category,
        total_metrics: categoryData.count,
        verified_metrics: verifiedInCategory,
        latest_year: Math.max(...years),
        has_time_series: categoryData.metrics.some(m => m.values.length > 1)
    });

    total_metrics += categoryData.count;
    verified_metrics += verifiedInCategory;
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

    return {
        company: company!,
        reporting_years: years,
        categories_summary,
        total_metrics,
        data_quality_score,
        last_updated
    };
};

/**
 * Get metric trend analysis
 */
export const getMetricTrends = (data: EsgDataRecord[]): MetricTrend[] => {
    const trends: MetricTrend[] = [];
    const metricsByCategory = getMetricsByCategory(data);

    Object.entries(metricsByCategory).forEach(([category, categoryData]) => {
        const categoryMetrics = categoryData as { metrics: EsgMetric[] };
        
        categoryMetrics.metrics.forEach(metric => {
            if (metric.values.length > 1) {
                const numericValues = metric.values
                    .sort((a, b) => a.year - b.year)
                    .map(v => ({ year: v.year, value: v.numeric_value }));

                // Calculate trend
                const values = numericValues.filter(v => v.value !== null).map(v => v.value as number);
                
                let trend: MetricTrend['trend'] = 'unknown';
                
                if (values.length >= 2) {
                    const first = values[0];
                    const last = values[values.length - 1];
                    const average = values.reduce((a, b) => a + b, 0) / values.length;
                    const variance = values.reduce((a, b) => a + Math.pow(b - average, 2), 0) / values.length;
                    
                    if (last > first && variance < Math.abs(last - first) * 0.1) {
                        trend = 'increasing';
                    } else if (last < first && variance < Math.abs(last - first) * 0.1) {
                        trend = 'decreasing';
                    } else if (Math.abs(last - first) < first * 0.05) {
                        trend = 'stable';
                    } else {
                        trend = 'fluctuating';
                    }
                }

                trends.push({
                    metric_name: metric.metric_name,
                    category: category,
                    values: numericValues,
                    trend,
                    unit: metric.unit
                });
            }
        });
    });

    return trends;
};

/**
 * Get environmental metrics summary
 */
export const getEnvironmentalMetricsSummary = (data: EsgDataRecord[]) => {
    const environmentalMetrics = getMetricsByCategory(data).environmental.metrics;
    
    // Find specific metrics
    const totalGhg = environmentalMetrics.find(m => 
        m.metric_name.includes('Total GHG') || m.metric_name.includes('Carbon Emissions')
    );
    
    const scope1 = environmentalMetrics.find(m => m.metric_name.includes('Scope 1'));
    const scope2 = environmentalMetrics.find(m => m.metric_name.includes('Scope 2'));
    const scope3 = environmentalMetrics.find(m => m.metric_name.includes('Scope 3'));
    const waterUsage = environmentalMetrics.find(m => m.metric_name.includes('Water Usage'));
    const energyConsumption = environmentalMetrics.find(m => m.metric_name.includes('Energy Consumption'));
    const wasteManagement = environmentalMetrics.find(m => m.metric_name.includes('Waste'));

    const getLatestValue = (metric?: EsgMetric): number | null => {
        if (!metric || metric.values.length === 0) return null;
        const latest = metric.values.reduce((a, b) => a.year > b.year ? a : b);
        return latest.numeric_value;
    };

    return {
        total_ghg_emissions: getLatestValue(totalGhg),
        scope1_emissions: getLatestValue(scope1),
        scope2_emissions: getLatestValue(scope2),
        scope3_emissions: getLatestValue(scope3),
        water_usage: getLatestValue(waterUsage),
        energy_consumption: getLatestValue(energyConsumption),
        waste_generated: getLatestValue(wasteManagement)
    };
};

/**
 * Get social metrics summary
 */
export const getSocialMetricsSummary = (data: EsgDataRecord[]) => {
    const socialMetrics = getMetricsByCategory(data).social.metrics;
    
    const totalEmployees = socialMetrics.find(m => m.metric_name.includes('Total Employees'));
    const femaleEmployees = socialMetrics.find(m => m.metric_name.includes('Female Employees'));
    const maleEmployees = socialMetrics.find(m => m.metric_name.includes('Male Employees'));
    const trainingHours = socialMetrics.find(m => m.metric_name.includes('training hours'));
    const safetyIncidents = socialMetrics.find(m => m.metric_name.includes('Injury') || m.metric_name.includes('Safety'));

    const getLatestValue = (metric?: EsgMetric): number | null => {
        if (!metric || metric.values.length === 0) return null;
        const latest = metric.values.reduce((a, b) => a.year > b.year ? a : b);
        return latest.numeric_value;
    };

    const getPercentage = (part?: EsgMetric, total?: EsgMetric): number | null => {
        const partValue = getLatestValue(part);
        const totalValue = getLatestValue(total);
        
        if (partValue !== null && totalValue !== null && totalValue > 0) {
            return (partValue / totalValue) * 100;
        }
        return null;
    };

    return {
        total_employees: getLatestValue(totalEmployees),
        female_percentage: getPercentage(femaleEmployees, totalEmployees),
        male_percentage: getPercentage(maleEmployees, totalEmployees),
        avg_training_hours: getLatestValue(trainingHours),
        safety_incidents: getLatestValue(safetyIncidents)
    };
};

/**
 * Get governance metrics summary
 */
export const getGovernanceMetricsSummary = (data: EsgDataRecord[]) => {
    const governanceMetrics = getMetricsByCategory(data).governance.metrics;
    
    const boardSize = governanceMetrics.find(m => m.metric_name.includes('Board Size'));
    const boardMeetings = governanceMetrics.find(m => m.metric_name.includes('meetings held'));
    const independentDirectors = governanceMetrics.find(m => m.metric_name.includes('Independent'));
    const csrSpending = governanceMetrics.find(m => m.metric_name.includes('Social Responsibility') || m.metric_name.includes('CSR'));
    const ethicsPolicy = governanceMetrics.find(m => m.metric_name.includes('Ethics') || m.metric_name.includes('Code of Conduct'));

    const getLatestValue = (metric?: EsgMetric): any => {
        if (!metric || metric.values.length === 0) return null;
        const latest = metric.values.reduce((a, b) => a.year > b.year ? a : b);
        return latest.value;
    };

    const getBooleanValue = (metric?: EsgMetric): boolean => {
        const value = getLatestValue(metric);
        return value === 'Yes' || value === 'In place' || value === 'Fully disclosed';
    };

    return {
        board_size: getLatestValue(boardSize),
        board_meetings: getLatestValue(boardMeetings),
        has_independent_directors: getLatestValue(independentDirectors)?.includes('Independent'),
        csr_spending: getLatestValue(csrSpending),
        has_ethics_policy: getBooleanValue(ethicsPolicy),
        has_whistleblowing: getBooleanValue(governanceMetrics.find(m => m.metric_name.includes('Whistleblowing'))),
        has_anti_corruption: getBooleanValue(governanceMetrics.find(m => m.metric_name.includes('Anti-Corruption')))
    };
};

/**
 * Filter metrics by criteria
 */
export const filterMetrics = (data: EsgDataRecord[], filters: MetricFilters): EsgMetric[] => {
    let allMetrics: EsgMetric[] = [];
    
    // Flatten all metrics from all records
    data.forEach(record => {
        allMetrics = allMetrics.concat(record.metrics);
    });

    // Apply filters
    return allMetrics.filter(metric => {
        // Category filter
        if (filters.category && filters.category !== 'all' && metric.category !== filters.category) {
            return false;
        }

        // Year filter
        if (filters.year && !metric.values.some(v => v.year === filters.year)) {
            return false;
        }

        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            if (!metric.metric_name.toLowerCase().includes(searchLower) &&
                !metric.description?.toLowerCase().includes(searchLower)) {
                return false;
            }
        }

        // Unit filter
        if (filters.unit && metric.unit !== filters.unit) {
            return false;
        }

        // Verified only filter
        if (filters.verified_only) {
            const record = data.find(r => r.metrics.includes(metric));
            if (record?.verification_status !== 'verified') {
                return false;
            }
        }

        return true;
    });
};

/**
 * Get chart data for a specific metric
 */
export const getMetricChartData = (data: EsgDataRecord[], metricName: string, category?: string): MetricChart | null => {
    const metrics = filterMetrics(data, {
        search: metricName,
        category: category as any
    });

    if (metrics.length === 0) return null;

    const metric = metrics[0];
    const values = metric.values
        .filter(v => v.numeric_value !== null)
        .sort((a, b) => a.year - b.year);

    if (values.length === 0) return null;

    const dataset: ChartDataset = {
        label: metric.metric_name,
        data: values.map(v => ({
            year: v.year,
            value: v.numeric_value!,
            source_notes: v.source_notes
        })),
        borderColor: getCategoryColor(metric.category),
        backgroundColor: getCategoryColor(metric.category, 0.1),
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
 * Get chart data for multiple metrics
 */
export const getMultiMetricChartData = (data: EsgDataRecord[], metricNames: string[]): MetricChart[] => {
    const charts: MetricChart[] = [];

    metricNames.forEach(metricName => {
        const chart = getMetricChartData(data, metricName);
        if (chart) {
            charts.push(chart);
        }
    });

    return charts;
};

/**
 * Get category color for charts
 */
const getCategoryColor = (category: string, opacity: number = 1): string => {
    const colors: Record<string, string> = {
        environmental: `rgba(76, 175, 80, ${opacity})`,      // Green
        social: `rgba(33, 150, 243, ${opacity})`,           // Blue
        governance: `rgba(156, 39, 176, ${opacity})`        // Purple
    };

    return colors[category.toLowerCase()] || `rgba(158, 158, 158, ${opacity})`; // Gray fallback
};

/**
 * Calculate data quality score
 */
export const calculateDataQualityScore = (data: EsgDataRecord[]): number => {
    if (data.length === 0) return 0;

    let totalScore = 0;
    let count = 0;

    data.forEach(record => {
        // Check completeness
        const hasMetrics = record.metrics.length > 0;
        const hasValues = record.metrics.some(m => m.values.length > 0);
        const hasRecentData = record.metrics.some(m => 
            m.values.some(v => v.year >= new Date().getFullYear() - 1)
        );
        
        // Check verification status
        const isVerified = record.verification_status === 'verified';
        const isValidated = record.validation_status === 'validated';
        
        // Check data source
        const hasSource = !!record.data_source;
        const hasFileName = !!record.source_file_name;
        
        // Calculate individual scores
        const completenessScore = (hasMetrics ? 20 : 0) + (hasValues ? 20 : 0) + (hasRecentData ? 10 : 0);
        const verificationScore = (isVerified ? 25 : 0) + (isValidated ? 15 : 0);
        const sourceScore = (hasSource ? 5 : 0) + (hasFileName ? 5 : 0);
        
        const recordScore = completenessScore + verificationScore + sourceScore;
        
        // Adjust for data quality score if available
        if (record.data_quality_score !== null) {
            totalScore += record.data_quality_score;
        } else {
            totalScore += recordScore;
        }
        
        count++;
    });

    return count > 0 ? Math.round(totalScore / count) : 0;
};

/**
 * Get metrics with missing data
 */
export const getMetricsWithMissingData = (data: EsgDataRecord[]): EsgMetric[] => {
    const allMetrics: EsgMetric[] = [];
    
    data.forEach(record => {
        record.metrics.forEach(metric => {
            // Check for missing numeric values or incomplete time series
            const years = getAvailableYears([record]);
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
 * Get latest metric values
 */
export const getLatestMetricValues = (data: EsgDataRecord[]): Record<string, number | string | null> => {
    const result: Record<string, number | string | null> = {};
    const years = getAvailableYears(data);
    const latestYear = Math.max(...years);

    data.forEach(record => {
        record.metrics.forEach(metric => {
            const latestValue = metric.values
                .filter(v => v.year === latestYear)
                .pop();
            
            if (latestValue) {
                const key = `${metric.category}_${metric.metric_name}`.replace(/\s+/g, '_').toLowerCase();
                result[key] = latestValue.numeric_value !== null ? latestValue.numeric_value : latestValue.value;
            }
        });
    });

    return result;
};

/**
 * Export metrics to CSV format
 */
export const exportMetricsToCSV = (data: EsgDataRecord[]): string => {
    const headers = ['Category', 'Metric Name', 'Unit', 'Year', 'Value', 'Numeric Value', 'Source Notes'];
    const rows: string[][] = [headers];

    data.forEach(record => {
        record.metrics.forEach(metric => {
            metric.values.forEach(value => {
                rows.push([
                    metric.category,
                    metric.metric_name,
                    metric.unit || '',
                    value.year.toString(),
                    value.value,
                    value.numeric_value?.toString() || '',
                    value.source_notes
                ]);
            });
        });
    });

    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
};

/**
 * Validate ESG data structure
 */
export const validateEsgData = (data: EsgDataRecord[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!Array.isArray(data)) {
        errors.push('Data must be an array');
        return { valid: false, errors };
    }

    data.forEach((record, index) => {
        if (!record.company || !record.company._id) {
            errors.push(`Record ${index}: Missing company information`);
        }
        
        if (!record.metrics || !Array.isArray(record.metrics)) {
            errors.push(`Record ${index}: Metrics must be an array`);
        }
        
        if (record.reporting_period_start > record.reporting_period_end) {
            errors.push(`Record ${index}: Reporting period start cannot be after end`);
        }

        record.metrics?.forEach((metric, metricIndex) => {
            if (!metric.category || !['environmental', 'social', 'governance'].includes(metric.category)) {
                errors.push(`Record ${index}, Metric ${metricIndex}: Invalid category`);
            }
            
            if (!metric.metric_name) {
                errors.push(`Record ${index}, Metric ${metricIndex}: Missing metric name`);
            }
            
            metric.values?.forEach((value, valueIndex) => {
                if (value.numeric_value !== null && typeof value.numeric_value !== 'number') {
                    errors.push(`Record ${index}, Metric ${metricIndex}, Value ${valueIndex}: Invalid numeric value`);
                }
            });
        });
    });

    return {
        valid: errors.length === 0,
        errors
    };
};

/**
 * Compare metrics between two years
 */
export const compareMetricYears = (data: EsgDataRecord[], year1: number, year2: number): Array<{
    metric_name: string;
    category: string;
    unit: string | null;
    year1_value: number | string | null;
    year2_value: number | string | null;
    change: number | string;
    change_percent: number | string;
}> => {
    const comparison: Array<{
        metric_name: string;
        category: string;
        unit: string | null;
        year1_value: number | string | null;
        year2_value: number | string | null;
        change: number | string;
        change_percent: number | string;
    }> = [];

    const allMetrics: EsgMetric[] = [];
    data.forEach(record => {
        allMetrics.push(...record.metrics);
    });

    allMetrics.forEach(metric => {
        const value1 = metric.values.find(v => v.year === year1);
        const value2 = metric.values.find(v => v.year === year2);

        if (value1 && value2 && value1.numeric_value !== null && value2.numeric_value !== null) {
            const change = value2.numeric_value - value1.numeric_value;
            const change_percent = value1.numeric_value !== 0 
                ? ((change / Math.abs(value1.numeric_value)) * 100).toFixed(2)
                : '∞';

            comparison.push({
                metric_name: metric.metric_name,
                category: metric.category,
                unit: metric.unit,
                year1_value: value1.numeric_value,
                year2_value: value2.numeric_value,
                change,
                change_percent: `${change_percent}%`
            });
        } else if (value1 && value2) {
            comparison.push({
                metric_name: metric.metric_name,
                category: metric.category,
                unit: metric.unit,
                year1_value: value1.value,
                year2_value: value2.value,
                change: 'N/A',
                change_percent: 'N/A'
            });
        }
    });

    return comparison;
};

export default {
    getEsgData,
    getMetricsByCategory,
    getMetricsByYear,
    getAvailableYears,
    getCompanyEsgSummary,
    getMetricTrends,
    getEnvironmentalMetricsSummary,
    getSocialMetricsSummary,
    getGovernanceMetricsSummary,
    filterMetrics,
    getMetricChartData,
    getMultiMetricChartData,
    calculateDataQualityScore,
    getMetricsWithMissingData,
    getLatestMetricValues,
    exportMetricsToCSV,
    validateEsgData,
    compareMetricYears
};