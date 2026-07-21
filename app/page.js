"use client";
import { useState } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [solution, setSolution] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSolve = async () => {
    if (!question && !imageBase64) {
      setError("Please type a question or upload an image.");
      return;
    }
    setError("");
    setLoading(true);
    setSolution("");

    try {
      const res = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, imageBase64 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to solve");
      setSolution(data.solution);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800 p-4">
      <div className="max-w-xl mx-auto space-y-6">
        <header className="text-center space-y-1 py-4">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
            🇵🇰 BISE Board AI Solver
          </span>
          <h1 className="text-3xl font-black text-slate-900">
            PakExam <span className="text-emerald-600">AI</span>
          </h1>
          <p className="text-xs text-slate-600">
            Past Papers & Numerical Step-by-Step Solver
          </p>
        </header>

        <div className="bg-white p-5 rounded-2xl shadow-sm space-y-4">
          <textarea
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question or numerical here..."
            className="w-full p-3 border rounded-xl text-sm focus:outline-emerald-500"
          />

          <div>
            {imagePreview ? (
              <div className="relative h-32 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center border">
                <img src={imagePreview} alt="Preview" className="max-h-full object-contain" />
                <button
                  onClick={() => { setImagePreview(null); setImageBase64(null); }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-xl cursor-pointer bg-slate-50 text-xs text-slate-500">
                <span>📷 Upload Question Photo</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>

          {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</div>}

          <button
            onClick={handleSolve}
            disabled={loading}
            className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Solving... ⏳" : "Get Answer 🚀"}
          </button>
        </div>

        {solution && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-200 space-y-3">
            <h2 className="font-bold text-slate-900">📝 Solution:</h2>
            <div className="text-sm whitespace-pre-wrap leading-relaxed text-slate-700">
              {solution}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
