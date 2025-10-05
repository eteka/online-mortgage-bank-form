import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import FormField from './components/FormField.jsx'
import './styles/App.css'

const phoneRegex = /^\d{11}$/
const accountRegex = /^\d{10}$/
const nhfRegex = /^\d{11}$/

const registrationSchema = z.object({
  registrationType: z.enum(['existing', 'new'], { required_error: 'Please select a registration type' }),
  existingNhfNumber: z.string().trim().optional(),
  employmentStatus: z.enum(['active', 'retired'], { errorMap: () => ({ message: 'Select employment status' }) }),
  surname: z.string().trim().min(1, 'Surname is required').max(60, 'Surname is too long'),
  otherNames: z.string().trim().min(1, 'Other names are required').max(100, 'Other names are too long'),
  gender: z.enum(['male', 'female'], { errorMap: () => ({ message: 'Select a gender' }) }),
  ippisNumber: z.string().trim().min(3, 'IPPIS number is required').max(30, 'IPPIS number is too long'),
  staffIdNumber: z.string().trim().min(3, 'Staff ID is required').max(30, 'Staff ID is too long'),
  postingLocation: z.string().trim().min(1, 'Current posting location is required').max(100, 'Location is too long'),
  geopoliticalZone: z.enum(['northcentral', 'northeast', 'northwest', 'southeast', 'southsouth', 'southwest'], { errorMap: () => ({ message: 'Select a geopolitical zone' }) }),
  dateOfBirth: z.string().refine(value => !Number.isNaN(Date.parse(value)), 'Provide a valid date of birth'),
  mobileNumber: z.string().regex(phoneRegex, 'Mobile number must be 11 digits'),
  emailAddress: z.string().trim().email('Provide a valid email address'),
  bankName: z.string().trim().min(1, 'Select your bank'),
  accountNumber: z.string().regex(accountRegex, 'Account number must be 10 digits'),
  nnnNumber: z.string().regex(phoneRegex, 'NNN number must be 11 digits'),
  nhfNumber: z.string().regex(nhfRegex, 'NHF number must be 11 digits'),
  employmentDate: z.string().refine(value => !Number.isNaN(Date.parse(value)), 'Provide a valid employment date'),
  monthlySalary: z.coerce.number({ invalid_type_error: 'Monthly salary is required' }).min(0, 'Salary cannot be negative'),
  nextOfKinName: z.string().trim().min(1, 'Next of kin name is required').max(120, 'Name is too long'),
  nextOfKinAddress: z.string().trim().min(1, 'Next of kin address is required').max(200, 'Address is too long'),
  nextOfKinPhone: z.string().regex(phoneRegex, 'Next of kin phone number must be 11 digits')
}).superRefine((data, ctx) => {
  if (data.registrationType === 'existing' && (!data.existingNhfNumber || data.existingNhfNumber.trim().length === 0)) {
    ctx.addIssue({
      path: ['existingNhfNumber'],
      code: z.ZodIssueCode.custom,
      message: 'Existing NHF number is required for existing registrations'
    })
  }
})

export default function App () {
  const [csrfToken, setCsrfToken] = useState('')
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      registrationType: 'existing',
      employmentStatus: 'active',
      gender: 'male',
      geopoliticalZone: 'northcentral'
    }
  })

  const registrationType = watch('registrationType')

  useEffect(() => {
    const controller = new AbortController()

    axios.get('/api/csrf-token', {
      signal: controller.signal,
      withCredentials: true
    })
      .then(response => {
        setCsrfToken(response.data.csrfToken)
      })
      .catch(error => {
        if (axios.isCancel(error)) return
        setStatus({ type: 'error', message: 'Unable to initialise secure session. Please refresh.' })
      })

    return () => controller.abort()
  }, [])

  const submitHandler = handleSubmit(async (formValues) => {
    setLoading(true)
    setStatus(null)
    try {
      const payload = {
        ...formValues,
        monthlySalary: Number(formValues.monthlySalary)
      }
      await axios.post('/api/registration', payload, {
        headers: {
          'X-CSRF-Token': csrfToken
        },
        withCredentials: true
      })
      setStatus({ type: 'success', message: 'Details submitted securely. You will receive confirmation shortly.' })
      reset({
        registrationType: formValues.registrationType,
        employmentStatus: 'active',
        gender: 'male',
        geopoliticalZone: 'northcentral'
      })
    } catch (error) {
      if (error.response?.data?.message) {
        setStatus({ type: 'error', message: error.response.data.message })
      } else {
        setStatus({ type: 'error', message: 'Submission failed. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  })

  const employmentOptions = useMemo(() => ([
    { value: 'active', label: 'Active Staff' },
    { value: 'retired', label: 'Retired Staff' }
  ]), [])

  const bankOptions = useMemo(() => ([
    'Access Bank',
    'Citibank',
    'Ecobank',
    'Fidelity Bank',
    'First Bank of Nigeria',
    'First City Monument Bank',
    'Guarantee Trust Bank',
    'Heritage Bank',
    'Keystone Bank',
    'Polaris Bank',
    'Stanbic IBTC',
    'Standard Chartered Bank',
    'Sterling Bank',
    'Union Bank',
    'United Bank for Africa',
    'Unity Bank',
    'Wema Bank',
    'Zenith Bank'
  ]), [])

  return (
    <div className="page">
      <header className="page__header">
        <img src="/fmbn-logo.svg" alt="Federal Mortgage Bank of Nigeria logo" className="page__logo" />
        <div>
          <h1>NHF Contribution Update</h1>
          <p>Securely update your records to receive monthly SMS alerts of your NHF contributions and balances.</p>
        </div>
      </header>

      <main>
        <section className="card">
          <div className="card__header">
            <div>
              <h2>Existing NHF Number</h2>
              <p className="card__helper">Provide your NHF number if already registered.</p>
            </div>
            <div>
              <h2>New Registration</h2>
              <p className="card__helper">Select this option if you are registering for the first time.</p>
            </div>
          </div>

          <form className="form" onSubmit={submitHandler} noValidate>
            <div className="form__row">
              <FormField id="registrationType" label="Registration Status" required error={errors.registrationType?.message}>
                <select id="registrationType" {...register('registrationType')}>
                  <option value="existing">Existing Contributor</option>
                  <option value="new">New Registration</option>
                </select>
              </FormField>

              <FormField
                id="existingNhfNumber"
                label="Existing NHF Number"
                description="Provide if you have an existing registration"
                error={errors.existingNhfNumber?.message}
                required={registrationType === 'existing'}
              >
                <input
                  id="existingNhfNumber"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  {...register('existingNhfNumber')}
                />
              </FormField>
            </div>

            <div className="form__row">
              <FormField id="employmentStatus" label="Current Employment Status" required error={errors.employmentStatus?.message}>
                <select id="employmentStatus" {...register('employmentStatus')}>
                  {employmentOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </FormField>

              <FormField id="gender" label="Gender" required error={errors.gender?.message}>
                <select id="gender" {...register('gender')}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </FormField>
            </div>

            <div className="form__row">
              <FormField id="surname" label="Surname" required error={errors.surname?.message}>
                <input id="surname" type="text" autoComplete="family-name" {...register('surname')} />
              </FormField>

              <FormField id="otherNames" label="Other Names" required error={errors.otherNames?.message}>
                <input id="otherNames" type="text" autoComplete="given-name" {...register('otherNames')} />
              </FormField>
            </div>

            <div className="form__row">
              <FormField id="ippisNumber" label="IPPIS Number" required error={errors.ippisNumber?.message}>
                <input id="ippisNumber" type="text" autoComplete="off" {...register('ippisNumber')} />
              </FormField>

              <FormField id="staffIdNumber" label="Staff ID Number" required error={errors.staffIdNumber?.message}>
                <input id="staffIdNumber" type="text" autoComplete="off" {...register('staffIdNumber')} />
              </FormField>
            </div>

            <div className="form__row">
              <FormField id="postingLocation" label="Current Posting State or Location" required error={errors.postingLocation?.message}>
                <input id="postingLocation" type="text" autoComplete="off" {...register('postingLocation')} />
              </FormField>

              <FormField id="geopoliticalZone" label="Geopolitical Zone" required error={errors.geopoliticalZone?.message}>
                <select id="geopoliticalZone" {...register('geopoliticalZone')}>
                  <option value="northcentral">North Central</option>
                  <option value="northeast">North East</option>
                  <option value="northwest">North West</option>
                  <option value="southeast">South East</option>
                  <option value="southsouth">South South</option>
                  <option value="southwest">South West</option>
                </select>
              </FormField>
            </div>

            <div className="form__row">
              <FormField id="dateOfBirth" label="Date of Birth" required error={errors.dateOfBirth?.message}>
                <input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
              </FormField>

              <FormField id="employmentDate" label="Date of Employment" required error={errors.employmentDate?.message}>
                <input id="employmentDate" type="date" {...register('employmentDate')} />
              </FormField>
            </div>

            <div className="form__row">
              <FormField id="mobileNumber" label="Mobile Number" required description="Must be 11 digits" error={errors.mobileNumber?.message}>
                <input id="mobileNumber" type="tel" inputMode="numeric" autoComplete="tel" {...register('mobileNumber')} />
              </FormField>

              <FormField id="emailAddress" label="Email Address" required error={errors.emailAddress?.message}>
                <input id="emailAddress" type="email" autoComplete="email" {...register('emailAddress')} />
              </FormField>
            </div>

            <div className="form__row">
              <FormField id="bankName" label="Name of Bank" required description="All commercial banks" error={errors.bankName?.message}>
                <select id="bankName" {...register('bankName')}>
                  <option value="">Select your bank</option>
                  {bankOptions.map(bank => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </FormField>

              <FormField id="accountNumber" label="Account Number" required description="Must be 10 digits" error={errors.accountNumber?.message}>
                <input id="accountNumber" type="text" inputMode="numeric" autoComplete="off" {...register('accountNumber')} />
              </FormField>
            </div>

            <div className="form__row">
              <FormField id="nnnNumber" label="NNN Number" required description="Must be 11 digits" error={errors.nnnNumber?.message}>
                <input id="nnnNumber" type="text" inputMode="numeric" autoComplete="off" {...register('nnnNumber')} />
              </FormField>

              <FormField id="nhfNumber" label="NHF Number" required description="Must be 11 digits" error={errors.nhfNumber?.message}>
                <input id="nhfNumber" type="text" inputMode="numeric" autoComplete="off" {...register('nhfNumber')} />
              </FormField>
            </div>

            <div className="form__row">
              <FormField id="monthlySalary" label="Monthly Salary (₦)" required error={errors.monthlySalary?.message}>
                <input id="monthlySalary" type="number" step="0.01" min="0" inputMode="decimal" {...register('monthlySalary')} />
              </FormField>

              <FormField id="nextOfKinName" label="Next of Kin - Name" required error={errors.nextOfKinName?.message}>
                <input id="nextOfKinName" type="text" autoComplete="off" {...register('nextOfKinName')} />
              </FormField>
            </div>

            <div className="form__row">
              <FormField id="nextOfKinAddress" label="Next of Kin - Address" required error={errors.nextOfKinAddress?.message}>
                <textarea id="nextOfKinAddress" rows="3" {...register('nextOfKinAddress')} />
              </FormField>

              <FormField id="nextOfKinPhone" label="Next of Kin - Mobile Number" required description="Must be 11 digits" error={errors.nextOfKinPhone?.message}>
                <input id="nextOfKinPhone" type="tel" inputMode="numeric" autoComplete="tel" {...register('nextOfKinPhone')} />
              </FormField>
            </div>

            {status ? (
              <div className={`form__status form__status--${status.type}`} role="status">
                {status.message}
              </div>
            ) : null}

            <div className="form__actions">
              <button type="submit" className="submit-button" disabled={loading || !csrfToken}>
                {loading ? 'Submitting…' : 'Submit Securely'}
              </button>
            </div>
          </form>
        </section>
      </main>

      <footer className="page__footer">
        <p>Data is encrypted in transit and stored securely according to Federal Mortgage Bank of Nigeria guidelines.</p>
      </footer>
    </div>
  )
}
