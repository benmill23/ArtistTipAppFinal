import React, { useState, useEffect } from 'react';
import { createConnectAccount, getArtistAccountStatus } from '../../lib/stripe-service';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export function ArtistOnboarding() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [accountStatus, setAccountStatus] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (user) {
      checkAccountStatus();
    }
  }, [user]);

  const checkAccountStatus = async () => {
    if (!user) return;

    setIsChecking(true);
    try {
      const status = await getArtistAccountStatus(user.id);
      setAccountStatus(status);
    } catch (error) {
      console.error('Error checking account status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleStartOnboarding = async () => {
    setIsLoading(true);
    try {
      const result = await createConnectAccount({
        returnUrl: `${window.location.origin}/dashboard/artist/onboarding/complete`,
        refreshUrl: `${window.location.origin}/dashboard/artist/onboarding`,
      });

      // Redirect to Stripe onboarding
      window.location.href = result.url;
    } catch (error) {
      console.error('Error starting onboarding:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start onboarding');
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (accountStatus?.charges_enabled) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Your account is ready!
            </h3>
            <p className="text-gray-600 mb-4">
              You can now accept tips from fans. Your payouts will be sent daily to your bank account.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Charges</p>
                <p className="font-medium text-green-600">
                  {accountStatus.charges_enabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Payouts</p>
                <p className="font-medium text-green-600">
                  {accountStatus.payouts_enabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
            <button
              onClick={handleStartOnboarding}
              disabled={isLoading}
              className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Update account details
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (accountStatus && !accountStatus.onboarding_completed) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <XCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Complete your setup
            </h3>
            <p className="text-gray-600 mb-4">
              You started the onboarding process but haven't finished yet. Complete your Stripe account setup to start accepting tips.
            </p>
            <button
              onClick={handleStartOnboarding}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {isLoading ? 'Loading...' : 'Continue Setup'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Start Accepting Tips
      </h3>
      <p className="text-gray-600 mb-6">
        Connect your bank account to start receiving tips from fans. The setup process is quick and secure, powered by Stripe.
      </p>

      <div className="space-y-4 mb-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Daily payouts</p>
            <p className="text-sm text-gray-600">Get paid automatically every day</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Secure payments</p>
            <p className="text-sm text-gray-600">Industry-leading security from Stripe</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Low platform fee</p>
            <p className="text-sm text-gray-600">Only 1% platform fee + Stripe fees</p>
          </div>
        </div>
      </div>

      <button
        onClick={handleStartOnboarding}
        disabled={isLoading}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
      >
        {isLoading ? 'Loading...' : 'Connect Your Bank Account'}
      </button>

      <p className="mt-4 text-xs text-gray-500 text-center">
        By continuing, you agree to Stripe's{' '}
        <a href="https://stripe.com/connect-account/legal" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          Connected Account Agreement
        </a>
      </p>
    </div>
  );
}
