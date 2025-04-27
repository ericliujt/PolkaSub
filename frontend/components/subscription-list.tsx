"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/components/wallet-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2, AlertCircle, ChevronDown, ChevronUp, ExternalLink, Calendar, Clock } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { type Subscription, fetchSubscriptions, cancelSubscription } from "@/lib/subscription-service"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function SubscriptionList() {
  const { address, signer } = useWallet()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (address) {
      loadSubscriptions()
    }
  }, [address])

  const loadSubscriptions = async () => {
    if (!address) return

    setIsLoading(true)
    setError(null)

    try {
      const subs = await fetchSubscriptions(address)
      setSubscriptions(subs)
    } catch (err) {
      console.error("Failed to load subscriptions:", err)
      setError("Failed to load your subscriptions. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!address || !signer) return

    setCancellingId(subscriptionId)

    try {
      await cancelSubscription(signer, subscriptionId)
      // Remove the cancelled subscription from the list
      setSubscriptions(subscriptions.filter((sub) => sub.id !== subscriptionId))
    } catch (err) {
      console.error("Failed to cancel subscription:", err)
      setError("Failed to cancel the subscription. Please try again.")
    } finally {
      setCancellingId(null)
    }
  }

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null)
    } else {
      setExpandedId(id)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-polkadot-pink" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (subscriptions.length === 0) {
    return (
      <Card className="border-polkadot-pink/20">
        <CardHeader className="bg-polkadot-black text-white rounded-t-lg">
          <CardTitle>No Active Subscriptions</CardTitle>
          <CardDescription className="text-gray-300">
            You don't have any active subscriptions. Create a new subscription to get started.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="border-polkadot-pink/20">
      <CardHeader className="bg-polkadot-black text-white rounded-t-lg">
        <CardTitle>Active Subscriptions</CardTitle>
        <CardDescription className="text-gray-300">
          Manage your active subscription payments on Westend testnet
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {subscriptions.map((subscription) => (
            <div key={subscription.id} className="border border-border rounded-lg overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                onClick={() => toggleExpand(subscription.id)}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <div className="font-medium text-lg text-polkadot-pink">{subscription.name}</div>
                  <Badge variant="outline" className="w-fit">
                    {subscription.amount} WND
                  </Badge>
                  <Badge variant="secondary" className="w-fit">
                    {subscription.interval}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCancelSubscription(subscription.id)
                    }}
                    disabled={cancellingId === subscription.id}
                    className="bg-polkadot-pink hover:bg-polkadot-pink-dark"
                  >
                    {cancellingId === subscription.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                  {expandedId === subscription.id ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </div>

              {expandedId === subscription.id && (
                <div className="p-4 bg-secondary/50 border-t border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Recipient</h4>
                      <p className="font-mono text-sm">{subscription.recipient}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Contract Address</h4>
                      <a
                        href={`https://westend.subscan.io/account/${subscription.contractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-polkadot-pink hover:text-polkadot-pink-light flex items-center gap-1"
                      >
                        {formatAddress(subscription.contractAddress)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Next Payment</h4>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-polkadot-pink" />
                        <span>{subscription.nextPayment}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Created On</h4>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-polkadot-pink" />
                        <span>{subscription.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <h4 className="font-medium mb-3">Payment History</h4>
                  {subscription.paymentHistory.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Block</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Proof</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subscription.paymentHistory.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>{payment.date}</TableCell>
                            <TableCell>{payment.amount} WND</TableCell>
                            <TableCell>#{payment.blockNumber}</TableCell>
                            <TableCell>
                              <Badge
                                variant={payment.status === "Completed" ? "default" : "outline"}
                                className={
                                  payment.status === "Completed" ? "bg-green-700 hover:bg-green-700" : "text-yellow-500"
                                }
                              >
                                {payment.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <a
                                href={payment.explorerLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-polkadot-pink hover:text-polkadot-pink-light"
                              >
                                View
                                <ExternalLink className="ml-1 h-3 w-3" />
                              </a>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground text-sm">No payment history available yet.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
