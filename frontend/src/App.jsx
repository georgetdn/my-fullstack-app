import { useEffect, useState } from 'react';
import './App.css';

function App() {
  // State to hold the data
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch data from the backend when the component is mounted
  useEffect(() => {
    // Make a GET request to your Express backend
    fetch('http://localhost:3000/api/data') // Your backend URL
      .then(response => response.json()) // Parse the JSON response
      .then(data => {
        setData(data); // Update state with the fetched data
        setLoading(false); // Set loading to false
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false); // Set loading to false even if there's an error
      });
  }, []); // Empty dependency array means this runs only once when the component mounts

  return (
    <div className="App">
      <h1>My React App</h1>
      {loading ? (
        <p>Loading...</p> // Show a loading message while data is being fetched
      ) : (
        <div>
          <h2>Data from Express Backend:</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre> {/* Display the data */}
        </div>
      )}
    </div>
  );
}

export default App;
