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
        inset: 0;
        background: var(--mantine-color-body);
        transform: translateY(100%);
        transition: transform 200ms ease;

        &.isCreditsOpen {
            transform: translateY(0);
        }

        > .credits-data {
            height: calc(100% - (36px + 32px));

            > span {
            }

            > ul {
                > li {
                    > span {
                        text-decoration: underline;
                        cursor: pointer;
                        color: var(--mantine-color-anchor);
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
