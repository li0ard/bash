export const ROUNDS = 24;
export const MASK64 = 0xFFFFFFFFFFFFFFFFn;

export const bash_rc: Readonly<BigUint64Array> = new BigUint64Array([
    0x3bf5080ac8ba94b1n,
    0xc1d1659c1bbd92f6n,
    0x60e8b2ce0ddec97bn,
    0xec5fb8fe790fbc13n,
    0xaa043de6436706a7n,
    0x8929ff6a5e535bfdn,
    0x98bf1e2c50c97550n,
    0x4c5f8f162864baa8n,
    0x262fc78b14325d54n,
    0x1317e3c58a192eaan,
    0x098bf1e2c50c9755n,
    0xd8ee19681d669304n,
    0x6c770cb40eb34982n,
    0x363b865a0759a4c1n,
    0xc73622b47c4c0acen,
    0x639b115a3e260567n,
    0xede6693460f3da1dn,
    0xaad8d5034f9935a0n,
    0x556c6a81a7cc9ad0n,
    0x2ab63540d3e64d68n,
    0x155b1aa069f326b4n,
    0x0aad8d5034f9935an,
    0x0556c6a81a7cc9adn,
    0xde8082cd72debc78n
]);

export const bash_rot: Readonly<Uint8Array[]> = [
    new Uint8Array([ 8, 53, 14, 1 ]),
    new Uint8Array([ 56, 51, 34, 7 ]),
    new Uint8Array([ 8, 37, 46, 49 ]),
    new Uint8Array([ 56, 3, 2, 23 ]),
    new Uint8Array([ 8, 21, 14, 33 ]),
    new Uint8Array([ 56, 19, 34, 39 ]),
    new Uint8Array([ 8, 5, 46, 17 ]),
    new Uint8Array([ 56, 35, 2, 55 ])
];