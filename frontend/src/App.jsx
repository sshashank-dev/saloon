import "./App.css";

import Clock from "./components/Clock";
import MusicPlayer from "./components/MusicPlayer";
import OnlineCounter from "./components/OnlineCounter";

function App() {
  return (
    <main className="app">

      {/* Background Image */}
      <img
        className="background-image"
        src="/barber-shop.jpg"
        alt=""
      />

      {/* Dark overlay */}
      {/* <div className="overlay"></div> */}

      {/* Online counter */}
      <OnlineCounter />

      {/* Clock */}
      <Clock />

      {/* Music player */}
      <MusicPlayer />

      {/* Contact */}
      <div
        className="contact-link"
        style={{
          marginTop: "670px",
          fontSize: "10px",
          fontFamily: "'Poppins', sans-serif",
          fontWeight: "bold",
          color: "white",
          textAlign: "center",
          opacity: 0.8,
        }}
      >
        Contact @{" "}
        <a
          href="https://www.linkedin.com/in/shashank-sharma-9b7b2b257/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "white",
            textDecoration: "none",
            fontWeight: "600",
          }}
        >
          Shashank Sharma
        </a>
      </div>

    </main>
  );
}

export default App;