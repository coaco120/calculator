document.addEventListener('DOMContentLoaded', function() {  
    // 初始化當前時間  
    setCurrentDateTime();  
    
    // 初始化描述框控制  
    initializeDescriptions();  
});  

function setCurrentDateTime() {  
    const now = new Date();  
    document.getElementById('year').value = now.getFullYear();  
    document.getElementById('month').value = now.getMonth() + 1;  
    document.getElementById('day').value = now.getDate();  
    
    // 設置時辰  
    const hour = now.getHours();  
    let timeIndex = 0;  
    
    if (hour >= 23 || hour < 1) timeIndex = 0;      // 子時 (23:00-01:00)  
    else if (hour < 3) timeIndex = 1;               // 丑時 (01:00-03:00)  
    else if (hour < 5) timeIndex = 2;               // 寅時 (03:00-05:00)  
    else if (hour < 7) timeIndex = 3;               // 卯時 (05:00-07:00)  
    else if (hour < 9) timeIndex = 4;               // 辰時 (07:00-09:00)  
    else if (hour < 11) timeIndex = 5;              // 巳時 (09:00-11:00)  
    else if (hour < 13) timeIndex = 6;              // 午時 (11:00-13:00)  
    else if (hour < 15) timeIndex = 7;              // 未時 (13:00-15:00)  
    else if (hour < 17) timeIndex = 8;              // 申時 (15:00-17:00)  
    else if (hour < 19) timeIndex = 9;              // 酉時 (17:00-19:00)  
    else if (hour < 21) timeIndex = 10;             // 戌時 (19:00-21:00)  
    else if (hour < 23) timeIndex = 11;             // 亥時 (21:00-23:00)  
    
    document.getElementById('time').value = timeIndex;  
}  

function initializeDescriptions() {  
    let currentDesc = null;  
    let currentElement = null;  
    
    // 处理所有可能触发描述框的元素  
    const triggerElements = document.querySelectorAll('.shen, .xing, .men, .gan');  
    
    triggerElements.forEach(element => {  
        // 鼠标进入事件  
        element.addEventListener('mouseenter', function(e) {  
            e.stopPropagation();  
            
            // 如果已有显示的描述框，先隐藏它  
            if (currentDesc) {  
                currentDesc.style.display = 'none';  
            }  
            
            // 获取对应的描述框类名  
            let descClass = '';  
            if (this.classList.contains('shen')) descClass = 'shen_desc';  
            else if (this.classList.contains('xing')) descClass = 'xing_desc';  
            else if (this.classList.contains('men')) descClass = 'men_desc';  
            else if (this.classList.contains('gan')) descClass = 'gan_desc';  
            
            // 查找并显示描述框  
            const desc = this.querySelector('.' + descClass);  
            if (desc) {  
                desc.style.display = 'block';  
                currentDesc = desc;  
                currentElement = this;  
            }  
        });  
    });  
    
    // 鼠标离开事件  
    document.addEventListener('mouseover', function(e) {  
        if (currentDesc && currentElement) {  
            // 检查鼠标是否真的离开了元素及其描述框  
            if (!currentElement.contains(e.target) && !currentDesc.contains(e.target)) {  
                currentDesc.style.display = 'none';  
                currentDesc = null;  
                currentElement = null;  
            }  
        }  
    });  
    
    // 点击空白处关闭描述框  
    document.addEventListener('click', function(e) {  
        if (currentDesc && !currentElement.contains(e.target)) {  
            currentDesc.style.display = 'none';  
            currentDesc = null;  
            currentElement = null;  
        }  
    });  
    
    // ESC键关闭描述框  
    document.addEventListener('keydown', function(e) {  
        if (e.key === 'Escape' && currentDesc) {  
            currentDesc.style.display = 'none';  
            currentDesc = null;  
            currentElement = null;  
        }  
    });  
}  

// 保留您原有的其他函数，如 calculate() 等  
function calculate() {  
    // 您原有的计算逻辑保持不变  
}  

// 添加窗口调整时的处理  
window.addEventListener('resize', function() {  
    const descriptions = document.querySelectorAll('.shen_desc, .men_desc, .xing_desc, .gan_desc');  
    descriptions.forEach(desc => {  
        desc.style.display = 'none';  
    });  
});
