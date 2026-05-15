// Persona Habit 네이티브 앱 진입점. 5 탭 bottom navigation 과 빈 화면 stub 으로 시작한다.
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";

import { HomeScreen } from "./src/screens/HomeScreen";
import { MeetScreen } from "./src/screens/MeetScreen";
import { ReportScreen } from "./src/screens/ReportScreen";
import { SnapScreen } from "./src/screens/SnapScreen";
import { TodayScreen } from "./src/screens/TodayScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        initialRouteName="Today"
        screenOptions={{
          headerStyle: { backgroundColor: "#f4f7e8" },
          tabBarStyle: { backgroundColor: "#ffffff", borderTopColor: "#d8e2d1" },
          tabBarActiveTintColor: "#2f9d65",
          tabBarInactiveTintColor: "#667267"
        }}
      >
        <Tab.Screen name="Today" component={TodayScreen} options={{ title: "오늘" }} />
        <Tab.Screen name="Snap" component={SnapScreen} options={{ title: "스냅" }} />
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: "집" }} />
        <Tab.Screen name="Meet" component={MeetScreen} options={{ title: "모임" }} />
        <Tab.Screen name="Report" component={ReportScreen} options={{ title: "리포트" }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
