/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useAuthStore } from "../../storage/auth";
import Cookies from "js-cookie";
import { useParams } from "react-router-dom";
import { MessageModel } from "../../models/Message";
import { ConversationModel } from "../../models/Conversation";
import { Message } from "../../components/Messages";
import useAxios from "../../utils/useAxios";


const Chat = () => {
  const instance = useAxios();
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [messageHistory, setMessageHistory] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [conversation, setConversation] = useState<ConversationModel | null>(
    null
  );

  const [user] = useAuthStore((state) => [state.user]);
  const [page, setPage] = useState(2);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [meTyping, setMeTyping] = useState(false);
  const [typing, setTyping] = useState(false);

  function updateTyping(event: { user: string; typing: boolean }) {
    if (event.user !== user()!.username) {
      setTyping(event.typing);
    }
  }

  const { conversationName } = useParams();
  const accessToken = Cookies.get("access_token");

  const { readyState, sendJsonMessage } = useWebSocket(
    user() ? `ws://127.0.0.1:8123/ws/${conversationName}/` : null,
    {
      queryParams: {
        token: user() ? accessToken : "",
        conversation_name: conversationName,
      },
      onOpen: () => console.log("connected"),
      onClose: () => console.log("Disconnected"),
      onMessage: (e) => {
        const data = JSON.parse(e.data);
        switch (data.type) {
          case "chat_message_echo":
            setMessageHistory((prev: any) => [data.message, ...prev]);
            sendJsonMessage({
              type: "read_messages",
            });
            break;
          case "last_50_messages":
            setMessageHistory(data.messages);
            setHasMoreMessages(data.has_more);
            break;
          case "user_join":
            setParticipants((pcpts: string[]) => {
              if (!pcpts.includes(data.user)) {
                return [...pcpts, data.user];
              }
              return pcpts;
            });
            break;
          case "user_leave":
            setParticipants((pcpts: string[]) => {
              const newPcpts = pcpts.filter((x) => x !== data.user);
              return newPcpts;
            });
            break;
          case "online_user_list":
            setParticipants(data.users);
            break;
          case "typing":
            updateTyping(data);
            break;
          default:
            console.error("Unknown message type!");
            break;
        }
      },
      // shouldReconnect: (closeEvent) => true,
    }
  );

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  useEffect(() => {
    if (connectionStatus === "Open") {
      sendJsonMessage({
        type: "read_messages",
      });
    }
  }, [connectionStatus, sendJsonMessage]);

  async function fetchMessages() {
    const apiRes = await instance.get(`/messages/?conversation=${conversationName}&page=${page}`);
    if (apiRes.status === 200) {
      const data: {
        count: number;
        next: string | null; // URL
        previous: string | null; // URL
        results: MessageModel[];
      } = apiRes;
      setHasMoreMessages(data.next !== null);
      setPage(page + 1);
      setMessageHistory((prev: MessageModel[]) => prev.concat(data.results));
    }
  }

  const handleChangeMessage = (e: any) => {
    setMessage(e.target.value);
  };

  const handleChangeName = (e: any) => {
    setName(e.target.value);
  };

  const handleSubmit = () => {
    sendJsonMessage({
      type: "chat_message",
      message,
    });
    setName("");
    setMessage("");
  };

  return (
    <div className="max-w-md mx-auto my-8 p-6 bg-white rounded-md shadow-md">
      <span className="text-lg mb-4 block">
        The WebSocket is currently {connectionStatus}
        <p>{welcomeMessage}</p>
      </span>

      <input
        name="name"
        placeholder="Name"
        onChange={handleChangeName}
        value={name}
        className="w-full py-2 px-3 border border-gray-300 rounded mb-4"
      />

      <input
        name="message"
        placeholder="Message"
        onChange={handleChangeMessage}
        value={message}
        className="w-full py-2 px-3 border border-gray-300 rounded mb-4"
      />

      <button
        onClick={() => {
          handleSubmit;
        }}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline-blue"
      >
        Submit
      </button>

      <hr className="my-4" />

      <ul
        id="messages"
        className="mt-3 flex flex-col-reverse relative w-full border border-gray-200 overflow-y-auto p-6"
      >
        {messageHistory.map((message: MessageModel) => (
          <Message key={message.id} message={message} />
        ))}
      </ul>
    </div>
  );
};

export default Chat;
