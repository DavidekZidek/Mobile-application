import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen"; // Opravený import
import MarketScreen from "../screens/MarketScreen";
import SettingsScreen from "../screens/SettingsScreen";
import TestScreen from "../screens/TestScreen"; // Přidání TestScreen
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // Skryje horní panel
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Market") {
            iconName = focused ? "stats-chart" : "stats-chart-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          } else if (route.name === "Test") {
            iconName = focused ? "flask" : "flask-outline";
          }

          return <Ionicons name={iconName} size={focused ? 28 : 24} color={color} />;
        },
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#121212",
          borderTopWidth: 0,
          elevation: 10,
          paddingVertical: 10,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          letterSpacing: 0.5,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Domů" }} />
      <Tab.Screen name="Market" component={MarketScreen} options={{ title: "Trh" }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: "Nastavení" }} />
      <Tab.Screen name="Test" component={TestScreen} options={{ title: "Test" }} />
    </Tab.Navigator>
  );
}
