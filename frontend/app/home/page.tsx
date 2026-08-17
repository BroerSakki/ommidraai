"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "./components/page-header";
import { MyGroups } from "./components/my-group";
import { MemberGroups } from "./components/member-group";

export default function HomePage() {
  const [myGroups, setMyGroups] = useState<string[]>([]);
  const [memberGroups, setMemberGroups] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load saved groups when the Home page opens
  useEffect(() => {
    try {
      const savedMyGroups = localStorage.getItem("myGroups");
      const savedMemberGroups = localStorage.getItem("memberGroups");

      if (savedMyGroups) {
        setMyGroups(JSON.parse(savedMyGroups));
      }

      if (savedMemberGroups) {
        setMemberGroups(JSON.parse(savedMemberGroups));
      }
    } catch (error) {
      console.error("Failed to load groups:", error);
    }

    setLoaded(true);
  }, []);

  // Save My Groups whenever they change
  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem("myGroups", JSON.stringify(myGroups));
  }, [myGroups, loaded]);

  // Save Member Groups whenever they change
  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      "memberGroups",
      JSON.stringify(memberGroups)
    );
  }, [memberGroups, loaded]);

  function addGroup() {
    const name = prompt("Enter a new group name:");

    if (!name?.trim()) return;

    const trimmedName = name.trim();

    // Prevent duplicate group names
    if (
      myGroups.some(
        (group) => group.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      alert("A group with that name already exists.");
      return;
    }

    setMyGroups((prev) => [...prev, trimmedName]);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-dark via-brand-mid to-brand-light py-8 pb-28">
      <div className="relative z-10 mx-auto w-full max-w-6xl rounded-3xl bg-white p-10 shadow-2xl">
        <PageHeader />

        {/* My Groups */}
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
          <MyGroups
            groups={myGroups}
            onDelete={(index) => {
              setMyGroups((prev) =>
                prev.filter((_, i) => i !== index)
              );
            }}
          />
        </div>

        {/* Member Groups */}
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
          <MemberGroups
            groups={memberGroups}
            onLeave={(index) => {
              setMemberGroups((prev) =>
                prev.filter((_, i) => i !== index)
              );
            }}
          />
        </div>
      </div>

      {/* Add Group button */}
      <div className="fixed bottom-8 left-1/2 z-[9999] w-full max-w-6xl -translate-x-1/2 px-10">
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={addGroup}
            className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-green-700 active:scale-95"
          >
            + Add Group
          </button>
        </div>
      </div>
    </main>
  );
}