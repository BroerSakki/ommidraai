"use client";

type GroupCardProps = {
  name: string;
  actionLabel: string;
  actionVariant?: "danger" | "warning";
  onAction: () => void;
};

export function GroupCard({
  name,
  actionLabel,
  actionVariant = "danger",
  onAction,
}: GroupCardProps) {
  const actionClasses =
    actionVariant === "warning"
      ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
      : "bg-red-100 text-red-700 hover:bg-red-200";

  return (
    <div className="flex items-center justify-between rounded-lg border border-green-800 bg-green-500 p-4">
      <span className="font-medium">{name}</span>

      <button
        onClick={onAction}
        className={`rounded-md px-3 py-1 text-sm ${actionClasses}`}
      >
        {actionLabel}
      </button>
    </div>
  );
}