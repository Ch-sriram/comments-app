// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import * as firestore from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBaESh9tPT6xZ87g2KzokzuBho3D0E0dyI",
  authDomain: "comments-app-ram.firebaseapp.com",
  projectId: "comments-app-ram",
  storageBucket: "comments-app-ram.appspot.com",
  messagingSenderId: "849942130117",
  appId: "1:849942130117:web:9bacf18f4d147625422fac",
  measurementId: "G-QWFN02HKT6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const storeReference = firestore.getFirestore(app);
const { collection } = firestore;

export enum Collections {
  COMMENTS = 'comments',
  USERS = 'users'
}

export const collections = {
  users: collection(storeReference, Collections.USERS),
  comments: collection(storeReference, Collections.COMMENTS)
};

export default firestore;
