// validate({ body, query, params }) -> 400 with readable messages, or
// puts the cleaned values on req.validated (Express 5's req.query is read-only).
module.exports = (schemas) => (req, res, next) => {
  const validated = {};
  for (const part of ["body", "query", "params"]) {
    if (!schemas[part]) continue;
    const result = schemas[part].safeParse(req[part] ?? {});
    if (!result.success) {
      const errors = result.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      return res.status(400).json({ success: false, message: errors[0].message, errors });
    }
    validated[part] = result.data;
  }
  req.validated = validated;
  next();
};
