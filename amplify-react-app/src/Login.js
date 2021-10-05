import React, { useState } from 'react';
import API, { graphqlOperation } from '@aws-amplify/api';
import { userLoginByUsernamePassword } from "./graphql/queries"


const Login = (props) => {

  const [email, setEmail] = useState()
  const [password, setPassword] = useState()
  const { handleSubmitLogin } = props;
  const handleEmail = (e) => {
    setEmail(e.target.value);
  }
  const handlePassword = (e) => {
    setPassword(e.target.value);
  }
 

  return (
    <div style={{ padding: 30 }}>
      <h2>Login</h2>
      <form onSubmit={() => handleSubmitLogin(email, password)}>
        <label>

          <input
            type="text"
            name="email"
            placeholder="email"
            onChange={handleEmail}
            required
          // ref={node => (this.inputNode = node)}
          />

        </label>
        <br />
        <label>

          <input
            type="password"
            name="password"
            placeholder="password"
            onChange={handlePassword}
            required
          />

        </label>
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Login;
