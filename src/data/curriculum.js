export const PATTERN_FAMILIES = [
  {
    id: 'sliding-window',
    name: 'Sliding Window',
    focus: true,
    targetComplexity: 'O(n)',
    trigger:
      'Contiguous subarray or substring with a length/frequency constraint → expand right every step, while invalid shrink left.',
    idiom: 'collections.Counter or dict + left = 0; for right, ch in enumerate(s): ...',
    pitfall: 'Never move left backwards; update answer only when the window invariant holds.',
  },
  {
    id: 'two-pointers',
    name: 'Two Pointers',
    focus: true,
    targetComplexity: 'O(n)',
    trigger:
      'Sorted array, palindrome symmetry, or pair/triplet sum → place left/right pointers and discard impossible states each step.',
    idiom: 'l, r = 0, len(nums) - 1; while l < r: ...',
    pitfall: 'In 3Sum, skip duplicate values on both the outer loop and inner pointers after a match.',
  },
  {
    id: 'monotonic-stack',
    name: 'Monotonic Stack',
    focus: true,
    targetComplexity: 'O(n)',
    trigger:
      'Next/previous greater or smaller element → hold waiting indices in a strictly decreasing (or increasing) stack and pop when broken.',
    idiom: 'stack = [] # store indices, compare nums[stack[-1]]',
    pitfall: 'Store indices (not values) so you can compute distances and write directly into res[idx].',
  },
  {
    id: 'arrays-hashing',
    name: 'Arrays & Hashing',
    focus: false,
    targetComplexity: 'O(n)',
    trigger:
      'Fast membership, frequency count, or complement lookup → trade O(n) dict/set space to remove a nested O(n^2) scan.',
    idiom: 'seen = {}; defaultdict(list); Counter(nums)',
    pitfall: 'Lists are unhashable; convert frequency counts or sorted keys to tuple before using as dict keys.',
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    focus: false,
    targetComplexity: 'O(log n)',
    trigger:
      'Sorted input or monotonic feasible(mid) predicate (Binary Search on Answer) → halve the search space each iteration.',
    idiom: 'lo, hi = 0, len(nums) - 1; mid = lo + (hi - lo) // 2',
    pitfall: 'Decide upfront whether you use closed [lo, hi] (lo <= hi) or half-open [lo, hi) (lo < hi) to prevent infinite loops.',
  },
  {
    id: 'linked-lists',
    name: 'Linked Lists',
    focus: false,
    targetComplexity: 'O(n) / O(1)',
    trigger:
      'In-place pointer rewiring, cycle detection, or k-from-end → dummy head node + fast/slow pointers.',
    idiom: 'dummy = ListNode(0, head); slow = fast = head',
    pitfall: 'Always guard `while fast and fast.next:` before stepping `fast = fast.next.next`.',
  },
  {
    id: 'trees',
    name: 'Trees (DFS/BFS)',
    focus: false,
    targetComplexity: 'O(n)',
    trigger:
      'Subtree property → post-order DFS returning state upward; level-by-level → deque BFS looping over len(q).',
    idiom: 'q = deque([root]); for _ in range(len(q)): node = q.popleft()',
    pitfall: 'In BST validation, pass (low, high) bounds down—checking only node.left/right misses deeper violations.',
  },
  {
    id: 'backtracking',
    name: 'Backtracking',
    focus: false,
    targetComplexity: 'O(2^n) / O(n!)',
    trigger:
      'Generate all valid subsets, permutations, or combinations with n <= 20 → choose, recurse, pop, and prune invalid branches early.',
    idiom: 'path.append(x); dfs(...); path.pop() # copy path[:] only at leaves',
    pitfall: 'Appending `path` without `path[:]` stores references to the same mutated list.',
  },
  {
    id: 'heaps',
    name: 'Heaps',
    focus: false,
    targetComplexity: 'O(n log k)',
    trigger:
      'Top-K / Kth largest or streaming min/max → keep a size-k min-heap (or negate values for a max-heap).',
    idiom: 'heapq.heappush(h, val); heapq.heappop(h)',
    pitfall: 'Python heapq is min-heap only; negate priorities for max-heap behavior.',
  },
  {
    id: 'graphs',
    name: 'Graphs',
    focus: false,
    targetComplexity: 'O(V + E)',
    trigger:
      'Grid regions → DFS/BFS with visited set; shortest unweighted path → multi-source BFS; prerequisites → Kahn topological sort.',
    idiom: 'adj = defaultdict(list); indegree = [0] * n; q = deque(...)',
    pitfall: 'Mark nodes visited when ENQUEUING in BFS (not on pop) to avoid duplicate queue entries and TLE.',
  },
  {
    id: 'dp-1d',
    name: '1D DP',
    focus: false,
    targetComplexity: 'O(n) / O(n * amount)',
    trigger:
      'Optimal count or min/max with overlapping subproblems → write top-down @cache recurrence first, then convert to bottom-up table.',
    idiom: 'from functools import cache; @cache def dp(i): ...',
    pitfall: 'Initialize impossible minimization states with float("inf"), never 0 or -1 blindly.',
  },
];

export const PATTERN_MAP = Object.fromEntries(
  PATTERN_FAMILIES.map((family) => [family.id, family])
);

export const WEEKS = [
  {
    week: 1,
    title: 'Week 1 — Hashing, Two Pointers & Sliding Window',
    goal: 'Stop guessing loop bounds and make pointer movement automatic.',
  },
  {
    week: 2,
    title: 'Week 2 — Monotonic Stack, Binary Search & Linked Lists',
    goal: 'Master monotonic stack pops, binary search on answer, and fast/slow pointers.',
  },
  {
    week: 3,
    title: 'Week 3 — Trees, Backtracking & Heaps',
    goal: 'Build deep comfort with recursion, pruning, and top-K priority queues.',
  },
  {
    week: 4,
    title: 'Week 4 — Core Graphs, Starter 1D DP & Untagged Drills',
    goal: 'Cover the final FAANG pillars and transition to untagged interview simulation.',
  },
];

export const CURRICULUM_PROBLEMS = [
  // Week 1 — Days 1-2: Arrays & Hashing
  { id: '1', number: 1, title: 'Two Sum', slug: 'two-sum', difficulty: 'Easy', week: 1, days: 'Days 1–2', pattern: 'arrays-hashing', targetComplexity: 'O(n)', hint: 'Store seen value -> index in a dict; check if target - x is already seen.' },
  { id: '217', number: 217, title: 'Contains Duplicate', slug: 'contains-duplicate', difficulty: 'Easy', week: 1, days: 'Days 1–2', pattern: 'arrays-hashing', targetComplexity: 'O(n)', hint: 'Compare len(set(nums)) with len(nums) or short-circuit with a seen set.' },
  { id: '242', number: 242, title: 'Valid Anagram', slug: 'valid-anagram', difficulty: 'Easy', week: 1, days: 'Days 1–2', pattern: 'arrays-hashing', targetComplexity: 'O(n)', hint: 'Count character frequencies with Counter(s) == Counter(t).' },
  { id: '49', number: 49, title: 'Group Anagrams', slug: 'group-anagrams', difficulty: 'Medium', week: 1, days: 'Days 1–2', pattern: 'arrays-hashing', targetComplexity: 'O(n * k)', hint: 'Key a defaultdict(list) by a 26-int character count tuple (or sorted tuple).' },
  { id: '347', number: 347, title: 'Top K Frequent Elements', slug: 'top-k-frequent-elements', difficulty: 'Medium', week: 1, days: 'Days 1–2', pattern: 'arrays-hashing', targetComplexity: 'O(n)', hint: 'Bucket sort by frequency index 1..n after counting with Counter.' },
  { id: '238', number: 238, title: 'Product of Array Except Self', slug: 'product-of-array-except-self', difficulty: 'Medium', week: 1, days: 'Days 1–2', pattern: 'arrays-hashing', targetComplexity: 'O(n)', hint: 'Two passes: accumulate prefix products left-to-right, then suffix products right-to-left.' },

  // Week 1 — Days 3-4: Two Pointers
  { id: '125', number: 125, title: 'Valid Palindrome', slug: 'valid-palindrome', difficulty: 'Easy', week: 1, days: 'Days 3–4', pattern: 'two-pointers', targetComplexity: 'O(n)', hint: 'Advance left/right inward while skipping non-alphanumeric chars with .isalnum().' },
  { id: '167', number: 167, title: 'Two Sum II - Input Array Is Sorted', slug: 'two-sum-ii-input-array-is-sorted', difficulty: 'Medium', week: 1, days: 'Days 3–4', pattern: 'two-pointers', targetComplexity: 'O(n)', hint: 'Sum too big -> decrement right; sum too small -> increment left. Return 1-indexed.' },
  { id: '15', number: 15, title: '3Sum', slug: '3sum', difficulty: 'Medium', week: 1, days: 'Days 3–4', pattern: 'two-pointers', targetComplexity: 'O(n^2)', hint: 'Sort array, fix i (skipping duplicates), then run Two Sum II on [i+1..n-1].' },
  { id: '11', number: 11, title: 'Container With Most Water', slug: 'container-with-most-water', difficulty: 'Medium', week: 1, days: 'Days 3–4', pattern: 'two-pointers', targetComplexity: 'O(n)', hint: 'Always move the shorter wall inward; moving the taller wall can never increase area.' },

  // Week 1 — Days 5-6: Sliding Window
  { id: '121', number: 121, title: 'Best Time to Buy and Sell Stock', slug: 'best-time-to-buy-and-sell-stock', difficulty: 'Easy', week: 1, days: 'Days 5–6', pattern: 'sliding-window', targetComplexity: 'O(n)', hint: 'Track lowest price seen so far; update max profit at every price.' },
  { id: '209', number: 209, title: 'Minimum Size Subarray Sum', slug: 'minimum-size-subarray-sum', difficulty: 'Medium', week: 1, days: 'Days 5–6', pattern: 'sliding-window', targetComplexity: 'O(n)', hint: 'All positives -> expand right until sum >= target, then shrink left while still >= target.' },
  { id: '3', number: 3, title: 'Longest Substring Without Repeating Characters', slug: 'longest-substring-without-repeating-characters', difficulty: 'Medium', week: 1, days: 'Days 5–6', pattern: 'sliding-window', targetComplexity: 'O(n)', hint: 'Track last seen index per char; on duplicate inside window, set left = max(left, seen[c] + 1).' },
  { id: '424', number: 424, title: 'Longest Repeating Character Replacement', slug: 'longest-repeating-character-replacement', difficulty: 'Medium', week: 1, days: 'Days 5–6', pattern: 'sliding-window', targetComplexity: 'O(n)', hint: 'Replacements needed = window_len - max_freq; shrink left when > k.' },
  { id: '567', number: 567, title: 'Permutation in String', slug: 'permutation-in-string', difficulty: 'Medium', week: 1, days: 'Days 5–6', pattern: 'sliding-window', targetComplexity: 'O(n)', hint: 'Fixed window of len(s1) over s2 comparing 26-char frequency arrays.' },

  // Week 2 — Days 1-2: Stack & Monotonic Stack
  { id: '20', number: 20, title: 'Valid Parentheses', slug: 'valid-parentheses', difficulty: 'Easy', week: 2, days: 'Days 1–2', pattern: 'monotonic-stack', targetComplexity: 'O(n)', hint: 'Push opens onto stack; each close must match stack.pop() via a closing->opening map.' },
  { id: '155', number: 155, title: 'Min Stack', slug: 'min-stack', difficulty: 'Medium', week: 2, days: 'Days 1–2', pattern: 'monotonic-stack', targetComplexity: 'O(1)', hint: 'Store (val, current_min) tuples so pop restores the previous minimum in O(1).' },
  { id: '150', number: 150, title: 'Evaluate Reverse Polish Notation', slug: 'evaluate-reverse-polish-notation', difficulty: 'Medium', week: 2, days: 'Days 1–2', pattern: 'monotonic-stack', targetComplexity: 'O(n)', hint: 'Push numbers; on operator pop b then a, and truncate division toward zero with int(a / b).' },
  { id: '496', number: 496, title: 'Next Greater Element I', slug: 'next-greater-element-i', difficulty: 'Easy', week: 2, days: 'Days 1–2', pattern: 'monotonic-stack', targetComplexity: 'O(n)', hint: 'Walk nums2 with a decreasing stack; when x > stack[-1], map stack.pop() -> x.' },
  { id: '739', number: 739, title: 'Daily Temperatures', slug: 'daily-temperatures', difficulty: 'Medium', week: 2, days: 'Days 1–2', pattern: 'monotonic-stack', targetComplexity: 'O(n)', hint: 'Monotonic decreasing stack of day indices; pop colder days and set ans[prev] = i - prev.' },
  { id: '853', number: 853, title: 'Car Fleet', slug: 'car-fleet', difficulty: 'Medium', week: 2, days: 'Days 1–2', pattern: 'monotonic-stack', targetComplexity: 'O(n log n)', hint: 'Sort by position descending; compute arrival time; push only if strictly slower than fleet ahead.' },

  // Week 2 — Days 3-4: Binary Search
  { id: '704', number: 704, title: 'Binary Search', slug: 'binary-search', difficulty: 'Easy', week: 2, days: 'Days 3–4', pattern: 'binary-search', targetComplexity: 'O(log n)', hint: 'Standard closed interval [lo, hi] with lo <= hi.' },
  { id: '74', number: 74, title: 'Search a 2D Matrix', slug: 'search-a-2d-matrix', difficulty: 'Medium', week: 2, days: 'Days 3–4', pattern: 'binary-search', targetComplexity: 'O(log(m*n))', hint: 'Treat m x n matrix as a flat sorted array: row, col = divmod(mid, cols).' },
  { id: '875', number: 875, title: 'Koko Eating Bananas', slug: 'koko-eating-bananas', difficulty: 'Medium', week: 2, days: 'Days 3–4', pattern: 'binary-search', targetComplexity: 'O(n log M)', hint: 'Binary search on speed k in [1, max(piles)] using ceiling hours (p + k - 1) // k.' },
  { id: '153', number: 153, title: 'Find Minimum in Rotated Sorted Array', slug: 'find-minimum-in-rotated-sorted-array', difficulty: 'Medium', week: 2, days: 'Days 3–4', pattern: 'binary-search', targetComplexity: 'O(log n)', hint: 'Compare nums[mid] with nums[hi]: if greater, minimum lies in [mid + 1, hi].' },
  { id: '33', number: 33, title: 'Search in Rotated Sorted Array', slug: 'search-in-rotated-sorted-array', difficulty: 'Medium', week: 2, days: 'Days 3–4', pattern: 'binary-search', targetComplexity: 'O(log n)', hint: 'One half [lo..mid] or [mid..hi] is always sorted; check if target falls inside the sorted half.' },

  // Week 2 — Days 5-6: Linked Lists
  { id: '206', number: 206, title: 'Reverse Linked List', slug: 'reverse-linked-list', difficulty: 'Easy', week: 2, days: 'Days 5–6', pattern: 'linked-lists', targetComplexity: 'O(n)', hint: 'Maintain prev = None, curr = head; save nxt = curr.next before flipping curr.next = prev.' },
  { id: '21', number: 21, title: 'Merge Two Sorted Lists', slug: 'merge-two-sorted-lists', difficulty: 'Easy', week: 2, days: 'Days 5–6', pattern: 'linked-lists', targetComplexity: 'O(n + m)', hint: 'Use a dummy head and tail pointer; attach the remaining non-empty list at the end.' },
  { id: '141', number: 141, title: 'Linked List Cycle', slug: 'linked-list-cycle', difficulty: 'Easy', week: 2, days: 'Days 5–6', pattern: 'linked-lists', targetComplexity: 'O(n) / O(1)', hint: 'Floyd tortoise & hare: slow steps 1, fast steps 2; if they meet, a cycle exists.' },
  { id: '19', number: 19, title: 'Remove Nth Node From End of List', slug: 'remove-nth-node-from-end-of-list', difficulty: 'Medium', week: 2, days: 'Days 5–6', pattern: 'linked-lists', targetComplexity: 'O(n)', hint: 'Advance fast n steps ahead of slow (starting at dummy) so slow stops right before target.' },
  { id: '143', number: 143, title: 'Reorder List', slug: 'reorder-list', difficulty: 'Medium', week: 2, days: 'Days 5–6', pattern: 'linked-lists', targetComplexity: 'O(n)', hint: 'Three primitives combined: find middle (slow/fast), reverse second half, interleave both halves.' },

  // Week 3 — Days 1-3: Trees
  { id: '226', number: 226, title: 'Invert Binary Tree', slug: 'invert-binary-tree', difficulty: 'Easy', week: 3, days: 'Days 1–3', pattern: 'trees', targetComplexity: 'O(n)', hint: 'Swap root.left, root.right = root.right, root.left and recurse on both children.' },
  { id: '104', number: 104, title: 'Maximum Depth of Binary Tree', slug: 'maximum-depth-of-binary-tree', difficulty: 'Easy', week: 3, days: 'Days 1–3', pattern: 'trees', targetComplexity: 'O(n)', hint: 'Base case None -> 0; otherwise 1 + max(depth(left), depth(right)).' },
  { id: '543', number: 543, title: 'Diameter of Binary Tree', slug: 'diameter-of-binary-tree', difficulty: 'Easy', week: 3, days: 'Days 1–3', pattern: 'trees', targetComplexity: 'O(n)', hint: 'Post-order DFS returns height while updating nonlocal best = max(best, left_h + right_h).' },
  { id: '102', number: 102, title: 'Binary Tree Level Order Traversal', slug: 'binary-tree-level-order-traversal', difficulty: 'Medium', week: 3, days: 'Days 1–3', pattern: 'trees', targetComplexity: 'O(n)', hint: 'BFS with deque; snapshot level_size = len(q) at the start of each level.' },
  { id: '98', number: 98, title: 'Validate Binary Search Tree', slug: 'validate-binary-search-tree', difficulty: 'Medium', week: 3, days: 'Days 1–3', pattern: 'trees', targetComplexity: 'O(n)', hint: 'Pass strict (low, high) interval bounds down recursion; root starts with (-inf, +inf).' },
  { id: '235', number: 235, title: 'Lowest Common Ancestor of a BST', slug: 'lowest-common-ancestor-of-a-binary-search-tree', difficulty: 'Medium', week: 3, days: 'Days 1–3', pattern: 'trees', targetComplexity: 'O(h)', hint: 'Walk down iteratively: both < node -> go left; both > node -> go right; split point is LCA.' },

  // Week 3 — Days 4-5: Backtracking
  { id: '78', number: 78, title: 'Subsets', slug: 'subsets', difficulty: 'Medium', week: 3, days: 'Days 4–5', pattern: 'backtracking', targetComplexity: 'O(n * 2^n)', hint: 'At index i, either include nums[i] or skip it; append path[:] at base case.' },
  { id: '39', number: 39, title: 'Combination Sum', slug: 'combination-sum', difficulty: 'Medium', week: 3, days: 'Days 4–5', pattern: 'backtracking', targetComplexity: 'O(2^(T/M))', hint: 'Keep start index i so duplicates are avoided while staying at i allows reuse.' },
  { id: '46', number: 46, title: 'Permutations', slug: 'permutations', difficulty: 'Medium', week: 3, days: 'Days 4–5', pattern: 'backtracking', targetComplexity: 'O(n * n!)', hint: 'Track used indices with a boolean array (or set); append path[:] when len == n.' },
  { id: '22', number: 22, title: 'Generate Parentheses', slug: 'generate-parentheses', difficulty: 'Medium', week: 3, days: 'Days 4–5', pattern: 'backtracking', targetComplexity: 'O(4^n / sqrt(n))', hint: 'Add "(" if open < n; add ")" if close < open; append "".join(path) at len == 2*n.' },

  // Week 3 — Day 6: Heaps
  { id: '215', number: 215, title: 'Kth Largest Element in an Array', slug: 'kth-largest-element-in-an-array', difficulty: 'Medium', week: 3, days: 'Day 6', pattern: 'heaps', targetComplexity: 'O(n log k)', hint: 'Maintain a min-heap of size k; top element h[0] is the kth largest.' },
  { id: '973', number: 973, title: 'K Closest Points to Origin', slug: 'k-closest-points-to-origin', difficulty: 'Medium', week: 3, days: 'Day 6', pattern: 'heaps', targetComplexity: 'O(n log k)', hint: 'Push (-(x*x + y*y), x, y) into a max-heap of size k (no sqrt needed).' },

  // Week 4 — Days 1-3: Graphs
  { id: '200', number: 200, title: 'Number of Islands', slug: 'number-of-islands', difficulty: 'Medium', week: 4, days: 'Days 1–3', pattern: 'graphs', targetComplexity: 'O(m * n)', hint: 'Each unvisited "1" increments count and launches DFS/BFS to sink its connected land.' },
  { id: '133', number: 133, title: 'Clone Graph', slug: 'clone-graph', difficulty: 'Medium', week: 4, days: 'Days 1–3', pattern: 'graphs', targetComplexity: 'O(V + E)', hint: 'Map old_node -> cloned_node before recursing on neighbors so cycles terminate cleanly.' },
  { id: '994', number: 994, title: 'Rotting Oranges', slug: 'rotting-oranges', difficulty: 'Medium', week: 4, days: 'Days 1–3', pattern: 'graphs', targetComplexity: 'O(m * n)', hint: 'Multi-source BFS: enqueue all initially rotten cells at t=0 and count fresh oranges down.' },
  { id: '207', number: 207, title: 'Course Schedule', slug: 'course-schedule', difficulty: 'Medium', week: 4, days: 'Days 1–3', pattern: 'graphs', targetComplexity: 'O(V + E)', hint: 'Kahn topological sort: enqueue indegree-0 nodes; cycle exists iff visited < numCourses.' },

  // Week 4 — Days 4-5: 1D DP
  { id: '70', number: 70, title: 'Climbing Stairs', slug: 'climbing-stairs', difficulty: 'Easy', week: 4, days: 'Days 4–5', pattern: 'dp-1d', targetComplexity: 'O(n) / O(1)', hint: 'dp[i] = dp[i-1] + dp[i-2]; keep only the last two states.' },
  { id: '198', number: 198, title: 'House Robber', slug: 'house-robber', difficulty: 'Medium', week: 4, days: 'Days 4–5', pattern: 'dp-1d', targetComplexity: 'O(n) / O(1)', hint: 'At house i choose max(skip: prev1, rob: prev2 + nums[i]).' },
  { id: '322', number: 322, title: 'Coin Change', slug: 'coin-change', difficulty: 'Medium', week: 4, days: 'Days 4–5', pattern: 'dp-1d', targetComplexity: 'O(n * amount)', hint: 'dp[a] = min(1 + dp[a - c]) over coins c <= a; init dp with inf except dp[0] = 0.' },
  { id: '139', number: 139, title: 'Word Break', slug: 'word-break', difficulty: 'Medium', week: 4, days: 'Days 4–5', pattern: 'dp-1d', targetComplexity: 'O(n^2)', hint: 'dp[i] = True if any s[j:i] in word_set and dp[j] is True.' },
  { id: '300', number: 300, title: 'Longest Increasing Subsequence', slug: 'longest-increasing-subsequence', difficulty: 'Medium', week: 4, days: 'Days 4–5', pattern: 'dp-1d', targetComplexity: 'O(n log n)', hint: 'O(n^2) DP dp[i] = 1 + max(dp[j]); O(n log n) maintains tails array with bisect_left.' },
];

export const CONSTRAINT_CHEAT_TABLE = [
  { constraint: 'n <= 12', complexity: 'O(n!)', patterns: 'Permutations, Backtracking' },
  { constraint: 'n <= 20', complexity: 'O(2^n) or O(n * 2^n)', patterns: 'Subsets, Backtracking, Bitmask DP' },
  { constraint: 'n <= 500', complexity: 'O(n^3)', patterns: 'Interval DP, Floyd-Warshall' },
  { constraint: 'n <= 5,000', complexity: 'O(n^2)', patterns: '2D DP, Nested Pairs' },
  { constraint: 'n <= 10^5', complexity: 'O(n log n) or O(n)', patterns: 'Sliding Window, Two Pointers, Monotonic Stack, Heap, Sorting, Binary Search, Hash' },
  { constraint: 'n <= 10^9', complexity: 'O(log n) or O(1)', patterns: 'Binary Search on Answer, Math, Bit Manipulation' },
];

export const PYTHON3_PITFALLS = [
  { title: 'Shallow 2D grid copy', wrong: '[[0] * cols] * rows', right: '[[0] * cols for _ in range(rows)]' },
  { title: 'Negative floor division', wrong: '-3 // 2  # gives -2', right: 'int(-3 / 2)  # truncates to -1' },
  { title: 'Max-heap in heapq', wrong: 'heapq.heappush(h, x)', right: 'heapq.heappush(h, -x)  # negate' },
  { title: 'String build in recursion', wrong: 's += ch  # O(n) copy each call', right: 'buf.append(ch) ... "".join(buf)' },
  { title: 'Backtracking snapshot', wrong: 'res.append(path)', right: 'res.append(path[:])' },
  { title: 'Deep recursion chains', wrong: 'default limit = 1000', right: 'sys.setrecursionlimit(10**6) or iterative' },
];
