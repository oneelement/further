import { RefundType } from './RefundTypes'
import { getAcceptRejectDecision } from './RefundsUtils'

type RefundRowProps = {
  refund: RefundType
}

export default function RefundRow({ refund }: RefundRowProps) {
  const refundDecision = getAcceptRejectDecision(refund)
  return (
    <tr key={refund.name}>
      <td className="px-3 py-3.5 text-left text-sm text-gray-900">{refund.name}</td>
      <td className="px-3 py-3.5 text-left text-sm text-gray-900">{refund.customer_location_timezone}</td>
      <td className="px-3 py-3.5 text-left text-sm text-gray-900">{refund.sign_up_date}</td>
      <td className="px-3 py-3.5 text-left text-sm text-gray-900">{refund.request_source}</td>
      <td className="px-3 py-3.5 text-left text-sm text-gray-900">{refund.investment_date}</td>
      <td className="px-3 py-3.5 text-left text-sm text-gray-900">{refund.investment_time}</td>
      <td className="px-3 py-3.5 text-left text-sm text-gray-900">{refund.refund_request_date}</td>
      <td className="px-3 py-3.5 text-left text-sm text-gray-900">{refund.refund_request_time}</td>
      <td className="px-3 py-3.5 text-left text-sm text-gray-900">{refundDecision}</td>
    </tr>
  )
}