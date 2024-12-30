import { db } from "./firebaseConfig"; // Opravená cesta
import { collection, getDocs } from "firebase/firestore";

// Načtení všech transakcí z kolekce 'transactions'
export const fetchTransactions = async () => {
  try {
    const transactionsRef = collection(db, "transactions"); // Kolekce 'transactions'
    const transactionsSnap = await getDocs(transactionsRef); // Načteme všechny dokumenty z kolekce

    // Převod dokumentů do požadovaného formátu
    const transactions = transactionsSnap.docs.map((doc) => ({
      id: doc.id, // ID dokumentu
      ...doc.data(), // Data transakce
      date: doc.data().date?.toDate(), // Pokud je datum ve formátu Firestore Timestamp, konvertujeme ho na JavaScript Date
    }));

    return transactions;
  } catch (error) {
    console.error("Chyba při načítání transakcí:", error);
    throw error; // Chybová hláška v případě chyby
  }
};
