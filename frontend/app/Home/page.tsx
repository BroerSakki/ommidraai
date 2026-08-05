"use client";

import { useState } from "react";
import { PageHeader } from "./components/page-header";
import { MyGroups } from "./components/my-group";
import { MemberGroups } from "./components/member-group";

export default function HomePage() {
  const [myGroups, setMyGroups] = useState<string[]>([]);
  const [memberGroups, setMemberGroups] = useState<string[]>([]);

  function addGroup() {
    const name = prompt("Enter a new group name:");

    if (!name?.trim()) return;

    setMyGroups((prev) => [...prev, name.trim()]);
  }

  function joinGroup() {
    const name = prompt("Enter a group to join:");

    if (!name?.trim()) return;

    setMemberGroups((prev) => [...prev, name.trim()]);
  }

  return (
    <main className="min-h-screen bg-gray-100 py-8 pb-28">
      <div className="relative z-10 mx-auto max-w-6xl rounded-3xl bg-white p-10 shadow-2xl">
        <PageHeader />

        {/* My Groups */}
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
          <MyGroups
            groups={myGroups}
            onDelete={(index) =>
              setMyGroups((prev) => prev.filter((_, i) => i !== index))
            }
          />
        </div>

        {/* Member Groups */}
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
          <MemberGroups
            groups={memberGroups}
            onLeave={(index) =>
              setMemberGroups((prev) => prev.filter((_, i) => i !== index))
            }
          />
        </div>
      </div>

      {/* Sticky Action Buttons */}
      {/* Bottom Buttons */}
      <div className="fixed bottom-8 left-1/2 z-[9999] w-full max-w-6xl -translate-x-1/2 px-10">
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={addGroup}
            className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-green-700 active:scale-95">
            + Add Group
          </button>

          <button
            type="button"
            onClick={joinGroup}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-700 active:scale-95"
          >
            Join Group
          </button>
        </div>
      </div>
    </main>
  );
}