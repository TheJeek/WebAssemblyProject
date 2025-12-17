#include "manorboyoptimized.h"
#include <QDebug>
#include <iostream>
#include <memory>
#ifdef __EMSCRIPTEN__
#include <emscripten/stack.h>
#endif
#ifdef _WIN32
#include <windows.h>
#endif

static uintptr_t prevStackAddr = 0;
static bool firstCall = true;

using std::shared_ptr;
using std::enable_shared_from_this;

static int currentDepth = 0;
static int maxDepth = 0;
static int maxReachedDepth = 0;
static uintptr_t maxFreeBytes = 2086096;

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
    virtual int run() = 0;
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
        return A(--k, shared_from_this(), x1, x2, x3, x4);
    }
};

class Const : public Arg {
private:
    const int x;
public:
    Const(int _x) : x(_x) { }
    int run () { return x; }
};

int A(int k, shared_ptr<Arg> x1, shared_ptr<Arg> x2, shared_ptr<Arg> x3,
      shared_ptr<Arg> x4, shared_ptr<Arg> x5) {
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

ManOrBoyOptimized::ManOrBoyOptimized(QObject *parent)
    : QObject{parent}
{}

int ManOrBoyOptimized::singleTest(int k) {
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
        emit testResult(k, result, maxDepth, before, maxFreeBytes, ((before-maxFreeBytes)/maxDepth), execTimeStr, "Native");
    #endif
    #ifdef __EMSCRIPTEN__
        emit testResult(k, result, maxDepth, before, maxFreeBytes, ((before-maxFreeBytes)/maxDepth), execTimeStr, "WebAssembly");
    #endif
    /*
    qDebug() << "Stack Before:" << before;
    qDebug() << "Stack After:" << maxFreeBytes;
    qDebug() << "Average Byte Usage:" << (before-maxFreeBytes)/maxDepth;
    qDebug() << "Result for k =" << k << ": " << result;
    qDebug() << "Max recursion depth: " << maxDepth;
    qDebug() << "Execution time: " << elapsed.count() << " ms";
    */
    return result;
}

void ManOrBoyOptimized::incrementalTest(int n) {
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
