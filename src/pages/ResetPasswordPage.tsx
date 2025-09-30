import { FC, useState, useCallback, memo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { AuthLayout } from '../components/auth/AuthLayout'
import { useAuth } from '../hooks/useAuth'
import { cn } from '../lib/utils'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

interface ResetPasswordFormData {
  password: string
  confirmPassword: string
}

export const ResetPasswordPage: FC = memo(() => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, updatePassword } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<ResetPasswordFormData>({
    mode: 'onChange',
  })

  const password = watch('password')

  // Detect Supabase recovery (query OR URL hash) and avoid redirecting away
  useEffect(() => {
    // Supabase sends params in the hash by default: #access_token=...&type=recovery
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const hashType = hashParams.get('type')
    const queryType = searchParams.get('type')
    const isRecovery = (hashType || queryType) === 'recovery'

    // If not a recovery flow and already logged in, optionally keep user on dashboard
    // But do NOT redirect during recovery; let the form render even if user is present
    if (!isRecovery && user) {
      navigate('/dashboard')
    }
  }, [user, navigate, searchParams])

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev)
  }, [])

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev)
  }, [])

  const onSubmit = useCallback(async (data: ResetPasswordFormData) => {
    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', {
        message: 'Passwords do not match'
      })
      return
    }

    setIsSubmitting(true)

    try {
      await updatePassword(data.password)
      toast.success('Password updated successfully! Please sign in with your new password.')
      navigate('/login')
    } catch (error: any) {
      console.error('Password update error:', error)
      setError('root', {
        message: error.message || 'Failed to update password. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [updatePassword, navigate, setError])

  const handleBackToLogin = useCallback(() => {
    navigate('/login')
  }, [navigate])

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your new password below."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* New Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <div className="relative">
            <input
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters long'
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                }
              })}
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              className={cn(
                'block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400',
                'focus:outline-none focus:ring-primary-500 focus:border-primary-500',
                'disabled:bg-gray-50 disabled:text-gray-500',
                errors.password && 'border-red-300 focus:border-red-500 focus:ring-red-500'
              )}
              placeholder="Enter your new password"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              disabled={isSubmitting}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match'
              })}
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              className={cn(
                'block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400',
                'focus:outline-none focus:ring-primary-500 focus:border-primary-500',
                'disabled:bg-gray-50 disabled:text-gray-500',
                errors.confirmPassword && 'border-red-300 focus:border-red-500 focus:ring-red-500'
              )}
              placeholder="Confirm your new password"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              disabled={isSubmitting}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Form Error */}
        {errors.root && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white',
            'bg-primary-600 hover:bg-primary-700',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors duration-200'
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Updating Password...
            </>
          ) : (
            'Update Password'
          )}
        </button>

        {/* Back to Login */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleBackToLogin}
            className="text-sm text-primary-600 hover:text-primary-500 focus:outline-none focus:underline"
            disabled={isSubmitting}
          >
            Back to Login
          </button>
        </div>
      </form>
    </AuthLayout>
  )
})

ResetPasswordPage.displayName = 'ResetPasswordPage'