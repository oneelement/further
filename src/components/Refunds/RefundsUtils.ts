import { RefundType } from './RefundTypes'

const timeZoneOffsets: {[key: string]: number} = {
  PST: -8,
  EST: -5,
  CET: 1,
  GMT: 0
}

const standardiseDateFormats = (refund: RefundType) => {
  // check if the customer location is in Europe as string 'Europe' not going to appear in another location like US could potentially
  const isLocationEurope = refund.customer_location_timezone.toLowerCase().includes('europe')

  // extract timezone from customer location
  const timeZone: string = refund.customer_location_timezone.replace(/.*?\(([^)]+)\).*?/, '$1')
  
  // get timezone offsets
  const timeZoneOffset = timeZoneOffsets[timeZone]
  const timeZoneOffsetInMs = timeZoneOffset * 60 * 60 * 1000

  // get standardised sign up date
  // split date into parts to then reform into the correct format depending on location
  const signUpDateParts = refund.sign_up_date.split('/')
  let signUpDate 
  if (isLocationEurope) {
    // new Date(year, monthIndex, day)
    signUpDate = new Date(+signUpDateParts[2], +signUpDateParts[1] - 1, +signUpDateParts[0])
  } else {
    signUpDate = new Date(+signUpDateParts[2], +signUpDateParts[0] - 1, +signUpDateParts[1])
  }

  // get standardised investment date
  // split date into parts to then reform into the correct format depending on location
  const localInvestmentDateParts = refund.investment_date.split('/')
  const localInvestmentTimeParts = refund.investment_time.split(':')
  let localInvestmentDate 
  if (isLocationEurope) {
    // new Date(year, monthIndex, day)
    localInvestmentDate = new Date(
      +localInvestmentDateParts[2], 
      +localInvestmentDateParts[1] - 1, 
      +localInvestmentDateParts[0], 
      +localInvestmentTimeParts[0], 
      +localInvestmentTimeParts[1]
    )
  } else {
    localInvestmentDate = new Date(
      +localInvestmentDateParts[2], 
      +localInvestmentDateParts[0] - 1, 
      +localInvestmentDateParts[1], 
      +localInvestmentTimeParts[0], 
      +localInvestmentTimeParts[1]
    )
  }

  //now lets convert this to UK/Current Server time assuming UK servers
  const investmentDate = new Date(localInvestmentDate.getTime() - timeZoneOffsetInMs)
  // console.log(investmentDate)

  // get standardised refund request date
  // split date into parts to then reform into the correct format depending on location
  const localRefundRequestDateParts = refund.refund_request_date.split('/')
  const localRefundRequestTimeParts = refund.refund_request_time.split(':')
  let localRefundRequestDate 
  if (isLocationEurope) {
    // new Date(year, monthIndex, day)
    localRefundRequestDate = new Date(
      +localRefundRequestDateParts[2], 
      +localRefundRequestDateParts[1] - 1, 
      +localRefundRequestDateParts[0], 
      +localRefundRequestTimeParts[0], 
      +localRefundRequestTimeParts[1]
    )
  } else {
    localRefundRequestDate = new Date(
      +localRefundRequestDateParts[2], 
      +localRefundRequestDateParts[0] - 1, 
      +localRefundRequestDateParts[1], 
      +localRefundRequestTimeParts[0], 
      +localRefundRequestTimeParts[1])
  }
  //now lets convert this to UK/Current Server time assuming UK servers
  const refundRequestDate = new Date(localRefundRequestDate.getTime() - timeZoneOffsetInMs)

  return {
    signUpDate,
    investmentDate,
    refundRequestDate
  }
}

const getRefundApprovalHours = (signUpDate: Date, source: 'phone' | 'web app') => {
  // new TOS used after 2nd Jan 2020 i.e. if greater or equal to midnight Jan 3rd 2020
  const newTosDate = new Date(2020, 0, 3) // midnight Jan 3rd 2020
  const newTosDateInMs = newTosDate.getTime()
  const phoneApprovalHours = signUpDate.getTime() >= newTosDateInMs ? 24 : 4
  const webApprovalHours = signUpDate.getTime() >= newTosDateInMs ? 16 : 8
  return source === 'phone' ? phoneApprovalHours : webApprovalHours
}

export function getAcceptRejectDecision (refund: RefundType) {

  // Standardize the date formats in UK time
  const standardisedDates = standardiseDateFormats(refund)
  const { signUpDate, investmentDate } = standardisedDates
  let { refundRequestDate } = standardisedDates

  // get refund approval hours
  const refundApprovalHours = getRefundApprovalHours(signUpDate, refund.request_source)

  // if phone request, check refund request is within business hours and amend accordingly
  if (refund.request_source.toLowerCase() === 'phone') {
    const refundRequestDayOfWeek = refundRequestDate.getDay() // 0 is sunday, 6 is saturday
    
    // if saturday or sunday
    if (refundRequestDayOfWeek === 0 || refundRequestDayOfWeek === 6) {
      const nextMonday = new Date(refundRequestDate)
      const daysToMonday = refundRequestDayOfWeek === 0 ? 1 : 2      
      nextMonday.setDate(refundRequestDate.getDate() + daysToMonday)
      nextMonday.setHours(9, 0, 0, 0)
      refundRequestDate = nextMonday
    }

    //if friday after 5pm
    if (refundRequestDayOfWeek === 5 && refundRequestDate.getHours() >= 17) {
      const nextMonday = new Date(refundRequestDate)
      nextMonday.setDate(refundRequestDate.getDate() + 3)
      nextMonday.setHours(9, 0, 0, 0)
      refundRequestDate = nextMonday
    }

    // if monday to friday before 9am
    if (refundRequestDayOfWeek !== 0 && refundRequestDayOfWeek !== 6 && refundRequestDate.getHours() < 9) {
      refundRequestDate.setHours(9, 0, 0, 0)
    }

    // if monday to thursday after 5pm
    if (refundRequestDayOfWeek !== 0 && refundRequestDayOfWeek !== 6 && refundRequestDayOfWeek !== 5 && refundRequestDate.getHours() >= 17) {
      const nextDay = new Date(refundRequestDate)
      nextDay.setDate(refundRequestDate.getDate() + 1)
      nextDay.setHours(9, 0, 0, 0)
      refundRequestDate = nextDay
    }
  }  

  // get difference in hours between refund request and investment date
  const timeBetweenInvestmentAndRefundRequestInHours = (refundRequestDate.getTime() - investmentDate.getTime()) / (1000 * 60 * 60)
  
  // make accept/reject decision based on difference less than approval hours
  return timeBetweenInvestmentAndRefundRequestInHours < refundApprovalHours ? 'Accept' : 'Reject'
}