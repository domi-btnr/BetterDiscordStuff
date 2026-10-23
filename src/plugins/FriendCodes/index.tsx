import { Commands, Logger, Patcher } from "@api";
import showChangelog from "@common/Changelog";
import { onLocaleChange } from "@common/i18n";
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

    start() {
        Styles.load();
        showChangelog(manifest);
        this.patchAddFriendPage();
        this.registerCommands();
        this.unsubscribeLocale = onLocaleChange(() => this.registerCommands());
    }

    stop() {
        this.unsubscribeLocale?.();
        Commands.unregisterAll();
        Patcher.unpatchAll();
        Styles.unload();
    }

    registerCommands() {
        Commands.unregisterAll();
        getCommands().forEach(command => Commands.register(command));
    }

    patchAddFriendPage() {
        if (!TabBar) return Logger.error("Failed to find TabBar module");

        Patcher.after(TabBar, "Panel", (_, [{ id }], res) => {
            const page = res?.props?.children;
            if (id !== "ADD_FRIEND" || typeof page?.type !== "function" || page.type === AddFriendPage) return;
            res.props.children = <AddFriendPage key={page.key} page={page.type} {...page.props} />;
        });
    }
}
