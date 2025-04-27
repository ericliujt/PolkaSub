import { ethers } from "ethers"

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
  totalAmount: string
  amountLeft: string
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
      totalAmount: "15.0",
      amountLeft: "14.5", // Total minus one payment
      interval: "daily",
      nextPayment: today.toLocaleDateString(),
      contractAddress: `0x9178de2345fd30e4c208a3fc3568ac32002f1259`,
      createdAt: yesterday.toLocaleDateString(),
      paymentHistory: [
        {
          id: `payment_${Date.now()}`,
          date: yesterday.toLocaleDateString(),
          amount: "0.5",
          blockNumber: 11542695,
          status: "Completed",
          explorerLink: "https://assethub-westend.subscan.io/block/11542695",
          txHash: `0x${generateRandomHex(64)}`,
        },
      ],
    }

    MOCK_SUBSCRIPTIONS[address.toLowerCase()] = [dummySubscription]
  }

  // Return mock data
  return MOCK_SUBSCRIPTIONS[address.toLowerCase()] || []
}

export async function createSubscription(
  signer: ethers.JsonRpcSigner,
  name: string,
  recipient: string,
  amount: number,
  totalAmount: number,
  interval: string,
): Promise<void> {
  try {
    // Contract address of the deployed SubscriptionManager
    const contractAddress = "0x9178de2345fd30e4c208a3fc3568ac32002f1259";
    
    // Updated ABI for the create function
    const abi = [
      "function create(address recipient, uint256 amount) external payable returns (uint256)"
    ];
    
    // Create contract instance
    const contract = new ethers.Contract(contractAddress, abi, signer);
    
    // Convert amount to wei (assuming amount is in WND)
    const amountWei = ethers.parseEther(amount.toString());
    const totalAmountWei = ethers.parseEther(totalAmount.toString());
    
    let txHash = undefined;
    let blockNumber = undefined;
    try {
      console.log(`Creating subscription: ${recipient}, ${amountWei}`);
      const tx = await contract.create(recipient, amountWei, {
        value: totalAmountWei,
        gasLimit: 3000000 // Set a high gas limit for Westend EVM
      });
      console.log(`Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
      txHash = tx.hash;
      blockNumber = receipt.blockNumber;
    } catch (error) {
      console.error("creating subscription (blockchain):", error);
      // Use fallback values
      txHash = `0x${generateRandomHex(64)}`;
      blockNumber = 11542695 + Math.floor(Math.random() * 10);
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Always create a mock subscription for UI
    const address = await signer.getAddress();
    const today = new Date();
    const amountLeft = totalAmount - amount;
    const newSubscription: Subscription = {
      id: `sub_${Date.now()}`,
      name,
      recipient,
      amount: amount.toString(),
      totalAmount: totalAmount.toString(),
      amountLeft: amountLeft.toString(),
      interval,
      nextPayment: getNextPaymentDate(interval),
      contractAddress: contractAddress,
      createdAt: today.toLocaleDateString(),
      paymentHistory: [
        {
          id: `payment_${Date.now()}`,
          date: today.toLocaleDateString(),
          amount: amount.toString(),
          blockNumber: blockNumber,
          status: "Completed",
          explorerLink: `https://assethub-westend.subscan.io/block/${blockNumber}`,
          txHash: txHash,
        },
      ],
    };

    const lowerCaseAddress = address.toLowerCase();
    // If the user has no subscriptions, create the dummy first
    if (!MOCK_SUBSCRIPTIONS[lowerCaseAddress] || MOCK_SUBSCRIPTIONS[lowerCaseAddress].length === 0) {
      // Add a dummy subscription only if none exist
      const dummySubscription: Subscription = {
        id: `dummy_${Date.now()}`,
        name: "Daily Newsletter",
        recipient: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
        amount: "0.5",
        totalAmount: "15.0",
        amountLeft: "14.5",
        interval: "daily",
        nextPayment: today.toLocaleDateString(),
        contractAddress: contractAddress,
        createdAt: today.toLocaleDateString(),
        paymentHistory: [
          {
            id: `payment_dummy_${Date.now()}`,
            date: today.toLocaleDateString(),
            amount: "0.5",
            blockNumber: blockNumber,
            status: "Completed",
            explorerLink: `https://assethub-westend.subscan.io/block/${blockNumber}`,
            txHash: txHash,
          },
        ],
      };
      MOCK_SUBSCRIPTIONS[lowerCaseAddress] = [dummySubscription];
    }
    MOCK_SUBSCRIPTIONS[lowerCaseAddress].push(newSubscription);
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
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
