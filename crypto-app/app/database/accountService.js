import { db, auth } from "./firebaseConfig";
import { collection, query, where, getDocs, doc, getDoc, onSnapshot } from "firebase/firestore";

/**
 * Poslouchá změny účtu v reálném čase a aktualizuje UI.
 */
export const listenToAccountChanges = (callback) => {
  const user = auth.currentUser;
  if (!user) {
    console.error("No user logged in.");
    return;
  }

  const userId = user.uid;
  const accountRef = doc(db, "accounts", userId);

  return onSnapshot(accountRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      console.log("🔄 Account data updated:", docSnapshot.data());
      callback({ id: userId, ...docSnapshot.data() });
    } else {
      console.warn("⚠️ Account not found.");
    }
  });
};

/**
 * Načítá účet přihlášeného uživatele.
 */
export const fetchAccount = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user logged in.");
  }

  const userId = user.uid;
  const accountRef = doc(db, "accounts", userId);
  console.log("🔄 Fetching account data for UID:", userId);

  try {
    const accountSnap = await getDoc(accountRef);

    if (!accountSnap.exists()) {
      console.warn("⚠️ Account not found in Firestore.");
      return null;
    }

    console.log("✅ Account data loaded:", accountSnap.data());
    return { id: userId, ...accountSnap.data() };
  } catch (error) {
    console.error("❌ Error fetching account data:", error);
    throw new Error("Failed to fetch account data.");
  }
};
