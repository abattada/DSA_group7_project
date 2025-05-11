// DOM 元素
const pool = document.getElementById('pool');
const bucketsContainer = document.getElementById('buckets');
const timerDisplay = document.getElementById('timer');
const phaseDisplay = document.getElementById('phase');
//const startModal = new bootstrap.Modal(document.getElementById('startModal'));
const startGameButton = document.getElementById('startGameButton');
const returnButton = document.getElementById('returnButton');
const submitButton = document.getElementById('submitButton');
const scoreBoard = document.getElementById('scoreBoard');
const bucket_title = document.getElementById('bucket_title');

// 遊戲狀態變數
let numbers = [];
let elapsed = 0;
let timer;
let phase = 0;
let numberOfNumbers = 30;
let numbersOfDifficulty = [5, 10, 15]; // easy, medium, hard
let maxNumber = 9999; // 根據難度變化
let playerName = '';

const digitLabels = ['個位數', '十位數', '百位數', '千位數'];

function getDigit(num, place) {
  return Math.floor(num / Math.pow(10, place)) % 10;
}
function getDifficulty() {
  const difficulty = document.getElementById('difficulty').value;
  return difficulty === 'easy' ? 0 : difficulty === 'medium' ? 1 : 2;
}

function updateScoreBoard() {
  const all_scores = JSON.parse(localStorage.getItem('radixScores') || '[[],[],[]]');
  const scores = all_scores[getDifficulty()];
  scores.sort((a, b) => a.time - b.time);
  scoreBoard.innerHTML = '';
  scores.forEach(score => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.textContent = `${score.name}: ${score.time} 秒`;
    scoreBoard.appendChild(li);
  });
}

function saveScore(name, time) {
  const all_scores = JSON.parse(localStorage.getItem('radixScores') || '[[],[],[]]');
  all_scores[getDifficulty()].push({ name, time });
  localStorage.setItem('radixScores', JSON.stringify(all_scores));
}

startGameButton.addEventListener('click', () => {
  const nameInput = document.getElementById('playerName');
  const difficultyInput = document.getElementById('difficulty');

  if (!nameInput.value || !difficultyInput.value) return;

  playerName = nameInput.value;
  const difficulty = difficultyInput.value;
  maxNumber = difficulty === 'easy' ? 99 : difficulty === 'medium' ? 999 : 9999;
  showGame();
  startGame();
});

returnButton.addEventListener('click', () => {
  hideGame();
});

function startGame() {
  phase = 0;
  const difficulty = getDifficulty();
  numberOfNumbers = numbersOfDifficulty[difficulty];
  numbers = Array.from({ length: numberOfNumbers }, () => Math.floor(Math.random() * maxNumber) + 1);
  renderPool(numbers);


  bucket_title.style.display = 'block';
  bucketsContainer.style.display = 'flex';
  submitButton.style.display = 'block';
  returnButton.style.display = "none";
  bucketsContainer.innerHTML = '';


  for (let i = 0; i < 10; i++) {
    const container = document.createElement('div');
    container.className = 'bucket-container';

    const bucket = document.createElement('div');
    bucket.className = 'bucket';
    bucket.id = `bucket-${i}`;

    const label = document.createElement('div');
    label.className = 'bucket-label';
    label.textContent = i;

    container.appendChild(bucket);
    container.appendChild(label);
    bucketsContainer.appendChild(container);

    Sortable.create(bucket, {
      group: 'shared',
      animation: 150,
      sort: true,
      onAdd: () => {},
      onRemove: function (evt) {
        if (evt.to === pool) {
          const value = evt.item.dataset.value;
          const disabledClones = pool.querySelectorAll('.number-block.disabled');
          for (const clone of disabledClones) {
            if (clone.dataset.value === value) {
              clone.remove();
              evt.item.dataset.fromPool = "true";
              break;
            }
          }
        }
      }
    });
  }
  if (Sortable.get(pool)) {
    Sortable.get(pool).destroy();
  }
  Sortable.create(pool, {
    group: 'shared',
    animation: 150,
    sort: false,
    filter: ".disabled",
    onAdd: function (evt) {
      const block = evt.item;
      if (block.dataset.fromPool === "false") {
        const index = parseInt(block.dataset.originalIndex);
        const blocks = Array.from(pool.children);
        let insertBefore = null;
        for (let i = 0; i < blocks.length; i++) {
          const b = blocks[i];
          const bi = parseInt(b.dataset.originalIndex);
          if (!isNaN(bi) && bi > index) {
            insertBefore = b;
            break;
          }
        }
        pool.insertBefore(block, insertBefore);
      }
    },
    onEnd: function (evt) {
      const block = evt.item;
      if (evt.from === pool && evt.to !== pool && block.dataset.fromPool === "true") {
        const clone = block.cloneNode(true);
        clone.classList.add('disabled');
        clone.draggable = false;
        clone.dataset.disabled = "true";
        pool.insertBefore(clone, pool.children[evt.oldIndex]);
        block.dataset.fromPool = "false";
      }
    }
  });

  clearInterval(timer);
  elapsed = 0;
  timerDisplay.textContent = `時間：0 秒`;
  phaseDisplay.textContent = `目前排序：${digitLabels[phase]}`;
  timer = setInterval(() => {
    const myModalElement = document.getElementById('myModal');
    const myModal = bootstrap.Modal.getOrCreateInstance(myModalElement);
    if (myModal._isShown) {
      return;
    }
    elapsed++;
    timerDisplay.textContent = `時間：${elapsed} 秒`;
  }, 1000);
}

function renderPool(arr) {
  pool.innerHTML = '';
  arr.forEach((num, index) => {
    const block = document.createElement('div');
    block.className = 'number-block';
    block.textContent = num.toString().padStart(4, '0');
    block.dataset.value = num;
    block.dataset.originalIndex = index;
    block.dataset.fromPool = "true";
    pool.appendChild(block);
  });
}

function submit() {
  let collected = [];
  let correctBucket = true;

  for (let i = 0; i < 10; i++) {
    const bucket = document.getElementById(`bucket-${i}`);
    const blocks = [...bucket.children];

    for (let block of blocks) {
      const value = parseInt(block.dataset.value);
      const expectedDigit = getDigit(value, phase);
      if (expectedDigit !== i) correctBucket = false;
      collected.push(value);
    }
  }

  const isCorrect = isStableSorted(collected, numbers, phase);

  if (isCorrect && collected.length == numberOfNumbers && correctBucket) {
    let wait_model;
    if (phase === 3 || maxNumber <= 999 && phase === 2 || maxNumber <= 99 && phase === 1) {
      clearInterval(timer);
      wait_model = show_modal("恭喜!", `🎉 全部排序完成！總時間：${elapsed} 秒`);
      phaseDisplay.textContent = '排序完成！';
      numbers = collected.slice();
      renderPool(numbers);  // 顯示最終排序
      bucketsContainer.style.display = 'none';  // 隱藏桶
      bucket_title.style.display = 'none'
      submitButton.style.display = 'none';
      returnButton.style.display = 'block';

      wait_model.then(() => {
        saveScore(playerName, elapsed);
        updateScoreBoard();
      });
    } else {
      wait_model = show_modal("完成", `✅ ${digitLabels[phase]} 排序正確，進入 ${digitLabels[phase + 1]}`);
      //wait_model.then(() => {
        numbers = collected.slice();
        renderPool(numbers);
        clearBuckets();
        phase++;
        phaseDisplay.textContent = `目前排序：${digitLabels[phase]}`;
      //});
    }
  } else {
    elapsed += 30;
    show_modal("錯誤", `❌ ${digitLabels[phase]} 排序錯誤，已加時 30 秒`);
  }
}

function isStableSorted(current, original, digitPlace) {
  const expected = [...original].sort((a, b) => getDigit(a, digitPlace) - getDigit(b, digitPlace));
  return expected.every((val, idx) => val === current[idx]);
}

function clearBuckets() {
  for (let i = 0; i < 10; i++) {
    document.getElementById(`bucket-${i}`).innerHTML = '';
  }
}

function showGame(){
  document.getElementById("game_area").style.display = "block";
  document.getElementById("start_area").style.display = "none";
}

function hideGame(){
  document.getElementById("game_area").style.display = "none";
  document.getElementById("start_area").style.display = "block";
}

// 初始顯示排行榜與表單
updateScoreBoard();
hideGame();

document.getElementById("difficulty").addEventListener("change", updateScoreBoard);