import { BigInteger } from '@melonproject/token-math';

import { getGlobalEnvironment } from '~/utils/environment';

const debug = require('~/utils/getDebug').default(__filename);
const { toBI, greaterThan } = BigInteger;

export interface PreparedTransaction {
  encoded: string;
  gasEstimation: number;
  name: string;
  transaction: any;
}

export const prepareTransaction = async (
  transaction,
  environment = getGlobalEnvironment(),
): Promise<PreparedTransaction> => {
  const encoded = transaction.encodeABI();
  const gasEstimation = await transaction.estimateGas({
    from: environment.wallet.address,
  });

  debug(
    'Prepared transaction:',
    transaction.name,
    transaction.arguments,
    gasEstimation,
    encoded,
  );

  if (greaterThan(toBI(gasEstimation), toBI(environment.options.gasLimit))) {
    throw new Error(
      [
        `Estimated gas consumption (${gasEstimation})`,
        `is higher than the provided gas limit: ${
          environment.options.gasLimit
        }`,
      ].join(' '),
    );
  }

  const prepared = {
    encoded,
    gasEstimation,
    name: transaction.name,
    transaction,
  };

  return prepared;
};
