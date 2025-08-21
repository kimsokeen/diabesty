import React, { useState, useEffect } from 'react';
import { getAuth, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

/**
 * A React component for uploading images, sending them to an API for analysis,
 * and displaying the results, including a confidence level. This version uses Firestore
 * for data persistence as Supabase client setup is not available in this environment.
 */
function UploadPage() {
  const [image, setImage] = useState(null);
  const [response, setResponse] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [loading, setLoading] = useState(false);
  const [firebaseApp, setFirebaseApp] = useState(null);
  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState('');

  // Initialize Firebase and authenticate the user
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const firestore = getFirestore(app);

        // Authenticate using the provided token or anonymously
        if (typeof __initial_auth_token !== 'undefined') {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }

        const currentUserId = auth.currentUser?.uid || crypto.randomUUID();
        setUserId(currentUserId);
        setFirebaseApp(app);
        setDb(firestore);
      } catch (e) {
        console.error("Firebase initialization failed:", e);
        setMessage("Failed to initialize the app. Please try again.");
      }
    };
    initializeFirebase();
  }, []);

  /**
   * Handles the file selection from the input field.
   * Creates a local URL for image preview.
   * @param {Event} e The change event from the file input.
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewURL(URL.createObjectURL(file));
      setResponse(null);
      setMessage('');
    }
  };

  /**
   * Handles the image upload and analysis process.
   * 1. Sends the image to the FastAPI backend.
   * 2. Saves the analysis results, including the confidence score, to the Firestore database.
   */
  const handleUpload = async () => {
    if (!image) {
      setMessage('Please select an image to upload.');
      return;
    }

    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', image);

    try {
      // 🌐 Step 1: Send image to FastAPI backend for analysis
      const res = await fetch('https://diabesty-backend-2.onrender.com/upload/', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.statusText}`);
      }

      const data = await res.json();
      setResponse(data);

      // 🕒 Step 2: Save results to the Firestore database
      if (db && userId) {
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const docRef = await addDoc(collection(db, `artifacts/${appId}/users/${userId}/results`), {
          prediction: data.prediction,
          confidence_score: data.confidence_score,
          wound_area: data.wound_area_cm2 || 0,
          hsv_stats: data.hsv_stats,
          date: new Date().toISOString(),
          // Note: Image upload to Supabase is not supported in this environment.
          // The imageUrl is a placeholder for demonstration.
          image_url: "https://placehold.co/220x220/E0E0E0/555555?text=Uploaded+Image",
        });
        setMessage('✅ Result successfully saved to the database!');
        console.log("Document written with ID: ", docRef.id);
      } else {
        setMessage('Database not ready. Please try again.');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setMessage(`Upload failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format prediction and determine icon
  const formatPrediction = (prediction) => {
    switch (prediction) {
      case 'Wound':
        return { text: 'Wound Detected', icon: '🔴' };
      case 'No Wound':
        return { text: 'No Wound Detected', icon: '🟢' };
      default:
        return { text: prediction, icon: '' };
    }
  };
  
  const formattedPrediction = response ? formatPrediction(response.prediction) : null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 font-sans">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {/* Back button (disabled in this environment) */}
        <button
          onClick={() => setMessage('Navigation is disabled in this demo.')}
          className="absolute top-4 left-4 text-blue-600 hover:text-blue-800 transition-colors"
        >
          ←
        </button>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-blue-700">Upload Foot Image</h2>
        <p className="text-gray-500 text-center">
          Select an image of a foot to analyze for potential wounds.
        </p>
        
        {/* Status Message */}
        {message && (
          <div className={`p-3 rounded-lg text-sm text-center font-medium ${
            message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Image upload box */}
        <label className="flex flex-col items-center justify-center w-full h-48 border-4 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <span className="text-5xl text-gray-400 mb-2">☁️</span>
          <p className="text-sm text-gray-500">
            {image ? image.name : 'Click to select an image'}
          </p>
        </label>

        {/* Image Preview */}
        {previewURL && (
          <div className="flex justify-center my-4">
            <img
              src={previewURL}
              alt="Preview"
              className="rounded-lg shadow-md max-h-64 object-contain"
            />
          </div>
        )}

        {/* Analyze button */}
        <button
          onClick={handleUpload}
          disabled={!image || loading}
          className={`w-full py-3 px-6 rounded-xl font-bold text-white transition-all transform ${
            !image || loading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
          }`}
        >
          {loading ? 'Analyzing...' : 'Analyze Image'}
        </button>

        {/* Results section */}
        {response && (
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 border border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-800 flex items-center justify-center gap-2">
              <span className="text-blue-600">Prediction Result</span>
            </h3>

            {/* Prediction and confidence display */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-lg font-medium text-gray-700 flex items-center gap-2 mb-2">
                <strong>Status:</strong> {formattedPrediction.icon} {formattedPrediction.text}
              </p>
              {response.confidence_score !== undefined && (
                <p className="text-lg font-medium text-gray-700">
                  <strong>Confidence Level:</strong>
                  <span className="ml-2 font-bold text-blue-600">
                    {(response.confidence_score * 100).toFixed(2)}%
                  </span>
                </p>
              )}
            </div>

            {/* Wound area and image comparison */}
            {response.wound_area_pixels !== undefined && (
              <div className="space-y-4">
                {response.wound_area_cm2 !== undefined && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <p className="text-lg font-medium text-gray-700">
                      <strong>Estimated Real Wound Area:</strong>
                      <span className="ml-2 font-bold text-gray-900">
                        {response.wound_area_cm2} cm²
                      </span>
                    </p>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <div className="flex flex-col items-center">
                    <p className="font-bold mb-2">Original</p>
                    <img src={previewURL} alt="Original" className="w-full h-48 object-contain rounded-lg border border-gray-300" />
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="font-bold mb-2">Wound Mask</p>
                    <img
                      src={`data:image/png;base64,${response.mask_base64}`}
                      alt="Wound Mask"
                      className="w-full h-48 object-contain rounded-lg border border-gray-300"
                    />
                  </div>
                </div>

                {response.circle_image_base64 && (
                  <div className="flex flex-col items-center text-center mt-4">
                    <p className="font-bold mb-2">Detected Coin Area</p>
                    <img
                      src={`data:image/png;base64,${response.circle_image_base64}`}
                      alt="Detected Coin"
                      className="w-full h-48 object-contain rounded-lg border border-gray-300"
                    />
                    {response.coin_radius_px && (
                      <p className="text-sm text-gray-500 mt-2">
                        Coin radius: {response.coin_radius_px} pixels
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* HSV stats breakdown */}
            {response.hsv_stats && (
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="text-lg font-semibold text-orange-600 mb-2">Wound Color Breakdown</h4>
                <div className="space-y-1 text-gray-700">
                  <p>
                    <strong>Red:</strong>
                    <span className="ml-2 font-bold">{response.hsv_stats.red_area_percent}%</span>
                  </p>
                  <p>
                    <strong>Yellow:</strong>
                    <span className="ml-2 font-bold">{response.hsv_stats.yellow_area_percent}%</span>
                  </p>
                  <p>
                    <strong>Black:</strong>
                    <span className="ml-2 font-bold">{response.hsv_stats.black_area_percent}%</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadPage;
