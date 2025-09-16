async function getUserProfile(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not authenticated/found' });
    }
    return res.status(200).json({ success: true, message: 'User Details', user });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
}

module.exports = getUserProfile;
