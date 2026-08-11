import { useEffect, useRef, useState } from "react";

const PLAYLIST_ID =
    "PLeatb7hupNV_AWUl_7ttbsKeCQh8tF5N4";

/* =========================================================
ICONS
========================================================= */

const ShuffleIcon = () => (<svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
> <path d="M3 7h3c4 0 5 10 9 10h6" /> <path d="M18 14l3 3-3 3" /> <path d="M3 17h3c1.5 0 2.5-1 3.5-2.5" /> <path d="M15 9.5C16 8 17 7 19 7h2" /> <path d="M18 4l3 3-3 3" /> </svg>
);

const PreviousIcon = () => (<svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="currentColor"
> <path d="M6 5h2v14H6z" /> <path d="M18 6.5L10 12l8 5.5z" /> </svg>
);

const NextIcon = () => (<svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="currentColor"
> <path d="M16 5h2v14h-2z" /> <path d="M6 6.5L14 12l-8 5.5z" /> </svg>
);

const QueueIcon = () => (<svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
> <path d="M4 6h11" /> <path d="M4 11h11" /> <path d="M4 16h7" /> <path
        d="M17 15l4 3-4 3z"
        fill="currentColor"
        stroke="none"
    /> </svg>
);

/* =========================================================
MUSIC PLAYER
========================================================= */

const MusicPlayer = () => {
    const playerRef = useRef(null);
    const progressTimerRef = useRef(null);

    const [apiReady, setApiReady] = useState(false);
    const [playing, setPlaying] = useState(false);

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(210);

    const [songTitle, setSongTitle] = useState(() => localStorage.getItem("rt_title") || "");
    const [songArtist, setSongArtist] = useState(() => localStorage.getItem("rt_artist") || "");
    const [currentVideoId, setCurrentVideoId] = useState(() => localStorage.getItem("rt_videoid") || "");

    const [shuffle, setShuffle] = useState(false);
    const [showPlaylist, setShowPlaylist] = useState(false);
    const [playlistSongs, setPlaylistSongs] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    /* =========================================================
       LOAD YOUTUBE IFRAME API
    ========================================================= */

    useEffect(() => {
        if (window.YT && window.YT.Player) {
            setApiReady(true);
            return;
        }

        const existingScript = document.querySelector(
            'script[src="https://www.youtube.com/iframe_api"]'
        );

        if (existingScript) {
            window.onYouTubeIframeAPIReady = () => {
                setApiReady(true);
            };
            return;
        }

        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.body.appendChild(script);

        window.onYouTubeIframeAPIReady = () => {
            setApiReady(true);
        };

        return () => {
            window.onYouTubeIframeAPIReady = null;
        };
    }, []);

    /* =========================================================
       UPDATE CURRENT SONG
    ========================================================= */

    const updateSongInfo = (player) => {
        try {
            const videoData = player.getVideoData();
            if (!videoData) return;

            const id = videoData.video_id || "";
            const title = videoData.title || "";
            const author = videoData.author || "";

            if (id) {
                setCurrentVideoId(id);
                localStorage.setItem("rt_videoid", id);
            }
            if (title) {
                setSongTitle(title);
                localStorage.setItem("rt_title", title);
            }
            if (author) {
                setSongArtist(author);
                localStorage.setItem("rt_artist", author);
            }

            const total = player.getDuration();
            if (total) setDuration(total);

            if (id) {
                setPlaylistSongs((songs) => {
                    const index = songs.findIndex(
                        (song) => song.videoId === id
                    );
                    if (index !== -1) {
                        setCurrentIndex(index);
                    }
                    return songs;
                });
            }
        } catch {
            // YouTube may not be ready yet.
        }
    };

    /* =========================================================
       GET PLAYLIST
    ========================================================= */

    const loadPlaylistData = (player) => {
        try {
            const ids = player.getPlaylist();
            if (!ids || !ids.length) {
                return false;
            }

            const songs = ids.map((id, index) => ({
                videoId: id,
                title: "Song " + (index + 1),
                artist: "YouTube",
            }));

            setPlaylistSongs(songs);
            return true;
        } catch {
            return false;
        }
    };

    /* =========================================================
       CREATE YOUTUBE PLAYER
    ========================================================= */

    useEffect(() => {
        if (!apiReady) return;

        const container = document.getElementById(
            "youtube-music-player"
        );
        if (!container) return;

        const randomStart = Math.floor(Math.random() * 20);

        playerRef.current = new window.YT.Player(
            "youtube-music-player",
            {
                width: "200",
                height: "200",

                playerVars: {
                    autoplay: 0,
                    controls: 0,
                    playsinline: 1,
                    rel: 0,
                    modestbranding: 1,
                    listType: "playlist",
                    list: PLAYLIST_ID,
                    index: randomStart,
                },

                events: {
                    onReady: (event) => {
                        const player = event.target;
                        const loaded = loadPlaylistData(player);

                        if (loaded) {
                            const songs = player.getPlaylist();
                            if (songs && songs.length) {
                                const safeIndex =
                                    randomStart < songs.length
                                        ? randomStart
                                        : Math.floor(
                                            Math.random() *
                                            songs.length
                                        );

                                setCurrentIndex(safeIndex);

                                try {
                                    player.playVideoAt(safeIndex);
                                    player.pauseVideo();
                                    player.seekTo(0, true);
                                } catch {
                                    // Ignore
                                }

                                updateSongInfo(player);
                            }
                        }
                    },

                    onStateChange: (event) => {
                        const player = event.target;

                        if (event.data === window.YT.PlayerState.PLAYING) {
                            setPlaying(true);
                            setDuration(player.getDuration() || 0);
                            updateSongInfo(player);
                        }

                        if (event.data === window.YT.PlayerState.PAUSED) {
                            setPlaying(false);
                            updateSongInfo(player);
                        }

                        if (event.data === window.YT.PlayerState.ENDED) {
                            setPlaying(false);
                            nextSong();
                        }

                        if (
                            event.data === window.YT.PlayerState.BUFFERING ||
                            event.data === window.YT.PlayerState.CUED
                        ) {
                            updateSongInfo(player);
                        }
                    },
                },
            }
        );

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, [apiReady]);

    /* =========================================================
       LOAD TITLES SILENTLY
    ========================================================= */

    useEffect(() => {
        if (!playlistSongs.length) return;

        let cancelled = false;

        const loadTitles = async () => {
            const updated =
                await Promise.all(
                    playlistSongs.map(
                        async (song) => {
                            if (
                                song.title &&
                                !song.title.startsWith("Song ")
                            ) {
                                return song;
                            }

                            try {
                                const response =
                                    await fetch(
                                        "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=" +
                                        song.videoId +
                                        "&format=json"
                                    );

                                if (!response.ok) return song;

                                const data = await response.json();
                                return {
                                    ...song,
                                    title: data.title || song.title,
                                    artist: data.author_name || "YouTube",
                                };
                            } catch {
                                return song;
                            }
                        }
                    )
                );

            if (!cancelled) {
                setPlaylistSongs(updated);
                setCurrentIndex((current) => current);
            }
        };

        loadTitles();

        return () => {
            cancelled = true;
        };
    }, [playlistSongs.length]);

    /* =========================================================
       UPDATE CURRENT DISPLAY FROM PLAYLIST
    ========================================================= */

    useEffect(() => {
        if (!playlistSongs.length) return;

        const current = playlistSongs[currentIndex];
        if (!current) return;

        if (current.title && !current.title.startsWith("Song ")) {
            setSongTitle(current.title);
        }
        if (current.artist) {
            setSongArtist(current.artist);
        }
        if (current.videoId) {
            setCurrentVideoId(current.videoId);
        }
    }, [currentIndex, playlistSongs]);

    /* =========================================================
       PROGRESS TIMER
    ========================================================= */

    useEffect(() => {
        if (progressTimerRef.current) {
            clearInterval(progressTimerRef.current);
        }

        if (!playing) return;

        progressTimerRef.current =
            setInterval(() => {
                if (!playerRef.current) return;

                try {
                    setCurrentTime(playerRef.current.getCurrentTime() || 0);
                    setDuration(playerRef.current.getDuration() || 0);
                } catch {
                    // Ignore while loading.
                }
            }, 300);

        return () => {
            clearInterval(progressTimerRef.current);
        };
    }, [playing]);

    /* =========================================================
       KEYBOARD CONTROLS (SPACE, LEFT, RIGHT)
    ========================================================= */

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (
                ["INPUT", "TEXTAREA", "SELECT"].includes(
                    document.activeElement.tagName
                )
            ) {
                return;
            }

            if (e.code === "Space") {
                e.preventDefault();
                togglePlay();
            } else if (e.code === "ArrowRight") {
                e.preventDefault();
                nextSong();
            } else if (e.code === "ArrowLeft") {
                e.preventDefault();
                previousSong();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [playing, currentIndex, playlistSongs, shuffle]);

    /* =========================================================
       PLAY / PAUSE
    ========================================================= */

    const togglePlay = () => {
        if (!playerRef.current) return;

        if (playing) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
    };

    /* =========================================================
       NEXT
    ========================================================= */

    const nextSong = () => {
        if (!playerRef.current) return;

        if (!playlistSongs.length) {
            playerRef.current.nextVideo();
            return;
        }

        let nextIndex;

        if (shuffle) {
            do {
                nextIndex =
                    Math.floor(
                        Math.random() *
                        playlistSongs.length
                    );
            } while (
                playlistSongs.length > 1 &&
                nextIndex === currentIndex
            );
        } else {
            nextIndex =
                (currentIndex + 1) %
                playlistSongs.length;
        }

        setCurrentIndex(nextIndex);

        const song = playlistSongs[nextIndex];
        if (song) {
            setSongTitle(song.title);
            setSongArtist(song.artist);
            setCurrentVideoId(song.videoId);
            setCurrentTime(0);
        }

        playerRef.current.playVideoAt(nextIndex);
    };

    /* =========================================================
       PREVIOUS
    ========================================================= */

    const previousSong = () => {
        if (!playerRef.current) return;

        if (currentTime > 3) {
            playerRef.current.seekTo(0, true);
            setCurrentTime(0);
            return;
        }

        if (!playlistSongs.length) {
            playerRef.current.previousVideo();
            return;
        }

        let previousIndex = currentIndex - 1;

        if (previousIndex < 0) {
            previousIndex = playlistSongs.length - 1;
        }

        setCurrentIndex(previousIndex);

        const song = playlistSongs[previousIndex];
        if (song) {
            setSongTitle(song.title);
            setSongArtist(song.artist);
            setCurrentVideoId(song.videoId);
            setCurrentTime(0);
        }

        playerRef.current.playVideoAt(previousIndex);
    };

    /* =========================================================
       SHUFFLE
    ========================================================= */

    const toggleShuffle = () => {
        setShuffle((prev) => !prev);
    };

    /* =========================================================
       SELECT SONG FROM LIST
    ========================================================= */

    const selectSong = (index) => {
        if (!playerRef.current) return;

        const song = playlistSongs[index];
        if (!song) return;

        setCurrentIndex(index);
        setCurrentTime(0);
        setSongTitle(song.title);
        setSongArtist(song.artist);
        setCurrentVideoId(song.videoId);

        playerRef.current.playVideoAt(index);
    };

    /* =========================================================
       SEEK
    ========================================================= */

    const handleSeek = (event) => {
        if (!playerRef.current || !duration) return;

        const rect = event.currentTarget.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentage = clickX / rect.width;
        const newTime = percentage * duration;

        playerRef.current.seekTo(newTime, true);
        setCurrentTime(newTime);
    };

    /* =========================================================
       FORMAT TIME
    ========================================================= */

    const formatTime = (time) => {
        if (!time || isNaN(time)) return "0:00";

        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);

        return (
            minutes +
            ":" +
            seconds.toString().padStart(2, "0")
        );
    };

    const progressPercent =
        duration > 0
            ? (currentTime / duration) * 100
            : 0;

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <>
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    .rotating-album {
                        animation: spin 8s linear infinite;
                    }
                `}
            </style>

            {/* HIDDEN YOUTUBE PLAYER */}
            <div
                id="youtube-music-player"
                style={{
                    position: "fixed",
                    width: "200px",
                    height: "200px",
                    left: "-1000px",
                    top: "0",
                    opacity: 0,
                    pointerEvents: "none",
                }}
            />

            {/* PLAYLIST (SMOOTH TRANSITION) */}
            <div
                className="music-playlist-panel"
                style={{
                    position: "fixed",
                    left: "50%",
                    bottom: "190px",
                    transform: `translateX(-50%) translateY(${showPlaylist ? "0px" : "15px"})`,
                    width: "470px",
                    height: "380px",
                    maxWidth: "calc(100vw - 40px)",
                    background: "rgba(0,0,0,0.12)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    border: "1px solid rgba(255, 253, 253, 0.15)",
                    borderRadius: "20px",
                    boxShadow: "0 12px 45px rgba(0,0,0,0.25)",
                    overflow: "hidden",
                    zIndex: 1000,
                    color: "white",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                    opacity: showPlaylist ? 1 : 0,
                    pointerEvents: showPlaylist ? "auto" : "none",
                    transition: "opacity 0.25s ease, transform 0.25s ease",
                }}
            >
                <div
                    className="music-playlist-scroll"
                    style={{
                        width: "100%",
                        height: "100%",
                        overflowY: "auto",
                        padding: "8px",
                        boxSizing: "border-box",
                        scrollbarWidth: "thin",
                        scrollbarColor: "rgba(255,255,255,0.2) transparent",
                    }}
                >
                    {playlistSongs.map((song, index) => {
                        const active = index === currentIndex;

                        return (
                            <button
                                key={song.videoId + "-" + index}
                                onClick={() => selectSong(index)}
                                style={{
                                    width: "100%",
                                    height: "40px",
                                    display: "grid",
                                    gridTemplateColumns: "36px minmax(0, 1fr) 200px",
                                    alignItems: "center",
                                    columnGap: "14px",
                                    padding: "0 12px",
                                    margin: "0 0 2px 0",
                                    border: "none",
                                    borderRadius: "10px",
                                    background: active
                                        ? "rgba(248, 243, 243, 0.2)"
                                        : "transparent",
                                    color: "white",
                                    cursor: "pointer",
                                    textAlign: "left",
                                    transition: "background 0.15s ease",
                                    boxSizing: "border-box",
                                }}
                                onMouseEnter={(e) => {
                                    if (!active) {
                                        e.currentTarget.style.background =
                                            "rgba(255,255,255,0.06)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!active) {
                                        e.currentTarget.style.background =
                                            "transparent";
                                    }
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        fontFamily: "'Poppins', sans-serif",
                                        color: active ? "white" : "rgba(255,255,255,0.5)",
                                        textAlign: "left",
                                        letterSpacing: "-0.01em",
                                    }}
                                >
                                    {active && playing ? "▶" : index + 1}
                                </div>

                                <div
                                    style={{
                                        minWidth: 0,
                                        fontSize: "13px",
                                        fontWeight: active ? 600 : 500,
                                        fontFamily: "'Poppins', sans-serif",
                                        color: active
                                            ? "rgba(255,255,255,1)"
                                            : "rgba(255,255,255,0.85)",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        lineHeight: "1.2",
                                        letterSpacing: "-0.01em",
                                    }}
                                >
                                    {song.title}
                                </div>

                                <div
                                    style={{
                                        minWidth: 0,
                                        fontSize: "12px",
                                        fontWeight: active ? 600 : 500,
                                        fontFamily: "'Poppins', sans-serif",
                                        color: active
                                            ? "rgba(255,255,255,0.85)"
                                            : "rgba(255,255,255,0.5)",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        textAlign: "right",
                                        letterSpacing: "-0.01em",
                                    }}
                                >
                                    {song.artist}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* BOTTOM MUSIC PLAYER */}
            <div
                className="music-player"
                style={{
                    width: "470px",
                    borderRadius: "60px",
                    padding: "6px 8px",
                    gap: "12px",
                    display: "flex",
                    alignItems: "center",
                    background: "rgba(254, 254, 254, 0.13)",
                    backdropFilter: "blur(5px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1px solid rgba(15, 14, 14, 0.44)",
                    boxShadow: "0 12px 45px rgba(0,0,0,0.25)",
                }}
            >
                {/* ALBUM ART */}
                <div
                    className={playing ? "rotating-album" : ""}
                    style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        flexShrink: 0,
                    }}
                >
                    <img
                        src={
                            currentVideoId
                                ? "https://i.ytimg.com/vi/" +
                                currentVideoId +
                                "/hqdefault.jpg"
                                : "/album-art.jpg"
                        }
                        alt="Album art"
                        onError={(e) => {
                            e.currentTarget.src = "/album-art.jpg";
                        }}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                        }}
                    />
                </div>

                {/* SONG INFO */}
                <div
                    style={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        minWidth: 0,
                    }}
                >
                    <div
                        style={{
                            fontWeight: "bold",
                            fontSize: "13px",
                            fontFamily: "'Poppins', sans-serif",
                            color: "white",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            lineHeight: "1.3",
                        }}
                    >
                        {songTitle}
                    </div>

                    <div
                        style={{
                            fontSize: "11px",
                            fontWeight: "500",
                            fontFamily: "'Poppins', sans-serif",
                            color: "rgba(255,255,255,0.7)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            marginBottom: "6px",
                            lineHeight: "1.2",
                        }}
                    >
                        {songArtist}
                    </div>

                    {/* PROGRESS BAR */}
                    <div
                        onClick={handleSeek}
                        style={{
                            width: "100%",
                            height: "4px",
                            background: "rgba(255,255,255,0.25)",
                            borderRadius: "2px",
                            cursor: "pointer",
                            position: "relative",
                        }}
                    >
                        <div
                            style={{
                                width: progressPercent + "%",
                                height: "100%",
                                background: "white",
                                borderRadius: "2px",
                            }}
                        />
                    </div>

                    {/* TIME */}
                    <div
                        style={{
                            fontSize: "10px",
                            fontFamily: "'Poppins', sans-serif",
                            color: "rgba(255,255,255,0.65)",
                            marginTop: "4px",
                        }}
                    >
                        {formatTime(currentTime)}
                        {" / "}
                        {formatTime(duration)}
                    </div>
                </div>

                {/* CONTROLS */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                    }}
                >
                    {/* SHUFFLE */}
                    <button
                        onClick={toggleShuffle}
                        style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: shuffle
                                ? "rgba(255,255,255,0.28)"
                                : "transparent",
                            border: "none",
                            color: "white",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 0,
                            transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = shuffle
                                ? "rgba(255,255,255,0.28)"
                                : "rgba(255,255,255,0.10)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = shuffle
                                ? "rgba(255,255,255,0.28)"
                                : "transparent";
                        }}
                    >
                        <ShuffleIcon />
                    </button>

                    {/* PREVIOUS */}
                    <button
                        onClick={previousSong}
                        style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "transparent",
                            border: "none",
                            color: "white",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 0,
                            transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(255,255,255,0.10)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                        }}
                    >
                        <PreviousIcon />
                    </button>

                    {/* PLAY / PAUSE */}
                    <button
                        onClick={togglePlay}
                        style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "50%",
                            background: "white",
                            color: "black",
                            border: "0",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            fontWeight: "bold",
                            transition: "transform 0.15s ease, opacity 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.08)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                        }}
                    >
                        {playing ? "❚❚" : "▶"}
                    </button>

                    {/* NEXT */}
                    <button
                        onClick={nextSong}
                        style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "transparent",
                            border: "none",
                            color: "white",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 0,
                            transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(255,255,255,0.10)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                        }}
                    >
                        <NextIcon />
                    </button>

                    {/* PLAYLIST */}
                    <button
                        onClick={() => setShowPlaylist(!showPlaylist)}
                        style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: showPlaylist
                                ? "rgba(255,255,255,0.28)"
                                : "transparent",
                            border: "none",
                            color: "white",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 0,
                            transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                            if (!showPlaylist) {
                                e.currentTarget.style.background = "rgba(255,255,255,0.10)";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!showPlaylist) {
                                e.currentTarget.style.background = "transparent";
                            }
                        }}
                    >
                        <QueueIcon />
                    </button>
                </div>
            </div>
        </>
    );
};

export default MusicPlayer;