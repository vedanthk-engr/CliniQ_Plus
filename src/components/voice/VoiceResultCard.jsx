export default function VoiceResultCard({
    result
}) {

    if (!result) return null;

    return (
        <div
            className="
      bg-white
      rounded-3xl
      border
      border-gray-200
      shadow-sm
      p-6
      mb-6"
        >

            <div className="flex items-center gap-2 mb-4">

                <span className="text-xl">
                    🧠
                </span>

                <h2 className="font-black text-lg">
                    Clinical Copilot
                </h2>

            </div>

            <div className="mb-4">

                <div className="text-xs uppercase text-gray-500 mb-1">
                    Intent
                </div>

                <div className="font-semibold">
                    {result.intent_detected}
                </div>

            </div>

            <div>

                <div className="text-xs uppercase text-gray-500 mb-1">
                    Summary
                </div>

                <p className="leading-relaxed">
                    {result.summary}
                </p>

            </div>

        </div>
    );
}