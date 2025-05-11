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
      sort: true,
      onAdd: function (evt) {
        // 無需處理拖入 bucket 的邏輯
      },
      onRemove: function (evt) {
        // 只在目標是 pool 時刪除複製品
        if (evt.to === pool) {
          const value = evt.item.dataset.value;
          const disabledClones = pool.querySelectorAll('.number-block.disabled');
          for (const clone of disabledClones) {
            if (clone.dataset.value === value) {
              clone.remove();
              // 恢復可再拖曳
              evt.item.dataset.fromPool = "true";
              break;
            }
          }
        }
      }
      
    });
    
  }

    // Pool（數字池）拖曳設定
  Sortable.create(pool, {
    group: 'shared',
    animation: 150,
    sort: false,
    filter: ".disabled",
    onAdd: function (evt) {
      const block = evt.item;
    
      // 只處理 bucket ➝ pool 的情況（fromPool == false）
      if (block.dataset.fromPool === "false") {
        const index = parseInt(block.dataset.originalIndex);
        const blocks = Array.from(pool.children);
    
        // 找到要插入的位置
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
      // 判斷是否從 pool 拖出去
      const block = evt.item;
      if (evt.from === pool && evt.to !== pool && block.dataset.fromPool === "true") {
        // 建立複製品留在原位
        const clone = block.cloneNode(true);
        clone.classList.add('disabled');
        clone.draggable = false;
        clone.dataset.disabled = "true";
        pool.insertBefore(clone, pool.children[evt.oldIndex]);

        // 標記已拖出（防止再次複製）
        block.dataset.fromPool = "false";
      }
    }
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
  arr.forEach((num, index) => {
    const block = document.createElement('div');
    block.className = 'number-block';
    block.textContent = num;
    block.dataset.value = num;
    block.dataset.originalIndex = index;

    // 自訂標記為原始來源
    block.dataset.fromPool = "true";

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
    show_modal("錯誤", "請將所有數字放入桶子中！");
    // alert("請將所有數字放入桶子中！");
    return;
  }

  const isCorrect = isStableSorted(collected, numbers, phase);

  if (isCorrect) {
    if (phase === 3) {
      clearInterval(timer);
      show_modal("恭喜!", `🎉 全部排序完成！總時間：${elapsed} 秒`);
      // alert(`🎉 全部排序完成！總時間：${elapsed} 秒`);
    } else {
      show_modal("完成", `✅ ${digitLabels[phase]} 排序正確，進入 ${digitLabels[phase + 1]}`);
      // alert(`✅ ${digitLabels[phase]} 排序正確，進入 ${digitLabels[phase + 1]}`);
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
    show_modal("錯誤", `❌ ${digitLabels[phase]} 排序錯誤，已加時 5 秒`);
    // alert(`❌ ${digitLabels[phase]} 排序錯誤，已加時 5 秒`);
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
