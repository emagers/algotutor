// Runnable reference solutions used to generate expected outputs and validate
// candidate solutions. Each export is the same function shown in the JSON's
// solution.code (just without TypeScript type annotations).
//
// Shared classes (ListNode, TreeNode), input/output adapters, and comparators
// also live here so the build script and the test runner share one source of
// truth.

// ---------- Shared shape helpers ----------

export class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

export class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

export const adapters = {
  identity: (x) => x,

  arrayToLinkedList(arr) {
    if (!arr || arr.length === 0) return null;
    const head = new ListNode(arr[0]);
    let tail = head;
    for (let i = 1; i < arr.length; i++) {
      tail.next = new ListNode(arr[i]);
      tail = tail.next;
    }
    return head;
  },

  linkedListToArray(head) {
    const out = [];
    let cur = head;
    while (cur) {
      out.push(cur.val);
      cur = cur.next;
    }
    return out;
  },

  // LeetCode level-order with `null` placeholders for absent children.
  arrayToBinaryTree(arr) {
    if (!arr || arr.length === 0 || arr[0] === null) return null;
    const root = new TreeNode(arr[0]);
    const q = [root];
    let i = 1;
    while (q.length && i < arr.length) {
      const node = q.shift();
      if (i < arr.length) {
        const lv = arr[i++];
        if (lv !== null && lv !== undefined) {
          node.left = new TreeNode(lv);
          q.push(node.left);
        }
      }
      if (i < arr.length) {
        const rv = arr[i++];
        if (rv !== null && rv !== undefined) {
          node.right = new TreeNode(rv);
          q.push(node.right);
        }
      }
    }
    return root;
  },

  binaryTreeToLevelOrder(root) {
    if (!root) return [];
    const out = [];
    const q = [root];
    while (q.length) {
      const node = q.shift();
      if (node === null) {
        out.push(null);
        continue;
      }
      out.push(node.val);
      q.push(node.left);
      q.push(node.right);
    }
    while (out.length && out[out.length - 1] === null) out.pop();
    return out;
  },
};

// ---------- Comparators ----------

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
    return true;
  }
  if (typeof a === "object") {
    const ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (const k of ka) if (!deepEqual(a[k], b[k])) return false;
    return true;
  }
  return false;
}

function canonSortedArray(arr) {
  return [...arr].sort((x, y) => (x < y ? -1 : x > y ? 1 : 0));
}

function canonSetOfArrays(arrs) {
  const inner = arrs.map((a) => canonSortedArray(a));
  inner.sort((a, b) => {
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) {
      if (a[i] < b[i]) return -1;
      if (a[i] > b[i]) return 1;
    }
    return a.length - b.length;
  });
  return inner;
}

export const comparators = {
  exact: (a, b) => deepEqual(a, b),
  sortedArray: (a, b) => deepEqual(canonSortedArray(a), canonSortedArray(b)),
  setOfArrays: (a, b) => deepEqual(canonSetOfArrays(a), canonSetOfArrays(b)),
  // For problems that accept any string of optimal length (e.g., longest
  // palindromic substring, minimum window). The candidate must return the same
  // length as the reference; LC accepts any valid such string.
  stringLength: (a, b) => typeof a === "string" && typeof b === "string" && a.length === b.length,
};

export function deepClone(x) {
  if (x === null || typeof x !== "object") return x;
  if (Array.isArray(x)) return x.map(deepClone);
  const out = {};
  for (const k of Object.keys(x)) out[k] = deepClone(x[k]);
  return out;
}

// ---------- Reference solutions (plain JS, mirrors solution.code in JSON) ----------

export function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    const j = seen.get(need);
    if (j !== undefined) return [j, i];
    seen.set(nums[i], i);
  }
  return [];
}

export function maxProfit(prices) {
  let minPrice = Infinity, best = 0;
  for (const p of prices) {
    if (p < minPrice) minPrice = p;
    else if (p - minPrice > best) best = p - minPrice;
  }
  return best;
}

export function containsDuplicate(nums) {
  const seen = new Set();
  for (const x of nums) {
    if (seen.has(x)) return true;
    seen.add(x);
  }
  return false;
}

export function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = new Array(26).fill(0);
  const a = "a".charCodeAt(0);
  for (let i = 0; i < s.length; i++) {
    count[s.charCodeAt(i) - a]++;
    count[t.charCodeAt(i) - a]--;
  }
  return count.every((c) => c === 0);
}

export function isValid(s) {
  const match = { ")": "(", "]": "[", "}": "{" };
  const stack = [];
  for (const ch of s) {
    if (ch === "(" || ch === "[" || ch === "{") stack.push(ch);
    else if (stack.pop() !== match[ch]) return false;
  }
  return stack.length === 0;
}

export function mergeTwoLists(list1, list2) {
  const dummy = new ListNode();
  let tail = dummy;
  while (list1 && list2) {
    if (list1.val <= list2.val) { tail.next = list1; list1 = list1.next; }
    else { tail.next = list2; list2 = list2.next; }
    tail = tail.next;
  }
  tail.next = list1 ?? list2;
  return dummy.next;
}

export function invertTree(root) {
  if (!root) return null;
  const left = invertTree(root.left);
  const right = invertTree(root.right);
  root.left = right;
  root.right = left;
  return root;
}

export function search(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

export function maxSubArray(nums) {
  let cur = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    if (cur > best) best = cur;
  }
  return best;
}

export function productExceptSelf(nums) {
  const n = nums.length;
  const out = new Array(n);
  out[0] = 1;
  for (let i = 1; i < n; i++) out[i] = out[i - 1] * nums[i - 1];
  let right = 1;
  for (let i = n - 1; i >= 0; i--) {
    out[i] *= right;
    right *= nums[i];
  }
  return out;
}

export function threeSum(nums) {
  nums = [...nums].sort((a, b) => a - b);
  const out = [];
  const n = nums.length;
  for (let i = 0; i < n - 2; i++) {
    if (nums[i] > 0) break;
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let l = i + 1, r = n - 1;
    while (l < r) {
      const s = nums[i] + nums[l] + nums[r];
      if (s === 0) {
        out.push([nums[i], nums[l], nums[r]]);
        while (l < r && nums[l] === nums[l + 1]) l++;
        while (l < r && nums[r] === nums[r - 1]) r--;
        l++; r--;
      } else if (s < 0) l++;
      else r--;
    }
  }
  return out;
}

export function lengthOfLongestSubstring(s) {
  const lastIdx = new Map();
  let l = 0, best = 0;
  for (let r = 0; r < s.length; r++) {
    const c = s[r];
    const prev = lastIdx.get(c);
    if (prev !== undefined && prev >= l) l = prev + 1;
    lastIdx.set(c, r);
    if (r - l + 1 > best) best = r - l + 1;
  }
  return best;
}

export function groupAnagrams(strs) {
  const groups = new Map();
  const a = "a".charCodeAt(0);
  for (const s of strs) {
    const count = new Array(26).fill(0);
    for (let i = 0; i < s.length; i++) count[s.charCodeAt(i) - a]++;
    const key = count.join(",");
    const bucket = groups.get(key);
    if (bucket) bucket.push(s);
    else groups.set(key, [s]);
  }
  return Array.from(groups.values());
}

export function searchRotated(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    if (nums[mid] === target) return mid;
    if (nums[lo] <= nums[mid]) {
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}

export function numIslands(grid) {
  const m = grid.length, n = grid[0].length;
  let count = 0;
  // Iterative DFS with an explicit stack to avoid recursion overflow on 300x300.
  const stack = [];
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] === "1") {
        count++;
        stack.push([r, c]);
        grid[r][c] = "0";
        while (stack.length) {
          const [cr, cc] = stack.pop();
          const nbrs = [[cr+1,cc],[cr-1,cc],[cr,cc+1],[cr,cc-1]];
          for (const [nr, nc] of nbrs) {
            if (nr >= 0 && nc >= 0 && nr < m && nc < n && grid[nr][nc] === "1") {
              grid[nr][nc] = "0";
              stack.push([nr, nc]);
            }
          }
        }
      }
    }
  }
  return count;
}

export function canFinish(numCourses, prerequisites) {
  const adj = Array.from({ length: numCourses }, () => []);
  const indeg = new Array(numCourses).fill(0);
  for (const [a, b] of prerequisites) {
    adj[b].push(a);
    indeg[a]++;
  }
  const queue = [];
  for (let i = 0; i < numCourses; i++) if (indeg[i] === 0) queue.push(i);
  let head = 0, taken = 0;
  while (head < queue.length) {
    const u = queue[head++];
    taken++;
    for (const v of adj[u]) {
      if (--indeg[v] === 0) queue.push(v);
    }
  }
  return taken === numCourses;
}

export function coinChange(coins, amount) {
  const INF = amount + 1;
  const dp = new Array(amount + 1).fill(INF);
  dp[0] = 0;
  for (let x = 1; x <= amount; x++) {
    for (const c of coins) {
      if (c <= x && dp[x - c] + 1 < dp[x]) dp[x] = dp[x - c] + 1;
    }
  }
  return dp[amount] === INF ? -1 : dp[amount];
}

export function wordBreak(s, wordDict) {
  const dict = new Set(wordDict);
  let maxLen = 0;
  for (const w of wordDict) if (w.length > maxLen) maxLen = w.length;
  const n = s.length;
  const dp = new Array(n + 1).fill(false);
  dp[0] = true;
  for (let i = 1; i <= n; i++) {
    for (let j = Math.max(0, i - maxLen); j < i; j++) {
      if (dp[j] && dict.has(s.slice(j, i))) {
        dp[i] = true;
        break;
      }
    }
  }
  return dp[n];
}

export function topKFrequent(nums, k) {
  const freq = new Map();
  for (const x of nums) freq.set(x, (freq.get(x) ?? 0) + 1);
  const buckets = Array.from({ length: nums.length + 1 }, () => []);
  for (const [val, f] of freq) buckets[f].push(val);
  const out = [];
  for (let f = buckets.length - 1; f >= 0 && out.length < k; f--) {
    for (const v of buckets[f]) {
      out.push(v);
      if (out.length === k) break;
    }
  }
  return out;
}

export function trap(height) {
  let l = 0, r = height.length - 1;
  let leftMax = 0, rightMax = 0, water = 0;
  while (l < r) {
    if (height[l] < height[r]) {
      if (height[l] >= leftMax) leftMax = height[l];
      else water += leftMax - height[l];
      l++;
    } else {
      if (height[r] >= rightMax) rightMax = height[r];
      else water += rightMax - height[r];
      r--;
    }
  }
  return water;
}

// Maps slug → exported function (helps the build script and runner).
export const referenceSolutions = {
  "two-sum": twoSum,
  "best-time-to-buy-and-sell-stock": maxProfit,
  "contains-duplicate": containsDuplicate,
  "valid-anagram": isAnagram,
  "valid-parentheses": isValid,
  "merge-two-sorted-lists": mergeTwoLists,
  "invert-binary-tree": invertTree,
  "binary-search": search,
  "maximum-subarray": maxSubArray,
  "product-of-array-except-self": productExceptSelf,
  "3sum": threeSum,
  "longest-substring-without-repeating-characters": lengthOfLongestSubstring,
  "group-anagrams": groupAnagrams,
  "search-in-rotated-sorted-array": searchRotated,
  "number-of-islands": numIslands,
  "course-schedule": canFinish,
  "coin-change": coinChange,
  "word-break": wordBreak,
  "top-k-frequent-elements": topKFrequent,
  "trapping-rain-water": trap,

  // Phase 2
  "valid-palindrome": isPalindromeAlnum,
  "two-sum-ii": twoSumSorted,
  "container-with-most-water": maxArea,
  "move-zeroes": moveZeroes,
  "remove-duplicates-from-sorted-array": removeDuplicates,
  "merge-sorted-array": mergeSortedArrays,
  "longest-consecutive-sequence": longestConsecutive,
  "encode-decode-strings": codecRoundTrip,
  "longest-palindromic-substring": longestPalindrome,
  "palindromic-substrings": countSubstrings,
  "longest-repeating-character-replacement": characterReplacement,
  "minimum-window-substring": minWindow,
  "permutation-in-string": checkInclusion,
  "sliding-window-maximum": maxSlidingWindow,
  "find-minimum-in-rotated-sorted-array": findMin,
  "search-2d-matrix": searchMatrix,
  "koko-eating-bananas": minEatingSpeed,
  "min-stack": minStackOps,
  "evaluate-reverse-polish-notation": evalRPN,
  "daily-temperatures": dailyTemperatures,
  "largest-rectangle-in-histogram": largestRectangleArea,
  "generate-parentheses": generateParenthesis,
  "car-fleet": carFleet,
  "squares-of-a-sorted-array": sortedSquares,
  "set-matrix-zeroes": setZeroes,

  // Phase 3
  "reverse-linked-list": reverseList,
  "linked-list-cycle": hasCycle,
  "linked-list-cycle-ii": detectCycleIndex,
  "middle-of-the-linked-list": middleNode,
  "palindrome-linked-list": isPalindromeList,
  "remove-nth-node-from-end-of-list": removeNthFromEnd,
  "reorder-list": reorderList,
  "add-two-numbers": addTwoNumbers,
  "copy-list-with-random-pointer": copyRandomList,
  "merge-k-sorted-lists": mergeKLists,
  "reverse-nodes-in-k-group": reverseKGroup,
  "lru-cache": lruCacheOps,

  // Phase 4
  "maximum-depth-of-binary-tree": maxDepth,
  "same-tree": isSameTree,
  "symmetric-tree": isSymmetric,
  "diameter-of-binary-tree": diameterOfBinaryTree,
  "balanced-binary-tree": isBalanced,
  "path-sum": hasPathSum,
  "binary-tree-inorder-traversal": inorderTraversal,
  "subtree-of-another-tree": isSubtree,
  "binary-tree-level-order-traversal": levelOrder,
  "binary-tree-right-side-view": rightSideView,
  "binary-tree-zigzag-level-order-traversal": zigzagLevelOrder,
  "count-good-nodes-in-binary-tree": goodNodes,
  "validate-binary-search-tree": isValidBST,
  "kth-smallest-element-in-a-bst": kthSmallest,
  "lowest-common-ancestor-of-a-bst": lowestCommonAncestorBST,
  "lowest-common-ancestor-of-a-binary-tree": lowestCommonAncestorBT,
  "construct-binary-tree-from-preorder-and-inorder": buildTreeFromPreorderInorder,
  "binary-tree-maximum-path-sum": maxPathSum,
  "serialize-and-deserialize-binary-tree": codecBinaryTreeRoundTrip,
  "convert-sorted-array-to-bst": sortedArrayToBST,

  // Phase 5
  "clone-graph": cloneGraphRoundTrip,
  "pacific-atlantic-water-flow": pacificAtlantic,
  "course-schedule-ii": findOrder,
  "number-of-connected-components": countComponents,
  "graph-valid-tree": validTree,
  "word-ladder": ladderLength,
  "rotting-oranges": orangesRotting,
  "surrounded-regions": solveSurrounded,
  "walls-and-gates": wallsAndGates,
  "max-area-of-island": maxAreaOfIsland,
  "redundant-connection": findRedundantConnection,
  "network-delay-time": networkDelayTime,
  "cheapest-flights-within-k-stops": findCheapestPrice,
  "reconstruct-itinerary": findItinerary,
  "alien-dictionary": alienOrder,
  "kth-largest-element-in-an-array": findKthLargest,
  "kth-largest-element-in-a-stream": kthLargestStreamOps,
  "k-closest-points-to-origin": kClosest,
  "last-stone-weight": lastStoneWeight,
  "task-scheduler": leastInterval,
  "find-median-from-data-stream": medianFinderOps,
  "implement-trie": trieOps,
  "design-add-and-search-words-data-structure": wordDictionaryOps,
  "word-search-ii": findWords,
  "reorganize-string": reorganizeString,
  "climbing-stairs": climbStairs,
  "house-robber": rob,
  "house-robber-ii": robII,
  "decode-ways": numDecodings,
  "maximum-product-subarray": maxProduct,
  "longest-increasing-subsequence": lengthOfLIS,
  "partition-equal-subset-sum": canPartition,
  "unique-paths": uniquePaths,
  "unique-paths-ii": uniquePathsWithObstacles,
  "minimum-path-sum": minPathSum,
  "jump-game": canJump,
  "jump-game-ii": jumpII,
  "coin-change-ii": changeII,
  "combination-sum-iv": combinationSum4,
  "target-sum": findTargetSumWays,
  "longest-common-subsequence": longestCommonSubsequence,
  "best-time-to-buy-and-sell-stock-with-cooldown": maxProfitCooldown,
  "best-time-to-buy-and-sell-stock-iv": maxProfitIV,
  "edit-distance": minDistance,
  "burst-balloons": maxCoins,
  "regular-expression-matching": isMatchRegex,
  "interleaving-string": isInterleave,
  "longest-increasing-path-in-a-matrix": longestIncreasingPath,
  "subsets": subsets,
  "subsets-ii": subsetsWithDup,
  "permutations": permute,
  "permutations-ii": permuteUnique,
  "combination-sum": combinationSum,
  "combination-sum-ii": combinationSum2,
  "word-search": exist,
  "palindrome-partitioning": partitionPalindrome,
  "n-queens": solveNQueens,
  "letter-combinations-of-a-phone-number": letterCombinations,
  "insert-interval": insertInterval,
  "merge-intervals": mergeIntervals,
  "non-overlapping-intervals": eraseOverlapIntervals,
  "meeting-rooms": canAttendMeetings,
  "meeting-rooms-ii": minMeetingRooms,
  "minimum-number-of-arrows-to-burst-balloons": findMinArrowShots,
  "best-time-to-buy-and-sell-stock-ii": maxProfitII,
  "gas-station": canCompleteCircuit,
  "hand-of-straights": isNStraightHand,
  "merge-triplets-to-form-target-triplet": mergeTriplets,
  "partition-labels": partitionLabels,
  "valid-parenthesis-string": checkValidString,
  "candy": candy,
  "boats-to-save-people": numRescueBoats,
  "minimum-interval-to-include-each-query": minInterval,
};

// ===================== Phase 2 reference implementations =====================

export function isPalindromeAlnum(s) {
  const isAlnum = (c) =>
    (c >= "0" && c <= "9") || (c >= "a" && c <= "z") || (c >= "A" && c <= "Z");
  let l = 0, r = s.length - 1;
  while (l < r) {
    while (l < r && !isAlnum(s[l])) l++;
    while (l < r && !isAlnum(s[r])) r--;
    if (s[l].toLowerCase() !== s[r].toLowerCase()) return false;
    l++; r--;
  }
  return true;
}

export function twoSumSorted(numbers, target) {
  let l = 0, r = numbers.length - 1;
  while (l < r) {
    const s = numbers[l] + numbers[r];
    if (s === target) return [l + 1, r + 1];
    if (s < target) l++;
    else r--;
  }
  return [];
}

export function maxArea(height) {
  let l = 0, r = height.length - 1, best = 0;
  while (l < r) {
    const h = Math.min(height[l], height[r]);
    const a = h * (r - l);
    if (a > best) best = a;
    if (height[l] < height[r]) l++;
    else r--;
  }
  return best;
}

export function moveZeroes(nums) {
  let w = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      const tmp = nums[w]; nums[w] = nums[i]; nums[i] = tmp;
      w++;
    }
  }
  return nums;
}

export function removeDuplicates(nums) {
  if (nums.length === 0) return [0, []];
  let w = 1;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] !== nums[w - 1]) nums[w++] = nums[i];
  }
  return [w, nums.slice(0, w)];
}

export function mergeSortedArrays(nums1, m, nums2, n) {
  let i = m - 1, j = n - 1, k = m + n - 1;
  while (j >= 0) {
    if (i >= 0 && nums1[i] > nums2[j]) nums1[k--] = nums1[i--];
    else nums1[k--] = nums2[j--];
  }
  return nums1;
}

export function longestConsecutive(nums) {
  const set = new Set(nums);
  let best = 0;
  for (const x of set) {
    if (set.has(x - 1)) continue;
    let len = 1;
    while (set.has(x + len)) len++;
    if (len > best) best = len;
  }
  return best;
}

// Encode/decode round-trip — exercises both sides of the codec.
export function codecRoundTrip(strs) {
  const encoded = strs.map((s) => s.length + "#" + s).join("");
  const out = [];
  let i = 0;
  while (i < encoded.length) {
    let j = i;
    while (encoded[j] !== "#") j++;
    const len = parseInt(encoded.slice(i, j), 10);
    out.push(encoded.slice(j + 1, j + 1 + len));
    i = j + 1 + len;
  }
  return out;
}

export function longestPalindrome(s) {
  if (s.length < 2) return s;
  let bestL = 0, bestR = 0;
  const expand = (l, r) => {
    while (l >= 0 && r < s.length && s[l] === s[r]) { l--; r++; }
    if (r - l - 2 > bestR - bestL) { bestL = l + 1; bestR = r - 1; }
  };
  for (let i = 0; i < s.length; i++) {
    expand(i, i);
    expand(i, i + 1);
  }
  return s.slice(bestL, bestR + 1);
}

export function countSubstrings(s) {
  let count = 0;
  const expand = (l, r) => {
    while (l >= 0 && r < s.length && s[l] === s[r]) { l--; r++; count++; }
  };
  for (let i = 0; i < s.length; i++) {
    expand(i, i);
    expand(i, i + 1);
  }
  return count;
}

export function characterReplacement(s, k) {
  const count = new Array(26).fill(0);
  const a = "A".charCodeAt(0);
  let l = 0, maxCount = 0, best = 0;
  for (let r = 0; r < s.length; r++) {
    const ci = s.charCodeAt(r) - a;
    count[ci]++;
    if (count[ci] > maxCount) maxCount = count[ci];
    while (r - l + 1 - maxCount > k) {
      count[s.charCodeAt(l) - a]--;
      l++;
    }
    if (r - l + 1 > best) best = r - l + 1;
  }
  return best;
}

export function minWindow(s, t) {
  if (t.length === 0 || s.length < t.length) return "";
  const need = new Map();
  for (const c of t) need.set(c, (need.get(c) || 0) + 1);
  let required = need.size;
  let formed = 0;
  const have = new Map();
  let l = 0, bestL = -1, bestLen = Infinity;
  for (let r = 0; r < s.length; r++) {
    const c = s[r];
    have.set(c, (have.get(c) || 0) + 1);
    if (need.has(c) && have.get(c) === need.get(c)) formed++;
    while (formed === required) {
      if (r - l + 1 < bestLen) { bestLen = r - l + 1; bestL = l; }
      const lc = s[l];
      have.set(lc, have.get(lc) - 1);
      if (need.has(lc) && have.get(lc) < need.get(lc)) formed--;
      l++;
    }
  }
  return bestL === -1 ? "" : s.slice(bestL, bestL + bestLen);
}

export function checkInclusion(s1, s2) {
  if (s1.length > s2.length) return false;
  const a = "a".charCodeAt(0);
  const need = new Array(26).fill(0);
  const have = new Array(26).fill(0);
  for (let i = 0; i < s1.length; i++) {
    need[s1.charCodeAt(i) - a]++;
    have[s2.charCodeAt(i) - a]++;
  }
  let matches = 0;
  for (let i = 0; i < 26; i++) if (need[i] === have[i]) matches++;
  for (let r = s1.length; r < s2.length; r++) {
    if (matches === 26) return true;
    const inIdx = s2.charCodeAt(r) - a;
    have[inIdx]++;
    if (have[inIdx] === need[inIdx]) matches++;
    else if (have[inIdx] === need[inIdx] + 1) matches--;
    const outIdx = s2.charCodeAt(r - s1.length) - a;
    have[outIdx]--;
    if (have[outIdx] === need[outIdx]) matches++;
    else if (have[outIdx] === need[outIdx] - 1) matches--;
  }
  return matches === 26;
}

export function maxSlidingWindow(nums, k) {
  const dq = []; // store indices, values decreasing
  const out = [];
  for (let i = 0; i < nums.length; i++) {
    while (dq.length && dq[0] <= i - k) dq.shift();
    while (dq.length && nums[dq[dq.length - 1]] < nums[i]) dq.pop();
    dq.push(i);
    if (i >= k - 1) out.push(nums[dq[0]]);
  }
  return out;
}

export function findMin(nums) {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (nums[mid] > nums[hi]) lo = mid + 1;
    else hi = mid;
  }
  return nums[lo];
}

export function searchMatrix(matrix, target) {
  const m = matrix.length, n = matrix[0]?.length ?? 0;
  if (n === 0) return false;
  let lo = 0, hi = m * n - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    const v = matrix[Math.floor(mid / n)][mid % n];
    if (v === target) return true;
    if (v < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return false;
}

export function minEatingSpeed(piles, h) {
  let lo = 1, hi = 0;
  for (const p of piles) if (p > hi) hi = p;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    let need = 0;
    for (const p of piles) need += Math.ceil(p / mid);
    if (need <= h) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

// ops: array of [methodName, ...args]. Returns array with each op's return
// value (null for ops that return nothing). Constructor is implicit on first op.
export function minStackOps(ops) {
  const stack = [];
  const mins = [];
  const out = [];
  for (const op of ops) {
    const [name, ...args] = op;
    switch (name) {
      case "push": {
        const v = args[0];
        stack.push(v);
        mins.push(mins.length === 0 ? v : Math.min(mins[mins.length - 1], v));
        out.push(null);
        break;
      }
      case "pop":
        stack.pop();
        mins.pop();
        out.push(null);
        break;
      case "top":
        out.push(stack[stack.length - 1]);
        break;
      case "getMin":
        out.push(mins[mins.length - 1]);
        break;
      default:
        throw new Error("unknown op " + name);
    }
  }
  return out;
}

export function evalRPN(tokens) {
  const st = [];
  for (const tok of tokens) {
    if (tok === "+" || tok === "-" || tok === "*" || tok === "/") {
      const b = st.pop(), a = st.pop();
      let v;
      if (tok === "+") v = a + b;
      else if (tok === "-") v = a - b;
      else if (tok === "*") v = a * b;
      else v = a / b >= 0 ? Math.floor(a / b) : Math.ceil(a / b); // truncate toward zero
      st.push(v);
    } else st.push(parseInt(tok, 10));
  }
  return st[0];
}

export function dailyTemperatures(temps) {
  const out = new Array(temps.length).fill(0);
  const st = []; // indices, decreasing temps
  for (let i = 0; i < temps.length; i++) {
    while (st.length && temps[st[st.length - 1]] < temps[i]) {
      const j = st.pop();
      out[j] = i - j;
    }
    st.push(i);
  }
  return out;
}

export function largestRectangleArea(heights) {
  const st = []; // indices, increasing heights
  let best = 0;
  for (let i = 0; i <= heights.length; i++) {
    const h = i === heights.length ? 0 : heights[i];
    while (st.length && heights[st[st.length - 1]] > h) {
      const top = st.pop();
      const left = st.length ? st[st.length - 1] : -1;
      const area = heights[top] * (i - left - 1);
      if (area > best) best = area;
    }
    st.push(i);
  }
  return best;
}

export function generateParenthesis(n) {
  const out = [];
  const dfs = (cur, open, close) => {
    if (cur.length === 2 * n) { out.push(cur); return; }
    if (open < n) dfs(cur + "(", open + 1, close);
    if (close < open) dfs(cur + ")", open, close + 1);
  };
  dfs("", 0, 0);
  return out;
}

export function carFleet(target, position, speed) {
  const n = position.length;
  const cars = position.map((p, i) => [p, speed[i]]).sort((a, b) => b[0] - a[0]);
  let fleets = 0;
  let prevTime = 0;
  for (const [p, s] of cars) {
    const t = (target - p) / s;
    if (t > prevTime) { fleets++; prevTime = t; }
  }
  return fleets;
}

export function sortedSquares(nums) {
  const n = nums.length;
  const out = new Array(n);
  let l = 0, r = n - 1, w = n - 1;
  while (l <= r) {
    const a = nums[l] * nums[l], b = nums[r] * nums[r];
    if (a > b) { out[w--] = a; l++; }
    else { out[w--] = b; r--; }
  }
  return out;
}

export function setZeroes(matrix) {
  const m = matrix.length, n = matrix[0]?.length ?? 0;
  if (n === 0) return matrix;
  let firstRowZero = false, firstColZero = false;
  for (let j = 0; j < n; j++) if (matrix[0][j] === 0) { firstRowZero = true; break; }
  for (let i = 0; i < m; i++) if (matrix[i][0] === 0) { firstColZero = true; break; }
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      if (matrix[i][j] === 0) { matrix[i][0] = 0; matrix[0][j] = 0; }
    }
  }
  for (let i = 1; i < m; i++)
    for (let j = 1; j < n; j++)
      if (matrix[i][0] === 0 || matrix[0][j] === 0) matrix[i][j] = 0;
  if (firstRowZero) for (let j = 0; j < n; j++) matrix[0][j] = 0;
  if (firstColZero) for (let i = 0; i < m; i++) matrix[i][0] = 0;
  return matrix;
}

// ===================== Phase 3 reference implementations =====================

// 1. Reverse Linked List
export function reverseList(head) {
  let prev = null, cur = head;
  while (cur) { const nxt = cur.next; cur.next = prev; prev = cur; cur = nxt; }
  return prev;
}

// 2. Linked List Cycle — input: arr, pos (-1 = no cycle); returns boolean.
export function hasCycle(arr, pos) {
  if (!arr || arr.length === 0) return false;
  const head = new ListNode(arr[0]);
  let tail = head;
  const nodes = [head];
  for (let i = 1; i < arr.length; i++) {
    tail.next = new ListNode(arr[i]);
    tail = tail.next;
    nodes.push(tail);
  }
  if (pos >= 0 && pos < nodes.length) tail.next = nodes[pos];
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next; fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}

// 3. Linked List Cycle II — returns index of cycle entry, -1 if no cycle.
export function detectCycleIndex(arr, pos) {
  if (!arr || arr.length === 0) return -1;
  const head = new ListNode(arr[0]);
  let tail = head;
  const nodes = [head];
  for (let i = 1; i < arr.length; i++) {
    tail.next = new ListNode(arr[i]);
    tail = tail.next;
    nodes.push(tail);
  }
  if (pos >= 0 && pos < nodes.length) tail.next = nodes[pos];
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next; fast = fast.next.next;
    if (slow === fast) {
      let p = head;
      while (p !== slow) { p = p.next; slow = slow.next; }
      return nodes.indexOf(p);
    }
  }
  return -1;
}

// 4. Middle of the Linked List — returns the second middle for even count.
export function middleNode(head) {
  let slow = head, fast = head;
  while (fast && fast.next) { slow = slow.next; fast = fast.next.next; }
  return slow;
}

// 5. Palindrome Linked List
export function isPalindromeList(head) {
  const a = [];
  for (let c = head; c; c = c.next) a.push(c.val);
  for (let i = 0, j = a.length - 1; i < j; i++, j--) if (a[i] !== a[j]) return false;
  return true;
}

// 6. Remove Nth Node From End of List
export function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0, head);
  let fast = dummy, slow = dummy;
  for (let i = 0; i < n; i++) fast = fast.next;
  while (fast.next) { fast = fast.next; slow = slow.next; }
  slow.next = slow.next.next;
  return dummy.next;
}

// 7. Reorder List — in-place; returns head for testing.
export function reorderList(head) {
  if (!head || !head.next) return head;
  let slow = head, fast = head;
  while (fast.next && fast.next.next) { slow = slow.next; fast = fast.next.next; }
  let prev = null, cur = slow.next;
  slow.next = null;
  while (cur) { const nxt = cur.next; cur.next = prev; prev = cur; cur = nxt; }
  let a = head, b = prev;
  while (b) {
    const an = a.next, bn = b.next;
    a.next = b; b.next = an;
    a = an; b = bn;
  }
  return head;
}

// 8. Add Two Numbers
export function addTwoNumbers(l1, l2) {
  const dummy = new ListNode();
  let cur = dummy, carry = 0;
  while (l1 || l2 || carry) {
    const a = l1 ? l1.val : 0;
    const b = l2 ? l2.val : 0;
    const sum = a + b + carry;
    carry = Math.floor(sum / 10);
    cur.next = new ListNode(sum % 10);
    cur = cur.next;
    if (l1) l1 = l1.next;
    if (l2) l2 = l2.next;
  }
  return dummy.next;
}

// 9. Copy List with Random Pointer — input/output: { vals: number[], randoms: (number|null)[] }
export function copyRandomList(input) {
  const { vals, randoms } = input;
  const n = vals.length;
  if (n === 0) return { vals: [], randoms: [] };
  const orig = vals.map((v) => ({ val: v, next: null, random: null }));
  for (let i = 0; i < n - 1; i++) orig[i].next = orig[i + 1];
  for (let i = 0; i < n; i++) orig[i].random = randoms[i] === null ? null : orig[randoms[i]];
  // Interleaved clone
  for (let i = 0; i < n; i++) {
    const c = { val: orig[i].val, next: orig[i].next, random: null };
    orig[i].next = c;
  }
  for (let i = 0; i < n; i++) {
    if (orig[i].random) orig[i].next.random = orig[i].random.next;
  }
  // Detach
  const head = orig[0].next;
  for (let i = 0; i < n; i++) {
    const c = orig[i].next;
    orig[i].next = c.next;
    if (c.next) c.next = c.next.next;
  }
  // Walk copy and emit indices via a Map of clone-node -> index
  const idx = new Map();
  let cur = head, k = 0;
  while (cur) { idx.set(cur, k++); cur = cur.next; }
  const outVals = [], outRand = [];
  cur = head;
  while (cur) {
    outVals.push(cur.val);
    outRand.push(cur.random === null ? null : idx.get(cur.random));
    cur = cur.next;
  }
  return { vals: outVals, randoms: outRand };
}

// 10. Merge K Sorted Lists — input: arrays[][]; output: array.
export function mergeKLists(arrays) {
  const lists = arrays.map((a) => {
    if (!a || a.length === 0) return null;
    const h = new ListNode(a[0]);
    let t = h;
    for (let i = 1; i < a.length; i++) { t.next = new ListNode(a[i]); t = t.next; }
    return h;
  });
  // min-heap of [val, listIdx, node]
  const heap = [];
  const push = (item) => {
    heap.push(item);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p][0] <= heap[i][0]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]]; i = p;
    }
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      while (true) {
        const l = 2 * i + 1, r = 2 * i + 2;
        let m = i;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === i) break;
        [heap[i], heap[m]] = [heap[m], heap[i]]; i = m;
      }
    }
    return top;
  };
  for (let i = 0; i < lists.length; i++) if (lists[i]) push([lists[i].val, i, lists[i]]);
  const out = [];
  while (heap.length) {
    const [, i, node] = pop();
    out.push(node.val);
    if (node.next) push([node.next.val, i, node.next]);
  }
  return out;
}

// 11. Reverse Nodes in K-Group
export function reverseKGroup(head, k) {
  // Count length first
  let n = 0;
  for (let c = head; c; c = c.next) n++;
  const dummy = new ListNode(0, head);
  let groupPrev = dummy;
  while (n >= k) {
    let cur = groupPrev.next, prev = null;
    for (let i = 0; i < k; i++) {
      const nxt = cur.next;
      cur.next = prev;
      prev = cur;
      cur = nxt;
    }
    const tail = groupPrev.next;
    groupPrev.next.next = cur;
    groupPrev.next = prev;
    groupPrev = tail;
    n -= k;
  }
  return dummy.next;
}

// 12. LRU Cache — ops: [["LRUCache", cap], ["put", k, v], ["get", k], ...]
export function lruCacheOps(ops) {
  let cap = 0;
  const map = new Map();
  const get = (k) => {
    if (!map.has(k)) return -1;
    const v = map.get(k);
    map.delete(k);
    map.set(k, v);
    return v;
  };
  const put = (k, v) => {
    if (map.has(k)) map.delete(k);
    else if (map.size >= cap) {
      const oldest = map.keys().next().value;
      map.delete(oldest);
    }
    map.set(k, v);
  };
  const out = [];
  for (const op of ops) {
    const [name, ...args] = op;
    if (name === "LRUCache") { cap = args[0]; map.clear(); out.push(null); }
    else if (name === "put") { put(args[0], args[1]); out.push(null); }
    else if (name === "get") { out.push(get(args[0])); }
  }
  return out;
}

// ===================== Phase 4 reference implementations =====================

// 1. Maximum Depth of Binary Tree
export function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

// 2. Same Tree
export function isSameTree(p, q) {
  if (!p && !q) return true;
  if (!p || !q) return false;
  if (p.val !== q.val) return false;
  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}

// 3. Symmetric Tree
export function isSymmetric(root) {
  const mirror = (a, b) => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    if (a.val !== b.val) return false;
    return mirror(a.left, b.right) && mirror(a.right, b.left);
  };
  return !root || mirror(root.left, root.right);
}

// 4. Diameter of Binary Tree
export function diameterOfBinaryTree(root) {
  let best = 0;
  const depth = (n) => {
    if (!n) return 0;
    const l = depth(n.left), r = depth(n.right);
    if (l + r > best) best = l + r;
    return 1 + Math.max(l, r);
  };
  depth(root);
  return best;
}

// 5. Balanced Binary Tree
export function isBalanced(root) {
  let bal = true;
  const h = (n) => {
    if (!n || !bal) return 0;
    const l = h(n.left), r = h(n.right);
    if (Math.abs(l - r) > 1) bal = false;
    return 1 + Math.max(l, r);
  };
  h(root);
  return bal;
}

// 6. Path Sum
export function hasPathSum(root, target) {
  if (!root) return false;
  if (!root.left && !root.right) return root.val === target;
  return hasPathSum(root.left, target - root.val) || hasPathSum(root.right, target - root.val);
}

// 7. Binary Tree Inorder Traversal
export function inorderTraversal(root) {
  const out = [], st = [];
  let cur = root;
  while (cur || st.length) {
    while (cur) { st.push(cur); cur = cur.left; }
    cur = st.pop();
    out.push(cur.val);
    cur = cur.right;
  }
  return out;
}

// 8. Subtree of Another Tree
export function isSubtree(root, subRoot) {
  if (!subRoot) return true;
  if (!root) return false;
  if (isSameTree(root, subRoot)) return true;
  return isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);
}

// 9. Binary Tree Level Order Traversal
export function levelOrder(root) {
  if (!root) return [];
  const out = [], q = [root];
  while (q.length) {
    const lvl = [], n = q.length;
    for (let i = 0; i < n; i++) {
      const x = q.shift();
      lvl.push(x.val);
      if (x.left) q.push(x.left);
      if (x.right) q.push(x.right);
    }
    out.push(lvl);
  }
  return out;
}

// 10. Binary Tree Right Side View
export function rightSideView(root) {
  if (!root) return [];
  const out = [], q = [root];
  while (q.length) {
    const n = q.length;
    for (let i = 0; i < n; i++) {
      const x = q.shift();
      if (i === n - 1) out.push(x.val);
      if (x.left) q.push(x.left);
      if (x.right) q.push(x.right);
    }
  }
  return out;
}

// 11. Binary Tree Zigzag Level Order Traversal
export function zigzagLevelOrder(root) {
  if (!root) return [];
  const out = [], q = [root];
  let leftToRight = true;
  while (q.length) {
    const n = q.length, lvl = new Array(n);
    for (let i = 0; i < n; i++) {
      const x = q.shift();
      lvl[leftToRight ? i : n - 1 - i] = x.val;
      if (x.left) q.push(x.left);
      if (x.right) q.push(x.right);
    }
    out.push(lvl);
    leftToRight = !leftToRight;
  }
  return out;
}

// 12. Count Good Nodes in Binary Tree
export function goodNodes(root) {
  let count = 0;
  const dfs = (n, mx) => {
    if (!n) return;
    if (n.val >= mx) { count++; mx = n.val; }
    dfs(n.left, mx); dfs(n.right, mx);
  };
  dfs(root, -Infinity);
  return count;
}

// 13. Validate Binary Search Tree
export function isValidBST(root) {
  const go = (n, lo, hi) => {
    if (!n) return true;
    if (n.val <= lo || n.val >= hi) return false;
    return go(n.left, lo, n.val) && go(n.right, n.val, hi);
  };
  return go(root, -Infinity, Infinity);
}

// 14. Kth Smallest Element in a BST
export function kthSmallest(root, k) {
  const st = [];
  let cur = root, count = 0;
  while (cur || st.length) {
    while (cur) { st.push(cur); cur = cur.left; }
    cur = st.pop();
    count++;
    if (count === k) return cur.val;
    cur = cur.right;
  }
  return -1;
}

// 15. Lowest Common Ancestor (BST). Returns LCA value.
export function lowestCommonAncestorBST(root, p, q) {
  let cur = root;
  const lo = Math.min(p, q), hi = Math.max(p, q);
  while (cur) {
    if (cur.val < lo) cur = cur.right;
    else if (cur.val > hi) cur = cur.left;
    else return cur.val;
  }
  return -1;
}

// 16. Lowest Common Ancestor (Binary Tree). Returns LCA value (assumes both p,q present).
export function lowestCommonAncestorBT(root, p, q) {
  const go = (n) => {
    if (!n) return null;
    if (n.val === p || n.val === q) return n;
    const l = go(n.left), r = go(n.right);
    if (l && r) return n;
    return l ?? r;
  };
  const n = go(root);
  return n ? n.val : -1;
}

// 17. Construct Binary Tree from Preorder and Inorder Traversal
export function buildTreeFromPreorderInorder(preorder, inorder) {
  const idx = new Map();
  for (let i = 0; i < inorder.length; i++) idx.set(inorder[i], i);
  let pre = 0;
  const build = (lo, hi) => {
    if (lo > hi) return null;
    const v = preorder[pre++];
    const node = new TreeNode(v);
    const m = idx.get(v);
    node.left = build(lo, m - 1);
    node.right = build(m + 1, hi);
    return node;
  };
  return build(0, inorder.length - 1);
}

// 18. Binary Tree Maximum Path Sum
export function maxPathSum(root) {
  let best = -Infinity;
  const gain = (n) => {
    if (!n) return 0;
    const l = Math.max(0, gain(n.left));
    const r = Math.max(0, gain(n.right));
    if (n.val + l + r > best) best = n.val + l + r;
    return n.val + Math.max(l, r);
  };
  gain(root);
  return best;
}

// 19. Serialize and Deserialize Binary Tree — round-trip; input/output level-order arrays.
export function codecBinaryTreeRoundTrip(arr) {
  // Build tree from input level-order
  const root = adapters.arrayToBinaryTree(arr);
  // Serialize (preorder with nulls)
  const tokens = [];
  const ser = (n) => {
    if (!n) { tokens.push("#"); return; }
    tokens.push(String(n.val));
    ser(n.left); ser(n.right);
  };
  ser(root);
  const data = tokens.join(",");
  // Deserialize
  const parts = data.split(",");
  let i = 0;
  const des = () => {
    if (i >= parts.length) return null;
    const t = parts[i++];
    if (t === "#") return null;
    const n = new TreeNode(Number(t));
    n.left = des();
    n.right = des();
    return n;
  };
  const rebuilt = des();
  return adapters.binaryTreeToLevelOrder(rebuilt);
}

// 20. Convert Sorted Array to BST
export function sortedArrayToBST(nums) {
  const build = (lo, hi) => {
    if (lo > hi) return null;
    const m = (lo + hi) >> 1;
    const n = new TreeNode(nums[m]);
    n.left = build(lo, m - 1);
    n.right = build(m + 1, hi);
    return n;
  };
  return build(0, nums.length - 1);
}

// ===================== Phase 5 reference implementations =====================

// Helper: BFS from a queue (used in several problems below).

// 1. Clone Graph — input/output: { nodes: number[], adj: number[][] } where
// adj[i] is the list of neighbor indices (0-based) for node i.
export function cloneGraphRoundTrip(input) {
  const { nodes, adj } = input;
  const n = nodes.length;
  if (n === 0) return { nodes: [], adj: [] };
  // Build node objects
  const orig = nodes.map((v) => ({ val: v, neighbors: [] }));
  for (let i = 0; i < n; i++) for (const j of adj[i]) orig[i].neighbors.push(orig[j]);
  // Standard BFS clone
  const map = new Map();
  map.set(orig[0], { val: orig[0].val, neighbors: [] });
  const q = [orig[0]];
  while (q.length) {
    const cur = q.shift();
    for (const nb of cur.neighbors) {
      if (!map.has(nb)) {
        map.set(nb, { val: nb.val, neighbors: [] });
        q.push(nb);
      }
      map.get(cur).neighbors.push(map.get(nb));
    }
  }
  // Convert clone back to canonical form using BFS order from the same start
  const cloneOrder = [];
  const idxMap = new Map();
  const q2 = [map.get(orig[0])];
  idxMap.set(map.get(orig[0]), 0);
  cloneOrder.push(map.get(orig[0]));
  while (q2.length) {
    const cur = q2.shift();
    for (const nb of cur.neighbors) {
      if (!idxMap.has(nb)) {
        idxMap.set(nb, cloneOrder.length);
        cloneOrder.push(nb);
        q2.push(nb);
      }
    }
  }
  // BUT we need a canonical form that matches the input exactly. The input
  // numbers nodes in some order; the output should preserve that ordering by
  // value (LC convention: nodes 1..n in order). We'll match by val using the
  // input's index order.
  const valToIdx = new Map();
  for (let i = 0; i < n; i++) valToIdx.set(nodes[i], i);
  const outAdj = Array.from({ length: n }, () => []);
  // Walk the clone using the same val→idx mapping.
  // Use BFS over clones to ensure we visit each.
  const seen = new Set();
  const stack = [map.get(orig[0])];
  seen.add(map.get(orig[0]));
  while (stack.length) {
    const c = stack.pop();
    const ci = valToIdx.get(c.val);
    for (const nb of c.neighbors) {
      const ni = valToIdx.get(nb.val);
      outAdj[ci].push(ni);
      if (!seen.has(nb)) { seen.add(nb); stack.push(nb); }
    }
  }
  for (let i = 0; i < n; i++) outAdj[i].sort((a, b) => a - b);
  return { nodes: nodes.slice(), adj: outAdj };
}

// 2. Pacific Atlantic Water Flow — returns sorted [[r,c],...]
export function pacificAtlantic(heights) {
  if (!heights.length || !heights[0].length) return [];
  const m = heights.length, n = heights[0].length;
  const pac = Array.from({ length: m }, () => new Array(n).fill(false));
  const atl = Array.from({ length: m }, () => new Array(n).fill(false));
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  const bfs = (starts, vis) => {
    const q = starts.slice();
    for (const [r,c] of starts) vis[r][c] = true;
    while (q.length) {
      const [r,c] = q.shift();
      for (const [dr,dc] of dirs) {
        const nr = r+dr, nc = c+dc;
        if (nr<0||nc<0||nr>=m||nc>=n||vis[nr][nc]) continue;
        if (heights[nr][nc] < heights[r][c]) continue;
        vis[nr][nc] = true;
        q.push([nr,nc]);
      }
    }
  };
  const pacStarts = [], atlStarts = [];
  for (let i = 0; i < m; i++) { pacStarts.push([i,0]); atlStarts.push([i,n-1]); }
  for (let j = 0; j < n; j++) { pacStarts.push([0,j]); atlStarts.push([m-1,j]); }
  bfs(pacStarts, pac);
  bfs(atlStarts, atl);
  const out = [];
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (pac[i][j] && atl[i][j]) out.push([i,j]);
  return out;
}

// 3. Course Schedule II
export function findOrder(numCourses, prerequisites) {
  const adj = Array.from({ length: numCourses }, () => []);
  const indeg = new Array(numCourses).fill(0);
  for (const [a,b] of prerequisites) { adj[b].push(a); indeg[a]++; }
  const q = [];
  for (let i = 0; i < numCourses; i++) if (indeg[i] === 0) q.push(i);
  const out = [];
  while (q.length) {
    const x = q.shift();
    out.push(x);
    for (const y of adj[x]) if (--indeg[y] === 0) q.push(y);
  }
  return out.length === numCourses ? out : [];
}

// 4. Number of Connected Components
export function countComponents(n, edges) {
  const par = Array.from({ length: n }, (_, i) => i);
  const find = (x) => { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; };
  let comp = n;
  for (const [a,b] of edges) {
    const ra = find(a), rb = find(b);
    if (ra !== rb) { par[ra] = rb; comp--; }
  }
  return comp;
}

// 5. Graph Valid Tree
export function validTree(n, edges) {
  if (edges.length !== n - 1) return false;
  const par = Array.from({ length: n }, (_, i) => i);
  const find = (x) => { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; };
  for (const [a,b] of edges) {
    const ra = find(a), rb = find(b);
    if (ra === rb) return false;
    par[ra] = rb;
  }
  return true;
}

// 6. Word Ladder
export function ladderLength(beginWord, endWord, wordList) {
  const dict = new Set(wordList);
  if (!dict.has(endWord)) return 0;
  const q = [[beginWord, 1]];
  dict.delete(beginWord);
  while (q.length) {
    const [w, d] = q.shift();
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
}

// 7. Rotting Oranges
export function orangesRotting(grid) {
  const m = grid.length, n = grid[0].length;
  const q = [];
  let fresh = 0;
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) {
    if (grid[i][j] === 2) q.push([i,j,0]);
    else if (grid[i][j] === 1) fresh++;
  }
  let mins = 0;
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  while (q.length) {
    const [r,c,t] = q.shift();
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
}

// 8. Surrounded Regions
export function solveSurrounded(board) {
  if (!board.length) return board;
  const m = board.length, n = board[0].length;
  const dfs = (i, j) => {
    if (i<0||j<0||i>=m||j>=n||board[i][j]!=="O") return;
    board[i][j] = "S";
    dfs(i+1,j); dfs(i-1,j); dfs(i,j+1); dfs(i,j-1);
  };
  for (let i = 0; i < m; i++) { dfs(i,0); dfs(i,n-1); }
  for (let j = 0; j < n; j++) { dfs(0,j); dfs(m-1,j); }
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) {
    if (board[i][j] === "S") board[i][j] = "O";
    else if (board[i][j] === "O") board[i][j] = "X";
  }
  return board;
}

// 9. Walls and Gates
export function wallsAndGates(rooms) {
  if (!rooms.length) return rooms;
  const m = rooms.length, n = rooms[0].length;
  const q = [];
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (rooms[i][j] === 0) q.push([i,j]);
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  while (q.length) {
    const [r,c] = q.shift();
    for (const [dr,dc] of dirs) {
      const nr=r+dr, nc=c+dc;
      if (nr<0||nc<0||nr>=m||nc>=n) continue;
      if (rooms[nr][nc] !== 2147483647) continue;
      rooms[nr][nc] = rooms[r][c] + 1;
      q.push([nr,nc]);
    }
  }
  return rooms;
}

// 10. Max Area of Island
export function maxAreaOfIsland(grid) {
  const m = grid.length, n = grid[0].length;
  let best = 0;
  const dfs = (i,j) => {
    if (i<0||j<0||i>=m||j>=n||grid[i][j]!==1) return 0;
    grid[i][j] = 0;
    return 1 + dfs(i+1,j) + dfs(i-1,j) + dfs(i,j+1) + dfs(i,j-1);
  };
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (grid[i][j] === 1) {
    const a = dfs(i,j);
    if (a > best) best = a;
  }
  return best;
}

// 11. Redundant Connection
export function findRedundantConnection(edges) {
  const n = edges.length;
  const par = Array.from({ length: n + 1 }, (_, i) => i);
  const find = (x) => { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; };
  for (const [a,b] of edges) {
    const ra = find(a), rb = find(b);
    if (ra === rb) return [a,b];
    par[ra] = rb;
  }
  return [];
}

// 12. Network Delay Time — Dijkstra
export function networkDelayTime(times, n, k) {
  const adj = Array.from({ length: n + 1 }, () => []);
  for (const [u,v,w] of times) adj[u].push([v,w]);
  const dist = new Array(n + 1).fill(Infinity);
  dist[k] = 0;
  // simple binary min-heap
  const heap = [[0, k]];
  const push = (it) => {
    heap.push(it); let i = heap.length - 1;
    while (i > 0) { const p = (i-1)>>1; if (heap[p][0] <= heap[i][0]) break; [heap[p],heap[i]] = [heap[i],heap[p]]; i = p; }
  };
  const pop = () => {
    const t = heap[0]; const last = heap.pop();
    if (heap.length) {
      heap[0] = last; let i = 0;
      while (true) {
        const l = 2*i+1, r = 2*i+2; let m = i;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === i) break;
        [heap[i],heap[m]] = [heap[m],heap[i]]; i = m;
      }
    }
    return t;
  };
  while (heap.length) {
    const [d, u] = pop();
    if (d > dist[u]) continue;
    for (const [v,w] of adj[u]) {
      if (d + w < dist[v]) { dist[v] = d + w; push([dist[v], v]); }
    }
  }
  let mx = 0;
  for (let i = 1; i <= n; i++) {
    if (dist[i] === Infinity) return -1;
    if (dist[i] > mx) mx = dist[i];
  }
  return mx;
}

// 13. Cheapest Flights Within K Stops — Bellman-Ford (k+1 relaxation rounds)
export function findCheapestPrice(n, flights, src, dst, k) {
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
}

// 14. Reconstruct Itinerary — Hierholzer
export function findItinerary(tickets) {
  const adj = new Map();
  for (const [a,b] of tickets) {
    if (!adj.has(a)) adj.set(a, []);
    adj.get(a).push(b);
  }
  for (const [, arr] of adj) arr.sort();
  const out = [];
  const dfs = (u) => {
    const arr = adj.get(u);
    while (arr && arr.length) dfs(arr.shift());
    out.push(u);
  };
  dfs("JFK");
  return out.reverse();
}

// 15. Alien Dictionary — deterministic Kahn's (alphabetical tiebreak)
export function alienOrder(words) {
  const adj = new Map();
  const indeg = new Map();
  for (const w of words) for (const c of w) {
    if (!adj.has(c)) { adj.set(c, new Set()); indeg.set(c, 0); }
  }
  for (let i = 0; i + 1 < words.length; i++) {
    const a = words[i], b = words[i+1];
    let found = false;
    const lim = Math.min(a.length, b.length);
    for (let j = 0; j < lim; j++) {
      if (a[j] !== b[j]) {
        if (!adj.get(a[j]).has(b[j])) {
          adj.get(a[j]).add(b[j]);
          indeg.set(b[j], indeg.get(b[j]) + 1);
        }
        found = true;
        break;
      }
    }
    if (!found && a.length > b.length) return "";
  }
  // Use sorted available list to make output deterministic
  const ready = [];
  for (const [c, d] of indeg) if (d === 0) ready.push(c);
  ready.sort();
  let out = "";
  while (ready.length) {
    const c = ready.shift();
    out += c;
    const neighbors = [...adj.get(c)].sort();
    for (const nb of neighbors) {
      indeg.set(nb, indeg.get(nb) - 1);
      if (indeg.get(nb) === 0) {
        // insert sorted
        let lo = 0, hi = ready.length;
        while (lo < hi) { const m = (lo+hi)>>1; if (ready[m] < nb) lo = m+1; else hi = m; }
        ready.splice(lo, 0, nb);
      }
    }
  }
  return out.length === indeg.size ? out : "";
}

// ===================== Phase 6 reference implementations =====================

// Internal: min/max binary heap helpers (work on arrays of [key, ...rest]).
function heapPush(h, item, less) {
  h.push(item);
  let i = h.length - 1;
  while (i > 0) {
    const p = (i - 1) >> 1;
    if (less(h[i], h[p])) { [h[i], h[p]] = [h[p], h[i]]; i = p; }
    else break;
  }
}
function heapPop(h, less) {
  const top = h[0];
  const last = h.pop();
  if (h.length) {
    h[0] = last;
    let i = 0;
    while (true) {
      const l = 2*i+1, r = 2*i+2;
      let m = i;
      if (l < h.length && less(h[l], h[m])) m = l;
      if (r < h.length && less(h[r], h[m])) m = r;
      if (m === i) break;
      [h[i], h[m]] = [h[m], h[i]]; i = m;
    }
  }
  return top;
}

// 1. Kth Largest Element in an Array
export function findKthLargest(nums, k) {
  const h = []; // min-heap of size k
  const less = (a, b) => a < b;
  for (const x of nums) {
    if (h.length < k) heapPush(h, x, less);
    else if (x > h[0]) { heapPop(h, less); heapPush(h, x, less); }
  }
  return h[0];
}

// 2. Kth Largest Element in a Stream — ops protocol.
// ops: [["KthLargest", k, nums], ["add", val], ["add", val], ...] → [null, x, y, ...]
export function kthLargestStreamOps(ops) {
  let k = 0;
  let h = [];
  const less = (a, b) => a < b;
  const out = [];
  for (const op of ops) {
    const [name, ...args] = op;
    if (name === "KthLargest") {
      k = args[0];
      h = [];
      for (const x of args[1]) {
        if (h.length < k) heapPush(h, x, less);
        else if (x > h[0]) { heapPop(h, less); heapPush(h, x, less); }
      }
      out.push(null);
    } else if (name === "add") {
      const v = args[0];
      if (h.length < k) heapPush(h, v, less);
      else if (v > h[0]) { heapPop(h, less); heapPush(h, v, less); }
      out.push(h[0]);
    }
  }
  return out;
}

// 3. K Closest Points to Origin
export function kClosest(points, k) {
  const less = (a, b) => a[0] > b[0]; // max-heap on distance
  const h = [];
  for (const [x, y] of points) {
    const d = x*x + y*y;
    if (h.length < k) heapPush(h, [d, x, y], less);
    else if (d < h[0][0]) { heapPop(h, less); heapPush(h, [d, x, y], less); }
  }
  return h.map(([, x, y]) => [x, y]);
}

// 4. Last Stone Weight
export function lastStoneWeight(stones) {
  const less = (a, b) => a > b; // max-heap
  const h = [];
  for (const s of stones) heapPush(h, s, less);
  while (h.length > 1) {
    const y = heapPop(h, less);
    const x = heapPop(h, less);
    if (y !== x) heapPush(h, y - x, less);
  }
  return h.length ? h[0] : 0;
}

// 5. Task Scheduler
export function leastInterval(tasks, n) {
  const cnt = new Map();
  for (const t of tasks) cnt.set(t, (cnt.get(t) || 0) + 1);
  let maxCnt = 0, maxFreqCount = 0;
  for (const v of cnt.values()) {
    if (v > maxCnt) { maxCnt = v; maxFreqCount = 1; }
    else if (v === maxCnt) maxFreqCount++;
  }
  const slots = (maxCnt - 1) * (n + 1) + maxFreqCount;
  return Math.max(slots, tasks.length);
}

// 6. Find Median from Data Stream — ops: [["MedianFinder"], ["addNum", n], ["findMedian"], ...]
export function medianFinderOps(ops) {
  let lo = []; // max-heap
  let hi = []; // min-heap
  const lessMax = (a, b) => a > b;
  const lessMin = (a, b) => a < b;
  const out = [];
  for (const op of ops) {
    const [name, ...args] = op;
    if (name === "MedianFinder") {
      lo = []; hi = [];
      out.push(null);
    } else if (name === "addNum") {
      const num = args[0];
      heapPush(lo, num, lessMax);
      heapPush(hi, heapPop(lo, lessMax), lessMin);
      if (hi.length > lo.length) heapPush(lo, heapPop(hi, lessMin), lessMax);
      out.push(null);
    } else if (name === "findMedian") {
      out.push(lo.length > hi.length ? lo[0] : (lo[0] + hi[0]) / 2);
    }
  }
  return out;
}

// 7. Implement Trie — ops: [["Trie"], ["insert", w], ["search", w], ["startsWith", p]]
export function trieOps(ops) {
  let root = { children: {}, end: false };
  const out = [];
  for (const op of ops) {
    const [name, ...args] = op;
    if (name === "Trie") { root = { children: {}, end: false }; out.push(null); }
    else if (name === "insert") {
      let cur = root;
      for (const c of args[0]) {
        if (!cur.children[c]) cur.children[c] = { children: {}, end: false };
        cur = cur.children[c];
      }
      cur.end = true;
      out.push(null);
    } else if (name === "search" || name === "startsWith") {
      let cur = root;
      let ok = true;
      for (const c of args[0]) {
        if (!cur.children[c]) { ok = false; break; }
        cur = cur.children[c];
      }
      out.push(ok && (name === "startsWith" ? true : cur.end));
    }
  }
  return out;
}

// 8. Add and Search Word — supports '.' wildcard.
// ops: [["WordDictionary"], ["addWord", w], ["search", w]]
export function wordDictionaryOps(ops) {
  let root = { children: {}, end: false };
  const out = [];
  const search = (w, idx, node) => {
    if (idx === w.length) return node.end;
    const c = w[idx];
    if (c === ".") {
      for (const k of Object.keys(node.children)) {
        if (search(w, idx + 1, node.children[k])) return true;
      }
      return false;
    } else {
      if (!node.children[c]) return false;
      return search(w, idx + 1, node.children[c]);
    }
  };
  for (const op of ops) {
    const [name, ...args] = op;
    if (name === "WordDictionary") { root = { children: {}, end: false }; out.push(null); }
    else if (name === "addWord") {
      let cur = root;
      for (const c of args[0]) {
        if (!cur.children[c]) cur.children[c] = { children: {}, end: false };
        cur = cur.children[c];
      }
      cur.end = true;
      out.push(null);
    } else if (name === "search") {
      out.push(search(args[0], 0, root));
    }
  }
  return out;
}

// 9. Word Search II
export function findWords(board, words) {
  const root = { children: {}, word: null };
  for (const w of words) {
    let cur = root;
    for (const c of w) {
      if (!cur.children[c]) cur.children[c] = { children: {}, word: null };
      cur = cur.children[c];
    }
    cur.word = w;
  }
  const m = board.length, n = board[0].length;
  const out = [];
  const dfs = (i, j, node) => {
    if (i < 0 || j < 0 || i >= m || j >= n) return;
    const c = board[i][j];
    if (c === "#" || !node.children[c]) return;
    const next = node.children[c];
    if (next.word) {
      out.push(next.word);
      next.word = null;
    }
    board[i][j] = "#";
    dfs(i+1, j, next); dfs(i-1, j, next); dfs(i, j+1, next); dfs(i, j-1, next);
    board[i][j] = c;
    if (Object.keys(next.children).length === 0) delete node.children[c];
  };
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) dfs(i, j, root);
  return out;
}

// 10. Reorganize String — deterministic output: heap with alphabetical tiebreak.
export function reorganizeString(s) {
  const cnt = new Map();
  for (const c of s) cnt.set(c, (cnt.get(c) || 0) + 1);
  const less = (a, b) => a[0] > b[0] || (a[0] === b[0] && a[1] < b[1]); // max-heap by count, then alpha
  const h = [];
  for (const [c, v] of cnt) heapPush(h, [v, c], less);
  if (h[0] && h[0][0] > Math.ceil(s.length / 2)) return "";
  let out = "";
  while (h.length >= 2) {
    const [c1, ch1] = heapPop(h, less);
    const [c2, ch2] = heapPop(h, less);
    out += ch1 + ch2;
    if (c1 - 1 > 0) heapPush(h, [c1 - 1, ch1], less);
    if (c2 - 1 > 0) heapPush(h, [c2 - 1, ch2], less);
  }
  if (h.length) out += h[0][1];
  return out;
}

// ===================== Phase 7 reference implementations (DP) =====================

// 1. Climbing Stairs
export function climbStairs(n) {
  if (n <= 2) return n;
  let a = 1, b = 2;
  for (let i = 3; i <= n; i++) { const c = a + b; a = b; b = c; }
  return b;
}

// 2. House Robber
export function rob(nums) {
  let prev = 0, cur = 0;
  for (const x of nums) { const nxt = Math.max(cur, prev + x); prev = cur; cur = nxt; }
  return cur;
}

// 3. House Robber II
export function robII(nums) {
  if (nums.length === 1) return nums[0];
  const lin = (arr) => {
    let p = 0, c = 0;
    for (const x of arr) { const n = Math.max(c, p + x); p = c; c = n; }
    return c;
  };
  return Math.max(lin(nums.slice(0, -1)), lin(nums.slice(1)));
}

// 4. Longest Palindromic Substring — already defined in Phase 2 (longestPalindrome).
// 5. Palindromic Substrings — already defined in Phase 2 (countSubstrings).

// 6. Decode Ways
export function numDecodings(s) {
  if (!s || s[0] === "0") return 0;
  let p2 = 1, p1 = 1;
  for (let i = 1; i < s.length; i++) {
    let cur = 0;
    if (s[i] !== "0") cur += p1;
    const two = parseInt(s.slice(i - 1, i + 1), 10);
    if (two >= 10 && two <= 26) cur += p2;
    p2 = p1; p1 = cur;
  }
  return p1;
}

// 7. Maximum Product Subarray
export function maxProduct(nums) {
  let maxP = nums[0], minP = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    const x = nums[i];
    const candidates = [x, x * maxP, x * minP];
    maxP = Math.max(...candidates);
    minP = Math.min(...candidates);
    best = Math.max(best, maxP);
  }
  return best;
}

// 8. Longest Increasing Subsequence — patience O(n log n)
export function lengthOfLIS(nums) {
  const tails = [];
  for (const x of nums) {
    let lo = 0, hi = tails.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (tails[m] < x) lo = m + 1; else hi = m; }
    tails[lo] = x;
  }
  return tails.length;
}

// 9. Partition Equal Subset Sum
export function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2) return false;
  const target = total / 2;
  const dp = new Uint8Array(target + 1);
  dp[0] = 1;
  for (const x of nums) {
    for (let s = target; s >= x; s--) if (dp[s - x]) dp[s] = 1;
  }
  return !!dp[target];
}

// 10. Unique Paths
export function uniquePaths(m, n) {
  const dp = new Array(n).fill(1);
  for (let i = 1; i < m; i++) for (let j = 1; j < n; j++) dp[j] += dp[j - 1];
  return dp[n - 1];
}

// 11. Unique Paths II
export function uniquePathsWithObstacles(grid) {
  const m = grid.length, n = grid[0].length;
  const dp = new Array(n).fill(0);
  dp[0] = grid[0][0] === 0 ? 1 : 0;
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (grid[i][j] === 1) dp[j] = 0;
      else if (j > 0) dp[j] += dp[j - 1];
    }
  }
  return dp[n - 1];
}

// 12. Minimum Path Sum
export function minPathSum(grid) {
  const m = grid.length, n = grid[0].length;
  const dp = grid[0].slice();
  for (let j = 1; j < n; j++) dp[j] += dp[j - 1];
  for (let i = 1; i < m; i++) {
    dp[0] += grid[i][0];
    for (let j = 1; j < n; j++) dp[j] = Math.min(dp[j], dp[j - 1]) + grid[i][j];
  }
  return dp[n - 1];
}

// 13. Jump Game
export function canJump(nums) {
  let reach = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > reach) return false;
    reach = Math.max(reach, i + nums[i]);
  }
  return true;
}

// 14. Jump Game II
export function jumpII(nums) {
  let jumps = 0, curEnd = 0, farthest = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);
    if (i === curEnd) { jumps++; curEnd = farthest; }
  }
  return jumps;
}

// 15. Coin Change II — number of combinations
export function changeII(amount, coins) {
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1;
  for (const c of coins) for (let s = c; s <= amount; s++) dp[s] += dp[s - c];
  return dp[amount];
}

// 16. Combination Sum IV — number of permutations
export function combinationSum4(nums, target) {
  const dp = new Array(target + 1).fill(0);
  dp[0] = 1;
  for (let s = 1; s <= target; s++) for (const x of nums) if (s >= x) dp[s] += dp[s - x];
  return dp[target];
}

// 17. Target Sum
export function findTargetSumWays(nums, target) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (Math.abs(target) > total || (total + target) % 2) return 0;
  const subset = (total + target) / 2;
  if (subset < 0) return 0;
  const dp = new Array(subset + 1).fill(0);
  dp[0] = 1;
  for (const x of nums) for (let s = subset; s >= x; s--) dp[s] += dp[s - x];
  return dp[subset];
}

// 18. Longest Common Subsequence
export function longestCommonSubsequence(a, b) {
  const m = a.length, n = b.length;
  const dp = new Array(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    let prev = 0;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      if (a[i - 1] === b[j - 1]) dp[j] = prev + 1;
      else dp[j] = Math.max(dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[n];
}

// 19. Best Time to Buy and Sell Stock with Cooldown
export function maxProfitCooldown(prices) {
  let hold = -Infinity, sold = 0, rest = 0;
  for (const p of prices) {
    const prevSold = sold;
    sold = hold + p;
    hold = Math.max(hold, rest - p);
    rest = Math.max(rest, prevSold);
  }
  return Math.max(sold, rest);
}

// 20. Best Time to Buy and Sell Stock IV
export function maxProfitIV(k, prices) {
  const n = prices.length;
  if (n === 0 || k === 0) return 0;
  if (k >= n / 2) {
    let p = 0;
    for (let i = 1; i < n; i++) if (prices[i] > prices[i - 1]) p += prices[i] - prices[i - 1];
    return p;
  }
  const buy = new Array(k + 1).fill(-Infinity);
  const sell = new Array(k + 1).fill(0);
  for (const p of prices) {
    for (let j = 1; j <= k; j++) {
      buy[j] = Math.max(buy[j], sell[j - 1] - p);
      sell[j] = Math.max(sell[j], buy[j] + p);
    }
  }
  return sell[k];
}

// 21. Edit Distance
export function minDistance(a, b) {
  const m = a.length, n = b.length;
  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      if (a[i - 1] === b[j - 1]) dp[j] = prev;
      else dp[j] = 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[n];
}

// 22. Burst Balloons
export function maxCoins(nums) {
  const arr = [1, ...nums, 1];
  const n = arr.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let len = 2; len < n; len++) {
    for (let l = 0; l + len < n; l++) {
      const r = l + len;
      let best = 0;
      for (let k = l + 1; k < r; k++) {
        const v = dp[l][k] + dp[k][r] + arr[l] * arr[k] * arr[r];
        if (v > best) best = v;
      }
      dp[l][r] = best;
    }
  }
  return dp[0][n - 1];
}

// 23. Regular Expression Matching
export function isMatchRegex(s, p) {
  const m = s.length, n = p.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false));
  dp[0][0] = true;
  for (let j = 2; j <= n; j++) if (p[j - 1] === "*") dp[0][j] = dp[0][j - 2];
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (p[j - 1] === "*") {
        dp[i][j] = dp[i][j - 2] || ((p[j - 2] === "." || p[j - 2] === s[i - 1]) && dp[i - 1][j]);
      } else {
        dp[i][j] = (p[j - 1] === "." || p[j - 1] === s[i - 1]) && dp[i - 1][j - 1];
      }
    }
  }
  return dp[m][n];
}

// 24. Interleaving String
export function isInterleave(s1, s2, s3) {
  if (s1.length + s2.length !== s3.length) return false;
  const m = s1.length, n = s2.length;
  const dp = new Array(n + 1).fill(false);
  dp[0] = true;
  for (let j = 1; j <= n; j++) dp[j] = dp[j - 1] && s2[j - 1] === s3[j - 1];
  for (let i = 1; i <= m; i++) {
    dp[0] = dp[0] && s1[i - 1] === s3[i - 1];
    for (let j = 1; j <= n; j++) {
      dp[j] = (dp[j] && s1[i - 1] === s3[i + j - 1]) || (dp[j - 1] && s2[j - 1] === s3[i + j - 1]);
    }
  }
  return dp[n];
}

// 25. Longest Increasing Path in a Matrix
export function longestIncreasingPath(matrix) {
  const m = matrix.length, n = matrix[0].length;
  const memo = Array.from({ length: m }, () => new Array(n).fill(0));
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  const dfs = (i, j) => {
    if (memo[i][j]) return memo[i][j];
    let best = 1;
    for (const [di, dj] of dirs) {
      const ni = i + di, nj = j + dj;
      if (ni >= 0 && nj >= 0 && ni < m && nj < n && matrix[ni][nj] > matrix[i][j]) {
        best = Math.max(best, 1 + dfs(ni, nj));
      }
    }
    memo[i][j] = best;
    return best;
  };
  let ans = 0;
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) ans = Math.max(ans, dfs(i, j));
  return ans;
}

// ===================== Phase 8 reference implementations (Backtracking) =====================

// 1. Subsets
export function subsets(nums) {
  const out = [];
  const cur = [];
  const dfs = (i) => {
    if (i === nums.length) { out.push(cur.slice()); return; }
    cur.push(nums[i]); dfs(i + 1); cur.pop();
    dfs(i + 1);
  };
  dfs(0);
  return out;
}

// 2. Subsets II (with duplicates)
export function subsetsWithDup(nums) {
  nums = nums.slice().sort((a, b) => a - b);
  const out = [];
  const cur = [];
  const dfs = (i) => {
    out.push(cur.slice());
    for (let j = i; j < nums.length; j++) {
      if (j > i && nums[j] === nums[j - 1]) continue;
      cur.push(nums[j]);
      dfs(j + 1);
      cur.pop();
    }
  };
  dfs(0);
  return out;
}

// 3. Permutations
export function permute(nums) {
  const out = [];
  const cur = [];
  const used = new Array(nums.length).fill(false);
  const dfs = () => {
    if (cur.length === nums.length) { out.push(cur.slice()); return; }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true; cur.push(nums[i]);
      dfs();
      cur.pop(); used[i] = false;
    }
  };
  dfs();
  return out;
}

// 4. Permutations II (with duplicates)
export function permuteUnique(nums) {
  nums = nums.slice().sort((a, b) => a - b);
  const out = [];
  const cur = [];
  const used = new Array(nums.length).fill(false);
  const dfs = () => {
    if (cur.length === nums.length) { out.push(cur.slice()); return; }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) continue;
      used[i] = true; cur.push(nums[i]);
      dfs();
      cur.pop(); used[i] = false;
    }
  };
  dfs();
  return out;
}

// 5. Combination Sum (unbounded reuse)
export function combinationSum(candidates, target) {
  const arr = candidates.slice().sort((a, b) => a - b);
  const out = [];
  const cur = [];
  const dfs = (start, rem) => {
    if (rem === 0) { out.push(cur.slice()); return; }
    for (let i = start; i < arr.length; i++) {
      if (arr[i] > rem) break;
      cur.push(arr[i]);
      dfs(i, rem - arr[i]);
      cur.pop();
    }
  };
  dfs(0, target);
  return out;
}

// 6. Combination Sum II (each used once, dedup)
export function combinationSum2(candidates, target) {
  const arr = candidates.slice().sort((a, b) => a - b);
  const out = [];
  const cur = [];
  const dfs = (start, rem) => {
    if (rem === 0) { out.push(cur.slice()); return; }
    for (let i = start; i < arr.length; i++) {
      if (arr[i] > rem) break;
      if (i > start && arr[i] === arr[i - 1]) continue;
      cur.push(arr[i]);
      dfs(i + 1, rem - arr[i]);
      cur.pop();
    }
  };
  dfs(0, target);
  return out;
}

// 7. Word Search
export function exist(board, word) {
  const m = board.length, n = board[0].length;
  const dfs = (i, j, k) => {
    if (k === word.length) return true;
    if (i < 0 || j < 0 || i >= m || j >= n || board[i][j] !== word[k]) return false;
    const c = board[i][j];
    board[i][j] = "#";
    const ok = dfs(i+1,j,k+1) || dfs(i-1,j,k+1) || dfs(i,j+1,k+1) || dfs(i,j-1,k+1);
    board[i][j] = c;
    return ok;
  };
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (board[i][j] === word[0] && dfs(i, j, 0)) return true;
  return false;
}

// 8. Palindrome Partitioning
export function partitionPalindrome(s) {
  const out = [];
  const cur = [];
  const isPal = (l, r) => { while (l < r) { if (s[l] !== s[r]) return false; l++; r--; } return true; };
  const dfs = (start) => {
    if (start === s.length) { out.push(cur.slice()); return; }
    for (let end = start; end < s.length; end++) {
      if (isPal(start, end)) {
        cur.push(s.slice(start, end + 1));
        dfs(end + 1);
        cur.pop();
      }
    }
  };
  dfs(0);
  return out;
}

// 9. N-Queens
export function solveNQueens(n) {
  const out = [];
  const cols = new Array(n).fill(false);
  const d1 = new Array(2 * n).fill(false); // i - j + n
  const d2 = new Array(2 * n).fill(false); // i + j
  const placement = new Array(n).fill(-1);
  const dfs = (row) => {
    if (row === n) {
      const board = [];
      for (let i = 0; i < n; i++) {
        const r = ".".repeat(placement[i]) + "Q" + ".".repeat(n - placement[i] - 1);
        board.push(r);
      }
      out.push(board);
      return;
    }
    for (let c = 0; c < n; c++) {
      if (cols[c] || d1[row - c + n] || d2[row + c]) continue;
      cols[c] = d1[row - c + n] = d2[row + c] = true;
      placement[row] = c;
      dfs(row + 1);
      cols[c] = d1[row - c + n] = d2[row + c] = false;
    }
  };
  dfs(0);
  return out;
}

// 10. Letter Combinations of a Phone Number
export function letterCombinations(digits) {
  if (!digits) return [];
  const map = { "2": "abc", "3": "def", "4": "ghi", "5": "jkl", "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz" };
  const out = [];
  const cur = [];
  const dfs = (i) => {
    if (i === digits.length) { out.push(cur.join("")); return; }
    for (const c of map[digits[i]]) { cur.push(c); dfs(i + 1); cur.pop(); }
  };
  dfs(0);
  return out;
}

// ===================== Phase 9 reference implementations (Intervals + Greedy) =====================

// 1. Insert Interval
export function insertInterval(intervals, newInterval) {
  const out = [];
  let [s, e] = newInterval;
  let i = 0;
  while (i < intervals.length && intervals[i][1] < s) out.push(intervals[i++]);
  while (i < intervals.length && intervals[i][0] <= e) {
    s = Math.min(s, intervals[i][0]);
    e = Math.max(e, intervals[i][1]);
    i++;
  }
  out.push([s, e]);
  while (i < intervals.length) out.push(intervals[i++]);
  return out;
}

// 2. Merge Intervals
export function mergeIntervals(intervals) {
  if (intervals.length === 0) return [];
  const arr = intervals.slice().sort((a, b) => a[0] - b[0]);
  const out = [arr[0].slice()];
  for (let i = 1; i < arr.length; i++) {
    const last = out[out.length - 1];
    if (arr[i][0] <= last[1]) last[1] = Math.max(last[1], arr[i][1]);
    else out.push(arr[i].slice());
  }
  return out;
}

// 3. Non-overlapping Intervals
export function eraseOverlapIntervals(intervals) {
  if (intervals.length === 0) return 0;
  const arr = intervals.slice().sort((a, b) => a[1] - b[1]);
  let end = arr[0][1], removed = 0;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i][0] < end) removed++;
    else end = arr[i][1];
  }
  return removed;
}

// 4. Meeting Rooms
export function canAttendMeetings(intervals) {
  const arr = intervals.slice().sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < arr.length; i++) if (arr[i][0] < arr[i - 1][1]) return false;
  return true;
}

// 5. Meeting Rooms II
export function minMeetingRooms(intervals) {
  if (intervals.length === 0) return 0;
  const starts = intervals.map((x) => x[0]).sort((a, b) => a - b);
  const ends = intervals.map((x) => x[1]).sort((a, b) => a - b);
  let rooms = 0, peak = 0, j = 0;
  for (let i = 0; i < starts.length; i++) {
    while (j < ends.length && ends[j] <= starts[i]) { rooms--; j++; }
    rooms++;
    if (rooms > peak) peak = rooms;
  }
  return peak;
}

// 6. Minimum Number of Arrows to Burst Balloons
export function findMinArrowShots(points) {
  if (points.length === 0) return 0;
  const arr = points.slice().sort((a, b) => a[1] - b[1]);
  let arrows = 1, end = arr[0][1];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i][0] > end) { arrows++; end = arr[i][1]; }
  }
  return arrows;
}

// 7. Best Time to Buy and Sell Stock II
export function maxProfitII(prices) {
  let p = 0;
  for (let i = 1; i < prices.length; i++) if (prices[i] > prices[i - 1]) p += prices[i] - prices[i - 1];
  return p;
}

// 8. Gas Station
export function canCompleteCircuit(gas, cost) {
  let total = 0, tank = 0, start = 0;
  for (let i = 0; i < gas.length; i++) {
    const d = gas[i] - cost[i];
    total += d;
    tank += d;
    if (tank < 0) { start = i + 1; tank = 0; }
  }
  return total < 0 ? -1 : start;
}

// 9. Hand of Straights
export function isNStraightHand(hand, groupSize) {
  if (hand.length % groupSize !== 0) return false;
  const cnt = new Map();
  for (const x of hand) cnt.set(x, (cnt.get(x) || 0) + 1);
  const keys = [...cnt.keys()].sort((a, b) => a - b);
  for (const k of keys) {
    const c = cnt.get(k);
    if (c > 0) {
      for (let i = 0; i < groupSize; i++) {
        const v = (cnt.get(k + i) || 0) - c;
        if (v < 0) return false;
        cnt.set(k + i, v);
      }
    }
  }
  return true;
}

// 10. Merge Triplets to Form Target Triplet
export function mergeTriplets(triplets, target) {
  let a = false, b = false, c = false;
  for (const [x, y, z] of triplets) {
    if (x > target[0] || y > target[1] || z > target[2]) continue;
    if (x === target[0]) a = true;
    if (y === target[1]) b = true;
    if (z === target[2]) c = true;
  }
  return a && b && c;
}

// 11. Partition Labels
export function partitionLabels(s) {
  const last = new Map();
  for (let i = 0; i < s.length; i++) last.set(s[i], i);
  const out = [];
  let start = 0, end = 0;
  for (let i = 0; i < s.length; i++) {
    end = Math.max(end, last.get(s[i]));
    if (i === end) { out.push(end - start + 1); start = i + 1; }
  }
  return out;
}

// 12. Valid Parenthesis String
export function checkValidString(s) {
  let lo = 0, hi = 0;
  for (const c of s) {
    if (c === "(") { lo++; hi++; }
    else if (c === ")") { lo--; hi--; }
    else { lo--; hi++; }
    if (hi < 0) return false;
    if (lo < 0) lo = 0;
  }
  return lo === 0;
}

// 13. Candy
export function candy(ratings) {
  const n = ratings.length;
  const c = new Array(n).fill(1);
  for (let i = 1; i < n; i++) if (ratings[i] > ratings[i - 1]) c[i] = c[i - 1] + 1;
  for (let i = n - 2; i >= 0; i--) if (ratings[i] > ratings[i + 1]) c[i] = Math.max(c[i], c[i + 1] + 1);
  return c.reduce((a, b) => a + b, 0);
}

// 14. Boats to Save People
export function numRescueBoats(people, limit) {
  const arr = people.slice().sort((a, b) => a - b);
  let lo = 0, hi = arr.length - 1, boats = 0;
  while (lo <= hi) {
    if (arr[lo] + arr[hi] <= limit) lo++;
    hi--;
    boats++;
  }
  return boats;
}

// 15. Minimum Interval to Include Each Query
export function minInterval(intervals, queries) {
  const sorted = intervals.slice().sort((a, b) => a[0] - b[0]);
  const order = queries.map((q, i) => [q, i]).sort((a, b) => a[0] - b[0]);
  // Min-heap of [size, end]
  const h = [];
  const less = (a, b) => a[0] < b[0];
  const up = (i) => { while (i > 0) { const p = (i-1)>>1; if (less(h[i],h[p])) { [h[i],h[p]]=[h[p],h[i]]; i=p; } else break; } };
  const down = (i) => { for(;;) { const l=2*i+1,r=2*i+2; let m=i; if (l<h.length&&less(h[l],h[m])) m=l; if (r<h.length&&less(h[r],h[m])) m=r; if (m===i) break; [h[i],h[m]]=[h[m],h[i]]; i=m; } };
  const out = new Array(queries.length).fill(-1);
  let p = 0;
  for (const [q, idx] of order) {
    while (p < sorted.length && sorted[p][0] <= q) {
      const [a, b] = sorted[p++];
      h.push([b - a + 1, b]); up(h.length - 1);
    }
    while (h.length && h[0][1] < q) {
      const last = h.pop();
      if (h.length) { h[0] = last; down(0); }
    }
    out[idx] = h.length ? h[0][0] : -1;
  }
  return out;
}
// ===================== Phase 10 reference implementations (Bit / Math / Design / Classics) =====================

// --- Bit Manipulation ---
export function singleNumber(nums) {
  let x = 0;
  for (const n of nums) x ^= n;
  return x;
}

export function singleNumberII(nums) {
  let ones = 0, twos = 0;
  for (const n of nums) {
    ones = (ones ^ n) & ~twos;
    twos = (twos ^ n) & ~ones;
  }
  return ones;
}

export function hammingWeight(n) {
  let c = 0, x = n >>> 0;
  while (x) { x &= x - 1; c++; }
  return c;
}

export function countBits(n) {
  const out = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) out[i] = out[i >> 1] + (i & 1);
  return out;
}

export function reverseBits(n) {
  let r = 0, x = n >>> 0;
  for (let i = 0; i < 32; i++) {
    r = (r * 2) + (x & 1);
    x >>>= 1;
  }
  return r;
}

export function missingNumber(nums) {
  const n = nums.length;
  let s = (n * (n + 1)) / 2;
  for (const v of nums) s -= v;
  return s;
}

export function getSum(a, b) {
  while (b !== 0) {
    const c = (a & b) << 1;
    a = (a ^ b) | 0;
    b = c | 0;
  }
  return a;
}

export function rangeBitwiseAnd(left, right) {
  let s = 0;
  while (left !== right) { left >>>= 1; right >>>= 1; s++; }
  return left << s;
}

export function hammingDistance(x, y) {
  let v = (x ^ y) >>> 0, c = 0;
  while (v) { v &= v - 1; c++; }
  return c;
}

export function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}

// --- Math ---
export function isHappy(n) {
  const seen = new Set();
  while (n !== 1 && !seen.has(n)) {
    seen.add(n);
    let s = 0;
    while (n > 0) { const d = n % 10; s += d * d; n = (n - d) / 10; }
    n = s;
  }
  return n === 1;
}

export function plusOne(digits) {
  const out = digits.slice();
  for (let i = out.length - 1; i >= 0; i--) {
    if (out[i] < 9) { out[i]++; return out; }
    out[i] = 0;
  }
  out.unshift(1);
  return out;
}

export function myPow(x, n) {
  if (n === 0) return 1;
  let N = n;
  if (N < 0) { x = 1 / x; N = -N; }
  let r = 1, base = x;
  while (N > 0) {
    if (N & 1) r *= base;
    base *= base;
    N = Math.floor(N / 2);
  }
  return r;
}

export function mySqrt(x) {
  if (x < 2) return x;
  let lo = 1, hi = x, ans = 0;
  while (lo <= hi) {
    const m = Math.floor((lo + hi) / 2);
    if (m <= Math.floor(x / m)) { ans = m; lo = m + 1; }
    else hi = m - 1;
  }
  return ans;
}

export function fizzBuzz(n) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) out.push("FizzBuzz");
    else if (i % 3 === 0) out.push("Fizz");
    else if (i % 5 === 0) out.push("Buzz");
    else out.push(String(i));
  }
  return out;
}

export function romanToInt(s) {
  const m = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let r = 0;
  for (let i = 0; i < s.length; i++) {
    const v = m[s[i]], nx = m[s[i + 1]] || 0;
    r += v < nx ? -v : v;
  }
  return r;
}

export function intToRoman(num) {
  const v = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const sym = ["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"];
  let out = "";
  for (let i = 0; i < v.length; i++) while (num >= v[i]) { out += sym[i]; num -= v[i]; }
  return out;
}

export function multiplyStrings(a, b) {
  if (a === "0" || b === "0") return "0";
  const m = a.length, n = b.length;
  const r = new Array(m + n).fill(0);
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      const mul = (a.charCodeAt(i) - 48) * (b.charCodeAt(j) - 48);
      const p1 = i + j, p2 = i + j + 1;
      const sum = mul + r[p2];
      r[p2] = sum % 10;
      r[p1] += Math.floor(sum / 10);
    }
  }
  while (r.length > 1 && r[0] === 0) r.shift();
  return r.join("");
}

export function isPalindromeNumber(x) {
  if (x < 0) return false;
  let rev = 0, n = x;
  while (n > 0) { rev = rev * 10 + (n % 10); n = Math.floor(n / 10); }
  return rev === x;
}

export function addBinary(a, b) {
  let i = a.length - 1, j = b.length - 1, c = 0, out = "";
  while (i >= 0 || j >= 0 || c) {
    const x = i >= 0 ? a.charCodeAt(i--) - 48 : 0;
    const y = j >= 0 ? b.charCodeAt(j--) - 48 : 0;
    const s = x + y + c;
    out = (s & 1) + out;
    c = s >> 1;
  }
  return out;
}

export function titleToNumber(s) {
  let r = 0;
  for (let i = 0; i < s.length; i++) r = r * 26 + (s.charCodeAt(i) - 64);
  return r;
}

export function trailingZeroes(n) {
  let c = 0;
  while (n > 0) { n = Math.floor(n / 5); c += n; }
  return c;
}

export function countPrimes(n) {
  if (n <= 2) return 0;
  const sieve = new Uint8Array(n);
  let c = 0;
  for (let i = 2; i < n; i++) {
    if (!sieve[i]) {
      c++;
      for (let j = i * i; j < n; j += i) sieve[j] = 1;
    }
  }
  return c;
}

export function divideTwoIntegers(dividend, divisor) {
  const INT_MAX = 2147483647, INT_MIN = -2147483648;
  if (dividend === INT_MIN && divisor === -1) return INT_MAX;
  const sign = (dividend < 0) === (divisor < 0) ? 1 : -1;
  let dvd = Math.abs(dividend), dvs = Math.abs(divisor), q = 0;
  while (dvd >= dvs) {
    let t = dvs, m = 1;
    while (t * 2 <= dvd) { t *= 2; m *= 2; }
    dvd -= t;
    q += m;
  }
  const r = sign * q;
  if (r > INT_MAX) return INT_MAX;
  if (r < INT_MIN) return INT_MIN;
  return r;
}

export function reverseInteger(x) {
  const INT_MAX = 2147483647, INT_MIN = -2147483648;
  const sign = x < 0 ? -1 : 1;
  let n = Math.abs(x), r = 0;
  while (n > 0) { r = r * 10 + (n % 10); n = Math.floor(n / 10); }
  r *= sign;
  if (r > INT_MAX || r < INT_MIN) return 0;
  return r;
}

// --- Design (operations[], args[][]) ---
export function lfuCacheOps(operations, args) {
  let cap = 0;
  const kv = new Map();
  const fl = new Map();
  let minF = 0;
  const touch = (k) => {
    const node = kv.get(k);
    const f = node.freq;
    fl.get(f).delete(k);
    if (fl.get(f).size === 0) {
      fl.delete(f);
      if (minF === f) minF++;
    }
    node.freq++;
    if (!fl.has(node.freq)) fl.set(node.freq, new Map());
    fl.get(node.freq).set(k, true);
  };
  const out = [];
  for (let i = 0; i < operations.length; i++) {
    const op = operations[i], a = args[i];
    if (op === "LFUCache") { cap = a[0]; kv.clear(); fl.clear(); minF = 0; out.push(null); }
    else if (op === "get") {
      if (!kv.has(a[0])) { out.push(-1); continue; }
      touch(a[0]);
      out.push(kv.get(a[0]).val);
    } else if (op === "put") {
      if (cap === 0) { out.push(null); continue; }
      if (kv.has(a[0])) { kv.get(a[0]).val = a[1]; touch(a[0]); out.push(null); continue; }
      if (kv.size >= cap) {
        const list = fl.get(minF);
        const ev = list.keys().next().value;
        list.delete(ev);
        if (list.size === 0) fl.delete(minF);
        kv.delete(ev);
      }
      kv.set(a[0], { val: a[1], freq: 1 });
      if (!fl.has(1)) fl.set(1, new Map());
      fl.get(1).set(a[0], true);
      minF = 1;
      out.push(null);
    }
  }
  return out;
}

export function twitterOps(operations, args) {
  let timer = 0;
  const tweets = new Map();
  const follows = new Map();
  const ensure = (u) => {
    if (!tweets.has(u)) tweets.set(u, []);
    if (!follows.has(u)) follows.set(u, new Set([u]));
  };
  const out = [];
  for (let i = 0; i < operations.length; i++) {
    const op = operations[i], a = args[i];
    if (op === "Twitter") { tweets.clear(); follows.clear(); timer = 0; out.push(null); }
    else if (op === "postTweet") { ensure(a[0]); tweets.get(a[0]).push({ t: timer++, id: a[1] }); out.push(null); }
    else if (op === "getNewsFeed") {
      ensure(a[0]);
      const all = [];
      for (const u of follows.get(a[0])) {
        const list = tweets.get(u) || [];
        for (let j = list.length - 1, k = 0; j >= 0 && k < 10; j--, k++) all.push(list[j]);
      }
      all.sort((x, y) => y.t - x.t);
      out.push(all.slice(0, 10).map((x) => x.id));
    } else if (op === "follow") { ensure(a[0]); ensure(a[1]); follows.get(a[0]).add(a[1]); out.push(null); }
    else if (op === "unfollow") { ensure(a[0]); if (a[0] !== a[1]) follows.get(a[0]).delete(a[1]); out.push(null); }
  }
  return out;
}

export function timeMapOps(operations, args) {
  const m = new Map();
  const out = [];
  for (let i = 0; i < operations.length; i++) {
    const op = operations[i], a = args[i];
    if (op === "TimeMap") { m.clear(); out.push(null); }
    else if (op === "set") {
      if (!m.has(a[0])) m.set(a[0], []);
      m.get(a[0]).push([a[1], a[2]]);
      out.push(null);
    } else if (op === "get") {
      const list = m.get(a[0]);
      if (!list) { out.push(""); continue; }
      let lo = 0, hi = list.length - 1, ans = "";
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (list[mid][0] <= a[1]) { ans = list[mid][1]; lo = mid + 1; }
        else hi = mid - 1;
      }
      out.push(ans);
    }
  }
  return out;
}

export function randomizedSetOps(operations, args) {
  const idx = new Map();
  const arr = [];
  const out = [];
  for (let i = 0; i < operations.length; i++) {
    const op = operations[i], a = args[i];
    if (op === "RandomizedSet") { idx.clear(); arr.length = 0; out.push(null); }
    else if (op === "insert") {
      if (idx.has(a[0])) { out.push(false); continue; }
      idx.set(a[0], arr.length); arr.push(a[0]); out.push(true);
    } else if (op === "remove") {
      if (!idx.has(a[0])) { out.push(false); continue; }
      const i2 = idx.get(a[0]);
      const last = arr[arr.length - 1];
      arr[i2] = last; idx.set(last, i2);
      arr.pop(); idx.delete(a[0]);
      out.push(true);
    } else if (op === "getRandom") {
      out.push(arr[Math.floor(Math.random() * arr.length)]);
    }
  }
  return out;
}

export function hitCounterOps(operations, args) {
  const hits = [];
  let head = 0;
  const out = [];
  for (let i = 0; i < operations.length; i++) {
    const op = operations[i], a = args[i];
    if (op === "HitCounter") { hits.length = 0; head = 0; out.push(null); }
    else if (op === "hit") { hits.push(a[0]); out.push(null); }
    else if (op === "getHits") {
      const cutoff = a[0] - 300;
      while (head < hits.length && hits[head] <= cutoff) head++;
      out.push(hits.length - head);
    }
  }
  return out;
}

export function circularQueueOps(operations, args) {
  let cap = 0, buf = [], head = 0, count = 0;
  const out = [];
  for (let i = 0; i < operations.length; i++) {
    const op = operations[i], a = args[i];
    if (op === "MyCircularQueue") { cap = a[0]; buf = new Array(cap); head = 0; count = 0; out.push(null); }
    else if (op === "enQueue") {
      if (count === cap) { out.push(false); continue; }
      buf[(head + count) % cap] = a[0]; count++; out.push(true);
    } else if (op === "deQueue") {
      if (count === 0) { out.push(false); continue; }
      head = (head + 1) % cap; count--; out.push(true);
    } else if (op === "Front") out.push(count === 0 ? -1 : buf[head]);
    else if (op === "Rear") out.push(count === 0 ? -1 : buf[(head + count - 1) % cap]);
    else if (op === "isEmpty") out.push(count === 0);
    else if (op === "isFull") out.push(count === cap);
  }
  return out;
}

// --- Matrix / Array Classics ---
export function isValidSudoku(board) {
  const rows = Array.from({ length: 9 }, () => new Set());
  const cols = Array.from({ length: 9 }, () => new Set());
  const boxes = Array.from({ length: 9 }, () => new Set());
  for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) {
    const v = board[i][j];
    if (v === ".") continue;
    const b = Math.floor(i / 3) * 3 + Math.floor(j / 3);
    if (rows[i].has(v) || cols[j].has(v) || boxes[b].has(v)) return false;
    rows[i].add(v); cols[j].add(v); boxes[b].add(v);
  }
  return true;
}

export function spiralOrder(matrix) {
  const out = [];
  if (!matrix.length) return out;
  let t = 0, b = matrix.length - 1, l = 0, r = matrix[0].length - 1;
  while (t <= b && l <= r) {
    for (let j = l; j <= r; j++) out.push(matrix[t][j]); t++;
    for (let i = t; i <= b; i++) out.push(matrix[i][r]); r--;
    if (t <= b) { for (let j = r; j >= l; j--) out.push(matrix[b][j]); b--; }
    if (l <= r) { for (let i = b; i >= t; i--) out.push(matrix[i][l]); l++; }
  }
  return out;
}

export function rotateImage(matrix) {
  const n = matrix.length;
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
  for (const row of matrix) row.reverse();
  return matrix;
}

export function gameOfLife(board) {
  const m = board.length, n = board[0].length;
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      let live = 0;
      for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) {
        if (di === 0 && dj === 0) continue;
        const ni = i + di, nj = j + dj;
        if (ni >= 0 && ni < m && nj >= 0 && nj < n && (board[ni][nj] & 1)) live++;
      }
      if ((board[i][j] & 1) && (live === 2 || live === 3)) board[i][j] |= 2;
      if (!(board[i][j] & 1) && live === 3) board[i][j] |= 2;
    }
  }
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) board[i][j] >>= 1;
  return board;
}

export function firstMissingPositive(nums) {
  const n = nums.length;
  for (let i = 0; i < n; i++) {
    while (nums[i] > 0 && nums[i] <= n && nums[nums[i] - 1] !== nums[i]) {
      const j = nums[i] - 1;
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
  }
  for (let i = 0; i < n; i++) if (nums[i] !== i + 1) return i + 1;
  return n + 1;
}

export function findDuplicate(nums) {
  let slow = nums[0], fast = nums[0];
  do { slow = nums[slow]; fast = nums[nums[fast]]; } while (slow !== fast);
  slow = nums[0];
  while (slow !== fast) { slow = nums[slow]; fast = nums[fast]; }
  return slow;
}

export function majorityElement(nums) {
  let cand = 0, cnt = 0;
  for (const n of nums) {
    if (cnt === 0) cand = n;
    cnt += (n === cand) ? 1 : -1;
  }
  return cand;
}

export function rotateArrayK(nums, k) {
  const n = nums.length;
  if (n === 0) return nums;
  k = ((k % n) + n) % n;
  const rev = (i, j) => { while (i < j) { [nums[i], nums[j]] = [nums[j], nums[i]]; i++; j--; } };
  rev(0, n - 1); rev(0, k - 1); rev(k, n - 1);
  return nums;
}

export function containsNearbyDuplicate(nums, k) {
  const m = new Map();
  for (let i = 0; i < nums.length; i++) {
    if (m.has(nums[i]) && i - m.get(nums[i]) <= k) return true;
    m.set(nums[i], i);
  }
  return false;
}

export function findAnagrams(s, p) {
  const out = [];
  if (s.length < p.length) return out;
  const need = new Array(26).fill(0), have = new Array(26).fill(0);
  for (let i = 0; i < p.length; i++) {
    need[p.charCodeAt(i) - 97]++;
    have[s.charCodeAt(i) - 97]++;
  }
  const eq = () => { for (let i = 0; i < 26; i++) if (need[i] !== have[i]) return false; return true; };
  if (eq()) out.push(0);
  for (let i = p.length; i < s.length; i++) {
    have[s.charCodeAt(i) - 97]++;
    have[s.charCodeAt(i - p.length) - 97]--;
    if (eq()) out.push(i - p.length + 1);
  }
  return out;
}

// --- String Classics ---
export function myAtoi(s) {
  const INT_MAX = 2147483647, INT_MIN = -2147483648;
  let i = 0;
  while (i < s.length && s[i] === ' ') i++;
  let sign = 1;
  if (i < s.length && (s[i] === '+' || s[i] === '-')) { if (s[i] === '-') sign = -1; i++; }
  let r = 0;
  while (i < s.length && s[i] >= '0' && s[i] <= '9') {
    r = r * 10 + (s.charCodeAt(i) - 48);
    if (r * sign >= INT_MAX) return INT_MAX;
    if (r * sign <= INT_MIN) return INT_MIN;
    i++;
  }
  return r * sign;
}

export function isIsomorphic(s, t) {
  if (s.length !== t.length) return false;
  const ms = new Map(), mt = new Map();
  for (let i = 0; i < s.length; i++) {
    const a = s[i], b = t[i];
    if (ms.has(a) && ms.get(a) !== b) return false;
    if (mt.has(b) && mt.get(b) !== a) return false;
    ms.set(a, b); mt.set(b, a);
  }
  return true;
}

export function canConstruct(ransom, magazine) {
  const c = new Array(26).fill(0);
  for (let i = 0; i < magazine.length; i++) c[magazine.charCodeAt(i) - 97]++;
  for (let i = 0; i < ransom.length; i++) {
    const k = ransom.charCodeAt(i) - 97;
    if (c[k] === 0) return false;
    c[k]--;
  }
  return true;
}

export function lengthOfLastWord(s) {
  let i = s.length - 1;
  while (i >= 0 && s[i] === ' ') i--;
  let len = 0;
  while (i >= 0 && s[i] !== ' ') { len++; i--; }
  return len;
}

export function longestCommonPrefix(strs) {
  if (strs.length === 0) return "";
  let p = strs[0];
  for (let i = 1; i < strs.length; i++) {
    while (!strs[i].startsWith(p)) {
      p = p.slice(0, -1);
      if (p === "") return "";
    }
  }
  return p;
}

export function zigzagConvert(s, numRows) {
  if (numRows === 1 || numRows >= s.length) return s;
  const rows = Array.from({ length: numRows }, () => "");
  let cur = 0, dir = -1;
  for (const c of s) {
    rows[cur] += c;
    if (cur === 0 || cur === numRows - 1) dir = -dir;
    cur += dir;
  }
  return rows.join("");
}

export function strStr(haystack, needle) {
  if (needle.length === 0) return 0;
  return haystack.indexOf(needle);
}

export function wordPattern(pattern, s) {
  const words = s.split(' ');
  if (words.length !== pattern.length) return false;
  const p2w = new Map(), w2p = new Map();
  for (let i = 0; i < pattern.length; i++) {
    const p = pattern[i], w = words[i];
    if (p2w.has(p) && p2w.get(p) !== w) return false;
    if (w2p.has(w) && w2p.get(w) !== p) return false;
    p2w.set(p, w); w2p.set(w, p);
  }
  return true;
}

export function rotateString(s, goal) {
  return s.length === goal.length && (s + s).includes(goal);
}

// --- Phase 10 registry ---
Object.assign(referenceSolutions, {
  "single-number": singleNumber,
  "single-number-ii": singleNumberII,
  "number-of-1-bits": hammingWeight,
  "counting-bits": countBits,
  "reverse-bits": reverseBits,
  "missing-number": missingNumber,
  "sum-of-two-integers": getSum,
  "bitwise-and-of-numbers-range": rangeBitwiseAnd,
  "hamming-distance": hammingDistance,
  "power-of-two": isPowerOfTwo,
  "happy-number": isHappy,
  "plus-one": plusOne,
  "pow-x-n": myPow,
  "sqrt-x": mySqrt,
  "fizz-buzz": fizzBuzz,
  "roman-to-integer": romanToInt,
  "integer-to-roman": intToRoman,
  "multiply-strings": multiplyStrings,
  "palindrome-number": isPalindromeNumber,
  "add-binary": addBinary,
  "excel-sheet-column-number": titleToNumber,
  "factorial-trailing-zeroes": trailingZeroes,
  "count-primes": countPrimes,
  "divide-two-integers": divideTwoIntegers,
  "reverse-integer": reverseInteger,
  "lfu-cache": lfuCacheOps,
  "design-twitter": twitterOps,
  "time-based-key-value-store": timeMapOps,
  "insert-delete-getrandom-o1": randomizedSetOps,
  "design-hit-counter": hitCounterOps,
  "design-circular-queue": circularQueueOps,
  "valid-sudoku": isValidSudoku,
  "spiral-matrix": spiralOrder,
  "rotate-image": rotateImage,
  "game-of-life": gameOfLife,
  "first-missing-positive": firstMissingPositive,
  "find-the-duplicate-number": findDuplicate,
  "majority-element": majorityElement,
  "rotate-array": rotateArrayK,
  "contains-duplicate-ii": containsNearbyDuplicate,
  "find-all-anagrams-in-a-string": findAnagrams,
  "string-to-integer-atoi": myAtoi,
  "isomorphic-strings": isIsomorphic,
  "ransom-note": canConstruct,
  "length-of-last-word": lengthOfLastWord,
  "longest-common-prefix": longestCommonPrefix,
  "zigzag-conversion": zigzagConvert,
  "find-the-index-of-the-first-occurrence-in-a-string": strStr,
  "word-pattern": wordPattern,
  "rotate-string": rotateString,
});
