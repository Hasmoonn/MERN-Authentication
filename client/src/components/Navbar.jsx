import React from 'react'
import {assets} from '../assets/assets.js'
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { toast } from 'react-toastify';
import axios from "axios";

const Navbar = () => {

  const navigate = useNavigate();

  const { userData, backendUrl, setUserData, setIsLoggedin } = useContext(AppContext)

  const logout = async () => {

    try {
      
      axios.defaults.withCredentials = true

      const { data } = await axios.post(backendUrl + '/api/auth/logout')

      data.success && setIsLoggedin(false)
      data.success && setUserData(false)

      navigate('/');

    } catch (error) {
        toast.error(error.message)
    }
  }


  const sendVerificationOtp = async () => {

    try {

      axios.defaults.withCredentials = true

      const { data } = await axios.post(backendUrl + '/api/auth/send-verify-otp')

      if (data.success) {
        navigate('/email-verify')
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
        toast.error(error.message)
    }
  }


  return (
    <div className='w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0'>
      <img src={assets.logo} alt="logo" className='w-28 sm:w-32 cursor-pointer' onClick={() => navigate('/')}/>

      {
        userData ?
        <div className='w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group cursor-pointer'>
          {userData.name[0].toUpperCase()}
          <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10'>
            <ul className='list-none m-0 p-2 rounded-xl bg-gray-200 text-sm'>
              {
                !userData.isAccountVerified && <li className='py-1 px-2 hover:bg-gray-100 cursor-pointer rounded' onClick={sendVerificationOtp}>Verify Email</li>
              }
           
              <li onClick={logout} className='py-1 px-2 hover:bg-gray-100 cursor-pointer pr-10 rounded'>Logout</li>
            </ul>
          </div>

        </div>

        : <button className='flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all' onClick={() => navigate('/login')}>
          Log in 
          <img src={assets.arrow_icon} alt="arrow-icon" />
        </button>
      }
      
    </div>
  )
}

export default Navbar