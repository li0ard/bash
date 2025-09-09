/**
 * Vectors from document "МИ.10177.10.01 
 * МЕТОДИКА ИСПЫТАНИЙ СРЕДСТВ КРИПТОГРАФИЧЕСКОЙ ЗАЩИТЫ ИНФОРМАЦИИ
 * НА СООТВЕТСТВИЕ ТРЕБОВАНИЯМ СТБ 34.101.77-2020"
 * 
 * https://www.oac.gov.by/public/content/files/files/stb/101-77.pdf
 */

import { describe, test, expect } from "bun:test";
import { Bash, bash256, bash384, bash512 } from "../src";
import { hexToBytes } from "../src/utils";
import { randomBytes } from "crypto";

test("Test symmetric", () => {
    let chunks: Buffer[] = [];
    for(let i = 0; i < 10; i++) chunks.push(randomBytes(10));

    let m = new Bash(32);
    for(let i of chunks) m.update(i);

    expect(m.digest()).toStrictEqual(bash256(Buffer.concat(chunks)));
})

test("Clone", () => {
    let m = new Bash(32).update(new TextEncoder().encode("foo"));
    let c = m.clone();
    c.update(new TextEncoder().encode("bar"));
    m.update(new TextEncoder().encode("bar"));

    expect(c.digest()).toStrictEqual(m.digest());
})

describe("256 bit (l = 128)", () => {
    test("Test #1", () => {
        let expected = hexToBytes("114C3DFAE373D9BCBC3602D6386F2D6A2059BA1BF9048DBAA5146A6CB775709D");
        expect(bash256(new Uint8Array([]))).toStrictEqual(expected);
    })
    test("Test #2", () => {
        let expected = hexToBytes("3D7F4EFA00E9BA33FEED259986567DCF5C6D12D51057A968F14F06CC0F905961");
        expect(bash256(hexToBytes(
            "B194BAC80A08F53B366D008E584A5DE4" +
            "8504FA9D1BB6C7AC252E72C202FDCE0D" +
            "5BE3D61217B96181FE6786AD716B890B" +
            "5CB0C0FF33C356B835C405AED8E07F99" +
            "E12BDC1AE28257EC703FCCF095EE8DF1" +
            "C1AB76389FE678CAF7C6F860D5BB9C4F" +
            "F33C657B637C306ADD4EA7799EB23D31" +
            "3E98B56E27D3BCCF591E181F4C5AB7"
        ))).toStrictEqual(expected);
    })
    test("Test #3", () => {
        let expected = hexToBytes("8F866380A7714B539DBC9F3D18020BCAEDBD428AECC69F1405699BE12C19ED02");
        expect(bash256(hexToBytes(
            "466966747920666F7572206279746520" +
            "6F7220666F75722068756E6472656420" +
            "7468697274792074776F20626974206D" +
            "657373616765"
        ))).toStrictEqual(expected);
    })
})

describe("384 bit (l = 192)", () => {
    test("Test #1", () => {
        let expected = hexToBytes("296F63CDDF8E4963A657A8861FAD1D9D75BAF67E747B7E00AF8E55BAB9E2627BB0E2B752D867E70BEB88D13D495A4ECB");
        expect(bash384(new Uint8Array([]))).toStrictEqual(expected);
    })
    test("Test #2", () => {
        let expected = hexToBytes("64334AF830D33F63E9ACDFA184E32522103FFF5C6860110A2CD369EDBC04387C501D8F92F749AE4DE15A8305C353D64D");
        expect(bash384(hexToBytes(
            "B194BAC80A08F53B366D008E584A5DE4" +
            "8504FA9D1BB6C7AC252E72C202FDCE0D" +
            "5BE3D61217B96181FE6786AD716B890B" +
            "5CB0C0FF33C356B835C405AED8E07F99" +
            "E12BDC1AE28257EC703FCCF095EE8DF1" +
            "C1AB76389FE678CAF7C6F860D5BB9C"
        ))).toStrictEqual(expected);
    })
    test("Test #3", () => {
        let expected = hexToBytes("0CC67F5E0D51D7D174146E85393C171F3E7B76456589653ED19025C4B2A69601B685F4EC7D8CCB6EE1E7EC8793A82D55");
        expect(bash384(hexToBytes(
            "466966747920666F7572206279746520" +
            "6F7220666F75722068756E6472656420" +
            "7468697274792074776F20626974206D" +
            "657373616765"
        ))).toStrictEqual(expected);
    })
})

describe("512 bit (l = 256)", () => {
    test("Test #1", () => {
        let expected = hexToBytes("D3A5F9B655CE3EFC1C3E6F2FA1E10F39EC1C3950462097CED1130814868E49E3887581066CD78A97B6685A410E239D12A357FAFF1B252D6310AA1F95FD4A0283");
        expect(bash512(new Uint8Array([]))).toStrictEqual(expected);
    })
    test("Test #2", () => {
        let expected = hexToBytes("2A66C87C189C12E255239406123BDEDBF19955EAF0808B2AD705E249220845E20F4786FB6765D0B5C48984B1B16556EF19EA8192B985E4233D9C09508D6339E7");
        expect(bash512(hexToBytes(
            "B194BAC80A08F53B366D008E584A5DE4" +
            "8504FA9D1BB6C7AC252E72C202FDCE0D" +
            "5BE3D61217B96181FE6786AD716B890B" +
            "5CB0C0FF33C356B835C405AED8E07F"
        ))).toStrictEqual(expected);
    })
    test("Test #3", () => {
        let expected = hexToBytes("38FBE3C7A8F85A6416E876EF884F68886336E5214BC189D5B30079211861B4C8846012005C4316313B31CB0B1FB5011E1FDADF7E48061283BCCBD67DE9131DDA");
        expect(bash512(hexToBytes(
            "466966747920666F7572206279746520" +
            "6F7220666F75722068756E6472656420" +
            "7468697274792074776F20626974206D" +
            "657373616765"
        ))).toStrictEqual(expected);
    })
})