import { BASHF } from "./bashf.js";
import { bytesToUint64s, uint64sToBytes } from "./utils.js";

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
        this.blockLen = 192 - (outputLen / 2);
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
        /*const x2 = new Uint8Array(this.x);
        x2.fill(0, this.nx, this.blockLen);
        x2[this.nx] = 0x40;
        this.processBlock(x2);
    
        return uint64sToBytes(this.s).slice(0, this.outputLen);*/
        const x2 = new Uint8Array(this.x);
    
        if (this.nx === this.blockLen) {
            this.processBlock(x2);
            x2.fill(0);
            x2[0] = 0x40;
        } else {
            x2.fill(0, this.nx, this.blockLen);
            x2[this.nx] = 0x40;
        }
    
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

export * from "./prg.js";
export * from "./bashf.js";