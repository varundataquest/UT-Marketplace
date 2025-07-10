import React from 'react';
import { useGLTF } from '@react-three/drei';

export default function Model({ url }) {
  const { scene } = useGLTF(url);
  // Center and scale the model within the viewer
  return <primitive object={scene} scale={1.5} position={[0, -1, 0]} />;
}