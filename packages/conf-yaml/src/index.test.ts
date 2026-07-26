"use strict";

const YAMLConf = require("../");

const path = require("path");
const { rimraf } = require("rimraf");
const fs = require("node:fs/promises");
const dir = path.join(__dirname, "conf");

let yamlConfs;

// Must return the promise: beforeAll recreates the directory right after, so
// a fire-and-forget rimraf can land after the mkdir and wipe it again.
const clean = () => rimraf(dir);

beforeAll(async () => {
  await clean();

  await fs.mkdir(dir, { recursive: true });
  yamlConfs = new YAMLConf({ dirName: dir });
});

afterAll(clean);

test("store new conf", async () => {
  const res = await yamlConfs.store({ cfgNum: 1, f1: "field 1", _utime: 11 });
  expect(res).toBeTruthy();
});

test("read new conf", async () => {
  const res = await yamlConfs.load(1);
  expect(res.f1).toEqual("field 1");
});

test("store updated conf", async () => {
  const res = await yamlConfs.store({ cfgNum: 1, f1: "field 2" });
  expect(res).toBe(true);
});

test("read updated conf", async () => {
  const res = await yamlConfs.load(1);
  expect(res.f1).toEqual("field 2");
});

test("available", async () => {
  const res = await yamlConfs.available();
  expect(res).toEqual([1]);
});

test("lastCfg", async () => {
  const res = await yamlConfs.lastCfg();
  expect(res).toEqual(1);
});
