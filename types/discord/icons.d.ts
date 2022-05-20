type FunctionalComponentStatic<props, static> = React.FC<props> & static;

type CommonProperties = {
    width?: string | number;
    height?: string | number;
    className?: string;
    style?: React.StyleHTMLAttributes<void>;
    "aria-hidden"?: string;
    onClick?(event: React.MouseEvent): void;
};

declare module "@discord/icons" {
    export const Caret: FunctionalComponentStatic<CommonProperties & {direction: string;}, {
        displayName: "Caret";
        Directions: {DOWN: string; LEFT: string; RIGHT: string; UP: string;};
    }>;

    export const Gear: React.FC<CommonProperties>;
    export const Bell: React.FC<CommonProperties>;
    export const ShieldStar: React.FC<CommonProperties>;
    export const At: React.FC<CommonProperties>;
    export const People: React.FC<CommonProperties>;
}