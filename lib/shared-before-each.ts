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
 * @param title A title that's included in all the hooks that this helper uses.
 * @param provider The network provider.
 * @param initializer The initializer to be run before the tests.
 */
export function sharedBeforeEach(
  title: string,
  provider: EthereumProvider,
  initializer: () => Promise<void>
): void;
export function sharedBeforeEach(
  provider: EthereumProvider,
  initializer: () => Promise<void>
): void;
export function sharedBeforeEach(
  titleOrProvider: string | EthereumProvider,
  providerOrInitializer: EthereumProvider | (() => Promise<void>),
  _initializer?: () => Promise<void>
) {
  const title =
    typeof titleOrProvider === "string" ? titleOrProvider : undefined;
  const provider =
    typeof titleOrProvider === "string"
      ? (providerOrInitializer as EthereumProvider)
      : titleOrProvider;
  const initializer =
    "request" in providerOrInitializer ? _initializer! : providerOrInitializer;

  let initalStateSnapshot: string;
  let afterInitializationSnapshot: string;

  before(
    wrapWithTitle(title, "Taking a snapshot of the initial state"),
    async function () {
      initalStateSnapshot = (await provider.request({
        method: "evm_snapshot",
      })) as string;
    }
  );

  before(
    wrapWithTitle(
      title,
      "Running the initializer and taking a snapshot of the results"
    ),
    async function () {
      await initializer();

      afterInitializationSnapshot = (await provider.request({
        method: "evm_snapshot",
      })) as string;
    }
  );

  afterEach(
    wrapWithTitle(
      title,
      "Reseting to the latest snapshot after running a test"
    ),
    async function () {
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
    }
  );

  after(
    wrapWithTitle(title, "Resetting to the initial state"),
    async function () {
      await provider.request({
        method: "evm_revert",
        params: [initalStateSnapshot],
      });
    }
  );
}

function wrapWithTitle(title: string | undefined, str: string) {
  if (title === undefined) {
    return str;
  }

  return `${title} at step "${str}"`;
}
