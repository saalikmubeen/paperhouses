import { FC, ReactNode } from "react";
import { WavyLink } from "react-wavy-transitions";
import { iconColor } from "../../utils";


type Props = {
    to: string;
    children: ReactNode;
    direction?: "up" | "down"
};

export const MyWavyLink: FC<Props> = ({ to, children, direction = "down" }) => (
    <WavyLink duration={1000} direction={direction} color={iconColor} to={to}>
        {children}
    </WavyLink>
);
