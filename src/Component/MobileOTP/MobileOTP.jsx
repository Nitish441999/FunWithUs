import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { auth, db } from '../../firebase/firebaseconfig';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';

function MobileOTP() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [userName, setUserName] = useState('John Doe');
  const [userImage, setUserImage] = useState('https://via.placeholder.com/150');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleMobileChange = (e) => setMobileNumber(e.target.value);
  const handleCountryCodeChange = (e) => setCountryCode(e.target.value);
  const handleOtpChange = (e) => setOtp(e.target.value);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        'recaptcha-container',
        {
          size: 'invisible',
          callback: () => onSignInSubmit(), // Call sign-in method once reCAPTCHA is solved
          'expired-callback': () => {
            setError('Recaptcha expired. Please try again.');
          },
        },
        auth
      );
      window.recaptchaVerifier.render(); // This renders the reCAPTCHA widget
    }
  };

  const onSignInSubmit = (e) => {
    e.preventDefault();
    setupRecaptcha(); // Ensure Recaptcha is set up before sending OTP
    const phoneNumber = `${countryCode}${mobileNumber}`;
    const appVerifier = window.recaptchaVerifier;

    signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult; // Store confirmationResult globally
        setVerificationId(confirmationResult.verificationId);
        toast.success('OTP has been sent to your mobile number.');
      })
      .catch((error) => {
        setError(`Error sending OTP: ${error.message}`);
        toast.error(`Error sending OTP: ${error.message}`);
      });
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    const code = otp;

    try {
      const result = await window.confirmationResult.confirm(code);
      const user = result.user;
      toast.success('Phone number verified successfully.');

      // Save user data to Firestore
      await addDoc(collection(db, 'users'), {
        phoneNumber: `${countryCode}${mobileNumber}`,
        userName,
        userImage,
      });
      toast.success('User data saved to Firestore.');

      // Clear the form
      setMobileNumber('');
      setOtp('');
      setVerificationId('');

      // Navigate to the ChatBox page
      navigate('/chatBox');
    } catch (error) {
      setError(`Error verifying OTP: ${error.message}`);
      toast.error(`Error verifying OTP: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <ToastContainer />
      <div id="recaptcha-container"></div>
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <div className="flex flex-col items-center">
          <img src={userImage} alt="User" className="w-24 h-24 rounded-full mb-4" />
          <h2 className="text-xl font-semibold mb-6">{userName}</h2>
        </div>
        <form onSubmit={verificationId ? verifyOtp : onSignInSubmit}>
          <div className="mb-4">
            <label htmlFor="countryCode" className="block text-sm font-medium text-gray-700">
              Country Code
            </label>
            <select
              id="countryCode"
              value={countryCode}
              onChange={handleCountryCodeChange}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="+91">+91 (India)</option>
              <option value="+1">+1 (USA)</option>
              <option value="+44">+44 (UK)</option>
              {/* Add more country codes as needed */}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
              Mobile Number
            </label>
            <input
              type="tel"
              id="mobileNumber"
              value={mobileNumber}
              onChange={handleMobileChange}
              placeholder="Enter mobile number"
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
              disabled={verificationId}
            />
          </div>
          {verificationId && (
            <div className="mb-4">
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                OTP
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={handleOtpChange}
                placeholder="Enter OTP"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {verificationId ? 'Verify OTP' : 'Send OTP'}
          </button>
          {error && <p className="mt-4 text-red-600">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default MobileOTP;
