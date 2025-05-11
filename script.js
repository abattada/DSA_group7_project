const pool = document.getElementById('pool');
const bucketsContainer = document.getElementById('buckets');
const timerDisplay = document.getElementById('timer');
const phaseDisplay = document.getElementById('phase');

let numbers = [];
let elapsed = 0;
let timer;
let phase = 0;
const digitLabels = ['個位數', '十位數', '百位數', '千位數'];

function getDigit(num, place) {
  return Math.floor(num / Math.pow(10, place)) % 10;
}

function startGame() {
  numbers = Array.from({ length: 10 }, () => Math.floor(Math.random() * 9999) + 1);
  renderPool(numbers);
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
      sort: true
    });
  }

  Sortable.create(pool, {
    group: 'shared',
    animation: 150,
    sort: false
  });

  clearInterval(timer);
  elapsed = 0;
  timerDisplay.textContent = `時間：0 秒`;
  timer = setInterval(() => {
    elapsed++;
    timerDisplay.textContent = `時間：${elapsed} 秒`;
  }, 1000);
}

function renderPool(arr) {
  pool.innerHTML = '';
  arr.forEach(num => {
    const block = document.createElement('div');
    block.className = 'number-block';
    block.textContent = num;
    block.dataset.value = num;
    pool.appendChild(block);
  });
}

function submit() {
  let collected = [];

  for (let i = 0; i < 10; i++) {
    const bucket = document.getElementById(`bucket-${i}`);
    const blocks = [...bucket.children].reverse();
    for (let block of blocks) {
      collected.push(parseInt(block.dataset.value));
    }
  }

  if (collected.length !== numbers.length) {
    alert("請將所有數字放入桶子中！");
    return;
  }

  const isCorrect = isStableSorted(collected, numbers, phase);

  if (isCorrect) {
    if (phase === 3) {
      clearInterval(timer);
      alert(`🎉 全部排序完成！總時間：${elapsed} 秒`);
    } else {
      alert(`✅ ${digitLabels[phase]} 排序正確，進入 ${digitLabels[phase + 1]}`);
    }

    numbers = collected.slice();
    renderPool(numbers);
    clearBuckets();
    phase++;
    if (phase < 4) {
      phaseDisplay.textContent = `目前排序：${digitLabels[phase]}`;
    }
  } else {
    elapsed += 5;
    alert(`❌ ${digitLabels[phase]} 排序錯誤，已加時 5 秒`);
  }
}

function isStableSorted(current, original, digitPlace) {
  const expected = [...original].sort((a, b) => {
    return getDigit(a, digitPlace) - getDigit(b, digitPlace);
  });
  return expected.every((val, idx) => val === current[idx]);
}

function clearBuckets() {
  for (let i = 0; i < 10; i++) {
    document.getElementById(`bucket-${i}`).innerHTML = '';
  }
}

startGame();
