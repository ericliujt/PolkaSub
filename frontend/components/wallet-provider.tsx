"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface WalletContextType {
  address: string | null
  chainId: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  isConnecting: boolean
  isConnected: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  const connectWallet = async () => {
    try {
      setIsConnecting(true)

      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed. Please install MetaMask to use this application.")
      }

      // Request account access
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send("eth_requestAccounts", [])

      if (accounts.length === 0) {
        throw new Error("No accounts found. Please unlock your MetaMask wallet.")
      }

      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()
      const chainId = network.chainId.toString()

      setProvider(provider)
      setSigner(signer)
      setAddress(address)
      setChainId(chainId)
      setIsConnected(true)

      // Listen for account changes
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      // Listen for chain changes
      window.ethereum.on("chainChanged", handleChainChanged)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAddress(null)
    setChainId(null)
    setProvider(null)
    setSigner(null)
    setIsConnected(false)

    // Remove listeners
    if (window.ethereum) {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      window.ethereum.removeListener("chainChanged", handleChainChanged)
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      disconnectWallet()
    } else {
      // User switched accounts
      setAddress(accounts[0])
    }
  }

  const handleChainChanged = (chainId: string) => {
    // User switched networks
    setChainId(chainId)
    // Refresh the page to ensure all state is updated correctly
    window.location.reload()
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [])

  return (
    <WalletContext.Provider
      value={{
        address,
        chainId,
        provider,
        signer,
        isConnecting,
        isConnected,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function ConnectWalletButton() {
  const { connectWallet, isConnecting, isConnected } = useWallet()

  if (isConnected) {
    return null
  }

  return (
    <Button
      onClick={connectWallet}
      disabled={isConnecting}
      className="w-full md:w-auto bg-polkadot-pink hover:bg-polkadot-pink-dark text-white"
    >
      {isConnecting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        "Connect MetaMask"
      )}
    </Button>
  )
}

// Add this to make TypeScript happy with the window.ethereum property
declare global {
  interface Window {
    ethereum?: any
  }
}
