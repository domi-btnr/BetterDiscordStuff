import { Commands, Logger, Patcher } from "@api";
import showChangelog from "@common/Changelog";
import { onLocaleChange } from "@common/i18n";
import { rerenderComponent } from "@common/Utils";
import manifest from "@manifest";
import Styles from "@styles";

import getCommands from "./commands";
import FriendCodesPanel from "./components/panel";
import { TabBar } from "./modules/webpack";

interface AddFriendPageProps {
    page: (props: object) => any;
    [key: string]: unknown;
}

function AddFriendPage({ page, ...props }: AddFriendPageProps) {
    const res = page(props);
    const children = res?.props?.children;
    if (Array.isArray(children)) {
        children.splice(1, 0, <FriendCodesPanel key="FriendCodes" />);
    }
    return res;
}

export default class FriendCodes {
    unsubscribeLocale?: () => void;
    unpatchAddFriendPage?: () => void;

    start() {
        Styles.load();
        showChangelog(manifest);
        this.unpatchAddFriendPage = this.patchAddFriendPage();
        this.registerCommands();
        this.unsubscribeLocale = onLocaleChange(() => this.registerCommands());
    }

    stop() {
        this.unsubscribeLocale?.();
        Commands.unregisterAll();
        this.unpatchAddFriendPage?.();
        Patcher.unpatchAll();
        Styles.unload();
    }

    registerCommands() {
        Commands.unregisterAll();
        getCommands().forEach(command => Commands.register(command));
    }

    patchAddFriendPage() {
        if (!TabBar) {
            Logger.error("Failed to find TabBar module");
            return;
        }

        const unpatch = Patcher.after(TabBar, "Panel", (_, [{ id }], res) => {
            const page = res?.props?.children;
            if (id !== "ADD_FRIEND" || typeof page?.type !== "function" || page.type === AddFriendPage) return;
            res.props.children = <AddFriendPage key={page.key} page={page.type} {...page.props} />;
        });
        rerenderComponent(TabBar.Panel);

        return () => {
            unpatch?.();
            rerenderComponent(TabBar?.Panel);
        };
    }
}
