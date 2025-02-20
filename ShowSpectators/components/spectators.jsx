import "./style.scss";

import { Components, Webpack } from "@api";
import React from "react";

import { useStateFromStores } from "../modules/shared";

const { Flex, Text, Tooltip } = Components;
const ApplicationStreamingStore = Webpack.getStore("ApplicationStreamingStore");
const AvatarStyles = Webpack.getByKeys("moreUsers", "emptyUser", "avatarContainer", "clickableAvatar");
const Clickable = Webpack.getByStrings("this.context?this.renderNonInteractive():", { searchExports: true });
const intl = Webpack.getMangled("defaultLocale:\"en-US\"", {
    intl: Webpack.Filters.byKeys("format"),
    t: Webpack.Filters.byKeys("BR7Tnp")
});
const RelationshipStore = Webpack.getStore("RelationshipStore");
const UserProfileActions = Webpack.getByKeys("openUserProfileModal", "closeUserProfileModal");
const UserStore = Webpack.getStore("UserStore");
const UserSummaryItem = Webpack.getByStrings("defaultRenderUser", "showDefaultAvatarsForNullUsers");

const getLocalizedString = (key, values) => {
    if (!values) return intl?.intl.string(intl.t[key]);
    return intl?.intl.format(intl.t[key], values);
};
const Strings = {
    SPECTATORS: "BR7Tnp",
    NUM_USERS: "3uHFUV"
};

const getDisplayName = user => RelationshipStore.getNickname(user.id) || user.globalName || user.username;

export function SpectatorsTooltip({ spectatorIds, guildId, noTitle }) {
    if (!spectatorIds && !guildId) {
        const activeStream = useStateFromStores([ApplicationStreamingStore], () => ApplicationStreamingStore.getCurrentUserActiveStream());
        if (!activeStream) return null;

        spectatorIds = ApplicationStreamingStore.getViewerIds(activeStream);
        guildId = activeStream.guildId;
    }
    let unknownSpectators = 0;
    const spectators = spectatorIds.map(id => UserStore.getUser(id)).filter(user => Boolean(user) || unknownSpectators++);

    return (
        spectatorIds.length ? (<>
            {!noTitle && <Text size={Text.Sizes.SIZE_16} style={{ marginBottom: "8px" }}>
                {getLocalizedString(Strings.SPECTATORS, { numViewers: spectatorIds.length })}
            </Text>
            }
            <Flex
                direction={Flex.Direction.VERTICAL}
                style={{ alignItems: "center", gap: 6 }}
            >
                {
                    spectators.map(user => (
                        <Flex style={{ alignContent: "center", gap: 6 }}>
                            <img src={user.getAvatarURL(guildId)} style={{ borderRadius: 8, height: 16, width: 16 }} />
                            {getDisplayName(user)}
                        </Flex>
                    ))
                }
                {
                    !!unknownSpectators &&
                    <Flex style={{ alignContent: "center" }}>
                        <Text>+{getLocalizedString(Strings.NUM_USERS, { num: unknownSpectators })}</Text>
                    </Flex>
                }
            </Flex>
        </>) : "No spectators"
    );
}

export function SpectatorsPanel() {
    const activeStream = useStateFromStores([ApplicationStreamingStore], () => ApplicationStreamingStore.getCurrentUserActiveStream());
    if (!activeStream) return null;

    let unknownSpectators = 0;
    const spectatorIds = ApplicationStreamingStore.getViewerIds(activeStream);
    const spectators = spectatorIds.map(id => UserStore.getUser(id)).filter(user => Boolean(user) || unknownSpectators++);
    return (
        <div className="spectators-panel">
            <Text size={Text.Sizes.SIZE_16}>
                {
                    spectatorIds.length ?
                        getLocalizedString(Strings.SPECTATORS, { numViewers: spectatorIds.length })
                        : "No spectators"
                }
            </Text>
            {
                spectatorIds.length ? (
                    <UserSummaryItem
                        className={"spectators"}
                        style={{
                            marginTop: "4px",
                            paddingBottom: "4px"
                        }}
                        users={spectators}
                        count={spectatorIds.length}
                        renderIcon={false}
                        max={12}
                        showDefaultAvatarsForNullUsers
                        renderUser={user => (
                            <Tooltip text={getDisplayName(user)}>
                                {props => (
                                    <Clickable
                                        {...props}
                                        className={AvatarStyles.clickableAvatar}
                                        onClick={() => UserProfileActions.openUserProfileModal({ userId: user.id, guildId: activeStream.guildId })}
                                    >
                                        <img
                                            className={AvatarStyles.avatar}
                                            src={user.getAvatarURL(void 0, 80, true)}
                                            alt={user.username}
                                            title={user.username}
                                        />
                                    </Clickable>
                                )}
                            </Tooltip>
                        )}
                        renderMoreUsers={(label, count) => {
                            const sliced = spectators.slice(-count);
                            return (
                                <Tooltip text={
                                    <SpectatorsTooltip
                                        noTitle
                                        guildId={activeStream.guildId}
                                        spectatorIds={sliced.map(user => user.id)}
                                    />
                                }>
                                    {props => (
                                        <div {...props} className={AvatarStyles.moreUsers}>
                                            +{sliced.length}
                                        </div>
                                    )}
                                </Tooltip>
                            );
                        }}
                    />
                ) : null
            }
        </div>
    );
}
