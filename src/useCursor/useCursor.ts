import { useRef } from 'react'
import type { Cursor, CursorMode, Coord, BoardManager } from '../types'

export function useCursor(board: BoardManager): Cursor {
  const position = useRef<Coord>({ row: 0, col: 0 })
  const mode = useRef<CursorMode>('normal')

  function move(dCols: number, dRows: number, count: number = 1) {

  }
  function moveLeft(count = 1) {
    // TODO: implement move left
  }

  function moveRight(count = 1) {
    // TODO: implement move right
  }

  function moveUp(count = 1) {
    // TODO: implement move up
  }

  function moveDown(count = 1) {
    // TODO: implement move down
  }

  return {
    position: () => position.current,
    mode: () => mode.current,
    move,
    moveLeft,
    moveRight,
    moveUp,
    moveDown
  }
}

