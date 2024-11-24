import React, { useState } from "react";
import "./login-register.css";
import Validation from "./LoginValidation";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Snackbar } from "@mui/material";
import Alert from "@mui/material/Alert";


function Login() {
  const [modalOpen, setModalOpen] = useState(false);
  const [snackbar, setSnackbar] = React.useState(null);
  const handleCloseSnackbar = () => setSnackbar(null);

  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  
  const handleNavigate = async () => {
    const userData = await nikaApi.getUserMe(email);
    if (userData.data.role === "ADMIN") navigate("/admin/managecustomer");
    else navigate("/");
    window.location.reload();
    localStorage.setItem("currentUser", JSON.stringify(userData.data));
    localStorage.setItem("role", userData.data.role);
  };


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleInput = (event) => {
    setValues((prev) => ({
      ...prev,
      [event.target.name]: [event.target.value],
    }));
  };

  const handleSignIn = (event) => {
    event.preventDefault();
    const values = { email, password };
    setErrors(Validation(values));

    if (errors.password === "" && errors.email === "") {
      try {
        //setLoading(true);
        const user = { email, password };
        nikaApi
          .authenticate(user)
          .then(async (response) => {
            setShowOtpInput(true);
          })
          .catch((error) => {
            setSnackbar({ children: "Wrong username or password", severity: "error" });
            console.log(error);
          });
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    try {
      const otpRequest = { email, otp };
      const response = await nikaApi.verifyOtp(otpRequest);
      localStorage.setItem("accessToken", response.data.access_token);
      localStorage.setItem("refreshToken", response.data.refresh_token)
      //setLoading(true);
      handleNavigate();
    } catch (error) {
      setSnackbar({ children: "Invalid OTP!", severity: "error" });
    }
  };

  return (
    <>
      {/* {loading && <Loading setOpenModal={setLoading} />} */}

      <div className="mt-24 flex min-h-full flex-1 flex-col justify-center px-6 py-8 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    {/* <img
            className="mx-auto h-32 w-auto"
            src="https://res.cloudinary.com/droondbdu/image/upload/v1702194603/wepik-gradient-modern-car-detail-clean-amp-repair-logo-20231210074938LRYR_dyz3ez.png"
            alt="Your Company"
          /> */}
          {/* <h1 className="font-bold text-4xl text-center">Mika</h1> */}
          <h2 className="mt-10 text-center text-3xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        {
          !showOtpInput ? (
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
              <form className="space-y-6" action="#" method="POST">
                <div>
                  <label
                    htmlFor="email"
                    className="block font-medium leading-6 text-gray-900"
                  >
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      onChange={(e) => setEmail(e.target.value)}
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="px-4 block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-600 sm:text-sm sm:leading-6 bg-white"
                    />
                    {errors.email && (
                      <span className="text-danger">{errors.email}</span>
                    )}
                  </div>
                </div>
                    
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block font-medium leading-6 text-gray-900"
                    >
                      Password
                    </label>
                  </div>
                  <div className="mt-2">
                    <input
                      onChange={(e) => setPassword(e.target.value)}
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="px-4 block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-600 sm:text-sm sm:leading-6 bg-white"
                    />
                    {errors.password && (
                      <span className="text-danger">{errors.password}</span>
                    )}
                  </div>
                  <div className="text-sm text-end my-4">
                      <a
                        href="/login/forgotpassword"
                        className="font-semibold text-black hover:text-gray-500"
                      >
                        Forgot password?
                      </a>
                    </div>
                </div>

              </form>
              <div>
                  <button
                    onClick={handleSignIn}
                    className="flex w-full justify-center rounded-md bg-black px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                  >
                    Sign in
                  </button>
                </div>

              <p className="mt-10 text-center text-sm text-gray-500">
                Don't have account?{" "}
                <a
                  href="/register"
                  className="font-semibold leading-6 text-black hover:text-gray-500"
                >
                  Register here
                </a>
              </p>
            </div>
          ) : 
          (
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
              <form className="space-y-6" action="#" method="POST">  
                <div>
                    <label htmlFor="otp" className="block text-sm font-medium leading-6 text-gray-900">
                      OTP
                    </label>
                    <div className="mt-2">
                      <input type="text" className="hidden"/>
                      <input
                        onChange={(e) => setOtp(e.target.value)}
                        id="otp"
                        name="otp"
                        type="text"
                        autoComplete="one-time-code"
                        defaultValue=""
                        required
                        className="px-4 block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-600 sm:text-sm sm:leading-6 bg-white"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Please enter the OTP code sent to your email!</p>
                  </div>                
                
                <div>
                  <button
                    onClick={handleVerifyOtp}
                    type="submit"
                    className="flex w-full justify-center rounded-md bg-black px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                  >
                    Verify OTP
                  </button>
                </div> 
              </form>

              <p className="mt-10 text-center text-sm text-gray-500">
                Or back to{" "} <span onClick={() => setShowOtpInput(false)} className="hover:cursor-pointer font-semibold leading-6 italic text-black hover:text-gray-500">sign in</span>
              </p>
            </div>
          )
        }
      </div>
      {!!snackbar && (
        <Snackbar
          open
          onClose={handleCloseSnackbar}
          autoHideDuration={6000}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert {...snackbar} onClose={handleCloseSnackbar} />
        </Snackbar>
      )}
    </>
  );
}

export default Login;