import styled from 'styled-components'

export const DashboardStyledContainer = styled.div`
  position: absolute;
  inset: 0;
  padding: 8px;

  display: grid;
  grid-template-areas: 'TOP PRV' 'EDT PRV';
  grid-template-columns: 1fr 500px;
  grid-template-rows: 38px 1fr;
  gap: 8px;

  > .top-bar {
    grid-area: TOP;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 4px;
    gap: 4px;
  }

  > .editor {
    grid-area: EDT;
    overflow: hidden;
  }

  > .preview {
    grid-area: PRV;
  }
`
