import styled from "styled-components";

export const AboutModalStyledContainer = styled.div`
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    > div {
        > span {
            text-decoration: underline;
            cursor: pointer;
            color: var(--mantine-color-anchor);
        }
    }

    > .app-image {
        > img {
            width: 128px;
        }
    }

    > .app-name {
        font-weight: 600;
        margin-top: 16px;
    }

    > .app-version {
        font-size: 12px;
        margin-top: 8px;
        color: var(--mantine-color-dimmed);
    }

    > .app-homepage {
        margin-top: 16px;
    }

    > .app-description {
        font-size: 12px;
        text-align: center;
    }

    > .app-footer {
        width: 100%;
        margin-top: 32px;
        display: flex;
        justify-content: space-between;
    }

    > .app-credits {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 50%;
        width: 100%;
        background: var(--mantine-color-body);
        transform: translateY(100%);
        transition: transform 200ms ease;
        border: 1px solid var(--mantine-color-default-border);
        border-radius: var(--mantine-radius-xs);
        padding: 16px;

        &.isCreditsOpen {
            transform: translateY(0);
        }

        > .credits-data {
            height: calc(100% - (36px + 32px));
            font-size: 12px;

            > div {
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-template-areas: "LT RT";
                gap: 8px;

                > div.label {
                    grid-area: LT;
                    text-align: right;
                    font-weight: bold;
                }

                > div.values {
                    grid-area: RT;
                    text-align: left;
                    color: var(--mantine-color-dimmed);

                    > p {
                        margin: 0;
                    }
                }
            }
        }

        > .credits-footer {
            width: 100%;
            margin-top: 32px;
            display: flex;
            justify-content: center;
        }
    }
`;
