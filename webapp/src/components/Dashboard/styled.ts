import styled from "styled-components";

export const DashboardStyledContainer = styled.div`
    position: fixed;
    inset: 0;
    padding: 8px;

    display: grid;
    grid-template-areas: "SID CTT" "SID CTT";
    grid-template-columns: 50px 1fr;
    grid-template-rows: 46px 1fr;
    gap: 8px;

    > .sidebar {
        grid-area: SID;
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        height: 100%;

        > div {
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        button {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 32px;
            height: 32px;
            min-width: 32px;
            min-height: 32px;
            padding: 0;
        }
    }

    > .content {
        grid-area: CTT;
    }
`;
