import api from "./axios";
import { useAuthStore } from "../storage/auth";
import { jwtDecode, JwtPayload } from "jwt-decode";
import Cookies from "js-cookie";
import { UserModel } from "../models/User";
import useAxios from "../../utils/useAxios";

class AuthService {
  async setAuthUser(
    access_token: string,
    refresh_token: string
  ): Promise<void> {
    Cookies.set("access_token", access_token, {
      expires: 1,
      secure: true,
    });

    Cookies.set("refresh_token", refresh_token, {
      expires: 7,
      secure: true,
    });

    const user: UserModel | null = jwtDecode(access_token);

    if (user) {
      useAuthStore.getState().setUser(user);
    }
    useAuthStore.getState().setLoading(false);
  }

  async setUser(): Promise<void> {
    const accessToken: string | undefined = Cookies.get("access_token");
    const refreshToken: string | undefined = Cookies.get("refresh_token");

    if (!accessToken || !refreshToken) return;

    if (await this.isAccessTokenExpired(accessToken)) {
      const response = await this.getRefreshToken(refreshToken);
      this.setAuthUser(response.access, response.refresh);
    } else {
      this.setAuthUser(accessToken, refreshToken);
    }
  }

  async getRefreshToken(
    refresh: string
  ): Promise<{ access: string; refresh: string }> {
    const response = await api.post<{ access: string; refresh: string }>(
      "auth/jwt/token/refresh/",
      {
        refresh,
      }
    );

    return response.data;
  }

  async isAccessTokenExpired(accessToken: string): Promise<boolean> {
    try {
      const decodedToken = jwtDecode(accessToken) as JwtPayload;
      return decodedToken?.exp !== undefined
        ? decodedToken.exp < Date.now() / 1000
        : true;
    } catch (e) {
      return true;
    }
  }

  async login(username: string, password: string) {
    const response = await api.post("auth/jwt/token/", {
      username,
      password,
    });

    return response;
  }

  async register(
    email: string,
    username: string,
    password: string,
    re_password: string
  ) {
    const response = await api.post("auth/users/", {
      email,
      username,
      password,
      re_password,
    });

    return response;
  }

  async logout(): Promise<void> {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");

    const defaultUser: UserModel = {
      user_id: "",
      username: "",
      email: "",
      is_active: false,
    };
    useAuthStore.getState().setUser(defaultUser);
  }
}

export default new AuthService();
