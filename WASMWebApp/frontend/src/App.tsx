import {Home} from "./components/Home.tsx";
import {Link, Routes, Route} from "react-router-dom";
import {Button} from "./components/ui/button.tsx";
import {QtTest} from "./components/WASMInterface/QtTest.tsx";
import {FileUpload} from "./components/FileUpload/FileUpload.tsx";


function App() {
    return (
        <>
            <nav className="border-b bg-background text-card-foreground">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                        <Link to="/">
                            <Button>
                                Canvas
                            </Button>
                        </Link>
                        <Link to="/html-test">
                            <Button>
                                IFrame
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
            </Routes>
        </>
    );
}

export default App;