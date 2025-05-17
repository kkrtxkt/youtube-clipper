import { useState } from "react";
import styles from "../styles/Home.module.css";
import toast, { Toaster } from "react-hot-toast";

export default function Home() {
  const [url, setUrl] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [format, setFormat] = useState("audio");
  const [isLoading, setIsLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");

  const handleClip = async () => {
    if (!url || !start || !end) {
      toast.error("Please fill out all fields.");
      return;
    }

    setIsLoading(true);
    setDownloadUrl("");

    const toastId = toast.loading("Clipping in progress...");

    try {
      const response = await fetch("/api/clip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, start, end, format }),
      });

      if (!response.ok) {
        throw new Error("Clip failed.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setDownloadUrl(objectUrl);

      toast.success("Clip ready! 🎉", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Toaster position="top-right" />

      <h1 className={styles.title}>YouTube Clipper</h1>

      <input
        className={styles.input}
        placeholder="Paste YouTube URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <input
        className={styles.input}
        placeholder="Start time (e.g. 00:01:23)"
        value={start}
        onChange={(e) => setStart(e.target.value)}
      />

      <input
        className={styles.input}
        placeholder="End time (e.g. 00:04:30)"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
      />

      <select
        className={styles.select}
        value={format}
        onChange={(e) => setFormat(e.target.value)}
      >
        <option value="audio">🎵 Audio</option>
        <option value="video">🎬 Video</option>
      </select>

      <button className={styles.button} onClick={handleClip} disabled={isLoading}>
        {isLoading ? (
          <div className={styles.spinner}></div>
        ) : (
          "Clip it!"
        )}
      </button>

      {downloadUrl && (
        <a
          className={styles.downloadLink}
          href={downloadUrl}
          download={`clip.${format === "audio" ? "mp3" : "mp4"}`}
        >
          Download Ready! Click here
        </a>
      )}

      <footer className={styles.footer}>
        © Kamal – For school use only (and possibly academic chaos) 😎📚
      </footer>
    </div>
  );
}
