// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
// 1. Copy Vector to Illustrator (已删除按钮，功能已注释)

/*
const btnCopyText = document.getElementById('btn-copy-text')

btnCopyText.onclick = () => {

    const svgLetter = document.getElementById("svg-text")
    const clone = svgLetter.cloneNode(true);

    const grid = clone.querySelectorAll('.grid')

    grid.forEach(gridElement => {
        gridElement.remove()
    })

    // const svgString = clone.outerHTML;
    const svgString = new XMLSerializer().serializeToString(clone);

    navigator.clipboard.writeText(svgString)

}
*/

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
// 2. Download PNG 功能

// 🔥 PNG 下载功能
const downloadPNG = () => {
    console.log('🎨 Starting PNG download...');
    
    const svgText = document.getElementById('svg-text');
    if (!svgText) {
        console.error('❌ SVG element not found');
        alert('无法生成 PNG：SVG 元素未找到');
        return;
    }

    try {
        // 🔥 克隆 SVG
        const svgClone = svgText.cloneNode(true);
        
        // 🔥 获取 SVG 的 viewBox 或实际尺寸
        const viewBox = svgText.getAttribute('viewBox');
        let width, height;
        
        if (viewBox) {
            const [, , vw, vh] = viewBox.split(' ').map(Number);
            width = vw;
            height = vh;
        } else {
            try {
                const bbox = svgText.getBBox();
                width = Math.max(bbox.width + bbox.x * 2, 1000);
                height = Math.max(bbox.height + bbox.y * 2, 1000);
            } catch (e) {
                console.warn('⚠️ getBBox failed, using default size');
                width = 1000;
                height = 1000;
            }
        }
        
        console.log(`📐 SVG dimensions: ${width}x${height}`);

        // 🔥 设置 SVG 属性
        svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svgClone.setAttribute('width', width);
        svgClone.setAttribute('height', height);
        if (!viewBox) {
            svgClone.setAttribute('viewBox', `0 0 ${width} ${height}`);
        }

        // 🔥 应用背景色
        const bgColor = bitmapFont.parameters.backgroundColor || 
                        document.getElementById('main')?.style.backgroundColor || 
                        getComputedStyle(document.body).backgroundColor ||
                        '#ffffff';
        
        // 创建背景矩形
        const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bgRect.setAttribute('width', width);
        bgRect.setAttribute('height', height);
        bgRect.setAttribute('fill', bgColor);
        svgClone.insertBefore(bgRect, svgClone.firstChild);
        
        console.log(`🎨 Background color: ${bgColor}`);

        // 🔥 序列化 SVG
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgClone);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);

        console.log('📦 SVG blob created');

        // 🔥 创建 Image 对象
        const img = new Image();
        
        img.onload = () => {
            console.log('✅ Image loaded successfully');
            
            try {
                // 🔥 创建 Canvas
                const canvas = document.createElement('canvas');
                const scale = 2; // 2倍分辨率
                canvas.width = width * scale;
                canvas.height = height * scale;
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    throw new Error('Failed to get canvas context');
                }

                // 🔥 填充背景色
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // 🔥 绘制 SVG
                ctx.scale(scale, scale);
                ctx.drawImage(img, 0, 0);

                console.log('🖼️ Canvas drawn successfully');

                // 🔥 导出 PNG
                canvas.toBlob((blob) => {
                    if (!blob) {
                        console.error('❌ Failed to create PNG blob');
                        alert('无法生成 PNG：Blob 创建失败');
                        URL.revokeObjectURL(svgUrl);
                        return;
                    }
                    
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `repeat3-${Date.now()}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    
                    // 🔥 清理资源
                    URL.revokeObjectURL(url);
                    URL.revokeObjectURL(svgUrl);
                    
                    console.log('✅ PNG downloaded successfully');
                }, 'image/png', 1.0);
            } catch (error) {
                console.error('❌ Canvas error:', error);
                alert(`无法生成 PNG：${error.message}`);
                URL.revokeObjectURL(svgUrl);
            }
        };

        img.onerror = (err) => {
            console.error('❌ Image loading error:', err);
            alert('无法生成 PNG：图像加载失败');
            URL.revokeObjectURL(svgUrl);
        };

        img.src = svgUrl;
        console.log('⏳ Loading image...');

    } catch (error) {
        console.error('❌ PNG generation error:', error);
        alert(`无法生成 PNG：${error.message}`);
    }
};

// 🔥 绑定 Download 按钮
document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('btn-download-font');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', (e) => {
            console.log('🖱️ Download button clicked');
            e.preventDefault();
            downloadPNG();
        });
        console.log('✅ Download button initialized for PNG');
    } else {
        console.error('❌ Download button not found');
    }
});
