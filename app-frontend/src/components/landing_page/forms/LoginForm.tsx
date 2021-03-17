import React, { Fragment, useContext } from 'react';
import { authenticate } from '../../../services/AuthenticationService';
import useFormValidation from '../validation/UseFormValidation';
import { StyledButton } from '../../styled/StyledButton';
import { FormInput } from '../../form_components/FormInput';
import { Row } from 'reactstrap';
import AuthRequest from '../types/requests/AuthRequest';
import { LoginResponse } from '../types/login/response/LoginResponse';
import validateAuthentication from '../validation/ValidateAuthentication';
import { AuthContext } from 'context/AuthContext';
import { useHistory } from 'react-router-dom';

export const LoginForm = (): JSX.Element => {
  const request: AuthRequest = { username: '', password: '' };
  const { setTokens } = useContext(AuthContext);
  const { token } = useContext(AuthContext);
  const history = useHistory();

  const loginUser = async (request: AuthRequest): Promise<LoginResponse> => {
    const loginResponse = await authenticate(request);
    setTokens(loginResponse.token);
    history.push('/');
    return loginResponse;
  };

  console.log(token);

  const redirectToRegister = () => {
    const path = `/register`;
    history.push(path);
  };

  const {
    handleSubmit,
    handleChange,
    handleBlur,
    values,
    errors,
    isSubmitting,
  } = useFormValidation(request, validateAuthentication, loginUser);

  return (
    <Fragment>
      {token === '' && (
        <div
          className="container productwrap shadow-lg rounded mb-0"
          style={{
            padding: '20px',
            marginTop: '50px',
            marginBottom: '50px',
            width: '30%',
          }}
        >
          <Row>Login page</Row>
          <form onSubmit={handleSubmit}>
            {errors.username && (
              <p className="error-text alert alert-danger">{errors.username}</p>
            )}
            <FormInput
              label="Username"
              name="username"
              type="text"
              className={`${
                errors.username
              } ${'error-input'} ${'form-control'}`}
              value={values.username}
              onChange={handleChange}
              placeholder="Username"
            />
            <br />
            {errors.password && (
              <p className="error-text alert alert-danger">{errors.password}</p>
            )}
            <FormInput
              type="password"
              onChange={handleChange}
              onBlur={handleBlur}
              name="password"
              className={`${
                errors.password
              }  ${'error-input'} ${'form-control'}`}
              value={values.password}
              placeholder="Password"
            />
            <br />
            <StyledButton type="submit" label="Login" onSubmit={isSubmitting} />
            <StyledButton label="Forgot password" />
            <StyledButton
              label="Register"
              type="button"
              onClick={redirectToRegister}
            />
          </form>
        </div>
      )}
    </Fragment>
  );
};