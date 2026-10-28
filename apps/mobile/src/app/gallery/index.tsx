import { Redirect } from 'expo-router';

import { GalleryScreen } from '@/features/gallery/GalleryScreen';
import { env } from '@/lib/env';

export default function GalleryRoute() {
  // Developer tool: never reachable in production builds.
  if (env.EXPO_PUBLIC_APP_ENV === 'production') return <Redirect href="/" />;
  return <GalleryScreen />;
}
