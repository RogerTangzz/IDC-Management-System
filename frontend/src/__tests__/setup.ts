// jsdom already provides window & localStorage; ensure silent failures if accessed early
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => { },
        removeListener: () => { },
        addEventListener: () => { },
        removeEventListener: () => { },
        dispatchEvent: () => false
    })
})

// Provide minimal mock for console noise suppression if needed
// (Could filter specific mock store logs later)

// Provide global defineStore/storeToRefs stub if auto-import plugin didn't inject during vitest transform
