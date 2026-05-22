"use client";
import { useEffect, useState } from "react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/api";
import { Category } from "@/types";

const EMPTY = { name: "", icon: "💻", color: "#6366f1" };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    getCategories()
      .then(setCategories)
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

  function startEdit(cat: Category) {
    setEditing(cat);
    setForm({ name: cat.name, icon: cat.icon, color: cat.color });
    setError("");
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditing(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required"); return; }
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await updateCategory(editing.id, form);
      } else {
        await createCategory(form);
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

  async function handleDelete(cat: Category) {
    if (!window.confirm(`Delete category "${cat.name}"? Assets in this category will become uncategorized.`)) return;
    try {
      await deleteCategory(cat.id);
      load();
    } catch {
      alert("Failed to delete category");
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Categories</h1>
        <button
          onClick={startCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + New Category
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">{editing ? "Edit Category" : "New Category"}</h2>
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
            {error && <p className="w-full text-red-400 text-sm">{error}</p>}
            <div className="flex-1 min-w-40">
              <label className="block text-xs text-gray-400 mb-1">Name *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                placeholder="Laptop"
                required
              />
            </div>
            <div className="w-24">
              <label className="block text-xs text-gray-400 mb-1">Icon</label>
              <input
                value={form.icon}
                onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                placeholder="💻"
              />
            </div>
            <div className="w-32">
              <label className="block text-xs text-gray-400 mb-1">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  className="w-9 h-9 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="text-gray-400 text-xs font-mono">{form.color}</span>
              </div>
            </div>
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
              <th className="px-4 py-3 text-gray-400 font-medium w-12">Icon</th>
              <th className="px-4 py-3 text-gray-400 font-medium w-12">Color</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Name</th>
              <th className="px-4 py-3 text-gray-400 font-medium w-32 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="border-b border-gray-700">
                  {[1, 2, 3, 4].map(j => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-700 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-gray-500">No categories yet</td>
              </tr>
            ) : (
              categories.map(cat => (
                <tr key={cat.id} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                  <td className="px-4 py-3 text-xl">{cat.icon}</td>
                  <td className="px-4 py-3">
                    <div className="w-6 h-6 rounded" style={{ background: cat.color }} />
                  </td>
                  <td className="px-4 py-3 text-white font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => startEdit(cat)}
                      className="text-indigo-400 hover:text-indigo-300 text-xs mr-3 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
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
