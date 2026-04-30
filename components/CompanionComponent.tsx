"use client";

import { useEffect, useRef, useState } from "react";
import { cn, configureAssistant, getSubjectColor } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import Image from "next/image";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import soundwaves from "@/constants/soundwaves.json";
import { addToSessionHistory } from "@/lib/actions/companions.actions";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

const CompanionComponent = ({
  companionId,
  subject,
  topic,
  name,
  userName,
  userImage,
  style,
  voice,
}: CompanionComponentProps) => {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<SavedMessage[]>([]);

  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    if (lottieRef) {
      if (isSpeaking) {
        lottieRef.current?.play();
      } else {
        lottieRef.current?.stop();
      }
    }
  }, [isSpeaking, lottieRef]);

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
      addToSessionHistory(companionId);
    };
    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newText = message.transcript;
        setMessages((prev) => {
          // If the latest message is from the same role, append to it
          if (prev.length > 0 && prev[0].role === message.role) {
            const updated = [...prev];
            updated[0] = {
              ...updated[0],
              content: updated[0].content + " " + newText,
            };
            return updated;
          }
          // Otherwise start a new message
          return [{ role: message.role, content: newText }, ...prev];
        });
      }
    };
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (error: Error) => console.log("Error", error);

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("error", onError);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("error", onError);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
    };
  }, []);

  const toggleMicrophone = () => {
    const isMuted = vapi.isMuted();
    vapi.setMuted(!isMuted);
    setIsMuted(!isMuted);
  };

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    const assistantOverrides = {
      variableValues: { subject, topic, style },
      clientMessages: ["transcript"],
      serverMessages: [],
    };
    // @ts-expect-error
    vapi.start(configureAssistant(voice, style), assistantOverrides);
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <section className="flex flex-col items-center min-h-[60vh]">
      {/* Centered session area */}
      <div className="session-container">
        {/* Avatar */}
        <div
          className="session-avatar"
          style={{ backgroundColor: `${getSubjectColor(subject)}15` }}
        >
          <div
            className={cn(
              "absolute transition-opacity duration-700",
              callStatus === CallStatus.ACTIVE ? "opacity-0" : "opacity-100",
              callStatus === CallStatus.CONNECTING && "animate-pulse"
            )}
          >
            <Image
              src={`/icons/${subject}.svg`}
              alt={subject}
              width={100}
              height={100}
              className="max-sm:w-12"
            />
          </div>
          <div
            className={cn(
              "absolute transition-opacity duration-700",
              callStatus === CallStatus.ACTIVE ? "opacity-100" : "opacity-0"
            )}
          >
            <Lottie
              lottieRef={lottieRef}
              animationData={soundwaves}
              autoplay={false}
              className="session-lottie"
            />
          </div>
        </div>

        <p className="font-medium text-lg">{name}</p>

        {/* Controls */}
        <div className="session-controls">
          <button
            className="btn-mic"
            onClick={toggleMicrophone}
            disabled={callStatus !== CallStatus.ACTIVE}
          >
            <Image
              src={isMuted ? "/icons/mic-off.svg" : "/icons/mic-on.svg"}
              alt="mic"
              width={18}
              height={18}
            />
            <span className="max-sm:hidden">
              {isMuted ? "Unmute" : "Mute"}
            </span>
          </button>

          <button
            className={cn(
              "btn-primary flex-1",
              callStatus === CallStatus.ACTIVE && "!bg-destructive !text-white",
              callStatus === CallStatus.CONNECTING && "animate-pulse"
            )}
            onClick={
              callStatus === CallStatus.ACTIVE ? handleDisconnect : handleCall
            }
          >
            {callStatus === CallStatus.ACTIVE
              ? "End"
              : callStatus === CallStatus.CONNECTING
              ? "Connecting..."
              : "Start Session"}
          </button>
        </div>
      </div>

      {/* Transcript */}
      <section className="transcript">
        <div className="transcript-message no-scrollbar">
          {messages.map((message, index) => (
            <p
              key={index}
              className={cn(
                "text-sm",
                message.role === "assistant"
                  ? "text-foreground"
                  : "text-primary"
              )}
            >
              <span className="font-medium text-muted-foreground mr-1.5">
                {message.role === "assistant" ? name.split(" ")[0] : userName}:
              </span>
              {message.content}
            </p>
          ))}
        </div>
        <div className="transcript-fade" />
      </section>
    </section>
  );
};

export default CompanionComponent;