import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function UploadPage() {
  const [image, setImage] = useState(null);
  const [response, setResponse] = useState(null);
  const navigate = useNavigate();
  const [previewURL, setPreviewURL] = useState(null);

  const handleUpload = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append('file', image);

    try {
      const res = await fetch('https://diabesty-backend-1.onrender.com/upload/', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setResponse(data);

      // 🔐 Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('User not logged in');
        return;
      }

      const userId = user.id;

      // 🗂 Upload image to Supabase Storage
      const fileExt = image.name.split('.').pop();
      const fileName = `${Date.now()}-${userId}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: storageError } = await supabase.storage
        .from('image') // <- your bucket name
        .upload(filePath, image);

      if (storageError) {
        console.error('Storage upload error:', storageError.message);
        return;
      }

      // 🌐 Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('image')
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;

      console.log('🧪 Data received from backend:', data);

      // 🕒 Save result to database
      const { error } = await supabase.from('results').insert([
        {
          user_id: userId,
          date: new Date().toISOString(),
          prediction: data.prediction,
          wound_area: data.wound_area_cm2 || 0,  // <-- store real area in cm²
          image_url: imageUrl,
        },
      ]);


      if (error) {
        console.error('❌ Supabase insert error:', error);
      } else {
        console.log('✅ Result successfully saved to Supabase.');
      }

    } catch (err) {
      console.error('Upload failed:', err);
    }
  };


  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← Back</button>
      <h2 style={styles.title}>Upload Foot Image</h2>

      <label style={styles.uploadBox}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            setImage(file);
            setPreviewURL(URL.createObjectURL(file));
          }}
          style={{ display: 'none' }}
        />
        {image ? image.name : 'Click to select an image'}
      </label>

      <button onClick={handleUpload} style={styles.uploadBtn}>
        Analyze Image
      </button>

      {response && (
        <div style={styles.resultBox}>
          <h3>Prediction Result</h3>
          <p><strong>Status:</strong> {response.prediction}</p>
          <p><strong>Confidence:</strong> {response.confidence.toFixed(4)}</p>
          {response.wound_area_pixels !== undefined && (
            <>
              {response.wound_area_cm2 && (
                <p><strong>Estimated Real Wound Area:</strong> {response.wound_area_cm2} cm²</p>
              )}
              <div style={styles.imageRow}>
                <div>
                  <p style={styles.imgLabel}>Original</p>
                  <img src={previewURL} alt="Original" style={styles.sideImage} />
                </div>
                <div>
                  <p style={styles.imgLabel}>Wound Mask</p>
                  <img
                    src={`data:image/png;base64,${response.mask_base64}`}
                    alt="Wound Mask"
                    style={styles.sideImage}
                  />
                </div>
              </div>
              {response.circle_image_base64 && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <p style={styles.imgLabel}>Detected Coin Area</p>
                  <img
                    src={`data:image/png;base64,${response.circle_image_base64}`}
                    alt="Detected Coin"
                    style={styles.sideImage}
                  />
                  {response.coin_radius_px && (
                    <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                      Coin radius: {response.coin_radius_px} pixels
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {response.hsv_stats && (
            <div style={styles.hsvBox}>
              <h4>Wound Color Breakdown</h4>
              <p><strong>Red:</strong> {response.hsv_stats.red_area_percent}%</p>
              <p><strong>Yellow:</strong> {response.hsv_stats.yellow_area_percent}%</p>
              <p><strong>Black:</strong> {response.hsv_stats.black_area_percent}%</p>
            </div>
          )}
        </div>
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
    borderRadius: '12px',
    background: '#f2f6fb',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    position: 'relative'
  },
  title: {
    marginBottom: '1.5rem',
    color: '#2a72de'
  },
  uploadBox: {
    display: 'block',
    padding: '1rem',
    border: '2px dashed #aaa',
    borderRadius: '10px',
    background: '#fff',
    cursor: 'pointer',
    marginBottom: '1rem'
  },
  uploadBtn: {
    padding: '12px 24px',
    backgroundColor: '#2a72de',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer'
  },
  resultBox: {
    marginTop: '2rem',
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
  },
  maskImage: {
    marginTop: '1rem',
    width: '100%',
    borderRadius: '8px',
    border: '1px solid #ccc'
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
  hsvBox: {
    marginTop: '1rem',
    backgroundColor: '#fef9f2',
    padding: '1rem',
    border: '1px dashed #ffa726',
    borderRadius: '8px',
    textAlign: 'left',
  },
  previewBox: {
    marginBottom: '1rem',
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    maxHeight: '300px',
    objectFit: 'contain',
    borderRadius: '8px',
    border: '1px solid #ccc',
  },
  imageRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    marginTop: '1rem',
  },
  sideImage: {
    width: '220px',
    height: '220px',
    objectFit: 'contain',
    borderRadius: '8px',
    border: '1px solid #ccc'
  },
  imgLabel: {
      fontWeight: 'bold',
      marginBottom: '0.5rem'
  }
  };

export default UploadPage;
