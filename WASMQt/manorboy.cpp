#include "manorboy.h"
#include <functional>
#include <chrono>
#include <QDebug>
using namespace std;

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

static int currentDepth = 0;
static int maxDepth = 0;

typedef std::function<int()> F;

//Recursion depth control (k)
static int A(int k, const F &x1, const F &x2, const F &x3, const F &x4, const F &x5)
{
    currentDepth++;
    maxDepth = std::max(maxDepth, currentDepth);
    F B = [=, &k, &B]
    {
        return A(--k, B, x1, x2, x3, x4);
    };
    int result = (k <= 0) ? x4() + x5() : B();

    currentDepth--;
    return result;
}

//Define F as callable object (delayed evaluation/ call-by-name)
static F L(int n)
{
    return [n] { return n; };
}

int testDepth(int k) {
    maxDepth = currentDepth = 0;
    return A(k, L(1), L(-1), L(-1), L(1), L(0));
}

ManOrBoy::ManOrBoy(QObject *parent)
    : QObject(parent)
{}

void ManOrBoy::incrementalTest() {
    for (int k = 1; k <= 10; ++k)
    {
        try
        {
            int result = testDepth(k);
            emit testResult(k, result, maxDepth);
            qDebug() << "k=" << k
                      << " result=" << result
                     << " maxDepth=" << maxDepth;
        }
        catch (...)
        {
            qDebug() << "Failure at k=" << k;
            break;
        }
    }
    emit testFinished();
}

void ManOrBoy::singleTest(int k) {
    using clock = std::chrono::high_resolution_clock;

    auto start = clock::now();

    int result = A(k, L(1), L(-1), L(-1), L(1), L(0));

    auto end = clock::now();
    std::chrono::duration<double, std::milli> elapsed = end - start;

    emit testResult(k, result, maxDepth);
    qDebug() << "Result: " << result;
    qDebug() << "Max recursion depth: " << maxDepth;
    qDebug() << "Execution time: " << elapsed.count() << " ms";
}

