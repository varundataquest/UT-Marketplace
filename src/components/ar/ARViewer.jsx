import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Eye, 
  Camera, 
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { photogrammetry } from '@/api/functions';
import ModelViewer from './ModelViewer';

// Simple Error Boundary to catch 3D model loading failures
class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("3D Model loading error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-red-600">
          <AlertCircle className="w-8 h-8 mb-2" />
          <p className="font-semibold">Failed to load 3D model.</p>
          <p className="text-sm text-gray-600 mb-3">The model file might be corrupt or unavailable.</p>
          <Button size="sm" variant="outline" onClick={() => this.setState({ hasError: false })}>
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ARViewer({ listing }) {
  const [modelStatus, setModelStatus] = useState('checking');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [modelUrl, setModelUrl] = useState(null);

  useEffect(() => {
    if (listing?.has_3d_model && listing?.model_3d_url) {
      setModelStatus('available');
      setModelUrl(listing.model_3d_url);
    } else if (['Furniture', 'Dorm Essentials', 'Electronics'].includes(listing?.category)) {
      setModelStatus('none');
    } else {
      setModelStatus('unavailable');
    }
  }, [listing]);

  const generate3DModel = async () => {
    if (!listing.images || listing.images.length < 3) {
        alert("Please upload at least 3 images to generate a 3D model.");
        return;
    }
    
    setModelStatus('generating');
    setGenerationProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + Math.random() * 15, 90));
      }, 500);

      const { data } = await photogrammetry({
        listingId: listing.id,
        imageUrls: listing.images,
        category: listing.category
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (data.success) {
        setModelStatus('available');
        setModelUrl(data.modelData.glbUrl);
        if (listing) {
            listing.has_3d_model = true;
            listing.model_3d_url = data.modelData.glbUrl;
        }
      } else {
        setModelStatus('failed');
      }
    } catch (error) {
      console.error('3D generation failed:', error);
      setModelStatus('failed');
    }
  };
  
  const getStatusDisplay = () => {
    const hasEnoughImages = listing?.images && listing.images.length >= 3;

    switch (modelStatus) {
      case 'none':
        return (
          <div className="space-y-3 p-4 text-center">
            <p className="text-gray-600">This item supports 3D preview.</p>
            <Button onClick={generate3DModel} disabled={!hasEnoughImages}>
              <Camera className="w-4 h-4 mr-2" />
              Generate 3D Model from Photos
            </Button>
            {!hasEnoughImages && (
              <p className="text-xs text-red-500">
                Please upload at least 3 images to enable this. ({listing.images?.length || 0}/3)
              </p>
            )}
          </div>
        );
      case 'generating':
        return (
          <div className="space-y-3 p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating 3D model...</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">{Math.round(generationProgress)}% complete</p>
          </div>
        );
      case 'available':
        return (
           <div className="p-4 space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span>Interactive 3D model is ready!</span>
              </div>
              
              {modelUrl && (
                <ModelErrorBoundary>
                  <ModelViewer modelUrl={modelUrl} />
                </ModelErrorBoundary>
              )}

              <div className="text-center">
                <p className="text-sm text-gray-500">Drag to rotate, scroll to zoom.</p>
              </div>
           </div>
        );
      case 'failed':
         return (
          <div className="p-4 text-center text-red-600 flex flex-col items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>Generation failed.</span>
            <Button size="sm" variant="outline" onClick={() => setModelStatus('none')}>Try again</Button>
          </div>
        );
      default:
        return null;
    }
  };

  if (modelStatus === 'unavailable') {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-ut-orange"/>
            Interactive Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {getStatusDisplay()}
      </CardContent>
    </Card>
  );
}