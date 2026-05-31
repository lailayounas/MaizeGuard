import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Leaf } from 'lucide-react';

export default function Login() {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = React.useState('');

  if (user) {
    return <Navigate to="/chatbot" replace />;
  }

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate('/chatbot');
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.message && err.message.includes('network-request-failed')) {
        setError('Network error: Authentication blocked. Please disable any ad-blockers, Brave shields, or tracking protection for this site, and ensure third-party cookies are allowed in your browser.');
      } else if (err.message && err.message.includes('popup-closed-by-user')) {
        setError('Login cancelled. Please leave the popup open until login completes.');
      } else {
        setError(err.message || 'Failed to sign in');
      }
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-xl rounded-3xl overflow-hidden ring-1 ring-slate-200">
          <CardHeader className="space-y-3 bg-gradient-to-br from-brand-700 to-brand-900 text-white text-center py-10">
            <div className="mx-auto bg-white/10 p-3 rounded-full w-max backdrop-blur-md">
              <Leaf className="h-8 w-8 text-brand-300" />
            </div>
            <CardTitle className="text-2xl font-display font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-brand-100">
              Sign in to access your AI farming assistant.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6 bg-white">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                {error}
              </div>
            )}
            
            <Button
              onClick={handleLogin}
              className="w-full h-12 text-base flex justify-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-white bg-slate-900 hover:bg-slate-800"
            >
              Sign in with Google
            </Button>

            <div className="text-center text-sm text-slate-500">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
