"use client";

import { useState, type FormEvent } from "react";
import { GroupCard } from "./group-card";

export function MemberGroups() {
  const [groups, setGroups] = useState<string[]>([]);
  const [name, setName] = useState("");

  function joinGroup(e: FormEvent) {
    e.preventDefault();

    const trimmed = name.trim();

    if (!trimmed) return;

    setGroups([...groups, trimmed]);
    setName("");
  }

  function leaveGroup(index: number) {
    setGroups(groups.filter((_, i) => i !== index));
  }

  return (
    <section className="rounded-xl border p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">
          Member Groups
        </h2>

        <form onSubmit={joinGroup} className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Group to join"
            className="rounded border px-3 py-2"
          />

          <button
            type="submit"
            className="rounded bg-gray-800 px-4 py-2 text-white"
          >
            Join Group
          </button>
        </form>
      </div>

      {groups.length === 0 ? (
        <p className="mt-4 text-gray-500">
          You haven't joined any groups yet.
        </p>
      ) : (
        <div className="mt-6 grid gap-4">
          {groups.map((group, index) => (
            <GroupCard
              key={index}
              name={group}
              actionLabel="Leave"
              actionVariant="warning"
              onAction={() => leaveGroup(index)}
            />
          ))}
        </div>
      )}
    </section>
  );
}