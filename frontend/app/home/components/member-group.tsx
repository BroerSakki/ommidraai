"use client";

import { useRouter } from "next/navigation";
import { GroupCard } from "./group-card";

type MemberGroupsProps = {
  groups: string[];
  onLeave: (index: number) => void;
};

export function MemberGroups({
  groups,
  onLeave,
}: MemberGroupsProps) {
  const router = useRouter();

  return (
    <section className="rounded-xl border p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl text-black font-semibold">
          Member Groups
        </h2>
      </div>

      {groups.length === 0 ? (
        <p className="mt-4 text-gray-500">
          You haven't joined any groups yet.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {groups.map((group, index) => (
            <GroupCard
              name={group}
              actionLabel="Leave"
              actionVariant="warning"
              onAction={() => {
                setMemberGroups((prev) => prev.filter((item) => item !== group));
              }}
              onOpen={() => {
                router.push(`/group/${encodeURIComponent(group)}`);
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}