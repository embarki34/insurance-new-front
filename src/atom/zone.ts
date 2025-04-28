import { ZoneOutput, SiteOutput } from "@/lib/output-Types";
import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

// Persistence configuration for zone atom
const { persistAtom } = recoilPersist({
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    key: "zonePersist",
});

// Atom for zones
export const zoneAtom = atom<ZoneOutput[]>({
    key: "zoneAtom",
    default: [],
    effects_UNSTABLE: [persistAtom],
});

// Atom for sites
export const siteAtom = atom<SiteOutput[]>({
    key: "siteAtom",
    default: [],
    effects_UNSTABLE: [persistAtom],
});