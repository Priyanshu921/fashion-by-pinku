import React, { useState, useEffect } from 'react';
import { jelly, bouncy, ring, ripples, dotPulse, infinity, wobble, spiral, squircle } from 'ldrs';

// Register all loaders
jelly.register();
bouncy.register();
ring.register();
ripples.register();
dotPulse.register();
infinity.register();
wobble.register();
spiral.register();
squircle.register();

const loaders = [
  'l-jelly',
  'l-bouncy',
  'l-ring',
  'l-ripples',
  'l-dot-pulse',
  'l-infinity',
  'l-wobble',
  'l-spiral',
  'l-squircle'
];

interface RandomLoaderProps {
  size?: string;
  speed?: string;
  color?: string;
}

export const RandomLoader: React.FC<RandomLoaderProps> = ({ 
  size = "60", 
  speed = "1.5", 
  color = "#ffd1dc" 
}) => {
  const [selectedLoader, setSelectedLoader] = useState<string | null>(null);

  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * loaders.length);
    setSelectedLoader(loaders[randomIdx]);
  }, []);

  if (!selectedLoader) return null;

  const LoaderElement = selectedLoader as any;

  return (
    <div className="flex justify-center items-center h-48">
      <LoaderElement size={size} speed={speed} color={color}></LoaderElement>
    </div>
  );
};
