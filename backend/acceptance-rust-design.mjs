// Phase D.3: Verify Rust design harness against real reference solutions.
// Runs against the live backend at http://localhost:9090.

const ENDPOINT = "http://localhost:9090/api/run";

const SOLUTIONS = {
  "min-stack": `
pub struct MinStack {
    stack: Vec<i32>,
    mins: Vec<i32>,
}
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

  "lru-cache": `
use std::collections::HashMap;
pub struct LRUCache {
    cap: usize,
    order: Vec<i32>,
    map: HashMap<i32, i32>,
}
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

  "design-twitter": `
use std::collections::HashMap;
pub struct Twitter {
    tweets: Vec<(i32, i32)>, // (user, tweet)
    follows: HashMap<i32, std::collections::HashSet<i32>>,
}
impl Twitter {
    pub fn new() -> Self { Twitter { tweets: Vec::new(), follows: HashMap::new() } }
    pub fn postTweet(&mut self, userId: i32, tweetId: i32) { self.tweets.push((userId, tweetId)); }
    pub fn getNewsFeed(&mut self, userId: i32) -> Vec<i32> {
        let empty = std::collections::HashSet::new();
        let f = self.follows.get(&userId).unwrap_or(&empty);
        let mut out = Vec::new();
        for &(u, t) in self.tweets.iter().rev() {
            if u == userId || f.contains(&u) { out.push(t); if out.len() == 10 { break; } }
        }
        out
    }
    pub fn follow(&mut self, followerId: i32, followeeId: i32) {
        self.follows.entry(followerId).or_insert_with(std::collections::HashSet::new).insert(followeeId);
    }
    pub fn unfollow(&mut self, followerId: i32, followeeId: i32) {
        if let Some(s) = self.follows.get_mut(&followerId) { s.remove(&followeeId); }
    }
}`,
};

async function run(slug, code) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ slug, language: "rust", code }),
  });
  const j = await res.json();
  return j;
}

let totalPass = 0, totalFail = 0;
for (const [slug, code] of Object.entries(SOLUTIONS)) {
  process.stdout.write(`${slug.padEnd(35)} `);
  const j = await run(slug, code);
  if (j.compileError) { console.log(`COMPILE FAIL: ${j.compileError.slice(0, 200)}`); totalFail++; continue; }
  const pass = j.results.filter((r) => r.status === "pass").length;
  const fail = j.results.length - pass;
  totalPass += pass; totalFail += fail;
  if (fail === 0) console.log(`✓ ${pass}/${j.results.length}`);
  else {
    const first = j.results.find((r) => r.status !== "pass");
    console.log(`✗ ${pass}/${j.results.length}  first fail: ${JSON.stringify({ exp: first.expected, got: first.actual, err: first.stderr }).slice(0, 250)}`);
  }
}
console.log(`\nTotal: ${totalPass} pass, ${totalFail} fail`);
process.exit(totalFail === 0 ? 0 : 1);
