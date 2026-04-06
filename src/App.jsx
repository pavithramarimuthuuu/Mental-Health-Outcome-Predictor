import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Assessment from './pages/Assessment';
import TestFlow from './pages/TestFlow';
import Results from './pages/Results';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import FocusZone from './pages/FocusZone';
import SelfCare from './pages/SelfCare';
import Tests from './pages/Tests';
import Feedback from './pages/Feedback';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<Navigate to="/tests" replace />} />

        <Route element={<Layout />}>
          <Route path="/tests" element={<Tests />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/assessment/:testId" element={<TestFlow />} />
          <Route path="/results" element={<Results />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/focus-zone" element={<FocusZone />} />
          <Route path="/self-care" element={<SelfCare />} />
          <Route path="/feedback" element={<Feedback />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
