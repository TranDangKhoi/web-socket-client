import { useEffect } from "react";
import "./App.css";
import { io } from "socket.io-client";
function App() {
  const socket = io("http://localhost:8080");
  useEffect(() => {
    socket.on("connect", () => {
      console.log(socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected");
    });
  }, [socket]);
  return <>Socket.io testing</>;
}

export default App;
