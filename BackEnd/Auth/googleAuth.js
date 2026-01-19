const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../User/User'); // Assuming User model is in User/User.js

const client = new OAuth2Client('451475688741-ilikls36p28187o7vl665e9vocmha5nd.apps.googleusercontent.com');

const googleAuth = async (req, res) => {
  const { token, onboardingName, baselineTestosterone } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: '451475688741-ilikls36p28187o7vl665e9vocmha5nd.apps.googleusercontent.com',
    });
    const { name, email, picture } = ticket.getPayload();

    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = new User({
        name: onboardingName || name, // Prioritize onboardingName
        email,
        profilePicture: picture,
        googleId: ticket.getUserId(),
        dateCreated: new Date(),
        baselineTestosterone: baselineTestosterone || 290,
      });
      await user.save();
    }

    // Generate a JWT for the user session
    const sessionToken = jwt.sign({ userId: user._id }, "a_very_long_and_super_secret_string_for_testing_only", { expiresIn: '7d' });

    res.status(200).json({
      message: 'Authentication successful',
      user: user, // Send the full user object
      token: sessionToken,
      isNewUser: isNewUser,
    });
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(401).json({ message: 'Google authentication failed' });
  }
};

module.exports = googleAuth;
