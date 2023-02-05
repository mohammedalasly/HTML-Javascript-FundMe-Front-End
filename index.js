// Import ethers

import { ethers } from "./ethers-5.4.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

console.log(ethers)

async function connect() {
    // check if window.ethereum is exist
    if (typeof window.ethereum !== "undefined") {
        // connect our MetaMask
        await window.ethereum.request({ method: "eth_requestAccounts" })
        connectButton.innerHTML = "Connected!"
    } else {
        connectButton.innerHTML = "Please, install MetaMask"
    }
}

// Get Balance function:
async function getBalance() {
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

// fund function
async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}...`)
    if (typeof window.ethereum !== "undefined") {
        /*to send a transaction, we need:*/
        //1- Provider / connection to the blockchain
        const provider = new ethers.providers.Web3Provider(window.ethereum) // to find the http
        //2- Signer / wallet / someone with some gas
        const signer = provider.getSigner() // return whichever wallet is connectd from the provider
        //3- Contract to interact with (ABI & address)
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            // create our transaction:
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!")
        } catch (error) {
            console.log(error)
        }
    }
}

// listen for the tx to be mined
function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    // to create a listener for the blockchain
    return new Promise((resolve, reject) => {
        //listen for this transaction to finish
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}

// withdraw function
async function withdraw() {
    if (typeof window.ethereum != "undefined") {
        console.log("Withrawing...")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}
