import Paper from '@mui/material/Paper'
import styled from 'styled-components'

export const ContextMenuStyledContainer = styled(Paper)`
  position: fixed;
  padding: 4px;
  z-index: 9999;
  box-shadow: var(--mui-shadows-5);
  border-radius: 8px;

  > .context-menu--divider {
    margin: 4px 0;
    border-top: 1px solid rgba(0, 0, 0, 0.5);
  }

  > .context-menu--item {
    padding: 4px 8px 4px 0;
    border-radius: 4px;
    width: 100%;
    height: 32px;
    background: none;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border: none;

    &:hover {
      background: var(--mui-palette-grey-800);
    }

    > .context-menu--item-icon {
      width: 32px;
      height: 32px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    > .context-menu--item-label {
      height: 32px;
      width: 100%;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      white-space: nowrap;
      line-height: 1;
      font-weight: 700;
    }
  }
`
