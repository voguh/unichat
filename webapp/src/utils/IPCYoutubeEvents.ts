export enum IPCYoutubeEvents {
    YOUTUBE_IDLE = "unichat://youtube:idle",
    YOUTUBE_ERROR = "unichat://youtube:error",
    YOUTUBE_READY = "unichat://youtube:ready",
    YOUTUBE_PING = "unichat://youtube:ping"
}

export interface IPCYouTubeStatusIdleEvent {
    type: IPCYoutubeEvents.YOUTUBE_IDLE;
    status: "idle";
    timestamp: number;
}

export interface IPCYouTubeStatusErrorEvent {
    type: IPCYoutubeEvents.YOUTUBE_ERROR;
    status: "error";
    error: string;
    timestamp: number;
}

export interface IPCYouTubeStatusReadyEvent {
    type: IPCYoutubeEvents.YOUTUBE_READY;
    status: "ready";
    url: string;
    timestamp: number;
}

export interface IPCYouTubeStatusPingEvent {
    type: IPCYoutubeEvents.YOUTUBE_PING;
    status: "working";
    timestamp: number;
}

export type IPCYouTubeStatusEvent =
    | IPCYouTubeStatusIdleEvent
    | IPCYouTubeStatusErrorEvent
    | IPCYouTubeStatusReadyEvent
    | IPCYouTubeStatusPingEvent;
