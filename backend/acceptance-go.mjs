// Phase D Go acceptance: real reference solutions across function/mutation/design.
const ENDPOINT = "http://localhost:9090/api/run";

const SOLUTIONS = [
  // === Function: identity ===
  ["two-sum", `func twoSum(nums []int, target int) []int {
    m := map[int]int{}
    for i, n := range nums {
        if j, ok := m[target-n]; ok { return []int{j, i} }
        m[n] = i
    }
    return nil
}`],
  ["valid-parentheses", `func isValid(s string) bool {
    st := []byte{}
    pairs := map[byte]byte{')':'(',']':'[','}':'{'}
    for i := 0; i < len(s); i++ {
        c := s[i]
        if c == '(' || c == '[' || c == '{' { st = append(st, c); continue }
        if len(st) == 0 || st[len(st)-1] != pairs[c] { return false }
        st = st[:len(st)-1]
    }
    return len(st) == 0
}`],
  ["binary-search", `func search(nums []int, target int) int {
    lo, hi := 0, len(nums)-1
    for lo <= hi {
        mid := (lo+hi)/2
        if nums[mid] == target { return mid }
        if nums[mid] < target { lo = mid+1 } else { hi = mid-1 }
    }
    return -1
}`],
  ["climbing-stairs", `func climbStairs(n int) int {
    if n <= 2 { return n }
    a, b := 1, 2
    for i := 3; i <= n; i++ { a, b = b, a+b }
    return b
}`],
  ["best-time-to-buy-and-sell-stock", `func maxProfit(prices []int) int {
    minP := 1<<31 - 1
    best := 0
    for _, p := range prices {
        if p < minP { minP = p }
        if p - minP > best { best = p - minP }
    }
    return best
}`],

  // === Function: linked list ===
  ["reverse-linked-list", `func reverseList(head *ListNode) *ListNode {
    var prev *ListNode
    for head != nil {
        nx := head.Next
        head.Next = prev
        prev = head
        head = nx
    }
    return prev
}`],
  ["merge-two-sorted-lists", `func mergeTwoLists(list1 *ListNode, list2 *ListNode) *ListNode {
    d := &ListNode{}
    cur := d
    for list1 != nil && list2 != nil {
        if list1.Val <= list2.Val { cur.Next = list1; list1 = list1.Next } else { cur.Next = list2; list2 = list2.Next }
        cur = cur.Next
    }
    if list1 != nil { cur.Next = list1 }
    if list2 != nil { cur.Next = list2 }
    return d.Next
}`],

  // === Function: tree ===
  ["maximum-depth-of-binary-tree", `func maxDepth(root *TreeNode) int {
    if root == nil { return 0 }
    l := maxDepth(root.Left); r := maxDepth(root.Right)
    if l > r { return l + 1 }
    return r + 1
}`],

  // === Mutation ===
  ["move-zeroes", `func moveZeroes(nums []int) {
    w := 0
    for _, v := range nums { if v != 0 { nums[w] = v; w++ } }
    for i := w; i < len(nums); i++ { nums[i] = 0 }
}`],
  ["set-matrix-zeroes", `func setZeroes(matrix [][]int) {
    m, n := len(matrix), len(matrix[0])
    rows := make([]bool, m)
    cols := make([]bool, n)
    for i := 0; i < m; i++ {
        for j := 0; j < n; j++ {
            if matrix[i][j] == 0 { rows[i] = true; cols[j] = true }
        }
    }
    for i := 0; i < m; i++ {
        for j := 0; j < n; j++ {
            if rows[i] || cols[j] { matrix[i][j] = 0 }
        }
    }
}`],

  // === Design ===
  ["min-stack", `type MinStack struct {
    s []int
    m []int
}
func Constructor() MinStack { return MinStack{} }
func (this *MinStack) Push(val int) {
    this.s = append(this.s, val)
    if len(this.m) == 0 || val <= this.m[len(this.m)-1] {
        this.m = append(this.m, val)
    } else {
        this.m = append(this.m, this.m[len(this.m)-1])
    }
}
func (this *MinStack) Pop() {
    this.s = this.s[:len(this.s)-1]
    this.m = this.m[:len(this.m)-1]
}
func (this *MinStack) Top() int { return this.s[len(this.s)-1] }
func (this *MinStack) GetMin() int { return this.m[len(this.m)-1] }`],
  ["lru-cache", `type LRUCache struct {
    cap int
    order []int
    m map[int]int
}
func Constructor(capacity int) LRUCache {
    return LRUCache{cap: capacity, order: []int{}, m: map[int]int{}}
}
func (c *LRUCache) Get(key int) int {
    v, ok := c.m[key]
    if !ok { return -1 }
    for i, k := range c.order { if k == key { c.order = append(c.order[:i], c.order[i+1:]...); break } }
    c.order = append(c.order, key)
    return v
}
func (c *LRUCache) Put(key int, value int) {
    if _, ok := c.m[key]; ok {
        for i, k := range c.order { if k == key { c.order = append(c.order[:i], c.order[i+1:]...); break } }
    } else if len(c.m) >= c.cap {
        ev := c.order[0]; c.order = c.order[1:]; delete(c.m, ev)
    }
    c.m[key] = value
    c.order = append(c.order, key)
}`],
];

// LeetCode Go uses capitalized method names (Push/Pop/Get/Put), but the question schema
// has lowercase (push/pop/get/put). The harness dispatches on lowercase.
// So users must define lowercase method names matching the schema. Adjust min-stack / lru-cache.
const remap = {
  "min-stack": [
    [/\bPush\b/g, "push"], [/\bPop\b/g, "pop"], [/\bTop\b/g, "top"], [/\bGetMin\b/g, "getMin"],
  ],
  "lru-cache": [
    [/\bGet\b/g, "get"], [/\bPut\b/g, "put"],
  ],
};

let totalPass = 0, totalFail = 0, totalCases = 0;
for (let [slug, code] of SOLUTIONS) {
  if (remap[slug]) {
    for (const [re, repl] of remap[slug]) code = code.replace(re, repl);
  }
  process.stdout.write(`${slug.padEnd(38)} `);
  const res = await fetch(ENDPOINT, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ slug, language: "go", code }),
  });
  const j = await res.json();
  if (j.compileError) {
    totalFail++;
    console.log(`COMPILE FAIL: ${j.compileError.slice(0, 200).replace(/\n/g, " ")}`);
    continue;
  }
  const pass = j.results.filter((r) => r.status === "pass").length;
  const fail = j.results.length - pass;
  totalPass += pass; totalFail += fail; totalCases += j.results.length;
  if (fail === 0) console.log(`✓ ${pass}/${j.results.length}`);
  else {
    const first = j.results.find((r) => r.status !== "pass");
    console.log(`✗ ${pass}/${j.results.length}  first fail: ${JSON.stringify({ exp: first.expected, got: first.actual, err: first.stderr }).slice(0, 250)}`);
  }
}
console.log(`\nTotal: ${totalPass}/${totalCases} cases pass (${totalFail} failures).`);
process.exit(totalFail === 0 ? 0 : 1);
