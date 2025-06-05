const firebaseConfig = {
  apiKey: "AIzaSyCQBPZVr0L2UHt6Zdl9EtgYEvB5iaSQTbE",
  authDomain: "myfood-f0e5e.firebaseapp.com",
  projectId: "myfood-f0e5e",
  storageBucket: "myfood-f0e5e.firebasestorage.app",
  messagingSenderId: "104314436425",
  appId: "1:104314436425:web:bc8beddaa34f42b62b7898",
  measurementId: "G-M7RSSKY1ZE"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

