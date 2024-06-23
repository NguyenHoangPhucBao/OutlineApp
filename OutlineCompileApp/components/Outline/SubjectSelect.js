import { useContext, useEffect, useState } from "react";
import APIs, { authAPI, endpoints } from "../../configs/APIs";
import { View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Appbar, Button } from "react-native-paper";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MyUserContext } from "../../configs/Context";
import { useNavigation } from "@react-navigation/native";

const SubjectSelect = ({ navigation }) => {
  const user = useContext(MyUserContext);
  const [subject, setSubject] = useState(null);
  const [subjectValue, setSubjectValue] = useState(null);
  let subjectData = [];

  const loadSubject = async () => {
    try {
      let res = await APIs.get(endpoints["subject"]);
      setSubject(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  const createOutline = async (subjectId, userId) => {
    if (subjectId === null) {
      console.log("error");
    } else {
      try {
        let url = `${endpoints["register"]}${userId}/subject-outline/`;
        const token = await AsyncStorage.getItem("token");
        let res = await authAPI(token).post(url, { subject_id: subjectId });
        console.info(res.status);
        if (res.status === 200) {
          navigation.navigate("editor");
        } else {
          console.info("error");
        }
      } catch (err) {
        console.log(err);
      }
    }
  };
  useEffect(() => {
    loadSubject();
  }, []);
  if (subject !== null) {
    let arrays = subject.map((c) => ({
      label: c.vie_name,
      value: c.id,
    }));
    for (const array of arrays) {
      console.log(array);
      subjectData.push(array);
    }
  } else {
    subjectData = subjectData;
  }
  console.log(subjectData);
  return (
    <View>
      <Dropdown
        data={subjectData}
        search={true}
        searchPlaceholder="Search..."
        searchField="label"
        valueField="value"
        labelField="label"
        value={subjectValue}
        onChange={(c) => setSubjectValue(c.value)}
        style={{
          backgroundColor: "white",
          height: 50,
          borderColor: "gray",
          borderWidth: 0.5,
          borderRadius: 8,
          paddingHorizontal: 8,
          marginTop: 10,
          marginRight: 10,
          marginLeft: 10,
        }}
      />
      <Button
        onPress={() => {
          createOutline(subjectValue, user.id);
        }}
        mode="contained"
        style={{
          width: 150,
          marginTop: 10,
          marginLeft: "auto",
          marginRight: 10,
        }}
      >
        Submit
      </Button>
    </View>
  );
};

export default SubjectSelect;
