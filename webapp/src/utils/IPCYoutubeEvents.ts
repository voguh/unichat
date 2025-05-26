export enum IPCYoutubeEvents {
    YOUTUBE_EVENT = "unichat://youtube:event"
}

export interface IPCYouTubeStatusIdleEvent {
    type: "idle";
    timestamp: number;
}

export interface IPCYouTubeStatusErrorEvent {
    type: "error";
    error: string;
    timestamp: number;
}

export interface IPCYouTubeStatusReadyEvent {
    type: "ready";
    url: string;
    timestamp: number;
}

export interface IPCYouTubeStatusPingEvent {
    type: "working";
    timestamp: number;
}

export type IPCYouTubeStatusEvent =
    | IPCYouTubeStatusIdleEvent
    | IPCYouTubeStatusErrorEvent
    | IPCYouTubeStatusReadyEvent
    | IPCYouTubeStatusPingEvent;
