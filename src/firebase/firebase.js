import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/analytics'

/**
 * --------------------
 * PRODUCTION DB CONFIG
 * --------------------
 */
const firebaseConfig = {
  apiKey: 'AIzaSyCIgX_G0OwrwNT8RMenU2dOdFUBJW5WKps',
  authDomain: 'theta-harvest.firebaseapp.com',
  databaseURL: 'https://theta-harvest.firebaseio.com',
  projectId: 'theta-harvest',
  storageBucket: 'theta-harvest.appspot.com',
  messagingSenderId: '564637644019',
  appId: '1:564637644019:web:052aa54745d08fe6b6f386',
  measurementId: 'G-QTT6FF7MTF'
}
/**
 * --------------------
 * DEVELOPMENT DB CONFIG
 * --------------------
 */
/* const firebaseConfig = {
  apiKey: 'AIzaSyC5sE2m4L4qg_snafPgFg3IkHxDpj6nr-E',
  authDomain: 'theta-harvest-development.firebaseapp.com',
  databaseURL: 'https://theta-harvest-development.firebaseio.com',
  projectId: 'theta-harvest-development',
  storageBucket: 'theta-harvest-development.appspot.com',
  messagingSenderId: '481755046723',
  appId: '1:481755046723:web:1d86eabe8372bb465b45f6',
  measurementId: 'G-8FC5N14JKJ'
} */

// Initialize Firebase
firebase.initializeApp(firebaseConfig)
firebase.analytics()

// utils
const db = firebase.firestore()
const auth = firebase.auth()

// collection references
const usersCollection = db.collection('users')
const tradesCollection = db.collection('trades')

export { db, auth, usersCollection, tradesCollection }
