import { MASK64, bash_rot, bash_rc } from "./const.js";

const _ROTHI_ = (x: bigint, y: bigint): bigint => ((x << y) | (x >> (64n - y))) & MASK64;
const ROTHI = (x: bigint, y: bigint): bigint => (y < 64n && y > 0n) ? _ROTHI_(x, y) : x;

/** `bash-s` algorithm */
export const BASHS = (S: BigUint64Array, i0: number, i1: number, i2: number, m1: bigint, n1: bigint, m2: bigint, n2: bigint): void => {
    let T0, T1, T2: bigint;

    T0 = ROTHI(S[i0], m1);
    S[i0] = S[i0] ^ S[i1] ^ S[i2];
    T1 = S[i1] ^ ROTHI(S[i0], n1);
    S[i1] = T0 ^ T1;
    S[i2] = S[i2] ^ ROTHI(S[i2], m2) ^ ROTHI(T1, n2);
    T0 = S[i2] ^ MASK64;
    T1 = S[i0] | S[i2];
    T2 = S[i0] & S[i1];
    T0 = T0 | S[i1];
    S[i1] = S[i1] ^ T1;
    S[i2] = S[i2] ^ T2;
    S[i0] = S[i0] ^ T0;
}

const BASH_PERMUTE = (S: BigUint64Array) => {
    const S_ = new BigUint64Array(S);
    S[0] = S_[15]; S[1] = S_[10]; S[2] = S_[9]; S[3] = S_[12]; S[4] = S_[11]; S[5] = S_[14];
    S[6] = S_[13]; S[7] = S_[8]; S[8] = S_[17]; S[9] = S_[16]; S[10] = S_[19]; S[11] = S_[18];
    S[12] = S_[21]; S[13] = S_[20]; S[14] = S_[23]; S[15] = S_[22]; S[16] = S_[6]; S[17] = S_[3];
    S[18] = S_[0]; S[19] = S_[5]; S[20] = S_[2]; S[21] = S_[7]; S[22] = S_[4]; S[23] = S_[1];
}

const SWAP64 = (A: bigint) => {
    return (
        (A << 56n) | ((A & 0xff00n) << 40n) | ((A & 0xff0000n) << 24n) | ((A & 0xff000000n) << 8n) |
        ((A >> 8n) & 0xff000000n) | ((A >> 24n) & 0xff0000n) | ((A >> 40n) & 0xff00n) | (A >> 56n)
    ) & MASK64;
}

/** `bash-f` sponge function */
export const BASHF = (S: BigUint64Array, bigend: boolean): void => {
    /*if (bigend) {
        for (let i = 0; i < 24; i++) S[i] = SWAP64(S[i]);
    }

    for (let round = 0; round < 24; round++) {
        for (let v = 0; v < 8; v++) BASHS(
            S, v, v + 8, v + 16,
            BigInt(bash_rot[v][0]), BigInt(bash_rot[v][1]), BigInt(bash_rot[v][2]), BigInt(bash_rot[v][3])
        );

        BASH_PERMUTE(S);
        S[23] = S[23] ^ bash_rc[round];
    }

    if (bigend) {
        for (let i = 0; i < 24; i++) S[i] = SWAP64(S[i]);
    }*/
    if (bigend) {
        S[0] = SWAP64(S[0]); S[1] = SWAP64(S[1]); S[2] = SWAP64(S[2]); S[3] = SWAP64(S[3]);
        S[4] = SWAP64(S[4]); S[5] = SWAP64(S[5]); S[6] = SWAP64(S[6]); S[7] = SWAP64(S[7]);
        S[8] = SWAP64(S[8]); S[9] = SWAP64(S[9]); S[10] = SWAP64(S[10]); S[11] = SWAP64(S[11]);
        S[12] = SWAP64(S[12]); S[13] = SWAP64(S[13]); S[14] = SWAP64(S[14]); S[15] = SWAP64(S[15]);
        S[16] = SWAP64(S[16]); S[17] = SWAP64(S[17]); S[18] = SWAP64(S[18]); S[19] = SWAP64(S[19]);
        S[20] = SWAP64(S[20]); S[21] = SWAP64(S[21]); S[22] = SWAP64(S[22]); S[23] = SWAP64(S[23]);
    }

    // Round 0
    BASHS(S, 0, 8, 16, BigInt(bash_rot[0][0]), BigInt(bash_rot[0][1]), BigInt(bash_rot[0][2]), BigInt(bash_rot[0][3]));
    BASHS(S, 1, 9, 17, BigInt(bash_rot[1][0]), BigInt(bash_rot[1][1]), BigInt(bash_rot[1][2]), BigInt(bash_rot[1][3]));
    BASHS(S, 2, 10, 18, BigInt(bash_rot[2][0]), BigInt(bash_rot[2][1]), BigInt(bash_rot[2][2]), BigInt(bash_rot[2][3]));
    BASHS(S, 3, 11, 19, BigInt(bash_rot[3][0]), BigInt(bash_rot[3][1]), BigInt(bash_rot[3][2]), BigInt(bash_rot[3][3]));
    BASHS(S, 4, 12, 20, BigInt(bash_rot[4][0]), BigInt(bash_rot[4][1]), BigInt(bash_rot[4][2]), BigInt(bash_rot[4][3]));
    BASHS(S, 5, 13, 21, BigInt(bash_rot[5][0]), BigInt(bash_rot[5][1]), BigInt(bash_rot[5][2]), BigInt(bash_rot[5][3]));
    BASHS(S, 6, 14, 22, BigInt(bash_rot[6][0]), BigInt(bash_rot[6][1]), BigInt(bash_rot[6][2]), BigInt(bash_rot[6][3]));
    BASHS(S, 7, 15, 23, BigInt(bash_rot[7][0]), BigInt(bash_rot[7][1]), BigInt(bash_rot[7][2]), BigInt(bash_rot[7][3]));
    BASH_PERMUTE(S);
    S[23] ^= bash_rc[0];

    // Round 1
    BASHS(S, 0, 8, 16, BigInt(bash_rot[0][0]), BigInt(bash_rot[0][1]), BigInt(bash_rot[0][2]), BigInt(bash_rot[0][3]));
    BASHS(S, 1, 9, 17, BigInt(bash_rot[1][0]), BigInt(bash_rot[1][1]), BigInt(bash_rot[1][2]), BigInt(bash_rot[1][3]));
    BASHS(S, 2, 10, 18, BigInt(bash_rot[2][0]), BigInt(bash_rot[2][1]), BigInt(bash_rot[2][2]), BigInt(bash_rot[2][3]));
    BASHS(S, 3, 11, 19, BigInt(bash_rot[3][0]), BigInt(bash_rot[3][1]), BigInt(bash_rot[3][2]), BigInt(bash_rot[3][3]));
    BASHS(S, 4, 12, 20, BigInt(bash_rot[4][0]), BigInt(bash_rot[4][1]), BigInt(bash_rot[4][2]), BigInt(bash_rot[4][3]));
    BASHS(S, 5, 13, 21, BigInt(bash_rot[5][0]), BigInt(bash_rot[5][1]), BigInt(bash_rot[5][2]), BigInt(bash_rot[5][3]));
    BASHS(S, 6, 14, 22, BigInt(bash_rot[6][0]), BigInt(bash_rot[6][1]), BigInt(bash_rot[6][2]), BigInt(bash_rot[6][3]));
    BASHS(S, 7, 15, 23, BigInt(bash_rot[7][0]), BigInt(bash_rot[7][1]), BigInt(bash_rot[7][2]), BigInt(bash_rot[7][3]));
    BASH_PERMUTE(S);
    S[23] ^= bash_rc[1];

    // Round 2
    BASHS(S, 0, 8, 16, BigInt(bash_rot[0][0]), BigInt(bash_rot[0][1]), BigInt(bash_rot[0][2]), BigInt(bash_rot[0][3]));
    BASHS(S, 1, 9, 17, BigInt(bash_rot[1][0]), BigInt(bash_rot[1][1]), BigInt(bash_rot[1][2]), BigInt(bash_rot[1][3]));
    BASHS(S, 2, 10, 18, BigInt(bash_rot[2][0]), BigInt(bash_rot[2][1]), BigInt(bash_rot[2][2]), BigInt(bash_rot[2][3]));
    BASHS(S, 3, 11, 19, BigInt(bash_rot[3][0]), BigInt(bash_rot[3][1]), BigInt(bash_rot[3][2]), BigInt(bash_rot[3][3]));
    BASHS(S, 4, 12, 20, BigInt(bash_rot[4][0]), BigInt(bash_rot[4][1]), BigInt(bash_rot[4][2]), BigInt(bash_rot[4][3]));
    BASHS(S, 5, 13, 21, BigInt(bash_rot[5][0]), BigInt(bash_rot[5][1]), BigInt(bash_rot[5][2]), BigInt(bash_rot[5][3]));
    BASHS(S, 6, 14, 22, BigInt(bash_rot[6][0]), BigInt(bash_rot[6][1]), BigInt(bash_rot[6][2]), BigInt(bash_rot[6][3]));
    BASHS(S, 7, 15, 23, BigInt(bash_rot[7][0]), BigInt(bash_rot[7][1]), BigInt(bash_rot[7][2]), BigInt(bash_rot[7][3]));
    BASH_PERMUTE(S);
    S[23] ^= bash_rc[2];

    // Round 3
    BASHS(S, 0, 8, 16, BigInt(bash_rot[0][0]), BigInt(bash_rot[0][1]), BigInt(bash_rot[0][2]), BigInt(bash_rot[0][3]));
    BASHS(S, 1, 9, 17, BigInt(bash_rot[1][0]), BigInt(bash_rot[1][1]), BigInt(bash_rot[1][2]), BigInt(bash_rot[1][3]));
    BASHS(S, 2, 10, 18, BigInt(bash_rot[2][0]), BigInt(bash_rot[2][1]), BigInt(bash_rot[2][2]), BigInt(bash_rot[2][3]));
    BASHS(S, 3, 11, 19, BigInt(bash_rot[3][0]), BigInt(bash_rot[3][1]), BigInt(bash_rot[3][2]), BigInt(bash_rot[3][3]));
    BASHS(S, 4, 12, 20, BigInt(bash_rot[4][0]), BigInt(bash_rot[4][1]), BigInt(bash_rot[4][2]), BigInt(bash_rot[4][3]));
    BASHS(S, 5, 13, 21, BigInt(bash_rot[5][0]), BigInt(bash_rot[5][1]), BigInt(bash_rot[5][2]), BigInt(bash_rot[5][3]));
    BASHS(S, 6, 14, 22, BigInt(bash_rot[6][0]), BigInt(bash_rot[6][1]), BigInt(bash_rot[6][2]), BigInt(bash_rot[6][3]));
    BASHS(S, 7, 15, 23, BigInt(bash_rot[7][0]), BigInt(bash_rot[7][1]), BigInt(bash_rot[7][2]), BigInt(bash_rot[7][3]));
    BASH_PERMUTE(S);
    S[23] ^= bash_rc[3];

    // Round 4
    BASHS(S, 0, 8, 16, BigInt(bash_rot[0][0]), BigInt(bash_rot[0][1]), BigInt(bash_rot[0][2]), BigInt(bash_rot[0][3]));
    BASHS(S, 1, 9, 17, BigInt(bash_rot[1][0]), BigInt(bash_rot[1][1]), BigInt(bash_rot[1][2]), BigInt(bash_rot[1][3]));
    BASHS(S, 2, 10, 18, BigInt(bash_rot[2][0]), BigInt(bash_rot[2][1]), BigInt(bash_rot[2][2]), BigInt(bash_rot[2][3]));
    BASHS(S, 3, 11, 19, BigInt(bash_rot[3][0]), BigInt(bash_rot[3][1]), BigInt(bash_rot[3][2]), BigInt(bash_rot[3][3]));
    BASHS(S, 4, 12, 20, BigInt(bash_rot[4][0]), BigInt(bash_rot[4][1]), BigInt(bash_rot[4][2]), BigInt(bash_rot[4][3]));
    BASHS(S, 5, 13, 21, BigInt(bash_rot[5][0]), BigInt(bash_rot[5][1]), BigInt(bash_rot[5][2]), BigInt(bash_rot[5][3]));
    BASHS(S, 6, 14, 22, BigInt(bash_rot[6][0]), BigInt(bash_rot[6][1]), BigInt(bash_rot[6][2]), BigInt(bash_rot[6][3]));
    BASHS(S, 7, 15, 23, BigInt(bash_rot[7][0]), BigInt(bash_rot[7][1]), BigInt(bash_rot[7][2]), BigInt(bash_rot[7][3]));
    BASH_PERMUTE(S);
    S[23] ^= bash_rc[4];

    // Round 5
    BASHS(S, 0, 8, 16, BigInt(bash_rot[0][0]), BigInt(bash_rot[0][1]), BigInt(bash_rot[0][2]), BigInt(bash_rot[0][3]));
    BASHS(S, 1, 9, 17, BigInt(bash_rot[1][0]), BigInt(bash_rot[1][1]), BigInt(bash_rot[1][2]), BigInt(bash_rot[1][3]));
    BASHS(S, 2, 10, 18, BigInt(bash_rot[2][0]), BigInt(bash_rot[2][1]), BigInt(bash_rot[2][2]), BigInt(bash_rot[2][3]));
    BASHS(S, 3, 11, 19, BigInt(bash_rot[3][0]), BigInt(bash_rot[3][1]), BigInt(bash_rot[3][2]), BigInt(bash_rot[3][3]));
    BASHS(S, 4, 12, 20, BigInt(bash_rot[4][0]), BigInt(bash_rot[4][1]), BigInt(bash_rot[4][2]), BigInt(bash_rot[4][3]));
    BASHS(S, 5, 13, 21, BigInt(bash_rot[5][0]), BigInt(bash_rot[5][1]), BigInt(bash_rot[5][2]), BigInt(bash_rot[5][3]));
    BASHS(S, 6, 14, 22, BigInt(bash_rot[6][0]), BigInt(bash_rot[6][1]), BigInt(bash_rot[6][2]), BigInt(bash_rot[6][3]));
    BASHS(S, 7, 15, 23, BigInt(bash_rot[7][0]), BigInt(bash_rot[7][1]), BigInt(bash_rot[7][2]), BigInt(bash_rot[7][3]));
    BASH_PERMUTE(S);
    S[23] ^= bash_rc[5];

    // Round 6
    BASHS(S, 0, 8, 16, BigInt(bash_rot[0][0]), BigInt(bash_rot[0][1]), BigInt(bash_rot[0][2]), BigInt(bash_rot[0][3]));
    BASHS(S, 1, 9, 17, BigInt(bash_rot[1][0]), BigInt(bash_rot[1][1]), BigInt(bash_rot[1][2]), BigInt(bash_rot[1][3]));
    BASHS(S, 2, 10, 18, BigInt(bash_rot[2][0]), BigInt(bash_rot[2][1]), BigInt(bash_rot[2][2]), BigInt(bash_rot[2][3]));
    BASHS(S, 3, 11, 19, BigInt(bash_rot[3][0]), BigInt(bash_rot[3][1]), BigInt(bash_rot[3][2]), BigInt(bash_rot[3][3]));
    BASHS(S, 4, 12, 20, BigInt(bash_rot[4][0]), BigInt(bash_rot[4][1]), BigInt(bash_rot[4][2]), BigInt(bash_rot[4][3]));
    BASHS(S, 5, 13, 21, BigInt(bash_rot[5][0]), BigInt(bash_rot[5][1]), BigInt(bash_rot[5][2]), BigInt(bash_rot[5][3]));
    BASHS(S, 6, 14, 22, BigInt(bash_rot[6][0]), BigInt(bash_rot[6][1]), BigInt(bash_rot[6][2]), BigInt(bash_rot[6][3]));
    BASHS(S, 7, 15, 23, BigInt(bash_rot[7][0]), BigInt(bash_rot[7][1]), BigInt(bash_rot[7][2]), BigInt(bash_rot[7][3]));
    BASH_PERMUTE(S);
    S[23] ^= bash_rc[6];

    // Round 7
    BASHS(S, 0, 8, 16, BigInt(bash_rot[0][0]), BigInt(bash_rot[0][1]), BigInt(bash_rot[0][2]), BigInt(bash_rot[0][3]));
    BASHS(S, 1, 9, 17, BigInt(bash_rot[1][0]), BigInt(bash_rot[1][1]), BigInt(bash_rot[1][2]), BigInt(bash_rot[1][3]));
    BASHS(S, 2, 10, 18, BigInt(bash_rot[2][0]), BigInt(bash_rot[2][1]), BigInt(bash_rot[2][2]), BigInt(bash_rot[2][3]));
    BASHS(S, 3, 11, 19, BigInt(bash_rot[3][0]), BigInt(bash_rot[3][1]), BigInt(bash_rot[3][2]), BigInt(bash_rot[3][3]));
    BASHS(S, 4, 12, 20, BigInt(bash_rot[4][0]), BigInt(bash_rot[4][1]), BigInt(bash_rot[4][2]), BigInt(bash_rot[4][3]));
    BASHS(S, 5, 13, 21, BigInt(bash_rot[5][0]), BigInt(bash_rot[5][1]), BigInt(bash_rot[5][2]), BigInt(bash_rot[5][3]));
    BASHS(S, 6, 14, 22, BigInt(bash_rot[6][0]), BigInt(bash_rot[6][1]), BigInt(bash_rot[6][2]), BigInt(bash_rot[6][3]));
    BASHS(S, 7, 15, 23, BigInt(bash_rot[7][0]), BigInt(bash_rot[7][1]), BigInt(bash_rot[7][2]), BigInt(bash_rot[7][3]));
    BASH_PERMUTE(S);
    S[23] ^= bash_rc[7];

    // Round 8
    BASHS(S, 0, 8, 16, BigInt(bash_rot[0][0]), BigInt(bash_rot[0][1]), BigInt(bash_rot[0][2]), BigInt(bash_rot[0][3]));
    BASHS(S, 1, 9, 17, BigInt(bash_rot[1][0]), BigInt(bash_rot[1][1]), BigInt(bash_rot[1][2]), BigInt(bash_rot[1][3]));
    BASHS(S, 2, 10, 18, BigInt(bash_rot[2][0]), BigInt(bash_rot[2][1]), BigInt(bash_rot[2][2]), BigInt(bash_rot[2][3]));
    BASHS(S, 3, 11, 19, BigInt(bash_rot[3][0]), BigInt(bash_rot[3][1]), BigInt(bash_rot[3][2]), BigInt(bash_rot[3][3]));
    BASHS(S, 4, 12, 20, BigInt(bash_rot[4][0]), BigInt(bash_rot[4][1]), BigInt(bash_rot[4][2]), BigInt(bash_rot[4][3]));
    BASHS(S, 5, 13, 21, BigInt(bash_rot[5][0]), BigInt(bash_rot[5][1]), BigInt(bash_rot[5][2]), BigInt(bash_rot[5][3]));
    BASHS(S, 6, 14, 22, BigInt(bash_rot[6][0]), BigInt(bash_rot[6][1]), BigInt(bash_rot[6][2]), BigInt(bash_rot[6][3]));
    BASHS(S, 7, 15, 23, BigInt(bash_rot[7][0]), BigInt(bash_rot[7][1]), BigInt(bash_rot[7][2]), BigInt(bash_rot[7][3]));
    BASH_PERMUTE(S);
    S[23] ^= bash_rc[8];

    // Round 9
    BASHS(S, 0, 8, 16, BigInt(bash_rot[0][0]), BigInt(bash_rot[0][1]), BigInt(bash_rot[0][2]), BigInt(bash_rot[0][3]));
    BASHS(S, 1, 9, 17, BigInt(bash_rot[1][0]), BigInt(bash_rot[1][1]), BigInt(bash_rot[1][2]), BigInt(bash_rot[1][3]));
    BASHS(S, 2, 10, 18, BigInt(bash_rot[2][0]), BigInt(bash_rot[2][1]), BigInt(bash_rot[2][2]), BigInt(bash_rot[2][3]));
    BASHS(S, 3, 11, 19, BigInt(bash_rot[3][0]), BigInt(bash_rot[3][1]), BigInt(bash_rot[3][2]), BigInt(bash_rot[3][3]));
    BASHS(S, 4, 12, 20, BigInt(bash_rot[4][0]), BigInt(bash_rot[4][1]), BigInt(bash_rot[4][2]), BigInt(bash_rot[4][3]));
    BASHS(S, 5, 13, 21, BigInt(bash_rot[5][0]), BigInt(bash_rot[5][1]), BigInt(bash_rot[5][2]), BigInt(bash_rot[5][3]));
    BASHS(S, 6, 14, 22, BigInt(bash_rot[6][0]), BigInt(bash_rot[6][1]), BigInt(bash_rot[6][2]), BigInt(bash_rot[6][3]));
    BASHS(S, 7, 15, 23, BigInt(bash_rot[7][0]), BigInt(bash_rot[7][1]), BigInt(bash_rot[7][2]), BigInt(bash_rot[7][3]));
    BASH_PERMUTE(S);
    S[23] ^= bash_rc[9];

    // Round 10
    BASHS(S, 0, 8, 16, BigInt(bash_rot[0][0]), BigInt(bash_rot[0][1]), BigInt(bash_rot[0][2]), BigInt(bash_rot[0][3]));
    BASHS(S, 1, 9, 17, BigInt(bash_rot[1][0]), BigInt(bash_rot[1][1]), BigInt(bash_rot[1][2]), BigInt(bash_rot[1][3]));
    BASHS(S, 2, 10, 18, BigInt(bash_rot[2][0]), BigInt(bash_rot[2][1]), BigInt(bash_rot[2][2]), BigInt(bash_rot[2][3]));
    BASHS(S, 3, 11, 19, BigInt(bash_rot[3][0]), BigInt(bash_rot[3][1]), BigInt(bash_rot[3][2]), BigInt(bash_rot[3][3]));
    BASHS(S, 4, 12, 20, BigInt(bash_rot[4][0]), BigInt(bash_rot[4][1]), BigInt(bash_rot[4][2]), BigInt(bash_rot[4][3]));
    BASHS(S, 5, 13, 21, BigInt(bash_rot[5][0]), BigInt(bash_rot[5][1]), BigInt(bash_rot[5][2]), BigInt(bash_rot[5][3]));
    BASHS(S, 6, 14, 22, BigInt(bash_rot[6][0]), BigInt(bash_rot[6][1]), BigInt(bash_rot[6][2]), BigInt(bash_rot[6][3]));
    BASHS(S, 7, 15, 23, BigInt(bash_rot[7][0]), BigInt(bash_rot[7][1]), BigInt(bash_rot[7][2]), BigInt(bash_rot[7][3]));
    BASH_PERMUTE(S);
    S[23] ^= bash_rc[10];

    // Round 11
    BASHS(S, 0, 8, 16, BigInt(bash_rot[0][0]), BigInt(bash_rot[0][1]), BigInt(bash_rot[0][2]), BigInt(bash_rot[0][3]));
    BASHS(S, 1, 9, 17, BigInt(bash_rot[1][0]), BigInt(bash_rot[1][1]), BigInt(bash_rot[1][2]), BigInt(bash_rot[1][3]));
    BASHS(S, 2, 10, 18, BigInt(bash_rot[2][0]), BigInt(bash_rot[2][1]), BigInt(bash_rot[2][2]), BigInt(bash_rot[2][3]));
    BASHS(S, 3, 11, 19, BigInt(bash_rot[3][0]), BigInt(bash_rot[3][1]), BigInt(bash_rot[3][2]), BigInt(bash_rot[3][3]));
    BASHS(S, 4, 12, 20, BigInt(bash_rot[4][0]), BigInt(bash_rot[4][1]), BigInt(bash_rot[4][2]), BigInt(bash_rot[4][3]));
    BASHS(S, 5, 13, 21, BigInt(bash_rot[5][0]), BigInt(bash_rot[5][1]), BigInt(bash_rot[5][2]), BigInt(bash_rot[5][3]));
    BASHS(S, 6, 14, 22, BigInt(bash_rot[6][0]), BigInt(bash_rot[6][1]), BigInt(bash_rot[6][2]), BigInt(bash_rot[6][3]));
    BASHS(S, 7, 15, 23, BigInt(bash_rot[7][0]), BigInt(bash_rot[7][1]), BigInt(bash_rot[7][2]), BigInt(bash_rot[7][3]));
    BASH_PERMUTE(S);
    S[23] ^= bash_rc[11];

    // Round 12
    BASHS(S, 0, 8, 16, BigInt(bash_rot[0][0]), BigInt(bash_rot[0][1]), BigInt(bash_rot[0][2]), BigInt(bash_rot[0][3]));
    BASHS(S, 1, 9, 17, BigInt(bash_rot[1][0]), BigInt(bash_rot[1][1]), BigInt(bash_rot[1][2]), BigInt(bash_rot[1][3]));
    BASHS(S, 2, 10, 18, BigInt(bash_rot[2][0]), BigInt(bash_rot[2][1]), BigInt(bash_rot[2][2]), BigInt(bash_rot[2][3]));
    BASHS(S, 3, 11, 19, BigInt(bash_rot[3][0]), BigInt(bash_rot[3][1]), BigInt(bash_rot[3][2]), BigInt(bash_rot[3][3]));
    BASHS(S, 4, 12, 20, BigInt(bash_rot[4][0]), BigInt(bash_rot[4][1]), BigInt(bash_rot[4][2]), BigInt(bash_rot[4][3]));
    BASHS(S, 5, 13, 21, BigInt(bash_rot[5][0]), BigInt(bash_rot[5][1]), BigInt(bash_rot[5][2]), BigInt(bash_rot[5][3]));
    BASHS(S, 6, 14, 22, BigInt(bash_rot[6][0]), BigInt(bash_rot[6][1]), BigInt(bash_rot[6][2]), BigInt(bash_rot[6][3]));
    BASHS(S, 7, 15, 23, BigInt(bash_rot[7][0]), BigInt(bash_rot[7][1]), BigInt(bash_rot[7][2]), BigInt(bash_rot[7][3]));
    BASH_PERMUTE(S);
    S[23] ^= bash_rc[12];

    // Round 13
    BASHS(S, 0, 8, 16, BigInt(bash_rot[0][0]), BigInt(bash_rot[0][1]), BigInt(bash_rot[0][2]), BigInt(bash_rot[0][3]));
    BASHS(S, 1, 9, 17, BigInt(bash_rot[1][0]), BigInt(bash_rot[1][1]), BigInt(bash_rot[1][2]), BigInt(bash_rot[1][3]));
    BASHS(S, 2, 10, 18, BigInt(bash_rot[2][0]), BigInt(bash_rot[2][1]), BigInt(bash_rot[2][2]), BigInt(bash_rot[2][3]));
    BASHS(S, 3, 11, 19, BigInt(bash_rot[3][0]), BigInt(bash_rot[3][1]), BigInt(bash_rot[3][2]), BigInt(bash_rot[3][3]));
    BASHS(S, 4, 12, 20, BigInt(bash_rot[4][0]), BigInt(bash_rot[4][1]), BigInt(bash_rot[4][2]), BigInt(bash_rot[4][3]));
    BASHS(S, 5, 13, 21, BigInt(bash_rot[5][0]), BigInt(bash_rot[5][1]), BigInt(bash_rot[5][2]), BigInt(bash_rot[5][3]));
    BASHS(S, 6, 14, 22, BigInt(bash_rot[6][0]), BigInt(bash_rot[6][1]), BigInt(bash_rot[6][2]), BigInt(bash_rot[6][3]));
    BASHS(S, 7, 15, 23, BigInt(bash_rot[7][0]), BigInt(bash_rot[7][1]), BigInt(bash_rot[7][2]), BigInt(bash_rot[7][3]));
    BASH_PERMUTE(S);
    S[23] ^= bash_rc[13];

    // Round 14
    BASHS(S, 0, 8, 16, BigInt(bash_rot[0][0]), BigInt(bash_rot[0][1]), BigInt(bash_rot[0][2]), BigInt(bash_rot[0][3]));
    BASHS(S, 1, 9, 17, BigInt(bash_rot[1][0]), BigInt(bash_rot[1][1]), BigInt(bash_rot[1][2]), BigInt(bash_rot[1][3]));
    BASHS(S, 2, 10, 18, BigInt(bash_rot[2][0]), BigInt(bash_rot[2][1]), BigInt(bash_rot[2][2]), BigInt(bash_rot[2][3]));
    BASHS(S, 3, 11, 19, BigInt(bash_rot[3][0]), BigInt(bash_rot[3][1]), BigInt(bash_rot[3][2]), BigInt(bash_rot[3][3]));
    BASHS(S, 4, 12, 20, BigInt(bash_rot[4][0]), BigInt(bash_rot[4][1]), BigInt(bash_rot[4][2]), BigInt(bash_rot[4][3]));
    BASHS(S, 5, 13, 21, BigInt(bash_rot[5][0]), BigInt(bash_rot[5][1]), BigInt(bash_rot[5][2]), BigInt(bash_rot[5][3]));
    BASHS(S, 6, 14, 22, BigInt(bash_rot[6][0]), BigInt(bash_rot[6][1]), BigInt(bash_rot[6][2]), BigInt(bash_rot[6][3]));
    BASHS(S, 7, 15, 23, BigInt(bash_rot[7][0]), BigInt(bash_rot[7][1]), BigInt(bash_rot[7][2]), BigInt(bash_rot[7][3]));
    BASH_PERMUTE(S);
    S[23] ^= bash_rc[14];

    // Round 15
    BASHS(S, 0, 8, 16, BigInt(bash_rot[0][0]), BigInt(bash_rot[0][1]), BigInt(bash_rot[0][2]), BigInt(bash_rot[0][3]));
    BASHS(S, 1, 9, 17, BigInt(bash_rot[1][0]), BigInt(bash_rot[1][1]), BigInt(bash_rot[1][2]), BigInt(bash_rot[1][3]));
    BASHS(S, 2, 10, 18, BigInt(bash_rot[2][0]), BigInt(bash_rot[2][1]), BigInt(bash_rot[2][2]), BigInt(bash_rot[2][3]));
    BASHS(S, 3, 11, 19, BigInt(bash_rot[3][0]), BigInt(bash_rot[3][1]), BigInt(bash_rot[3][2]), BigInt(bash_rot[3][3]));
    BASHS(S, 4, 12, 20, BigInt(bash_rot[4][0]), BigInt(bash_rot[4][1]), BigInt(bash_rot[4][2]), BigInt(bash_rot[4][3]));
    BASHS(S, 5, 13, 21, BigInt(bash_rot[5][0]), BigInt(bash_rot[5][1]), BigInt(bash_rot[5][2]), BigInt(bash_rot[5][3]));
    BASHS(S, 6, 14, 22, BigInt(bash_rot[6][0]), BigInt(bash_rot[6][1]), BigInt(bash_rot[6][2]), BigInt(bash_rot[6][3]));
    BASHS(S, 7, 15, 23, BigInt(bash_rot[7][0]), BigInt(bash_rot[7][1]), BigInt(bash_rot[7][2]), BigInt(bash_rot[7][3]));
    BASH_PERMUTE(S);
    S[23] ^= bash_rc[15];

    // Round 16
    BASHS(S, 0, 8, 16, BigInt(bash_rot[0][0]), BigInt(bash_rot[0][1]), BigInt(bash_rot[0][2]), BigInt(bash_rot[0][3]));
    BASHS(S, 1, 9, 17, BigInt(bash_rot[1][0]), BigInt(bash_rot[1][1]), BigInt(bash_rot[1][2]), BigInt(bash_rot[1][3]));
    BASHS(S, 2, 10, 18, BigInt(bash_rot[2][0]), BigInt(bash_rot[2][1]), BigInt(bash_rot[2][2]), BigInt(bash_rot[2][3]));
    BASHS(S, 3, 11, 19, BigInt(bash_rot[3][0]), BigInt(bash_rot[3][1]), BigInt(bash_rot[3][2]), BigInt(bash_rot[3][3]));
    BASHS(S, 4, 12, 20, BigInt(bash_rot[4][0]), BigInt(bash_rot[4][1]), BigInt(bash_rot[4][2]), BigInt(bash_rot[4][3]));
    BASHS(S, 5, 13, 21, BigInt(bash_rot[5][0]), BigInt(bash_rot[5][1]), BigInt(bash_rot[5][2]), BigInt(bash_rot[5][3]));
    BASHS(S, 6, 14, 22, BigInt(bash_rot[6][0]), BigInt(bash_rot[6][1]), BigInt(bash_rot[6][2]), BigInt(bash_rot[6][3]));
    BASHS(S, 7, 15, 23, BigInt(bash_rot[7][0]), BigInt(bash_rot[7][1]), BigInt(bash_rot[7][2]), BigInt(bash_rot[7][3]));
    BASH_PERMUTE(S);
    S[23] ^= bash_rc[16];

    // Round 17
    BASHS(S, 0, 8, 16, BigInt(bash_rot[0][0]), BigInt(bash_rot[0][1]), BigInt(bash_rot[0][2]), BigInt(bash_rot[0][3]));
    BASHS(S, 1, 9, 17, BigInt(bash_rot[1][0]), BigInt(bash_rot[1][1]), BigInt(bash_rot[1][2]), BigInt(bash_rot[1][3]));
    BASHS(S, 2, 10, 18, BigInt(bash_rot[2][0]), BigInt(bash_rot[2][1]), BigInt(bash_rot[2][2]), BigInt(bash_rot[2][3]));
    BASHS(S, 3, 11, 19, BigInt(bash_rot[3][0]), BigInt(bash_rot[3][1]), BigInt(bash_rot[3][2]), BigInt(bash_rot[3][3]));
    BASHS(S, 4, 12, 20, BigInt(bash_rot[4][0]), BigInt(bash_rot[4][1]), BigInt(bash_rot[4][2]), BigInt(bash_rot[4][3]));
    BASHS(S, 5, 13, 21, BigInt(bash_rot[5][0]), BigInt(bash_rot[5][1]), BigInt(bash_rot[5][2]), BigInt(bash_rot[5][3]));
    BASHS(S, 6, 14, 22, BigInt(bash_rot[6][0]), BigInt(bash_rot[6][1]), BigInt(bash_rot[6][2]), BigInt(bash_rot[6][3]));
    BASHS(S, 7, 15, 23, BigInt(bash_rot[7][0]), BigInt(bash_rot[7][1]), BigInt(bash_rot[7][2]), BigInt(bash_rot[7][3]));
    BASH_PERMUTE(S);
    S[23] ^= bash_rc[17];

    // Round 18
    BASHS(S, 0, 8, 16, BigInt(bash_rot[0][0]), BigInt(bash_rot[0][1]), BigInt(bash_rot[0][2]), BigInt(bash_rot[0][3]));
    BASHS(S, 1, 9, 17, BigInt(bash_rot[1][0]), BigInt(bash_rot[1][1]), BigInt(bash_rot[1][2]), BigInt(bash_rot[1][3]));
    BASHS(S, 2, 10, 18, BigInt(bash_rot[2][0]), BigInt(bash_rot[2][1]), BigInt(bash_rot[2][2]), BigInt(bash_rot[2][3]));
    BASHS(S, 3, 11, 19, BigInt(bash_rot[3][0]), BigInt(bash_rot[3][1]), BigInt(bash_rot[3][2]), BigInt(bash_rot[3][3]));
    BASHS(S, 4, 12, 20, BigInt(bash_rot[4][0]), BigInt(bash_rot[4][1]), BigInt(bash_rot[4][2]), BigInt(bash_rot[4][3]));
    BASHS(S, 5, 13, 21, BigInt(bash_rot[5][0]), BigInt(bash_rot[5][1]), BigInt(bash_rot[5][2]), BigInt(bash_rot[5][3]));
    BASHS(S, 6, 14, 22, BigInt(bash_rot[6][0]), BigInt(bash_rot[6][1]), BigInt(bash_rot[6][2]), BigInt(bash_rot[6][3]));
    BASHS(S, 7, 15, 23, BigInt(bash_rot[7][0]), BigInt(bash_rot[7][1]), BigInt(bash_rot[7][2]), BigInt(bash_rot[7][3]));
    BASH_PERMUTE(S);
    S[23] ^= bash_rc[18];

    // Round 19
    BASHS(S, 0, 8, 16, BigInt(bash_rot[0][0]), BigInt(bash_rot[0][1]), BigInt(bash_rot[0][2]), BigInt(bash_rot[0][3]));
    BASHS(S, 1, 9, 17, BigInt(bash_rot[1][0]), BigInt(bash_rot[1][1]), BigInt(bash_rot[1][2]), BigInt(bash_rot[1][3]));
    BASHS(S, 2, 10, 18, BigInt(bash_rot[2][0]), BigInt(bash_rot[2][1]), BigInt(bash_rot[2][2]), BigInt(bash_rot[2][3]));
    BASHS(S, 3, 11, 19, BigInt(bash_rot[3][0]), BigInt(bash_rot[3][1]), BigInt(bash_rot[3][2]), BigInt(bash_rot[3][3]));
    BASHS(S, 4, 12, 20, BigInt(bash_rot[4][0]), BigInt(bash_rot[4][1]), BigInt(bash_rot[4][2]), BigInt(bash_rot[4][3]));
    BASHS(S, 5, 13, 21, BigInt(bash_rot[5][0]), BigInt(bash_rot[5][1]), BigInt(bash_rot[5][2]), BigInt(bash_rot[5][3]));
    BASHS(S, 6, 14, 22, BigInt(bash_rot[6][0]), BigInt(bash_rot[6][1]), BigInt(bash_rot[6][2]), BigInt(bash_rot[6][3]));
    BASHS(S, 7, 15, 23, BigInt(bash_rot[7][0]), BigInt(bash_rot[7][1]), BigInt(bash_rot[7][2]), BigInt(bash_rot[7][3]));
    BASH_PERMUTE(S);
    S[23] ^= bash_rc[19];

    // Round 20
    BASHS(S, 0, 8, 16, BigInt(bash_rot[0][0]), BigInt(bash_rot[0][1]), BigInt(bash_rot[0][2]), BigInt(bash_rot[0][3]));
    BASHS(S, 1, 9, 17, BigInt(bash_rot[1][0]), BigInt(bash_rot[1][1]), BigInt(bash_rot[1][2]), BigInt(bash_rot[1][3]));
    BASHS(S, 2, 10, 18, BigInt(bash_rot[2][0]), BigInt(bash_rot[2][1]), BigInt(bash_rot[2][2]), BigInt(bash_rot[2][3]));
    BASHS(S, 3, 11, 19, BigInt(bash_rot[3][0]), BigInt(bash_rot[3][1]), BigInt(bash_rot[3][2]), BigInt(bash_rot[3][3]));
    BASHS(S, 4, 12, 20, BigInt(bash_rot[4][0]), BigInt(bash_rot[4][1]), BigInt(bash_rot[4][2]), BigInt(bash_rot[4][3]));
    BASHS(S, 5, 13, 21, BigInt(bash_rot[5][0]), BigInt(bash_rot[5][1]), BigInt(bash_rot[5][2]), BigInt(bash_rot[5][3]));
    BASHS(S, 6, 14, 22, BigInt(bash_rot[6][0]), BigInt(bash_rot[6][1]), BigInt(bash_rot[6][2]), BigInt(bash_rot[6][3]));
    BASHS(S, 7, 15, 23, BigInt(bash_rot[7][0]), BigInt(bash_rot[7][1]), BigInt(bash_rot[7][2]), BigInt(bash_rot[7][3]));
    BASH_PERMUTE(S);
    S[23] ^= bash_rc[20];

    // Round 21
    BASHS(S, 0, 8, 16, BigInt(bash_rot[0][0]), BigInt(bash_rot[0][1]), BigInt(bash_rot[0][2]), BigInt(bash_rot[0][3]));
    BASHS(S, 1, 9, 17, BigInt(bash_rot[1][0]), BigInt(bash_rot[1][1]), BigInt(bash_rot[1][2]), BigInt(bash_rot[1][3]));
    BASHS(S, 2, 10, 18, BigInt(bash_rot[2][0]), BigInt(bash_rot[2][1]), BigInt(bash_rot[2][2]), BigInt(bash_rot[2][3]));
    BASHS(S, 3, 11, 19, BigInt(bash_rot[3][0]), BigInt(bash_rot[3][1]), BigInt(bash_rot[3][2]), BigInt(bash_rot[3][3]));
    BASHS(S, 4, 12, 20, BigInt(bash_rot[4][0]), BigInt(bash_rot[4][1]), BigInt(bash_rot[4][2]), BigInt(bash_rot[4][3]));
    BASHS(S, 5, 13, 21, BigInt(bash_rot[5][0]), BigInt(bash_rot[5][1]), BigInt(bash_rot[5][2]), BigInt(bash_rot[5][3]));
    BASHS(S, 6, 14, 22, BigInt(bash_rot[6][0]), BigInt(bash_rot[6][1]), BigInt(bash_rot[6][2]), BigInt(bash_rot[6][3]));
    BASHS(S, 7, 15, 23, BigInt(bash_rot[7][0]), BigInt(bash_rot[7][1]), BigInt(bash_rot[7][2]), BigInt(bash_rot[7][3]));
    BASH_PERMUTE(S);
    S[23] ^= bash_rc[21];

    // Round 22
    BASHS(S, 0, 8, 16, BigInt(bash_rot[0][0]), BigInt(bash_rot[0][1]), BigInt(bash_rot[0][2]), BigInt(bash_rot[0][3]));
    BASHS(S, 1, 9, 17, BigInt(bash_rot[1][0]), BigInt(bash_rot[1][1]), BigInt(bash_rot[1][2]), BigInt(bash_rot[1][3]));
    BASHS(S, 2, 10, 18, BigInt(bash_rot[2][0]), BigInt(bash_rot[2][1]), BigInt(bash_rot[2][2]), BigInt(bash_rot[2][3]));
    BASHS(S, 3, 11, 19, BigInt(bash_rot[3][0]), BigInt(bash_rot[3][1]), BigInt(bash_rot[3][2]), BigInt(bash_rot[3][3]));
    BASHS(S, 4, 12, 20, BigInt(bash_rot[4][0]), BigInt(bash_rot[4][1]), BigInt(bash_rot[4][2]), BigInt(bash_rot[4][3]));
    BASHS(S, 5, 13, 21, BigInt(bash_rot[5][0]), BigInt(bash_rot[5][1]), BigInt(bash_rot[5][2]), BigInt(bash_rot[5][3]));
    BASHS(S, 6, 14, 22, BigInt(bash_rot[6][0]), BigInt(bash_rot[6][1]), BigInt(bash_rot[6][2]), BigInt(bash_rot[6][3]));
    BASHS(S, 7, 15, 23, BigInt(bash_rot[7][0]), BigInt(bash_rot[7][1]), BigInt(bash_rot[7][2]), BigInt(bash_rot[7][3]));
    BASH_PERMUTE(S);
    S[23] ^= bash_rc[22];

    // Round 23
    BASHS(S, 0, 8, 16, BigInt(bash_rot[0][0]), BigInt(bash_rot[0][1]), BigInt(bash_rot[0][2]), BigInt(bash_rot[0][3]));
    BASHS(S, 1, 9, 17, BigInt(bash_rot[1][0]), BigInt(bash_rot[1][1]), BigInt(bash_rot[1][2]), BigInt(bash_rot[1][3]));
    BASHS(S, 2, 10, 18, BigInt(bash_rot[2][0]), BigInt(bash_rot[2][1]), BigInt(bash_rot[2][2]), BigInt(bash_rot[2][3]));
    BASHS(S, 3, 11, 19, BigInt(bash_rot[3][0]), BigInt(bash_rot[3][1]), BigInt(bash_rot[3][2]), BigInt(bash_rot[3][3]));
    BASHS(S, 4, 12, 20, BigInt(bash_rot[4][0]), BigInt(bash_rot[4][1]), BigInt(bash_rot[4][2]), BigInt(bash_rot[4][3]));
    BASHS(S, 5, 13, 21, BigInt(bash_rot[5][0]), BigInt(bash_rot[5][1]), BigInt(bash_rot[5][2]), BigInt(bash_rot[5][3]));
    BASHS(S, 6, 14, 22, BigInt(bash_rot[6][0]), BigInt(bash_rot[6][1]), BigInt(bash_rot[6][2]), BigInt(bash_rot[6][3]));
    BASHS(S, 7, 15, 23, BigInt(bash_rot[7][0]), BigInt(bash_rot[7][1]), BigInt(bash_rot[7][2]), BigInt(bash_rot[7][3]));
    BASH_PERMUTE(S);
    S[23] ^= bash_rc[23];

    if (bigend) {
        S[0] = SWAP64(S[0]); S[1] = SWAP64(S[1]); S[2] = SWAP64(S[2]); S[3] = SWAP64(S[3]);
        S[4] = SWAP64(S[4]); S[5] = SWAP64(S[5]); S[6] = SWAP64(S[6]); S[7] = SWAP64(S[7]);
        S[8] = SWAP64(S[8]); S[9] = SWAP64(S[9]); S[10] = SWAP64(S[10]); S[11] = SWAP64(S[11]);
        S[12] = SWAP64(S[12]); S[13] = SWAP64(S[13]); S[14] = SWAP64(S[14]); S[15] = SWAP64(S[15]);
        S[16] = SWAP64(S[16]); S[17] = SWAP64(S[17]); S[18] = SWAP64(S[18]); S[19] = SWAP64(S[19]);
        S[20] = SWAP64(S[20]); S[21] = SWAP64(S[21]); S[22] = SWAP64(S[22]); S[23] = SWAP64(S[23]);
    }
}