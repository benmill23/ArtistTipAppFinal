import { FC, useState, useCallback, memo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { cn } from '../../lib/utils'
import { useAuth } from '../../hooks/useAuth'
import { Loader2, Eye, EyeOff } from 'lucide-react'

interface LoginFormData {
  email: string
  password: string
  rememberMe?: boolean
}

interface LoginFormProps {
  onSuccess?: () => void
  onForgotPassword?: () => void
  className?: string
}

export const LoginForm: FC<LoginFormProps> = memo(({
  onSuccess,
  onForgotPassword,
  className
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { signIn } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    mode: 'onChange',
  })

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev)
  }, [])

  const onSubmit = useCallback(async (data: LoginFormData) => {
    setIsSubmitting(true)

    try {
      await signIn(data.email, data.password)
      onSuccess?.()
    } catch (error: any) {
      console.error('Login error:', error)

      // Handle specific error cases
      if (error.message?.includes('Invalid login credentials')) {
        setError('root', {
          message: 'Invalid email or password. Please try again.'
        })
      } else if (error.message?.includes('Email not confirmed')) {
        setError('root', {
          message: 'Please check your email and click the verification link before signing in.'
        })
      } else {
        setError('root', {
          message: error.message || 'An error occurred during sign in. Please try again.'
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [signIn, onSuccess, setError])

  const handleForgotPassword = useCallback(() => {
    onForgotPassword?.()
  }, [onForgotPassword])

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('space-y-6', className)}
    >
      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email address
        </label>
        <input
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Please enter a valid email address'
            }
          })}
          type="email"
          id="email"
          autoComplete="email"
          className={cn(
            'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400',
            'focus:outline-none focus:ring-primary-500 focus:border-primary-500',
            'disabled:bg-gray-50 disabled:text-gray-500',
            errors.email && 'border-red-300 focus:border-red-500 focus:ring-red-500'
          )}
          placeholder="Enter your email"
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            {...register('password', {
              required: 'Password is required'
            })}
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            className={cn(
              'block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400',
              'focus:outline-none focus:ring-primary-500 focus:border-primary-500',
              'disabled:bg-gray-50 disabled:text-gray-500',
              errors.password && 'border-red-300 focus:border-red-500 focus:ring-red-500'
            )}
            placeholder="Enter your password"
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

      {/* Remember Me and Forgot Password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            {...register('rememberMe')}
            id="rememberMe"
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            disabled={isSubmitting}
          />
          <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
            Remember me
          </label>
        </div>

        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-sm text-primary-600 hover:text-primary-500 focus:outline-none focus:underline"
          disabled={isSubmitting}
        >
          Forgot password?
        </button>
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
            Signing in...
          </>
        ) : (
          'Sign in'
        )}
      </button>
    </form>
  )
})

LoginForm.displayName = 'LoginForm'