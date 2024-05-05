import axios from "axios";
import AuthService from "./AuthService";
import { API_BASE_URL } from "./constants";
import Cookies from "js-cookie";

const useAxios = () => {
  const accessToken: string | undefined = Cookies.get("access_token");
  const refreshToken: string | undefined = Cookies.get("refresh_token");

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
  });
axiosInstance.interceptors.request.use(async (config) => {
    if (!AuthService.isAccessTokenExpired(accessToken)){
        config.headers.Authorization = `Bearer ${accessToken}`
    }else{

    const response = await AuthService.getRefreshToken(refreshToken);
    AuthService.setAuthUser(response.access, response.refresh);

    config.headers.Authorization = `Bearer ${response.access}`;
    return config;
  }
  });

  return axiosInstance;
};

export default useAxios;