import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

describe('App Router', () => {
  it('renders dashboard on root path', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })

  it('renders NotFound page for invalid routes', () => {
    render(
      <MemoryRouter initialEntries={['/invalid-route']}>
        <App />
      </MemoryRouter>
    )
    
    expect(screen.getByText('Page Not Found')).toBeInTheDocument()
  })

  it('navigates to requests page', () => {
    render(
      <MemoryRouter initialEntries={['/requests']}>
        <App />
      </MemoryRouter>
    )
    
    expect(screen.getByText('Request list view will be implemented here.')).toBeInTheDocument()
  })

  it('navigates to token management page', () => {
    render(
      <MemoryRouter initialEntries={['/tokens']}>
        <App />
      </MemoryRouter>
    )
    
    expect(screen.getByText('Token management interface will be implemented here.')).toBeInTheDocument()
  })

  it('navigates to request builder page', () => {
    render(
      <MemoryRouter initialEntries={['/requests/new']}>
        <App />
      </MemoryRouter>
    )
    
    expect(screen.getByText('Request builder wizard will be implemented here.')).toBeInTheDocument()
  })
})