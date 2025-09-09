<p align="center">
    <b>@li0ard/bash</b><br>
    <b>Bash (STB 34.101.77) hash function in pure TypeScript</b>
    <br>
    <a href="https://li0ard.is-cool.dev/bash">docs</a>
    <br><br>
    <a href="https://github.com/li0ard/bash/actions/workflows/test.yml"><img src="https://github.com/li0ard/bash/actions/workflows/test.yml/badge.svg" /></a>
    <a href="https://github.com/li0ard/bash/blob/main/LICENSE"><img src="https://img.shields.io/github/license/li0ard/bash" /></a>
    <br>
    <a href="https://npmjs.com/package/@li0ard/bash"><img src="https://img.shields.io/npm/v/@li0ard/bash" /></a>
    <a href="https://jsr.io/@li0ard/bash"><img src="https://jsr.io/badges/@li0ard/bash" /></a>
    <br>
    <hr>
</p>

## Installation

```bash
# from NPM
npm i @li0ard/bash

# from JSR
bunx jsr i @li0ard/bash
```

## Supported modes
- [x] BASH.HASH128 (256 bit)
- [x] BASH.HASH192 (384 bit)
- [x] BASH.HASH256 (512 bit)

## Features
- Provides simple and modern API
- Most of the APIs are strictly typed
- Fully complies with [STB 34.101.77-2020 (in Russian)](https://apmi.bsu.by/assets/files/std/bash-spec24.pdf) standard
- Supports Bun, Node.js, Deno, Browsers

## Examples

```ts
import { Bash } from "@li0ard/bash"

let hash = new Bash(32)
hash.update(new TextEncoder().encode("hello world"))
console.log(hash.digest())

// -- OR --

import { bash256 } from "@li0ard/bash"

console.log(bash256(new TextEncoder().encode("hello world")))
```