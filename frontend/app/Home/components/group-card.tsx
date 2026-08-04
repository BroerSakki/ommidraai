"use client";

type GroupCardProps = {
  name: string;
  actionLabel: string;
  actionVariant?: "danger" | "warning";
  onAction: () => void;
  onOpen: () => void;
};

export function GroupCard({
  name,
  actionLabel,
  actionVariant = "danger",
  onAction,
  onOpen,
}: GroupCardProps) {
  const buttonClasses =
    actionVariant === "warning"
      ? "bg-yellow-500 hover:bg-yellow-600"
      : "bg-red-500 hover:bg-red-600";

  return (
    <div className="flex h-40 w-40 flex-col justify-between rounded-xl border-2 border-green-600 bg-gray-900 p-4 shadow-lg">
      <div className="flex flex-1 items-center justify-center">
        <h3 className="text-center text-lg font-semibold text-white break-words">
          {name}
        </h3>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onOpen}
          className="flex-1 rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
        >
          Open
        </button>

        <button
          type="button"
          onClick={onAction}
          className={`flex-1 rounded-md py-2 text-sm font-medium text-white transition ${buttonClasses}`}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}