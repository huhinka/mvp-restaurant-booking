import Joi from "joi";
import { AppError } from "../infrastructure/error.js";

const options = {
  abortEarly: false,
};

export const validateRegister = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.empty": "请输入邮箱",
      "string.email": "请输入有效的邮箱",
      "any.required": "请输入邮箱",
    }),
    password: Joi.string().min(8).required().messages({
      "string.empty": "请输入密码",
      "string.min": "密码长度不能小于8位",
      "any.required": "请输入密码",
    }),
    phone: Joi.string()
      .pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/)
      .messages({
        "string.empty": "请输入手机号码",
        "string.pattern.base": "请输入有效的手机号码",
      }),
  });

  return schema.validate(data, options);
};

export const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  return schema.validate(data, options);
};

export const registerValidator = (req, res, next) => {
  const { error } = validateRegister(req.body);
  if (error) {
    next(AppError.fromJoi(error));
    return;
  }
  next();
};
