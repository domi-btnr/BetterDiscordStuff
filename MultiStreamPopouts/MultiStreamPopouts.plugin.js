/**
 * @name MultiStreamPopouts
 * @version 0.0.0
 * @description Allows you to open multiple Streams each in their own popout windows
 * @author domi.btnr
 * @authorId 354191516979429376
 * @invite gp2ExK5vc7
 * @donate https://paypal.me/domibtnr
 * @source https://github.com/domi-btnr/BetterDiscordStuff/tree/development/UnsuppressEmbeds
 * @changelogDate 2026-02-07
 */

'use strict';

/* @manifest */
const manifest = {
    "name": "MultiStreamPopouts",
    "version": "0.0.0",
    "description": "Allows you to open multiple Streams each in their own popout windows",
    "author": "domi.btnr",
    "authorId": "354191516979429376",
    "invite": "gp2ExK5vc7",
    "donate": "https://paypal.me/domibtnr",
    "source": "https://github.com/domi-btnr/BetterDiscordStuff/tree/development/UnsuppressEmbeds",
    "changelog": [],
    "changelogDate": "2026-02-07"
};

/* @api */
const {
    Commands,
    Components,
    ContextMenu,
    Data,
    DOM,
    Logger,
    Net,
    Patcher,
    Plugins,
    ReactUtils,
    Themes,
    UI,
    Utils,
    Webpack
} = new BdApi(manifest.name);

/* @styles */

var Styles = {
    sheets: [],
    _element: null,
    load() {
        DOM.addStyle(this.sheets.join("\n"));
    },
    unload() {
        DOM.removeStyle();
    }
};

/* react */
var React = BdApi.React;

/* ../common/Changelog/style.scss */
Styles.sheets.push("/* ../common/Changelog/style.scss */", `.Changelog-Title-Wrapper {
  font-size: 20px;
  font-weight: 600;
  font-family: var(--font-display);
  color: var(--header-primary);
  line-height: 1.2;
}
.Changelog-Title-Wrapper div {
  font-size: 12px;
  font-weight: 400;
  font-family: var(--font-primary);
  color: var(--primary-300);
  line-height: 1.3333333333;
}

.Changelog-Banner {
  width: 405px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.Changelog-Item {
  color: #c4c9ce;
}
.Changelog-Item .Changelog-Header {
  display: flex;
  text-transform: uppercase;
  font-weight: 700;
  align-items: center;
  margin-bottom: 10px;
}
.Changelog-Item .Changelog-Header.added {
  color: #45BA6A;
}
.Changelog-Item .Changelog-Header.changed {
  color: #F0B232;
}
.Changelog-Item .Changelog-Header.fixed {
  color: #EC4245;
}
.Changelog-Item .Changelog-Header.improved {
  color: #5865F2;
}
.Changelog-Item .Changelog-Header::after {
  content: "";
  flex-grow: 1;
  height: 1px;
  margin-left: 7px;
  background: currentColor;
}
.Changelog-Item span {
  display: list-item;
  list-style: inside;
  margin-left: 5px;
}
.Changelog-Item span::marker {
  color: var(--background-accent);
}`);

/* ../common/Changelog/index.tsx */
function showChangelog(manifest) {
    if (Data.load("lastVersion") === manifest.version) return;
    if (!manifest.changelog.length) return;
    const i18n = Webpack.getByKeys("getLocale");
    const formatter = new Intl.DateTimeFormat(i18n.getLocale(), {
        month: "long",
        day: "numeric",
        year: "numeric"
    });
    const title = React.createElement("div", {
        className: "Changelog-Title-Wrapper"
    }, React.createElement("h1", null, "What's New - ", manifest.name), React.createElement("div", null, formatter.format(new Date(manifest.changelogDate)), " - v", manifest.version));
    const items = manifest.changelog.map((item) => React.createElement("div", {
        className: "Changelog-Item"
    }, React.createElement("h4", {
        className: `Changelog-Header ${item.type}`
    }, item.title), item.items.map((item2) => React.createElement("span", null, item2))));
    "changelogImage" in manifest && items.unshift(
        React.createElement("img", {
            className: "Changelog-Banner",
            src: manifest.changelogImage
        })
    );
    UI.alert(title, items);
    Data.save("lastVersion", manifest.version);
}

/* ../common/ErrorBoundary/style.scss */
Styles.sheets.push("/* ../common/ErrorBoundary/style.scss */", `.errorBoundary {
  align-items: center;
  background: #473c41;
  border: 2px solid #f04747;
  border-radius: 5px;
  padding: 5px;
  margin: 10px;
  color: #fff;
  font-size: 16px;
}
.errorBoundary .errorText {
  display: flex;
  flex-direction: column;
  gap: 5px;
}`);

/* ../common/ErrorBoundary/index.jsx */
const ErrorIcon = (props) => React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "#ddd",
    width: "24",
    height: "24",
    ...props
}, React.createElement("path", {
    d: "M0 0h24v24H0z",
    fill: "none"
}), React.createElement("path", {
    d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
}));
class ErrorBoundary extends React.Component {
    state = {
        hasError: false,
        error: null,
        info: null
    };
    componentDidCatch(error, info) {
        this.setState({
            error,
            info,
            hasError: true
        });
        console.error(`[ErrorBoundary:${this.props.id}] HI OVER HERE!! SHOW THIS SCREENSHOT TO THE DEVELOPER.
`, error);
    }
    render() {
        if (this.state.hasError) {
            return this.props.mini ? React.createElement(ErrorIcon, {
                fill: "#f04747"
            }) : React.createElement("div", {
                className: "errorBoundary"
            }, React.createElement("div", {
                className: "errorText"
            }, React.createElement("span", null, "An error has occured while rendering ", this.props.id, "."), React.createElement("span", null, "Open console (", React.createElement("code", null, "CTRL + SHIFT + i / CMD + SHIFT + i"), ') - Select the "Console" tab and screenshot the big red error.')));
        } else return this.props.children;
    }
}

/* modules/shared.ts */
Webpack.getByStrings("useStateFromStores", {
    searchExports: true
});
const Dispatcher = Webpack.getByKeys("dispatch", "subscribe", {
    searchExports: true
});
const PopoutWindowStore = Webpack.Stores.PopoutWindowStore;

/* modules/utils.ts */
function findGroupById(res, id) {
    if (!res) return null;
    let children = res?.props?.children;
    if (!children) return null;
    if (!Array.isArray(children))
        children = [children];
    if (children.some(
            (child) => child && typeof child === "object" && "props" in child && child.props.id === id
        )) return res;
    for (const child of children)
        if (child && typeof child === "object") {
            const found = findGroupById(child, id);
            if (found) return found;
        }
}

function generateStreamKey({
    guildId,
    channelId,
    ownerId
}) {
    return `guild:${guildId}:${channelId}:${ownerId}`;
}

/* components/Popout.jsx */
const useStateFromStores = Webpack.getByStrings("useStateFromStores", {
    searchExports: true
});
const ApplicationStreamingStore = Webpack.Stores.ApplicationStreamingStore;
const ChannelStore = Webpack.Stores.ChannelStore;
const GuildStore = Webpack.Stores.GuildStore;
const VideoStreamStore = Webpack.Stores.VideoStreamStore;
const UserStore = Webpack.Stores.UserStore;
const PopoutWindow = Webpack.getModule((m) => m.render?.toString().includes("Missing guestWindow reference"));
const StreamTile = Webpack.getBySource(".memo", "enableZoom", "streamKey").A;
const VideoComponent = Webpack.getById(540239).A;
const VoiceChannelHeader = Webpack.getByStrings("focusedParticipant");
const IdleDetector = Webpack.getByStrings("timeout", ".delay()");
const StreamEndedScreen = Webpack.getByStrings("stream", ".Kb4Ukp");
const VolumeSlider = Webpack.getByStrings("currentVolume", "toggleLocalMute");
const styles = Object.defineProperties({},
    Object.fromEntries(
        [
            Webpack.getByKeys("gradientTop"),
            Webpack.getByKeys("headerWrapper"),
            Webpack.getByKeys("rightTrayIcon"),
            Webpack.getByKeys("flex", "horizontalReverse"),
            Webpack.getByKeys("justifyEnd", "noWrap")
        ].flatMap((m) => Object.entries(Object.getOwnPropertyDescriptors(m)))
    )
);

function Popout({
    windowKey,
    stream
}) {
    React.useInsertionEffect(() => {
        const window2 = PopoutWindowStore.getWindow(windowKey);
        const clone = window2.document.adoptNode(document.querySelector("bd-head").cloneNode(true));
        window2.document.body.appendChild(clone);
    }, []);
    return React.createElement(PopoutWindow, {
        windowKey,
        withTitleBar: true,
        maxOSFrame: true
    }, React.createElement(ErrorBoundary, {
        id: manifest.name
    }, React.createElement(PopoutContent, {
        stream
    })));
}

function PopoutContent({
    stream
}) {
    const channel = ChannelStore.getChannel(stream.channelId);
    const guild = GuildStore.getGuild(stream.guildId);
    const user = UserStore.getUser(stream.ownerId);
    const participant = {
        id: generateStreamKey(stream),
        stream,
        streamId: VideoStreamStore.getStreamId(stream.ownerId, stream.guildId, "stream"),
        userNick: user?.globalName || user?.username
    };
    const activeStream = useStateFromStores([ApplicationStreamingStore], () => ApplicationStreamingStore.getStreamForUser(user.id, stream.guildId));
    return React.createElement(IdleDetector, {
        timeout: 2e3
    }, ({
        idle,
        onActive
    }) => React.createElement(React.Fragment, null, React.createElement(
        "div", {
            onMouseMove: onActive,
            className: [styles.root, idle && styles.idle].filter(Boolean).join(" ")
        },
        React.createElement("div", {
            className: styles.videoControls
        }, React.createElement("div", {
            className: styles.gradientTop
        }), React.createElement("div", {
            className: styles.topControls
        }, React.createElement("div", {
            className: styles.headerWrapper
        }, React.createElement(
            VoiceChannelHeader, {
                channel,
                guild,
                inCall: true,
                isChatOpen: true
            }
        ))), React.createElement("div", {
            className: styles.gradientBottom
        }), React.createElement("div", {
            className: styles.bottomControls
        }, React.createElement("div", {
            className: [styles.flex, styles.edgeControls, styles.justifyEnd].join(" ")
        }, React.createElement(
            VolumeSlider, {
                context: "stream",
                userId: user.id,
                className: styles.rightTrayIcon,
                sliderClassName: styles.volumeSlider,
                currentWindow: window
            }
        )))),
        React.createElement("div", {
            style: {
                height: "80%",
                width: "100%"
            }
        }, activeStream ? React.createElement(
            StreamTile, {
                enableZoom: true,
                streamId: participant.streamId,
                userId: user.id,
                videoComponent: VideoComponent,
                streamKey: participant.stream.streamKey,
                idle
            }
        ) : React.createElement(StreamEndedScreen, {
            stream
        }))
    )));
}

/* index.jsx */
let unpatchContextMenu;
class MultiStreamPopouts {
    start() {
        showChangelog(manifest);
        this.patchStreamTileContextMenu();
        Dispatcher.subscribe("STREAM_CLOSE", this.eventListener);
        Styles.load();
    }
    stop() {
        unpatchContextMenu?.();
        Dispatcher.unsubscribe("STREAM_CLOSE", this.eventListener);
        Styles.unload();
    }
    eventListener({
        streamKey
    }) {
        const windowKey = `DISCORD_STREAM_POPUP_${streamKey}`;
        const window = PopoutWindowStore.getWindowOpen(windowKey);
        if (window) PopoutWindowStore.unmountWindow(windowKey);
    }
    patchStreamTileContextMenu() {
        unpatchContextMenu = ContextMenu.patch("stream-context", (res, {
            stream
        }) => {
            const menuGroup = (findGroupById(res, "user-volume") || findGroupById(res, "stream-settings-audio-enable"))?.props?.children;
            if (!menuGroup) return;
            const windowKey = `DISCORD_STREAM_POPUP_${generateStreamKey(stream)}`;
            menuGroup.push(
                React.createElement(
                    ContextMenu.Item, {
                        id: "popout-stream",
                        key: "popout-stream",
                        label: "Popout Stream",
                        action: () => {
                            Dispatcher.dispatch({
                                type: "POPOUT_WINDOW_OPEN",
                                key: windowKey,
                                features: {
                                    popout: true
                                },
                                render: () => React.createElement(Popout, {
                                    windowKey,
                                    stream
                                })
                            });
                        }
                    }
                )
            );
        });
    }
}

module.exports = MultiStreamPopouts;