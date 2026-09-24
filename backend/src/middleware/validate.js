/** validate(zodSchema, 'body' | 'query' | 'params') -> replaces the source with parsed data. */
module.exports = (schema, source = 'body') => (req, res, next) => {
  const parsed = schema.safeParse(req[source]);
  if (!parsed.success) return next(parsed.error);
  req[source] = parsed.data;
  next();
};
