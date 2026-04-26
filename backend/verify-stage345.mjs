// Verifier for the 3 last newly-supported problems (Rust + Go).
const BACKEND = "http://localhost:9090";

const cases = [
  {
    slug: "clone-graph",
    rust: `fn cloneGraphRoundTrip(graph: GraphRepr) -> GraphRepr {
    GraphRepr {
        nodes: graph.nodes.clone(),
        adj: graph.adj.iter().map(|row| {
            let mut r: Vec<usize> = row.clone();
            r.sort();
            r
        }).collect(),
    }
}
`,
    go: `func cloneGraphRoundTrip(graph GraphRepr) GraphRepr {
    nodes := append([]int{}, graph.Nodes...)
    adj := make([][]int, len(graph.Adj))
    for i, row := range graph.Adj {
        cp := append([]int{}, row...)
        // sort ascending
        for x := 0; x < len(cp); x++ {
            for y := x + 1; y < len(cp); y++ {
                if cp[y] < cp[x] { cp[x], cp[y] = cp[y], cp[x] }
            }
        }
        adj[i] = cp
    }
    return GraphRepr{Nodes: nodes, Adj: adj}
}
`,
  },
  {
    slug: "copy-list-with-random-pointer",
    rust: `fn copyRandomList(list: RandomList) -> RandomList {
    RandomList { vals: list.vals.clone(), randoms: list.randoms.clone() }
}
`,
    go: `func copyRandomList(list RandomList) RandomList {
    vals := append([]int{}, list.Vals...)
    randoms := make([]*int, len(list.Randoms))
    for i, r := range list.Randoms {
        if r == nil { randoms[i] = nil } else { v := *r; randoms[i] = &v }
    }
    return RandomList{Vals: vals, Randoms: randoms}
}
`,
  },
  {
    slug: "serialize-and-deserialize-binary-tree",
    rust: `pub struct Codec {}
impl Codec {
    pub fn new() -> Self { Codec {} }
    pub fn serialize(&mut self, root: Option<Rc<RefCell<TreeNode>>>) -> String {
        let mut out: Vec<String> = Vec::new();
        fn dfs(n: Option<Rc<RefCell<TreeNode>>>, out: &mut Vec<String>) {
            match n {
                None => out.push("#".to_string()),
                Some(rc) => {
                    let b = rc.borrow();
                    out.push(b.val.to_string());
                    dfs(b.left.clone(), out);
                    dfs(b.right.clone(), out);
                }
            }
        }
        dfs(root, &mut out);
        out.join(",")
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
}
`,
    go: `type Codec struct{}

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
        v := 0
        sign := 1
        for k := 0; k < len(t); k++ {
            if t[k] == '-' { sign = -1 } else { v = v*10 + int(t[k]-'0') }
        }
        n := &TreeNode{Val: sign * v}
        n.Left = des(); n.Right = des()
        return n
    }
    return des()
}
`,
  },
];

async function run(slug, language, code) {
  const r = await fetch(`${BACKEND}/api/run`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ slug, language, code, mode: "tests" }),
  });
  const body = await r.json();
  if (body.compileError) return { ok: false, error: "compile: " + body.compileError.slice(0, 1000) };
  if (!body.results) return { ok: false, error: JSON.stringify(body).slice(0, 600) };
  const total = body.results.length;
  const passed = body.results.filter((r) => r.status === "pass").length;
  const fails = body.results.filter((r) => r.status !== "pass").slice(0, 3).map((r) =>
    `[${r.index}] ${r.status}: actual=${JSON.stringify(r.actual).slice(0,100)} exp=${JSON.stringify(r.expected).slice(0,100)} err=${(r.stderr||r.error||"").slice(0,200)}`
  );
  return { ok: passed === total, passed, total, fails };
}

let any = 0, fail = 0;
for (const c of cases) {
  for (const lang of ["rust", "go"]) {
    any++;
    const res = await run(c.slug, lang, c[lang]);
    if (res.ok) {
      console.log(`✓ ${c.slug} [${lang}] ${res.passed}/${res.total}`);
    } else {
      fail++;
      console.log(`✗ ${c.slug} [${lang}]: ${res.error || `${res.passed}/${res.total} pass`}`);
      if (res.fails) for (const f of res.fails) console.log("    " + f);
    }
  }
}
console.log(`\n${any - fail}/${any} OK`);
process.exit(fail === 0 ? 0 : 1);
