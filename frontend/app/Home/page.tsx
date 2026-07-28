import React from 'react'

const Home = () => {
  return (
    <>
      <header>
        <h1>Home</h1>
      </header>

      <section className="group-card">
        <div id="admin">
          <h2>My Group</h2>
          <form id="mygroup-form">
            <label>
              New Group Names
            </label>

            <input>
              id="add-groupname"
              type="text"
              required
              placeholder="Groep Name?"
            </input>

            <button>
              Add Group
            </button>
          </form>
        </div>
        <div id="mygrouo-list" className="group-grid"></div>
        <p id="my-empty-group" classname="empty-group">
          No Groups Found
        </p>
      </section>
      /* ------------ */
      <section className="group-card">
        <div id="member">
          <h2>Joined Group</h2>
          <form id="mygroup-form">
            <label>
              Groups joined
            </label>

            <input>
              id="join-groupname"
              type="text"
              required
              placeholder="Fined-Groep-Name?"
            </input>

            <button>
              Add Group
            </button>
          </form>
        </div>
        <div id="mygrouo-list" className="group-grid"></div>
        <p id="my-empty-group" classname="empty-group">
          No Groups Found
        </p>
      </section>


      <footer>
        
      </footer>
    </>
  )
}

export default Home