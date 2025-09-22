import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import './App.css';

function App() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        // The table name in the schema is 'hospitals' in the 'core' schema.
        // Supabase requires you to specify the schema if it's not 'public'.
        // However, for this test, let's assume it's accessible directly.
        // If this fails, we may need to adjust RLS policies in Supabase.
        const { data, error } = await supabase.from('hospitals').select('*');
        
        if (error) {
          throw error;
        }
        
        setHospitals(data);
      } catch (error) {
        console.error('Error fetching hospitals:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Healthcare Management System</h1>
        <h2>Supabase Connection Test</h2>
        {loading && <p>Loading hospitals...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {hospitals && hospitals.length > 0 ? (
          <div>
            <h3>Hospitals Found:</h3>
            <ul>
              {hospitals.map((hospital) => (
                <li key={hospital.id}>{hospital.name} (ID: {hospital.id})</li>
              ))}
            </ul>
          </div>
        ) : (
          !loading && !error && <p>No hospitals found. Please check the following:</p>
        )}
        {!loading && !error && hospitals.length === 0 && (
            <ul>
                <li>Is there data in the 'core.hospitals' table in your Supabase project?</li>
                <li>Are the Row Level Security (RLS) policies on the 'hospitals' table configured to allow read access for anonymous users?</li>
            </ul>
        )}
      </header>
    </div>
  );
}

export default App;

