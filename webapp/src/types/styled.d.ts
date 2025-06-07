/* eslint-disable @typescript-eslint/no-empty-object-type */
import "styled-components";

declare module "styled-components" {
    type Theme = typeof import("../styles/theme").theme;
    export interface DefaultTheme extends Theme {}
}
