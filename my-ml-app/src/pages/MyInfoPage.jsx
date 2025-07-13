import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function MyInfoPage() {
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchUserInfo = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      console.log('Current user ID:', user?.id);  // Debug line

      if (!user) {
        console.error('No user logged in');
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*') // Use '*' temporarily for debugging
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user info:', error.message); // ← Add this
        alert('Failed to fetch user info: ' + error.message);       // ← Add this
      } else {
        setUserInfo(data);
      }
    };

    fetchUserInfo();
  }, []);


  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← Back</button>
      <h2 style={styles.title}>My Info</h2>

      {userInfo ? (
        <div style={styles.infoBox}>
          <p><strong>Full Name:</strong> {userInfo.full_name}</p>
          <p><strong>Email:</strong> {userInfo.email}</p>
          <p><strong>Gender:</strong> {userInfo.gender}</p>
          <p><strong>Age:</strong> {userInfo.age}</p>
        </div>
      ) : (
        <p>Loading your information...</p>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 500,
    margin: '40px auto',
    textAlign: 'center',
    padding: '2rem',
    backgroundColor: '#f4f8fb',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    position: 'relative'
  },
  backBtn: {
    position: 'absolute',
    top: 10,
    left: 10,
    background: 'none',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
    color: '#2a72de'
  },
  title: {
    marginBottom: '1.5rem',
    color: '#2a72de'
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '10px',
    textAlign: 'left',
    lineHeight: '1.8',
    fontSize: '1rem'
  }
};

export default MyInfoPage;
