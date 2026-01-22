import path from 'path'
import fs from 'fs'

// 删除文件（跨平台兼容）
const removeFile = async (filePath: string) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
            console.log('File removed:', filePath)
        }
    } catch (e) {
        console.log('Error removing file:', e)
    }
}

// 复制文件
const copyFile = (src: string, dest: string) => {
    try {
        const destDir = path.dirname(dest)
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true })
        }
        fs.copyFileSync(src, dest)
        console.log('Copied:', src, '->', dest)
    } catch (e) {
        console.log('Error copying file:', e)
    }
}

// 压缩 HTML（简单实现）
const minifyHtml = (html: string): string => {
    return html
        .replace(/<!--[\s\S]*?-->/g, '') // 移除注释
        .replace(/\s+/g, ' ') // 多个空白替换为单个空格
        .replace(/>\s+</g, '><') // 移除标签间空白
        .trim()
}

// 打包 extension 脚本 (content + inject)
async function buildExtensionScripts() {
    const outDir = path.resolve(__dirname, './extension')
    const contentScript = path.resolve(__dirname, './app/scripts/content/')
    const injectScript = path.resolve(__dirname, './app/scripts/inject/')

    // 清理旧文件
    await removeFile(path.resolve(outDir, 'content-script.js'))
    await removeFile(path.resolve(outDir, 'inject-script.js'))

    // @ts-ignore
    const result = await Bun.build({
        entrypoints: [contentScript, injectScript],
        target: 'browser',
        minify: true,
        outdir: outDir,
        naming: '[dir]-script.[ext]',
    })

    if (!result.success) {
        console.error('Extension scripts build failed:', result.logs)
        process.exit(1)
    }
    console.log('✓ Extension scripts built successfully')
}

// 打包 weiboSave 脚本
async function buildWeiboSaveScripts() {
    const outDir = path.resolve(__dirname, './extension/weiboSave/scripts')
    const weibosaveScript = path.resolve(__dirname, './weiboSave/scripts/weibosave.ts')
    const singlepostScript = path.resolve(__dirname, './weiboSave/scripts/singlepost.js')

    // 确保输出目录存在
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true })
    }

    // 清理旧文件
    await removeFile(path.resolve(outDir, 'weibosave.js'))
    await removeFile(path.resolve(outDir, 'singlepost.js'))

    // @ts-ignore
    const result = await Bun.build({
        entrypoints: [weibosaveScript, singlepostScript],
        target: 'browser',
        minify: true,
        outdir: outDir,
        external: ['./myblog.json'], // 外部依赖，运行时加载
    })

    if (!result.success) {
        console.error('WeiboSave scripts build failed:', result.logs)
        process.exit(1)
    }
    console.log('✓ WeiboSave scripts built successfully')
}

// 处理 HTML 文件
async function processHtmlFiles() {
    const srcDir = path.resolve(__dirname, './weiboSave')
    const outDir = path.resolve(__dirname, './extension/weiboSave')

    const htmlFiles = ['index.html', 'singlePost.html']

    for (const htmlFile of htmlFiles) {
        const srcPath = path.resolve(srcDir, htmlFile)
        const destPath = path.resolve(outDir, htmlFile)

        if (fs.existsSync(srcPath)) {
            const html = fs.readFileSync(srcPath, 'utf-8')
            const minified = minifyHtml(html)
            fs.writeFileSync(destPath, minified)
            console.log('✓ HTML processed:', htmlFile)
        }
    }
}

// 主函数
async function bunBuild() {
    console.log('🚀 Starting Bun build...\n')

    await buildExtensionScripts()
    await buildWeiboSaveScripts()
    await processHtmlFiles()

    console.log('\n✅ All builds completed!')
}

bunBuild()
