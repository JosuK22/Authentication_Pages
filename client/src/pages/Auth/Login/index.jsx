import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import { useContext, useState } from 'react'; 
import { AuthContext } from '../../../store/AuthProvider.jsx';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../../../utils/connection.js';
import { Eye, Lock, Mail } from 'lucide-react';
import FormInput from '../../../components/form/FormInput';

import Button from '../../../components/ui/Button';
import Form from '../Form';
import styles from './styles.module.css';

const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
const message = '* This field is required';

const userSchema = yup
  .object({
    email: yup.string().required(message).matches(emailRegex, { message: 'Invalid email format' }),
    password: yup.string().required(message),
  })
  .required();

export default function Login() {
  const authCtx = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [loginError, setLoginError] = useState(false); // Track login error state

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: yupResolver(userSchema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await fetch(
        BACKEND_URL + 'api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.message);
      }

      const resJson = await res.json();
      authCtx.login(resJson.data);
      navigate('/');
    } catch (error) {
      toast.error(error.message);
      if (error.message === 'Invalid credentials') {
        setLoginError(true); // Set the error state to true for invalid credentials
      }
    }
  };

  return (
    <Form title="Login" loginError={loginError}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <FormInput
          error={errors.email}
          label="email"
          register={register}
          placeholder={'Email'}
          mainIcon={<Mail />}
        />
        <FormInput
          error={errors.password}
          label="password"
          register={register}
          type="password"
          placeholder={'Password'}
          mainIcon={<Lock />}
          secondaryIcon={<Eye />}
        />

        <Button>{isSubmitting ? 'Logging in...' : 'Login'}</Button>
      </form>
    </Form>
  );
}
