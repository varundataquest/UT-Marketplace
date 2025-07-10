import React, { useRef, useEffect, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function ModelViewer({ modelUrl }) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !modelUrl || !containerRef.current) return;

    const loadModel = async () => {
      setLoading(true);
      setError(null);

      try {
        // Create model-viewer element
        const modelViewer = document.createElement('model-viewer');
        modelViewer.src = modelUrl;
        modelViewer.alt = '3D model of the item';
        modelViewer.setAttribute('auto-rotate', '');
        modelViewer.setAttribute('camera-controls', '');
        modelViewer.setAttribute('shadow-intensity', '1');
        modelViewer.setAttribute('ar', '');
        modelViewer.setAttribute('ar-modes', 'webxr scene-viewer quick-look');
        modelViewer.style.width = '100%';
        modelViewer.style.height = '300px';
        modelViewer.style.backgroundColor = '#f5f5f5';

        // Add event listeners
        modelViewer.addEventListener('load', () => {
          setLoading(false);
        });

        modelViewer.addEventListener('error', (e) => {
          console.error('Model loading error:', e);
          setError('Failed to load 3D model. The model file may be unavailable.');
          setLoading(false);
        });

        // Clear container and add model viewer
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(modelViewer);

        // Fallback timeout
        setTimeout(() => {
          if (loading) {
            setError('Model loading timed out. Please try again.');
            setLoading(false);
          }
        }, 10000);

      } catch (err) {
        console.error('Error setting up model viewer:', err);
        setError('Failed to initialize 3D viewer.');
        setLoading(false);
      }
    };

    // Load model-viewer script if not already loaded
    if (!window.customElements.get('model-viewer')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
      script.onload = loadModel;
      script.onerror = () => {
        setError('Failed to load 3D viewer library.');
        setLoading(false);
      };
      document.head.appendChild(script);
    } else {
      loadModel();
    }
  }, [modelUrl, mounted]);

  if (!mounted) {
    return <div className="w-full h-[300px] bg-gray-100 rounded-lg animate-pulse" />;
  }

  if (error) {
    return (
      <div className="w-full h-[300px] bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-500">
        <AlertCircle className="w-8 h-8 mb-2 text-red-500" />
        <p className="text-sm font-medium text-red-600">3D Model Error</p>
        <p className="text-xs text-gray-500 text-center px-4">{error}</p>
        <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
          <p className="text-xs text-orange-700">
            💡 3D models are experimental. Try uploading more photos from different angles for better results.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-[300px] bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-2" />
        <p className="text-sm text-gray-600">Loading 3D model...</p>
        <p className="text-xs text-gray-500 mt-1">This may take a moment</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div ref={containerRef} className="w-full h-[300px] rounded-lg overflow-hidden border border-gray-200" />
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-500">
          🖱️ Drag to rotate • 🔍 Scroll to zoom • 📱 Tap AR button for mobile AR
        </p>
      </div>
    </div>
  );
}