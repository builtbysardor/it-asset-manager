"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getAssets, getCategories, exportCsvUrl } from "@/lib/api";
import { Asset, Category, AssetListResponse } from "@/types";
import StatusBadge from "@/components/StatusBadge";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "maintenance", label: "Maintenance" },
  { value: "retired", label: "Retired" },
  { value: "missing", label: "Missing" },
];

const LIMIT = 20;

function isWarrantyExpired(warrantyExpiry?: string): boolean {
  if (!warrantyExpiry) return false;
  return new Date(warrantyExpiry) < new Date();
}

function SkeletonRows() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <tr key={i} className="border-b border-gray-700">
          {[1, 2, 3, 4, 5, 6, 7].map((j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 bg-gray-700 rounded animate-pulse w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function AssetsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const categoryId = searchParams.get("category_id") ?? "";
  const page = Number(searchParams.get("page") ?? "1");

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      // Reset page when filters change (unless explicitly setting page)
      if (!("page" in updates)) params.delete("page");
      router.push(`/assets?${params.toString()}`);
    },
    [searchParams, router]
  );

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    getAssets({
      search: search || undefined,
      status: status || undefined,
      category_id: categoryId ? Number(categoryId) : undefined,
      page,
      limit: LIMIT,
    })
      .then((data: AssetListResponse) => {
        setAssets(data.items);
        setTotal(data.total);
      })
      .catch(() => {
        setAssets([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [search, status, categoryId, page]);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Assets</h1>
        <Link
          href="/assets/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + New Asset
        </Link>
      </div>

      {/* Filter panel */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <input
          type="text"
          placeholder="Search by name, tag, serial…"
          defaultValue={search}
          onChange={(e) => updateParams({ search: e.target.value })}
          className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
        />

        {/* Status dropdown */}
        <select
          value={status}
          onChange={(e) => updateParams({ status: e.target.value })}
          className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Category dropdown */}
        <select
          value={categoryId}
          onChange={(e) => updateParams({ category_id: e.target.value })}
          className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={String(cat.id)}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Export CSV */}
        <a
          href={exportCsvUrl()}
          className="ml-auto bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Export CSV
        </a>
      </div>

      {/* Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-left">
              <th className="px-4 py-3 text-gray-400 font-medium">Tag</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Name</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Category</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Location</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Assigned To</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Status</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Warranty</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows />
            ) : assets.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                  No assets found
                </td>
              </tr>
            ) : (
              assets.map((asset) => {
                const expired = isWarrantyExpired(asset.warranty_expiry);
                return (
                  <tr
                    key={asset.id}
                    className="border-b border-gray-700 hover:bg-gray-750 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/assets/${asset.id}`}
                        className="text-indigo-400 hover:text-indigo-300 font-mono text-xs"
                      >
                        {asset.asset_tag}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/assets/${asset.id}`}
                        className="text-white hover:text-indigo-300 font-medium"
                      >
                        {asset.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {asset.category?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {asset.location
                        ? `${asset.location.building} / ${asset.location.room}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {asset.assigned_to ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={asset.status} />
                    </td>
                    <td className="px-4 py-3">
                      {asset.warranty_expiry ? (
                        <span
                          className={
                            expired ? "text-red-400 font-medium" : "text-gray-300"
                          }
                        >
                          {new Date(asset.warranty_expiry).toLocaleDateString()}
                          {expired && (
                            <span className="ml-1 text-xs text-red-500">
                              (expired)
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && total > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>
            Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of{" "}
            {total} assets
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => updateParams({ page: String(page - 1) })}
              className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white"
            >
              ← Previous
            </button>
            <span className="px-3 py-1.5 text-gray-300">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => updateParams({ page: String(page + 1) })}
              className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
