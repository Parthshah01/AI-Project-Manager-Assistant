import { useState } from "react";
import axios from "axios";
import { Loader2, Sparkles } from "lucide-react";

export default function MeetingInput({ onExtract }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExtract = async () => {
    if (!text.trim()) {
      alert("Please enter meeting notes.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://127.0.0.1:8000/extract",
        {
          text,
        }
      );

      onExtract(response.data);

      setText("");
    } catch (err) {
      console.error(err);
      alert("Failed to extract tasks.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">

      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="text-indigo-600" />
        <h2 className="text-3xl font-bold">
          Meeting Notes
        </h2>
      </div>

      <textarea
        rows={10}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste meeting notes here..."
        className="w-full border rounded-2xl p-5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <button
        disabled={loading}
        onClick={handleExtract}
        className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl flex items-center gap-3 disabled:opacity-60 transition"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Extracting Tasks...
          </>
        ) : (
          <>
            <Sparkles size={20} />
            Extract Tasks
          </>
        )}
      </button>

    </div>
  );
}