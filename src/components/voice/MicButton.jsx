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

    return (
        <div className="flex flex-col gap-1">

            <button
                onClick={() =>
                    state === "listening"
                        ? stopListening()
                        : startListening()
                }
                disabled={
                    state === "processing"
                }
                className="
          px-4
          py-2
          bg-red-500
          text-white
          rounded-xl
          font-bold
          hover:opacity-90
          disabled:opacity-50
        "
            >
                {state === "idle" &&
                    "🎤 Ask"}

                {state === "listening" &&
                    "🔴 Listening"}

                {state === "processing" &&
                    "⏳ Processing"}
            </button>

            {transcript && (
                <div className="text-xs text-gray-500">
                    {transcript}
                </div>
            )}
        </div>
    );
}