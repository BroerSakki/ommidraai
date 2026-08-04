"use client";

import { useState, type FormEvent } from "react";
import { GroupCard } from "./group-card";

export function MyGroups() {
  const [groups, setGroups] = useState<string[]>([]);
  const [name, setName] = useState("");

  function addGroup(e: FormEvent) {
    e.preventDefault();

    const trimmed = name.trim();

    if (!trimmed) return;

    setGroups([...groups, trimmed]);
    setName("");
  }

  function removeGroup(index: number) {
    setGroups(groups.filter((_, i) => i !== index));
  }

  return (
    <section className="mb-10 rounded-xl border p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">
          My Groups
        </h2>

        <form onSubmit={addGroup} className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New group name"
            className="rounded border px-3 py-2"
          />

          <button
            type="submit"
            className="rounded bg-green-600 px-4 py-2 text-white"
          >
            Add Group
          </button>
        </form>
      </div>

      {groups.length === 0 ? (
        <p className="mt-4 text-gray-500">
          No groups yet.
        </p>
      ) : (
        <div className="mt-6 grid gap-4">
          {groups.map((group, index) => (
            <GroupCard
              key={index}
              name={group}
              actionLabel="Delete"
              onAction={() => removeGroup(index)}
            />
          ))}
        </div>
      )}
    </section>
  );
}