import { KVNamespace } from "@cloudflare/workers-types"

export interface Env {
  EXPENSES_KV: KVNamespace;
}
