const db = await vi.importActual<typeof import("server/db-pool.js")>(
  "server/db-pool"
);

export default {
  ...db.default,
  tx: vi.fn((name: string, transaction: (tx: unknown) => Promise<unknown>) =>
    // Because nested transactions are committed the moment they're done, even
    // when a parent transaction exists, we need to make sure that transactions
    // are not actually executed as such during tests. We then turn them into
    // conditional transactions where the condition is always false. This
    // is functionally equivalent (aside from the transaction part).
    db.default.txIf(
      {
        tag: name,
        cnd: false,
      },
      transaction
    )
  ),
};
