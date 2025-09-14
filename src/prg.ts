import { BASH_PRG_KEY, BASH_PRG_NULL, BASH_PRG_DATA, BASH_PRG_OUT, BASH_PRG_TEXT } from "./const";
import { BASHF } from "./index";
import { concatBytes, equalBytes, xor } from "./utils";

/** Programmable automaton (`bash-prg`) */
export class BashPrg {
    private l: number;
    private d: number;
    private s: Uint8Array;
    private buf_len: number;
    private pos: number;

    /** Programmable automaton (`bash-prg`) */
    constructor() {
        this.s = new Uint8Array(192);
        this.l = 0;
        this.d = 0;
        this.buf_len = 0;
        this.pos = 0;
    }

    private isKeymode(): boolean {
        return 16 * (192 - this.buf_len) === this.l * (2 + this.d);
    }

    private commit(code: number) {
        if (this.pos >= this.buf_len) throw new Error('Buffer position exceeds buffer length');
        this.s[this.pos] ^= code;
        this.s[this.buf_len] ^= 0x80;
        this.bashF(this.s);
        this.pos = 0;
    }

    /**
     * Initialize
     * @param Durability level (128 or 192 or 256)
     * @param d Capacity (1 or 2)
     * @param ann Announcement
     * @param key Encryption key
     */
    start(l: number, d: number, ann: Uint8Array, key: Uint8Array) {
        if (![128, 192, 256].includes(l)) throw new Error('Invalid security level. Must be 128, 192, or 256.');
        if (![1, 2].includes(d)) throw new Error('Invalid capacity. Must be 1 or 2.');
        if (ann.length % 4 !== 0 || ann.length > 60) throw new Error('Invalid announcement length. Must be multiple of 4 and ≤ 60.');
        if (key.length % 4 !== 0 || key.length > 60) throw new Error('Invalid key length. Must be multiple of 4 and ≤ 60.');
        if (key.length > 0 && key.length < Math.floor(l / 8)) throw new Error(`Key length too short. Must be ≥ ${Math.floor(l/8)} bytes.`);

        this.pos = 1 + ann.length + key.length;
        this.s[0] = (ann.length * 4 + Math.floor(key.length / 4)) & 0xFF;
        this.s.set(ann, 1);
        this.s.set(key, 1 + ann.length);
        this.s.fill(0, this.pos, 184);
        this.s[184] = (Math.floor(l / 4) + d) & 0xFF;
        this.buf_len = key.length > 0 ? (192 - Math.floor((l * (2 + d)) / 16)) : (192 - Math.floor((d * l) / 4));
        this.l = l;
        this.d = d;
    }

    /**
     * Reinitialize
     * @param ann Announcement
     * @param key Encryption key
     */
    restart(ann: Uint8Array, key: Uint8Array) {
        if (ann.length % 4 !== 0 || ann.length > 60) throw new Error('Invalid announcement length. Must be multiple of 4 and ≤ 60.');
        if (key.length % 4 !== 0 || key.length > 60) throw new Error('Invalid key length. Must be multiple of 4 and ≤ 60.');
        if (key.length > 0 && key.length < Math.floor(this.l / 8)) throw new Error(`Key length too short. Must be ≥ ${Math.floor(this.l/8)} bytes.`);
        
        if (key.length > 0) {
            this.commit(BASH_PRG_KEY);
            this.buf_len = 192 - Math.floor((this.l * (2 + this.d)) / 16);
        }
        else this.commit(BASH_PRG_NULL);
        
        this.pos = 1 + ann.length + key.length;
        this.s[0] ^= (ann.length * 4 + Math.floor(key.length / 4)) & 0xFF;
        this.xorWithState(ann, 0, 1, ann.length);
        this.xorWithState(key, 0, 1 + ann.length, key.length);
    }

    /**
     * Load data
     * @param buf Input data
     */
    absorb(buf: Uint8Array) {
        let count = buf.length;
        this.commit(BASH_PRG_DATA);
        let offset = 0;
        
        if (count > 0 && this.pos < this.buf_len) {
            const available = this.buf_len - this.pos;
            const chunkSize = Math.min(count, available);
            
            this.xorWithState(buf, offset, this.pos, chunkSize);
            offset += chunkSize;
            count -= chunkSize;
            this.pos += chunkSize;
            
            if (this.pos === this.buf_len) {
                this.bashF(this.s);
                this.pos = 0;
            }
        }
        
        while (count >= this.buf_len) {
            this.xorWithState(buf, offset, 0, this.buf_len);
            offset += this.buf_len;
            count -= this.buf_len;
            this.bashF(this.s);
        }
        
        if (count > 0) {
            this.xorWithState(buf, offset, 0, count);
            this.pos = count;
        }
    }

    /**
     * Extract data
     * @param count Count of bytes
     */
    squeeze(count: number): Uint8Array {
        this.commit(BASH_PRG_OUT);
        const result = new Uint8Array(count);
        let offset = 0;
        
        if (count > 0 && this.pos < this.buf_len) {
            const available = this.buf_len - this.pos;
            const chunkSize = Math.min(count, available);
            
            this.copyFromState(result, offset, this.pos, chunkSize);
            offset += chunkSize;
            count -= chunkSize;
            this.pos += chunkSize;
            
            if (this.pos === this.buf_len) {
                this.bashF(this.s);
                this.pos = 0;
            }
        }
        
        while (count >= this.buf_len) {
            this.copyFromState(result, offset, 0, this.buf_len);
            offset += this.buf_len;
            count -= this.buf_len;
            this.bashF(this.s);
        }
        
        if (count > 0) {
            this.copyFromState(result, offset, 0, count);
            this.pos = count;
        }
        
        return result;
    }
    
    /**
     * Encrypt data
     * @param buf Data to be encrypted
     */
    encrypt(buf: Uint8Array): Uint8Array {
        let count = buf.length;
        if (!this.isKeymode()) throw new Error('Encryption requires key mode. Initialize with a key.');
        
        this.commit(BASH_PRG_TEXT);
        const result = new Uint8Array(count);
        let offset = 0;
        
        if (count > 0 && this.pos < this.buf_len) {
            const available = this.buf_len - this.pos;
            const chunkSize = Math.min(count, available);
            
            this.xorWithState(buf, offset, this.pos, chunkSize);
            this.copyFromState(result, offset, this.pos, chunkSize);
            
            offset += chunkSize;
            count -= chunkSize;
            this.pos += chunkSize;
            
            if (this.pos === this.buf_len) {
                this.bashF(this.s);
                this.pos = 0;
            }
        }
        
        while (count >= this.buf_len) {
            this.xorWithState(buf, offset, 0, this.buf_len);
            this.copyFromState(result, offset, 0, this.buf_len);
            
            offset += this.buf_len;
            count -= this.buf_len;
            this.bashF(this.s);
        }
        
        if (count > 0) {
            this.xorWithState(buf, offset, 0, count);
            this.copyFromState(result, offset, 0, count);
            this.pos = count;
        }
        
        return result;
    }

    /**
     * Decrypt data
     * @param buf Data to be decryptedk
     */
    decrypt(buf: Uint8Array): Uint8Array {
        let count = buf.length;
        if (!this.isKeymode()) throw new Error('Decryption requires key mode. Initialize with a key.');
        
        this.commit(BASH_PRG_TEXT);
        const result = new Uint8Array(count);
        let offset = 0;
        
        if (count > 0 && this.pos < this.buf_len) {
            const available = this.buf_len - this.pos;
            const chunkSize = Math.min(count, available);
            
            for (let i = 0; i < chunkSize; i++) result[offset + i] = this.s[this.pos + i] ^ buf[offset + i];
            for (let i = 0; i < chunkSize; i++) this.s[this.pos + i] = buf[offset + i];
            
            offset += chunkSize;
            count -= chunkSize;
            this.pos += chunkSize;
            
            if (this.pos === this.buf_len) {
                this.bashF(this.s);
                this.pos = 0;
            }
        }
        
        while (count >= this.buf_len) {
            for (let i = 0; i < this.buf_len; i++) result[offset + i] = this.s[i] ^ buf[offset + i];
            for (let i = 0; i < this.buf_len; i++) this.s[i] = buf[offset + i];
            offset += this.buf_len;
            count -= this.buf_len;
            this.bashF(this.s);
        }
        
        if (count > 0) {
            for (let i = 0; i < count; i++) result[offset + i] = this.s[i] ^ buf[offset + i];
            for (let i = 0; i < count; i++) this.s[i] = buf[offset + i];
            this.pos = count;
        }
        
        return result;
    }
    
    /** Irreversibly change automaton state */
    ratchet() {
        const T = new Uint8Array(this.s);
        this.commit(BASH_PRG_NULL);
        this.s = xor(this.s, T);
    }

    _cloneInto(to?: BashPrg): BashPrg {
        to ||= new BashPrg();
        to.s = new Uint8Array(this.s);
        to.l = this.l;
        to.d = this.d;
        to.buf_len = this.buf_len;
        to.pos = this.pos;

        return to;
    }
    /** Clone instance */
    clone(): BashPrg { return this._cloneInto(); }

    private xorWithState(src: Uint8Array, srcOffset: number, destOffset: number, length: number): void {
        for (let i = 0; i < length; i++) this.s[destOffset + i] ^= src[srcOffset + i];
    }

    private copyFromState(dest: Uint8Array, destOffset: number, srcOffset: number, length: number): void {
        for (let i = 0; i < length; i++) dest[destOffset + i] = this.s[srcOffset + i];
    }
    
    private bashF(state: Uint8Array): void {
        BASHF(new BigUint64Array(state.buffer, state.byteOffset), false);
    }
}

/**
 * Example automaton for hashing
 * @param l Durability level (128 or 192 or 256)
 * @param d Capacity (1 or 2)
 * @param X Data to be hashed
 */
export const prgHash = (l: number, d: number, X: Uint8Array): Uint8Array => {
    const alpha = new BashPrg();
    const n = l / 4;
    alpha.start(l, d, new Uint8Array(), new Uint8Array());
    alpha.absorb(X);

    return alpha.squeeze(n);
}

/**
 * Example automaton AE encryption schema
 * @param l Durability level (128 or 192 or 256)
 * @param d Capacity (1 or 2)
 * @param A Announcement
 * @param X Data to be encrypted
 * @param I Associated Data
 * @param K Encryption key
 */
export const prgAeEncrypt = (l: number, d: number, A: Uint8Array, X: Uint8Array, I: Uint8Array, K: Uint8Array): Uint8Array => {
    const alpha = new BashPrg();
    alpha.start(l, d, A, K);
    alpha.absorb(I);

    return concatBytes(alpha.encrypt(X), alpha.squeeze(l / 8));
}

/**
 * Example automaton AE encryption schema
 * @param l Durability level (128 or 192 or 256)
 * @param d Capacity (1 or 2)
 * @param A Announcement
 * @param Y Data to be decrypted
 * @param I Associated Data
 * @param K Encryption key
 */
export const prgAeDecrypt = (l: number, d: number, A: Uint8Array, Y: Uint8Array, I: Uint8Array, K: Uint8Array): Uint8Array => {
    const alpha = new BashPrg();
    alpha.start(l, d, A, K);
    alpha.absorb(I);

    let X = alpha.decrypt(Y.slice(0, -l / 8));
    if(!equalBytes(Y.slice(-l / 8), alpha.squeeze(l / 8))) throw new Error("Invalid MAC");

    return X;
}