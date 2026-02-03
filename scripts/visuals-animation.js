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
    
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
    });
};

// 初始化自定义光标
createCustomCursor();

// 🔥 新增：波形生成函数（从 script.js 复制）
const getWaveValue = (step, type, min, max, speed = 1) => {
    const range = max - min;
    const t = (step * speed) % 100 / 100;
    
    switch(type) {
        case 'continuous':
            return (step * speed) % 360;
        case 'slow':
            return min + range * (Math.sin(t * Math.PI * 2) + 1) / 2;
        case 'fast':
            return min + range * (Math.sin(t * Math.PI * 4) + 1) / 2;
        case 'pulse':
            return min + range * Math.abs(Math.sin(t * Math.PI * 2));
        case 'triangle':
            return min + range * (1 - Math.abs((t % 1) * 2 - 1));
        case 'saw':
            return min + range * (t % 1);
        case 'pendulum':
            return Math.sin(t * Math.PI * 2) * (max - min) / 2;
        case 'wave':
            return min + range * Math.pow(Math.sin(t * Math.PI), 2);
        default:
            return min + range * t;
    }
};

// 🔥 新增：动画配置（每个字体独立配置）
const animationConfigs = {
    'font-large-u': {
        renderMode: 'radial',
        rotation: { type: 'continuous', speed: 5 },
        axisCount: { type: 'pulse', min: 12, max: 48 }
    },
    'font-word-hallo': {
        renderMode: 'twistedRadial',
        rotation: { type: 'continuous', speed: 8 },
        centerCircleSize: { type: 'fast', min: 20, max: 60 }
    },
    'font-german-a': {
        renderMode: 'sphereGrid',
        rotation: { type: 'continuous', speed: 6 },
        axisCount: { type: 'wave', min: 24, max: 48 }
    },
    'font-german-o': {
        renderMode: 'radialFan',
        rotation: { type: 'continuous', speed: 7 },
        axisCount: { type: 'triangle', min: 16, max: 32 }
    },
    'font-german-ss': {
        renderMode: 'waveCircle',
        axisCount: { type: 'slow', min: 8, max: 24 },
        axisStrokeWidth: { type: 'pulse', min: 10, max: 30 }
    },
    'font-number-1': {
        renderMode: 'twistedGrid',
        rotation: { type: 'continuous', speed: 4 },
        axisCount: { type: 'saw', min: 24, max: 48 }
    },
    'font-number-3': {
        renderMode: 'radialCheckerboard',
        rotation: { type: 'pendulum', range: 90 },
        axisCount: { type: 'wave', min: 16, max: 32 }
    },
    'font-random-r': {
        renderMode: 'spiralSquare',
        rotation: { type: 'continuous', speed: 6 },
        axisCount: { type: 'slow', min: 20, max: 40 }
    },
    'font-random-e': {
        renderMode: 'waveCircle',
        axisCount: { type: 'fast', min: 12, max: 36 },
        axisStrokeWidth: { type: 'wave', min: 10, max: 25 }
    },
    'font-random-p': {
        renderMode: 'radial',
        rotation: { type: 'continuous', speed: 5 },
        centerCircleSize: { type: 'pulse', min: 25, max: 55 }
    },
    'font-random-t': {
        renderMode: 'twistedRadial',
        rotation: { type: 'continuous', speed: 9 },
        centerCircleSize: { type: 'fast', min: 20, max: 50 }
    },
    'font-random-a': {
        renderMode: 'radialFan',
        rotation: { type: 'continuous', speed: 7 },
        axisCount: { type: 'pulse', min: 18, max: 36 }
    },
    'font-random-star': {
        renderMode: 'variableLengthRadial',
        rotation: { type: 'continuous', speed: 8 },
        axisCount: { type: 'triangle', min: 24, max: 48 }
    }
};

// 🔥 新增：静态字体生成函数（简化版，无动画）
const generateStaticFont = (containerSelector, character, renderMode, size) => {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 250 250'); // 🔥 增大 viewBox 以完整显示
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.style.overflow = 'visible'; // 🔥 关键：允许溢出
    
    const tempParams = {
        width: 250,
        height: 250,
        columns: 5,
        rows: 5,
        radius: size,
        renderMode: renderMode,
        axisCount: 36,
        axisStrokeWidth: 15,
        centerCircleSize: 30,
        rotation: 0,
        fontColor: '#ffffff',
        copies: { count: 1, offset: { x: 0, y: 0, scale: 0 } }
    };
    
    const originalParams = { ...bitmapFont.parameters };
    Object.assign(bitmapFont.parameters, tempParams);
    
    const currentLetter = bitmapFont.glyphs[character] || bitmapFont.glyphs['.notdef'];
    const glyphGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    glyphGroup.setAttribute('transform', 'translate(125, 125)'); // 🔥 居中
    
    for (let i = 0; i < 5; i++) {
        for (let k = 0; k < 5; k++) {
            const pixelIndex = k * 5 + i;
            const currentPixel = currentLetter[pixelIndex];
            
            if (currentPixel !== 1) continue;
            
            const x = (i - 2) * 50; // 🔥 相对于中心的偏移
            const y = (k - 2) * 50;
            
            const pixel = renderPixel(x, y, size, 0);
            glyphGroup.appendChild(pixel);
        }
    }
    
    svg.appendChild(glyphGroup);
    container.appendChild(svg);
    
    Object.assign(bitmapFont.parameters, originalParams);
};

// 🔥 新增：动态字体生成函数（带参数动画）
const generateAnimatedFont = (containerSelector, character, animConfig) => {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 250 250');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.style.overflow = 'visible';
    
    let step = 0;
    let glyphGroup = null;
    
    // 动画循环
    const animate = () => {
        step += 1;
        
        // 清空之前的内容
        svg.innerHTML = '';
        
        // 设置参数
        const tempParams = {
            width: 250,
            height: 250,
            columns: 5,
            rows: 5,
            radius: 30,
            renderMode: animConfig.renderMode,
            axisCount: animConfig.axisCount ? Math.round(getWaveValue(step, animConfig.axisCount.type, animConfig.axisCount.min, animConfig.axisCount.max)) : 36,
            axisStrokeWidth: animConfig.axisStrokeWidth ? getWaveValue(step, animConfig.axisStrokeWidth.type, animConfig.axisStrokeWidth.min, animConfig.axisStrokeWidth.max) : 15,
            centerCircleSize: animConfig.centerCircleSize ? getWaveValue(step, animConfig.centerCircleSize.type, animConfig.centerCircleSize.min, animConfig.centerCircleSize.max) : 30,
            rotation: animConfig.rotation ? getWaveValue(step, animConfig.rotation.type, animConfig.rotation.min || 0, animConfig.rotation.max || 360, animConfig.rotation.speed || 1) : 0,
            fontColor: '#ffffff',
            copies: { count: 1, offset: { x: 0, y: 0, scale: 0 } }
        };
        
        const originalParams = { ...bitmapFont.parameters };
        Object.assign(bitmapFont.parameters, tempParams);
        
        const currentLetter = bitmapFont.glyphs[character] || bitmapFont.glyphs['.notdef'];
        glyphGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        glyphGroup.setAttribute('transform', 'translate(125, 125)');
        
        for (let i = 0; i < 5; i++) {
            for (let k = 0; k < 5; k++) {
                const pixelIndex = k * 5 + i;
                const currentPixel = currentLetter[pixelIndex];
                
                if (currentPixel !== 1) continue;
                
                const x = (i - 2) * 50;
                const y = (k - 2) * 50;
                
                const pixel = renderPixel(x, y, 30, 0);
                glyphGroup.appendChild(pixel);
            }
        }
        
        svg.appendChild(glyphGroup);
        
        Object.assign(bitmapFont.parameters, originalParams);
        
        requestAnimationFrame(animate);
    };
    
    container.appendChild(svg);
    animate();
};

// 🔥 完全重写：生成大字符的函数（撑满四个圆点区域）
const generateLargeFont = (containerSelector, character, renderMode, isAnimated = false) => {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Container not found: ${containerSelector}`);
        return;
    }
    
    // 添加动画类
    if (isAnimated) {
        container.classList.add('animated');
    }
    
    // 🔥 大字符：viewBox 设置为容器尺寸的 80%，保证完整显示
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 400 400');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.style.overflow = 'visible';
    svg.style.width = '80%';
    svg.style.height = '80%';
    
    // 临时设置参数
    const tempParams = {
        width: 400,
        height: 400,
        columns: 5,
        rows: 5,
        radius: 50, // 🔥 大字符使用较大半径
        renderMode: renderMode,
        axisCount: 36,
        axisStrokeWidth: 15,
        centerCircleSize: 30,
        rotation: 0,
        fontColor: '#ffffff',
        copies: { count: 1, offset: { x: 0, y: 0, scale: 0 } }
    };
    
    const originalParams = { ...bitmapFont.parameters };
    Object.assign(bitmapFont.parameters, tempParams);
    
    const currentLetter = bitmapFont.glyphs[character] || bitmapFont.glyphs['.notdef'];
    const glyphGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    glyphGroup.setAttribute('transform', 'translate(200, 200)');
    
    for (let i = 0; i < 5; i++) {
        for (let k = 0; k < 5; k++) {
            const pixelIndex = k * 5 + i;
            const currentPixel = currentLetter[pixelIndex];
            
            if (currentPixel !== 1) continue;
            
            const x = (i - 2) * 80;
            const y = (k - 2) * 80;
            
            const pixel = renderPixel(x, y, 50, 0);
            glyphGroup.appendChild(pixel);
        }
    }
    
    svg.appendChild(glyphGroup);
    container.appendChild(svg);
    
    Object.assign(bitmapFont.parameters, originalParams);
};

// 🔥 完全重写：只保留最流畅的样式配置（删除 spiralSquare）
const renderModeAnimationConfigs = {
    // === HALLO :) 专用样式（3种 - 径向系列）===
    
    // 1. radial - 基础径向线
    'radial': {
        radius: { type: 'slow', min: 18, max: 32 },
        axisCount: { type: 'triangle', min: 16, max: 32 },
        axisStrokeWidth: { type: 'fixed', value: 12 },
        centerCircleSize: { type: 'fixed', value: 30 },
        rotation: { speed: 2 }
    },
    
    // 2. radialFan - 扇形
    'radialFan': {
        radius: { type: 'fixed', value: 26 },
        axisCount: { type: 'fast', min: 12, max: 28 },
        axisStrokeWidth: { type: 'fixed', value: 14 },
        centerCircleSize: { type: 'wave', min: 25, max: 60 },
        rotation: { speed: 3 }
    },
    
    // 3. variableLengthRadial - 变长径向线
    'variableLengthRadial': {
        radius: { type: 'fixed', value: 26 },
        axisCount: { type: 'pulse', min: 16, max: 36 },
        axisStrokeWidth: { type: 'fixed', value: 12 },
        centerCircleSize: { type: 'fast', min: 25, max: 50 },
        rotation: { speed: 4 }
    },
    
    // === GUTEN TAG! 专用样式（3种 - 网格/方形系列）===
    
    // 4. sphereGrid - 球形网格
    'sphereGrid': {
        radius: { type: 'fixed', value: 26 },
        axisCount: { type: 'fixed', value: 16 },
        axisStrokeWidth: { type: 'fixed', value: 10 },
        centerCircleSize: { type: 'pulse', min: 20, max: 40 },
        rotation: { speed: 5 }
    },
    
    // 5. concentricSquare - 同心方格
    'concentricSquare': {
        radius: { type: 'fixed', value: 26 },
        axisCount: { type: 'fast', min: 24, max: 36 },
        axisStrokeWidth: { type: 'fixed', value: 12 },
        centerCircleSize: { type: 'fixed', value: 30 },
        rotation: { speed: 6 }
    },
    
    // 6. waveCircle - 波纹圆形
    'waveCircle': {
        radius: { type: 'fixed', value: 26 },
        axisCount: { type: 'pulse', min: 8, max: 20 },
        axisStrokeWidth: { type: 'fixed', value: 14 },
        centerCircleSize: { type: 'fixed', value: 40 },
        rotation: { speed: 0 } // 🔥 静止
    }
};

// 🔥 完全重写：生成单词的函数 - 两个单词使用完全不同的样式库
const generateWordDisplay = (containerSelector, word, animatedChars = [], animStyle = 'scale') => {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Container not found: ${containerSelector}`);
        return;
    }
    
    const charSpacing = 20;
    const charSize = 60;
    const totalWidth = word.length * (charSize + charSpacing);
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${totalWidth} 250`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.style.overflow = 'visible';
    
    svg.style.willChange = 'transform';
    svg.style.transform = 'translateZ(0)';
    
    container.appendChild(svg);
    
    let step = 0;
    let lastFrameTime = 0;
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;
    
    const isHalloContainer = containerSelector === '.font-word-hallo';
    
    // 🔥 关键修改：两个单词使用完全不同的样式库
    const renderModes = isHalloContainer 
        ? ['radial', 'radialFan', 'variableLengthRadial'] // HALLO :) - 径向系列
        : ['sphereGrid', 'concentricSquare', 'waveCircle']; // GUTEN TAG! - 网格/方形系列
    
    let currentModeIndex = 0;
    let modeFrameCounter = 0;
    
    // 🔥 不同节奏：HALLO 2秒，GUTEN TAG 2.5秒
    const modeChangeDuration = isHalloContainer 
        ? 60   // HALLO :) - 2秒切换
        : 75;  // GUTEN TAG! - 2.5秒切换
    
    const animate = (currentTime) => {
        if (currentTime - lastFrameTime < frameInterval) {
            requestAnimationFrame(animate);
            return;
        }
        lastFrameTime = currentTime;
        
        step += 1;
        modeFrameCounter += 1;
        
        if (modeFrameCounter >= modeChangeDuration) {
            modeFrameCounter = 0;
            currentModeIndex = (currentModeIndex + 1) % renderModes.length;
            console.log(`${containerSelector} switched to: ${renderModes[currentModeIndex]} (${isHalloContainer ? '2s' : '2.5s'} rhythm)`);
        }
        
        svg.innerHTML = '';
        
        const currentRenderMode = renderModes[currentModeIndex];
        const modeConfig = renderModeAnimationConfigs[currentRenderMode];
        
        const tempParams = {
            width: 250,
            height: 250,
            columns: 5,
            rows: 5,
            radius: modeConfig.radius.type === 'fixed' 
                ? modeConfig.radius.value 
                : getWaveValue(step, modeConfig.radius.type, modeConfig.radius.min, modeConfig.radius.max),
            renderMode: currentRenderMode,
            axisCount: modeConfig.axisCount.type === 'fixed' 
                ? modeConfig.axisCount.value 
                : Math.round(getWaveValue(step, modeConfig.axisCount.type, modeConfig.axisCount.min, modeConfig.axisCount.max)),
            axisStrokeWidth: modeConfig.axisStrokeWidth.type === 'fixed' 
                ? modeConfig.axisStrokeWidth.value 
                : getWaveValue(step, modeConfig.axisStrokeWidth.type, modeConfig.axisStrokeWidth.min, modeConfig.axisStrokeWidth.max),
            centerCircleSize: modeConfig.centerCircleSize.type === 'fixed' 
                ? modeConfig.centerCircleSize.value 
                : getWaveValue(step, modeConfig.centerCircleSize.type, modeConfig.centerCircleSize.min, modeConfig.centerCircleSize.max),
            rotation: step * modeConfig.rotation.speed,
            fontColor: '#ffffff',
            copies: { count: 1, offset: { x: 0, y: 0, scale: 0 } }
        };
        
        const originalParams = { ...bitmapFont.parameters };
        Object.assign(bitmapFont.parameters, tempParams);
        
        const skewAngle = isHalloContainer ? calculateSkewAngle() : 0;
        
        const fragment = document.createDocumentFragment();
        
        word.split('').forEach((character, charIndex) => {
            const currentLetter = bitmapFont.glyphs[character] || bitmapFont.glyphs['.notdef'];
            const charGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            
            const xOffset = charIndex * (charSize + charSpacing) + (charSize + charSpacing) / 2;
            
            let transform = `translate(${xOffset}, 125)`;
            
            // HALLO :) - 鼠标倾斜
            if (animStyle === 'scale') {
                if (isHalloContainer && skewAngle !== 0) {
                    transform += ` skewX(${skewAngle})`;
                }
            }
            
            // GUTEN TAG! - 逐字符放大
            else if (animStyle === 'individual') {
                const charDelay = charIndex * 0.5;
                const charScale = 0.2 + Math.sin(step * 0.15 + charDelay) * 0.9;
                transform += ` scale(${charScale})`;
            }
            
            charGroup.setAttribute('transform', transform);
            
            for (let i = 0; i < 5; i++) {
                for (let k = 0; k < 5; k++) {
                    const pixelIndex = k * 5 + i;
                    const currentPixel = currentLetter[pixelIndex];
                    
                    if (currentPixel !== 1) continue;
                    
                    const x = (i - 2) * 12;
                    const y = (k - 2) * 12;
                    
                    const pixel = renderPixel(x, y, tempParams.radius / 4, 0);
                    charGroup.appendChild(pixel);
                }
            }
            
            fragment.appendChild(charGroup);
        });
        
        svg.appendChild(fragment);
        
        Object.assign(bitmapFont.parameters, originalParams);
        requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
};

// 🔥 新增：鼠标位置追踪
let mouseX = window.innerWidth / 2; // 初始化为屏幕中心
let mouseY = window.innerHeight / 2;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// 🔥 新增：计算倾斜角度（基于鼠标 X 位置）
const calculateSkewAngle = () => {
    const centerX = window.innerWidth / 2;
    const maxSkew = 20; // 最大倾斜角度（度）
    
    // 计算相对于中心的偏移比例（-1 到 1）
    const offsetRatio = (mouseX - centerX) / centerX;
    
    // 返回倾斜角度（左侧负值，右侧正值）
    return offsetRatio * maxSkew;
};

// 🔥 修改：生成小字符的函数 - 保持原有效果（不改变 * 号）
const generateSmallFont = (containerSelector, character, animConfig) => {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Container not found: ${containerSelector}`);
        return;
    }
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 150 150');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.style.overflow = 'visible';
    
    container.appendChild(svg);
    
    let step = 0;
    let lastFrameTime = 0;
    const targetFPS = 20;
    const frameInterval = 1000 / targetFPS;
    
    const animate = (currentTime) => {
        if (currentTime - lastFrameTime < frameInterval) {
            requestAnimationFrame(animate);
            return;
        }
        lastFrameTime = currentTime;
        
        step += 1;
        svg.innerHTML = '';
        
        // 🔥 保持原有效果：固定参数
        const tempParams = {
            width: 150,
            height: 150,
            columns: 5,
            rows: 5,
            radius: 20,
            renderMode: animConfig.renderMode, // 保持原有 renderMode
            axisCount: 24,
            axisStrokeWidth: 12,
            centerCircleSize: 20,
            rotation: step * 3, // 保持原有旋转速度
            fontColor: '#ffffff',
            copies: { count: 1, offset: { x: 0, y: 0, scale: 0 } }
        };
        
        const originalParams = { ...bitmapFont.parameters };
        Object.assign(bitmapFont.parameters, tempParams);
        
        const currentLetter = bitmapFont.glyphs[character] || bitmapFont.glyphs['.notdef'];
        const glyphGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        glyphGroup.setAttribute('transform', 'translate(75, 75)');
        
        for (let i = 0; i < 5; i++) {
            for (let k = 0; k < 5; k++) {
                const pixelIndex = k * 5 + i;
                const currentPixel = currentLetter[pixelIndex];
                
                if (currentPixel !== 1) continue;
                
                const x = (i - 2) * 30;
                const y = (k - 2) * 30;
                
                const pixel = renderPixel(x, y, 20, 0);
                glyphGroup.appendChild(pixel);
            }
        }
        
        svg.appendChild(glyphGroup);
        Object.assign(bitmapFont.parameters, originalParams);
        
        requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
};

// 🔥 新增：页面加载时检查图片是否存在
window.addEventListener('load', () => {
    console.log('Visuals page loaded, starting animations...');
    
    // 🔥 新增：检查 PNG 图片
    const vImage = document.querySelector('.v1-image-container img');
    if (vImage) {
        console.log('📷 PNG 图片元素:', vImage);
        console.log('   - src:', vImage.src);
        console.log('   - naturalWidth:', vImage.naturalWidth);
        console.log('   - naturalHeight:', vImage.naturalHeight);
        
        // 如果图片加载失败，尝试备用路径
        if (vImage.complete && vImage.naturalHeight === 0) {
            console.warn('⚠️ PNG 图片加载失败，尝试备用路径...');
            const altPaths = [
                './images/v-1.png',
                './v-1.png',
                '../images/v-1.png',
                'images/v-1.png',
                'v-1.png'
            ];
            
            let pathIndex = 0;
            const tryNextPath = () => {
                if (pathIndex < altPaths.length) {
                    const testPath = altPaths[pathIndex];
                    console.log(`🔄 尝试路径 ${pathIndex + 1}/${altPaths.length}: ${testPath}`);
                    vImage.src = testPath;
                    pathIndex++;
                }
            };
            
            vImage.onerror = tryNextPath;
            tryNextPath();
        } else if (vImage.complete) {
            console.log('✅ PNG 图片加载成功！');
        }
    } else {
        console.error('❌ 找不到 PNG 图片元素');
    }
    
    try {
        // PNG 区域左右两侧的 * 字符
        console.log('Generating left star...');
        generateSmallFont('.font-star-left', '*', {
            renderMode: 'radial'
        });
        
        console.log('Generating right star...');
        generateSmallFont('.font-star-right', '*', {
            renderMode: 'radial'
        });
        
        // 单词：HALLO :)（3种流畅样式 + 鼠标倾斜）
        console.log('Generating HALLO :)...');
        generateWordDisplay('.font-word-hallo', 'HALLO :)', [6, 7], 'scale');
        
        // 单词：GUTEN TAG!（3种流畅样式 + 逐字符放大）
        console.log('Generating GUTEN TAG!...');
        generateWordDisplay('.font-word-guten', 'GUTEN TAG!', [9], 'individual');
        
        console.log('All animations started successfully!');
    } catch (error) {
        console.error('Error during animation generation:', error);
    }
});
