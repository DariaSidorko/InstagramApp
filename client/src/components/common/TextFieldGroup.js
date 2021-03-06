import '../../css/register-login.css';

import React from 'react';
import classnames from 'classnames';
import propTypes from 'prop-types';

const TextFieldGroup = ({
  name,
  placeholder,
  value,
  lable,
  errors,
  info,
  type,
  onChange,
  disabled
}) => {
  return (
    <div>
      <input type={type} 
      className={classnames('register-login-input', {'is-invalid': errors})} 
      placeholder={placeholder} 
      name={name} value={value}  
      onChange={onChange}  
      autoComplete="off"
      />
      {info && <smal className="form-text text-muted">{info}</smal>}
      {errors && (
        <div className="invalid-feedback"> {errors}</div>
      )}
    </div>
  
  )
}

TextFieldGroup.propTypes = {
  name: propTypes.string.isRequired,
  placeholder: propTypes.string,
  value: propTypes.string.isRequired,
  info: propTypes.string,
  errors: propTypes.string,
  type: propTypes.string.isRequired,
  onChange: propTypes.func.isRequired,
  disabled: propTypes.string
}

TextFieldGroup.defaultProps = {
  type: 'text'
}

export default TextFieldGroup;