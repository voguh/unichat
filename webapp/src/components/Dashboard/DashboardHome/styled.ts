import styled from 'styled-components'

export const DashboardHomeStyledContainer = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-areas: 'TOP PRV' 'EDT PRV';
  grid-template-columns: 1fr 500px;
  grid-template-rows: 46px 1fr;
  gap: 8px;

  > .top-bar {
    grid-area: TOP;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 8px;
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
