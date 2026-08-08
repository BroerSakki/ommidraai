"use client";

import { useRouter } from "next/navigation";
import { GroupCard } from "./group-card";

type MyGroupsProps = {
  groups: string[];
  onDelete: (index: number) => void;
};

export function MyGroups({ groups, onDelete }: MyGroupsProps) {
  const router = useRouter();

  return (
    <section className="mb-10 rounded-xl border p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">
          My Groups
        </h2>
      </div>

      {groups.length === 0 ? (
        <p className="mt-4 text-gray-500">
          No groups yet.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {groups.map((group, index) => (
            <GroupCard
              key={index}
              name={group}
              actionLabel="Delete"
              actionVariant="danger"
              onOpen={() =>
                router.push(`/group/${encodeURIComponent(group)}`)
              }
              onAction={() => onDelete(index)}
            />
          ))}
        </div>
      )}
    </section>
  );
}