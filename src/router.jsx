import { Routes, Route } from 'react-router-dom';

import Index from './pages/index';
import Other from './pages/other';

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/other" element={<Other />} />
    </Routes>
  );
}

export default Router;
