import { EthereumProvider } from "hardhat/types";

declare module "mocha" {
  interface Test {
    __alreadyResetted?: boolean;
  }
}

/**
 * This Mocha helper acts as a beforeEach, but executes the initializer
 * just once. It internally uses Hardhat Network and Ganache's snapshots
 * and revert instead of re-executing the initializer.
 *
 * @param provider The network provider.
 * @param initializer The initializer to be run before the tests.
 */
export function sharedBeforeEach(
  provider: EthereumProvider,
  initializer: () => Promise<void>
) {
  let initalStateSnapshot: string;
  let afterInitializationSnapshot: string;

  before("Take initial state snapshot", async function () {
    initalStateSnapshot = (await provider.request({
      method: "evm_snapshot",
    })) as string;
  });

  before("Run the initializer and snapshot", async function () {
    await initializer();

    afterInitializationSnapshot = (await provider.request({
      method: "evm_snapshot",
    })) as string;
  });

  afterEach("Reset after test", async function () {
    if (this.currentTest === undefined || this.currentTest === null) {
      return;
    }

    if (this.currentTest.__alreadyResetted === true) {
      return;
    }

    await provider.request({
      method: "evm_revert",
      params: [afterInitializationSnapshot],
    });

    afterInitializationSnapshot = (await provider.request({
      method: "evm_snapshot",
    })) as string;

    this.currentTest.__alreadyResetted = true;
  });

  after("Reset to initial state", async function () {
    await provider.request({
      method: "evm_revert",
      params: [initalStateSnapshot],
    });
  });
}
