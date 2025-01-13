function setCurrentDateTime() {  
    const now = new Date();  
    document.getElementById('year').value = now.getFullYear();  
    document.getElementById('month').value = now.getMonth() + 1;  
    document.getElementById('day').value = now.getDate();  
    
    const hour = now.getHours();  
    let timeIndex = 0;  
    
    if (hour >= 23 || hour < 1) timeIndex = 0;      // 子時  
    else if (hour < 3) timeIndex = 1;               // 丑時  
    else if (hour < 5) timeIndex = 2;               // 寅時  
    else if (hour < 7) timeIndex = 3;               // 卯時  
    else if (hour < 9) timeIndex = 4;               // 辰時  
    else if (hour < 11) timeIndex = 5;              // 巳時  
    else if (hour < 13) timeIndex = 6;              // 午時  
    else if (hour < 15) timeIndex = 7;              // 未時  
    else if (hour < 17) timeIndex = 8;              // 申時  
    else if (hour < 19) timeIndex = 9;              // 酉時  
    else if (hour < 21) timeIndex = 10;             // 戌時  
    else timeIndex = 11;                            // 亥時  
    
    document.getElementById('time').value = timeIndex;  
}  

function calculate() {  
    let year = parseInt(document.getElementById('year').value);  
    let month = parseInt(document.getElementById('month').value);  
    let day = parseInt(document.getElementById('day').value);  
    let time = parseInt(document.getElementById('time').value);  
    
    // 你原有的計算邏輯保持不變  
    // ...  
}  

function initializeDescriptions() {  
    let currentDesc = null;  
    let currentElement = null;  
    
    // 選擇所有可能觸發描述框的元素  
    const triggerElements = document.querySelectorAll('.shen, .xing, .men, .gan');  
    
    triggerElements.forEach(element => {  
        // 鼠標進入事件  
        element.addEventListener('mouseenter', function(e) {  
            e.stopPropagation();  
            
            // 如果已有顯示的描述框，先隱藏它  
            if (currentDesc && currentDesc !== this.querySelector('[class$="_desc"]')) {  
                currentDesc.style.display = 'none';  
            }  
            
            // 查找對應的描述框  
            let descClass = '';  
            if (this.classList.contains('shen')) descClass = 'shen_desc';  
            else if (this.classList.contains('xing')) descClass = 'xing_desc';  
            else if (this.classList.contains('men')) descClass = 'men_desc';  
            else if (this.classList.contains('gan')) descClass = 'gan_desc';  
            
            const desc = this.querySelector('.' + descClass);  
            if (desc) {  
                desc.style.display = 'block';  
                currentDesc = desc;  
                currentElement = this;  
            }  
        });  

        // 鼠標離開事件  
        element.addEventListener('mouseleave', function(e) {  
            const relatedTarget = e.relatedTarget;  
            const desc = this.querySelector('[class$="_desc"]');  
            
            // 確保鼠標真的離開了元素和描述框  
            if (!this.contains(relatedTarget) && (!desc || !desc.contains(relatedTarget))) {  
                if (desc) {  
                    setTimeout(() => {  
                        if (!this.matches(':hover') && !desc.matches(':hover')) {  
                            desc.style.display = 'none';  
                            if (currentDesc === desc) {  
                                currentDesc = null;  
                                currentElement = null;  
                            }  
                        }  
                    }, 100);  
                }  
            }  
        });  
    });  
    
    // 點擊文檔其他地方時關閉描述框  
    document.addEventListener('click', function(e) {  
        if (currentDesc && !currentElement.contains(e.target) && !currentDesc.contains(e.target)) {  
            currentDesc.style.display = 'none';  
            currentDesc = null;  
            currentElement = null;  
        }  
    });  
    
    // ESC 鍵關閉描述框  
    document.addEventListener('keydown', function(e) {  
        if (e.key === 'Escape' && currentDesc) {  
            currentDesc.style.display = 'none';  
            currentDesc = null;  
            currentElement = null;  
        }  
    });  
}  

// 視窗大小改變時關閉描述框  
window.addEventListener('resize', function() {  
    const descriptions = document.querySelectorAll('.shen_desc, .xing_desc, .men_desc, .gan_desc');  
    descriptions.forEach(desc => {  
        desc.style.display = 'none';  
    });  
});  

// 初始化  
document.addEventListener('DOMContentLoaded', function() {  
    setCurrentDateTime();  
    initializeDescriptions();  
});
