// Rendering a Pixel

// Parameters
// x – Postion
// y - Position
// radius – Scale
// index – Each iteration

// 主渲染函数 - 移除3D模式
const renderPixel = (x, y, radius, index) => {
    const renderMode = bitmapFont.parameters.renderMode || 'radial';
    
    switch(renderMode) {
        case 'sphereGrid':
            return renderPixelSphereGrid(x, y, radius, index);
        case 'waveCircle':
            return renderPixelWaveCircle(x, y, radius, index);
        case 'spiralSquare':
            return renderPixelSpiralSquare(x, y, radius, index);
        case 'concentricSquare':
            return renderPixelConcentricSquare(x, y, radius, index);
        case 'radialCheckerboard':
            return renderPixelRadialCheckerboard(x, y, radius, index);
        case 'waveOverlap':
            return renderPixelWaveOverlap(x, y, radius, index);
        case 'twistedGrid':
            return renderPixelTwistedGrid(x, y, radius, index);
        case 'scaleOverlap':
            return renderPixelScaleOverlap(x, y, radius, index);
        case 'ellipseOverlap':
            return renderPixelEllipseOverlap(x, y, radius, index);
        case 'mirrorOverlap':
            return renderPixelMirrorOverlap(x, y, radius, index);
        case 'twistedRadial':
            return renderPixelTwistedRadial(x, y, radius, index);
        case 'radialFan':
            return renderPixelRadialFan(x, y, radius, index);
        case 'variableLengthRadial':
            return renderPixelVariableLengthRadial(x, y, radius, index);
        case 'waveCheckerboard':
            return renderPixelWaveCheckerboard(x, y, radius, index);
        case 'radial':
        default:
            return renderPixelRadial(x, y, radius, index);
    }
}

// 修改:平面化球体渐变
const createGradientDef = (x, y, index, maxRadius) => {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradientId = `gradient-${x}-${y}-${index}`;
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
    gradient.setAttribute('id', gradientId);
    
    // 中心白色渐变
    gradient.setAttribute('cx', '50%');
    gradient.setAttribute('cy', '50%');
    gradient.setAttribute('r', '60%');
    gradient.setAttribute('fx', '50%');
    gradient.setAttribute('fy', '50%');
    
    // 正确的渐变 - 中心白到边缘黑
    const stops = [
        { offset: '0%', color: '#ffffff', opacity: 1 },     // 中心纯白
        { offset: '20%', color: '#e5e5e5', opacity: 1 },    // 亮灰
        { offset: '40%', color: '#b0b0b0', opacity: 1 },    // 中灰
        { offset: '60%', color: '#707070', opacity: 1 },    // 深灰
        { offset: '80%', color: '#303030', opacity: 1 },    // 暗灰
        { offset: '100%', color: '#000000', opacity: 1 }    // 边缘纯黑
    ];
    
    stops.forEach(stop => {
        const stopElement = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stopElement.setAttribute('offset', stop.offset);
        stopElement.setAttribute('stop-color', stop.color);
        stopElement.setAttribute('stop-opacity', stop.opacity);
        gradient.appendChild(stopElement);
    });
    
    defs.appendChild(gradient);
    return { defs, gradientId };
};

// 修改：不规则旋转计算 - 每个圆点独立随机旋转
const calculateRotation = (x, y, xOfst, yOfst, baseRotation) => {
    // 🎲 不规则旋转：每个圆点独立随机方向 + 速度
    const randomSeed = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    const randomValue = randomSeed - Math.floor(randomSeed);
    
    // 方向：随机正反向
    const direction = randomValue > 0.5 ? 1 : -1;
    
    // 速度：0.5x 到 2.5x 的随机倍数
    const speedMultiplier = 0.5 + randomValue * 2.0;
    
    // 放大 3 倍让变化更明显
    return baseRotation * 3 * direction * speedMultiplier;
};

// 🔥 修改：交替反向旋转 - 每个圆点根据位置交替正反转
const calculateAlternatingRotation = (x, y, xOfst, yOfst, baseRotation) => {
    // 使用位置计算唯一索引
    const indexSeed = Math.floor(x / 100) + Math.floor(y / 100);
    
    // 交替方向：偶数索引正转，奇数索引反转
    const direction = indexSeed % 2 === 0 ? 1 : -1;
    
    // 返回交替旋转角度
    return baseRotation * direction;
};

// 🔥 关键优化：统一的旋转应用函数 - 使用 CSS transform
const applyRotation = (group, x, y, xOfst, yOfst, baseRotation) => {
    const finalRotation = calculateAlternatingRotation(x, y, xOfst, yOfst, baseRotation);
    
    // 使用 CSS transform（GPU 加速）
    group.style.transform = `translate(${x + xOfst}px, ${y + yOfst}px) rotate(${finalRotation}deg)`;
    //group.transform = `translate(${x + xOfst}, ${y + yOfst})`;
    group.style.transformOrigin = '0 0';
    group.style.willChange = 'transform'; // 提示浏览器优化
};

// 修改：原始的径向线渲染 - 应用优化后的旋转
const renderPixelRadial = (x, y, radius, index) => {
    const xOfst = bitmapFont.parameters.copies.offset.x * (index)
    const yOfst = bitmapFont.parameters.copies.offset.y * (index)

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // 🔥 关键修复：正确应用 fontColor
    group.style.mixBlendMode = 'difference';
    const fontColor = bitmapFont.parameters.fontColor || '#ffffff';
    group.style.color = fontColor;
    
    const numLines = bitmapFont.parameters.axisCount || 36;
    const centerCircleSize = bitmapFont.parameters.centerCircleSize || 30;
    const innerRadius = radius * (centerCircleSize / 100);
    const outerRadius = radius * 1.5;
    const strokeWidth = radius * (bitmapFont.parameters.axisStrokeWidth / 100);
    
    // 径向线 - 使用currentColor自动继承fontColor
    for (let i = 0; i < numLines; i++) {
        const angle = (i / numLines) * Math.PI * 2;
        
        const x1 = Math.cos(angle) * innerRadius;
        const y1 = Math.sin(angle) * innerRadius;
        const x2 = Math.cos(angle) * outerRadius;
        const y2 = Math.sin(angle) * outerRadius;
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', 'currentColor'); // 自动继承fontColor
        line.setAttribute('stroke-width', strokeWidth);
        line.setAttribute('stroke-linecap', 'butt');
        
        group.appendChild(line);
    }
    
    // 🔥 关键优化：使用 CSS transform 代替 setAttribute（提升性能）
    const baseRotation = bitmapFont.parameters.rotation || 0;
    applyRotation(group, x, y, xOfst, yOfst, baseRotation);
    
    return group;
}

// 修改：球形网格效果 - 修复未定义变量问题
const renderPixelSphereGrid = (x, y, radius, index) => {
    const xOfst = bitmapFont.parameters.copies.offset.x * (index)
    const yOfst = bitmapFont.parameters.copies.offset.y * (index)
    
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // 🔥 修复：正确应用 fontColor
    group.style.mixBlendMode = 'difference';
    const fontColor = bitmapFont.parameters.fontColor || '#ffffff';
    group.style.color = fontColor;
    
    const numRings = Math.floor((bitmapFont.parameters.centerCircleSize || 30) / 4) + 4;
    const numLines = bitmapFont.parameters.axisCount || 36;
    const strokeWidth = radius * (bitmapFont.parameters.axisStrokeWidth / 100);
    const maxRadius = radius * 1.5;
    
    // 🔥 修复：移除未定义的 useGradient 变量
    // 直接绘制网格，不使用渐变背景
    
    // 绘制纬线（同心圆）
    for (let i = 1; i <= numRings; i++) {
        const r = (maxRadius * i) / numRings;
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '0');
        circle.setAttribute('cy', '0');
        circle.setAttribute('r', r);
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', 'currentColor');
        circle.setAttribute('stroke-width', strokeWidth);
        group.appendChild(circle);
    }
    
    // 绘制经线（径向线）
    for (let i = 0; i < numLines; i++) {
        const angle = (i / numLines) * Math.PI * 2;
        const x2 = Math.cos(angle) * maxRadius;
        const y2 = Math.sin(angle) * maxRadius;
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', '0');
        line.setAttribute('y1', '0');
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', 'currentColor');
        line.setAttribute('stroke-width', strokeWidth);
        group.appendChild(line);
    }
    
    // 🔥 优化：使用 CSS transform
    const baseRotation = bitmapFont.parameters.rotation || 0;
    applyRotation(group, x, y, xOfst, yOfst, baseRotation);
    
    return group;
}

// 新增：波纹圆形效果 - 使用配置参数
const renderPixelWaveCircle = (x, y, radius, index) => {
    const xOfst = bitmapFont.parameters.copies.offset.x * (index)
    const yOfst = bitmapFont.parameters.copies.offset.y * (index)
    
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.style.mixBlendMode = 'difference';
    const fontColor = bitmapFont.parameters.fontColor || '#ffffff';
    group.style.color = fontColor;
    
    // 使用配置参数
    const numRings = Math.floor(bitmapFont.parameters.axisCount / 3) || 12;
    const maxRadius = radius * 1.5;
    const strokeWidth = radius * (bitmapFont.parameters.axisStrokeWidth / 100);
    
    for (let i = 0; i < numRings; i++) {
        const r = (maxRadius * (i + 1)) / numRings;
        const dashArray = `${r * 0.3} ${r * 0.15}`;
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '0');
        circle.setAttribute('cy', '0');
        circle.setAttribute('r', r);
        circle.setAttribute('fill', i % 2 === 0 ? 'currentColor' : 'none');
        circle.setAttribute('stroke', 'currentColor');
        circle.setAttribute('stroke-width', strokeWidth);
        if (i % 3 === 0) {
            circle.setAttribute('stroke-dasharray', dashArray);
        }
        group.appendChild(circle);
    }
    
    const baseRotation = bitmapFont.parameters.rotation || 0;
    applyRotation(group, x, y, xOfst, yOfst, baseRotation);
    return group;
}

// 新增：螺旋方格效果 - 使用配置参数
const renderPixelSpiralSquare = (x, y, radius, index) => {
    const xOfst = bitmapFont.parameters.copies.offset.x * (index)
    const yOfst = bitmapFont.parameters.copies.offset.y * (index)
    
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.style.mixBlendMode = 'difference';
    const fontColor = bitmapFont.parameters.fontColor || '#ffffff';
    group.style.color = fontColor;
    
    // 使用配置参数
    const numSquares = Math.floor(bitmapFont.parameters.axisCount / 4) || 10;
    const maxSize = radius * 2.5;
    const strokeWidth = radius * (bitmapFont.parameters.axisStrokeWidth / 100);
    const baseRotation = bitmapFont.parameters.rotation || 0;
    const rotationPerLayer = baseRotation / numSquares; // 每层叠加旋转
    
    for (let i = 0; i < numSquares; i++) {
        const size = (maxSize * (numSquares - i)) / numSquares;
        const layerRotation = i * rotationPerLayer;
        
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', -size / 2);
        rect.setAttribute('y', -size / 2);
        rect.setAttribute('width', size);
        rect.setAttribute('height', size);
        rect.setAttribute('fill', 'none');
        rect.setAttribute('stroke', 'currentColor');
        rect.setAttribute('stroke-width', strokeWidth);
        rect.setAttribute('transform', `rotate(${layerRotation})`);
        group.appendChild(rect);
    }
    
    // 整体再应用 rotation mode 的效果
    const rotationMode = bitmapFont.parameters.rotationMode || 'uniform';
    const modeRotation = calculateRotation(x, y, xOfst, yOfst, 0, rotationMode);
    
    group.setAttribute('transform', `translate(${x + xOfst}, ${y + yOfst}) rotate(${modeRotation})`);
    return group;
}

// 修改：同心方格 - 修复 transform 应用
const renderPixelConcentricSquare = (x, y, radius, index) => {
    const xOfst = bitmapFont.parameters.copies.offset.x * (index)
    const yOfst = bitmapFont.parameters.copies.offset.y * (index)
    
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.style.mixBlendMode = 'difference';
    const fontColor = bitmapFont.parameters.fontColor || '#ffffff';
    group.style.color = fontColor;
    
    // 使用配置参数
    const numSquares = Math.floor(bitmapFont.parameters.axisCount / 3) || 12;
    const maxSize = radius * 2.5;
    const strokeWidth = radius * (bitmapFont.parameters.axisStrokeWidth / 100);
    
    for (let i = 0; i < numSquares; i++) {
        const size = (maxSize * (numSquares - i)) / numSquares;
        
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', -size / 2);
        rect.setAttribute('y', -size / 2);
        rect.setAttribute('width', size);
        rect.setAttribute('height', size);
        rect.setAttribute('fill', i % 2 === 0 ? 'currentColor' : 'none');
        rect.setAttribute('stroke', 'currentColor');
        rect.setAttribute('stroke-width', strokeWidth);
        group.appendChild(rect);
    }
    
    const baseRotation = bitmapFont.parameters.rotation || 0;
    // 🔥 修复：使用 applyRotation 代替 setAttribute
    applyRotation(group, x, y, xOfst, yOfst, baseRotation);
    
    return group;
}

// 新增:放射状棋盘效果 - 使用配置参数
const renderPixelRadialCheckerboard = (x, y, radius, index) => {
    const xOfst = bitmapFont.parameters.copies.offset.x * (index)
    const yOfst = bitmapFont.parameters.copies.offset.y * (index)
    
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.style.mixBlendMode = 'difference';
    group.style.color = bitmapFont.parameters.fontColor || '#ffffff';
    
    // 使用配置参数
    const numRings = Math.floor((bitmapFont.parameters.centerCircleSize || 30) / 2) + 8;
    const numSegments = bitmapFont.parameters.axisCount || 24;
    const maxRadius = radius * 1.5;
    
    for (let ring = 0; ring < numRings; ring++) {
        const innerR = (maxRadius * ring) / numRings;
        const outerR = (maxRadius * (ring + 1)) / numRings;
        
        for (let seg = 0; seg < numSegments; seg++) {
            const startAngle = (seg / numSegments) * Math.PI * 2;
            const endAngle = ((seg + 1) / numSegments) * Math.PI * 2;
            
            if ((ring + seg) % 2 === 0) {
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const x1 = Math.cos(startAngle) * innerR;
                const y1 = Math.sin(startAngle) * innerR;
                const x2 = Math.cos(startAngle) * outerR;
                const y2 = Math.sin(startAngle) * outerR;
                const x3 = Math.cos(endAngle) * outerR;
                const y3 = Math.sin(endAngle) * outerR;
                const x4 = Math.cos(endAngle) * innerR;
                const y4 = Math.sin(endAngle) * innerR;
                
                const d = `M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 0 0 ${x1} ${y1} Z`;
                path.setAttribute('d', d);
                path.setAttribute('fill', 'currentColor');
                group.appendChild(path);
            }
        }
    }
    
    const baseRotation = bitmapFont.parameters.rotation || 0;
    // 🔥 修复：使用 applyRotation 代替 setAttribute
    applyRotation(group, x, y, xOfst, yOfst, baseRotation);
    
    return group;
}

// 新增：波浪交叠效果 - 通过位置偏移产生摩尔纹
const renderPixelWaveOverlap = (x, y, radius, index) => {
    const xOfst = bitmapFont.parameters.copies.offset.x * (index)
    const yOfst = bitmapFont.parameters.copies.offset.y * (index)
    
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.style.mixBlendMode = 'difference';
    group.style.color = bitmapFont.parameters.fontColor || '#ffffff';
    
    const numRings = Math.floor(bitmapFont.parameters.axisCount / 3) || 12;
    const maxRadius = radius * 1.5;
    const strokeWidth = radius * (bitmapFont.parameters.axisStrokeWidth / 100);
    
    // 创建两组偏移的同心圆，产生交叠效果
    const offset = radius * 0.3;
    
    for (let set = 0; set < 2; set++) {
        const xOffset = set === 0 ? -offset : offset;
        const yOffset = set === 0 ? -offset : offset;
        
        for (let i = 0; i < numRings; i++) {
            const r = (maxRadius * (i + 1)) / numRings;
            
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', xOffset);
            circle.setAttribute('cy', yOffset);
            circle.setAttribute('r', r);
            circle.setAttribute('fill', 'none');
            circle.setAttribute('stroke', 'currentColor');
            circle.setAttribute('stroke-width', strokeWidth);
            group.appendChild(circle);
        }
    }
    
    const baseRotation = bitmapFont.parameters.rotation || 0;
    // 🔥 修复：使用 applyRotation 代替 setAttribute
    applyRotation(group, x, y, xOfst, yOfst, baseRotation);
    
    return group;
}

// 新增：扭曲网格效果 - 旋转的网格交叠
const renderPixelTwistedGrid = (x, y, radius, index) => {
    const xOfst = bitmapFont.parameters.copies.offset.x * (index)
    const yOfst = bitmapFont.parameters.copies.offset.y * (index)
    
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.style.mixBlendMode = 'difference';
    group.style.color = bitmapFont.parameters.fontColor || '#ffffff';
    
    const numLines = bitmapFont.parameters.axisCount || 36;
    const numRings = Math.floor((bitmapFont.parameters.centerCircleSize || 30) / 4) + 4;
    const strokeWidth = radius * (bitmapFont.parameters.axisStrokeWidth / 100);
    const maxRadius = radius * 1.5;
    
    // 创建两组旋转的网格
    for (let set = 0; set < 2; set++) {
        const rotationOffset = set * (bitmapFont.parameters.rotation / 2 || 22.5);
        
        const subGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        subGroup.setAttribute('transform', `rotate(${rotationOffset})`);
        
        // 同心圆
        for (let i = 1; i <= numRings; i++) {
            const r = (maxRadius * i) / numRings;
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', '0');
            circle.setAttribute('cy', '0');
            circle.setAttribute('r', r);
            circle.setAttribute('fill', 'none');
            circle.setAttribute('stroke', 'currentColor');
            circle.setAttribute('stroke-width', strokeWidth);
            subGroup.appendChild(circle);
        }
        
        // 径向线
        for (let i = 0; i < numLines / 2; i++) {
            const angle = (i / (numLines / 2)) * Math.PI * 2;
            const x2 = Math.cos(angle) * maxRadius;
            const y2 = Math.sin(angle) * maxRadius;
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', '0');
            line.setAttribute('y1', '0');
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('stroke', 'currentColor');
            line.setAttribute('stroke-width', strokeWidth);
            subGroup.appendChild(line);
        }
        
        group.appendChild(subGroup);
    }
    
    const baseRotation = bitmapFont.parameters.rotation || 0;
    // 🔥 修复：使用 applyRotation 代替 setAttribute
    applyRotation(group, x, y, xOfst, yOfst, baseRotation);
    
    return group;
}

// 新增：缩放交叠效果 - 不同大小的图案重叠
const renderPixelScaleOverlap = (x, y, radius, index) => {
    const xOfst = bitmapFont.parameters.copies.offset.x * (index)
    const yOfst = bitmapFont.parameters.copies.offset.y * (index)
    
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.style.mixBlendMode = 'difference';
    group.style.color = bitmapFont.parameters.fontColor || '#ffffff';
    
    const numLines = bitmapFont.parameters.axisCount || 36;
    const strokeWidth = radius * (bitmapFont.parameters.axisStrokeWidth / 100);
    
    // 创建三个不同大小的放射状图案
    const scales = [1.5, 1.0, 0.6];
    
    scales.forEach(scale => {
        const maxRadius = radius * scale;
        
        for (let i = 0; i < numLines; i++) {
            const angle = (i / numLines) * Math.PI * 2;
            const x2 = Math.cos(angle) * maxRadius;
            const y2 = Math.sin(angle) * maxRadius;
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', '0');
            line.setAttribute('y1', '0');
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('stroke', 'currentColor');
            line.setAttribute('stroke-width', strokeWidth);
            group.appendChild(line);
        }
    });
    
    const baseRotation = bitmapFont.parameters.rotation || 0;
    group.setAttribute('transform', `translate(${x + xOfst}, ${y + yOfst}) rotate(${baseRotation})`);
    return group;
}

// 新增：椭圆交叠效果 - 变形的圆形产生交叠
const renderPixelEllipseOverlap = (x, y, radius, index) => {
    const xOfst = bitmapFont.parameters.copies.offset.x * (index)
    const yOfst = bitmapFont.parameters.copies.offset.y * (index)
    
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.style.mixBlendMode = 'difference';
    group.style.color = bitmapFont.parameters.fontColor || '#ffffff';
    
    const numRings = Math.floor(bitmapFont.parameters.axisCount / 3) || 12;
    const maxRadius = radius * 1.5;
    const strokeWidth = radius * (bitmapFont.parameters.axisStrokeWidth / 100);
    
    // 创建两组椭圆，一组横向拉伸，一组纵向拉伸
    for (let set = 0; set < 2; set++) {
        const scaleX = set === 0 ? 1.3 : 0.7;
        const scaleY = set === 0 ? 0.7 : 1.3;
        
        for (let i = 0; i < numRings; i++) {
            const r = (maxRadius * (i + 1)) / numRings;
            
            const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            ellipse.setAttribute('cx', '0');
            ellipse.setAttribute('cy', '0');
            ellipse.setAttribute('rx', r * scaleX);
            ellipse.setAttribute('ry', r * scaleY);
            ellipse.setAttribute('fill', 'none');
            ellipse.setAttribute('stroke', 'currentColor');
            ellipse.setAttribute('stroke-width', strokeWidth);
            group.appendChild(ellipse);
        }
    }
    
    const baseRotation = bitmapFont.parameters.rotation || 0;
    // 🔥 修复：使用 applyRotation 代替 setAttribute
    applyRotation(group, x, y, xOfst, yOfst, baseRotation);
    
    return group;
}

// 新增：对称交叠效果 - 镜像图案的交叠
const renderPixelMirrorOverlap = (x, y, radius, index) => {
    const xOfst = bitmapFont.parameters.copies.offset.x * (index)
    const yOfst = bitmapFont.parameters.copies.offset.y * (index)
    
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.style.mixBlendMode = 'difference';
    group.style.color = bitmapFont.parameters.fontColor || '#ffffff';
    
    const numLines = bitmapFont.parameters.axisCount || 36;
    const numRings = Math.floor((bitmapFont.parameters.centerCircleSize || 30) / 4) + 4;
    const strokeWidth = radius * (bitmapFont.parameters.axisStrokeWidth / 100);
    const maxRadius = radius * 1.5;
    
    // 创建四个象限的对称图案
    for (let quadrant = 0; quadrant < 4; quadrant++) {
        const angle = quadrant * 90;
        const subGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        subGroup.setAttribute('transform', `rotate(${angle})`);
        
        // 只绘制四分之一的图案
        for (let i = 1; i <= numRings; i++) {
            const r = (maxRadius * i) / numRings;
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const d = `M ${r} 0 A ${r} ${r} 0 0 1 0 ${r}`;
            path.setAttribute('d', d);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', 'currentColor');
            path.setAttribute('stroke-width', strokeWidth);
            subGroup.appendChild(path);
        }
        
        // 径向线（四分之一）
        for (let i = 0; i < numLines / 4; i++) {
            const lineAngle = (i / (numLines / 4)) * Math.PI / 2;
            const x2 = Math.cos(lineAngle) * maxRadius;
            const y2 = Math.sin(lineAngle) * maxRadius;
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', '0');
            line.setAttribute('y1', '0');
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('stroke', 'currentColor');
            line.setAttribute('stroke-width', strokeWidth);
            subGroup.appendChild(line);
        }
        
        group.appendChild(subGroup);
    }
    
    const baseRotation = bitmapFont.parameters.rotation || 0;
    const rotationMode = bitmapFont.parameters.rotationMode || 'uniform';
    const modeRotation = calculateRotation(x, y, xOfst, yOfst, 0, rotationMode);
    
    group.setAttribute('transform', `translate(${x + xOfst}, ${y + yOfst}) rotate(${modeRotation})`);
    return group;
}

// 新增：扭曲放射线效果（图1 - 左上）
const renderPixelTwistedRadial = (x, y, radius, index) => {
    const xOfst = bitmapFont.parameters.copies.offset.x * (index)
    const yOfst = bitmapFont.parameters.copies.offset.y * (index)
    
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.style.mixBlendMode = 'difference';
    group.style.color = bitmapFont.parameters.fontColor || '#ffffff';
    
    const numLines = bitmapFont.parameters.axisCount || 36;
    const strokeWidth = radius * (bitmapFont.parameters.axisStrokeWidth / 100);
    const maxRadius = radius * 1.5;
    
    // 创建扭曲的放射线 - 每条线有不同的扭曲角度
    for (let i = 0; i < numLines; i++) {
        const baseAngle = (i / numLines) * Math.PI * 2;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        let pathData = 'M 0 0';
        const segments = 20;
        
        for (let j = 1; j <= segments; j++) {
            const t = j / segments;
            const r = maxRadius * t;
            // 添加扭曲效果 - 角度随距离变化
            const twist = Math.sin(t * Math.PI * 2) * (bitmapFont.parameters.rotation / 360 || 0.3);
            const angle = baseAngle + twist;
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            pathData += ` L ${px} ${py}`;
        }
        
        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'currentColor');
        path.setAttribute('stroke-width', strokeWidth);
        group.appendChild(path);
    }
    
    const baseRotation = bitmapFont.parameters.rotation || 0;
    const rotationMode = bitmapFont.parameters.rotationMode || 'uniform';
    const modeRotation = calculateRotation(x, y, xOfst, yOfst, 0, rotationMode);
    
    group.setAttribute('transform', `translate(${x + xOfst}, ${y + yOfst}) rotate(${modeRotation})`);
    return group;
}

// 新增：放射扇形效果（图2 - 右上）
const renderPixelRadialFan = (x, y, radius, index) => {
    const xOfst = bitmapFont.parameters.copies.offset.x * (index)
    const yOfst = bitmapFont.parameters.copies.offset.y * (index)
    
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.style.mixBlendMode = 'difference';
    group.style.color = bitmapFont.parameters.fontColor || '#ffffff';
    
    const numSegments = bitmapFont.parameters.axisCount || 24;
    const maxRadius = radius * 1.5;
    const strokeWidth = radius * (bitmapFont.parameters.axisStrokeWidth / 100);
    
    // 创建放射扇形 - 黑白交替的扇形片段
    for (let i = 0; i < numSegments; i++) {
        const startAngle = (i / numSegments) * Math.PI * 2;
        const endAngle = ((i + 1) / numSegments) * Math.PI * 2;
        
        if (i % 2 === 0) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const x1 = Math.cos(startAngle) * maxRadius;
            const y1 = Math.sin(startAngle) * maxRadius;
            const x2 = Math.cos(endAngle) * maxRadius;
            const y2 = Math.sin(endAngle) * maxRadius;
            
            const d = `M 0 0 L ${x1} ${y1} A ${maxRadius} ${maxRadius} 0 0 1 ${x2} ${y2} Z`;
            path.setAttribute('d', d);
            path.setAttribute('fill', 'currentColor');
            path.setAttribute('stroke', 'currentColor');
            path.setAttribute('stroke-width', strokeWidth / 2);
            group.appendChild(path);
        }
    }
    
    const baseRotation = bitmapFont.parameters.rotation || 0;
    group.setAttribute('transform', `translate(${x + xOfst}, ${y + yOfst}) rotate(${baseRotation})`);
    return group;
}

// 新增：变长放射线效果（图3 - 左下）
const renderPixelVariableLengthRadial = (x, y, radius, index) => {
    const xOfst = bitmapFont.parameters.copies.offset.x * (index)
    const yOfst = bitmapFont.parameters.copies.offset.y * (index)
    
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.style.mixBlendMode = 'difference';
    group.style.color = bitmapFont.parameters.fontColor || '#ffffff';
    
    const numLines = bitmapFont.parameters.axisCount || 36;
    const centerCircleSize = bitmapFont.parameters.centerCircleSize || 30;
    const innerRadius = radius * (centerCircleSize / 100);
    const maxRadius = radius * 1.5;
    const strokeWidth = radius * (bitmapFont.parameters.axisStrokeWidth / 100);
    
    // 创建不同长度的放射线
    for (let i = 0; i < numLines; i++) {
        const angle = (i / numLines) * Math.PI * 2;
        // 交替长短
        const lengthMultiplier = i % 2 === 0 ? 1 : 0.6;
        const lineRadius = maxRadius * lengthMultiplier;
        
        const x1 = Math.cos(angle) * innerRadius;
        const y1 = Math.sin(angle) * innerRadius;
        const x2 = Math.cos(angle) * lineRadius;
        const y2 = Math.sin(angle) * lineRadius;
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', 'currentColor');
        line.setAttribute('stroke-width', strokeWidth);
        line.setAttribute('stroke-linecap', 'butt');
        group.appendChild(line);
    }
    
    const baseRotation = bitmapFont.parameters.rotation || 0;
    const finalRotation = calculateRotation(x, y, xOfst, yOfst, baseRotation);
    
    group.setAttribute('transform', `translate(${x + xOfst}, ${y + yOfst}) rotate(${finalRotation})`);
    return group;
}

// 新增：波浪棋盘效果（图4 - 右下）
const renderPixelWaveCheckerboard = (x, y, radius, index) => {
    const xOfst = bitmapFont.parameters.copies.offset.x * (index)
    const yOfst = bitmapFont.parameters.copies.offset.y * (index)
    
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.style.mixBlendMode = 'difference';
    group.style.color = bitmapFont.parameters.fontColor || '#ffffff';
    
    const numRings = Math.floor((bitmapFont.parameters.centerCircleSize || 30) / 2) + 10;
    const numSegments = bitmapFont.parameters.axisCount || 24;
    const maxRadius = radius * 1.5;
    
    // 创建波浪状的棋盘格
    for (let ring = 0; ring < numRings; ring++) {
        const innerR = (maxRadius * ring) / numRings;
        const outerR = (maxRadius * (ring + 1)) / numRings;
        
        for (let seg = 0; seg < numSegments; seg++) {
            // 创建波浪效果 - 根据位置改变填充模式
            const wavePattern = Math.floor((ring + seg) / 2) % 2 === 0;
            
            if (wavePattern) {
                const startAngle = (seg / numSegments) * Math.PI * 2;
                const endAngle = ((seg + 1) / numSegments) * Math.PI * 2;
                
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const x1 = Math.cos(startAngle) * innerR;
                const y1 = Math.sin(startAngle) * innerR;
                const x2 = Math.cos(startAngle) * outerR;
                const y2 = Math.sin(startAngle) * outerR;
                const x3 = Math.cos(endAngle) * outerR;
                const y3 = Math.sin(endAngle) * outerR;
                const x4 = Math.cos(endAngle) * innerR;
                const y4 = Math.sin(endAngle) * innerR;
                
                const d = `M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 0 0 ${x1} ${y1} Z`;
                path.setAttribute('d', d);
                path.setAttribute('fill', 'currentColor');
                group.appendChild(path);
            }
        }
    }
    
    const baseRotation = bitmapFont.parameters.rotation || 0;
    const finalRotation = calculateRotation(x, y, xOfst, yOfst, baseRotation);
    
    group.setAttribute('transform', `translate(${x + xOfst}, ${y + yOfst}) rotate(${finalRotation})`);
    return group;
}

// 修改：疲劳效果 (FATIGUE) - 使用可调节颜色的光晕
const renderPixelFatigue = (x, y, radius, index) => {
    const xOfst = bitmapFont.parameters.copies.offset.x * (index)
    const yOfst = bitmapFont.parameters.copies.offset.y * (index)
    
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    const numRings = Math.floor(bitmapFont.parameters.axisCount / 2) + 10;
    const maxRadius = radius * 1.5;
    const blur = bitmapFont.parameters.blur;
    const fontColor = bitmapFont.parameters.fontColor || '#ffffff';
    
    // 解析颜色为 RGB
    const parseColor = (hexColor) => {
        const hex = hexColor.replace('#', '');
        return {
            r: parseInt(hex.substr(0, 2), 16),
            g: parseInt(hex.substr(2, 2), 16),
            b: parseInt(hex.substr(4, 2), 16)
        };
    };
    
    const baseColor = parseColor(fontColor);
    
    // 创建滤镜定义
    if (blur > 0) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        const filterId = `blur-${x}-${y}-${index}`;
        filter.setAttribute('id', filterId);
        const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        feGaussianBlur.setAttribute('stdDeviation', blur / 10);
        filter.appendChild(feGaussianBlur);
        defs.appendChild(filter);
        group.appendChild(defs);
    }
    
    for (let i = 0; i < numRings; i++) {
        const r = (maxRadius * (i + 1)) / numRings;
        const t = i / numRings;
        
        // 创建从基础颜色到透明的渐变
        const opacity = (1 - t * 0.5) * 0.8; // 保持较高的不透明度以保持对比
        
        // 颜色亮度变化
        const brightness = 1 + t * 0.3; // 外圈稍微更亮
        const color = `rgba(${Math.min(255, baseColor.r * brightness)}, ${Math.min(255, baseColor.g * brightness)}, ${Math.min(255, baseColor.b * brightness)}, ${opacity})`;
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '0');
        circle.setAttribute('cy', '0');
        circle.setAttribute('r', r);
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', color);
        circle.setAttribute('stroke-width', radius * 0.08);
        
        if (blur > 0) {
            circle.setAttribute('filter', `url(#blur-${x}-${y}-${index})`);
        }
        
        group.appendChild(circle);
    }
    
    group.setAttribute('transform', `translate(${x + xOfst}, ${y + yOfst})`);
    return group;
}

// renderPixel2 保留作为备用
const renderPixel2 = (x, y, radius, index) => {
    const scale = radius/100-index*0.01 * 2
    const xOfst = (bitmapFont.parameters.copies.offset.x * (index)) - scale*50
    const yOfst = (bitmapFont.parameters.copies.offset.y * (index)) - scale*50

    const newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const path = `M39.17,40.89c2.39,31.35-23.87,69.37-30.71,40.26S62.71,2.86,41.39,16.71C20.07,30.55.34,60.62.5,39.14c.16-21.48,56.01-58.55,63.01-25.46,7,33.1-1.59,35.8,16.55,28.16,18.14-7.64,8.59,78.92-14.64,49.96-23.23-28.96-26.25-50.92-26.25-50.92Z`
    newPath.setAttribute('d', path) 
    newPath.setAttribute('transform', `translate(${x+xOfst}, ${y+yOfst}) scale(${scale})`)
    return newPath
}




