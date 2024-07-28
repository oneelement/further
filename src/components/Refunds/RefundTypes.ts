export type RefundType = {
  name: string
  customer_location_timezone: string
  sign_up_date: string
  request_source: 'phone' | 'web app'
  investment_date: string
  investment_time: string
  refund_request_date: string
  refund_request_time: string
}