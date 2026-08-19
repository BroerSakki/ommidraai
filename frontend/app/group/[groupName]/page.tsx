"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AddGroupModal } from "@/app/components/homepage/model/add-model";

type Role = "owner" | "admin" | "member";

type GroupMember = {
  name: string;
  role: Role;
};

type ModalType =
  | "invite"
  | "kick"
  | "location"
  | "new-owner"
  | null;

type ApiUser = {
  user: { username: string; email: string };
  user_group: { is_passenger: boolean; car_capacity: number };
  location: { latitude: number; longitude: number };
};

type ApiDestination = {
  group_location: { display_name: string };
  location: { latitude: number; longitude: number };
};

type ApiGroupData = {
  users: ApiUser[];
  destinations: ApiDestination[];
  algorithm: unknown;
};

type ApiMeResponse = {
  username: string;
  email: string;
};

export default function GroupPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const groupName = decodeURIComponent(
    Array.isArray(params.groupName)
      ? params.groupName[0]
      : params.groupName || "Group"
  );

  const groupId = searchParams.get("groupId");
  const roleParam = searchParams.get("role") as Role | null;
  const currentUserRole: Role = roleParam ?? "member";

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(!!groupId);
  const [fetchError, setFetchError] = useState<string | null>(
    groupId ? null : "Group ID is missing. Please navigate from the home page."
  );

  const [activeModal, setActiveModal] = useState<ModalType>(null);

  useEffect(() => {
    if (!groupId) {
      return;
    }

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setFetchError(null);

      try {
        const meResponse = await fetch(`/api/backend/auth/me`);
        if (!meResponse.ok) {
          throw new Error("Failed to fetch current user");
        }
        const meData = (await meResponse.json()) as ApiMeResponse;
        const currentUsername = meData.username;

        const groupResponse = await fetch(`/api/backend/groups/${groupId}`);
        if (!groupResponse.ok) {
          throw new Error(
            `Failed to fetch group data (status ${groupResponse.status})`
          );
        }
        const groupData = (await groupResponse.json()) as ApiGroupData;

        if (cancelled) return;

        const apiMembers: GroupMember[] = groupData.users.map((u) => ({
          name: u.user.username,
          role: u.user.username === currentUsername ? currentUserRole : "member",
        }));

        setMembers(apiMembers);

        const apiLocations = groupData.destinations.map(
          (d) => d.group_location.display_name
        );

        setLocations(apiLocations);
      } catch (err) {
        if (cancelled) return;
        setFetchError(
          err instanceof Error ? err.message : "Failed to load group data"
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [groupId, currentUserRole]);

  function inviteMember(name: string) {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    const alreadyExists = members.some(
      (member) =>
        member.name.toLowerCase() ===
        trimmedName.toLowerCase()
    );

    if (alreadyExists) {
      alert("A member with that name already exists.");
      return;
    }

    setMembers((prev) => [
      ...prev,
      {
        name: trimmedName,
        role: "member",
      },
    ]);

    setActiveModal(null);
  }

  function kickMember(name: string) {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    const member = members.find(
      (item) =>
        item.name.toLowerCase() ===
        trimmedName.toLowerCase()
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
        (item) =>
          item.name.toLowerCase() !==
          trimmedName.toLowerCase()
      )
    );

    setActiveModal(null);
  }

  function addLocation(location: string) {
    const trimmedLocation = location.trim();

    if (!trimmedLocation) {
      return;
    }

    const alreadyExists = locations.some(
      (item) =>
        item.toLowerCase() ===
        trimmedLocation.toLowerCase()
    );

    if (alreadyExists) {
      alert("That location has already been added.");
      return;
    }

    setLocations((prev) => [
      ...prev,
      trimmedLocation,
    ]);

    setActiveModal(null);
  }

  function transferOwnership(newOwnerName: string) {
    const trimmedName = newOwnerName.trim();

    if (!trimmedName) {
      return;
    }

    const admin = members.find(
      (member) =>
        member.name.toLowerCase() ===
          trimmedName.toLowerCase() &&
        member.role === "admin"
    );

    if (!admin) {
      alert(
        "You must enter the name of an existing admin."
      );
      return;
    }

    setMembers((prev) =>
      prev.map((member) => {
        if (member.role === "owner") {
          return {
            ...member,
            role: "admin",
          };
        }

        if (
          member.name.toLowerCase() ===
          admin.name.toLowerCase()
        ) {
          return {
            ...member,
            role: "owner",
          };
        }

        return member;
      })
    );

    setActiveModal(null);
  }

  function leaveGroup() {
    if (currentUserRole === "owner") {
      setActiveModal("new-owner");
      return;
    }

    router.back();
  }

  function deleteGroup() {
    if (!groupId) return;

    fetch(`/api/backend/groups/${groupId}/delete`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .catch(() => {})

    router.push("/");
  }

  const ownerMembers = members.filter(
    (member) => member.role === "owner"
  );

  const adminMembers = members.filter(
    (member) => member.role === "admin"
  );

  const normalMembers = members.filter(
    (member) => member.role === "member"
  );

  const modalSettings = {
    invite: {
      title: "Invite Member",
      description:
        "Enter the name of the person you want to invite.",
      label: "Member Name",
      placeholder: "Enter member name",
      confirmText: "Invite",
    },

    kick: {
      title: "Kick Member",
      description:
        "Enter the name of the member you want to kick.",
      label: "Member Name",
      placeholder: "Enter member name",
      confirmText: "Kick",
    },

    location: {
      title: "Add Location",
      description:
        "Enter the name of the location you want to add.",
      label: "Location",
      placeholder: "Enter location",
      confirmText: "Add",
    },

    "new-owner": {
      title: "Transfer Ownership",
      description:
        "Enter the name of an existing admin who should become the new owner.",
      label: "New Owner",
      placeholder: "Enter admin name",
      confirmText: "Transfer",
    },
  };

  function handleModalCreate(value: string) {
    if (activeModal === "invite") {
      inviteMember(value);
      return;
    }

    if (activeModal === "kick") {
      kickMember(value);
      return;
    }

    if (activeModal === "location") {
      addLocation(value);
      return;
    }

    if (activeModal === "new-owner") {
      transferOwnership(value);
      return;
    }
  }

  const currentModal =
    activeModal !== null
      ? modalSettings[activeModal]
      : null;

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-10">
        <div className="mx-auto max-w-7xl rounded-3xl bg-white p-6 shadow-2xl lg:p-10">
          <p className="text-gray-500">Loading group data…</p>
        </div>
      </main>
    );
  }

  if (fetchError) {
    return (
      <main className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-10">
        <div className="mx-auto max-w-7xl rounded-3xl bg-white p-6 shadow-2xl lg:p-10">
          <p className="text-red-600">{fetchError}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-10">
      <div className="mx-auto max-w-7xl rounded-3xl bg-white p-6 shadow-2xl lg:p-10">

        {/* ====================================== */}
        {/* GROUP HEADER */}
        {/* ====================================== */}

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

        {/* ====================================== */}
        {/* LOCATIONS + MAP */}
        {/* ====================================== */}

        <div className="grid gap-8 lg:grid-cols-[250px_1fr]">

          {/* ---------------------------------- */}
          {/* LOCATIONS */}
          {/* ---------------------------------- */}

          <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Locations
              </h2>

              {currentUserRole !== "member" && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveModal("location")
                  }
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
                {locations.map(
                  (location, index) => (
                    <li
                      key={`${location}-${index}`}
                      className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"
                    >
                      {location}
                    </li>
                  )
                )}
              </ul>
            )}
          </section>

          {/* ---------------------------------- */}
          {/* WORLD MAP */}
          {/* ---------------------------------- */}

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

        {/* ====================================== */}
        {/* MEMBERS */}
        {/* ====================================== */}

        <section className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6">

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Members
            </h2>

            <span className="rounded-full bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">
              {members.length} members
            </span>
          </div>

          {/* ---------------------------------- */}
          {/* OWNER */}
          {/* ---------------------------------- */}

          <div className="mb-6">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-green-700">
              Owner
            </h3>

            <div className="space-y-2">
              {ownerMembers.map(
                (member) => (
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
                )
              )}
            </div>
          </div>

          {/* ---------------------------------- */}
          {/* ADMINS */}
          {/* ---------------------------------- */}

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
                adminMembers.map(
                  (member) => (
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
                  )
                )
              )}
            </div>
          </div>

          {/* ---------------------------------- */}
          {/* MEMBERS */}
          {/* ---------------------------------- */}

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
                normalMembers.map(
                  (member) => (
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
                  )
                )
              )}
            </div>
          </div>
        </section>

        {/* ====================================== */}
        {/* BOTTOM ACTIONS */}
        {/* ====================================== */}

        <section className="mt-8 flex items-center justify-between gap-3 border-t border-gray-200 pt-6">

          {/* BACK BUTTON */}

          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg bg-gray-600 px-5 py-3 font-semibold text-white shadow transition hover:bg-gray-700"
          >
            ← Back
          </button>

          {/* RIGHT SIDE ACTIONS */}

          <div className="flex flex-wrap justify-end gap-3">

            {/* ============================== */}
            {/* MEMBER */}
            {/* ============================== */}

            {currentUserRole === "member" && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveModal("invite")
                  }
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

            {/* ============================== */}
            {/* ADMIN */}
            {/* ============================== */}

            {currentUserRole === "admin" && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveModal("invite")
                  }
                  className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white shadow transition hover:bg-green-700"
                >
                  Invite
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveModal("kick")
                  }
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

            {/* ============================== */}
            {/* OWNER */}
            {/* ============================== */}

            {currentUserRole === "owner" && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveModal("invite")
                  }
                  className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white shadow transition hover:bg-green-700"
                >
                  Invite
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveModal("kick")
                  }
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
          </div>
        </section>
      </div>

      {/* ====================================== */}
      {/* SHARED ADD MODEL */}
      {/* ====================================== */}

      {currentModal && (
        <AddGroupModal
          isOpen={activeModal !== null}
          onClose={() => setActiveModal(null)}
          onCreate={handleModalCreate}
          title={currentModal.title}
          description={currentModal.description}
          label={currentModal.label}
          placeholder={currentModal.placeholder}
          confirmText={currentModal.confirmText}
        />
      )}
    </main>
  );
}
