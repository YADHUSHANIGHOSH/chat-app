
"use client"
import React, { useState } from "react";
import styles from "./signup.module.css";
import Link from "next/link";
import { ApolloClient, InMemoryCache, gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";

const client = new ApolloClient({
  uri: "http://localhost:4000/graphql",
  cache: new InMemoryCache(),
});

const SIGN_UP_USER = gql`
  mutation SignUp(
    $name: String!
    $email: String!
    $password: String!
    $profilepic: String!
  ) {
    signUp(
      name: $name
      email: $email
      password: $password
      profilepic: $profilepic
    ) {
      token
      user {
        id
        name
        email
        profilepic
      }
    }
  }
`;
type FormData = {
  name: string;
  email: string;
  password: string;
  profilepic: string;
};
type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
  profilepic?: string;
};

export default function SignUpPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    profilepic: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [signupUser] = useMutation(SIGN_UP_USER, { client });
  const router = useRouter();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const validate = () => {
    let tempErrors: FormErrors = {};
    if (!formData.name) tempErrors.name = "Name is required";
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) tempErrors.email = "Valid email is required";
    if (!formData.password || formData.password.length < 6) tempErrors.password = "Password must be at least 6 characters";
    if (!formData.profilepic) tempErrors.profilepic = "profilepic is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };
  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    const isValid = validate();
    if (!isValid) {
      return;
    }
    try {
      const { data } = await signupUser({
        variables: {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          profilepic:formData.profilepic
        },
      });
      console.log('User registered:', data.signUp);
      alert("Registration successful!");
      router.push('/login');
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };
  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.logoContainer}>
        </div>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className={styles.input}
          required
        />
        {errors.name && <span className={styles.errorText}>{errors.name}</span>}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className={styles.input}
          required
        />
        {errors.email && <span className={styles.errorText}>{errors.email}</span>}
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className={styles.input}
          required
        />
        {errors.password && <span className={styles.errorText}>{errors.password}</span>}
        <input
          type="profilepic"
          name="profilepic"
          placeholder="profilepic"
          value={formData.profilepic}
          onChange={handleChange}
          className={styles.input}
          required
        />
        {errors.profilepic && <span className={styles.errorText}>{errors.profilepic}</span>}
        <button type="submit" className={styles.button}>Register</button>
        <p className={styles.signInText}>
          Already have an account?{' '}
          <Link href="/chatpage" className={styles.signInLink}>
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}