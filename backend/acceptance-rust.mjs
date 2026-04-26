// Real Rust solutions for several classic problems — verify they pass all
// dataset tests through the Docker backend.
const cases = [
  ["best-time-to-buy-and-sell-stock", `
fn maxProfit(prices: Vec<i32>) -> i32 {
    let mut min_p = i32::MAX;
    let mut best = 0;
    for p in prices { if p < min_p { min_p = p; } else if p - min_p > best { best = p - min_p; } }
    best
}`],
  ["longest-substring-without-repeating-characters", `
fn lengthOfLongestSubstring(s: String) -> i32 {
    use std::collections::HashMap;
    let mut last: HashMap<u8, usize> = HashMap::new();
    let bytes = s.as_bytes();
    let (mut start, mut best) = (0usize, 0usize);
    for (i, &c) in bytes.iter().enumerate() {
        if let Some(&p) = last.get(&c) { if p >= start { start = p + 1; } }
        last.insert(c, i);
        if i + 1 - start > best { best = i + 1 - start; }
    }
    best as i32
}`],
  ["valid-parentheses", `
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
}`],
  ["maximum-depth-of-binary-tree", `
fn maxDepth(root: Option<Rc<RefCell<TreeNode>>>) -> i32 {
    match root {
        None => 0,
        Some(r) => {
            let b = r.borrow();
            1 + std::cmp::max(maxDepth(b.left.clone()), maxDepth(b.right.clone()))
        }
    }
}`],
  ["binary-search", `
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
}`],
  ["climbing-stairs", `
fn climbStairs(n: i32) -> i32 {
    let (mut a, mut b) = (1i32, 1i32);
    for _ in 0..n { let t = a + b; a = b; b = t; }
    a
}`],
  ["merge-two-sorted-lists", `
fn mergeTwoLists(list1: Option<Box<ListNode>>, list2: Option<Box<ListNode>>) -> Option<Box<ListNode>> {
    let mut dummy = Box::new(ListNode::new(0));
    let mut tail = &mut dummy;
    let (mut a, mut b) = (list1, list2);
    while let (Some(_), Some(_)) = (&a, &b) {
        if a.as_ref().unwrap().val <= b.as_ref().unwrap().val {
            let mut n = a.unwrap(); a = n.next.take(); tail.next = Some(n); tail = tail.next.as_mut().unwrap();
        } else {
            let mut n = b.unwrap(); b = n.next.take(); tail.next = Some(n); tail = tail.next.as_mut().unwrap();
        }
    }
    tail.next = if a.is_some() { a } else { b };
    dummy.next
}`],
  ["valid-palindrome", `
fn isPalindrome(s: String) -> bool {
    let bytes: Vec<u8> = s.bytes().filter(|&b| b.is_ascii_alphanumeric()).map(|b| b.to_ascii_lowercase()).collect();
    let (mut i, mut j) = (0usize, bytes.len().saturating_sub(1));
    while i < j {
        if bytes[i] != bytes[j] { return false; }
        i += 1; j -= 1;
    }
    true
}`],
];

let totalPass = 0, totalCases = 0, problemsPass = 0;
for (const [slug, code] of cases) {
  const r = await fetch("http://localhost:9090/api/run", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ slug, language: "rust", code, mode: "tests" }),
  }).then((x) => x.json());
  if (r.compileError) {
    console.log(`${slug.padEnd(50)} COMPILE ERROR`);
    console.log(r.compileError.split("\n").slice(0, 6).join("\n"));
    continue;
  }
  const pass = r.results.filter((x) => x.status === "pass").length;
  const tot = r.results.length;
  totalPass += pass; totalCases += tot;
  if (pass === tot) problemsPass++;
  const mark = pass === tot ? "✓" : "✗";
  console.log(`${mark} ${slug.padEnd(50)} ${pass}/${tot} in ${r.totalMs}ms`);
  if (pass !== tot) {
    r.results.filter((x) => x.status !== "pass").slice(0, 1).forEach((rr) =>
      console.log(`    #${rr.index} ${rr.status}: expected=${JSON.stringify(rr.expected).slice(0,80)} actual=${JSON.stringify(rr.actual).slice(0,80)} ${rr.stderr || ""}`));
  }
}
console.log(`\n${problemsPass}/${cases.length} problems fully pass; ${totalPass}/${totalCases} cases.`);
