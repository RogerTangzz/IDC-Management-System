import type { RouteLocationNormalizedLoaded } from 'vue-router'

export interface ViewTag extends Partial<RouteLocationNormalizedLoaded> {
    title?: string
    meta: any & { title?: string; affix?: boolean; noCache?: boolean; link?: string }
    name?: string
    path: string
}

export interface TagsViewState {
    visitedViews: ViewTag[]
    cachedViews: string[]
    iframeViews: ViewTag[]
}

const useTagsViewStore = defineStore('tags-view', {
    state: (): TagsViewState => ({
        visitedViews: [],
        cachedViews: [],
        iframeViews: []
    }),
    actions: {
        addView(view: ViewTag) {
            this.addVisitedView(view)
            this.addCachedView(view)
        },
        addIframeView(view: ViewTag) {
            if (this.iframeViews.some(v => v.path === view.path)) return
            this.iframeViews.push({ ...view, title: view.meta.title || 'no-name' })
        },
        addVisitedView(view: ViewTag) {
            if (this.visitedViews.some(v => v.path === view.path)) return
            this.visitedViews.push({ ...view, title: view.meta.title || 'no-name' })
        },
        addCachedView(view: ViewTag) {
            if (!view.name) return
            if (this.cachedViews.includes(view.name)) return
            if (!view.meta.noCache) this.cachedViews.push(view.name)
        },
        async delView(view: ViewTag) {
            this.delVisitedView(view)
            this.delCachedView(view)
            return { visitedViews: [...this.visitedViews], cachedViews: [...this.cachedViews] }
        },
        delVisitedView(view: ViewTag) {
            for (const [i, v] of this.visitedViews.entries()) {
                if (v.path === view.path) {
                    this.visitedViews.splice(i, 1)
                    break
                }
            }
            this.iframeViews = this.iframeViews.filter(item => item.path !== view.path)
            return [...this.visitedViews]
        },
        delIframeView(view: ViewTag) {
            this.iframeViews = this.iframeViews.filter(item => item.path !== view.path)
            return [...this.iframeViews]
        },
        delCachedView(view: ViewTag) {
            if (!view.name) return [...this.cachedViews]
            const index = this.cachedViews.indexOf(view.name)
            if (index > -1) this.cachedViews.splice(index, 1)
            return [...this.cachedViews]
        },
        delOthersViews(view: ViewTag) {
            this.delOthersVisitedViews(view)
            this.delOthersCachedViews(view)
            return { visitedViews: [...this.visitedViews], cachedViews: [...this.cachedViews] }
        },
        delOthersVisitedViews(view: ViewTag) {
            this.visitedViews = this.visitedViews.filter(v => v.meta.affix || v.path === view.path)
            this.iframeViews = this.iframeViews.filter(item => item.path === view.path)
            return [...this.visitedViews]
        },
        delOthersCachedViews(view: ViewTag) {
            if (view.name) {
                const index = this.cachedViews.indexOf(view.name)
                this.cachedViews = index > -1 ? this.cachedViews.slice(index, index + 1) : []
            } else {
                this.cachedViews = []
            }
            return [...this.cachedViews]
        },
        delAllViews(view?: ViewTag) {
            this.delAllVisitedViews()
            this.delAllCachedViews()
            return { visitedViews: [...this.visitedViews], cachedViews: [...this.cachedViews] }
        },
        delAllVisitedViews() {
            const affixTags = this.visitedViews.filter(tag => tag.meta.affix)
            this.visitedViews = affixTags
            this.iframeViews = []
            return [...this.visitedViews]
        },
        delAllCachedViews() {
            this.cachedViews = []
            return [...this.cachedViews]
        },
        updateVisitedView(view: ViewTag) {
            const idx = this.visitedViews.findIndex(v => v.path === view.path)
            if (idx !== -1) {
                this.visitedViews[idx] = Object.assign({}, this.visitedViews[idx], view)
            }
        },
        delRightTags(view: ViewTag) {
            const index = this.visitedViews.findIndex(v => v.path === view.path)
            if (index === -1) return [...this.visitedViews]
            this.visitedViews = this.visitedViews.filter((item, idx) => {
                if (idx <= index || (item.meta && item.meta.affix)) return true
                if (item.name) {
                    const i = this.cachedViews.indexOf(item.name)
                    if (i > -1) this.cachedViews.splice(i, 1)
                }
                if (item.meta.link) {
                    const fi = this.iframeViews.findIndex(v => v.path === item.path)
                    this.iframeViews.splice(fi, 1)
                }
                return false
            })
            return [...this.visitedViews]
        },
        delLeftTags(view: ViewTag) {
            const index = this.visitedViews.findIndex(v => v.path === view.path)
            if (index === -1) return [...this.visitedViews]
            this.visitedViews = this.visitedViews.filter((item, idx) => {
                if (idx >= index || (item.meta && item.meta.affix)) return true
                if (item.name) {
                    const i = this.cachedViews.indexOf(item.name)
                    if (i > -1) this.cachedViews.splice(i, 1)
                }
                if (item.meta.link) {
                    const fi = this.iframeViews.findIndex(v => v.path === item.path)
                    this.iframeViews.splice(fi, 1)
                }
                return false
            })
            return [...this.visitedViews]
        }
    }
})

export default useTagsViewStore
