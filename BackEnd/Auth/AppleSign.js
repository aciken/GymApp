const User = require('../User/User');

const AppleSign = async (req, res) => {
    const { appleId, email, name, onboardingName, baselineTestosterone } = req.body;

    if (!appleId) {
        return res.status(400).json({ message: 'Apple ID is required' });
    }

    try {
        let user = await User.findOne({ appleId });

        if (user) {
            // User exists, log them in
            let updated = false;
            if (email && !user.email) {
                user.email = email;
                updated = true;
            }
            if (name && (!user.name || user.name === 'User')) {
                user.name = name;
                updated = true;
            }
            if (updated) {
                await user.save();
            }
            return res.status(200).json({ message: 'Login successful', user: user, isNewUser: false });
        } else {
            // User does not exist, create a new account
            // Check if email is already in use by another account type
            if (email) {
                const existingUser = await User.findOne({ email });
                if (existingUser) {
                    return res.status(409).json({ message: 'An account with this email already exists.' });
                }
            }
            
            const newUser = await User.create({
                appleId,
                email, // This can be null, and the schema allows it.
                name: onboardingName || name || 'User', // Prioritize onboardingName
                isApple: true,
                dateCreated: new Date(),
                baselineTestosterone: baselineTestosterone || 290,
            });

            return res.status(201).json({ message: 'User created', user: newUser, isNewUser: true });
        }
    } catch (error) {
        console.error('Apple Sign-In Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = AppleSign;
