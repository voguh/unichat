import Paper from '@mui/material/Paper'
import styled from 'styled-components'

export const DashboardHomeStyledContainer = styled(Paper)`
  width: 100%;
  height: 100%;
  padding: 8px;
  display: grid;
  grid-template-areas: 'YT TW';
  gap: 8px;

  > #youtube-chat-text-field {
    grid-area: YT;
  }

  > #twitch-chat-text-field {
    grid-area: TW;
  }
`
