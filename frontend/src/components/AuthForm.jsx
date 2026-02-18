import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';
import { signUp, signIn, verifyOTP, resendOTP } from '@/apis/authApis';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function AuthForm({ type, className, ...props }) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  const [showOTP, setShowOTP] = useState(false);
  const { login, setLoading, setError, clearError, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (showOTP) {
        const response = await verifyOTP(formData.email, formData.otp);
        if (response.data.success) {
          toast.success('Email verified successfully!');
          login(response.data.token, response.data.user);
          navigate('/dashboard');
        }
      } else if (type === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }
        const response = await signUp(formData.username, formData.name, formData.email, formData.password);
        if (response.data.success) {
          toast.success('Account created! Please check your email for verification.');
          setShowOTP(true);
        }
      } else {
        const response = await signIn(formData.email, formData.password);
        if (response.data.success) {
          toast.success('Welcome back!');
          login(response.data.token, response.data.user);
          navigate('/dashboard');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await resendOTP(formData.email);
      toast.success('New verification code sent to your email');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  if (showOTP) {
    return (
      <div className={cn("flex flex-col gap-6 w-80", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Verify Your Email</CardTitle>
            <CardDescription>
              Enter the verification code sent to {formData.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="otp">Verification Code</FieldLabel>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={formData.otp}
                    onChange={handleInputChange}
                    required
                  />
                </Field>
                <Field>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify Email'}
                  </Button>
                  <FieldDescription className="text-center">
                    Didn't receive code? <button type="button" onClick={handleResendOTP} className="text-blue-600 hover:underline">Resend</button>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="px-6 text-center">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {type === 'signup' ? 'Create your account' : 'Welcome back'}
          </CardTitle>
          <CardDescription>
            {type === 'signup' 
              ? 'Enter your details to create your account'
              : 'Enter your credentials to sign in'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="">
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {type === 'signup' && (
                <>
                  <Field>
                    <FieldLabel htmlFor="name">Full Name</FieldLabel>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="username">Username</FieldLabel>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="johndoe"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                    />
                  </Field>
                </>
              )}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </Field>
              <Field>
                {type === 'signup' ? (
                  <Field className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                      />
                    </Field>
                  </Field>
                ) : (
                  <>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </>
                )}
                {type === 'signup' && (
                  <FieldDescription>
                    Must include upper case, lower case, special characters & digits. Length should be atleast 8.
                  </FieldDescription>
                )}
              </Field>
              <Field>
                <Button type="submit" disabled={loading}>
                  {loading 
                    ? (type === 'signup' ? 'Creating Account...' : 'Signing In...') 
                    : (type === 'signup' ? 'Create Account' : 'Sign In')
                  }
                </Button>
                <FieldDescription className="text-center">
                  {type === 'signup' ? (
                    <>Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link></>
                  ) : (
                    <>Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline">Sign up</Link></>
                  )}
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>{" "}
        and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}