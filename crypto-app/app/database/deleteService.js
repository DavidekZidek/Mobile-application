import { auth } from "./firebaseConfig";
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { doc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

/**
 * Funkce pro odstranění účtu uživatele.
 * @param {string} currentPassword - Stávající heslo uživatele pro reautentikaci.
 * @throws {Error} - Pokud není uživatel přihlášen nebo dojde k chybě při odstranění účtu.
 */
export const deleteAccount = async (currentPassword) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("❌ Žádný uživatel není přihlášen.");
    }

    if (!currentPassword || currentPassword.trim() === "") {
      console.error("❌ Chyba: Heslo není zadáno.");
      throw new Error("Password is required for account deletion.");
    }

    console.log("🔄 Reauthenticating user...");
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    console.log("✅ User reauthenticated successfully.");

    console.log("🔄 Checking if user data exists in Firestore...");
    const userDocRef = doc(db, "accounts", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.log("⚠️ No Firestore data found for user. Skipping deletion.");
    } else {
      console.log("🔄 Deleting user data from Firestore...");
      await deleteDoc(userDocRef);
      console.log("✅ User data deleted from Firestore.");
    }

    console.log("🔄 Deleting Firebase account...");
    await deleteUser(user);
    console.log("✅ Account successfully deleted.");
  } catch (error) {
    console.error("❌ Chyba při odstranění účtu:", error.message);
    throw error;
  }
};
