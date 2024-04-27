import { useCallback, useReducer, useRef } from "react"

export const useMergeState = (initialState: string): [string, (newState: string) => void] => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0)
  const stateRef = useRef(initialState)
  const lastParentStateRef = useRef(initialState)
  if (initialState !== lastParentStateRef.current) {
    lastParentStateRef.current = initialState
    stateRef.current = initialState
  }
  const setState = useCallback((newState: string) => {
    stateRef.current = newState
    forceUpdate()
  }, [])
  return [stateRef.current, setState]
}
