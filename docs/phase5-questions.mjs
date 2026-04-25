// Phase 5 — Graphs cluster (15 problems)

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function randInt(r, lo, hi) {
  return Math.floor(r() * (hi - lo + 1)) + lo;
}

export const phase5Questions = [];
function add(q) { phase5Questions.push(q); }

// 1. Clone Graph
add({
  id: "clone-graph",
  leetcode_number: 133,
  title: "Clone Graph",
  difficulty: "Medium",
  categories: ["Graph", "BFS", "DFS", "Hash Table"],
  sources: ["Blind 75", "LeetCode Top Interview 150"],
  prompt:
    "Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph. The graph is represented here as `{ nodes: number[], adj: number[][] }` where `adj[i]` is the list of neighbor indices of node i. The output uses the same canonical form, with neighbor lists sorted ascending.",
  constraints: ["0 <= n <= 100", "Node values are unique.", "Graph is connected and undirected."],
  hints: [
    "BFS from the start node, building a hash map original→clone as you go.",
    "When visiting a neighbor, create its clone if absent and link parent→clone.",
    "DFS works equally well; the hash map is the key to avoiding infinite loops.",
  ],
  optimal: { time: "O(n + e)", space: "O(n)", approach: "BFS with original→clone map." },
  alternatives: [{ approach: "Recursive DFS", time: "O(n + e)", space: "O(n)" }],
  pitfalls: ["Linking neighbors before checking the map (creates duplicates).", "Skipping back-edges (graph is undirected — you'll re-encounter parent)."],
  followups: ["Clone a directed graph.", "Clone with self-loops."],
  signature: { fn: "cloneGraphRoundTrip", params: [{ name: "graph", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`class Node { val: number; neighbors: Node[]; constructor(v: number, n: Node[] = []) { this.val = v; this.neighbors = n; } }
function cloneGraph(node: Node | null): Node | null {
  if (!node) return null;
  const map = new Map<Node, Node>();
  const dfs = (n: Node): Node => {
    if (map.has(n)) return map.get(n)!;
    const clone = new Node(n.val);
    map.set(n, clone);
    for (const nb of n.neighbors) clone.neighbors.push(dfs(nb));
    return clone;
  };
  return dfs(node);
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { graph: { nodes: [1,2,3,4], adj: [[1,3],[0,2],[1,3],[0,2]] } } });
    t.push({ name: "example-2-single", category: "example", input: { graph: { nodes: [1], adj: [[]] } } });
    t.push({ name: "example-3-empty", category: "example", input: { graph: { nodes: [], adj: [] } } });
    t.push({ name: "edge-two-nodes", category: "edge", input: { graph: { nodes: [1,2], adj: [[1],[0]] } } });
    t.push({ name: "edge-line", category: "edge", input: { graph: { nodes: [1,2,3,4,5], adj: [[1],[0,2],[1,3],[2,4],[3]] } } });
    t.push({ name: "edge-cycle-3", category: "edge", input: { graph: { nodes: [1,2,3], adj: [[1,2],[0,2],[0,1]] } } });
    const r = rng(501);
    const n = 100;
    const adj = Array.from({length:n},()=>[]);
    for (let i = 1; i < n; i++) {
      const j = randInt(r, 0, i - 1);
      adj[i].push(j); adj[j].push(i);
    }
    for (let i = 0; i < 200; i++) {
      const a = randInt(r, 0, n - 1), b = randInt(r, 0, n - 1);
      if (a !== b && !adj[a].includes(b)) { adj[a].push(b); adj[b].push(a); }
    }
    for (let i = 0; i < n; i++) adj[i].sort((a,b)=>a-b);
    t.push({ name: "stress-100-random-connected", category: "stress", input: { graph: { nodes: Array.from({length:n},(_,i)=>i+1), adj } } });
    return t;
  },
});

// 2. Pacific Atlantic Water Flow
add({
  id: "pacific-atlantic-water-flow",
  leetcode_number: 417,
  title: "Pacific Atlantic Water Flow",
  difficulty: "Medium",
  categories: ["Matrix", "BFS", "DFS"],
  sources: ["Blind 75"],
  prompt:
    "Given an m x n matrix `heights` representing land elevations, water flows from a cell to a neighboring cell only if the neighbor's height is less than or equal. The Pacific touches the top and left edges; the Atlantic touches the bottom and right. Return all coordinates [r,c] where rain water can flow to BOTH oceans. The reference returns coordinates in row-major order (any-order accepted via comparator).",
  constraints: ["1 <= m, n <= 200", "0 <= heights[i][j] <= 10^5"],
  hints: [
    "Reverse the question: do BFS/DFS from the ocean borders inward, requiring height to NOT decrease.",
    "Compute two reachability sets (Pacific and Atlantic) and intersect them.",
  ],
  optimal: { time: "O(m*n)", space: "O(m*n)", approach: "Multi-source BFS from each ocean's border cells." },
  alternatives: [{ approach: "DFS from each border cell", time: "O(m*n)", space: "O(m*n)" }],
  pitfalls: ["Forgetting that water flows on equal heights.", "Doing forward flow from each cell — O((mn)^2)."],
  followups: ["3D version with elevation matrix."],
  signature: { fn: "pacificAtlantic", params: [{ name: "heights", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "setOfArrays",
  solutionTs:
`function pacificAtlantic(heights: number[][]): number[][] {
  if (!heights.length || !heights[0].length) return [];
  const m = heights.length, n = heights[0].length;
  const pac = Array.from({length:m}, () => new Array<boolean>(n).fill(false));
  const atl = Array.from({length:m}, () => new Array<boolean>(n).fill(false));
  const dirs: [number,number][] = [[1,0],[-1,0],[0,1],[0,-1]];
  const bfs = (starts: [number,number][], vis: boolean[][]) => {
    const q: [number,number][] = starts.slice();
    for (const [r,c] of starts) vis[r][c] = true;
    while (q.length) {
      const [r,c] = q.shift()!;
      for (const [dr,dc] of dirs) {
        const nr = r+dr, nc = c+dc;
        if (nr<0||nc<0||nr>=m||nc>=n||vis[nr][nc]) continue;
        if (heights[nr][nc] < heights[r][c]) continue;
        vis[nr][nc] = true;
        q.push([nr,nc]);
      }
    }
  };
  const ps: [number,number][] = [], as: [number,number][] = [];
  for (let i = 0; i < m; i++) { ps.push([i,0]); as.push([i,n-1]); }
  for (let j = 0; j < n; j++) { ps.push([0,j]); as.push([m-1,j]); }
  bfs(ps, pac); bfs(as, atl);
  const out: number[][] = [];
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (pac[i][j] && atl[i][j]) out.push([i,j]);
  return out;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { heights: [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]] } });
    t.push({ name: "example-2-single", category: "example", input: { heights: [[1]] } });
    t.push({ name: "edge-single-row", category: "edge", input: { heights: [[1,2,3,4,5]] } });
    t.push({ name: "edge-single-col", category: "edge", input: { heights: [[1],[2],[3]] } });
    t.push({ name: "edge-all-equal", category: "edge", input: { heights: [[7,7,7],[7,7,7],[7,7,7]] } });
    t.push({ name: "edge-monotone-down-right", category: "edge", input: { heights: [[9,8,7],[8,7,6],[7,6,5]] } });
    const r = rng(502);
    const big = Array.from({length:200},()=>Array.from({length:200},()=>randInt(r,0,100000)));
    t.push({ name: "stress-200x200-random", category: "stress", input: { heights: big } });
    const flat = Array.from({length:200},()=>new Array(200).fill(50));
    t.push({ name: "stress-200x200-flat", category: "stress", input: { heights: flat } });
    return t;
  },
});

// 3. Course Schedule II
add({
  id: "course-schedule-ii",
  leetcode_number: 210,
  title: "Course Schedule II",
  difficulty: "Medium",
  categories: ["Graph", "Topological Sort", "BFS", "DFS"],
  sources: ["Blind 75", "LeetCode Top Interview 150"],
  prompt:
    "Return any valid order in which all numCourses can be taken given prerequisites[i] = [a, b] meaning course b must be completed before course a. If impossible, return [].",
  constraints: ["1 <= numCourses <= 2000", "0 <= prerequisites.length <= numCourses * (numCourses - 1)", "prerequisites[i].length == 2", "All pairs are distinct."],
  hints: [
    "Build the graph and indegree; Kahn's BFS produces a valid order.",
    "If the output length is less than numCourses, there's a cycle.",
  ],
  optimal: { time: "O(V + E)", space: "O(V + E)", approach: "Kahn's algorithm (BFS topo sort)." },
  alternatives: [{ approach: "DFS with white/gray/black coloring", time: "O(V + E)", space: "O(V + E)" }],
  pitfalls: ["Reversing the edge direction (a → b means b's prereq is a, not the other way)."],
  followups: ["Lexicographically smallest topo order (use a priority queue)."],
  signature: {
    fn: "findOrder",
    params: [
      { name: "numCourses", adapt: "identity" },
      { name: "prerequisites", adapt: "identity" },
    ],
    returnAdapt: "identity",
  },
  comparison: "exact",
  solutionTs:
`function findOrder(numCourses: number, prerequisites: number[][]): number[] {
  const adj: number[][] = Array.from({length:numCourses}, () => []);
  const indeg = new Array(numCourses).fill(0);
  for (const [a,b] of prerequisites) { adj[b].push(a); indeg[a]++; }
  const q: number[] = [];
  for (let i = 0; i < numCourses; i++) if (indeg[i] === 0) q.push(i);
  const out: number[] = [];
  while (q.length) {
    const x = q.shift()!;
    out.push(x);
    for (const y of adj[x]) if (--indeg[y] === 0) q.push(y);
  }
  return out.length === numCourses ? out : [];
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { numCourses: 2, prerequisites: [[1,0]] } });
    t.push({ name: "example-2", category: "example", input: { numCourses: 4, prerequisites: [[1,0],[2,0],[3,1],[3,2]] } });
    t.push({ name: "example-3-no-prereqs", category: "example", input: { numCourses: 1, prerequisites: [] } });
    t.push({ name: "edge-cycle-2", category: "edge", input: { numCourses: 2, prerequisites: [[1,0],[0,1]] } });
    t.push({ name: "edge-disconnected", category: "edge", input: { numCourses: 5, prerequisites: [[1,0],[3,2]] } });
    t.push({ name: "edge-cycle-3", category: "edge", input: { numCourses: 3, prerequisites: [[0,1],[1,2],[2,0]] } });
    const r = rng(503);
    const n = 2000, prereqs = [];
    const order = Array.from({length:n},(_,i)=>i);
    for (let i = n - 1; i > 0; i--) { const j = randInt(r, 0, i); [order[i],order[j]] = [order[j],order[i]]; }
    for (let i = 1; i < n; i++) {
      const k = Math.min(i, randInt(r, 1, 3));
      for (let j = 0; j < k; j++) {
        const u = order[randInt(r, 0, i - 1)];
        prereqs.push([order[i], u]);
      }
    }
    t.push({ name: "stress-2000-acyclic", category: "stress", input: { numCourses: n, prerequisites: prereqs } });
    const cyc = prereqs.slice();
    cyc.push([order[0], order[n-1]]);
    t.push({ name: "stress-2000-with-cycle", category: "stress", input: { numCourses: n, prerequisites: cyc } });
    return t;
  },
});

// 4. Number of Connected Components in an Undirected Graph
add({
  id: "number-of-connected-components",
  leetcode_number: 323,
  title: "Number of Connected Components in an Undirected Graph",
  difficulty: "Medium",
  categories: ["Graph", "Union-Find", "DFS", "BFS"],
  sources: ["Blind 75"],
  prompt:
    "You have a graph of n nodes labeled 0..n-1. Given n and an array of edges where edges[i] = [a,b] is an undirected edge, return the number of connected components.",
  constraints: ["1 <= n <= 2000", "0 <= edges.length <= 5000", "0 <= a, b < n"],
  hints: [
    "Union-Find: start with n components; each successful union decrements the count.",
    "Or: DFS/BFS marking visited; count starts of new traversals.",
  ],
  optimal: { time: "O(n + e * α(n))", space: "O(n)", approach: "Union-Find with path compression." },
  alternatives: [{ approach: "DFS/BFS over adjacency list", time: "O(n + e)", space: "O(n + e)" }],
  pitfalls: ["Forgetting that unioning two already-joined nodes shouldn't change the count."],
  followups: ["Number of operations to make connected (LC 1319)."],
  signature: {
    fn: "countComponents",
    params: [
      { name: "n", adapt: "identity" },
      { name: "edges", adapt: "identity" },
    ],
    returnAdapt: "identity",
  },
  comparison: "exact",
  solutionTs:
`function countComponents(n: number, edges: number[][]): number {
  const par = Array.from({length:n}, (_, i) => i);
  const find = (x: number): number => { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; };
  let comp = n;
  for (const [a,b] of edges) {
    const ra = find(a), rb = find(b);
    if (ra !== rb) { par[ra] = rb; comp--; }
  }
  return comp;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { n: 5, edges: [[0,1],[1,2],[3,4]] } });
    t.push({ name: "example-2", category: "example", input: { n: 5, edges: [[0,1],[1,2],[2,3],[3,4]] } });
    t.push({ name: "edge-no-edges", category: "edge", input: { n: 5, edges: [] } });
    t.push({ name: "edge-single-node", category: "edge", input: { n: 1, edges: [] } });
    t.push({ name: "edge-self-loop", category: "edge", input: { n: 3, edges: [[0,0],[1,1]] } });
    t.push({ name: "edge-duplicate-edges", category: "edge", input: { n: 4, edges: [[0,1],[0,1],[2,3]] } });
    const r = rng(504);
    const n = 2000, edges = [];
    for (let i = 0; i < 5000; i++) edges.push([randInt(r,0,n-1), randInt(r,0,n-1)]);
    t.push({ name: "stress-2000-5000-edges", category: "stress", input: { n, edges } });
    t.push({ name: "stress-2000-no-edges", category: "stress", input: { n, edges: [] } });
    const linEdges = [];
    for (let i = 1; i < n; i++) linEdges.push([i-1,i]);
    t.push({ name: "stress-2000-linear", category: "stress", input: { n, edges: linEdges } });
    return t;
  },
});

// 5. Graph Valid Tree
add({
  id: "graph-valid-tree",
  leetcode_number: 261,
  title: "Graph Valid Tree",
  difficulty: "Medium",
  categories: ["Graph", "Union-Find", "DFS", "BFS"],
  sources: ["Blind 75"],
  prompt:
    "Given n nodes labeled 0..n-1 and a list of undirected edges, determine whether the graph forms a valid tree (connected and acyclic).",
  constraints: ["1 <= n <= 2000", "0 <= edges.length <= 5000"],
  hints: [
    "A tree has exactly n-1 edges. If not, reject early.",
    "Then verify connectedness with BFS/DFS or Union-Find (no union of already-joined nodes).",
  ],
  optimal: { time: "O(n + e * α(n))", space: "O(n)", approach: "Edge count check + Union-Find." },
  alternatives: [{ approach: "DFS detecting back-edges with parent tracking", time: "O(n + e)", space: "O(n + e)" }],
  pitfalls: ["Forgetting the connectivity check.", "Treating self-loops as valid."],
  followups: ["Minimum spanning tree (Kruskal/Prim)."],
  signature: {
    fn: "validTree",
    params: [
      { name: "n", adapt: "identity" },
      { name: "edges", adapt: "identity" },
    ],
    returnAdapt: "identity",
  },
  comparison: "exact",
  solutionTs:
`function validTree(n: number, edges: number[][]): boolean {
  if (edges.length !== n - 1) return false;
  const par = Array.from({length:n}, (_, i) => i);
  const find = (x: number): number => { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; };
  for (const [a,b] of edges) {
    const ra = find(a), rb = find(b);
    if (ra === rb) return false;
    par[ra] = rb;
  }
  return true;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { n: 5, edges: [[0,1],[0,2],[0,3],[1,4]] } });
    t.push({ name: "example-2-cycle", category: "example", input: { n: 5, edges: [[0,1],[1,2],[2,3],[1,3],[1,4]] } });
    t.push({ name: "edge-single-node", category: "edge", input: { n: 1, edges: [] } });
    t.push({ name: "edge-disconnected", category: "edge", input: { n: 4, edges: [[0,1],[2,3]] } });
    t.push({ name: "edge-too-few-edges", category: "edge", input: { n: 4, edges: [[0,1]] } });
    t.push({ name: "edge-too-many-edges", category: "edge", input: { n: 3, edges: [[0,1],[1,2],[0,2]] } });
    t.push({ name: "edge-empty-with-multiple-nodes", category: "edge", input: { n: 2, edges: [] } });
    const r = rng(505);
    const n = 2000;
    const treeEdges = [];
    for (let i = 1; i < n; i++) treeEdges.push([i, randInt(r, 0, i - 1)]);
    t.push({ name: "stress-2000-tree", category: "stress", input: { n, edges: treeEdges } });
    const withCycle = treeEdges.slice();
    withCycle.push([0, n - 1]);
    t.push({ name: "stress-2000-cycle", category: "stress", input: { n, edges: withCycle } });
    return t;
  },
});

// 6. Word Ladder
add({
  id: "word-ladder",
  leetcode_number: 127,
  title: "Word Ladder",
  difficulty: "Hard",
  categories: ["Graph", "BFS", "String", "Hash Table"],
  sources: ["Blind 75", "LeetCode Top Interview 150"],
  prompt:
    "Given two words beginWord and endWord and a dictionary wordList, return the number of words in the shortest transformation sequence from beginWord to endWord, where each step changes exactly one letter and every intermediate word must be in wordList. Return 0 if no such sequence exists.",
  constraints: ["1 <= beginWord.length <= 10", "endWord.length == beginWord.length", "1 <= wordList.length <= 5000", "All strings are lowercase English letters."],
  hints: [
    "Treat each word as a node; connect words that differ in one letter.",
    "BFS from beginWord; the shortest path length is the answer.",
    "For O(N*L²) instead of O(N²*L), use a 'pattern' hash like h*t to bucket neighbors.",
  ],
  optimal: { time: "O(N * L^2)", space: "O(N * L^2)", approach: "BFS with letter-substitution neighbor generation." },
  alternatives: [{ approach: "Bidirectional BFS", time: "O(N * L^2)", space: "O(N * L^2)", note: "Faster constant factor on long ladders." }, { approach: "Pattern bucketing graph", time: "O(N * L^2)", space: "O(N * L^2)" }],
  pitfalls: ["Re-visiting words (use visited set / delete from dict).", "Forgetting that beginWord need not be in the dictionary."],
  followups: ["Word Ladder II — return all shortest sequences."],
  signature: {
    fn: "ladderLength",
    params: [
      { name: "beginWord", adapt: "identity" },
      { name: "endWord", adapt: "identity" },
      { name: "wordList", adapt: "identity" },
    ],
    returnAdapt: "identity",
  },
  comparison: "exact",
  solutionTs:
`function ladderLength(beginWord: string, endWord: string, wordList: string[]): number {
  const dict = new Set(wordList);
  if (!dict.has(endWord)) return 0;
  const q: [string, number][] = [[beginWord, 1]];
  dict.delete(beginWord);
  while (q.length) {
    const [w, d] = q.shift()!;
    if (w === endWord) return d;
    const arr = w.split("");
    for (let i = 0; i < arr.length; i++) {
      const orig = arr[i];
      for (let c = 97; c <= 122; c++) {
        const ch = String.fromCharCode(c);
        if (ch === orig) continue;
        arr[i] = ch;
        const nw = arr.join("");
        if (dict.has(nw)) { dict.delete(nw); q.push([nw, d+1]); }
      }
      arr[i] = orig;
    }
  }
  return 0;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { beginWord: "hit", endWord: "cog", wordList: ["hot","dot","dog","lot","log","cog"] } });
    t.push({ name: "example-2-no-path", category: "example", input: { beginWord: "hit", endWord: "cog", wordList: ["hot","dot","dog","lot","log"] } });
    t.push({ name: "edge-begin-equals-end", category: "edge", input: { beginWord: "abc", endWord: "abc", wordList: ["abc"] } });
    t.push({ name: "edge-direct-neighbor", category: "edge", input: { beginWord: "ab", endWord: "ac", wordList: ["ac"] } });
    t.push({ name: "edge-empty-list", category: "edge", input: { beginWord: "abc", endWord: "def", wordList: [] } });
    t.push({ name: "edge-end-not-in-list", category: "edge", input: { beginWord: "hot", endWord: "dog", wordList: ["hot","dog"] } });
    t.push({ name: "edge-single-letter-words", category: "edge", input: { beginWord: "a", endWord: "c", wordList: ["a","b","c"] } });
    const r = rng(506);
    const dict = new Set();
    while (dict.size < 1500) {
      let s = "";
      for (let i = 0; i < 5; i++) s += String.fromCharCode(97 + randInt(r, 0, 25));
      dict.add(s);
    }
    const list = Array.from(dict);
    t.push({ name: "stress-1500-words", category: "stress", input: { beginWord: "aaaaa", endWord: list[0], wordList: list } });
    return t;
  },
});

// 7. Rotting Oranges
add({
  id: "rotting-oranges",
  leetcode_number: 994,
  title: "Rotting Oranges",
  difficulty: "Medium",
  categories: ["Matrix", "BFS"],
  sources: ["Grind 75", "LeetCode Top Interview 150"],
  prompt:
    "You are given an m x n grid where each cell is 0 (empty), 1 (fresh orange), or 2 (rotten). Each minute every fresh orange adjacent (4-directionally) to a rotten orange becomes rotten. Return the minimum number of minutes that must elapse until no fresh orange remains; -1 if impossible.",
  constraints: ["1 <= m, n <= 10", "grid[i][j] in {0, 1, 2}"],
  hints: [
    "Multi-source BFS starting from every initially rotten orange.",
    "Track time per cell during BFS; the answer is the maximum time reached, or -1 if any fresh orange remains.",
  ],
  optimal: { time: "O(m*n)", space: "O(m*n)", approach: "Multi-source BFS with time labels." },
  alternatives: [],
  pitfalls: ["Returning -1 when there are no oranges at all (answer is 0).", "Decrementing fresh count after rotting (avoid double-counting)."],
  followups: ["Different rot speeds per cell.", "Diagonal rot rules."],
  signature: { fn: "orangesRotting", params: [{ name: "grid", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function orangesRotting(grid: number[][]): number {
  const m = grid.length, n = grid[0].length;
  const q: [number,number,number][] = [];
  let fresh = 0;
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) {
    if (grid[i][j] === 2) q.push([i,j,0]);
    else if (grid[i][j] === 1) fresh++;
  }
  let mins = 0;
  const dirs: [number,number][] = [[1,0],[-1,0],[0,1],[0,-1]];
  while (q.length) {
    const [r,c,t] = q.shift()!;
    if (t > mins) mins = t;
    for (const [dr,dc] of dirs) {
      const nr=r+dr, nc=c+dc;
      if (nr<0||nc<0||nr>=m||nc>=n||grid[nr][nc]!==1) continue;
      grid[nr][nc] = 2;
      fresh--;
      q.push([nr,nc,t+1]);
    }
  }
  return fresh ? -1 : mins;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { grid: [[2,1,1],[1,1,0],[0,1,1]] } });
    t.push({ name: "example-2-impossible", category: "example", input: { grid: [[2,1,1],[0,1,1],[1,0,1]] } });
    t.push({ name: "example-3-no-fresh", category: "example", input: { grid: [[0,2]] } });
    t.push({ name: "edge-all-empty", category: "edge", input: { grid: [[0,0],[0,0]] } });
    t.push({ name: "edge-no-rotten-with-fresh", category: "edge", input: { grid: [[1,1,1]] } });
    t.push({ name: "edge-single-rotten", category: "edge", input: { grid: [[2]] } });
    t.push({ name: "edge-single-fresh", category: "edge", input: { grid: [[1]] } });
    t.push({ name: "edge-line-of-rot", category: "edge", input: { grid: [[2,1,1,1,1,1,1,1,1,1]] } });
    const r = rng(507);
    const big = Array.from({length:10},()=>Array.from({length:10},()=> { const x = r(); return x<0.1?2:x<0.7?1:0; }));
    t.push({ name: "stress-10x10-mixed", category: "stress", input: { grid: big } });
    return t;
  },
});

// 8. Surrounded Regions
add({
  id: "surrounded-regions",
  leetcode_number: 130,
  title: "Surrounded Regions",
  difficulty: "Medium",
  categories: ["Matrix", "DFS", "BFS", "Union-Find"],
  sources: ["LeetCode Top Interview 150"],
  prompt:
    "Given an m x n board of 'X' and 'O', capture all regions of 'O' that are completely surrounded by 'X' (flip those to 'X'). 'O's connected to the border are not captured. Modify in-place and return the board.",
  constraints: ["1 <= m, n <= 200", "board[i][j] in {'X','O'}"],
  hints: [
    "Reverse the question: 'O's that are NOT captured are exactly those connected (4-directionally) to a border 'O'.",
    "Mark all border-connected 'O's (e.g., temporarily as 'S'), then sweep: 'O' → 'X', 'S' → 'O'.",
  ],
  optimal: { time: "O(m*n)", space: "O(m*n)", approach: "DFS/BFS from border 'O's marking safe cells." },
  alternatives: [{ approach: "Union-Find with sentinel border node", time: "O(m*n)", space: "O(m*n)" }],
  pitfalls: ["DFS recursion depth on max-size boards (200×200) can blow the stack — use iterative or increase stack size.", "Forgetting that diagonal connectivity does NOT count."],
  followups: ["Number of distinct surrounded regions."],
  signature: { fn: "solveSurrounded", params: [{ name: "board", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function solve(board: string[][]): void {
  if (!board.length) return;
  const m = board.length, n = board[0].length;
  const stack: [number,number][] = [];
  const mark = (i: number, j: number) => {
    if (i<0||j<0||i>=m||j>=n||board[i][j]!=="O") return;
    stack.push([i,j]); board[i][j] = "S";
    while (stack.length) {
      const [r,c] = stack.pop()!;
      for (const [dr,dc] of [[1,0],[-1,0],[0,1],[0,-1]] as [number,number][]) {
        const nr=r+dr, nc=c+dc;
        if (nr<0||nc<0||nr>=m||nc>=n||board[nr][nc]!=="O") continue;
        board[nr][nc] = "S"; stack.push([nr,nc]);
      }
    }
  };
  for (let i = 0; i < m; i++) { mark(i,0); mark(i,n-1); }
  for (let j = 0; j < n; j++) { mark(0,j); mark(m-1,j); }
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) {
    if (board[i][j] === "S") board[i][j] = "O";
    else if (board[i][j] === "O") board[i][j] = "X";
  }
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { board: [["X","X","X","X"],["X","O","O","X"],["X","X","O","X"],["X","O","X","X"]] } });
    t.push({ name: "example-2-no-Os", category: "example", input: { board: [["X","X"],["X","X"]] } });
    t.push({ name: "edge-all-O", category: "edge", input: { board: [["O","O","O"],["O","O","O"],["O","O","O"]] } });
    t.push({ name: "edge-single-O", category: "edge", input: { board: [["O"]] } });
    t.push({ name: "edge-single-X", category: "edge", input: { board: [["X"]] } });
    t.push({ name: "edge-row-of-O", category: "edge", input: { board: [["X","X","X"],["O","O","O"],["X","X","X"]] } });
    t.push({ name: "edge-column-of-O", category: "edge", input: { board: [["X","O","X"],["X","O","X"],["X","O","X"]] } });
    const r = rng(508);
    const big = Array.from({length:200},()=>Array.from({length:200},()=> r() < 0.5 ? "O" : "X"));
    t.push({ name: "stress-200x200-mixed", category: "stress", input: { board: big } });
    return t;
  },
});

// 9. Walls and Gates
add({
  id: "walls-and-gates",
  leetcode_number: 286,
  title: "Walls and Gates",
  difficulty: "Medium",
  categories: ["Matrix", "BFS"],
  sources: ["Grind 75"],
  prompt:
    "You are given an m x n grid `rooms` initialized with -1 for walls, 0 for gates, and 2147483647 (INT_MAX) for empty rooms. Fill each empty room with the distance to its nearest gate (4-directional). If unreachable, leave INT_MAX. Modify in-place and return the grid.",
  constraints: ["1 <= m, n <= 250", "rooms[i][j] in {-1, 0, 2147483647}"],
  hints: [
    "Multi-source BFS starting from every gate simultaneously.",
    "Distance increments by 1 each BFS layer; only update INT_MAX cells.",
  ],
  optimal: { time: "O(m*n)", space: "O(m*n)", approach: "Multi-source BFS from all gates." },
  alternatives: [{ approach: "DFS from each gate", time: "O((m*n)^2)", space: "O(m*n)", note: "Too slow on worst-case sparse grids." }],
  pitfalls: ["DFS without distance tracking can revisit cells with worse paths.", "Updating walls or gates by mistake."],
  followups: ["With multiple cell types and obstacles."],
  signature: { fn: "wallsAndGates", params: [{ name: "rooms", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function wallsAndGates(rooms: number[][]): void {
  if (!rooms.length) return;
  const m = rooms.length, n = rooms[0].length;
  const q: [number,number][] = [];
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (rooms[i][j] === 0) q.push([i,j]);
  const dirs: [number,number][] = [[1,0],[-1,0],[0,1],[0,-1]];
  while (q.length) {
    const [r,c] = q.shift()!;
    for (const [dr,dc] of dirs) {
      const nr=r+dr, nc=c+dc;
      if (nr<0||nc<0||nr>=m||nc>=n) continue;
      if (rooms[nr][nc] !== 2147483647) continue;
      rooms[nr][nc] = rooms[r][c] + 1;
      q.push([nr,nc]);
    }
  }
}`,
  tests: () => {
    const INF = 2147483647;
    const t = [];
    t.push({ name: "example-1", category: "example", input: { rooms: [[INF,-1,0,INF],[INF,INF,INF,-1],[INF,-1,INF,-1],[0,-1,INF,INF]] } });
    t.push({ name: "edge-no-gates", category: "edge", input: { rooms: [[INF,-1],[INF,INF]] } });
    t.push({ name: "edge-only-gates", category: "edge", input: { rooms: [[0,0],[0,0]] } });
    t.push({ name: "edge-only-walls", category: "edge", input: { rooms: [[-1,-1],[-1,-1]] } });
    t.push({ name: "edge-single-gate", category: "edge", input: { rooms: [[0]] } });
    t.push({ name: "edge-single-empty", category: "edge", input: { rooms: [[INF]] } });
    t.push({ name: "edge-mixed-line", category: "edge", input: { rooms: [[INF,INF,0,INF,INF]] } });
    const r = rng(509);
    const big = Array.from({length:250},()=>Array.from({length:250},()=> { const x=r(); return x<0.05?-1:x<0.1?0:INF; }));
    t.push({ name: "stress-250x250", category: "stress", input: { rooms: big } });
    return t;
  },
});

// 10. Max Area of Island
add({
  id: "max-area-of-island",
  leetcode_number: 695,
  title: "Max Area of Island",
  difficulty: "Medium",
  categories: ["Matrix", "DFS", "BFS"],
  sources: ["Grind 75"],
  prompt:
    "Given an m x n binary matrix where 1 represents land and 0 represents water, return the maximum area (in cells) of any 4-connected island. The matrix may be modified in place during traversal.",
  constraints: ["1 <= m, n <= 50", "grid[i][j] in {0, 1}"],
  hints: [
    "DFS from each unvisited land cell, sinking it (set to 0) and counting cells visited.",
    "Iterative DFS or BFS works equally well.",
  ],
  optimal: { time: "O(m*n)", space: "O(m*n)", approach: "DFS sinking with running max." },
  alternatives: [{ approach: "BFS with visited set", time: "O(m*n)", space: "O(m*n)" }],
  pitfalls: ["Counting diagonal neighbors by mistake.", "Recursion depth on a 50×50 all-land board may exceed default stack on some platforms."],
  followups: ["Number of distinct island shapes (LC 711)."],
  signature: { fn: "maxAreaOfIsland", params: [{ name: "grid", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function maxAreaOfIsland(grid: number[][]): number {
  const m = grid.length, n = grid[0].length;
  let best = 0;
  const dfs = (i: number, j: number): number => {
    if (i<0||j<0||i>=m||j>=n||grid[i][j]!==1) return 0;
    grid[i][j] = 0;
    return 1 + dfs(i+1,j) + dfs(i-1,j) + dfs(i,j+1) + dfs(i,j-1);
  };
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (grid[i][j] === 1) {
    const a = dfs(i,j);
    if (a > best) best = a;
  }
  return best;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { grid: [[0,0,1,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,1,1,0,1,0,0,0,0,0,0,0,0],[0,1,0,0,1,1,0,0,1,0,1,0,0],[0,1,0,0,1,1,0,0,1,1,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,0,0,0,0,0,0,1,1,0,0,0,0]] } });
    t.push({ name: "example-2-empty", category: "example", input: { grid: [[0,0,0],[0,0,0]] } });
    t.push({ name: "edge-single-cell-1", category: "edge", input: { grid: [[1]] } });
    t.push({ name: "edge-single-cell-0", category: "edge", input: { grid: [[0]] } });
    t.push({ name: "edge-all-land", category: "edge", input: { grid: [[1,1,1],[1,1,1],[1,1,1]] } });
    t.push({ name: "edge-diagonal-not-connected", category: "edge", input: { grid: [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]] } });
    const r = rng(510);
    const big = Array.from({length:50},()=>Array.from({length:50},()=> r() < 0.5 ? 1 : 0));
    t.push({ name: "stress-50x50-mixed", category: "stress", input: { grid: big } });
    const allLand = Array.from({length:50},()=>new Array(50).fill(1));
    t.push({ name: "stress-50x50-all-land", category: "stress", input: { grid: allLand } });
    return t;
  },
});

// 11. Redundant Connection
add({
  id: "redundant-connection",
  leetcode_number: 684,
  title: "Redundant Connection",
  difficulty: "Medium",
  categories: ["Graph", "Union-Find"],
  sources: ["Grind 75"],
  prompt:
    "In a graph that started as a tree of n nodes (labeled 1..n) with one extra edge added, return that redundant edge. If multiple answers exist, return the one that occurs last in the input.",
  constraints: ["3 <= n <= 1000", "edges.length == n", "1 <= a, b <= n", "a != b"],
  hints: [
    "Use Union-Find: process edges in order; the first edge that fails to merge two components IS the redundant one.",
  ],
  optimal: { time: "O(n * α(n))", space: "O(n)", approach: "Union-Find with path compression." },
  alternatives: [{ approach: "DFS to detect cycle as edges are added", time: "O(n^2)", space: "O(n)" }],
  pitfalls: ["Off-by-one with 1-indexed vs 0-indexed parent arrays."],
  followups: ["Redundant Connection II (directed) — LC 685."],
  signature: { fn: "findRedundantConnection", params: [{ name: "edges", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function findRedundantConnection(edges: number[][]): number[] {
  const n = edges.length;
  const par = Array.from({length:n+1}, (_, i) => i);
  const find = (x: number): number => { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; };
  for (const [a,b] of edges) {
    const ra = find(a), rb = find(b);
    if (ra === rb) return [a,b];
    par[ra] = rb;
  }
  return [];
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { edges: [[1,2],[1,3],[2,3]] } });
    t.push({ name: "example-2", category: "example", input: { edges: [[1,2],[2,3],[3,4],[1,4],[1,5]] } });
    t.push({ name: "edge-min-3", category: "edge", input: { edges: [[1,2],[2,3],[1,3]] } });
    t.push({ name: "edge-cycle-at-end", category: "edge", input: { edges: [[1,2],[2,3],[3,4],[4,5],[1,5]] } });
    const r = rng(511);
    const n = 1000;
    const tree = [];
    for (let i = 2; i <= n; i++) tree.push([i, randInt(r, 1, i - 1)]);
    const a = randInt(r, 1, n), b = randInt(r, 1, n);
    const extra = a === b ? [a, (a % n) + 1] : [a, b];
    const all = tree.slice();
    all.push(extra);
    t.push({ name: "stress-1000-tree-plus-edge", category: "stress", input: { edges: all } });
    return t;
  },
});

// 12. Network Delay Time
add({
  id: "network-delay-time",
  leetcode_number: 743,
  title: "Network Delay Time",
  difficulty: "Medium",
  categories: ["Graph", "Heap / Priority Queue", "Shortest Path"],
  sources: ["LeetCode Top Interview 150"],
  prompt:
    "Given a list of travel times as directed edges times[i] = [u, v, w], return the minimum time required for a signal sent from node k to reach all n nodes. Return -1 if not all nodes can be reached.",
  constraints: ["1 <= k <= n <= 100", "1 <= times.length <= 6000", "1 <= u, v <= n", "u != v", "0 <= w <= 100"],
  hints: [
    "This is single-source shortest path on a non-negative-weight graph: Dijkstra.",
    "The answer is the maximum of all finite shortest distances; -1 if any is infinite.",
  ],
  optimal: { time: "O((V + E) log V)", space: "O(V + E)", approach: "Dijkstra with a min-heap." },
  alternatives: [{ approach: "Bellman-Ford", time: "O(V*E)", space: "O(V)", note: "Allows negative weights but unnecessary here." }, { approach: "Floyd-Warshall", time: "O(V^3)", space: "O(V^2)" }],
  pitfalls: ["Using > instead of >= when popping outdated entries.", "Forgetting to handle disconnected nodes."],
  followups: ["Find the path itself, not just the time.", "Path with at most k edges."],
  signature: {
    fn: "networkDelayTime",
    params: [
      { name: "times", adapt: "identity" },
      { name: "n", adapt: "identity" },
      { name: "k", adapt: "identity" },
    ],
    returnAdapt: "identity",
  },
  comparison: "exact",
  solutionTs:
`function networkDelayTime(times: number[][], n: number, k: number): number {
  const adj: [number,number][][] = Array.from({length:n+1}, () => []);
  for (const [u,v,w] of times) adj[u].push([v,w]);
  const dist = new Array(n+1).fill(Infinity);
  dist[k] = 0;
  // Use binary heap (TS 'class' omitted for brevity)
  const heap: [number,number][] = [[0,k]];
  // ... pop min by (d), relax edges, etc.
  let head = 0;
  while (head < heap.length) {
    heap.sort((a,b) => a[0]-b[0]);
    const [d,u] = heap[head++];
    if (d > dist[u]) continue;
    for (const [v,w] of adj[u]) if (d + w < dist[v]) { dist[v] = d + w; heap.push([dist[v], v]); }
  }
  let mx = 0;
  for (let i = 1; i <= n; i++) {
    if (dist[i] === Infinity) return -1;
    if (dist[i] > mx) mx = dist[i];
  }
  return mx;
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { times: [[2,1,1],[2,3,1],[3,4,1]], n: 4, k: 2 } });
    t.push({ name: "example-2", category: "example", input: { times: [[1,2,1]], n: 2, k: 1 } });
    t.push({ name: "example-3-unreachable", category: "example", input: { times: [[1,2,1]], n: 2, k: 2 } });
    t.push({ name: "edge-single-node", category: "edge", input: { times: [], n: 1, k: 1 } });
    t.push({ name: "edge-disconnected", category: "edge", input: { times: [[1,2,1]], n: 3, k: 1 } });
    t.push({ name: "edge-self-cycle", category: "edge", input: { times: [[1,2,5],[2,1,3]], n: 2, k: 1 } });
    const r = rng(512);
    const n = 100;
    const times = [];
    for (let i = 1; i <= n; i++) for (let j = 1; j <= n; j++) {
      if (i !== j && r() < 0.3) times.push([i, j, randInt(r, 1, 100)]);
    }
    t.push({ name: "stress-100-dense", category: "stress", input: { times, n, k: 1 } });
    const tlin = [];
    for (let i = 1; i < n; i++) tlin.push([i, i+1, 1]);
    t.push({ name: "stress-100-line", category: "stress", input: { times: tlin, n, k: 1 } });
    return t;
  },
});

// 13. Cheapest Flights Within K Stops
add({
  id: "cheapest-flights-within-k-stops",
  leetcode_number: 787,
  title: "Cheapest Flights Within K Stops",
  difficulty: "Medium",
  categories: ["Graph", "Shortest Path", "Dynamic Programming", "BFS"],
  sources: ["LeetCode Top Interview 150"],
  prompt:
    "There are n cities and a list of flights = [from, to, price]. Return the cheapest price from `src` to `dst` with at most `k` stops; -1 if no such route.",
  constraints: ["1 <= n <= 100", "0 <= flights.length <= n * (n-1)", "0 <= src, dst, k <= n", "1 <= price <= 10^4"],
  hints: [
    "Dijkstra alone doesn't directly enforce a stop limit — augment with a heap of (cost, node, stops).",
    "Bellman-Ford is the cleanest: relax all edges k+1 times using a snapshot of last-round distances.",
  ],
  optimal: { time: "O(k * E)", space: "O(n)", approach: "Bellman-Ford limited to k+1 iterations." },
  alternatives: [{ approach: "BFS with (cost, stops) state", time: "O(k * E)", space: "O(n*k)" }],
  pitfalls: ["Mutating dist during a single round (must use a snapshot).", "Off-by-one between 'edges' and 'stops' (k stops = k+1 edges)."],
  followups: ["Track the path itself."],
  signature: {
    fn: "findCheapestPrice",
    params: [
      { name: "n", adapt: "identity" },
      { name: "flights", adapt: "identity" },
      { name: "src", adapt: "identity" },
      { name: "dst", adapt: "identity" },
      { name: "k", adapt: "identity" },
    ],
    returnAdapt: "identity",
  },
  comparison: "exact",
  solutionTs:
`function findCheapestPrice(n: number, flights: number[][], src: number, dst: number, k: number): number {
  let dist = new Array(n).fill(Infinity);
  dist[src] = 0;
  for (let i = 0; i <= k; i++) {
    const next = dist.slice();
    for (const [u,v,w] of flights) {
      if (dist[u] === Infinity) continue;
      if (dist[u] + w < next[v]) next[v] = dist[u] + w;
    }
    dist = next;
  }
  return dist[dst] === Infinity ? -1 : dist[dst];
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { n: 4, flights: [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src: 0, dst: 3, k: 1 } });
    t.push({ name: "example-2", category: "example", input: { n: 3, flights: [[0,1,100],[1,2,100],[0,2,500]], src: 0, dst: 2, k: 1 } });
    t.push({ name: "example-3", category: "example", input: { n: 3, flights: [[0,1,100],[1,2,100],[0,2,500]], src: 0, dst: 2, k: 0 } });
    t.push({ name: "edge-src-equals-dst", category: "edge", input: { n: 3, flights: [[0,1,5]], src: 1, dst: 1, k: 0 } });
    t.push({ name: "edge-no-path", category: "edge", input: { n: 3, flights: [[0,1,5]], src: 0, dst: 2, k: 5 } });
    t.push({ name: "edge-k-zero-direct", category: "edge", input: { n: 2, flights: [[0,1,7]], src: 0, dst: 1, k: 0 } });
    const r = rng(513);
    const n = 100;
    const flights = [];
    for (let i = 0; i < 1000; i++) {
      const u = randInt(r, 0, n - 1), v = randInt(r, 0, n - 1);
      if (u !== v) flights.push([u, v, randInt(r, 1, 10000)]);
    }
    t.push({ name: "stress-100-1000-flights", category: "stress", input: { n, flights, src: 0, dst: n-1, k: 50 } });
    t.push({ name: "stress-100-1000-flights-k0", category: "stress", input: { n, flights, src: 0, dst: n-1, k: 0 } });
    return t;
  },
});

// 14. Reconstruct Itinerary
add({
  id: "reconstruct-itinerary",
  leetcode_number: 332,
  title: "Reconstruct Itinerary",
  difficulty: "Hard",
  categories: ["Graph", "DFS", "Eulerian Path"],
  sources: ["LeetCode Top Interview 150"],
  prompt:
    "Given a list of airline tickets [from, to], reconstruct the itinerary in order. The trip starts at \"JFK\" and uses every ticket exactly once. If multiple valid itineraries exist, return the one that is lexicographically smallest when read as a single concatenated list.",
  constraints: ["1 <= tickets.length <= 300", "Airport codes are 3-letter uppercase strings.", "An itinerary is guaranteed to exist."],
  hints: [
    "It's an Eulerian path problem: visit every edge exactly once.",
    "Sort each adjacency list ascending; do DFS visiting smallest unused outgoing edge first.",
    "Hierholzer: when you can't go further, prepend the current node to the path.",
  ],
  optimal: { time: "O(E log E)", space: "O(E)", approach: "Hierholzer's algorithm with sorted adjacency lists." },
  alternatives: [{ approach: "Backtracking trying lexicographic order", time: "Exponential worst case", space: "O(E)" }],
  pitfalls: ["Returning the path in reverse (forgot to reverse the result).", "Re-using tickets — adjacency lists must be consumed."],
  followups: ["Eulerian circuit detection.", "Eulerian path on undirected graphs."],
  signature: { fn: "findItinerary", params: [{ name: "tickets", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function findItinerary(tickets: string[][]): string[] {
  const adj = new Map<string, string[]>();
  for (const [a,b] of tickets) {
    if (!adj.has(a)) adj.set(a, []);
    adj.get(a)!.push(b);
  }
  for (const arr of adj.values()) arr.sort();
  const out: string[] = [];
  const dfs = (u: string) => {
    const arr = adj.get(u);
    while (arr && arr.length) dfs(arr.shift()!);
    out.push(u);
  };
  dfs("JFK");
  return out.reverse();
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { tickets: [["MUC","LHR"],["JFK","MUC"],["SFO","SJC"],["LHR","SFO"]] } });
    t.push({ name: "example-2-multi-choice", category: "example", input: { tickets: [["JFK","SFO"],["JFK","ATL"],["SFO","ATL"],["ATL","JFK"],["ATL","SFO"]] } });
    t.push({ name: "edge-single-ticket", category: "edge", input: { tickets: [["JFK","ABC"]] } });
    t.push({ name: "edge-cycle-back-to-jfk", category: "edge", input: { tickets: [["JFK","KUL"],["JFK","NRT"],["NRT","JFK"]] } });
    t.push({ name: "edge-must-finish-distant", category: "edge", input: { tickets: [["JFK","A"],["A","B"],["B","C"],["C","A"],["A","JFK"]] } });
    const r = rng(514);
    const codes = [];
    for (let i = 0; i < 50; i++) {
      let c = "";
      for (let j = 0; j < 3; j++) c += String.fromCharCode(65 + randInt(r, 0, 25));
      codes.push(c);
    }
    codes[0] = "JFK";
    const tickets = [];
    let cur = "JFK";
    for (let i = 0; i < 300; i++) {
      const next = codes[randInt(r, 0, codes.length - 1)];
      tickets.push([cur, next]);
      cur = next;
    }
    t.push({ name: "stress-300-random-tour", category: "stress", input: { tickets } });
    return t;
  },
});

// 15. Alien Dictionary
add({
  id: "alien-dictionary",
  leetcode_number: 269,
  title: "Alien Dictionary",
  difficulty: "Hard",
  categories: ["Graph", "Topological Sort", "String"],
  sources: ["Blind 75"],
  prompt:
    "There is an alien language using lowercase English letters but with an unknown order. You are given a list of `words` from this language sorted lexicographically by its rules. Return any valid letter ordering as a string. If invalid (e.g., a prefix violation) return \"\". Note: this dataset compares against a deterministic Kahn's algorithm with alphabetical tiebreaks; multiple valid orderings exist for the underlying problem, but our reference produces one canonical answer.",
  constraints: ["1 <= words.length <= 100", "1 <= words[i].length <= 100", "All words consist of lowercase English letters."],
  hints: [
    "Compare adjacent words to derive ordering edges (the first differing letter).",
    "If a longer word comes before its prefix, the input is invalid.",
    "Topologically sort the resulting graph (Kahn's BFS).",
  ],
  optimal: { time: "O(C)", space: "O(1) (alphabet bounded)", approach: "Build precedence DAG from adjacent words, then Kahn's topo sort." },
  alternatives: [{ approach: "DFS topo sort with cycle detection", time: "O(C)", space: "O(1)" }],
  pitfalls: ["Missing the prefix-violation check.", "Adding duplicate edges (use a set for outgoing neighbors)."],
  followups: ["All valid orderings (exponential)."],
  signature: { fn: "alienOrder", params: [{ name: "words", adapt: "identity" }], returnAdapt: "identity" },
  comparison: "exact",
  solutionTs:
`function alienOrder(words: string[]): string {
  const adj = new Map<string, Set<string>>();
  const indeg = new Map<string, number>();
  for (const w of words) for (const c of w) {
    if (!adj.has(c)) { adj.set(c, new Set()); indeg.set(c, 0); }
  }
  for (let i = 0; i + 1 < words.length; i++) {
    const a = words[i], b = words[i+1];
    let found = false;
    const lim = Math.min(a.length, b.length);
    for (let j = 0; j < lim; j++) {
      if (a[j] !== b[j]) {
        if (!adj.get(a[j])!.has(b[j])) {
          adj.get(a[j])!.add(b[j]);
          indeg.set(b[j], indeg.get(b[j])! + 1);
        }
        found = true;
        break;
      }
    }
    if (!found && a.length > b.length) return "";
  }
  const ready: string[] = [];
  for (const [c, d] of indeg) if (d === 0) ready.push(c);
  ready.sort();
  let out = "";
  while (ready.length) {
    const c = ready.shift()!;
    out += c;
    const neighbors = [...adj.get(c)!].sort();
    for (const nb of neighbors) {
      indeg.set(nb, indeg.get(nb)! - 1);
      if (indeg.get(nb) === 0) {
        let lo = 0, hi = ready.length;
        while (lo < hi) { const m = (lo+hi)>>1; if (ready[m] < nb) lo = m+1; else hi = m; }
        ready.splice(lo, 0, nb);
      }
    }
  }
  return out.length === indeg.size ? out : "";
}`,
  tests: () => {
    const t = [];
    t.push({ name: "example-1", category: "example", input: { words: ["wrt","wrf","er","ett","rftt"] } });
    t.push({ name: "example-2", category: "example", input: { words: ["z","x"] } });
    t.push({ name: "example-3-cycle", category: "example", input: { words: ["z","x","z"] } });
    t.push({ name: "edge-prefix-violation", category: "edge", input: { words: ["abc","ab"] } });
    t.push({ name: "edge-single-word", category: "edge", input: { words: ["abc"] } });
    t.push({ name: "edge-single-letter-words", category: "edge", input: { words: ["a","b","c","d"] } });
    t.push({ name: "edge-all-same-prefix", category: "edge", input: { words: ["zb","zc","zd"] } });
    t.push({ name: "edge-no-constraints", category: "edge", input: { words: ["a","a","a"] } });
    const r = rng(515);
    const allLetters = "abcdefghij";
    const order = allLetters.split("").sort(() => r() - 0.5);
    const rank = {};
    for (let i = 0; i < order.length; i++) rank[order[i]] = i;
    const cmp = (x, y) => {
      const n = Math.min(x.length, y.length);
      for (let i = 0; i < n; i++) if (x[i] !== y[i]) return rank[x[i]] - rank[y[i]];
      return x.length - y.length;
    };
    const words = [];
    for (let i = 0; i < 100; i++) {
      let s = "";
      for (let j = 0; j < randInt(r, 1, 8); j++) s += allLetters[randInt(r, 0, allLetters.length - 1)];
      words.push(s);
    }
    words.sort(cmp);
    t.push({ name: "stress-100-words", category: "stress", input: { words } });
    return t;
  },
});
