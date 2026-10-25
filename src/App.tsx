import { Route, Routes } from 'react-router';
import AdminApp from './admin/AdminApp.tsx';
import UserApp from './UserApp.tsx';

export default function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/*" element={<UserApp />} />
    </Routes>
  );
}
