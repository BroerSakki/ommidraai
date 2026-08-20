"use client";

import { ProfileMenu } from "@/app/components/navigation/profile-menu";
import { AddGroupModal } from "@/app/components/homepage/add-group-modal";
import { GroupItem } from "@/app/components/groups/group-card";
import { MyGroups } from "./components/homepage/my-group";
import { MemberGroups } from "./components/homepage/member-group";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/app/components/navigation/language-switcher";

export default function Home() {
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);

  const router = useRouter();

  const [groupOwnedItems, setGroupOwnedItems] = useState<GroupItem[]>([]);
  const [groupJoinedItems, setGroupJoinedItems] = useState<GroupItem[]>([]);
  const [ownedPage, setOwnedPage] = useState<number>(1);
  const [ownedLoading, setOwnedLoading] = useState<boolean>(false);
  const [ownedHasMore, setOwnedHasMore] = useState<boolean>(true);
  const [joinedPage, setJoinedPage] = useState<number>(1);
  const [joinedLoading, setJoinedLoading] = useState<boolean>(false);
  const [joinedHasMore, setJoinedHasMore] = useState<boolean>(true);
  const t = useTranslations("home");

  const pageSize = 6;
  const apiUrl = "/api/backend/groups/get";

  const fetchOwnedGroups = async (currentPage: number, signal?: AbortSignal) => {
    if (ownedLoading) return;
    setOwnedLoading(true);

    try {
      const fullUrl = `${apiUrl}/owned?page=${currentPage}&size=${pageSize}`;
      
      // 2. Attach the signal to the standard fetch configuration block
      const response = await fetch(fullUrl, { signal });
      const data = await response.json();

      const newItems = data.items || [];
      if (newItems.length < pageSize) {
        setOwnedHasMore(false);
      }

      setGroupOwnedItems((prevItems) => [...prevItems, ...newItems]);
    } catch (error) {
      // Ignore errors caused intentionally by aborting the request
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error fetching dashboard items:", error);
      }
    } finally {
      setOwnedLoading(false);
    }
  };

  const fetchJoinedGroups = async (currentPage: number, signal?: AbortSignal) => {
    if (joinedLoading) return;
    setJoinedLoading(true);

    try {
      const fullUrl = `${apiUrl}/joined?page=${currentPage}&size=${pageSize}`;
      
      // 2. Attach the signal to the standard fetch configuration block
      const response = await fetch(fullUrl, { signal });
      const data = await response.json();

      const newItems = data.items || [];
      if (newItems.length < pageSize) {
        setJoinedHasMore(false);
      }

      setGroupJoinedItems((prevItems) => [...prevItems, ...newItems]);
    } catch (error) {
      // Ignore errors caused intentionally by aborting the request
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error fetching dashboard items:", error);
      }
    } finally {
      setJoinedLoading(false);
    }
  };


  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    fetchOwnedGroups(1, signal);
    fetchJoinedGroups(1, signal)

    return () => {
      controller.abort();
    };
  }, []);

  const handleLoadMoreOwned = () => {
    const nextPage = ownedPage + 1;
    setOwnedPage(nextPage);
    fetchOwnedGroups(nextPage);
  };

  const handleLoadMoreJoined = () => {
    const nextPage = joinedPage + 1;
    setJoinedPage(nextPage);
    fetchJoinedGroups(nextPage);
  };

  const createGroup = async (groupName: string) => {
    try {
      const response = await fetch(
          "/api/backend/groups/" + groupName + "/create",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Something went wrong");
      }

      setIsAddGroupModalOpen(false);

      router.refresh();
      window.location.reload();
    } catch (err) {
      alert(err);
    }
  };

  return (
      <main className="min-h-screen bg-gradient-to-b from-[#b6cfc6] to-white py-10">
        <div className="fixed absolute right-4 top-4 z-50">
          <LanguageSwitcher />
        </div>

        <div className="mx-auto max-w-6xl px-6">

          {/* Header */}
          <header className="mb-10 rounded-3xl bg-[#3d3461] p-8 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white">
                  {t("groups")}
                </h1>

                <p className="mt-2 text-gray-200">
                  {t("manageSubtitle")}
                </p>
              </div>

              <ProfileMenu />
            </div>
          </header>

          <div className="grid gap-8 lg:grid-cols-2">

            {/* My Groups */}
            <section className="rounded-3xl border border-[#b6cfc6] bg-white p-8 shadow-xl">

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#3d3461]">
                  {t("myGroups")}
                </h2>

                <p className="mt-1 text-gray-500">
                  {t("myGroupsSubtitle")}
                </p>
              </div>

              {/* ADD GROUP BUTTON */}
              <div className="mb-8">
                <button
                    type="button"
                    onClick={() => setIsAddGroupModalOpen(true)}
                    className="w-full rounded-xl bg-[#3d3461] px-6 py-3 font-semibold text-white transition hover:bg-[#544a85]"
                >
                  {t("addGroup")}
                </button>
              </div>

          <div className="grid gap-4">
                <MyGroups
                    groups={groupOwnedItems}
                    onOpen={(group) => {
                        const groupName = group.Group.name;
                        const groupId = group.User_Group.group_id;
                        const role = group.User_Group.role;
                        router.push(`/group/${encodeURIComponent(groupName)}?groupId=${groupId}&role=${role}`);
                    }}
                    // Add onDelete later
                />

                {ownedLoading && <p className="text-gray-500 animate-pulse text-sm">{t("loadingNextBatch")}</p>}

                {ownedHasMore && !ownedLoading && (
                  <button
                    onClick={handleLoadMoreOwned}
                    className="px-6 py-2.5 bg-[#3d3461] text-white font-medium rounded-lg active:bg-[#544a85] hover:bg-[#544a85] transition shadow-sm text-sm"
                  >
                    {t("loadMoreGroups")}
                  </button>
                )}
            </div>

            </section>

            {/* Member Groups */}
            <section
                className="rounded-3xl bg-white p-8 shadow-xl border border-[#b6cfc6]"
                aria-labelledby="member-groups-title"
            >

              <div className="mb-6">

                <h2
                    id="member-groups-title"
                    className="text-2xl font-bold text-[#3d3461]"
                >
                  {t("memberGroups")}
                </h2>

                <p className="mt-1 text-gray-500">
                  {t("memberGroupsSubtitle")}
                </p>
              </div>

              <form
                  id="join-group-form"
                  className="mb-8 flex flex-col gap-4 sm:flex-row"
              >

                <label
                    htmlFor="join-group-name"
                    className="sr-only"
                >
                  {t("groupToJoin")}
                </label>

                <input
                    id="join-group-name"
                    type="text"
                    required
                    placeholder={t("groupToJoin")}
                    className="text-black flex-1 rounded-xl border-2 border-[#b6cfc6] px-4 py-3 outline-none transition focus:border-[#3d3461]"
                />

                <button
                    type="submit"
                    className="rounded-xl bg-[#a8be8f] px-6 py-3 font-semibold text-[#3d3461] transition hover:bg-[#b6cfc6]"
                >
                  {t("joinGroup")}
                </button>

              </form>

              <div
                  id="member-groups-list"
                  className="grid gap-4"
              >
                  <MemberGroups
                      groups={groupJoinedItems}
                      onOpen={(group) => {
                          const groupName = group.Group.name;
                          const groupId = group.User_Group.group_id;
                          const role = group.User_Group.role;
                          router.push(`/group/${encodeURIComponent(groupName)}?groupId=${groupId}&role=${role}`);
                      }}
                      //Add onLeave later
                  />

                  {joinedLoading && <p className="text-gray-500 animate-pulse text-sm">{t("loadingNextBatch")}</p>}

                  {joinedHasMore && !joinedLoading && (
                    <button
                      onClick={handleLoadMoreJoined}
                      className="px-6 py-2.5 bg-[#3d3461] text-white font-medium rounded-lg active:bg-[#544a85] hover:bg-[#544a85] transition shadow-sm text-sm"
                    >
                      {t("loadMoreGroups")}
                    </button>
                  )}
              </div>

            </section>
          </div>
        </div>

        {/* ADD GROUP MODAL */}
        <AddGroupModal
            isOpen={isAddGroupModalOpen}
            onClose={() => setIsAddGroupModalOpen(false)}
            onCreate={createGroup}
        />
      </main>
  );
}