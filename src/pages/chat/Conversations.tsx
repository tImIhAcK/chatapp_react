  /* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../storage/auth";
import useAxios from "../../utils/useAxios";

interface UserResponse {
  username: string;
  name: string;
  url: string;
}

export function Conversations() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const instance = useAxios();
  const [user] = useAuthStore((state) => [state.user]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await instance.get("/auth/users/"); // Use axiosInstance to make the GET request
        setUsers(response.data.results);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }

    // Fetch users only when component mounts
    fetchUsers();
  }, []);

  console.log(users);

  function createConversationName(username: string) {
    const namesAlph = [user()?.username, username].sort();
    return `${namesAlph[0]}__${namesAlph[1]}`;
  }

  return (
    <div>
      {users
        .filter((u) => u.username !== user()?.username)
        .map((u) => (
          <Link
            key={u.username}
            to={`chats/${createConversationName(u.username)}`}
          >
            <div>{u.username}</div>
          </Link>
        ))}
    </div>
  );
}
