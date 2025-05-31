(function() {
  // Tạo biến và trạng thái
  let isRunning = false;
  let cancelCount = 0;
  let scrollCount = 0;
  let timeoutId = null;
  let maxToCancel = Infinity;
  let noButtonFoundCount = 0;
  let lastScrollPosition = 0;
  const logArea = document.getElementById('logArea');

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
