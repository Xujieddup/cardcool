/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_NOTICE_URL: string
  readonly VITE_GRAPHQL_URL: string
  readonly VITE_GRAPHQL_PULL_CNT: number
  readonly VITE_INVITE_URL: string
  readonly VITE_STATIC_URL: string
  readonly VITE_QUERY_CARD_CNT: number
  readonly VITE_APP_ID: string
  readonly VITE_QRCODE: string
  readonly VITE_CLIENT_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module "lokijs/src/incremental-indexeddb-adapter"
// declare module "@/utils/dagreLayout"
declare module "@antv/hierarchy"

// declare namespace JSX {
//   interface IntrinsicElements {
//     "em-emoji": any
//   }
// }

interface Array<T> {
  findLast(
    predicate: (value: T, index: number, array: T[]) => unknown,
    thisArg?: any
  ): T | undefined
  findLastIndex(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): number
}
