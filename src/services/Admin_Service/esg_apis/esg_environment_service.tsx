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
  unit: string;
  description: string;
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
  import_notes: string;
  data_quality_score: number | null;
  verification_status: string;
  validation_status: string;
  metrics: EsgMetric[];
  created_by: User;
  last_updated_by: User;
  is_active: boolean;
  import_date: string;
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
  unit: string;
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
 * ESG Metrics Service
 * =====================
 */

/**
 * Get ESG data for a company with optional year and category filters
 */
export const getEsgData = async (
  params: GetEsgDataParams
): Promise<EsgDataResponse> => {
  try {
    const { companyId, year, category } = params;
    
    let url = `/esg-data/company/${companyId}`;
    
    if (year && category) {
      url += `/year/${year}/category/environmental`;
    } else if (year) {
      url += `/year/${year}`;
    } else if (category) {
      url += `/category/${category}`;
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
 * Get all ESG data for a company (all years and categories)
 */
export const getAllEsgData = async (companyId: string): Promise<EsgDataResponse> => {
  return getEsgData({ companyId });
};

/**
 * Get metrics grouped by category
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
 * Get metrics grouped by year
 */
export const getMetricsByYear = (data: EsgDataRecord[]): YearlyMetrics => {
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
 * Get environmental metrics summary specific to Tongaat Hulett
 */
export const getEnvironmentalMetricsSummary = (data: EsgDataRecord[]) => {
  const environmentalMetrics = getMetricsByCategory(data).environmental?.metrics || [];
  
  // Find specific metrics for sugar production
  const totalGhg = environmentalMetrics.find(m => 
    m.metric_name.includes('Carbon Emissions') || m.metric_name.includes('Total GHG')
  );
  
  const scope1 = environmentalMetrics.find(m => m.metric_name.includes('Scope 1'));
  const scope2 = environmentalMetrics.find(m => m.metric_name.includes('Scope 2'));
  const scope3 = environmentalMetrics.find(m => m.metric_name.includes('Scope 3'));
  const waterUsage = environmentalMetrics.find(m => m.metric_name.includes('Water Usage'));
  const bagasseUsage = environmentalMetrics.find(m => m.metric_name.includes('Bagasse'));
  const coalConsumption = environmentalMetrics.find(m => m.metric_name.includes('Coal Consumption'));
  const wasteManagement = environmentalMetrics.find(m => m.metric_name.includes('Waste Management'));
  const environmentIncidents = environmentalMetrics.find(m => m.metric_name.includes('Environment Incidents'));

  const getLatestValue = (metric?: EsgMetric): number | null => {
    if (!metric || metric.values.length === 0) return null;
    const latest = metric.values.reduce((a, b) => a.year > b.year ? a : b);
    return latest.numeric_value;
  };

  const getUnit = (metric?: EsgMetric): string => {
    return metric?.unit || 'N/A';
  };

  return {
    total_ghg_emissions: {
      value: getLatestValue(totalGhg),
      unit: getUnit(totalGhg),
      metric_name: totalGhg?.metric_name
    },
    scope1_emissions: {
      value: getLatestValue(scope1),
      unit: getUnit(scope1),
      metric_name: scope1?.metric_name
    },
    scope2_emissions: {
      value: getLatestValue(scope2),
      unit: getUnit(scope2),
      metric_name: scope2?.metric_name
    },
    scope3_emissions: {
      value: getLatestValue(scope3),
      unit: getUnit(scope3),
      metric_name: scope3?.metric_name
    },
    water_usage: {
      value: getLatestValue(waterUsage),
      unit: getUnit(waterUsage),
      metric_name: waterUsage?.metric_name
    },
    bagasse_usage: {
      value: getLatestValue(bagasseUsage),
      unit: getUnit(bagasseUsage),
      metric_name: bagasseUsage?.metric_name
    },
    coal_consumption: {
      value: getLatestValue(coalConsumption),
      unit: getUnit(coalConsumption),
      metric_name: coalConsumption?.metric_name
    },
    waste_generated: {
      value: getLatestValue(wasteManagement),
      unit: getUnit(wasteManagement),
      metric_name: wasteManagement?.metric_name
    },
    environment_incidents: {
      value: getLatestValue(environmentIncidents),
      unit: getUnit(environmentIncidents),
      metric_name: environmentIncidents?.metric_name
    }
  };
};

/**
 * Get chart data for a specific metric
 */
export const getMetricChartData = (data: EsgDataRecord[], metricName: string, category?: string): MetricChart | null => {
  // Find the metric by name and category
  let foundMetric: EsgMetric | undefined;
  
  for (const record of data) {
    foundMetric = record.metrics.find(metric => {
      const nameMatches = metric.metric_name === metricName;
      const categoryMatches = !category || metric.category.toLowerCase() === category.toLowerCase();
      return nameMatches && categoryMatches;
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
export const getMultiMetricChartData = (data: EsgDataRecord[], metricNames: string[], category?: string): MetricChart[] => {
  const charts: MetricChart[] = [];

  metricNames.forEach(metricName => {
    const chart = getMetricChartData(data, metricName, category);
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
    governance: `rgba(156, 39, 176, ${opacity})`,       // Purple
    default: `rgba(158, 158, 158, ${opacity})`          // Gray fallback
  };

  const lowerCategory = category.toLowerCase();
  return colors[lowerCategory] || colors.default;
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
    
    // Use provided data quality score if available, otherwise use calculated score
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
export const getLatestMetricValues = (data: EsgDataRecord[]): Record<string, any> => {
  const result: Record<string, any> = {};
  const years = getAvailableYears(data);
  const latestYear = Math.max(...years);

  data.forEach(record => {
    record.metrics.forEach(metric => {
      const latestValue = metric.values
        .filter(v => v.year === latestYear)
        .pop();
      
      if (latestValue) {
        const key = `${metric.category}_${metric.metric_name}`
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
 * Export metrics to CSV format
 */
export const exportMetricsToCSV = (data: EsgDataRecord[]): string => {
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
 * Compare metrics between two years
 */
export const compareMetricYears = (data: EsgDataRecord[], year1: number, year2: number): Array<{
  metric_name: string;
  category: string;
  unit: string;
  year1_value: number | string | null;
  year2_value: number | string | null;
  change: number | string;
  change_percent: string;
  trend: string;
}> => {
  const comparison: Array<{
    metric_name: string;
    category: string;
    unit: string;
    year1_value: number | string | null;
    year2_value: number | string | null;
    change: number | string;
    change_percent: string;
    trend: string;
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
      let trend: string = 'stable';

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
 * Get key environmental metrics for dashboard display
 */
export const getKeyEnvironmentalMetrics = (data: EsgDataRecord[]) => {
  const summary = getEnvironmentalMetricsSummary(data);
  
  return {
    emissions: {
      total: summary.total_ghg_emissions,
      scope1: summary.scope1_emissions,
      scope2: summary.scope2_emissions,
      scope3: summary.scope3_emissions
    },
    energy: {
      renewable: summary.bagasse_usage,
      non_renewable: summary.coal_consumption
    },
    water_waste: {
      water: summary.water_usage,
      waste: summary.waste_generated,
      incidents: summary.environment_incidents
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
  getEsgData,
  getAllEsgData,
  getMetricsByCategory,
  getMetricsByYear,
  getAvailableYears,
  getCompanyEsgSummary,
  getEnvironmentalMetricsSummary,
  getKeyEnvironmentalMetrics,
  getMetricChartData,
  getMultiMetricChartData,
  calculateDataQualityScore,
  getMetricsWithMissingData,
  getLatestMetricValues,
  exportMetricsToCSV,
  compareMetricYears,
  getAreaOfInterest
};