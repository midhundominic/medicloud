// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB2Zf9R2u5Q6P3-lWXF8HvR-By673FLfuE",
  authDomain: "ecare-ca4eb.firebaseapp.com",
  projectId: "ecare-ca4eb",
  storageBucket: "ecare-ca4eb.appspot.com",
  messagingSenderId: "103356011389",
  appId: "1:103356011389:web:2ce3a67405c613fa3a7214",
  measurementId: "G-61G98P90TX"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);

export { firebaseApp };