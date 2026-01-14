import {Home} from "./components/Home.tsx";
import {Link, Routes, Route} from "react-router-dom";
import {Button} from "./components/ui/button.tsx";
import { Toaster } from "@/components/ui/sonner";
import {QtTest} from "./components/WASMInterface/QtTest.tsx";
import {FileUpload} from "./components/FileUpload/FileUpload.tsx";
import MapComponent from "@/components/Map/MapComponent.tsx";


function App() {
    return (
        <>
            <nav className="border-b bg-background text-card-foreground">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4" style={{width: "100vw" }}>
                        <Link to="/">
                            <Button>
                                Qt WebAssembly
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
                <Route path="/" element={<Home />} />
                <Route path="/html-test" element={<QtTest />} />
                <Route path={"/upload-download"} element={<FileUpload />} />
                <Route path="/map" element={<MapComponent />} />
            </Routes>
            <Toaster richColors />
        </>
    );
}

export default App;