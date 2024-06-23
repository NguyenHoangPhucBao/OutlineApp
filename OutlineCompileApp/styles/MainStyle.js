import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
    justifyContent: "center",
    margin: 10,
  },
  textinput: {
    marginTop: 20,
  },
  hide: {
    display: "none",
  },
  center: {
    alignItems: "center",
    marginTop: 15,
  },
  btnInRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  btnRight: {
    marginLeft: 10,
  },
  btnLeft: {
    marginRight: 10,
  },
  update_avatar: {
    borderRadius: 100,
    width: 200,
    height: 200,
  },
  overlay: {
    flex: 1,
    position: "absolute",
    backgroundColor: "black",
    opacity: 0.5,
    width: 200,
    height: 200,
  },
});
