// script.js  
document.addEventListener('DOMContentLoaded', function() {  
    // 設置當前日期和時間  
    setCurrentDateTime();  
    
    // 為輸入框添加點擊事件  
    addClickHandlers();  
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