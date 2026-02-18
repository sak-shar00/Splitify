import axios from './axios';

const signUp = async (username, name, email, password) => {
    const res = await axios.post('/auth/sign-up', {username, name, email, password})
    return res;
}

const signIn = async (email, password) => {
    const res = await axios.post('/auth/sign-in', {email, password})
    return res;
}

const verifyOTP = async (email, otp) => {
    const res = await axios.post('/auth/verify-otp', {email, otp})
    return res;
}

const resendOTP = async (email) => {
    const res = await axios.post('/auth/resend-otp', {email})
    return res;
}

const getProfile = async () => {
    const res = await axios.get('/auth/profile')
    return res;
}

const updateSettings = async (allowAutoAdd) => {
    const res = await axios.put('/auth/settings', { allowAutoAdd })
    return res;
}

export { signUp, signIn, verifyOTP, resendOTP, getProfile, updateSettings };