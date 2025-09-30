import { FC, useState, useCallback, memo, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { cn } from '../../lib/utils'
import { useAuth } from '../../hooks/useAuth'
import { isValidUsername, isUsernameAvailable, validatePassword, isValidAge } from '../../lib/auth'
import { Loader2, Eye, EyeOff, Check, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  username: string
  artist_name: string
  birthday: string
}

interface RegisterFormProps {
  onSuccess?: () => void
  className?: string
}

enum Step {
  ACCOUNT = 1,
  PROFILE = 2,
  VALIDATION = 3,
}

export const RegisterForm: FC<RegisterFormProps> = memo(({
  onSuccess,
  className
}) => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.ACCOUNT)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [usernameChecking, setUsernameChecking] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const { signUp } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    watch,
    trigger,
  } = useForm<RegisterFormData>({
    mode: 'onChange',
  })

  const watchedUsername = watch('username')
  const watchedPassword = watch('password')
  const watchedBirthday = watch('birthday')

  // Username validation
  useEffect(() => {
    if (!watchedUsername || watchedUsername.length < 3) {
      setUsernameAvailable(null)
      return
    }

    if (!isValidUsername(watchedUsername)) {
      setUsernameAvailable(false)
      return
    }

    const checkUsername = async () => {
      setUsernameChecking(true)
      try {
        const available = await isUsernameAvailable(watchedUsername)
        setUsernameAvailable(available)
      } catch (error) {
        console.error('Username check error:', error)
        setUsernameAvailable(false)
      } finally {
        setUsernameChecking(false)
      }
    }

    const debounce = setTimeout(checkUsername, 500)
    return () => clearTimeout(debounce)
  }, [watchedUsername])

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev)
  }, [])

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev)
  }, [])

  const nextStep = useCallback(async () => {
    if (currentStep === Step.ACCOUNT) {
      const accountValid = await trigger(['email', 'password', 'confirmPassword'])
      if (accountValid) {
        setCurrentStep(Step.PROFILE)
      }
    } else if (currentStep === Step.PROFILE) {
      const profileValid = await trigger(['username', 'artist_name', 'birthday'])
      if (profileValid && usernameAvailable) {
        setCurrentStep(Step.VALIDATION)
      }
    }
  }, [currentStep, trigger, usernameAvailable])

  const prevStep = useCallback(() => {
    if (currentStep > Step.ACCOUNT) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const onSubmit = useCallback(async (data: RegisterFormData) => {
    setIsSubmitting(true)

    try {
      // Final validations
      if (!isValidAge(data.birthday)) {
        setError('birthday', { message: 'You must be 18 or older to register' })
        setCurrentStep(Step.PROFILE)
        return
      }

      const passwordValidation = validatePassword(data.password)
      if (!passwordValidation.isValid) {
        setError('password', { message: passwordValidation.errors[0] })
        setCurrentStep(Step.ACCOUNT)
        return
      }

      if (!usernameAvailable) {
        setError('username', { message: 'Username is not available' })
        setCurrentStep(Step.PROFILE)
        return
      }

      await signUp({
        email: data.email,
        password: data.password,
        username: data.username,
        artist_name: data.artist_name,
        birthday: data.birthday,
      })

      onSuccess?.()
    } catch (error: any) {
      console.error('Registration error:', error)

      if (error.message?.includes('already registered')) {
        setError('email', { message: 'This email is already registered' })
        setCurrentStep(Step.ACCOUNT)
      } else {
        setError('root', {
          message: error.message || 'An error occurred during registration. Please try again.'
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [signUp, onSuccess, setError, usernameAvailable])

  const getPasswordStrength = useCallback((password: string) => {
    if (!password) return { score: 0, label: '' }

    const validation = validatePassword(password)
    const score = 5 - validation.errors.length

    if (score <= 1) return { score, label: 'Very Weak', color: 'bg-red-500' }
    if (score === 2) return { score, label: 'Weak', color: 'bg-orange-500' }
    if (score === 3) return { score, label: 'Fair', color: 'bg-yellow-500' }
    if (score === 4) return { score, label: 'Good', color: 'bg-blue-500' }
    return { score, label: 'Strong', color: 'bg-green-500' }
  }, [])

  const passwordStrength = getPasswordStrength(watchedPassword || '')

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[Step.ACCOUNT, Step.PROFILE, Step.VALIDATION].map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              currentStep >= step
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-400'
            )}
          >
            {step}
          </div>
          {index < 2 && (
            <div
              className={cn(
                'w-12 h-0.5 mx-2',
                currentStep > step ? 'bg-primary-600' : 'bg-gray-200'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )

  const renderAccountStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Create Your Account</h3>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email address
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          autoComplete="email"
          className={cn(
            'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400',
            'focus:outline-none focus:ring-primary-500 focus:border-primary-500',
            errors.email && 'border-red-300 focus:border-red-500 focus:ring-red-500'
          )}
          placeholder="Enter your email"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="new-password"
            className={cn(
              'block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400',
              'focus:outline-none focus:ring-primary-500 focus:border-primary-500',
              errors.password && 'border-red-300 focus:border-red-500 focus:ring-red-500'
            )}
            placeholder="Create a password"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>

        {/* Password Strength */}
        {watchedPassword && (
          <div className="mt-2">
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    passwordStrength.color
                  )}
                  style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-600">{passwordStrength.label}</span>
            </div>
          </div>
        )}

        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm password
        </label>
        <div className="relative">
          <input
            {...register('confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            autoComplete="new-password"
            className={cn(
              'block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400',
              'focus:outline-none focus:ring-primary-500 focus:border-primary-500',
              errors.confirmPassword && 'border-red-300 focus:border-red-500 focus:ring-red-500'
            )}
            placeholder="Confirm your password"
          />
          <button
            type="button"
            onClick={toggleConfirmPasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
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
    </div>
  )

  const renderProfileStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
      </div>

      {/* Username */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Username
        </label>
        <div className="relative">
          <input
            {...register('username')}
            type="text"
            id="username"
            className={cn(
              'block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400',
              'focus:outline-none focus:ring-primary-500 focus:border-primary-500',
              errors.username && 'border-red-300 focus:border-red-500 focus:ring-red-500',
              usernameAvailable === false && 'border-red-300 focus:border-red-500 focus:ring-red-500',
              usernameAvailable === true && 'border-green-300 focus:border-green-500 focus:ring-green-500'
            )}
            placeholder="Choose a username"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {usernameChecking ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            ) : usernameAvailable === true ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : usernameAvailable === false ? (
              <X className="h-4 w-4 text-red-500" />
            ) : null}
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          This will be your URL: tunely.com/{watchedUsername || 'username'}
        </p>
        {errors.username && (
          <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
        )}
        {usernameAvailable === false && !errors.username && (
          <p className="mt-1 text-sm text-red-600">Username is not available</p>
        )}
      </div>

      {/* Artist Name */}
      <div>
        <label htmlFor="artist_name" className="block text-sm font-medium text-gray-700 mb-1">
          Artist Name
        </label>
        <input
          {...register('artist_name')}
          type="text"
          id="artist_name"
          className={cn(
            'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400',
            'focus:outline-none focus:ring-primary-500 focus:border-primary-500',
            errors.artist_name && 'border-red-300 focus:border-red-500 focus:ring-red-500'
          )}
          placeholder="Your stage/artist name"
        />
        {errors.artist_name && (
          <p className="mt-1 text-sm text-red-600">{errors.artist_name.message}</p>
        )}
      </div>

      {/* Birthday */}
      <div>
        <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 mb-1">
          Birthday
        </label>
        <input
          {...register('birthday')}
          type="date"
          id="birthday"
          className={cn(
            'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
            'focus:outline-none focus:ring-primary-500 focus:border-primary-500',
            errors.birthday && 'border-red-300 focus:border-red-500 focus:ring-red-500'
          )}
        />
        <p className="mt-1 text-xs text-gray-500">You must be 18 or older to register</p>
        {errors.birthday && (
          <p className="mt-1 text-sm text-red-600">{errors.birthday.message}</p>
        )}
        {!!watchedBirthday && !isValidAge(watchedBirthday) && (
          <p className="mt-1 text-sm text-red-600">You must be 18 or older to register</p>
        )}
      </div>
    </div>
  )

  const renderValidationStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Review & Submit</h3>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <div>
          <span className="text-sm font-medium text-gray-700">Email:</span>
          <span className="ml-2 text-sm text-gray-900">{watch('email')}</span>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-700">Username:</span>
          <span className="ml-2 text-sm text-gray-900">{watch('username')}</span>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-700">Artist Name:</span>
          <span className="ml-2 text-sm text-gray-900">{watch('artist_name')}</span>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-700">Birthday:</span>
          <span className="ml-2 text-sm text-gray-900">{watch('birthday')}</span>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          After registration, you'll receive an email verification link. You'll also be guided through
          setting up your Stripe Connect account to receive payments.
        </p>
      </div>
    </div>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
      {renderStepIndicator()}

      {currentStep === Step.ACCOUNT && renderAccountStep()}
      {currentStep === Step.PROFILE && renderProfileStep()}
      {currentStep === Step.VALIDATION && renderValidationStep()}

      {/* Form Error */}
      {errors.root && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-600">{errors.root.message}</p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === Step.ACCOUNT}
          className={cn(
            'flex items-center px-4 py-2 text-sm font-medium rounded-md border',
            currentStep === Step.ACCOUNT
              ? 'border-gray-300 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
          )}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </button>

        {currentStep < Step.VALIDATION ? (
          <button
            type="button"
            onClick={nextStep}
            disabled={
              (currentStep === Step.PROFILE && !usernameAvailable) ||
              (currentStep === Step.PROFILE && !!watchedBirthday && !isValidAge(watchedBirthday))
            }
            className={cn(
              'flex items-center px-4 py-2 text-sm font-medium text-white rounded-md',
              'bg-primary-600 hover:bg-primary-700',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'flex items-center px-6 py-2 text-sm font-medium text-white rounded-md',
              'bg-primary-600 hover:bg-primary-700',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        )}
      </div>
    </form>
  )
})

RegisterForm.displayName = 'RegisterForm'