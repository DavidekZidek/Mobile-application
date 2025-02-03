import { db, auth } from "./firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

export const updateAccountName = async (newName) => {
  try {
    console.log("Spouštím změnu jména...");

    const user = auth.currentUser;
    if (!user) {
      throw new Error("Žádný uživatel není přihlášen.");
    }

    const userId = user.uid;
    console.log("Aktuální UID uživatele:", userId);

    const accountDocRef = doc(db, "accounts", userId);

    await updateDoc(accountDocRef, {
      name: newName,
    });

    console.log("Jméno bylo úspěšně změněno na:", newName);

    return "Jméno bylo úspěšně změněno!";
  } catch (error) {
    console.error("Chyba při změně jména:", error.message);
    throw new Error(error.message);
  }
};
