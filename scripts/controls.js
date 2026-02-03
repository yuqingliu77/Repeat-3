// 防抖函数 - 优化性能
function debounce(func, wait) {
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

// 节流函数 - 限制执行频率
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 完整渲染函数
const fullRender = () => {
    emptyCanvas();
    renderGrid();
    renderText();
    updatePreview();
};

// 立即更新标签，延迟渲染的函数 - 增加延遲時間以提高性能
const debouncedRender = debounce(fullRender, 200); // 增加到200ms，提高流畅度

// 节流渲染 - 拖动时提供即时反馈，但限制频率
const throttledRender = throttle(fullRender, 150); // 增加到150ms，减少渲染频率

// 1. Config for controls
const controlsNumber = [
    {
        label: 'Letter Spacing',
        min: 0,
        max: 1000,
        path: 'parameters.spacing',
    },
    {
        label: 'Width',
        min: 200,
        max: 2000,
        path: 'parameters.width',
    },
    {
        label: 'Size',
        min: 50,
        max: 1000,
        step: 10,
        path: 'parameters.size',
    },
    {
        label: 'Radius',
        min: 20,
        max: 500,
        path: 'parameters.radius',
    },
    {
        label: 'Axis Count',
        min: 4,
        max: 72,
        path: 'parameters.axisCount',
    },
    {
        label: 'Axis Stroke Width',
        min: 1,
        max: 50,
        path: 'parameters.axisStrokeWidth',
    },
    {
        label: 'Center Circle Size',
        min: 0,
        max: 100,
        path: 'parameters.centerCircleSize',
    },
    {
        label: 'Copies',
        min: 1,
        max: 30,
        path: 'parameters.copies.count',
    },
    {
        label: 'Copy Offset Scale',
        min: -10,
        max: 20,
        path: 'parameters.copies.offset.scale',
    },
    {
        label: 'Copy Offset X',
        min: -100,
        max: 100,
        path: 'parameters.copies.offset.x',
    },
    {
        label: 'Copy Offset Y',
        min: -100,
        max: 100,
        path: 'parameters.copies.offset.y',
    },
    {
        label: 'Rotation',
        min: 0,
        max: 360,
        path: 'parameters.rotation',
    }
    // 🔥 移除：Gradient Angle（该参数在当前代码中未使用）
]

// 渲染模式选择 - 移除3D Effects分组
const controlsSelect = [
    {
        label: 'Render Mode',
        path: 'parameters.renderMode',
        groups: [
            {
                label: 'Basic Radial',
                options: [
                    { value: 'radial', label: 'Radial Lines' },
                    { value: 'variableLengthRadial', label: 'Variable Length' },
                    { value: 'twistedRadial', label: 'Twisted Radial' }
                ]
            },
            {
                label: 'Grid Patterns',
                options: [
                    { value: 'sphereGrid', label: 'Sphere Grid' },
                    { value: 'twistedGrid', label: 'Twisted Grid' }
                ]
            },
            {
                label: 'Circle Patterns',
                options: [
                    { value: 'waveCircle', label: 'Wave Circle' },
                    { value: 'waveOverlap', label: 'Wave Overlap' },
                    { value: 'ellipseOverlap', label: 'Ellipse Overlap' }
                ]
            },
            {
                label: 'Square Patterns',
                options: [
                    { value: 'spiralSquare', label: 'Spiral Square' },
                    { value: 'concentricSquare', label: 'Concentric Square' }
                ]
            },
            {
                label: 'Checkerboard & Fan',
                options: [
                    { value: 'radialCheckerboard', label: 'Radial Checkerboard' },
                    { value: 'waveCheckerboard', label: 'Wave Checkerboard' },
                    { value: 'radialFan', label: 'Radial Fan' }
                ]
            },
            {
                label: 'Complex Overlap',
                options: [
                    { value: 'scaleOverlap', label: 'Scale Overlap' },
                    { value: 'mirrorOverlap', label: 'Mirror Overlap' }
                ]
            }
        ]
    },
    {
        label: 'Layout',
        path: 'parameters.layout',
        options: [
            { value: 'left', label: 'Left Align', icon: 'left' },
            { value: 'right', label: 'Right Align', icon: 'right' },
            { value: 'center', label: 'Center Align', icon: 'center' },
            { value: 'circular', label: 'Circular Path', icon: 'circular' },
            { value: 'square', label: 'Square Path', icon: 'square' }
        ]
    }
]

// 2. 删除 Show Grid 控制
const controlsSwitch = []

// Helper function to update preview in control panel
// 🔥 修改：更新预览 - 动态显示输入文本的第一个字符
const updatePreview = () => {
    const previewSvg = document.getElementById('svg-preview');
    if (!previewSvg) return;
    
    previewSvg.innerHTML = '';
    
    // 🔥 关键修改：从当前输入文本获取第一个字符
    const inputText = bitmapFont.preview.text || '';
    const character = inputText.charAt(0) || 'A'; // 如果没有输入，默认显示 'A'
    const currentLetter = bitmapFont.glyphs[character] || bitmapFont.glyphs['.notdef'];
    
    const previewGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    previewGroup.setAttribute('transform', 'translate(500, 100)');
    
    // 只渲染字体，不添加同心圆和文字
    for (let i = 0; i < 5; i++) {
        for (let k = 0; k < 5; k++) {
            const pixelIndex = k * 5 + i;
            const currentPixel = currentLetter[pixelIndex];
            
            if (currentPixel !== 1) continue;
            
            const x = (i - 2) * 40;
            const y = (k - 2) * 40;
            
            const pixel = renderPixel(x, y, 15, 0);
            previewGroup.appendChild(pixel);
        }
    }
    
    previewSvg.appendChild(previewGroup);
}

// 🔥 新增：放大镜功能 - 在主视图上添加鼠标悬停监听
const initMagnifier = () => {
    const svgText = document.getElementById('svg-text');
    const svgPreview = document.getElementById('svg-preview');
    const typingArea = document.getElementById('typing');
    
    if (!svgText || !svgPreview || !typingArea) return;
    
    // 确保放大镜状态已初始化
    if (!window.magnifierState) {
        window.magnifierState = {
            zoom: 12,
            mouseX: 0,
            mouseY: 0,
            isActive: false
        };
    }
    
    // 鼠标移动时捕获位置并显示放大区域
    typingArea.addEventListener('mousemove', (e) => {
        window.magnifierState.isActive = true;
        window.magnifierState.mouseX = e.clientX;
        window.magnifierState.mouseY = e.clientY;
        
        updateMagnifier();
    });
    
    // 鼠标离开时隐藏放大镜
    typingArea.addEventListener('mouseleave', () => {
        window.magnifierState.isActive = false;
        resetMagnifier();
    });
};

// 🔥 修改：优化放大镜显示内容 - 显示更微观的局部细节
const updateMagnifier = () => {
    const svgText = document.getElementById('svg-text');
    const svgPreview = document.getElementById('svg-preview');
    
    if (!svgText || !svgPreview || !window.magnifierState.isActive) return;
    
    // 🔥 修改：隐藏同心圆和文字
    const centerCircles = document.getElementById('center-circles');
    if (centerCircles) centerCircles.style.display = 'none';
    
    const circularText = document.getElementById('circular-text');
    if (circularText) circularText.style.display = 'none';
    
    // 获取主 SVG 的位置和尺寸
    const svgRect = svgText.getBoundingClientRect();
    const viewBox = svgText.getAttribute('viewBox');
    if (!viewBox) return;
    
    const [vbX, vbY, vbWidth, vbHeight] = viewBox.split(' ').map(parseFloat);
    
    // 计算鼠标在 SVG 坐标系中的位置
    const mouseRelativeX = window.magnifierState.mouseX - svgRect.left;
    const mouseRelativeY = window.magnifierState.mouseY - svgRect.top;
    
    const svgMouseX = vbX + (mouseRelativeX / svgRect.width) * vbWidth;
    const svgMouseY = vbY + (mouseRelativeY / svgRect.height) * vbHeight;
    
    // 🔥 关键修改：更小的视图窗口，显示更微观的细节
    const zoom = window.magnifierState.zoom; // 12x
    const magnifierWidth = vbWidth / zoom;
    const magnifierHeight = vbHeight / zoom;
    
    // 🔥 精确计算：以鼠标位置为绝对中心
    const magX = svgMouseX - magnifierWidth / 2;
    const magY = svgMouseY - magnifierHeight / 2;
    
    // 克隆主 SVG 的内容到预览区域
    svgPreview.innerHTML = '';
    
    const clonedContent = svgText.cloneNode(true);
    
    // 移除不需要的元素（如输入框）
    const inputElements = clonedContent.querySelectorAll('foreignObject');
    inputElements.forEach(el => el.remove());
    
    // 将克隆的内容移动到预览 SVG
    while (clonedContent.firstChild) {
        svgPreview.appendChild(clonedContent.firstChild);
    }
    
    // 🔥 设置预览区域的 viewBox 为精确的局部放大区域
    svgPreview.setAttribute('viewBox', `${magX} ${magY} ${magnifierWidth} ${magnifierHeight}`);
    svgPreview.setAttribute('preserveAspectRatio', 'xMidYMid meet');
};

// Applied controls to dom - 先渲染select，再渲染range sliders
const controlWrapper = document.getElementById('controls')

// 先添加 select controls (Render Mode)
controlsSelect.forEach((control) => {
    const initialValue = _.get(bitmapFont, control.path)
    
    const select = document.createElement('select')
    select.id = control.path
    
    if (control.groups) {
        control.groups.forEach(group => {
            const optgroup = document.createElement('optgroup')
            optgroup.label = group.label
            
            group.options.forEach(option => {
                const optionElement = document.createElement('option')
                optionElement.value = option.value
                optionElement.textContent = option.label
                if (option.value === initialValue) {
                    optionElement.selected = true
                }
                optgroup.appendChild(optionElement)
            })
            
            select.appendChild(optgroup)
        })
    } else if (control.options) {
        control.options.forEach(option => {
            const optionElement = document.createElement('option')
            optionElement.value = option.value
            optionElement.textContent = option.label
            if (option.value === initialValue) {
                optionElement.selected = true
            }
            select.appendChild(optionElement)
        })
    }
    
    select.onchange = (e) => {
        const value = e.currentTarget.value
        _.set(bitmapFont, control.path, value)
        
        // 使用完整渲染函数
        fullRender()
        
        label.innerHTML = control.label + ` [${value}]`
    }
    
    const label = document.createElement('label')
    label.innerHTML = control.label + ` [${initialValue}]`
    label.htmlFor = control.path
    
    controlWrapper.appendChild(label)
    
    // 🔥 特殊处理：Layout 控制使用按钮组而不是下拉菜单
    if (control.path === 'parameters.layout') {
        const buttonGroup = document.createElement('div')
        buttonGroup.className = 'layout-button-group'
        
        // 生成图标 SVG
        const getLayoutIcon = (type) => {
            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute("width", "20");
            svg.setAttribute("height", "20");
            svg.setAttribute("viewBox", "0 0 20 20");
            svg.style.display = "block";
            
            switch(type) {
                case 'left':
                    // 左对齐：3条横线，左边对齐
                    svg.innerHTML = `
                        <line x1="2" y1="5" x2="14" y2="5" stroke="currentColor" stroke-width="0.8"/>
                        <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" stroke-width="0.8"/>
                        <line x1="2" y1="15" x2="12" y2="15" stroke="currentColor" stroke-width="0.8"/>
                    `;
                    break;
                case 'right':
                    // 右对齐：3条横线，右边对齐
                    svg.innerHTML = `
                        <line x1="6" y1="5" x2="18" y2="5" stroke="currentColor" stroke-width="0.8"/>
                        <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" stroke-width="0.8"/>
                        <line x1="8" y1="15" x2="18" y2="15" stroke="currentColor" stroke-width="0.8"/>
                    `;
                    break;
                case 'center':
                    // 居中对齐：3条横线，居中
                    svg.innerHTML = `
                        <line x1="5" y1="5" x2="15" y2="5" stroke="currentColor" stroke-width="0.8"/>
                        <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" stroke-width="0.8"/>
                        <line x1="6" y1="15" x2="14" y2="15" stroke="currentColor" stroke-width="0.8"/>
                    `;
                    break;
                case 'circular':
                    // 圆形路径：弧形线条表示圆形路径
                    svg.innerHTML = `
                        <path d="M 10 3 A 7 7 0 0 1 17 10" stroke="currentColor" stroke-width="0.8" fill="none"/>
                        <path d="M 17 10 A 7 7 0 0 1 10 17" stroke="currentColor" stroke-width="0.8" fill="none"/>
                        <path d="M 10 17 A 7 7 0 0 1 3 10" stroke="currentColor" stroke-width="0.8" fill="none"/>
                        <path d="M 3 10 A 7 7 0 0 1 10 3" stroke="currentColor" stroke-width="0.8" fill="none"/>
                    `;
                    break;
                case 'square':
                    // 方形路径：4条边的线条
                    svg.innerHTML = `
                        <line x1="4" y1="4" x2="16" y2="4" stroke="currentColor" stroke-width="0.8"/>
                        <line x1="16" y1="4" x2="16" y2="16" stroke="currentColor" stroke-width="0.8"/>
                        <line x1="16" y1="16" x2="4" y2="16" stroke="currentColor" stroke-width="0.8"/>
                        <line x1="4" y1="16" x2="4" y2="4" stroke="currentColor" stroke-width="0.8"/>
                    `;
                    break;
            }
            
            return svg;
        };
        
        control.options.forEach(option => {
            const button = document.createElement('button')
            button.className = 'layout-button'
            button.dataset.value = option.value
            button.title = option.label
            
            // 强制设置内联样式以覆盖所有可能的边框
            button.style.border = 'none';
            button.style.outline = 'none';
            button.style.background = 'none';
            button.style.boxShadow = 'none';
            button.style.padding = '0';
            button.style.margin = '0';
            
            // 添加SVG图标
            const icon = getLayoutIcon(option.icon);
            button.appendChild(icon);
            
            if (option.value === initialValue) {
                button.classList.add('active')
            }
            
            button.onclick = () => {
                // 移除所有按钮的 active 状态
                buttonGroup.querySelectorAll('.layout-button').forEach(btn => {
                    btn.classList.remove('active')
                })
                // 添加当前按钮的 active 状态
                button.classList.add('active')
                
                // 更新参数
                _.set(bitmapFont, control.path, option.value)
                
                // 使用完整渲染函数
                fullRender()
                
                label.innerHTML = control.label + ` [${option.label}]`
            }
            
            buttonGroup.appendChild(button)
        })
        
        controlWrapper.appendChild(buttonGroup)
    } else {
        controlWrapper.appendChild(select)
    }
})

// 再添加 range slider controls
controlsNumber.forEach((control) => {
    const initialValue = _.get(bitmapFont, control.path)
    
    const input = document.createElement('input')
    input.type = "range"
    input.min = control.min
    input.max = control.max
    input.step = control.step || 1
    input.value = initialValue
    input.id = control.path
    
    // 强制 LTR 方向
    input.setAttribute('dir', 'ltr');
    input.style.direction = 'ltr';
    input.style.transform = 'none';
    
    // 添加调试信息（特别针对 spacing 和 width）
    if (control.path === 'parameters.spacing' || control.path === 'parameters.width') {
        console.log(`=== ${control.label} Debug ===`);
        console.log(`Min: ${control.min}, Max: ${control.max}, Initial: ${initialValue}`);
        console.log(`Slider direction: ${input.style.direction}`);
        console.log(`Slider transform: ${input.style.transform}`);
    }
    
    input.oninput = (e) => {
        const value = parseFloat(e.currentTarget.value)
        
        _.set(bitmapFont, control.path, value)
        label.innerHTML = control.label + ` [${value.toFixed(control.step ? 1 : 0)}]`
        
        // 🔥 性能优化：拖动时使用节流渲染
        if (control.path === 'parameters.rotation') {
            updateRotationOnly(value); // Rotation只更新transform
        } else {
            throttledRender(); // 使用节流，限制渲染频率
        }
    }
    
    // 🔥 新增：滑块释放时进行最终的完整渲染
    input.onchange = (e) => {
        const value = parseFloat(e.currentTarget.value)
        _.set(bitmapFont, control.path, value)
        
        // 滑块释放后，确保完整渲染一次
        if (control.path !== 'parameters.rotation') {
            fullRender();
        }
    }
    
    const label = document.createElement('label')
    const displayValue = initialValue ? initialValue.toFixed(control.step ? 1 : 0) : initialValue
    label.innerHTML = control.label + ` [${displayValue}]`
    label.htmlFor = control.path
    
    controlWrapper.appendChild(label)
    controlWrapper.appendChild(input)
    
    // 🔥 新增：为 Rotation, Axis Stroke Width, Axis Count 添加自动播放功能
    if (control.path === 'parameters.rotation' || 
        control.path === 'parameters.axisStrokeWidth' || 
        control.path === 'parameters.axisCount') {
        
        // 初始化全局状态跟踪对象
        if (!window.paramAnimationStates) {
            window.paramAnimationStates = {};
        }
        
        let isAutoPlaying = false;
        let autoPlayInterval = null;
        let direction = 1; // 1 = 增加, -1 = 减少
        
        // 初始化该参数的状态
        window.paramAnimationStates[control.path] = { isPlaying: false };
        
        label.style.cursor = 'pointer';
        label.style.userSelect = 'none';
        label.title = '点击开始/停止循环播放';
        
        label.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (!isAutoPlaying) {
                // 开始自动播放
                isAutoPlaying = true;
                label.style.fontWeight = 'bold';
                window.paramAnimationStates[control.path].isPlaying = true;
                
                const min = parseFloat(control.min);
                const max = parseFloat(control.max);
                const step = control.step || 1;
                
                // 🔥 Rotation 特殊处理：连续旋转，不来回
                const isRotation = control.path === 'parameters.rotation';
                
                autoPlayInterval = setInterval(() => {
                    let currentValue = _.get(bitmapFont, control.path);
                    
                    if (isRotation) {
                        // Rotation：连续旋转 0-360 循环
                        currentValue += step * 5; // 旋转速度 5x
                        if (currentValue >= max) {
                            currentValue = 0; // 循环回 0
                        }
                    } else {
                        // 其他参数：来回播放
                        currentValue += direction * step * 2;
                        
                        if (currentValue >= max) {
                            currentValue = max;
                            direction = -1;
                        } else if (currentValue <= min) {
                            currentValue = min;
                            direction = 1;
                        }
                    }
                    
                    _.set(bitmapFont, control.path, currentValue);
                    input.value = currentValue;
                    label.innerHTML = control.label + ` [${currentValue.toFixed(control.step ? 1 : 0)}]`;
                    
                    // 🔥 Rotation 优化：只更新 transform，不重新渲染
                    if (isRotation) {
                        updateRotationOnly(currentValue);
                    } else {
                        emptyCanvas();
                        renderGrid();
                        renderText();
                        updatePreview();
                    }
                }, 50); // 50ms 更新一次
                
            } else {
                // 停止自动播放
                isAutoPlaying = false;
                label.style.fontWeight = 'normal';
                window.paramAnimationStates[control.path].isPlaying = false;
                
                if (autoPlayInterval) {
                    clearInterval(autoPlayInterval);
                    autoPlayInterval = null;
                }
            }
        });
    }
})

// 🔥 新增：优化的旋转更新函数 - 只修改 CSS transform，不重新渲染
function updateRotationOnly(rotationValue) {
    const svgText = document.getElementById('svg-text');
    if (!svgText) return;
    
    // 查找所有需要旋转的 group 元素
    const allGroups = svgText.querySelectorAll('g[id="glyph-group"] > g');
    
    allGroups.forEach(group => {
        // 提取当前的 translate 值
        const currentTransform = group.style.transform;
        const translateMatch = currentTransform.match(/translate\(([\d.]+)px,\s*([\d.]+)px\)/);
        
        if (translateMatch) {
            const x = parseFloat(translateMatch[1]);
            const y = parseFloat(translateMatch[2]);
            
            // 计算新的旋转角度（保持交替旋转逻辑）
            const indexSeed = Math.floor(x / 100) + Math.floor(y / 100);
            const direction = indexSeed % 2 === 0 ? 1 : -1;
            const finalRotation = rotationValue * direction;
            
            // 🔥 关键：只更新 transform，避免重排（reflow）
            group.style.transform = `translate(${x}px, ${y}px) rotate(${finalRotation}deg)`;
        }
    });
}

// Applied switch controls
controlsSwitch.forEach((control) => {
    const initialValue = _.get(bitmapFont, control.path)
    
    const input = document.createElement('input')
    input.type = "checkbox"
    input.defaultChecked = initialValue
    input.id = control.path
    
    input.oninput = (e) => {
        const value = e.currentTarget.checked
        _.set(bitmapFont, control.path, value)
        
        if(control.path === 'parameters.showGrid'){
            if(value){
                svgText.classList.add('showGrid')
            }else{
                svgText.classList.remove('showGrid')
            }
        } else {
            // 重新渲染
            emptyCanvas()
            renderGrid()
            renderText()
            updatePreview()
        }
        
        label.innerHTML = control.label + ` [${value}]`
    }
    
    const label = document.createElement('label')
    label.innerHTML = control.label + ` [${_.get(bitmapFont, control.path)}]`
    label.htmlFor = control.path
    
    controlWrapper.appendChild(label)
    controlWrapper.appendChild(input)
})

// Initialize preview
setTimeout(() => {
    updatePreview()
    initMagnifier()
    initBackgroundToggle() // 初始化背景色切换
}, 100)

// Toggle controls functionality
const toggleBtn = document.getElementById('toggle-controls')
const showBtn = document.getElementById('show-controls-btn')
const aside = document.getElementById('aside')
const mainArea = document.getElementById('main')
const container = document.getElementById('container')
let controlsVisible = true

const showControls = () => {
    if (!controlsVisible) {
        controlsVisible = true
        aside.classList.remove('hidden')
        container.classList.remove('controls-hidden')
        showBtn.classList.remove('visible')
    }
}

const hideControls = () => {
    if (controlsVisible) {
        controlsVisible = false
        aside.classList.add('hidden')
        container.classList.add('controls-hidden')
        showBtn.classList.add('visible')
    }
}

toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    hideControls()
})

// 修改:右下角按钮支持toggle功能（显示/隐藏）
showBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    if (controlsVisible) {
        hideControls()
    } else {
        showControls()
    }
})

// 修改：点击字体显示区域时自动收起controls面板
const typingArea = document.getElementById('typing')
if (typingArea) {
    typingArea.addEventListener('click', (e) => {
        // 只有在点击SVG显示区域时收起，不影响输入框
        if (e.target.closest('#input-text')) {
            return
        }
        hideControls()
    })
}

aside.addEventListener('click', (e) => {
    e.stopPropagation()
})

// Create radial lines for show button
const createRadialButton = () => {
    const radialGroup = document.getElementById('radial-lines')
    if (!radialGroup) return
    
    const numLines = 24
    const centerX = 50
    const centerY = 50
    const innerRadius = 20
    const outerRadius = 45
    
    for (let i = 0; i < numLines; i++) {
        const angle = (i / numLines) * Math.PI * 2
        const x1 = centerX + Math.cos(angle) * innerRadius
        const y1 = centerY + Math.sin(angle) * innerRadius
        const x2 = centerX + Math.cos(angle) * outerRadius
        const y2 = centerY + Math.sin(angle) * outerRadius
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        line.setAttribute('x1', x1)
        line.setAttribute('y1', y1)
        line.setAttribute('x2', x2)
        line.setAttribute('y2', y2)
        line.setAttribute('stroke', 'currentColor')
        line.setAttribute('stroke-width', '2')
        line.setAttribute('stroke-linecap', 'round')
        
        radialGroup.appendChild(line)
    }
}

createRadialButton()

// 修复:右侧纵向渐变色条 - 确保主視圖字體顏色更新
const colorGradientBar = document.getElementById('color-gradient-bar');

if (colorGradientBar) {
    const getGradientArea = () => {
        const barRect = colorGradientBar.getBoundingClientRect();
        const gradientHeight = 250;
        const top = barRect.top + (barRect.height - gradientHeight) / 2;
        return {
            top: top,
            bottom: top + gradientHeight,
            height: gradientHeight
        };
    };
    
    const getColorAtPosition = (percentage) => {
        const stops = [
            { pos: 0, color: [255, 255, 255] },      // 白色
            { pos: 0.10, color: [255, 0, 0] },       // 纯红
            { pos: 0.20, color: [255, 102, 0] },     // 橙色
            { pos: 0.30, color: [255, 204, 0] },     // 黄色
            { pos: 0.40, color: [0, 255, 0] },       // 纯绿
            { pos: 0.50, color: [0, 255, 255] },     // 青色
            { pos: 0.60, color: [0, 102, 255] },     // 蓝色
            { pos: 0.70, color: [102, 0, 255] },     // 靛色
            { pos: 0.80, color: [204, 0, 255] },     // 紫色
            { pos: 0.90, color: [255, 0, 153] },     // 品红
            { pos: 1.0, color: [0, 0, 0] }           // 黑色
        ];
        
        let lowerStop = stops[0];
        let upperStop = stops[stops.length - 1];
        
        for (let i = 0; i < stops.length - 1; i++) {
            if (percentage >= stops[i].pos && percentage <= stops[i + 1].pos) {
                lowerStop = stops[i];
                upperStop = stops[i + 1];
                break;
            }
        }
        
        const range = upperStop.pos - lowerStop.pos;
        const rangePercentage = range === 0 ? 0 : (percentage - lowerStop.pos) / range;
        
        const r = Math.round(lowerStop.color[0] + (upperStop.color[0] - lowerStop.color[0]) * rangePercentage);
        const g = Math.round(lowerStop.color[1] + (upperStop.color[1] - lowerStop.color[1]) * rangePercentage);
        const b = Math.round(lowerStop.color[2] + (upperStop.color[2] - lowerStop.color[2]) * rangePercentage);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };
    
    const updateFontColorFromBar = (e) => {
        const gradientArea = getGradientArea();
        const y = e.clientY;
        
        if (y < gradientArea.top || y > gradientArea.bottom) {
            return;
        }
        
        const relativeY = y - gradientArea.top;
        const percentage = Math.max(0, Math.min(1, relativeY / gradientArea.height));
        
        const color = getColorAtPosition(percentage);
        
        // 🔥 关键修复1：更新参数
        bitmapFont.parameters.fontColor = color;
        
        // 🔥 关键修复2：立即强制重新渲染（绕过防抖，确保立即生效）
        requestAnimationFrame(() => {
            emptyCanvas();
            renderGrid();
            renderText();
            updatePreview();
            
            // 强制刷新所有 SVG 元素的颜色
            const svgText = document.getElementById('svg-text');
            if (svgText) {
                const allShapes = svgText.querySelectorAll('line, circle, path, rect, ellipse');
                allShapes.forEach(element => {
                    if (element.getAttribute('stroke') === 'currentColor') {
                        element.setAttribute('stroke', color);
                    }
                    if (element.getAttribute('fill') === 'currentColor') {
                        element.setAttribute('fill', color);
                    }
                });
            }
        });
        
        console.log('✅ Font color updated to:', color);
    };
    
    colorGradientBar.addEventListener('click', updateFontColorFromBar);
    
    let isDragging = false;
    
    colorGradientBar.addEventListener('mousedown', (e) => {
        const gradientArea = getGradientArea();
        const y = e.clientY;
        
        if (y >= gradientArea.top && y <= gradientArea.bottom) {
            isDragging = true;
            updateFontColorFromBar(e);
        }
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            updateFontColorFromBar(e);
        }
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

// 初始化:同步右侧背景色和文字颜色
const initialBgColor = bitmapFont.parameters.backgroundColor || '#ffffff';
const initialTextColor = initialBgColor === '#ffffff' ? '#000000' : '#ffffff';

const mainElement = document.getElementById('main');
const asideElement = document.getElementById('aside');
const rightBar = document.getElementById('color-gradient-bar');

mainElement.style.backgroundColor = initialBgColor;
asideElement.style.backgroundColor = initialBgColor;
asideElement.style.color = initialTextColor;

if (rightBar) {
    rightBar.style.backgroundColor = initialBgColor;
}

// 初始化所有label、button、select的颜色
const labels = asideElement.querySelectorAll('label, button, select, h2, option, optgroup');
labels.forEach(el => {
    el.style.color = initialTextColor;
    el.style.backgroundColor = initialBgColor;
});

// 🔥 新增：初始化底部装饰圆的背景色
const bottomDecorations = document.querySelectorAll('.decoration-circle-left, .decoration-circle-right');
bottomDecorations.forEach(circle => {
    circle.style.backgroundColor = initialBgColor;
});

// 初始化滑块颜色：轨道与背景同色，圆点与文字同色
const styleId = 'slider-thumb-style';
let styleEl = document.getElementById(styleId);
if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
}
styleEl.textContent = `
    #aside input[type="range"]::-webkit-slider-runnable-track {
        background: ${initialBgColor} !important;
    }
    #aside input[type="range"]::-webkit-slider-thumb {
        background: ${initialTextColor} !important;
    }
    #aside input[type="range"]::-moz-range-track {
        background: ${initialBgColor} !important;
    }
    #aside input[type="range"]::-moz-range-thumb {
        background: ${initialTextColor} !important;
    }
`;

// 初始化边框颜色
const initialBorderColor = initialBgColor === '#ffffff' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)';
asideElement.style.borderColor = initialBorderColor;

// 初始化十字装饰线颜色
const crossDecorations = document.querySelectorAll('.cross-decoration');
crossDecorations.forEach(cross => {
    cross.style.color = initialTextColor;
});

// 新增:下载按钮功能 - PNG 和 SVG 两种格式
const btnDownloadFont = document.getElementById('btn-download-font');
const btnDownloadGif = document.getElementById('btn-download-gif');

// 🔥 新增：下载格式选择弹窗
if (btnDownloadFont) {
    btnDownloadFont.addEventListener('click', () => {
        // 创建格式选择弹窗
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: 'Courier New', Courier, monospace;
        `;
        
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: ${bitmapFont.parameters.backgroundColor || '#000'};
            color: ${bitmapFont.parameters.backgroundColor === '#ffffff' ? '#000' : '#fff'};
            padding: 40px;
            border: 1px solid currentColor;
            text-align: center;
        `;
        
        const title = document.createElement('h3');
        title.textContent = 'Select Download Format';
        title.style.cssText = 'margin: 0 0 30px 0; font-size: 18px; font-weight: normal;';
        
        const buttonGroup = document.createElement('div');
        buttonGroup.style.cssText = 'display: flex; gap: 20px; margin-bottom: 20px;';
        
        // SVG 按钮
        const svgBtn = document.createElement('button');
        svgBtn.textContent = 'SVG (Vector)';
        svgBtn.style.cssText = `
            padding: 15px 30px;
            background: none;
            color: currentColor;
            border: 1px solid currentColor;
            cursor: pointer;
            font-family: inherit;
            font-size: 14px;
            transition: opacity 0.3s;
        `;
        svgBtn.onmouseover = () => svgBtn.style.opacity = '0.6';
        svgBtn.onmouseout = () => svgBtn.style.opacity = '1';
        svgBtn.onclick = () => {
            document.body.removeChild(modal);
            downloadSVG();
        };
        
        // PNG 按钮
        const pngBtn = document.createElement('button');
        pngBtn.textContent = 'PNG (Raster)';
        pngBtn.style.cssText = `
            padding: 15px 30px;
            background: none;
            color: currentColor;
            border: 1px solid currentColor;
            cursor: pointer;
            font-family: inherit;
            font-size: 14px;
            transition: opacity 0.3s;
        `;
        pngBtn.onmouseover = () => pngBtn.style.opacity = '0.6';
        pngBtn.onmouseout = () => pngBtn.style.opacity = '1';
        pngBtn.onclick = () => {
            document.body.removeChild(modal);
            downloadPNG();
        };
        
        // 取消按钮
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.cssText = `
            padding: 10px 20px;
            background: none;
            color: currentColor;
            border: 1px solid currentColor;
            cursor: pointer;
            font-family: inherit;
            font-size: 12px;
            opacity: 0.6;
            transition: opacity 0.3s;
        `;
        cancelBtn.onmouseover = () => cancelBtn.style.opacity = '1';
        cancelBtn.onmouseout = () => cancelBtn.style.opacity = '0.6';
        cancelBtn.onclick = () => document.body.removeChild(modal);
        
        buttonGroup.appendChild(svgBtn);
        buttonGroup.appendChild(pngBtn);
        
        dialog.appendChild(title);
        dialog.appendChild(buttonGroup);
        dialog.appendChild(cancelBtn);
        modal.appendChild(dialog);
        document.body.appendChild(modal);
        
        // 点击背景关闭
        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        };
    });
}

// 🔥 SVG 下载函数 - 完全重写，最简单的方案
function downloadSVG() {
    const svgElement = document.getElementById('svg-text');
    if (!svgElement) {
        alert('找不到 SVG 元素');
        return;
    }
    
    console.log('🎨 开始导出 SVG');
    
    // 🔥 步骤1：深度克隆
    const clone = svgElement.cloneNode(true);
    
    // 🔥 步骤2：只移除交互元素
    clone.querySelectorAll('foreignObject').forEach(el => el.remove());
    const svgPreview = clone.querySelector('#svg-preview');
    if (svgPreview) svgPreview.remove();
    
    // 🔥 步骤3：验证结构
    const glyphGroup = clone.querySelector('#glyph-group');
    if (!glyphGroup) {
        alert('导出失败：找不到字体数据');
        return;
    }
    
    console.log('✅ #glyph-group 存在，子元素:', glyphGroup.children.length);
    
    // 🔥 步骤4：设置命名空间
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    
    // 🔥 步骤5：保留 viewBox
    const viewBox = clone.getAttribute('viewBox') || svgElement.getAttribute('viewBox') || '0 0 2000 2000';
    clone.setAttribute('viewBox', viewBox);
    
    // 🔥 步骤6：递归替换 currentColor（不修改 transform）
    const fontColor = bitmapFont.parameters.fontColor || '#ffffff';
    
    const replaceCurrentColor = (element) => {
        if (!element || element.nodeType !== 1) return;
        
        // 只替换颜色，不碰 transform 和 style
        if (element.hasAttribute('stroke') && element.getAttribute('stroke') === 'currentColor') {
            element.setAttribute('stroke', fontColor);
        }
        if (element.hasAttribute('fill') && element.getAttribute('fill') === 'currentColor') {
            element.setAttribute('fill', fontColor);
        }
        
        // 递归处理子元素
        Array.from(element.children).forEach(child => replaceCurrentColor(child));
    };
    
    replaceCurrentColor(clone);
    
    // 🔥 步骤7：序列化
    const serializer = new XMLSerializer();
    let svgData = serializer.serializeToString(clone);
    
    if (!svgData.startsWith('<?xml')) {
        svgData = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgData;
    }
    
    // 🔥 步骤8：验证
    const hasGlyphGroup = svgData.includes('id="glyph-group"');
    const elementCount = (svgData.match(/<g /g) || []).length;
    
    console.log('🔍 验证:');
    console.log(`   - glyph-group: ${hasGlyphGroup ? '✅' : '❌'}`);
    console.log(`   - <g> 元素: ${elementCount}`);
    console.log(`   - 文件大小: ${(svgData.length / 1024).toFixed(2)} KB`);
    
    if (!hasGlyphGroup || elementCount < 5) {
        alert('警告：SVG 可能不完整！');
    }
    
    // 🔥 步骤9：下载
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    
    const text = bitmapFont.preview.text.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
    const renderMode = bitmapFont.parameters.renderMode || 'radial';
    const timestamp = Date.now();
    downloadLink.download = `repeat3-${text}-${renderMode}-${timestamp}.svg`;
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
    
    console.log('✅ SVG 已下载！');
}

// 🔥 PNG 下载函数 - 完全重写，透明背景
function downloadPNG() {
    const svgElementOriginal = document.getElementById('svg-text');
    const svgElement = svgElementOriginal.cloneNode(true);
    
    // scaling svg to fit graphic\
    svgElement.setAttribute('viewBox', '0 0 14000 4000');
    
    const child =svgElement.childNodes[0]

    console.log(child)
    
   child.setAttribute('transform', 'translate(600, 600) scale(1.1) ');

    if (!svgElement) {
        alert('找不到 SVG 元素');
        return;
    }
    
    console.log('🎨 开始导出 PNG（透明背景）');
    
    // 获取 viewBox
    const viewBox = svgElement.getAttribute('viewBox');
    if (!viewBox) {
        alert('SVG viewBox 未设置');
        return;
    }
    
    const [vbX, vbY, vbWidth, vbHeight] = viewBox.split(' ').map(parseFloat);
    
    // 🔥 高分辨率输出（4x）
    const scale = 4;
    const canvas = document.createElement('canvas');
    canvas.width = vbWidth * scale;
    canvas.height = vbHeight * scale;
    const ctx = canvas.getContext('2d', { 
        alpha: true,  // 🔥 启用透明通道
        willReadFrequently: false 
    });
    
    console.log(`   画布尺寸: ${canvas.width}x${canvas.height}`);
    
    // 🔥 步骤1：克隆并清理
    const clone = svgElement.cloneNode(true);
    
    clone.querySelectorAll('foreignObject').forEach(el => el.remove());
    const svgPreview = clone.querySelector('#svg-preview');
    if (svgPreview) svgPreview.remove();
    
    // 🔥 步骤2：替换 currentColor
    const fontColor = bitmapFont.parameters.fontColor || '#ffffff';
    
    const replaceColors = (element) => {
        if (!element || element.nodeType !== 1) return;
        
        if (element.hasAttribute('stroke') && element.getAttribute('stroke') === 'currentColor') {
            element.setAttribute('stroke', fontColor);
        }
        if (element.hasAttribute('fill') && element.getAttribute('fill') === 'currentColor') {
            element.setAttribute('fill', fontColor);
        }
        
        Array.from(element.children).forEach(child => replaceColors(child));
    };
    
    replaceColors(clone);
    
    // 🔥 步骤3：设置命名空间和 viewBox
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    clone.setAttribute('viewBox', viewBox);
    
    // 🔥 步骤4：序列化
    const svgData = new XMLSerializer().serializeToString(clone);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    console.log('   ✅ SVG 数据:', (svgBlob.size / 1024).toFixed(2), 'KB');
    
    // 🔥 步骤5：使用 Image 加载
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
        console.log('   ✅ 图片加载成功');
        
        try {
            // 🔥 关键：清空 canvas（透明背景）
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 🔥 设置缩放
            ctx.scale(scale, scale);
            
            // 🔥 绘制 SVG（保留透明背景）
            ctx.drawImage(img, vbX, vbY, vbWidth, vbHeight);
            
            console.log('   ✅ 图片绘制完成');
            
            // 🔥 转换为 PNG
            canvas.toBlob((blob) => {
                if (!blob) {
                    alert('PNG 生成失败');
                    URL.revokeObjectURL(url);
                    return;
                }
                
                console.log('   ✅ PNG 生成成功:', (blob.size / 1024).toFixed(2), 'KB');
                
                // 下载
                const pngUrl = URL.createObjectURL(blob);
                const downloadLink = document.createElement('a');
                downloadLink.href = pngUrl;
                
                const text = bitmapFont.preview.text.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
                const renderMode = bitmapFont.parameters.renderMode || 'radial';
                const timestamp = Date.now();
                downloadLink.download = `repeat3-${text}-${renderMode}-${timestamp}.png`;
                
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                
                URL.revokeObjectURL(url);
                URL.revokeObjectURL(pngUrl);
                
                console.log('✅ PNG 已下载！');
            }, 'image/png', 1.0);
            
        } catch (error) {
            console.error('❌ Canvas 错误:', error);
            alert('PNG 导出失败：' + error.message);
            URL.revokeObjectURL(url);
        }
    };
    
    img.onerror = (error) => {
        console.error('❌ 图片加载失败:', error);
        
        // 🔥 新增：尝试直接使用 fetch 加载 SVG
        console.log('🔄 尝试备用方案...');
        
        fetch(url)
            .then(response => response.text())
            .then(svgText => {
                console.log('   ✅ SVG 文本获取成功');
                console.log('   内容预览:', svgText.substring(0, 200));
                
                // 创建新的 Image 并重试
                const img2 = new Image();
                img2.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.scale(scale, scale);
                    ctx.drawImage(img2, vbX, vbY, vbWidth, vbHeight);
                    
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const pngUrl = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = pngUrl;
                            link.download = `repeat3-backup-${Date.now()}.png`;
                            link.click();
                            URL.revokeObjectURL(pngUrl);
                            console.log('✅ 备用方案成功！');
                        }
                    }, 'image/png');
                };
                
                img2.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText);
            })
            .catch(fetchError => {
                console.error('❌ 备用方案失败:', fetchError);
                alert('PNG 导出失败\n\n请确保：\n1. 通过 HTTP 服务器访问项目\n2. 使用 Chrome 或 Firefox 浏览器\n3. SVG 内容完整');
            })
            .finally(() => {
                URL.revokeObjectURL(url);
            });
    };
    
    img.src = url;
}

// 新增：页面加载时自动播放 *3 的各种render mode效果
window.addEventListener('load', () => {
    // 等待页面完全加载
    setTimeout(() => {
        // 设置文本为 *3
        const inputField = document.getElementById('input-text');
        if (inputField) {
            inputField.value = '*3';
            bitmapFont.preview.text = '*3';
        }
        
        // 【艺术精华版】节奏感 + 独特性 + 前10秒完美！
        // 每个效果精心设计参数，体现render mode特性，过渡自然有趣
        const renderModeConfigs = [
            
            // ========== 前10秒：黄金开场，节奏强烈！ ==========
            
            // 1. 【0-3秒】细线螺旋 - 从虚无到实体，螺旋加速旋转 ✨
            // 特点：细线(6-14)展现spiralLines精致感，螺旋旋转体现mode特性
            { 
                mode: 'spiralLines', 
                startRadius: 40, endRadius: 150, 
                startAxis: 8, endAxis: 28, 
                startCopies: 1, endCopies: 3, 
                startRotation: 0, endRotation: 540, // 1.5圈，螺旋感
                rotationStyle: 'spiral', // 螺旋式旋转，完美契合mode
                startOffset: 8, endOffset: 22,
                startOffsetX: 0, endOffsetX: 0,
                startOffsetY: 0, endOffsetY: 0,
                startCenterCircle: 15, endCenterCircle: 25,
                startStrokeWidth: 6, endStrokeWidth: 14 // 细到中粗，优雅变化
            },
            
            // 2. 【3-6秒】镜像交叠 - 爆发式展开，镜像差值冲击 �
            // 特点：小到大爆发(30-160)，双倍加速旋转体现镜像动感
            { 
                mode: 'mirrorOverlap', 
                startRadius: 30, endRadius: 160, 
                startAxis: 8, endAxis: 34, 
                startCopies: 2, endCopies: 3, 
                startRotation: 0, endRotation: 720, // 2圈，快速旋转
                rotationStyle: 'double', // 双倍加速，镜像交错感
                startOffset: 6, endOffset: 26,
                startOffsetX: 0, endOffsetX: 0,
                startOffsetY: 0, endOffsetY: 0,
                startCenterCircle: 12, endCenterCircle: 22,
                startStrokeWidth: 8, endStrokeWidth: 15
            },
            
            // 3. 【6-9秒】同心圆环 - 中心圆脉冲呼吸，圆环扩散 �
            // 特点：中心圆10-50巨大脉冲，体现concentricRings核心特性
            { 
                mode: 'concentricRings', 
                startRadius: 60, endRadius: 140, 
                startAxis: 14, endAxis: 30, 
                startCopies: 2, endCopies: 3, 
                startRotation: 0, endRotation: 360, 
                rotationStyle: 'continuous', // 持续旋转，圆环流动
                startOffset: 10, endOffset: 22,
                startOffsetX: 0, endOffsetX: 0,
                startOffsetY: 0, endOffsetY: 0,
                startCenterCircle: 10, endCenterCircle: 50, // 巨大脉冲！记忆点
                startStrokeWidth: 9, endStrokeWidth: 13
            },
            
            // 4. 【9-12秒】椭圆交叠 - XY对角舞蹈，波浪式旋转 🌀
            // 特点：±35 XY移动，wave旋转体现椭圆流动感
            { 
                mode: 'ellipseOverlap', 
                startRadius: 70, endRadius: 145, 
                startAxis: 16, endAxis: 32, 
                startCopies: 2, endCopies: 3, 
                startRotation: 0, endRotation: 450, 
                rotationStyle: 'wave', // 波浪旋转，椭圆流动
                startOffset: 12, endOffset: 24,
                startOffsetX: -35, endOffsetX: 35, // 对角移动
                startOffsetY: -35, endOffsetY: 35, // 创造椭圆轨迹
                startCenterCircle: 14, endCenterCircle: 24,
                startStrokeWidth: 10, endStrokeWidth: 14
            },
            
            // ========== 10-21秒：形状对比组，展现多样性 ==========
            
            // 5. 【12-15秒】缩放交叠 - Y轴垂直移动，缩放变形
            // 新增：替代radial齿轮，展现scaleOverlap独特性
            { 
                mode: 'scaleOverlap', 
                startRadius: 90, endRadius: 160, 
                startAxis: 20, endAxis: 36, 
                startCopies: 2, endCopies: 3, 
                startRotation: 45, endRotation: 495,
                rotationStyle: 'continuous',
                startOffset: 16, endOffset: 28,
                startOffsetX: 0, endOffsetX: 0,
                startOffsetY: -40, endOffsetY: 40,
                startCenterCircle: 14, endCenterCircle: 28,
                startStrokeWidth: 10, endStrokeWidth: 14
            },
            
            // 6. 【15-18秒】点阵图案 - 从点到面，螺旋式爆发
            // 特点：45-170展开，螺旋旋转，小圆点(8-16)体现dotPattern
            { 
                mode: 'dotPattern', 
                startRadius: 45, endRadius: 170, 
                startAxis: 12, endAxis: 38, 
                startCopies: 1, endCopies: 3, 
                startRotation: 0, endRotation: 540, 
                rotationStyle: 'spiral',
                startOffset: 9, endOffset: 28,
                startOffsetX: 0, endOffsetX: 0,
                startOffsetY: 0, endOffsetY: 0,
                startCenterCircle: 8, endCenterCircle: 16,
                startStrokeWidth: 10, endStrokeWidth: 14
            },
            
            // 7. 【18-21秒】波纹交叠 - 波浪扩散，流动美感
            // 特点：wave旋转，中等strokeWidth体现波纹线条
            { 
                mode: 'waveOverlap', 
                startRadius: 55, endRadius: 155, 
                startAxis: 14, endAxis: 34, 
                startCopies: 2, endCopies: 3, 
                startRotation: -90, endRotation: 450,
                rotationStyle: 'wave',
                startOffset: 11, endOffset: 25,
                startOffsetX: 0, endOffsetX: 0,
                startOffsetY: 0, endOffsetY: 0,
                startCenterCircle: 12, endCenterCircle: 22,
                startStrokeWidth: 10, endStrokeWidth: 14
            },
            
            // 8. 【21-24秒】球体网格 - 网格收缩，球体质感
            // 新增：替代radialFan齿轮，展现sphereGrid独特性
            { 
                mode: 'sphereGrid', 
                startRadius: 140, endRadius: 100, 
                startAxis: 30, endAxis: 22, 
                startCopies: 3, endCopies: 2, 
                startRotation: 180, endRotation: 0,
                rotationStyle: 'decelerate',
                startOffset: 24, endOffset: 18,
                startOffsetX: 0, endOffsetX: 0,
                startOffsetY: 0, endOffsetY: 0,
                startCenterCircle: 18, endCenterCircle: 28,
                startStrokeWidth: 10, endStrokeWidth: 14
            },
            
                       
            // 9. 【24-27秒】螺旋方形 - 方形持续旋转，棱角分明
            // 特点：continuous旋转，中粗线条(11-14)体现方形硬朗
            { 
                mode: 'spiralSquare', 
                startRadius: 55, endRadius: 135, 
                startAxis: 14, endAxis:  29, 
                startCopies: 2, endCopies: 3, 
                startRotation: 45, endRotation: 585,
                rotationStyle: 'continuous',
                startOffset: 11, endOffset: 23,
                startOffsetX: 0, endOffsetX: 0,
                startOffsetY: 0, endOffsetY: 0,
                startCenterCircle: 15, endCenterCircle: 25,
                startStrokeWidth: 11, endStrokeWidth: 14
            },
            
            // 10. 【27-30秒】波纹圆形 - 圆形波动，流畅旋转
            // 新增：waveCircle展现圆形特性
            { 
                mode: 'waveCircle', 
                startRadius: 90, endRadius: 150, 
                startAxis: 20, endAxis: 32, 
                startCopies: 2, endCopies: 3, 
                startRotation: 0, endRotation: 360,
                rotationStyle: 'wave',
                startOffset: 16, endOffset: 26,
                startOffsetX: 0, endOffsetX: 0,
                startOffsetY: 0, endOffsetY: 0,
                startCenterCircle: 16, endCenterCircle: 26,
                startStrokeWidth: 10, endStrokeWidth: 14
            },
            
            // 11. 【30-33秒】扭曲网格 - 加速扭曲，网格变形
            // 特点：accelerate加速旋转，体现twistedGrid扭曲感
            { 
                mode: 'twistedGrid', 
                startRadius: 75, endRadius: 125, 
                startAxis: 17, endAxis: 27, 
                startCopies: 2, endCopies: 3, 
                startRotation: 0, endRotation: 360, 
                rotationStyle: 'accelerate',
                startOffset: 14, endOffset: 23,
                startOffsetX: 0, endOffsetX: 0,
                startOffsetY: 0, endOffsetY: 0,
                startCenterCircle: 17, endCenterCircle: 25,
                startStrokeWidth: 10, endStrokeWidth: 14
            },
            
            // 12. 【33-34秒】波纹棋盘 - 1秒快闪，视觉冲击！
            // 特点：保守参数，1秒展示，避免卡顿
            { 
                mode: 'waveCheckerboard', 
                startRadius: 90, endRadius: 120,
                startAxis: 20, endAxis: 26,
                startCopies: 2, endCopies: 3, 
                startRotation: 0, endRotation: 180,
                rotationStyle: 'continuous',
                startOffset: 16, endOffset: 22,
                startOffsetX: -25, endOffsetX: 25,
                startOffsetY: 0, endOffsetY: 0,
                startCenterCircle: 18, endCenterCircle: 24,
                startStrokeWidth: 10, endStrokeWidth: 13
            },
            
            // 13. 【34-35秒】径向棋盘 - 1秒快闪，棋盘对比！
            { 
                mode: 'radialCheckerboard', 
                startRadius: 85, endRadius: 125,
                startAxis: 19, endAxis: 27,
                startCopies: 2, endCopies: 3, 
                startRotation: 0, endRotation: 135,
                rotationStyle: 'continuous',
                startOffset: 15, endOffset: 23,
                startOffsetX: 0, endOffsetX: 0,
                startOffsetY: 0, endOffsetY: 0,
                startCenterCircle: 18, endCenterCircle: 24,
                startStrokeWidth: 10, endStrokeWidth: 13
            },
            
            // 14. 【35-38秒】同心方形 - 反向旋转收缩，方形呼应
            // 特点：reverse反向，从大到小，与开场圆形对比
            { 
                mode: 'concentricSquare', 
                startRadius: 140, endRadius: 75, 
                startAxis: 30, endAxis: 17, 
                startCopies: 3, endCopies: 2, 
                startRotation: 270, endRotation: 0,
                rotationStyle: 'reverse',



                startOffset: 24, endOffset: 14,
                startOffsetX: 0, endOffsetX: 0,
                startOffsetY: 0, endOffsetY: 0,
                startCenterCircle: 18, endCenterCircle: 30,
                startStrokeWidth: 10, endStrokeWidth: 14
            },
            
            // 15. 【38-41秒】螺旋点 - 持续旋转，温和收尾
            // 特点：moderate参数，continuous旋转，平稳结束准备循环
           
            { 
                mode: 'spiralDots', 
                startRadius: 75, endRadius: 125, 
                startAxis: 17, endAxis:   27, 
                startCopies: 2, endCopies: 3, 
                startRotation: 0, endRotation: 360, 
                rotationStyle: 'continuous',
                startOffset: 15, endOffset: 22,
                startOffsetX: 0, endOffsetX: 0,
                startOffsetY: 0, endOffsetY: 0,
                startCenterCircle: 18, endCenterCircle: 26,
                startStrokeWidth: 10, endStrokeWidth: 14
            }
        ];
        
        // 棋盘格效果特殊时长配置（1秒快闪）
        const specialDurations = {
            'waveCheckerboard': 1000,
            'radialCheckerboard': 1000,
        };
        
        // 流畅优先配置 - 动态时长
        let currentModeIndex = 0;
        
        const getCurrentDuration = () => {
            const currentMode = renderModeConfigs[currentModeIndex].mode;
            return specialDurations[currentMode] || 3000;
        };
        
        let totalDuration = getCurrentDuration();
        let animationFrames = Math.round(totalDuration / 75);
        const frameInterval = 75;
        const transitionFrames = 8;
        
        let animationFrameCount = 0;
        let isTransitioning = false;
        let transitionFrameCount = 0;
        let animationInterval = null;
        
        // 获取当前模式配置
        let currentConfig = renderModeConfigs[currentModeIndex];
        let nextConfig = null;
        
        // 不同的旋转样式
        const getRotation = (progress, config) => {
            const start = config.startRotation;
            const end = config.endRotation;
            const diff = end - start;
            
            switch(config.rotationStyle) {
                case 'continuous': // 持续旋转
                    return start + diff * progress;
                    
                case 'reverse': // 反向旋转
                    return start + diff * progress;
                    
                case 'double': // 双倍加速旋转
                    return start + diff * progress * progress;
                    
                case 'pendulum': // 钟摆式
                    return start + diff * Math.sin(progress * Math.PI);
                    
                case 'wave': // 波浪式
                    return start + diff * (0.5 + 0.5 * Math.sin(progress * Math.PI * 2 - Math.PI / 2));
                    
                case 'accelerate': // 加速
                    return start + diff * Math.pow(progress, 1.5);
                    
                case 'decelerate': // 减速
                    return start + diff * Math.sqrt(progress);
                    
                case 'spiral': // 螺旋式，中间快两端慢
                    return start + diff * (1 - Math.cos(progress * Math.PI)) / 2;
                    
                default:
                    return start + diff * progress;
            }
        };
        
        // 🔥 新增：居中显示配置 - 修复版本
        const centerContent = () => {
            const svgText = document.getElementById('svg-text');
            if (!svgText) return;
            
            // 获取 SVG 容器的实际显示尺寸
            const container = svgText.parentElement;
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            
            // 获取当前文本和参数
            const text = bitmapFont.preview.text;
            const spacing = bitmapFont.parameters.spacing;
            const width = bitmapFont.parameters.width;
            const height = bitmapFont.parameters.height;
            const characterWidth = width + spacing;
            
            // 计算文本内容的实际尺寸（包括圆点的radius扩展）
            const radius = bitmapFont.parameters.radius;
            const maxRadius = radius * 1.5; // 圆点最大半径
            
            // 文本总宽度（最后一个字符不需要spacing）
            const totalTextWidth = text.length * width + (text.length - 1) * spacing;
            
            // 添加左右padding以容纳圆点的半径
            const contentWidth = totalTextWidth + maxRadius * 2;
            const contentHeight = height + maxRadius * 2;
            
            // 🔥 关键：计算缩放比例，确保内容不超出容器且不会太小
            const scaleX = containerWidth / contentWidth;
            const scaleY = containerHeight / contentHeight;
            const scale = Math.min(scaleX, scaleY, 1); // 最大不超过1，避免放大
            
            // 应用缩放后的实际尺寸
            const scaledWidth = contentWidth * scale;
            const scaledHeight = contentHeight * scale;
            
            // 计算居中所需的偏移量
            const paddingX = (containerWidth - scaledWidth) / 2;
            const paddingY = (containerHeight - scaledHeight) / 2;
            
            // 🔥 设置 viewBox：从内容左上角开始，覆盖整个容器
            // viewBox 的逻辑：x, y 是起始点，width, height 是显示范围
            const viewBoxX = -maxRadius - (paddingX / scale);
            const viewBoxY = -maxRadius - (paddingY / scale);
            const viewBoxWidth = containerWidth / scale;
            const viewBoxHeight = containerHeight / scale;
            
            svgText.setAttribute('viewBox', `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`);
            svgText.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        };
        
        // 修改：动画函数中添加居中调用
        const animateMode = () => {
            if (isTransitioning) {
                // 过渡阶段：线性过渡更流畅
                const transitionProgress = transitionFrameCount / transitionFrames;
                
                // 插值计算过渡参数（线性插值，减少计算量）
                bitmapFont.parameters.radius = currentConfig.endRadius + (nextConfig.startRadius - currentConfig.endRadius) * transitionProgress;
                bitmapFont.parameters.axisCount = Math.round(currentConfig.endAxis + (nextConfig.startAxis - currentConfig.endAxis) * transitionProgress);
                bitmapFont.parameters.copies.count = Math.round(currentConfig.endCopies + (nextConfig.startCopies - currentConfig.endCopies) * transitionProgress);
                bitmapFont.parameters.copies.offset.scale = currentConfig.endOffset + (nextConfig.startOffset - currentConfig.endOffset) * transitionProgress;
                bitmapFont.parameters.copies.offset.x = currentConfig.endOffsetX + (nextConfig.startOffsetX - currentConfig.endOffsetX) * transitionProgress;
                bitmapFont.parameters.copies.offset.y = currentConfig.endOffsetY + (nextConfig.startOffsetY - currentConfig.endOffsetY) * transitionProgress;
                bitmapFont.parameters.centerCircleSize = currentConfig.endCenterCircle + (nextConfig.startCenterCircle - currentConfig.endCenterCircle) * transitionProgress;
                bitmapFont.parameters.axisStrokeWidth = currentConfig.endStrokeWidth + (nextConfig.startStrokeWidth - currentConfig.endStrokeWidth) * transitionProgress;
                bitmapFont.parameters.rotation = currentConfig.endRotation + (nextConfig.startRotation - currentConfig.endRotation) * transitionProgress;
                
                transitionFrameCount++;
                
                if (transitionFrameCount >= transitionFrames) {
                    // 过渡完成，切换到新模式
                    isTransitioning = false;
                    transitionFrameCount = 0;
                    currentConfig = nextConfig;
                    bitmapFont.parameters.renderMode = currentConfig.mode;
                    
                    // 切换模式后重新计算时长和帧数
                    totalDuration = getCurrentDuration();
                    animationFrames = Math.round(totalDuration / frameInterval);
                    
                    const renderModeSelect = document.querySelector('select[id="parameters.renderMode"]');
                    if (renderModeSelect) {
                        renderModeSelect.value = currentConfig.mode;
                    }
                }
            } else {
                // 正常动画阶段 - 简化缓动函数
                const progress = animationFrameCount / animationFrames;
                
                // 使用更轻量的缓动函数（easeInOutQuad）
                const easeProgress = progress < 0.5
                    ? 2 * progress * progress
                    : 1 - 2 * (1 - progress) * (1 - progress);
                
                

                
                // 根据配置计算参数
                bitmapFont.parameters.radius = currentConfig.startRadius + (currentConfig.endRadius - currentConfig.startRadius) * easeProgress;
                bitmapFont.parameters.axisCount = Math.round(currentConfig.startAxis + (currentConfig.endAxis - currentConfig.startAxis) * easeProgress);
                bitmapFont.parameters.copies.count = Math.round(currentConfig.startCopies + (currentConfig.endCopies - currentConfig.startCopies) * easeProgress);
                bitmapFont.parameters.copies.offset.scale = currentConfig.startOffset + (currentConfig.endOffset - currentConfig.startOffset) * easeProgress;
                bitmapFont.parameters.copies.offset.x = currentConfig.startOffsetX + (currentConfig.endOffsetX - currentConfig.startOffsetX) * easeProgress;
                bitmapFont.parameters.copies.offset.y = currentConfig.startOffsetY + (currentConfig.endOffsetY - currentConfig.startOffsetY) * easeProgress;
                bitmapFont.parameters.centerCircleSize = currentConfig.startCenterCircle + (currentConfig.endCenterCircle - currentConfig.startCenterCircle) * easeProgress;
                bitmapFont.parameters.axisStrokeWidth = currentConfig.startStrokeWidth + (currentConfig.endStrokeWidth - currentConfig.startStrokeWidth) * easeProgress;
                
                // 使用不同的旋转样式
                bitmapFont.parameters.rotation = getRotation(progress, currentConfig);
                
                animationFrameCount++;
                
                // 动画完成，准备过渡到下一个模式
                if (animationFrameCount >= animationFrames) {
                    animationFrameCount = 0;
                    isTransitioning = true;
                    currentModeIndex = (currentModeIndex + 1) % renderModeConfigs.length;
                    nextConfig = renderModeConfigs[currentModeIndex];
                }
            }
            
            // 渲染
            emptyCanvas();
            renderGrid();
            renderText();
            updatePreview();
            
            // 🔥 关键：每次渲染后重新居中
            centerContent();
        };
        
        // 设置初始模式
        bitmapFont.parameters.renderMode = currentConfig.mode;
        const renderModeSelect = document.querySelector('select[id="parameters.renderMode"]');
        if (renderModeSelect) {
            renderModeSelect.value = currentConfig.mode;
        }
        
        // 开始动画循环
        animationInterval = setInterval(animateMode, frameInterval);
        window.autoPlayAnimationInterval = animationInterval;
        
        // 立即执行一次
        animateMode();
        
        // 🔥 新增：窗口大小改变时重新居中
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (window.autoPlayAnimationInterval) {
                    centerContent();
                }
            }, 100);
        });
    }, 500); // 延迟500ms确保所有元素已加载
});

// 字体显示缩放功能 - 放在文件最末尾
setTimeout(() => {
    console.log('=== 开始初始化缩放功能 ===');
    
    const allCrosses = document.querySelectorAll('.cross-decoration');
    console.log(`🔍 找到 ${allCrosses.length} 个 .cross-decoration 元素`);
    
    const bottomCrosses = Array.from(allCrosses).filter(cross => {
        const hasBottomClass = cross.classList.contains('bottom');
        const parentIsLink = cross.closest('a.cross-decoration-link') !== null;
        
        return hasBottomClass && !parentIsLink;
    });
    
    console.log(`✅ 底部十字（用于缩放）: ${bottomCrosses.length} 个`);
    
    if (bottomCrosses.length < 3) {
        console.warn(`⚠️ 底部十字数量不足: ${bottomCrosses.length}`);
        return;
    }
    
    // 按左右位置排序
    bottomCrosses.sort((a, b) => {
        const rectA = a.getBoundingClientRect();
        const rectB = b.getBoundingClientRect();
        return rectA.left - rectB.left;
    });
    
    const zoomInCross = bottomCrosses[0];      // 左侧 - 放大
    const resetCross = bottomCrosses[1];       // 🔥 中间 - 重置
    const zoomOutCross = bottomCrosses[2];     // 右侧 - 缩小
    
    console.log('✅ 缩放控制:');
    console.log('   左（+）:', zoomInCross);
    console.log('   中（Reset）:', resetCross);
    console.log('   右（-）:', zoomOutCross);
    
    // 🔥 保存初始 size 值
    const initialSize = bitmapFont.parameters.size || 110;
    console.log(`   初始 Size: ${initialSize}`);
    
    // 隐藏底部右侧十字的竖线
    const styleId = 'cross-horizontal-style';
    let styleEl = document.getElementById(styleId);
    
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
    }
    
    styleEl.textContent = `
        .cross-decoration.bottom.right::before {
            display: none !important;
        }
    `;
    
    // 🔥 放大函数
    const zoomIn = (e) => {
        console.log('🔺 触发放大事件');
        e.stopPropagation();
        e.preventDefault();
        
        const currentSize = bitmapFont.parameters.size || 100;
        const newSize = Math.min(1000, currentSize + 10);
        
        bitmapFont.parameters.size = newSize;
        
        const sizeInput = document.querySelector('input[id="parameters.size"]');
        const sizeLabel = document.querySelector('label[for="parameters.size"]');
        
        if (sizeInput) sizeInput.value = newSize;
        if (sizeLabel) sizeLabel.innerHTML = `Size [${newSize}]`;
        
        fullRender();
        
        console.log(`🔺 放大: ${currentSize} → ${newSize}`);
    };
    
    // 🔥 新增：重置函数
    const resetSize = (e) => {
        console.log('🔄 触发重置事件');
        e.stopPropagation();
        e.preventDefault();
        
        const currentSize = bitmapFont.parameters.size;
        bitmapFont.parameters.size = initialSize;
        
        const sizeInput = document.querySelector('input[id="parameters.size"]');
        const sizeLabel = document.querySelector('label[for="parameters.size"]');
        
        if (sizeInput) sizeInput.value = initialSize;
        if (sizeLabel) sizeLabel.innerHTML = `Size [${initialSize}]`;
        
        fullRender();
        
        console.log(`🔄 重置: ${currentSize} → ${initialSize}`);
    };
    
    // 🔥 缩小函数
    const zoomOut = (e) => {
        console.log('🔻 触发缩小事件');
        e.stopPropagation();
        e.preventDefault();
        
        const currentSize = bitmapFont.parameters.size || 100;
        const newSize = Math.max(50, currentSize - 10);
        
        bitmapFont.parameters.size = newSize;
        
        const sizeInput = document.querySelector('input[id="parameters.size"]');
        const sizeLabel = document.querySelector('label[for="parameters.size"]');
        
        if (sizeInput) sizeInput.value = newSize;
        if (sizeLabel) sizeLabel.innerHTML = `Size [${newSize}]`;
        
        fullRender();
        
        console.log(`🔻 缩小: ${currentSize} → ${newSize}`);
    };
    
    const bindClick = (element, handler, label) => {
        element.style.cursor = 'pointer';
        element.style.pointerEvents = 'auto';
        element.style.zIndex = '1000';
        
        element.onclick = handler;
        
        // 🔥 新增：鼠标悬停时显示提示
        element.addEventListener('mouseenter', () => {
            const tooltip = element.querySelector('.cross-tooltip');
            if (tooltip) {
                tooltip.style.opacity = '1';
            }
        });
        
        element.addEventListener('mouseleave', () => {
            const tooltip = element.querySelector('.cross-tooltip');
            if (tooltip) {
                tooltip.style.opacity = '0';
            }
        });
        
        console.log(`   ✅ 已绑定${label}`);
    };
    
    bindClick(zoomInCross, zoomIn, '放大（+）');
    bindClick(resetCross, resetSize, '重置（Reset）');
    bindClick(zoomOutCross, zoomOut, '缩小（-）');
    
    console.log('✅ 缩放功能初始化完成');
}, 1500);

// 🔥 修改：重置放大镜时恢复同心圆和文字显示
const resetMagnifier = () => {
    const svgPreview = document.getElementById('svg-preview');
    if (!svgPreview) return;
    
    // 🔥 关键：强制恢复同心圆和文字的显示
    const centerCircles = document.getElementById('center-circles');
    if (centerCircles) {
        centerCircles.style.display = 'block';
        centerCircles.style.visibility = 'visible';
        centerCircles.style.opacity = '0.6';
    }
    
    const circularText = document.getElementById('circular-text');
    if (circularText) {
        circularText.style.display = 'block';
        circularText.style.visibility = 'visible';
        circularText.style.opacity = '1'; // 🔥 确保文字完全不透明
    }
    
    // 恢复初始视图
    updatePreview();
};

// 🔥 新增：控制右下角按钮的提示文字显示
const showControlsBtn = document.getElementById('show-controls-btn');
const controlsTooltip = document.querySelector('.controls-btn-tooltip');

if (showControlsBtn && controlsTooltip) {
    showControlsBtn.addEventListener('mouseenter', () => {
        controlsTooltip.style.opacity = '1';
    });
    
    showControlsBtn.addEventListener('mouseleave', () => {
        controlsTooltip.style.opacity = '0';
    });
}
