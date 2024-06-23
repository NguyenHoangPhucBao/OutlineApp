import React, { useContext, useReducer } from "react";
import Outline from "./components/Outline/Outline";
import Register from "./components/Login/Register";
import Login from "./components/Login/Login";
import { MyDispatchContext, MyUserContext } from "./configs/Context";
import { MyReducer } from "./configs/Reducer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { Icon } from "react-native-paper";
import Announce from "./components/Login/Announce";
import Profile from "./components/Login/Profile";
import EditProfile from "./components/Login/EditProfile";
import OutlineDetails from "./components/Outline/OutlineDetails";
import SubjectSelect from "./components/Outline/SubjectSelect";
import Editor from "./components/Outline/Editor";

const Stack = createNativeStackNavigator();

const MyStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ title: "Đề cương môn học" }}
      />
      <Stack.Screen
        name="Register"
        component={Register}
        options={{ title: "Đề cương môn học" }}
      />
      <Stack.Screen
        name="Home"
        component={MyTab}
        options={{ title: "Đề cương môn học" }}
      />
      <Stack.Screen
        name="Update"
        component={EditProfile}
        options={{ title: "Đề cương môn học" }}
      />
      <Stack.Screen
        name="Announce"
        component={Announce}
        options={{ title: "Đề cương môn học" }}
      />
      <Stack.Screen
        name="Outline Details"
        component={OutlineDetails}
        options={{ title: "Đề cương môn học" }}
      />
      <Stack.Screen
        name="SubjectSelect"
        component={SubjectSelect}
        options={{ title: "Đề cương môn học" }}
      />
      <Stack.Screen
        name="editor"
        component={Editor}
        options={{ title: "Đề cương môn học" }}
      />
    </Stack.Navigator>
  );
};

const Tab = createBottomTabNavigator();

const MyTab = () => {
  const user = useContext(MyUserContext);
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Outline"
        component={Outline}
        options={{
          tabBarIcon: () => [
            <Icon size={25} color="black" source="home-outline" />,
          ],
          title: "Outline",
          headerTitleAlign: "center",
          tabBarActiveTintColor: "black",
        }}
      />
      {user.role === "CREATOR" ? (
        <Tab.Screen
          name="Editor"
          component={SubjectSelect}
          options={{
            tabBarIcon: () => [
              <Icon size={25} color="black" source="file-document-edit" />,
            ],
            title: "Editor",
            headerTitleAlign: "center",
            tabBarActiveTintColor: "black",
          }}
        />
      ) : (
        <></>
      )}
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: () => [<Icon size={25} color="black" source="account" />],
          title: "Account",
          headerTitleAlign: "center",
          tabBarActiveTintColor: "black",
        }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  const [user, dispatch] = useReducer(MyReducer, null);
  return (
    <NavigationContainer>
      <MyUserContext.Provider value={user}>
        <MyDispatchContext.Provider value={dispatch}>
          <MyStack />
        </MyDispatchContext.Provider>
      </MyUserContext.Provider>
    </NavigationContainer>
  );
}
