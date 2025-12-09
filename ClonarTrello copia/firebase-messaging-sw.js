// Firebase Cloud Messaging Service Worker
// Este archivo debe estar en la raíz del proyecto para que funcione correctamente

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuración de Firebase (debe coincidir con la del index.html)
firebase.initializeApp({
    apiKey: "AIzaSyDaY_w5Qu3Lw0szuHEUwYd89yjuheEPS-4",
    authDomain: "trello-clone-dfb8d.firebaseapp.com",
    projectId: "trello-clone-dfb8d",
    storageBucket: "trello-clone-dfb8d.firebasestorage.app",
    messagingSenderId: "17899525556",
    appId: "1:17899525556:web:6258116223f95647250ee1"
});

const messaging = firebase.messaging();

// Manejo de notificaciones en segundo plano
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title || 'Trello Clone';
    const notificationOptions = {
        body: payload.notification.body || 'Tienes una nueva notificación',
        icon: payload.notification.icon || 'https://cdn-icons-png.flaticon.com/512/616/616430.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/616/616430.png',
        data: payload.data,
        tag: payload.data?.tag || 'default',
        requireInteraction: false,
        vibrate: [200, 100, 200]
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification click received.');

    event.notification.close();

    // Abrir o enfocar la aplicación
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Si hay una ventana abierta, enfocarla
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url.includes('ClonarTrello') && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Si no hay ventana abierta, abrir una nueva
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});
