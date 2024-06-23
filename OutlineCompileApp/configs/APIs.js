import axios from "axios";
// const BASE_URL = "http://172.16.40.51:8000";
const BASE_URL = "http://10.17.50.105:8000";

export const endpoints = {
  register: "/user/",
  login: "/o/token/",
  currentUser: "/user/current-user/",
  outline: "/subject-outline/",
  lecturer: "/person/",
  subject: "/subject/",
};

export const authAPI = (token) => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

export default axios.create({
  baseURL: BASE_URL,
});
