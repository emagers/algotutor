// Local backend smoke test. Spawns the server, hits /api/run with a few
// reference solutions plus one deliberately wrong one, then exits.
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { resolve } from "node:path";

const PORT = 9091;
const env = { ...process.env, PORT: String(PORT) };
const child = spawn(process.execPath, [resolve("backend/server.mjs")], { env, stdio: ["ignore", "pipe", "pipe"] });
child.stdout.on("data", (b) => process.stdout.write(`[srv] ${b}`));
child.stderr.on("data", (b) => process.stderr.write(`[srv-err] ${b}`));
await sleep(500);

async function run(name, body) {
  const r = await fetch(`http://localhost:${PORT}/api/run`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  const total = j.results?.length || 0;
  const pass = j.results?.filter((x) => x.status === "pass").length || 0;
  const fail = j.results?.filter((x) => x.status === "fail").length || 0;
  const err = j.results?.filter((x) => x.status === "error").length || 0;
  const compile = j.compileError ? ` compileError="${j.compileError}"` : "";
  console.log(`${name.padEnd(50)} ${pass}/${total} pass, ${fail} fail, ${err} err in ${j.totalMs}ms${compile}`);
  if (fail || err) {
    j.results.filter((x) => x.status !== "pass").slice(0, 1).forEach((r) =>
      console.log(`   #${r.index} ${r.status}: expected=${JSON.stringify(r.expected).slice(0,80)} actual=${JSON.stringify(r.actual).slice(0,80)} ${r.stderr || ""}`));
  }
}

try {
  // 1. correct twoSum
  await run("two-sum (correct JS)", { slug: "two-sum", language: "javascript",
    code: `function twoSum(nums, target){ const m=new Map(); for(let i=0;i<nums.length;i++){ const c=target-nums[i]; if(m.has(c))return [m.get(c),i]; m.set(nums[i],i);} return []; }` });
  // 2. wrong twoSum (returns []) — should fail every test
  await run("two-sum (wrong JS)", { slug: "two-sum", language: "javascript",
    code: `function twoSum(){ return []; }` });
  // 3. parse error
  await run("two-sum (parse error)", { slug: "two-sum", language: "javascript",
    code: `function twoSum( {` });
  // 4. linked list (reverse-linked-list)
  await run("reverse-linked-list (correct JS)", { slug: "reverse-linked-list", language: "javascript",
    code: `function reverseList(head){ let p=null; while(head){ const n=head.next; head.next=p; p=head; head=n; } return p; }` });
  // 5. binary tree (invert-binary-tree)
  await run("invert-binary-tree (correct JS)", { slug: "invert-binary-tree", language: "javascript",
    code: `function invertTree(r){ if(!r) return null; const t=r.left; r.left=invertTree(r.right); r.right=invertTree(t); return r; }` });
  // 6. mutation (rotate-array)
  await run("rotate-array (correct JS)", { slug: "rotate-array", language: "javascript",
    code: `function rotate(nums,k){ k=k%nums.length; const part=nums.splice(nums.length-k); nums.unshift(...part); }` });
  // 7. design (lru-cache, ops-tuples format)
  await run("lru-cache (correct JS)", { slug: "lru-cache", language: "javascript",
    code: `class LRUCache{constructor(c){this.c=c;this.m=new Map();} get(k){if(!this.m.has(k))return -1; const v=this.m.get(k); this.m.delete(k); this.m.set(k,v); return v;} put(k,v){ if(this.m.has(k))this.m.delete(k); this.m.set(k,v); if(this.m.size>this.c){const f=this.m.keys().next().value; this.m.delete(f);} }}` });
  // 8. design (lfu-cache, ops-args format)
  await run("design-twitter (rust unsupported wire path)", { slug: "design-twitter", language: "rust", code: "" });
  // 9. backend-unsupported
  await run("clone-graph (rust unsupported)", { slug: "clone-graph", language: "rust", code: "" });
  // 10. health
  const h = await fetch(`http://localhost:${PORT}/api/health`).then((r) => r.json());
  console.log("health:", JSON.stringify(h));
} finally {
  child.kill();
}
