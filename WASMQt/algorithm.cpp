#include "algorithm.h"
#include <memory>
#include <vector>
#include <string>
#include <array>
#include <utility>
#include <cstdint>
#include <QDebug>
#include <random>
#ifdef __EMSCRIPTEN__
#include <emscripten/stack.h>
#endif
#ifdef _WIN32
#include <windows.h>
#endif

static int currentDepth = 0;
static int maxDepth = 0;
static int maxReachedDepth = 0;
static uintptr_t prevStackAddr = 0;
static bool firstCall = true;
static uintptr_t maxFreeBytes = 2086096;

using std::shared_ptr;
using std::enable_shared_from_this;
using namespace std;

uintptr_t printStackFreeBytes() {
#ifdef __EMSCRIPTEN__
    auto freeBytes = (uintptr_t)emscripten_stack_get_free();
    //qDebug() << "WASM Stack remaining Bytes:" << freeBytes;
    return freeBytes;
#endif
#ifdef _WIN32
    int localVar;
    ULONG_PTR stackLow, stackHigh;
    uintptr_t sp = reinterpret_cast<uintptr_t>(&localVar);
    GetCurrentThreadStackLimits(&stackLow, &stackHigh);
    size_t freeStackBytes = sp - stackLow;
    return freeStackBytes;
#endif
}

void printStackSize() {
#ifdef _WIN32
    MEMORY_BASIC_INFORMATION mbi;
    VirtualQuery(&mbi, &mbi, sizeof(mbi));
    qDebug() << "Stack base: " << mbi.AllocationBase;
    qDebug() << "Stack size: " << mbi.RegionSize;
#endif
#ifdef __EMSCRIPTEN__
    uintptr_t stackTop = (uintptr_t)emscripten_stack_get_base();
    uintptr_t stackLimit = (uintptr_t)emscripten_stack_get_end();
    size_t stackSize = stackTop - stackLimit;

    qDebug() << "WASM Stack top:" << (void*)stackTop;
    qDebug() << "WASM Stack limit:" << (void*)stackLimit;
    qDebug() << "WASM Stack size:" << stackSize;
    printStackFreeBytes();
#endif
}

struct DepthGuard {
    uintptr_t localAddr;
    DepthGuard() {
        currentDepth++;
        if (maxFreeBytes > printStackFreeBytes()) {
            maxFreeBytes = printStackFreeBytes();
        }
        if (currentDepth > maxReachedDepth) {
            maxReachedDepth = currentDepth;
            // Measure stack frame size
            int localVar = 0;
            uintptr_t currentAddr = reinterpret_cast<uintptr_t>(&localVar);
            if (!firstCall) {
                //qDebug() << "MaxDepth: " << maxReachedDepth
                //         << ", Approx stack frame: "
                //         << (prevStackAddr > currentAddr ? prevStackAddr - currentAddr : currentAddr - prevStackAddr)
                //         << " bytes";
            } else {
                firstCall = false;
            }
            prevStackAddr = currentAddr;
        }
        maxDepth = std::max(maxDepth, currentDepth);
    }
    ~DepthGuard() {
        currentDepth--;
    }
};

Algorithm::Algorithm(QObject *parent)
    : QObject(parent)
{}

static uint64_t callCount = 0;

// 9,223,372,036,854,775,807 (qint64::max)
// largest fib(92) = 7,540,113,804,746,346,429

// Fibonaci stack frame size (estimation for recursive call)
struct FibStackFrame {
    int n;
    int depth;
    qint64 temp;   // return value
    void* retAddr; // approximate
};

qint64 Algorithm::fibIter(int n) {
    if (n <= 1) return n;
    qint64 a = 0, b = 1;
    for (int i = 2; i <= n; ++i) {
        qint64 c = a + b;
        a = b;
        b = c;
    }
    return b;
}

qint64 Algorithm::fibRec(int n, int depth, int& maxDepth) {
    ++callCount;
    if (depth > maxDepth)
        maxDepth = depth;
    if (n <= 1) return n;
    return fibRec(n - 1, depth + 1, maxDepth)
           + fibRec(n - 2, depth + 1, maxDepth);
}

QVariantList Algorithm::computeSeriesIterative(int n)
{
    QVariantList result;

    if (n > 92) {
        qDebug() << "Algorithm was called with number > 92 which exceeds qint64 limit";
        return result;
    }

    using clock = std::chrono::high_resolution_clock;

    auto start = clock::now();

    for (int i = 0; i <= n; i++) {
        fibIter(i);

        auto now = clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::nanoseconds>(now - start).count();

        QVariantMap dataPoint;
        dataPoint.insert("index", i);
        dataPoint.insert("duration", static_cast<double>(duration));

        result.append(dataPoint);
    }

    qDebug() << result.size();
    return result;
}

QVariantList Algorithm::computeSeriesRecursive(int from, int to, int runs)
{
    int maxDepth = 0;
    maxFreeBytes = 2086096;
    printStackSize();
    qDebug() << from << to;
    QVariantList result;

    if (from < 0 || to > 92 || from > to || runs <= 0) {
        qDebug() << "Invalid parameters!";
        return result;
    }

    using clock = std::chrono::steady_clock;

    for (int i = from; i <= to; i++) {
        long long totalDuration = 0;

        for (int r = 0; r < runs; r++) {

            callCount = 0;

            auto start = clock::now();
            fibRec(i, 1, maxDepth);
            auto end = clock::now();

            auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count();

            // Skip first run if runs > 1 (cold start)
            if (runs > 1 && r == 0)
                continue;

            totalDuration += duration;
        }

        int divisor = (runs > 1) ? runs - 1 : runs;
        double averageDuration = static_cast<double>(totalDuration) / divisor;

        QVariantMap dataPoint;
        dataPoint.insert("index", i);
        dataPoint.insert("duration", averageDuration);
        dataPoint.insert("callCount", callCount);
        qDebug() << "Fib(" << i << "), " << "Average duration: " << averageDuration  << ", Function Calls: " << callCount << ", Depth: " << maxDepth;

        result.append(dataPoint);
    }

    size_t frameSize = sizeof(FibStackFrame);
    size_t estimatedStackUsage = frameSize * maxDepth;

    qDebug() << "Max Depth: " << maxDepth;
    qDebug() << "Frame Size: " << frameSize;
    qDebug() << "Estimated Stack Usage: " << estimatedStackUsage;

    return result;
}

void Algorithm::requestStatistics() {
    using Struct = struct { char c; int i; };
    using Array = std::array<int, 5>;
    using Pair = std::pair<int, double>;

    emit statisticsReceived(sizeof(int),
                            sizeof(long),
                            sizeof(bool),
                            sizeof(void*),
                            sizeof(std::shared_ptr<int>),
                            sizeof(std::unique_ptr<int>),
                            sizeof(char),
                            sizeof(short),
                            sizeof(long long),
                            sizeof(float),
                            sizeof(double),
                            sizeof(long double),
                            sizeof(int*),
                            sizeof(std::vector<int>),
                            sizeof(std::string),
                            sizeof(Array),
                            sizeof(Pair),
                            sizeof(uintptr_t),
                            sizeof(size_t),
                            sizeof(Struct));
}

/*
k 	⁠A ( k , 1 , − 1 , − 1 , 1 , 0 )
0 	1
1 	0
2 	−2
3 	0
4 	1
5 	0
6 	1
7 	−1
8 	−10
9 	−30
10 	−67
11 	−138
12 	−291
13 	−642
14 	−1446
15 	−3250
16 	−7244
17 	−16065
18 	−35601
19 	−78985
20 	−175416
21 	−389695
22 	−865609
23 	−1922362
24 	−4268854
25 	−9479595
26 	−21051458
*/

struct Arg {
    virtual int run() {
        ++callCount;
        return 0;
    }
    virtual ~Arg() { };
};

int A(int, shared_ptr<Arg>, shared_ptr<Arg>, shared_ptr<Arg>,
      shared_ptr<Arg>, shared_ptr<Arg>);

class B : public Arg, public enable_shared_from_this<B> {
private:
    int k;
    const shared_ptr<Arg> x1, x2, x3, x4;

public:
    B(int _k, shared_ptr<Arg> _x1, shared_ptr<Arg> _x2, shared_ptr<Arg> _x3,
      shared_ptr<Arg> _x4)
        : k(_k), x1(_x1), x2(_x2), x3(_x3), x4(_x4) { }
    int run() {
        ++callCount;
        return A(--k, shared_from_this(), x1, x2, x3, x4);
    }
};

class Const : public Arg {
private:
    const int x;
public:
    Const(int _x) : x(_x) { }
    int run () {
        ++callCount;
        return x; }
};

int A(int k, shared_ptr<Arg> x1, shared_ptr<Arg> x2, shared_ptr<Arg> x3,
      shared_ptr<Arg> x4, shared_ptr<Arg> x5) {
    ++callCount;
    DepthGuard guard;
    if (k <= 0) {
        return x4->run() + x5->run();
    }
    else {
        shared_ptr<Arg> b(new B(k, x1, x2, x3, x4));
        return b->run();
    }
}


int Algorithm::singleTest(int k, int runs) {
    using clock = std::chrono::high_resolution_clock;

    double totalTime = 0.0;
    int finalResult = 0;
    auto before = printStackFreeBytes();

    for (int i = 0; i < runs; ++i) {

        // Reset counters before each run
        callCount = 0;
        currentDepth = 0;
        maxDepth = 0;
        maxReachedDepth = 0;

        //set to 8MB in native and wasm is set in .pro file
        maxFreeBytes = 8388608;

        if (i==0) printStackSize();

        auto start = clock::now();

        auto result = A(k,
                        std::make_shared<Const>(1),
                        std::make_shared<Const>(-1),
                        std::make_shared<Const>(-1),
                        std::make_shared<Const>(1),
                        std::make_shared<Const>(0));

        auto end = clock::now();

        std::chrono::duration<double, std::milli> elapsed = end - start;

        // Skip first run if runs > 1
        if (runs == 1 || i > 0) {
            totalTime += elapsed.count();
        }

        finalResult = result;
    }

    // Calculate average
    double averageTime = 0.0;

    if (runs == 1) {
        averageTime = totalTime;
    } else {
        averageTime = totalTime / (runs - 1);
    }

    QString execTimeStr = QString::number(averageTime, 'f', 6);

#ifdef _WIN32
    emit testResultMob(k, finalResult, maxDepth, before, maxFreeBytes, ((before-maxFreeBytes)/maxDepth), execTimeStr, "Native", callCount);
#endif
#ifdef __EMSCRIPTEN__
    emit testResultMob(k, finalResult, maxDepth, before, maxFreeBytes, ((before-maxFreeBytes)/maxDepth), execTimeStr, "WebAssembly", callCount);
#endif
    return finalResult;
}

void Algorithm::incrementalTest(int n, int runs) {
    for (int k = 1; k <= n; ++k)
    {
        try
        {
            singleTest(k, runs);
        }
        //Cannot catch stackoverflow (will simply crash!)
        catch (...)
        {
            qDebug() << "Failure at k=" << k;
            break;
        }
    }
    emit testFinished();
}

// Cheney CG

//Each objet lives in one of the two semispaces (fwd used during GC)
struct Object {
    Object* fwd;   // forwarding pointer (nullptr = not forwarded)
    Object* ref;   // single reference to keep it simple
};

// All objects have the same size.
constexpr size_t OBJ_SIZE = sizeof(Object);

// Semispace (heap)
#ifdef __EMSCRIPTEN__
// size_t HEAP_BYTES = 512ULL * 1024 * 1024; // 512 MB
size_t HEAP_BYTES = 128ULL * 1024 * 1024;
#else
//size_t HEAP_BYTES = 2ULL * 1024 * 1024 * 1024; // 2 GB => 1024 (1KB) 1024*1024 (1MB) 1024*1024*1024 (1GB)
size_t HEAP_BYTES = 128ULL * 1024 * 1024;
#endif

unsigned char* from_space = new unsigned char[HEAP_BYTES];
unsigned char* to_space   = new unsigned char[HEAP_BYTES];
unsigned char* hp = from_space;

// Check if pointer points into from_space
// since only objects in from_spae need to be copied
bool in_from_space(Object* p) {
    return (unsigned char*)p >= from_space &&
           (unsigned char*)p <  from_space + HEAP_BYTES;
}

// Copy an object from from_space into to_space (copies object bytes, installs forwarding pointer in old object)
Object* copy_object(Object* src, unsigned char* dest) {
    Object* dst = (Object*)dest;
    *dst = *src;        // copy object
    src->fwd = dst;     // set forwarding
    return dst;
}

// Cheney garbage collection
// Implementing the pseudo code
void cheney_gc(Object** roots, size_t root_count) {
    unsigned char* scan  = to_space;  // scan = to_space_start  (walks over copied object and scans their reference)
    unsigned char* alloc = to_space;  // alloc = to_space_start (points to where the next copied object will be placed)

    // Copy roots
    // Each root is a live object if root points into from_space and has not been forwarded -> copy into to_space
    for (size_t i = 0; i < root_count; ++i) {
        Object* root = roots[i];

        if (root && in_from_space(root) && !root->fwd) {
            roots[i] = copy_object(root, alloc);
            alloc += OBJ_SIZE;
        }
    }

    // Traversal loop
    // scan moves from start of to_space up to alloc
    // every object has been copied but not yet scanned
    while (scan < alloc) {
        Object* obj = (Object*)scan;

        Object* ref = obj->ref;
        if (ref && in_from_space(ref)) {
            // ref points into from_space -> may need copying
            if (!ref->fwd) {
                // object not yet copied -> copy and update reference
                obj->ref = copy_object(ref, alloc);
                alloc += OBJ_SIZE;
            } else {
                // object already copied -> update reference to forwarded location
                obj->ref = ref->fwd;
            }
        }

        // move scan to next copied object
        scan += OBJ_SIZE;
    }

    // Termination: swap spaces
    // to_space contains all live object
    // byte wise swap of the spaces
    for (size_t i = 0; i < root_count; ++i)
        roots[i]->fwd = nullptr; // clear forwarding (cleanup)

    // swap from_space and to_space
    // byte-wise swap is intentionally inefficient
    // => Real Cheney GC would swap pointers which is faster and more realistic
    // Performance is not the focus but memory usage behavior is!
    for (size_t i = 0; i < HEAP_BYTES; ++i) {
        unsigned char tmp = from_space[i];
        from_space[i] = to_space[i];
        to_space[i] = tmp;
    }
}

// Cheney CG Testing
Object* allocate_object() {
    if (hp + sizeof(Object) > from_space + HEAP_BYTES) {
        qDebug() << "Heap overflow!";
        return nullptr;
    }
    Object* obj = reinterpret_cast<Object*>(hp);
    hp += sizeof(Object);
    obj->fwd = nullptr;
    obj->ref = nullptr;
    return obj;
}

struct HeapConfig {
    size_t num_objects;      // total objects to create
    size_t num_roots;        // number of roots
    size_t num_iterations;   // how y times to run GC for timing
};

class HeapBuilder {
public:
    HeapBuilder(const HeapConfig& cfg) : config(cfg) {
        // Reserve storage in vectors to avoid repeated reallocations
        // objects: holds all allocated Object pointers
        // roots: holds pointers to the starting objects for each root chain
        objects.reserve(config.num_objects);
        roots.reserve(config.num_roots);
    }

    // Allocate objects dynamically and build reference chains
    void build_heap_dynamic() {
        for (size_t i = 0; i < config.num_objects; ++i) {
            Object* obj = allocate_object();  // dynamic allocation into heap
            objects.push_back(obj); // keep track for later traversal / GC
        }

        // Each chain simulates live objects reachable from a root
        size_t chain_len = config.num_objects / config.num_roots;

        for (size_t r = 0; r < config.num_roots; ++r) {
            size_t start_idx = r * chain_len;   // start of chain
            size_t end_idx = (r == config.num_roots - 1) ? config.num_objects : start_idx + chain_len;

             // Link objects sequentially in this chain
            for (size_t i = start_idx; i < end_idx - 1; ++i) {
                objects[i]->ref = objects[i + 1];
            }
            objects[end_idx - 1]->ref = nullptr;  // last object has no next
            roots[r] = objects[start_idx];
        }
    }


    // Access roots for GC
    vector<Object*>& get_roots() { return roots; }

    // Access all objects
    vector<Object*>& get_objects() { return objects; }

private:
    HeapConfig config;
    vector<Object*> objects;
    vector<Object*> roots;
};

QString formatBytes(size_t bytes) {
    const double KB = 1024.0;
    const double MB = KB * 1024.0;
    const double GB = MB * 1024.0;

    if (bytes >= GB)
        return QString::number(bytes / GB, 'f', 2) + " GB";
    else if (bytes >= MB)
        return QString::number(bytes / MB, 'f', 2) + " MB";
    else if (bytes >= KB)
        return QString::number(bytes / KB, 'f', 2) + " KB";
    else
        return QString::number(bytes) + " B";
}

// heap is allocated dynamically
// each root is assigned a chain of objects by linking through ref pointers (to simulate live objects)
// objects in a chain are linked sequentially (last is nullptr) (simple linked list structure)
void Algorithm::benchmarkCheneyCG(size_t iterNum) {
    using Clock = std::chrono::high_resolution_clock;

    HeapConfig cfg;
    cfg.num_objects = 512; // total objects (would be around 512MB)
    cfg.num_roots = 256;           // multiple roots
    cfg.num_iterations = iterNum;       // number of benchmark iterations

    size_t total_heap_bytes = cfg.num_objects * sizeof(Object);
    double total_heap_mb = double(total_heap_bytes) / (1024.0 * 1024.0);
    qDebug() << "Estimated total heap size:" << total_heap_mb << "MB";
    qDebug() << "Semi-Space (Heap) Size: " << formatBytes(HEAP_BYTES);


    HeapBuilder builder(cfg);
    builder.build_heap_dynamic();

    auto& roots = builder.get_roots();

    std::vector<double> iteration_times_ms; // store times per iteration

    for (size_t iter = 0; iter < cfg.num_iterations; ++iter) {
        auto start = Clock::now();

        cheney_gc(roots.data(), roots.size());

        auto end = Clock::now();
        double elapsed_ms = std::chrono::duration<double, std::milli>(end - start).count();
        iteration_times_ms.push_back(elapsed_ms);

        double per_object_ns = elapsed_ms * 1e6 / cfg.num_objects; // ns per object

        qDebug() << "Iteration" << iter + 1 << ":"
                 << QString::number(elapsed_ms, 'f', 3) << "ms";
    }

    // Calculate mean execution time, skipping first if more than 1 iteration
    double sum_ms = 0;
    size_t count = cfg.num_iterations;
    size_t start_idx = 0;
    if (cfg.num_iterations > 1) {
        start_idx = 1; // skip first iteration (cold start)
        count -= 1;
    }

    for (size_t i = start_idx; i < iteration_times_ms.size(); ++i) {
        sum_ms += iteration_times_ms[i];
    }

    double mean_ms = sum_ms / count;
    qDebug() << "Mean execution time (excluding first iteration if applicable):"
             << QString::number(mean_ms, 'f', 3) << "ms";

    // Reset heap for potential next run
    delete[] from_space;
    delete[] to_space;
    from_space = new unsigned char[HEAP_BYTES];
    to_space   = new unsigned char[HEAP_BYTES];
    hp = from_space;
}









