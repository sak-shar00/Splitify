import React from 'react'
import { AuthForm } from '@/components/AuthForm'

const SignupPage = () => {
  return (
    <div className='flex justify-center items-center min-h-screen'>
        <AuthForm type='signup'/>
    </div>
  )
}

export default SignupPage