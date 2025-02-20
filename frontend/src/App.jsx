import { useEffect, useState } from 'react';
import './App.css';

function App() {
  // State to hold the data
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from the backend when the component is mounted
  useEffect(() => {
    console.log("Sending IPC message to fetch users");
    window.electron.ipcRenderer.send('fetch-users');

    window.electron.ipcRenderer.on('users-data', (event, data) => {
      if (data.error) {
        console.error('Error fetching users:', data.error);
      } else {
        console.log("Received users data:", data);
        setUsers(data);
      }
      setLoading(false);
    });

    return () => {
      window.electron.ipcRenderer.removeAllListeners('users-data');
    };
  }, []);

  return (
    <div className="App">
      <h1>My React App</h1>
      {loading ? (
        <p>Loading...</p> // Show a loading message while data is being fetched
      ) : (
        <div>
          <h2>Data from Express Backend:</h2>
          <ul>
            {users.map(user => (
              <li key={user.id}>{user.name} - {user.email}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
