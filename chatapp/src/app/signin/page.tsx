"use client";

import React, { useState } from "react";
import styles from "./signin.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApolloClient, InMemoryCache, useMutation, gql } from "@apollo/client";

const client = new ApolloClient({
  uri: "http://localhost:4000/graphql",
  cache: new InMemoryCache(),
});

// GraphQL mutation for signing in a user
const SIGN_IN_USER = gql`
  mutation SignIn($email: String!, $password: String!) {
    signIn(email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

type FormData = {
  email: string;
  password: string;
};

export default function SignInPage() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const router = useRouter();
  const [signinUser, { data, loading, error }] = useMutation(SIGN_IN_USER, {
    client,
  });
  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await signinUser({ variables: { ...formData } });
  
      if (response.data && response.data.signIn) {
        const { token, user } = response.data.signIn;
        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(user));
        console.log(user)
        window.dispatchEvent(new Event("storage"));
        alert("Login successful!");
        router.push("/chatpage");
      } else {
        console.error("Unexpected response structure:", response);
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };
  

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1 className={styles.logo}>Free Chat</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            name="email"
            placeholder="Email or Phone Number"
            className={styles.input}
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className={styles.input}
            value={formData.password}
            onChange={handleChange}
          />
          <button
            type="submit"
            className={styles.signInButton}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
          {error && (
            <p className={styles.error}>
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
          )}
          <p className={styles.accountstatus}>
            Don't have an account? <Link href="/signup">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
