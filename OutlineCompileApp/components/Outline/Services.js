import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI, endpoints } from "../../configs/APIs";
import * as FileSystem from "expo-file-system";

export const download = async (id, name) => {
  let url = `${endpoints["outline"]}${id}/download/`;
  let token = await AsyncStorage.getItem("token");
  let res = await authAPI(token).get(url);
  let filename = `${name}.docx`;
  console.log(filename);
  const destinationPath = FileSystem.documentDirectory + { filename };
  console.log(destinationPath);
  let result = await FileSystem.downloadAsync(res.data, destinationPath);
  console.log(result);
  saveFile(result.uri, filename, result.headers["content-type"]);
};

const saveFile = async (uri, filename, mimetype) => {
  try {
    const permissions =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (permissions.granted) {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        filename,
        mimetype
      )
        .then(async (uri) => {
          await FileSystem.writeAsStringAsync(uri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
        })
        .catch((e) => console.log(e));
    } else {
      console.log("access denied");
    }
  } catch (err) {
    console.log(err);
  }
};

export const approve = async (id, status) => {
  try {
    status = parseInt(status);
    let token = await AsyncStorage.getItem("token");
    let url = `${endpoints["outline"]}${id}/approve-outline/?status=${status}`;
    let res = await authAPI(token).patch(url);
    if (res.status === 200) {
      console.info("successed");
    } else {
      console.info("failed");
    }
  } catch (err) {
    console.log(err);
  }
};

export const outlineDelete = async (id) => {
  try {
    let token = await AsyncStorage.getItem("token");
    let url = `${endpoints["outline"]}${id}/`;
    let res = await authAPI(token).patch(url, { is_active: 0 });
    if (res.status === 200) {
      console.info("successed");
    } else {
      console.info("failed");
    }
  } catch (err) {
    console.log(err);
  }
};

export const postComment = async (id, content) => {
  try {
    let url = `${endpoints["outline"]}${id}/comment/`;
    const token = await AsyncStorage.getItem("token");
    let res = authAPI(token).post(url, { content: content });
  } catch (err) {
    console.log(err);
  }
};
