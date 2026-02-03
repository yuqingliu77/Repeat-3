// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
// 自定义光标
const createCustomCursor = () => {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
    
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    });
    
    document.addEventListener('mousedown', () => {
        cursor.classList.add('clicking');
    });
    
    document.addEventListener('mouseup', () => {
        cursor.classList.remove('clicking');
    });
    
    // 鼠标离开页面时隐藏光标
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
    });
};

// 初始化自定义光标
createCustomCursor();

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
// 
const svgText = document.getElementById("svg-text")

// Functions we need

// • Empty Canvas
// • Render Grid
// • Render  Glyph
// • Render Text

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
// Events / Interactions

// A function to clean up the canvas
const emptyCanvas = () => {
    // First delete previous letters
    const previousGlyph = document.getElementById('glyph-group')

    // Remove the element
    if(previousGlyph) previousGlyph.remove()
}


const renderGrid = () => {

    const width = bitmapFont.parameters.width
    const height = bitmapFont.parameters.height
    const columns = bitmapFont.parameters.columns
    const rows = bitmapFont.parameters.rows


    const gridUnitWidth = width / columns
    const gridUnitHeight = height / rows
    // Lets create a group for order and organisation
    const gridGroup = 
        // document.getElementById('grid-guide-lines') 
        // || 
        document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // gridGroup.innerHTML = ''
    // Remove previous element if available!!

    // Lets give the grid a id, so we can show and hide it Later
    gridGroup.setAttribute('class', 'grid')

    if(!bitmapFont.parameters.showGrid) return

    // Create the grid
    for(let i = 0; i < columns+1; i++){
        // Create a horizontal line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        line.setAttribute('x1', i * gridUnitWidth)
        line.setAttribute('x2', i * gridUnitWidth)
        line.setAttribute('y1', 0)
        line.setAttribute('y2', height)

        gridGroup.appendChild(line)
    }

    // Create the grid
    for(let i = 0; i < rows+1; i++){
        // Create a horizontal line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')


        // Place the line
        line.setAttribute('x1', 0)
        line.setAttribute('x2', width)
        line.setAttribute('y1', i * gridUnitHeight)
        line.setAttribute('y2', i * gridUnitHeight)

        // Choose the color of the line

        gridGroup.appendChild(line)
    }
    // svgLetter.appendChild(gridGroup)

    return gridGroup
}

// Actuall render the grid
renderGrid()


const renderGlyph = (character) => {
    const currentLetter = bitmapFont.glyphs[character] || bitmapFont.glyphs['.notdef']
    const glyphGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    glyphGroup.setAttribute('id', 'glyph-group')

    // 🔥 删除：移除这里的 size 缩放，统一由 renderText 处理
    // const sizeScale = (bitmapFont.parameters.size || 100) / 100;
    
    // 🔥 修改：恢复原始尺寸，不在这里应用 size
    const width = bitmapFont.parameters.width;
    const height = bitmapFont.parameters.height;
    const columns = bitmapFont.parameters.columns
    const rows = bitmapFont.parameters.rows
    const gridUnitWidth = width / columns
    const gridUnitHeight = height / rows
    const copies = bitmapFont.parameters.copies.count
    
    // 重写:高对比度磨砂球体效果
    const grainSize = bitmapFont.parameters.grainSize || 1
    const grainContrast = bitmapFont.parameters.grainContrast || 0
    const grainHighlight = bitmapFont.parameters.grainHighlight || 50
    
    // 始终创建滤镜定义，即使grainContrast为0
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'grain-filter');
    filter.setAttribute('x', '-50%');
    filter.setAttribute('y', '-50%');
    filter.setAttribute('width', '200%');
    filter.setAttribute('height', '200%');
    filter.setAttribute('color-interpolation-filters', 'sRGB');
    
    // 1. 生成细腻的噪点纹理 - 模拟插画质感
    const baseFreq = 0.8 / grainSize;
    const feTurbulence = document.createElementNS('http://www.w3.org/2000/svg', 'feTurbulence');
    feTurbulence.setAttribute('type', 'fractalNoise');
    feTurbulence.setAttribute('baseFrequency', `${baseFreq} ${baseFreq}`);
    feTurbulence.setAttribute('numOctaves', '6');
    feTurbulence.setAttribute('seed', '2');
    feTurbulence.setAttribute('result', 'noise');
    
    // 2. 将噪点灰度化
    const feColorMatrix1 = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
    feColorMatrix1.setAttribute('in', 'noise');
    feColorMatrix1.setAttribute('type', 'saturate');
    feColorMatrix1.setAttribute('values', '0');
    feColorMatrix1.setAttribute('result', 'grayNoise');
    
    // 3. 对比度调整
    const contrastIntensity = grainContrast / 100;
    const contrastSlope = 1 + contrastIntensity * 6;
    const contrastIntercept = -0.5 * (contrastSlope - 1);
    
    const feComponentTransfer1 = document.createElementNS('http://www.w3.org/2000/svg', 'feComponentTransfer');
    feComponentTransfer1.setAttribute('in', 'grayNoise');
    feComponentTransfer1.setAttribute('result', 'contrastNoise');
    
    const feFuncR1 = document.createElementNS('http://www.w3.org/2000/svg', 'feFuncR');
    feFuncR1.setAttribute('type', 'linear');
    feFuncR1.setAttribute('slope', contrastSlope.toString());
    feFuncR1.setAttribute('intercept', contrastIntercept.toString());
    feComponentTransfer1.appendChild(feFuncR1);
    
    // 4. 限制噪点到图形区域
    const feComposite1 = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
    feComposite1.setAttribute('in', 'contrastNoise');
    feComposite1.setAttribute('in2', 'SourceAlpha');
    feComposite1.setAttribute('operator', 'in');
    feComposite1.setAttribute('result', 'clippedNoise');
    
    // 5. 创建径向渐变高光
    const radialGradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
    radialGradient.setAttribute('id', 'highlight-gradient');
    radialGradient.setAttribute('cx', '50%');
    radialGradient.setAttribute('cy', '50%');
    const highlightRadius = 20 + (grainHighlight / 100) * 60;
    radialGradient.setAttribute('r', `${highlightRadius}%`);
    
    const highlightStops = [
        { offset: '0%', color: '#ffffff', opacity: 0.6 },
        { offset: '40%', color: '#e0e0e0', opacity: 0.4 },
        { offset: '70%', color: '#888888', opacity: 0.2 },
        { offset: '100%', color: '#000000', opacity: 0.0 }
    ];
    
    highlightStops.forEach(stop => {
        const stopElement = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stopElement.setAttribute('offset', stop.offset);
        stopElement.setAttribute('stop-color', stop.color);
        stopElement.setAttribute('stop-opacity', stop.opacity);
        radialGradient.appendChild(stopElement);
    });
    
    defs.appendChild(radialGradient);
    
    // 6-10. 应用高光渐变和混合效果
    const feFlood = document.createElementNS('http://www.w3.org/2000/svg', 'feFlood');
    feFlood.setAttribute('flood-color', 'url(#highlight-gradient)');
    feFlood.setAttribute('result', 'highlightColor');
    
    const feComposite2 = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
    feComposite2.setAttribute('in', 'highlightColor');
    feComposite2.setAttribute('in2', 'SourceAlpha');
    feComposite2.setAttribute('operator', 'in');
    feComposite2.setAttribute('result', 'highlightMask');
    
    const feBlend1 = document.createElementNS('http://www.w3.org/2000/svg', 'feBlend');
    feBlend1.setAttribute('mode', 'soft-light');
    feBlend1.setAttribute('in', 'clippedNoise');
    feBlend1.setAttribute('in2', 'SourceGraphic');
    feBlend1.setAttribute('result', 'softGrain');
    
    const feBlend2 = document.createElementNS('http://www.w3.org/2000/svg', 'feBlend');
    feBlend2.setAttribute('mode', 'screen');
    feBlend2.setAttribute('in', 'highlightMask');
    feBlend2.setAttribute('in2', 'softGrain');
    feBlend2.setAttribute('result', 'withHighlight');
    
    const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    feGaussianBlur.setAttribute('in', 'clippedNoise');
    feGaussianBlur.setAttribute('stdDeviation', '0.5');
    feGaussianBlur.setAttribute('result', 'blurredNoise');
    
    const feComponentTransfer2 = document.createElementNS('http://www.w3.org/2000/svg', 'feComponentTransfer');
    feComponentTransfer2.setAttribute('in', 'withHighlight');
    feComponentTransfer2.setAttribute('result', 'final');
    
    const finalContrast = 1.0 + contrastIntensity * 0.5;
    const finalBrightness = 0.1 * contrastIntensity;
    
    ['R', 'G', 'B'].forEach(channel => {
        const feFunc = document.createElementNS('http://www.w3.org/2000/svg', `feFunc${channel}`);
        feFunc.setAttribute('type', 'linear');
        feFunc.setAttribute('slope', finalContrast.toString());
        feFunc.setAttribute('intercept', finalBrightness.toString());
        feComponentTransfer2.appendChild(feFunc);
    });
    
    const feFuncA = document.createElementNS('http://www.w3.org/2000/svg', 'feFuncA');
    feFuncA.setAttribute('type', 'identity');
    feComponentTransfer2.appendChild(feFuncA);
    
    filter.appendChild(feTurbulence);
    filter.appendChild(feColorMatrix1);
    filter.appendChild(feComponentTransfer1);
    filter.appendChild(feGaussianBlur);
    filter.appendChild(feComposite1);
    filter.appendChild(feFlood);
    filter.appendChild(feComposite2);
    filter.appendChild(feBlend1);
    filter.appendChild(feBlend2);
    filter.appendChild(feComponentTransfer2);
    
    defs.appendChild(filter);
    glyphGroup.appendChild(defs);

    for(let copyIndex = 0; copyIndex < copies; copyIndex++){
        const radius = bitmapFont.parameters.radius - copyIndex * bitmapFont.parameters.copies.offset.scale

        for(let i = 0; i < columns; i++){
            for(let k = 0; k < rows; k++){
                const rowCount = k * rows;
                const colCount = i
                const pixelIndex = rowCount + colCount;
                const currentPixel = currentLetter[pixelIndex]
                
                if(currentPixel !== 1) continue;

                const x = i * gridUnitWidth + gridUnitWidth/2
                const y = k * gridUnitHeight + gridUnitHeight/2

                const pixel = renderPixel(x, y, radius, copyIndex)
                
                // 🔥 关键修复：强制应用 fontColor
                const fontColor = bitmapFont.parameters.fontColor || '#ffffff';
                
                // 直接设置 SVG 元素的颜色属性
                const lines = pixel.querySelectorAll('line, circle, path, rect, ellipse');
                lines.forEach(element => {
                    if (element.hasAttribute('stroke') && element.getAttribute('stroke') === 'currentColor') {
                        element.setAttribute('stroke', fontColor);
                    }
                    if (element.hasAttribute('fill') && element.getAttribute('fill') === 'currentColor') {
                        element.setAttribute('fill', fontColor);
                    }
                });
                
                // 设置 group 的 color（作为备用）
                pixel.style.color = fontColor;
                
                // 应用磨砂效果
                if (grainContrast > 0) {
                    pixel.setAttribute('filter', 'url(#grain-filter)');
                }

                glyphGroup.appendChild(pixel)
            }
        }
        const grid = renderGrid()
        glyphGroup.appendChild(grid)
    }

    return glyphGroup
}


const renderText = () => {

    const text = bitmapFont.preview.text
    
    const spacing = bitmapFont.parameters.spacing;
    const maxWidth = 2000;
    
    const width = maxWidth - bitmapFont.parameters.width + 200;
    
    const characterWidth = width + spacing;
    const height = bitmapFont.parameters.height;
    const layout = bitmapFont.parameters.layout || 'left';

    // 🔥 新增：获取 size 缩放比例
    const sizeScale = (bitmapFont.parameters.size || 100) / 100;

    svgText.innerHTML = "";
    const textGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // 🔥 关键：应用整体 size 缩放到文本组
    textGroup.setAttribute('transform', `scale(${sizeScale})`);
    textGroup.setAttribute('transform-origin', '0 0');
    
    // 根据布局类型进行不同的渲染
    if (layout === 'circular') {
        // 圆形路径布局：文字围绕圆形路径排列（忽略换行符）
        const textWithoutNewlines = text.replace(/\n/g, ' ');
        const radius = Math.max(height * 1.5, textWithoutNewlines.length * characterWidth / (2 * Math.PI));
        const viewWidth = radius * 2 + width * 2;
        const viewHeight = radius * 2 + height * 2;
        
        // 🔥 修改：viewBox 考虑 size 缩放
        svgText.setAttribute('viewBox', `0 0 ${viewWidth} ${viewHeight}`);
        
        textWithoutNewlines.split("").forEach((character, i) => {
            const glyph = renderGlyph(character);
            const angle = (i / textWithoutNewlines.length) * Math.PI * 2 - Math.PI / 2;
            const x = viewWidth / 2 + Math.cos(angle) * radius;
            const y = viewHeight / 2 + Math.sin(angle) * radius;
            const rotation = (angle * 180 / Math.PI) + 90;
            
            const transform = `translate(${x - width/2}, ${y - height/2}) rotate(${rotation}, ${width/2}, ${height/2})`;
            glyph.setAttribute('transform', transform);
            textGroup.appendChild(glyph);
        });
        
    } else if (layout === 'square') {
        // 方形路径布局：文字沿着方形边缘排列（忽略换行符）
        const textWithoutNewlines = text.replace(/\n/g, ' ');
        const perimeter = textWithoutNewlines.length * characterWidth;
        const sideLength = perimeter / 4;
        const viewWidth = sideLength + width * 2;
        const viewHeight = sideLength + height * 2;
        
        // 🔥 修改：viewBox 考虑 size 缩放
        svgText.setAttribute('viewBox', `0 0 ${viewWidth} ${viewHeight}`);
        
        let currentDistance = 0;
        
        textWithoutNewlines.split("").forEach((character, i) => {
            const glyph = renderGlyph(character);
            let x, y, rotation;
            
            if (currentDistance < sideLength) {
                // 顶边（从左到右）
                x = width + currentDistance;
                y = height;
                rotation = 0;
            } else if (currentDistance < sideLength * 2) {
                // 右边（从上到下）
                x = viewWidth - width;
                y = height + (currentDistance - sideLength);
                rotation = 90;
            } else if (currentDistance < sideLength * 3) {
                // 底边（从右到左）
                x = viewWidth - width - (currentDistance - sideLength * 2);
                y = viewHeight - height;
                rotation = 180;
            } else {
                // 左边（从下到上）
                x = width;
                y = viewHeight - height - (currentDistance - sideLength * 3);
                rotation = 270;
            }
            
            const transform = `translate(${x - width/2}, ${y - height/2}) rotate(${rotation}, ${width/2}, ${height/2})`;
            glyph.setAttribute('transform', transform);
            textGroup.appendChild(glyph);
            
            currentDistance += characterWidth;
        });
        
    } else {
        // 左对齐、右对齐、居中对齐 - 支持多行
        const lines = text.split('\n');
        const maxLineLength = Math.max(...lines.map(line => line.length));
        const totalWidth = maxLineLength * characterWidth;
        const lineHeight = height * 1.5;
        const totalHeight = lines.length * lineHeight;
        
        lines.forEach((line, lineIndex) => {
            const lineWidth = line.length * characterWidth;
            let lineOffset = spacing / 2;
            
            // 根据对齐方式计算行偏移
            if (layout === 'center') {
                lineOffset = (totalWidth - lineWidth) / 2;
            } else if (layout === 'right') {
                lineOffset = totalWidth - lineWidth;
            }
            
            line.split("").forEach((character, charIndex) => {
                const glyph = renderGlyph(character);
                const x = lineOffset + charIndex * characterWidth;
                const y = lineIndex * lineHeight;
                
                const transform = `translate(${x}, ${y})`;
                glyph.setAttribute('transform', transform);
                textGroup.appendChild(glyph);
            });
        });
    }
    
    svgText.appendChild(textGroup);
}


const inputField = document.getElementById('input-text')
const typingSection = document.getElementById('typing')
const typeInput = document.getElementById('type-input') // 新增: 控制面板的type输入框

// 自动调整textarea高度
const autoResizeTextarea = () => {
    inputField.style.height = 'auto';
    inputField.style.height = inputField.scrollHeight + 'px';
}

// 点击SVG显示区域时聚焦到输入框
typingSection.addEventListener('click', () => {
    inputField.focus()
})

// 防抖函数用于输入文本
function debounceTextInput(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 防抖渲染文本 - 增加延迟以提高流畅度
const debouncedRenderText = debounceTextInput(() => {
    renderText();
}, 200); // 增加到200ms，提高打字流畅度

inputField.oninput = (e) => {
    // 停止自动播放动画
    if (window.autoPlayAnimationInterval) {
        clearInterval(window.autoPlayAnimationInterval);
        window.autoPlayAnimationInterval = null;
        console.log('Auto-play animation stopped due to user input');
    }

    bitmapFont.preview.text = e.currentTarget.value
    // 同步更新控制面板的输入框
    if (typeInput) {
        typeInput.value = e.currentTarget.value
    }
    autoResizeTextarea()
    debouncedRenderText() // 使用防抖渲染
}

// 新增: 控制面板type输入框的事件监听
if (typeInput) {
    // 自动调整typeInput的高度
    const autoResizeTypeInput = () => {
        typeInput.style.height = 'auto';
        typeInput.style.height = typeInput.scrollHeight + 'px';
    }
    
    typeInput.oninput = (e) => {
        // 停止自动播放动画
        if (window.autoPlayAnimationInterval) {
            clearInterval(window.autoPlayAnimationInterval);
            window.autoPlayAnimationInterval = null;
            console.log('Auto-play animation stopped due to user input');
        }

        const newValue = e.currentTarget.value
        bitmapFont.preview.text = newValue
        // 同步更新主输入框
        inputField.value = newValue
        autoResizeTextarea()
        autoResizeTypeInput() // 自动调整控制面板输入框高度
        debouncedRenderText() // 使用防抖渲染
    }

    // 支持Enter键换行
    typeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            const cursorPos = e.target.selectionStart
            const textBefore = e.target.value.substring(0, cursorPos)
            const textAfter = e.target.value.substring(cursorPos)
            const newValue = textBefore + '\n' + textAfter
            e.target.value = newValue
            e.target.selectionStart = e.target.selectionEnd = cursorPos + 1
            
            // 同步主输入框并触发渲染
            inputField.value = newValue
            bitmapFont.preview.text = newValue
            autoResizeTextarea()
            autoResizeTypeInput() // 自动调整控制面板输入框高度
            debouncedRenderText()
        }
    })
}

// 支持Enter键换行
inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault()
        const cursorPos = e.target.selectionStart
        const textBefore = e.target.value.substring(0, cursorPos)
        const textAfter = e.target.value.substring(cursorPos)
        e.target.value = textBefore + '\n' + textAfter
        e.target.selectionStart = e.target.selectionEnd = cursorPos + 1
        
        // 触发input事件更新显示
        bitmapFont.preview.text = e.target.value
        autoResizeTextarea()
        debouncedRenderText() // 使用防抖渲染
    }
})

// Now after creating this, we can to add it to the element:
// const previewElement = document.getElementById("preview")
// previewElement.appendChild(svg)
window.addEventListener('keydown', (event) => {

    // Currently typed key
    const typedCharacter = event.key
    bitmapFont.preview.character = typedCharacter // 移除 .toUpperCase()

    // First remove previous Glyph
    emptyCanvas()

    // Render new glyph
    renderText()

})

// 添加布局切换事件监听
const layoutSelect = document.getElementById('layout-select')
if (layoutSelect) {
    layoutSelect.onchange = (e) => {
        bitmapFont.parameters.layout = e.currentTarget.value
        renderText()
    }
}

// 🔥 完全重写：根据不同 render mode 的动画配置
const renderModeAnimations = {
    'radial': {
        rotation: { type: 'continuous', speed: 5 },
        axisCount: { type: 'pulse', min: 12, max: 48 },
        centerCircleSize: { type: 'fast', min: 20, max: 50 }
    },
    'sphereGrid': {
        rotation: { type: 'continuous', speed: 3 },
        axisCount: { type: 'triangle', min: 24, max: 48 },
        axisStrokeWidth: { type: 'fast', min: 10, max: 30 }
    },
    'twistedRadial': {
        rotation: { type: 'continuous', speed: 8 },
        centerCircleSize: { type: 'pulse', min: 20, max: 60 }
    },
    'spiralSquare': {
        rotation: { type: 'continuous', speed: 6 },
        axisCount: { type: 'slow', min: 20, max: 40 }
    },
    'radialCheckerboard': {
        rotation: { type: 'pendulum', range: 90 },
        axisCount: { type: 'wave', min: 16, max: 32 }
    },
    'waveCircle': {
        axisCount: { type: 'wave', min: 8, max: 24 },
        axisStrokeWidth: { type: 'pulse', min: 5, max: 25 }
    },
    'twistedGrid': {
        rotation: { type: 'continuous', speed: 4 },
        axisCount: { type: 'saw', min: 24, max: 48 }
    },
    'radialFan': {
        rotation: { type: 'continuous', speed: 7 },
        axisCount: { type: 'fast', min: 12, max: 36 }
    }
};

// 🔥 新增：波形生成函数
const getWaveValue = (step, type, min, max, speed = 1) => {
    const range = max - min;
    const t = (step * speed) % 100 / 100;
    
    switch(type) {
        case 'continuous': // 持续旋转
            return (step * speed) % 360;
        case 'slow': // 慢速正弦波
            return min + range * (Math.sin(t * Math.PI * 2) + 1) / 2;
        case 'fast': // 快速正弦波
            return min + range * (Math.sin(t * Math.PI * 4) + 1) / 2;
        case 'pulse': // 脉冲式（绝对值正弦）
            return min + range * Math.abs(Math.sin(t * Math.PI * 2));
        case 'triangle': // 三角波
            return min + range * (1 - Math.abs((t % 1) * 2 - 1));
        case 'saw': // 锯齿波
            return min + range * (t % 1);
        case 'pendulum': // 钟摆式（单次正弦）
            return Math.sin(t * Math.PI * 2) * (max - min) / 2;
        case 'wave': // 平滑波浪
            return min + range * Math.pow(Math.sin(t * Math.PI), 2);
        default:
            return min + range * t;
    }
};

// 🔥 修复：右上角播放键的动态播放功能
const playAnimationBtn = document.getElementById('play-animation-btn');
let isAnimationPlaying = false;
let animationIntervalId = null;

// 播放动画函数
const playAnimation = () => {
    if (isAnimationPlaying) {
        // 停止动画
        clearInterval(animationIntervalId);
        animationIntervalId = null;
        isAnimationPlaying = false;
        playAnimationBtn.classList.remove('playing');
        console.log('Animation stopped');
    } else {
        // 开始动画
        isAnimationPlaying = true;
        playAnimationBtn.classList.add('playing');
        console.log('Animation started');
        
        // 🔥 新增：获取当前 render mode 的动画配置
        const currentRenderMode = bitmapFont.parameters.renderMode || 'radial';
        const animConfig = renderModeAnimations[currentRenderMode] || renderModeAnimations['radial'];
        
        console.log(`Using animation config for render mode: ${currentRenderMode}`, animConfig);
        
        // 循环动画
        let step = 0;
        animationIntervalId = setInterval(() => {
            step += 1;
            
            // 🔥 根据配置动态改变参数
            if (animConfig.rotation) {
                const config = animConfig.rotation;
                bitmapFont.parameters.rotation = getWaveValue(
                    step, 
                    config.type, 
                    config.min || 0, 
                    config.max || 360, 
                    config.speed || 1
                );
                
                // 更新滑块
                const rotationSlider = document.getElementById('rotation');
                if (rotationSlider) {
                    rotationSlider.value = bitmapFont.parameters.rotation;
                }
            }
            
            if (animConfig.axisCount) {
                const config = animConfig.axisCount;
                bitmapFont.parameters.axisCount = Math.round(getWaveValue(
                    step, 
                    config.type, 
                    config.min, 
                    config.max
                ));
                
                // 更新滑块
                const axisCountSlider = document.getElementById('axisCount');
                if (axisCountSlider) {
                    axisCountSlider.value = bitmapFont.parameters.axisCount;
                }
            }
            
            if (animConfig.axisStrokeWidth) {
                const config = animConfig.axisStrokeWidth;
                bitmapFont.parameters.axisStrokeWidth = getWaveValue(
                    step, 
                    config.type, 
                    config.min, 
                    config.max
                );
                
                // 更新滑块
                const strokeWidthSlider = document.getElementById('axisStrokeWidth');
                if (strokeWidthSlider) {
                    strokeWidthSlider.value = bitmapFont.parameters.axisStrokeWidth;
                }
            }
            
            if (animConfig.centerCircleSize) {
                const config = animConfig.centerCircleSize;
                bitmapFont.parameters.centerCircleSize = getWaveValue(
                    step, 
                    config.type, 
                    config.min, 
                    config.max
                );
                
                // 更新滑块
                const centerCircleSlider = document.getElementById('centerCircleSize');
                if (centerCircleSlider) {
                    centerCircleSlider.value = bitmapFont.parameters.centerCircleSize;
                }
            }
            
            // 重新渲染
            renderText();
        }, 50); // 每 50ms 更新一次（20 FPS）
    }
};

// 绑定播放按钮事件
if (playAnimationBtn) {
    playAnimationBtn.addEventListener('click', playAnimation);
}
