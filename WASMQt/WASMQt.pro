QT       += charts core gui qml quick

greaterThan(QT_MAJOR_VERSION, 4): QT += widgets quickwidgets core quickcontrols2 concurrent

CONFIG += c++20 wasm

# The following define makes your compiler emit warnings if you use
# any Qt feature that has been marked deprecated (the exact warnings
# depend on your compiler). Please consult the documentation of the
# deprecated API in order to know how to port your code away from it.

QMAKE_CXXFLAGS_RELEASE += -O3
QMAKE_CFLAGS_RELEASE += -O3

SOURCES += \
    communicationbridge.cpp \
    fibonacci.cpp \
    main.cpp

HEADERS += \
    communicationbridge.h \
    fibonacci.h

FORMS +=

RESOURCES += \
    qml.qrc

# Default rules for deployment.
qnx: target.path = /tmp/$${TARGET}/bin
else: unix:!android: target.path = /opt/$${TARGET}/bin
!isEmpty(target.path): INSTALLS += target

# Config file location: Qt\6.10.0\wasm_multithread\mkspecs\features\wasm\wasm.prf
contains(QMAKE_CXX, em++) {
    message("Building for Emscripten / WASM")
    QT_WASM_EXTRA_EXPORTED_METHODS = ccall,cwrap,stringToUTF8,lengthBytesUTF8
    QMAKE_LFLAGS += -sEXPORTED_FUNCTIONS=_main,_malloc,_free
}
