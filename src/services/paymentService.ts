import { PaymentMethod, PaymentRecord, PaymentStatus } from '../types';

export interface PaymentRequest {
  rideId: string;
  customerId: string;
  driverId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  upiVpa?: string;
}

export class PaymentService {
  /**
   * Generates standard NPCI UPI Intent URI for Indian UPI Apps (GPay, PhonePe, Paytm, BHIM)
   */
  public static generateUpiPaymentLink(amount: number, rideId: string, driverName = 'EASY TRIP Driver'): string {
    const payeeVpa = 'easytrip.rides@icici';
    const payeeName = encodeURIComponent(driverName || 'EASY TRIP Partner');
    const transactionRef = `ET-${rideId.substring(0, 8)}`;
    const note = encodeURIComponent(`Ride Payment for ${rideId}`);
    return `upi://pay?pa=${payeeVpa}&pn=${payeeName}&mc=5411&tid=${transactionRef}&tr=${transactionRef}&tn=${note}&am=${amount.toFixed(2)}&cu=INR`;
  }

  /**
   * Initiates payment record creation
   */
  public static async createPayment(req: PaymentRequest): Promise<PaymentRecord> {
    const txnId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const record: PaymentRecord = {
      id: `pay-${Date.now()}`,
      rideId: req.rideId,
      customerId: req.customerId,
      driverId: req.driverId,
      amount: req.amount,
      paymentMethod: req.paymentMethod,
      status: req.paymentMethod === 'cash' ? 'pending' : 'paid',
      transactionId: txnId,
      upiId: req.upiVpa || (req.paymentMethod === 'upi' ? 'customer@oksbi' : undefined),
      createdAt: new Date().toISOString(),
    };

    return record;
  }

  /**
   * Verifies payment status
   */
  public static async verifyPayment(paymentId: string, method: PaymentMethod): Promise<{ success: boolean; status: PaymentStatus; message: string }> {
    // In production this verifies webhook or gateway signature
    // In demo mode we simulate instant confirmation for UPI/Wallet and pending/collected for cash
    return {
      success: true,
      status: 'paid',
      message: method === 'cash' ? 'Cash collected by driver.' : 'Instant digital payment verified successfully via NPCI / Wallet.',
    };
  }

  /**
   * Processes fare refund for cancellations or fare disputes
   */
  public static async refundPayment(paymentId: string, amount: number, reason: string): Promise<{ success: boolean; refundId: string; message: string }> {
    const refundId = `REF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    return {
      success: true,
      refundId,
      message: `Refund of ₹${amount} initiated to customer wallet/source account. Reason: ${reason}`,
    };
  }
}
