"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getStats, getAssets } from "@/lib/api";
import { Stats, Asset } from "@/types";
import StatusBadge from "@/components/StatusBadge";

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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">IT Asset Overview</p>
        </div>
        <Link href="/assets" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          + Add Asset
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard label="Total" value={stats?.total ?? 0} color="border-gray-700" />
        <StatCard label="Active" value={stats?.active ?? 0} color="border-green-800" />
        <StatCard label="Inactive" value={stats?.inactive ?? 0} color="border-gray-700" />
        <StatCard label="Maintenance" value={stats?.maintenance ?? 0} color="border-yellow-800" />
        <StatCard label="Retired" value={stats?.retired ?? 0} color="border-red-900" />
        <StatCard label="Missing" value={stats?.missing ?? 0} color="border-orange-900" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Category */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Assets by Category</h2>
          {stats ? (
            <div className="space-y-3">
              {Object.entries(stats.by_category)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, count]) => (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-gray-300 text-sm w-28 truncate">{cat}</span>
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-indigo-500 h-2 rounded-full"
                        style={{ width: `${Math.round((count / (stats.total || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-gray-400 text-sm w-6 text-right">{count}</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Loading...</p>
          )}
        </div>

        {/* Recent Assets */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Recent Assets</h2>
            <Link href="/assets" className="text-indigo-400 text-sm hover:text-indigo-300">View all →</Link>
          </div>
          <div className="space-y-3">
            {recent.map(a => (
              <Link key={a.id} href={`/assets/${a.id}`} className="flex items-center justify-between hover:bg-gray-700 rounded-lg p-2 transition-colors">
                <div>
                  <p className="text-white text-sm font-medium">{a.name}</p>
                  <p className="text-gray-500 text-xs">{a.asset_tag} · {a.category?.name ?? "—"}</p>
                </div>
                <StatusBadge status={a.status} />
              </Link>
            ))}
            {recent.length === 0 && <p className="text-gray-500 text-sm">No assets yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
