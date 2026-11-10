/**
 * FIREBASE INITIALIZATION & SDK BRIDGE
 * Project: bkkbn-malut-humas
 * Perwakilan BKKBN Provinsi Maluku Utara
 */

const firebaseConfig = {
  apiKey: "AIzaSyD_vAF2WeH-FfmxjaxJ1F2JJvRtr2M_BO8",
  authDomain: "bkkbn-malut-humas.firebaseapp.com",
  projectId: "bkkbn-malut-humas",
  storageBucket: "bkkbn-malut-humas.firebasestorage.app",
  messagingSenderId: "784708150695",
  appId: "1:784708150695:web:4e1a8aa9ef14050ffb4282",
  measurementId: "G-JQ3DRHW9BZ"
};

// Inisialisasi Firebase App
firebase.initializeApp(firebaseConfig);

// Inisialisasi Layanan Cloud
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

console.log("Firebase initialized successfully for bkkbn-malut-humas.");