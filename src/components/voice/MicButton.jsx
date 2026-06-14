import React from 'react';
import useVoiceQuery from "../../hooks/useVoiceQuery";

export default function MicButton({
    patientId,
    onResult
}) {
    const {
        state,
        transcript,
        startListening,
        stopListening
    } = useVoiceQuery(
        patientId,
        onResult
    );

    const getButtonStyles = () => {
        if (state === "listening") {
            return "bg-red-500 hover:bg-red-600 text-white animate-pulse";
        }
        if (state === "processing") {
            return "bg-gray-100 text-gray-400 cursor-not-allowed";
        }
        // idle
        return "bg-brand-sidebar hover:bg-brand-sidebar/90 text-white";
    };

    return (
        <div className="flex flex-col items-end gap-1.5 z-40 relative">
            <button
                onClick={() =>
                    state === "listening"
                        ? stopListening()
                        : startListening()
                }
                disabled={
                    state === "processing"
                }
                className={`px-4 py-2 rounded-full flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm ${getButtonStyles()}`}
            >
                {state === "idle" && (
                    <>
                        <span className="material-symbols-outlined text-[16px] text-brand-pink">mic</span>
                        <span>Ask Agent</span>
                    </>
                )}

                {state === "listening" && (
                    <>
                        <span className="material-symbols-outlined text-[16px] animate-ping">radio_button_checked</span>
                        <span>Listening...</span>
                    </>
                )}

                {state === "processing" && (
                    <>
                        <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                        <span>Processing</span>
                    </>
                )}
            </button>

            {transcript && (
                <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 bg-gray-50 border border-gray-150 px-2.5 py-1 rounded-full animate-fade-in-up mt-1 max-w-[200px] truncate">
                    🗣 "{transcript}"
                </div>
            )}
        </div>
    );
}