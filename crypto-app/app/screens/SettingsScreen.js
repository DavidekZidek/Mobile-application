import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../database/firebaseConfig";
import { CommonActions } from "@react-navigation/native";

export default function SettingsScreen({ navigation }) {
  const settingsOptions = [
    { label: "Change Name", screen: "Rename" },
    { label: "Change Password", screen: "ChangePassword" },
    { label: "Delete Account", screen: "DeleteAccount", isDelete: true },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("✅ User logged out.");
      
      // Reset navigation stack and navigate to Login screen
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Login" }],
        })
      );
    } catch (error) {
      console.error("❌ Logout error:", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      {settingsOptions.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.button, option.isDelete && styles.deleteButton]}
          onPress={() => navigation.navigate(option.screen)}
        >
          <Text style={styles.buttonText}>{option.label}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f9fafe",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
    color: "#1e293b",
  },
  button: {
    backgroundColor: "#3b82f6",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: "#f43f5e",
  },
  logoutButton: {
    backgroundColor: "#f59e0b",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
});
