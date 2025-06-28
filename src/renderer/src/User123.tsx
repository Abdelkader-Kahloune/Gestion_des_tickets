import React, { useEffect, useState } from "react";

const App: React.FC = () => {
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
  const [newName, setNewName] = useState("");

  const loadUsers = async () => {
    const arr = await window.api.getUsers();
    setUsers(arr);
  };

  const handleAdd = async () => {
    if (newName.trim()) {
      await window.api.addUser(newName.trim());
      setNewName("");
      loadUsers();
    }
  };

  const handleUpdate = async (id: number) => {
    const name = prompt("New name:");
    if (name) {
      await window.api.updateUser(id, name);
      loadUsers();
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete?")) {
      await window.api.deleteUser(id);
      loadUsers();
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="App">
      <h1>User Manager</h1>
      <input
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        placeholder="Enter new user"
      />
      <button onClick={handleAdd}>Add</button>
      <ul>
        {users.map(({ id, name }) => (
          <li key={id}>
            {name} <button onClick={() => handleUpdate(id)}>Edit</button>{" "}
            <button onClick={() => handleDelete(id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
