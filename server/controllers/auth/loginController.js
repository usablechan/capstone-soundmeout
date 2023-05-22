const User = require("../../model/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const handleLogin = async (req, res, next) => {
  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({
      success: false,
      status: 400,
      source: "loginController/handleLogin",
      type: "request body not enough",
      message:
        "Request body is not enough. Please provide id, name, email and password.",
    });
  }

  try {
    const findUser = await User.findOne({ loginId: id });
    if (!findUser) {
      return res.status(400).json({
        loginSuccess: false,
        message: "해당하는 유저가 없습니다.",
      });
    }
    match = await bcrypt.compare(password, findUser.password);
    if (match) {
      // generate accessToken
      const accessToken = jwt.sign(
        { _id: findUser._id },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "10s",
        }
      );

      //generate refreshToken
      const refreshToken = jwt.sign(
        { _id: findUser.id },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: "14d",
        }
      );
      findUser.refreshToken = refreshToken;
      const result = await findUser.save();

      res.cookie("refreshToken", refreshToken, {
        maxAge: 14 * 24 * 60 * 60 * 1000, // 14일
      });
      // res.cookie("refreshToken", refreshToken, {
      //   httpOnly: true,
      //   sameSite: "None",
      //   maxAge: 14 * 24 * 60 * 60 * 1000, // 14일
      //   secure: true,
      // });
      res.status(201).json({ success: true, accessToken });
    } else {
      return res.status(400).json({
        loginSuccess: false,
        message: "비밀번호가 틀렸습니다.",
      });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      status: 500,
      source: "loginController/handleLogin",
      type: "server error",
      message: `Internal server error`,
    });
  }
};

const handleFindPassword = async (req, res, next) => {};

module.exports = { handleLogin, handleFindPassword };
