import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import axios from "axios";
import { toast } from 'react-toastify';

const Login = () => {

  const navigate = useNavigate();

  const [state, setState] = useState('Sign Up');

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')


  const {backendUrl, setIsLoggedin, getUserData} = useContext(AppContext)


  const onSubmitHandler = async (e) => {

    try {
      e.preventDefault();

      axios.defaults.withCredentials = true

      if (state === 'Sign Up') {

        const {data} = await axios.post(backendUrl + '/api/auth/register', {name, email, password})

        if (data.success) {
          setIsLoggedin(true);
          getUserData();
          navigate('/');
        } else{
          toast.error(data.message);
        }

      } else {

          const {data} = await axios.post(backendUrl + '/api/auth/login', {email, password})

          if (data.success) {

            setIsLoggedin(true);
            getUserData();
            navigate('/');

          } else{
            toast.error(data.message);
          }
      }
    } catch (error) {
        toast.error(data.message);
    }
  }


  return (

    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>

      <img src={assets.logo} alt="" className='absolute left-5 sm:left-20 top-5 sm:w-32 cursor-pointer' onClick={() => navigate('/')}/>
      
      <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>
        <h2 className='text-3xl font-semibold text-white text-center mb-3'>
          {state === "Sign Up" ? 'Create Account' : "Log in"}
        </h2>
        <p className='text-center mb-6 text-sm'>
          {state === "Sign Up" ? 'Create your account' : "Log in to your account!"}
        </p>

        <form onSubmit={onSubmitHandler}>
          {
            state === "Sign Up" && (
            <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
              <img src={assets.person_icon} />
              <input className='bg-transparent outline-none' type="text" placeholder='Full Name' onChange={(e) => setName(e.target.value)} value={name} required />
            </div>)
          }

          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.mail_icon} />
            <input className='bg-transparent outline-none' type="email" placeholder='Email Id' onChange={(e) => setEmail(e.target.value)} value={email} required />
          </div>

          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.lock_icon} />
            <input className='bg-transparent outline-none' type="password" placeholder='Password' onChange={(e) => setPassword(e.target.value)} value={password} required />
          </div>

          <p className='mb-4 text-indigo-500 cursor-pointer' onClick={() => navigate('/reset-password')}>Forgot Password?</p>

          <button className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 font-medium text-white'>
            {state}
          </button>
        </form>

        {
          state === "Sign Up" 
          ? (<p className='text-center text-sm mt-4 text-gray-400'>Already have an account?{' '}
            <span className='text-blue-400 cursor-pointer underline' onClick={() => setState('Login')}>Login here</span>
          </p> )
          : (<p className='text-center text-sm mt-4 text-gray-400'>Don't have an account?{' '}
            <span className='text-blue-400 cursor-pointer underline' onClick={() => setState("Sign Up")}>Sign up</span>
          </p>)
        }
      </div>
    </div>
  )
}

export default Login