import { FC, useState, useCallback, memo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { AuthLayout } from '../components/auth/AuthLayout'
import { LoginForm } from '../components/auth/LoginForm'
import { useAuth } from '../hooks/useAuth'
import { cn } from '../lib/utils'

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

const ForgotPasswordModal: FC<ForgotPasswordModalProps> = memo(({ isOpen, onClose }) => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    try {
      await resetPassword(email)
      toast.success('Password reset email sent! Check your inbox.')
      onClose()
      setEmail('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email')
    } finally {
      setIsSubmitting(false)
    }
  }, [email, resetPassword, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Reset Password</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                id="reset-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !email}
                className={cn(
                  'px-4 py-2 text-sm font-medium text-white rounded-md',
                  'bg-primary-600 hover:bg-primary-700',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Email'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
})

ForgotPasswordModal.displayName = 'ForgotPasswordModal'

export const LoginPage: FC = memo(() => {
  const navigate = useNavigate()
  const { user, initialized } = useAuth()
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (initialized && user) {
      navigate('/dashboard')
    }
  }, [user, initialized, navigate])

  const handleLoginSuccess = useCallback(() => {
    navigate('/dashboard')
  }, [navigate])

  const handleForgotPassword = useCallback(() => {
    setShowForgotPassword(true)
  }, [])

  const handleCloseForgotPassword = useCallback(() => {
    setShowForgotPassword(false)
  }, [])

  const handleSignUpRedirect = useCallback(() => {
    navigate('/signup')
  }, [navigate])

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <AuthLayout
        title="Sign in to your account"
        subtitle="Welcome back! Please enter your details."
      >
        <LoginForm
          onSuccess={handleLoginSuccess}
          onForgotPassword={handleForgotPassword}
        />

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">New to Tunely?</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSignUpRedirect}
              className="w-full flex justify-center py-2 px-4 border border-primary-600 rounded-md shadow-sm text-sm font-medium text-primary-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Create an account
            </button>
          </div>
        </div>
      </AuthLayout>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={handleCloseForgotPassword}
      />
    </>
  )
})

LoginPage.displayName = 'LoginPage'