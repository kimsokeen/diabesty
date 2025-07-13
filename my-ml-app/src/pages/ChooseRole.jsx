import React from 'react';
import { useNavigate } from 'react-router-dom';

function ChooseRolePage() {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    // Save role temporarily (adjust as needed)
    localStorage.setItem('selectedRole', role);
    navigate('/register'); // Redirect to your account creation page
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Choose Your Role</h2>

      <div style={styles.cardContainer}>
        <div style={{ ...styles.card, backgroundColor: '#e0f7fa' }} onClick={() => handleRoleSelect('patient')}>
          <span role="img" aria-label="patient" style={styles.emoji}>🧑‍⚕️</span>
          <h3>Patient</h3>
        </div>

        <div style={{ ...styles.card, backgroundColor: '#fce4ec' }} onClick={() => handleRoleSelect('doctor')}>
          <span role="img" aria-label="doctor" style={styles.emoji}>👨‍🏫</span>
          <h3>Doctor</h3>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '900px',
    margin: '0 auto',
    textAlign: 'center',
  },
  title: {
    fontSize: '1.8rem',
    color: '#2a72de',
    marginBottom: '2rem',
  },
  cardContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  card: {
    flex: '1 1 250px',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  emoji: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
    display: 'block',
  },
};

export default ChooseRolePage;
