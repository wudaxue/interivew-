Promise
```js
  let sequence = Promise.resolve(); // 初始空任务链
  const results = []; // 按顺序保存结果

  function fetchData(id) {
    return new Promise((resolve) => {
      const delay = Math.random() * 2000;
      setTimeout(() => resolve(`数据-${id}`), delay);
    });
  }

  function handleClick(id) {
    const p = fetchData(id);

    // 将处理逻辑串联在 sequence 上
    sequence = sequence
      .then(() => p)
      .then((data) => {
        results.push(data);
        console.log('✅ 按顺序更新 UI:', data);
        updateUI(results);
      })
      .catch(console.error);
  }

  function updateUI(data) {
    console.log('当前 UI 数据:', data);
  }

  // 模拟点击按钮
  handleClick(1);
  handleClick(2);
  handleClick(3);

```

非promise
```js
  const queue = [];
  const results = [];
  let processing = false;

  function fetchData(id, callback) {
    const delay = Math.random() * 2000;
    setTimeout(() => callback(`数据-${id}`), delay);
  }

  function handleClick(id) {
    const task = { id, done: false, data: null };
    queue.push(task);

    fetchData(id, (data) => {
      task.done = true;
      task.data = data;
      processQueue();
    });
  }

  function processQueue() {
    if (processing) return;
    processing = true;

    (function next() {
      const first = queue[0];
      if (!first || !first.done) {
        processing = false;
        return;
      }

      // 处理队头
      results.push(first.data);
      console.log('✅ 按顺序更新 UI:', first.data);
      updateUI(results);

      // 移除已处理任务
      queue.shift();

      // 递归处理下一个
      next();
    })();
  }

  function updateUI(data) {
    console.log('当前 UI 数据:', data);
  }

  // 模拟点击
  handleClick(1);
  handleClick(2);
  handleClick(3);
```


