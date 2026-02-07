import { Webpack } from "@api";
import manifest from "@manifest";
import React from "react";

import ErrorBoundary from "../../common/ErrorBoundary";
import { PopoutWindowStore } from "../modules/shared";
import { generateStreamKey } from "../modules/utils";

const useStateFromStores = Webpack.getByStrings("useStateFromStores", { searchExports: true });

const ApplicationStreamingStore = Webpack.Stores.ApplicationStreamingStore;
const ChannelStore = Webpack.Stores.ChannelStore;
const GuildStore = Webpack.Stores.GuildStore;
const VideoStreamStore = Webpack.Stores.VideoStreamStore;
const UserStore = Webpack.Stores.UserStore;

const PopoutWindow = Webpack.getModule(m => m.render?.toString().includes("Missing guestWindow reference"));
const StreamTile = Webpack.getBySource(".memo", "enableZoom", "streamKey").A;
const VideoComponent = Webpack.getById(540239).A;
const VoiceChannelHeader = Webpack.getByStrings("focusedParticipant");
const IdleDetector = Webpack.getByStrings("timeout", ".delay()");
const StreamEndedScreen = Webpack.getByStrings("stream", ".Kb4Ukp");

const VolumeSlider = Webpack.getByStrings("currentVolume", "toggleLocalMute");

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

    return (
        <PopoutWindow windowKey={windowKey} withTitleBar={true} maxOSFrame={true}>
            <ErrorBoundary id={manifest.name}>
                <PopoutContent stream={stream} />
            </ErrorBoundary>
        </PopoutWindow>
    );
}

function PopoutContent({ stream }) {
    const channel = ChannelStore.getChannel(stream.channelId);
    const guild = GuildStore.getGuild(stream.guildId);
    const user = UserStore.getUser(stream.ownerId);
    const participant = {
        id: generateStreamKey(stream),
        isPoppedOut: true,
        maxFrameRate: 60,
        maxResolution: {
            type: "fixed",
            width: 2560,
            height: 1440,
        },
        stream,
        streamId: VideoStreamStore.getStreamId(stream.ownerId, stream.guildId, "stream"),
        type: 0,
        user,
        userNick: user?.globalName || user?.username,
        userVideo: false,
    };

    const activeStream = useStateFromStores([ApplicationStreamingStore], () => ApplicationStreamingStore.getStreamForUser(user.id, stream.guildId));

    return (
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
                                        currentWindow={window}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ height: "80%", width: "100%" }}>
                            {activeStream ? (
                                <StreamTile
                                    enableZoom={true}
                                    streamId={participant.streamId}
                                    userId={user.id}
                                    videoComponent={VideoComponent}
                                    streamKey={participant.stream.streamKey}
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
    );
}
