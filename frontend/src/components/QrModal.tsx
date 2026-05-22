"use client";
import { getAssetQrUrl } from "@/lib/api";

export default function QrModal({ assetId, assetTag, onClose }: {
  assetId: number;
  assetTag: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-white font-semibold text-lg">{assetTag}</h3>
        <img src={getAssetQrUrl(assetId)} alt={`QR ${assetTag}`} className="rounded-lg w-48 h-48" />
        <div className="flex gap-3">
          <a
            href={getAssetQrUrl(assetId)}
            download={`${assetTag}-qr.png`}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Download PNG
          </a>
          <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
