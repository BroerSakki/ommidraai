"use client";

interface UserGroupDetails {
  user_id: number;
  group_id: number;
  role: string;
  car_capacity: number;
  is_passenger: boolean;
}

interface GroupDetails {
  name: string;
}

export interface GroupItem {
  User_Group: UserGroupDetails;
  Group: GroupDetails;
}

type GroupCardProps = {
  name?: string;
  groupItem?: GroupItem;
  actionLabel: string;
  actionVariant?: "danger" | "warning";
  onAction: () => void;
  onOpen: () => void;
};

export function GroupCard({
  name,
  groupItem,
  actionLabel,
  actionVariant = "danger",
  onAction,
  onOpen,
}: GroupCardProps) {
  const groupName =
    groupItem?.Group?.name ?? name ?? "Unnamed Group";

  const buttonClasses =
    actionVariant === "warning"
      ? "bg-yellow-500 hover:bg-yellow-600"
      : "bg-red-500 hover:bg-red-600";

  return (
    <div className="flex h-40 w-40 flex-col justify-between rounded-xl border-2 border-green-600 bg-gray-900 p-4 shadow-lg">
      {/* Group name */}
      <div className="flex flex-1 items-center justify-center">
        <h3 className="break-words text-center text-lg font-semibold text-white">
          {groupName}
        </h3>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        {/* Open */}
        <button
          type="button"
          onClick={onOpen}
          className="flex-1 rounded-md bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Open
        </button>

        {/* Delete / Leave */}
        <button
          type="button"
          onClick={onAction}
          className={`flex-1 rounded-md py-2 text-sm font-medium text-black transition ${buttonClasses}`}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}