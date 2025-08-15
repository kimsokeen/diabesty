import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function DoctorDashboard() {
  const [doctorId, setDoctorId] = useState(null);
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [doctorName, setDoctorName] = useState('');
  const navigate = useNavigate();

  // ✅ Get doctor ID and name
  useEffect(() => {
    const getDoctor = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setDoctorId(user.id);
        const { data, error } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();

        if (!error && data) setDoctorName(data.full_name);
      }
    };
    getDoctor();
  }, []);

  // ✅ Fetch patients via user_roles join
  useEffect(() => {
    const fetchPatients = async () => {
      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'patient');

      if (error) {
        console.error('Failed to fetch roles:', error.message);
        return;
      }

      const patientIds = roleData.map((entry) => entry.user_id);

      if (patientIds.length === 0) {
        setPatients([]); // no patients
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, full_name, age, gender')
        .in('id', patientIds);

      if (userError) {
        console.error('Failed to fetch users:', userError.message);
        return;
      }
      console.log('Patient IDs from user_roles:', patientIds);
      console.log('Fetched user data:', userData);
      setPatients(userData);
    };

    fetchPatients();
  }, []);

  // ✅ Assign patient to doctor
  const handleAssignPatient = async (patientId) => {
    if (!doctorId) return;

    const { error } = await supabase
      .from('doctor_patient')
      .insert({ doctor_id: doctorId, patient_id: patientId });

    if (error) {
      alert('Assignment failed: ' + error.message);
    } else {
      alert('Patient assigned successfully.');
      // Refresh list
      setAssignedPatients((prev) => [...prev]);
    }
  };

  // ✅ NEW: Remove patient from doctor's list
  const handleRemovePatient = async (patientId) => {
    if (!doctorId) return;
    
    // Confirm with the user before deleting
    const confirmed = window.confirm('Are you sure you want to remove this patient from your list?');
    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from('doctor_patient')
      .delete()
      .eq('doctor_id', doctorId)
      .eq('patient_id', patientId);

    if (error) {
      alert('Removal failed: ' + error.message);
    } else {
      alert('Patient removed successfully.');
      // Update the state to remove the patient from the list
      setAssignedPatients((prev) => prev.filter((p) => p.id !== patientId));
    }
  };

  const filteredPatients = patients.filter((p) =>
    (p.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log('SearchQuery:', searchQuery);
  console.log('Filtered patients:', filteredPatients);

  // ✅ Fetch assigned patient summary
  useEffect(() => {
    const fetchAssignedPatients = async () => {
      if (!doctorId) return;

      const { data: assignments, error: assignmentError } = await supabase
        .from('doctor_patient')
        .select('patient_id')
        .eq('doctor_id', doctorId);

      if (assignmentError || !assignments.length) {
        setAssignedPatients([]); // Set to empty if there are no assignments
        return;
      }

      const patientIds = assignments.map((a) => a.patient_id);

      // Fetch patient info
      const { data: users } = await supabase
        .from('users')
        .select('id, full_name')
        .in('id', patientIds);

      // Fetch results
      const { data: allResults } = await supabase
        .from('results')
        .select('user_id, wound_area, prediction, date')
        .in('user_id', patientIds)
        .order('date', { ascending: false });

      const grouped = {};
      for (let r of allResults) {
        if (!grouped[r.user_id]) grouped[r.user_id] = [];
        grouped[r.user_id].push(r);
      }

      const patientsSummary = users.map((u) => {
        const results = grouped[u.id] || [];
        const latest = results[0];
        const previous = results[1];

        let trend = 'No trend';
        if (latest && previous) {
          if (latest.wound_area < previous.wound_area) trend = 'Improving';
          else if (latest.wound_area > previous.wound_area) trend = 'Worsening';
          else trend = 'Stable';
        }

        return {
          id: u.id,
          full_name: u.full_name,
          latest_prediction: latest?.prediction || 'N/A',
          wound_area: latest?.wound_area || 'N/A',
          trend,
        };
      });

      setAssignedPatients(patientsSummary);
    };

    fetchAssignedPatients();
  }, [doctorId]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Doctor Dashboard</h2>
      <p style={styles.userName}>Hello, Dr. {doctorName}</p>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search patient by name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={styles.searchInput}
      />

      {/* Matching patients (only when typing) */}
      {searchQuery.trim() !== '' && (
        <>
          <p style={styles.userName}>Matching Patients</p>
          <div style={styles.grid}>
            {filteredPatients.map((patient) => (
              <div key={patient.id} style={{ ...styles.card, backgroundColor: '#f0f8ff' }}>
                <h3>{patient.full_name}</h3>
                <p>Gender: {patient.gender}</p>
                <p>Age: {patient.age}</p>
                <button
                  style={styles.assignBtn}
                  disabled={assignedPatients.some((p) => p.id === patient.id)}
                  onClick={() => handleAssignPatient(patient.id)}
                >
                  {assignedPatients.some((p) => p.id === patient.id) ? '✓ Assigned' : 'Select this patient'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Assigned Patients Overview */}
      <h3 style={styles.sectionTitle}>🩺 Your Patients Overview</h3>
      <div style={styles.grid}>
        {assignedPatients.map((patient) => (
          <div key={patient.id} style={styles.card}>
            <h3>{patient.full_name}</h3>
            <p><strong>Prediction:</strong> {patient.latest_prediction}</p>
            <p><strong>Wound Area:</strong> {patient.wound_area} cm²</p>
            <p><strong>Trend:</strong> {patient.trend}</p>
            <div style={styles.buttonGroup}>
              <button onClick={() => navigate(`/patient/${patient.id}`)} style={styles.detailsBtn}>
                View Details
              </button>
              {/* NEW: Remove button */}
              <button onClick={() => handleRemovePatient(patient.id)} style={styles.removeBtn}>
                Remove
              </button>
            </div>
          </div>
        ))}
        {assignedPatients.length === 0 && (
          <p style={{ textAlign: 'center' }}>No patients assigned yet.</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: 900,
    margin: '0 auto',
    fontFamily: 'sans-serif',
  },
  title: {
    textAlign: 'center',
    color: '#2a72de',
    marginBottom: '1.5rem',
  },
  searchInput: {
    width: '100%',
    padding: '0.8rem',
    fontSize: '1rem',
    borderRadius: '10px',
    border: '1px solid #ccc',
    marginBottom: '2rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    color: '#333',
    backgroundColor: '#fff',
  },
  assignBtn: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    backgroundColor: '#2a72de',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  },
  userName: {
    textAlign: 'center',
    color: '#444',
    fontSize: '1.1rem',
    fontStyle: 'italic',
    marginBottom: '1.5rem',
  },
  searchButton: {
    padding: '0.8rem 1rem',
    fontSize: '1rem',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#2a72de',
    color: '#fff',
    cursor: 'pointer',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    color: '#444',
    margin: '1rem 0',
  },
  detailsBtn: {
    marginTop: '1rem',
    backgroundColor: '#2a72de',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    width: '100%' // Make button full width
  },
  // NEW: Style for the remove button
  removeBtn: {
    marginTop: '0.5rem',
    backgroundColor: '#e74c3c', // Red color for remove
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    width: '100%' // Make button full width
  },
  // NEW: Style for the button group
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '1rem'
  }
};

export default DoctorDashboard;
