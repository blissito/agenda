import { OAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use ONLY
// https://firebase.google.com/docs/web/setup#available-libraries
const provider = new OAuthProvider("microsoft.com");
const firebaseConfig = {
  apiKey: "AIzaSyDPo_sZShcS4o9ewpZr1O_frrO-XraiXi8",
  authDomain: "tests-4cafc.firebaseapp.com",
  databaseURL: "https://tests-4cafc.firebaseio.com",
  projectId: "tests-4cafc",
  storageBucket: "tests-4cafc.appspot.com",
  messagingSenderId: "701538060757",
  appId: "1:701538060757:web:8eb574c13832b16ae0155c",
};
// Initialize Firebase
initializeApp(firebaseConfig);
export type FirebaseUserData = {
  email: string;
  displayName?: string;
  providerId?: string;
  phoneNumber?: string;
  photoURL?: string;
  uid?: string;
};
// const app = initializeApp(firebaseConfig);
const auth = getAuth();
// @TODO: scope stuff (paso 4): https://firebase.google.com/docs/auth/web/microsoft-oauth?hl=es
export const startMicrosoftLogin = async () => {
  return await signInWithPopup(auth, provider);
};
