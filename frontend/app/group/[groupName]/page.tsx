"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

type Role = "owner" | "admin" | "member";

type GroupMember = {
  name: string;
  role: Role;
};

export default function GroupPage() {
  const params = useParams();

  const groupName = decodeURIComponent(
    Array.isArray(params.groupName)
      ? params.groupName[0]
      : params.groupName || "Group"
  );

  // Change this to test different roles:
  const currentUserRole: Role = "owner";

  const [members, setMembers] = useState<GroupMember[]>([
    { name: "Group Owner", role: "owner" },
    { name: "Admin 1", role: "admin" },
    { name: "Admin 2", role: "admin" },
    { name: "Member 1", role: "member" },
    { name: "Member 2", role: "member" },
  ]);

  const [locations, setLocations] = useState<string[]>([
    "Pretoria",
    "Johannesburg",
    "Cape Town",
  ]);

  // -----------------------------
  // Invite member
  // -----------------------------
  function inviteMember() {
    const name = prompt("Enter the name of the member to invite:");

    if (!name?.trim()) return;

    setMembers((prev) => [
      ...prev,
      {
        name: name.trim(),
        role: "member",
      },
    ]);
  }

  // -----------------------------
  // Kick member/admin
  // -----------------------------
  function kickMember() {
    const name = prompt("Enter the name of the member to kick:");

    if (!name?.trim()) return;

    const member = members.find(
      (item) => item.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (!member) {
      alert("Member not found.");
      return;
    }

    if (member.role === "owner") {
      alert("The owner cannot be kicked.");
      return;
    }

    setMembers((prev) =>
      prev.filter(
        (item) => item.name.toLowerCase() !== name.trim().toLowerCase()
      )
    );
  }

  // -----------------------------
  // Leave group
  // -----------------------------
  function leaveGroup() {
    if (currentUserRole === "owner") {
      const newOwner = prompt(
        "You are the owner.\n\nEnter the name of an admin who should become the new owner:"
      );

      if (!newOwner?.trim()) return;

      const admin = members.find(
        (member) =>
          member.name.toLowerCase() === newOwner.trim().toLowerCase() &&
          member.role === "admin"
      );

      if (!admin) {
        alert("You must select an existing admin.");
        return;
      }

      const confirmTransfer = confirm(
        `${admin.name} will become the new owner. Continue?`
      );

      if (!confirmTransfer) return;

      setMembers((prev) =>
        prev.map((member) => {
          if (member.role === "owner") {
            return {
              ...member,
              role: "admin",
            };
          }

          if (member.name === admin.name) {
            return {
              ...member,
              role: "owner",
            };
          }

          return member;
        })
      );

      alert(`${admin.name} is now the new owner.`);
      return;
    }

    const confirmLeave = confirm(
      `Are you sure you want to leave ${groupName}?`
    );

    if (!confirmLeave) return;

    alert(`You left ${groupName}.`);

    // Later you can redirect back to the homepage here.
  }

  // -----------------------------
  // Delete group
  // -----------------------------
  function deleteGroup() {
    const confirmDelete = confirm(
      `Are you sure you want to delete "${groupName}"?\n\nThis cannot be undone.`
    );

    if (!confirmDelete) return;

    alert(`${groupName} has been deleted.`);

    // Later you can redirect to the homepage here.
  }

  // -----------------------------
  // Add location
  // -----------------------------
  function addLocation() {
    const location = prompt("Enter a location:");

    if (!location?.trim()) return;

    setLocations((prev) => [...prev, location.trim()]);
  }

  // -----------------------------
  // Sort members
  // Owner → Admin → Member
  // -----------------------------
  const ownerMembers = members.filter(
    (member) => member.role === "owner"
  );

  const adminMembers = members.filter(
    (member) => member.role === "admin"
  );

  const normalMembers = members.filter(
    (member) => member.role === "member"
  );

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-10">
      <div className="mx-auto max-w-7xl rounded-3xl bg-white p-6 shadow-2xl lg:p-10">

        {/* -------------------------------- */}
        {/* HEADER */}
        {/* -------------------------------- */}

        <header className="mb-8 border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {groupName}
          </h1>

          <p className="mt-2 text-gray-500">
            Welcome to the {groupName} group
          </p>

          <div className="mt-3">
            <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
              Your role: {currentUserRole}
            </span>
          </div>
        </header>

        {/* -------------------------------- */}
        {/* MAIN CONTENT */}
        {/* -------------------------------- */}

        <div className="grid gap-8 lg:grid-cols-[250px_1fr]">

          {/* -------------------------------- */}
          {/* LOCATIONS - LEFT */}
          {/* -------------------------------- */}

          <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5">

            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Locations
              </h2>

              {currentUserRole !== "member" && (
                <button
                  type="button"
                  onClick={addLocation}
                  className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow transition hover:bg-green-700"
                >
                  +
                </button>
              )}
            </div>

            {locations.length === 0 ? (
              <p className="text-sm text-gray-500">
                No locations added.
              </p>
            ) : (
              <ul className="space-y-3">
                {locations.map((location, index) => (
                  <li
                    key={`${location}-${index}`}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"
                  >
                    {location}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* -------------------------------- */}
          {/* MAP */}
          {/* -------------------------------- */}

          <section className="flex h-[350px] items-center justify-center rounded-2xl border border-gray-300 bg-gray-200">

            <div className="flex h-[300px] w-full max-w-[600px] items-center justify-center rounded-2xl border-2 border-dashed border-gray-400 bg-gray-100">

              <div className="text-center">
                <div className="mb-3 text-5xl">
                  🌍
                </div>

                <h2 className="text-2xl font-bold text-gray-700">
                  World Map
                </h2>

                <p className="mt-2 text-gray-500">
                  Map will go here
                </p>
              </div>

            </div>

          </section>
        </div>

        {/* -------------------------------- */}
        {/* MEMBERS */}
        {/* -------------------------------- */}

        <section className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6">

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Members
            </h2>

            <span className="rounded-full bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">
              {members.length} members
            </span>
          </div>

          {/* OWNER */}

          <div className="mb-6">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-green-700">
              Owner
            </h3>

            <div className="space-y-2">
              {ownerMembers.map((member) => (
                <div
                  key={member.name}
                  className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4"
                >
                  <span className="font-semibold text-gray-900">
                    {member.name}
                  </span>

                  <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">
                    Owner
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ADMINS */}

          <div className="mb-6">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-700">
              Admins
            </h3>

            <div className="space-y-2">
              {adminMembers.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No admins.
                </p>
              ) : (
                adminMembers.map((member) => (
                  <div
                    key={member.name}
                    className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4"
                  >
                    <span className="font-semibold text-gray-900">
                      {member.name}
                    </span>

                    <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                      Admin
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* MEMBERS */}

          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-600">
              Members
            </h3>

            <div className="space-y-2">
              {normalMembers.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No members.
                </p>
              ) : (
                normalMembers.map((member) => (
                  <div
                    key={member.name}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
                  >
                    <span className="font-semibold text-gray-900">
                      {member.name}
                    </span>

                    <span className="rounded-full bg-gray-300 px-3 py-1 text-xs font-bold text-gray-700">
                      Member
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* -------------------------------- */}
        {/* BOTTOM ACTIONS */}
        {/* -------------------------------- */}

        <section className="mt-8 flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-6">

          {/* MEMBER */}

          {currentUserRole === "member" && (
            <>
              <button
                type="button"
                onClick={inviteMember}
                className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white shadow transition hover:bg-green-700"
              >
                Invite
              </button>

              <button
                type="button"
                onClick={leaveGroup}
                className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white shadow transition hover:bg-red-700"
              >
                Leave
              </button>
            </>
          )}

          {/* ADMIN */}

          {currentUserRole === "admin" && (
            <>
              <button
                type="button"
                onClick={inviteMember}
                className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white shadow transition hover:bg-green-700"
              >
                Invite
              </button>

              <button
                type="button"
                onClick={kickMember}
                className="rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white shadow transition hover:bg-orange-700"
              >
                Kick
              </button>

              <button
                type="button"
                onClick={leaveGroup}
                className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white shadow transition hover:bg-red-700"
              >
                Leave
              </button>
            </>
          )}

          {/* OWNER */}

          {currentUserRole === "owner" && (
            <>
              <button
                type="button"
                onClick={inviteMember}
                className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white shadow transition hover:bg-green-700"
              >
                Invite
              </button>

              <button
                type="button"
                onClick={kickMember}
                className="rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white shadow transition hover:bg-orange-700"
              >
                Kick
              </button>

              <button
                type="button"
                onClick={leaveGroup}
                className="rounded-lg bg-yellow-500 px-5 py-3 font-semibold text-black shadow transition hover:bg-yellow-600"
              >
                Leave
              </button>

              <button
                type="button"
                onClick={deleteGroup}
                className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white shadow transition hover:bg-red-700"
              >
                Delete Group
              </button>
            </>
          )}

        </section>

      </div>
    </main>
  );
}