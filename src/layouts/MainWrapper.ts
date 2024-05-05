import { useEffect, useState, ReactNode } from "react";
import AuthService from "../utils/AuthService";

interface MainWrapperProps {
    children: ReactNode;
  }

const MainWrapper = ({ children }: MainWrapperProps) => {

    const [loading, setLoading] = useState<boolean>(true);
  
    useEffect(() => {
  
      const handler = async () => {
        setLoading(true);
        await AuthService.setUser();
        setLoading(false);
      };
  
      handler();
  
    }, []);
  
    return loading ? null : children;
  
  };


export default MainWrapper;