import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Validation from "./RegisterValidation";
import { ROUTES } from "../../../constants/routes";
import { dfsApi } from "../../../api/dfsApi";
import toast from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confpassword, setConfPassword] = useState("");
  const [errors, setErrors] = useState({});
  

  const handleSubmit = async (event) => {
    event.preventDefault();
    const values = { email, pass};
    // const validationErrors = Validation(values);
    // setErrors(validationErrors);

    if (true
      // !validationErrors.email &&
      // !validationErrors.pass
    ) {
      try {
        const user = {
          email,
          pass,
        };
        const response = await dfsApi.register(user);
        if (response.status === 200) {
          toast.success("Register Successfully!");
          navigate("/login");
        }
      } catch (error) {
        alert("Register failed!");
        console.error(error);
      }
    }
  };

  return (
    <>
      <div className="flex h-screen">
        {/* Image */}
        <div className="max-md:hidden w-[40%] bg-gray-100 justify-center items-center">
          <img
            src="https://i.pinimg.com/736x/ca/1d/ae/ca1dae96bd0f6c4692d120f71f6b4ddb.jpg"
            alt="Img"
            className="h-full w-full object-cover"
          />
        </div>
        
        {/* Register */}
        <div className="w-full md:w-[60%]">
          <div className="flex flex-col flex-1 min-h-full justify-center items-center px-6 py-4 lg:px-8 -mt-4">
            <Link to={ROUTES.HOME}>
              <img src="/app_logo.png" alt="logo" className="w-[100px] h-[100px] object-contain" />
            </Link>
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
              <h2 className="mt-[28px] text-center text-3xl font-bold leading-9 tracking-tight text-gray-900">
                Create New Account
              </h2>
            </div>

            <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-sm">
              <form onSubmit={handleSubmit}>
                <div className="">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Email Address
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
                      <span className="text-red-500 text-xs">{errors.email}</span>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="pass"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Password
                  </label>
                  <div className="mt-2">
                    <input
                      onChange={(e) => setPass(e.target.value)}
                      id="pass"
                      name="pass"
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

                <div className="mt-4">
                  <label
                    htmlFor="confpassword"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Confirm Password
                  </label>
                  <div className="mt-2">
                    <input
                      onChange={(e) => setConfPassword(e.target.value)}
                      id="confpassword"
                      name="confpassword"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="px-4 block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-600 sm:text-sm sm:leading-6 bg-white"
                    />
                    {errors.confpassword && (
                      <span className="text-red-500 text-xs">
                        {errors.confpassword}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    className="flex w-full justify-center rounded-md bg-black px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                  >
                    Register
                  </button>
                </div>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link
                  to={ROUTES.LOGIN}
                  className="font-semibold leading-6 text-black hover:text-gray-500"
                >
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </>
  );
};

export default Register;
