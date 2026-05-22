"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getAsset, getAssetHistory } from "@/lib/api";
import { Asset, AuditLog } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import QrModal from "@/components/QrModal";

function isWarrantyExpired(warrantyExpiry?: string): boolean {
  if (!warrantyExpiry) return false;
  return new Date(warrantyExpiry) < new Date();
}

function formatPrice(price?: number): string {
  if (price == null) return "—";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function actionBadgeClass(action: string): string {
  if (action === "created") return "bg-green-900 text-green-300";
  if (action === "retired") return "bg-red-900 text-red-300";
  return "bg-blue-900 text-blue-300";
}

function DetailField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-white text-sm">{value || "—"}</p>
    </div>
  );
}

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [history, setHistory] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (!id) return;
    const numId = Number(id);

    setLoading(true);
    Promise.all([
      getAsset(numId),
      getAssetHistory(numId).catch(() => [] as AuditLog[]),
    ])
      .then(([assetData, historyData]) => {
        setAsset(assetData);
        setHistory(historyData);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 space-y-5">
        {/* Header skeleton */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-16 bg-gray-700 rounded-lg animate-pulse" />
            <div className="h-9 w-24 bg-gray-700 rounded-lg animate-pulse" />
          </div>
        </div>
        {/* Cards skeleton */}
        <div className="grid grid-cols-2 gap-5">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-3"
            >
              <div className="h-5 w-32 bg-gray-700 rounded animate-pulse" />
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-4 w-full bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !asset) {
    return (
      <div className="p-6 flex flex-col items-center justify-center gap-4 text-center mt-20">
        <p className="text-gray-400 text-lg">Asset not found</p>
        <Link
          href="/assets"
          className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
        >
          ← Back to Assets
        </Link>
      </div>
    );
  }

  const expired = isWarrantyExpired(asset.warranty_expiry);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-white">{asset.name}</h1>
              <span className="text-sm text-gray-500 font-mono">{asset.asset_tag}</span>
              <StatusBadge status={asset.status} />
            </div>
            <Link
              href="/assets"
              className="text-gray-500 hover:text-gray-300 text-xs mt-1 inline-block transition-colors"
            >
              ← Back to Assets
            </Link>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => router.push(`/assets/${asset.id}/edit`)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => setShowQr(true)}
            className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            QR Code
          </button>
        </div>
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Asset Details */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-4">
          <h2 className="text-white font-semibold text-base">Asset Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <DetailField label="Manufacturer" value={asset.manufacturer} />
            <DetailField label="Model" value={asset.model} />
            <DetailField label="Serial Number" value={asset.serial_number} />
            <DetailField label="IP Address" value={asset.ip_address} />
            <DetailField label="MAC Address" value={asset.mac_address} />
            <DetailField
              label="Category"
              value={asset.category?.name}
            />
          </div>
        </div>

        {/* Assignment */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-4">
          <h2 className="text-white font-semibold text-base">Assignment</h2>
          <div className="grid grid-cols-2 gap-4">
            <DetailField label="Assigned To" value={asset.assigned_to} />
            <DetailField label="Department" value={asset.assigned_department} />
            <DetailField
              label="Building"
              value={asset.location?.building}
            />
            <DetailField label="Room" value={asset.location?.room} />
          </div>
        </div>
      </div>

      {/* Financial — full width */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-4">
        <h2 className="text-white font-semibold text-base">Financial</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <DetailField label="Purchase Date" value={formatDate(asset.purchase_date)} />
          <DetailField
            label="Purchase Price"
            value={formatPrice(asset.purchase_price)}
          />
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Warranty Expiry</p>
            <p className="text-white text-sm">
              {asset.warranty_expiry ? formatDate(asset.warranty_expiry) : "—"}
            </p>
            {expired && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-xs font-medium bg-red-900 text-red-300">
                ⚠ Warranty expired
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Audit History — full width */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-4">
        <h2 className="text-white font-semibold text-base">Audit History</h2>
        {history.length === 0 ? (
          <p className="text-gray-500 text-sm">No history records.</p>
        ) : (
          <ul className="divide-y divide-gray-700">
            {history.map((log) => (
              <li key={log.id} className="py-3 flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${actionBadgeClass(log.action)}`}
                    >
                      {log.action}
                    </span>
                    <span className="text-gray-400 text-xs">
                      by {log.performed_by}
                    </span>
                    {log.details && (
                      <span className="text-gray-500 text-xs truncate">
                        — {log.details}
                      </span>
                    )}
                  </div>
                </div>
                <time className="text-gray-500 text-xs shrink-0">
                  {new Date(log.created_at).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* QR Code Modal */}
      {showQr && (
        <QrModal
          assetId={asset.id}
          assetTag={asset.asset_tag}
          onClose={() => setShowQr(false)}
        />
      )}
    </div>
  );
}
