// Service Worker for background notifications and PWA support

const CACHE_NAME = 'medreminder-v1';
const urlsToCache = [
  '/',
  '/index.html',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const title = data.title || 'MedReminder';
  const options = {
    body: data.body || 'Time to take your medication',
    icon: data.icon || '/notification-icon.png',
    badge: '/badge-icon.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'medication-reminder',
    requireInteraction: true,
    data: data.data || {},
    actions: [
      {
        action: 'mark-taken',
        title: 'Mark Taken',
        icon: '/check-icon.png'
      },
      {
        action: 'snooze',
        title: 'Snooze 10min',
        icon: '/snooze-icon.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'mark-taken') {
    // Handle mark taken action
    event.waitUntil(
      clients.openWindow('/?action=mark-taken&id=' + event.notification.tag)
    );
  } else if (event.action === 'snooze') {
    // Handle snooze action
    event.waitUntil(
      clients.openWindow('/?action=snooze&id=' + event.notification.tag)
    );
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync for offline medication logs
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-medication-logs') {
    event.waitUntil(syncMedicationLogs());
  }
});

async function syncMedicationLogs() {
  // This would sync offline logs when connection is restored
  console.log('Syncing medication logs...');
}

// Periodic background sync for scheduled notifications
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-medication-schedule') {
    event.waitUntil(checkMedicationSchedule());
  }
});

async function checkMedicationSchedule() {
  // Check if any medications are due and show notifications
  console.log('Checking medication schedule...');
}
