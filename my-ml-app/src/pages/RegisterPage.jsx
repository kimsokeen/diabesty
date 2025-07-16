import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const role = localStorage.getItem('selectedRole') || 'patient';

  const handleRegister = async () => {
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      alert('Signup error: ' + signUpError.message);
      return;
    }

    // ✅ Wait until Supabase confirms login session exists
    let user = null;
    for (let i = 0; i < 5; i++) {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (currentUser) {
        user = currentUser;
        break;
      }
      await new Promise((res) => setTimeout(res, 500));
    }

    if (!user) {
      alert('Failed to confirm user session after signup.');
      return;
    }

    // ✅ Insert into users table (no more 'role' here)
    const { error: insertUserError } = await supabase.from('users').insert({
      id: user.id,
      full_name: fullName,
      gender,
      age: parseInt(age),
      email,
    });

    if (insertUserError) {
      alert('Error inserting user profile: ' + insertUserError.message);
      return;
    }

    // ✅ Insert into user_roles table
    const { error: insertRoleError } = await supabase.from('user_roles').insert({
      user_id: user.id,
      role,
    });

    if (insertRoleError) {
      alert('Error assigning role: ' + insertRoleError.message);
      return;
    }

    // ✅ Navigate based on role
    if (role === 'doctor') {
      navigate('/doctordashboard');
    } else {
      navigate('/dashboard');
    }
  };


  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Create Account</h2>

      <input
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        style={styles.input}
      />
      <select value={gender} onChange={(e) => setGender(e.target.value)} style={styles.input}>
        <option value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
      <input
        type="number"
        placeholder="Age"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        style={styles.input}
      />
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
      <button onClick={handleRegister} style={styles.button}>Register</button>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 400,
    margin: '40px auto',
    padding: '2rem',
    background: '#f0f4ff',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  title: {
    textAlign: 'center',
    color: '#2a72de',
    marginBottom: '1rem'
  },
  input: {
    width: '100%',
    padding: '12px',
    margin: '10px 0',
    borderRadius: '8px',
    border: '1px solid #ccc'
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2a72de',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};

export default RegisterPage;
