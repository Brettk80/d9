import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

interface GoogleDriveButtonProps {
  onSuccess: (response: any) => void;
  isDevelopment?: boolean;
}

const GoogleDriveButton: React.FC<GoogleDriveButtonProps> = ({ 
  onSuccess, 
  isDevelopment = false 
}) => {
  const handleDevelopmentLogin = () => {
    // Mock successful login for development
    onSuccess({
      credential: 'mock-credential-for-development',
      clientId: 'mock-client-id',
      select_by: 'user'
    });
  };

  if (isDevelopment) {
    return (
      <button
        onClick={handleDevelopmentLogin}
        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
          <path
            d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
            fill="#4285F4"
          />
        </svg>
        Connect Google Drive
      </button>
    );
  }

  return (
    <GoogleLogin
      onSuccess={onSuccess}
      onError={() => console.log('Login Failed')}
      useOneTap
      theme="outline"
      text="continue_with"
      shape="rectangular"
      logo_alignment="left"
      width="250"
    />
  );
};

export default GoogleDriveButton;
