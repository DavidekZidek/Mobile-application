import { db } from "./firebaseConfig"; // Opravená cesta
import { doc, getDoc } from "firebase/firestore";

// Načtení dat o účtu
export const fetchAccount = async () => {
  try {
    // Načteme dokument 'FirstUser' z kolekce 'accounts'
    const accountRef = doc(db, "accounts", "FirstUser"); // Použijeme název dokumentu 'FirstUser'
    const accountSnap = await getDoc(accountRef);

    if (accountSnap.exists()) {
      return accountSnap.data(); // Vrátíme data dokumentu
    } else {
      console.error("Účet FirstUser neexistuje!");
      return null;
    }
  } catch (error) {
    console.error("Chyba při načítání účtu:", error);
    throw error; // Zpětné vyhození chyby pro další zpracování
  }
};
