import { Text, View } from "react-native";
import MainStyle from "../../styles/MainStyle";
import { useNavigation } from "@react-navigation/native";
import { Button } from "react-native-paper";

const Announce = () => {
  const nav = useNavigation();
  return (
    <View style={MainStyle.container}>
      <Text style={MainStyle.textinput}>
        Tài khoản đã được gửi đến email học tập/làm việc của bạn
      </Text>
      <Button
        onPress={() => {
          nav.navigate("Login");
        }}
        mode="contained"
      >
        Move to Login
      </Button>
    </View>
  );
};
export default Announce;
