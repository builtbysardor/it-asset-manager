import { AssetStatus } from "@/types";

const styles: Record<AssetStatus, string> = {
  active: "bg-green-900 text-green-300",
  inactive: "bg-gray-700 text-gray-300",
  maintenance: "bg-yellow-900 text-yellow-300",
  retired: "bg-red-900 text-red-300",
  missing: "bg-orange-900 text-orange-300",
};

export default function StatusBadge({ status }: { status: AssetStatus }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${styles[status] ?? styles.inactive}`}>
      {status}
    </span>
  );
}
