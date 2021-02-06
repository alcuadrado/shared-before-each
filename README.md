# `sharedBeforeEach` Mocha helper for Hardhat Network and Ganache

This repository has a single Mocha helper, [`sharedBeforeEach`](./lib/shared-before-each.ts)
which acts like a `beforeEach`. It acts as `beforeEach`, but executes the initializer
just once. It internally uses Hardhat Network and Ganache's snapshots and reverts instead of
re-executing the initializer.

## Installation

This helper isn't distributed in any way other than this repository, so just copy and paste it.

## Usage

Just use it instead of `beforeEach`. Something like this:

```js
describe("Contract C", function () {
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

This helper also works with nested `describe` calls, just like `beforeEach`.

You can find a real example in [`test/example.ts`](./test/example.ts).

## License

This code is relased under [The Unlicensed](https://unlicense.org) license, so
you can just copy & paste it.
