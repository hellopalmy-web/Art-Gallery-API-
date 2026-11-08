function createArtworkStorageModeMiddleware({ isServerless, isReady }) {
  return (req, res, next) => {
    if (isServerless && ["PUT", "DELETE"].includes(req.method)) {
      return res.status(503).json({
        success: false,
        message:
          "Artwork changes are disabled on Vercel because no durable shared storage is configured.",
      });
    }
    if (!isReady()) {
      return res.status(503).json({
        success: false,
        loading: true,
        message: "Artwork collection is syncing",
      });
    }
    next();
  };
}

module.exports = createArtworkStorageModeMiddleware;
