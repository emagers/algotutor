// Mutation acceptance — all 8 mutation problems with real Rust solutions.
const cases = [
  ["rotate-array", `
fn rotate(nums: &mut Vec<i32>, k: i32) {
    let n = nums.len();
    if n == 0 { return; }
    let k = (k.rem_euclid(n as i32)) as usize;
    nums.rotate_right(k);
}`],
  ["move-zeroes", `
fn moveZeroes(nums: &mut Vec<i32>) {
    let mut w = 0usize;
    for i in 0..nums.len() {
        if nums[i] != 0 { nums.swap(w, i); w += 1; }
    }
}`],
  ["rotate-image", `
fn rotate(matrix: &mut Vec<Vec<i32>>) {
    let n = matrix.len();
    for i in 0..n { for j in i+1..n { let t = matrix[i][j]; matrix[i][j] = matrix[j][i]; matrix[j][i] = t; } }
    for row in matrix.iter_mut() { row.reverse(); }
}`],
  ["set-matrix-zeroes", `
fn setZeroes(matrix: &mut Vec<Vec<i32>>) {
    let m = matrix.len(); if m == 0 { return; }
    let n = matrix[0].len();
    let mut rows = vec![false; m];
    let mut cols = vec![false; n];
    for i in 0..m { for j in 0..n { if matrix[i][j] == 0 { rows[i] = true; cols[j] = true; } } }
    for i in 0..m { for j in 0..n { if rows[i] || cols[j] { matrix[i][j] = 0; } } }
}`],
  ["merge-sorted-array", `
fn merge(nums1: &mut Vec<i32>, m: i32, nums2: Vec<i32>, n: i32) {
    let (mut i, mut j, mut k) = (m as i32 - 1, n as i32 - 1, m + n - 1);
    while j >= 0 {
        if i >= 0 && nums1[i as usize] > nums2[j as usize] {
            nums1[k as usize] = nums1[i as usize]; i -= 1;
        } else {
            nums1[k as usize] = nums2[j as usize]; j -= 1;
        }
        k -= 1;
    }
}`],
  ["remove-duplicates-from-sorted-array", `
fn removeDuplicates(nums: &mut Vec<i32>) -> i32 {
    if nums.is_empty() { return 0; }
    let mut w = 1usize;
    for i in 1..nums.len() {
        if nums[i] != nums[i - 1] { nums[w] = nums[i]; w += 1; }
    }
    w as i32
}`],
  ["game-of-life", `
fn gameOfLife(board: &mut Vec<Vec<i32>>) {
    let m = board.len(); if m == 0 { return; }
    let n = board[0].len();
    let snap: Vec<Vec<i32>> = board.clone();
    for i in 0..m {
        for j in 0..n {
            let mut live = 0;
            for di in -1i32..=1 { for dj in -1i32..=1 {
                if di == 0 && dj == 0 { continue; }
                let ni = i as i32 + di; let nj = j as i32 + dj;
                if ni >= 0 && nj >= 0 && (ni as usize) < m && (nj as usize) < n {
                    live += snap[ni as usize][nj as usize];
                }
            } }
            board[i][j] = if snap[i][j] == 1 { if live == 2 || live == 3 { 1 } else { 0 } }
                          else { if live == 3 { 1 } else { 0 } };
        }
    }
}`],
  ["reorder-list", `
fn reorderList(head: &mut Option<Box<ListNode>>) {
    // Collect into Vec, then re-link.
    let mut vals: Vec<i32> = Vec::new();
    {
        let mut cur = head.as_deref();
        while let Some(n) = cur { vals.push(n.val); cur = n.next.as_deref(); }
    }
    if vals.is_empty() { return; }
    let n = vals.len();
    let mut order: Vec<i32> = Vec::with_capacity(n);
    let (mut i, mut j) = (0usize, n - 1);
    while i < j { order.push(vals[i]); order.push(vals[j]); i += 1; j -= 1; }
    if i == j { order.push(vals[i]); }
    // Rebuild list in place
    let mut cur = head.as_deref_mut();
    for v in order { if let Some(n) = cur { n.val = v; cur = n.next.as_deref_mut(); } }
}`],
];

let pass = 0;
for (const [slug, code] of cases) {
  const r = await fetch("http://localhost:9090/api/run", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ slug, language: "rust", code, mode: "tests" }),
  }).then((x) => x.json());
  if (r.compileError) {
    console.log(`✗ ${slug.padEnd(40)} COMPILE/RUN ERROR`);
    console.log(r.compileError.split("\n").slice(0, 6).join("\n"));
    continue;
  }
  const p = r.results.filter((x) => x.status === "pass").length;
  const t = r.results.length;
  const mark = p === t ? "✓" : "✗";
  if (p === t) pass++;
  console.log(`${mark} ${slug.padEnd(40)} ${p}/${t} in ${r.totalMs}ms`);
  if (p !== t) {
    r.results.filter((x) => x.status !== "pass").slice(0, 1).forEach((rr) =>
      console.log(`    #${rr.index} ${rr.status}: expected=${JSON.stringify(rr.expected).slice(0,80)} actual=${JSON.stringify(rr.actual).slice(0,80)} ${rr.stderr || ""}`));
  }
}
console.log(`\n${pass}/${cases.length} mutation problems fully pass.`);
