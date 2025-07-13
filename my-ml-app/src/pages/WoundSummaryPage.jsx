import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from 'react-router-dom';

function WoundSummaryPage() {
  const [userId, setUserId] = useState(null);
  const [results, setResults] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedResult, setSelectedResult] = useState([]);
  const navigate = useNavigate();

  // ✅ Fetch user ID
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    fetchUser();
  }, []);

  // ✅ Fetch results after user ID is available
  useEffect(() => {
    const fetchResults = async () => {
      if (!userId) return;
      const { data, error } = await supabase
        .from('results')
        .select('*')
        .eq('user_id', userId);
      if (!error) setResults(data);
    };
    fetchResults();
  }, [userId]);

  // ✅ Set selectedResult based on selectedDate
  useEffect(() => {
    if (!results.length) return;
      const matches = results
    .filter((r) => {
      const rDate = new Date(r.date);
      return (
        rDate.getFullYear() === selectedDate.getFullYear() &&
        rDate.getMonth() === selectedDate.getMonth() &&
        rDate.getDate() === selectedDate.getDate()
      );
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
    setSelectedResult(matches || []);
  }, [selectedDate, results]);

  // ✅ Only update date here, let useEffect handle result
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // ✅ Highlight dates with data
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      return results.some((r) => {
        const rDate = new Date(r.date);
        return (
          rDate.getFullYear() === date.getFullYear() &&
          rDate.getMonth() === date.getMonth() &&
          rDate.getDate() === date.getDate()
        );
      }) ? 'highlight' : null;
    }
    return null;
  };

  useEffect(() => {
    console.log("Selected result:", selectedResult);
    
  }, [selectedResult]);


  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
        ← Back
      </button>
        <h2 style={styles.title}>Wound Summary</h2>

        <div style={styles.calendarWrapper}>
            <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            tileClassName={tileClassName}
            />
        </div>

        <div style={styles.resultBox}>
            {selectedResult.length > 0 ? (
              <>
                <h3 style={styles.subtitle}>
                  🩺 {selectedResult.length} Result(s) on {selectedDate.toLocaleDateString()}
                </h3>
                {selectedResult.map((result, index) => (
                  <div key={index} style={{ marginBottom: 20 }}>
                    <p><strong>Prediction:</strong> {result.prediction}</p>
                    <p><strong>Wound Area:</strong> {result.wound_area} pixels</p>
                    <p><strong>Time:</strong> {new Date(result.timestamp).toLocaleTimeString()}</p>
                    <p><strong>Timestamp:</strong> {new Date(result.timestamp).toLocaleString()}</p>
                    {result.image_url && (
                      <img
                        src={result.image_url}
                        alt={`Result ${index + 1}`}
                        style={styles.image}
                      />
                    )}
                    <hr />
                  </div>
                ))}
              </>
            ) : (
              <p>No result on this day.</p>
            )}
        </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '900px',
    margin: '30px auto',
    padding: '2rem',
    textAlign: 'center',
  },
  title: {
    marginBottom: '3rem',
    color: '#2a72de',
    fontSize: '1.5rem',
  },
  calendarWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '2rem',
    transform: 'scale(1.2)',
  },
  resultBox: {
    backgroundColor: '#f9f9f9',
    padding: '1.5rem',
    borderRadius: '10px',
    textAlign: 'left',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    maxWidth: '500px',
    margin: '0 auto',
    fontSize: '1rem',
  },
  subtitle: {
    marginBottom: '1rem',
    color: '#444',
  },
  image: {
    marginTop: '1rem',
    maxWidth: '100%',
    borderRadius: '10px',
    border: '1px solid #ccc',
  },
  backBtn: {
    position: 'absolute',
    top: 10,
    left: 10,
    background: 'none',
    border: 'none',
    fontSize: '1.2rem',
    color: '#2a72de',
    cursor: 'pointer'
  }
};


export default WoundSummaryPage;