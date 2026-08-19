"use client";

import { useTranslations } from "next-intl";
import GroupCard, { GroupItem } from "./group-card";

interface LoadMoreGroupsProps {
  items: GroupItem[];
  onOpen?: (item: GroupItem) => void;
}

export default function LoadMoreGroups({ items, onOpen }: LoadMoreGroupsProps) {
  const t = useTranslations("home");

  if (items.length === 0) {
    return (
      <div className="p-6 text-center border border-dashed rounded-xl bg-gray-50 text-gray-400 text-sm">
        {t("noGroupsInSection")}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {items.map((item) => (
        <GroupCard
          key={item.User_Group.group_id}
          groupItem={item}
          onOpen={onOpen ? () => onOpen(item) : undefined}
        />
      ))}
    </div>
  );
}
