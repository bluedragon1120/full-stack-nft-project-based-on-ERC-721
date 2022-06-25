import "@nomiclabs/hardhat-waffle";
import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers";
import "hardhat-contract-sizer";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-deploy";
import { HardhatUserConfig } from "hardhat/types";

require("dotenv").config();

const config: HardhatUserConfig = {
  // defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      loggingEnabled: false,
    },
    matic: {
      url: "https://matic-mumbai.chainstacklabs.com",
      chainId: 80001,
      accounts: [`${process.env.PRIVATE_KEY}`],
    },
  },
  solidity: {
    version: "0.8.13",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  namedAccounts: {
    deployer: 0,
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY || "",
  },
};

export default config;
