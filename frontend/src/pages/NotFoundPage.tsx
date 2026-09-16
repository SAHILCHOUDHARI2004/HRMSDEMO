import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
      <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-6">
        <Sparkles className="w-8 h-8 text-blue-400" />
      </div>

      <h1 className="text-7xl font-extrabold tracking-tight font-mono text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
        404
      </h1>
      <h2 className="text-2xl font-bold mt-4">Page Not Found</h2>
      <p className="text-slate-400 text-sm max-w-md mt-2 mb-8">
        The requested URL could not be found on the Aivan HRMS enterprise portal. Please verify the URL or return to your dashboard.
      </p>

      <Link to="/">
        <Button variant="primary" size="lg" leftIcon={<Home className="w-4 h-4" />}>
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
};
