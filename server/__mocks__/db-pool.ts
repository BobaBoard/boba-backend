export default {
  ...jest.requireActual("server/db-pool").default,
  tx: jest.fn((name: string, transaction: any) =>
    // Because nested transactions are committed the moment they're done, even
    // when a parent transaction exists, we need to make sure that transactions
    // are not actually executed as such during tests. We then turn them into
    // conditional transactions where the condition is always false. This
    // is functionally equivalent (aside from the transaction part).
    jest.requireActual("server/db-pool").default.txIf(
      {
        tag: name,
        cnd: false,
      },
      transaction
    )
  ),
};
