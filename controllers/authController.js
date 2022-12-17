const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const login = asyncHandler(async (req, res) => {
  const cookies = req.cookies
  console.log(`cookie on login ${JSON.stringify(cookies)}`)
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ message: "All field are required" });
  }

  const foundUser = await User.findOne({ username }).exec();

  if (!foundUser || !foundUser.active) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const match = await bcrypt.compare(password, foundUser.password);

  if (!match) return res.status(401).json({ message: "Unauthorized" });
 

  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: foundUser.username,
        roles: foundUser.roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "5h" }
  );

  const newRefreshToken = jwt.sign(
    {
      username: foundUser.username,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "24h" }
  );

  let newRefreshTokenArray = !cookies?.jwt ? foundUser.refresh : foundUser.refresh.filter(r=> r !== cookies?.jwt)

  if(cookies?.jwt){
    

    res.clearCookie('jwt',{httpOnly:true,sameSite:'none',secure:true})
  }

foundUser.refresh = [...newRefreshTokenArray,newRefreshToken]

  await foundUser.save()

  res.cookie("jwt", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 1000,
  });

  res.json({ accessToken });
});

// !Refresh
const refresh = asyncHandler(async (req, res) => {
 
  const cookies = req.cookies;
  const refreshToken = cookies.jwt;
  

  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });

  res.clearCookie('jwt',{httpOnly:true,sameSite:'none', secure:true})

  const foundUser = await User.findOne({refresh:refreshToken})

  if(!foundUser){
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      asyncHandler(async (err, decoded) => {
      
      if(err) return res.status(403)
      console.log('Attemped refresh token used')
        
      const hackedUser = await User.findOne({username:decoded.username}).exec()

      hackedUser.refresh = []

      const result = await hackedUser.save()

      })
      )
  }

  const newRefreshToken = foundUser.refresh.filter(r=> r !== refreshToken)

  

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      if(err){
        
        foundUser.refresh = [...newRefreshToken]
        await foundUser.save()
        
      }
      if (err) return res.status(403).json({ message: "Forbidden" });
      
      const decodedFoundUser = await User.findOne({ username: decoded.username });
    
      if (!decodedFoundUser) return res.status(401).json({ message: "Unauthorized" });

      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: decodedFoundUser.username,
            roles: decodedFoundUser.roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "5h" }
      );


  const refreshToken = jwt.sign(
    {
      username: decodedFoundUser.username,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "24h" }
  );

  decodedFoundUser.refresh = [...newRefreshToken,refreshToken]

  await decodedFoundUser.save()


  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 1000,
  });

      res.status(200).json({ accessToken });
    })
  );
});



//Logout

 
const logout = asyncHandler(async (req, res) => {
  const cookies = req.cookies;
  const refreshToken = cookies?.jwt

  if (!refreshToken) return res.sendStatus(204);

  const foundUser = await User.findOne({refresh:refreshToken})

  if(!foundUser){
    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });

  }

  foundUser.refresh = foundUser.refresh.filter(r=> r !== refreshToken)
  await foundUser.save();

  res.clearCookie('jwt',{httpOnly:true,sameSite:'none',secure:true})

 
  res.status(204).json({ message: "Logout" });
});

module.exports = {
  login,
  refresh,
  logout,
};
