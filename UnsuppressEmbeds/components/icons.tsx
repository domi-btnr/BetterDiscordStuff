/*
 * The icons in this file are sourced from Vencord.
 * For more details, see: https://github.com/Vendicated/Vencord/blob/fcf8690d2699c22f2bc552b8a4250673bf6f1630/src/components/Icons.tsx#L169-L191
 * Vencord is distributed under the GNU General Public License (GPL) v3.
 */

import { Utils } from "@api";
import React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

export function ImageVisible(props: IconProps) {
    return (
        <svg
            {...props}
            className={Utils.className(props.className, "image-visible")}
            viewBox="0 0 24 24"
        >
            <path fill="currentColor" d="M5 21q-.825 0-1.413-.587Q3 19.825 3 19V5q0-.825.587-1.413Q4.175 3 5 3h14q.825 0 1.413.587Q21 4.175 21 5v14q0 .825-.587 1.413Q19.825 21 19 21Zm0-2h14V5H5v14Zm1-2h12l-3.75-5-3 4L9 13Zm-1 2V5v14Z" />
        </svg>
    );
}

export function ImageInvisible(props: IconProps) {
    return (
        <svg
            {...props}
            className={Utils.className(props.className, "image-invisible")}
            viewBox="0 0 24 24"
        >
            <path fill="currentColor" d="m21 18.15-2-2V5H7.85l-2-2H19q.825 0 1.413.587Q21 4.175 21 5Zm-1.2 4.45L18.2 21H5q-.825 0-1.413-.587Q3 19.825 3 19V5.8L1.4 4.2l1.4-1.4 18.4 18.4ZM6 17l3-4 2.25 3 .825-1.1L5 7.825V19h11.175l-2-2Zm7.425-6.425ZM10.6 13.4Z" />
        </svg>
    );
}
