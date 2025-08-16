
const data = [
  {
    name: 'Alice',
    children: [
      { name: 'Bob' },
      { name: 'Charlie' },
      { name: 'David', children: [{ name: 'Eve' }, { name: 'Frank' }] },
      { name: 'Grace', children: [{ name: 'Heidi', children: [{ name: 'Ivy' }, { name: 'Jack'  }] }]},
    ]
  },
  {
    name: 'Zoe',
    children: [
      { name: 'Kathy' },
      { name: 'Liam', children: [{ name: 'Mia' }, { name: 'Noah' }] },
      { name: 'Olivia', children: [{ name: 'Paul' }, { name: 'Quinn' }] },
    ]
  },
  { name: 'Rita', children: [{ name: 'Sam' }, { name: 'Tina' }] },
  { name: 'Uma', children: [{ name: 'Vera' }, { name: 'Will' }] },
  { name: 'Xander' },
];

const treeRoot = document.getElementById('app');

function renderTree(nodes, container) {
  const ul = document.createElement('ul');
  ul.setAttribute('role', 'group');
  
  nodes.forEach((node) => {
    const li = document.createElement('li');
    li.className = 'tree-node';

    const hasChildren = Array.isArray(node.children) && node.children.length > 0;

    const nodeWrap = document.createElement('div');
    nodeWrap.className = 'node';
    nodeWrap.setAttribute('role', 'treeitem');
    nodeWrap.tabIndex = 0;
    if (hasChildren) {
      nodeWrap.setAttribute('aria-expanded', 'false');
    }

    const caret = document.createElement('div');
    caret.className = 'caret';
    caret.tilte = hasChildren ? 'Expand/Collapse' : '';

    if (!hasChildren) {
      caret.style.visibility = 'hidden';
    }

    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = node.name;

    nodeWrap.appendChild(caret);
    nodeWrap.appendChild(label);
    
    li.appendChild(nodeWrap);

    if (hasChildren) {
      const childContainer = renderTree(node.children, li);
      childContainer.classList.add('hidden');
      li.appendChild(childContainer);

      const toggle = () => {
        const isExpanded = nodeWrap.getAttribute('aria-expanded') === 'true';
        nodeWrap.setAttribute('aria-expanded', !isExpanded);
        childContainer.classList.toggle('hidden', isExpanded);
        caret.classList.toggle('caret-down', !isExpanded);
      }

      caret.addEventListener('click', (e) => {
        e.stopPropagation();
        toggle();
      });

      nodeWrap.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    }

    ul.appendChild(li)

  })
  container.appendChild(ul);
  return ul;
}

renderTree(data, treeRoot);