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
                qDebug() << "MaxDepth: " << maxReachedDepth
                         << ", Approx stack frame: "
                         << (prevStackAddr > currentAddr ? prevStackAddr - currentAddr : currentAddr - prevStackAddr)
                         << " bytes";
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
        return result;
    }
    QElapsedTimer timer;
    timer.start();

    for (int i = 0; i <= n; i++) {
        fibIter(i);
        qint64 duration = timer.nsecsElapsed(); // μs (nanoseconds)
        QVariantMap dataPoint;
        dataPoint.insert("index", QVariant::fromValue(i));
        //dataPoint.insert("value", QVariant::fromValue(static_cast<double>(value)));
        dataPoint.insert("duration", QVariant::fromValue(static_cast<double>(duration)));

        result.append(dataPoint);


    }
    qDebug() << result.size();
    timer.invalidate();
    return result;
}

QVariantList Algorithm::computeSeriesRecursive(int n)
{
    int maxDepth = 0;
    maxFreeBytes = 2086096;
    printStackSize();
    QVariantList result;
    if (n > 92) {
        return result;
    }
    QElapsedTimer timer;
    timer.start();

    for (int i = 0; i <= n; i++) {
        callCount = 0;
        fibRec(i, 1, maxDepth);
        qint64 duration = timer.nsecsElapsed(); // μs (nanoseconds)
        QVariantMap dataPoint;
        dataPoint.insert("index", QVariant::fromValue(i));
        dataPoint.insert("duration", QVariant::fromValue(static_cast<double>(duration)));
        dataPoint.insert("callCount", QVariant::fromValue(callCount));

        //dataPoint.insert("value", QVariant::fromValue(static_cast<double>(value)));
        result.append(dataPoint);
    }
    size_t frameSize = sizeof(FibStackFrame);
    size_t estimatedStackUsage = frameSize * maxDepth;

    qDebug() << "Frame Size: " << frameSize;
    qDebug() << "Estimated Stack Usage: " << estimatedStackUsage;
    timer.invalidate();
    return result;
}

bool Algorithm::isPrime(int n) {
    if (n < 2) return false;
    for (int i = 2; i*i <= n; i++)
        if (n % i == 0) return false;
    return true;
}

uint64_t Algorithm::factorial(int n) {
    uint64_t f = 1;
    for (int i=2; i<=n; i++) f *= i;
    return f;
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


int loop(int xy) {
    DepthGuard guard;
    if (xy <= 0) return 1;
    return loop(xy-1) + 1;
}


int Algorithm::singleTest(int k) {
    callCount = 0;
    currentDepth = 0;
    maxDepth = 0;
    maxReachedDepth = 0;
    maxFreeBytes = 2086096;
    printStackSize();
    using clock = std::chrono::high_resolution_clock;

    auto before = printStackFreeBytes();
    auto start = clock::now();

    auto result = A(k,
                    std::make_shared<Const>(1),
                    std::make_shared<Const>(-1),
                    std::make_shared<Const>(-1),
                    std::make_shared<Const>(1),
                    std::make_shared<Const>(0));

    auto end = clock::now();
    std::chrono::duration<double, std::milli> elapsed = end - start;

    QString execTimeStr = QString::number(elapsed.count(), 'f', 3);
#ifdef _WIN32
    emit testResult(k, result, maxDepth, before, maxFreeBytes, ((before-maxFreeBytes)/maxDepth), execTimeStr, "Native", callCount);
#endif
#ifdef __EMSCRIPTEN__
    emit testResult(k, result, maxDepth, before, maxFreeBytes, ((before-maxFreeBytes)/maxDepth), execTimeStr, "WebAssembly", callCount);
#endif
    /*
    qDebug() << "Stack Before:" << before;
    qDebug() << "Stack After:" << maxFreeBytes;
    qDebug() << "Average Byte Usage:" << (before-maxFreeBytes)/maxDepth;
    qDebug() << "Result for k =" << k << ": " << result;
    qDebug() << "Max recursion depth: " << maxDepth;
    qDebug() << "Execution time: " << elapsed.count() << " ms";
    */
    qDebug() << "Call Count: " << callCount;
    return result;
}

void Algorithm::incrementalTest(int n) {
    for (int k = 1; k <= n; ++k)
    {
        try
        {
            singleTest(k);
        }
        catch (...)
        {
            qDebug() << "Failure at k=" << k;
            break;
        }
    }
    emit testFinished();
}


vector<int> sieve(int64_t n) {
    vector<bool> prime(n + 1, true);
    for (int64_t p = 2; p * p <= n; p++) {
        if (prime[p]) {
            for (int64_t i = p * p; i <= n; i += p)
                prime[i] = false;
        }
    }

    vector<int> res;
    for (int64_t p = 2; p <= n; p++) {
        if (prime[p])
            res.push_back((int)p);
    }
    return res;
}

//Sieve of Eratosthenes
void Algorithm::runSieve(int n) {
    /*vector<int> res = sieve(n);
    int count = 0;
    for(auto ele : res){
        //qDebug() << ele << ' ';
        ++count;
    }
    qDebug() << count;
    */
    // Memory test (large arrays, shuffle+copy)
    // forces reads and writes so -O3 won't work
    int64_t N = 1'000'000'000;
    std::vector<int> a(N, 1), b(N, 2);
    for (size_t i = 0; i < N; ++i) {
        b[i] = a[i] * 2;
    }
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
size_t HEAP_BYTES = 512ULL * 1024 * 1024; // 512 MB
#else
size_t HEAP_BYTES = 2ULL * 1024 * 1024 * 1024; // 8 GB for native
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
    size_t num_iterations;   // how many times to run GC for timing
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


// heap is allocated dynamically
// each root is assigned a chain of objects by linking through ref pointers (to simulate live objects)
// objects in a chain are linked sequentially (last is nullptr) (simple linked list structure)
void Algorithm::benchmarkCheneyCG(size_t objNum, size_t rootNum, size_t iterNum) {
    using Clock = std::chrono::high_resolution_clock;

    HeapConfig cfg;
    cfg.num_objects = 33554432; // total objects
    //cfg.num_objects = HEAP_BYTES / sizeof(Object) / 2;
    cfg.num_roots = 256;           // multiple roots
    cfg.num_iterations = 10;       // number of benchmark iterations

    qDebug() << "Number of objects:" << cfg.num_objects;
    qDebug() << "Number of roots:" << cfg.num_roots;
    qDebug() << "Size of one Object (bytes):" << sizeof(Object);

    size_t total_heap_bytes = cfg.num_objects * sizeof(Object);
    double total_heap_mb = double(total_heap_bytes) / (1024.0 * 1024.0);
    qDebug() << "Estimated total heap size:" << total_heap_mb << "MB";

    HeapBuilder builder(cfg);
    builder.build_heap_dynamic();

    auto& roots = builder.get_roots();

    for (size_t iter = 0; iter < cfg.num_iterations; ++iter) {
        auto start = Clock::now();

        cheney_gc(roots.data(), roots.size());

        auto end = Clock::now();

        double elapsed_ms = std::chrono::duration<double, std::milli>(end - start).count();
        double elapsed_ns = elapsed_ms * 1e6;  // convert ms -> ns

        // Average time per object
        double per_object_ns = elapsed_ns / cfg.num_objects;

        qDebug() << "Iteration" << iter + 1 << ":"
                 << QString::number(elapsed_ms, 'f', 3) << "ms"
                 << "(" << QString::number(per_object_ns, 'f', 2) << "ns/object)";
    }

    delete[] from_space;
    delete[] to_space;
}








