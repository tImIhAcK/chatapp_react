import { useEffect, useState } from "react";
import AuthService from "../../utils/AuthService";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../storage/auth";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { FiEye, FiEyeOff, FiUser, FiLock } from "react-icons/fi";
import { HiOutlineMail } from "react-icons/hi";

const Register = () => {
  const [strength, setStrength] = useState("");
  const strengthLabels = ["weak", "medium", "strong"];
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  useEffect(() => {
    if (isLoggedIn()) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  //   check streggth
  const getStrength = (password: string) => {
    let strengthIndicator = -1,
      upper = false,
      lower = false,
      numbers = false;

    for (let index = 0; index < password.length; index++) {
      const char = password.charCodeAt(index);
      if (!upper && char >= 65 && char <= 90) {
        upper = true;
        strengthIndicator++;
      }
      if (!numbers && char >= 48 && char <= 57) {
        numbers = true;
        strengthIndicator++;
      }
      if (!lower && char >= 97 && char <= 122) {
        lower = true;
        strengthIndicator++;
      }
    }
    setStrength(strengthLabels[strengthIndicator]);
  };

  // Form validation
  const validationSchema = Yup.object({
    username: Yup.string().required("Reguired"),
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string()
      .min(8, "Your password is too short.")
      .required("Required"),
    re_password: Yup.string()
      .required("Required")
      .oneOf([Yup.ref("password")], "Passwords must match"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      username: "",
      password: "",
      re_password: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values: {
      email: string;
      username: string;
      password: string;
      re_password: string;
    }) => {
      setSubmitted(false);
      setLoading(true);
      const { email, username, password, re_password } = values;

      try {
        const response = await AuthService.register(
          email,
          username,
          password,
          re_password
        );

        if (response.status === 201) {
          toast.success("Your account has been created successfully!");

          navigate("/activate");
        }
      } catch (error) {
        if (error.code === "ERR_BAD_REQUEST") {
          Object.keys(error.response.data).forEach((field) => {
            error.response.data[field].forEach((message: string) => {
              toast.error(message);
            });
          });
          // toast.error(error.response.data);
        } else {
          toast.error("Registration unsuccessfull");
          console.log(error);
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const handlePasswordChange = (event) => {
    formik.handleChange(event);
    getStrength(event.target.value);
  };

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
              <HiOutlineMail className={iconStyle} />
              <input
                id="email"
                name="email"
                type="text"
                className={inputStyle}
                placeholder="email"
                value={formik.values.email}
                onChange={formik.handleChange}
              />
            </div>
            {submitted && formik.errors.email && (
              <div className="text-red-500 text-sm">{formik.errors.email}</div>
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
                onChange={handlePasswordChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
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
            {focused && formik.values.password && (
              <div>
                <div className={`bars ${strength}`}>
                  <div></div>
                </div>
                <div className="strength">
                  {strength && <>{strength} password</>}
                </div>
              </div>
            )}
            {submitted && formik.errors.password && (
              <div className="text-red-500 text-sm">
                {formik.errors.password}
              </div>
            )}
          </div>

          <div className="mb-4">
            <div className="relative">
              <FiLock className={iconStyle} />
              <input
                id="re_password"
                name="re_password"
                className={inputStyle}
                type={showPassword ? "text" : "password"}
                placeholder="********"
                value={formik.values.re_password}
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

            {submitted && formik.errors.re_password && (
              <div className="text-red-500 text-sm">
                {formik.errors.re_password}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded w-full"
          >
            Register
          </button>

          <div className="flex justify-between">
            {/* <Link to="/forgot-password">
              <p className="text-gray-600 text-sm">Forgot Password?</p>
            </Link> */}

            <Link to="/login">
              <p className="text-gray-600 text-sm">Have an account?</p>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
