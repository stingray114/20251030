let table; // 用於儲存 loadTable 讀取的 CSV 資料
let questions = []; // 結構化後的題目陣列
let currentQuestionIndex = 0; // 當前題目索引
let score = 0; // 學生得分
let quizState = 'QUIZ'; // 狀態：'QUIZ' (測驗中) 或 'RESULT' (結果顯示)

// 特效變數
let customCursorColor; // 自訂游標顏色
let selectionEffectTime = 0; // 選項選取特效的計時器
let selectionEffectTarget = -1; // 被選取的選項 (0, 1, 2)

// ------------------- 資料預載入 -------------------
function preload() {
  // 使用 loadTable 讀取 CSV 檔案
  // 'csv' 格式, 'header' 表示第一行是標題
  table = loadTable('questions.csv', 'csv', 'header');
}

// ------------------- 初始設定 -------------------
// ... (其他變數和 preload 保持不變)

// ------------------- 初始設定 -------------------
function setup() {
  createCanvas(800, 600);
  customCursorColor = color(255, 100, 150);
  noCursor(); 

  // 請將您提供的迴圈貼在這裡，用於解析表格數據
  // 這段程式碼會將 p5.Table 資料轉換為易於使用的 'questions' 陣列

  // 檢查 table 是否成功載入，防止錯誤
  if (table && table.getRowCount() > 0) {
      // 從這裡開始貼上或替換您之前給出的迴圈
      for (let r = 0; r < table.getRowCount(); r++) {
          let row = table.getRow(r);
          
          // 使用欄位名稱讀取並結構化數據
          questions.push({
              question: row.getString('question'), // 讀取 'question' 欄位
              options: [
                  row.getString('optionA'),      // 讀取 'optionA' 欄位
                  row.getString('optionB'),      // 讀取 'optionB' 欄位
                  row.getString('optionC')       // 讀取 'optionC' 欄位
              ],
              correctAnswer: row.getString('correct') // 讀取 'correct' 欄位
          });
      }
      // 結束貼上或替換的部分
      
      console.log(`成功載入 ${questions.length} 題。`);

  } else {
      console.error("錯誤：CSV 表格載入失敗或為空。請檢查檔案路徑和伺服器運行狀態。");
  }
}

// ... (draw() 和其他函數保持不變)

// ------------------- 主要繪圖迴圈 -------------------
function draw() {
  background(20); // 深色背景

  // 游標特效
  drawCustomCursor();

  // 根據測驗狀態繪製不同畫面
  if (quizState === 'QUIZ') {
    drawQuiz();
  } else if (quizState === 'RESULT') {
    drawResultScreen();
  }

  // 選項選取特效 (如果正在進行)
  drawSelectionEffect();
}

// ------------------- 繪製測驗畫面 -------------------
function drawQuiz() {
  if (currentQuestionIndex >= questions.length) {
    // 題目全部答完，切換到結果畫面
    quizState = 'RESULT';
    return;
  }

  let q = questions[currentQuestionIndex];
  
  // 顯示題目
  fill(255);
  textSize(24);
  textAlign(CENTER, CENTER);
  text(`第 ${currentQuestionIndex + 1} 題 / 共 ${questions.length} 題`, width / 2, 50);
  textSize(32);
  text(q.question, width / 2, height / 4);

  // 繪製選項按鈕 (三個選項)
  let buttonH = 60; // 按鈕高度
  let buttonW = 400; // 按鈕寬度
  let startY = height / 2 - buttonH * 1.5; // 起始 Y 座標
  let spacing = buttonH + 20; // 間距

  for (let i = 0; i < q.options.length; i++) {
    let x = width / 2 - buttonW / 2;
    let y = startY + i * spacing;
    let optionText = q.options[i];
    
    // 檢查滑鼠是否懸停
    let isHover = mouseX > x && mouseX < x + buttonW && mouseY > y && mouseY < y + buttonH;

    // 繪製選項框
    rectMode(CORNER);
    noStroke();
    
    if (isHover) {
      // 懸停時的顏色和游標特效
      fill(50, 150, 255, 200); // 淺藍色半透明
      customCursorColor = color(50, 255, 50); // 游標變綠
    } else {
      fill(50); // 預設深灰色
      customCursorColor = color(255, 100, 150); // 游標變回預設色
    }
    
    rect(x, y, buttonW, buttonH, 10); // 圓角矩形

    // 繪製選項文字
    fill(255);
    textSize(20);
    textAlign(CENTER, CENTER);
    text(optionText, x + buttonW / 2, y + buttonH / 2);
    
    // 存儲選項的邊界供 mousePressed 使用
    q.options[i].bounds = { x, y, w: buttonW, h: buttonH };
  }
}

// ------------------- 繪製結果畫面 -------------------
function drawResultScreen() {
  let finalScore = score;
  let totalQuestions = questions.length;
  let percentage = (finalScore / totalQuestions) * 100;
  
  fill(255);
  textSize(48);
  textAlign(CENTER, CENTER);
  text("測驗結束！", width / 2, height / 4);
  
  textSize(36);
  text(`您的成績: ${finalScore} / ${totalQuestions} 題`, width / 2, height / 4 + 80);
  
  textSize(30);
  // 根據分數百分比顯示不同的動畫或訊息
  if (percentage === 100) {
    // 100 分：稱讚的動態畫面
    text("🎉 太棒了！完美無瑕！ 🎉", width / 2, height / 2);
    drawConfettiAnimation(); // 彩帶特效
  } else if (percentage >= 60) {
    // 及格：鼓勵的動態畫面 A
    text("👍 表現優異！繼續努力！ 👍", width / 2, height / 2);
    drawSparkleAnimation(); // 閃光特效
  } else {
    // 不及格：鼓勵的動態畫面 B
    text("😊 沒關係，再試一次！ 😊", width / 2, height / 2);
    drawPulseAnimation(); // 脈衝鼓勵特效
  }
}

// ------------------- 滑鼠點擊事件 -------------------
function mousePressed() {
  if (quizState !== 'QUIZ') return;

  let q = questions[currentQuestionIndex];
  let buttonH = 60;
  let buttonW = 400;
  let startY = height / 2 - buttonH * 1.5;
  let spacing = buttonH + 20;

  for (let i = 0; i < q.options.length; i++) {
    let x = width / 2 - buttonW / 2;
    let y = startY + i * spacing;
    let h = buttonH;
    let w = buttonW;

    if (mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h) {
      // 點擊了選項
      let selectedAnswer = q.options[i];

      // 觸發選取特效
      selectionEffectTime = millis();
      selectionEffectTarget = i;

      // 判斷答案並計分
      if (selectedAnswer === q.correctAnswer) {
        score++;
      }

      // 延遲後跳到下一題 (讓特效有時間顯示)
      setTimeout(() => {
        currentQuestionIndex++;
      }, 500); // 延遲 500 毫秒

      break;
    }
  }
}

// ------------------- 特效函數 -------------------

// 1. 自訂游標 (Cursor) 特效
function drawCustomCursor() {
  // 跟隨滑鼠的自訂圓形游標
  let size = 15;
  let trailLength = 5; // 軌跡長度
  
  // 繪製游標本身
  noStroke();
  fill(customCursorColor);
  ellipse(mouseX, mouseY, size, size);
  
  // 繪製簡單的軌跡 (使用 translate/rotate 或簡單的透明度圓形)
  for(let i = 0; i < trailLength; i++) {
    let prevX = lerp(mouseX, pmouseX, (i + 1) / trailLength);
    let prevY = lerp(mouseY, pmouseY, (i + 1) / trailLength);
    
    // 軌跡變淡變小
    fill(customCursorColor, map(i, 0, trailLength, 150, 0)); 
    ellipse(prevX, prevY, size * map(i, 0, trailLength, 1, 0.5), size * map(i, 0, trailLength, 1, 0.5));
  }
}

// 2. 選取選項時的特效
function drawSelectionEffect() {
  if (selectionEffectTarget === -1) return;
  
  let q = questions[currentQuestionIndex];
  if (currentQuestionIndex >= questions.length) return; // 避免在結果畫面出錯

  let elapsed = millis() - selectionEffectTime;
  let duration = 500; // 特效持續時間 0.5 秒

  if (elapsed < duration) {
    let buttonH = 60;
    let buttonW = 400;
    let startY = height / 2 - buttonH * 1.5;
    let spacing = buttonH + 20;
    
    let targetY = startY + selectionEffectTarget * spacing;
    let targetX = width / 2 - buttonW / 2;

    // 效果：擴散光環
    let alpha = map(elapsed, 0, duration, 255, 0); // 顏色漸變透明
    let effectSize = map(elapsed, 0, duration, buttonW, buttonW + 50); // 擴散尺寸

    // 檢查答案以決定顏色
    let selectedAnswer = q.options[selectionEffectTarget];
    let effectColor = (selectedAnswer === q.correctAnswer) ? color(0, 255, 0, alpha) : color(255, 0, 0, alpha); // 綠色/紅色

    noFill();
    stroke(effectColor);
    strokeWeight(map(elapsed, 0, duration, 5, 0)); // 邊框逐漸變細
    rect(targetX - (effectSize - buttonW) / 2, targetY - (effectSize - buttonH) / 2, effectSize, effectSize, 15);

  } else {
    // 特效結束，重置
    selectionEffectTarget = -1;
  }
}

// 3. 稱讚的動畫：彩帶特效 (簡化版)
function drawConfettiAnimation() {
  for (let i = 0; i < 50; i++) {
    // 模擬粒子位置、大小和顏色
    let x = (noise(i * 0.1, frameCount * 0.05) * width) + sin(frameCount * 0.1 + i) * 50;
    let y = (noise(i * 0.1 + 10, frameCount * 0.05) * height) + cos(frameCount * 0.1 + i) * 50;
    let size = 5 + sin(frameCount * 0.2 + i) * 3;
    
    // 隨機鮮豔顏色
    let c = color(map(i, 0, 50, 0, 360), 80, 100); 
    colorMode(HSB, 360, 100, 100);
    fill(c);
    noStroke();
    
    // 旋轉的矩形模擬彩帶
    push();
    translate(x, y);
    rotate(frameCount * 0.05 + i * 0.5);
    rect(0, 0, size * 2, size / 2);
    pop();
    colorMode(RGB, 255); // 恢復 RGB 模式
  }
}

// 4. 及格的動畫：閃光特效 (簡化版)
function drawSparkleAnimation() {
  let cx = width / 2;
  let cy = height / 2 + 50;
  
  // 閃爍光環
  let pulse = sin(frameCount * 0.1) * 20 + 50; // 脈衝半徑
  
  noFill();
  stroke(255, 255, 0, 150 + sin(frameCount * 0.2) * 100); // 閃爍透明度的黃色
  strokeWeight(5);
  ellipse(cx, cy, pulse * 2, pulse * 2);
  
  // 星星點綴
  for (let i = 0; i < 10; i++) {
    let angle = TWO_PI / 10 * i + frameCount * 0.02;
    let r = 100 + sin(frameCount * 0.1) * 30;
    let starX = cx + cos(angle) * r;
    let starY = cy + sin(angle) * r;
    
    fill(255, 200, 50, 200);
    noStroke();
    ellipse(starX, starY, 10);
  }
}

// 5. 不及格的動畫：脈衝鼓勵特效 (簡化版)
function drawPulseAnimation() {
  let cx = width / 2;
  let cy = height / 2 + 50;
  
  // 緩慢擴張的心跳或脈衝
  let pulseSize = map(sin(frameCount * 0.05), -1, 1, 150, 200); 
  
  fill(100, 150, 255, 50); // 溫和的藍色半透明
  noStroke();
  ellipse(cx, cy, pulseSize, pulseSize);
  
  // 中心文字提示
  fill(255);
  textSize(20);
  text("您已完成所有挑戰，隨時可以再次嘗試！", cx, cy);
}

// ------------------- 其他 -------------------
function windowResized() {
  // resizeCanvas(windowWidth, windowHeight); // 如果需要響應式設計可以啟用
}
