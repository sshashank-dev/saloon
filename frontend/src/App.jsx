
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

    </main>
  );
}

export default App;

