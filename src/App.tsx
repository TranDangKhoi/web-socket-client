import { useContext, useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import socket from "./utils/socket";
import { useForm } from "react-hook-form";
import { AuthContext } from "./contexts/auth.contexts";
function App() {
  const {profile, setProfile} = useContext(AuthContext);
  const {
    register,
    handleSubmit: handleLoginSubmit,
  } = useForm<{email: string; password: string}>();
  const [chatInputValue, setChatInputValue] = useState<string>("");
  const [messages, setMessages] = useState<
    { sender_name: string; message: string }[]
  >([]);
  useEffect(() => {
    socket.auth = {
      _id: profile?._id,
    };
    socket.connect();
    socket.on("receive_message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, [profile?._id]);

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

    fetchUserInfo()
      .then((res) => {
        setProfile(res.data.result);
        localStorage.setItem("profile", JSON.stringify(res.data.result));
      })
      .catch((err) => {
        return err;
      });

    return () => {
      controller.abort();
    };
  }, [setProfile]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit("send_message", {
      message: chatInputValue,
      sender_name: profile?.name,
      receiver: "6742f6cd4a9c7820fd377c61", // user_id
    });
    setChatInputValue("");
  };

  const handleLogin = async (data) => {
    const controller = new AbortController();
    const result = await axios.post("/users/signin", {
      email: data.email,
      password: data.password,
    }, {
      baseURL: "http://localhost:8080",
      signal: controller.signal,
    })

    if (result.status === 200) {
      localStorage.setItem("access_token", result.data.access_token);
      localStorage.setItem("refresh_token", result.data.refresh_token);
      localStorage.setItem("profile", JSON.stringify(result.data.user));
      setProfile(result.data.user);
    }
    return result;
  }

  return (
    <>
      {profile?.name ? (
        <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-2">
            Hi {profile.name}, Welcome to Chat Form
          </h2>
          <ul className="space-y-2">
            {messages.map((message, index) => (
              <li key={index} className="p-2 bg-gray-200 rounded-lg">
                <div className="flex flex-col gap-1">
                  <p className="font-medium">{message.sender_name}</p>
                  <p className="text-sm">{message.message}</p>
                </div>
              </li>
            ))}
          </ul>
          <form
            onSubmit={(e) => {
              handleSubmit(e);
            }}
          >
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
          <form className="mt-4 flex flex-col gap-4 max-w-[500px] mx-auto" onSubmit={handleLoginSubmit(handleLogin)}>
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
