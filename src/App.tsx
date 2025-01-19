import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import socket from "./utils/socket";
function App() {
  const [inputValue, setInputValue] = useState<string>("");
  const profile = JSON.parse(localStorage.getItem("profile") || "{}");
  useEffect(() => {
    socket.auth = {
      _id: profile?.result?._id,
    };
    socket.connect();
    socket.on("receive_message", (data) => {
      console.log(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [profile?.result?._id]);

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
        localStorage.setItem("profile", JSON.stringify(res.data));
      })
      .catch((err) => {
        return err;
      });

    return () => {
      controller.abort();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit("send_message", {
      message: inputValue,
      receiver: "6742f6cd4a9c7820fd377c61", // user_id
    });
  };

  return (
    <>
      {profile?.result?.name ? (
        <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-2">
            Hi {profile.result.name}, Welcome to Chat Form
          </h2>
          <form
            onSubmit={(e) => {
              handleSubmit(e);
            }}
          >
            <input
              type="text"
              placeholder="Type a message..."
              className="w-full p-2 text-sm text-gray-700 rounded-lg border-2 border-gray-300 outline-none"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
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
        <h1 className="text-xl text-center mt-10">Login first</h1>
      )}
    </>
  );
}

export default App;
