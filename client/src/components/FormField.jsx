import PropTypes from 'prop-types'
import './FormField.css'

export default function FormField ({ id, label, error, children, description, required }) {
  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={id}>
        {label} {required ? <span className="form-field__required">*</span> : null}
      </label>
      {description ? <p className="form-field__description">{description}</p> : null}
      {children}
      {error ? <p className="form-field__error" role="alert">{error}</p> : null}
    </div>
  )
}

FormField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
  children: PropTypes.node.isRequired,
  description: PropTypes.string,
  required: PropTypes.bool
}

FormField.defaultProps = {
  error: undefined,
  description: undefined,
  required: false
}
