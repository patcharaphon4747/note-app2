// firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyC_wcKLxVpjIEwHqRDZCpPvZKgwBEzh6wc",
  authDomain: "pat2564.firebaseapp.com",
  projectId: "pat2564",
  storageBucket: "pat2564.appspot.com",
  messagingSenderId: "374009640662",
  appId: "1:374009640662:web:b3adc07ac365037208bb77",
  measurementId: "G-Q7V51467MB"
};

// เริ่มต้น Firebase App
firebase.initializeApp(firebaseConfig);

// เริ่ม Firestore และ Authentication
const db = firebase.firestore();
const auth = firebase.auth();
