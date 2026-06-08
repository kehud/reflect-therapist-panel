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

const therapistNotes = [
  {
    patientId: "HA60LPag3LfFvmKdILkGbsXvAaR2",
    therapistId: "5s5O2D4J6OX8JUuoM58Wp5Jyj7g2",
    therapistName: "Ehud Admin (89)",
    note: "Initial therapist note for testing.",
  },
  {
    patientId: "wDpHD7jBlpWVuSrnW0Vj3rOoFht1",
    therapistId: "bFfnGdWlMuWMcvT0jecbkk3V8HN2",
    therapistName: "Test Therapist (h)",
    note: "Patient reports improved mood this week.",
  },
];

async function main() {
  for (const note of therapistNotes) {
    const noteId = crypto.randomUUID();

    await setDoc(
      doc(db, "therapistNotes", noteId),
      {
        ...note,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    console.log(`✅ Seeded therapistNotes/${noteId}`);
  }

  console.log("✅ Therapist notes seed completed");
}

main().catch((error) => {
  console.error("❌ Therapist notes seed failed:", error);
  process.exit(1);
});