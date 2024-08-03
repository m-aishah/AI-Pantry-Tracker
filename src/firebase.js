// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDt_ZXmY9thxw_5rOClb8m-51OepRG9HCI",
  authDomain: "inventory-management-app-28b60.firebaseapp.com",
  projectId: "inventory-management-app-28b60",
  storageBucket: "inventory-management-app-28b60.appspot.com",
  messagingSenderId: "347696441637",
  appId: "1:347696441637:web:a64df6ef495ebb2bfe52cc",
  measurementId: "G-0H5XBT70Y3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const firestore = getFirestore(app);
export {app, firestore}