console.log("脚本开始运行。");

let tools = []; 

fetch('tools.json')
  .then(res => {
    console.log("1. fetch 'tools.json' 成功，服务器响应:", res);
    if (!res.ok) {
        console.error("错误：服务器未能正常返回 tools.json。状态码: " + res.status);
    }
    return res.json();
  })
  .then(data => {
    console.log("2. 成功解析 JSON 数据，获取到的工具数量:", data.length);
    tools = data;
    populateCategories(tools);
    renderTools(tools);
    setupEventListeners();
  })
  .catch(error => {
    console.error("在获取或解析 tools.json 时发生严重错误:", error);
  });

function populateCategories(toolList) {
  console.log("3. 正在执行 populateCategories 函数，填充下拉菜单...");
  const categoryFilter = document.getElementById('categoryFilter');
  if (!categoryFilter) {
      console.error("错误：在HTML中找不到 id 为 'categoryFilter' 的元素。");
      return;
  }
  const categories = new Set();
  toolList.forEach(tool => {
    tool.category.split(',').forEach(cat => {
      categories.add(cat.trim());
    });
  });
  categoryFilter.innerHTML = ''; // 清空旧选项
  
  const allOption = document.createElement('option');
  allOption.value = '所有分类';
  allOption.textContent = '所有分类';
  categoryFilter.appendChild(allOption);

  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
  console.log("下拉菜单填充完毕。");
}

function setupEventListeners() {
    console.log("4. 正在执行 setupEventListeners 函数，为筛选控件添加监听...");
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
        console.log("已为搜索框添加 'input' 监听。");
    } else {
        console.error("错误：找不到 id 为 'searchInput' 的元素。");
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
        console.log("已为分类下拉菜单添加 'change' 监听。");
    } else {
        console.error("错误：找不到 id 为 'categoryFilter' 的元素（在 setupEventListeners 中）。");
    }
}

function applyFilters() {
  console.log("--- 筛选操作触发 ---");
  const keyword = document.getElementById('searchInput').value.toLowerCase();
  const selectedCategory = document.getElementById('categoryFilter').value;
  console.log(`当前筛选条件 -> 分类: "${selectedCategory}", 关键词: "${keyword}"`);
  
  let filteredTools = tools;

  if (selectedCategory && selectedCategory !== '所有分类') {
    filteredTools = filteredTools.filter(tool => 
        tool.category.split(',').map(c => c.trim()).includes(selectedCategory)
    );
  }

  if (keyword) {
    filteredTools = filteredTools.filter(t =>
      t.name.toLowerCase().includes(keyword) ||
      t.category.toLowerCase().includes(keyword) ||
      t.description.toLowerCase().includes(keyword)
    );
  }
  
  console.log(`筛选完毕，找到 ${filteredTools.length} 个结果。正在重新渲染页面...`);
  renderTools(filteredTools);
}

function renderTools(toolList) {
  const container = document.getElementById('toolContainer');
  container.innerHTML = "";
  toolList.forEach(tool => {
    const card = document.createElement('div');
    card.className = 'tool-card';
    
    let logoHtml = ''; // 默认Logo为空

    try {
      // 尝试从链接创建 logo
      const toolDomain = new URL(tool.link).hostname;
      const logoUrl = `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${toolDomain}&size=64`;
      logoHtml = `<div class="tool-logo-circle"><img src="${logoUrl}" alt="${tool.name} Logo"></div>`;
    } catch (e) {
      // 如果 tool.link 无效，则执行这里的代码
      console.warn(`工具 "${tool.name}" 的链接 "${tool.link}" 无效，无法生成Logo。`);
      // 创建一个默认的文字Logo作为备用
      const initial = tool.name.charAt(0).toUpperCase();
      logoHtml = `<div class="tool-logo-circle" style="display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:bold;background-color:#eee;">${initial}</div>`;
    }

    // 构建卡片内部的 HTML 结构
    card.innerHTML = `
      ${logoHtml}
      <h3><a href="${tool.link}" target="_blank" rel="noopener noreferrer">${tool.name}</a></h3>
      <div class="card-info-details">
        <p><strong>分类：</strong>${tool.category}</p>
        <p><strong>受众：</strong>${tool.audience}</p>
        <p><strong>推荐：</strong>${tool.rating}</p>
        <p><strong>平台：</strong>${tool.platform}</p>
        <p><strong>价格：</strong>${tool.free} / ${tool.price}</p>
        <p><strong>难度：</strong>${tool.difficulty}</p>
      </div>
      <p class="card-description">${tool.description}</p>
      <a href="${tool.link}" target="_blank" rel="noopener noreferrer" class="card-button">访问网站</a>
      `;
      
    container.appendChild(card);
  });
}