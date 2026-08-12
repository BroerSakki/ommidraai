"use client";

import { useState } from "react";
import { PageHeader } from "./components/page-header";
import { MyGroups } from "./components/my-group";
import { MemberGroups } from "./components/member-group";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [myGroups, setMyGroups] = useState<string[]>([]);
  const [memberGroups, setMemberGroups] = useState<string[]>([]);

  const [groupName, setGroupName] = useState("");
  const router = useRouter();

  function addGroup() {
    const name = prompt("Enter a new group name:");

    if (!name?.trim()) return;

    setMyGroups((prev) => [...prev, name.trim()]);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-dark via-brand-mid to-brand-light py-8 pb-28">
      <div className="relative z-10 mx-auto max-w-6xl rounded-3xl bg-white p-10 shadow-2xl">
        <PageHeader />

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
          <MyGroups
            groups={myGroups}
            onDelete={(index) =>
              setMyGroups((prev) => prev.filter((_, i) => i !== index))
            }
          />
        </div>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
          <MemberGroups
            groups={memberGroups}
            onLeave={(index) =>
              setMemberGroups((prev) => prev.filter((_, i) => i !== index))
            }
          />
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 z-[9999] w-full max-w-6xl -translate-x-1/2 px-10">
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={addGroup}
            className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-green-700 active:scale-95">
            + Add Group
          </button>

          
        </div>
      </div>
    </main>
  );
}