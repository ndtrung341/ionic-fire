import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getMessaging } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-sw.js";

const firebaseApp = initializeApp({
  apiKey: "AIzaSyBXiX9h_upURZGvr02ibs2qXKEywm8d1c0",
  authDomain: "test-noti-71844.firebaseapp.com",
  projectId: "test-noti-71844",
  storageBucket: "test-noti-71844.appspot.com",
  messagingSenderId: "694033749828",
  appId: "1:694033749828:web:21b2795c02f2479366a911",
});

const messaging = getMessaging(firebaseApp);

messaging.setBackgroundMessageHandler(function (payload) {
  console.log({ payload });
  const notificationTitle = "Background Message Title";
  const notificationOptions = {
    body: "Test " + JSON.stringify(payload),
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});
