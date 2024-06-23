import { useContext, useEffect, useState } from "react";
import { KeyboardAvoidingView, ScrollView, Text, View } from "react-native";
import { authAPI, endpoints } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Appbar,
  Avatar,
  Button,
  Card,
  List,
  TextInput,
} from "react-native-paper";
import { useRoute } from "@react-navigation/native";
import MainStyle from "../../styles/MainStyle";
import { MyUserContext } from "../../configs/Context";
import { outlineDelete, postComment } from "./Services";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Oticons from "react-native-vector-icons/Octicons";

const OutlineDetails = ({ navigation }) => {
  const route = useRoute();
  const user = useContext(MyUserContext);
  const outline = route.params?.outline;
  const outlineId = outline.id;
  const [comment, setComment] = useState(null);
  const [commentValue, setCommentvalue] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const loadComment = async () => {
    try {
      let url = `${endpoints["outline"]}${outlineId}/comments/?page=${page}`;
      let token = await AsyncStorage.getItem("token");
      let res = await authAPI(token).get(url);
      if (page === 1) {
        setComment(res.data.results);
      } else if (page > 1) {
        setComment((current) => {
          return [...current, ...res.data.results];
        });
      }
    } catch (err) {
      console.log(err);
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
    loadComment();
  }, [page]);
  console.log(comment);
  return [
    <Appbar.Header style={{ height: 40 }}>
      <Appbar.Action
        icon={() => (
          <MaterialIcons
            name="arrow-back"
            size={20}
            onPress={() => {
              navigation.goBack();
            }}
          />
        )}
      />
    </Appbar.Header>,
    <View style={{ flex: 1, justifyContent: "center", margin: 10 }}>
      <ScrollView onScroll={loadMore}>
        <Card style={{ backgroundColor: "#FFFFFF" }}>
          <Card.Title
            title={outline.subject.vie_name}
            subtitle={
              outline.subject.form_of_training + " - " + outline.school_year
            }
          />
          {user.role === "APPROVER" && outline.status === 0 ? (
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                marginBottom: 5,
                justifyContent: "center",
              }}
            >
              <Button
                style={{
                  width: 150,
                  backgroundColor: "#FF0000",
                  marginRight: 5,
                  borderRadius: 50,
                }}
                icon="cancel"
                mode="contained"
                onPress={() => {
                  approve(instance.id, 2);
                }}
              >
                <Text style={{ fontSize: 11, color: "#FFFFFF" }}>Reject</Text>
              </Button>
              <Button
                style={{
                  width: 150,
                  backgroundColor: "#A5DD9B",
                  marginLeft: 5,
                  marginRight: 5,
                  borderRadius: 50,
                }}
                icon="check-underline"
                mode="contained"
                onPress={() => {
                  approve(instance.id, 1);
                }}
              >
                <Text style={{ fontSize: 11, color: "#FFFFFF" }}>Approve</Text>
              </Button>
            </View>
          ) : (
            <></>
          )}
          {user.role === "APPROVER" && outline.status === 1 ? (
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <Button
                icon="trash-can-outline"
                mode="contained"
                style={{
                  margin: 10,
                  width: 315,
                  backgroundColor: "#151515",
                  borderRadius: 50,
                }}
                onPress={() => {
                  outlineDelete(outline.id);
                }}
              >
                <Text style={{ fontSize: 11, color: "#FFFFFF" }}>Delete</Text>
              </Button>
            </View>
          ) : (
            <></>
          )}
        </Card>
        {comment === null ? (
          <View>
            <Text>No Comment Yet</Text>
          </View>
        ) : (
          comment.map((c) => (
            <View style={{ margin: 10 }}>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                }}
              >
                <Avatar.Image
                  style={{ margin: 10 }}
                  size={40}
                  source={{
                    uri: c.user.avatar,
                  }}
                />
                <Card
                  style={{
                    marginTop: 10,
                    flex: 1,
                    flexWrap: "wrap",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <Text style={{ margin: 10 }}>{c.content}</Text>
                </Card>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <View>
        <KeyboardAvoidingView>
          <TextInput
            onChangeText={(value) => {
              setCommentvalue(value);
            }}
            value={commentValue}
            multiline={true}
            placeholder="Type comment..."
            placeholderTextColor="#a2a3a2"
            underlineStyle={{ display: "none" }}
            right={
              <TextInput.Icon
                icon={() => <Oticons name="paper-airplane" size={25} />}
                onPress={async () => {
                  await postComment(outlineId, commentValue);
                  setCommentvalue("");
                  setTimeout(() => {
                    loadComment();
                  }, 500);
                }}
              />
            }
            style={{
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              borderBottomLeftRadius: 30,
              borderBottomRightRadius: 30,
            }}
          />
        </KeyboardAvoidingView>
      </View>
    </View>,
  ];
};
export default OutlineDetails;
