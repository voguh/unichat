import styled from "styled-components";

export const ScrapperCardStyledContainer = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: flex-end;
    gap: 8px;

    &:not(:first-child) {
        margin-top: 8px;
    }

    > .mantine-TextInput-root {
        flex: 1;
    }

    > button:nth-of-type(2) {
        padding: 0;
        width: 36px;
    }
`;
