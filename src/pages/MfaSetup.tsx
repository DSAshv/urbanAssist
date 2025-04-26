import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { QrCode, Copy, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MfaSetup: React.FC = () => {
  const [qrCode, setQrCode] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const generateMfaSecret = async () => {
      try {
        const response = await fetch('/api/auth/mfa/setup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to generate MFA secret');

        const data = await response.json();
        setQrCode(data.qrCode);
        setBackupCodes(data.backupCodes);
      } catch (error) {
        toast.error('Failed to set up MFA. Please try again.');
      }
    };

    generateMfaSecret();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ code: verificationCode }),
      });

      if (!response.ok) throw new Error('Invalid verification code');

      toast.success('MFA setup complete!');
      navigate('/app/dashboard');
    } catch (error) {
      toast.error('Invalid verification code. Please try again.');
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Backup codes copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <QrCode className="h-12 w-12 text-indigo-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Set up Two-Factor Authentication
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enhance your account security with 2FA
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {qrCode && (
              <div>
                <h3 className="text-lg font-medium text-gray-900">1. Scan QR Code</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Scan this QR code with your authenticator app
                </p>
                <div className="flex justify-center">
                  <img src={qrCode} alt="QR Code" className="h-48 w-48" />
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-medium text-gray-900">2. Save Backup Codes</h3>
              <p className="text-sm text-gray-500 mb-4">
                Store these backup codes in a safe place. You'll need them if you lose access to your authenticator app.
              </p>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="font-mono text-sm">{code}</div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={copyBackupCodes}
                  className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copied ? 'Copied!' : 'Copy codes'}
                </button>
              </div>
            </div>

            <form onSubmit={handleVerify}>
              <div>
                <h3 className="text-lg font-medium text-gray-900">3. Verify Setup</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Enter the verification code from your authenticator app
                </p>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  maxLength={6}
                  pattern="\d{6}"
                  required
                />
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Verify and Enable 2FA
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MfaSetup;