import { useRef, useState } from "react";

export default function useVoiceQuery(
    patientId,
    onResult
) {

    const recognitionRef = useRef(null);

    const [state, setState] =
        useState("idle");

    const [transcript, setTranscript] =
        useState("");

    const startListening = () => {

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {

            alert(
                "Speech Recognition is not supported in this browser. Use Chrome or Edge."
            );

            return;
        }

        const recognition =
            new SpeechRecognition();

        recognition.lang = "en-US";

        recognition.interimResults = true;

        recognition.continuous = false;

        recognitionRef.current =
            recognition;

        recognition.onstart = () => {

            setState("listening");

            setTranscript("");
        };

        recognition.onresult = (event) => {

            const text = Array.from(
                event.results
            )
                .map(
                    result =>
                        result[0].transcript
                )
                .join("");

            setTranscript(text);

            recognition.finalText =
                text;
        };

        recognition.onerror = err => {

            console.error(
                "Speech Error",
                err
            );

            setState("idle");
        };

        recognition.onend =
            async () => {

                const query =
                    recognition.finalText;

                if (!query) {

                    setState("idle");

                    return;
                }

                setState(
                    "processing"
                );

                try {

                    const response =
                        await fetch(
                            "https://dry-frog-85.loca.lt/api/voice/query",
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },
                                body: JSON.stringify({
                                    patient_id:
                                        patientId,
                                    query
                                })
                            }
                        );

                    const data =
                        await response.json();

                    console.log(
                        "Voice Result",
                        data
                    );

                    onResult(data);

                } catch (error) {

                    console.error(
                        error
                    );

                } finally {

                    setState("idle");
                }
            };

        recognition.start();
    };

    const stopListening =
        () => {

            recognitionRef.current?.stop();
        };

    return {
        state,
        transcript,
        startListening,
        stopListening
    };
}
