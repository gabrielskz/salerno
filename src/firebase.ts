import { initializeApp } from 'firebase/app'
import {
  createUserWithEmailAndPassword, getAuth, onAuthStateChanged,
  signInWithEmailAndPassword, signOut, type User,
} from 'firebase/auth'
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore'
import type { SalernoData } from './types'

function envValue(value: string | undefined) {
  return (value || '').split(/\s+/).filter(Boolean)[0] || ''
}

const firebaseConfig = {
  apiKey: envValue(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: envValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: envValue(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: envValue(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: envValue(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: envValue(import.meta.env.VITE_FIREBASE_APP_ID),
}

export const firebaseEnabled = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)
const app = firebaseEnabled ? initializeApp(firebaseConfig) : null
const db = app ? getFirestore(app) : null
const auth = app ? getAuth(app) : null

export function observeUser(callback: (user: User | null) => void) {
  if (!auth) return () => undefined
  return onAuthStateChanged(auth, callback)
}

export async function login(email: string, password: string) {
  if (!auth) return
  await signInWithEmailAndPassword(auth, email, password)
}

export async function register(email: string, password: string) {
  if (!auth) return
  await createUserWithEmailAndPassword(auth, email, password)
}

export async function logout() {
  if (auth) await signOut(auth)
}

export async function loadCloudData(userId: string): Promise<SalernoData | null> {
  if (!db) return null
  const snapshot = await getDoc(doc(db, 'users', userId))
  return snapshot.exists() ? (snapshot.data() as SalernoData) : null
}

export async function saveCloudData(userId: string, data: SalernoData): Promise<void> {
  if (!db) return
  await setDoc(doc(db, 'users', userId), data)
}
