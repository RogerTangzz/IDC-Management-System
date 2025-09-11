import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'

// 在 Vite 环境中可直接使用 process.cwd，但为避免 ESLint 浏览器规则 no-undef，这里显式声明或替换。
// 使用 path.resolve(process.cwd(), ...) 仍然在构建期执行；添加 // eslint-disable-next-line 可保留语义并避免错误。
export default function createSvgIcon(isBuild) {
    // eslint-disable-next-line no-undef
    const iconsPath = path.resolve(typeof process !== 'undefined' ? process.cwd() : '', 'src/assets/icons/svg')
    return createSvgIconsPlugin({
        iconDirs: [iconsPath],
        symbolId: 'icon-[dir]-[name]',
        svgoOptions: isBuild
    })
}
