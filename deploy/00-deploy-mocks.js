const { developmentChains } = require("../helper-hardhat-config")

const BASE_FEE = ethers.utils.parseEther("0.25") // 0.25 is the premium, what it costs to request a random number
const GAS_PRICE_LINK = 1e9 // (LINK per gas). The gas that is paid by the Oracle to callback our contract (and do all the offchain computational)

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    // const chainId = network.config.chainId //network.name
    const args = [BASE_FEE, GAS_PRICE_LINK]

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: args,
        })
        log("Mocks Deployed!!")
        log("--------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
