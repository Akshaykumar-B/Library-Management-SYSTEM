import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import { RequireAuth } from './components/auth/RequireAuth';
import { supabase } from './db/supabase';
import { Toaster } from './components/ui/toaster';
import Header from './components/common/Header';
import routes from './routes';

export default function App() {
  return (
    <Router>
      <AuthProvider client={supabase}>
        <Toaster />
        <RequireAuth whiteList={["/login"]}>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <Routes>
                {routes.map((route, index) => (
                  <Route
                    key={index}
                    path={route.path}
                    element={route.element}
                  />
                ))}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </RequireAuth>
      </AuthProvider>
    </Router>
  );
}
