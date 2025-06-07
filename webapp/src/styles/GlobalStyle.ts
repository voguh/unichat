import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
    :root {
        ${({ theme }) =>
            Object.entries(theme)
                .map(([key, value]) => `--${key}: ${value};`)
                .join(";\n")}
    }
`;
