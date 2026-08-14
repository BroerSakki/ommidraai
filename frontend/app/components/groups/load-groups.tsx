"use client";

import GroupCard, { GroupItem } from "./group-card";

interface LoadMoreGroupsProps {
  items: GroupItem[];
  isOwnerType: boolean; // true filters for 'owner', false filters for non-owners
}

export default function LoadMoreGroups({ items, isOwnerType }: LoadMoreGroupsProps) {
  // Client-side filtering based on the role property parameter
  const filteredItems = items.filter((item) => {
    const isOwner = item.User_Group.role === "owner";
    return isOwnerType ? isOwner : !isOwner;
  });

  if (filteredItems.length === 0) {
    return (
      <div className="p-6 text-center border border-dashed rounded-xl bg-gray-50 text-gray-400 text-sm">
        No groups found in this section.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {filteredItems.map((item) => (
        <GroupCard key={item.User_Group.group_id} groupItem={item} />
      ))}
    </div>
  );
}
