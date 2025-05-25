import React from "react";

import * as event from "@tauri-apps/api/event";
import { transparentize } from "polished";

import { ScrapperStatusStyledContainer } from "./styled";

interface StatusEvent {
  type: "youtube::idle" | "youtube::error" | "youtube::ready" | "youtube::ping";
  status: "idle" | "ready" | "working" | "error";
  timestamp: number;
}

interface Props {
  children?: React.ReactNode;
}

const colorsMap = {
  idle: "#f1f3f5",
  ready: "#fcc419",
  working: "#51cf66",
  error: "#ff6b6b"
};

export function ScrapperStatus(props: Props): React.ReactNode {
  const [statusEvent, setStatusEvent] = React.useState<StatusEvent>({
    type: "youtube::idle",
    status: "idle",
    timestamp: Date.now()
  });

  function handleStatus(): void {
    setStatusEvent((statusEvent) => {
      if (
        statusEvent != null &&
        !["idle", "error"].includes(statusEvent.status) &&
        Date.now() - statusEvent.timestamp > 5000
      ) {
        return { type: "youtube::error", status: "error", timestamp: Date.now() };
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
    <ScrapperStatusStyledContainer
      style={
        {
          "--border-color": colorsMap[statusEvent.status],
          "--background-color": transparentize(0.9, colorsMap[statusEvent.status]),
          "--font-color": colorsMap[statusEvent.status]
        } as React.CSSProperties
      }
    >
      {statusEvent.status}
      <i className="fas fa-circle" />
    </ScrapperStatusStyledContainer>
  );
}
