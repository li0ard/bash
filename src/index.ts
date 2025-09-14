import { bash_rc, bash_rot, ROUNDS, MASK64 } from "./const";
import { bytesToUint64s, uint64sToBytes } from "./utils";

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
    S[0] = S_[15];
    S[1] = S_[10];
    S[2] = S_[9];
    S[3] = S_[12];
    S[4] = S_[11];
    S[5] = S_[14];
    S[6] = S_[13];
    S[7] = S_[8];
    S[8] = S_[17];
    S[9] = S_[16];
    S[10] = S_[19];
    S[11] = S_[18];
    S[12] = S_[21];
    S[13] = S_[20];
    S[14] = S_[23];
    S[15] = S_[22];
    S[16] = S_[6];
    S[17] = S_[3];
    S[18] = S_[0];
    S[19] = S_[5];
    S[20] = S_[2];
    S[21] = S_[7];
    S[22] = S_[4];
    S[23] = S_[1];
}

const SWAP64 = (A: bigint) => {
    return (
        (A << 56n) | ((A & 0xff00n) << 40n) | ((A & 0xff0000n) << 24n) | ((A & 0xff000000n) << 8n) |
        ((A >> 8n) & 0xff000000n) | ((A >> 24n) & 0xff0000n) | ((A >> 40n) & 0xff00n) | (A >> 56n)
    ) & MASK64;
}

/** `bash-f` sponge function */
export const BASHF = (S: BigUint64Array, bigend: boolean): void => {
    if (bigend) {
        for (let i = 0; i < ROUNDS; i++) S[i] = SWAP64(S[i]);
    }

    for (let round = 0; round < ROUNDS; round++) {
        for (let v = 0; v < 8; v++) BASHS(
            S, v, v + 8, v + 16,
            BigInt(bash_rot[v][0]), BigInt(bash_rot[v][1]), BigInt(bash_rot[v][2]), BigInt(bash_rot[v][3])
        );

        BASH_PERMUTE(S);
        S[23] = S[23] ^ bash_rc[round];
    }

    if (bigend) {
        for (let i = 0; i < ROUNDS; i++) S[i] = SWAP64(S[i]);
    }
}

/** Bash (aka STB 34.101.77) algorithm */
export class Bash {
    private s!: BigUint64Array;
    private x!: Uint8Array;
    private nx!: number;
    private len!: bigint;
    public readonly blockLen: number;

    /**
     * Bash (aka STB 34.101.77) algorithm
     * 
     * **Versions:**
     * - `outputLen = 32` - 256 bit version (aka BASH.HASH128)
     * - `outputLen = 48` - 384 bit version (aka BASH.HASH192)
     * - `outputLen = 64` - 512 bit version (aka BASH.HASH256)
     */
    constructor(public readonly outputLen: number) {
        if(outputLen != 32 && outputLen != 48 && outputLen != 64) throw new Error("Invalid size");
        this.blockLen = 192 - (2 * this.outputLen);
        this.reset();
    }

    /** Reset hash state */
    public reset() {
        this.x = new Uint8Array(192);
        this.s = new BigUint64Array(24);
        this.nx = 0;
        this.len = 0n;

        let state = uint64sToBytes(this.s);
        state[184] = this.outputLen; // 192 - 8
        this.s = bytesToUint64s(state);
    }

    /** Update hash buffer */
    public update(p: Uint8Array): Bash {
        let nn = p.length;
        this.len += BigInt(nn);
        let plen = p.length;

        while((this.nx + plen) >= this.blockLen) {
            const xx = this.blockLen - this.nx;
            this.x.set(p.subarray(0, this.x.length), this.nx);
            this.processBlock(this.x);
            plen -= xx;

            p = p.slice(xx);
            this.nx = 0;
        }
        this.x.set(p.subarray(0, plen), this.nx);
        this.nx += plen;

        return this
    }

    _cloneInto(to?: Bash): Bash {
        to ||= new Bash(this.outputLen);
        to.x = this.x.slice();
        to.s = this.s.slice();
        to.nx = this.nx;
        to.len = this.len;

        return to;
    }
    /** Clone hash instance */
    public clone(): Bash { return this._cloneInto(); }

    /** Finalize hash computation and return result as Uint8Array */
    public digest(): Uint8Array { return this.clone().final(); }

    private final() {
        const x2 = new Uint8Array(this.x);
        x2.fill(0, this.nx, this.blockLen);
        x2[this.nx] = 0x40;
        this.processBlock(x2);
    
        return uint64sToBytes(this.s).slice(0, this.outputLen);
    }

    private processBlock(data: Uint8Array) {
        let state = bytesToUint64s(data);
        for (let i = 0; i < this.s.length; i++) this.s[i] ^= state[i];
        BASHF(this.s, true);
    }
}

/**
 * Compute hash with STB 34.101.77 256 bit (aka BASH.HASH128)
 * @param input Input bytes
 */
export const bash256 = (input: Uint8Array): Uint8Array => new Bash(32).update(input).digest();
/**
 * Compute hash with STB 34.101.77 384 bit (aka BASH.HASH192)
 * @param input Input bytes
 */
export const bash384 = (input: Uint8Array): Uint8Array => new Bash(48).update(input).digest();
/**
 * Compute hash with STB 34.101.77 512 bit (aka BASH.HASH256)
 * @param input Input bytes
 */
export const bash512 = (input: Uint8Array): Uint8Array => new Bash(64).update(input).digest();

export * from "./prg";