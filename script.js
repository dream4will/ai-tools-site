let tools = []; // 用于存储所有工具数据的原始列表

// 1. 初始化：获取数据，填充分类，并设置事件监听
fetch('tools.json')
  .then(res => res.json())
  .then(data => {
    tools = data;
    populateCategories(tools); // 填充分类下拉菜单
    renderTools(tools); // 初始渲染所有工具
    setupEventListeners(); // 设置筛选事件的监听
  })
  .catch(error => {
    console.error("在获取或解析 tools.json 时发生错误:", error);
  });

// 2. 动态填充分类下拉菜单
function populateCategories(toolList) {
  const categoryFilter = document.getElementById('categoryFilter');
  if (!categoryFilter) return; 

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
}

// 3. 统一设置事件监听
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
}

// 4. 应用所有筛选条件并重新渲染
function applyFilters() {
  const keyword = document.getElementById('searchInput').value.toLowerCase();
  const selectedCategory = document.getElementById('categoryFilter').value;

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
  
  renderTools(filteredTools);
}

// 5. 渲染工具卡片的函数 (已移除“推荐”行)
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
