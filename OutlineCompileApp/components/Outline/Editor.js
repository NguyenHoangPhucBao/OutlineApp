import { RichText, Toolbar, useEditorBridge } from "@10play/tentap-editor";
import { KeyboardAvoidingView, ScrollView, Text, View } from "react-native";
import { Appbar, Button } from "react-native-paper";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
const Editor = ({ navigation }) => {
  const editor = useEditorBridge({});
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
    <ScrollView>
      <Text style={{ margin: 10 }}>Description</Text>
      <KeyboardAvoidingView>
        <RichText editor={editor} style={{ height: 100 }} />
        <Toolbar editor={editor} style={{ height: 100 }} />
        <Text style={{ margin: 10 }}>Document</Text>
        <RichText editor={editor} style={{ height: 100 }} />
        <Toolbar editor={editor} />
        <Text style={{ margin: 10 }}>Teaching Method</Text>
        <RichText editor={editor} style={{ height: 100 }} />
        <Toolbar editor={editor} />
        <Text style={{ margin: 10 }}>Regulation</Text>
        <RichText editor={editor} style={{ height: 100 }} />
        <Toolbar editor={editor} />
      </KeyboardAvoidingView>
      <View style={{ flex: 1, flexDirection: "row" }}>
        <Button
          mode="contained"
          style={{
            width: 150,
            marginLeft: "auto",
            marginTop: 10,
            marginRight: 5,
            marginBottom: 10,
          }}
        >
          Save
        </Button>
        <Button
          mode="contained"
          style={{
            width: 150,
            marginLeft: 5,
            marginTop: 10,
            marginRight: "auto",
            marginBottom: 10,
          }}
        >
          Submit
        </Button>
      </View>
    </ScrollView>,
  ];
};
export default Editor;
