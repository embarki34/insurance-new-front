import { ZoneOutput } from "@/lib/output-Types";
import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";
// zone.ts



const { persistAtom } = recoilPersist({
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    key: "zonePersist",
  });
  
  export const zoneAtom = atom<ZoneOutput[]>({
    key: "zoneAtomKey",
    default: [],
    effects_UNSTABLE: [persistAtom],
  });