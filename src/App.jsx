import React, { useState } from 'react';
import * as ethers from 'ethers';
import { Web3Provider } from '@ethersproject/providers'; // Import Web3Provider
import './App.css';
import { Buffer } from 'buffer';

const contractAddress = '0x19712794c847f0fe4f6a59fca8db12a0b35f8387'; // Replace with your deployed contract address
const abi = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "balance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bool",
        "name": "_side",
        "type": "bool"
      }
    ],
    "name": "flipCoin",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

function App() {
  const [wallet, setWallet] = useState(100); // Simulated wallet balance
  const [bet, setBet] = useState('');
  const [selectedSide, setSelectedSide] = useState('');
  const [result, setResult] = useState('');
  const [message, setMessage] = useState('');
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [connected, setConnected] = useState(false); // Track connection status

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      console.log('MetaMask is installed');
      try {
        const provider = new Web3Provider(window.ethereum); // Use Web3Provider here
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);

        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('Connected accounts:', accounts);

        setProvider(provider);
        setContract(contract);
        setConnected(true); // Update connection status
      } catch (error) {
        console.error('Error connecting wallet:', error);
        setConnected(false);
      }
    } else {
      alert('MetaMask is not installed');
      setConnected(false);
    }
  };

  const checkConnection = async () => {
    if (provider) {
      try {
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setConnected(true);
        } else {
          setConnected(false);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
        setConnected(false);
      }
    } else {
      setConnected(false);
    }
  };

  const flipCoin = async () => {
    if (!provider || !contract) {
      alert('Wallet not connected');
      return;
    }
    if (bet > wallet) {
      setMessage("Insufficient tokens in wallet.");
      return;
    }
    if (!selectedSide || !bet) {
      setMessage("Please select a side and enter a bet amount.");
      return;
    }
  
    try {
      const tx = await contract.flipCoin(selectedSide === 'Heads', {
        value: ethers.utils.parseEther(bet.toString()),
        gasLimit: ethers.utils.hexlify(100000) // Example gas limit, adjust as needed
      });
      await tx.wait();
      const balance = await provider.getBalance(contractAddress);
      setWallet(wallet + parseFloat(ethers.utils.formatEther(balance))); // Update wallet balance
      setMessage('Transaction successful!');
    } catch (error) {
      console.error('Transaction failed:', error);
      if (error.code === 'INSUFFICIENT_FUNDS') {
        setMessage('Transaction failed: Insufficient funds for gas + value.');
      } else {
        setMessage(`Transaction failed: ${error.message}`);
      }
    }
  
    setBet('');
    setSelectedSide('');
  };
  
  
  

  return (
    <div className="App">
      <h1>Coinflip Game</h1>
      <button onClick={connectWallet}>
        {connected ? 'Wallet Connected' : 'Connect Wallet'}
      </button>
      <button onClick={checkConnection}>Check Connection</button>
      <p>Wallet Balance: {wallet} tokens</p>
      <input
        type="number"
        placeholder="Enter bet amount"
        value={bet}
        onChange={(e) => setBet(e.target.value)}
      />
      <div>
        <label>
          <input
            type="radio"
            name="side"
            value="Heads"
            checked={selectedSide === 'Heads'}
            onChange={() => setSelectedSide('Heads')}
          />
          Heads
        </label>
        <label>
          <input
            type="radio"
            name="side"
            value="Tails"
            checked={selectedSide === 'Tails'}
            onChange={() => setSelectedSide('Tails')}
          />
          Tails
        </label>
      </div>
      <button onClick={flipCoin}>Flip Coin</button>
      {result && <p>Coin landed on: {result}</p>}
      {message && <p>{message}</p>}
    </div>
  );
}

export default App;


