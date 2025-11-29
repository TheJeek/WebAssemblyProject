import React, {useState, useRef, useEffect} from "react";
import {MapContainer, TileLayer, Marker, Polyline, useMapEvents, Popup} from "react-leaflet";
import L, {type LatLngExpression } from "leaflet";
import {Button} from "@/components/ui/button.tsx";
import {useQtModule} from "@/components/useQtModule.ts";

type Path = LatLngExpression[];

const MapComponent: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const hasInitialized = useRef(false);
    const qtModuleHook = useQtModule();
    const [toggleDelete, setToggleDelete] = useState(false);

    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;
        const script = document.createElement("script");
        script.src = "/map/TSMProject.js";
        script.async = true;

        script.onload = () => {
            const qtEntry = (window as any).TSMProject_entry;
            if (!qtEntry) {
                console.error("TSMProject_entry not found!");
                return;
            }

            // Create Module object
            const Module: any = {};
            // Provide the container for Qt windows
            Module.qtContainerElements = [containerRef.current];

            // So Qt can find WASM/data files (in public folder)
            Module.locateFile = (path: string) => `/map/${path}`;

            // Callback when WASM runtime is ready
            Module.onRuntimeInitialized = () => {
                console.log("Qt WASM initialized");
                qtModuleHook.setupCallbacks(Module);
                qtModuleHook.onMessageFromQt((msg) => {
                    console.log("Message from Qt:", msg);
                })
            };

            // Initialize Qt
            qtEntry(Module);
        };

        document.body.appendChild(script);

        return () => {
            //Cleanup scripts on unmount
            document.body.removeChild(script);

            //Cleanup container to remove old Qt canvas
            if (containerRef.current) {
                containerRef.current.innerHTML = "";
            }
        };
    }, []);



    const [markers, setMarkers] = useState<LatLngExpression[]>([]);

    const [nearestNeighborPath, setNNPath] = useState<Path>([]);
    const [nearestNeighborLine, setNNLine] = useState<Path | null>(null);

    const [mstPath, setMSTPath] = useState<Path>([]);
    const [mstLine, setMSTLine] = useState<Path | null>(null);

    const [minimumSpanningTreePathList, setMSTList] = useState<Path[]>([]);
    const [mapLinesMST, setMapLinesMST] = useState<Path[]>([]);

    const [bruteForcePath, setBFPath] = useState<Path>([]);
    const [bruteForceLine, setBFLine] = useState<Path | null>(null);

    const [optimizedNNPath, setOptNNPath] = useState<Path>([]);
    const [optimizedNNLine, setOptNNLine] = useState<Path | null>(null);

    const [optimizedMSTPath, setOptMSTPath] = useState<Path>([]);
    const [optimizedMSTLine, setOptMSTLine] = useState<Path | null>(null);

    const [dpPath, setDPPath] = useState<Path>([]);
    const [dpLine, setDPLine] = useState<Path | null>(null);

    const [center, setCenterState] = useState<LatLngExpression>([48.8377, 10.0744]);

    // Colors
    const colorNN = "#05bd02";
    const colorOptimizedNN = "green";
    const colorMST = "red";
    const colorMSTPath = "#2cb2f5";
    const colorOptimizedMSTPath = "#2557fa";
    const colorBF = "black";
    const colorDP = "orange";

    const addMarker = (lat: number, lon: number) =>
        setMarkers(prev => [...prev, [lat, lon]]);


    const addPointToNNPath = (lat: number, lon: number) =>
        setNNPath(prev => [...prev, [lat, lon]]);

    const addPointToMSTPath = (lat: number, lon: number) =>
        setMSTPath(prev => [...prev, [lat, lon]]);

    const addPointToBruteForcePath = (lat: number, lon: number) =>
        setBFPath(prev => [...prev, [lat, lon]]);

    const addPointToOptimizedNNPath = (lat: number, lon: number) =>
        setOptNNPath(prev => [...prev, [lat, lon]]);

    const addPointToOptimizedMSTPath = (lat: number, lon: number) =>
        setOptMSTPath(prev => [...prev, [lat, lon]]);

    const addPointToDPPath = (lat: number, lon: number) =>
        setDPPath(prev => [...prev, [lat, lon]]);



    const clearNNPath = () => {
        setNNPath([]);
        setNNLine(null);
    };
    const clearMSTPath = () => {
        setMSTPath([]);
        setMSTLine(null);
    };
    const clearBruteForcePath = () => {
        setBFPath([]);
        setBFLine(null);
    };
    const clearOptimizedNN = () => {
        setOptNNPath([]);
        setOptNNLine(null);
    };
    const clearOptimizedMST = () => {
        setOptMSTPath([]);
        setOptMSTLine(null);
    };
    const clearDPPath = () => {
        setDPPath([]);
        setDPLine(null);
    };
    const clearMarkers = () => setMarkers([]);


    function addNNExample() {
        clearNNPath()
        addPointToNNPath(40,10);
        addPointToNNPath(41,12);
        addPointToNNPath(42,11);
        addPointToNNPath(40,10);
        addMarker(40, 10);
        addMarker(41, 12);
        addMarker(42, 11);
    }
    function addNNExample2() {
        clearNNPath()
        addPointToNNPath(47,10);
        addPointToNNPath(48,12);
        addPointToNNPath(49,11);
    }

    // Nearest Neighbor
    useEffect(() => {
        if (nearestNeighborPath.length > 0) {
            setNNLine(nearestNeighborPath);
        } else {
            setNNLine(null);
        }
    }, [nearestNeighborPath]);

    // MST Path
    useEffect(() => {
        if (mstPath.length > 0) {
            setMSTLine(mstPath);
        } else {
            setMSTLine(null);
        }
    }, [mstPath]);

    // Brute Force Path
    useEffect(() => {
        if (bruteForcePath.length > 0) {
            setBFLine(bruteForcePath);
        } else {
            setBFLine(null);
        }
    }, [bruteForcePath]);

    // Optimized Nearest Neighbor
    useEffect(() => {
        if (optimizedNNPath.length > 0) {
            setOptNNLine(optimizedNNPath);
        } else {
            setOptNNLine(null);
        }
    }, [optimizedNNPath]);

    // Optimized MST
    useEffect(() => {
        if (optimizedMSTPath.length > 0) {
            setOptMSTLine(optimizedMSTPath);
        } else {
            setOptMSTLine(null);
        }
    }, [optimizedMSTPath]);

    // DP Path
    useEffect(() => {
        if (dpPath.length > 0) {
            setDPLine(dpPath);
        } else {
            setDPLine(null);
        }
    }, [dpPath]);

    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;

                if (!toggleDelete) {
                    // Add marker
                    setMarkers((prev) => [...prev, [lat, lng]]);
                    // tspAlgorithm.addCoordinate(lat, lng); // <-- future C++ function here (coords saved in tspAlgorithm)
                    console.log("Added marker at", lat, lng);
                } else {
                    // Delete closest marker
                    let minDistance = Infinity;
                    let closestIndex = -1;
                    markers.forEach((m, i) => {
                        const dist = Math.sqrt(Math.pow(m[0] - lat, 2) + Math.pow(m[1] - lng, 2));
                        if (dist < minDistance) {
                            minDistance = dist;
                            closestIndex = i;
                        }
                    });

                    if (closestIndex !== -1) {
                        const removed = markers[closestIndex];
                        setMarkers((prev) => prev.filter((_, i) => i !== closestIndex));
                        // tspAlgorithm.removeCoordinate(removed[0], removed[1]); // <-- C++ call
                        console.log("Removed marker at", removed);
                    }
                }
            }
        });
        return null;
    };

    qtModuleHook.onMarkerFromQt((lat, lon) => {
        addMarker(lat, lon);
    })

    return (
        <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
            <Button onClick={addNNExample}>
                DO NN
            </Button>
            {/* Left: Leaflet map */}
            <div style={{
                height: "100%",
                width: "70%",
                margin: "auto",
                borderRadius: 12,
                boxShadow: "0 0 10px rgba(0,0,0,0.2)",
                display: "flex",
            }}>
                <MapContainer center={center} zoom={14} style={{ flex: 1, width: "100%" }}>
                    <TileLayer
                        url="https://tile.openstreetmap.de/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                        crossOrigin={true}
                    />
                    <MapClickHandler />

                    {/* Render all markers */}
                    {markers.map((pos, i) => (
                        <Marker key={i} position={pos}>
                            <Popup>Marker {i + 1}</Popup>
                        </Marker>
                    ))}


                    {nearestNeighborLine && <Polyline positions={nearestNeighborLine} color={colorNN} />}
                    {mstLine && <Polyline positions={mstLine} color={colorMSTPath} />}
                    {mapLinesMST.map((line, i) => <Polyline key={`mstline-${i}`} positions={line} color={colorMST} />)}
                    {bruteForceLine && <Polyline positions={bruteForceLine} color={colorBF} />}
                    {optimizedNNLine && <Polyline positions={optimizedNNLine} color={colorOptimizedNN} />}
                    {optimizedMSTLine && <Polyline positions={optimizedMSTLine} color={colorOptimizedMSTPath} />}
                    {dpLine && <Polyline positions={dpLine} color={colorDP} />}
                </MapContainer>
            </div>

            {/* Right: Qt WASM container */}
            <div
                ref={containerRef}
                id="qt-container"
                style={{
                    width: "20vw",
                    height: "100%",
                    border: "1px solid blue",
                    margin: "auto",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: "hidden",
                    backgroundColor: "#000",
                }}
            />
        </div>
    );
};

export default MapComponent;
