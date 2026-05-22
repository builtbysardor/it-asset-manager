"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getAsset } from "@/lib/api";
import { Asset } from "@/types";
import AssetModal from "@/components/AssetModal";

export default function EditAssetPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getAsset(Number(id))
      .then(setAsset)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 space-y-4">
        <div className="h-5 w-32 bg-gray-700 rounded animate-pulse" />
        <div className="h-96 bg-gray-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (notFound || !asset) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-3">
        <p className="text-gray-400">Asset not found</p>
        <Link href="/assets" className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
          ← Back to Assets
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="p-6">
        <Link href={`/assets/${id}`} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
          ← Back to Asset
        </Link>
      </div>
      <AssetModal
        asset={asset}
        onClose={() => router.push(`/assets/${id}`)}
        onSaved={() => router.push(`/assets/${id}`)}
      />
    </div>
  );
}
