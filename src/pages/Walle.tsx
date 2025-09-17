import Sidebar from "@/components/Sidebar";
import { Loader2, Menu, X, TrendingUp, TrendingDown, Wallet, Users, DollarSign, Activity } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import AdminService from "@/services/Admin_Service/admin_service";

function Resourcewalle() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // State for wallet dashboard data
  const [dashboardData, setDashboardData] = useState(null);

  // State for loading
  const [isLoading, setIsLoading] = useState(true);

  // State for error messages
  const [error, setError] = useState(null);

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Update screen size state and handle sidebar visibility
  useEffect(() => {
    const checkScreenSize = () => {
      const isLarge = window.innerWidth >= 768;
      setIsLargeScreen(isLarge);
      setSidebarOpen(isLarge);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Fetch wallet dashboard data when component mounts
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await AdminService.getWalletDashboard();
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching wallet data:", err);
        setError("Failed to load wallet data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  // Shimmer loading component for stats cards
  const StatCardShimmer = () => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-gray-200 rounded w-1/3 shimmer"></div>
        <div className="h-8 w-8 bg-gray-200 rounded shimmer"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-2/3 mb-2 shimmer"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 shimmer"></div>
    </div>
  );

  // Shimmer loading component for charts
  const ChartShimmer = () => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 shimmer"></div>
      <div className="h-64 bg-gray-200 rounded shimmer"></div>
    </div>
  );

  // Shimmer loading component for table rows
  const TableRowShimmer = () => (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-gray-200 rounded-full shimmer"></div>
          <div className="ml-4">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2 shimmer"></div>
            <div className="h-3 bg-gray-200 rounded w-32 shimmer"></div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-16 shimmer"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-12 shimmer"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-20 shimmer"></div>
      </td>
    </tr>
  );

  // Chart colors
  const COLORS = ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'];

  // Prepare data for charts
  const prepareChartData = () => {
    if (!dashboardData) return {};

    // Transaction methods data for bar chart
    const methodsData = dashboardData.charts.transactionMethodChart.data.map(method => ({
      name: method.name.replace('_', ' ').toUpperCase(),
      deposits: method.deposits,
      withdrawals: method.withdrawals,
      total: method.total
    }));

    // Transaction status data for pie chart
    const statusData = dashboardData.charts.transactionStatusChart.data.map(status => ({
      name: status.name.charAt(0).toUpperCase() + status.name.slice(1),
      value: status.value
    }));

    // Daily volume data for line chart
    const dailyVolumeData = dashboardData.charts.dailyVolumeChart.labels.map((label, index) => ({
      date: new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: dashboardData.charts.dailyVolumeChart.data[index]
    }));

    return { methodsData, statusData, dailyVolumeData };
  };

  const { methodsData, statusData, dailyVolumeData } = prepareChartData();

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-900 text-white p-2 rounded-md shadow-lg"
        onClick={toggleSidebar}
      >
        {sidebarOpen && !isLargeScreen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
          } transition-all duration-300 ease-in-out fixed md:relative z-40 md:z-auto w-64`}
      >
        <Sidebar />
      </div>

      {/* Backdrop Overlay for Mobile */}
      {sidebarOpen && !isLargeScreen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}

      <div className="bg-gray-50 w-full font-sans overflow-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 py-4 px-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-blue-900">Wallet Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Monitor and analyze wallet transactions and balances</p>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="text-green-500" size={24} />
              <span className="text-sm text-gray-500">Live Data</span>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Dashboard Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
          {isLoading ? (
            <>
              <StatCardShimmer />
              <StatCardShimmer />
              <StatCardShimmer />
              <StatCardShimmer />
            </>
          ) : dashboardData && (
            <>
              {/* Total Wallets */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 text-sm font-medium">Total Wallets</h3>
                  <Users className="text-blue-900" size={24} />
                </div>
                <p className="text-3xl font-bold text-blue-900 mb-2">
                  {dashboardData.summary.totalWallets}
                </p>
                <p className="text-sm text-gray-500">Active user wallets</p>
              </div>

              {/* Total Balance */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 text-sm font-medium">Total Balance</h3>
                  <Wallet className="text-green-600" size={24} />
                </div>
                <p className="text-3xl font-bold text-green-600 mb-2">
                  {formatCurrency(dashboardData.summary.totalBalance)}
                </p>
                <p className="text-sm text-gray-500">Combined wallet balance</p>
              </div>

              {/* Total Deposits */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 text-sm font-medium">Total Deposits</h3>
                  <TrendingUp className="text-emerald-600" size={24} />
                </div>
                <p className="text-3xl font-bold text-emerald-600 mb-2">
                  {formatCurrency(dashboardData.summary.totalDeposits)}
                </p>
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 mr-2">Count:</span>
                  <span className="font-semibold text-emerald-600">{dashboardData.summary.depositCount}</span>
                </div>
              </div>

              {/* Total Withdrawals */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 text-sm font-medium">Total Withdrawals</h3>
                  <TrendingDown className="text-red-600" size={24} />
                </div>
                <p className="text-3xl font-bold text-red-600 mb-2">
                  {formatCurrency(dashboardData.summary.totalWithdrawals)}
                </p>
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 mr-2">Count:</span>
                  <span className="font-semibold text-red-600">{dashboardData.summary.withdrawalCount}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Additional Stats Row */}
        {!isLoading && dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 mb-6">
            {/* Net Flow */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 text-sm font-medium">Net Flow</h3>
                <DollarSign className={`${dashboardData.summary.netFlow >= 0 ? 'text-blue-600' : 'text-orange-600'}`} size={24} />
              </div>
              <p className={`text-3xl font-bold mb-2 ${dashboardData.summary.netFlow >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {formatCurrency(dashboardData.summary.netFlow)}
              </p>
              <p className="text-sm text-gray-500">Deposits - Withdrawals</p>
            </div>

            {/* Average Deposit */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 text-sm font-medium">Avg Deposit</h3>
                <TrendingUp className="text-emerald-500" size={24} />
              </div>
              <p className="text-3xl font-bold text-emerald-500 mb-2">
                {formatCurrency(dashboardData.summary.averageDeposit)}
              </p>
              <p className="text-sm text-gray-500">Per transaction</p>
            </div>

            {/* Average Withdrawal */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 text-sm font-medium">Avg Withdrawal</h3>
                <TrendingDown className="text-red-500" size={24} />
              </div>
              <p className="text-3xl font-bold text-red-500 mb-2">
                {formatCurrency(dashboardData.summary.averageWithdrawal)}
              </p>
              <p className="text-sm text-gray-500">Per transaction</p>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 mb-6">
          {isLoading ? (
            <>
              <ChartShimmer />
              <ChartShimmer />
            </>
          ) : dashboardData && (
            <>
              {/* Transaction Methods Bar Chart */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-xl font-bold text-blue-900 mb-4">Transactions by Payment Method</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={methodsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value), '']} />
                    <Legend />
                    <Bar dataKey="deposits" fill="#10b981" name="Deposits" />
                    <Bar dataKey="withdrawals" fill="#ef4444" name="Withdrawals" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Transaction Status Pie Chart */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-xl font-bold text-blue-900 mb-4">Transaction Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, value}) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>

        {/* Daily Volume Chart */}
        {!isLoading && dashboardData && dailyVolumeData && dailyVolumeData.length > 0 && (
          <div className="px-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-bold text-blue-900 mb-4">Daily Transaction Volume</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Volume']} />
                  <Line type="monotone" dataKey="volume" stroke="#1e3a8a" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Top Students Section */}
        <div className="px-6 mb-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-blue-900">Top Students by Balance</h3>
              <p className="text-gray-600 text-sm mt-1">Students with highest wallet balances</p>
            </div>
            
            {isLoading ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[...Array(5)].map((_, index) => (
                      <TableRowShimmer key={index} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : dashboardData && dashboardData.topStudents.byBalance.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <Wallet size={48} className="mx-auto mb-4 text-gray-400" />
                <p>No wallet data available</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashboardData.topStudents.byBalance.map((student, index) => (
                      <tr key={student.student._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                        
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {student.student.firstName} {student.student.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{student.student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-blue-900">
                            {formatCurrency(student.balance)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {student.student.level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.currency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Shimmer CSS */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -468px 0;
          }
          100% {
            background-position: 468px 0;
          }
        }
        
        .shimmer {
          animation-duration: 1.5s;
          animation-fill-mode: forwards;
          animation-iteration-count: infinite;
          animation-name: shimmer;
          animation-timing-function: linear;
          background: #f6f7f8;
          background: linear-gradient(to right, #eeeeee 8%, #dddddd 18%, #eeeeee 33%);
          background-size: 800px 104px;
          position: relative;
        }
      `}</style>
    </div>
  );
}

export default Resourcewalle;