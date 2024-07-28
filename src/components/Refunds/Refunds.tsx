import { useState, useEffect } from 'react'
import RefundRow from './RefundRow'
import { RefundType } from './RefundTypes'

export default function Refunds() {
  const [refunds, setRefunds] = useState<RefundType[]>([])

  useEffect(() => {
    const fetchRefunds = async () => {
      const response = await fetch('/data/refunds.json')
      const data = await response.json()
      setRefunds(data)
    }

    fetchRefunds()
  }, [])

  return (
    <main className="">
      <h1 className="mb-8 text-2xl">Refund Requests</h1>
      <table className="w-full">
        <thead>
          <tr className="text-left">
            <th className="p-2">Name</th>
            <th className="p-2">Customer location</th>
            <th className="p-2">Sign up date</th>
            <th className="p-2">Request source</th>
            <th className="p-2">Investment date</th>
            <th className="p-2">Investment time</th>
            <th className="p-2">Refund request date</th>
            <th className="p-2">Refund request time</th>
            <th className="p-2">Approve/Reject</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {refunds.map((refund) => (
            <RefundRow key={refund.name} refund={refund} />
          ))}
        </tbody>
      </table>
    </main>
  )
}