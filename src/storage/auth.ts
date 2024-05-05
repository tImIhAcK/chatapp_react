import {create} from "zustand";
import {mountStoreDevtool} from "simple-zustand-devtools";
import { UserModel } from "../models/User";

interface AuthStore {
    allUserData: UserModel | null;
    loading: boolean;
    user: () => {
      user_id: string;
      username: string;
      email: string;
      is_active: boolean;
    };
    setUser: (user: UserModel) => void;
    setLoading: (loading: boolean) => void;
    isLoggedIn: () => boolean;
  }


const useAuthStore = create<AuthStore>((set, get) => ({
    allUserData: null,
    loading: false,
    user: () => ({
      user_id: get().allUserData?.user_id || "",
      username: get().allUserData?.username || "",
      email: get().allUserData?.email || "",
      is_active: get().allUserData?.is_active ?? false
    }),
    setUser: (user: UserModel) => set({ allUserData: user }),
    setLoading: (loading: boolean) => set({ loading }),
    isLoggedIn: () => get().allUserData !== null,
  }));
  
  if (import.meta.env.DEV) {
    mountStoreDevtool("Store", useAuthStore);
  }
  
export { useAuthStore };
  