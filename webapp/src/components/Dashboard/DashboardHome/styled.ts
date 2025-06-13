import styled from "styled-components";

export const DashboardHomeStyledContainer = styled.div`
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-areas: "FDS PRV";
    grid-template-columns: 1fr 400px;
    grid-template-rows: 1fr;
    gap: 8px;

    > .fields {
        grid-area: FDS;

        display: grid;
        grid-template-areas: "ACT" "FDS";
        grid-template-rows: min-content 1fr;
        gap: 8px;

        > .fields-actions {
            grid-area: ACT;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 8px;

            > button {
                min-width: 34px;
                padding: 0;
            }
        }

        > .fields-values {
            grid-area: FDS;
            width: 100%;
            height: 100%;
            padding: 8px;
        }
    }

    > .preview {
        grid-area: PRV;
        overflow: hidden;
        position: relative;

        > .preview-header {
            display: flex;
            flex-direction: row;
            gap: 4px;
            padding: 8px;
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;

            > .preview-header-widget-selector {
                width: 100%;
            }

            > button {
                flex-shrink: 0;
                width: 36px;
                height: 36px;
                padding: 0;
            }
        }

        > .iframe-wrapper {
            width: 100%;
            height: calc(100% - (36px + 16px + 2px)); // 36px for content, 16px for padding, 2px for border
            border-bottom-left-radius: var(--mantine-radius-default);
            border-bottom-right-radius: var(--mantine-radius-default);
            overflow: hidden;

            > iframe {
                width: 100%;
                height: 100%;
                border: none;
            }
        }
    }
`;
