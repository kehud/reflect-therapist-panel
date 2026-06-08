import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBtuS1_ODSdtYisLf_27elxf2cjphfmwNc",
  authDomain: "mindtrack-app-c00c1.firebaseapp.com",
  projectId: "mindtrack-app-c00c1",
  storageBucket: "mindtrack-app-c00c1.firebasestorage.app",
  messagingSenderId: "941135851018",
  appId: "1:941135851018:web:4378f435edc255a3da79f3",
  measurementId: "G-MVC8ESZL21",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const users = [
  {
    uid: "5s5O2D4J6OX8JUuoM58Wp5Jyj7g2",
    displayName: "Ehud Admin (89)",
    email: "ehudk89@gmail.com",
    role: "admin",
  },
  {
    uid: "bFfnGdWlMuWMcvT0jecbkk3V8HN2",
    displayName: "Test Therapist (h)",
    email: "ehudkakun@hotmail.com",
    role: "therapist",
  },
  {
    uid: "HA60LPag3LfFvmKdILkGbsXvAaR2",
    displayName: "Test Patient (11)",
    email: "ehudk011@gmail.com",
    role: "user",
  },
  {
    uid: "wDpHD7jBlpWVuSrnW0Vj3rOoFht1",
    displayName: "Test Patient (90)",
    email: "ehudk90@gmail.com",
    role: "user",
  },
];

async function main() {
  for (const user of users) {
    if (!user.uid || user.uid.includes("PUT_")) {
      throw new Error(`Missing UID for ${user.displayName}`);
    }

    const { uid, ...data } = user;

    await setDoc(
      doc(db, "users", uid),
      {
        ...data,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    console.log(`✅ Seeded users/${uid} as ${data.role}`);
  }

  console.log("✅ Users seed completed");
}

main().catch((error) => {
  console.error("❌ Users seed failed:", error);
  process.exit(1);
});