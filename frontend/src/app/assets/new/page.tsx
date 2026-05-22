"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AssetModal from "@/components/AssetModal";

export default function NewAssetPage() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="p-6">
        <Link href="/assets" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
          ← Back to Assets
        </Link>
      </div>
      <AssetModal
        onClose={() => router.push("/assets")}
        onSaved={() => router.push("/assets")}
      />
    </div>
  );
}
