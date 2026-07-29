

export default function Home() {
  return (
    <main>
      <header>
        <nav class="flex justify-center space-x-4">
          <a href="/dashboard" class="font-bol rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900">
            Home
          </a>
          <a href="/team" class="font-bol rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900">
            Team
          </a>
          <a href="/projects" class="font-bol rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900">
            Projects
          </a>
          <a href="/reports" class="font-bol rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900">
            Reports
          </a>
        </nav>
      </header>

      <section className="group-card">
        <div class="box-border size-60 border-4 p-4">
          <div id="admin">
            <h2>MyGroup</h2>

            <form id="admin-form">
              <label htmlFor="add-groupname">New Group Names</label>

              <input
                id="add-groupname"
                type="text"
                required
                placeholder="Group Name?"
              />

              <button class="btn-primary">Add Group</button>
            </form>
          </div>
        </div>
        <br />
        <br />
        <br />
        

        <div id="admin-group-list" className="group-grid"></div>

        <p id="admin-empty-group" className="empty-group">
          No Groups Found
        </p>
      </section>

      <section className="group-card">
        <div id="member">
          <h2>Joined Group</h2>

          <form id="member-form">
            <label htmlFor="join-groupname">Groups Joined</label>

            <input
              id="join-groupname"
              type="text"
              required
              placeholder="Find Group Name?"
            />

            <button class="btn-primary">Add Group</button>
          </form>
        </div>

        <div id="member-group-list" className="group-grid"></div>

        <p id="member-empty-group" className="empty-group">
          No Groups Found
        </p>
      </section>

      <footer></footer>
    </main>
  );
}