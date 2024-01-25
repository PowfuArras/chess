const FileLetters = ["a", "b", "c", "d", "e", "f", "g", "h"];
const PieceLetters = ["p", "n", "b", "r", "q", "k"];
const ColorLetters = ["w", "b"];

class Piece {
    static White = 0b01;
    static Black = 0b10;

    static Pawn = 0b000;
    static Knight = 0b001;
    static Bishop = 0b010;
    static Rook = 0b011;
    static Queen = 0b100;
    static King = 0b101;
    static create(side, type) {
        return (side << 3) | type;
    }
    static getType(piece) {
        return piece & 0b111;
    }
    static getColor(piece) {
        return (piece >> 3) & 0b11;
    }
}

class FEN {
    static parse(data) {
        const fields = data.split(" ");
        return {
            placement: this.parsePiecePlacement(fields[0]),
            isWhiteTurn: fields[1] === "w",
            castlingAbility: this.parseCastlingAbility(fields[2]),
            enPassantSquare: this.parseEnPassantSquare(fields[3]),
            halfMovesClock: parseInt(fields[4]),
            fullMoves: parseInt(fields[5])
        }
    }
    static parsePiecePlacement(data) {
        const board = [];
        for (const rank of data.split("/")) {
            if (rank === "8") {
                board.push(0, 0, 0, 0, 0, 0, 0, 0);
                continue;
            }
            for (const piece of rank.split("")) {
                switch (piece) {
                    case "P": board.push(Piece.create(Piece.White, Piece.Pawn)); break;
                    case "N": board.push(Piece.create(Piece.White, Piece.Knight)); break;
                    case "B": board.push(Piece.create(Piece.White, Piece.Bishop)); break;
                    case "R": board.push(Piece.create(Piece.White, Piece.Rook)); break;
                    case "Q": board.push(Piece.create(Piece.White, Piece.Queen)); break;
                    case "K": board.push(Piece.create(Piece.White, Piece.King)); break;

                    case "p": board.push(Piece.create(Piece.Black, Piece.Pawn)); break;
                    case "n": board.push(Piece.create(Piece.Black, Piece.Knight)); break;
                    case "b": board.push(Piece.create(Piece.Black, Piece.Bishop)); break;
                    case "r": board.push(Piece.create(Piece.Black, Piece.Rook)); break;
                    case "q": board.push(Piece.create(Piece.Black, Piece.Queen)); break;
                    case "k": board.push(Piece.create(Piece.Black, Piece.King)); break;

                    case "1": board.push(0); break;
                    case "2": board.push(0, 0); break;
                    case "3": board.push(0, 0, 0); break;
                    case "4": board.push(0, 0, 0, 0); break;
                    case "5": board.push(0, 0, 0, 0, 0); break;
                    case "6": board.push(0, 0, 0, 0, 0, 0); break;
                    case "7": board.push(0, 0, 0, 0, 0, 0, 0); break;
                }
            }
        }
        return new Uint8Array(board);
    }
    static parseCastlingAbility(data) {
        if (data === "-") return 0;
        let bits = 0;
        for (const ability of data.split("")) {
            switch (ability) {
                case "K": bits |= 0b0001; break;
                case "Q": bits |= 0b0010; break;
                case "k": bits |= 0b0100; break;
                case "q": bits |= 0b1000; break;
            }
        }
        return bits;
    }
    static parseEnPassantSquare(data) {
        if (data === "-") return -1;
        return FileLetters.indexOf(data[0]) + parseInt(data[1]) * 8;
    }
}

class Match {
    constructor(position = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1") {
        const data = FEN.parse(position);
        this.board = data.placement;
        this.isWhiteTurn = data.isWhiteTurn;
        this.castlingAbility = data.castlingAbility;
        this.enPassantSquare = data.enPassantSquare;
        this.halfMovesIncrementer = data.halfMovesClock;
        this.fullMoves = data.fullMoves;
    }
}

const match = new Match();

const squareSize = Math.floor(Math.min(innerWidth, innerHeight) * 0.8 / 8);
const canvasElement = document.body.appendChild(document.createElement("canvas"));
canvasElement.oncontextmenu = () => false;
canvasElement.width = squareSize * 8;
canvasElement.height = squareSize * 8;

const ctx = canvasElement.getContext("2d", { alpha: false });
ctx.imageSmoothingEnabled = true;

class Pieceset {
    static entries = new Map();
    static drawImage(piece, x, y, width, height) {
        if (!this.entries.has(piece)) {
            const entry = { image: document.createElement("img"), loaded: false };
            entry.image.onload = () => entry.loaded = true;
            entry.image.src = `/assets/pieces/${PieceLetters[Piece.getType(piece)]}${ColorLetters[Piece.getColor(piece) - 1]}.png`;
            this.entries.set(piece, entry);
            return;
        }
        const entry = this.entries.get(piece);
        if (!entry.loaded) return;
        ctx.drawImage(entry.image, x, y, width, height);
    }
}

class Control {
    static mouseX = 0;
    static mouseY = 0;
    static hoveredIndex = 0;
    static mouseMoveEvent(event) {
        const offset = canvasElement.getBoundingClientRect();
        this.mouseX = event.clientX - offset.left;
        this.mouseY = event.clientY - offset.top;
        this.hoveredIndex = Math.max(0, Math.min(
            Math.floor(this.mouseX / canvasElement.width * 8) + Math.floor(this.mouseY / canvasElement.height * 8) * 8    
        , 63));
    }
    static clickEvent() {

    }
    static initiate() {
        canvasElement.addEventListener("mousemove", event => this.mouseMoveEvent(event));
        canvasElement.addEventListener("click", () => this.clickEvent());
    }
}

Control.initiate();

function animationFrame() {
    requestAnimationFrame(animationFrame);
    for (let i = 0; i < 64; i++) {
        const x = i % 8;
        const y = Math.floor(i / 8);
        const piece = match.board.at(i);
        ctx.fillStyle = (x + y) % 2 ? "#757575" : "#A5A5A5";
        ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
        if (Control.hoveredIndex === i) {
            ctx.fillStyle = "#FFFFFF";
            ctx.globalAlpha = 0.5;
            ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
            ctx.globalAlpha = 1;
        }
        if (piece !== 0) Pieceset.drawImage(piece, x * squareSize, y * squareSize, squareSize, squareSize);
    }
}
animationFrame();