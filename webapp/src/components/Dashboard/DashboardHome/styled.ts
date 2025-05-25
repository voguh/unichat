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

        > div {
            padding: 8px;

            &.fields-actions {
                grid-area: ACT;
                display: flex;
                justify-content: space-between;
                gap: 8px;

                > button {
                    justify-content: center;
                    align-items: center;
                    gap: 8px;
                }

                > div.status {
                }
            }

            &.fields-values {
                grid-area: FDS;
                width: 100%;
                height: 100%;
                padding: 16px 8px 8px 8px;

                > *:not(:first-child) {
                    margin-top: 16px;
                }
            }
        }
    }

    > .preview {
        grid-area: PRV;
        overflow: hidden;
        position: relative;

        > .preview-header {
            display: flex;
            gap: 4px;
            padding: 16px 8px 8px 8px;

            > button {
                width: 40px;
                height: 40px;
                min-width: 40px;
                min-height: 40px;
            }
        }

        > iframe {
            width: 100%;
            height: calc(100% - 64px);
            border: none;
        }
    }
`;
