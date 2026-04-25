import { ContextMenu, Hooks, Webpack } from "@api";
import manifest from "@manifest";
import React from "react";

import ErrorBoundary from "../../common/ErrorBoundary";
import { PopoutWindowStore, WINDOW_KEY } from "../modules/shared";
import { generateStreamKey } from "../modules/utils";


const [
    IdleDetector,
    PopoutWindow,
    StreamContextMenu,
    StreamEndedScreen,
    StreamTile,
    VideoComponent,
    VoiceChannelHeader,
    VolumeSlider,
] = Webpack.getBulk(
    { filter: Webpack.Filters.byStrings("timeout", ".delay()") },
    { filter: m => m.render?.toString().includes("Missing guestWindow reference") },
    { filter: Webpack.Filters.byStrings("StreamContextMenu"), searchExports: true },
    { filter: Webpack.Filters.byStrings("stream", ".Kb4Ukp") },
    { filter: Webpack.Filters.byComponentType(Webpack.Filters.byStrings("videoComponent", "streamKey", "location:\"VideoStream\"")) },
    { filter: Webpack.Filters.byKeys("onContainerResized") },
    { filter: Webpack.Filters.byStrings("focusedParticipant") },
    { filter: Webpack.Filters.byStrings("currentVolume", "toggleLocalMute") },
);
const FullScreenButton = Webpack.getById(423562).A;

const ApplicationStreamingStore = Webpack.Stores.ApplicationStreamingStore;
const ChannelStore = Webpack.Stores.ChannelStore;
const GuildStore = Webpack.Stores.GuildStore;
const VideoStreamStore = Webpack.Stores.VideoStreamStore;
const UserStore = Webpack.Stores.UserStore;

const styles = Object.defineProperties(
    {},
    Object.fromEntries(
        [
            Webpack.getByKeys("gradientTop"),
            Webpack.getByKeys("headerWrapper"),
            Webpack.getByKeys("rightTrayIcon"),
            Webpack.getByKeys("flex", "horizontalReverse"),
            Webpack.getByKeys("justifyEnd", "noWrap"),
        ].flatMap(m => Object.entries(Object.getOwnPropertyDescriptors(m)))
    )
);

export default function Popout({ windowKey, stream }) {
    React.useInsertionEffect(() => {
        const window = PopoutWindowStore.getWindow(windowKey);

        const clone = window.document.adoptNode(document.querySelector("bd-head").cloneNode(true));

        window.document.body.appendChild(clone);
    }, []);

    const user = UserStore.getUser(stream.ownerId);
    const isFullScreen = Hooks.useStateFromStores([PopoutWindowStore], () => PopoutWindowStore.isWindowFullScreen(windowKey));

    return (
        <PopoutWindow
            windowKey={windowKey}
            withTitleBar={!isFullScreen}
            maxOSFrame={true}
            title={`Stream Popout | ${user?.globalName || user?.username}`}
        >
            <ErrorBoundary id={manifest.name}>
                <PopoutContent stream={stream} />
            </ErrorBoundary>
        </PopoutWindow>
    );
}

function PopoutContent({ stream }) {
    const streamKey = generateStreamKey(stream);
    const popoutWindow = PopoutWindowStore.getWindow(WINDOW_KEY(streamKey));

    const channel = ChannelStore.getChannel(stream.channelId);
    const guild = GuildStore.getGuild(stream.guildId);
    const user = UserStore.getUser(stream.ownerId);

    const participant = {
        id: streamKey,
        stream,
        streamId: VideoStreamStore.getStreamId(stream.ownerId, stream.guildId, "stream"),
        user,
        userNick: user?.globalName || user?.username,
    };

    const activeStream = Hooks.useStateFromStores([ApplicationStreamingStore], () => ApplicationStreamingStore.getStreamForUser(user.id, stream.guildId));
    const isFullScreen = Hooks.useStateFromStores([PopoutWindowStore], () => PopoutWindowStore.isWindowFullScreen(popoutWindow.name));

    const handleToggleFullscreen = React.useCallback(() => {
        if (isFullScreen) {
            popoutWindow.document.exitFullscreen();
            DiscordNative.window.restore(popoutWindow.name);
        } else popoutWindow.document.getElementById("app-mount").requestFullscreen();
    }, [isFullScreen, popoutWindow]);

    return (
        <div
            style={{ height: "100%", width: "100%" }}
            data-guild-id={stream.guildId}
            data-channel-id={stream.channelId}
            data-user-id={stream.ownerId}
        >
            <IdleDetector timeout={2_000}>
                {({ idle, onActive }) => (
                    <>
                        <div
                            onMouseMove={onActive}
                            className={[styles.root, idle && styles.idle].filter(Boolean).join(" ")}
                        >
                            <div className={styles.videoControls}>
                                <div className={styles.gradientTop} />
                                <div className={styles.topControls}>
                                    <div className={styles.headerWrapper}>
                                        <VoiceChannelHeader
                                            channel={channel}
                                            guild={guild}
                                            inCall={true}
                                            isChatOpen={true}
                                        />
                                    </div>
                                </div>
                                <div className={styles.gradientBottom} />
                                <div className={styles.bottomControls}>
                                    <div className={[styles.flex, styles.edgeControls, styles.justifyEnd].join(" ")}>
                                        <VolumeSlider
                                            context="stream"
                                            userId={user.id}
                                            className={styles.rightTrayIcon}
                                            sliderClassName={styles.volumeSlider}
                                            currentWindow={popoutWindow}
                                        />
                                        <FullScreenButton
                                            className={styles.rightTrayIcon}
                                            enabled={isFullScreen}
                                            guestWindow={popoutWindow}
                                            node={popoutWindow.document.getElementById("app-mount")}
                                            onClick={handleToggleFullscreen}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div
                                style={{ height: idle ? "100%" : "90%", width: "100%", transition: "height 150ms ease" }}
                                onContextMenu={event => {
                                    ContextMenu.open(event, props => {
                                        return <StreamContextMenu {...props} stream={stream} />;
                                    });
                                }}
                            >
                                {activeStream ? (
                                    <StreamTile
                                        enableZoom={true}
                                        streamId={participant.streamId}
                                        userId={user.id}
                                        videoComponent={VideoComponent}
                                        streamKey={streamKey}
                                        idle={idle}
                                    />
                                ) : (
                                    <StreamEndedScreen stream={stream} />
                                )}
                            </div>
                        </div>
                    </>
                )}
            </IdleDetector>
        </div>
    );
}
