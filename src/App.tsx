import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import "./App.css";
import { AuthContext } from "./contexts/auth.contexts";
import { TPrivateChatMessage } from "./types/chat.types";
import socket from "./utils/socket";

const USERNAMES_FOR_EXAMPLE = [
  {
    name: "Fern",
    value: "user6742f6057066a070230c8677",
  },
  {
    name: "Stark",
    value: "user6742f6cd4a9c7820fd377c61",
  },
];
function App() {
  const { profile, setProfile, isLoggedIn, setIsLoggedIn } =
    useContext(AuthContext);
  const { register, handleSubmit: handleLoginSubmit } = useForm<{
    email: string;
    password: string;
  }>({
    mode: "onSubmit",
  });
  const [chatInputValue, setChatInputValue] = useState<string>("");
  const [messages, setMessages] = useState<TPrivateChatMessage[]>([]);
  const [messageReceiverId, setMessageReceiverId] = useState<string>("");

  useEffect(() => {
    if (!profile?._id) return;

    // Update socket auth
    socket.auth = {
      _id: profile._id,
      Authorization: "Bearer " + localStorage.getItem("access_token"),
    };

    // Connect only if not connected
    if (!socket.connected) socket.connect();

    const handleReceiveMessage = (data: TPrivateChatMessage) => {
      console.log("Received");
      setMessages((prev) => [
        ...prev,
        {
          ...data,
          isSender: data.sender_name === profile.name,
        },
      ]);
    };

    // Remove old listener and add new
    socket.off("receive_message", handleReceiveMessage);
    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [profile?._id, profile?.name]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchUserInfo() {
      const result = await axios.get("/users/me", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("access_token"),
        },
        baseURL: "http://localhost:8080",
        signal: controller.signal,
      });
      return result;
    }
    if (isLoggedIn) {
      fetchUserInfo()
        .then((res) => {
          setProfile(res.data.result);
          localStorage.setItem("profile", JSON.stringify(res.data.result));
        })
        .catch((err) => {
          return err;
        });
    }

    return () => {
      controller.abort();
    };
  }, [isLoggedIn, setProfile]);

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Send to both the current user and the receiver
    socket.emit("send_message", {
      message: chatInputValue,
      sender_name: profile?.name,
      sender_id: profile?._id,
      receiver_id: messageReceiverId,
    });

    // socket.emit("send_message", {
    //   message: chatInputValue,
    //   sender_name: profile?.name,
    //   receiver_id: profile?._id, // user_id
    //   receiver_name: profile?.name,
    // });

    setChatInputValue("");
  };

  const getProfile = async (username: string) => {
    const result = await axios
      .get(`/users/${username}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("access_token"),
        },
        baseURL: "http://localhost:8080",
      })
      .then((res) => {
        console.log(res);
        setMessageReceiverId(res.data.user._id);
      });
    return result;
  };

  const handleLogin = handleLoginSubmit(async (data) => {
    const controller = new AbortController();
    const result = await axios.post(
      "/users/signin",
      {
        email: data.email,
        password: data.password,
      },
      {
        baseURL: "http://localhost:8080",
        signal: controller.signal,
      }
    );

    if (result.status === 201) {
      localStorage.setItem("access_token", result.data.result.access_token);
      localStorage.setItem("refresh_token", result.data.result.refresh_token);
      setIsLoggedIn(true);
    }
    return result;
  });

  return (
    <>
      {profile?.name ? (
        <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-2">
            Hi {profile.name}, Welcome to Chat Form
          </h2>
          <div>
            {USERNAMES_FOR_EXAMPLE.map((user) => (
              <button
                key={user.value}
                className="block"
                onClick={() => {
                  getProfile(user.value);
                }}
              >
                {user.name}
              </button>
            ))}
          </div>
          <ul className="space-y-2">
            {messages.map((message, index) => (
              <li
                key={index}
                className={`p-2 rounded-lg w-32 ${
                  message.isSender
                    ? "ml-auto bg-blue-500 text-white"
                    : "mr-auto bg-gray-200"
                }`}
              >
                <div className="flex flex-col gap-1">
                  <p className="font-medium">{message.sender_name}</p>
                  <p className={`text-sm`}>{message.message}</p>
                </div>
              </li>
            ))}
          </ul>
          <form className="my-2" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Type a message..."
              className="w-full p-2 text-sm text-gray-700 rounded-lg border-2 border-gray-300 outline-none"
              value={chatInputValue}
              onChange={(e) => setChatInputValue(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mt-4"
            >
              Send
            </button>
          </form>
        </div>
      ) : (
        <>
          <h1 className="text-xl text-center mt-10">Login first</h1>
          <form
            className="mt-4 flex flex-col gap-4 max-w-[500px] mx-auto"
            onSubmit={handleLogin}
          >
            <input
              type="text"
              placeholder="E-mail address"
              className="w-full p-2 text-sm text-gray-700 rounded-lg border-2 border-gray-300 outline-none"
              {...register("email")}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-2 text-sm text-gray-700 rounded-lg border-2 border-gray-300 outline-none"
              {...register("password")}
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mt-4"
            >
              Login
            </button>
          </form>
        </>
      )}
    </>
  );
}

export default App;
