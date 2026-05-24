import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [users, setUsers] = useState([]);
  const [cfData, setCfData] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    leetcodeUsername: "",
    codeforcesUsername: ""
  });

  // Fetch users
  useEffect(() => {
    axios.get("http://localhost:5000/users")
      .then((res) => setUsers(res.data))
      .catch((err) => console.log(err));
  }, []);

  // Fetch Codeforces (example: first user)
  useEffect(() => {
    if (users.length > 0 && users[0].codeforcesUsername) {
      axios
        .get(`http://localhost:5000/codeforces/${users[0].codeforcesUsername}`)
        .then((res) => setCfData(res.data))
        .catch((err) => console.log(err));
    }
  }, [users]);

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit form
  const handleSubmit = () => {
    axios.post("http://localhost:5000/add-user", form)
      .then(() => {
        alert("User added");
        window.location.reload();
      })
      .catch((err) => console.log(err));
  };

  return (
   <div style={{ 
  padding: "20px", 
  background: "#0f172a", 
  minHeight: "100vh",
  color: "white"
}}>
  
<h1 style={{ textAlign: "center" }}>
  🚀 CodeOrbit Dashboard
</h1>
      <h1>Users</h1>

      {/* Add User Form */}
      <h2>Add User</h2>

      <input name="name" placeholder="Name" onChange={handleChange} />
      <br />

      <input name="email" placeholder="Email" onChange={handleChange} />
      <br />

      <input name="password" placeholder="Password" onChange={handleChange} />
      <br />

      <input name="leetcodeUsername" placeholder="LeetCode Username" onChange={handleChange} />
      <br />

      <input name="codeforcesUsername" placeholder="Codeforces Username" onChange={handleChange} />
      <br />

      <button onClick={handleSubmit}>Add User</button>

      <hr />

      {/* Users List */}
      {/* {users.map((user, index) => (
        <div key={index} style={{ marginBottom: "10px" }}>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
          <p>CF Username: {user.codeforcesUsername}</p>
          <hr />
        </div>
      ))} */}
      {users.map((user, index) => (
  <UserCard key={index} user={user} />
))}

      {/* Codeforces Stats */}
      

      {/* {cfData && (
        <div>
          <p>Rating: {cfData.rating}</p>
          <p>Rank: {cfData.rank}</p>
          <p>Max Rating: {cfData.maxRating}</p>
        </div>
      )} */}
    </div>
  );
}

export default App;

function UserCard({ user }) {
  const [cfData, setCfData] = React.useState(null);

  React.useEffect(() => {
    if (user.codeforcesUsername) {
      axios
        .get(`http://localhost:5000/codeforces/${user.codeforcesUsername}`)
        .then((res) => setCfData(res.data))
        .catch((err) => console.log(err));
    }
  }, [user]);

  return (
   
  <div
    style={{
      background: "#1e1e2f",
      color: "white",
      padding: "15px",
      borderRadius: "10px",
      marginBottom: "15px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
    }}
  >
    <h3>{user.name}</h3>
    <p>Email: {user.email}</p>
    <p>CF Username: {user.codeforcesUsername}</p>

    {cfData ? (
      <div>
        <p>🔥 Rating: {cfData.rating}</p>
        <p>🏆 Rank: {cfData.rank}</p>
      </div>
    ) : (
      <p>Loading stats...</p>
    )}
  </div>

  );
}