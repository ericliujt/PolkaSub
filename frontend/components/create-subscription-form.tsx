"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/components/wallet-provider"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { createSubscription } from "@/lib/subscription-service"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const formSchema = z
  .object({
    name: z.string().min(1, "Subscription name is required"),
    recipient: z
      .string()
      .startsWith("0x", "Ethereum address must start with 0x")
      .length(42, "Ethereum address must be exactly 42 characters"),
    amount: z.string().refine((val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
    totalAmount: z.string().refine((val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) > 0, {
      message: "Total amount must be a positive number",
    }),
    intervalType: z.enum(["time", "blocks"]),
    timeInterval: z.enum(["daily", "weekly", "monthly"]).optional(),
    blockInterval: z
      .string()
      .refine((val) => !val || (!isNaN(Number.parseInt(val)) && Number.parseInt(val) > 0), {
        message: "Block interval must be a positive number",
      })
      .optional(),
  })
  .refine(
    (data) => {
      const amount = Number.parseFloat(data.amount)
      const totalAmount = Number.parseFloat(data.totalAmount)
      return totalAmount >= amount
    },
    {
      message: "Total amount must be greater than or equal to the payment amount",
      path: ["totalAmount"],
    },
  )

interface CreateSubscriptionFormProps {
  onSuccess?: () => void
}

export default function CreateSubscriptionForm({ onSuccess }: CreateSubscriptionFormProps) {
  const { address, signer } = useWallet()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [intervalType, setIntervalType] = useState<"time" | "blocks">("time")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      recipient: "",
      amount: "",
      totalAmount: "",
      intervalType: "time",
      timeInterval: "monthly",
      blockInterval: "1000",
    },
  })

  // Watch the amount field to update the total amount suggestion
  const amountValue = form.watch("amount")

  useEffect(() => {
    if (amountValue && !form.getValues("totalAmount")) {
      // Suggest a total amount that covers 12 payments
      const suggestedTotal = (Number.parseFloat(amountValue) * 12).toFixed(2)
      form.setValue("totalAmount", suggestedTotal)
    }
  }, [amountValue, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!address || !signer) return

    setIsSubmitting(true)
    setSuccess(false)
    setError(null)

    try {
      const interval =
        values.intervalType === "time" ? (values.timeInterval as string) : `${values.blockInterval} blocks`

      await createSubscription(
        signer,
        values.name,
        values.recipient,
        Number.parseFloat(values.amount),
        Number.parseFloat(values.totalAmount),
        interval,
      )

      setSuccess(true)
      form.reset({
        name: "",
        recipient: "",
        amount: "",
        totalAmount: "",
        intervalType: intervalType,
        timeInterval: "monthly",
        blockInterval: "1000",
      })

      // Call onSuccess callback after a short delay to show the success message
      setTimeout(() => {
        if (onSuccess) onSuccess()
      }, 1500)
    } catch (err) {
      console.error("Failed to create subscription:", err)
      setError("Failed to create the subscription. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleIntervalTypeChange = (value: string) => {
    setIntervalType(value as "time" | "blocks")
    form.setValue("intervalType", value as "time" | "blocks")
  }

  return (
    <Card className="border-polkadot-pink/20">
      <CardHeader className="bg-polkadot-black text-white rounded-t-lg">
        <CardTitle>Create New Subscription</CardTitle>
        <CardDescription className="text-gray-300">
          Set up a recurring payment to a recipient on Westend testnet
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Alert className="mb-6 bg-secondary border-polkadot-pink/20">
          <Info className="h-4 w-4 text-polkadot-pink" />
          <AlertDescription className="text-sm">
            Specify the periods of subscription will be held. Then transfer the total amount to the smart contract. The
            smart contract will then periodically pay the recipient according to how the subscription is set up.
          </AlertDescription>
        </Alert>

        {success && (
          <Alert className="mb-6 bg-green-900 text-green-100 border-green-700">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Your subscription has been created successfully with an immediate first payment.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subscription Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Monthly Rent" {...field} />
                  </FormControl>
                  <FormDescription>A name to help you identify this subscription</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recipient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Address</FormLabel>
                  <FormControl>
                    <Input placeholder="0x..." {...field} />
                  </FormControl>
                  <FormDescription>The Ethereum address that will receive the payments</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Amount (WND)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormDescription>Amount in Westend tokens to send each period</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Amount (WND)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormDescription>Total amount to deposit for all payments</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="intervalType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interval Type</FormLabel>
                  <Tabs
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value)
                      handleIntervalTypeChange(value)
                    }}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="time">Time-based</TabsTrigger>
                      <TabsTrigger value="blocks">Block-based</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <FormMessage />
                </FormItem>
              )}
            />

            {intervalType === "time" ? (
              <FormField
                control={form.control}
                name="timeInterval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Interval</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an interval" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>How often the payment will be processed</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="blockInterval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Block Interval</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1000" {...field} />
                    </FormControl>
                    <FormDescription>Number of blocks between payments</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button
              type="submit"
              className="w-full bg-polkadot-pink hover:bg-polkadot-pink-dark text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Subscription"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
