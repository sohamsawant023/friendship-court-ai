"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";
import { GlassButton } from "./GlassButton";

interface CourtAnnouncementButtonProps {
  text: string;
  label?: string;
}

export function CourtAnnouncementButton({ text, label = "Hear the court announcement" }: CourtAnnouncementButtonProps) {
  const [message, setMessage] = useState("");

  const speak = () => {
    if (!("speechSynthesis" in window)) {
      setMessage("Speech playback is not available in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 0.82;
    utterance.onend = () => setMessage("");
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="mt-5 flex flex-col items-center gap-2">
      <GlassButton type="button" variant="secondary" onClick={speak} aria-label={label}>
        <Volume2 className="h-4 w-4" />
        {label}
      </GlassButton>
      {message && <p role="status" className="text-xs text-textSecondary">{message}</p>}
    </div>
  );
}