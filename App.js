import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native"; // Ny import för navigation

// Dina nya screens
import BuyPage from "./src/screens/BuyPage";
import AIOutfitBuilder from "./src/screens/AIOutfitBuilder";
import Profile from "./src/screens/Profile";
import Scan from "./src/screens/Scan";
import Community from "./src/screens/Community";
import MyOutfits from "./src/screens/MyOutfits";
import Onboarding from "./src/screens/OnBoarding";
import ModelCreator from "./src/screens/ModelCreator";

// Uppdaterade ikoner (inklusive ny gul ikon för AI Outfit Builder)
import BuyIcon from "./src/screens/components/BuyIcon"; // Skapa denna (se nedan)
import CommunityIcon from "./src/screens/components/CommunityIcon";
import AIOutfitIcon from "./src/screens/components/AIOutfitIcon"; // Gul ikon (se nedan)
import MyOutfitsIcon from "./src/screens/components/MyOutfitsIcon";
import ProfileIcon from "./src/screens/components/ProfileIcon";

// Nya importer för auth
import { AuthProvider, useAuth } from "./context/AuthContext"; // Uppdatera sökvägen till AuthContext.js
import LoginScreen from "./src/screens/LoginScreen"; // Uppdatera sökvägen
import RegisterScreen from "./src/screens/RegisterScreen"; // Uppdatera sökvägen
import QuestionsScreen from "./src/screens/QuestionsScreen"; // Uppdatera sökvägen

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const navigation = useNavigation(); // Använd hook för navigation

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        initialRouteName="AIOutfitBuilder"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let IconComponent;
            let iconSize = focused ? 30 : size; // Aktiv knapp blir större
            let iconColor = focused ? "gold" : color; // Guld för aktiva, utom för huvudsidan

            if (route.name === "BuyPage") {
              IconComponent = BuyIcon;
            } else if (route.name === "Community") {
              IconComponent = CommunityIcon;
            } else if (route.name === "AIOutfitBuilder") {
              // Permanent rund padding för huvudsidan, alltid
              return (
                <View style={styles.activeMainButton}>
                  <AIOutfitIcon
                    color={focused ? "black" : "black"}
                    size={iconSize}
                  />
                </View>
              );
            } else if (route.name === "MyOutfits") {
              IconComponent = MyOutfitsIcon;
            } else if (route.name === "Profile") {
              IconComponent = ProfileIcon;
            }

            return IconComponent ? (
              <IconComponent color={iconColor} size={iconSize} />
            ) : null;
          },
          tabBarActiveTintColor: "gold", // Guld för alla aktiva, utom huvudsidan som hanteras ovan
          tabBarInactiveTintColor: "black",
          tabBarStyle: {
            backgroundColor: "#fff",
            height: 90, // Lite större tabb
            paddingBottom: 5, // Extra padding för bättre utseende
            paddingTop: 8,
          },
          tabBarShowLabel: true, // Visa namn under ikonerna
          tabBarLabelStyle: {
            fontSize: 10, // Anpassa textstorlek
            marginTop: 15, // Lite mellanrum mellan ikon och text
          },
        })}
      >
        <Tab.Screen
          name="BuyPage"
          component={BuyPage}
          options={{ tabBarLabel: "Köp" }} // Anpassat namn
        />
        <Tab.Screen
          name="Community"
          component={Community}
          options={{ tabBarLabel: "Community" }}
        />
        <Tab.Screen
          name="AIOutfitBuilder"
          component={AIOutfitBuilder}
          options={{
            tabBarLabel: ({ focused }) => (
              <Text
                style={{
                  fontSize: focused ? 14 : 12, // större bara när aktiv (valfritt)
                  color: focused ? "gold" : "black",
                  marginTop: 13,
                  fontWeight: "500",
                }}
              >
                LooksyAI
              </Text>
            ),
          }}
        />
        <Tab.Screen
          name="MyOutfits"
          component={MyOutfits}
          options={{ tabBarLabel: "Mina Outfits" }}
        />
        <Tab.Screen
          name="Profile"
          component={Profile}
          options={{ tabBarLabel: "Profil" }}
        />
      </Tab.Navigator>

      {/* Flytande svart rund knapp för Scan */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate("Scan")} // Navigera till Scan-sidan
      >
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path
            d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
            stroke="white"
            strokeWidth={2}
          />
          <Path
            d="M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0z"
            stroke="white"
            strokeWidth={2}
          />
        </Svg>
      </TouchableOpacity>
    </View>
  );
}

function AppNavigator() {
  const { user, loading, hasAnsweredQuestions, isVerified } = useAuth(); // Lägg till isVerified
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      const onboarding = await AsyncStorage.getItem("hasSeenOnboarding");
      setHasCompletedOnboarding(onboarding === "true");
    };
    checkOnboarding();
  }, []);

  console.log(
    "AppNavigator rendering - user:",
    user,
    "hasAnsweredQuestions:",
    hasAnsweredQuestions,
    "isVerified:",
    isVerified, // Ny logg för verifiering
    "loading:",
    loading
  );

  if (loading) return <Text>Laddar...</Text>;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!hasCompletedOnboarding ? (
        <Stack.Screen name="OnBoarding" component={Onboarding} />
      ) : !user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : user &&
        (user.emailVerified || isVerified) &&
        !hasAnsweredQuestions ? (
        <Stack.Screen name="Questions" component={QuestionsScreen} />
      ) : user && hasAnsweredQuestions ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Scan" component={Scan} />
          <Stack.Screen name="ModelCreator" component={ModelCreator} />
        </>
      ) : (
        // Fallback: Användaren är inloggad men inte verifierad – visa vänt-skärm eller auth
        <Stack.Screen
          name="WaitingForVerification"
          component={() => (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text>
                Väntar på verifiering... Kontrollera din e-post eller ange kod.
              </Text>
            </View>
          )}
        />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: 100, // Ovanför navigationen (justera om nödvändigt)
    right: 20,
    backgroundColor: "black",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, // Skugga för Android
    shadowColor: "#000", // Skugga för iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  activeMainButton: {
    backgroundColor: "gold", // Vit bakgrund
    borderRadius: 25, // Rund padding
    padding: 8, // Padding runt ikonen
    elevation: 3, // Skugga för Android
    shadowColor: "#000", // Skugga för iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});
