"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { removeToken } from "@/lib/auth";

const nav = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/assets", label: "Assets", icon: "🖥️" },
  { href: "/categories", label: "Categories", icon: "🏷️" },
  { href: "/locations", label: "Locations", icon: "📍" },
];

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🖥️</span>
          <span className="font-bold text-white text-lg">AssetTrack</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">IT Asset Manager</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-indigo-600 text-white font-medium"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-gray-800 space-y-1">
        <p className="text-xs text-gray-600 px-3 mb-2">AssetTrack v1.0</p>
        <button
          onClick={() => { removeToken(); router.push("/login"); }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors w-full text-sm"
        >
          <span>⎋</span> Logout
        </button>
      </div>
    </aside>
  );
}
