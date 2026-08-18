import { createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { clientsClaim } from 'workbox-core';
import { NetworkFirst } from 'workbox-strategies';


// eslint-disable-next-line no-redeclare
/* global self */

// This code listens for the user's confirmation to update the app.
self.addEventListener('message', (e) => {
  if (!e.data) {
    return;
  }

  // Verify message source for security
  if (!e.origin || e.origin !== self.location.origin) {
    return;
  }

  if (e.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    // Retrieving all the keys from the cache.
    caches.keys().then((cacheNames) => Promise.all(
      // Looping through all the cached files and deleting caches
      cacheNames.map((cacheName) => caches.delete(cacheName)),
    )),
  );
});

clientsClaim();

// The precaching code provided by Workbox.
precacheAndRoute(self.__WB_MANIFEST);
const handler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(handler, {
  denylist: [
    /^.*shiftview\/.*$/,
    /^.*login\/.*$/,
    /^.*reports\/.*$/,
    /^.*expired_link\/.*$/,
    /^.*status.json$/,
    /^.*evocon-down\/.*$/,
    /^.*admin\/.*$/,
  ],
});
registerRoute(navigationRoute, new NetworkFirst());
