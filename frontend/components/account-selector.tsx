"use client"

import { useWallet } from "@/components/wallet-provider"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function AccountSelector() {
  const { address, disconnectWallet } = useWallet()

  if (!address) {
    return null
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="px-4 py-2 rounded-md bg-polkadot-black text-white text-sm font-medium">
        {formatAddress(address)}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={disconnectWallet}
        title="Disconnect wallet"
        className="text-polkadot-pink hover:text-polkadot-pink-dark hover:bg-polkadot-pink/10"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  )
}
