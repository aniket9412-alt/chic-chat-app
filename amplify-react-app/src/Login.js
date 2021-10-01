import React, { useState } from 'react';
// import { useQuery } from '@apollo/react-hooks';
// import gql from "graphql-tag";
import API, { graphqlOperation } from '@aws-amplify/api';
import { userLoginByUsernamePassword } from "./graphql/queries"
// const GQL_DATA = gql`
// query mul {
//   rates(currency: "AUD") {
//     currency
//     rate
//   }
// }
// `;

const Login = (props) => {
  // const { data, loading, error } = useQuery(GQL_DATA);
  // console.log(data)
  const [email, setEmail] = useState()
  const [password, setPassword] = useState()
  const { handleLogin, handleSubmitLogin } = props;
  const handleEmail = (e) => {
    setEmail(e.target.value);
  }
  const handlePassword = (e) => {
    setPassword(e.target.value);
  }
  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   console.log(email);
  //   console.log(password);

  //   const pass = {
  //     eq: password
  //   }
  //    API
  //     .graphql(graphqlOperation(userLoginByUsernamePassword, {
  //       userName: email,
  //       password: pass
  //     }))
  //     .then((response) => {
  //       const items = response?.data?.userLoginByUsernamePassword?.items[0];
  //       console.log(items)
      
  //     })
  //   handleLogin();
  // }

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
