import AppError from '../utils/AppError.js';

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    return next(new AppError('Validation failed', 422, errors));
  }

  req.body = result.data;
  next();
};

export default validate;
