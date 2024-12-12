import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Snackbar } from "@mui/material";
import Alert from "@mui/material/Alert";
import toast from "react-hot-toast";
import { ROUTES } from "../../../constants/routes";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState(null);
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleCloseSnackbar = () => setSnackbar(null);

  const handleInput = (event) => {
    setValues((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  useEffect(() => {
    const token = localStorage.getItem('asa:access_token');
    if (token) {
      toast.success("You are already logged in!");
      navigate(ROUTES.HOME);
    }
  }, [navigate]);

  const handleSignIn = async (event) => {
    event.preventDefault();
    const { email, password } = values;

    // Dummy validation function (you can replace it with your actual validation)
    const validationErrors = {}; // Replace with your validation logic
    setErrors(validationErrors);

    if (!validationErrors.email && !validationErrors.password) {
      // Call the login API here and handle success/failure
      // On success, store the tokens and redirect
      localStorage.setItem(STORAGE.ACCESS_TOKEN, "your_access_token");
      localStorage.setItem(STORAGE.REFRESH_TOKEN, "your_refresh_token");
      localStorage.setItem('asa:email', email);

      // Redirect to home page or reload
      setTimeout(() => {
        window.location.reload();
      }, 0);
    } else {
      setSnackbar({
        children: "Wrong username or password",
        severity: "error",
      });
    }
  };

  return (
    <>
      {loading && <div>Loading...</div>}
      <div className="flex h-screen">
        {/* Image */}
        <div className="max-md:hidden w-[40%] bg-gray-100 items-center justify-center">
          <img
            src="https://i.pinimg.com/originals/f4/d6/bf/f4d6bf1f954973b8f41f84d150f4377d.gif"
            alt="Img"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Login */}
        <div className="w-full md:w-[60%]">
          <div className="flex flex-col flex-1 min-h-full justify-center items-center px-6 py-8 lg:px-8 -mt-4">
            <Link to={ROUTES.HOME}>
              <img src="/ASA_LOGO_LIGHT.png" alt="logo" className="w-[100px] h-[100px] object-contain" />
            </Link>
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
              <h2 className="mt-10 text-center text-3xl font-bold leading-9 tracking-tight text-gray-900">
                Sign In To Your Account
              </h2>
            </div>

            <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
              <form className="space-y-6" onSubmit={handleSignIn}>
                <div>
                  <label
                    htmlFor="email"
                    className="block font-medium leading-6 text-gray-900"
                  >
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      onChange={handleInput}
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="px-4 block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-600 sm:text-sm sm:leading-6 bg-white"
                    />
                    {errors.email && (
                      <span className="text-red-500 text-xs">
                        {errors.email}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block font-medium leading-6 text-gray-900"
                  >
                    Password
                  </label>
                  <div className="mt-2">
                    <input
                      onChange={handleInput}
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="px-4 block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-600 sm:text-sm sm:leading-6 bg-white"
                    />
                    {errors.password && (
                      <span className="text-red-500 text-xs">
                        {errors.password}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-sm text-end my-4">
                  <a
                    href="/login/forgotpassword"
                    className="font-semibold text-black hover:text-gray-500"
                  >
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-black px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-500"
                >
                  Sign in
                </button>
              </form>

              <p className="mt-12 text-center text-sm text-gray-500">
                Don't have an account?{" "}
                <Link to={ROUTES.REGISTER}
                  className="font-semibold leading-6 text-black hover:text-gray-500"
                >
                  Register here
                </Link>
              </p>
            </div>
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
        </div>
      </div>
    </>
  );
};

export default Login;
