import { body, param, query } from "express-validator";

export const loginValidator = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").isString().isLength({ min: 4 }).withMessage("Password required")
];

export const userCreateValidator = [
  body("name").isString().isLength({ min: 2 }),
  body("email").isEmail(),
  body("password").isString().isLength({ min: 4 }),
  body("role").isIn(["admin", "user"]),
  body("status").optional().isIn(["active", "inactive"])
];

export const clubValidator = [
  body("club_name").isString().isLength({ min: 2 }),
  body("address").isString().isLength({ min: 2 }),
  body("district_id").isInt({ min: 1 }),
  body("ds_id").isInt({ min: 1 }),
  body("gn_division").isString().isLength({ min: 1 })
];

export const gradeValidator = [
  body("club_id").isInt({ min: 1 }),
  body("year").isInt({ min: 2020, max: 2035 }),
  body("score").isFloat({ min: 0, max: 100 })
];

export const gradeUpdateValidator = [
  param("id").isInt({ min: 1 }),
  body("year").optional().isInt({ min: 2020, max: 2035 }),
  body("score").optional().isFloat({ min: 0, max: 100 })
];

export const paginationValidator = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 10000 })
];
