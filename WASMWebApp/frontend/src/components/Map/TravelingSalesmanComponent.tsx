import React, {useState, useRef, useEffect} from "react";
import {MapContainer, TileLayer, Marker, Polyline, useMapEvents, Popup} from "react-leaflet";
import L, {type LatLngExpression } from "leaflet";
import {Button} from "@/components/ui/button.tsx";
import {useTravelingSalesmanModule} from "@/components/Map/useTravelingSalesmanModule.ts";
import {createFileURLs, extractZip, fetchMapZip} from "@/api/fileApi.ts";

type Path = LatLngExpression[];

const TravelingSalesmanComponent: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const qtModuleHook = useTravelingSalesmanModule();
    let [toggleDelete, setToggleDelete] = useState(false);
    let qtModule: any = null;

    useEffect(() => {
        let urls: Record<string, string> = {};
        let script: HTMLScriptElement | null = null;

        async function initMap() {
            const zipBlob = await fetchMapZip();
            const files = await extractZip(zipBlob);
            urls = createFileURLs(files);

            // Load JS from extracted zip
            script = document.createElement("script");
            script.src = urls["TSMProject.js"];
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

                // Locate files in the virtual zip (instead of public folder)
                Module.locateFile = (path: string) => urls[path] || path;

                // Callback when WASM runtime is ready
                Module.onRuntimeInitialized = () => {
                    qtModule = Module;
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
        }

        initMap();

        return () => {
            if (qtModule?.quit) {
                qtModule.quit();
            }
            qtModule = null;

            if (script) {
                document.body.removeChild(script);
                script = null;
            }

            if (containerRef.current) {
                containerRef.current.innerHTML = "";
                containerRef.current = null;
            }

            Object.values(urls).forEach(URL.revokeObjectURL);
            urls = {};
        };
    }, []);





    const [markers, setMarkers] = useState<LatLngExpression[]>([]);

    const [nearestNeighborPath, setNNPath] = useState<Path>([]);
    const [nearestNeighborLine, setNNLine] = useState<Path | null>(null);

    const [mstPath, setMSTPath] = useState<Path>([]);
    const [mstLine, setMSTLine] = useState<Path | null>(null);

    const [mstTrailList, setMSTList] = useState<Path[]>([]);
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

    //[...prev, [lat, lon]] is a react pattern
    //[...prev] => copy of old array/state
    //[...prev, [lat, lon]] adds new on top
    const addMarker = (lat: number, lon: number) =>
        setMarkers(prev => [...prev, [lat, lon]]);


    const addPointToNNPath = (lat: number, lon: number) =>
        setNNPath(prev => [...prev, [lat, lon]]);

    const addPointToMSTPath = (lat: number, lon: number) =>
        setMSTPath(prev => [...prev, [lat, lon]]);

    const addPointToBFPath = (lat: number, lon: number) =>
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
    const clearBFPath = () => {
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


    const addTrailToMST = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const newTrail: Path = [
            [lat1, lon1],
            [lat2, lon2]
        ];
        setMSTList(prev => [...prev, newTrail]);
    };

    const clearMST = () => setMSTList([]);

    // Nearest Neighbor
    useEffect(() => {
        if (nearestNeighborPath.length > 0) {
            setNNLine(nearestNeighborPath);
        } else {
            setNNLine(null);
        }
    }, [nearestNeighborPath]);

    useEffect(() => {
        if (mstTrailList.length > 0) {
            setMapLinesMST(mstTrailList);
            console.log("MST updated:", mapLinesMST);
        }
        else {
            setMapLinesMST([]);
        }
    }, [mstTrailList]);

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
                    qtModuleHook.addCoordinateToQt(lat, lng);
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
                        qtModuleHook.removeCoordinateToQt(removed[0], removed[1]);
                        console.log("Removed marker at", removed);
                    }
                }
            }
        });
        return null;
    };

    qtModuleHook.onToggleDeleteFromQt( () => {
        console.log("JS: toggleDelete")
        setToggleDelete(!toggleDelete);
    })

    qtModuleHook.onClearMarkersFromQt( () => {
        console.log("JS: clearMarkers");
        setMarkers([]);
    })

    qtModuleHook.onAddMarkerFromQt((lat, lon) => {
        addMarker(lat, lon);
    })

    qtModuleHook.onClearNNPathFromQt(() => {
        console.log("JS: clearNNPath")
        clearNNPath()
    })

    qtModuleHook.onAddPointToNNPathFromQt((lat, lon) => {
        console.log("JS: addPointToNNPath", lat, lon)
        addPointToNNPath(lat, lon);
    })

    qtModuleHook.onClearOptimizedNNFromQt(() => {
        console.log("JS: clearOptimizedNNPath")
        clearOptimizedNN()
    })

    qtModuleHook.onAddPointToOptimizedNNPathFromQt((lat, lon) => {
        console.log("JS: addPointToOptimizedNNPath", lat, lon)
        addPointToOptimizedNNPath(lat, lon);
    })

    qtModuleHook.onClearMSTPathFromQt(() => {
        console.log("JS: clearMSTPath")
        clearMSTPath();
    })

    qtModuleHook.onAddPointToMSTPathFromQt((lat, lon) => {
        console.log("JS: addPointToMSTPath", lat, lon)
        addPointToMSTPath(lat, lon);
    })

    qtModuleHook.onClearOptimizedMSTPathFromQt(() => {
        console.log("JS: clearOptimizedMSTPath")
        clearOptimizedMST();
    })

    qtModuleHook.onAddPointToOptimizedMSTPathFromQt((lat, lon) => {
        console.log("JS: addPointToOptimizedMSTPath", lat, lon)
        addPointToOptimizedMSTPath(lat, lon);
    })

    qtModuleHook.onClearBFPathFromQt(() => {
        console.log("JS: clearBFPath")
        clearBFPath();
    })

    qtModuleHook.onAddPointToBFPathFromQt((lat, lon) => {
        console.log("JS: addPointToBFPath", lat, lon)
        addPointToBFPath(lat, lon);
    })

    qtModuleHook.onClearDPPathFromQt(() => {
        console.log("JS: clearDPPath")
        clearDPPath();
    })

    qtModuleHook.onAddPointToDPPathFromQt((lat, lon) => {
        console.log("JS: addPointToDPPath", lat, lon)
        addPointToDPPath(lat, lon);
    })

    qtModuleHook.onClearMSTFromQt(() => {
        console.log("JS: clearMST")
        clearMST();
    })

    qtModuleHook.onAddTrailToMSTFromQt((lat1, lon1, lat2, lon2) => {
        console.log("JS: addTrailToMST", lat1, lon1, lat2, lon2)
        addTrailToMST(lat1, lon1, lat2, lon2);
    })


    return (
        <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
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
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
                    {bruteForceLine && <Polyline positions={bruteForceLine} color={colorBF} />}
                    {optimizedNNLine && <Polyline positions={optimizedNNLine} color={colorOptimizedNN} />}
                    {optimizedMSTLine && <Polyline positions={optimizedMSTLine} color={colorOptimizedMSTPath} />}
                    {dpLine && <Polyline positions={dpLine} color={colorDP} />}
                    {mapLinesMST.map((line, i) => <Polyline key={`mstline-${i}`} positions={line} color={colorMST} />)}
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

export default TravelingSalesmanComponent;
