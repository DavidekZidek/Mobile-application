import { db } from "./firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export const fetchAccount = async () => {
  try {
    console.log("Načítám první účet z kolekce accounts");

    const accountsRef = collection(db, "accounts");
    const accountsSnap = await getDocs(accountsRef);

    if (!accountsSnap.empty) {
      const firstDoc = accountsSnap.docs[0];
      const accountData = firstDoc.data();

      console.log("První účet nalezen:", accountData);

      // Načtení podkolekcí
      const transactionsRef = collection(db, `accounts/${firstDoc.id}/transactions`);
      const transactionsSnap = await getDocs(transactionsRef);
      const transactions = transactionsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const portfolioRef = collection(db, `accounts/${firstDoc.id}/portfolio`);
      const portfolioSnap = await getDocs(portfolioRef);
      const portfolio = portfolioSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("Transakce:", transactions);
      console.log("Portfolio:", portfolio);

      return {
        id: firstDoc.id,
        transactions,
        portfolio,
        ...accountData,
      };
    } else {
      console.warn("Žádné účty nebyly nalezeny v kolekci accounts");
      return null;
    }
  } catch (error) {
    console.error("Chyba při načítání účtu:", error.message);
    throw error;
  }
};
