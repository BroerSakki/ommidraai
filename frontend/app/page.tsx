"use client";

import { ProfileMenu } from "@/app/components/navigation/profile-menu";
import { AddGroupModal } from "@/app/components/homepage/add-group-modal";
import LoadMoreGroups from "@/app/components/groups/load-groups";
import { GroupItem } from "@/app/components/groups/group-card";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);

  const router = useRouter();

  const [groupOwnedItems, setGroupOwnedItems] = useState<GroupItem[]>([]);
  const [groupJoinedItems, setGroupJoinedItems] = useState<GroupItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const pageSize = 12;
  const apiUrl = "/api/backend/groups/get";

  const fetchOwnedGroups = async (currentPage: number, signal?: AbortSignal) => {
    if (loading) return;
    setLoading(true);

    try {
      const fullUrl = `${apiUrl}/owned?page=${currentPage}&size=${pageSize}`;
      
      // 2. Attach the signal to the standard fetch configuration block
      const response = await fetch(fullUrl, { signal });
      const data = await response.json();

      const newItems = data.items || [];
      if (newItems.length < pageSize) {
        setHasMore(false);
      }

      setGroupOwnedItems((prevItems) => [...prevItems, ...newItems]);
    } catch (error) {
      // Ignore errors caused intentionally by aborting the request
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error fetching dashboard items:", error);
      }
    } finally {
      setLoading(false);
    }
  };

    const fetchJoinedGroups = async (currentPage: number, signal?: AbortSignal) => {
    if (loading) return;
    setLoading(true);

    try {
      const fullUrl = `${apiUrl}/joined?page=${currentPage}&size=${pageSize}`;
      
      // 2. Attach the signal to the standard fetch configuration block
      const response = await fetch(fullUrl, { signal });
      const data = await response.json();

      const newItems = data.items || [];
      if (newItems.length < pageSize) {
        setHasMore(false);
      }

      setGroupJoinedItems((prevItems) => [...prevItems, ...newItems]);
    } catch (error) {
      // Ignore errors caused intentionally by aborting the request
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error fetching dashboard items:", error);
      }
    } finally {
      setLoading(false);
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

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchOwnedGroups(nextPage);
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
        <div className="mx-auto max-w-6xl px-6">

          {/* Header */}
          <header className="mb-10 rounded-3xl bg-[#3d3461] p-8 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white">
                  Groups
                </h1>

                <p className="mt-2 text-gray-200">
                  Manage the groups you own and the groups you belong to.
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
                  My Groups
                </h2>

                <p className="mt-1 text-gray-500">
                  Create and manage your own groups.
                </p>
              </div>

              {/* ADD GROUP BUTTON */}
              <div className="mb-8">
                <button
                    type="button"
                    onClick={() => setIsAddGroupModalOpen(true)}
                    className="w-full rounded-xl bg-[#3d3461] px-6 py-3 font-semibold text-white transition hover:bg-[#544a85]"
                >
                  Add Group
                </button>
              </div>

          <div className="grid gap-4">
                <LoadMoreGroups
                    items={groupOwnedItems}
                    onOpen={(item) => {
                        const groupName = item.Group.name;
                        const groupId = item.User_Group.group_id;
                        const role = item.User_Group.role;
                        router.push(`/group/${encodeURIComponent(groupName)}?groupId=${groupId}&role=${role}`);
                    }}
                />
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
                  Member Groups
                </h2>

                <p className="mt-1 text-gray-500">
                  Groups you've joined.
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
                  Group to join
                </label>

                <input
                    id="join-group-name"
                    type="text"
                    required
                    placeholder="Group to join"
                    className="text-black flex-1 rounded-xl border-2 border-[#b6cfc6] px-4 py-3 outline-none transition focus:border-[#3d3461]"
                />

                <button
                    type="submit"
                    className="rounded-xl bg-[#a8be8f] px-6 py-3 font-semibold text-[#3d3461] transition hover:bg-[#b6cfc6]"
                >
                  Join Group
                </button>

              </form>

              <div
                  id="member-groups-list"
                  className="grid gap-4"
              >
                <LoadMoreGroups
                  items={groupJoinedItems}
                  onOpen={(item) => {
                      const groupName = item.Group.name;
                      const groupId = item.User_Group.group_id;
                      const role = item.User_Group.role;
                      router.push(`/group/${encodeURIComponent(groupName)}?groupId=${groupId}&role=${role}`);
                  }}
              />
              </div>

            </section>

            <section
                className="rounded-3xl bg-white p-8 shadow-xl border border-[#b6cfc6]"
                aria-labelledby="load-more-title"
            >
              <div className="flex flex-col items-center justify-center pt-6">
                {loading && <p className="text-gray-500 animate-pulse text-sm">Loading next batch...</p>}

                {hasMore && !loading && (
                  <button
                    onClick={handleLoadMore}
                    className="px-6 py-2.5 bg-[#3d3461] text-white font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition shadow-sm text-sm"
                  >
                    Load More Groups
                  </button>
                )}

                {!hasMore && groupJoinedItems.length > 0 && (
                  <p className="text-gray-400 text-sm">All available groups have been fetched.</p>
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