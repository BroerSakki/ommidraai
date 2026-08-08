import { ProfileMenu } from "@/app/components/navigation/profile-menu";

export default function Home() {
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
            <section
                className="rounded-3xl bg-white p-8 shadow-xl border border-[#b6cfc6]"
                aria-labelledby="my-groups-title"
            >

              <div className="mb-6">

                <h2
                    id="my-groups-title"
                    className="text-2xl font-bold text-[#3d3461]"
                >
                  My Groups
                </h2>

                <p className="mt-1 text-gray-500">
                  Create and manage your own groups.
                </p>

              </div>

              <form
                  id="add-group-form"
                  className="mb-8 flex flex-col gap-4 sm:flex-row"
              >

                <label
                    htmlFor="new-group-name"
                    className="sr-only"
                >
                  New group name
                </label>

                <input
                    id="new-group-name"
                    type="text"
                    required
                    placeholder="New group name"
                    className="flex-1 rounded-xl border-2 border-[#b6cfc6] px-4 py-3 outline-none transition focus:border-[#3d3461]"
                />

                <button
                    type="submit"
                    className="rounded-xl bg-[#3d3461] px-6 py-3 font-semibold text-white transition hover:bg-[#544a85]"
                >
                  Add Group
                </button>

              </form>

              <div
                  id="my-groups-list"
                  className="grid gap-4"
              ></div>

              <p
                  id="my-groups-empty"
                  className="rounded-xl bg-[#eef5f1] p-6 text-center text-gray-500"
              >
                No groups yet. Add one above.
              </p>

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
                    className="flex-1 rounded-xl border-2 border-[#b6cfc6] px-4 py-3 outline-none transition focus:border-[#3d3461]"
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
              ></div>

              <p
                  id="member-groups-empty"
                  className="rounded-xl bg-[#eef5f1] p-6 text-center text-gray-500"
              >
                You haven't joined any groups yet.
              </p>

            </section>

          </div>

        </div>

      </main>
  );
}