import { Suspense } from "react"
import SubscriptionDashboard from "@/components/subscription-dashboard"
import { WalletProvider } from "@/components/wallet-provider"
import LoadingDashboard from "@/components/loading-dashboard"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-center text-polkadot-pink">PolkaSub</h1>
      <p className="text-center text-muted-foreground mb-8">A subscription manager on Polkadot Westend</p>
      <WalletProvider>
        <Suspense fallback={<LoadingDashboard />}>
          <SubscriptionDashboard />
        </Suspense>
      </WalletProvider>
    </main>
  )
}
