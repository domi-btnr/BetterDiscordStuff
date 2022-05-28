/**
 * @name FriendCodes
 * @version 1.0.0
 * @description Generate FriendCodes to easily add friends
 * @author HypedDomi
 * @invite gp2ExK5vc7
 * @donate https://paypal.me/dominik1711
 * @website https://bd.bambus.me/
 * @source https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/FriendCodes
 * @updateUrl https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/FriendCodes/FriendCodes.plugin.js
 */
/*@cc_on
@if (@_jscript)
    
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
    var pathSelf = WScript.ScriptFullName;
    // Put the user at ease by addressing them in the first person
    shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();
@else@*/
/* Generated Code */
const config = {
	"info": {
		"name": "FriendCodes",
		"version": "1.0.0",
		"description": "Generate FriendCodes to easily add friends",
		"authors": [{
			"name": "HypedDomi",
			"discord_id": "354191516979429376",
			"github_username": "HypedDomi"
		}],
		"invite": "gp2ExK5vc7",
		"donate": "https://paypal.me/dominik1711",
		"website": "https://bd.bambus.me/",
		"github": "https://github.com/HypedDomi/BetterDiscordStuff/tree/main/Plugins/FriendCodes",
		"github_raw": "https://raw.githubusercontent.com/HypedDomi/BetterDiscordStuff/main/Plugins/FriendCodes/FriendCodes.plugin.js"
	},
	"changelog": [{
		"type": "added",
		"title": "YEAH",
		"items": [
			"The plugin exists"
		]
	}],
	"build": {
		"zlibrary": true,
		"copy": true,
		"production": false,
		"alias": {},
		"release": {
			"source": true,
			"readme": false,
			"public": true,
			"previews": [{
					"name": "Friends Page",
					"src": "images/Tabbar.png"
				},
				{
					"name": "",
					"src": "images/Modal.png"
				}
			]
		}
	}
};
function buildPlugin([BasePlugin, PluginApi]) {
	const module = {
		exports: {}
	};
	(() => {
		"use strict";
		class StyleLoader {
			static styles = "";
			static element = null;
			static append(module, css) {
				this.styles += `/* ${module} */\n${css}`;
			}
			static inject(name = config.info.name) {
				if (this.element) this.element.remove();
				this.element = document.head.appendChild(Object.assign(document.createElement("style"), {
					id: name,
					textContent: this.styles
				}));
			}
			static remove() {
				if (this.element) {
					this.element.remove();
					this.element = null;
				}
			}
		}
		function ___createMemoize___(instance, name, value) {
			value = value();
			Object.defineProperty(instance, name, {
				value,
				configurable: true
			});
			return value;
		};
		const Modules = {
			get 'react-spring'() {
				return ___createMemoize___(this, 'react-spring', () => BdApi.findModuleByProps('useSpring'))
			},
			'@discord/utils': {
				get 'joinClassNames'() {
					return ___createMemoize___(this, 'joinClassNames', () => BdApi.findModule(e => e.toString().indexOf('return e.join(" ")') > 200))
				},
				get 'useForceUpdate'() {
					return ___createMemoize___(this, 'useForceUpdate', () => BdApi.findModuleByProps('useForceUpdate')?.useForceUpdate)
				},
				get 'Logger'() {
					return ___createMemoize___(this, 'Logger', () => BdApi.findModuleByProps('setLogFn')?.default)
				},
				get 'Navigation'() {
					return ___createMemoize___(this, 'Navigation', () => BdApi.findModuleByProps('replaceWith', 'currentRouteIsPeekView'))
				}
			},
			'@discord/components': {
				get 'Tooltip'() {
					return ___createMemoize___(this, 'Tooltip', () => BdApi.findModuleByDisplayName('Tooltip'))
				},
				get 'TooltipContainer'() {
					return ___createMemoize___(this, 'TooltipContainer', () => BdApi.findModuleByProps('TooltipContainer')?.TooltipContainer)
				},
				get 'TextInput'() {
					return ___createMemoize___(this, 'TextInput', () => BdApi.findModuleByDisplayName('TextInput'))
				},
				get 'SlideIn'() {
					return ___createMemoize___(this, 'SlideIn', () => BdApi.findModuleByDisplayName('SlideIn'))
				},
				get 'SettingsNotice'() {
					return ___createMemoize___(this, 'SettingsNotice', () => BdApi.findModuleByDisplayName('SettingsNotice'))
				},
				get 'TransitionGroup'() {
					return ___createMemoize___(this, 'TransitionGroup', () => BdApi.findModuleByDisplayName('TransitionGroup'))
				},
				get 'Button'() {
					return ___createMemoize___(this, 'Button', () => BdApi.findModule(m => 'DropdownSizes' in m && typeof(m) === 'function'))
				},
				get 'Popout'() {
					return ___createMemoize___(this, 'Popout', () => BdApi.findModuleByDisplayName('Popout'))
				},
				get 'Flex'() {
					return ___createMemoize___(this, 'Flex', () => BdApi.findModuleByDisplayName('Flex'))
				},
				get 'Text'() {
					return ___createMemoize___(this, 'Text', () => BdApi.findModuleByDisplayName('Text'))
				},
				get 'Card'() {
					return ___createMemoize___(this, 'Card', () => BdApi.findModuleByDisplayName('Card'))
				}
			},
			'@discord/modules': {
				get 'Dispatcher'() {
					return ___createMemoize___(this, 'Dispatcher', () => BdApi.findModuleByProps('dirtyDispatch', 'subscribe'))
				},
				get 'ComponentDispatcher'() {
					return ___createMemoize___(this, 'ComponentDispatcher', () => BdApi.findModuleByProps('ComponentDispatch')?.ComponentDispatch)
				},
				get 'EmojiUtils'() {
					return ___createMemoize___(this, 'EmojiUtils', () => BdApi.findModuleByProps('uploadEmoji'))
				},
				get 'PermissionUtils'() {
					return ___createMemoize___(this, 'PermissionUtils', () => BdApi.findModuleByProps('computePermissions', 'canManageUser'))
				},
				get 'DMUtils'() {
					return ___createMemoize___(this, 'DMUtils', () => BdApi.findModuleByProps('openPrivateChannel'))
				}
			},
			'@discord/stores': {
				get 'Messages'() {
					return ___createMemoize___(this, 'Messages', () => BdApi.findModuleByProps('getMessage', 'getMessages'))
				},
				get 'Channels'() {
					return ___createMemoize___(this, 'Channels', () => BdApi.findModuleByProps('getChannel', 'getDMFromUserId'))
				},
				get 'Guilds'() {
					return ___createMemoize___(this, 'Guilds', () => BdApi.findModuleByProps('getGuild'))
				},
				get 'SelectedGuilds'() {
					return ___createMemoize___(this, 'SelectedGuilds', () => BdApi.findModuleByProps('getGuildId', 'getLastSelectedGuildId'))
				},
				get 'SelectedChannels'() {
					return ___createMemoize___(this, 'SelectedChannels', () => BdApi.findModuleByProps('getChannelId', 'getLastSelectedChannelId'))
				},
				get 'Info'() {
					return ___createMemoize___(this, 'Info', () => BdApi.findModuleByProps('getSessionId'))
				},
				get 'Status'() {
					return ___createMemoize___(this, 'Status', () => BdApi.findModuleByProps('getStatus', 'getActivities', 'getState'))
				},
				get 'Users'() {
					return ___createMemoize___(this, 'Users', () => BdApi.findModuleByProps('getUser', 'getCurrentUser'))
				},
				get 'SettingsStore'() {
					return ___createMemoize___(this, 'SettingsStore', () => BdApi.findModuleByProps('afkTimeout', 'status'))
				},
				get 'UserProfile'() {
					return ___createMemoize___(this, 'UserProfile', () => BdApi.findModuleByProps('getUserProfile'))
				},
				get 'Members'() {
					return ___createMemoize___(this, 'Members', () => BdApi.findModuleByProps('getMember'))
				},
				get 'Activities'() {
					return ___createMemoize___(this, 'Activities', () => BdApi.findModuleByProps('getActivities'))
				},
				get 'Games'() {
					return ___createMemoize___(this, 'Games', () => BdApi.findModuleByProps('getGame', 'games'))
				},
				get 'Auth'() {
					return ___createMemoize___(this, 'Auth', () => BdApi.findModuleByProps('getId', 'isGuest'))
				},
				get 'TypingUsers'() {
					return ___createMemoize___(this, 'TypingUsers', () => BdApi.findModuleByProps('isTyping'))
				}
			},
			'@discord/actions': {
				get 'ProfileActions'() {
					return ___createMemoize___(this, 'ProfileActions', () => BdApi.findModuleByProps('fetchProfile'))
				},
				get 'GuildActions'() {
					return ___createMemoize___(this, 'GuildActions', () => BdApi.findModuleByProps('requestMembersById'))
				}
			},
			get '@discord/i18n'() {
				return ___createMemoize___(this, '@discord/i18n', () => BdApi.findModule(m => m.Messages?.CLOSE && typeof(m.getLocale) === 'function'))
			},
			get '@discord/constants'() {
				return ___createMemoize___(this, '@discord/constants', () => BdApi.findModuleByProps('API_HOST'))
			},
			get '@discord/contextmenu'() {
				return ___createMemoize___(this, '@discord/contextmenu', () => {
					const ctx = Object.assign({}, BdApi.findModuleByProps('openContextMenu'), BdApi.findModuleByProps('MenuItem'));
					ctx.Menu = ctx.default;
					return ctx;
				})
			},
			get '@discord/forms'() {
				return ___createMemoize___(this, '@discord/forms', () => BdApi.findModuleByProps('FormItem'))
			},
			get '@discord/scrollbars'() {
				return ___createMemoize___(this, '@discord/scrollbars', () => BdApi.findModuleByProps('ScrollerAuto'))
			},
			get '@discord/native'() {
				return ___createMemoize___(this, '@discord/native', () => BdApi.findModuleByProps('requireModule'))
			},
			get '@discord/flux'() {
				return ___createMemoize___(this, '@discord/flux', () => Object.assign({}, BdApi.findModuleByProps('useStateFromStores').default, BdApi.findModuleByProps('useStateFromStores')))
			},
			get '@discord/modal'() {
				return ___createMemoize___(this, '@discord/modal', () => Object.assign({}, BdApi.findModuleByProps('ModalRoot'), BdApi.findModuleByProps('openModal', 'closeAllModals')))
			},
			get '@discord/connections'() {
				return ___createMemoize___(this, '@discord/connections', () => BdApi.findModuleByProps('get', 'isSupported', 'map'))
			},
			get '@discord/sanitize'() {
				return ___createMemoize___(this, '@discord/sanitize', () => BdApi.findModuleByProps('stringify', 'parse', 'encode'))
			},
			get '@discord/icons'() {
				return ___createMemoize___(this, '@discord/icons', () => BdApi.findAllModules(m => m.displayName && ~m.toString().indexOf('currentColor')).reduce((icons, icon) => (icons[icon.displayName] = icon, icons), {}))
			},
			'@discord/classes': {
				get 'Timestamp'() {
					return ___createMemoize___(this, 'Timestamp', () => BdApi.findModuleByPrototypes('toDate', 'month'))
				},
				get 'Message'() {
					return ___createMemoize___(this, 'Message', () => BdApi.findModuleByPrototypes('getReaction', 'isSystemDM'))
				},
				get 'User'() {
					return ___createMemoize___(this, 'User', () => BdApi.findModuleByPrototypes('tag'))
				},
				get 'Channel'() {
					return ___createMemoize___(this, 'Channel', () => BdApi.findModuleByPrototypes('isOwner', 'isCategory'))
				}
			}
		};
		var __webpack_modules__ = {
			24: (module, __webpack_exports__, __webpack_require__) => {
				__webpack_require__.d(__webpack_exports__, {
					Z: () => __WEBPACK_DEFAULT_EXPORT__
				});
				var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(645);
				var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default = __webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__);
				var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default()((function(i) {
					return i[1];
				}));
				___CSS_LOADER_EXPORT___.push([module.id, ".FriendCodes-style-item{color:#fff;display:flex;position:relative;flex-direction:column;border-radius:8px;padding:10px;margin-bottom:10px;background:var(--background-secondary)}.FriendCodes-style-item code{background:var(--background-tertiary);padding:2px}.FriendCodes-style-item div{margin:2px}.FriendCodes-style-buttonContainer{display:flex;justify-content:flex-end;align-items:center}.FriendCodes-style-buttonContainer .FriendCodes-style-buttonContainerInner{display:block;position:absolute;bottom:0;right:0;padding:10px}.FriendCodes-style-buttonContainer .FriendCodes-style-buttonContainerInner button{width:80px}.FriendCodes-style-noInvites img{display:block;margin-left:auto;margin-right:auto}.FriendCodes-style-noInvites h3{margin-top:25px;text-align:center;font-weight:500;font-size:large}", ""]);
				___CSS_LOADER_EXPORT___.locals = {
					item: "FriendCodes-style-item",
					buttonContainer: "FriendCodes-style-buttonContainer",
					buttonContainerInner: "FriendCodes-style-buttonContainerInner",
					noInvites: "FriendCodes-style-noInvites"
				};
				StyleLoader.append(module.id, ___CSS_LOADER_EXPORT___.toString());
				const __WEBPACK_DEFAULT_EXPORT__ = Object.assign(___CSS_LOADER_EXPORT___, ___CSS_LOADER_EXPORT___.locals);
			},
			645: module => {
				module.exports = function(cssWithMappingToString) {
					var list = [];
					list.toString = function toString() {
						return this.map((function(item) {
							var content = cssWithMappingToString(item);
							if (item[2]) return "@media ".concat(item[2], " {").concat(content, "}");
							return content;
						})).join("");
					};
					list.i = function(modules, mediaQuery, dedupe) {
						if ("string" === typeof modules) modules = [
							[null, modules, ""]
						];
						var alreadyImportedModules = {};
						if (dedupe)
							for (var i = 0; i < this.length; i++) {
								var id = this[i][0];
								if (null != id) alreadyImportedModules[id] = true;
							}
						for (var _i = 0; _i < modules.length; _i++) {
							var item = [].concat(modules[_i]);
							if (dedupe && alreadyImportedModules[item[0]]) continue;
							if (mediaQuery)
								if (!item[2]) item[2] = mediaQuery;
								else item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
							list.push(item);
						}
					};
					return list;
				};
			},
			113: module => {
				module.exports = BdApi.React;
			}
		};
		var __webpack_module_cache__ = {};
		function __webpack_require__(moduleId) {
			var cachedModule = __webpack_module_cache__[moduleId];
			if (void 0 !== cachedModule) return cachedModule.exports;
			var module = __webpack_module_cache__[moduleId] = {
				id: moduleId,
				exports: {}
			};
			__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
			return module.exports;
		}
		(() => {
			__webpack_require__.n = module => {
				var getter = module && module.__esModule ? () => module["default"] : () => module;
				__webpack_require__.d(getter, {
					a: getter
				});
				return getter;
			};
		})();
		(() => {
			__webpack_require__.d = (exports, definition) => {
				for (var key in definition)
					if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) Object.defineProperty(exports, key, {
						enumerable: true,
						get: definition[key]
					});
			};
		})();
		(() => {
			__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
		})();
		(() => {
			__webpack_require__.r = exports => {
				if ("undefined" !== typeof Symbol && Symbol.toStringTag) Object.defineProperty(exports, Symbol.toStringTag, {
					value: "Module"
				});
				Object.defineProperty(exports, "__esModule", {
					value: true
				});
			};
		})();
		var __webpack_exports__ = {};
		(() => {
			__webpack_require__.r(__webpack_exports__);
			__webpack_require__.d(__webpack_exports__, {
				default: () => FriendCodes
			});
			const external_BasePlugin_namespaceObject = BasePlugin;
			var external_BasePlugin_default = __webpack_require__.n(external_BasePlugin_namespaceObject);
			const external_PluginApi_namespaceObject = PluginApi;
			const modal_namespaceObject = Modules["@discord/modal"];
			var external_BdApi_React_ = __webpack_require__(113);
			var external_BdApi_React_default = __webpack_require__.n(external_BdApi_React_);
			const external_StyleLoader_namespaceObject = StyleLoader;
			var external_StyleLoader_default = __webpack_require__.n(external_StyleLoader_namespaceObject);
			const components_namespaceObject = Modules["@discord/components"];
			const native_namespaceObject = Modules["@discord/native"];
			var style = __webpack_require__(24);
			var React = __webpack_require__(113);
			function _extends() {
				_extends = Object.assign ? Object.assign.bind() : function(target) {
					for (var i = 1; i < arguments.length; i++) {
						var source = arguments[i];
						for (var key in source)
							if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
					}
					return target;
				};
				return _extends.apply(this, arguments);
			}
			const {
				createFriendInvite,
				getAllFriendInvites,
				revokeFriendInvites
			} = external_PluginApi_namespaceObject.WebpackModules.getByProps("createFriendInvite");
			const {
				Heading
			} = external_PluginApi_namespaceObject.WebpackModules.getByProps("Heading") ?? {
				Heading: () => null
			};
			const Markdown = external_PluginApi_namespaceObject.WebpackModules.getByProps("parseTopic");
			function CopyButton({
				copyText,
				copiedText,
				onClick
			}) {
				const [copied, setCopied] = (0, external_BdApi_React_.useState)(false);
				return React.createElement(components_namespaceObject.Button, {
					onClick: e => {
						setCopied(true);
						setTimeout((() => setCopied(false)), 1e3);
						onClick(e);
					},
					color: copied ? components_namespaceObject.Button.Colors.GREEN : components_namespaceObject.Button.Colors.BRAND,
					size: components_namespaceObject.Button.Sizes.SMALL,
					look: components_namespaceObject.Button.Looks.FILLED
				}, copied ? copiedText : copyText);
			}
			function InviteCard(props) {
				return React.createElement("div", {
					className: style.Z.item
				}, React.createElement("div", {
					className: style.Z.code
				}, React.createElement("span", null, React.createElement("b", null, "Code:"), " ", Markdown.parse(`\`${props.invite.code}\``))), React.createElement("div", {
					className: style.Z.uses
				}, React.createElement("span", null, React.createElement("b", null, "Uses:"), " ", props.invite.uses, "/", props.invite.max_uses)), React.createElement("div", {
					className: style.Z.expiresAt
				}, React.createElement("span", null, React.createElement("b", null, "Expires in:"), " ", Markdown.parse(`<t:${Math.floor(Date.parse(props.invite.expires_at).toString().slice(0, -3))}:R>`))), React.createElement("div", {
					className: style.Z.buttonContainer
				}, React.createElement("div", {
					className: style.Z.buttonContainerInner
				}, React.createElement(CopyButton, {
					copiedText: "Copied!",
					copyText: "Copy",
					onClick: () => (0, native_namespaceObject.copy)(`https://discord.gg/${props.invite.code}`)
				}))));
			}
			function Modal(props) {
				const [invites, setInvites] = (0, external_BdApi_React_.useState)([]);
				const [loading, setLoading] = (0, external_BdApi_React_.useState)(false);
				(0, external_BdApi_React_.useEffect)((() => {
					setLoading(true);
					getAllFriendInvites().then((invites => setInvites(invites))).then((() => setLoading(false)));
				}), []);
				return React.createElement(modal_namespaceObject.ModalRoot, _extends({}, props, {
					size: modal_namespaceObject.ModalSize.MEDIUM
				}), React.createElement(modal_namespaceObject.ModalHeader, {
					separator: false
				}, React.createElement(Heading, {
					level: "2",
					variant: "heading-lg/medium"
				}, "Friend Codes")), React.createElement(modal_namespaceObject.ModalContent, null, loading ? React.createElement("div", {
					className: style.Z.loading
				}) : invites.length > 0 ? invites.map((invite => React.createElement(InviteCard, {
					key: invite.code,
					invite
				}))) : React.createElement("div", {
					className: style.Z.noInvites
				}, React.createElement("img", {
					src: "https://discord.com/assets/b36c705f790dad253981f1893085015a.svg"
				}), React.createElement(Heading, {
					level: "3",
					variant: "heading-lg/small"
				}, "You don't have any friend codes yet"))), React.createElement(modal_namespaceObject.ModalFooter, null, React.createElement(components_namespaceObject.Flex, {
					justify: components_namespaceObject.Flex.Justify.BETWEEN
				}, React.createElement(components_namespaceObject.Flex, {
					justify: components_namespaceObject.Flex.Justify.START
				}, React.createElement(components_namespaceObject.Button, {
					color: components_namespaceObject.Button.Colors.GREEN,
					look: components_namespaceObject.Button.Looks.OUTLINED,
					onClick: () => createFriendInvite().then((invite => setInvites([...invites, invite])))
				}, "Create Friend Invite"), React.createElement(components_namespaceObject.Flex, {
					justify: components_namespaceObject.Flex.Justify.START
				}, React.createElement(components_namespaceObject.Button, {
					color: components_namespaceObject.Button.Colors.RED,
					look: components_namespaceObject.Button.Looks.LINK,
					disabled: !invites.length,
					onClick: () => revokeFriendInvites().then(setInvites([]))
				}, "Revoke all Friend Invites"))), React.createElement(components_namespaceObject.Button, {
					onClick: props.onClose
				}, "Okay"))));
			}
			class FriendCodes extends(external_BasePlugin_default()) {
				async onStart() {
					external_StyleLoader_default().inject();
					const TabBar = external_PluginApi_namespaceObject.WebpackModules.getByProps("Item", "Header");
					const FriendsTabBar = await external_PluginApi_namespaceObject.ReactComponents.getComponentByName("TabBar", ".tabBar-ra-EuL");
					external_PluginApi_namespaceObject.Patcher.after(FriendsTabBar.component.prototype, "render", ((e, _, returnValue) => {
						if (e.props.className && -1 !== e.props.className.indexOf("tabBar-ra-EuL")) returnValue.props.children.push(external_BdApi_React_default().createElement(TabBar.Item, {
							selectedItem: 0,
							onClick: () => (0, modal_namespaceObject.openModal)((props => external_BdApi_React_default().createElement(Modal, props)))
						}, "Friend Codes"));
					}));
				}
				onStop() {
					external_StyleLoader_default().remove();
					external_PluginApi_namespaceObject.Patcher.unpatchAll();
				}
			}
		})();
		module.exports.LibraryPluginHack = __webpack_exports__;
	})();
	const PluginExports = module.exports.LibraryPluginHack;
	return PluginExports?.__esModule ? PluginExports.default : PluginExports;
}
module.exports = window.hasOwnProperty("ZeresPluginLibrary") ?
	buildPlugin(window.ZeresPluginLibrary.buildPlugin(config)) :
	class {
		getName() {
			return config.info.name;
		}
		getAuthor() {
			return config.info.authors.map(a => a.name).join(", ");
		}
		getDescription() {
			return `${config.info.description}. __**ZeresPluginLibrary was not found! This plugin will not work!**__`;
		}
		getVersion() {
			return config.info.version;
		}
		load() {
			BdApi.showConfirmationModal(
				"Library plugin is needed",
				[`The library plugin needed for ${config.info.name} is missing. Please click Download to install it.`], {
					confirmText: "Download",
					cancelText: "Cancel",
					onConfirm: () => {
						require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
							if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
							await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
						});
					}
				}
			);
		}
		start() {}
		stop() {}
	};
/*@end@*/