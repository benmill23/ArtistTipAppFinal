import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

// Mock useAuth to control auth state
jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}))

import { useAuth } from '../../hooks/useAuth'
import { ProtectedRoute } from './ProtectedRoute'

const TestDashboard = () => <div>Dashboard Content</div>
const TestLogin = () => <div>Login Page</div>

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('shows loading while initializing', () => {
    ;(useAuth as jest.Mock).mockReturnValue({ initialized: false })

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <TestDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument()
  })

  it('redirects unauthenticated users to /login', () => {
    ;(useAuth as jest.Mock).mockReturnValue({ initialized: true, user: null })

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/login" element={<TestLogin />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <TestDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText(/Login Page/i)).toBeInTheDocument()
  })

  it('blocks access if email not verified when required', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      initialized: true,
      user: { email_confirmed_at: null },
    })

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireEmailVerified>
                <TestDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText(/Email Verification Required/i)).toBeInTheDocument()
  })

  it('renders children when authenticated (no email verification required)', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      initialized: true,
      user: { email_confirmed_at: null },
    })

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireEmailVerified={false}>
                <TestDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText(/Dashboard Content/i)).toBeInTheDocument()
  })
})


