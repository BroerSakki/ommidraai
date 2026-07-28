import Image from "next/image";

export default function Home() {
  return (
    <main className="container">
      <header className="page-header">
        <h1>Groups</h1>
        <p>Manage the groups you own and the groups you belong to.</p>
      </header>

      {/* Section 1: My Groups */}
      <section className="card" aria-labelledby="my-groups-title">
        <div className="section-head">
          <h2 id="my-groups-title">My Groups</h2>

          <form id="add-group-form" className="controls">
            <label htmlFor="new-group-name" className="sr-only">
              New group name
            </label>
            
            <input
              id="new-group-name"
              type="text"
              required
              placeholder="New group name"
            />

            <button type="submit" className="btn btn-primary">
              Add Group
            </button>
          </form>
        </div>

        <div id="my-groups-list" className="groups-grid"></div>

        <p id="my-groups-empty" className="empty">
          No groups yet. Add one above.
        </p>
      </section>

      {/* Section 2: Member Groups */}
      <section className="card" aria-labelledby="member-groups-title">
        <div className="section-head">
          <h2 id="member-groups-title">Member Groups</h2>

          <form id="join-group-form" className="controls">
            <label htmlFor="join-group-name" className="sr-only">
              Group to join
            </label>

            <input
              id="join-group-name"
              type="text"
              required
              placeholder="Group to join"
            />

            <button type="submit" className="btn btn-dark">
              Join Group
            </button>
          </form>
        </div>

        <div id="member-groups-list" className="groups-grid"></div>

        <p id="member-groups-empty" className="empty">
          You haven't joined any groups yet.
        </p>
      </section>
    </main>
  );
}
