import { useEffect, useState } from 'react';
import './App.css';

function App() {
  // State to hold the data
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from the backend when the component is mounted
  useEffect(() => {
    console.log("Sending IPC message to fetch users");
    window.electron.ipcRenderer.invoke('fetch-users')
      .then(response => {
        console.log("Received IPC response:", response);
        if (!response) {
          console.error('No response received');
          setLoading(false); // Set loading to false if there is no response
        } else {
          console.log("Received users data:", response);
          setUsers(response);
          setLoading(false); // Set loading to false after data is received
        }
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        setLoading(false); // Set loading to false if there is an error
      });

    return () => {
      window.electron.ipcRenderer.removeAllListeners('fetch-users');
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
            {users.length > 0 ? (
              users.map(user => (
                <li key={user.id}>{user.name} - {user.email}</li>
              ))
            ) : (
              <p>No users found</p>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
