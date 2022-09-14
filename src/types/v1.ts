import type {Result} from './support'

export interface Log {
  address: Uint8Array
  topics: Uint8Array[]
  data: Uint8Array
}
