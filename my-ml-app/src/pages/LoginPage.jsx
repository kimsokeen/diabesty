import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('Login failed: ' + error.message);
      return;
    }

    console.log('User:', data.user);
    const userId = data.user.id;
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (roleError || !roleData) {
      console.error('Error fetching user role:', roleError?.message);
      return;
    }

    if (roleData.role === 'doctor') {
      navigate('/doctordashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleCreateAccount = () => {
    navigate('/chooserole');
  };

  return (
    <div style={styles.container}>
      {/* Logo + Title */}
      <img src="../assets/logo/logo3_square.png" alt="DiaBest Logo" style={styles.logo} />
      <h1 style={styles.title}>DiaBest</h1>

      {/* Login Form */}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
      />
      <button onClick={handleLogin} style={styles.loginBtn}>Log In</button>

      <p style={{ marginTop: 20 }}>Don’t have an account?</p>
      <button onClick={handleCreateAccount} style={styles.createBtn}>Create Account</button>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 400,
    margin: '60px auto',
    textAlign: 'center',
    padding: '2rem',
    border: '1px solid #ccc',
    borderRadius: '12px',
    background: '#f8f8f8',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  title: {
    marginBottom: 30,
    color: '#2a72de',
    fontFamily: 'sans-serif',
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '1rem',
    borderRadius: '8px',
    border: '1px solid #aaa',
  },
  loginBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2a72de',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  createBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#888',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};

export default LoginPage;
