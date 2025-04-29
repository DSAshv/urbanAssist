importScripts('https://www.gstatic.com/firebasejs/10.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.10.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCkGoDwkcKTSePUTAKxJhryK2XMVJQGR1s",
  authDomain: "urbanassist-3d0e2.firebaseapp.com",
  projectId: "urbanassist-3d0e2",
  storageBucket: "urbanassist-3d0e2.appspot.com",
  messagingSenderId: "668840217486",
  appId: "1:668840217486:web:e6608894b12d5b368372df"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Notification from UrbanAssist ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
