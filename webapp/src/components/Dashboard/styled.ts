import styled from 'styled-components'

export const DashboardStyledContainer = styled.div`
  position: absolute;
  inset: 0;
  padding: 8px;

  display: grid;
  grid-template-columns: 1fr 500px;
  gap: 8px;

  > .editor {
    overflow: hidden;
  }
`
