        const tiles = document.getElementById("tiles");
        const solve = document.getElementById("solve");

        // Define some constants
        const N = 3; 
        const EMPTY = N * N; 
        const MOVES = [[-1, 0], [1, 0], [0, -1], [0, 1]]; 

        // Define some variables
        let state = [];
        let emptyIndex = -1; 
        let visited = new Set(); 
        let pq = []; 

        // Generate a random initial state
        function generateState() {
            let numbers = [...Array(N * N).keys()].map(x => x + 1); 
            let shuffled = []; 
            while (numbers.length > 0) {
                let index = Math.floor(Math.random() * numbers.length); 
                shuffled.push(numbers[index]); 
                numbers.splice(index, 1); 
            }
            return shuffled;
        }

        // Check if a state is solvable using inversion count
        function isSolvable(state) {
            let invCount = 0;
            for (let i = 0; i < N * N - 1; i++) { 
                for (let j = i + 1; j < N * N; j++) { 
                    if (state[i] != EMPTY && state[j] != EMPTY && state[i] > state[j]) { 
                        invCount++; 
                    }
                }
            }
            // Check if inversion count is even or odd
            if (N % 2 == 1) { 
                return invCount % 2 == 0; 
            } else { 
                let emptyRow = Math.floor(emptyIndex / N); 
                let bottomRow = N - 1; 
                return (invCount + bottomRow - emptyRow) % 2 == 0; 
            }
        }

        // Check if a state is the goal state
        function isGoal(state) {
            for (let i = 0; i < N * N - 1; i++) { 
                if (state[i] != i + 1) { 
                    return false; 
                }
            }
            return true;
        }

        // Render a state on the web page 5v 
        function renderState(state) {
            tiles.innerHTML = "";
            for (let i = 0; i < N * N; i++) { 
                let li = document.createElement("li");
                li.textContent = state[i] != EMPTY ? state[i] : ""; 
                li.classList.add(state[i] == EMPTY ? "empty" : "filled"); 
                tiles.appendChild(li);
            }
        }

        // Find the index of a tile in a state
        function findIndex(state, tile) {
            for (let i = 0; i < N * N; i++) { 
                if (state[i] == tile) {
                    return i; 
                }
            }
            return -1; // Return -1 if not found
        }

        // Swap two tiles in a state and return a new state
        function swap(state, i, j) {
            let newState = [...state]; 
            let temp = newState[i]; 
            newState[i] = newState[j]; 
            newState[j] = temp; 
            return newState; 
        }

        // Move a tile to the empty space and return a new state
        function move(state, tile) {
            let i = findIndex(state, tile);
            let j = findIndex(state, EMPTY); 
            return swap(state, i, j);
        }

        // Check if a move is valid based on the current state and the tile value
        function isValidMove(state, tile) {
            let i = findIndex(state, tile);
            let j = findIndex(state, EMPTY); 
            let rowDiff = Math.abs(Math.floor(i / N) - Math.floor(j / N));
            let colDiff = Math.abs(i % N - j % N); 
            return rowDiff + colDiff == 1;
        }
        // Generate the possible moves from a state and return an array of new states
        function generateMoves(state) {
            let moves = [];
            for (let i = 0; i < N * N; i++) { 
                if (isValidMove(state, i + 1)) { 
                    let newState = move(state, i + 1); 
                    moves.push(newState);
                }
            }
            return moves; 
        }

        function evaluate(state, moves) {
            let cost = moves; 
            for (let i = 0; i < N * N - 1; i++) { 
                if (state[i] != i + 1) { 
                    cost++; 
                }
            }
            return cost; 
        }

        // Create a node with state, moves and evaluation function value
        function createNode(state, moves) {
            return {
                state: state,
                moves: moves,
                f: evaluate(state, moves)
            };
        }

        // Insert a node into the priority queue based on function value
        function insert(pq, node) {
            let i = 0;
            while (i < pq.length && pq[i].f <= node.f) { 
                i++; 
            }
            pq.splice(i, 0, node); 
        }

        // Delete and return the first node from the priority queue
        function deleteMin(pq) {
            return pq.shift(); 
        }

        // Check if a state is already visited or in the priority queue
        function isVisited(state) {
            let key = state.join(","); 
            return visited.has(key);
        }

        // Mark a state as visited and add it to the visited set
        function markVisited(state) {
            let key = state.join(","); 
            visited.add(key); 
        }

        function bestFirstSearch(initial) {
            pq = []; 
            visited = new Set(); 
            let start = createNode(initial, 0); 
            insert(pq, start);
            while (pq.length > 0) { 
                let node = deleteMin(pq); 
                if (isGoal(node.state)) {
                    return getPath(node); 
                }
                markVisited(node.state); 
                let moves = generateMoves(node.state); 
                for (let move of moves) { 
                    if (!isVisited(move)) {
                        let child = createNode(move, node.moves + 1);
                        child.parent = node;
                        insert(pq, child); 
                    }
                }
            }
            return null; 
        }

        function getPath(node) {
            let path = []; 
            while (node) { 
                path.push(node.state); 
                node = node.parent; 
            }
            return path.reverse();
      }

        // Add event listeners to the tiles and the solve button
        function addListeners() {
            tiles.addEventListener("click", function (e) {
                if (e.target.tagName == "LI") {
                    let tile = parseInt(e.target.textContent); 
                    if (isValidMove(state, tile)) {
                        state = move(state, tile);
                        renderState(state); 
                    }
                }
            });

            document.addEventListener("keydown", function (e) { 
                let tile = -1; 
                switch (e.code) { 
                    case "ArrowUp": 
                        tile = state[emptyIndex + N]; 
                        break;
                    case "ArrowDown": 
                        tile = state[emptyIndex - N];
                        break;
                    case "ArrowLeft": 
                        tile = state[emptyIndex + 1]; 
                        break;
                    case "ArrowRight":
                        tile = state[emptyIndex - 1];
                        break;
                }
                if (tile > 0 && isValidMove(state, tile)) { 
                    state = move(state, tile); 
                    renderState(state);
                }
            });

            solve.addEventListener("click", function () { 
                let solution = bestFirstSearch(state);  
                if (solution) { 
                    let i = 0; 
                    let interval = setInterval(function () { 
                        renderState(solution[i]); 
                        i++; 
                        if (i == solution.length) { 
                            clearInterval(interval); 
                        }
                    }, 500); 
                } else {
                    alert("No solution exists for this state!"); 
                }
            });
        }

        // Initialize the game
        function init() {
            do {
                state = generateState();
                emptyIndex = findIndex(state, EMPTY);
            } while (!isSolvable(state)); 
            renderState(state); 
            addListeners(); 
        }

        init(); 
        function refreshPage() {
        location.reload();
      }