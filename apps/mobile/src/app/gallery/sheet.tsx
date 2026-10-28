import { router } from 'expo-router';

import { Button, PlaceListItem, SheetContent, Text } from '@/design/components';
import { fixturePlace } from '@/features/gallery/fixtures';

// Example of a native sheet (ADR-027): this route is presented as a
// formSheet with detents in the root layout.
export default function GallerySheet() {
  return (
    <SheetContent title="Sheet example">
      <Text variant="body" color="textSecondary">
        Native sheet with two detents. Drag the grabber, or swipe down to close.
      </Text>
      <PlaceListItem {...fixturePlace} onPress={() => router.back()} />
      <Button label="Close" variant="secondary" onPress={() => router.back()} />
    </SheetContent>
  );
}
