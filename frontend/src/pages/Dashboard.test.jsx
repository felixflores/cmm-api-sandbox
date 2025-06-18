import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Dashboard from './Dashboard'

// Mock the API service
vi.mock('../services/api', () => ({
  default: {
    getRequests: vi.fn()
  }
}))

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders dashboard title', async () => {
    const { default: api } = await import('../services/api')
    api.getRequests.mockResolvedValue({ requests: [] })
    
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument()
    })
  })

  it('displays loading state initially', async () => {
    const { default: api } = await import('../services/api')
    // Make the API call slow to test loading state
    api.getRequests.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ requests: [] }), 100)))
    
    render(<Dashboard />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('displays request list when data is loaded', async () => {
    const mockRequests = [
      {
        id: '1',
        patient: { first_name: 'John', last_name: 'Doe' },
        status: 'PENDING',
        created_at: '2023-01-01T00:00:00Z'
      },
      {
        id: '2', 
        patient: { first_name: 'Jane', last_name: 'Smith' },
        status: 'COMPLETED',
        created_at: '2023-01-02T00:00:00Z'
      }
    ]

    const { default: api } = await import('../services/api')
    api.getRequests.mockResolvedValue({ requests: mockRequests })

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })
  })

  it('displays mock data when component loads', async () => {
    render(<Dashboard />)

    // Should show loading first
    expect(screen.getByText(/loading/i)).toBeInTheDocument()

    // Then show mock data
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })
  })

  it('displays stats summary with mock data', async () => {
    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Total Requests')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('Pending')).toBeInTheDocument()
      expect(screen.getByText('Completed')).toBeInTheDocument()
      
      // Check that there are exactly 2 elements with text "1" (pending and completed counts)
      const oneElements = screen.getAllByText('1')
      expect(oneElements).toHaveLength(2)
    })
  })
})