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

// 椭圆文字框拖动和缩放功能
const textFrame = document.getElementById('text-frame');
const resizeHandle = document.getElementById('resize-handle');

let isDragging = false;
let isResizing = false;
let startX, startY, startWidth, startHeight, startLeft, startTop;

// 拖动功能
textFrame.addEventListener('mousedown', (e) => {
    if (e.target.closest('#resize-handle')) return;
    if (e.target.closest('.frame-content')) return;
    
    isDragging = true;
    textFrame.classList.add('dragging');
    startX = e.clientX - textFrame.offsetLeft;
    startY = e.clientY - textFrame.offsetTop;
    e.preventDefault();
});

// 缩放功能
resizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = textFrame.offsetWidth;
    startHeight = textFrame.offsetHeight;
    const rect = textFrame.getBoundingClientRect();
    startLeft = rect.left + window.scrollX;
    startTop = rect.top + window.scrollY;
    e.stopPropagation();
    e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const newLeft = e.clientX - startX;
        const newTop = e.clientY - startY;
        textFrame.style.left = newLeft + 'px';
        textFrame.style.top = newTop + 'px';
        textFrame.style.transform = 'none';
    } else if (isResizing) {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        const newWidth = Math.max(200, startWidth + deltaX);
        const newHeight = Math.max(300, startHeight + deltaY);
        textFrame.style.width = newWidth + 'px';
        textFrame.style.height = newHeight + 'px';
    }
});

document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        textFrame.classList.remove('dragging');
    }
    if (isResizing) {
        isResizing = false;
    }
});

// 🔥 删除：底部文字生成相关代码
/* const generateBottomText = () => {
    // ...删除的代码...
};

window.addEventListener('load', () => {
    generateBottomText();
}); */
