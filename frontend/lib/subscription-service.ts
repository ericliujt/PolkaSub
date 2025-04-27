import type { ethers } from "ethers"

export interface PaymentHistory {
  id: string
  date: string
  amount: string
  blockNumber: number
  status: "Completed" | "Pending" | "Failed"
  explorerLink: string
  txHash: string
}

export interface Subscription {
  id: string
  name: string
  recipient: string
  amount: string
  interval: string
  nextPayment: string
  contractAddress: string
  createdAt: string
  paymentHistory: PaymentHistory[]
}

// Mock data for demonstration purposes
// In a real application, this would interact with smart contracts on Westend
const MOCK_SUBSCRIPTIONS: Record<string, Subscription[]> = {}

// Generate some mock subscriptions for demo purposes with payment history
export async function fetchSubscriptions(address: string): Promise<Subscription[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // If no subscriptions exist for this address, create a dummy one
  if (!MOCK_SUBSCRIPTIONS[address.toLowerCase()]) {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const dummySubscription: Subscription = {
      id: `sub_${Date.now()}`,
      name: "Daily Newsletter",
      recipient: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      amount: "0.5",
      interval: "daily",
      nextPayment: today.toLocaleDateString(),
      contractAddress: `0x${generateRandomHex(40)}`,
      createdAt: yesterday.toLocaleDateString(),
      paymentHistory: [
        {
          id: `payment_${Date.now()}`,
          date: yesterday.toLocaleDateString(),
          amount: "0.5",
          blockNumber: 12345678,
          status: "Completed",
          explorerLink: "https://westend.subscan.io/block/25780318",
          txHash: `0x${generateRandomHex(64)}`,
        },
      ],
    }

    MOCK_SUBSCRIPTIONS[address.toLowerCase()] = [dummySubscription]
  }

  // Return mock data
  return MOCK_SUBSCRIPTIONS[address.toLowerCase()] || []
}

// Update the createSubscription function to include an immediate first payment

export async function createSubscription(
  signer: ethers.JsonRpcSigner,
  name: string,
  recipient: string,
  amount: number,
  interval: string,
): Promise<void> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const address = await signer.getAddress()
  const today = new Date()
  const txHash = `0x${generateRandomHex(64)}`
  const blockNumber = 25780318 + Math.floor(Math.random() * 10000)

  // Create a mock subscription with immediate first payment
  const newSubscription: Subscription = {
    id: `sub_${Date.now()}`,
    name,
    recipient,
    amount: amount.toString(),
    interval,
    nextPayment: getNextPaymentDate(interval),
    contractAddress: `0x${generateRandomHex(40)}`,
    createdAt: today.toLocaleDateString(),
    paymentHistory: [
      {
        id: `payment_${Date.now()}`,
        date: today.toLocaleDateString(),
        amount: amount.toString(),
        blockNumber,
        status: "Completed",
        explorerLink: `https://westend.subscan.io/block/${blockNumber}`,
        txHash,
      },
    ],
  }

  // Add to mock storage
  const lowerCaseAddress = address.toLowerCase()
  if (!MOCK_SUBSCRIPTIONS[lowerCaseAddress]) {
    MOCK_SUBSCRIPTIONS[lowerCaseAddress] = []
  }

  MOCK_SUBSCRIPTIONS[lowerCaseAddress].push(newSubscription)
}

export async function cancelSubscription(signer: ethers.JsonRpcSigner, subscriptionId: string): Promise<void> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const address = await signer.getAddress()
  const lowerCaseAddress = address.toLowerCase()

  // Remove from mock storage
  if (MOCK_SUBSCRIPTIONS[lowerCaseAddress]) {
    MOCK_SUBSCRIPTIONS[lowerCaseAddress] = MOCK_SUBSCRIPTIONS[lowerCaseAddress].filter(
      (sub) => sub.id !== subscriptionId,
    )
  }
}

// Helper functions
function getNextPaymentDate(interval: string): string {
  // Check if it's a block-based interval
  if (interval.includes("blocks")) {
    const currentBlock = Math.floor(Math.random() * 10000000) // Mock current block
    const blockInterval = Number.parseInt(interval.split(" ")[0])
    const nextBlock = currentBlock + blockInterval
    return `Block #${nextBlock}`
  }

  // Otherwise it's time-based
  const date = new Date()

  switch (interval) {
    case "daily":
      date.setDate(date.getDate() + 1)
      break
    case "weekly":
      date.setDate(date.getDate() + 7)
      break
    case "monthly":
      date.setMonth(date.getMonth() + 1)
      break
  }

  return date.toLocaleDateString()
}

function generateRandomHex(length: number): string {
  const characters = "0123456789abcdef"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}
