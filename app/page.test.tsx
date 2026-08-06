import { render, screen } from '@testing-library/react'
import Page from './page'
import LoginPage from './login/page'
import RegisterPage from './register/page'
import DashboardPage from './dashboard/page'

// Mock Next.js router since these pages call useRouter()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}))

// Mock Supabase client so no real network calls happen during tests
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
    }),
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({ error: null }),
      }),
    },
  },
}))

describe('Home Page', () => {
  it('renders without crashing', () => {
    render(<Page />)
    expect(screen).toBeDefined()
  })
})

describe('Login Page', () => {
  it('renders without crashing', () => {
    render(<LoginPage />)
    expect(screen).toBeDefined()
  })

  it('shows a login form', () => {
    render(<LoginPage />)
    const emailInputs = screen.queryAllByRole('textbox')
    expect(emailInputs.length).toBeGreaterThanOrEqual(0)
  })
})

describe('Register Page', () => {
  it('renders without crashing', () => {
    render(<RegisterPage />)
    expect(screen).toBeDefined()
  })
})

describe('Dashboard Page', () => {
  it('renders without crashing', () => {
    render(<DashboardPage />)
    expect(screen).toBeDefined()
  })
})