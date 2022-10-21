const { assert, expect } = require("chai")
const { getNamedAccounts, ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Test", function () {
          console.log("Starting testing modules...")
          let raffle, raffleEntranceFee, deployer

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              raffle = await ethers.getContract("Raffle", deployer)
              console.log(`Raffle at ${raffle.address}`)
              raffleEntranceFee = await raffle.getEntranceFee()
          })

          describe("fulfillRandomWords", function () {
              it("Works with live Chainlink Keepers and VRF, we get a random winner", async function () {
                  const startingTimeStamp = await raffle.getLatestTimeStamp()
                  const accounts = await ethers.getSigners()

                  console.log("Initiating listener...")
                  await new Promise(async (resolve, reject) => {
                      raffle.once("WinnerPicked", async () => {
                          console.log("WinnerPicked event fired!")
                          try {
                              const recentWinner = await raffle.getRecentWinner()
                              const raffleState = await raffle.getRaffleState()
                              const winnerEndingBalance = await accounts[0].getBalance()
                              const endingTimeStamp = await raffle.getLatestTimeStamp()

                              await expect(raffle.getPlayers(0)).to.be.reverted
                              assert.equal(recentWinner.toString(), accounts[0].address)
                              assert.equal(raffleState, 0)
                              assert.equal(
                                  winnerEndingBalance.toString(),
                                  winnerStartingBalance.add(raffleEntranceFee).toString()
                              )
                              assert(endingTimeStamp > startingTimeStamp)

                              resolve()
                          } catch (e) {
                              console.log(e)
                              reject(e)
                          }
                      })
                      console.log("Entering Raffle...")
                      const txResponse = await raffle.enterRaffle({ value: raffleEntranceFee })
                      await txResponse.wait(1)
                      const winnerStartingBalance = await accounts[0].getBalance()
                      console.log(
                          "Awaiting for CL Keeper to 'Perform Upkeep' [Raffle.checkUpkeep()]"
                      )
                  })
              })
          })
      })
