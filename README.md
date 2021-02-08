# `sharedBeforeEach` and `resetAfter` Mocha helpers for Hardhat Network and Ganache

This repository has two Mocha helpers, [`sharedBeforeEach`](./lib/shared-before-each.ts)
and [`revertAfter`](./lib/revert-after.ts).

`sharedBeforeEach` acts like a `beforeEach`, but executes the initializer just once. It
internally uses Hardhat Network and Ganache's snapshots and reverts instead of re-executing
the initializer. Note that it doesn't revert the state after the tests are executed, so the
modifications made by the last test are visible by others.

`revertAfter` takes a snapshot in a `before` hook, and reverts to it in an `after`.

## Installation

These helpers aren't distributed in any way other than this repository, so just copy and paste them.

## Usage

Just use `sharedBeforeEach` instead of `beforeEach`, and `revertAfter` as you want it.

Something like this:

```js
describe("Contract C", function () {
  revertAfter();

  let c;

  sharedBeforeEach(hre.network.provider, async function () {
    c = await C.deploy();
    c.initializeSomething();
  });

  it("Test something", async function () {
    assert.equals(await c.something(), 123);
  });
});
```

These helpers also works with nested `describe` calls, just like `beforeEach` and `after`.

You can find a real example in [`test/example.ts`](./test/example.ts).

## License

This code is relased under [The Unlicensed](https://unlicense.org) license, so
you can just copy & paste it.
