require("@nomiclabs/hardhat-waffle");
require("hardhat-deploy");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
      hardhat: {
          chainId: 1337
      }
  }
};
