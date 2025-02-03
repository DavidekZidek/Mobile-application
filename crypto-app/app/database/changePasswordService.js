import { auth } from "./firebaseConfig";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

/**
 * Aktualizuje heslo uživatele.
 * @param {string} currentPassword - Stávající heslo uživatele.
 * @param {string} newPassword - Nové heslo, které má být nastaveno.
 */
export const updateAccountPassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("Žádný uživatel není přihlášen.");
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    console.log("✅ Uživatel úspěšně reautentikován.");

    await updatePassword(user, newPassword);
    console.log("✅ Heslo bylo úspěšně změněno.");
  } catch (error) {
    console.error("❌ Chyba při změně hesla:", error.message);
    throw error;
  }
};
