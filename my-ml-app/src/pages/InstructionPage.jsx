import React from 'react';
import { useNavigate } from 'react-router-dom';
import instructionImage from '../assets/instruction/instruction.jpg';

function InstructionPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← Back</button>
      <h2 style={styles.title}>How to Use DiaBest</h2>
      <img
        src={instructionImage}
        alt="Instruction Poster"
        style={styles.image}
      />
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 800,
    margin: '0 auto',
    padding: '2rem',
    textAlign: 'center',
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
    marginBottom: '1rem',
    color: '#2a72de'
  },
  image: {
    width: '100%',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
  }
};

export default InstructionPage;