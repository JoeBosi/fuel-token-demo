require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ quiet: true });

const { AMOY_RPC_URL, DEPLOYER_PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.28",
  networks: {
    // Polygon Amoy test network (chain id 80002). Only active if you set a key in .env
    amoy: {
      url: AMOY_RPC_URL || "https://polygon-amoy-bor-rpc.publicnode.com",
      chainId: 80002,
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
    },
  },
};
