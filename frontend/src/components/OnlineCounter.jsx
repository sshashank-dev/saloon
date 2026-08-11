import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const OnlineCounter = () => {
    const [onlineUsers, setOnlineUsers] = useState(0);

    useEffect(() => {
        const socket = io("https://superdeluxe-saloon.vercel.app/");

        socket.on("onlineUsers", (count) => {
            setOnlineUsers(count);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div
            className="online-counter"
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                gap: "6px",
                marginLeft: "-8px",
            }}
        >
            <style>
                {`
                    @keyframes pulseGlow {
                        0% {
                            transform: scale(0.95);
                            box-shadow: 0 0 0 0 rgba(92, 255, 117, 0.7);
                        }
                        70% {
                            transform: scale(1);
                            box-shadow: 0 0 0 6px rgba(92, 255, 117, 0);
                        }
                        100% {
                            transform: scale(0.95);
                            box-shadow: 0 0 0 0 rgba(92, 255, 117, 0);
                        }
                    }
                `}
            </style>
            <span
                className="online-dot"
                style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "#5cff75",
                    boxShadow: "0 0 10px #5cff75, 0 0 20px rgba(92, 255, 117, 0.5)",
                    display: "inline-block",
                    animation: "pulseGlow 2s infinite",
                }}
            ></span>
            <span
                style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    fontFamily: "'Poppins', sans-serif",
                    opacity: 0.85,
                    lineHeight: 1,
                }}
            >
                {onlineUsers} ONLINE
            </span>
        </div>
    );
};

export default OnlineCounter;