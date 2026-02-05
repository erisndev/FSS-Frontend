import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Award,
  CheckCircle,
} from "lucide-react";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import { tenderApi, applicationApi } from "../../services/api";

const monthsBack = 6;

// Helper: relative time string
function timeAgo(date) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mon = Math.floor(day / 30);
  if (mon < 12) return `${mon}mo ago`;
  const yr = Math.floor(mon / 12);
  return `${yr}y ago`;
}

// Helper: percentage change label
function pctChange(curr, prev) {
  if (!isFinite(prev) || prev === 0) return curr === 0 ? "0%" : "—";
  const pct = ((curr - prev) / prev) * 100;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(0)}%`;
}

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    totalTenders: 0,
    activeTenders: 0,
    totalApplications: 0,
    acceptedApplications: 0,
    averageApplicationsPerTender: 0,
    totalBudget: 0,
    completionRate: 0,
  });

  const [chartData, setChartData] = useState([]); // [{ month, tenders, applications, accepted, budget }]
  const [changes, setChanges] = useState({
    tenders: "—",
    active: "—",
    applications: "—",
    accepted: "—",
    avgPerTender: "—",
    budget: "—",
  });
  const [activity, setActivity] = useState([]); // recent activity list
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // 1) Fetch issuer tenders
      const tenders = await tenderApi.getMyTenders();

      // 2) Fetch all applications per tender in parallel
      const tenderApps = await Promise.all(
        (tenders || []).map(async (t) => {
          const id = t._id || t.id;
          if (!id) return { tender: t, apps: [] };
          try {
            const apps = await applicationApi.getTenderApplications(id);
            return { tender: t, apps: apps || [] };
          } catch (e) {
            console.error(`Error fetching applications for tender ${id}:`, e);
            return { tender: t, apps: [] };
          }
        })
      );

      const allApplications = tenderApps.flatMap(({ tender, apps }) =>
        (apps || []).map((a) => ({
          ...a,
          tenderId: tender._id || tender.id,
          tenderTitle: tender.title,
        }))
      );

      // 3) Totals
      const totalApplications = allApplications.length;
      const acceptedApplications = allApplications.filter(
        (a) => (a.status || "").toLowerCase() === "accepted"
      ).length;
      const totalBudget = (tenders || []).reduce(
        (sum, t) => sum + (Number(t.budgetMin) || 0),
        0
      );
      const totalTenders = (tenders || []).length;
      const activeTenders = (tenders || []).filter(
        (t) => (t.status || "").toLowerCase() === "active"
      ).length;

      const averageApplicationsPerTender = totalTenders
        ? Number((totalApplications / totalTenders).toFixed(1))
        : 0;
      const completionRate = totalApplications
        ? Number(((acceptedApplications / totalApplications) * 100).toFixed(1))
        : 0;

      setAnalytics({
        totalTenders,
        activeTenders,
        totalApplications,
        acceptedApplications,
        averageApplicationsPerTender,
        totalBudget,
        completionRate,
      });

      // 4) Monthly series for last 6 months
      const now = new Date();
      const buckets = Array.from({ length: monthsBack }, (_, idx) => {
        const d = new Date(
          now.getFullYear(),
          now.getMonth() - (monthsBack - 1 - idx),
          1
        );
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        const label = d.toLocaleString(undefined, { month: "short" });
        return { start, end, label };
      });

      const inBucket = (date, start, end) => {
        if (!date) return false;
        const dt = new Date(date);
        return dt >= start && dt < end;
      };

      const monthly = buckets.map((b) => {
        const tendersIn = (tenders || []).filter((t) =>
          inBucket(t.createdAt, b.start, b.end)
        );
        const appsIn = allApplications.filter((a) =>
          inBucket(a.createdAt, b.start, b.end)
        );
        const acceptedIn = appsIn.filter(
          (a) => (a.status || "").toLowerCase() === "accepted"
        );
        const budgetIn = tendersIn.reduce(
          (sum, t) => sum + (Number(t.budgetMin) || 0),
          0
        );
        return {
          month: b.label,
          tenders: tendersIn.length,
          applications: appsIn.length,
          accepted: acceptedIn.length,
          budget: budgetIn,
        };
      });

      setChartData(monthly);

      const last = monthly[monthly.length - 1] || {
        tenders: 0,
        applications: 0,
        accepted: 0,
        budget: 0,
      };
      const prev = monthly[monthly.length - 2] || {
        tenders: 0,
        applications: 0,
        accepted: 0,
        budget: 0,
      };

      setChanges({
        tenders: pctChange(last.tenders, prev.tenders),
        active: "—", // No monthly history for active status
        applications: pctChange(last.applications, prev.applications),
        accepted: pctChange(last.accepted, prev.accepted),
        avgPerTender: pctChange(
          last.tenders ? last.applications / Math.max(1, last.tenders) : 0,
          prev.tenders ? prev.applications / Math.max(1, prev.tenders) : 0
        ),
        budget: pctChange(last.budget, prev.budget),
      });

      // 5) Recent activity from real events
      const events = [];
      (tenders || []).forEach((t) => {
        if (t.createdAt) {
          events.push({
            icon: FileText,
            action: "New tender published",
            tender: t.title,
            time: new Date(t.createdAt),
          });
        }
      });

      allApplications.forEach((a) => {
        if (a.createdAt) {
          events.push({
            icon: Users,
            action: "New application received",
            tender: a.tenderTitle,
            time: new Date(a.createdAt),
          });
        }
        if ((a.status || "").toLowerCase() === "accepted") {
          const ts = a.updatedAt || a.createdAt;
          if (ts) {
            events.push({
              icon: CheckCircle,
              action: "Application accepted",
              tender: a.tenderTitle,
              time: new Date(ts),
            });
          }
        }
      });

      events.sort((a, b) => b.time - a.time);
      setActivity(events.slice(0, 8));
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const maxTenders = useMemo(
    () => Math.max(1, ...chartData.map((d) => d.tenders || 0)),
    [chartData]
  );
  const maxApplications = useMemo(
    () => Math.max(1, ...chartData.map((d) => d.applications || 0)),
    [chartData]
  );

  const statCards = [
    {
      title: "Total Tenders",
      value: analytics.totalTenders,
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
      change: changes.tenders,
    },
    {
      title: "Active Tenders",
      value: analytics.activeTenders,
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
      change: changes.active,
    },
    {
      title: "Total Applications",
      value: analytics.totalApplications,
      icon: Users,
      color: "from-purple-500 to-pink-500",
      change: changes.applications,
    },
    {
      title: "Accepted Applications",
      value: analytics.acceptedApplications,
      icon: CheckCircle,
      color: "from-emerald-500 to-teal-500",
      change: changes.accepted,
    },
    {
      title: "Avg Applications/Tender",
      value: analytics.averageApplicationsPerTender,
      icon: BarChart3,
      color: "from-yellow-500 to-orange-500",
      change: changes.avgPerTender,
    },
    {
      title: "Total Budget",
      value: `R${Number(analytics.totalBudget || 0).toLocaleString()}`,
      icon: Award,
      color: "from-red-500 to-pink-500",
      change: changes.budget,
    },
  ];

  if (loading) {
    return (
      <DashboardLayout
        title="Analytics"
        subtitle="Insights and performance metrics"
      >
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Analytics"
      subtitle="Insights and performance metrics"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tender Performance Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-6">
              Tender Performance
            </h3>
            <div className="space-y-4">
              {chartData.map((data, index) => (
                <div
                  key={`${data.month}-${index}`}
                  className="flex items-center justify-between"
                >
                  <span className="text-gray-300 w-12">{data.month}</span>
                  <div className="flex-1 mx-4">
                    <div className="bg-slate-800/50 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${((data.tenders || 0) / maxTenders) * 100}%`,
                        }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full"
                      />
                    </div>
                  </div>
                  <span className="text-cyan-400 w-8 text-right">
                    {data.tenders}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Application Trends */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-6">
              Application Trends
            </h3>
            <div className="space-y-4">
              {chartData.map((data, index) => (
                <div
                  key={`${data.month}-${index}`}
                  className="flex items-center justify-between"
                >
                  <span className="text-gray-300 w-12">{data.month}</span>
                  <div className="flex-1 mx-4">
                    <div className="bg-slate-800/50 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${
                            ((data.applications || 0) / maxApplications) * 100
                          }%`,
                        }}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                      />
                    </div>
                  </div>
                  <span className="text-emerald-400 w-8 text-right">
                    {data.applications}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-6">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {activity.length === 0 ? (
              <div className="text-center text-gray-400">
                No recent activity
              </div>
            ) : (
              activity.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 bg-slate-800/30 rounded-lg"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{item.action}</p>
                    <p className="text-gray-400 text-sm">{item.tender}</p>
                  </div>
                  <span className="text-gray-500 text-sm">
                    {timeAgo(item.time)}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
