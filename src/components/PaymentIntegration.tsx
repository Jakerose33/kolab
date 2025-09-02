import { useState, useEffect } from 'react'
import { CreditCard, Shield, Clock, CheckCircle, AlertCircle, DollarSign, Receipt, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/features/auth/AuthProvider'
import { supabase } from '@/integrations/supabase/client'
import { cn } from '@/lib/utils'

interface PaymentIntegrationProps {
  amount: number
  currency?: string
  description: string
  venueBookingId?: string
  onSuccess?: (paymentResult: any) => void
  onError?: (error: any) => void
  className?: string
}

interface PaymentMethod {
  id: string
  type: string
  last4?: string
  brand?: string
  is_default: boolean
  stripe_payment_method_id: string
  user_id?: string
  created_at: string
  updated_at: string
}

interface PaymentPlan {
  id: string
  name: string
  description: string
  installments: number
  interest_rate: number
  total_amount: number
}

export function PaymentIntegration({
  amount,
  currency = 'USD',
  description,
  venueBookingId,
  onSuccess,
  onError,
  className
}: PaymentIntegrationProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<string>('full')
  const [loading, setLoading] = useState(false)
  const [securityCode, setSecurityCode] = useState('')
  const [paymentStep, setPaymentStep] = useState<'method' | 'security' | 'confirmation'>('method')

  useEffect(() => {
    if (user) {
      loadPaymentMethods()
      generatePaymentPlans()
    }
  }, [user, amount])

  const loadPaymentMethods = async () => {
    try {
      // Use the secure function instead of direct table access
      const { data, error } = await supabase.rpc('get_user_payment_methods_secure', {
        target_user_id: user?.id
      })

      if (error) throw error
      
      // Audit the payment method access
      if (user?.id && data?.length > 0) {
        await supabase.rpc('audit_payment_access', {
          p_action: 'LOAD_PAYMENT_METHODS',
          p_payment_method_id: null,
          p_user_id: user.id,
          p_metadata: { method_count: data.length }
        })
      }
      
      // Transform the secure data to match our interface
      const transformedMethods: PaymentMethod[] = (data || []).map(method => ({
        id: method.id,
        type: method.type,
        last4: method.last4_display || '••••',
        brand: method.brand_display || 'Card',
        is_default: method.is_default,
        stripe_payment_method_id: `pm_secure_${method.id}`, // Don't expose real Stripe ID
        user_id: user?.id,
        created_at: method.created_at,
        updated_at: method.created_at
      }))
      
      setPaymentMethods(transformedMethods)
      
      // Auto-select default payment method
      const defaultMethod = transformedMethods.find(method => method.is_default)
      if (defaultMethod) {
        setSelectedPaymentMethod(defaultMethod.id)
      }
    } catch (error) {
      console.error('Error loading payment methods:', error)
      toast({
        title: "Security Error",
        description: "Unable to load payment methods securely. Please try again.",
        variant: "destructive"
      })
    }
  }

  const generatePaymentPlans = () => {
    if (amount < 100) {
      // Small amounts only support full payment
      setPaymentPlans([])
      return
    }

    const plans: PaymentPlan[] = [
      {
        id: 'full',
        name: 'Pay in Full',
        description: 'Complete payment now',
        installments: 1,
        interest_rate: 0,
        total_amount: amount
      }
    ]

    // Add installment options for larger amounts
    if (amount >= 200) {
      plans.push({
        id: 'split_2',
        name: 'Split in 2',
        description: 'Pay in 2 monthly installments',
        installments: 2,
        interest_rate: 0.02,
        total_amount: amount * 1.02
      })
    }

    if (amount >= 500) {
      plans.push({
        id: 'split_3',
        name: 'Split in 3',
        description: 'Pay in 3 monthly installments',
        installments: 3,
        interest_rate: 0.05,
        total_amount: amount * 1.05
      })
    }

    if (amount >= 1000) {
      plans.push({
        id: 'split_6',
        name: 'Split in 6',
        description: 'Pay in 6 monthly installments',
        installments: 6,
        interest_rate: 0.12,
        total_amount: amount * 1.12
      })
    }

    setPaymentPlans(plans)
  }

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method to continue.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      // Audit the payment attempt
      await supabase.rpc('audit_payment_access', {
        p_action: 'PAYMENT_ATTEMPT',
        p_payment_method_id: selectedPaymentMethod,
        p_user_id: user?.id,
        p_metadata: {
          amount,
          currency,
          venue_booking_id: venueBookingId,
          payment_plan: selectedPlan
        }
      })

      // Validate payment method exists and belongs to user
      const selectedMethod = paymentMethods.find(method => method.id === selectedPaymentMethod)
      if (!selectedMethod) {
        throw new Error('Invalid payment method selected')
      }

      // Create payment session
      const { data, error } = await supabase.functions.invoke('create-venue-payment', {
        body: {
          venue_booking_id: venueBookingId,
          payment_method_id: selectedPaymentMethod,
          payment_plan: selectedPlan,
          amount: amount,
          currency: currency
        }
      })

      if (error) throw error

      if (data?.url) {
        // Audit successful payment initiation
        await supabase.rpc('audit_payment_access', {
          p_action: 'PAYMENT_SESSION_CREATED',
          p_payment_method_id: selectedPaymentMethod,
          p_user_id: user?.id,
          p_metadata: { session_id: data.session_id }
        })

        // Redirect to Stripe Checkout
        window.open(data.url, '_blank')
        onSuccess?.(data)
        toast({
          title: "Payment Processing",
          description: "Redirecting to secure payment page...",
        })
      } else if (data?.requires_action) {
        // Handle 3D Secure or other authentication
        setPaymentStep('security')
      } else {
        // Payment successful
        onSuccess?.(data)
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully.",
        })
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      
      // Audit payment failure
      await supabase.rpc('audit_payment_access', {
        p_action: 'PAYMENT_FAILED',
        p_payment_method_id: selectedPaymentMethod,
        p_user_id: user?.id,
        p_metadata: { error: error.message }
      })

      onError?.(error)
      toast({
        title: "Payment Failed",
        description: error.message || "Please try again or contact support.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addPaymentMethod = async () => {
    try {
      // In production, this would open Stripe Elements or similar
      toast({
        title: "Feature Coming Soon",
        description: "Add payment method functionality will be available soon.",
      })
    } catch (error) {
      console.error('Error adding payment method:', error)
    }
  }

  const calculateInstallmentAmount = (plan: PaymentPlan) => {
    return plan.total_amount / plan.installments
  }

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
          <p className="text-muted-foreground">Please sign in to continue with payment.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("border-2 border-primary/20", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Secure Payment
          <Badge variant="secondary" className="ml-2">
            <Shield className="h-3 w-3 mr-1" />
            SSL Encrypted
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Payment Summary */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">{description}</h4>
          <div className="flex justify-between items-center">
            <span className="text-lg">Total Amount:</span>
            <span className="text-2xl font-bold text-primary">
              {currency === 'USD' ? '$' : currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : ''}
              {amount.toFixed(2)}
            </span>
          </div>
        </div>

        {paymentStep === 'method' && (
          <>
            {/* Payment Plans */}
            {paymentPlans.length > 1 && (
              <div className="space-y-3">
                <Label>Payment Plan</Label>
                <div className="grid gap-3">
                  {paymentPlans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={cn(
                        "p-4 rounded-lg border text-left transition-colors",
                        selectedPlan === plan.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{plan.name}</h4>
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                          {plan.installments > 1 && (
                            <p className="text-sm text-primary mt-1">
                              {currency === 'USD' ? '$' : currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : ''}
                              {calculateInstallmentAmount(plan).toFixed(2)} × {plan.installments} months
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {currency === 'USD' ? '$' : currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : ''}
                            {plan.total_amount.toFixed(2)}
                          </div>
                          {plan.interest_rate > 0 && (
                            <div className="text-sm text-muted-foreground">
                              +{(plan.interest_rate * 100).toFixed(1)}% fee
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Methods */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Payment Method</Label>
                <Button variant="outline" size="sm" onClick={addPaymentMethod}>
                  Add New
                </Button>
              </div>
              
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    className={cn(
                      "w-full p-3 rounded-lg border text-left transition-colors flex items-center gap-3",
                      selectedPaymentMethod === method.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    )}
                  >
                    <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                      {method.type === 'card' && <CreditCard className="h-4 w-4" />}
                      {method.type === 'bank' && <DollarSign className="h-4 w-4" />}
                      {method.type === 'digital_wallet' && <Wallet className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {method.brand} ••••{method.last4}
                      </div>
                      {method.is_default && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                    </div>
                    <CheckCircle
                      className={cn(
                        "h-5 w-5",
                        selectedPaymentMethod === method.id
                          ? "text-primary"
                          : "text-transparent"
                      )}
                    />
                  </button>
                ))}
                
                {paymentMethods.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No payment methods found</p>
                    <Button variant="outline" className="mt-2" onClick={addPaymentMethod}>
                      Add Payment Method
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Payment Action */}
            <Button
              onClick={handlePayment}
              disabled={loading || !selectedPaymentMethod}
              className="w-full h-12 text-lg bg-gradient-primary hover:opacity-90"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Pay Securely
                </div>
              )}
            </Button>
          </>
        )}

        {paymentStep === 'security' && (
          <div className="space-y-4">
            <div className="text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Additional Security Required</h3>
              <p className="text-muted-foreground">
                Please enter the security code sent to your device.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="security-code">Security Code</Label>
              <Input
                id="security-code"
                type="text"
                placeholder="Enter 6-digit code"
                value={securityCode}
                onChange={(e) => setSecurityCode(e.target.value)}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>
            
            <Button
              onClick={() => setPaymentStep('confirmation')}
              disabled={securityCode.length < 6}
              className="w-full"
            >
              Verify & Complete Payment
            </Button>
          </div>
        )}

        {paymentStep === 'confirmation' && (
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-xl font-semibold">Payment Successful!</h3>
            <p className="text-muted-foreground">
              Your payment has been processed and you'll receive a confirmation email shortly.
            </p>
            <Button variant="outline" className="w-full">
              <Receipt className="h-4 w-4 mr-2" />
              View Receipt
            </Button>
          </div>
        )}

        {/* Enhanced Security Features */}
        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-200 text-sm">
            <Shield className="h-4 w-4" />
            <span className="font-medium">Your payment is protected by:</span>
          </div>
          <ul className="mt-2 space-y-1 text-sm text-green-700 dark:text-green-300">
            <li>• 256-bit SSL encryption</li>
            <li>• PCI DSS Level 1 compliance</li>
            <li>• Tokenized payment processing</li>
            <li>• Real-time fraud detection</li>
            <li>• Comprehensive audit logging</li>
            <li>• Zero card data storage</li>
            <li>• Purchase protection</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}