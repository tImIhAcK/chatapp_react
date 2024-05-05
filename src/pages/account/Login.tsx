import { useEffect, useState } from "react";
import AuthService from "../../utils/AuthService";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../storage/auth";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { FiEye, FiEyeOff, FiUser, FiLock } from "react-icons/fi";

const Login = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, user] = useAuthStore((state) => [
    state.isLoggedIn,
    state.user,
  ]);

  useEffect(() => {
    if (isLoggedIn()) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Form validation
  const validationSchema = Yup.object({
    username: Yup.string().required("Required"),
    password: Yup.string().required("Required"),
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values: { username: string; password: string }) => {
      setLoading(true);
      setSubmitted(false);
      const { username, password } = values;
      try {
        const response = await AuthService.login(username, password);
        if (response.status === 200) {
          AuthService.setAuthUser(response.data.access, response.data.refresh);
          console.log(user());
          toast.success("Login successful!");
          navigate("/");
        }
      } catch (error) {
        if (error.code === "ERR_BAD_REQUEST") {
          toast.error(error.response.data?.detail);
        } else {
          toast.error("Login failed!");
        }
        // console.log(error.response.data.detail);
      } finally {
        setLoading(false);
      }
    },
  });

  const inputStyle =
    "bg-red-500 border border-red-500 text-black sm:text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5 dark:bg-white dark:border-red-600 dark:placeholder-black dark:text-black dark:focus:ring-red-500 dark:focus:border-red-500 pl-12";
  const iconStyle =
    "absolute left-0 top-0 w-10 h-full flex items-center p-2 text-white bg-red-500 dark:border-red-600 rounded-tl-lg rounded-bl-lg";
  return (
    <div className="grid grid-cols-1 gap-4 h-screen place-items-center px-6 py-8 bg-gradient-to-r from-red-500 to-red-600">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-3xl py-4 font-bold text-red-500">Welcome back</h2>
        <div className="action-buttons">
          <button className="sign-in-button google">Google</button>
          <button className="sign-in-button twitter">Twitter</button>
        </div>

        <div className="divider">
          <span className="divider-line"></span>
          <p>OR</p>
          <span className="divider-line"></span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
            formik.handleSubmit();
          }}
          className="space-y-4 md:space-y-6"
          method="post"
        >
          <div className="mb-4">
            <div className="relative">
              <FiUser className={iconStyle} />
              <input
                id="username"
                name="username"
                type="text"
                className={inputStyle}
                placeholder="username"
                value={formik.values.username}
                onChange={formik.handleChange}
              />
            </div>
            {submitted && formik.errors.username && (
              <div className="text-red-500 text-sm">
                {formik.errors.username}
              </div>
            )}
          </div>

          <div className="mb-4">
            <div className="relative">
              <FiLock className={iconStyle} />
              <input
                id="password"
                name="password"
                className={inputStyle}
                type={showPassword ? "text" : "password"}
                placeholder="********"
                value={formik.values.password}
                onChange={formik.handleChange}
              />
              {showPassword ? (
                <FiEye
                  className="absolute right-3 top-3 text-gray-400 hover:cursor-pointer"
                  onClick={togglePassword}
                />
              ) : (
                <FiEyeOff
                  className="absolute right-3 top-3 text-gray-400 hover:cursor-pointer"
                  onClick={togglePassword}
                />
              )}
            </div>

            {submitted && formik.errors.password && (
              <div className="text-red-500 text-sm">
                {formik.errors.password}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded w-full"
          >
            Login
          </button>

          <div className="flex justify-between">
            <Link to="/forgot-password">
              <p className="text-gray-600 text-sm">Forgot Password?</p>
            </Link>

            <Link to="/register">
              <p className="text-gray-600 text-sm">Not Registered?</p>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
