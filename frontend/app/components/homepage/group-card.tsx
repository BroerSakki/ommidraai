"use client";

import { useTranslations } from "next-intl";

interface UserGroupDetails {
  user_id: number;
  group_id: number;
  role: string;
  car_capacity: number;
  is_passenger: boolean;
}

interface GroupDetails {
  name: string;
  role?: string;
}

export interface GroupItem {
  User_Group: UserGroupDetails;
  Group: GroupDetails;
}

type GroupCardProps = {
  name?: string;
  role?: string;
  groupItem?: GroupItem;
  actionLabel: string;
  actionVariant?: "danger" | "warning";
  onAction: () => void;
  onOpen: () => void;
};

export function GroupCard({
  name,
  role,
  groupItem,
  actionLabel,
  actionVariant = "danger",
  onAction,
  onOpen,
}: GroupCardProps) {
  const t = useTranslations("common");

  // Get the group name from groupItem if it exists.
  // Otherwise use the name prop.
  const groupName = groupItem?.Group?.name ?? name ?? t("unnamedGroup");
  const groupRole = groupItem?.Group?.role ?? role ?? t("unknownRole");


  const buttonClasses =
    actionVariant === "warning"
      ? "bg-yellow-500 hover:bg-yellow-600"
      : "bg-red-500 hover:bg-red-600";

  return (
    <div className="flex h-40 w-40 flex-col justify-between rounded-xl border-2 border-green-600 bg-gray-100 p-4 shadow-lg">
      {/* Group name */}
      <div className="flex flex-1 items-center justify-center">
        <div className="rounded-full bg-gray-100 px-2.5 py-1">
          <h3 className="break-words text-center text-xs font-medium text-black">
            <span className="inline-block mt-2 px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#72ceb5] text-[#3d3461] capitalize">
            {groupRole}
            </span>
          </h3>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <h3 className="break-words text-center text-lg font-semibold text-black">
          {groupName}
        </h3>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        {/* Open button */}
        <button
          type="button"
          onClick={onOpen}
          className="flex-1 rounded-md bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          {t("open")}
        </button>

        {/* Delete / Leave button */}
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