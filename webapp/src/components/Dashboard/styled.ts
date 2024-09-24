import styled from 'styled-components'

export const DashboardStyledContainer = styled.div`
  position: absolute;
  inset: 0;
  padding: 8px;

  display: grid;
  grid-template-areas: 'SID CTT' 'SID CTT';
  grid-template-columns: 48px 1fr;
  grid-template-rows: 46px 1fr;
  gap: 8px;

  > .sidebar {
    grid-area: SID;
    padding: 8px;

    > button {
      width: 32px;
      height: 32px;
      min-width: 32px;
      min-height: 32px;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  > .content {
    grid-area: CTT;
  }
`
