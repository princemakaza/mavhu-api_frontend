import React from 'react';
import { 
    BarChart3, 
    LineChart, 
    PieChart, 
    TrendingUp,
    Filter,
    Download,
    Calendar,
    Map
} from 'lucide-react';
import { 
    BiodiversityLandUseResponse 
} from '../../../../services/Admin_Service/esg_apis/biodiversity_api_service';

// Color Palette
const LOGO_GREEN = '#008000';
const LOGO_YELLOW = '#B8860B';

interface AnalyticsTabProps {
    biodiversityData: BiodiversityLandUseResponse | null;
    formatNumber: (num: number) => string;
    formatPercent: (num: number) => string;
    selectedYear: number | null;
    availableYears: number[];
    onMetricClick: (metric: any, modalType: string) => void;
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
    biodiversityData,
    formatNumber,
    formatPercent,
    selectedYear,
    availableYears,
    onMetricClick
}) => {
    if (!biodiversityData) {
        return (
            <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Analytics Data</h3>
                <p className="text-gray-500">Select a company to view detailed analytics</p>
            </div>
        );
    }

    const { 
        deforestation_analysis,
        graphs,
        key_statistics,
        carbon_emission_accounting
    } = biodiversityData.data;

    // TODO: Implement charts using a charting library (Chart.js, Recharts, etc.)
    // For now, we'll create placeholder charts

    return (
        <div className="space-y-6">
            {/* Analytics Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold" style={{ color: LOGO_GREEN }}>
                        Advanced Analytics
                    </h2>
                    <p className="text-gray-600">Detailed analysis of biodiversity and land use metrics</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <select className="bg-transparent focus:outline-none">
                            <option>All Metrics</option>
                            <option>Biodiversity</option>
                            <option>Deforestation</option>
                            <option>Carbon</option>
                            <option>Social Impact</option>
                        </select>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                        Export Data
                    </button>
                </div>
            </div>

            {/* Deforestation Risk Timeline - PLACEHOLDER */}
            <div 
                className="bg-white rounded-2xl border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onMetricClick(deforestation_analysis, 'Deforestation Risk Timeline')}
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Deforestation Risk Timeline</h3>
                        <p className="text-gray-600">Risk score changes over time</p>
                    </div>
                    <LineChart className="w-6 h-6 text-gray-500" />
                </div>
                <div className="h-64 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center">
                    <div className="text-center">
                        <LineChart className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-500">Risk timeline chart will be displayed here</p>
                        <p className="text-sm text-gray-400 mt-2">Click to view detailed analysis</p>
                    </div>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-4">
                    {deforestation_analysis.yearly_risk.slice(0, 4).map((yearlyRisk) => (
                        <div key={yearlyRisk.year} className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">{yearlyRisk.year}</p>
                            <p className={`text-lg font-bold ${yearlyRisk.risk_score > 70 ? 'text-red-600' : yearlyRisk.risk_score > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                                {yearlyRisk.risk_score}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Land Use Composition - PLACEHOLDER */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Land Use Composition</h3>
                            <p className="text-gray-600">Current year land distribution</p>
                        </div>
                        <PieChart className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className="h-64 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center">
                        <div className="text-center">
                            <PieChart className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                            <p className="text-gray-500">Land use pie chart will be displayed here</p>
                        </div>
                    </div>
                    <div className="mt-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                <span>Forest Area</span>
                            </div>
                            <span className="font-semibold">
                                {biodiversityData.data.land_use_metrics.current_year.forest_coverage_percent}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <span>Agricultural Area</span>
                            </div>
                            <span className="font-semibold">
                                {/* TO DO: Calculate percentage */}
                                {formatNumber(biodiversityData.data.land_use_metrics.current_year.agricultural_area)} ha
                            </span>
                        </div>
                    </div>
                </div>

                {/* NDVI Monthly Trend - PLACEHOLDER */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">NDVI Monthly Trend</h3>
                            <p className="text-gray-600">Vegetation health throughout the year</p>
                        </div>
                        <BarChart3 className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className="h-64 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center">
                        <div className="text-center">
                            <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                            <p className="text-gray-500">NDVI trend chart will be displayed here</p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Overall Average NDVI</p>
                            <p className="text-2xl font-bold" style={{ color: LOGO_GREEN }}>
                                {carbon_emission_accounting.ndvi_analysis.overall_avg_ndvi.toFixed(3)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Best Month</p>
                            <p className="font-semibold">
                                {carbon_emission_accounting.ndvi_analysis.best_month.month_name}: {carbon_emission_accounting.ndvi_analysis.best_month.avg_ndvi.toFixed(3)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Carbon Balance Analysis */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Carbon Balance Analysis</h3>
                        <p className="text-gray-600">Sequestration vs Emissions</p>
                    </div>
                    <TrendingUp className="w-6 h-6 text-gray-500" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-600 mb-2">Total Sequestration</p>
                        <p className="text-2xl font-bold text-green-600">
                            {formatNumber(key_statistics.carbon_metrics.total_sequestration)} tCO₂
                        </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-600 mb-2">Total Emissions</p>
                        <p className="text-2xl font-bold text-red-600">
                            {formatNumber(key_statistics.carbon_metrics.total_emissions)} tCO₂
                        </p>
                    </div>
                    <div className={`p-4 rounded-xl ${key_statistics.carbon_metrics.net_carbon_balance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                        <p className="text-sm text-gray-600 mb-2">Net Carbon Balance</p>
                        <p className={`text-2xl font-bold ${key_statistics.carbon_metrics.net_carbon_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatNumber(key_statistics.carbon_metrics.net_carbon_balance)} tCO₂
                        </p>
                    </div>
                </div>
                {/* TO DO: Add carbon balance trend chart */}
            </div>

            {/* Deforestation Alerts */}
            {deforestation_analysis.deforestation_alerts.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-red-600">Deforestation Alerts</h3>
                            <p className="text-gray-600">Recent deforestation incidents detected</p>
                        </div>
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-gray-600">Date</th>
                                    <th className="text-left py-3 px-4 text-gray-600">Location</th>
                                    <th className="text-left py-3 px-4 text-gray-600">Area Affected</th>
                                    <th className="text-left py-3 px-4 text-gray-600">Confidence</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deforestation_analysis.deforestation_alerts.map((alert, index) => (
                                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4">{alert.date || 'N/A'}</td>
                                        <td className="py-3 px-4">{alert.location || 'N/A'}</td>
                                        <td className="py-3 px-4">{alert.area_affected ? `${formatNumber(alert.area_affected)} ha` : 'N/A'}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                alert.confidence === 'High' ? 'bg-red-100 text-red-700' :
                                                alert.confidence === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {alert.confidence || 'Unknown'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsTab;