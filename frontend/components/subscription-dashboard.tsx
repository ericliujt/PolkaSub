"use client"

import { useState } from "react"
import { useWallet, ConnectWalletButton } from "@/components/wallet-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, X } from "lucide-react"
import SubscriptionList from "@/components/subscription-list"
import CreateSubscriptionForm from "@/components/create-subscription-form"
import AccountSelector from "@/components/account-selector"

export default function SubscriptionDashboard() {
  const { isConnected } = useWallet()
  const [showCreateForm, setShowCreateForm] = useState(false)

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto border-polkadot-pink/20">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <h2 className="text-xl font-semibold">Connect Your Wallet</h2>
            <p className="text-center text-muted-foreground mb-4">
              Connect to MetaMask to manage your subscriptions on Westend testnet.
            </p>
            <ConnectWalletButton />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-polkadot-pink">Subscription Dashboard</h2>
          <p className="text-muted-foreground">Manage your recurring payments on Westend testnet</p>
        </div>
        <div className="flex items-center gap-2">
          {!showCreateForm && (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-polkadot-pink hover:bg-polkadot-pink-dark text-white"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Subscription
            </Button>
          )}
          <AccountSelector />
        </div>
      </div>

      {showCreateForm ? (
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 text-gray-400 hover:text-white z-10"
            onClick={() => setShowCreateForm(false)}
          >
            <X className="h-5 w-5" />
          </Button>
          <CreateSubscriptionForm onSuccess={() => setShowCreateForm(false)} />
        </div>
      ) : (
        <SubscriptionList />
      )}
    </div>
  )
}
