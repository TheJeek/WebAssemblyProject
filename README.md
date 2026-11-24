# Qt WebAssembly Benchmark Project

This project demonstrates the compilation and deployment of Qt-based applications to WebAssembly (WASM) and compares
their performance against native desktop builds. The system includes a frontend, backend, and database to showcase
algorithmic benchmarks and integration with modern web architectures.

# Cloud:

- `https://jeek.abrdns.com/webassembly`

## Documentation:

Related Diagrams, Screenshots and configurations for the Cloud can be found in `/Documentation/`

- Web Application Screenshots
- System Diagrams (C4 Context Style made with PlantUML)
- Cloud related files and Security Groups

## Project Structure

### WASMWebApp (Web Application)

Folder: `/WASMWebApp`

- **Backend:**: Spring Boot REST API managing dynamic WASM module storage.
- **Frontend:**: React (Vite) frontend that loads and interacts with WASM modules including a Communication Interface
  for WASM Modules. Also interact with backend service through REST API
- **Docker Compose**: Defines Docker container images and networks for Frontend (local and production), Backend and
  PostgreSQL database.
- **Scripts**: Deployment scripts for local (`deploy-dev.sh`) and cloud (`deploy-prod.sh`) environments.

### WASMQt (Qt Project)

Folder: `/WASMQt`

- **Algorithms**: Algorithm.cpp/.h defining Algorithms in C++. Return and output collected metrics and results to User
  Interface.
- **Communication Interface**: Defines the bridge between Qt/C++ and the WebAssembly export layer.
- **Metrics**: Execution time, Memory usage, recursion depth, stack behaviour, deployment metadata.
- **QML**: User Interface to configure Algorithm parameters and visualize Algorithm results and characteristics.
- **Configuration**: Configures Stack Size for fair comparison of Native vs WebAssembly. Expose C++ functions to
  JavaScript via Emscripten bindings. Enables extra exported methods to be able to send String from JavaScript to
  Qt/C++.

### TSMProject (Qt Project)

Is located in a different Github repository, uses a separate `WebAssembly` branch which is adapted for WebAssembly
compilation.

## Deployment Overview

The project supports **local development** and **cloud deployment** using Docker and Docker Compose.
To be able to run the deployment scripts they need permission if the Repository was cloned:

- `chmod +x deploy-prod.sh`
- `chmox +x deploy-dev.sh`

### Prerequisites

- Docker & Docker Compose
- Java OpenJDK 24
- Maven (for backend build)
- Node.js / npm (for frontend development)

## Local Deployment

Start services with development frontend:

`./WASMWebApp/deploy-dev.sh`

using Docker Compose file: `./WASMWebApp/docker-compose.yml`

- Uses `WASMWebApp/frontend/Dockerfile.dev` file to build and run Frontend container image.
- Frontend pointing to the local backend using API URL: `VITE_API_URL=http://localhost:8080`.
- Frontend uses Nginx for the Vite build server using `WASMWebApp/frontend/nginx.conf`.
- Backend JAR is precompiled outside Docker for faster iteration and then builds and runs container image using
  `WASMWebApp/backend/Dockerfile`
- Frontend builds inside its container for reproducibility.

## Cloud Deployment

Start services with production frontend using:

`./WASMWebApp/deploy-prod.sh`

using Docker Compose file: `./WASMWebApp/docker-compose.yml`

- Uses `WASMWebApp/frontend/Dockerfile` file to build and run Frontend container image.
- Frontend pointing to the cloud backend using API URL: `VITE_API_URL=https://hsaalenwasmprojectjl.abrdns.com`.
- Backend compiled externally and is then deployed in container using `WASMWebApp/backend/Dockerfile`.
- PostgreSQL runs in a separate container and is declared in Docker Compose file.
- Docker Compose handles networking.
- Served behind an Nginx reverse proxy for HTTPS and path routing, using config file in
  `Documentation/bwCloud/nginx.conf`.
- Cross-Origin Isolation configured to allow multithreaded WASM modules with `SharedArrayBuffer`.
    - `add_header Cross-Origin-Opener-Policy same-origin always;`
    - `add_header Cross-Origin-Embedder-Policy require-corp always;`

## WebAssembly Modules

!!! IMPORTANT !!!

- The WebAssembly are not bundled into the Web Application and have to be uploaded dynamically as ZIP files.
- WebAssembly Benchmark Project `WASMQt` is built for single-threaded execution, and can slow/freeze the browser UI
  during Algorithm execution
- Traveling Salesman Project `TSMProject` is built for multi-threaded execution, and should not freeze the browser UI
  during Algorithm execution unless unpredictable parameters are set or browser limitations are reached.

---

- Compiled from Qt C++ applications using **Emscripten**.
- Modules are compressed with gzip and stored dynamically by the backend in the PostgreSQL database.
- Supports multithreaded execution for compute-intensive algorithms.
- Example algorithms:
    - Recursive Fibonacci
    - Man-or-Boy Test
    - Modified Cheney Garbage Collection using byte-wise swapping of Semi-Spaces
    - Traveling Salesman Problem (Brute Force & Dynamic Programming Approach)

## Running Benchmarks

Benchmarks evaluate algorithm performance in both native and WASM builds:

- **Recursive Fibonacci**: Tests function call overhead.
- **Man-or-Boy Test**: Stresses recursion depth and stack usage.
- **Cheney Garbage Collection**: Illustrates WASM linear memory growth.
- **TSP (Brute Force & Dynamic Programming)**: Evaluates memory-intensive computation and multithreaded WASM
  performance.

## Notes

- WASM uses 32-bit architecture module, which means inherent memory allocation limit of 4GB but also limited to 2GB at
  the moment by browser limitations.
- Because of 32-bit pointer architecture some performance aspect increase because of better cache utilization.
- WASM linear memory grows but cannot shrink.
- Backend stores WASM modules as compressed `.zip` files for efficient delivery. (87.5% size decrease)
- Frontend decompresses modules dynamically before execution.  
