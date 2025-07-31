import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function Dashboard() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');

    useEffect(() => {
      const fetchUser = async () => {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error('No user found');
          return;
        }

        const { data, error } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Failed to fetch full name:', error.message);
        } else if (!data) {
          console.warn('No user info found for this ID:', user.id);
        } else {
          setFullName(data.full_name); // ← make sure this line exists
        }
      };

      fetchUser();
    }, []);

  const [latestResults, setLatestResults] = useState([]);
    useEffect(() => {
      const fetchUserData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get user name
        const { data: userInfo } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();

        if (userInfo) setFullName(userInfo.full_name);

        // Fetch last 3 results
        const { data: results, error } = await supabase
          .from('results')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false }) // Changed 'date' to 'timestamp'
          .limit(3);
        
        console.log("Fetched results:", results);
        console.log("Error if any:", error);

        if (error) {
          console.error('Failed to fetch results:', error.message);
        } else {
          setLatestResults(results);
        }
      };

    fetchUserData();
  }, []);


  return (
    <div style={styles.container}>
      <h2 style={styles.welcome}>Welcome, {fullName || '...'}</h2>

      <div style={styles.grid}>
        <div style={styles.card} onClick={() => navigate('/upload')}>
          <span role="img" aria-label="upload" style={styles.emoji}>📤</span>
          <p>Upload Image</p>
        </div>

        <div style={styles.card} onClick={() => navigate('/woundsummary')}>
          <span role="img" aria-label="summary" style={styles.emoji}>📊</span>
          <p>Wound Summary</p>
        </div>

        <div style={styles.card} onClick={() => navigate('/instructions')}>
          <span role="img" aria-label="instructions" style={styles.emoji}>📝</span>
          <p>Instructions</p>
        </div>

        <div style={styles.card} onClick={() => navigate('/myinfo')}>
          <span role="img" aria-label="user" style={styles.emoji}>👤</span>
          <p>My Info</p>
        </div>
      </div>

      <div style={styles.preview}>
        <h3>Latest Results</h3>

        {latestResults.length === 0 ? (
          <p>No results yet.</p>
        ) : (
          latestResults.map((r, idx) => (
            <div key={idx} style={styles.record}>
              <p><strong>Prediction:</strong> {r.prediction}</p>
              <p><strong>Wound Area:</strong> {r.wound_area} cm²</p>
              <p><strong>Date & Time:</strong> {new Date(r.timestamp).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: 900,
    margin: '0 auto',
  },
  welcome: {
    textAlign: 'center',
    color: '#2a72de',
    marginBottom: '2rem',
  },
  userName: {
    textAlign: 'center',
    color: '#444',
    fontSize: '1.1rem',
    fontStyle: 'italic',
    marginBottom: '1.5rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  card: {
    backgroundColor: '#f0f4ff',
    padding: '1.5rem',
    textAlign: 'center',
    borderRadius: '12px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  emoji: {
    fontSize: '2rem',
    display: 'block',
    marginBottom: '0.5rem',
  },
  preview: {
    padding: '1rem',
    border: '1px solid #ccc',
    borderRadius: '10px',
    backgroundColor: '#fafafa',
  },
  record: {
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px dashed #ccc'
  }
};

export default Dashboard;
