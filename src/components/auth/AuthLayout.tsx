import { FC, ReactNode, memo } from 'react'
import { cn } from '../../lib/utils'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  className?: string
}

export const AuthLayout: FC<AuthLayoutProps> = memo(({
  children,
  title,
  subtitle,
  className
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tunely
          </h1>
          <h2 className="text-2xl font-semibold text-gray-900">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className={cn(
          'bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10',
          className
        )}>
          {children}
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          By using Tunely, you agree to our{' '}
          <a href="/terms" className="text-primary-600 hover:text-primary-500">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-primary-600 hover:text-primary-500">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
})

AuthLayout.displayName = 'AuthLayout'