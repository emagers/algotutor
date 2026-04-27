// Phase F end-to-end acceptance: real reference solutions in all 3 languages
// for representative problems covering every archetype the harness supports.
//
// Archetypes covered:
//   - function · primitive return        (binary-search, climbing-stairs)
//   - function · bool return              (valid-parentheses)
//   - function · array out                (two-sum)
//   - function · linked-list              (reverse-linked-list)
//   - function · tree                     (maximum-depth-of-binary-tree)
//   - mutation · in-place                 (move-zeroes)
//   - mutation · in-place + extra arg     (rotate-array)
//   - design   · no-arg constructor       (min-stack)
//   - design   · param constructor        (lru-cache)
//
// Run: `node backend/acceptance-all.mjs` (backend must be up on :9090).

const ENDPOINT = "http://localhost:9090/api/run";

const SUITE = [
  // ─── two-sum ──────────────────────────────────────────────────────────────
  { slug: "two-sum", archetype: "function · array out", solutions: {
    javascript: `
function twoSum(nums, target) {
    const m = new Map();
    for (let i = 0; i < nums.length; i++) {
        if (m.has(target - nums[i])) return [m.get(target - nums[i]), i];
        m.set(nums[i], i);
    }
    return [];
}`,
    rust: `
fn twoSum(nums: Vec<i32>, target: i32) -> Vec<i32> {
    use std::collections::HashMap;
    let mut m: HashMap<i32, i32> = HashMap::new();
    for (i, &n) in nums.iter().enumerate() {
        if let Some(&j) = m.get(&(target - n)) { return vec![j, i as i32]; }
        m.insert(n, i as i32);
    }
    vec![]
}`,
    go: `
func twoSum(nums []int, target int) []int {
    m := map[int]int{}
    for i, n := range nums {
        if j, ok := m[target-n]; ok { return []int{j, i} }
        m[n] = i
    }
    return nil
}`,
  }},

  // ─── valid-parentheses ────────────────────────────────────────────────────
  { slug: "valid-parentheses", archetype: "function · bool", solutions: {
    javascript: `
function isValid(s) {
    const st = []; const pairs = { ")": "(", "]": "[", "}": "{" };
    for (const c of s) {
        if (c === "(" || c === "[" || c === "{") { st.push(c); continue; }
        if (st.pop() !== pairs[c]) return false;
    }
    return st.length === 0;
}`,
    rust: `
fn isValid(s: String) -> bool {
    let mut st: Vec<char> = Vec::new();
    for c in s.chars() {
        match c {
            '(' | '[' | '{' => st.push(c),
            ')' => if st.pop() != Some('(') { return false; },
            ']' => if st.pop() != Some('[') { return false; },
            '}' => if st.pop() != Some('{') { return false; },
            _ => {}
        }
    }
    st.is_empty()
}`,
    go: `
func isValid(s string) bool {
    st := []byte{}
    pairs := map[byte]byte{')':'(',']':'[','}':'{'}
    for i := 0; i < len(s); i++ {
        c := s[i]
        if c == '(' || c == '[' || c == '{' { st = append(st, c); continue }
        if len(st) == 0 || st[len(st)-1] != pairs[c] { return false }
        st = st[:len(st)-1]
    }
    return len(st) == 0
}`,
  }},

  // ─── binary-search ────────────────────────────────────────────────────────
  { slug: "binary-search", archetype: "function · primitive", solutions: {
    javascript: `
function search(nums, target) {
    let lo = 0, hi = nums.length - 1;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (nums[mid] === target) return mid;
        if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;
    }
    return -1;
}`,
    rust: `
fn search(nums: Vec<i32>, target: i32) -> i32 {
    let (mut lo, mut hi) = (0i32, nums.len() as i32 - 1);
    while lo <= hi {
        let mid = lo + (hi - lo) / 2;
        let v = nums[mid as usize];
        if v == target { return mid; }
        else if v < target { lo = mid + 1; }
        else { hi = mid - 1; }
    }
    -1
}`,
    go: `
func search(nums []int, target int) int {
    lo, hi := 0, len(nums)-1
    for lo <= hi {
        mid := (lo+hi)/2
        if nums[mid] == target { return mid }
        if nums[mid] < target { lo = mid+1 } else { hi = mid-1 }
    }
    return -1
}`,
  }},

  // ─── climbing-stairs ──────────────────────────────────────────────────────
  { slug: "climbing-stairs", archetype: "function · primitive (DP)", solutions: {
    javascript: `
function climbStairs(n) {
    if (n <= 2) return n;
    let a = 1, b = 2;
    for (let i = 3; i <= n; i++) { const t = a + b; a = b; b = t; }
    return b;
}`,
    rust: `
fn climbStairs(n: i32) -> i32 {
    let (mut a, mut b) = (1i32, 1i32);
    for _ in 0..n { let t = a + b; a = b; b = t; }
    a
}`,
    go: `
func climbStairs(n int) int {
    if n <= 2 { return n }
    a, b := 1, 2
    for i := 3; i <= n; i++ { a, b = b, a+b }
    return b
}`,
  }},

  // ─── reverse-linked-list ──────────────────────────────────────────────────
  { slug: "reverse-linked-list", archetype: "function · linked list", solutions: {
    javascript: `
function reverseList(head) {
    let prev = null, cur = head;
    while (cur) { const n = cur.next; cur.next = prev; prev = cur; cur = n; }
    return prev;
}`,
    rust: `
fn reverseList(head: Option<Box<ListNode>>) -> Option<Box<ListNode>> {
    let mut prev: Option<Box<ListNode>> = None;
    let mut cur = head;
    while let Some(mut n) = cur {
        cur = n.next.take();
        n.next = prev;
        prev = Some(n);
    }
    prev
}`,
    go: `
func reverseList(head *ListNode) *ListNode {
    var prev *ListNode
    cur := head
    for cur != nil {
        nxt := cur.Next
        cur.Next = prev
        prev = cur
        cur = nxt
    }
    return prev
}`,
  }},

  // ─── maximum-depth-of-binary-tree ─────────────────────────────────────────
  { slug: "maximum-depth-of-binary-tree", archetype: "function · tree", solutions: {
    javascript: `
function maxDepth(root) {
    if (!root) return 0;
    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`,
    rust: `
fn maxDepth(root: Option<Rc<RefCell<TreeNode>>>) -> i32 {
    match root {
        None => 0,
        Some(r) => {
            let b = r.borrow();
            1 + std::cmp::max(maxDepth(b.left.clone()), maxDepth(b.right.clone()))
        }
    }
}`,
    go: `
func maxDepth(root *TreeNode) int {
    if root == nil { return 0 }
    l := maxDepth(root.Left)
    r := maxDepth(root.Right)
    if l > r { return l + 1 }
    return r + 1
}`,
  }},

  // ─── move-zeroes ──────────────────────────────────────────────────────────
  { slug: "move-zeroes", archetype: "mutation · in-place", solutions: {
    javascript: `
function moveZeroes(nums) {
    let w = 0;
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] !== 0) { [nums[w], nums[i]] = [nums[i], nums[w]]; w++; }
    }
}`,
    rust: `
fn moveZeroes(nums: &mut Vec<i32>) {
    let mut w = 0usize;
    for i in 0..nums.len() {
        if nums[i] != 0 { nums.swap(w, i); w += 1; }
    }
}`,
    go: `
func moveZeroes(nums []int) {
    w := 0
    for i := 0; i < len(nums); i++ {
        if nums[i] != 0 { nums[w], nums[i] = nums[i], nums[w]; w++ }
    }
}`,
  }},

  // ─── rotate-array ─────────────────────────────────────────────────────────
  { slug: "rotate-array", archetype: "mutation · in-place + extra arg", solutions: {
    javascript: `
function rotateArrayK(nums, k) {
    const n = nums.length; if (n === 0) return;
    k = ((k % n) + n) % n;
    const rev = (i, j) => { while (i < j) { [nums[i], nums[j]] = [nums[j], nums[i]]; i++; j--; } };
    rev(0, n - 1); rev(0, k - 1); rev(k, n - 1);
}`,
    rust: `
fn rotateArrayK(nums: &mut Vec<i32>, k: i32) {
    let n = nums.len(); if n == 0 { return; }
    let k = (k.rem_euclid(n as i32)) as usize;
    nums.rotate_right(k);
}`,
    go: `
func rotateArrayK(nums []int, k int) {
    n := len(nums); if n == 0 { return }
    k = ((k % n) + n) % n
    rev := func(i, j int) { for i < j { nums[i], nums[j] = nums[j], nums[i]; i++; j-- } }
    rev(0, n-1); rev(0, k-1); rev(k, n-1)
}`,
  }},

  // ─── min-stack (design · no-arg ctor) ─────────────────────────────────────
  { slug: "min-stack", archetype: "design · no-arg ctor", solutions: {
    javascript: `
class MinStack {
    constructor() { this.s = []; this.m = []; }
    push(v) { this.s.push(v); this.m.push(this.m.length ? Math.min(this.m[this.m.length-1], v) : v); }
    pop() { this.s.pop(); this.m.pop(); }
    top() { return this.s[this.s.length-1]; }
    getMin() { return this.m[this.m.length-1]; }
}`,
    rust: `
pub struct MinStack { stack: Vec<i32>, mins: Vec<i32> }
impl MinStack {
    pub fn new() -> Self { MinStack { stack: Vec::new(), mins: Vec::new() } }
    pub fn push(&mut self, val: i32) {
        self.stack.push(val);
        let m = self.mins.last().copied().map_or(val, |x| x.min(val));
        self.mins.push(m);
    }
    pub fn pop(&mut self) { self.stack.pop(); self.mins.pop(); }
    pub fn top(&mut self) -> i32 { *self.stack.last().unwrap() }
    pub fn getMin(&mut self) -> i32 { *self.mins.last().unwrap() }
}`,
    go: `
type MinStack struct { s []int; m []int }
func Constructor() MinStack { return MinStack{} }
func (this *MinStack) push(val int) {
    this.s = append(this.s, val)
    if len(this.m) == 0 || val < this.m[len(this.m)-1] {
        this.m = append(this.m, val)
    } else {
        this.m = append(this.m, this.m[len(this.m)-1])
    }
}
func (this *MinStack) pop() { this.s = this.s[:len(this.s)-1]; this.m = this.m[:len(this.m)-1] }
func (this *MinStack) top() int { return this.s[len(this.s)-1] }
func (this *MinStack) getMin() int { return this.m[len(this.m)-1] }`,
  }},

  // ─── lru-cache (design · param ctor) ──────────────────────────────────────
  { slug: "lru-cache", archetype: "design · param ctor", solutions: {
    javascript: `
class LRUCache {
    constructor(capacity) { this.cap = capacity; this.map = new Map(); }
    get(key) {
        if (!this.map.has(key)) return -1;
        const v = this.map.get(key); this.map.delete(key); this.map.set(key, v);
        return v;
    }
    put(key, value) {
        if (this.map.has(key)) this.map.delete(key);
        else if (this.map.size >= this.cap) this.map.delete(this.map.keys().next().value);
        this.map.set(key, value);
    }
}`,
    rust: `
use std::collections::HashMap;
pub struct LRUCache { cap: usize, order: Vec<i32>, map: HashMap<i32, i32> }
impl LRUCache {
    pub fn new(capacity: i32) -> Self { LRUCache { cap: capacity as usize, order: Vec::new(), map: HashMap::new() } }
    pub fn get(&mut self, key: i32) -> i32 {
        if let Some(&v) = self.map.get(&key) {
            self.order.retain(|&x| x != key);
            self.order.push(key);
            v
        } else { -1 }
    }
    pub fn put(&mut self, key: i32, value: i32) {
        if self.map.contains_key(&key) {
            self.order.retain(|&x| x != key);
        } else if self.map.len() >= self.cap {
            let evict = self.order.remove(0);
            self.map.remove(&evict);
        }
        self.map.insert(key, value);
        self.order.push(key);
    }
}`,
    go: `
type LRUCache struct {
    cap int
    order []int
    m map[int]int
}
func Constructor(capacity int) LRUCache {
    return LRUCache{cap: capacity, order: []int{}, m: map[int]int{}}
}
func (c *LRUCache) get(key int) int {
    v, ok := c.m[key]
    if !ok { return -1 }
    for i, k := range c.order { if k == key { c.order = append(c.order[:i], c.order[i+1:]...); break } }
    c.order = append(c.order, key)
    return v
}
func (c *LRUCache) put(key int, value int) {
    if _, ok := c.m[key]; ok {
        for i, k := range c.order { if k == key { c.order = append(c.order[:i], c.order[i+1:]...); break } }
    } else if len(c.m) >= c.cap {
        ev := c.order[0]; c.order = c.order[1:]; delete(c.m, ev)
    }
    c.m[key] = value
    c.order = append(c.order, key)
}`,
  }},

  // ─── serialize-and-deserialize-binary-tree (codec-roundtrip) ──────────────
  // JS path: the user-facing fn is `codecBinaryTreeRoundTrip(arr)` taking the
  // wire-shape array directly. The Codec class is implicit (defined inside).
  // Rust/Go: harness drives a user-provided Codec class via the codec harness.
  { slug: "serialize-and-deserialize-binary-tree", archetype: "codec round-trip", solutions: {
    javascript: `
class Codec {
    serialize(root) {
        const out = [];
        const dfs = (n) => { if (!n) { out.push("#"); return; } out.push(String(n.val)); dfs(n.left); dfs(n.right); };
        dfs(root); return out.join(",");
    }
    deserialize(data) {
        if (data === "" || data === "#") return null;
        const parts = data.split(",");
        let i = 0;
        const des = () => { const t = parts[i++]; if (t === "#") return null; const n = new TreeNode(Number(t)); n.left = des(); n.right = des(); return n; };
        return des();
    }
}`,
    rust: `
pub struct Codec {}
impl Codec {
    pub fn new() -> Self { Codec {} }
    pub fn serialize(&mut self, root: Option<Rc<RefCell<TreeNode>>>) -> String {
        let mut out: Vec<String> = Vec::new();
        fn dfs(n: Option<Rc<RefCell<TreeNode>>>, out: &mut Vec<String>) {
            match n {
                None => out.push("#".to_string()),
                Some(rc) => { let b = rc.borrow(); out.push(b.val.to_string()); dfs(b.left.clone(), out); dfs(b.right.clone(), out); }
            }
        }
        dfs(root, &mut out); out.join(",")
    }
    pub fn deserialize(&mut self, data: String) -> Option<Rc<RefCell<TreeNode>>> {
        let parts: Vec<&str> = data.split(',').collect();
        let mut i = 0usize;
        fn des(parts: &[&str], i: &mut usize) -> Option<Rc<RefCell<TreeNode>>> {
            if *i >= parts.len() { return None; }
            let t = parts[*i]; *i += 1;
            if t == "#" { return None; }
            let v: i32 = t.parse().unwrap();
            let n = Rc::new(RefCell::new(TreeNode::new(v)));
            n.borrow_mut().left = des(parts, i);
            n.borrow_mut().right = des(parts, i);
            Some(n)
        }
        des(&parts, &mut i)
    }
}`,
    go: `
type Codec struct{}
func Constructor() Codec { return Codec{} }
func (c *Codec) serialize(root *TreeNode) string {
    var parts []string
    var dfs func(n *TreeNode)
    dfs = func(n *TreeNode) {
        if n == nil { parts = append(parts, "#"); return }
        parts = append(parts, fmt.Sprintf("%d", n.Val))
        dfs(n.Left); dfs(n.Right)
    }
    dfs(root)
    out := ""
    for i, p := range parts { if i > 0 { out += "," }; out += p }
    return out
}
func (c *Codec) deserialize(data string) *TreeNode {
    parts := []string{}
    cur := ""
    for i := 0; i < len(data); i++ {
        if data[i] == ',' { parts = append(parts, cur); cur = "" } else { cur += string(data[i]) }
    }
    parts = append(parts, cur)
    i := 0
    var des func() *TreeNode
    des = func() *TreeNode {
        if i >= len(parts) { return nil }
        t := parts[i]; i++
        if t == "#" { return nil }
        v := 0; sign := 1
        for k := 0; k < len(t); k++ {
            if t[k] == '-' { sign = -1 } else { v = v*10 + int(t[k]-'0') }
        }
        n := &TreeNode{Val: sign * v}
        n.Left = des(); n.Right = des()
        return n
    }
    return des()
}`,
  }},

  // ─── clone-graph (typed wire struct GraphRepr) ────────────────────────────
  { slug: "clone-graph", archetype: "function · GraphRepr wire struct", solutions: {
    javascript: `
function cloneGraphRoundTrip(graph) {
    return { nodes: [...graph.nodes], adj: graph.adj.map((row) => [...row].sort((a, b) => a - b)) };
}`,
    rust: `
fn cloneGraphRoundTrip(graph: GraphRepr) -> GraphRepr {
    GraphRepr {
        nodes: graph.nodes.clone(),
        adj: graph.adj.iter().map(|row| { let mut r: Vec<usize> = row.clone(); r.sort(); r }).collect(),
    }
}`,
    go: `
func cloneGraphRoundTrip(graph GraphRepr) GraphRepr {
    nodes := append([]int{}, graph.Nodes...)
    adj := make([][]int, len(graph.Adj))
    for i, row := range graph.Adj {
        cp := append([]int{}, row...)
        for x := 0; x < len(cp); x++ { for y := x + 1; y < len(cp); y++ { if cp[y] < cp[x] { cp[x], cp[y] = cp[y], cp[x] } } }
        adj[i] = cp
    }
    return GraphRepr{Nodes: nodes, Adj: adj}
}`,
  }},

  // ─── copy-list-with-random-pointer (typed wire struct RandomList) ─────────
  { slug: "copy-list-with-random-pointer", archetype: "function · RandomList wire struct", solutions: {
    javascript: `
function copyRandomList(list) {
    return { vals: [...list.vals], randoms: list.randoms.map((r) => r) };
}`,
    rust: `
fn copyRandomList(list: RandomList) -> RandomList {
    RandomList { vals: list.vals.clone(), randoms: list.randoms.clone() }
}`,
    go: `
func copyRandomList(list RandomList) RandomList {
    vals := append([]int{}, list.Vals...)
    randoms := make([]*int, len(list.Randoms))
    for i, r := range list.Randoms { if r == nil { randoms[i] = nil } else { v := *r; randoms[i] = &v } }
    return RandomList{Vals: vals, Randoms: randoms}
}`,
  }},
];

const LANGS = ["javascript", "rust", "go"];

const summary = { javascript: { ok: 0, ng: 0, cases: 0, pass: 0 },
                  rust:       { ok: 0, ng: 0, cases: 0, pass: 0 },
                  go:         { ok: 0, ng: 0, cases: 0, pass: 0 } };
const failures = [];

console.log(`AlgoTutor Phase F acceptance — ${SUITE.length} problems × ${LANGS.length} languages = ${SUITE.length * LANGS.length} runs\n`);
console.log(`${"problem".padEnd(34)} ${"archetype".padEnd(36)} JS         RUST        GO`);
console.log("-".repeat(110));

for (const entry of SUITE) {
  const cells = [];
  for (const lang of LANGS) {
    const code = entry.solutions[lang];
    const t0 = Date.now();
    let r;
    try {
      r = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug: entry.slug, language: lang, code, mode: "tests" }),
      }).then((x) => x.json());
    } catch (e) {
      cells.push("NET ERR   ");
      summary[lang].ng++;
      failures.push({ slug: entry.slug, lang, why: `network: ${e.message}` });
      continue;
    }
    const ms = Date.now() - t0;
    if (r.compileError) {
      cells.push("COMPILE   ");
      summary[lang].ng++;
      failures.push({ slug: entry.slug, lang, why: "compile", detail: r.compileError.slice(0, 200) });
      continue;
    }
    const pass = r.results.filter((x) => x.status === "pass").length;
    const tot = r.results.length;
    summary[lang].cases += tot;
    summary[lang].pass += pass;
    if (pass === tot) {
      summary[lang].ok++;
      cells.push(`✓ ${String(pass).padStart(3)}/${String(tot).padEnd(3)}`.padEnd(10));
    } else {
      summary[lang].ng++;
      const first = r.results.find((x) => x.status !== "pass");
      failures.push({
        slug: entry.slug, lang, why: `${pass}/${tot}`,
        detail: `#${first.index} ${first.status} exp=${JSON.stringify(first.expected).slice(0,60)} got=${JSON.stringify(first.actual).slice(0,60)} ${first.stderr || ""}`.trim(),
      });
      cells.push(`✗ ${String(pass).padStart(3)}/${String(tot).padEnd(3)}`.padEnd(10));
    }
  }
  console.log(`${entry.slug.padEnd(34)} ${entry.archetype.padEnd(36)} ${cells.join("  ")}`);
}

console.log("\nPer-language summary:");
for (const lang of LANGS) {
  const s = summary[lang];
  console.log(`  ${lang.padEnd(11)} problems ${s.ok}/${s.ok + s.ng}   tests ${s.pass}/${s.cases}`);
}

if (failures.length) {
  console.log(`\n${failures.length} failure(s):`);
  for (const f of failures) {
    console.log(`  ${f.lang.padEnd(11)} ${f.slug.padEnd(34)} ${f.why}`);
    if (f.detail) console.log(`      ${f.detail}`);
  }
  process.exit(1);
}

console.log("\n✅ All reference solutions pass on all supported languages.");
