const path = require("path");
const dotenv = require('dotenv')

const { withPrefix } = require("@onflow/util-address");
const { parseFields } = require("./metadata/fields");

function getConfig() {
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });

  // TOOD: inform the user when config is missing
  const userConfig = require(path.resolve(process.cwd(), "fresh.config.js"));

  const flowConfig = require(path.resolve(process.cwd(), "flow.json"));

  const flowTestnetConfig = require(path.resolve(process.cwd(), "flow.testnet.json"));

  const flowMainnetConfig = require(path.resolve(process.cwd(), "flow.mainnet.json"));

  return {
    //////////////////////////////////////////////
    // ------ App Config
    //////////////////////////////////////////////

    // Store IPFS NFT asset & metadata CIDs and data before pushing to the live network
    // https://github.com/rarepress/nebulus
    nebulusPath: userConfig.ipfsDataPath || "ipfs-data",

    // Location of NFT metadata and assets for minting
    nftDataPath: userConfig.nftDataPath || "nfts.csv",
    nftAssetPath: userConfig.nftAssetPath || "assets",

    onChainMetadata: userConfig.metadataFormat == "on-chain",

    // Metadata fields defined by the user
    metadataFields: parseFields(userConfig.metadataFields || []),

    //////////////////////////////////////////////
    // ------ IPFS Config
    //////////////////////////////////////////////

    pinningService: userConfig.pinningService,

    // pinningService: {
    //   endpoint: "PINNING_SERVICE_ENDPOINT",
    //   key: "PINNING_SERVICE_KEY"
    // },

    // If you're running IPFS on a non-default port, update this URL. If you're using the IPFS defaults, you should be all set.
    ipfsApiUrl: userConfig.ipfsApiUrl || "http://localhost:8081/ipfs",

    // If you're running the local IPFS gateway on a non-default port, or if you want to use a public gatway when displaying IPFS gateway urls, edit this.

    ipfsGatewayUrl: userConfig.ipfsGatewayUrl || "http://localhost:4001",

    //////////////////////////////////////////////
    // ------ Emulator Config
    //////////////////////////////////////////////

    // This is the default owner address and signing key for all newly minted NFTs
    emulatorFlowAccount: userConfig.emulatorFlowAccount
      ? getAccount(userConfig.emulatorFlowAccount, flowConfig)
      : getAccount("emulator-account", flowConfig),

    //////////////////////////////////////////////
    // ------ Testnet Config
    //////////////////////////////////////////////

    // This is the default owner address and signing key for all newly minted NFTs
    testnetFlowAccount: userConfig.testnetFlowAccount
      ? getAccount(userConfig.testnetFlowAccount, flowTestnetConfig)
      : getAccount("testnet-account", flowTestnetConfig),

    //////////////////////////////////////////////
    // ------ Mainnet Configs
    //////////////////////////////////////////////

    // This is the default owner address and signing key for all newly minted NFTs
    mainnetFlowAccount: userConfig.mainnetFlowAccount
      ? getAccount(userConfig.mainnetFlowAccount, flowMainnetConfig)
      : getAccount("mainnet-account", flowMainnetConfig)
  };
}

// Expand template variable in flow.json
// Ref: https://stackoverflow.com/a/58317158/3823815
function expand(template, data) {
  return template.replace(/\$\{(\w+)\}/g, (_, name) => data[name] || "?");
}

function getAccount(name, flowConfig) {
  const account = flowConfig.accounts[name];
  const address = withPrefix(expand(account.address, process.env));

  return { name, address };
}

module.exports = getConfig;
