import { useState, useEffect } from 'react'
import api from '../services/api'

const Dashboard = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true)
        // For now, simulate some mock data until backend is connected
        const mockData = {
          requests: [
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
        }
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800))
        setRequests(mockData.requests || [])
      } catch (err) {
        setError('Error loading requests')
        console.error('Failed to load requests:', err)
      } finally {
        setLoading(false)
      }
    }

    loadRequests()
  }, [])

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'PENDING').length,
    completed: requests.filter(r => r.status === 'COMPLETED').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">{error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="text-sm font-medium text-gray-500">Total Requests</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="card p-6">
          <div className="text-sm font-medium text-gray-500">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </div>
        <div className="card p-6">
          <div className="text-sm font-medium text-gray-500">Completed</div>
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
        </div>
      </div>

      {/* Request List */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Requests</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {requests.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No requests found
            </div>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {request.patient?.first_name} {request.patient?.last_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {request.id}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      request.status === 'PENDING' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : request.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard