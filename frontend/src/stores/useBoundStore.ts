import { create } from 'zustand'
import type { SidebarSlice } from '@/stores/useSidebar'
import { createSidebarSlice } from '@/stores/useSidebar'


export const useBoundStore = create<SidebarSlice>()((...args) => ({
    ...createSidebarSlice(...args),
}))
