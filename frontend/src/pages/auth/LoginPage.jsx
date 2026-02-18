import React from 'react'
import { AuthForm } from '@/components/AuthForm'

const LoginPage = () => {
  return (
    <div className='flex justify-center items-center min-h-screen'>
        <AuthForm type='login'/>
    </div>
  )
}

export default LoginPage