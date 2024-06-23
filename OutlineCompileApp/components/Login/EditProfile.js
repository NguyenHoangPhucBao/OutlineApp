import { useContext, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  Avatar,
  Button,
  HelperText,
  TextInput,
  TouchableRipple,
} from "react-native-paper";
import MainStyle from "../../styles/MainStyle";
import { useNavigation } from "@react-navigation/native";
import { MyDispatchContext, MyUserContext } from "../../configs/Context";
import * as ImagePicker from "expo-image-picker";
import APIs, { authAPI, endpoints } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";

const EditProfile = () => {
  const dispatch = useContext(MyDispatchContext);
  const userData = useContext(MyUserContext);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [cannotSee, setCanNotSee] = useState(true);
  const [updatePassword, setUpdatePassword] = useState(false);
  const [errNotMatch, setErrNotMatch] = useState(false);
  const [errBlank, setErrBlank] = useState(false);
  const [errMatch, setErrMatch] = useState(false);
  const [weakPW, setWeakPW] = useState(false);
  const [errInvalidUsername, setErrInvalidUsername] = useState(false);
  const [errInvalidPassword, setErrInvalidPassword] = useState(false);
  const setStyleForHelperTxt = (v) => {
    if (v === true) return null;
    return MainStyle.hide;
  };
  const setStyle = () => {
    if (userData.is_first_login === true) return MainStyle.hide;
    return MainStyle.btnLeft;
  };
  const nav = useNavigation();
  const field = [
    {
      lable: "Username",
      icon: "account",
      name: "username",
      placeholder: userData.username,
      error: "Username đã được dùng",
    },
    {
      lable: "Current password",
      icon: "eye",
      name: "current_password",
      secureTextEntry: cannotSee,
    },
    {
      lable: "New password",
      icon: "eye",
      name: "new_password",
      secureTextEntry: cannotSee,
    },
    {
      lable: "Confirm password",
      icon: "eye",
      name: "confirm",
      secureTextEntry: cannotSee,
    },
  ];
  const setMessage = () => {
    if (errBlank === true) {
      return "Điền thông tin cần cập nhật";
    }
    if (errNotMatch === true) {
      return "Password không khớp";
    }
    if (errMatch === true) {
      return "Password không được trùng với password cũ";
    }
    if (errInvalidUsername === true) {
      return "Username đã được dùng";
    }
    if (errInvalidPassword === true) {
      return "Password hiện tại không đúng";
    }
    if (weakPW === true) {
      return "Password yếu";
    }
  };
  const setState = () => {
    setErrBlank(false);
    setErrInvalidPassword(false);
    setErrInvalidUsername(false);
    setErrMatch(false);
    setErrNotMatch(false);
    setWeakPW(false);
  };
  const setStyleForUpdatePassword = (c) => {
    if (userData.is_first_login === true) {
      return MainStyle.textinput;
    } else if (c.name !== "username") {
      if (updatePassword === false) {
        return MainStyle.hide;
      }
      return MainStyle.textinput;
    }
    return MainStyle.textinput;
  };
  const setStyleForUpdatePasswordBtn = () => {
    if (updatePassword === true || userData.is_first_login === true) {
      return MainStyle.hide;
    }
    return MainStyle.textinput;
  };

  const picker = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied !!!");
      } else {
        let res = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
        if (!res.canceled) {
          updateSate("avatar", res.assets[0]);
        }
      }
    } catch (err) {
      console.info(err);
    }
  };
  const updateSate = (field, value) => {
    setUser((current) => {
      return { ...current, [field]: value };
    });
  };
  const update = async () => {
    if (!user["username"] && !user["new_password"] && !user["avatar"]) {
      setErrBlank(true);
    } else if (user["new_password"].length < 10) {
      setWeakPW(true);
    } else if (user["new_password"] !== user["confirm"]) {
      setErrNotMatch(true);
    } else if (user["current_password"] === user["new_password"]) {
      setErrMatch(true);
    } else {
      setErrNotMatch(false);
      let form = new FormData();
      for (let key in user)
        if (key !== "confirm") {
          if (key === "avatar") {
            form.append(key, {
              uri: user.avatar.uri,
              name: user.avatar.uri.split("/").pop(),
              type: user.avatar.mimeType,
            });
          } else {
            form.append(key, user[key]);
          }
        }
      console.info(form);
      setLoading(true);
      try {
        let token = await AsyncStorage.getItem("token");
        let res = await APIs.patch(endpoints["currentUser"], form, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        console.info(res.data);
        if (
          !String(res.data).includes("ERR_INVALID_USERNAME") &&
          !String(res.data).includes("ERR_WRONG_PASSWORD")
        ) {
          let afterUpdate = await authAPI(token).get(endpoints["currentUser"]);
          dispatch({
            type: "login",
            payload: afterUpdate.data,
          });
          if (res.status === 200) {
            nav.goBack();
          }
        }
        if (String(res.data).includes("ERR_INVALID_USERNAME")) {
          setErrInvalidUsername(true);
        }
        if (String(res.data).includes("ERR_WRONG_PASSWORD")) {
          setErrInvalidPassword(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <View style={MainStyle.container}>
      <KeyboardAvoidingView>
        <ScrollView>
          <TouchableRipple
            onPress={picker}
            borderless={true}
            style={{
              borderRadius: 100,
              width: 200,
              height: 200,
            }}
          >
            <View>
              <Avatar.Image
                size={200}
                source={
                  user.avatar
                    ? { uri: user.avatar.uri }
                    : { uri: userData.avatar }
                }
                style={{ position: "absolute", zIndex: -1 }}
              />
              <View
                style={{
                  position: "absolute",
                  backgroundColor: "black",
                  opacity: 0.3,
                  width: 200,
                  height: 200,
                }}
              ></View>
              <View
                style={{
                  with: 200,
                  height: 200,
                }}
              >
                <Text
                  style={{
                    color: "#ffffff",
                    marginTop: "auto",
                    marginLeft: "auto",
                    marginRight: "auto",
                    marginBottom: "auto",
                  }}
                >
                  Change avatar
                </Text>
              </View>
            </View>
          </TouchableRipple>
          {field.map((c) => (
            <TextInput
              placeholder={c.placeholder}
              style={setStyleForUpdatePassword(c)}
              secureTextEntry={c.secureTextEntry}
              value={user[c.name]}
              key={c.name}
              label={c.lable}
              right={
                <TextInput.Icon
                  icon={c.icon}
                  onPress={() => {
                    setCanNotSee(!cannotSee);
                  }}
                />
              }
              onChangeText={(t) => {
                updateSate(c.name, t);
                setState();
              }}
            />
          ))}
          <Button
            icon="eye"
            mode="elevated"
            onPress={() => {
              setUpdatePassword(true);
            }}
            style={setStyleForUpdatePasswordBtn()}
          >
            Change pasword
          </Button>
          <HelperText
            type="error"
            visible={
              errBlank ||
              errInvalidUsername ||
              errMatch ||
              errNotMatch ||
              errInvalidPassword ||
              weakPW
            }
            style={() => {
              setStyleForHelperTxt(
                errBlank ||
                  errInvalidUsername ||
                  errMatch ||
                  errNotMatch ||
                  errInvalidPassword ||
                  weakPW
              );
            }}
          >
            {setMessage()}
          </HelperText>
          <View style={MainStyle.btnInRow}>
            <Button
              icon="cancel"
              mode="contained"
              style={setStyle()}
              onPress={() => {
                nav.goBack();
              }}
            >
              Cancel
            </Button>
            <Button
              icon="check"
              mode="contained"
              style={MainStyle.btnRight}
              onPress={update}
              loading={loading}
            >
              Ok
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
export default EditProfile;
