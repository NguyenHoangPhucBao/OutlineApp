import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useContext, useEffect, useState } from "react";
import APIs, { authAPI, endpoints } from "../../configs/APIs";
import { ActivityIndicator, Searchbar, TextInput } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Items from "./Items";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import { Dropdown } from "react-native-element-dropdown";
import { MyUserContext } from "../../configs/Context";

const Outline = ({ navigation }) => {
  const user = useContext(MyUserContext);
  let width = 355;
  if (user.role === "APPROVER") width = 200;
  const [key, setKey] = useState("");
  const [credit, setCredit] = useState("");
  const [loading, setLoading] = useState(false);
  const [outline, setOutline] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [value, setValue] = useState("");
  const [lect, setLect] = useState([]);
  const [lectValue, setLectValue] = useState("");
  const [page, setPage] = useState(1);
  const data = [
    { label: "All", value: "all" },
    { label: "Pending", value: 0 },
    { label: "Approved", value: 1 },
    { label: "Rejected", value: 2 },
  ];
  let lecturerData = [{ label: "All", value: "all" }];
  let arrays = lect.map((c) => ({
    label: String(c.last_name + " " + c.first_name),
    value: c.id,
  }));
  for (const array of arrays) {
    lecturerData.push(array);
  }
  const loadOutline = async () => {
    if (user.role === "CREATOR") {
      setValue(1);
    }
    let url = `${
      endpoints["outline"]
    }?key=${key}&cre_num=${credit}&status=${value}&lecturer=${lectValue.toString()}&page=${page}`;
    try {
      setLoading(true);
      let token = await AsyncStorage.getItem("token");
      let res = await authAPI(token).get(url);
      let lect_res = await APIs.get(endpoints["lecturer"]);
      setLect(lect_res.data);
      if (page === 1) {
        setOutline(res.data.results);
      } else if (page > 1) {
        setOutline((current) => {
          return [...current, ...res.data.results];
        });
      }
      if (res.data.next === null) {
        setPage(page);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }) => {
    const paddingToBottom = 5;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };
  const loadMore = ({ nativeEvent }) => {
    if (loading === false && isCloseToBottom(nativeEvent)) {
      setPage(page + 1);
    }
  };
  useEffect(() => {
    loadOutline();
  }, [key, credit, value, lectValue, page]);
  return (
    <View style={{ flex: 1, margin: 10, justifyContent: "center" }}>
      <ScrollView
        onScroll={loadMore}
        refreshControl={
          <RefreshControl
            onRefresh={async () => {
              setRefresh(true);
              await loadOutline();
              setRefresh(false);
            }}
            refreshing={refresh}
          />
        }
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Searchbar
            style={{
              width: 250,
              backgroundColor: "#FFFFFF",
              marginLeft: 5,
              height: 50,
            }}
            placeholder="Search..."
            clearIcon={() => <FontAwesome6 name="xmark" size={20} />}
            onClearIconPress={() => setKey("")}
            onChangeText={(k) => {
              if (k === null) {
                setKey("");
              } else {
                setKey(k);
              }
            }}
            value={key}
          />
          <TextInput
            style={{
              marginRight: 5,
              marginLeft: 5,
              width: 100,
              height: 50,
              backgroundColor: "#FFFFFF",
            }}
            placeholder="Tín chỉ"
            value={credit}
            onChangeText={(value) => setCredit(value)}
          />
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          {user.role === "APPROVER" ? (
            <Dropdown
              placeholder="Status..."
              valueField="value"
              labelField="label"
              value={value}
              data={data}
              onChange={(c) => setValue(c.value)}
              style={{
                backgroundColor: "white",
                padding: 16,
                height: 50,
                width: 150,
                borderColor: "gray",
                borderWidth: 0.5,
                borderRadius: 8,
                paddingHorizontal: 8,
                marginTop: 10,
                marginLeft: 10,
                marginRight: 2.5,
              }}
            />
          ) : (
            <></>
          )}
          <Dropdown
            search={true}
            searchPlaceholder="Search..."
            placeholder="Lecturer..."
            searchField="label"
            valueField="value"
            labelField="label"
            value={lectValue}
            data={lecturerData}
            onChange={(c) => setLectValue(c.value)}
            inputSearchStyle={{ height: 40, fontSize: 16, borderRadius: 8 }}
            style={{
              backgroundColor: "white",
              padding: 16,
              height: 50,
              width: width,
              borderColor: "gray",
              borderWidth: 0.5,
              borderRadius: 8,
              paddingHorizontal: 8,
              marginTop: 10,
              marginRight: 10,
              marginLeft: 2.5,
            }}
          />
        </View>
        {loading && <ActivityIndicator style={{ margin: 15 }} />}
        {outline === null ? (
          <></>
        ) : (
          outline.map((c) => (
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => {
                navigation.navigate("Outline Details", { outline: c });
              }}
            >
              <Items instance={c} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};
export default Outline;
