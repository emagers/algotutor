// Multi-problem Rust smoke test against the running Docker backend.
async function run(name, slug, code) {
  const r = await fetch("http://localhost:9090/api/run", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ slug, language: "rust", code, mode: "tests" }),
  }).then((x) => x.json());
  if (r.compileError) {
    console.log(`${name.padEnd(36)} COMPILE/RUNTIME ERROR`);
    console.log(r.compileError.split("\n").slice(0, 8).join("\n"));
    return;
  }
  const pass = r.results.filter((x) => x.status === "pass").length;
  const total = r.results.length;
  console.log(`${name.padEnd(36)} ${pass}/${total} in ${r.totalMs}ms`);
  if (pass !== total) {
    r.results.filter((x) => x.status !== "pass").slice(0, 1).forEach((rr) =>
      console.log(`  #${rr.index} ${rr.status}: expected=${JSON.stringify(rr.expected).slice(0,80)} actual=${JSON.stringify(rr.actual).slice(0,80)} ${rr.stderr || ""}`));
  }
}

// 1. valid-anagram: identity strings, bool return
await run("valid-anagram", "valid-anagram", `
fn isAnagram(s: String, t: String) -> bool {
    if s.len() != t.len() { return false; }
    let mut count = [0i32; 26];
    for c in s.bytes() { count[(c - b'a') as usize] += 1; }
    for c in t.bytes() { count[(c - b'a') as usize] -= 1; }
    count.iter().all(|&x| x == 0)
}
`);

// 2. contains-duplicate: Vec<i32> in, bool out
await run("contains-duplicate", "contains-duplicate", `
fn containsDuplicate(nums: Vec<i32>) -> bool {
    use std::collections::HashSet;
    let mut s = HashSet::new();
    for n in nums { if !s.insert(n) { return true; } }
    false
}
`);

// 3. reverse-linked-list: Option<Box<ListNode>>
await run("reverse-linked-list", "reverse-linked-list", `
fn reverseList(head: Option<Box<ListNode>>) -> Option<Box<ListNode>> {
    let mut prev: Option<Box<ListNode>> = None;
    let mut cur = head;
    while let Some(mut n) = cur {
        cur = n.next.take();
        n.next = prev;
        prev = Some(n);
    }
    prev
}
`);

// 4. invert-binary-tree: Option<Rc<RefCell<TreeNode>>>
await run("invert-binary-tree", "invert-binary-tree", `
fn invertTree(root: Option<Rc<RefCell<TreeNode>>>) -> Option<Rc<RefCell<TreeNode>>> {
    if let Some(ref r) = root {
        let left = r.borrow_mut().left.take();
        let right = r.borrow_mut().right.take();
        r.borrow_mut().left = invertTree(right);
        r.borrow_mut().right = invertTree(left);
    }
    root
}
`);

// 5. wrong solution → fails reported correctly
await run("two-sum (wrong)", "two-sum", `
fn twoSum(_nums: Vec<i32>, _target: i32) -> Vec<i32> { vec![] }
`);

// 6. compile error → clean message
await run("two-sum (compile error)", "two-sum", `
fn twoSum(nums: Vec<i32>, target: i32) -> Vec<i32> {
    nuts.iter().count() // typo
}
`);

// 7. panic at runtime → reported per-case
await run("two-sum (panic)", "two-sum", `
fn twoSum(_nums: Vec<i32>, _target: i32) -> Vec<i32> {
    panic!("boom");
}
`);
