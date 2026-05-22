"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { getStats, getAssets } from "@/lib/api";
import { Stats, Asset } from "@/types";
import StatusBadge from "@/components/StatusBadge";

const PIE_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#ef4444",
];

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`bg-gray-800 border ${color} rounded-xl p-5`}>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-3xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Asset[]>([]);

  useEffect(() => {
    getStats().then(setStats).catch(() => {});
    getAssets({ limit: 5 }).then(r => setRecent(r.items)).catch(() => {});
  }, []);

  const barData = stats
    ? [
        { name: "Active", value: stats.active },
        { name: "Inactive", value: stats.inactive },
        { name: "Maintenance", value: stats.maintenance },
        { name: "Retired", value: stats.retired },
        { name: "Missing", value: stats.missing },
      ]
    : [];

  const pieData = stats
    ? Object.entries(stats.by_category)
        .sort(([, a], [, b]) => b - a)
        .map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">IT Asset Overview</p>
        </div>
        <Link
          href="/assets"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          + Add Asset
        </Link>
      </div>

      {/* Status Bar Chart */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl px-5 pt-4 pb-2 mb-4">
        <p className="text-gray-400 text-xs mb-1">Assets by Status</p>
        {stats ? (
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }}
                labelStyle={{ color: "#e5e7eb", fontSize: 12 }}
                itemStyle={{ color: "#a5b4fc", fontSize: 12 }}
                cursor={{ fill: "rgba(99,102,241,0.1)" }}
              />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-sm py-8 text-center">Loading...</p>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard label="Total" value={stats?.total ?? 0} color="border-gray-700" />
        <StatCard label="Active" value={stats?.active ?? 0} color="border-green-800" />
        <StatCard label="Inactive" value={stats?.inactive ?? 0} color="border-gray-700" />
        <StatCard label="Maintenance" value={stats?.maintenance ?? 0} color="border-yellow-800" />
        <StatCard label="Retired" value={stats?.retired ?? 0} color="border-red-900" />
        <StatCard label="Missing" value={stats?.missing ?? 0} color="border-orange-900" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart — By Category */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Assets by Category</h2>
          {stats && pieData.length > 0 ? (
            <PieChart width={320} height={240} className="mx-auto">
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }}
                labelStyle={{ color: "#e5e7eb", fontSize: 12 }}
                itemStyle={{ color: "#e5e7eb", fontSize: 12 }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span style={{ color: "#d1d5db", fontSize: 12 }}>{value}</span>
                )}
              />
            </PieChart>
          ) : (
            <p className="text-gray-500 text-sm">
              {stats ? "No category data." : "Loading..."}
            </p>
          )}
        </div>

        {/* Recent Assets */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Recent Assets</h2>
            <Link href="/assets" className="text-indigo-400 text-sm hover:text-indigo-300">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recent.map(a => (
              <Link
                key={a.id}
                href={`/assets/${a.id}`}
                className="flex items-center justify-between hover:bg-gray-700 rounded-lg p-2 transition-colors"
              >
                <div>
                  <p className="text-white text-sm font-medium">{a.name}</p>
                  <p className="text-gray-500 text-xs">
                    {a.asset_tag} · {a.category?.name ?? "—"}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </Link>
            ))}
            {recent.length === 0 && (
              <p className="text-gray-500 text-sm">No assets yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
