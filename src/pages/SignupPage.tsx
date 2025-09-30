import { FC, useCallback, memo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/auth/AuthLayout'
import { RegisterForm } from '../components/auth/RegisterForm'
import { useAuth } from '../hooks/useAuth'

export const SignupPage: FC = memo(() => {
  const navigate = useNavigate()
  const { user, initialized } = useAuth()

  // Redirect if already authenticated
  useEffect(() => {
    if (initialized && user) {
      navigate('/dashboard')
    }
  }, [user, initialized, navigate])

  const handleRegistrationSuccess = useCallback(() => {
    // After successful registration, user will need to verify email
    // and set up Stripe Connect, so redirect to a success page or login
    navigate('/login?message=registration-success')
  }, [navigate])

  const handleLoginRedirect = useCallback(() => {
    navigate('/login')
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
    <AuthLayout
      title="Create your account"
      subtitle="Start receiving tips from your audience today."
      className="max-w-lg"
    >
      <RegisterForm onSuccess={handleRegistrationSuccess} />

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Already have an account?</span>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleLoginRedirect}
            className="w-full flex justify-center py-2 px-4 border border-primary-600 rounded-md shadow-sm text-sm font-medium text-primary-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Sign in instead
          </button>
        </div>
      </div>
    </AuthLayout>
  )
})

SignupPage.displayName = 'SignupPage'