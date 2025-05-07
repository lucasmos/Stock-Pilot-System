/**
 * Represents the response from an STK push request.
 */
export interface StkPushResponse {
  /**
   * The Merchant Request ID.
   */
  MerchantRequestID: string;
  /**
   * The Checkout Request ID.
   */
  CheckoutRequestID: string;
  /**
   * The Response Code.
   */
  ResponseCode: string;
  /**
   * The Response Description.
   */
  ResponseDescription: string;
  /**
   * The Customer Message.
   */
  CustomerMessage: string;
}

/**
 * Initiates an STK push request to the Safaricom Daraja API.
 *
 * @param phoneNumber The phone number to send the STK push to.
 * @param amount The amount to charge.
 * @param accountReference The account reference.
 * @returns A promise that resolves to an StkPushResponse object.
 */
export async function initiateStkPush(
  phoneNumber: string,
  amount: number,
  accountReference: string
): Promise<StkPushResponse> {
  // TODO: Implement this by calling the Safaricom Daraja API.

  return {
    MerchantRequestID: 'ws_CO_290720241438208829',
    CheckoutRequestID: 'CheckoutRequestID',
    ResponseCode: '0',
    ResponseDescription: 'Success',
    CustomerMessage: 'Success',
  };
}
