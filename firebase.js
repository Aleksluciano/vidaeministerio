import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/functions';
import 'firebase/firestore'

var firebaseConfig = {
  apiKey: "AIzaSyDNGiJVz0lPSIOXY8nYVv_zMNOvtq8YDrk",
  authDomain: "vidaeministerio-e4bf6.firebaseapp.com",
  projectId: "vidaeministerio-e4bf6",
  storageBucket: "vidaeministerio-e4bf6.appspot.com",
  messagingSenderId: "484949252041",
  appId: "1:484949252041:web:d52fb50e5db6e7f24aba18",
  measurementId: "G-1HBVDQ2Z36"
};

firebase.initializeApp(firebaseConfig);
//firebase.functions().useEmulator("localhost",5001);
export const auth = firebase.auth();
export const googleProvider = new firebase.auth.GoogleAuthProvider();

export const db = firebase.firestore();
export const callFirebaseFnJw = firebase.functions().httpsCallable("jw");

