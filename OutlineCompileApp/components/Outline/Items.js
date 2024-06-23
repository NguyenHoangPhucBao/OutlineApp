import { useContext, useState } from "react";
import { Image, View } from "react-native";
import { Avatar, Button, Card, Icon, Text } from "react-native-paper";
import { MyUserContext } from "../../configs/Context";
import { download, approve, outlineDelete } from "./Services";

const Items = ({ instance }) => {
  const user = useContext(MyUserContext);
  return (
    <Card.Content
      style={{ backgroundColor: "#FFFFFF", borderRadius: 15, margin: 10 }}
    >
      <Text variant="headlineMedium" style={{ fontSize: 13.75 }}>
        {String(instance.subject.vie_name).toLocaleUpperCase()}
      </Text>
      <Text style={{ margin: 5 }}>
        {instance.subject.form_of_training +
          " - " +
          instance.school_year +
          " - " +
          (instance.subject.practical_credit + instance.subject.theory_credit)}
      </Text>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          flexDirection: "column",
          margin: 10,
        }}
      >
        {user.role === "APPROVER" && instance.status === 0 ? (
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

        <View
          style={{ flex: 1, flexDirection: "row", justifyContent: "center" }}
        >
          <Button
            icon="download"
            mode="contained"
            style={{
              width: 315,
              backgroundColor: "#83B4FF",
              borderRadius: 50,
              marginBottom: 5,
            }}
            onPress={() => {
              download(instance.id, instance.subject.vie_name);
            }}
          >
            <Text style={{ fontSize: 11, color: "#FFFFFF" }}>Download</Text>
          </Button>
        </View>
        {user.role === "APPROVER" && instance.status === 1 ? (
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
                width: 315,
                backgroundColor: "#151515",
                borderRadius: 50,
              }}
              onPress={() => {
                outlineDelete(instance.id);
              }}
            >
              <Text style={{ fontSize: 11, color: "#FFFFFF" }}>Delete</Text>
            </Button>
          </View>
        ) : (
          <></>
        )}
      </View>
    </Card.Content>
  );
};
export default Items;
