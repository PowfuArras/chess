// Forsyth-Edwards Notation
class FEN {
    static parsePlacement(field) {
        const placement = [];
        for (const rank of field.split("/")) {
            if (rank === "8") {
                placement.push(0, 0, 0, 0, 0, 0, 0, 0);
                continue;
            }
            for (const piece of rank.split("")) {
                switch (piece) {
                    case "P": placement.push(0b0_001); break;
                    case "N": placement.push(0b0_010); break;
                    case "B": placement.push(0b0_011); break;
                    case "R": placement.push(0b0_100); break;
                    case "Q": placement.push(0b0_101); break;
                    case "K": placement.push(0b0_110); break;

                    case "p": placement.push(0b1_001); break;
                    case "n": placement.push(0b1_010); break;
                    case "b": placement.push(0b1_011); break;
                    case "r": placement.push(0b1_100); break;
                    case "q": placement.push(0b1_101); break;
                    case "k": placement.push(0b1_110); break;

                    case "1": placement.push(0); break;
                    case "2": placement.push(0, 0); break;
                    case "3": placement.push(0, 0, 0); break;
                    case "4": placement.push(0, 0, 0, 0); break;
                    case "5": placement.push(0, 0, 0, 0, 0); break;
                    case "6": placement.push(0, 0, 0, 0, 0, 0); break;
                    case "7": placement.push(0, 0, 0, 0, 0, 0, 0); break;
                }
            }
        }
        return new Uint8Array(placement);
    }

    static parseTurn(field) {
        return field === "w";
    }

    static parseCastlingAbility(field) {
        let abilities = 0;
        for (const ability of field.split("")) {
            switch (ability) {
                case "K": abilities |= 0b0001; break;
                case "Q": abilities |= 0b0010; break;
                case "k": abilities |= 0b0100; break;
                case "q": abilities |= 0b1000; break;
            }
        }
        return abilities;
    }

    static parseEnPassantSquare(field) {
        if (field === "-") return null;
        let squareIndex = parseInt(field[1]) * 8;
        switch (field[0]) {
            case "a": squareIndex += 0; break;
            case "b": squareIndex += 1; break;
            case "c": squareIndex += 2; break;
            case "d": squareIndex += 3; break;
            case "e": squareIndex += 4; break;
            case "f": squareIndex += 5; break;
            case "g": squareIndex += 6; break;
            case "h": squareIndex += 7; break;
        }
        return squareIndex;
    }

    static parseMoves(field) {
        return parseInt(field);
    }

    static parse(fen) {
        const fields = fen.split(" ");
        return {
            placement: this.parsePlacement(fields[0]),
            isWhiteTurn: this.parseTurn(fields[1]),
            castlingAbility: this.parseCastlingAbility(fields[2]),
            enPassantSquareIndex: this.parseEnPassantSquare(fields[3]),
            halfMovesClock: this.parseMoves(fields[4]),
            fullMoves: this.parseMoves(fields[5])
        }
    }
}

class Move {
    static directionOffsets = [8, -8, -1, 1, 7, -7, 9, -9];
    static movesToEdgeCache = [];
    static generateMovesToEdge() {
        for (let file = 0; file < 8; file++) {
            for (let rank = 0; rank < 8; rank++) {
                const data = new Uint8Array(8);
                data[0] = 7 - file;
                data[1] = file;
                data[2] = rank;
                data[3] = 7 - rank;
                data[4] = Math.min(data[0], data[2]);
                data[5] = Math.min(data[1], data[3]);
                data[6] = Math.min(data[0], data[3]);
                data[7] = Math.min(data[1], data[2]);
                this.movesToEdgeCache[file * 8 + rank] = data;
            }
        }   
    }

    constructor(startIndex, targetIndex) {
        this.startIndex = startIndex;
        this.targetIndex = targetIndex;
    }
}

Move.generateMovesToEdge();

class Chess {
    constructor(fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1") {
        const fields = FEN.parse(fen);
        this.board = fields.placement;
        this.isWhiteTurn = fields.isWhiteTurn;
        this.castlingAbility = fields.castlingAbility;
        this.enPassantSquareIndex = fields.enPassantSquareIndex;
        this.halfMoves = fields.halfMovesClock;
        this.fullMoves = fields.fullMoves;

        this.recentMove = null;
    }

    generateMovesFor(startIndex, moves = []) {
        const startSquare = this.board[startIndex]; 
        if (startSquare === 0) return [];
        const startColor = startSquare >> 3;
        if (startColor === (this.isWhiteTurn ? 0b1 : 0b0)) return [];
        const startPiece = startSquare & 0b111;
        switch (startPiece) {
            case 0b001: break;
            case 0b010: break;
            case 0b110: {
                for (let i = 0; i < 8; i++) {
                    if (Move.movesToEdgeCache[startIndex][i] === 0) continue;
                    const targetIndex = startIndex + Move.directionOffsets[i];
                    const targetSquare = this.board[targetIndex];
                    if (targetSquare !== 0 && (targetSquare >> 3) === startColor) continue;
                    moves.push(new Move(startIndex, targetIndex));
                }
            }; break;
            default: {
                for (let i = startPiece === 0b011 ? 4 : 0, iEnd = startPiece === 0b100 ? 4 : 8; i < iEnd; i++) {
                    for (let j = 0, jEnd = Move.movesToEdgeCache[startIndex][i]; j < jEnd; j++) {
                        const targetIndex = startIndex + Move.directionOffsets[i] * (j + 1);
                        const targetSquare = this.board[targetIndex];
                        if (targetSquare !== 0 && (targetSquare >> 3) === startColor) break;
                        moves.push(new Move(startIndex, targetIndex));
                        if (targetSquare !== 0) break;
                    }
                }
            };
        }   
    }

    generateMoves() {
        const moves = [];
        for (let i = 0; i < 64; i++) this.generateMovesFor(i, moves);
        return moves;
    }

    doMove(move) {
        this.recentMove = move;
        this.board[move.targetIndex] = this.board[move.startIndex];
        this.board[move.startIndex] = 0;
        this.isWhiteTurn = !this.isWhiteTurn;
    }
}

const match = new Chess("r1bqkb1r/8/8/8/8/8/8/R1BQKB1R w KQkq - 0 1");//, "8/6R1/8/2Q5/6K1/8/1B3k2/8 w - - 0 1");

const canvasElement = document.body.appendChild(document.createElement("canvas"));
const squareSize = Math.floor(Math.min(innerWidth, innerHeight) / 8) + 1;
canvasElement.width = squareSize * 8;
canvasElement.height = squareSize * 8;
const ctx = canvasElement.getContext("2d", { alpha: false });

class Pieceset {
    static cache = new Map();
    static drawImage(square, x, y, width, height) {
        if (square === 0) return;
        if (!this.cache.has(square)) {
            const entry = { loaded: false, image: document.createElement("img") };
            entry.image.src = `/assets/pieces/${["p","n","b","r","q","k"][(square & 0b111) - 1]}${["w","b"][square >> 3]}.png`;
            entry.image.onload = () => entry.loaded = true;
            this.cache.set(square, entry);
        }
        const entry = this.cache.get(square);
        if (!entry.loaded) return;
        ctx.drawImage(entry.image, x, y, width, height);
    }
}

const hexColors = [...new Array(64)].map(_ => "#" + `${((1 << 24) * Math.random() | 0).toString(16)}`.padStart(6, "0")).sort(() => 0.5 - Math.random());

function animationFrame() {
    const moves = match.generateMoves();
    requestAnimationFrame(animationFrame);
    for (let i = 0; i < 64; i++) {
        const rank = Math.floor(i / 8);
        const file = i % 8;
        ctx.fillStyle = (rank + file) % 2 ? "#757575" : "#A5A5A5";
        ctx.fillRect(file * squareSize, rank * squareSize, squareSize, squareSize);
        if (match.recentMove !== null && (match.recentMove.startIndex === i || match.recentMove.targetIndex === i)) {
            ctx.fillStyle = (rank + file) % 2 ? "#00A500" : "#00D500";
            ctx.fillRect(file * squareSize, rank * squareSize, squareSize, squareSize);
        }
    }

    for (let i = 0; i < 64; i++) {
        const rank = Math.floor(i / 8);
        const file = i % 8;
        const square = match.board[i];
        Pieceset.drawImage(square, file * squareSize, rank * squareSize, squareSize, squareSize);
    }

    ctx.lineWidth = squareSize / 10;
    if (document.getElementById("move-lines-option").checked) for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        ctx.strokeStyle = hexColors[move.startIndex % hexColors.length];
        ctx.beginPath();
        ctx.moveTo((move.startIndex % 8) * squareSize + squareSize * 0.5, Math.floor(move.startIndex / 8) * squareSize + squareSize * 0.5);
        ctx.lineTo((move.targetIndex % 8) * squareSize + squareSize * 0.5, Math.floor(move.targetIndex / 8) * squareSize + squareSize * 0.5);
        ctx.stroke();
    }
}
animationFrame();

setInterval(() => {
    console.time("Generate Moves");
    const moves = match.generateMoves();
    console.timeEnd("Generate Moves");
    const move = moves[Math.floor(moves.length * Math.random())];
    if (!move) return;
    match.doMove(move);
}, 1000);