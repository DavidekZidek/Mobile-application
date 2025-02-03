import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { deleteAccount } from "../database/deleteService";
import { auth } from "../database/firebaseConfig";
import { CommonActions } from "@react-navigation/native";

export default function DeleteAccountScreen({ navigation }) {
  const [randomNumbers, setRandomNumbers] = useState("");
  const [enteredNumbers, setEnteredNumbers] = useState("");
  const [password, setPassword] = useState("");
  const [unsubscribeListener, setUnsubscribeListener] = useState(null);

  useEffect(() => {
    generateRandomNumbers();
  }, []);

  const generateRandomNumbers = () => {
    const numbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)).join("");
    setRandomNumbers(numbers);
    console.log("Generated numbers:", numbers);
  };

  const handleDeleteAccount = async () => {
    console.log("🔄 Starting account deletion...");
    console.log("✅ Entered numbers:", enteredNumbers);
    console.log("✅ Required numbers:", randomNumbers);
    console.log("✅ Entered password:", password ? "Provided" : "Not Provided");

    if (!enteredNumbers.trim()) {
      Alert.alert("Error", "Please enter the verification numbers.");
      console.error("❌ Missing verification numbers.");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Error", "Please enter your current password.");
      console.error("❌ Missing password.");
      return;
    }
    if (enteredNumbers !== randomNumbers) {
      Alert.alert("Error", "Verification numbers do not match.");
      console.error("❌ Incorrect verification numbers.");
      return;
    }

    try {
      // Odpojení Firestore listeneru (pokud existuje)
      if (unsubscribeListener) {
        console.log("🔄 Unsubscribing Firestore listener...");
        unsubscribeListener();
      }

      await deleteAccount(password);
      console.log("✅ Account deleted successfully.");
      
      // Reset navigace, aby se uživatel nemohl vrátit zpět
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Login" }],
        })
      );
    } catch (error) {
      console.error("❌ Account deletion error:", error.message);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Delete Account</Text>
        <Text style={styles.warning}>This action is irreversible!</Text>

        <Text style={styles.label}>Repeat numbers:</Text>
        <Text style={styles.numbers}>{randomNumbers}</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter numbers"
          value={enteredNumbers}
          onChangeText={setEnteredNumbers}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Password:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Text style={styles.buttonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f9fafe",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#ef4444",
  },
  warning: {
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#000",
  },
  numbers: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#2563eb",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    backgroundColor: "#ffffff",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
