import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore , collection , getDocs} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore-compat.js";

const firebaseConfig = {
  apiKey: "AIzaSyCTRAyaI-eBBfWUjMSv1XprKAaIDlacy3g",
  authDomain: "bulibrary-770bb.firebaseapp.com",
  projectId: "bulibrary-770bb",
  storageBucket: "bulibrary-770bb.firebasestorage.app",
  messagingSenderId: "688134819645",
  appId: "1:688134819645:web:97a300cfac462f5459bf54",
  measurementId: "G-C72Z3EK47W",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app)


async function getUser(db) {
  const userCol = collection(db, 'user')
  const userSnpshot = await getDocs(userCol)
  return userSnpshot
}

const data = await getUser(db)
console.log(data)