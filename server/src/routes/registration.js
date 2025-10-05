import { Router } from 'express'
import { z } from 'zod'
import { pool } from '../utils/database.js'
import { sanitizePayload } from '../utils/sanitize.js'

const router = Router()

const phoneRegex = /^\d{11}$/
const accountRegex = /^\d{10}$/
const nhfRegex = /^\d{11}$/

const registrationSchema = z.object({
  registrationType: z.enum(['existing', 'new']),
  existingNhfNumber: z.string().trim().optional().nullable(),
  employmentStatus: z.enum(['active', 'retired']),
  surname: z.string().trim().min(1).max(60),
  otherNames: z.string().trim().min(1).max(100),
  gender: z.enum(['male', 'female']),
  ippisNumber: z.string().trim().min(3).max(30),
  staffIdNumber: z.string().trim().min(3).max(30),
  postingLocation: z.string().trim().min(1).max(100),
  geopoliticalZone: z.enum(['northcentral', 'northeast', 'northwest', 'southeast', 'southsouth', 'southwest']),
  dateOfBirth: z.string().refine(value => !Number.isNaN(Date.parse(value)), 'Invalid date of birth'),
  mobileNumber: z.string().regex(phoneRegex, 'Mobile number must be 11 digits'),
  emailAddress: z.string().trim().email(),
  bankName: z.string().trim().min(1),
  accountNumber: z.string().regex(accountRegex, 'Account number must be 10 digits'),
  nnnNumber: z.string().regex(phoneRegex, 'NNN number must be 11 digits'),
  nhfNumber: z.string().regex(nhfRegex, 'NHF number must be 11 digits'),
  employmentDate: z.string().refine(value => !Number.isNaN(Date.parse(value)), 'Invalid employment date'),
  monthlySalary: z.number().nonnegative(),
  nextOfKinName: z.string().trim().min(1).max(120),
  nextOfKinAddress: z.string().trim().min(1).max(200),
  nextOfKinPhone: z.string().regex(phoneRegex, 'Next of kin phone must be 11 digits')
}).superRefine((data, ctx) => {
  if (data.registrationType === 'existing' && (!data.existingNhfNumber || data.existingNhfNumber.trim().length === 0)) {
    ctx.addIssue({
      path: ['existingNhfNumber'],
      code: z.ZodIssueCode.custom,
      message: 'Existing NHF number is required for existing registrations'
    })
  }
})

router.post('/', async (req, res, next) => {
  try {
    const parsed = registrationSchema.parse({
      ...req.body,
      monthlySalary: Number(req.body.monthlySalary)
    })

    const payload = sanitizePayload(parsed)
    const connection = await pool.getConnection()

    try {
      const insertQuery = `
        INSERT INTO registrations (
          registration_type,
          existing_nhf_number,
          employment_status,
          surname,
          other_names,
          gender,
          ippis_number,
          staff_id_number,
          posting_location,
          geopolitical_zone,
          date_of_birth,
          mobile_number,
          email_address,
          bank_name,
          account_number,
          nnn_number,
          nhf_number,
          employment_date,
          monthly_salary,
          next_of_kin_name,
          next_of_kin_address,
          next_of_kin_phone
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `

      const values = [
        payload.registrationType,
        payload.existingNhfNumber?.length ? payload.existingNhfNumber : null,
        payload.employmentStatus,
        payload.surname,
        payload.otherNames,
        payload.gender,
        payload.ippisNumber,
        payload.staffIdNumber,
        payload.postingLocation,
        payload.geopoliticalZone,
        payload.dateOfBirth,
        payload.mobileNumber,
        payload.emailAddress,
        payload.bankName,
        payload.accountNumber,
        payload.nnnNumber,
        payload.nhfNumber,
        payload.employmentDate,
        payload.monthlySalary,
        payload.nextOfKinName,
        payload.nextOfKinAddress,
        payload.nextOfKinPhone
      ]

      await connection.execute(insertQuery, values)
    } finally {
      connection.release()
    }

    return res.status(201).json({ message: 'Registration details saved successfully.' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ message: error.issues[0].message })
    }

    if (error?.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ message: 'Registration table is missing. Please run the database migrations.' })
    }

    return next(error)
  }
})

export default router
