declare module "@discord/components" {
    export type TooltipOptions = { tooltipClassName?: string; text?: string, position?: "top" | "bottom" | "left" | "right", spacing?: "8", children?: any };
    export function Tooltip({ text, position, spacing, children }: TooltipOptions): ReactElement;
    export type Tooltip = React.FunctionComponent<{
        tooltipClassName?: string;
    }>;
    export function TooltipContainer({ text, position, spacing, children }: TooltipOptions & { className?: string }): ReactElement;
    export function TextInput(props: { value: string, onChange: (value: string) => void, placeholder: string }): ReactElement;
    export function SlideIn(): ReactElement;
    export function TransitionGroup(): ReactElement;
    export function SettingsNotice({ onSave, onReset }): ReactElement;

    /* Button */
    const ButtonSizes: { ICON: string, LARGE: string, MAX: string, MEDIUM: string, MIN: string, NONE: string, SMALL: string, TINY: string, XLARGE: string };

    const ButtonLooks: { BLANK: string, FILLED: string, INVERTED: string, LINK: string, OUTLINED: string };

    const DropdownSizes: { LARGE: "LARGE", MEDIUM: "MEDIUM", SMALL: "SMALL" };

    const ButtonColors: { BLACK: string; BRAND: string; GREEN: string; GREY: string; LINK: string; PRIMARY: string; RED: string; TRANSPARENT: string; WHITE: string; YELLOW: string; }

    export function Button(props: { className?: string; disabled?: boolean; children?: any, look?: string, size?: string, dropdownSize?: string, color?: string, onClick?: (event: React.MouseEvent) => any }): ReactElement;

    // @ts-ignore
    Button.Sizes = ButtonSizes;
    Button.Looks = ButtonLooks;
    Button.Colors = ButtonColors;
    Button.DropdownSizes = DropdownSizes;

    /* Flex */
    const FlexAlign: { START: string, END: string, CENTER: string, STRETCH: string, BASELINE: string };

    const FlexDirection: { VERTICAL: string, HORIZONTAL: string, HORIZONTAL_REVERSE: string };

    const FlexJustify: { START: string, END: string, CENTER: string, BETWEEN: string, AROUND: string };

    const FlexWrap: { NO_WRAP: string, WRAP: string, WRAP_REVERSE: string };

    function Child(props: FlexProps): ReactElement;

    type FlexProps = {
        align?: string,
        direction?: string,
        justify?: string,
        wrap?: string,
        grow?: number,
        shrink?: number,
        children: any;
        className?: string;
    };
    export function Flex(props: FlexProps): ReactElement;
    Flex.Child = Child;

    Flex.Align = FlexAlign;
    Flex.Direction = FlexDirection;
    Flex.Justify = FlexJustify;
    Flex.Wrap = FlexWrap;

    const TextSizes: { SIZE_10: string; SIZE_12: string; SIZE_14: string; SIZE_16: string; SIZE_20: string; SIZE_24: string; SIZE_32: string; }

    const TextColors: { BRAND: string; CUSTOM: string; ERROR: string; HEADER_PRIMARY: string; HEADER_SECONDARY: string; INTERACTIVE_ACTIVE: string; INTERACTIVE_NORMAL: string; LINK: string; MUTED: string; STANDARD: string; STATUS_GREEN: string; STATUS_RED: string; STATUS_YELLOW: string; }

    type TextProps = {
        size?: string;
        color?: string;
        children?: any;
        className?: string;
    };

    export function Text(props: TextProps): ReactElement;

    Text.Colors = TextColors;
    Text.Sizes = TextSizes;

    const Types: { BRAND: string, CUSTOM: string, DANGER: string, PRIMARY: string, SUCCESS: string, WARNING: string };

    type CardProps = {
        type: string;
        editable: boolean;
        className?: string;
        outline: boolean;
    };

    export function Card(props: CardProps): ReactElement;

    type Positions = {TOP: string, CENTER: string; BOTTOM: string; LEFT: string; RIGHT: string};

    export const Popout: React.FunctionComponent<{
        align?: string;
        spacing?: number;
        shouldShow?: boolean;
        position: string;
        animation?: string;
        onRequestClose?: () => void;
        onRequestShow?: () => void;
        children: ({closePopout, updatePosition}) => React.ReactElement;
        renderPopout: ({closePopout, updatePosition}) => React.ReactElement;
    }> & {
        Align: Positions;
        Animation: {NONE: string; TRANSLATE: string; SCALE: string; FADE: string};
        Positions: Positions;
    };
}