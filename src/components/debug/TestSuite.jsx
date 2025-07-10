import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Play, CheckCircle, XCircle } from 'lucide-react';

export default function TestSuite({ title, description, testFunction }) {
  const [status, setStatus] = useState('idle'); // idle, running, success, error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleRunTest = async () => {
    setStatus('running');
    setResult(null);
    setError(null);
    try {
      const res = await testFunction();
      setResult(res);
      setStatus('success');
    } catch (err) {
      setError(err.message || 'An unknown error occurred.');
      setStatus('error');
    }
  };

  const getStatusIndicator = () => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Play className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h4 className="font-semibold">{title}</h4>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIndicator()}
            <Button size="sm" onClick={handleRunTest} disabled={status === 'running'}>
              Run Test
            </Button>
          </div>
        </div>
        {result && (
          <div className="mt-4 p-2 bg-gray-100 rounded-md">
            <h5 className="text-xs font-bold uppercase text-gray-500">Result</h5>
            <pre className="text-xs whitespace-pre-wrap break-all">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        {error && (
          <div className="mt-4 p-2 bg-red-50 rounded-md">
            <h5 className="text-xs font-bold uppercase text-red-500">Error</h5>
            <pre className="text-xs text-red-700 whitespace-pre-wrap break-all">
              {error}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}