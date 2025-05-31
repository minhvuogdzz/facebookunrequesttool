(function() {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .cancel-tool {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      background: linear-gradient(45deg, rgb(0, 0, 0), rgb(35, 137, 145));=
      color:rgb(4, 4, 4);
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      font-family: Arial, sans-serif;
      width: 300px;
      transition: all 0.3s ease;
      border: 1px solid #dddfe2;
    }
    .cancel-tool h3 {
      margin: 0 0 15px 0;
      font-size: 18px;
      text-align: center;
      border-bottom: 1px solid #dddfe2;
      padding-bottom: 10px;
      color:rgb(24, 187, 242);
      font-weight: bold;
    }
    .cancel-tool .stats {
      display: flex;
      justify-content: space-between;
      background: #f0f2f5;
      padding: 10px;
      border-radius: 5px;
      margin-bottom: 15px;
    }
    .cancel-tool .count-box {
      text-align: center;
    }
    .cancel-tool .count {
      font-size: 24px;
      font-weight: bold;
      color: #1877f2;
    }
    .cancel-tool .count-label {
      font-size: 12px;
      color:rgb(0, 0, 0);
      font-weight: 500;
    }
    .cancel-tool .setting-row {
      margin: 12px 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color:rgb(255, 255, 255);
      font-weight: 500;
    }
    .cancel-tool select, .cancel-tool input {
      background: #f0f2f5;
      border: 1px solid #dddfe2;
      padding: 8px 10px;
      border-radius: 5px;
      width: 130px;
      font-size: 14px;
      color: #333333;
    }
    .cancel-tool .buttons {
      display: flex;
      justify-content: space-between;
      margin-top: 15px;
    }
    .cancel-tool button {
      border: none;
      color: white;
      padding: 12px 0;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
      width: 48%;
      transition: all 0.2s ease;
      font-size: 15px;
    }
    .cancel-tool .start-btn {
      background: #1877f2;
    }
    .cancel-tool .start-btn:hover {
      background: #166fe5;
    }
    .cancel-tool .stop-btn {
      background: #e41e3f;
    }
    .cancel-tool .stop-btn:hover {
      background: #d41c3b;
    }
    .cancel-tool .progress-bar {
      height: 6px;
      background: #f0f2f5;
      border-radius: 3px;
      margin-top: 15px;
      overflow: hidden;
    }
    .cancel-tool .progress {
      height: 100%;
      background: #1877f2;
      width: 0%;
      transition: width 0.5s ease;
    }
    .cancel-tool .status {
      text-align: center;
      font-size: 13px;
      margin-top: 8px;
      height: 15px;
      color: #606770;
      font-weight: 500;
    }
    .cancel-tool .log {
      margin-top: 10px;
      max-height: 100px;
      overflow-y: auto;
      font-size: 12px;
      background: #f0f2f5;
      padding: 8px;
      border-radius: 5px;
      color: #333333;
      line-height: 1.4;
    }
    .cancel-tool .log div {
      margin-bottom: 4px;
    }
  `;
  document.head.appendChild(styleElement);

  // Tạo giao diện điều khiển
  const controlPanel = document.createElement('div');
  controlPanel.className = 'cancel-tool';
  controlPanel.innerHTML = `
    <h3>UNREQUEST FRIENDS FACEBOOK TOOL</h3>
    <div class="stats">
      <div class="count-box">
        <div id="cancelCount" class="count">0</div>
        <div class="count-label">Đã hủy</div>
      </div>
      <div class="count-box">
        <div id="scrollCount" class="count">0</div>
        <div class="count-label">Đã cuộn</div>
      </div>
    </div>
    <div class="setting-row">
      <label>Số lượng cần hủy:</label>
      <input type="number" id="maxCancelCount" min="0" placeholder="Tất cả" />
    </div>
    <div class="setting-row">
      <label>Tốc độ (ms):</label>
      <select id="speedSetting">
        <option value="3000">Chậm (3s)</option>
        <option value="2000">Trung bình (2s)</option>
        <option value="1000">Nhanh (1s)</option>
        <option value="500">Rất nhanh (0.5s)</option>
        <option value="200" selected>Siêu nhanh (0.2s)</option>
      </select>
    </div>
    <div class="buttons">
      <button id="startCancel" class="start-btn">Bắt Đầu</button>
      <button id="stopCancel" class="stop-btn">Dừng Lại</button>
    </div>
    <div class="progress-bar">
      <div id="progressBar" class="progress"></div>
    </div>
    <div id="statusText" class="status"></div>
    <div id="logArea" class="log"></div>
  `;
  document.body.appendChild(controlPanel);

  let isRunning = false;
  let cancelCount = 0;
  let scrollCount = 0;
  let timeoutId = null;
  let maxToCancel = Infinity;
  let noButtonFoundCount = 0;
  let lastScrollPosition = 0;
  let logArea = document.getElementById('logArea');

  function log(message) {
    if (logArea) {
      const logEntry = document.createElement('div');
      logEntry.textContent = message;
      logArea.appendChild(logEntry);
      logArea.scrollTop = logArea.scrollHeight;
      
      while (logArea.children.length > 8) {
        logArea.removeChild(logArea.firstChild);
      }
    }
  }

  function findCancelButton() {
    const allButtons = document.querySelectorAll('div[role="button"]');
    for (const button of allButtons) {
      const text = button.textContent.toLowerCase();
      if (text.includes('hủy lời mời') || text.includes('cancel request')) {
        return button;
      }
    }
    
    const ariaButtons = document.querySelectorAll('[aria-label*="hủy"], [aria-label*="cancel"]');
    for (const button of ariaButtons) {
      return button;
    }
    
    const possibleButtons = document.querySelectorAll('div[role="button"][tabindex="0"]');
    for (const button of possibleButtons) {
      if (button.querySelector('span') && 
          (button.textContent.toLowerCase().includes('hủy') || 
           button.textContent.toLowerCase().includes('cancel'))) {
        return button;
      }
    }
    
    return null;
  }

  function updateProgress(current, max) {
    if (max > 0 && max !== Infinity) {
      const percent = Math.min((current / max) * 100, 100);
      document.getElementById('progressBar').style.width = percent + '%';
    } else if (current > 0) {
      const percent = (current % 20) * 5; 
      document.getElementById('progressBar').style.width = percent + '%';
    }
  }

  function smartScroll() {
    if (!isRunning) return;
    
    const beforeScrollHeight = window.scrollY;
    
    const viewportHeight = window.innerHeight;
    const scrollAmount = Math.floor(viewportHeight * 0.7);
    
    window.scrollBy(0, scrollAmount);
    scrollCount++;
    document.getElementById('scrollCount').textContent = scrollCount;
    
    setTimeout(() => {
      const afterScrollHeight = window.scrollY;
      
      if (afterScrollHeight === beforeScrollHeight || afterScrollHeight === lastScrollPosition) {
        noButtonFoundCount++;
        log(`⚠️ Không thể cuộn thêm hoặc không tìm thấy nút (${noButtonFoundCount}/5)`);
        
        if (noButtonFoundCount >= 5) {
          if (noButtonFoundCount === 5) {
            log('🔄 Cuộn lên đầu trang và thử lại...');
            window.scrollTo(0, 0);
            setTimeout(cancelNextRequest, 1000);
            return;
          } else {
            log('⛔ Không tìm thấy thêm nút hủy lời mời nào.');
            document.getElementById('statusText').textContent = 'Hoàn thành';
            isRunning = false;
            return;
          }
        }
      } else {
        lastScrollPosition = afterScrollHeight;
        log(`🔄 Đã cuộn trang (${scrollCount})`);
        noButtonFoundCount = 0;
      }
      
      setTimeout(cancelNextRequest, 300);
    }, 500);
  }

  function cancelNextRequest() {
    if (!isRunning) return;
    
    if (cancelCount >= maxToCancel) {
      isRunning = false;
      document.getElementById('statusText').textContent = 'Hoàn thành!';
      log('✅ Đã hoàn thành việc hủy lời mời.');
      return;
    }
    
    const cancelButton = findCancelButton();
    
    if (cancelButton) {
      document.getElementById('statusText').textContent = `Đang hủy lời mời...`;
      
      cancelButton.scrollIntoView({ behavior: 'auto', block: 'center' });
      
      setTimeout(() => {
        cancelButton.click();
        cancelCount++;
        document.getElementById('cancelCount').textContent = cancelCount;
        log(`✓ Đã hủy lời mời thứ ${cancelCount}`);
        
        updateProgress(cancelCount, maxToCancel);
        
        const speed = parseInt(document.getElementById('speedSetting').value);
        timeoutId = setTimeout(cancelNextRequest, speed);
      }, 200);
    } else {
      document.getElementById('statusText').textContent = 'Đang cuộn trang...';
      smartScroll();
    }
  }

  document.getElementById('startCancel').addEventListener('click', () => {
    if (!isRunning) {
      const maxInput = document.getElementById('maxCancelCount').value;
      maxToCancel = maxInput ? parseInt(maxInput) : Infinity;
      
      scrollCount = 0;
      noButtonFoundCount = 0;
      lastScrollPosition = 0;
      document.getElementById('scrollCount').textContent = '0';
      
      isRunning = true;
      document.getElementById('statusText').textContent = 'Đang bắt đầu...';
      log('🚀 Bắt đầu quá trình hủy lời mời...');
      
      cancelNextRequest();
    }
  });

  document.getElementById('stopCancel').addEventListener('click', () => {
    isRunning = false;
    if (timeoutId) clearTimeout(timeoutId);
    document.getElementById('statusText').textContent = 'Đã dừng';
    log('⏹️ Đã dừng quá trình hủy lời mời.');
  });
  
  console.log('Script hủy lời mời kết bạn đã sẵn sàng! Nhấn "Bắt Đầu" để chạy.');
})();


