document.addEventListener('DOMContentLoaded', function() {  
    // 設置當前日期和時間  
    setCurrentDateTime();  
    
    // 為輸入框添加點擊事件  
    addClickHandlers();  

    // 初始化網格交互  
    initializeGridInteractions();  

    // 初始化工具提示  
    initializeTooltips();  
});  

function setCurrentDateTime() {  
    const now = new Date();  
    
    // 設置年月日  
    document.getElementById('year').value = now.getFullYear();  
    document.getElementById('month').value = now.getMonth() + 1;  
    document.getElementById('day').value = now.getDate();  
    
    // 設置時辰  
    const hour = now.getHours();  
    const timeIndex = getTimeIndex(hour);  
    document.getElementById('time').value = timeIndex;  
}  

function getTimeIndex(hour) {  
    // 子時 (23:00-01:00) = 0  
    if (hour >= 23 || hour < 1) return 0;  
    // 丑時 (01:00-03:00) = 1  
    if (hour >= 1 && hour < 3) return 1;  
    // 寅時 (03:00-05:00) = 2  
    if (hour >= 3 && hour < 5) return 2;  
    // 卯時 (05:00-07:00) = 3  
    if (hour >= 5 && hour < 7) return 3;  
    // 辰時 (07:00-09:00) = 4  
    if (hour >= 7 && hour < 9) return 4;  
    // 巳時 (09:00-11:00) = 5  
    if (hour >= 9 && hour < 11) return 5;  
    // 午時 (11:00-13:00) = 6  
    if (hour >= 11 && hour < 13) return 6;  
    // 未時 (13:00-15:00) = 7  
    if (hour >= 13 && hour < 15) return 7;  
    // 申時 (15:00-17:00) = 8  
    if (hour >= 15 && hour < 17) return 8;  
    // 酉時 (17:00-19:00) = 9  
    if (hour >= 17 && hour < 19) return 9;  
    // 戌時 (19:00-21:00) = 10  
    if (hour >= 19 && hour < 21) return 10;  
    // 亥時 (21:00-23:00) = 11  
    return 11;  
}  

function addClickHandlers() {  
    // 為年月日輸入框添加點擊事件  
    const inputs = ['year', 'month', 'day'];  
    inputs.forEach(id => {  
        const input = document.getElementById(id);  
        input.addEventListener('focus', function() {  
            if (!this.hasAttribute('user-modified')) {  
                this.value = '';  
                this.setAttribute('user-modified', 'true');  
            }  
        });  
    });  
}  

function initializeGridInteractions() {  
    const gridItems = document.querySelectorAll('.grid-item');  
    
    gridItems.forEach(item => {  
        // 設置 tabindex 使元素可獲得焦點  
        item.setAttribute('tabindex', '0');  
        
        // 點擊處理  
        item.addEventListener('click', function(e) {  
            e.stopPropagation();  
            
            // 檢查是否點擊到展開的內容  
            const isContentClick = e.target.closest('.gongMap') ||   
                                 e.target.closest('.juMap') ||   
                                 e.target.closest('.ganMap') ||   
                                 e.target.closest('.menMap') ||   
                                 e.target.closest('.xingMap') ||   
                                 e.target.closest('.shenMap');  
            
            if (isContentClick) {  
                return;  
            }  
            
            // 關閉其他打開的項目  
            gridItems.forEach(otherItem => {  
                if (otherItem !== item) {  
                    otherItem.classList.remove('active');  
                }  
            });  
            
            // 切換當前項目  
            item.classList.toggle('active');  
        });  

        // 鍵盤處理  
        item.addEventListener('keydown', function(e) {  
            if (e.key === 'Enter' || e.key === ' ') {  
                e.preventDefault();  
                this.click();  
            }  
        });  
    });  

    // 點擊外部關閉所有項目  
    document.addEventListener('click', function(e) {  
        if (!e.target.closest('.grid-item')) {  
            gridItems.forEach(item => {  
                item.classList.remove('active');  
            });  
        }  
    });  

    // 移動設備觸摸處理  
    if ('ontouchstart' in window) {  
        document.addEventListener('touchstart', function(e) {  
            if (!e.target.closest('.grid-item')) {  
                gridItems.forEach(item => {  
                    item.classList.remove('active');  
                });  
            }  
        });  
    }  
}  

function initializeTooltips() {  
    const tooltipElements = document.querySelectorAll('[data-tooltip]');  
    
    tooltipElements.forEach(element => {  
        element.addEventListener('mouseenter', function(e) {  
            const tooltip = this.querySelector('.tooltip');  
            if (tooltip) {  
                const rect = this.getBoundingClientRect();  
                const tooltipRect = tooltip.getBoundingClientRect();  
                
                // 計算位置  
                const top = rect.top - tooltipRect.height - 10;  
                const left = rect.left + (rect.width - tooltipRect.width) / 2;  
                
                // 設置位置  
                tooltip.style.top = `${Math.max(0, top)}px`;  
                tooltip.style.left = `${Math.max(0, left)}px`;  
            }  
        });  
    });  
}  

// ESC 鍵關閉所有打開的項目  
document.addEventListener('keydown', function(e) {  
    if (e.key === 'Escape') {  
        const gridItems = document.querySelectorAll('.grid-item');  
        gridItems.forEach(item => {  
            item.classList.remove('active');  
        });  
    }  
});  

// 處理視窗大小改變  
window.addEventListener('resize', function() {  
    const gridItems = document.querySelectorAll('.grid-item');  
    gridItems.forEach(item => {  
        item.classList.remove('active');  
    });  
});  

// 平滑滾動功能  
function smoothScroll(element) {  
    element.scrollIntoView({  
        behavior: 'smooth',  
        block: 'nearest'  
    });  
}
