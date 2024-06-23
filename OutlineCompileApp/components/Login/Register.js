import { useState } from "react";
import { KeyboardAvoidingView, ScrollView, Text, View } from "react-native";
import MainStyle from "../../styles/MainStyle";
import { Button, HelperText, TextInput } from "react-native-paper";
import APIs, { endpoints } from "../../configs/APIs";
import { useNavigation } from "@react-navigation/native";

const Register = () => {
  const [user, setUser] = useState({});
  const [idErr, setIdErr] = useState(false);
  const [invalidIdErr, setInvalidIdErr] = useState(false);
  const [usernameErr, setUsernameErr] = useState(false);
  const [invalidUsernameErr, setInvalidUsernameErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigation();
  const fields = [
    {
      label: "MSSV/MSGV",
      icon: "text",
      name: "user_id",
      error: "Vui lòng nhập MSSV/MSGV",
      error2: "MSSV/MSGV không đúng",
    },
    {
      label: "Username",
      icon: "account",
      name: "username",
      error: "Vui lòng nhập Username",
      error2: "Username đã được dùng",
    },
  ];

  const updateState = (field, value) => {
    setUser((current) => {
      return { ...current, [field]: value };
    });
  };
  const register = async () => {
    if (!user["user_id"]) {
      setIdErr(true);
    } else if (!user["username"]) {
      setUsernameErr(true);
    } else {
      setIdErr(false);
      setUsernameErr(false);
      let form = new FormData();
      for (let key in user) {
        if (key !== "confirm") {
          form.append(key, user[key]);
        }
      }
      console.info(form);
      setLoading(true);
      try {
        let res = await APIs.post(endpoints["register"], form, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        if (res.status === 201) {
          nav.navigate("Announce");
        }
        if (String(res.data).includes("ERR_DUPLICATE_ID")) {
          setInvalidIdErr(true);
        }
        if (String(res.data).includes("ERR_DUPLICATE_USERNAME")) {
          setInvalidUsernameErr(true);
        }
      } catch (error) {
        console.error(error);
        setInvalidIdErr(true);
      } finally {
        setLoading(false);
      }
    }
  };
  const fieldCheck = (f) => {
    if (f.name === "user_id") return idErr || invalidIdErr;
    if (f.name === "username") return usernameErr || invalidUsernameErr;
  };
  const setStyle = (v) => {
    if (v === true) return null;
    return MainStyle.hide;
  };
  const setMessage = (c) => {
    if (invalidIdErr === true || invalidUsernameErr === true) {
      return c.error2;
    }
    return c.error;
  };
  const setState = () => {
    setIdErr(false);
    setInvalidIdErr(false);
    setUsernameErr(false);
    setInvalidUsernameErr(false);
  };
  return (
    <View style={MainStyle.container}>
      <KeyboardAvoidingView>
        <ScrollView>
          <Text style={MainStyle.center}>Register</Text>
          {fields.map((c) => [
            <TextInput
              style={MainStyle.textinput}
              secureTextEntry={c.secureTextEntry}
              value={user[c.name]}
              key={c.name}
              label={c.label}
              onChangeText={(t) => {
                updateState(c.name, t);
                setState();
              }}
              right={<TextInput.Icon icon={c.icon} />}
            />,
            <HelperText
              type="error"
              visible={fieldCheck(c)}
              style={setStyle(fieldCheck(c))}
            >
              {setMessage(c)}
            </HelperText>,
          ])}
          <Button
            style={MainStyle.textinput}
            icon="account"
            loading={loading}
            mode="contained"
            onPress={register}
          >
            Register
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
export default Register;
