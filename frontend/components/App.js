import React, { useState, useEffect } from 'react';
import * as yup from 'yup';
import axios from 'axios';

const e = { // dictionary of validation error messages.
  // username
  usernameRequired: 'username is required',
  usernameMin: 'username must be at least 3 characters',
  usernameMax: 'username cannot exceed 20 characters',
  // favLanguage
  favLanguageRequired: 'favLanguage is required',
  favLanguageOptions: 'favLanguage must be either javascript or rust',
  // favFood
  favFoodRequired: 'favFood is required',
  favFoodOptions: 'favFood must be either broccoli, spaghetti or pizza',
  // agreement
  agreementRequired: 'agreement is required',
  agreementOptions: 'agreement must be accepted',
}

const formSchema = yup.object().shape({
  username: yup
    .string()
    .trim()
    .required(e.usernameRequired)
    .min(3, e.usernameMin)
    .max(20, e.usernameMax),
  favLanguage: yup
    .string()
    .required(e.favLanguageRequired)
    .trim()
    .oneOf(["javascript", "rust"], e.favLanguageOptions),
  favFood: yup
    .string()
    .required(e.favFoodRequired)
    .trim()
    .oneOf(["pizza", "spaghetti", "broccoli"], e.favFoodOptions),
  agreement: yup
    .boolean()
    .required(e.agreementRequired)
    .oneOf([true], e.agreementOptions),
})

const initialValues = () => ({
  username: '',
  favLanguage: '',
  favFood: '',
  agreement: false,
})
const initialFormErrors = () => ({
  username: '',
  favLanguage: '',
  favFood: '',
  agreement: '',
})
const initialDisabled = () => true;

export default function App() {
  const [values, setValues] = useState(initialValues());
  const [formErrors, setFormErrors] = useState(initialFormErrors());
  const [successMsg, setSuccessMsg] = useState();
  const [failureMsg, setFailureMsg] = useState();
  const [isDisabled, setIsDisabled] = useState(initialDisabled());

  useEffect(() => {
    formSchema.isValid(values).then(valid => setIsDisabled(!valid))
  }, [values])

  const validate = (name, value) => {
    yup.reach(formSchema, name)
      .validate(value)
      .then(() => setFormErrors({ ...formErrors, [name]: "" }))
      .catch(err => setFormErrors({ ...formErrors, [name]: err.errors[0] }))
  }

  const onChange = evt => {
    let { type, name, checked, value } = evt.target;
    value = type == 'checkbox' ? checked : value;
    validate(name, value);
    setValues({ ...values, [name]: value });
  }

  const onSubmit = evt => {
    evt.preventDefault();
    setIsDisabled(initialDisabled());
    axios.post("https://webapis.bloomtechdev.com/registration", values)
      .then(res => {
        setValues(initialValues())
        setSuccessMsg(res.data.message);
        setFailureMsg();
      })
      .catch(err => {
        setFailureMsg(err.response.data.message);
        setSuccessMsg()
      })
  }

  return (
    <div>
      <h2>Create an Account</h2>
      <form onSubmit={onSubmit}>
        { successMsg && <h4 className="success">{successMsg}</h4> }
        { failureMsg && <h4 className="error">{failureMsg}</h4> }

        <div className="inputGroup">
          <label htmlFor="username">Username:</label>
          <input value={values.username} onChange={onChange} id="username" name="username" type="text" placeholder="Type Username"/>
          { formErrors.username && <div className="validation">{formErrors.username}</div> }
        </div>

        <div className="inputGroup">
          <fieldset>
            <legend>Favorite Language:</legend>
            <label>
              <input checked={values.favLanguage == 'javascript'} onChange={onChange} type="radio" name="favLanguage" value="javascript"/>
              JavaScript
            </label>
            <label>
              <input checked={values.favLanguage == 'rust'} onChange={onChange} type="radio" name="favLanguage" value="rust"/>
              Rust
            </label>
          </fieldset>
          { formErrors.favLanguage && <div className="validation">{formErrors.favLanguage}</div> }
        </div>

        <div className="inputGroup">
          <label htmlFor="favFood">Favorite Food:</label>
          <select value={values.favFood} onChange={onChange} id="favFood" name="favFood">
            <option value="">-- Select Favorite Food --</option>
            <option value="pizza">Pizza</option>
            <option value="spaghetti">Spaghetti</option>
            <option value="broccoli">Broccoli</option>
          </select>
          { formErrors.favFood && <div className="validation">{formErrors.favFood}</div> }
        </div>

        <div className="inputGroup">
          <label>
            <input checked={values.agreement} onChange={onChange} id="agreement" type="checkbox" name="agreement"/>
            Agree to our terms
          </label>
          { formErrors.agreement && <div className="validation">{formErrors.agreement}</div> }
        </div>

        <div>
          <input type="submit" disabled={isDisabled} />
        </div>
      </form>
    </div>
  )
}
