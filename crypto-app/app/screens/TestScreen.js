import React, { useState, useEffect } from "react"; // Správný import
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged } from "firebase/auth"; // Firebase autentizace
import { auth } from "../database/firebaseConfig"; // Tvůj Firebase config
import LoginScreen from "../screens/LoginScreen"; // Přihlašovací obrazovka
import BottomTabNavigator from "../navigation/BottomTabNavigator"; // Navigace hlavní aplikace

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [user, setUser] = useState(null); // Stav pro uživatele
  const [loading, setLoading] = useState(true); // Stav načítání

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Nastavení uživatele
      setLoading(false); // Ukončení načítání
    });

    return unsubscribe; // Vyčištění listeneru při odpojení
  }, []);

  if (loading) {
    return null; // Nebo přidej spinner
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={BottomTabNavigator} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
