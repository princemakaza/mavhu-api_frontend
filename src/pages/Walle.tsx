import Sidebar from "@/components/Sidebar";
import {
  Loader2,
  Menu,
  X,
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  DollarSign,
  Activity,
  Filter,
  ChevronRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import AdminService from "@/services/Admin_Service/admin_service";
import TopicInSubjectService from "@/services/Admin_Service/Topic_InSubject_service";

type WalletRecord = {
  _id: string;
  student: null | {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    level?: string;
  };
  balance: number;
  currency: string;
  deposits: Array<{
    amount: number;
    type: "deposit";
    method: string;
    reference?: string;
    status?: string;
    date: string;
    description?: string;
  }>;
  withdrawals: Array<{
    amount: number;
    type: "withdrawal";
    method: string;
    reference?: string; // e.g., "TOPIC-<topicId>-<ts>"
    status?: string;
    date: string;
    description?: string;
  }>;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
};

type DashboardPayload = {
  summary: {
    totalWallets: number;
    totalBalance: number;
    totalDeposits: number;
    depositCount: number;
    totalWithdrawals: number;
    withdrawalCount: number;
    netFlow: number;
    averageDeposit: number;
    averageWithdrawal: number;
  };
  charts: {
    transactionMethodChart: { data: Array<{ name: string; deposits: number; withdrawals: number; total: number }> };
    transactionStatusChart: { data: Array<{ name: string; value: number }> };
    dailyVolumeChart: { labels: string[]; data: number[] };
  };
  topStudents: { byBalance: Array<{ student: WalletRecord["student"]; balance: number; currency: string }> };
  allWallets: WalletRecord[];
};

const COLORS = ["#1e3a8a", "#3b82f6", "#60a5fa", "#93c5fd", "#dbeafe"];
const PAID_STATUSES = new Set(["paid", "completed", "success"]);
const DATE_FMT: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function displayName(s: WalletRecord["student"]) {
  if (!s) return "Unknown Student";
  const parts = [s.firstName?.trim(), s.lastName?.trim()].filter(Boolean);
  return parts.length ? parts.join(" ") : "Unknown Student";
}

function parseTopicIdFromReference(ref?: string): string | null {
  if (!ref) return null;
  // Expecting "TOPIC-<topicId>-<...>"
  const match = ref.match(/^TOPIC-([^-]+)-/i);
  return match?.[1] ?? null;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function inRange(d: Date, from?: Date | null, to?: Date | null) {
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

type RangeKind = "daily" | "weekly" | "monthly" | "custom";

function getPresetRange(kind: RangeKind): { from: Date; to: Date } {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (kind === "daily") {
    // today
    return { from: start, to: end };
  }
  if (kind === "weekly") {
    // last 7 days inclusive
    const s = new Date(start);
    s.setDate(s.getDate() - 6);
    return { from: s, to: end };
  }
  if (kind === "monthly") {
    // last 30 days inclusive
    const s = new Date(start);
    s.setDate(s.getDate() - 29);
    return { from: s, to: end };
  }
  return { from: start, to: end };
}

function Resourcewalle() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  const [dashboardData, setDashboardData] = useState<DashboardPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [rangeKind, setRangeKind] = useState<RangeKind>("monthly");
  const [{ fromDate, toDate }, setDateRange] = useState<{ fromDate: string; toDate: string }>(() => {
    const { from, to } = getPresetRange("monthly");
    return { fromDate: from.toISOString().slice(0, 10), toDate: to.toISOString().slice(0, 10) };
  });

  // Topic cache: topicId -> {title, subjectName}
  const [topicCache, setTopicCache] = useState<Record<string, { title?: string; subjectName?: string }>>({});

  // Student Drawer
  const [selectedWallet, setSelectedWallet] = useState<WalletRecord | null>(null);

  const toggleSidebar = () => setSidebarOpen((s) => !s);

  useEffect(() => {
    const check = () => {
      const large = window.innerWidth >= 768;
      setIsLargeScreen(large);
      setSidebarOpen(large);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const response = await AdminService.getWalletDashboard();
        const d = response?.data ?? {};

        const normalized: DashboardPayload = {
          summary: {
            totalWallets: d?.summary?.totalWallets ?? 0,
            totalBalance: d?.summary?.totalBalance ?? 0,
            totalDeposits: d?.summary?.totalDeposits ?? 0,
            depositCount: d?.summary?.depositCount ?? 0,
            totalWithdrawals: d?.summary?.totalWithdrawals ?? 0,
            withdrawalCount: d?.summary?.withdrawalCount ?? 0,
            netFlow: d?.summary?.netFlow ?? 0,
            averageDeposit: d?.summary?.averageDeposit ?? 0,
            averageWithdrawal: d?.summary?.averageWithdrawal ?? 0,
          },
          charts: {
            transactionMethodChart: {
              data: Array.isArray(d?.charts?.transactionMethodChart?.data)
                ? d.charts.transactionMethodChart.data
                : [],
            },
            transactionStatusChart: {
              data: Array.isArray(d?.charts?.transactionStatusChart?.data)
                ? d.charts.transactionStatusChart.data
                : [],
            },
            dailyVolumeChart: {
              labels: Array.isArray(d?.charts?.dailyVolumeChart?.labels)
                ? d.charts.dailyVolumeChart.labels
                : [],
              data: Array.isArray(d?.charts?.dailyVolumeChart?.data)
                ? d.charts.dailyVolumeChart.data
                : [],
            },
          },
          topStudents: {
            byBalance: Array.isArray(d?.topStudents?.byBalance) ? d.topStudents.byBalance : [],
          },
          allWallets: Array.isArray(d?.allWallets) ? d.allWallets : [],
        };

        setDashboardData(normalized);

        // Warm topic cache for any topic references we already see
        const topicIds = new Set<string>();
        for (const w of normalized.allWallets) {
          for (const wd of w.withdrawals ?? []) {
            const id = parseTopicIdFromReference(wd.reference ?? "");
            if (id) topicIds.add(id);
          }
        }
        if (topicIds.size) {
          // Fire and forget; cache as it comes in
          Array.from(topicIds).forEach(async (id) => {
            if (topicCache[id]) return;
            try {
              const resp = await TopicInSubjectService.getTopicById(id);
              const title = resp?.data?.title;
              const subjectName = resp?.data?.subject.subjectName;
              setTopicCache((prev) => ({ ...prev, [id]: { title, subjectName } }));
            } catch {
              setTopicCache((prev) => ({ ...prev, [id]: prev?.[id] ?? {} }));
            }
          });
        }

        setError(null);
      } catch (e) {
        console.error("Error fetching wallet data:", e);
        setError("Failed to load wallet data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []); // mount

  // Apply date range filter to transactions for charts + stats
  const { from, to } = useMemo(() => {
    const f = fromDate ? new Date(fromDate + "T00:00:00") : null;
    const t = toDate ? new Date(toDate + "T23:59:59") : null;
    return { from: f, to: t };
  }, [fromDate, toDate]);

  const filtered = useMemo(() => {
    if (!dashboardData) return null;
    const inWindow = (iso: string) => {
      const d = new Date(iso);
      return inRange(d, from, to);
    };

    // Build filtered daily volume (labels may not be sorted)
    const dailyPairs =
      dashboardData.charts.dailyVolumeChart.labels.map((label, i) => ({
        date: label,
        value: Number(dashboardData.charts.dailyVolumeChart.data[i] ?? 0),
      })) ?? [];

    const dailyFiltered = dailyPairs
      .filter((p) => inWindow(p.date))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((p) => ({
        date: new Date(p.date).toLocaleDateString("en-US", DATE_FMT),
        volume: p.value,
      }));

    // Methods and statuses can pass through (they're totals); optional: recompute from raw txs in window
    const methodsAgg: Record<string, { deposits: number; withdrawals: number; total: number }> = {};
    const statusAgg: Record<string, number> = {};

    // Recompute from raw txs within date range for accuracy
    for (const w of dashboardData.allWallets) {
      for (const d of w.deposits ?? []) {
        if (!inWindow(d.date)) continue;
        const m = d.method || "other";
        methodsAgg[m] ??= { deposits: 0, withdrawals: 0, total: 0 };
        methodsAgg[m].deposits += Number(d.amount || 0);
        methodsAgg[m].total += Number(d.amount || 0);
        const st = (d.status || "unknown").toLowerCase();
        statusAgg[st] = (statusAgg[st] || 0) + 1;
      }
      for (const wd of w.withdrawals ?? []) {
        if (!inWindow(wd.date)) continue;
        const m = wd.method || "other";
        methodsAgg[m] ??= { deposits: 0, withdrawals: 0, total: 0 };
        methodsAgg[m].withdrawals += Number(wd.amount || 0);
        methodsAgg[m].total += Number(wd.amount || 0);
        const st = (wd.status || "unknown").toLowerCase();
        statusAgg[st] = (statusAgg[st] || 0) + 1;
      }
    }

    const methodsData = Object.entries(methodsAgg).map(([name, v]) => ({
      name: name.replace("_", " ").toUpperCase(),
      deposits: v.deposits,
      withdrawals: v.withdrawals,
      total: v.total,
    }));

    const statusData = Object.entries(statusAgg).map(([name, count]) => ({
      name: name.replace(/^./, (c) => c.toUpperCase()),
      value: count,
    }));

    return {
      dailyVolumeData: dailyFiltered,
      methodsData,
      statusData,
    };
  }, [dashboardData, from, to]);

  // Money in System: sum of deposits with status in PAID_STATUSES (from allWallets)
  const moneyInSystem = useMemo(() => {
    if (!dashboardData) return 0;
    let sum = 0;
    for (const w of dashboardData.allWallets) {
      for (const d of w.deposits ?? []) {
        const st = (d.status || "").toLowerCase();
        if (PAID_STATUSES.has(st)) sum += Number(d.amount || 0);
      }
    }
    return sum;
  }, [dashboardData]);

  // Leaderboards / statistics in current window
  const stats = useMemo(() => {
    if (!dashboardData) return null;
    const perStudentDeposits: Record<string, number> = {};
    const perStudentWithdrawals: Record<string, number> = {};
    const perTopicWithdrawals: Record<
      string,
      { amount: number; count: number }
    > = {};

    const inWindow = (iso: string) => inRange(new Date(iso), from, to);

    for (const w of dashboardData.allWallets) {
      const sid = w.student?._id || `wallet:${w._id}`;
      // deposits
      for (const d of w.deposits ?? []) {
        if (!inWindow(d.date)) continue;
        perStudentDeposits[sid] = (perStudentDeposits[sid] || 0) + Number(d.amount || 0);
      }
      // withdrawals (+ topic agg)
      for (const wd of w.withdrawals ?? []) {
        if (!inWindow(wd.date)) continue;
        perStudentWithdrawals[sid] = (perStudentWithdrawals[sid] || 0) + Number(wd.amount || 0);

        const topicId = parseTopicIdFromReference(wd.reference || "");
        if (topicId) {
          perTopicWithdrawals[topicId] ??= { amount: 0, count: 0 };
          perTopicWithdrawals[topicId].amount += Number(wd.amount || 0);
          perTopicWithdrawals[topicId].count += 1;
        }
      }
    }

    const topStudentsByWithdrawal = Object.entries(perStudentWithdrawals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([sid, amt]) => {
        const w = dashboardData.allWallets.find((x) => (x.student?._id || `wallet:${x._id}`) === sid);
        return { student: w?.student, amount: amt };
      });

    const topStudentsByDeposit = Object.entries(perStudentDeposits)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([sid, amt]) => {
        const w = dashboardData.allWallets.find((x) => (x.student?._id || `wallet:${x._id}`) === sid);
        return { student: w?.student, amount: amt };
      });

    const topTopicsByWithdrawals = Object.entries(perTopicWithdrawals)
      .sort((a, b) => b[1].amount - a[1].amount)
      .slice(0, 5)
      .map(([topicId, v]) => ({
        topicId,
        amount: v.amount,
        count: v.count,
        meta: topicCache[topicId],
      }));

    return { topStudentsByWithdrawal, topStudentsByDeposit, topTopicsByWithdrawals };
  }, [dashboardData, from, to, topicCache]);

  // UI helpers
  const StatCardShimmer = () => (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3.5 bg-gray-200 rounded w-1/3 shimmer"></div>
        <div className="h-7 w-7 bg-gray-200 rounded shimmer"></div>
      </div>
      <div className="h-7 bg-gray-200 rounded w-2/3 mb-2 shimmer"></div>
      <div className="h-2.5 bg-gray-200 rounded w-1/2 shimmer"></div>
    </div>
  );

  const ChartShimmer = () => (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
      <div className="h-5 bg-gray-200 rounded w-1/3 mb-3 shimmer"></div>
      <div className="h-64 bg-gray-200 rounded shimmer"></div>
    </div>
  );

  // Range kind change
  const applyPreset = (kind: RangeKind) => {
    setRangeKind(kind);
    const { from, to } = getPresetRange(kind);
    setDateRange({
      fromDate: from.toISOString().slice(0, 10),
      toDate: to.toISOString().slice(0, 10),
    });
  };

  // When opening student drawer, ensure relevant topics are cached
  const openStudent = async (w: WalletRecord) => {
    setSelectedWallet(w);
    const ids = new Set<string>();
    for (const wd of w.withdrawals ?? []) {
      const id = parseTopicIdFromReference(wd.reference || "");
      if (id && !topicCache[id]) ids.add(id);
    }
    for (const id of ids) {
      try {
        const resp = await TopicInSubjectService.getTopicById(id);
        const title = resp?.data?.title;
        const subjectName = resp?.data?.subjectName;
        setTopicCache((prev) => ({ ...prev, [id]: { title, subjectName } }));
      } catch {
        // swallow
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-900 text-white p-2 rounded-md shadow-lg"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen && !isLargeScreen ? <X size={18} /> : <Menu size={18} />}
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
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30" onClick={toggleSidebar} />
      )}

      <div className="bg-gray-50 w-full font-sans overflow-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 py-3.5 px-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-blue-900">Wallet Analytics Dashboard</h1>
              <p className="text-gray-600 text-xs mt-1">Monitor and analyze wallet transactions and balances</p>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="text-green-500" size={18} />
              <span className="text-xs text-gray-500">Live Data</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 pt-4">
          <div className="bg-white border border-gray-200 rounded-lg p-3.5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-blue-900" />
                <span className="text-sm text-gray-700 font-medium">Time Range</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => applyPreset("daily")}
                  className={`px-2.5 py-1.5 rounded-md text-xs border ${rangeKind === "daily" ? "bg-blue-900 text-white border-blue-900" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => applyPreset("weekly")}
                  className={`px-2.5 py-1.5 rounded-md text-xs border ${rangeKind === "weekly" ? "bg-blue-900 text-white border-blue-900" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => applyPreset("monthly")}
                  className={`px-2.5 py-1.5 rounded-md text-xs border ${rangeKind === "monthly" ? "bg-blue-900 text-white border-blue-900" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  Monthly
                </button>

                <div className="h-5 w-px bg-gray-200" />

                <label className="text-xs text-gray-600">From</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setDateRange((r) => ({ ...r, fromDate: e.target.value }));
                    setRangeKind("custom");
                  }}
                  className="border border-gray-300 rounded-md px-2 py-1 text-xs"
                />
                <label className="text-xs text-gray-600">To</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setDateRange((r) => ({ ...r, toDate: e.target.value }));
                    setRangeKind("custom");
                  }}
                  className="border border-gray-300 rounded-md px-2 py-1 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mx-6 mt-3 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Dashboard Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 p-6">
          {isLoading ? (
            <>
              <StatCardShimmer />
              <StatCardShimmer />
              <StatCardShimmer />
              <StatCardShimmer />
              <StatCardShimmer />
            </>
          ) : dashboardData ? (
            <>
              {/* Total Wallets */}
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-gray-600 text-xs font-medium">Total Wallets</h3>
                  <Users className="text-blue-900" size={18} />
                </div>
                <p className="text-2xl font-bold text-blue-900 mb-1">
                  {dashboardData?.summary?.totalWallets ?? 0}
                </p>
                <p className="text-xs text-gray-500">Active user wallets</p>
              </div>

              {/* Total Balance */}
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-gray-600 text-xs font-medium">Total Balance</h3>
                  <Wallet className="text-green-600" size={18} />
                </div>
                <p className="text-2xl font-bold text-green-600 mb-1">
                  {formatCurrency(Number(dashboardData?.summary?.totalBalance ?? 0))}
                </p>
                <p className="text-xs text-gray-500">Combined wallet balance</p>
              </div>

              {/* Money in System (paid deposits) */}
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-gray-600 text-xs font-medium">Money in System</h3>
                  <DollarSign className="text-blue-700" size={18} />
                </div>
                <p className="text-2xl font-bold text-blue-700 mb-1">{formatCurrency(moneyInSystem)}</p>
                <p className="text-xs text-gray-500">Sum of paid/completed deposits</p>
              </div>

              {/* Total Deposits */}
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-gray-600 text-xs font-medium">Total Deposits</h3>
                  <TrendingUp className="text-emerald-600" size={18} />
                </div>
                <p className="text-2xl font-bold text-emerald-600 mb-1">
                  {formatCurrency(Number(dashboardData?.summary?.totalDeposits ?? 0))}
                </p>
                <div className="flex items-center text-xs">
                  <span className="text-gray-500 mr-1.5">Count:</span>
                  <span className="font-semibold text-emerald-600">
                    {dashboardData?.summary?.depositCount ?? 0}
                  </span>
                </div>
              </div>

              {/* Total Withdrawals */}
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-gray-600 text-xs font-medium">Total Withdrawals</h3>
                  <TrendingDown className="text-red-600" size={18} />
                </div>
                <p className="text-2xl font-bold text-red-600 mb-1">
                  {formatCurrency(Number(dashboardData?.summary?.totalWithdrawals ?? 0))}
                </p>
                <div className="flex items-center text-xs">
                  <span className="text-gray-500 mr-1.5">Count:</span>
                  <span className="font-semibold text-red-600">
                    {dashboardData?.summary?.withdrawalCount ?? 0}
                  </span>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Additional Stats Row */}
        {!isLoading && dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-6 mb-5">
            {/* Net Flow */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-gray-600 text-xs font-medium">Net Flow</h3>
                <DollarSign
                  className={`${(dashboardData.summary.netFlow ?? 0) >= 0 ? "text-blue-600" : "text-orange-600"}`}
                  size={18}
                />
              </div>
              <p
                className={`text-2xl font-bold mb-1 ${(dashboardData.summary.netFlow ?? 0) >= 0 ? "text-blue-600" : "text-orange-600"
                  }`}
              >
                {formatCurrency(Number(dashboardData.summary.netFlow ?? 0))}
              </p>
              <p className="text-xs text-gray-500">Deposits - Withdrawals</p>
            </div>

            {/* Average Deposit */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-gray-600 text-xs font-medium">Avg Deposit</h3>
                <TrendingUp className="text-emerald-500" size={18} />
              </div>
              <p className="text-2xl font-bold text-emerald-500 mb-1">
                {formatCurrency(Number(dashboardData?.summary?.averageDeposit ?? 0))}
              </p>
              <p className="text-xs text-gray-500">Per transaction</p>
            </div>

            {/* Average Withdrawal */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-gray-600 text-xs font-medium">Avg Withdrawal</h3>
                <TrendingDown className="text-red-500" size={18} />
              </div>
              <p className="text-2xl font-bold text-red-500 mb-1">
                {formatCurrency(Number(dashboardData?.summary?.averageWithdrawal ?? 0))}
              </p>
              <p className="text-xs text-gray-500">Per transaction</p>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 px-6 mb-5">
          {isLoading ? (
            <>
              <ChartShimmer />
              <ChartShimmer />
            </>
          ) : dashboardData ? (
            <>
              {/* Transactions by Payment Method */}
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Transactions by Payment Method</h3>
                {filtered?.methodsData?.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={filtered.methodsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value: any, n: any) => [formatCurrency(Number(value)), n]} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="deposits" fill="#10b981" name="Deposits" />
                      <Bar dataKey="withdrawals" fill="#ef4444" name="Withdrawals" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-gray-500">No method data in this range.</p>
                )}
              </div>

              {/* Transaction Status Distribution */}
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Transaction Status Distribution</h3>
                {filtered?.statusData?.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={filtered.statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }: any) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {filtered.statusData.map((_: any, idx: number) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-gray-500">No status data in this range.</p>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Daily Volume Chart */}
        {!isLoading && dashboardData && filtered?.dailyVolumeData && filtered.dailyVolumeData.length > 0 && (
          <div className="px-6 mb-5">
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Daily Transaction Volume</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={filtered.dailyVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: any) => [formatCurrency(Number(value)), "Volume"]} />
                  <Line type="monotone" dataKey="volume" stroke="#1e3a8a" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Statistics Section */}
        {!isLoading && stats && (
          <div className="px-6 mb-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Top Students by Withdrawals */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-5 py-3 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-blue-900">Top Students — Withdrawals</h3>
                <p className="text-gray-600 text-xs mt-0.5">Highest total withdrawals in range</p>
              </div>
              <ul className="divide-y divide-gray-100">
                {stats.topStudentsByWithdrawal.map(({ student, amount }, i) => (
                  <li key={(student?._id ?? i) + "-wd"} className="px-5 py-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{displayName(student)}</p>
                      <p className="text-xs text-gray-500 truncate">{student?.email ?? "—"}</p>
                    </div>
                    <span className="text-sm font-semibold text-red-600">{formatCurrency(amount)}</span>
                  </li>
                ))}
                {!stats.topStudentsByWithdrawal.length && (
                  <li className="px-5 py-5 text-xs text-gray-500">No data in this range.</li>
                )}
              </ul>
            </div>

            {/* Top Students by Deposits */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-5 py-3 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-blue-900">Top Students — Deposits</h3>
                <p className="text-gray-600 text-xs mt-0.5">Highest total deposits in range</p>
              </div>
              <ul className="divide-y divide-gray-100">
                {stats.topStudentsByDeposit.map(({ student, amount }, i) => (
                  <li key={(student?._id ?? i) + "-dp"} className="px-5 py-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{displayName(student)}</p>
                      <p className="text-xs text-gray-500 truncate">{student?.email ?? "—"}</p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600">{formatCurrency(amount)}</span>
                  </li>
                ))}
                {!stats.topStudentsByDeposit.length && (
                  <li className="px-5 py-5 text-xs text-gray-500">No data in this range.</li>
                )}
              </ul>
            </div>

            {/* Top Topics by Withdrawals */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-5 py-3 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-blue-900">Top Topics — Withdrawals</h3>
                <p className="text-gray-600 text-xs mt-0.5">Most purchased topics in range</p>
              </div>
              <ul className="divide-y divide-gray-100">
                {stats.topTopicsByWithdrawals.map(({ topicId, amount, count, meta }) => (
                  <li key={topicId} className="px-5 py-3">
                    <p className="text-sm font-medium text-gray-900">
                      {meta?.title ?? "Topic " + topicId}{" "}
                      <span className="text-xs text-gray-500">( {meta?.subjectName ?? "Subject —"} )</span>
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-gray-500">{count} withdrawals</span>
                      <span className="text-sm font-semibold text-blue-900">{formatCurrency(amount)}</span>
                    </div>
                  </li>
                ))}
                {!stats.topTopicsByWithdrawals.length && (
                  <li className="px-5 py-5 text-xs text-gray-500">No topic activity in this range.</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Top Students Section (by Balance) */}
        <div className="px-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-blue-900">Top Students by Balance</h3>
              <p className="text-gray-600 text-xs mt-0.5">Students with highest wallet balances</p>
            </div>

            {isLoading ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-5 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-5 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                        Level
                      </th>
                      <th className="px-5 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                        Currency
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-5 py-4">
                          <div className="h-10 w-10 bg-gray-200 rounded-full shimmer" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-4 bg-gray-200 rounded w-12 shimmer" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-4 bg-gray-200 rounded w-10 shimmer" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-4 bg-gray-200 rounded w-14 shimmer" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : !(dashboardData?.topStudents?.byBalance?.length) ? (
              <div className="text-center p-8 text-gray-500">
                <Wallet size={40} className="mx-auto mb-3 text-gray-400" />
                <p className="text-sm">No wallet data available</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-5 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-5 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                        Level
                      </th>
                      <th className="px-5 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                        Currency
                      </th>
                      <th className="px-5 py-2 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {(dashboardData?.topStudents?.byBalance ?? []).map((row: any, index: number) => {
                      const s = row?.student ?? null;
                      const fullName = displayName(s);
                      const email = s?.email ?? "—";
                      const level = s?.level ?? "—";
                      const balance = Number(row?.balance ?? 0);
                      const currency = row?.currency ?? "USD";
                      const wallet = dashboardData.allWallets.find(
                        (w) => w.student?._id && s?._id && w.student._id === s._id
                      );

                      return (
                        <tr key={s?._id ?? `student-${index}`} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{fullName}</div>
                              <div className="text-xs text-gray-500 truncate">{email}</div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <div className="text-sm font-semibold text-blue-900">{formatCurrency(balance)}</div>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className="inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full bg-blue-100 text-blue-800">
                              {level}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-sm text-gray-900">{currency}</td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-right">
                            <button
                              onClick={() => wallet && openStudent(wallet)}
                              disabled={!wallet}
                              className="inline-flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 disabled:text-gray-400"
                            >
                              View activity <ChevronRight size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[440px] bg-white shadow-2xl transform transition-transform duration-300 z-50
        ${selectedWallet ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-blue-900">Student Activity</h2>
            <p className="text-xs text-gray-600 -mt-0.5">
              {selectedWallet ? displayName(selectedWallet.student) : ""}
            </p>
          </div>
          <button
            onClick={() => setSelectedWallet(null)}
            className="p-1.5 rounded-md hover:bg-gray-100"
            aria-label="Close details"
          >
            <X size={16} />
          </button>
        </div>

        {selectedWallet ? (
          <div className="h-[calc(100%-49px)] overflow-y-auto">
            {/* Summary */}
            <div className="px-5 py-3 grid grid-cols-3 gap-3 border-b border-gray-100">
              <div className="bg-gray-50 rounded-md p-3 border border-gray-100">
                <p className="text-[11px] text-gray-500">Balance</p>
                <p className="text-sm font-semibold text-blue-900">
                  {formatCurrency(Number(selectedWallet.balance ?? 0))}
                </p>
              </div>
              <div className="bg-gray-50 rounded-md p-3 border border-gray-100">
                <p className="text-[11px] text-gray-500">Deposits</p>
                <p className="text-sm font-semibold text-emerald-600">
                  {formatCurrency(
                    selectedWallet.deposits?.reduce((a, b) => a + Number(b.amount || 0), 0) ?? 0
                  )}
                </p>
              </div>
              <div className="bg-gray-50 rounded-md p-3 border border-gray-100">
                <p className="text-[11px] text-gray-500">Withdrawals</p>
                <p className="text-sm font-semibold text-red-600">
                  {formatCurrency(
                    selectedWallet.withdrawals?.reduce((a, b) => a + Number(b.amount || 0), 0) ?? 0
                  )}
                </p>
              </div>
            </div>

            {/* Deposits */}
            <div className="px-5 py-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Deposits</h3>
              <div className="space-y-2">
                {(selectedWallet.deposits ?? []).length ? (
                  selectedWallet.deposits
                    .slice()
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((d, i) => (
                      <div key={i} className="border border-gray-200 rounded-md p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-emerald-700">
                            {formatCurrency(Number(d.amount || 0))}
                          </span>
                          <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                            {d.method?.toUpperCase() ?? "—"}
                          </span>
                        </div>
                        <div className="mt-1 text-[11px] text-gray-600 flex items-center justify-between">
                          <span>{new Date(d.date).toLocaleString()}</span>
                          <span className="capitalize">
                            {(d.status ?? "unknown").toString().toLowerCase()}
                          </span>
                        </div>
                        {d.description && <p className="text-xs text-gray-500 mt-1.5">{d.description}</p>}
                      </div>
                    ))
                ) : (
                  <p className="text-xs text-gray-500">No deposits.</p>
                )}
              </div>
            </div>

            {/* Withdrawals (with Topic title + Subject) */}
            <div className="px-5 pb-8">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Withdrawals</h3>
              <div className="space-y-2">
                {(selectedWallet.withdrawals ?? []).length ? (
                  selectedWallet.withdrawals
                    .slice()
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((wd, i) => {
                      const topicId = parseTopicIdFromReference(wd.reference || "");
                      const meta = topicId ? topicCache[topicId] : undefined;
                      return (
                        <div key={i} className="border border-gray-200 rounded-md p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-red-700">
                              {formatCurrency(Number(wd.amount || 0))}
                            </span>
                            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                              {wd.method?.toUpperCase() ?? "—"}
                            </span>
                          </div>
                          <div className="mt-1 text-[11px] text-gray-600 flex items-center justify-between">
                            <span>{new Date(wd.date).toLocaleString()}</span>
                            <span className="capitalize">
                              {(wd.status ?? "unknown").toString().toLowerCase()}
                            </span>
                          </div>
                          <div className="mt-1.5">
                            <p className="text-xs text-gray-900">
                              {meta?.title ? (
                                <>
                                  <span className="font-semibold">Topic:</span> {meta.title}
                                </>
                              ) : topicId ? (
                                <>
                                  <span className="font-semibold">Topic:</span> {topicId} <span className="text-gray-400">(loading…)</span>
                                </>
                              ) : (
                                <span className="text-gray-500">No topic reference</span>
                              )}
                            </p>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              <span className="font-medium text-gray-600">Subject:</span>{" "}
                              {meta?.subjectName ?? (topicId ? "Loading…" : "—")}
                            </p>
                          </div>
                          {wd.description && <p className="text-xs text-gray-500 mt-1.5">{wd.description}</p>}
                        </div>
                      );
                    })
                ) : (
                  <p className="text-xs text-gray-500">No withdrawals.</p>
                )}
              </div>
            </div>
          </div>
        ) : null}
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
