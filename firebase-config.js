// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAFTQVLvVLQv6qkm8wDvvZchqLs76YZ9Mc",
  authDomain: "rapidmedx-1c3d8.firebaseapp.com",
  databaseURL: "https://rapidmedx-1c3d8-default-rtdb.firebaseio.com",
  projectId: "rapidmedx-1c3d8",
  storageBucket: "rapidmedx-1c3d8.firebasestorage.app",
  messagingSenderId: "16928563339",
  appId: "1:16928563339:web:430fcf5604c5d1a423348e",
  measurementId: "G-5KTN8DV9C8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);