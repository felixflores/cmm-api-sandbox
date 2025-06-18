import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Requests from './pages/Requests'
import RequestBuilder from './pages/RequestBuilder'
import TokenManagement from './pages/TokenManagement'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><Dashboard /></Layout>} />
      <Route path="/requests" element={<Layout><Requests /></Layout>} />
      <Route path="/requests/new" element={<Layout><RequestBuilder /></Layout>} />
      <Route path="/requests/:id" element={<Layout><div>Request Details</div></Layout>} />
      <Route path="/tokens" element={<Layout><TokenManagement /></Layout>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App