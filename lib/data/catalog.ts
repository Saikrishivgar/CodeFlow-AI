import type {
  AlgorithmCatalogItem,
  CodeProject,
  ComparisonScenario,
  LanguageRoadmapItem,
  LearningTrack,
  NotificationItem,
  QuickStartTopic,
} from "@/types";

export const QUICK_START_TOPICS: QuickStartTopic[] = [
  {
    slug: "python-basics",
    title: "Python Basics",
    subtitle: "Variables, control flow, loops, and stack frame basics",
    difficulty: "Beginner",
    accent: "emerald",
    concepts: ["Variables", "Conditionals", "For/While Loops"],
    estimatedMinutes: 15,
    targetRoute: "/learn?topic=python-basics",
    sampleCodeTitle: "FizzBuzz & Loop Accumulator",
  },
  {
    slug: "arrays",
    title: "Arrays",
    subtitle: "Contiguous indexing, prefix sums, and in-place mutations",
    difficulty: "Beginner",
    accent: "indigo",
    concepts: ["Indexing", "Prefix Sum", "In-Place Swap"],
    estimatedMinutes: 20,
    targetRoute: "/learn?topic=arrays",
    sampleCodeTitle: "Prefix Sum Builder",
  },
  {
    slug: "two-pointers",
    title: "Two Pointers",
    subtitle: "Converging & fast-slow indices across sorted sequences",
    difficulty: "Beginner",
    accent: "amber",
    concepts: ["Left/Right Convergence", "Deduplication", "Partitioning"],
    estimatedMinutes: 25,
    targetRoute: "/workspace?template=two-pointers",
    sampleCodeTitle: "Sorted Pair Target Sum",
  },
  {
    slug: "sliding-window",
    title: "Sliding Window",
    subtitle: "Dynamic subarray bounds with O(1) incremental state updates",
    difficulty: "Intermediate",
    accent: "indigo",
    concepts: ["Fixed Window", "Variable Window", "Frequency Map"],
    estimatedMinutes: 30,
    targetRoute: "/workspace?template=sliding-window",
    sampleCodeTitle: "Longest Unique Substring",
  },
  {
    slug: "hash-maps",
    title: "Hash Maps",
    subtitle: "Key-value lookups, complement tracking, and frequency tables",
    difficulty: "Beginner",
    accent: "violet",
    concepts: ["O(1) Lookup", "Complement Search", "Grouping"],
    estimatedMinutes: 20,
    targetRoute: "/learn?topic=hash-maps",
    sampleCodeTitle: "Two Sum Complement Map",
  },
  {
    slug: "linked-lists",
    title: "Linked Lists",
    subtitle: "Node references, pointer rewiring, and cycle detection",
    difficulty: "Intermediate",
    accent: "emerald",
    concepts: ["Next Pointer", "In-Place Reversal", "Floyd Cycle"],
    estimatedMinutes: 30,
    targetRoute: "/learn?topic=linked-lists",
    sampleCodeTitle: "Iterative Pointer Reversal",
  },
  {
    slug: "binary-trees",
    title: "Binary Trees",
    subtitle: "Hierarchical nodes, DFS traversals, and level-order BFS",
    difficulty: "Intermediate",
    accent: "amber",
    concepts: ["Inorder/Postorder", "Subtree Height", "BFS Queue"],
    estimatedMinutes: 35,
    targetRoute: "/algorithms?category=Trees+%26+Graphs",
    sampleCodeTitle: "Maximum Binary Tree Depth",
  },
  {
    slug: "graphs",
    title: "Graphs",
    subtitle: "Adjacency lists, visited sets, shortest paths, and topological order",
    difficulty: "Advanced",
    accent: "rose",
    concepts: ["BFS Frontier", "DFS Component", "Visited State"],
    estimatedMinutes: 45,
    targetRoute: "/algorithms?category=Trees+%26+Graphs",
    sampleCodeTitle: "Breadth-First Shortest Path",
  },
  {
    slug: "recursion",
    title: "Recursion",
    subtitle: "Call stack frames, base cases, and unwinding return values",
    difficulty: "Intermediate",
    accent: "violet",
    concepts: ["Call Stack", "Base Case", "Memoization"],
    estimatedMinutes: 30,
    targetRoute: "/workspace?template=recursion",
    sampleCodeTitle: "Recursive Call Tree Trace",
  },
];

export const INITIAL_LOCAL_PROJECTS: CodeProject[] = [
  {
    id: "proj_sliding_window_01",
    name: "Max Subarray Sum (Window k=3)",
    description: "Tracks window_sum, left, and right pointers across an integer list.",
    language: "python",
    topicSlug: "sliding-window",
    lastModifiedIso: "2026-11-07T14:20:00.000Z",
    createdAtIso: "2026-11-05T10:15:00.000Z",
    status: "Ready",
    isDemoSeed: true,
    codePreview: `def max_window_sum(nums: list[int], k: int) -> int:
    window_sum = sum(nums[:k])
    best = window_sum
    for right in range(k, len(nums)):
        window_sum += nums[right] - nums[right - k]
        best = max(best, window_sum)
    return best

print("Best k=3 sum:", max_window_sum([2, 1, 5, 1, 3, 2], 3))`,
  },
  {
    id: "proj_two_pointers_02",
    name: "Two Sum II — Sorted Pointers",
    description: "Converges left and right indices toward target sum in O(n) time.",
    language: "python",
    topicSlug: "two-pointers",
    lastModifiedIso: "2026-11-06T18:45:00.000Z",
    createdAtIso: "2026-11-04T09:00:00.000Z",
    status: "Template",
    isDemoSeed: true,
    codePreview: `def two_sum_sorted(numbers: list[int], target: int) -> tuple[int, int]:
    left, right = 0, len(numbers) - 1
    while left < right:
        current = numbers[left] + numbers[right]
        if current == target:
            return (left, right)
        if current < target:
            left += 1
        else:
            right -= 1
    return (-1, -1)

print("Pair indices:", two_sum_sorted([1, 3, 4, 6, 8, 11], 10))`,
  },
  {
    id: "proj_recursion_fib_03",
    name: "Memoized Fibonacci Call Frames",
    description: "Compares pruned memo table lookups against redundant recursive calls.",
    language: "python",
    topicSlug: "recursion",
    lastModifiedIso: "2026-11-05T11:30:00.000Z",
    createdAtIso: "2026-11-02T16:20:00.000Z",
    status: "Draft",
    isDemoSeed: true,
    codePreview: `def fib(n: int, memo: dict[int, int] | None = None) -> int:
    if memo is None:
        memo = {0: 0, 1: 1}
    if n not in memo:
        memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
    return memo[n]

print("fib(6) =", fib(6))`,
  },
  {
    id: "proj_bfs_grid_04",
    name: "Adjacency List BFS Frontier",
    description: "Visualizes FIFO queue expansion and visited set membership.",
    language: "python",
    topicSlug: "graphs",
    lastModifiedIso: "2026-11-03T20:10:00.000Z",
    createdAtIso: "2026-11-01T12:00:00.000Z",
    status: "Template",
    isDemoSeed: true,
    codePreview: `from collections import deque

def bfs_order(graph: dict[str, list[str]], start: str) -> list[str]:
    visited, order = {start}, []
    queue = deque([start])
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return order

sample_graph = {"A": ["B", "C"], "B": ["D"], "C": ["D"], "D": []}
print("BFS order:", bfs_order(sample_graph, "A"))`,
  },
];

export const ALGORITHM_CATALOG: AlgorithmCatalogItem[] = [
  {
    id: "alg_binary_search",
    slug: "binary-search",
    title: "Binary Search",
    category: "Sorting & Searching",
    difficulty: "Beginner",
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1)",
    bruteForceComplexity: "O(n)",
    summary: "Halves a monotonic search interval on every comparison by inspecting the midpoint.",
    keyInsight: "Watch low, mid, and high pointers collapse the active search range by 50% each step.",
  },
  {
    id: "alg_sliding_window_max",
    slug: "sliding-window-subarray",
    title: "Fixed & Dynamic Sliding Window",
    category: "Sliding Window",
    difficulty: "Intermediate",
    timeComplexity: "O(n)",
    spaceComplexity: "O(k)",
    bruteForceComplexity: "O(n * k)",
    summary: "Maintains a rolling window invariant without recomputing overlapping elements.",
    keyInsight: "Each element enters via right pointer at most once and exits via left pointer at most once.",
  },
  {
    id: "alg_two_sum_hashmap",
    slug: "complement-hash-map",
    title: "Single-Pass Complement Hash Map",
    category: "Hashing",
    difficulty: "Beginner",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    bruteForceComplexity: "O(n^2)",
    summary: "Trades linear auxiliary memory to eliminate nested pair scanning.",
    keyInsight: "Inspect the seen dictionary grow entry-by-entry until target - num hits.",
  },
  {
    id: "alg_converging_pointers",
    slug: "container-two-pointers",
    title: "Converging Two Pointers",
    category: "Arrays & Two Pointers",
    difficulty: "Intermediate",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    bruteForceComplexity: "O(n^2)",
    summary: "Eliminates suboptimal boundary pairs by advancing the limiting index inward.",
    keyInsight: "Moving the shorter boundary is the only transition capable of improving area/sum invariants.",
  },
  {
    id: "alg_tree_dfs_bfs",
    slug: "binary-tree-traversals",
    title: "Binary Tree DFS & Level-Order BFS",
    category: "Trees & Graphs",
    difficulty: "Intermediate",
    timeComplexity: "O(V)",
    spaceComplexity: "O(h) / O(w)",
    summary: "Contrasts implicit recursion call stacks against explicit FIFO queue frontiers.",
    keyInsight: "Observe stack depth match tree height h in DFS while queue width peaks at level width w in BFS.",
  },
  {
    id: "alg_graph_shortest_path",
    slug: "graph-bfs-traversal",
    title: "Unweighted Shortest Path (BFS)",
    category: "Trees & Graphs",
    difficulty: "Intermediate",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    summary: "Explores vertices in concentric distance layers from the source vertex.",
    keyInsight: "First discovery in an unweighted graph guarantees minimum edge count.",
  },
  {
    id: "alg_backtracking_subsets",
    slug: "recursive-backtracking",
    title: "Decision Tree Backtracking",
    category: "Recursion & Backtracking",
    difficulty: "Advanced",
    timeComplexity: "O(n * 2^n)",
    spaceComplexity: "O(n)",
    summary: "Constructs candidate states incrementally and undoes choices on frame return.",
    keyInsight: "Track path.append() before recursion and path.pop() immediately as frames unwind.",
  },
  {
    id: "alg_merge_sort",
    slug: "merge-sort-divide-conquer",
    title: "Merge Sort (Divide & Conquer)",
    category: "Sorting & Searching",
    difficulty: "Intermediate",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    bruteForceComplexity: "O(n^2)",
    summary: "Recursively bisects arrays to singletons and merges sorted halves in linear time.",
    keyInsight: "Every tree level performs exactly O(n) two-finger merge comparisons across log2(n) levels.",
  },
];

export const LEARNING_TRACKS: LearningTrack[] = [
  {
    id: "track_foundations",
    slug: "python-execution-foundations",
    title: "1. Python Execution & Memory Foundations",
    level: "Beginner",
    description:
      "Build an accurate mental model of how Python evaluates expressions, binds references, iterates loops, and manages local scopes.",
    modulesCount: 6,
    estimatedHours: "2.5 hrs",
    concepts: ["Name Binding", "Mutability", "Loop State", "Function Frames"],
    accent: "emerald",
  },
  {
    id: "track_linear_dsa",
    slug: "linear-structures-pointers",
    title: "2. Linear Data Structures & Pointer Patterns",
    level: "Beginner",
    description:
      "Master contiguous arrays, hash tables, two-pointer invariants, sliding windows, and linked list reference manipulation.",
    modulesCount: 8,
    estimatedHours: "4.0 hrs",
    concepts: ["Arrays", "Two Pointers", "Sliding Window", "Hash Maps", "Linked Lists"],
    accent: "indigo",
  },
  {
    id: "track_recursion_trees",
    slug: "recursion-and-trees",
    title: "3. Call Stacks, Recursion & Hierarchical Trees",
    level: "Intermediate",
    description:
      "Demystify recursion by watching call stack frames push and unwind across divide-and-conquer and binary tree problems.",
    modulesCount: 7,
    estimatedHours: "4.5 hrs",
    concepts: ["Call Stack", "Base Cases", "DFS Orders", "BST Invariants", "Memoization"],
    accent: "violet",
  },
  {
    id: "track_graphs_optimization",
    slug: "graphs-and-complexity",
    title: "4. Graph Traversals & Algorithmic Optimization",
    level: "Advanced",
    description:
      "Visualize BFS frontiers, cycle detection, topological ordering, and systematic transformation from O(n^2) brute force to O(n).",
    modulesCount: 7,
    estimatedHours: "5.5 hrs",
    concepts: ["Adjacency Lists", "BFS/DFS", "Topological Sort", "Space-Time Tradeoffs"],
    accent: "amber",
  },
];

export const COMPARISON_SCENARIOS: ComparisonScenario[] = [
  {
    id: "cmp_two_sum",
    slug: "pair-sum-lookup",
    title: "Target Pair Search",
    category: "Hashing vs. Nested Scan",
    bruteForce: {
      approach: "Nested index loops checking all (i, j) pairs",
      timeComplexity: "O(n^2)",
      spaceComplexity: "O(1)",
    },
    optimized: {
      approach: "Single pass storing seen complements in dict",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
    },
    summary: "For n = 1,000, nested scanning performs up to 499,500 comparisons versus at most 1,000 hash lookups.",
  },
  {
    id: "cmp_max_subarray_k",
    slug: "fixed-window-sum",
    title: "Maximum Sum Subarray of Size K",
    category: "Sliding Window vs. Re-summation",
    bruteForce: {
      approach: "Slice and sum k elements from scratch at each index",
      timeComplexity: "O(n * k)",
      spaceComplexity: "O(1)",
    },
    optimized: {
      approach: "Add incoming right element, subtract outgoing left element",
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
    },
    summary: "Eliminates k - 1 redundant additions per window shift while keeping constant memory.",
  },
  {
    id: "cmp_fibonacci",
    slug: "fibonacci-memoization",
    title: "Recursive Fibonacci Evaluation",
    category: "Memoization vs. Naive Tree Recursion",
    bruteForce: {
      approach: "Unmemoized binary recursion recomputing identical subtrees",
      timeComplexity: "O(2^n)",
      spaceComplexity: "O(n)",
    },
    optimized: {
      approach: "Top-down memoized cache or bottom-up two-variable state",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n) / O(1)",
    },
    summary: "fib(30) triggers 2,692,537 recursive calls naively compared to 59 calls with memoization.",
  },
];

export const LANGUAGE_ROADMAP: LanguageRoadmapItem[] = [
  {
    id: "python",
    name: "Python",
    monogram: "PY",
    extension: ".py",
    availability: "primary",
    statusLabel: "First Supported Language (Phase 2 Engine)",
    runtimeNote: "Python 3.12 AST & frame tracer architecture",
    description:
      "Clean syntax ideal for visualizing variables, object references, recursion stacks, and core data structures without boilerplate.",
    capabilities: [
      "Line-by-line frame & local scope inspection",
      "List, dict, set, tree & graph structure detection",
      "Recursion call-tree & return value tracking",
    ],
  },
  {
    id: "javascript",
    name: "JavaScript",
    monogram: "JS",
    extension: ".js",
    availability: "planned",
    statusLabel: "Planned",
    runtimeNote: "Future V8 / AST instrumentation milestone",
    description:
      "Planned support for closures, lexical scopes, array methods, Maps/Sets, and asynchronous event-loop intuition.",
    capabilities: ["Closure scope chains", "Array & Map visualizations", "Call stack step tracing"],
  },
  {
    id: "java",
    name: "Java",
    monogram: "JV",
    extension: ".java",
    availability: "planned",
    statusLabel: "Planned",
    runtimeNote: "Future JVM JDWP debugger trace adapter",
    description:
      "Planned support for object-oriented heap references, generics, collections framework, and university CS curricula.",
    capabilities: ["Stack vs. Heap object references", "Collections visualization", "Class method frames"],
  },
  {
    id: "c",
    name: "C",
    monogram: "C",
    extension: ".c",
    availability: "planned",
    statusLabel: "Planned",
    runtimeNote: "Future low-level memory & pointer inspector",
    description:
      "Planned support for raw memory addresses, pointer arithmetic, stack frames, and manual heap allocations.",
    capabilities: ["Pointer address arrows", "Contiguous byte/array layout", "malloc / free tracking"],
  },
  {
    id: "cpp",
    name: "C++",
    monogram: "C++",
    extension: ".cpp",
    availability: "planned",
    statusLabel: "Planned",
    runtimeNote: "Future STL & competitive programming runtime",
    description:
      "Planned support for STL containers (vector, unordered_map, priority_queue), iterators, and competitive DSA workflows.",
    capabilities: ["STL container rendering", "Reference & iterator state", "Template recursion frames"],
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_phase1",
    title: "Phase 1 Foundation Active",
    description:
      "Landing page, design system, theme engine, and local dashboard state are ready. Python execution arrives in Phase 2.",
    timestampLabel: "Today",
    read: false,
    tag: "Platform",
  },
  {
    id: "notif_shortcut",
    title: "Quick Navigation Tip",
    description:
      "Press Cmd+K (or Ctrl+K) anywhere in the dashboard to search routes, DSA topics, algorithms, and local projects.",
    timestampLabel: "Guide",
    read: false,
    tag: "Tip",
  },
  {
    id: "notif_roadmap",
    title: "Upcoming: Monaco + Python Tracer",
    description:
      "Phase 2 introduces the interactive Monaco code editor and FastAPI line-by-line Python execution engine.",
    timestampLabel: "Roadmap",
    read: true,
    tag: "Roadmap",
  },
];

