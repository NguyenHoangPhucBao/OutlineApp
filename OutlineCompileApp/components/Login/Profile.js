import { Text, View } from "react-native";
import MainStyle from "../../styles/MainStyle";
import { useContext } from "react";
import { MyDispatchContext, MyUserContext } from "../../configs/Context";
import { Avatar, Button, TextInput } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const Profile = () => {
  const user = useContext(MyUserContext);
  const dispatch = useContext(MyDispatchContext);
  const nav = useNavigation();
  return (
    <View style={MainStyle.center}>
      <Text>{user.person.last_name + " " + user.person.first_name}</Text>
      <Avatar.Image
        style={{ marginTop: 15 }}
        size={200}
        source={{
          uri: user.avatar,
        }}
      />
      <Button
        style={{ marginTop: 15 }}
        icon="account-edit-outline"
        mode="elevated"
        onPress={() => {
          nav.navigate("Update");
        }}
      >
        Update Profile
      </Button>
      <Button
        style={{ marginTop: 15 }}
        mode="contained"
        icon="logout"
        onPress={() => {
          dispatch({ type: "logout" });
          nav.navigate("Login");
        }}
      >
        Logout
      </Button>
    </View>
  );
};
export default Profile;
