import React from "react";

import * as event from "@tauri-apps/api/event";

import { ScrapperStatusStyledContainer } from "./styled";

interface StatusEvent {
  type: "youtube::ready" | "youtube::ping";
  status: "working" | "ready" | "error";
  timestamp: number;
}

interface Props {
  children?: React.ReactNode;
}

const colorsMap = {
  working: "#51cf66",
  ready: "#fcc419",
  error: "#ff6b6b",
  idle: "#f1f3f5"
};

export function ScrapperStatus(props: Props): React.ReactNode {
  const [statusEvent, setStatusEvent] = React.useState<StatusEvent>();

  function handleStatus(): void {
    setStatusEvent((statusEvent) => {
      console.log(statusEvent);

      if (statusEvent != null && statusEvent.status !== "error" && Date.now() - statusEvent.timestamp > 5000) {
        return { type: "youtube::ping", status: "error", timestamp: Date.now() };
      }

      return statusEvent;
    });
  }

  React.useEffect(() => {
    const interval = setInterval(handleStatus, 5000);
    const unlisten = event.listen<StatusEvent>("youtube::ping", (data) => {
      setStatusEvent({ type: data.event as StatusEvent["type"], status: "working", timestamp: Date.now() });
    });

    return () => {
      clearInterval(interval);
      unlisten.then(() => console.log("Unsubscribed from youtube::ping event"));
    };
  }, []);

  return (
    <ScrapperStatusStyledContainer>
      <i className="fas fa-circle" style={{ color: colorsMap[statusEvent?.status ?? "idle"] }} />
    </ScrapperStatusStyledContainer>
  );
}
