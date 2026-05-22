"use client";
import { useState, useEffect } from "react";
import { Asset, Category, Location } from "@/types";
import { createAsset, updateAsset, getCategories, getLocations } from "@/lib/api";

interface Props {
  asset?: Asset;
  onClose: () => void;
  onSaved: () => void;
}

const STATUSES = ["active", "inactive", "maintenance", "retired", "missing"];

export default function AssetModal({ asset, onClose, onSaved }: Props) {
  const [form, setForm] = useState<Partial<Asset>>(asset ?? { status: "active" });
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
    getLocations().then(setLocations).catch(() => {});
  }, []);

  const set = (k: keyof Asset, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name?.trim()) { setError("Name is required"); return; }
    setSaving(true);
    try {
      if (asset) await updateAsset(asset.id, form);
      else await createAsset(form);
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <h2 className="text-white font-semibold">{asset ? "Edit Asset" : "Add New Asset"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <p className="text-red-400 text-sm bg-red-900/30 px-3 py-2 rounded">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Name *">
              <input value={form.name ?? ""} onChange={e => set("name", e.target.value)}
                className="input" placeholder="Dell XPS 15" required />
            </Field>
            <Field label="Status">
              <select value={form.status ?? "active"} onChange={e => set("status", e.target.value)} className="input">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Category">
              <select value={form.category_id ?? ""} onChange={e => set("category_id", e.target.value ? Number(e.target.value) : undefined)} className="input">
                <option value="">— Select —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </Field>
            <Field label="Location">
              <select value={form.location_id ?? ""} onChange={e => set("location_id", e.target.value ? Number(e.target.value) : undefined)} className="input">
                <option value="">— Select —</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.building} / {l.room}</option>)}
              </select>
            </Field>
            <Field label="Serial Number">
              <input value={form.serial_number ?? ""} onChange={e => set("serial_number", e.target.value)} className="input" />
            </Field>
            <Field label="Manufacturer">
              <input value={form.manufacturer ?? ""} onChange={e => set("manufacturer", e.target.value)} className="input" placeholder="Dell, HP, Cisco..." />
            </Field>
            <Field label="Model">
              <input value={form.model ?? ""} onChange={e => set("model", e.target.value)} className="input" />
            </Field>
            <Field label="Purchase Price (€)">
              <input type="number" step="0.01" value={form.purchase_price ?? ""} onChange={e => set("purchase_price", e.target.value ? Number(e.target.value) : undefined)} className="input" />
            </Field>
            <Field label="Purchase Date">
              <input type="date" value={form.purchase_date ?? ""} onChange={e => set("purchase_date", e.target.value)} className="input" />
            </Field>
            <Field label="Warranty Expiry">
              <input type="date" value={form.warranty_expiry ?? ""} onChange={e => set("warranty_expiry", e.target.value)} className="input" />
            </Field>
            <Field label="Assigned To">
              <input value={form.assigned_to ?? ""} onChange={e => set("assigned_to", e.target.value)} className="input" placeholder="Max Müller" />
            </Field>
            <Field label="Department">
              <input value={form.assigned_department ?? ""} onChange={e => set("assigned_department", e.target.value)} className="input" placeholder="IT, Sales..." />
            </Field>
            <Field label="IP Address">
              <input value={form.ip_address ?? ""} onChange={e => set("ip_address", e.target.value)} className="input" placeholder="192.168.1.100" />
            </Field>
            <Field label="MAC Address">
              <input value={form.mac_address ?? ""} onChange={e => set("mac_address", e.target.value)} className="input" placeholder="AA:BB:CC:DD:EE:FF" />
            </Field>
          </div>

          <Field label="Notes">
            <textarea value={form.notes ?? ""} onChange={e => set("notes", e.target.value)}
              className="input h-20 resize-none" placeholder="Additional information..." />
          </Field>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-600 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50">
              {saving ? "Saving..." : asset ? "Update" : "Create Asset"}
            </button>
          </div>
        </form>
      </div>
      <style jsx global>{`.input { width: 100%; background: #1f2937; border: 1px solid #374151; color: #f9fafb; padding: 0.5rem 0.75rem; border-radius: 0.5rem; font-size: 0.875rem; outline: none; } .input:focus { border-color: #6366f1; }`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      {children}
    </div>
  );
}
