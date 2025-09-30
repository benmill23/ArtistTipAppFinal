import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { PaymentForm } from './PaymentForm';
import { createPaymentIntent } from '../../lib/stripe-service';
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  artistId: string;
  artistName: string;
  sessionCode?: string;
}

export function TipModal({ isOpen, onClose, artistId, artistName, sessionCode }: TipModalProps) {
  const [step, setStep] = useState<'amount' | 'details' | 'payment'>('amount');
  const [amount, setAmount] = useState<number>(1000); // $10 default
  const [customAmount, setCustomAmount] = useState('');
  const [songRequest, setSongRequest] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerMessage, setCustomerMessage] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const presetAmounts = [1000, 2000, 5000, 10000]; // $10, $20, $50, $100

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setStep('amount');
      setAmount(1000);
      setCustomAmount('');
      setSongRequest('');
      setCustomerName('');
      setCustomerMessage('');
      setClientSecret('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setCustomAmount('');
  };

  const handleCustomAmount = (value: string) => {
    const dollars = parseFloat(value);
    if (!isNaN(dollars) && dollars > 0) {
      setAmount(Math.round(dollars * 100));
      setCustomAmount(value);
    }
  };

  const handleNextStep = () => {
    if (step === 'amount') {
      if (amount < 1000) {
        toast.error('Minimum tip is $10');
        return;
      }
      if (amount > 50000) {
        toast.error('Maximum tip is $500');
        return;
      }
      setStep('details');
    } else if (step === 'details') {
      handleCreatePayment();
    }
  };

  const handleCreatePayment = async () => {
    setIsLoading(true);
    try {
      const result = await createPaymentIntent({
        artistId,
        amount,
        songRequest: songRequest || undefined,
        customerName: customerName || undefined,
        customerMessage: customerMessage || undefined,
        sessionCode,
      });

      setClientSecret(result.clientSecret);
      setStep('payment');
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success('Thank you for your tip!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {step === 'amount' && 'Choose Tip Amount'}
            {step === 'details' && 'Add Details'}
            {step === 'payment' && 'Complete Payment'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 'amount' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select or enter amount
                </label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handleAmountSelect(preset)}
                      className={`p-4 rounded-lg border-2 font-semibold transition ${
                        amount === preset && !customAmount
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      ${(preset / 100).toFixed(0)}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                    $
                  </span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => handleCustomAmount(e.target.value)}
                    placeholder="Custom amount"
                    min="10"
                    max="500"
                    step="1"
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none text-lg"
                  />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Minimum $10, Maximum $500
                </p>
              </div>

              <button
                onClick={handleNextStep}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Continue
              </button>
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Song Request (Optional)
                </label>
                <input
                  type="text"
                  value={songRequest}
                  onChange={(e) => setSongRequest(e.target.value)}
                  placeholder="e.g., Wonderwall by Oasis"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Anonymous"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={customerMessage}
                  onChange={(e) => setCustomerMessage(e.target.value)}
                  placeholder="Leave a message for the artist"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none resize-none"
                  maxLength={200}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('amount')}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : `Continue to Payment`}
                </button>
              </div>
            </div>
          )}

          {step === 'payment' && clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#2563eb',
                  },
                },
              }}
            >
              <PaymentForm
                amount={amount}
                artistName={artistName}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setStep('details')}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}
