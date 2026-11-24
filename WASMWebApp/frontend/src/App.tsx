/*
Author: Jonas Lanz
File: App.tsx
Defines Navbar with corresponding Links and Routes
*/
import {Link, Route, Routes, Navigate} from "react-router-dom";
import {Button} from "./components/ui/button.tsx";
import {Toaster} from "@/components/ui/sonner";
import {FileUpload} from "./components/FileUpload/FileUpload.tsx";
import TravelingSalesmanComponent from "@/components/Map/TravelingSalesmanComponent.tsx";
import {WebAssemblyBenchmarkComponent} from "@/components/Benchmark/WebAssemblyBenchmarkComponent.tsx";


function App() {
    return (
        <>
            <nav className="border-b bg-background text-card-foreground">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4" style={{width: "100vw"}}>
                        <Link to="/">
                            <Button>
                                WASM Benchmark
                            </Button>
                        </Link>
                        <Link to="/map">
                            <Button>
                                Traveling Salesman
                            </Button>
                        </Link>
                        <Link to="/upload-download">
                            <Button>
                                Upload/Download
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>
            <Routes>
                <Route path="/" element={<WebAssemblyBenchmarkComponent/>}/>
                <Route path={"/upload-download"} element={<FileUpload/>}/>
                <Route path="/map" element={<TravelingSalesmanComponent/>}/>
            </Routes>
            <Toaster richColors/>
        </>
    );
}

export default App;
