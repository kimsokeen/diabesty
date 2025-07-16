<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function PatientDetail() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [results, setResults] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);

  useEffect(() => {
    const fetchPatient = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('full_name, age, gender, email')
        .eq('id', patientId)
        .maybeSingle();

      console.log('Fetching data for patient:', patientId);
      if (!error) setPatient(data);
    };

    const fetchResults = async () => {
      const { data, error } = await supabase
        .from('results')
        .select('date, wound_area, prediction','image_url')
        .eq('user_id', patientId)
        .order('date', { ascending: true });

      console.log('Wound records:', data, 'Error:', error);
      if (!error) setResults(data);
    };

    fetchPatient();
    fetchResults();
  }, [patientId]);

  useEffect(() => {
    if (!selectedDate) {
        setFilteredResults([]);
        return;
    }

    const matches = results.filter((r) => r.date === selectedDate);
    setFilteredResults(matches);
    }, [selectedDate, results]);

  const trend = (() => {
    if (results.length < 2) return 'Not enough data';
    const latest = results[results.length - 1];
    const previous = results[results.length - 2];
    if (latest.wound_area < previous.wound_area) return 'Improving';
    if (latest.wound_area > previous.wound_area) return 'Worsening';
    return 'Stable';
  })();

    return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        <button onClick={() => navigate('/doctordashboard')} style={{ marginBottom: '1rem' }}>
        ← Back to Dashboard
        </button>

        <h2>Patient Details</h2>
        {patient && (
        <div style={{ marginBottom: '2rem' }}>
            <p><strong>Name:</strong> {patient.full_name}</p>
            <p><strong>Age:</strong> {patient.age}</p>
            <p><strong>Gender:</strong> {patient.gender}</p>
            <p><strong>Email:</strong> {patient.email}</p>
        </div>
        )}

        {results.length > 0 && (
        <>
            <h3>Latest Wound Records</h3>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {[...results].slice(-2).reverse().map((res, i) => (
                <div key={i} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', flex: '1 1 300px' }}>
                <p><strong>Date:</strong> {res.date}</p>
                <p><strong>Prediction:</strong> {res.prediction}</p>
                <p><strong>Wound Area:</strong> {res.wound_area} px</p>
                </div>
            ))}
            </div>

            <h3 style={{ marginTop: '2rem' }}>Wound Area Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
            <LineChart data={results}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="wound_area" stroke="#2a72de" />
            </LineChart>
            </ResponsiveContainer>
            <p style={{ marginTop: '1rem' }}><strong>Trend:</strong> {trend}</p>

            <h3 style={{ marginTop: '2rem' }}>View by Date</h3>
            <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: '0.5rem', fontSize: '1rem', marginBottom: '1rem' }}
            >
            <option value="">Select a date</option>
            {[...new Set(results.map((res) => res.date))].map((uniqueDate) => (
                <option key={uniqueDate} value={uniqueDate}>{uniqueDate}</option>
            ))}
            </select>

            {filteredResults.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {filteredResults.map((res, index) => (
                <div
                    key={index}
                    style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', flex: '1 1 300px' }}
                >
                    {res.image_url && (
                        <img
                            src={res.image_url}
                            alt="Wound Upload"
                            onError={(e) => { e.target.style.display = 'none'; }}
                            style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '6px', marginBottom: '0.5rem' }}
                        />
                    )}
                    <p><strong>Date:</strong> {res.date}</p>
                    <p><strong>Prediction:</strong> {res.prediction}</p>
                    <p><strong>Wound Area:</strong> {res.wound_area} px</p>
                </div>
                ))}
            </div>
            )}
        </>
        )}

        {results.length === 0 && <p>No wound records found.</p>}
    </div>
    );
}

export default PatientDetail;
=======
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function PatientDetail() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [results, setResults] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);

  useEffect(() => {
    const fetchPatient = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('full_name, age, gender, email')
        .eq('id', patientId)
        .maybeSingle();

      console.log('Fetching data for patient:', patientId);
      if (!error) setPatient(data);
    };

    const fetchResults = async () => {
      const { data, error } = await supabase
        .from('results')
        .select('date, wound_area, prediction','image_url')
        .eq('user_id', patientId)
        .order('date', { ascending: true });

      console.log('Wound records:', data, 'Error:', error);
      if (!error) setResults(data);
    };

    fetchPatient();
    fetchResults();
  }, [patientId]);

  useEffect(() => {
    if (!selectedDate) {
        setFilteredResults([]);
        return;
    }

    const matches = results.filter((r) => r.date === selectedDate);
    setFilteredResults(matches);
    }, [selectedDate, results]);

  const trend = (() => {
    if (results.length < 2) return 'Not enough data';
    const latest = results[results.length - 1];
    const previous = results[results.length - 2];
    if (latest.wound_area < previous.wound_area) return 'Improving';
    if (latest.wound_area > previous.wound_area) return 'Worsening';
    return 'Stable';
  })();

    return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        <button onClick={() => navigate('/doctordashboard')} style={{ marginBottom: '1rem' }}>
        ← Back to Dashboard
        </button>

        <h2>Patient Details</h2>
        {patient && (
        <div style={{ marginBottom: '2rem' }}>
            <p><strong>Name:</strong> {patient.full_name}</p>
            <p><strong>Age:</strong> {patient.age}</p>
            <p><strong>Gender:</strong> {patient.gender}</p>
            <p><strong>Email:</strong> {patient.email}</p>
        </div>
        )}

        {results.length > 0 && (
        <>
            <h3>Latest Wound Records</h3>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {[...results].slice(-2).reverse().map((res, i) => (
                <div key={i} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', flex: '1 1 300px' }}>
                <p><strong>Date:</strong> {res.date}</p>
                <p><strong>Prediction:</strong> {res.prediction}</p>
                <p><strong>Wound Area:</strong> {res.wound_area} px</p>
                </div>
            ))}
            </div>

            <h3 style={{ marginTop: '2rem' }}>Wound Area Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
            <LineChart data={results}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="wound_area" stroke="#2a72de" />
            </LineChart>
            </ResponsiveContainer>
            <p style={{ marginTop: '1rem' }}><strong>Trend:</strong> {trend}</p>

            <h3 style={{ marginTop: '2rem' }}>View by Date</h3>
            <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: '0.5rem', fontSize: '1rem', marginBottom: '1rem' }}
            >
            <option value="">Select a date</option>
            {[...new Set(results.map((res) => res.date))].map((uniqueDate) => (
                <option key={uniqueDate} value={uniqueDate}>{uniqueDate}</option>
            ))}
            </select>

            {filteredResults.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {filteredResults.map((res, index) => (
                <div
                    key={index}
                    style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', flex: '1 1 300px' }}
                >
                    {res.image_url && (
                        <img
                            src={res.image_url}
                            alt="Wound Upload"
                            onError={(e) => { e.target.style.display = 'none'; }}
                            style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '6px', marginBottom: '0.5rem' }}
                        />
                    )}
                    <p><strong>Date:</strong> {res.date}</p>
                    <p><strong>Prediction:</strong> {res.prediction}</p>
                    <p><strong>Wound Area:</strong> {res.wound_area} px</p>
                </div>
                ))}
            </div>
            )}
        </>
        )}

        {results.length === 0 && <p>No wound records found.</p>}
    </div>
    );
}

export default PatientDetail;
>>>>>>> b2a95d72a3f5b2d5c9caf620ef5090e56adace55
