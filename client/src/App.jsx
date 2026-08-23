import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

import RequestHelp from './pages/customer/RequestHelp';
import TrackingPage from './pages/customer/TrackingPage';
import PaymentPage from './pages/customer/PaymentPage';
import RatingPage from './pages/customer/RatingPage';
import HistoryPage from './pages/customer/HistoryPage';

import Dashboard from './pages/provider/Dashboard';
import IncomingRequests from './pages/provider/IncomingRequests';
import ActiveJob from './pages/provider/ActiveJob';
import JobHistory from './pages/provider/JobHistory';

import ProtectedRoute from './components/layout/ProtectedRoute';
import CustomerLayout from './components/layout/CustomerLayout';
import ProviderLayout from './components/layout/ProviderLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
   
        {/* Customer routes */}
        <Route
          path="/customer"
          element={
            <ProtectedRoute role="customer">
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<RequestHelp />} />
          <Route path="tracking/:id" element={<TrackingPage />} />
          <Route path="payment/:id" element={<PaymentPage />} />
          <Route path="rate/:id" element={<RatingPage />} />
          <Route path="history" element={<HistoryPage />} />
        </Route>

        {/* Provider routes */}
        <Route
          path="/provider"
          element={
            <ProtectedRoute role="provider">
              <ProviderLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="requests" element={<IncomingRequests />} />
          <Route path="job/:id" element={<ActiveJob />} />
          <Route path="history" element={<JobHistory />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;