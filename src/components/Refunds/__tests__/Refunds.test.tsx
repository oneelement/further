import { it, expect, describe, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import RefundRow from '../RefundRow.tsx'
import { RefundType } from '../RefundTypes.ts'

describe('Refunds', () => {

  let source: 'phone' | 'web app'
  let timeZone: string
  let signUpDate: string

  // before / after midnight 3rd Jan 2020
  const oldTosSignUpDateEurope = '1/1/2020'
  const newTosSignUpDateEurope = '3/1/2020'

  const oldTosSignUpDateUs = '1/1/2020'
  const newTosSignUpDateUs = '1/3/2020' 

  afterEach(() => {
    cleanup()
  })

  describe('GMT Timezone', () => {
    beforeEach(() => {
      timeZone = 'Europe (GMT)'
    })

    describe('Source Phone', () => {

      beforeEach(() => {
        source = 'phone'
      })

      describe('Old TOS', () => {

        beforeEach(() => {
          signUpDate = oldTosSignUpDateEurope
        })

        it('should reject refund if time diff greater or equal than 4 hours when requested during office hours', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "6/1/2021",
            "investment_time": "06:00",
            "refund_request_date": "6/1/2021", // Wed 6th Jan 2021
            "refund_request_time": "11:00"
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Reject')
          expect(decision).toBeInTheDocument()
        })

        it('should accept refund if time diff less than 4 hours when requested during office hours', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "6/1/2021",
            "investment_time": "06:00",
            "refund_request_date": "6/1/2021", // Wed 6th Jan 2021
            "refund_request_time": "09:59" // 3:59 later
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Accept')
          expect(decision).toBeInTheDocument()
        })

        it('should reject refund if time diff more than 4 hours when requested before office hours', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "6/1/2021",
            "investment_time": "04:00",
            "refund_request_date": "6/1/2021", // Wed 6th Jan 2021
            "refund_request_time": "07:00" // 3hr later but before 9am so becomes 5 hours and fail
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Reject')
          expect(decision).toBeInTheDocument()
        })

        it('should accept refund if time diff less than 4 hours when requested before office hours', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "6/1/2021",
            "investment_time": "06:00",
            "refund_request_date": "6/1/2021", // Wed 6th Jan 2021
            "refund_request_time": "07:00" // 1hr later but before 9am so becomes 3 hours and pass
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Accept')
          expect(decision).toBeInTheDocument()
        })

        it('should reject refund if time diff more than 4 hours when requested after office hours', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "6/1/2021",
            "investment_time": "16:00",
            "refund_request_date": "6/1/2021", // Wed 6th Jan 2021
            "refund_request_time": "18:00" // 2hr later but after 5pm so becomes 17 hours and fail
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Reject')
          expect(decision).toBeInTheDocument()
        })

        it('should reject refund if time diff more than 4 hours when requested on friday after hours', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "8/1/2021",
            "investment_time": "16:59",
            "refund_request_date": "8/1/2021", // Fri 8th Jan 2021
            "refund_request_time": "17:01" // 2 mins later but reject as after 5pm goes to monday morning and fails
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Reject')
          expect(decision).toBeInTheDocument()
        })

        it('should reject refund if time diff more than 4 hours when requested on saturday', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "8/1/2021",
            "investment_time": "16:59",
            "refund_request_date": "9/1/2021", // Sat 9th Jan 2021
            "refund_request_time": "00:00" // all saturday request will be more than 4 hrs later
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Reject')
          expect(decision).toBeInTheDocument()
        })

        it('should reject refund if time diff more than 4 hours when requested on sunday', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "8/1/2021",
            "investment_time": "16:59",
            "refund_request_date": "10/1/2021", // Sun 10th Jan 2021
            "refund_request_time": "00:00" // all sunday request will be more than 4 hrs later
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Reject')
          expect(decision).toBeInTheDocument()
        })

      })

      describe('New TOS', () => {
        beforeEach(() => {
          signUpDate = newTosSignUpDateEurope
        })

        it('should reject refund if time diff greater or equal than 24 hours when requested during office hours', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "6/1/2021",
            "investment_time": "10:00",
            "refund_request_date": "7/1/2021", // Thurs 7th Jan 2021
            "refund_request_time": "10:00" // 24hr later
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Reject')
          expect(decision).toBeInTheDocument()
        })

        it('should accept refund if time diff less than 24 hours when requested during office hours', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "6/1/2021",
            "investment_time": "10:00",
            "refund_request_date": "7/1/2021", // Thurs 7th Jan 2021
            "refund_request_time": "09:59" // 23hr 59 min later
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Accept')
          expect(decision).toBeInTheDocument()
        })

        it('should reject refund if time diff more than 24 hours when requested before office hours', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "6/1/2021",
            "investment_time": "09:00",
            "refund_request_date": "7/1/2021", // Thurs 7th Jan 2021
            "refund_request_time": "08:00" // 23hr later but before 9am so becomes 24 hours and fail
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Reject')
          expect(decision).toBeInTheDocument()
        })

        it('should accept refund if time diff less than 24 hours when requested before office hours', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "6/1/2021",
            "investment_time": "10:00",
            "refund_request_date": "7/1/2021", // Thurs 7th Jan 2021
            "refund_request_time": "07:00" // 21hr later but before 9am so becomes 23 hours and pass
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Accept')
          expect(decision).toBeInTheDocument()
        })

        it('should reject refund if time diff more than 24 hours when requested after office hours', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "6/1/2021",
            "investment_time": "09:00",
            "refund_request_date": "6/1/2021", // Wed 6th Jan 2021
            "refund_request_time": "18:00" // 9hr later but after 5pm so becomes 24 hours and fail
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Reject')
          expect(decision).toBeInTheDocument()
        })

        it('should accept refund if time diff less than 24 hours when requested after office hours', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "6/1/2021",
            "investment_time": "10:00",
            "refund_request_date": "6/1/2021", // Wed 6th Jan 2021
            "refund_request_time": "18:00" // 8hr later but after 5pm so becomes 23 hours and pass
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Accept')
          expect(decision).toBeInTheDocument()
        })

        it('should reject refund if time diff more than 24 hours when requested on friday after hours', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "8/1/2021",
            "investment_time": "16:59",
            "refund_request_date": "8/1/2021", // Fri 8th Jan 2021
            "refund_request_time": "17:01" // 2 mins later but reject as after 5pm goes to monday morning and fails
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Reject')
          expect(decision).toBeInTheDocument()
        })

        it('should reject refund if time diff more than 24 hours when requested on saturday', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "8/1/2021",
            "investment_time": "16:59",
            "refund_request_date": "9/1/2021", // Sat 9th Jan 2021
            "refund_request_time": "00:00" // all saturday request will be more than 24 hrs later
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Reject')
          expect(decision).toBeInTheDocument()
        })

        it('should reject refund if time diff more than 24 hours when requested on sunday', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "8/1/2021",
            "investment_time": "16:59",
            "refund_request_date": "10/1/2021", // Sun 10th Jan 2021
            "refund_request_time": "00:00" // all sunday request will be more than 24 hrs later
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Reject')
          expect(decision).toBeInTheDocument()
        })
      })
      
    })

    describe('Source Web App', () => {
      runWebAppTestsEurope('Europe (GMT)', 'web app')
    })
  })

  describe('CET Timezone', () => {
    // these tests only focus on timezone changes as GMT cover the business logic

    beforeEach(() => {
      timeZone = 'Europe (CET)'
    })

    describe('Source Phone', () => {

      beforeEach(() => {
        source = 'phone'
      })

      describe('Old TOS', () => {

        beforeEach(() => {
          signUpDate = oldTosSignUpDateEurope
        })

        it('should reject refund if time diff less than 4 hours when requested during office hours but timezone offset takes it before office hours', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "6/1/2021",
            "investment_time": "06:00",
            "refund_request_date": "6/1/2021", // Wed 6th Jan 2021
            "refund_request_time": "09:30" // 3.5 hrs but time offset makes it 4 hrs and fail
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Reject')
          expect(decision).toBeInTheDocument()
        })

        it('should reject refund if time diff less than 4 hours when requested during office hours but timezone offset takes it after office hours', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "6/1/2021",
            "investment_time": "15:00",
            "refund_request_date": "6/1/2021", // Wed 6th Jan 2021
            "refund_request_time": "18:00" // 3 hrs but time offset makes it outside office hours and fail and makes it 19 hrs
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Reject')
          expect(decision).toBeInTheDocument()
        })

        it('should accept refund if time diff less than 4 hours when requested during office hours and timezone offset keeps within office hours', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "6/1/2021",
            "investment_time": "10:00",
            "refund_request_date": "6/1/2021", // Wed 6th Jan 2021
            "refund_request_time": "13:59" // 3:59 later
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Accept')
          expect(decision).toBeInTheDocument()
        })

        it('should reject refund if time diff more than 4 hours when requested on friday after hours', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "8/1/2021",
            "investment_time": "17:59",
            "refund_request_date": "8/1/2021", // Fri 8th Jan 2021
            "refund_request_time": "18:01" // 2 mins later but reject as after 5pm UK goes to monday morning and fails
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Reject')
          expect(decision).toBeInTheDocument()
        })

        it('should reject refund if time diff more than 4 hours when requested on saturday', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "8/1/2021",
            "investment_time": "16:59",
            "refund_request_date": "9/1/2021", // Sat 9th Jan 2021
            "refund_request_time": "00:00" // all saturday request will be more than 4 hrs later
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Reject')
          expect(decision).toBeInTheDocument()
        })

        it('should reject refund if time diff more than 4 hours when requested on sunday', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "8/1/2021",
            "investment_time": "16:59",
            "refund_request_date": "10/1/2021", // Sun 10th Jan 2021
            "refund_request_time": "00:00" // all sunday request will be more than 4 hrs later
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Reject')
          expect(decision).toBeInTheDocument()
        })

      })

      describe('New TOS', () => {
        beforeEach(() => {
          signUpDate = newTosSignUpDateEurope
        })

        it('should reject refund if time diff less than 24 hours when requested during office hours but timezone offset takes it before office hours', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "6/1/2021",
            "investment_time": "10:00",
            "refund_request_date": "7/1/2021", // Wed 6th Jan 2021
            "refund_request_time": "09:30" // 23.5 hrs but time offset makes it 24 hrs and fail as 8:30am UK adds 0.5 hrs
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Reject')
          expect(decision).toBeInTheDocument()
        })

        it('should reject refund if time diff less than 24 hours when requested during office hours but timezone offset takes it after office hours', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "6/1/2021",
            "investment_time": "19:00",
            "refund_request_date": "7/1/2021", // Wed 6th Jan 2021
            "refund_request_time": "18:00" // 23 hrs but time offset makes it outside office hours and fail and makes it 19 hrs
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Reject')
          expect(decision).toBeInTheDocument()
        })

        it('should accept refund if time diff less than 24 hours when requested during office hours and timezone offset keeps within office hours', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "6/1/2021",
            "investment_time": "14:00",
            "refund_request_date": "7/1/2021", // Wed 6th Jan 2021
            "refund_request_time": "13:59" // 23:59 later
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Accept')
          expect(decision).toBeInTheDocument()
        })

        it('should reject refund if time diff more than 24 hours when requested on friday after hours', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "7/1/2021",
            "investment_time": "18:01",
            "refund_request_date": "8/1/2021", // Fri 8th Jan 2021
            "refund_request_time": "18:00" // 23:59 mins later but reject as after 5pm UK goes to monday morning and fails
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Reject')
          expect(decision).toBeInTheDocument()
        })

        it('should reject refund if time diff more than 24 hours when requested on saturday', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "8/1/2021",
            "investment_time": "16:59",
            "refund_request_date": "9/1/2021", // Sat 9th Jan 2021
            "refund_request_time": "00:00" // all saturday request will be more than 24 hrs later
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Reject')
          expect(decision).toBeInTheDocument()
        })

        it('should reject refund if time diff more than 24 hours when requested on sunday', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "8/1/2021",
            "investment_time": "16:59",
            "refund_request_date": "10/1/2021", // Sun 10th Jan 2021
            "refund_request_time": "00:00" // all sunday request will be more than 24 hrs later
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Reject')
          expect(decision).toBeInTheDocument()
        })

      })
      
    })

    describe('Source Web App', () => {
      runWebAppTestsEurope('Europe (CET)', 'web app')
    })

  })

  describe('PST Timezone', () => {
    // these tests only focus on timezone changes as GMT cover the business logic

    beforeEach(() => {
      timeZone = 'US (PST)'
    })

    describe('Source Phone', () => {

      beforeEach(() => {
        source = 'phone'
      })

      describe('Old TOS', () => {

        beforeEach(() => {
          signUpDate = oldTosSignUpDateUs
        })

        it('should accept refund if time diff less than 4 hours when requested outside office hours but timezone offset takes it during office hours', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "1/6/2021",
            "investment_time": "03:00",
            "refund_request_date": "1/6/2021", // Wed 6th Jan 2021
            "refund_request_time": "06:30" // 3.5 hrs and time offset makes it during office hrs and pass instead of 6 hrs and fail
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Accept')
          expect(decision).toBeInTheDocument()
        })

        it('should reject refund if time diff less than 4 hours when requested during office hours but timezone offset takes it after office hours', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "1/6/2021",
            "investment_time": "12:00",
            "refund_request_date": "1/6/2021", // Wed 6th Jan 2021
            "refund_request_time": "14:00" // 2 hrs but time offset makes it outside office hours and fail and makes it 18 hrs
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Reject')
          expect(decision).toBeInTheDocument()
        })

        it('should accept refund if time diff less than 4 hours when requested on sunday but offset takes it to monday', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "1/10/2021",
            "investment_time": "22:00",
            "refund_request_date": "1/10/2021", // Sun 10th Jan 2021
            "refund_request_time": "23:00" // 1 hr later but offset takes it to 3 hrs and pass
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Accept')
          expect(decision).toBeInTheDocument()
        })

      })

      describe('New TOS', () => {
        beforeEach(() => {
          signUpDate = newTosSignUpDateUs
        })

        it('should accept refund if time diff less than 24 hours when requested outside office hours but timezone offset takes it inside office hours', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "1/6/2021",
            "investment_time": "06:00",
            "refund_request_date": "1/7/2021", // Thurs 7th Jan 2021
            "refund_request_time": "04:00" // 22 hrs but time offset brings it inside office hours so not 27 hrs and pass
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Accept')
          expect(decision).toBeInTheDocument()
        })

        it('should reject refund if time diff less than 24 hours when requested during office hours but timezone offset takes it after office hours', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "1/6/2021",
            "investment_time": "16:00",
            "refund_request_date": "1/7/2021", // Thurs yth Jan 2021
            "refund_request_time": "09:00" // 17 hrs but time offset makes it outside office hours and fail and makes it 33 hrs
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Reject')
          expect(decision).toBeInTheDocument()
        })

        it('should accept refund if time diff less than 24 hours when requested on sunday but offset takes it to monday', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "1/10/2021",
            "investment_time": "12:00",
            "refund_request_date": "1/10/2021", // Sun 10th Jan 2021
            "refund_request_time": "23:00" // 11 hr later but offset takes it to 13 hrs and pass
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Accept')
          expect(decision).toBeInTheDocument()
        })

      })
      
    })

    describe('Source Web App', () => {
      runWebAppTestsUs('US (PST)', 'web app')
    })
  })

  describe('EST Timezone', () => {
    // these tests only focus on timezone changes as GMT cover the business logic

    beforeEach(() => {
      timeZone = 'US (EST)'
    })

    describe('Source Phone', () => {

      beforeEach(() => {
        source = 'phone'
      })

      describe('Old TOS', () => {

        beforeEach(() => {
          signUpDate = oldTosSignUpDateUs
        })

        it('should accept refund if time diff less than 4 hours when requested outside office hours but timezone offset takes it during office hours', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "1/6/2021",
            "investment_time": "01:30",
            "refund_request_date": "1/6/2021", // Wed 6th Jan 2021
            "refund_request_time": "04:30" // 3 hrs and time offset makes it during office hrs and pass instead of 7.5 hrs and fail
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Accept')
          expect(decision).toBeInTheDocument()
        })

        it('should reject refund if time diff less than 4 hours when requested during office hours but timezone offset takes it after office hours', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "1/6/2021",
            "investment_time": "10:00",
            "refund_request_date": "1/6/2021", // Wed 6th Jan 2021
            "refund_request_time": "12:00" // 2 hrs but time offset makes it outside office hours and fail and makes it 18 hrs
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Reject')
          expect(decision).toBeInTheDocument()
        })

        it('should reject refund if time diff less than 4 hours when requested on sunday but offset takes it to monday', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "1/10/2021",
            "investment_time": "23:58",
            "refund_request_date": "1/10/2021", // Sun 10th Jan 2021
            "refund_request_time": "23:59" // 1 min later but offset takes it to 4 hrs and 2 min and fail
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Reject')
          expect(decision).toBeInTheDocument()
        })

      })

      describe('New TOS', () => {
        beforeEach(() => {
          signUpDate = newTosSignUpDateUs
        })

        it('should accept refund if time diff less than 24 hours when requested outside office hours but timezone offset takes it inside office hours', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "1/6/2021",
            "investment_time": "06:00",
            "refund_request_date": "1/7/2021", // Thurs 7th Jan 2021
            "refund_request_time": "04:00" // 22 hrs but time offset brings it inside office hours so not 27 hrs and pass
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Accept')
          expect(decision).toBeInTheDocument()
        })

        it('should reject refund if time diff less than 24 hours when requested during office hours but timezone offset takes it after office hours', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "1/6/2021",
            "investment_time": "16:00",
            "refund_request_date": "1/7/2021", // Thurs 7th Jan 2021
            "refund_request_time": "12:00" // 20 hrs but time offset makes it outside office hours and fail and makes it 36 hrs
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Reject')
          expect(decision).toBeInTheDocument()
        })

        it('should accept refund if time diff less than 24 hours when requested on sunday but offset takes it to monday', () => {
          const refund: RefundType = {
            "name": "Test User",
            "customer_location_timezone": timeZone,
            "sign_up_date": signUpDate,
            "request_source": source,
            "investment_date": "1/10/2021",
            "investment_time": "12:00",
            "refund_request_date": "1/10/2021", // Sun 10th Jan 2021
            "refund_request_time": "23:00" // 11 hr later but offset takes it to 16 hrs and pass
          }
          render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
          const decision = screen.getByText('Accept')
          expect(decision).toBeInTheDocument()
        })

      })
      
    })

    describe('Source Web App', () => {
      runWebAppTestsUs('US (EST)', 'web app')
    })
  })
})

const runWebAppTestsEurope = (timeZone: string, source: 'web app') => {
  describe('Old TOS', () => {
    // before / after midnight 3rd Jan 2020
    let signUpDate: string
    const oldTosSignUpDateEurope = '1/1/2020'

    beforeEach(() => {
      signUpDate = oldTosSignUpDateEurope
    })

    it('should reject refund if time diff greater or equal than 8 hours when requested during office hours', () => {
      const refund: RefundType = {
        "name": "Test User",
        "customer_location_timezone": timeZone,
        "sign_up_date": signUpDate,
        "request_source": source,
        "investment_date": "6/1/2021",
        "investment_time": "06:00",
        "refund_request_date": "6/1/2021", // Wed 6th Jan 2021
        "refund_request_time": "14:00" // 8 hrs
      }
      render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
      const decision = screen.getByText('Reject')
      expect(decision).toBeInTheDocument()
    })

    it('should accept refund if time diff less than 8 hours when requested during office hours', () => {
      const refund: RefundType = {
        "name": "Test User",
        "customer_location_timezone": timeZone,
        "sign_up_date": signUpDate,
        "request_source": source,
        "investment_date": "6/1/2021",
        "investment_time": "06:00",
        "refund_request_date": "6/1/2021", // Wed 6th Jan 2021
        "refund_request_time": "13:59" // 7:59 later
      }
      render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
      const decision = screen.getByText('Accept')
      expect(decision).toBeInTheDocument()
    })

    it('should accept refund if time diff less than 8 hours when requested before office hours', () => {
      const refund: RefundType = {
        "name": "Test User",
        "customer_location_timezone": timeZone,
        "sign_up_date": signUpDate,
        "request_source": source,
        "investment_date": "6/1/2021",
        "investment_time": "01:00",
        "refund_request_date": "6/1/2021", // Wed 6th Jan 2021
        "refund_request_time": "07:00" // 6hr later but before 9am but remains 6hr so pass
      }
      render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
      const decision = screen.getByText('Accept')
      expect(decision).toBeInTheDocument()
    })

    it('should accept refund if time diff more less 8 hours when requested after office hours', () => {
      const refund: RefundType = {
        "name": "Test User",
        "customer_location_timezone": timeZone,
        "sign_up_date": signUpDate,
        "request_source": source,
        "investment_date": "6/1/2021",
        "investment_time": "16:00",
        "refund_request_date": "6/1/2021", // Wed 6th Jan 2021
        "refund_request_time": "18:00" // 2hr later but after 5pm but should remain 2hr instead of 17 hr so pass
      }
      render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
      const decision = screen.getByText('Accept')
      expect(decision).toBeInTheDocument()
    })

    it('should accept refund if time diff less than 8 hours when requested on saturday', () => {
      const refund: RefundType = {
        "name": "Test User",
        "customer_location_timezone": timeZone,
        "sign_up_date": signUpDate,
        "request_source": source,
        "investment_date": "9/1/2021",
        "investment_time": "09:00", // Sat 9th Jan 2021
        "refund_request_date": "9/1/2021", // Sat 9th Jan 2021
        "refund_request_time": "11:00" // 2 hr later on a satruday so should remain 2hr and pass
      }
      render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
      const decision = screen.getByText('Accept')
      expect(decision).toBeInTheDocument()
    })

    it('should accept refund if time diff less than 8 hours when requested on sunday', () => {
      const refund: RefundType = {
        "name": "Test User",
        "customer_location_timezone": timeZone,
        "sign_up_date": signUpDate,
        "request_source": source,
        "investment_date": "10/1/2021",
        "investment_time": "09:00",
        "refund_request_date": "10/1/2021", // Sun 10th Jan 2021
        "refund_request_time": "11:00" // 2 hr later on a sunday so should remain 2hr and pass
      }
      render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
      const decision = screen.getByText('Accept')
      expect(decision).toBeInTheDocument()
    })
  })

  describe('New TOS', () => {
    // before / after midnight 3rd Jan 2020
    let signUpDate: string
    const newTosSignUpDateEurope = '3/1/2020'

    beforeEach(() => {
      signUpDate = newTosSignUpDateEurope
    })

    it('should reject refund if time diff greater or equal than 16 hours when requested during office hours', () => {
      const refund: RefundType = {
        "name": "Test User",
        "customer_location_timezone": timeZone,
        "sign_up_date": signUpDate,
        "request_source": source,
        "investment_date": "6/1/2021",
        "investment_time": "00:00",
        "refund_request_date": "6/1/2021", // Wed 6th Jan 2021
        "refund_request_time": "16:00" // 16 hrs later so fail
      }
      render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
      const decision = screen.getByText('Reject')
      expect(decision).toBeInTheDocument()
    })

    it('should accept refund if time diff less than 16 hours when requested during office hours', () => {
      const refund: RefundType = {
        "name": "Test User",
        "customer_location_timezone": timeZone,
        "sign_up_date": signUpDate,
        "request_source": source,
        "investment_date": "6/1/2021",
        "investment_time": "00:00",
        "refund_request_date": "6/1/2021", // Wed 6th Jan 2021
        "refund_request_time": "15:59" // 15:59 later
      }
      render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
      const decision = screen.getByText('Accept')
      expect(decision).toBeInTheDocument()
    })

    it('should accept refund if time diff less than 16 hours when requested before office hours', () => {
      const refund: RefundType = {
        "name": "Test User",
        "customer_location_timezone": timeZone,
        "sign_up_date": signUpDate,
        "request_source": source,
        "investment_date": "6/1/2021",
        "investment_time": "15:00",
        "refund_request_date": "7/1/2021", // Thurs 7th Jan 2021
        "refund_request_time": "06:00" // 15hr later but before 9am but remains 15hr instead of 18 so pass
      }
      render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
      const decision = screen.getByText('Accept')
      expect(decision).toBeInTheDocument()
    })

    it('should accept refund if time diff more less 16 hours when requested after office hours', () => {
      const refund: RefundType = {
        "name": "Test User",
        "customer_location_timezone": timeZone,
        "sign_up_date": signUpDate,
        "request_source": source,
        "investment_date": "6/1/2021",
        "investment_time": "03:00",
        "refund_request_date": "6/1/2021", // Wed 6th Jan 2021
        "refund_request_time": "18:00" // 15hr later but after 5pm but should remain 15hr instead of 30 hr so pass
      }
      render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
      const decision = screen.getByText('Accept')
      expect(decision).toBeInTheDocument()
    })

    it('should accept refund if time diff less than 16 hours when requested on saturday', () => {
      const refund: RefundType = {
        "name": "Test User",
        "customer_location_timezone": timeZone,
        "sign_up_date": signUpDate,
        "request_source": source,
        "investment_date": "9/1/2021",
        "investment_time": "00:00", // Sat 9th Jan 2021
        "refund_request_date": "9/1/2021", // Sat 9th Jan 2021
        "refund_request_time": "15:00" // 15 hr later on a saturday so should remain 15hr and pass
      }
      render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
      const decision = screen.getByText('Accept')
      expect(decision).toBeInTheDocument()
    })

    it('should accept refund if time diff less than 16 hours when requested on sunday', () => {
      const refund: RefundType = {
        "name": "Test User",
        "customer_location_timezone": timeZone,
        "sign_up_date": signUpDate,
        "request_source": source,
        "investment_date": "10/1/2021",
        "investment_time": "00:00",
        "refund_request_date": "10/1/2021", // Sun 10th Jan 2021
        "refund_request_time": "15:00" // 15 hr later on a sunday so should remain 15hr and pass
      }
      render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
      const decision = screen.getByText('Accept')
      expect(decision).toBeInTheDocument()
    })
  })
}

const runWebAppTestsUs = (timeZone: string, source: 'web app') => {
  describe('Old TOS', () => {
    // before / after midnight Jan 1st 2020
    let signUpDate: string
    const oldTosSignUpDateUs = '1/1/2020'

    beforeEach(() => {
      signUpDate = oldTosSignUpDateUs
    })

    it('should reject refund if time diff greater or equal than 8 hours when requested during office hours', () => {
      const refund: RefundType = {
        "name": "Test User",
        "customer_location_timezone": timeZone,
        "sign_up_date": signUpDate,
        "request_source": source,
        "investment_date": "01/06/2021",
        "investment_time": "06:00",
        "refund_request_date": "01/06/2021", // Wed Jan 6th 2021
        "refund_request_time": "14:00" // 8 hrs
      }
      render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
      const decision = screen.getByText('Reject')
      expect(decision).toBeInTheDocument()
    })

    it('should accept refund if time diff less than 8 hours when requested during office hours', () => {
      const refund: RefundType = {
        "name": "Test User",
        "customer_location_timezone": timeZone,
        "sign_up_date": signUpDate,
        "request_source": source,
        "investment_date": "01/06/2021",
        "investment_time": "06:00",
        "refund_request_date": "01/06/2021", // Wed Jan 6th 2021
        "refund_request_time": "13:59" // 7:59 later
      }
      render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
      const decision = screen.getByText('Accept')
      expect(decision).toBeInTheDocument()
    })

    it('should accept refund if time diff less than 8 hours when requested before office hours', () => {
      const refund: RefundType = {
        "name": "Test User",
        "customer_location_timezone": timeZone,
        "sign_up_date": signUpDate,
        "request_source": source,
        "investment_date": "01/06/2021",
        "investment_time": "01:00",
        "refund_request_date": "01/06/2021", // Wed Jan 6th 2021
        "refund_request_time": "07:00" // 6hr later but before 9am but remains 6hr so pass
      }
      render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
      const decision = screen.getByText('Accept')
      expect(decision).toBeInTheDocument()
    })

    it('should accept refund if time diff more less 8 hours when requested after office hours', () => {
      const refund: RefundType = {
        "name": "Test User",
        "customer_location_timezone": timeZone,
        "sign_up_date": signUpDate,
        "request_source": source,
        "investment_date": "01/06/2021",
        "investment_time": "16:00",
        "refund_request_date": "01/06/2021", // Wed Jan 6th 2021
        "refund_request_time": "18:00" // 2hr later but after 5pm but should remain 2hr instead of 17 hr so pass
      }
      render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
      const decision = screen.getByText('Accept')
      expect(decision).toBeInTheDocument()
    })

    it('should accept refund if time diff less than 8 hours when requested on saturday', () => {
      const refund: RefundType = {
        "name": "Test User",
        "customer_location_timezone": timeZone,
        "sign_up_date": signUpDate,
        "request_source": source,
        "investment_date": "01/09/2021",
        "investment_time": "09:00", // Sat Jan 9th 2021
        "refund_request_date": "01/09/2021", // Sat Jan 9th 2021
        "refund_request_time": "11:00" // 2 hr later on a saturday so should remain 2hr and pass
      }
      render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
      const decision = screen.getByText('Accept')
      expect(decision).toBeInTheDocument()
    })

    it('should accept refund if time diff less than 8 hours when requested on sunday', () => {
      const refund: RefundType = {
        "name": "Test User",
        "customer_location_timezone": timeZone,
        "sign_up_date": signUpDate,
        "request_source": source,
        "investment_date": "01/10/2021",
        "investment_time": "09:00",
        "refund_request_date": "01/10/2021", // Sun Jan 10th 2021
        "refund_request_time": "11:00" // 2 hr later on a sunday so should remain 2hr and pass
      }
      render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
      const decision = screen.getByText('Accept')
      expect(decision).toBeInTheDocument()
    })
  })

  describe('New TOS', () => {
    // before / after midnight Jan 3rd 2020
    let signUpDate: string
    const newTosSignUpDateUs = '1/3/2020'

    beforeEach(() => {
      signUpDate = newTosSignUpDateUs
    })

    it('should reject refund if time diff greater or equal than 16 hours when requested during office hours', () => {
      const refund: RefundType = {
        "name": "Test User",
        "customer_location_timezone": timeZone,
        "sign_up_date": signUpDate,
        "request_source": source,
        "investment_date": "01/06/2021",
        "investment_time": "00:00",
        "refund_request_date": "01/06/2021", // Wed Jan 6th 2021
        "refund_request_time": "16:00" // 16 hrs later so fail
      }
      render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
      const decision = screen.getByText('Reject')
      expect(decision).toBeInTheDocument()
    })

    it('should accept refund if time diff less than 16 hours when requested during office hours', () => {
      const refund: RefundType = {
        "name": "Test User",
        "customer_location_timezone": timeZone,
        "sign_up_date": signUpDate,
        "request_source": source,
        "investment_date": "01/06/2021",
        "investment_time": "00:00",
        "refund_request_date": "01/06/2021", // Wed Jan 6th 2021
        "refund_request_time": "15:59" // 15:59 later
      }
      render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
      const decision = screen.getByText('Accept')
      expect(decision).toBeInTheDocument()
    })

    it('should accept refund if time diff less than 16 hours when requested before office hours', () => {
      const refund: RefundType = {
        "name": "Test User",
        "customer_location_timezone": timeZone,
        "sign_up_date": signUpDate,
        "request_source": source,
        "investment_date": "01/06/2021",
        "investment_time": "15:00",
        "refund_request_date": "01/07/2021", // Thurs Jan 7th 2021
        "refund_request_time": "06:00" // 15hr later but before 9am but remains 15hr instead of 18 so pass
      }
      render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
      const decision = screen.getByText('Accept')
      expect(decision).toBeInTheDocument()
    })

    it('should accept refund if time diff more less 16 hours when requested after office hours', () => {
      const refund: RefundType = {
        "name": "Test User",
        "customer_location_timezone": timeZone,
        "sign_up_date": signUpDate,
        "request_source": source,
        "investment_date": "01/06/2021",
        "investment_time": "03:00",
        "refund_request_date": "01/06/2021", // Wed Jan 6th 2021
        "refund_request_time": "18:00" // 15hr later but after 5pm but should remain 15hr instead of 30 hr so pass
      }
      render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
      const decision = screen.getByText('Accept')
      expect(decision).toBeInTheDocument()
    })

    it('should accept refund if time diff less than 16 hours when requested on saturday', () => {
      const refund: RefundType = {
        "name": "Test User",
        "customer_location_timezone": timeZone,
        "sign_up_date": signUpDate,
        "request_source": source,
        "investment_date": "01/09/2021",
        "investment_time": "00:00", // Sat Jan 9th 2021
        "refund_request_date": "01/09/2021", // Sat Jan 9th 2021
        "refund_request_time": "15:00" // 15 hr later on a saturday so should remain 15hr and pass
      }
      render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
      const decision = screen.getByText('Accept')
      expect(decision).toBeInTheDocument()
    })

    it('should accept refund if time diff less than 16 hours when requested on sunday', () => {
      const refund: RefundType = {
        "name": "Test User",
        "customer_location_timezone": timeZone,
        "sign_up_date": signUpDate,
        "request_source": source,
        "investment_date": "01/10/2021",
        "investment_time": "00:00",
        "refund_request_date": "01/10/2021", // Sun Jan 10th 2021
        "refund_request_time": "15:00" // 15 hr later on a sunday so should remain 15hr and pass
      }
      render(<table><tbody><RefundRow refund={refund} /></tbody></table>)
      const decision = screen.getByText('Accept')
      expect(decision).toBeInTheDocument()
    })
  })
}

