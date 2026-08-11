import { useEffect, useState } from "react";

const Clock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div
            className="clock"
            style={{
                fontSize: "15px",
                fontWeight: "bold",
                fontFamily: "'Poppins', sans-serif",
                textTransform: "lowercase",
                opacity: 0.85,
                lineHeight: 1,
            }}
        >
            {time.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            })}
        </div>
    );
};

export default Clock;