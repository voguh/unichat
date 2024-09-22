import React from 'react'

import { Position } from '~/types'
import { ContextMenuItem } from '~/types/contextMenu'

import { ContextMenuStyledContainer } from './styled'

interface Props {
  pos: Position
  handleClose(): void
  items: ContextMenuItem[]
}

export function ContextMenu({ handleClose, items, pos }: Props): React.ReactNode {
  const [transform, setTransform] = React.useState<string>('translate(0, 0)')
  const ref = React.useRef<HTMLDivElement>()

  React.useEffect(() => {
    function clickOutsideListener(event: MouseEvent | TouchEvent): void {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }

      handleClose()
    }

    document.addEventListener('mousedown', clickOutsideListener)
    document.addEventListener('touchstart', clickOutsideListener)

    return () => {
      document.removeEventListener('mousedown', clickOutsideListener)
      document.removeEventListener('touchstart', clickOutsideListener)
    }
  }, [ref])

  React.useEffect(() => {
    if (ref.current != null) {
      const wrapper = ref.current

      let xOffset = 0
      const xHighPos = wrapper.clientWidth + pos.left
      if (xHighPos > window.innerWidth) {
        xOffset = xHighPos - window.innerWidth + 8
      } else if (pos.left < 8) {
        xOffset = (8 - pos.left) * -1
      }

      let yOffset = 0
      const yHighPos = wrapper.clientHeight + pos.top
      if (yHighPos > window.innerHeight) {
        yOffset = yHighPos - window.innerHeight + 8
      } else if (pos.top < 8) {
        yOffset = (8 - pos.top) * -1
      }

      setTransform(`translate(${xOffset * -1}px, ${yOffset * -1}px)`)
    }
  }, [pos])

  if (pos == null || items == null || items.length === 0) {
    return <></>
  }

  return (
    <ContextMenuStyledContainer ref={ref} style={{ ...pos, transform }} className="context-menu--wrapper">
      {items.map((item, idx) => {
        if ('divider' in item) {
          return <div key={idx} className="context-menu--divider" />
        }

        return (
          <button key={idx} className="context-menu--item" onClick={async () => item.action().then(handleClose)}>
            <div className="context-menu--item-icon">{item.icon && <i className={item.icon} />}</div>
            <div className="context-menu--item-label">{item.name}</div>
          </button>
        )
      })}
    </ContextMenuStyledContainer>
  )
}
