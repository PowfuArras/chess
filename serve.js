const express = require("express");
const app = express();
const port = process.env.PORT ?? 3002;

app.use(express.static("./public"));
app.listen(port, () => console.log(`Express listening on port ${port}!`));

/*console.clear();

class FEN {
    static fileLetters = "abcdefgh".split("");
    static parsePlacement(piecePlacement) {
        const board = [];
        const ranks = piecePlacement.split("/");
        for (let i = 0; i < 8; i++) {
            const rank = ranks[i];
            if (rank === "8") {
                board.push(0, 0, 0, 0, 0, 0, 0, 0);
                continue;
            }
            const pieces = rank.split("");
            for (let j = 0; j < 8; j++) {
                switch (pieces[j]) {
                    case "p": board.push(1); break;
                    case "n": board.push(2); break;
                    case "b": board.push(3); break;
                    case "r": board.push(4); break;
                    case "q": board.push(5); break;
                    case "k": board.push(6); break;

                    case "P": board.push(9); break;
                    case "N": board.push(10); break;
                    case "B": board.push(11); break;
                    case "R": board.push(12); break;
                    case "Q": board.push(13); break;
                    case "K": board.push(14); break;

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

    static parseCastlingAbility(castlingAbility) {
        if (castlingAbility === "-") return 0;
        let bits = 0;
        const abilities = castlingAbility.split("");
        for (let i = 0; i < abilities.length; i++) {
            switch (abilities[i]) {
                case "K": bits |= 1; break;
                case "Q": bits |= 2; break;
                case "k": bits |= 4; break;
                case "q": bits |= 8; break;
            }
        }
        return bits;
    }

    static parseEPSquare(epsquare) {
        if (epsquare === "-") return -1;
        return this.fileLetters.indexOf(epsquare[0]) + parseInt(epsquare[1]) * 8;
    }

    static parse(fen) {
        const fields = fen.split(" ");
        return {
            placement: this.parsePlacement(fields[0]),
            isLightTurn: fields[1] === "w",
            epsquare: this.parseEPSquare(fields[2]),
            halfMovesIncrementer: parseInt(fields[3]),
            fullMoves: parseInt(fields[4])
        }
    }
}

class ChessMatch {
    constructor(fen) {
        const fenData = FEN.parse(fen);
        this.board = fenData.placement;
        this.isLightTurn = fenData.isLightTurn;
        this.epsquare = fenData.epsquare;
        this.halfMovesIncrementer = fenData.halfMovesIncrementer;
        this.fullMoves = fenData.fullMoves;
    }
}

const match = new ChessMatch("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");*/