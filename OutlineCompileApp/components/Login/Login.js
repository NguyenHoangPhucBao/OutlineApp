import { KeyboardAvoidingView, ScrollView, Text, View } from "react-native";
import MainStyle from "../../styles/MainStyle";
import { useContext, useState } from "react";
import { Button, HelperText, TextInput } from "react-native-paper";
import { MyDispatchContext } from "../../configs/Context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import APIs, { authAPI, endpoints } from "../../configs/APIs";
import { useNavigation } from "@react-navigation/native";

const Login = () => {
  const [user, setUser] = useState({});
  const [blankErr, setBlankErr] = useState(false);
  const [invalidErr, setInvalidErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cannotSee, setCanNotSee] = useState(true);
  const dispatch = useContext(MyDispatchContext);
  const nav = useNavigation();
  const [firstLogin, setFirstLogin] = useState(false);
  const fields = [
    {
      label: "Username",
      icon: "account",
      name: "username",
    },
    {
      label: "Password",
      icon: "eye",
      name: "password",
      secureTextEntry: cannotSee,
    },
  ];
  const setStyle = (v) => {
    if (v === true) return null;
    return MainStyle.hide;
  };
  const setMessage = () => {
    if (blankErr === true) return "Vui lòng nhập Username và Password";
    if (invalidErr === true) return "Username hoặc Password không đúng";
  };
  const setState = () => {
    setBlankErr(false);
    setInvalidErr(false);
  };
  const updateState = (field, value) => {
    setUser((current) => {
      return { ...current, [field]: value };
    });
  };
  const login = async () => {
    let client_id = "eSOgRgiQ8YDBk9oaSMvfRTww2HY8yN85oVHKDNax";
    let client_secret =
      "GpkL4WudsnPgvmt53RnverUMwWc24b2kBtEx2QYorLjA5sySOuFmeaWEZLp0BnosXZc1V3xQeZFJHFJN2sX3Ym1iEU6QhsbcrFoO8KiHMb8YCcXcLPKFYyja3rw5IKnd";
    if (!user["username"] || !user["password"]) {
      setBlankErr(true);
    } else {
      setBlankErr(false);
      setLoading(true);
      try {
        let res = await APIs.post(
          endpoints["login"],
          {
            ...user,
            grant_type: "password",
            client_id: client_id,
            client_secret: client_secret,
          },
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log(res.data);
        if (!String(res.data).includes("ERR_INVALID_USERNAME")) {
          await AsyncStorage.setItem("token", res.data.access_token);
          setTimeout(async () => {
            let user = await authAPI(res.data.access_token).get(
              endpoints["currentUser"]
            );
            user.data["is_first_login"] = res.data.is_first_login;
            user.data["role"] = res.data.role;
            console.info(user.data);
            dispatch({
              type: "login",
              payload: user.data,
            });
            if (res.data.is_first_login === true) {
              nav.navigate("Update");
            } else {
              nav.navigate("Home");
            }
          }, 100);
        } else {
          setInvalidErr(true);
        }
      } catch (error) {
        console.error(error);
        setInvalidErr(true);
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <View style={MainStyle.container}>
      <KeyboardAvoidingView>
        <ScrollView>
          <Text>Login</Text>
          {fields.map((c) => (
            <TextInput
              style={MainStyle.textinput}
              secureTextEntry={c.secureTextEntry}
              value={user[c.value]}
              key={c.name}
              label={c.label}
              right={
                <TextInput.Icon
                  icon={c.icon}
                  onPress={() => {
                    if (c.name === "password") {
                      setCanNotSee(!cannotSee);
                    }
                  }}
                />
              }
              onChangeText={(t) => {
                updateState(c.name, t);
                setState();
              }}
            />
          ))}
          <HelperText
            type="error"
            visible={blankErr || invalidErr}
            style={() => {
              setStyle(blankErr || invalidErr);
            }}
          >
            {setMessage()}
          </HelperText>
          <Button
            style={MainStyle.textinput}
            icon="login"
            loading={loading}
            mode="contained"
            onPress={login}
          >
            Login
          </Button>
          <Button
            onPress={() => {
              nav.navigate("Register");
            }}
            style={MainStyle.textinput}
            mode="text"
          >
            Register
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
export default Login;
