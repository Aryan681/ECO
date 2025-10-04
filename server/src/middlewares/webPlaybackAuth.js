module.exports = async (req, res, next) => {
  try {
    const { scope } = req.query;
    if (!scope) {
      return res.status(400).json({ 
        error: "Scope parameter is required for Web Playback" 
      });
    }

    const account = await prisma.spotifyAccount.findUnique({
      where: { userId: req.user.id },
      select: { scope: true }
    });

    if (!account || !account.scope.includes(scope)) {
      return res.status(403).json({ 
        error: "Missing required Spotify scope for Web Playback" 
      });
    }

    next();
  } catch (error) {
    console.error("Web Playback auth error:", error);
    res.status(500).json({ 
      error: "Web Playback authorization failed" 
    });
  }
};