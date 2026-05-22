"use client";
import { useEffect, useState } from "react";
import { getLocations, createLocation, updateLocation, deleteLocation } from "@/lib/api";
import { Location } from "@/types";

const EMPTY = { building: "", room: "", floor: "", description: "" };

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    getLocations()
      .then(setLocations)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  function startCreate() {
    setEditing(null);
    setForm(EMPTY);
    setError("");
    setShowForm(true);
  }

  function startEdit(loc: Location) {
    setEditing(loc);
    setForm({
      building: loc.building,
      room: loc.room,
      floor: loc.floor ?? "",
      description: loc.description ?? "",
    });
    setError("");
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditing(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.building.trim() || !form.room.trim()) {
      setError("Building and Room are required");
      return;
    }
    setSaving(true);
    setError("");
    const payload = {
      building: form.building,
      room: form.room,
      floor: form.floor || undefined,
      description: form.description || undefined,
    };
    try {
      if (editing) {
        await updateLocation(editing.id, payload);
      } else {
        await createLocation(payload);
      }
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(loc: Location) {
    if (!window.confirm(`Delete location "${loc.building} / ${loc.room}"? Assets here will become unlocated.`)) return;
    try {
      await deleteLocation(loc.id);
      load();
    } catch {
      alert("Failed to delete location");
    }
  }

  const f = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Locations</h1>
        <button
          onClick={startCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + New Location
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">{editing ? "Edit Location" : "New Location"}</h2>
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
            {error && <p className="w-full text-red-400 text-sm">{error}</p>}
            {(["building", "room", "floor", "description"] as const).map((key) => (
              <div key={key} className={key === "description" ? "flex-1 min-w-60" : "flex-1 min-w-32"}>
                <label className="block text-xs text-gray-400 mb-1 capitalize">
                  {key}{key === "building" || key === "room" ? " *" : ""}
                </label>
                <input
                  value={form[key]}
                  onChange={f(key)}
                  className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                  placeholder={key === "building" ? "HQ" : key === "room" ? "Server Room" : key === "floor" ? "B1" : "Optional notes"}
                  required={key === "building" || key === "room"}
                />
              </div>
            ))}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
              >
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-left">
              <th className="px-4 py-3 text-gray-400 font-medium">Building</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Room</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Floor</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Description</th>
              <th className="px-4 py-3 text-gray-400 font-medium w-32 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="border-b border-gray-700">
                  {[1, 2, 3, 4, 5].map(j => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-700 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : locations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-500">No locations yet</td>
              </tr>
            ) : (
              locations.map(loc => (
                <tr key={loc.id} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{loc.building}</td>
                  <td className="px-4 py-3 text-gray-300">{loc.room}</td>
                  <td className="px-4 py-3 text-gray-400">{loc.floor ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-400 max-w-xs truncate">{loc.description ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => startEdit(loc)}
                      className="text-indigo-400 hover:text-indigo-300 text-xs mr-3 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(loc)}
                      className="text-red-400 hover:text-red-300 text-xs transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
