"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "../components/homepage/page-header";
import { MyGroups } from "../components/homepage/my-group";
import { MemberGroups } from "../components/homepage/member-group";
import { AddGroupModal } from "@/app/components/homepage/model/add-model";
import { LanguageSwitcher } from "@/app/components/navigation/language-switcher";

export default function HomePage() {
  const [myGroups, setMyGroups] = useState<string[]>([]);
  const [memberGroups, setMemberGroups] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Controls the Add Group modal
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);

  // Load saved groups when Home page opens
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

  // Save My Groups
  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem("myGroups", JSON.stringify(myGroups));
  }, [myGroups, loaded]);

  // Save Member Groups
  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      "memberGroups",
      JSON.stringify(memberGroups)
    );
  }, [memberGroups, loaded]);

  // Called by AddGroupModal when OK is clicked
  function createGroup(groupName: string) {
    const trimmedName = groupName.trim();

    if (!trimmedName) {
      return;
    }

    // Prevent duplicate group names
    const alreadyExists = myGroups.some(
      (group) =>
        group.toLowerCase() === trimmedName.toLowerCase()
    );

    if (alreadyExists) {
      alert("A group with that name already exists.");
      return;
    }

    // Add the new group
    setMyGroups((prev) => [...prev, trimmedName]);

    // Close modal
    setShowAddGroupModal(false);
  }

  // Delete group
  function deleteGroup(index: number) {
    setMyGroups((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }

  // Leave member group
  function leaveGroup(index: number) {
    setMemberGroups((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-dark via-brand-mid to-brand-light py-8 pb-28">
      <div className="absolute right-4 top-4 z-50">
        <LanguageSwitcher />
      </div>
      
      <div className="relative z-10 mx-auto w-full max-w-6xl rounded-3xl bg-white p-10 shadow-2xl">
        <PageHeader />

        {/* My Groups */}
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
          <MyGroups
            groups={myGroups}
            onDelete={deleteGroup}
          />
        </div>

        {/* Member Groups */}
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
          <MemberGroups
            groups={memberGroups}
            onLeave={leaveGroup}
          />
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="fixed bottom-8 left-1/2 z-[9999] w-full max-w-6xl -translate-x-1/2 px-10">
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => setShowAddGroupModal(true)}
            className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-green-700 active:scale-95"
          >
            + Add Group
          </button>
        </div>
      </div>

      {/* Add Group Modal */}
      <AddGroupModal
        isOpen={showAddGroupModal}
        onClose={() => setShowAddGroupModal(false)}
        onCreate={createGroup}
      />
    </main>
  );
}